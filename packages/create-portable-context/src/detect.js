import { access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

/**
 * @typedef {Object} RepoDetection
 * @property {string} root
 * @property {string|null} packageManager
 * @property {string[]} languages
 * @property {string[]} frameworks
 * @property {string[]} scriptsHint
 * @property {string[]} existingAgentFiles
 * @property {string[]} existingFiles
 * @property {string|null} projectName
 * @property {Record<string, string>} npmScripts
 * @property {string} layoutHint
 */

/**
 * @param {string} root
 * @returns {Promise<RepoDetection>}
 */
export async function detectRepo(root) {
  const abs = path.resolve(root);
  const entries = await safeReaddir(abs);
  /** @type {(name: string) => boolean} */
  const has = (name) => entries.includes(name);

  const packageManager = detectPackageManager(has);
  const pkg = await readJson(path.join(abs, "package.json"));
  const npmScripts = /** @type {Record<string, string>} */ (pkg?.scripts ?? {});

  const languages = detectLanguages(has, pkg);
  const frameworks = detectFrameworks(has, pkg, entries);
  const scriptsHint = buildScriptsHint(packageManager, npmScripts, has);

  const checkList = [
    "AGENTS.md",
    "CLAUDE.md",
    ".cursorrules",
    "CONTEXT.md",
    "PORTABLE_CONTEXT.md",
    "README.md",
    "docs/handoff/CURRENT.md",
    ".github/copilot-instructions.md",
    ".aider.conf.yml",
    ".gemini/settings.json",
    ".cursor/rules/portable-context.mdc",
    ".agents/skills/session-handoff/SKILL.md",
  ];

  /** @type {string[]} */
  const existingFiles = [];
  for (const rel of checkList) {
    if (await exists(path.join(abs, rel))) existingFiles.push(rel);
  }

  const agentCandidates = [
    "AGENTS.md",
    "CLAUDE.md",
    ".cursorrules",
    "CONTEXT.md",
    "PORTABLE_CONTEXT.md",
    ".github/copilot-instructions.md",
    ".aider.conf.yml",
    ".gemini/settings.json",
  ];
  const existingAgentFiles = agentCandidates.filter((f) => existingFiles.includes(f));

  return {
    root: abs,
    packageManager,
    languages,
    frameworks,
    scriptsHint,
    existingAgentFiles,
    existingFiles,
    projectName: pkg?.name ?? path.basename(abs),
    npmScripts,
    layoutHint: describeLayout(frameworks),
  };
}

/**
 * @param {(name: string) => boolean} has
 * @returns {string|null}
 */
function detectPackageManager(has) {
  if (has("pnpm-lock.yaml") || has("pnpm-workspace.yaml")) return "pnpm";
  if (has("yarn.lock")) return "yarn";
  if (has("bun.lockb") || has("bun.lock")) return "bun";
  if (has("package-lock.json")) return "npm";
  if (has("package.json")) return "npm";
  if (has("Pipfile") || has("poetry.lock") || has("pyproject.toml") || has("requirements.txt")) {
    return "pip";
  }
  if (has("Cargo.toml")) return "cargo";
  if (has("go.mod")) return "go";
  return null;
}

/**
 * @param {(name: string) => boolean} has
 * @param {any} pkg
 */
function detectLanguages(has, pkg) {
  /** @type {string[]} */
  const langs = [];
  if (pkg || has("tsconfig.json") || has("jsconfig.json")) {
    if (has("tsconfig.json") || pkg?.devDependencies?.typescript || pkg?.dependencies?.typescript) {
      langs.push("TypeScript");
    } else {
      langs.push("JavaScript");
    }
  }
  if (has("pyproject.toml") || has("requirements.txt") || has("Pipfile") || has("manage.py")) {
    langs.push("Python");
  }
  if (has("Cargo.toml")) langs.push("Rust");
  if (has("go.mod")) langs.push("Go");
  if (has("composer.json")) langs.push("PHP");
  if (has("Gemfile")) langs.push("Ruby");
  return [...new Set(langs)];
}

/**
 * @param {(name: string) => boolean} has
 * @param {any} pkg
 * @param {string[]} entries
 */
function detectFrameworks(has, pkg, entries) {
  /** @type {string[]} */
  const fw = [];
  const deps = {
    ...(pkg?.dependencies ?? {}),
    ...(pkg?.devDependencies ?? {}),
  };
  if (deps.next) fw.push("Next.js");
  if (deps.react && !deps.next) fw.push("React");
  if (deps.vue) fw.push("Vue");
  if (deps.svelte || deps["@sveltejs/kit"]) fw.push("Svelte");
  if (deps.vite) fw.push("Vite");
  if (deps.express) fw.push("Express");
  if (deps.fastify) fw.push("Fastify");
  if (deps.hono) fw.push("Hono");
  if (deps["@nestjs/core"]) fw.push("NestJS");
  if (has("manage.py")) fw.push("Django");
  if (has("Cargo.toml")) fw.push("Rust crate");
  if (has("go.mod")) fw.push("Go module");
  if (has("pnpm-workspace.yaml") || has("turbo.json") || has("nx.json")) fw.push("Monorepo");
  if (entries.includes("apps") && entries.includes("packages")) fw.push("apps/packages layout");
  return [...new Set(fw)];
}

/**
 * @param {string|null} pm
 * @param {Record<string, string>} scripts
 * @param {(name: string) => boolean} has
 */
function buildScriptsHint(pm, scripts, has) {
  /** @type {string[]} */
  const hints = [];
  /** @param {string} name */
  const run = (name) => {
    if (pm === "pnpm") return `pnpm ${name}`;
    if (pm === "yarn") return `yarn ${name}`;
    if (pm === "bun") return `bun run ${name}`;
    if (pm === "npm") return `npm run ${name}`;
    return name;
  };

  if (pm === "pnpm" || pm === "npm" || pm === "yarn" || pm === "bun") {
    if (scripts.dev) hints.push(run("dev"));
    if (scripts.start && !scripts.dev) hints.push(run("start"));
    if (scripts.build) hints.push(run("build"));
    if (scripts.test) hints.push(run("test"));
    if (scripts.lint) hints.push(run("lint"));
    if (scripts.typecheck) hints.push(run("typecheck"));
    if (!hints.length) hints.push(pm === "pnpm" ? "pnpm install" : `${pm} install`);
  } else if (pm === "cargo") {
    hints.push("cargo build", "cargo test");
  } else if (pm === "go") {
    hints.push("go test ./...", "go build ./...");
  } else if (pm === "pip") {
    if (has("manage.py")) hints.push("python manage.py runserver", "pytest");
    else hints.push("pytest", "python -m compileall .");
  } else {
    hints.push("# add your install / test / run commands here");
  }
  return hints;
}

/**
 * @param {string[]} frameworks
 */
function describeLayout(frameworks) {
  if (frameworks.includes("Monorepo") || frameworks.includes("apps/packages layout")) {
    return "Monorepo — keep nested AGENTS.md in packages when needed.";
  }
  if (frameworks.includes("Next.js")) {
    return "Next.js app — UI + Route Handlers often live together.";
  }
  if (frameworks.includes("Django")) {
    return "Django project — keep app-local conventions in nested AGENTS.md if helpful.";
  }
  return "Single project root — keep portable context at the repository root.";
}

/**
 * @param {string} dir
 */
async function safeReaddir(dir) {
  try {
    return await readdir(dir);
  } catch {
    return [];
  }
}

/**
 * @param {string} file
 */
async function exists(file) {
  try {
    await access(file, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} file
 */
async function readJson(file) {
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
