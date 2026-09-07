# How Portable Context works

Installed into **{{projectName}}** on {{date}}.

This is the human guide. Agents should prefer `AGENTS.md`.

## Why this exists

When you switch Cursor → Claude Code → Copilot → VS Code, **chat history does not travel**.  
Portable Context keeps memory in the repo:

1. **AGENTS.md** — stable rules for every AI
2. **CONTEXT.md** — what the product is
3. **docs/handoff/CURRENT.md** — what is in flight right now

## Install / reinstall

```bash
npx create-portable-context add
npx create-portable-context seed
npx create-portable-context seed --prompt
npx create-portable-context detect
npx create-portable-context doctor
npx create-portable-context uninstall
```

Flags:

- `--dry-run` — preview only
- `--force` — overwrite existing portable files / handoff
- `--from-file` / `--from-stdin` — import chat notes into handoff
- `--keep-agents` — uninstall but keep AGENTS/CONTEXT guides
- `--no-readme-section` — do not touch README.md
- `--dir ./path` — install into another folder

## Fill handoff from AI chat

Tools like Cursor, Gemini, and Grok keep chat history inside their product. Portable Context bridges that gap:

1. Run `seed` for a git baseline
2. Run `seed --prompt` and paste into the AI you’re already using
3. That AI writes `docs/handoff/CURRENT.md` from the live conversation

## Uninstall

```bash
npx create-portable-context uninstall --dry-run
npx create-portable-context uninstall
```

Only removes files listed in `.portable-context/manifest.json` and the marked README section.

## Daily loop

**Start a session**

```text
Read AGENTS.md, CONTEXT.md, and docs/handoff/CURRENT.md.
Continue from Next. Do not redo Done.
```

**End or switch tools**

1. Update `docs/handoff/CURRENT.md`
2. Commit + push
3. Open the same branch in the next IDE/AI

## Safety promises

- Does not delete files
- Does not modify application source
- Skips existing portable files unless `--force`
- Appends a marked section to README.md instead of replacing it
- Uninstall only removes manifest-tracked kit files

## Detected for this repo

- Stack: {{stackLine}}
- Layout: {{layoutHint}}

## Where to customize

| File | Edit when |
|------|-----------|
| `CONTEXT.md` | Product goals/glossary change |
| `AGENTS.md` | Commands/conventions change |
| `docs/handoff/CURRENT.md` | Every working session |
| `docs/adr/` | Lasting technical decisions |

More detail: `docs/workflows/`.
