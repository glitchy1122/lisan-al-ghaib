# CONTEXT.md — living product memory

Last updated: {{date}}  
Project: {{projectName}}

## What this product is

<!-- Replace this section with your real product description. -->
{{projectName}} uses portable AI/IDE context so work survives switching editors and agents.

## Goals

1. Keep project memory in git (not only in chat).
2. Make handoffs between humans and agents explicit.
3. Preserve existing app code while improving agent workflows.

## Non-goals (for now)

- Do not treat this kit as a reason to rewrite the product.
- Do not add auth/db/services unless the product needs them.

## Glossary

| Term | Meaning |
|------|---------|
| Portable context | Instructions and state stored in git |
| Handoff | `docs/handoff/CURRENT.md` |
| ADR | Architecture Decision Record |
| Bridge file | Thin pointer to `AGENTS.md` |

## Stack (detected — edit if wrong)

- Languages: {{languages}}
- Frameworks: {{frameworks}}
- Package manager: {{packageManager}}

## Open questions

- <!-- Add product questions agents should not invent answers for -->
