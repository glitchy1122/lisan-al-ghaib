# AGENTS.md — packages/shared

- Zod is the only runtime validation library here.
- Export schemas + inferred types from `src/index.ts`.
- Breaking schema changes need a coordinated update in `apps/web` API + UI.
- Prefer additive changes; document breaks in an ADR.
