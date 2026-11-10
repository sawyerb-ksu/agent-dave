# Troubleshooting

Quick fixes for the things that most often go wrong in the workshop. If none of these work, raise a hand, or pair up with a neighbor and keep going together.

## Getting started

| What you see | Fix |
|---|---|
| `git clone` fails or hangs | The network may be down. Get the offline copy (USB drive or studio share), extract it, open a terminal in that folder, and run setup. |
| `./setup.sh: Permission denied` | Run `bash setup.sh` instead. |
| Windows: *running scripts is disabled on this system* | Start setup with `powershell -ExecutionPolicy Bypass -File setup.ps1`. That changes nothing permanently. |
| setup says this machine is missing `curl`, `tar` or `xz` | Those need an administrator to install. On a studio machine, ask for help; otherwise pair up for now. |
| setup says *the studio didn't accept that key* | Type it again; it's easy to miss a character. Still failing? Ask for a spare key. |
| setup says *no model list found there* | Check the studio address on your handout, including `https://`. |
| `pi: command not found` right after setup | That terminal was open before pi was installed. Open a new terminal (VS Code's is fine), or run `source ~/.bashrc`. |

## Starting DAVE

| What you see | Fix |
|---|---|
| DAVE doesn't know he's DAVE, or `/mcp` shows nothing | You started pi outside the `agent-dave` folder, or said no to trust. Quit (Ctrl + C twice), `cd` into `agent-dave`, run `pi` again and say yes. Already said no? Type `/trust` in pi, then restart it. |
| *No API key* or *401* errors in pi | The saved key is wrong or was removed. Quit pi, run `./setup.sh` again and re-enter the key. |
| Answers are very slow | Everyone shares the studio model. Give it a moment. If it stalls, press Esc and ask again, or try another model with `/model`. |
| DAVE seems confused after a long session | Start fresh with `/new`, or shrink the conversation with `/compact`. |

## Skills, drones and upgrades

| What you see | Fix |
|---|---|
| Your skill never fires | The description needs to say *when* to use it. Fix it, then start a new session (`/new`). To force it: `/skill:my-skill`. |
| Your skill doesn't show up at all, or pi says *description is required* | The `description` is empty, or `name` doesn't match the folder name. Both are in the `---` block at the top of SKILL.md. |
| `/mcp` shows **campus-events** as failed | Run `./setup.sh` again; it installs the server's packages. |
| *fetch: failed: spawn uvx ENOENT* | pi can't find uv. Quit pi, run `./setup.sh` again (it puts `uvx` next to pi), then start pi. |
| `/mcp` shows **fetch** as failed for another reason | Usually there's no internet. Skip the web step; campus-events still works. |
| DAVE says the calendar *couldn't be reached* | That's the backup working: the network is down, so campus-events uses its saved snapshot of the calendar. Carry on. |
| `pi install` fails (slide 34) | The network may be down. From the offline copy: `pi install ./vendor/ask-user-question`, then restart pi. |
| pi asks *guard · DAVE wants to …* | That's the safety interlock doing its job. Pick **Yes, once**, **Yes, for the rest of this session**, or **No**. To pause it: `/guard off`. |
| DAVE says *guard: DAVE may not …* | A `never` rule in `.pi/guard.jsonc` blocked it; the message says which rule. Do that step yourself, or change the rule. |
| pi warns *.pi/guard.jsonc has a mistake* | It names the line. Usually a missing comma or quote; VS Code underlines it in red. Until it's fixed, the guard asks before every change. |
| The guard says *longer than the judge's context*, or setup warns about the judge's context | <a id="the-judges-context-is-too-small"></a>**The judge's context is too small.** Ollama loads models with 4096 tokens unless the model sets `num_ctx`, and the judge's API can't change it per call. Make a copy with more room: save `FROM clef:27b` and `PARAMETER num_ctx 16384` (two lines) as `Modelfile.judge`, run `ollama create clef-16k -f Modelfile.judge`, then pick `clef-16k` in `/guard judge setup`. It reuses the same weights, so it takes almost no extra disk; it does use a little more memory. `ollama ps` shows the context it loaded with. |
| The guard says *couldn't reach the judge* or *took longer than* | The judge is optional. Run `/guard judge` to see its address and test it; `/guard judge setup` changes it. Check that Ollama is running and `ollama list` shows the model. If it says *to load*, the model is still loading: raise `judge.coldStartMs` in `.pi/guard.jsonc` (30000 by default). Until it answers, `ifUnavailable` decides (ask by default). `/guard judge off` disconnects it. |
| pi says *guard · STOP. This could …* after you said yes | That's the last look: the command is on the guard's short list of catastrophic commands. Read what it would do. To run it anyway, choose *I understand the risk* and type `RUN`. |
| A rule you added doesn't seem to work | In pi, run `/guard test <the command>` to see which rule decides it. An earlier rule may match first: move yours above it. |
| pi shows an error after you edit an extension | Undo in VS Code (Ctrl + Z) and save, then `/reload`. Or copy the file from `checkpoints/`. |

## Behind or lost?

Copy the finished files for the loop you're on from [checkpoints/](checkpoints/README.md), run `/reload`, and keep going.
