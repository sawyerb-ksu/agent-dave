# Resources

Where to go next: pi's own docs, the Agent Skills spec, and K-State Library guides. A printable version is in [presentation-resources/ai-workshop-resources.pdf](../presentation-resources/ai-workshop-resources.pdf).

**What a harness is**
* General definition: *“An agent harness is the software layer that runs an agent session. It turns a language model into an agent by connecting the model to context and tools, coordinating the agent loop, and maintaining session state as the work progresses.”*

## pi.dev – official resources

**Core documentation**
* [Pi Docs home](https://pi.dev/docs/latest) – Quickstart, usage, configuration, sessions, CLI reference, settings, security.
* [How Pi works](https://pi.dev/docs/latest/how-pi-works) – Agent loop, session tree, system prompt assembly, context files, skills loading, extensions, trust/permissions.
* [CLI options](https://pi.dev/docs/latest/cli)
* [Settings](https://pi.dev/docs/latest/settings)
* [Security](https://pi.dev/docs/latest/security)

**Extensibility**
* [Skills](https://pi.dev/docs/latest/skills)
* [Packages](https://pi.dev/docs/latest/packages) – bundle extensions, skills, prompt templates, themes via npm/git/local. `pi install npm:@example/pi-tools`, `pi list`, `pi update --extensions`.
* [Extensions](https://pi.dev/docs/latest/extensions) – TypeScript modules loaded into Pi process, register tools/commands/shortcuts/providers/event handlers/renderers/terminal UI.
* [Prompt Templates](https://pi.dev/docs/latest/prompt-templates)
* [Themes](https://pi.dev/docs/latest/themes)

## AI Agents / SKILLS.md development

**Specification**
* [Agent Skills specification](https://agentskills.io/specification) – directory structure, `SKILL.md` format with YAML frontmatter, portable fields, discovery.

**Platform guides**
* [Pi Skills docs](https://pi.dev/docs/latest/skills) – frontmatter fields `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`, `disable-model-invocation`; loading on-demand, `/skill:name` invocation, relative paths.
  * Spec reference Pi uses: [Agent Skills specification](https://agentskills.io/specification)
* [Claude Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
* [Agent Skills best practices](https://agentskills.io/skill-creation/best-practices)

**Example collections**
* [Anthropic Skills](https://github.com/anthropics/skills)
* [Awesome Skills Marketplace](https://awesomeskill.ai/)

## The parts you added to DAVE

* [Model Context Protocol](https://modelcontextprotocol.io) – the standard behind DAVE's drone; [MCP servers](https://github.com/modelcontextprotocol/servers) to connect.
* [pi packages](https://pi.dev/packages) – extensions, skills and themes to install with `pi install`.
* [pi-subagents](https://pi.dev/packages/pi-subagents) – the crew of worker DAVEs from the finale.
* [rpiv-ask-user-question](https://pi.dev/packages/@juicesharp/rpiv-ask-user-question) – lets DAVE ask you multiple-choice questions (Loop 4).
* [pi-agent-hub](https://www.npmjs.com/package/pi-agent-hub) – mission control for many pi sessions.
* [Pi on Ollama](https://docs.ollama.com/integrations/pi) – run pi with a model on your own computer.

---

# K-State Library Resources

## Research Guides

[Artificial Intelligence Studio](https://guides.lib.k-state.edu/innovation-lab/ai-studio)

## Library Catalog

### Subject: AI agents

- [Available EBooks](https://k-state.primo.exlibrisgroup.com/nde/search?query=ai%20agents&tab=Everything&search_scope=MyInst_andCI2&classify=true&mfacet=tlevel,include,online_resources&offset=0&lang=en&facet=rtype,include,books&vid=01KSU_INST:KSU)

- [Available Video Recordings](https://k-state.primo.exlibrisgroup.com/nde/search?query=ai%20agents&tab=Everything&search_scope=MyInst_andCI2&classify=true&mfacet=tlevel,include,online_resources&offset=0&lang=en&facet=rtype,include,videos&vid=01KSU_INST:KSU)

### Subject: Agent Skills
- [Available EBooks](https://k-state.primo.exlibrisgroup.com/nde/search?query=agent%20skills&tab=Everything&search_scope=MyInst_andCI2&classify=true&mfacet=tlevel,include,online_resources&mfacet=rtype,include,books&offset=0&lang=en&vid=01KSU_INST:KSU)

- [Available Video Recordings](https://k-state.primo.exlibrisgroup.com/nde/search?query=agent%20skills&tab=Everything&search_scope=MyInst_andCI2&classify=true&mfacet=tlevel,include,online_resources&offset=0&lang=en&facet=rtype,include,videos&vid=01KSU_INST:KSU)

---

From the Heartland AI Symposium pi workshop wiki, created and organized by Raymond Deiser, with Sawyer Borror.
