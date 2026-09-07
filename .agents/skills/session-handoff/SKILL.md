---
description: Park or resume work so another IDE/AI can continue without chat history
alwaysApply: false
---

# Skill: session-handoff

## When to use

- User is switching Cursor ↔ Claude ↔ Copilot ↔ VS Code ↔ Codex
- Ending a long session
- Starting work and previous chat is unavailable

## Instructions

1. Read `docs/handoff/CURRENT.md` if present.
2. On **resume**: continue from **Next**; do not redo **Done**.
3. On **park / end**: rewrite `docs/handoff/CURRENT.md` with:
   - Meta table (status, goal, updated, updated by)
   - Done checkboxes
   - Next checkboxes
   - Blockers / open questions
   - Files touched
   - Commands to run
   - Short notes for the next agent
4. Keep it factual and short. No secrets.
5. Commit with `docs(handoff): ...` when parking across tools.
