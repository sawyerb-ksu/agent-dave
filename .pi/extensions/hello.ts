// DAVE's first upgrade module: one tool he can call, one command you can type.
// Edit this file, then run /reload in pi to load your changes.
import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

export default function (pi: ExtensionAPI) {
  // a new tool DAVE can call
  pi.registerTool({
    name: "greet",
    label: "Greet",
    description: "Greet someone by name",
    parameters: Type.Object({
      name: Type.String({ description: "Name to greet" }),
    }),
    async execute(toolCallId, params) {
      return {
        details: {},
        content: [{ type: "text", text: `Hello, ${params.name}!` }],
      };
    },
  });

  // a new slash command for you
  pi.registerCommand("hello", {
    description: "Say hello",
    handler: async (args, ctx) => ctx.ui.notify(`Hello ${args || "from DAVE"}!`, "info"),
  });
}
