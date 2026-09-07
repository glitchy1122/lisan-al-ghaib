import { readdir, readFile, rmdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  fileExists,
  readManifest,
  removeManifest,
  writeManifest,
} from "./manifest.js";

/**
 * @typedef {Object} UninstallResult
 * @property {string[]} removed
 * @property {string[]} skippedMissing
 * @property {string[]} kept
 * @property {boolean} readmeCleaned
 */

/**
 * Remove only files recorded in the install manifest.
 * Never deletes application source outside the manifest.
 *
 * @param {{
 *   cwd: string,
 *   dryRun?: boolean,
 *   keepAgents?: boolean,
 * }} options
 * @returns {Promise<UninstallResult>}
 */
export async function uninstallPortableContext(options) {
  const { cwd, dryRun = false, keepAgents = false } = options;
  const manifest = await readManifest(cwd);

  /** @type {UninstallResult} */
  const result = {
    removed: [],
    skippedMissing: [],
    kept: [],
    readmeCleaned: false,
  };

  if (!manifest) {
    throw new Error(
      "No .portable-context/manifest.json found. Nothing to uninstall (or kit was installed before manifests existed).",
    );
  }

  const keep = new Set(
    keepAgents
      ? ["AGENTS.md", "CONTEXT.md", "CLAUDE.md", "PORTABLE_CONTEXT.md"]
      : [],
  );

  for (const rel of manifest.files) {
    if (keep.has(rel)) {
      result.kept.push(rel);
      continue;
    }
    const abs = path.join(cwd, rel);
    if (!(await fileExists(abs))) {
      result.skippedMissing.push(rel);
      continue;
    }
    if (dryRun) {
      result.removed.push(rel);
      continue;
    }
    await unlink(abs);
    result.removed.push(rel);
    await removeEmptyParents(cwd, path.dirname(abs));
  }

  if (manifest.readmeSection) {
    result.readmeCleaned = await stripReadmeSection(cwd, dryRun);
  }

  if (!dryRun) {
    if (keepAgents) {
      await writeManifest(cwd, {
        files: [...keep].filter((f) => manifest.files.includes(f)),
        readmeSection: false,
        previous: null,
        projectName: manifest.projectName,
      });
    } else {
      await removeManifest(cwd);
    }
  } else {
    result.removed.push(".portable-context/manifest.json");
  }

  return result;
}

/**
 * @param {string} cwd
 * @param {boolean} dryRun
 */
async function stripReadmeSection(cwd, dryRun) {
  const readmePath = path.join(cwd, "README.md");
  if (!(await fileExists(readmePath))) return false;
  const current = await readFile(readmePath, "utf8");
  const markerStart = "<!-- portable-context:start -->";
  const markerEnd = "<!-- portable-context:end -->";
  if (!current.includes(markerStart) || !current.includes(markerEnd)) return false;

  const next = current
    .replace(
      new RegExp(
        `\n*${escapeRegExp(markerStart)}[\\s\\S]*?${escapeRegExp(markerEnd)}\n*`,
        "m",
      ),
      "\n",
    )
    .trimEnd()
    .concat("\n");

  if (dryRun) return true;
  await writeFile(readmePath, next, "utf8");
  return true;
}

/**
 * @param {string} value
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {string} cwd
 * @param {string} dir
 */
async function removeEmptyParents(cwd, dir) {
  let current = dir;
  const root = path.resolve(cwd);
  while (current.startsWith(root) && current !== root) {
    try {
      const entries = await readdir(current);
      if (entries.length > 0) break;
      await rmdir(current);
      current = path.dirname(current);
    } catch {
      break;
    }
  }
}
