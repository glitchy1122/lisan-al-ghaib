# create-portable-context

**npx installer** for portable AI/IDE project context.

Adds `AGENTS.md`, `CONTEXT.md`, handoff, skills, and tool bridges into **any existing repo** without breaking application code.

## Quick start (ongoing project)

```bash
cd your-ongoing-project
npx create-portable-context add
npx create-portable-context seed
```

### Fill handoff from your current AI chat

Chat tools don’t expose a shared portable history API. Use this flow instead:

```bash
# 1) baseline from git
npx create-portable-context seed

# 2) print a prompt → paste into Cursor / Gemini / Grok / Claude
npx create-portable-context seed --prompt

# 3) if the AI prints markdown instead of writing the file:
npx create-portable-context seed --from-stdin --force < handoff.md
# or
npx create-portable-context seed --from-file chat-export.md --force
```

### Uninstall

```bash
npx create-portable-context uninstall --dry-run
npx create-portable-context uninstall
npx create-portable-context uninstall --keep-agents   # keep AGENTS/CONTEXT guides
```

Uninstall only removes files listed in `.portable-context/manifest.json` and strips the README marker section. Application source is never touched.

## Safety

| Behavior | Default |
|----------|---------|
| Delete app source | Never |
| Overwrite existing portable files | Only with `--force` |
| Replace README.md | Never (append/strip marked section only) |
| Uninstall scope | Manifest files only |

## Commands

```bash
npx create-portable-context add
npx create-portable-context seed
npx create-portable-context seed --prompt
npx create-portable-context uninstall
npx create-portable-context detect
npx create-portable-context doctor
```

## Local development

```bash
pnpm --filter create-portable-context test
pnpm portable-context add --dir /path/to/app
```

Until published to npm:

```bash
node packages/create-portable-context/bin/create-portable-context.js add --dir /path/to/app
```
