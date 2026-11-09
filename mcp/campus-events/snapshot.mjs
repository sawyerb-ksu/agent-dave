#!/usr/bin/env node
// Save the K-State calendar to data/snapshot.json so campus-events still works offline.
// Run it while online, the week of the workshop:  npm run snapshot        (next 31 days)
//                                                 npm run snapshot -- 14  (next 14 days)
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchRange, SNAPSHOT_FILE } from "./lib.mjs";

const days = Math.min(31, Math.max(1, Number(process.argv[2]) || 31));
const iso = (d) => d.toISOString().slice(0, 10);
const today = new Date();
const start = iso(today);
const end = iso(new Date(today.getTime() + days * 86400000));

try {
  const events = await fetchRange(start, end);
  const snap = { saved_at: start, start, end, source: "https://events.k-state.edu/api/2", partial: false, events };
  await mkdir(path.dirname(SNAPSHOT_FILE), { recursive: true });
  await writeFile(SNAPSHOT_FILE, JSON.stringify(snap, null, 1) + "\n", "utf8");
  console.log(`Saved ${events.length} events from ${start} to ${end} in ${SNAPSHOT_FILE}`);
} catch (err) {
  console.error(`Couldn't save a snapshot: ${err.message}`);
  process.exit(1);
}
