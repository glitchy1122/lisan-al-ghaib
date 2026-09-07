---
description: Write an Architecture Decision Record when a lasting technical choice is made
alwaysApply: false
---

# Skill: write-adr

## When to use

- Choosing or changing stack, boundaries, auth, data store, package layout
- Rejecting an alternative that future agents might re-propose

## Instructions

1. Number sequentially: `docs/adr/NNNN-kebab-title.md`
2. Use sections: Status, Date, Deciders, Context, Decision, Consequences
3. Status: Proposed | Accepted | Superseded by NNNN
4. Mention affected paths (`apps/web`, `packages/shared`, …)
5. Link the ADR from handoff Notes if the current work depends on it
6. Commit: `docs(adr): ...`
