# Checkpoints: catch up in a minute

Fell behind, lost a file, or swapped machines? Each folder here holds the finished files for one loop of the workshop. They sit in the same places they go in the repo, so you can copy them straight across.

| Folder | After | What's inside | Goes to |
|---|---|---|---|
| `loop-1/` | Power up and ID badge (slides 14–16) | A finished `AGENTS.md` for a new co-worker | `AGENTS.md` |
| `loop-2/` | Instruction manuals (slide 21) | A skill made from the template | `.pi/skills/student-email-reply/` |
| `loop-3/` | The drone (slide 27) | The `events.ics` DAVE saves | the repo folder |
| `loop-4/` | Upgrade modules (slide 34) | A small extension DAVE could write | `.pi/extensions/` |

## How to copy a checkpoint in VS Code

1. In the Explorer, open the checkpoint folder you need.
2. Right-click the file and choose **Copy**.
3. Right-click the folder it goes in (see the table) and choose **Paste**. Say **Replace** if VS Code asks.
4. In pi, run `/reload` (or start pi again) so DAVE picks up the change.

To keep your own version, open both files side by side instead and copy just the parts you want.

These files don't load from here. pi only reads `AGENTS.md`, `.pi/skills/` and `.pi/extensions/` at the top of the repo, so nothing in `checkpoints/` changes DAVE until you copy it.

## Nothing works on your machine?

Pair up with a neighbor: one person types, the other navigates, and you swap each loop. Everything you build is in this repo, so you can redo it later from the take-home guide. See [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) for quick fixes.
