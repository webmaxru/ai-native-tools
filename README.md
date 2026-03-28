# ai-native-tools

Plugin marketplace for AI-native development agent skills, maintained by [Maxim Salnikov](https://github.com/webmaxru).

This marketplace aggregates agent skill plugins from multiple repositories into a single install point.

## Available plugins

| Plugin | Description | Source |
|--------|-------------|--------|
| `web-ai-skills` | Browser Web AI APIs (Prompt API, Translator, WebNN, etc.) and AI-native workflows | [webmaxru/agent-skills](https://github.com/webmaxru/agent-skills) |

## Install

### Claude Code

```bash
/plugin marketplace add webmaxru/ai-native-tools
/plugin install web-ai-skills@webmaxru-ai-native-tools
```

### VS Code (GitHub Copilot)

Add to your `settings.json`:

```json
"chat.plugins.marketplaces": [
    "webmaxru/ai-native-tools"
]
```

Then browse **Agent Plugins** in the Extensions sidebar (`@agentPlugins`) and install `web-ai-skills`.

### GitHub Copilot CLI

```bash
copilot plugin marketplace add webmaxru/ai-native-tools
copilot plugin install web-ai-skills
```

## Adding more plugins

To add a plugin from another repository, add an entry to both marketplace files:

- `.claude-plugin/marketplace.json` (Claude Code & VS Code)
- `.github/plugin/marketplace.json` (Copilot CLI)

Use a cross-repo source:

```json
{
  "name": "your-plugin-name",
  "description": "...",
  "source": {
    "source": "github",
    "repo": "owner/repo"
  }
}
```

## License

MIT
