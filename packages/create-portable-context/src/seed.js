import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { stdin as stdinStream } from "node:process";

const execFileAsync = promisify(execFile);

/**
 * @typedef {Object} SeedResult
 * @property {string} mode
 * @property {string} handoffPath
 * @property {boolean} wrote
 * @property {string} [prompt]
 */

/**
 * Seed docs/handoff/CURRENT.md from git/repo signals and/or pasted AI chat context.
 *
 * Chat tools (Cursor/Gemini/Grok) do not expose a portable API for history.
 * Practical paths:
 * 1. repo seed (git status/log) — always available
 * 2. --prompt — print a capture prompt for the current AI
 * 3. --from-file / --from-stdin — apply chat export or AI-written handoff
 *
 * @param {{
 *   cwd: string,
 *   detection: import('./detect.js').RepoDetection,
 *   dryRun?: boolean,
 *   force?: boolean,
 *   promptOnly?: boolean,
 *   fromFile?: string,
 *   fromStdin?: boolean,
 * }} options
 * @returns {Promise<SeedResult>}
 */
export async function seedHandoff(options) {
  const {
    cwd,
    detection,
    dryRun = false,
    force = false,
    promptOnly = false,
    fromFile,
    fromStdin = false,
  } = options;

  const handoffPath = path.join(cwd, "docs/handoff/CURRENT.md");

  if (promptOnly) {
    return {
      mode: "prompt",
      handoffPath,
      wrote: false,
      prompt: buildAiCapturePrompt(detection),
    };
  }

  let content;
  let mode = "repo";

  if (fromStdin) {
    const pasted = await readStdin();
    content = normalizeHandoffMarkdown(pasted, detection);
    mode = "stdin";
  } else if (fromFile) {
    const pasted = await readFile(path.resolve(cwd, fromFile), "utf8");
    content = normalizeHandoffMarkdown(pasted, detection);
    mode = "file";
  } else {
    const signals = await collectRepoSignals(cwd, detection);
    content = renderHandoffFromSignals(detection, signals);
    mode = "repo";
  }

  const exists = await fileExists(handoffPath);
  if (exists && !force) {
    // allow seed when handoff is still the installer stub
    const current = await readFile(handoffPath, "utf8");
    const isStub =
      current.includes("create-portable-context") ||
      current.includes("<!-- one sentence -->") ||
      current.includes("Installed portable context");
    if (!isStub) {
      throw new Error(
        "docs/handoff/CURRENT.md already has content. Re-run with --force to overwrite.",
      );
    }
  }

  if (!dryRun) {
    await writeFile(handoffPath, content, "utf8");
  }

  return { mode, handoffPath, wrote: !dryRun };
}

/**
 * @param {import('./detect.js').RepoDetection} detection
 */
export function buildAiCapturePrompt(detection) {
  return `You are helping migrate THIS chat's project context into Portable Context files in the repo
(Cursor, Gemini, Grok, Claude Code, Copilot, Codex, or any other coding AI).

Project: ${detection.projectName}
Detected stack: ${detection.languages.join(", ") || "unknown"} / ${detection.frameworks.join(", ") || "n/a"}

Task:
1. From our conversation so far (goals, decisions, blockers, files touched, next steps), write a complete \`docs/handoff/CURRENT.md\`.
2. If you can edit the repo, write the file directly.
3. If you cannot edit files, output ONLY the markdown for CURRENT.md inside a single fenced block so I can run:
   npx create-portable-context seed --from-stdin --force

Required sections in CURRENT.md:
- Meta table with Status, Goal, Updated (ISO date), Updated by (your tool name)
- Done (checkboxes)
- Next (checkboxes)
- Blockers / open questions
- Files touched
- Commands to run
- Notes for the next agent

Rules:
- Be factual; do not invent completed work
- No secrets
- Prefer short actionable bullets
- Status must be one of: in_progress | blocked | ready_for_review | done

Also: if CONTEXT.md still has installer placeholders, update Goals / What this product is from this conversation — without deleting unrelated content.`;
}

/**
 * @param {string} cwd
 * @param {import('./detect.js').RepoDetection} detection
 */
async function collectRepoSignals(cwd, detection) {
  const log = await git(cwd, ["log", "--oneline", "-12"]);
  const status = await git(cwd, ["status", "--short"]);
  const branch = await git(cwd, ["branch", "--show-current"]);
  const commits = log
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const dirty = status
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  /** @type {string[]} */
  const localAiHints = [];
  for (const rel of [
    "AGENTS.md",
    "CLAUDE.md",
    ".cursorrules",
    "CONTEXT.md",
    ".github/copilot-instructions.md",
  ]) {
    if (await fileExists(path.join(cwd, rel))) localAiHints.push(rel);
  }

  return {
    branch: branch.trim() || "unknown",
    commits,
    dirty,
    localAiHints,
    scripts: detection.scriptsHint,
  };
}

/**
 * @param {import('./detect.js').RepoDetection} detection
 * @param {{
 *   branch: string,
 *   commits: string[],
 *   dirty: string[],
 *   localAiHints: string[],
 *   scripts: string[],
 * }} signals
 */
function renderHandoffFromSignals(detection, signals) {
  const date = new Date().toISOString().slice(0, 10);
  const done = signals.commits.slice(0, 8).map((c) => `- [x] ${c}`);
  const nextFromDirty = signals.dirty.slice(0, 8).map((d) => `- [ ] Review/commit: \`${d}\``);
  const next = nextFromDirty.length
    ? nextFromDirty
    : [
        "- [ ] Customize `CONTEXT.md` for the real product",
        "- [ ] Continue feature work from recent commits",
        "- [ ] Ask your current AI to refine this handoff from chat (`npx create-portable-context seed --prompt`)",
      ];

  const files = [
    ...signals.dirty.map((d) => d.replace(/^..\s+/, "")),
    ...signals.localAiHints,
  ];
  const uniqueFiles = [...new Set(files)].slice(0, 20);

  return `# Current session handoff

> Seeded from repository signals (git + detected stack).
> Refine with chat context: \`npx create-portable-context seed --prompt\`

## Meta

| Field | Value |
|-------|-------|
| Status | \`${signals.dirty.length ? "in_progress" : "ready_for_review"}\` |
| Goal | Continue ${detection.projectName} on branch \`${signals.branch}\` |
| Updated | ${date} |
| Updated by | create-portable-context seed (repo) |

## Done

${done.length ? done.join("\n") : "- [ ] No recent commits detected"}

## Next

${next.join("\n")}

## Blockers / open questions

- None detected from git. Add blockers from your AI chat if any.

## Files touched

${uniqueFiles.length ? uniqueFiles.map((f) => `- \`${f}\``).join("\n") : "- (clean working tree)"}

## Commands to run

\`\`\`bash
${signals.scripts.join("\n") || "# add commands"}
\`\`\`

## Notes for the next agent

Seeded automatically from git history/status and detected stack (${detection.languages.join(", ") || "unknown"} / ${detection.frameworks.join(", ") || "n/a"}).
If the user was mid-conversation in Cursor/Gemini/Grok/etc., run or ask for \`seed --prompt\` and overwrite with chat-aware handoff.
`;
}

/**
 * @param {string} pasted
 * @param {import('./detect.js').RepoDetection} detection
 */
function normalizeHandoffMarkdown(pasted, detection) {
  const trimmed = pasted.trim();
  const fenced = trimmed.match(/```(?:markdown|md)?\n([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : trimmed).trim();
  if (/^#\s+Current session handoff/i.test(body) || /^##\s+Meta/m.test(body)) {
    return body.endsWith("\n") ? body : `${body}\n`;
  }
  const date = new Date().toISOString().slice(0, 10);
  return `# Current session handoff

## Meta

| Field | Value |
|-------|-------|
| Status | \`in_progress\` |
| Goal | ${firstLine(body) || `Continue ${detection.projectName}`} |
| Updated | ${date} |
| Updated by | create-portable-context seed (imported chat/notes) |

## Done

- [ ] Reviewed imported context

## Next

- [ ] Continue from imported notes below

## Blockers / open questions

- See imported notes

## Files touched

- (not specified in import)

## Commands to run

\`\`\`bash
${detection.scriptsHint.join("\n")}
\`\`\`

## Notes for the next agent

### Imported context

${body}
`;
}

/**
 * @param {string} text
 */
function firstLine(text) {
  return text.split("\n").map((l) => l.trim()).find((l) => l && !l.startsWith("#")) ?? "";
}

/**
 * @param {string} cwd
 * @param {string[]} args
 */
async function git(cwd, args) {
  try {
    const { stdout } = await execFileAsync("git", args, { cwd, maxBuffer: 1024 * 1024 });
    return stdout;
  } catch {
    return "";
  }
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of stdinStream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * @param {string} file
 */
async function fileExists(file) {
  try {
    await access(file, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
