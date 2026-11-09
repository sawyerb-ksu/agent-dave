#!/usr/bin/env node
// campus-events: a small MCP server for the K-State events calendar.
//
// Two focused tools:
//   find_events(start_date, end_date, keyword?)  search events.k-state.edu
//   export_ics(event_ids, filename?)              save chosen events as an .ics file
//
// The calendar runs on Localist, which has a public JSON API. No key needed.
// If the calendar can't be reached, find_events falls back to the saved snapshot in
// data/snapshot.json (refresh it with: npm run snapshot). CAMPUS_EVENTS_OFFLINE=1 forces it.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { daysBetween, fetchRange, matches, buildIcs, loadSnapshot, snapshotRange } from "./lib.mjs";

const OUT_DIR = path.resolve(process.env.CAMPUS_EVENTS_OUT || process.cwd());
const OFFLINE = /^(1|true|yes)$/i.test(process.env.CAMPUS_EVENTS_OFFLINE || "");
const MAX_DAYS = 31;
const MAX_RESULTS = 25;

// Events seen by find_events, keyed by id, so export_ics can work from ids alone.
const seen = new Map();

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD, for example 2026-11-20.");

// Live calendar first; the saved snapshot if it can't be reached (or if OFFLINE is set).
async function getEvents(start, end) {
  let problem = "Offline mode is on";
  if (!OFFLINE) {
    try {
      return { events: await fetchRange(start, end), source: "live" };
    } catch (err) {
      problem = err.message;
    }
  }
  const snap = await loadSnapshot();
  if (!snap) throw new Error(`${problem} There's no saved snapshot to fall back on (run npm run snapshot while online).`);
  const why = OFFLINE ? "Offline mode is on" : "The K-State calendar couldn't be reached";
  let note = `${why}, so these come from the snapshot saved ${snap.saved_at}, which covers ${snap.start} to ${snap.end}.`;
  if (snap.partial) note += " The snapshot holds AI- and tech-related events only.";
  if (start < snap.start || end > snap.end) note += ` Dates outside ${snap.start} to ${snap.end} aren't in it.`;
  return { events: snapshotRange(snap, start, end), source: "snapshot", note };
}

// ---------- MCP server ----------
const server = new McpServer({ name: "campus-events", version: "1.0.0" });

server.registerTool(
  "find_events",
  {
    title: "Find K-State events",
    description:
      "Find K-State calendar events between two dates (YYYY-MM-DD, up to 31 days), optionally matching a keyword. " +
      "Returns id, title, times, location and link. Pass ids to export_ics.",
    inputSchema: {
      start_date: isoDate.describe("First day to search, YYYY-MM-DD"),
      end_date: isoDate.describe("Last day to search, YYYY-MM-DD. At most 31 days after start_date."),
      keyword: z.string().max(60).optional().describe("Words to match in the title, description or location, e.g. \"AI\" or \"robotics\""),
    },
  },
  async ({ start_date, end_date, keyword }) => {
    const span = daysBetween(start_date, end_date);
    if (Number.isNaN(span) || span < 0) {
      return { isError: true, content: [{ type: "text", text: "end_date must be the same as or after start_date." }] };
    }
    if (span > MAX_DAYS) {
      return { isError: true, content: [{ type: "text", text: `Ask for at most ${MAX_DAYS} days at a time. Split the search into smaller ranges.` }] };
    }
    let got;
    try {
      got = await getEvents(start_date, end_date);
    } catch (err) {
      return { isError: true, content: [{ type: "text", text: err.message }] };
    }
    const all = got.events
      .filter((ev) => matches(ev, keyword))
      .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
    for (const ev of all) seen.set(ev.id, ev);
    const shown = all.slice(0, MAX_RESULTS).map(({ description, address, ...rest }) => rest);
    const note =
      all.length === 0
        ? `No events found between ${start_date} and ${end_date}${keyword ? ` matching "${keyword}"` : ""}. Try a wider range or a different keyword.`
        : all.length > MAX_RESULTS
          ? `Showing the first ${MAX_RESULTS} of ${all.length} events. Narrow the dates or add a keyword to see the rest.`
          : `Found ${all.length} event${all.length === 1 ? "" : "s"}.`;
    const body = { source: got.source, note: got.note ? `${got.note} ${note}` : note, events: shown };
    return { content: [{ type: "text", text: JSON.stringify(body, null, 2) }] };
  }
);

server.registerTool(
  "export_ics",
  {
    title: "Save events as an .ics file",
    description:
      "Save one or more events found by find_events as an iCalendar (.ics) file that opens in Outlook, Google Calendar or Apple Calendar. " +
      "Call find_events first and pass ids from its results.",
    inputSchema: {
      event_ids: z.array(z.string()).min(1).max(20).describe("Event ids from find_events"),
      filename: z.string().max(80).optional().describe("File name ending in .ics, saved in the current folder. Defaults to events.ics"),
    },
  },
  async ({ event_ids, filename }) => {
    const missing = event_ids.filter((id) => !seen.has(id));
    if (missing.length) {
      return {
        isError: true,
        content: [{ type: "text", text: `Unknown event id(s): ${missing.join(", ")}. Call find_events first, then pass ids from its results.` }],
      };
    }
    let name = path.basename(filename || "events.ics").replace(/[^\w.\- ]+/g, "-");
    if (!name.toLowerCase().endsWith(".ics")) name += ".ics";
    const events = event_ids.map((id) => seen.get(id));
    await mkdir(OUT_DIR, { recursive: true });
    const file = path.join(OUT_DIR, name);
    await writeFile(file, buildIcs(events), "utf8");
    const titles = events.map((ev) => `- ${ev.title} (${ev.start.slice(0, 10)})`).join("\n");
    return { content: [{ type: "text", text: `Saved ${events.length} event${events.length === 1 ? "" : "s"} to ${file}\n${titles}` }] };
  }
);

await server.connect(new StdioServerTransport());
