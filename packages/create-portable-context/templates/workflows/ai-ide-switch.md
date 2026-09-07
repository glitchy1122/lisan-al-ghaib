# Workflow: switch AI or IDE without losing context

Chat stays inside one product. Git-tracked files are the continuity layer.

## Leaving a tool

1. Update `docs/handoff/CURRENT.md` (done / next / blockers / files)
2. Commit: `docs(handoff): park work before switching tools`
3. Push the branch

## Entering another tool

1. Open the same repo + branch
2. Prompt:

```text
Read AGENTS.md, CONTEXT.md, and docs/handoff/CURRENT.md.
Continue from the Next section. Do not redo completed work.
```

3. Run commands listed in the handoff
4. Update handoff again before you leave
