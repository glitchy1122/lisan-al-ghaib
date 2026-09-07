---
description: After install, fill handoff from the current AI conversation or repo signals
alwaysApply: false
---

# Skill: seed-handoff-from-chat

## When to use

- User just installed Portable Context
- Handoff is still a stub / empty
- User asks to capture current Cursor/Gemini/Grok/Claude chat into handoff

## Instructions

1. Prefer writing `docs/handoff/CURRENT.md` directly from THIS conversation (done/next/blockers/files).
2. If you cannot edit files, output the full markdown and tell the user:
   `npx create-portable-context seed --from-stdin --force`
3. Optionally run `npx create-portable-context seed` first for git baseline, then overwrite with chat-aware content (`--force`).
4. Update `CONTEXT.md` only where installer placeholders remain.
5. No secrets. Keep bullets short.
