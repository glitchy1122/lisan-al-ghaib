#!/usr/bin/env node
/**
 * Verifies portable context files exist so any agent can resume work.
 */
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "AGENTS.md",
  "CLAUDE.md",
  "CONTEXT.md",
  "docs/handoff/CURRENT.md",
  "docs/workflows/ai-ide-switch.md",
  "docs/workflows/git.md",
  "docs/workflows/session.md",
  ".agents/skills/session-handoff/SKILL.md",
  ".github/copilot-instructions.md",
  "apps/web/package.json",
  "packages/shared/package.json",
];

const missing = [];
for (const rel of required) {
  try {
    await access(path.join(root, rel), constants.R_OK);
  } catch {
    missing.push(rel);
  }
}

if (missing.length) {
  console.error("context:check failed — missing:");
  for (const m of missing) console.error(`  - ${m}`);
  process.exit(1);
}

console.log(`context:check ok — ${required.length} portable context files present`);
