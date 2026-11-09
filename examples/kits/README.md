# Example kits

Three ready-made skills, each with fictional sample data and a known right answer, so you can check DAVE's work. Each one shows a different kind of job:

| Kit | The job | What it teaches |
|---|---|---|
| [webpage-briefing](webpage-briefing/README.md) | Turn a web page into a short report with sources | Using only what the page says, and ignoring instructions hidden in a page |
| [spreadsheet-check](spreadsheet-check/README.md) | Find data-entry errors in a CSV without changing it | Exact rules, read-only work, a result you can check (8 issues in 6 rows) |
| [scan-renamer](scan-renamer/README.md) | Give badly named scans clear, consistent names | Show the plan, wait for a yes, keep a record so you can undo it |

## Try one

Each kit is its own project folder, with its skill in `.agents/skills/`. Start pi inside the kit, not at the top of the repo:

```bash
cd examples/kits/spreadsheet-check
pi --model aistudio/qwen3.8:27b-q8_0
```

Then follow the kit's README for the prompt to try and the result to expect. If DAVE doesn't pick up the skill on his own, load it by name with `/skill:<name>`.

**Why the `--model` flag:** pi reads `.pi/` only from the folder you start it in, so DAVE's `.pi/settings.json`, skills, MCP servers and guard don't load inside a kit. `AGENTS.md` still does (pi reads it from parent folders too). The flag picks the studio brain; at home, use the model you set up in [build-your-own.md](../../docs/build-your-own.md), or pick one with `/model`.

To use a kit's skill in DAVE himself, copy its folder from `.agents/skills/` into the repo's `.pi/skills/` in VS Code, and start a new session at the top of the repo.

## Make it yours

Each README ends with ideas for changing the rules. To write your own skill from scratch, use [skill-designer.md](../../docs/skill-designer.md); its worked example is the scan-renamer skill.

---

From the Heartland AI Symposium pi workshop resources, organized by Raymond Deiser, with Sawyer Borror. All sample data is fictional.
