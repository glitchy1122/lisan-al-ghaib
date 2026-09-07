---
description: Update CONTEXT.md and AGENTS.md when durable project facts or process rules change
alwaysApply: false
---

# Skill: update-context

## When to use

- Product goals, glossary, stack, or constraints changed
- A process rule should apply to all future agents
- User says “remember this for next time” across tools

## Instructions

1. Put **product facts** in `CONTEXT.md` (what/why/constraints/glossary).
2. Put **operating rules & commands** in `AGENTS.md` (how agents work).
3. Put **in-flight work** only in `docs/handoff/CURRENT.md`.
4. Do not duplicate paragraphs across files — link instead.
5. Keep AGENTS.md actionable and relatively short.
6. Bump “Last updated” in CONTEXT.md.
7. Commit: `docs(context): ...`
