# Hands-on activities

Every hands-on activity from *Beyond the Prompt*, in order, so you can follow along or redo them later without the slides. Slide numbers match the deck in `presentation-resources/`.

| Slide | Loop | Activity | Time | Done when |
|---|---|---|---|---|
| 0 | Before we start | [Get set up](#get-set-up) | 2–3 min | Setup finishes and saves the studio connection |
| 14 | Loop 1 | [Wake DAVE up](#wake-dave-up) | 6 min | DAVE replies; `/model` shows `qwen3.8:27b-q8_0` |
| 16 | Loop 1 | [Make DAVE yours](#make-dave-yours) | 7 min | The same question gets an answer that fits your new role |
| 21 | Loop 2 | [Teach DAVE a skill](#teach-dave-a-skill) | 8 min | DAVE uses your skill without being told its name |
| 27 | Loop 3 | [Launch the drone](#launch-the-drone) | 8 min | `events.ics` holds three real events |
| 34 | Loop 4 | [Upgrade and inspect](#upgrade-and-inspect) | 8 min | A question dialog appears; `ask_user_question` shows in `/tree` |

Working in pairs? One person types, the other navigates, and you swap each loop. Edit every file in VS Code.

Fell behind? [checkpoints/](checkpoints/README.md) has the finished files for each loop. Stuck? See [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

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
3. Say hello:
   > Hi DAVE. What can you do, and which model are you running on?

**You should see:** DAVE replies, and `/model` shows `qwen3.8:27b-q8_0` selected.

- **`pi` not found?** The terminal was opened before setup finished. Open a new one.
- **Setup didn't finish?** Run `./setup.sh` again in VS Code's terminal.

### Make DAVE yours

*Slide 16 · 7 minutes*

1. In VS Code, open `AGENTS.md` at the top of the repo.
2. Rename your co-worker and give them a role from your work.
3. Add one rule under "How you work", then save the file.
4. In the terminal, exit pi, run `pi` again, and ask the same question as before.

**You should see:** the same question, a different co-worker: the answer fits the new role.

**Role ideas:** grant-writing helper, lab notebook keeper, course-site editor, advising FAQ desk, event planner. More prompts are in [samples/prompts.md](samples/prompts.md), and finished roles are in [examples/personas/](examples/README.md).

- **Done early?** Add a second rule and test it.
- **Behind?** Copy `checkpoints/loop-1/AGENTS.md` over `AGENTS.md`.

---

## Loop 2: Skills

### Teach DAVE a skill

*Slide 21 · 8 minutes*

1. Try a starter skill: paste messy notes and ask for minutes. Sample notes are in `samples/meeting-notes/`.
2. In VS Code, copy the `templates/my-skill` folder and paste it into `.pi/skills`.
3. In its `SKILL.md`, write a description that says *when* to use it, and 3 to 5 steps.
4. Start a fresh session and ask for the task without naming the skill.
   ```bash
   pi
   ```

**You should see:** DAVE reads your `SKILL.md` on his own. To force it: `/skill:my-skill`.

- **Skill doesn't fire?** The fix is almost always the description. Say plainly what the task is and when to use it.
- **Stuck for an idea?** Browse [awesomeskill.ai](https://awesomeskill.ai/), open [samples/skill-ideas.md](samples/skill-ideas.md), or work through [docs/skill-designer.md](docs/skill-designer.md).
- **Behind?** `checkpoints/loop-2/` has a finished skill.

---

## Loop 3: MCP

### Launch the drone

*Slide 27 · 8 minutes*

Both MCP servers, `fetch` and `campus-events`, are already listed in `.pi/mcp.json`.

1. Check both servers connect:
   ```bash
   pi mcp list
   ```
2. Start DAVE and see where his drone can fly:
   ```
   /mcp
   ```
3. Send the drone to the campus calendar:
   > Find AI-related events on the K-State calendar for the next two weeks and save the best three to events.ics
4. Send it to the web for details:
   > Open the page for the first event and tell me who it's for.

**You should see:** `events.ics` appears in the repo with three real events. Open it in VS Code to see what DAVE wrote.

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

1. Install a package that lets DAVE ask you questions:
   ```bash
   pi install npm:@juicesharp/rpiv-ask-user-question
   ```
2. Exit pi and start it again. A restart is needed; `/reload` isn't enough.
   ```bash
   pi
   ```
3. Give DAVE a task with open choices:
   > Plan a lunch-and-learn for my team. Ask me anything you need first.
4. Answer his questions, then find that tool call in the black box:
   ```
   /tree
   ```

**You should see:** DAVE opens a question dialog with choices, and the `ask_user_question` call shows in `/tree`. Use the arrow keys and Enter to answer, and Esc to back out.

- **`pi install` fails?** From the offline copy: `pi install ./vendor/ask-user-question`, then restart pi.
- **Done early?** Ask DAVE to build himself an extension, such as a `/todo` command that keeps a list in `todo.md`, then run `/reload`. `checkpoints/loop-4/` has a finished example.

---

## After the workshop

The finale's crew of DAVEs was a live demo; the worker files are in `.pi/agents/` (they need pi-subagents), and crew prompts are at the end of [samples/prompts.md](samples/prompts.md).

To rebuild DAVE on your own laptop, follow [docs/build-your-own.md](docs/build-your-own.md). Some places to take him next:

| Who | Starter project | Parts |
|---|---|---|
| Faculty | A rubric-feedback skill that drafts comments in your voice | Skill |
| Staff | Meeting notes turned into calendar invites for your team | Skill, MCP |
| Students | A study planner that splits a syllabus across a crew | Crew |
| Researchers | A literature search that saves sources to your notes | MCP, skill |
