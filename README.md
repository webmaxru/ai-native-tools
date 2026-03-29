# AI-Native Development Tools

A **plugin marketplace** for AI-native development agent skills, maintained by [Maxim Salnikov](https://github.com/webmaxru).

The marketplace aggregates agent skill plugins from this and other repositories into a single install point. Once installed, your coding agent gains access to every plugin and every skill each plugin provides — no per-skill setup required.

## Available Skills (all plugins)

Installing the marketplace gives you the following skills across all plugins:

| Plugin | Skills | Source |
|--------|--------|--------|
| **ai-native-dev-skills** | Agent Package Manager · Agent Skill Deploy · GitHub Agentic Workflows | this repo |
| **web-ai-skills** | Prompt API · Language Detector · Translator · Writing Assistance · Proofreader · WebMCP · WebNN | [webmaxru/agent-skills](https://github.com/webmaxru/agent-skills) |
| **enonic-skills** | Enonic CMS agent skills collection | [webmaxru/enonic-agent-skills](https://github.com/webmaxru/enonic-agent-skills) |

## Install

### Claude Code

```bash
/plugin marketplace add webmaxru/ai-native-dev
```

### VS Code (GitHub Copilot)

Run **Chat: Install Plugin From Source** from the Command Palette and enter:

```
https://github.com/webmaxru/ai-native-dev
```

Or add to your `settings.json`:

```json
"chat.plugins.marketplaces": [
    "webmaxru/ai-native-dev"
]
```

Then browse **Agent Plugins** in the Extensions sidebar (`@agentPlugins`).

### GitHub Copilot CLI

```bash
copilot plugin marketplace add webmaxru/ai-native-dev
```

### Agent Package Manager (APM)

```bash
apm install webmaxru/ai-native-dev/skills/agent-package-manager
apm install webmaxru/ai-native-dev/skills/agent-skill-deploy
apm install webmaxru/ai-native-dev/skills/github-agentic-workflows
```

---

## Skills in This Repository

The `skills/` directory contains three agent skills shipped as part of the **ai-native-dev-skills** plugin.

### Agent Package Manager

Installs, configures, audits, and operates [Agent Package Manager (APM)](https://github.com/microsoft/apm) in any repository that uses agent instructions, skills, prompts, or MCP integrations.

**What the agent can do for you:**

- Initialize APM in a new or existing repo (`apm init`)
- Add, update, and remove skill and MCP-server dependencies
- Validate and repair `apm.yml` manifests
- Manage lockfiles for reproducible, team-wide dependency resolution
- Compile agent context and run project scripts
- Set up runtimes, pack bundles for CI, and distribute resolved context

### Agent Skill Deploy

Deploys agent skill collections from any GitHub repository with a `/skills` folder to one or more distribution surfaces.

**What the agent can do for you:**

- Validate git state, skill inventory, and surface readiness before release
- Analyze conventional commits and recommend a version bump
- Bump versions across all detected config files in one pass
- Publish to GitHub Releases, Claude Code marketplace, VS Code plugin marketplace, and Copilot CLI marketplace
- Run dry-run deployments to preview changes without side effects

### GitHub Agentic Workflows

Authors, reviews, installs, and debugs GitHub Agentic Workflows — markdown-based CI/CD automation powered by AI agents.

**What the agent can do for you:**

- Scaffold new agentic workflows from templates
- Configure triggers, safe outputs, network policy, and engine settings
- Set up authentication and repository prerequisites
- Compile, validate, and execute workflows with the `gh aw` CLI
- Diagnose setup, compilation, permissions, and runtime failures

## License

MIT
