# 0001 — Adopt portable context for multi-AI development

- Status: Accepted
- Date: {{date}}
- Project: {{projectName}}

## Context

Developers switch between IDEs and coding agents. Chat history does not travel with them.

## Decision

Install Portable Context:

- `AGENTS.md` as canonical agent instructions
- `CONTEXT.md` for product memory
- `docs/handoff/CURRENT.md` for live work
- Thin bridges for Claude / Cursor / Copilot / Gemini / Aider

## Consequences

- Switching tools keeps rules if the repo is opened
- Agents must update the handoff file at session end
- Existing application code is unchanged by the installer
