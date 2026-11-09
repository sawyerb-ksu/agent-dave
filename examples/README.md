# Examples

Finished pieces to learn from, borrow, or use as a backup during the workshop. Nothing here loads when you start pi at the top of the repo: pi reads `.pi/` only from the folder you start it in.

## personas/: same brain, different co-worker (slide 17)

Three finished ID badges: **GRACE** (grant-writing helper), **LENNY** (lab-notebook keeper) and **CORA** (course-site editor). Each has a short *What you know right now* section, so asking *"What should I work on first today?"* gets an answer that fits the role.

To try one, open it next to the repo's `AGENTS.md` in VS Code, copy its text in, save, and start a new session. Copy DAVE's text back when you're done (or use `checkpoints/`).

## demo/: backups for the live demos

| File | Slide | Use it when |
|---|---|---|
| `demo/doc-sync/SKILL.md` | 22, DAVE writes his own skill | DAVE's saved skill doesn't fire or misses steps. Copy the `doc-sync` folder to `.pi/skills/`, start a new session and ask *"sync my docs"*. |
| `demo/standup.ts` | 32, DAVE upgrades himself | DAVE's extension won't load. Copy it to `.pi/extensions/`, run `/reload`, then `/standup`. |

Both are also good models for writing your own skill or extension later.

Slide 29b (safety interlocks) needs no backup file: it uses the guard already in `.pi/extensions/guard.ts`. If the guard doesn't ask, run `/guard test rm events.ics`: it should say ASK, decided by the delete-files rule in `.pi/guard.jsonc`. Otherwise press C on the slide for the replay.

## kits/: more skills to practice on

Three ready-made skills with fictional sample data: **webpage-briefing**, **spreadsheet-check** and **scan-renamer**. Unlike the folders above, each kit is a project of its own: start pi inside the kit folder and its skill loads from `.agents/skills/`. See [kits/README.md](kits/README.md).

## More

- `samples/`: practice inputs (messy meeting notes, research topics, skill ideas, prompts).
- `checkpoints/`: the finished files for each loop, if you fall behind.
