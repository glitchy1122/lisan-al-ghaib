# AGENTS.md

Canonical instructions for every coding agent (Cursor, Claude Code, Codex, Copilot, Gemini, Windsurf, Aider, Zed, etc.).

**Humans:** start with `PORTABLE_CONTEXT.md` and `README.md`.  
**Agents:** read this file, then `CONTEXT.md`, then `docs/handoff/CURRENT.md` before editing.

## Project

{{projectName}} — portable AI/IDE context is installed in this repository so switching tools does not lose project memory.

Detected stack: {{stackLine}}

{{layoutHint}}

## Non-negotiables

1. **Single source of truth:** edit `AGENTS.md` / `CONTEXT.md` / `docs/**` — do not fork long rules into tool-only files.
2. **Before ending a session:** update `docs/handoff/CURRENT.md`.
3. **After architectural choices:** add an ADR under `docs/adr/`.
4. **No secrets in git.**
5. Prefer small, reversible diffs. Do not invent features outside the request.

## Commands

```bash
{{commandsBlock}}
```

## Context portability

Chat history stays inside one tool. **Git-tracked files are the memory.**

| File | Role |
|------|------|
| `AGENTS.md` | Stable rules & commands |
| `CONTEXT.md` | Product intent, glossary, constraints |
| `docs/handoff/CURRENT.md` | Active work state (update every session end) |
| `docs/adr/` | Durable decisions |
| `.agents/skills/` | Repeatable procedures |

### Session start

1. Read `docs/handoff/CURRENT.md`
2. Skim `CONTEXT.md`
3. `git status` + recent log
4. Continue from **Next**

### Session end

1. Update handoff (status, done, next, blockers, files)
2. ADR / CONTEXT if needed
3. Commit + push before switching tools

## Tool bridges

| Tool | Bridge |
|------|--------|
| Claude Code | `CLAUDE.md` → `@AGENTS.md` |
| Cursor | `AGENTS.md` + `.cursor/rules` |
| Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `.gemini/settings.json` |
| Aider | `.aider.conf.yml` |
