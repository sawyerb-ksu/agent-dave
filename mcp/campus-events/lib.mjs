// Shared code for the campus-events server and the snapshot script:
// the K-State calendar API, keyword matching, the saved snapshot and the .ics builder.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const API = (process.env.CAMPUS_EVENTS_API || "https://events.k-state.edu/api/2").replace(/\/$/, "");
export const MAX_PAGES = 10;

export function daysBetween(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

export function oneLine(text, max) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

// One Localist event can repeat; each dated instance becomes its own result.
export function toResults(event) {
  return (event.event_instances || []).map((wrap) => {
    const inst = wrap.event_instance || wrap;
    return {
      id: String(inst.id ?? event.id),
      title: event.title || "Untitled event",
      start: inst.start,
      end: inst.end || null,
      all_day: Boolean(inst.all_day),
      location: event.location_name || event.location || "",
      address: event.address || "",
      url: event.localist_url || event.url || "",
      description: oneLine(event.description_text, 600),
    };
  });
}

export async function fetchRange(start, end) {
  const results = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = new URL(API + "/events");
    url.searchParams.set("start", start);
    url.searchParams.set("end", end);
    url.searchParams.set("pp", "100");
    url.searchParams.set("page", String(page));
    let res;
    try {
      res = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(10000) });
    } catch (err) {
      throw new Error(`Couldn't reach the K-State calendar (${err.message}). Check the network and try again.`);
    }
    if (!res.ok) throw new Error(`The K-State calendar answered ${res.status} ${res.statusText}. Try a shorter date range.`);
    const data = await res.json();
    for (const item of data.events || []) results.push(...toResults(item.event || item));
    const p = data.page || {};
    if (!p.total || p.current >= p.total) break;
  }
  return results;
}

// Every word must appear. Words match at the start of a word ("robot" finds "robotics"),
// and short words must match whole ("AI" finds "AI" but not "training").
export function matches(ev, keyword) {
  if (!keyword) return true;
  const hay = `${ev.title} ${ev.description} ${ev.location}`;
  return keyword.split(/\s+/).filter(Boolean).every((word) => {
    const w = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${w}${word.length <= 3 ? "\\b" : ""}`, "i").test(hay);
  });
}

// ---------- iCalendar (RFC 5545) ----------
function icsText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function fold(line) {
  // Lines longer than 75 octets continue on the next line, which starts with a space.
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts = [];
  let chunk = "";
  for (const ch of line) {
    const limit = parts.length ? 74 : 75;
    if (Buffer.byteLength(chunk + ch, "utf8") > limit) {
      parts.push(chunk);
      chunk = ch;
    } else {
      chunk += ch;
    }
  }
  parts.push(chunk);
  return parts.join("\r\n ");
}

function utcStamp(ms) {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function dateOnly(iso) {
  return iso.slice(0, 10).replace(/-/g, "");
}

function nextDay(iso) {
  const d = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10) + 1));
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function veventLines(ev, now) {
  const lines = ["BEGIN:VEVENT", `UID:${ev.id}@events.k-state.edu`, `DTSTAMP:${utcStamp(now)}`];
  if (ev.all_day) {
    // DTEND is the day after the last day. An end at midnight already is that day.
    const first = dateOnly(ev.start);
    let after = nextDay(ev.start);
    if (ev.end) after = ev.end.slice(11, 16) === "00:00" && dateOnly(ev.end) > first ? dateOnly(ev.end) : nextDay(ev.end);
    lines.push(`DTSTART;VALUE=DATE:${first}`, `DTEND;VALUE=DATE:${after}`);
  } else {
    const start = Date.parse(ev.start);
    const end = ev.end ? Date.parse(ev.end) : start + 3600000;
    lines.push(`DTSTART:${utcStamp(start)}`, `DTEND:${utcStamp(end)}`);
  }
  lines.push(`SUMMARY:${icsText(ev.title)}`);
  const where = [ev.location, ev.address].filter(Boolean).join(", ");
  if (where) lines.push(`LOCATION:${icsText(where)}`);
  const about = [ev.description, ev.url].filter(Boolean).join("\n\n");
  if (about) lines.push(`DESCRIPTION:${icsText(about)}`);
  if (ev.url) lines.push(`URL:${ev.url}`);
  lines.push("END:VEVENT");
  return lines;
}

export function buildIcs(events) {
  const now = Date.now();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//agent-dave//campus-events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events.flatMap((ev) => veventLines(ev, now)),
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

// ---------- Saved snapshot (for when the calendar can't be reached) ----------
export const SNAPSHOT_FILE = path.resolve(
  process.env.CAMPUS_EVENTS_SNAPSHOT || path.join(path.dirname(fileURLToPath(import.meta.url)), "data", "snapshot.json")
);

export async function loadSnapshot() {
  try {
    return JSON.parse(await readFile(SNAPSHOT_FILE, "utf8"));
  } catch {
    return null;
  }
}

// Snapshot events that start on a day inside the range.
export function snapshotRange(snap, start, end) {
  return (snap.events || []).filter((ev) => {
    const day = String(ev.start).slice(0, 10);
    return day >= start && day <= end;
  });
}

