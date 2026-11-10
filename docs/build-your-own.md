# Build your own DAVE

Everything from the workshop runs on your own computer. You need two things: this repo, and a model for DAVE to think with. This guide covers both, then what to change first.

## 1. Get DAVE

Linux or macOS:

```bash
git clone https://github.com/thesawdawg/agent-dave && cd agent-dave && ./setup.sh
```

Windows (PowerShell):

```powershell
git clone https://github.com/thesawdawg/agent-dave
cd agent-dave
powershell -ExecutionPolicy Bypass -File setup.ps1
```

Setup installs pi (with its own Node.js) and uv in your home folder, with no administrator password. Then it asks for a **model address** and a **key**. Pick one of the two options below before you run it, so you have both ready.

Setup is safe to run again. Run it any time you switch to a different model address.

## 2. Pick a brain

### Option A: K-State Library GPT (K-State users)

Library GPT is the model service the workshop ran on. Only K-State affiliated users can sign in to it.

1. Go to [gpt.lib.k-state.edu](https://gpt.lib.k-state.edu/) and sign in.
2. Open **Settings › Profile › Account › API keys** and choose **Show** to copy your key. The temporary key from the workshop handout may stop working, so make your own.
3. Run setup. When it asks:
   - **Studio address:** press Enter to accept `https://gpt.lib.k-state.edu`
   - **Key:** paste your key (it stays hidden as you type)

Setup checks the key, reads the list of models your account can use, and saves the connection in `~/.pi/agent/models.json`, readable only by you. DAVE's default brain is `qwen3.8:27b-q8_0`, set in `.pi/settings.json`.

### Option B: a model on your own computer, with Ollama

Nothing leaves your computer, and there's no key to manage. You need a computer with a recent graphics card or plenty of memory, and a model that supports tool calling (DAVE needs tools to do anything).

1. Install [Ollama](https://docs.ollama.com/quickstart):
   - Windows (PowerShell): `irm https://ollama.com/install.ps1 | iex`
   - macOS and Linux: see [ollama.com/download](https://ollama.com/download)
2. Download a model:
   ```bash
   ollama pull lfm3:latest
   ```
3. Run setup. When it asks:
   - **Studio address:** `http://localhost:11434`
   - **Key:** `ollama` (Ollama doesn't check it, but setup needs something)
4. Point DAVE at that model. In VS Code, open `.pi/settings.json` and change `defaultModel` to the model you pulled:
   ```json
   {
     "defaultProvider": "aistudio",
     "defaultModel": "lfm3:latest",
     "defaultThinkingLevel": "low"
   }
   ```
   Setup warns you when `defaultModel` isn't one of the models it found. Inside pi, `/model` lists them too.

Ollama can also start pi with a model directly: `ollama launch pi --model lfm3:latest` (see [Pi on Ollama](https://docs.ollama.com/integrations/pi)). Inside this repo, setup plus `.pi/settings.json` does the same job and keeps DAVE's settings.

### Any other endpoint

Setup works with any OpenAI-compatible endpoint: Open WebUI, LiteLLM, vLLM, or a hosted provider. Give it the address and key; it looks for the model list at `/api/models`, then `/v1/models`. Then set `defaultModel` as in option B.

pi also supports many hosted providers directly. See [pi's provider docs](https://pi.dev/docs/latest).

## 3. Start DAVE

Setup opens DAVE's folder in VS Code as its last step, in a clean profile called DAVE (no extensions, built-in AI chat off). If it isn't open, run `code ~/agent-dave`. Then, in VS Code's terminal (Ctrl + `):

```bash
pi
```

Say yes when pi asks to trust the folder; that lets it load `.pi/`, where DAVE's settings, skills, MCP servers and guard live. Then say hello, and check `/model` shows the brain you picked.

Something not working? See [TROUBLESHOOTING.md](../TROUBLESHOOTING.md).

## 4. Make DAVE yours

Rebuild him in the same order as the workshop, one part at a time:

| Part | What to change | File |
|---|---|---|
| ID badge | Rename him, give him a role from your work, add your rules | `AGENTS.md` |
| Instruction manuals | Write a skill for a task you repeat. [skill-designer.md](skill-designer.md) walks you through it in about 20 minutes | `.pi/skills/<name>/SKILL.md` |
| Drone | Connect the MCP servers you need, and remove the ones you don't | `.pi/mcp.json` |
| Upgrade module | Ask DAVE to write an extension, then `/reload` | `.pi/extensions/*.ts` |
| Safety interlock | Set how much he does without asking, and add your own rules | `.pi/guard.jsonc` |
| Fleet antenna | Add worker DAVEs for jobs that split into parts (`pi install npm:pi-subagents`) | `.pi/agents/*.md` |

More to practice on:

- [examples/kits/](../examples/kits/README.md): three ready-made skills with sample data (webpage briefing, spreadsheet check, scan renamer).
- [samples/](../samples/): messy meeting notes, prompts and skill ideas.
- [resources.md](resources.md): pi's docs, the Agent Skills spec, and K-State Library guides.
- [pi-cli-reference.md](pi-cli-reference.md): every `pi` command and option.

## 5. Keep it safe

- Only install skills, extensions and packages you've read. They can tell DAVE to run commands or change files.
- Keep student, patron and other private records out of any AI tool your institution hasn't approved for them.
- Use git as your undo button: commit before you let DAVE change a lot of files.
- On a shared computer, remove your key when you're done: `./setup.sh --forget-key` (Windows: `setup.ps1 -ForgetKey`).
