import {
  access,
  mkdir,
  readFile,
  writeFile,
  rm,
} from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

export const MANIFEST_DIR = ".portable-context";
export const MANIFEST_FILE = path.join(MANIFEST_DIR, "manifest.json");

/**
 * @typedef {Object} PortableManifest
 * @property {1} version
 * @property {string} installedAt
 * @property {string} updatedAt
 * @property {string[]} files
 * @property {boolean} readmeSection
 * @property {string} [projectName]
 */

/**
 * @param {string} cwd
 */
export function manifestPath(cwd) {
  return path.join(cwd, MANIFEST_FILE);
}

/**
 * @param {string} cwd
 * @returns {Promise<PortableManifest|null>}
 */
export async function readManifest(cwd) {
  try {
    const raw = await readFile(manifestPath(cwd), "utf8");
    return /** @type {PortableManifest} */ (JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * @param {string} cwd
 * @param {{
 *   files: string[],
 *   readmeSection: boolean,
 *   projectName?: string,
 *   previous?: PortableManifest|null,
 * }} input
 */
export async function writeManifest(cwd, input) {
  const now = new Date().toISOString();
  const previous = input.previous ?? (await readManifest(cwd));
  const files = [...new Set([...(previous?.files ?? []), ...input.files])].sort();
  /** @type {PortableManifest} */
  const manifest = {
    version: 1,
    installedAt: previous?.installedAt ?? now,
    updatedAt: now,
    files,
    readmeSection: Boolean(previous?.readmeSection || input.readmeSection),
    projectName: input.projectName ?? previous?.projectName,
  };
  await mkdir(path.join(cwd, MANIFEST_DIR), { recursive: true });
  await writeFile(manifestPath(cwd), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

/**
 * @param {string} cwd
 */
export async function removeManifest(cwd) {
  await rm(path.join(cwd, MANIFEST_DIR), { recursive: true, force: true });
}

/**
 * @param {string} file
 */
export async function fileExists(file) {
  try {
    await access(file, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
