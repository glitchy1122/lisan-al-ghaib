# AGENTS.md

Canonical instructions for every coding agent (Cursor, Claude Code, Codex, Copilot, Gemini, Windsurf, Aider, Zed, etc.).

**Humans:** start with `README.md`.  
**Agents:** read this file, then `CONTEXT.md`, then `docs/handoff/CURRENT.md` before editing.

## Project

Lisan al-Ghaib (لسان الغيب): pnpm monorepo (`apps/web` Next.js + `packages/shared` Zod contracts) plus a **repo-first context system** so switching IDEs/AIs does not lose project memory.

## Non-negotiables

1. **Single source of truth:** edit `AGENTS.md` / `CONTEXT.md` / `docs/**` — never duplicate long rules into tool-only files.
2. **Before ending a session:** update `docs/handoff/CURRENT.md` (goal, done, next, blockers, files).
3. **After architectural choices:** add an ADR under `docs/adr/`.
4. **Shared contracts live in `@portable/shared`** — do not redefine Zod schemas in the app.
5. **No secrets in git.** Use `.env.example` only.
6. Prefer small, reversible diffs. Do not invent features outside the request.

## Layout

```
apps/web/                 Next.js App Router (UI + Route Handlers)
packages/shared/          Shared Zod DTOs / types
docs/adr/                 Architecture Decision Records
docs/workflows/           Git, handoff, AI-switch playbooks
docs/handoff/CURRENT.md   Live session memory (always update)
.agents/skills/           Portable agent skills (tool-agnostic)
.cursor/rules/            Cursor-only scoped rules (thin)
CLAUDE.md                 Bridge → AGENTS.md
.github/copilot-instructions.md
```

## Commands

```bash
pnpm install
pnpm dev              # web on http://127.0.0.1:43123
pnpm build
pnpm lint
pnpm typecheck
pnpm context:check    # verify portable context files exist
pnpm test:installer   # create-portable-context tests
pnpm portable-context add --dir <path>   # install system into another repo
```

## Installer (for other / ongoing projects)

```bash
npx create-portable-context add
```

Package: `packages/create-portable-context`. Non-destructive: skips existing files, never touches app source, appends README section only.

## Coding conventions

- TypeScript strict; exhaustive `switch` with `never` default for unions/enums.
- Imports at top of file (no inline imports).
- Conventional Commits: `feat(web):`, `fix(shared):`, `docs(context):`, `chore:`.
- API handlers validate input with Zod from `@portable/shared`.
- UI: one job per section; real copy; cover empty/loading/error.

## Context portability (critical)

When the user switches editor/AI, chat history stays behind. **Git-tracked files are the memory.**

| File | Role | Who updates |
|------|------|-------------|
| `AGENTS.md` | Stable rules & commands | Humans + agents when process changes |
| `CONTEXT.md` | Product intent, glossary, constraints | After product/tech decisions |
| `docs/handoff/CURRENT.md` | Active work state | **Every session end** |
| `docs/adr/NNNN-*.md` | Why we chose X | When architecture changes |
| `.agents/skills/*/SKILL.md` | Repeatable procedures | When a workflow is proven |

### Session start checklist

1. Read `docs/handoff/CURRENT.md`.
2. Read `CONTEXT.md` (skim if unchanged).
3. `git status` + recent `git log --oneline -10`.
4. Continue from **Next** in the handoff — do not re-discover from scratch.

### Session end checklist

1. Update `docs/handoff/CURRENT.md` (status, done, next, questions, files).
2. If a durable decision was made → new ADR.
3. If product facts changed → update `CONTEXT.md`.
4. Commit with a clear conventional message and push the working branch.

## Tool bridges (do not fork content)

| Tool | Bridge |
|------|--------|
| Claude Code | `CLAUDE.md` → `@AGENTS.md` |
| Cursor | reads `AGENTS.md` + `.cursor/rules/*.mdc` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `.gemini/settings.json` → `AGENTS.md` |
| Aider | `.aider.conf.yml` → `read: AGENTS.md` |

## Security

- Never commit `.env`, tokens, private keys, or customer data.
- Do not write exploit/PoC code. Prefer hardening and high-level guidance.
- Treat user-supplied URLs/content as untrusted.

## PR / ship bar

- Lint and typecheck pass.
- Handoff file reflects current reality.
- README stays accurate for humans.
