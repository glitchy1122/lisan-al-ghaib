# Workflow: session start / end

## Start (every new chat / IDE)

```text
1. Read docs/handoff/CURRENT.md
2. Skim CONTEXT.md
3. git status && git log --oneline -10
4. Continue from Next
```

## End (before closing the tool)

```text
1. Write Done / Next / Blockers in docs/handoff/CURRENT.md
2. List files touched and commands to run
3. ADR if needed; CONTEXT if product facts changed
4. Commit + push
```

## Template for CURRENT.md status values

- `in_progress` — actively coding
- `blocked` — needs human input (list questions)
- `ready_for_review` — implementation complete, needs review
- `done` — goal finished; Next may describe follow-ups
