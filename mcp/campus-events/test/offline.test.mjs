// Offline behavior: the snapshot fallback, offline mode, and the snapshot script.
import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const UNREACHABLE = "http://127.0.0.1:9/api/2"; // nothing listens on port 9

const ev = (id, title, start, extra = {}) => ({
  id, title, start, end: null, all_day: false, location: "Hale Library", address: "", url: `https://events.k-state.edu/event/${id}`, description: "", ...extra,
});
const snapshot = {
  saved_at: "2026-11-07", start: "2026-11-07", end: "2026-12-07", source: "test", partial: true,
  events: [
    ev("s1", "Heartland AI Symposium", "2026-11-10T00:00:00-06:00", { all_day: true }),
    ev("s2", "Tea Time", "2026-11-16T13:00:00-06:00"),
    ev("s3", "AI Career Meet Up", "2026-11-10T17:30:00-06:00"),
  ],
};

async function connect(env) {
  const client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [path.join(root, "server.mjs")], env: { ...process.env, ...env } }));
  return client;
}
const text = (res) => res.content[0].text;

test("falls back to the snapshot when the calendar can't be reached", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "ce-offline-"));
  const file = path.join(dir, "snapshot.json");
  await writeFile(file, JSON.stringify(snapshot));
  const client = await connect({ CAMPUS_EVENTS_API: UNREACHABLE, CAMPUS_EVENTS_SNAPSHOT: file, CAMPUS_EVENTS_OUT: dir });
  try {
    const res = JSON.parse(text(await client.callTool({ name: "find_events", arguments: { start_date: "2026-11-09", end_date: "2026-11-20", keyword: "AI" } })));
    assert.equal(res.source, "snapshot");
    assert.match(res.note, /couldn't be reached/);
    assert.match(res.note, /saved 2026-11-07/);
    assert.match(res.note, /AI- and tech-related events only/);
    assert.deepEqual(res.events.map((e) => e.id), ["s1", "s3"]);
    const saved = await client.callTool({ name: "export_ics", arguments: { event_ids: ["s3"] } });
    assert.match(text(saved), /Saved 1 event/);
    assert.match(await readFile(path.join(dir, "events.ics"), "utf8"), /SUMMARY:AI Career Meet Up/);
  } finally {
    await client.close();
  }
});

test("offline mode skips the network and says so", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "ce-offline-"));
  const file = path.join(dir, "snapshot.json");
  await writeFile(file, JSON.stringify({ ...snapshot, partial: false }));
  let hits = 0;
  const api = http.createServer((req, res) => { hits++; res.end("{}"); });
  await new Promise((r) => api.listen(0, r));
  const client = await connect({ CAMPUS_EVENTS_API: `http://localhost:${api.address().port}/api/2`, CAMPUS_EVENTS_SNAPSHOT: file, CAMPUS_EVENTS_OFFLINE: "1" });
  try {
    const res = JSON.parse(text(await client.callTool({ name: "find_events", arguments: { start_date: "2026-12-01", end_date: "2026-12-20" } })));
    assert.equal(hits, 0, "no request reaches the calendar");
    assert.match(res.note, /^Offline mode is on/);
    assert.match(res.note, /Dates outside 2026-11-07 to 2026-12-07 aren't in it/);
    assert.doesNotMatch(res.note, /tech-related events only/);
  } finally {
    await client.close();
    api.close();
  }
});

test("with no snapshot, the error says how to make one", async () => {
  const client = await connect({ CAMPUS_EVENTS_API: UNREACHABLE, CAMPUS_EVENTS_SNAPSHOT: path.join(os.tmpdir(), "no-such-snapshot.json") });
  try {
    const res = await client.callTool({ name: "find_events", arguments: { start_date: "2026-11-09", end_date: "2026-11-20" } });
    assert.equal(res.isError, true);
    assert.match(text(res), /npm run snapshot/);
  } finally {
    await client.close();
  }
});

test("npm run snapshot saves the calendar", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "ce-snap-"));
  const file = path.join(dir, "snapshot.json");
  const api = http.createServer((req, res) => {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ events: [{ event: { id: 1, title: "Open Lab", location_name: "Hale Library", event_instances: [{ event_instance: { id: 11, start: "2026-11-12T15:00:00-06:00", end: null, all_day: false } }] } }], page: { current: 1, total: 1 } }));
  });
  await new Promise((r) => api.listen(0, r));
  try {
    const { stdout } = await promisify(execFile)(process.execPath, [path.join(root, "snapshot.mjs"), "14"], {
      env: { ...process.env, CAMPUS_EVENTS_API: `http://localhost:${api.address().port}/api/2`, CAMPUS_EVENTS_SNAPSHOT: file },
    });
    assert.match(stdout, /Saved 1 events/);
    const snap = JSON.parse(await readFile(file, "utf8"));
    assert.equal(snap.partial, false);
    assert.equal(snap.events[0].title, "Open Lab");
    assert.equal(snap.events[0].id, "11");
  } finally {
    api.close();
  }
});

test("the bundled snapshot is valid", async () => {
  const snap = JSON.parse(await readFile(path.join(root, "data", "snapshot.json"), "utf8"));
  assert.ok(snap.saved_at && snap.start && snap.end);
  assert.ok(snap.events.length > 0);
  for (const e of snap.events) {
    assert.ok(e.id && e.title && e.start, `event ${e.id} has id, title and start`);
    assert.ok(!Number.isNaN(Date.parse(e.start)), `event ${e.id} has a real start time`);
  }
});
