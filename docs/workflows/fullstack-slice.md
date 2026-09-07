# Workflow: full-stack feature slice

## Rule

Ship a thin vertical slice: contract → API → UI → docs/handoff.

## Steps

1. **Contract** — add/change Zod schema in `packages/shared`
2. **API** — Route Handler in `apps/web/src/app/api/**` validating with that schema
3. **UI** — page/component consuming the API; empty/loading/error states
4. **Check** — `pnpm typecheck`, `pnpm lint`, manual smoke on `:43123`
5. **Memory** — update handoff; ADR if the approach is a lasting decision

## Folder map for a feature `tasks`

```
packages/shared/src/index.ts          # TaskSchema
apps/web/src/app/api/tasks/route.ts   # GET/POST
apps/web/src/app/...                  # UI
docs/handoff/CURRENT.md               # progress
```

## Do not

- Add a database until the slice needs persistence
- Add auth until the product requires it
- Copy types into the UI “just for now”
