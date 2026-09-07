# Workflow: Git for full-stack + multi-agent teams

## Branching

- Default development branch: `main` (or your team default)
- Feature work: `cursor/<short-topic>-ff73` style short kebab names (lowercase)
- One concern per branch when practical

## Commits (Conventional Commits)

```
<type>(<scope>): <summary>

feat(web): add tasks API route
fix(shared): tighten TaskStatus enum
docs(context): record port 43123 constraint
chore: bump next
```

Scopes: `web`, `shared`, `context`, `ci`, `deps`

## Daily loop

```bash
git status
git pull origin <branch>   # if collaborating
# ... edit ...
pnpm lint && pnpm typecheck
# update docs/handoff/CURRENT.md
git add -A
git commit -m "feat(web): ..."
git push -u origin <branch>
```

## Before asking another AI to continue

1. Handoff file updated
2. Changes committed (or clearly listed as uncommitted in handoff)
3. Push so the other environment can fetch

## Reviews

- Prefer small PRs with ADR links when architecture moved
- PR description should point to handoff status and test commands
- Squash is fine if the final message stays conventional

## What git stores for agents

| Artifact | Purpose |
|----------|---------|
| Commits | What changed and why (message) |
| ADRs | Durable decisions |
| Handoff | Current intent |
| AGENTS.md | How to operate |
