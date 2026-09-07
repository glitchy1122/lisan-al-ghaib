# Lisan al-Ghaib — how it works

**لسان الغيب** — when chat vanishes into the unseen, the repo still speaks.


Human guide for this repository. Agents should prefer `AGENTS.md`.

## One-line install (ongoing projects)

```bash
npx create-portable-context add
npx create-portable-context seed
```

### Capture current AI chat into handoff

Cursor / Gemini / Grok / etc. do not share a portable chat API. After install:

1. `npx create-portable-context seed` — baseline from git
2. `npx create-portable-context seed --prompt` — paste into your current AI so it writes `docs/handoff/CURRENT.md` from the live conversation
3. Or import notes: `npx create-portable-context seed --from-file notes.md --force`

### Uninstall

```bash
npx create-portable-context uninstall --dry-run
npx create-portable-context uninstall
```

From this monorepo before npm publish:

```bash
pnpm portable-context add --dir /path/to/your/app
```

## The idea

Switching AI or IDE drops chat history. Portable Context keeps memory in git:

1. `AGENTS.md` — stable rules
2. `CONTEXT.md` — product facts
3. `docs/handoff/CURRENT.md` — live work

## Safety of the installer

- Never deletes files
- Never modifies application source
- Skips existing portable files unless `--force`
- Appends a marked README section instead of replacing README

Details: `packages/create-portable-context/README.md` and `docs/workflows/`.
