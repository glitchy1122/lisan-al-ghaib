import pathMod from "node:path";
import { detectRepo } from "./detect.js";
import { installPortableContext } from "./install.js";
import { uninstallPortableContext } from "./uninstall.js";
import { seedHandoff } from "./seed.js";
import { printHelp } from "./help.js";
import { readManifest } from "./manifest.js";

/**
 * @param {string[]} argv
 */
export async function runCli(argv) {
  const args = parseArgs(argv);

  if (args.help) {
    printHelp();
    return;
  }

  const cwd = pathMod.resolve(args.dir);

  if (args.command === "detect") {
    const detection = await detectRepo(cwd);
    console.log(JSON.stringify(detection, null, 2));
    return;
  }

  if (args.command === "doctor") {
    const detection = await detectRepo(cwd);
    await printDoctor(detection);
    return;
  }

  if (["init", "add", "install"].includes(args.command)) {
    const detection = await detectRepo(cwd);
    if (!args.quiet) printDetectionSummary(detection);
    const result = await installPortableContext({
      cwd,
      detection,
      dryRun: args.dryRun,
      force: args.force,
      withReadmeSection: !args.noReadmeSection,
      quiet: args.quiet,
    });
    printInstallResult(result, args.dryRun);
    if (!args.dryRun && (result.written.length || result.merged.length)) {
      console.log("\nFill handoff without typing it all:");
      console.log("  npx create-portable-context seed");
      console.log("  npx create-portable-context seed --prompt   # paste into Cursor/Gemini/Grok");
    }
    return;
  }

  if (args.command === "seed") {
    const detection = await detectRepo(cwd);
    const result = await seedHandoff({
      cwd,
      detection,
      dryRun: args.dryRun,
      force: args.force,
      promptOnly: args.prompt,
      fromFile: args.fromFile,
      fromStdin: args.fromStdin,
    });
    if (result.prompt) {
      console.log(result.prompt);
      return;
    }
    console.log(
      `${args.dryRun ? "Dry run" : "Seeded"} handoff via ${result.mode}: ${pathMod.relative(cwd, result.handoffPath) || "docs/handoff/CURRENT.md"}`,
    );
    if (result.mode === "repo" && !args.quiet) {
      console.log("Tip: for chat-aware fill, run: npx create-portable-context seed --prompt");
    }
    return;
  }

  if (args.command === "uninstall" || args.command === "remove") {
    const result = await uninstallPortableContext({
      cwd,
      dryRun: args.dryRun,
      keepAgents: args.keepAgents,
    });
    printUninstallResult(result, args.dryRun);
    return;
  }

  console.error(`Unknown command: ${args.command}`);
  printHelp();
  process.exitCode = 1;
}

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {{
   *  command: string,
   *  dir: string,
   *  dryRun: boolean,
   *  force: boolean,
   *  noReadmeSection: boolean,
   *  quiet: boolean,
   *  help: boolean,
   *  prompt: boolean,
   *  fromFile?: string,
   *  fromStdin: boolean,
   *  keepAgents: boolean,
   * }} */
  const out = {
    command: "add",
    dir: process.cwd(),
    dryRun: false,
    force: false,
    noReadmeSection: false,
    quiet: false,
    help: false,
    prompt: false,
    fromStdin: false,
    keepAgents: false,
  };

  /** @type {string[]} */
  const positionals = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--dry-run":
        out.dryRun = true;
        break;
      case "--force":
        out.force = true;
        break;
      case "--no-readme-section":
        out.noReadmeSection = true;
        break;
      case "--quiet":
      case "-q":
        out.quiet = true;
        break;
      case "--help":
      case "-h":
        out.help = true;
        break;
      case "--prompt":
        out.prompt = true;
        break;
      case "--from-stdin":
        out.fromStdin = true;
        break;
      case "--keep-agents":
        out.keepAgents = true;
        break;
      case "--from-file": {
        const next = argv[i + 1];
        if (!next) throw new Error(`${arg} requires a path`);
        out.fromFile = next;
        i += 1;
        break;
      }
      case "--dir":
      case "-C": {
        const next = argv[i + 1];
        if (!next) throw new Error(`${arg} requires a path`);
        out.dir = next;
        i += 1;
        break;
      }
      default:
        if (arg.startsWith("-")) {
          throw new Error(`Unknown flag: ${arg}`);
        }
        positionals.push(arg);
        break;
    }
  }

  const commands = [
    "init",
    "add",
    "install",
    "detect",
    "doctor",
    "help",
    "seed",
    "uninstall",
    "remove",
  ];

  if (positionals[0]) {
    const first = positionals[0];
    if (commands.includes(first)) {
      out.command = first === "help" ? "help" : first;
      if (first === "help") out.help = true;
      if (positionals[1]) out.dir = positionals[1];
    } else {
      out.command = "add";
      out.dir = first;
    }
  }

  return out;
}

/**
 * @param {import('./detect.js').RepoDetection} detection
 */
function printDetectionSummary(detection) {
  console.log(`\nPortable Context — detecting ${detection.root}`);
  console.log(`  package manager : ${detection.packageManager ?? "none detected"}`);
  console.log(`  languages       : ${detection.languages.join(", ") || "unknown"}`);
  console.log(`  frameworks      : ${detection.frameworks.join(", ") || "none"}`);
  console.log(`  scripts         : ${detection.scriptsHint.join(", ") || "n/a"}`);
  if (detection.existingAgentFiles.length) {
    console.log(`  existing agent  : ${detection.existingAgentFiles.join(", ")}`);
  }
  console.log("");
}

/**
 * @param {import('./detect.js').RepoDetection} detection
 */
async function printDoctor(detection) {
  printDetectionSummary(detection);
  const required = [
    "AGENTS.md",
    "CONTEXT.md",
    "docs/handoff/CURRENT.md",
    "PORTABLE_CONTEXT.md",
  ];
  console.log("Doctor checks:");
  for (const file of required) {
    const present = detection.existingFiles.includes(file);
    console.log(`  ${present ? "✓" : "✗"} ${file}`);
  }
  const manifest = await readManifest(detection.root);
  console.log(`  ${manifest ? "✓" : "✗"} .portable-context/manifest.json`);
  const missing = required.filter((f) => !detection.existingFiles.includes(f));
  if (missing.length || !manifest) {
    console.log(`\nRun: npx create-portable-context add`);
    process.exitCode = 1;
  } else {
    console.log("\nPortable context looks installed.");
    console.log("Seed handoff: npx create-portable-context seed");
    console.log("Uninstall:    npx create-portable-context uninstall");
  }
}

/**
 * @param {import('./install.js').InstallResult} result
 * @param {boolean} dryRun
 */
function printInstallResult(result, dryRun) {
  const label = dryRun ? "Dry run" : "Install";
  console.log(`${label} summary`);
  for (const item of result.written) console.log(`  + ${item}`);
  for (const item of result.skipped) console.log(`  = skip (exists) ${item}`);
  for (const item of result.merged) console.log(`  ~ merged ${item}`);
  if (!result.written.length && !result.merged.length) {
    console.log("  (nothing new — already installed, or use --force)");
  }
  if (!dryRun && (result.written.length || result.merged.length)) {
    console.log("\nNext:");
    console.log("  1. npx create-portable-context seed");
    console.log("  2. (optional) seed --prompt in your current AI chat");
    console.log("  3. Read PORTABLE_CONTEXT.md");
    console.log("  4. Commit");
  }
}

/**
 * @param {import('./uninstall.js').UninstallResult} result
 * @param {boolean} dryRun
 */
function printUninstallResult(result, dryRun) {
  console.log(`${dryRun ? "Dry-run uninstall" : "Uninstall"} summary`);
  for (const item of result.removed) console.log(`  - ${item}`);
  for (const item of result.kept) console.log(`  = kept ${item}`);
  for (const item of result.skippedMissing) console.log(`  ? missing ${item}`);
  if (result.readmeCleaned) {
    console.log("  ~ removed portable section from README.md");
  }
  if (!result.removed.length && !result.readmeCleaned) {
    console.log("  (nothing removed)");
  }
}
