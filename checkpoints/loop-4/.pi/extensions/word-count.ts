// A small upgrade module, the kind DAVE writes on slide 34's "finished early" step.
// Adds a word_count tool DAVE can call, and a /words command for you.
// Copy it to .pi/extensions/ and run /reload.
import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { readFile } from "node:fs/promises";

function count(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { words, minutes: Math.max(1, Math.round(words / 230)) };
}

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "word_count",
    label: "Word count",
    description: "Count the words in a text file and estimate reading time. Use before trimming a draft to a word limit.",
    parameters: Type.Object({
      path: Type.String({ description: "Path to the file, relative to the repo, e.g. notes/2026-11-10-budget.md" }),
    }),
    async execute(toolCallId, params) {
      try {
        const { words, minutes } = count(await readFile(params.path, "utf8"));
        return { details: { words }, content: [{ type: "text", text: `${params.path}: ${words} words, about ${minutes} min to read.` }] };
      } catch {
        return { details: {}, content: [{ type: "text", text: `Couldn't read ${params.path}. Check the path and try again.` }] };
      }
    },
  });

  pi.registerCommand("words", {
    description: "Count the words in a file: /words notes/file.md",
    handler: async (args, ctx) => {
      if (!args) return ctx.ui.notify("Give a file path, for example /words notes/today.md", "warning");
      try {
        const { words, minutes } = count(await readFile(args.trim(), "utf8"));
        ctx.ui.notify(`${words} words, about ${minutes} min to read`, "info");
      } catch {
        ctx.ui.notify(`Couldn't read ${args.trim()}`, "error");
      }
    },
  });
}
