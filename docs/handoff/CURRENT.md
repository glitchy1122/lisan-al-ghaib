# Current session handoff

> **Agents:** read this first. Update this file before you stop.  
> Chat history does not travel between tools — this file does.

## Meta

| Field | Value |
|-------|-------|
| Status | `done` |
| Goal | Ship npx installer for portable context + runnable guide |
| Updated | 2026-09-07 |
| Updated by | Cursor Cloud Agent |

## Done

- [x] pnpm monorepo: `apps/web`, `packages/shared`
- [x] AGENTS.md + CLAUDE.md + CONTEXT.md + tool bridges
- [x] Workflows: git, AI switch, session handoff
- [x] Portable skills under `.agents/skills/`
- [x] Demo API + UI explaining the system
- [x] Manual UI smoke (hero, memory layers, add task, handoff panel)
- [x] `create-portable-context` npx CLI with detect/add/doctor
- [x] seed handoff from git/AI prompt + uninstall via manifest
- [x] Non-destructive install tested on a fake ongoing app

## Next

- [ ] Publish `create-portable-context` to npm (or install via git/file path)
- [ ] Customize `CONTEXT.md` for your real product when adopting
- [ ] Replace demo tasks API with your domain if you keep this monorepo

## Blockers / open questions

- None.

## Files touched (this effort)

- `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, `README.md`
- `docs/**`, `.agents/skills/**`, `.cursor/rules/**`, `.github/**`
- `apps/web/**`, `packages/shared/**`, `scripts/check-context.mjs`

## Commands to run

```bash
pnpm install
pnpm dev
pnpm context:check
```

## Notes for the next agent

Start by skimming this handoff, then open the running app guide at `/`. When changing process, edit AGENTS/CONTEXT — not chat-only memory.
