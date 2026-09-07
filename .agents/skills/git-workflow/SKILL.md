---
description: Standard git loop for this monorepo with conventional commits and handoff discipline
alwaysApply: false
---

# Skill: git-workflow

## When to use

- Committing, branching, preparing another environment to continue
- User asks for professional git workflow

## Instructions

1. Prefer short lowercase branch names; keep work on the current branch unless asked otherwise.
2. Run `pnpm lint` / `pnpm typecheck` before commit when code changed.
3. Conventional Commits with scopes: `web`, `shared`, `context`, `ci`, `deps`.
4. Never commit secrets (`.env`, keys, tokens).
5. Before tool-switch: update handoff, commit, `git push -u origin <branch>`.
6. Do not create a PR unless the user explicitly asks (New Project sessions often skip PRs).
