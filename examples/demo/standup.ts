// Backup for slide 32 ("DAVE upgrades himself"): a finished /standup extension.
// If DAVE's live attempt goes sideways, copy this file to .pi/extensions/ and run /reload.
//
// /standup             recap yesterday's pi sessions
// /standup 2026-11-09  recap a given day
//
// It reads pi's session files (~/.pi/agent/sessions/), pulls out what you asked and which
// tools DAVE used on that day, and hands DAVE a short digest to turn into a recap.
import { type ExtensionAPI, getAgentDir } from "@earendil-works/pi-coding-agent";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const localDay = (d: Date) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
const textOf = (content: unknown): string =>
  typeof content === "string"
    ? content
    : Array.isArray(content)
      ? content.filter((b: any) => b?.type === "text").map((b: any) => b.text).join(" ")
      : "";
const short = (s: string, n: number) => {
  const one = s.replace(/\s+/g, " ").trim();
  return one.length > n ? one.slice(0, n - 1) + "…" : one;
};

async function digestFor(day: string): Promise<string[]> {
  const root = path.join(getAgentDir(), "sessions");
  const parts: string[] = [];
  let folders: string[] = [];
  try {
    folders = await readdir(root);
  } catch {
    return parts;
  }
  for (const folder of folders) {
    let files: string[] = [];
    try {
      files = (await readdir(path.join(root, folder))).filter((f) => f.endsWith(".jsonl"));
    } catch {
      continue;
    }
    for (const file of files) {
      const lines = (await readFile(path.join(root, folder, file), "utf8")).split("\n").filter(Boolean);
      let cwd = "";
      const asks: string[] = [];
      const tools = new Map<string, number>();
      let first = "", last = "";
      for (const line of lines) {
        let e: any;
        try { e = JSON.parse(line); } catch { continue; }
        if (e.type === "session") cwd = e.cwd || "";
        if (e.type !== "message" || !e.timestamp || localDay(new Date(e.timestamp)) !== day) continue;
        const time = new Date(e.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        first ||= time;
        last = time;
        const m = e.message || {};
        if (m.role === "user") {
          const t = textOf(m.content);
          if (t) asks.push(short(t, 200));
        }
        if (m.role === "assistant" && Array.isArray(m.content)) {
          for (const b of m.content) if (b?.type === "toolCall") tools.set(b.name, (tools.get(b.name) || 0) + 1);
        }
      }
      if (!asks.length) continue;
      const used = [...tools].map(([n, c]) => `${n} ×${c}`).join(", ") || "none";
      parts.push(
        `Session in ${path.basename(cwd) || "?"} (${first}–${last})\n` +
          asks.slice(0, 5).map((a) => `- asked: ${a}`).join("\n") +
          (asks.length > 5 ? `\n- …and ${asks.length - 5} more requests` : "") +
          `\n- tools used: ${used}`
      );
    }
  }
  return parts;
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("standup", {
    description: "Recap yesterday's pi sessions (or /standup YYYY-MM-DD)",
    handler: async (args, ctx) => {
      const asked = (args || "").trim();
      if (asked && !/^\d{4}-\d{2}-\d{2}$/.test(asked)) return ctx.ui.notify("Use a date like 2026-11-09, or no date for yesterday.", "warning");
      const day = asked || localDay(new Date(Date.now() - 86400000));
      const parts = await digestFor(day);
      if (!parts.length) return ctx.ui.notify(`No pi sessions found for ${day}.`, "info");
      let digest = parts.join("\n\n");
      if (digest.length > 8000) digest = digest.slice(0, 8000) + "\n…(trimmed)";
      ctx.ui.notify(`Recapping ${parts.length} session${parts.length === 1 ? "" : "s"} from ${day}…`, "info");
      pi.sendUserMessage(
        `Give me a standup recap of my pi sessions from ${day}, using only the digest below.\n` +
          `Three short sections: What we did, What's unfinished, Suggested next step. Under 150 words.\n\n${digest}`,
        ctx.isIdle() ? undefined : { deliverAs: "followUp" }
      );
    },
  });
}
