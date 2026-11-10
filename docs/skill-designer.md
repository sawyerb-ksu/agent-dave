# Design your own skill: a fill-in guide

Answer five short sets of questions and you'll have a working SKILL.md for a task you do over and over. It takes about 20 minutes.

During the workshop's 14-minute skill activity (slide 22), use the four fields in [templates/my-workshop.md](../templates/my-workshop.md) and [ACTIVITIES.md](../ACTIVITIES.md#teach-dave-a-skill). This longer guide is for deeper practice afterward.

A **skill** is a folder with one file, SKILL.md, that teaches an agent like Pi how to do one job your way. The top of the file tells Pi *when* to use it. The rest tells Pi *how*. The same file works in Pi, Claude, Codex, Copilot and other agents that support skills.

**How to use this guide:** fill in each blank in Steps 1–4, then copy your answers into the template in Step 5. If you get stuck, the scan-renamer example at the end shows every blank filled in. It's the skill in [examples/kits/scan-renamer](../examples/kits/scan-renamer/README.md), so you can run it too.

## Step 1: Pick a task

The best first skill is a task you already do the same way every time and could explain to a new colleague in a few minutes.

| Good first skills                            | Harder first skills                               |
| -------------------------------------------- | ------------------------------------------------- |
| Turn meeting notes into action items         | "Help me with my job" (too broad)                 |
| Rename scanned files by date                 | Anything that needs judgment you can't write down |
| Draft a weekly status update from a template | Anything that touches student or patron records   |
| Check a web page for broken links            | Tasks you only do once a year                     |

**The task I do over and over:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**How often I do it:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**What "done right" looks like:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Step 2: Name it and say when to use it

Pi reads only the name and description up front. The description is how Pi decides whether your skill fits a request, so it needs both *what* the skill does and *when* to use it.

**Name** (lowercase letters, numbers and hyphens only, like `weekly-status`): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**What it does** (one sentence, starting with a verb): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Use it when someone asks for** (list the words people actually say, like "to-dos", "follow-ups", "next steps"): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Tip: if Pi doesn't pick up your skill on its own, the description is usually the problem. Add more of the words people use.

## Step 3: Say what goes in and what comes out

Be specific about where things are and what the result should look like. "A table with these columns" beats "a summary."

**Pi should read from** (a folder, a file type, a web page): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Pi should produce** (a table, a list, an email draft, renamed files): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**It should include** (columns, headings or fields): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Save it to** (a file name, or "just reply in chat"): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Step 4: Write the steps and the rules

Write the steps the way you'd explain the job to a new colleague: short, in order, one action each. Then add the rules a newcomer would get wrong.

**The steps, in order:**

1. ---
2. ---
3. ---
4. ---

**Rules Pi must follow** (what to skip, what never to guess, how to handle missing information):

- ---
- ---

**When it's done, Pi should reply with** (a one-line count, a summary, a question): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Tip: one rule almost every skill needs is "Don't invent anything. If the information isn't there, say so."

Tip: if your skill changes files, have Pi show its plan and wait for your "yes" first. Also have it keep a record of what it changed so you can undo it.

## Step 5: Put it together and test it

Copy your answers into this template and save it as **SKILL.md**.

```markdown
---
name: [Step 2: name]
description: [Step 2: what it does]. Use when [Step 2: the words people say].
---

# [A short title]

1. Read [Step 3: where Pi reads from].
2. [Step 4: step 1]
3. [Step 4: step 2]
4. [Step 4: step 3]
5. Produce [Step 3: what Pi produces] with [Step 3: columns or fields].
6. Save it to [Step 3: file name].

## Rules

- [Step 4: rule 1]
- [Step 4: rule 2]

When you're done, reply with [Step 4: the reply].
```

**Where to save it.** Make a folder with the same name as your skill and put SKILL.md inside it. In DAVE's repo, the quickest start is to copy `templates/my-skill` in VS Code and rename the copy.

| Folder                                   | Who it's for                                                 |
| ---------------------------------------- | ------------------------------------------------------------ |
| `.pi/skills/<name>/` in DAVE's repo      | DAVE. This is where his starter skills live.                 |
| `.agents/skills/<name>/` in any project  | That project only. Also works in other agents that read skills. |
| `~/.pi/agent/skills/<name>/`             | You, in every folder                                         |

**Test it:**

- [ ] Start `pi` in your project folder (for DAVE, the top of the repo) and say **yes** when it asks to trust the folder
- [ ] Ask for the task in your own words. Did Pi pick up the skill?
- [ ] If not, run `/skill:<name>` to load it directly, then improve the description
- [ ] Check the output against the source. Did Pi invent anything?
- [ ] Change one rule, run `/reload` and ask again

## Worked example: rename scanned files

This is the skill from the [scan-renamer kit](../examples/kits/scan-renamer/README.md), with every blank filled in.

| Blank                        | Answer                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Task                         | Give badly named scans clear, consistent names                                  |
| Name                         | `scan-renamer`                                                                  |
| What it does                 | Rename scanned files to clear, consistent names using the scanning log          |
| Use it when someone asks for | rename, clean up, organize or fix the names of scans, photos or PDFs            |
| Read from                    | `scanning-log.csv` and the files in the `scans/` folder                         |
| Produce / include            | New names like `DATE_collection_title.ext`, plus a plan table to approve first  |
| Save to                      | `rename-log.md`, a record of old and new names so the renames can be undone     |
| Rules                        | Only rename, never delete. Skip files not in the log. Don't guess dates.        |
| Reply with                   | How many files were renamed, skipped and missing                                |

```markdown
---
name: scan-renamer
description: Rename scanned files to clear, consistent names using the scanning log. Use when the user asks to rename, clean up, organize or fix the names of scans, scanned files, photos or PDFs.
---

# Rename scanned files

1. Read `scanning-log.csv`. Each row lists a file in the `scans/` folder with its date, collection and title.
2. List every file in the `scans/` folder.
3. Build a new name for each file with this pattern: `DATE_collection_title.ext`
   - DATE: a full date becomes YYYY-MM-DD, a month and year becomes YYYY-MM, a year stays YYYY, and a blank date becomes `undated`.
   - collection and title: lowercase, words joined with hyphens, no spaces or punctuation.
   - Keep the original file extension.
4. Show a table of the plan with these columns: Current name, New name, Status (Rename, Skip or Missing). Then stop and ask: "Rename these files?"
5. Only after the user says yes, rename the files.
6. Save a record to `rename-log.md`: a table of Old name and New name, so the renames can be undone.

## Rules

- Only rename. Never delete, overwrite or edit what's inside a file.
- Only touch files inside the `scans/` folder.
- If a file isn't in the log, leave it alone and mark it Skip.
- If the log lists a file that isn't in the folder, mark it Missing.
- Don't guess dates or titles. Use only what the log says.
- If two files would get the same name, add `-2`, `-3` and so on to the later ones.

When you're done, reply with one line: how many files were renamed, skipped and missing.
```

## Before you use it for real

- Practice on made-up data first, like the scans in the scan-renamer kit.
- Keep student and patron records out of any AI tool that isn't on the approved local cluster.
- Only trust skills you've read. A skill can tell the agent to run scripts or change files.

## Sources

- [Pi docs: Add Skills](https://pi.dev/docs/latest/skills)
- [Pi docs: Run Pi Safely](https://pi.dev/docs/latest/security)

---

From the Heartland AI Symposium pi workshop resources, organized by Raymond Deiser, with Sawyer Borror.
