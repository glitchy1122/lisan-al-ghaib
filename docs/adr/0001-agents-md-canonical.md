# 0001 — Adopt AGENTS.md as canonical agent instructions

- Status: Accepted
- Date: 2026-09-07
- Deciders: project maintainers

## Context

Developers switch between Cursor, Claude Code, Copilot, Codex, and other tools. Each tool historically wanted its own instruction file, which drifts and loses context.

## Decision

Use **AGENTS.md** (Agentic AI Foundation / Linux Foundation stewardship) as the single source of truth. Tool-specific files are thin bridges only:

- `CLAUDE.md` → `@AGENTS.md`
- `.github/copilot-instructions.md` → points to AGENTS.md
- `.cursor/rules/*.mdc` → Cursor-scoped extras only
- `.gemini/settings.json` / `.aider.conf.yml` → read AGENTS.md

Living session state lives in `docs/handoff/CURRENT.md`, not in chat.

## Consequences

- Switching AI/IDE keeps rules if the repo is opened.
- Duplication is forbidden; bridges must not copy long prose.
- Agents must update the handoff file at session end.
