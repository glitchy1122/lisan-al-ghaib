export function printHelp() {
  console.log(`
create-portable-context — install portable AI/IDE context into any repo

Usage:
  npx create-portable-context add
  npx create-portable-context seed
  npx create-portable-context seed --prompt
  npx create-portable-context seed --from-file notes.md
  npx create-portable-context seed --from-stdin --force
  npx create-portable-context uninstall
  npx create-portable-context detect
  npx create-portable-context doctor

Commands:
  add / init / install   Install kit (non-destructive)
  seed                   Fill docs/handoff/CURRENT.md from git or AI chat
  uninstall / remove     Remove kit files listed in the install manifest
  detect                 Print detection JSON
  doctor                 Verify install + manifest

Seed options:
  --prompt               Print a prompt to paste into Cursor/Gemini/Grok/etc.
  --from-file <path>     Import chat export / notes / AI-written handoff
  --from-stdin           Read handoff markdown from stdin
  --force                Overwrite a non-stub handoff

Uninstall options:
  --keep-agents          Keep AGENTS.md / CONTEXT.md / CLAUDE.md / PORTABLE_CONTEXT.md
  --dry-run              Show what would be removed

Install flags:
  --dir, -C <path>       Target directory (default: cwd)
  --dry-run              Preview only
  --force                Overwrite existing portable files
  --no-readme-section    Do not append a section to README.md
  --quiet, -q            Less output
  --help, -h             Show help

About AI chat context:
  Cursor/Gemini/Grok do not expose a shared portable chat API.
  Use \`seed\` for git-based fill, then \`seed --prompt\` in your current AI
  so it rewrites the handoff from the live conversation.

Safety:
  • Install never deletes files or app source
  • Uninstall only removes files recorded in .portable-context/manifest.json
  • README section is appended on install and stripped on uninstall
`);
}
