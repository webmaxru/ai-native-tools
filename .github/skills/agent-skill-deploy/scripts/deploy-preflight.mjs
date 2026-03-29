#!/usr/bin/env node

// Deploy Pre-flight Script
// Validates git state, discovers deployment surfaces, checks tool availability,
// and verifies version consistency across surface config files.
// Cross-platform: works on Windows and macOS.
// Usage: node deploy-preflight.mjs [--skills-dir <path>]

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
let skillsDir = "skills";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--skills-dir" && args[i + 1]) {
    skillsDir = args[i + 1];
    i++;
  }
}

const root = resolve(".");
let exitCode = 0;

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  exitCode = 1;
}

function warn(msg) {
  console.error(`WARNING: ${msg}`);
}

function ok(msg) {
  console.log(`OK: ${msg}`);
}

// --- Git checks ---

if (!run("git rev-parse --git-dir")) {
  fail("Not a git repository");
  process.exit(1);
}

const branch = run("git branch --show-current");
console.log(`Branch: ${branch}`);

if (branch !== "master" && branch !== "main") {
  fail(`Not on master or main branch (current: ${branch})`);
} else {
  ok(`On branch ${branch}`);
}

const porcelain = run("git status --porcelain");
if (porcelain) {
  fail("Uncommitted changes detected");
  console.error(porcelain);
} else {
  ok("Working tree is clean");
}

// --- Skills directory ---

const skillsPath = join(root, skillsDir);
if (!existsSync(skillsPath)) {
  fail(`Skills directory not found: ${skillsDir}`);
} else {
  const entries = [];
  try {
    const { readdirSync, statSync } = await import("node:fs");
    for (const entry of readdirSync(skillsPath)) {
      const entryPath = join(skillsPath, entry);
      if (statSync(entryPath).isDirectory()) {
        const skillFile = join(entryPath, "SKILL.md");
        if (existsSync(skillFile)) {
          entries.push(entry);
        }
      }
    }
  } catch (e) {
    fail(`Failed to read skills directory: ${e.message}`);
  }

  if (entries.length === 0) {
    fail(`No skills found in ${skillsDir}/ (directories with SKILL.md)`);
  } else {
    ok(`Found ${entries.length} skill(s): ${entries.join(", ")}`);
  }
}

// --- Surface detection ---

const surfaces = [];
const versions = {};

// GitHub surface
const remoteUrl = run("git remote get-url origin");
if (remoteUrl) {
  surfaces.push("github");
  ok(`GitHub surface detected: ${remoteUrl}`);

  // Include latest git tag version in consistency check
  const lastTag = run("git describe --tags --abbrev=0");
  if (lastTag) {
    const tagVersion = lastTag.replace(/^v/, "");
    versions["github:tag"] = tagVersion;
  }
} else {
  warn("No git remote 'origin' found — GitHub surface unavailable");
}

// Claude Code surface
// plugin.json is sufficient to detect the surface. If marketplace.json is absent,
// the plugin is assumed to be listed by a marketplace defined in another repository.
const pluginJson = join(root, ".claude-plugin", "plugin.json");
const marketplaceJson = join(root, ".claude-plugin", "marketplace.json");

if (existsSync(pluginJson)) {
  surfaces.push("claude-code");
  try {
    const plugin = JSON.parse(readFileSync(pluginJson, "utf8"));
    const pv = plugin.version || null;
    if (pv) versions["claude-code:plugin.json"] = pv;

    if (existsSync(marketplaceJson)) {
      const marketplace = JSON.parse(readFileSync(marketplaceJson, "utf8"));
      const mv = marketplace.version || (marketplace.plugins && marketplace.plugins[0] && marketplace.plugins[0].version) || null;
      if (mv) versions["claude-code:marketplace.json"] = mv;
      ok(`Claude Code surface detected (plugin: ${pv || "unset"}, marketplace: ${mv || "unset"})`);
      if (pv && mv && pv !== mv) {
        warn(`Claude Code version mismatch: plugin.json=${pv}, marketplace.json=${mv}`);
      }
    } else {
      ok(`Claude Code surface detected (plugin: ${pv || "unset"}, marketplace.json absent — external marketplace assumed)`);
    }
  } catch (e) {
    warn(`Claude Code config parse error: ${e.message}`);
  }
}

// VS Code / Copilot CLI surface (both use package.json)
const packageJson = join(root, "package.json");
if (existsSync(packageJson)) {
  try {
    const pkg = JSON.parse(readFileSync(packageJson, "utf8"));
    const pv = pkg.version || null;

    if (pv) versions["package.json"] = pv;

    // VS Code surface: check for vscode-specific fields or publisher
    if (pkg.publisher || (pkg.engines && pkg.engines.vscode)) {
      surfaces.push("vscode");
      ok(`VS Code surface detected (version: ${pv || "unset"}, publisher: ${pkg.publisher || "unset"})`);
    } else {
      surfaces.push("vscode");
      ok(`VS Code surface detected via package.json (version: ${pv || "unset"})`);
    }

    // Copilot CLI surface
    surfaces.push("copilot-cli");
    ok(`Copilot CLI surface detected via package.json (version: ${pv || "unset"})`);
  } catch (e) {
    warn(`package.json parse error: ${e.message}`);
  }
}

// Copilot CLI plugin.json (at .github/plugin/plugin.json)
const copilotCliPluginJson = join(root, ".github", "plugin", "plugin.json");
const copilotCliMarketplaceJson = join(root, ".github", "plugin", "marketplace.json");

if (existsSync(copilotCliPluginJson)) {
  try {
    const cliPlugin = JSON.parse(readFileSync(copilotCliPluginJson, "utf8"));
    const cpv = cliPlugin.version || null;
    if (cpv) versions["copilot-cli:plugin.json"] = cpv;

    if (existsSync(copilotCliMarketplaceJson)) {
      const cliMarketplace = JSON.parse(readFileSync(copilotCliMarketplaceJson, "utf8"));
      const cmv = (cliMarketplace.plugins && cliMarketplace.plugins[0] && cliMarketplace.plugins[0].version) || (cliMarketplace.metadata && cliMarketplace.metadata.version) || null;
      if (cmv) versions["copilot-cli:marketplace.json"] = cmv;
      ok(`Copilot CLI plugin.json detected (version: ${cpv || "unset"}, marketplace: ${cmv || "unset"})`);
      if (cpv && cmv && cpv !== cmv) {
        warn(`Copilot CLI version mismatch: plugin.json=${cpv}, marketplace.json=${cmv}`);
      }
    } else {
      ok(`Copilot CLI plugin.json detected (version: ${cpv || "unset"}, marketplace.json absent)`);
    }

    if (!surfaces.includes("copilot-cli")) {
      surfaces.push("copilot-cli");
    }
  } catch (e) {
    warn(`Copilot CLI plugin.json parse error: ${e.message}`);
  }
}

// --- Tool availability ---

const tools = {
  git: !!run("git --version"),
  node: !!run("node --version"),
  gh: !!run("gh --version"),
};

console.log("");
console.log("=== Tool Availability ===");
for (const [tool, available] of Object.entries(tools)) {
  console.log(`${tool}: ${available ? "available" : "NOT FOUND"}`);
}

if (!tools.git) fail("git is required but not found");
if (surfaces.includes("github") && !tools.gh) {
  warn("gh CLI not found — GitHub release creation will not be available");
}

// --- Version consistency ---

const uniqueVersions = [...new Set(Object.values(versions))];

console.log("");
console.log("=== Version Summary ===");
for (const [source, ver] of Object.entries(versions)) {
  console.log(`${source}: ${ver}`);
}

if (uniqueVersions.length > 1) {
  warn(`Version mismatch across surfaces: ${JSON.stringify(versions)}`);
} else if (uniqueVersions.length === 1) {
  ok(`All surfaces at version ${uniqueVersions[0]}`);
} else {
  warn("No versions detected in any surface config");
}

// --- Summary ---

console.log("");
console.log("=== Detected Surfaces ===");
console.log(surfaces.length > 0 ? surfaces.join(", ") : "none");

console.log("");
if (exitCode === 0) {
  console.log("SUCCESS: All pre-flight checks passed");
} else {
  console.log("FAILED: Pre-flight checks had errors — see above");
}

process.exit(exitCode);
