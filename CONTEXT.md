# CONTEXT.md — living product memory

Last updated: 2026-09-07  
Owner: project maintainers (any AI/IDE may update; keep factual)

## What this product is

A **portable full-stack development kit**: monorepo structure + workflows so project context survives switching between Cursor, Claude Code, Copilot, Codex, VS Code, Windsurf, and others.

Primary value is not a fancy UI — it is **repo-owned memory** (AGENTS, CONTEXT, handoff, ADRs, skills).

## Goals

1. New agent session can resume work without the previous chat.
2. Humans and agents share one vocabulary and one structure.
3. Full-stack work has clear boundaries: `apps/web` vs `packages/shared`.
4. Git history + handoff file = continuity.

## Non-goals (for now)

- Auth, database, billing, multi-tenant SaaS
- Mobile native apps
- Multiple component libraries
- Vendor lock-in to one AI product

## Glossary

| Term | Meaning |
|------|---------|
| Portable context | Instructions and state stored in git, readable by any agent |
| Handoff | `docs/handoff/CURRENT.md` — active session memory |
| ADR | Architecture Decision Record in `docs/adr/` |
| Bridge file | Thin pointer (`CLAUDE.md`, Copilot instructions) to `AGENTS.md` |
| Contract | Shared Zod schema in `@portable/shared` |

## Stack (locked unless ADR says otherwise)

| Layer | Choice |
|-------|--------|
| Package manager | pnpm workspaces |
| Web | Next.js App Router + TypeScript + Tailwind |
| API | Next.js Route Handlers |
| Shared types | Zod in `packages/shared` |
| Agent standard | AGENTS.md (Agentic AI Foundation) |

## Current constraints

- Dev server port: **43123**
- No database yet — in-memory / file mock OK for demos
- Keep agent instruction files concise and actionable (< ~200 lines for AGENTS.md)

## Open product questions

- None blocking the kit itself. Add real product questions here when you build a specific app on this kit.
