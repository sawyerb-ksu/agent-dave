# Hands-on activities

Every hands-on activity from *Beyond the Prompt*, in order, so you can follow along or redo them later without the slides. Slide numbers match the deck in `presentation-resources/`.

| Slide | Loop | Activity | Time | Done when |
|---|---|---|---|---|
| 0 | Before we start | [Get set up](#get-set-up) | 2–3 min | Setup finishes and saves the studio connection |
| 14 | Loop 1 | [Wake DAVE up](#wake-dave-up) | 6 min | DAVE replies; `/model` shows `qwen3.8:27b-q8_0` |
| 16 | Loop 1 | [Make DAVE yours](#make-dave-yours) | 7 min | The same question gets an answer that fits your new role |
| 22 | Loop 2 | [Teach DAVE a skill](#teach-dave-a-skill) | 14 min | Your skill loads naturally and saves a result you check against the input |
| 27 | Loop 3 | [Launch the drone](#launch-the-drone) | 8 min | You check the events in `events.ics` against their source links |
| 34 | Loop 4 | [Upgrade and inspect](#upgrade-and-inspect) | 8 min | A question dialog appears; `ask_user_question` shows in `/tree` |
| 39 | Final task test | [Put your co-worker to work](#put-your-co-worker-to-work) | 12 min | Your co-worker produces a checked result, and you test one improvement |

The six timed activities total **55 minutes** inside the two-hour workshop. Setup happens before the session.

Working in pairs? One person types, the other navigates, and you swap each loop. Edit every file in VS Code.

Fell behind? [checkpoints/](checkpoints/README.md) has the finished files for each loop. Stuck? See [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

**Choose your task on slide 5.** In VS Code, copy [templates/my-workshop.md](templates/my-workshop.md) to `my-workshop.md` at the top of the repo. Write one small task and what a correct result looks like. You will use that same task for your identity, skill, question-dialog exercise and final task test. Need an input? Use `samples/meeting-notes/` or [samples/student-email.md](samples/student-email.md) with the Loop 2 checkpoint skill.

**Where commands go:** a **shell** command runs in VS Code's terminal after you exit pi. A command beginning with `/` runs **inside pi**. When these instructions say exit pi, return to the shell before typing the next shell command.

---

## Get set up

*Slide 0 · before we start · no admin password needed*

1. **Open a terminal.** Ctrl + Alt + T on a studio machine; PowerShell on a Windows laptop.
2. **Get DAVE and run setup.**
   - Linux or macOS:
     ```bash
     git clone https://github.com/thesawdawg/agent-dave && cd agent-dave && ./setup.sh
     ```
   - Windows PowerShell:
     ```powershell
     git clone https://github.com/thesawdawg/agent-dave
     cd agent-dave
     powershell -ExecutionPolicy Bypass -File setup.ps1
     ```
3. **Enter the studio address and your key.** Both are on your handout. Press Enter to accept the default address.

Setup installs Node.js, pi and uv in your home folder, saves the studio connection, and opens DAVE's folder in VS Code, in a clean profile called DAVE with no extensions. It doesn't start pi; you do that in the next activity. Running it again is safe.

**You should see:** VS Code opens on a *You're all set* page. Sit tight until we begin.

- **`git clone` fails?** Ask for the offline copy, extract it, open a terminal in that folder and run setup.
- **On a shared machine,** remove your key when you're done: `./setup.sh --forget-key` (Windows: `setup.ps1 -ForgetKey`).

---

## Loop 1: Power and brain

### Wake DAVE up

*Slide 14 · 6 minutes*

1. Find DAVE's folder in VS Code; setup opened it. If it's not open, run:
   ```bash
   code ~/agent-dave
   ```
2. In VS Code's terminal (Ctrl + \`), start DAVE. Say yes when pi asks to trust the folder.
   ```bash
   pi
   ```
3. Inside pi, say hello:
   > Hi DAVE. What can you do, and which model are you running on?

**You should see:** DAVE replies, and `/model` shows `qwen3.8:27b-q8_0` selected.

Keep this file open in VS Code for the remaining exercises.

- **`pi` not found?** The terminal was opened before setup finished. Open a new one.
- **Setup didn't finish?** Run `./setup.sh` again in VS Code's terminal.

### Make DAVE yours

*Slide 16 · 7 minutes*

1. In VS Code, open `AGENTS.md` at the top of the repo.
2. Rename your co-worker and give them a role for the task in `my-workshop.md`.
3. Add one rule under "How you work", then save the file.
4. In the terminal, exit pi, run `pi` again, and ask the same question as before.

**You should see:** the same question, a different co-worker: the answer fits the new role.

`AGENTS.md` describes the behavior you want. Those instructions are requests; tool restrictions and the guard enforce permissions. The guard is already loaded, and we inspect it in Loop 3.

**Role ideas:** grant-writing helper, lab notebook keeper, course-site editor, advising FAQ desk, event planner. More prompts are in [samples/prompts.md](samples/prompts.md), and finished roles are in [examples/personas/](examples/README.md).

- **Done early?** Add a second rule and test it.
- **Behind?** Copy `checkpoints/loop-1/AGENTS.md` over `AGENTS.md`.

---

## Loop 2: Skills

### Teach DAVE a skill

*Slide 22 · 14 minutes, after the worked example on slide 21*

1. **First 3 minutes:** fill in the four skill-design fields in `my-workshop.md`: input, output and save path, 3–5 steps, and what DAVE must never invent.
2. **Next 7 minutes:** ask DAVE to draft `.pi/skills/my-skill/SKILL.md` from those answers, or copy `templates/my-skill` into `.pi/skills` in VS Code and write it yourself. Open the file in VS Code either way. Review its description, steps and output path, then change one instruction yourself. If you rename the folder, make its frontmatter `name` match.
3. **Last 4 minutes:** exit pi to the shell, start `pi` again, and ask for your task without naming the skill. Supply the small input you chose. Open the saved result and compare it with the input and your definition of done.

**You should see:** DAVE reads your skill and saves a useful result that matches the input. Record its path and one check you made in `my-workshop.md`. A skill being loaded is only the first checkpoint.

- **Skill doesn't fire?** Force it with `/skill:my-skill` to separate a discovery problem from a workflow problem. Improve the description, run `/reload`, and try again in natural words. Check the source if it loads but gives a poor result.
- **Stuck for an idea?** Use `samples/meeting-notes/` or [samples/skill-ideas.md](samples/skill-ideas.md). The [full skill-designer guide](docs/skill-designer.md) is for deeper practice later.
- **Behind?** Customize the finished `student-email-reply` skill in `checkpoints/loop-2/` and use `samples/student-email.md`; still make one edit and check its result.

A skill describes a workflow. It can use tools for live data or exact actions; those actions do not replace the workflow.

---

## Loop 3: MCP

### Launch the drone

*Slide 27 · 8 minutes*

Both MCP servers, `fetch` and `campus-events`, are already listed in `.pi/mcp.json`.

1. Exit pi. In the **shell**, check both servers connect:
   ```bash
   pi mcp list
   ```
2. In the shell, run `pi` again. Then **inside pi**, see where his drone can fly:
   ```
   /mcp
   ```
3. Send the drone to the campus calendar:
   > Find AI-related events on the K-State calendar for the next two weeks and save the best three to events.ics
4. Send it to the web for details:
   > Open the page for the first event and tell me who it's for.

**You should see:** `events.ics` appears in the repo. Open it in VS Code and check the event titles, dates and times against DAVE's source links. Fewer than three is fine if that is all the source provides; DAVE should say so.

On slide 28, inspect your own file. If a calendar app is available, preview the file there before deciding whether to import it. There is no need to send anything or run the search again.

- **A server shows as failed?** `pi mcp list` says why. campus-events needs `npm install --prefix mcp/campus-events` and pi started from the repo folder; fetch needs uv.
- **No internet?** Step 3 still works from the saved calendar snapshot. Skip step 4.
- **Behind?** `checkpoints/loop-3/` has a finished `events.ics`.

**Think about it (slide 29):** how much should DAVE do without asking? Pick a setting for your own work. It's the `"dial"` line in `.pi/guard.jsonc`.

| Setting | What DAVE does |
|---|---|
| `ask-before-everything` | Asks before every file read and every command |
| `ask-before-changes` | Reads freely, asks before editing |
| `ask-before-anything-leaves` (default) | Edits his folders, asks before sending, publishing or deleting |
| `just-do-it` | Fine for a sandbox, risky for your inbox |

---

## Loop 4: Extensions

### Upgrade and inspect

*Slide 34 · 8 minutes*

1. Exit pi. In the **shell**, install a package that lets DAVE ask you questions:
   ```bash
   pi install npm:@juicesharp/rpiv-ask-user-question
   ```
2. In the shell, start pi again. A restart is needed; `/reload` isn't enough.
   ```bash
   pi
   ```
3. **Inside pi**, return to your own task and leave a choice open:
   > Help with my task in my-workshop.md. Use ask_user_question to clarify a choice before you act.
4. Answer his questions, then find that tool call in the black box:
   ```
   /tree
   ```

**You should see:** DAVE opens a question dialog with choices, and the `ask_user_question` call shows in `/tree`. Use the arrow keys and Enter to answer, and Esc to back out.

- **`pi install` fails?** From the offline copy: `pi install ./vendor/ask-user-question`, then restart pi.
- **Done early?** Ask DAVE to build himself an extension, such as a `/todo` command that keeps a list in `todo.md`, then run `/reload`. `checkpoints/loop-4/` has a finished example.

---

## Put your co-worker to work

*Slide 39 · 12 minutes, starting at 1:42 · swap drivers*

1. **Minutes 0–4 — run:** exit pi to the shell, restart it from the repo folder, and request the original task in `my-workshop.md` without naming the skill. Provide its input.
2. **Minutes 4–7 — check:** confirm the skill loaded, open the saved result in VS Code, and compare it with the source and your definition of done. Inside pi, use `/tree` to inspect what it read and did.
3. **Minutes 7–10 — improve:** edit one skill instruction in VS Code. Save, run `/reload` inside pi, and try again. Compare the result. If the first run failed, record the failure and test one focused fix.
4. **Minutes 10–12 — share:** each partner explains what works and what still needs supervision. Record the final output path, your change and one remaining limitation in `my-workshop.md`.

**You should see:** your co-worker uses your custom skill, produces a result you can check, and responds to an instruction you improved. A crew or a custom extension is not required.

**Behind?** Copy the Loop 2 checkpoint skill into `.pi/skills/` in VS Code, customize one instruction and test it on `samples/student-email.md`. A small checked result meets the goal. If a run still fails, keep the input, error and change you tried so you can continue later.

## Save your own co-worker

*Slide 41 · during the wrap*

The repo QR opens the starter. **It does not include your workshop edits.**

1. In VS Code, use **Reveal in File Explorer / Finder** (**Open Containing Folder** on Linux) to open the repo in the file manager.
2. Copy `AGENTS.md`, your custom skill folder, `my-workshop.md`, and the sample input/output to your own storage. Preserve the skill folder so it can go back into `.pi/skills/`. Each partner takes a copy.
3. Leave saved API keys and pi session logs out of that copy. On a shared machine, exit pi and run `./setup.sh --forget-key` in the shell (PowerShell: `./setup.ps1 -ForgetKey`).
4. On your own computer, use [docs/build-your-own.md](docs/build-your-own.md) to connect a model, then restore your files to the same places in the repo and run your task again.

---

## After the workshop

The finale's crew of DAVEs was a live demo; the worker files are in `.pi/agents/` (they need pi-subagents), and crew prompts are at the end of [samples/prompts.md](samples/prompts.md).

The decision-model judge (slide 44) and mission-control dashboard (slide 45) are bonus material after the two-hour workshop. They are optional next steps.

To rebuild DAVE on your own laptop, follow [docs/build-your-own.md](docs/build-your-own.md). Some places to take him next:

| Who | Starter project | Parts |
|---|---|---|
| Faculty | A rubric-feedback skill that drafts comments in your voice | Skill |
| Staff | Meeting notes turned into calendar invites for your team | Skill, MCP |
| Students | A study planner that splits a syllabus across a crew | Crew |
| Researchers | A literature search that saves sources to your notes | MCP, skill |
