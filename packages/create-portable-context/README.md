# lisan-al-ghaib

**npx installer** for portable AI/IDE project context.

Adds `AGENTS.md`, `CONTEXT.md`, handoff, skills, and tool bridges into **any existing repo** without breaking application code.

## Quick start (ongoing project)

```bash
cd your-ongoing-project
npx lisan-al-ghaib add
npx lisan-al-ghaib seed
```

### Fill handoff from your current AI chat

Chat tools don’t expose a shared portable history API. Use this flow instead:

```bash
# 1) baseline from git
npx lisan-al-ghaib seed

# 2) print a prompt → paste into Cursor / Gemini / Grok / Claude
npx lisan-al-ghaib seed --prompt

# 3) if the AI prints markdown instead of writing the file:
npx lisan-al-ghaib seed --from-stdin --force < handoff.md
# or
npx lisan-al-ghaib seed --from-file chat-export.md --force
```

### Uninstall

```bash
npx lisan-al-ghaib uninstall --dry-run
npx lisan-al-ghaib uninstall
npx lisan-al-ghaib uninstall --keep-agents   # keep AGENTS/CONTEXT guides
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
npx lisan-al-ghaib add
npx lisan-al-ghaib seed
npx lisan-al-ghaib seed --prompt
npx lisan-al-ghaib uninstall
npx lisan-al-ghaib detect
npx lisan-al-ghaib doctor
```

## Local development

```bash
pnpm --filter lisan-al-ghaib test
pnpm portable-context add --dir /path/to/app
```

Until published to npm:

```bash
node packages/lisan-al-ghaib/bin/lisan-al-ghaib.js add --dir /path/to/app
```
