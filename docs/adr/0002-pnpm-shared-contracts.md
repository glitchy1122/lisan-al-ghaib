# 0002 — pnpm monorepo with shared Zod contracts

- Status: Accepted
- Date: 2026-09-07
- Deciders: project maintainers

## Context

Full-stack apps often redefine types separately on client and server, causing subtle bugs — especially when different AIs edit different layers.

## Decision

- `apps/web` — Next.js UI + Route Handlers
- `packages/shared` — Zod schemas and inferred types (`@portable/shared`)
- API and UI both import contracts from shared

## Consequences

- Schema changes are one PR touching shared + consumers
- Nested `AGENTS.md` per package can specialize without contradicting the root
