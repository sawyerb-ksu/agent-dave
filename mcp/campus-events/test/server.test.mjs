// End-to-end test: a fake Localist API, the real server over stdio, the real MCP client.
// Run with: npm test
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const here = path.dirname(fileURLToPath(import.meta.url));

// Shaped like events.k-state.edu/api/2/events: events[].event.event_instances[].event_instance
const page1 = {
  events: [
    { event: { id: 1, title: "AI in the Classroom, Part 2", location_name: "Hale Library", address: "Manhattan, KS",
      localist_url: "https://events.k-state.edu/event/ai-classroom", description_text: "Hands-on session; bring a laptop.",
      event_instances: [{ event_instance: { id: 101, start: "2026-11-10T14:00:00-06:00", end: "2026-11-10T15:30:00-06:00", all_day: false } }] } },
    { event: { id: 2, title: "Candy Cane Cash", location_name: "Downtown McPherson", address: "McPherson, KS",
      localist_url: "https://events.k-state.edu/event/candy-cane-cash", description_text: "Shop local.",
      event_instances: [{ event_instance: { id: 201, start: "2026-11-09T00:00:00-06:00", end: null, all_day: true } }] } },
  ],
  page: { current: 1, size: 2, total: 2 },
};
const page2 = {
  events: [
    { event: { id: 3, title: "Robotics and AI Showcase", location_name: "Engineering Hall", address: "",
      localist_url: "https://events.k-state.edu/event/robotics", description_text: "A very long description ".repeat(10),
      event_instances: [{ event_instance: { id: 301, start: "2026-11-12T09:00:00-06:00", end: null, all_day: false } }] } },
  ],
  page: { current: 2, size: 2, total: 2 },
};

let api, client, outDir, requests = [];

before(async () => {
  api = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    requests.push(url);
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(url.searchParams.get("page") === "2" ? page2 : page1));
  });
  await new Promise((r) => api.listen(0, r));
  outDir = await mkdtemp(path.join(os.tmpdir(), "campus-events-"));
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(here, "..", "server.mjs")],
    env: { ...process.env, CAMPUS_EVENTS_API: `http://localhost:${api.address().port}/api/2`, CAMPUS_EVENTS_OUT: outDir },
  });
  client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(transport);
});

after(async () => {
  await client?.close();
  api?.close();
});

const call = async (name, args) => client.callTool({ name, arguments: args });
const json = (res) => JSON.parse(res.content[0].text);

test("lists exactly two tools", async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ["export_ics", "find_events"]);
});

test("find_events pages through results, sorts by start, and sends the date range", async () => {
  const res = json(await call("find_events", { start_date: "2026-11-09", end_date: "2026-11-20" }));
  assert.equal(res.events.length, 3);
  assert.deepEqual(res.events.map((e) => e.id), ["201", "101", "301"]);
  assert.equal(requests.at(-1).searchParams.get("start"), "2026-11-09");
  assert.equal(requests.at(-1).searchParams.get("end"), "2026-11-20");
});

test("find_events keyword matches title, description or location", async () => {
  const res = json(await call("find_events", { start_date: "2026-11-09", end_date: "2026-11-20", keyword: "ai" }));
  assert.deepEqual(res.events.map((e) => e.title), ["AI in the Classroom, Part 2", "Robotics and AI Showcase"]);
  const robot = json(await call("find_events", { start_date: "2026-11-09", end_date: "2026-11-20", keyword: "robot" }));
  assert.deepEqual(robot.events.map((e) => e.title), ["Robotics and AI Showcase"], "long words match word starts");
  const none = json(await call("find_events", { start_date: "2026-11-09", end_date: "2026-11-20", keyword: "sh" }));
  assert.equal(none.events.length, 0, "short words don't match inside other words (Shop, Showcase)");
});

test("find_events explains bad ranges instead of failing quietly", async () => {
  const back = await call("find_events", { start_date: "2026-11-20", end_date: "2026-11-09" });
  assert.equal(back.isError, true);
  const long = await call("find_events", { start_date: "2026-11-01", end_date: "2026-12-31" });
  assert.match(long.content[0].text, /at most 31 days/);
});

test("export_ics rejects ids it hasn't seen, with a fix", async () => {
  const res = await call("export_ics", { event_ids: ["999"] });
  assert.equal(res.isError, true);
  assert.match(res.content[0].text, /Call find_events first/);
});

test("export_ics writes a valid calendar file", async () => {
  await call("find_events", { start_date: "2026-11-09", end_date: "2026-11-20" });
  const res = await call("export_ics", { event_ids: ["101", "201", "301"], filename: "../team events" });
  assert.match(res.content[0].text, /Saved 3 events/);
  const ics = await readFile(path.join(outDir, "team events.ics"), "utf8");
  const lines = ics.split("\r\n");
  assert.equal(lines[0], "BEGIN:VCALENDAR");
  assert.equal(ics.match(/BEGIN:VEVENT/g).length, 3);
  assert.ok(ics.includes("DTSTART:20261110T200000Z"), "timed events are in UTC");
  assert.ok(ics.includes("DTSTART;VALUE=DATE:20261109") && ics.includes("DTEND;VALUE=DATE:20261110"), "all-day events use dates");
  assert.ok(ics.includes("DTEND:20261112T160000Z"), "missing end defaults to one hour");
  assert.ok(ics.includes("SUMMARY:AI in the Classroom\\, Part 2"), "commas are escaped");
  assert.ok(lines.every((l) => Buffer.byteLength(l, "utf8") <= 75), "long lines are folded");
});
