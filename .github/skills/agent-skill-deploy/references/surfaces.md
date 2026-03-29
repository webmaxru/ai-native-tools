# Deployment Surface Reference

Detailed configuration requirements and deployment mechanics for each supported surface.

## GitHub Releases

**Detection:** Git remote URL present (`git remote get-url origin`).

**Config files:** None required beyond the git repository itself.

**Deploy action:** Create a git tag and GitHub release with a per-skill changelog. The changelog is built by diffing each changed skill directory against the previous release tag and summarizing user-visible changes as a concise bullet list grouped by skill name. Do not use `gh release create --generate-notes`; always provide an explicit `--notes` body with the per-skill changelog.

**Required tools:**
- `git` — always required
- `gh` — GitHub CLI, required for automated release creation

**Version source:** Git tags (e.g., `v1.2.0`).

**Manual alternative:** Create release through the GitHub web UI at `https://github.com/OWNER/REPO/releases/new`.

**Install command for consumers:**
```bash
apm install OWNER/REPO/skills/SKILL_NAME
```

---

## Claude Code Marketplace

**Detection:** `.claude-plugin/plugin.json` exists. `.claude-plugin/marketplace.json` is optional.

**Config files:**

1. `.claude-plugin/plugin.json` (required) — Plugin metadata with `version` field at root level:
   ```json
   {
     "name": "my-skills",
     "version": "1.0.0",
     "description": "...",
     "author": { "name": "..." },
     "repository": "https://github.com/OWNER/REPO",
     "license": "MIT",
     "keywords": [...]
   }
   ```

2. `.claude-plugin/marketplace.json` (optional) — Marketplace listing with version in `plugins[0].version` or root `version`. If absent, the plugin is assumed to be listed by a marketplace defined in another repository. Only `plugin.json` is version-bumped in that case.
   ```json
   {
     "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
     "name": "owner-repo",
     "version": "1.0.0",
     "description": "...",
     "owner": { "name": "..." },
     "plugins": [
       {
         "name": "my-skills",
         "description": "...",
         "source": ".",
         "category": "development"
       }
     ]
   }
   ```

**Deploy action:** Bump version in `plugin.json` (and `marketplace.json` if present), commit, push. The marketplace reads from GitHub directly.

**Required tools:** `git`

**Install command for consumers:**
```bash
/plugin marketplace add OWNER/REPO
/plugin install PLUGIN_NAME@OWNER-REPO
```

---

## VS Code Plugin Marketplace

**Detection:** `package.json` exists in repository root.

**Config files:**

1. `package.json` — Standard npm package manifest with `version` field:
   ```json
   {
     "name": "my-skills",
     "version": "1.0.0",
     "description": "...",
     "author": { "name": "..." },
     "repository": "https://github.com/OWNER/REPO",
     "license": "MIT"
   }
   ```

2. VS Code agent plugins do **not** use the VS Code Extension Marketplace (`vsce publish`). They are distributed as Git repositories and installed via plugin marketplaces or directly from source.

**Deploy action:** Bump version, commit, push. Consumers install via "Chat: Install Plugin From Source" in the VS Code Command Palette, or browse the plugin through `@agentPlugins` in the Extensions view if the plugin is listed in a marketplace Git repository.

**Required tools:**
- `git` — always required

**Install command for consumers:**
- Run **Chat: Install Plugin From Source** from the Command Palette and enter:
  ```text
  https://github.com/OWNER/REPO
  ```
- Or browse `@agentPlugins` in the Extensions view if the plugin is listed in a configured marketplace.

---

## Copilot CLI Plugin Marketplace

**Detection:** `package.json` exists in repository root, and/or `.github/plugin/plugin.json` exists.

**Config files:**

1. `package.json` — Shared with VS Code surface. Contains `version` field.

2. `.github/plugin/plugin.json` (recommended) — Copilot CLI native plugin manifest with `version` field and optional component paths (`skills`, `agents`, `hooks`, `mcpServers`):
   ```json
   {
     "name": "my-skills",
     "version": "1.0.0",
     "description": "...",
     "author": { "name": "..." },
     "license": "MIT",
     "keywords": [...],
     "skills": "skills/"
   }
   ```
   Copilot CLI also looks for `plugin.json` in `.claude-plugin/` as a fallback. Having a dedicated `.github/plugin/plugin.json` allows Copilot CLI-specific fields (like `skills`, `agents`, `commands`) without affecting the Claude Code plugin config.

**Deploy action:** Bump version in `package.json`, `.github/plugin/plugin.json`, and `.github/plugin/marketplace.json` (if present), commit, push. The Copilot CLI marketplace reads from GitHub directly.

`.github/plugin/marketplace.json` (optional) — Copilot CLI native marketplace listing. Follows the Copilot CLI spec where `source` for in-repo plugins is a relative path string (e.g. `"."`) and version lives in both `plugins[0].version` and `metadata.version`:
   ```json
   {
     "name": "my-marketplace",
     "owner": { "name": "..." },
     "metadata": {
       "description": "...",
       "version": "1.0.0"
     },
     "plugins": [
       {
         "name": "my-skills",
         "source": ".",
         "category": "development",
         "version": "1.0.0"
       }
     ]
   }
   ```

**Required tools:** `git`

**Install command for consumers:**
```bash
copilot plugin marketplace add OWNER/REPO
```
