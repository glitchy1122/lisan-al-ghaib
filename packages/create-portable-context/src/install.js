import { readFileSync } from "node:fs";
import {
  access as accessAsync,
  mkdir as mkdirAsync,
  readFile as readFileAsync,
  writeFile as writeFileAsync,
} from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderTemplate } from "./render.js";
import { writeManifest } from "./manifest.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES = path.join(__dirname, "../templates");

/**
 * @typedef {Object} InstallResult
 * @property {string[]} written
 * @property {string[]} skipped
 * @property {string[]} merged
 */

/**
 * @param {{
 *   cwd: string,
 *   detection: import('./detect.js').RepoDetection,
 *   dryRun?: boolean,
 *   force?: boolean,
 *   withReadmeSection?: boolean,
 *   quiet?: boolean,
 * }} options
 * @returns {Promise<InstallResult>}
 */
export async function installPortableContext(options) {
  const {
    cwd,
    detection,
    dryRun = false,
    force = false,
    withReadmeSection = true,
  } = options;

  /** @type {InstallResult} */
  const result = { written: [], skipped: [], merged: [] };
  const vars = buildVars(detection);
  const plan = buildPlan(vars);

  for (const item of plan) {
    await applyFile({
      cwd,
      rel: item.rel,
      content: item.content,
      dryRun,
      force,
      result,
    });
  }

  if (withReadmeSection) {
    await mergeReadmeSection({ cwd, dryRun, result, vars });
  }

  if (!dryRun && (result.written.length || result.merged.length)) {
    const managed = result.written
      .map((f) => f.replace(" (would overwrite)", ""))
      .filter((f) => f !== "README.md" && f !== "README.md (create stub)");
    if (result.written.includes("README.md") || result.written.includes("README.md (create stub)")) {
      // README stub counts as managed content but uninstall strips section / leaves user README
    }
    await writeManifest(cwd, {
      files: managed,
      readmeSection: result.merged.includes("README.md") || result.written.includes("README.md"),
      projectName: detection.projectName ?? undefined,
    });
  }

  return result;
}

/**
 * @param {import('./detect.js').RepoDetection} detection
 */
function buildVars(detection) {
  const pm = detection.packageManager ?? "your package manager";
  const commandsBlock = detection.scriptsHint.join("\n");
  const stackLine = [
    detection.languages.join(" / ") || "unknown language",
    detection.frameworks.join(", ") || "no framework detected",
    `package manager: ${pm}`,
  ].join(" · ");

  return {
    projectName: detection.projectName ?? "this project",
    stackLine,
    commandsBlock,
    layoutHint: detection.layoutHint,
    packageManager: pm,
    frameworks: detection.frameworks.join(", ") || "n/a",
    languages: detection.languages.join(", ") || "n/a",
    date: new Date().toISOString().slice(0, 10),
  };
}

/**
 * @param {Record<string, string>} vars
 */
function buildPlan(vars) {
  return [
    { rel: "AGENTS.md", content: renderTemplate(load("AGENTS.md"), vars) },
    { rel: "CONTEXT.md", content: renderTemplate(load("CONTEXT.md"), vars) },
    { rel: "CLAUDE.md", content: load("CLAUDE.md") },
    {
      rel: "PORTABLE_CONTEXT.md",
      content: renderTemplate(load("PORTABLE_CONTEXT.md"), vars),
    },
    {
      rel: "docs/handoff/CURRENT.md",
      content: renderTemplate(load("handoff/CURRENT.md"), vars),
    },
    { rel: "docs/workflows/README.md", content: load("workflows/README.md") },
    {
      rel: "docs/workflows/ai-ide-switch.md",
      content: load("workflows/ai-ide-switch.md"),
    },
    { rel: "docs/workflows/session.md", content: load("workflows/session.md") },
    { rel: "docs/workflows/git.md", content: load("workflows/git.md") },
    { rel: "docs/adr/README.md", content: load("adr/README.md") },
    {
      rel: "docs/adr/0001-portable-context.md",
      content: renderTemplate(load("adr/0001-portable-context.md"), vars),
    },
    { rel: ".agents/skills/README.md", content: load("skills/README.md") },
    {
      rel: ".agents/skills/session-handoff/SKILL.md",
      content: load("skills/session-handoff/SKILL.md"),
    },
    {
      rel: ".agents/skills/update-context/SKILL.md",
      content: load("skills/update-context/SKILL.md"),
    },
    {
      rel: ".agents/skills/write-adr/SKILL.md",
      content: load("skills/write-adr/SKILL.md"),
    },
    {
      rel: ".agents/skills/git-workflow/SKILL.md",
      content: load("skills/git-workflow/SKILL.md"),
    },
    {
      rel: ".agents/skills/seed-handoff-from-chat/SKILL.md",
      content: load("skills/seed-handoff-from-chat/SKILL.md"),
    },
    {
      rel: ".cursor/rules/portable-context.mdc",
      content: load("cursor-rules/portable-context.mdc"),
    },
    {
      rel: ".github/copilot-instructions.md",
      content: load("github/copilot-instructions.md"),
    },
    {
      rel: ".github/instructions/portable.instructions.md",
      content: load("github/portable.instructions.md"),
    },
    { rel: ".aider.conf.yml", content: load("aider.conf.yml") },
    { rel: ".gemini/settings.json", content: load("gemini.settings.json") },
  ];
}

/**
 * @param {string} rel
 */
function load(rel) {
  return readFileSync(path.join(TEMPLATES, rel), "utf8");
}

/**
 * @param {{
 *   cwd: string,
 *   rel: string,
 *   content: string,
 *   dryRun: boolean,
 *   force: boolean,
 *   result: InstallResult,
 * }} args
 */
async function applyFile(args) {
  const { cwd, rel, content, dryRun, force, result } = args;
  const target = path.join(cwd, rel);
  const already = await fileExists(target);

  if (already && !force) {
    result.skipped.push(rel);
    return;
  }

  if (dryRun) {
    result.written.push(already ? `${rel} (would overwrite)` : rel);
    return;
  }

  await mkdirAsync(path.dirname(target), { recursive: true });
  await writeFileAsync(target, content, "utf8");
  result.written.push(rel);
}

/**
 * @param {{
 *   cwd: string,
 *   dryRun: boolean,
 *   result: InstallResult,
 *   vars: Record<string, string>
 * }} args
 */
async function mergeReadmeSection(args) {
  const { cwd, dryRun, result, vars } = args;
  const readmePath = path.join(cwd, "README.md");
  const markerStart = "<!-- portable-context:start -->";
  const markerEnd = "<!-- portable-context:end -->";
  const section = renderTemplate(load("readme-section.md"), vars);

  if (!(await fileExists(readmePath))) {
    const stub = `# ${vars.projectName}\n\n${section}\n`;
    if (dryRun) {
      result.written.push("README.md (create stub)");
      return;
    }
    await writeFileAsync(readmePath, stub, "utf8");
    result.written.push("README.md");
    return;
  }

  const current = await readFileAsync(readmePath, "utf8");
  if (current.includes(markerStart) && current.includes(markerEnd)) {
    result.skipped.push("README.md (portable section already present)");
    return;
  }

  const next = `${current.trimEnd()}\n\n${markerStart}\n${section.trim()}\n${markerEnd}\n`;
  if (dryRun) {
    result.merged.push("README.md (append portable section)");
    return;
  }
  await writeFileAsync(readmePath, next, "utf8");
  result.merged.push("README.md");
}

/**
 * @param {string} file
 */
async function fileExists(file) {
  try {
    await accessAsync(file, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
