import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, mkdir, readFile, rm, access } from "node:fs/promises";
import { constants } from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { detectRepo } from "./detect.js";
import { installPortableContext } from "./install.js";
import { uninstallPortableContext } from "./uninstall.js";
import { seedHandoff } from "./seed.js";
import { readManifest } from "./manifest.js";
import { renderTemplate } from "./render.js";

const execFileAsync = promisify(execFile);

test("renderTemplate replaces vars", () => {
  assert.equal(renderTemplate("Hi {{name}}", { name: "Ada" }), "Hi Ada");
});

test("detects Next.js + pnpm workspace signals", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "pc-detect-"));
  try {
    await writeFile(
      path.join(dir, "package.json"),
      JSON.stringify({
        name: "demo-app",
        scripts: { dev: "next dev", build: "next build", lint: "eslint ." },
        dependencies: { next: "15.0.0", react: "19.0.0" },
        devDependencies: { typescript: "5.0.0" },
      }),
    );
    await writeFile(path.join(dir, "pnpm-lock.yaml"), "");
    await writeFile(path.join(dir, "tsconfig.json"), "{}");
    const d = await detectRepo(dir);
    assert.equal(d.packageManager, "pnpm");
    assert.ok(d.frameworks.includes("Next.js"));
    assert.ok(d.languages.includes("TypeScript"));
    assert.ok(d.scriptsHint.some((s) => s.includes("dev")));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("install is non-destructive and skips existing AGENTS.md", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "pc-install-"));
  try {
    await writeFile(
      path.join(dir, "package.json"),
      JSON.stringify({ name: "ongoing", scripts: { test: "node -v" } }),
    );
    await writeFile(path.join(dir, "README.md"), "# Ongoing app\n\nKeep me.\n");
    await writeFile(path.join(dir, "AGENTS.md"), "# existing agents keep me\n");
    await writeFile(path.join(dir, "app.js"), "console.log('do not touch')\n");

    const detection = await detectRepo(dir);
    const first = await installPortableContext({
      cwd: dir,
      detection,
      dryRun: false,
      force: false,
      withReadmeSection: true,
    });

    assert.ok(first.skipped.includes("AGENTS.md"));
    assert.ok(first.written.includes("PORTABLE_CONTEXT.md"));
    assert.ok(first.merged.includes("README.md"));

    const manifest = await readManifest(dir);
    assert.ok(manifest);
    assert.ok(manifest.files.includes("PORTABLE_CONTEXT.md"));
    assert.equal(manifest.readmeSection, true);
    assert.ok(!manifest.files.includes("AGENTS.md")); // skipped pre-existing

    const readme = await readFile(path.join(dir, "README.md"), "utf8");
    assert.match(readme, /Ongoing app/);
    assert.match(readme, /portable-context:start/);

    const app = await readFile(path.join(dir, "app.js"), "utf8");
    assert.equal(app, "console.log('do not touch')\n");

    const agents = await readFile(path.join(dir, "AGENTS.md"), "utf8");
    assert.match(agents, /existing agents keep me/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("uninstall removes only manifest files and strips README section", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "pc-un-"));
  try {
    await writeFile(
      path.join(dir, "package.json"),
      JSON.stringify({ name: "removable" }),
    );
    await writeFile(path.join(dir, "README.md"), "# App\n\nBody.\n");
    await writeFile(path.join(dir, "src.js"), "keep()\n");

    await installPortableContext({
      cwd: dir,
      detection: await detectRepo(dir),
      dryRun: false,
      force: false,
      withReadmeSection: true,
    });

    const result = await uninstallPortableContext({ cwd: dir, dryRun: false });
    assert.ok(result.removed.includes("PORTABLE_CONTEXT.md"));
    assert.ok(result.readmeCleaned);

    await assert.rejects(access(path.join(dir, "PORTABLE_CONTEXT.md"), constants.F_OK));
    await assert.rejects(access(path.join(dir, ".portable-context/manifest.json"), constants.F_OK));

    const readme = await readFile(path.join(dir, "README.md"), "utf8");
    assert.match(readme, /# App/);
    assert.doesNotMatch(readme, /portable-context:start/);

    const src = await readFile(path.join(dir, "src.js"), "utf8");
    assert.equal(src, "keep()\n");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("seed from stdin imports chat notes into handoff", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "pc-seed-"));
  try {
    await writeFile(path.join(dir, "package.json"), JSON.stringify({ name: "seeded" }));
    await mkdir(path.join(dir, "docs/handoff"), { recursive: true });
    await writeFile(
      path.join(dir, "docs/handoff/CURRENT.md"),
      "# Current session handoff\n\nInstalled portable context stub by create-portable-context\n",
    );

    const detection = await detectRepo(dir);
    // simulate --from-file
    const notes = path.join(dir, "chat-notes.md");
    await writeFile(
      notes,
      "We decided to ship billing next.\nBlocked on Stripe keys.\nTouched apps/web/billing.ts\n",
    );
    const result = await seedHandoff({
      cwd: dir,
      detection,
      fromFile: notes,
      force: true,
    });
    assert.equal(result.mode, "file");
    const handoff = await readFile(path.join(dir, "docs/handoff/CURRENT.md"), "utf8");
    assert.match(handoff, /billing next/);
    assert.match(handoff, /Imported context/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("seed --prompt returns capture prompt", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "pc-prompt-"));
  try {
    await writeFile(path.join(dir, "package.json"), JSON.stringify({ name: "p" }));
    const result = await seedHandoff({
      cwd: dir,
      detection: await detectRepo(dir),
      promptOnly: true,
    });
    assert.equal(result.mode, "prompt");
    assert.match(result.prompt ?? "", /docs\/handoff\/CURRENT\.md/);
    assert.match(result.prompt ?? "", /Cursor, Gemini, Grok/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("dry-run writes nothing", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "pc-dry-"));
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "package.json"), JSON.stringify({ name: "x" }));
    const detection = await detectRepo(dir);
    const result = await installPortableContext({
      cwd: dir,
      detection,
      dryRun: true,
      force: false,
      withReadmeSection: true,
    });
    assert.ok(result.written.length > 0);
    await assert.rejects(readFile(path.join(dir, "AGENTS.md")));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("repo seed uses git when available", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "pc-git-"));
  try {
    await execFileAsync("git", ["init"], { cwd: dir });
    await execFileAsync("git", ["config", "user.email", "test@example.com"], { cwd: dir });
    await execFileAsync("git", ["config", "user.name", "Test"], { cwd: dir });
    await writeFile(path.join(dir, "package.json"), JSON.stringify({ name: "gitted", scripts: { test: "node -v" } }));
    await execFileAsync("git", ["add", "."], { cwd: dir });
    await execFileAsync("git", ["commit", "-m", "chore: initial"], { cwd: dir });
    await mkdir(path.join(dir, "docs/handoff"), { recursive: true });
    await writeFile(
      path.join(dir, "docs/handoff/CURRENT.md"),
      "create-portable-context stub\n",
    );

    const result = await seedHandoff({
      cwd: dir,
      detection: await detectRepo(dir),
      force: false,
    });
    assert.equal(result.mode, "repo");
    const handoff = await readFile(path.join(dir, "docs/handoff/CURRENT.md"), "utf8");
    assert.match(handoff, /chore: initial|Seeded from repository/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
