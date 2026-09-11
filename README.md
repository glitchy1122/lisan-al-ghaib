# Lisan al-Ghaib

**لسان الغيب** — *the tongue of the unseen*


Portable AI/IDE project context (Lisan al-Ghaib) — install into **any ongoing repo** with one command, without breaking existing code.

## Install into your existing project

```bash
cd your-ongoing-project
npx lisan-al-ghaib add
npx lisan-al-ghaib seed                 # fill handoff from git
npx lisan-al-ghaib seed --prompt        # paste into Cursor/Gemini/Grok
```

That detects your stack, adds portable context files, and can seed handoff from git or your current AI chat.

**Safety:** never deletes app source, skips existing files, only **appends** a marked README section.

```bash
npx lisan-al-ghaib detect
npx lisan-al-ghaib doctor
npx lisan-al-ghaib uninstall --dry-run
npx lisan-al-ghaib uninstall
```

Until the package is published to npm, run from this repo:

```bash
pnpm portable-context add --dir /path/to/your/app
pnpm portable-context seed --dir /path/to/your/app
pnpm portable-context uninstall --dir /path/to/your/app
```

Installer docs: [`packages/create-portable-context/README.md`](./packages/create-portable-context/README.md)

## How it operates (humans)

Chat history does **not** travel between Cursor / Claude / Copilot / etc.  
Git-tracked files are the memory:

| Layer | File | Purpose |
|-------|------|---------|
| Stable rules | `AGENTS.md` | How every agent should operate |
| Product facts | `CONTEXT.md` | Goals, glossary, stack, constraints |
| Live work | `docs/handoff/CURRENT.md` | Done / next / blockers |
| Human guide | `PORTABLE_CONTEXT.md` | How the system works |

**Start:** read handoff → continue from Next  
**Switch tools:** update handoff → commit → push → open same branch → same prompt

```text
Read AGENTS.md, CONTEXT.md, and docs/handoff/CURRENT.md.
Continue from Next. Do not redo Done.
```

## Demo monorepo (optional)

This repository also includes a small full-stack demo:

```bash
pnpm install
pnpm dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

```
apps/web/                          Next.js guide UI + API
packages/shared/                   Zod contracts
packages/create-portable-context/  npx installer CLI
```

## License

[GNU GPL v3](./LICENSE) (or later).
