import { HandoffPanel } from "@/components/handoff-panel";
import { TaskBoard } from "@/components/task-board";

const layers = [
  {
    name: "Stable rules",
    file: "AGENTS.md",
    blurb: "Commands, conventions, security — shared by every agent.",
  },
  {
    name: "Product memory",
    file: "CONTEXT.md",
    blurb: "Goals, glossary, stack locks, open questions.",
  },
  {
    name: "Live handoff",
    file: "docs/handoff/CURRENT.md",
    blurb: "What is done, next, blocked — updated every session end.",
  },
];

const bridges = [
  ["Claude Code", "CLAUDE.md → @AGENTS.md"],
  ["Cursor", "AGENTS.md + .cursor/rules"],
  ["Copilot", ".github/copilot-instructions.md"],
  ["Gemini CLI", ".gemini/settings.json"],
  ["Aider", ".aider.conf.yml"],
];

const workflows = [
  {
    title: "Switch AI / IDE",
    href: "#switch",
    text: "Park handoff → commit → open same branch → resume from Next.",
  },
  {
    title: "Git loop",
    href: "#git",
    text: "Conventional commits, push before tool-switch, no secrets.",
  },
  {
    title: "Full-stack slice",
    href: "#slice",
    text: "shared contract → API route → UI → handoff update.",
  },
];

export default function Home() {
  return (
    <div className="relative z-10">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <p className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-ink">
          Lisan al-Ghaib
        </p>
        <nav className="hidden gap-6 text-sm text-ink-soft/80 sm:flex">
          <a href="#system" className="transition hover:text-teal">
            System
          </a>
          <a href="#workflows" className="transition hover:text-teal">
            Workflows
          </a>
          <a href="#install" className="transition hover:text-teal">
            Install
          </a>
          <a href="#demo" className="transition hover:text-teal">
            Demo API
          </a>
        </nav>
      </header>

      <section className="relative min-h-[88vh] overflow-hidden border-b border-ink/10">
        <div className="pointer-events-none absolute inset-0">
          <div className="glow-orb absolute -left-24 top-24 h-72 w-72 rounded-full bg-teal-bright/25 blur-3xl" />
          <div className="glow-orb absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sand/30 blur-3xl" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(rgba(11,28,26,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(11,28,26,0.06) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col justify-center px-6 py-16">
          <p className="animate-rise font-[family-name:var(--font-display)] text-5xl font-extrabold leading-[0.95] tracking-tight text-ink sm:text-7xl md:text-8xl">
            Lisan al-Ghaib
          </p>
          <div className="rule-grow mt-6 h-px w-40 bg-teal" />
          <h1 className="animate-rise-delay mt-8 max-w-2xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-snug text-ink-soft sm:text-3xl">
            Full-stack structure that keeps project context when you change AI or editor.
          </h1>
          <p className="animate-rise-delay-2 mt-5 max-w-xl text-base leading-relaxed text-ink-soft/80 sm:text-lg">
            Chat stays behind. Git-tracked AGENTS, CONTEXT, handoff, ADRs, and skills travel with the repo.
          </p>
          <div className="animate-rise-delay-2 mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#system"
              className="inline-flex min-h-12 items-center justify-center bg-ink px-6 text-sm font-semibold tracking-wide text-paper transition hover:bg-teal"
            >
              See the memory layers
            </a>
            <a
              href="#demo"
              className="inline-flex min-h-12 items-center justify-center border border-ink/20 bg-paper/50 px-6 text-sm font-semibold tracking-wide text-ink transition hover:border-teal hover:text-teal"
            >
              Try the demo API
            </a>
          </div>
        </div>
      </section>

      <section id="system" className="mx-auto w-full max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
          Memory system
        </p>
        <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold text-ink sm:text-4xl">
          One source of truth, thin bridges per tool
        </h2>
        <p className="mt-4 max-w-2xl text-ink-soft/80">
          Do not maintain separate long rulebooks for Claude, Cursor, and Copilot. Keep AGENTS.md canonical; point everything else at it.
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {layers.map((layer, i) => (
            <article
              key={layer.file}
              className="border-t border-ink/15 pt-5"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sand">
                Layer {i + 1}
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-ink">
                {layer.name}
              </h3>
              <p className="mt-1 font-mono text-sm text-teal">{layer.file}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft/80">
                {layer.blurb}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-14 border-t border-ink/10 pt-10">
          <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
            Tool bridges
          </h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {bridges.map(([tool, how]) => (
              <li
                key={tool}
                className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-3 text-sm"
              >
                <span className="font-medium text-ink">{tool}</span>
                <span className="text-right text-ink-soft/70">{how}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="workflows" className="border-y border-ink/10 bg-ink text-paper">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-bright">
            Workflows
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">
            How work moves between humans and agents
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {workflows.map((w) => (
              <a key={w.title} href={w.href} className="group block">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold transition group-hover:text-teal-bright">
                  {w.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-paper/70">
                  {w.text}
                </p>
              </a>
            ))}
          </div>

          <div id="switch" className="mt-16 space-y-4 border-t border-paper/15 pt-10">
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              Switch AI / IDE
            </h3>
            <ol className="list-decimal space-y-2 pl-5 text-paper/80">
              <li>Update `docs/handoff/CURRENT.md` (done / next / blockers / files).</li>
              <li>Commit and push the branch.</li>
              <li>Open the same repo in the next tool.</li>
              <li>Prompt: read AGENTS + CONTEXT + handoff; continue from Next.</li>
            </ol>
            <p className="text-sm text-paper/55">
              Details: `docs/workflows/ai-ide-switch.md`
            </p>
          </div>

          <div id="git" className="mt-12 space-y-4">
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              Git
            </h3>
            <p className="max-w-2xl text-paper/80">
              Conventional commits with scopes (`web`, `shared`, `context`). Push before switching environments so the next agent can fetch reality, not just chat claims.
            </p>
            <p className="text-sm text-paper/55">Details: `docs/workflows/git.md`</p>
          </div>

          <div id="slice" className="mt-12 space-y-4">
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              Full-stack slice
            </h3>
            <p className="max-w-2xl text-paper/80">
              Change Zod in `packages/shared` → Route Handler in `apps/web` → UI → update handoff. One vertical cut, not a platform rewrite.
            </p>
            <p className="text-sm text-paper/55">
              Details: `docs/workflows/fullstack-slice.md`
            </p>
          </div>
        </div>
      </section>

      <section id="install" className="mx-auto w-full max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
          Portable install
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-ink sm:text-4xl">
          Add this to an ongoing project with one command
        </h2>
        <p className="mt-4 max-w-2xl text-ink-soft/80">
          The installer detects your repo, writes context files, skips anything that already exists, and never touches application source. Your README is only appended — never replaced.
        </p>
        <pre className="mt-8 overflow-x-auto border border-ink/10 bg-ink px-5 py-4 text-sm leading-relaxed text-paper/90">
{`cd your-ongoing-project
npx lisan-al-ghaib add
npx lisan-al-ghaib seed
npx lisan-al-ghaib seed --prompt

npx lisan-al-ghaib uninstall --dry-run
npx lisan-al-ghaib uninstall`}
        </pre>
        <p className="mt-4 text-sm text-ink-soft/70">
          Seed fills handoff from git; <code className="font-mono text-teal">--prompt</code> captures your current AI chat. Uninstall only removes kit files from the manifest.
        </p>
      </section>

      <section id="demo" className="mx-auto w-full max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
          Runnable slice
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-ink sm:text-4xl">
          Shared contracts power the API and UI
        </h2>
        <p className="mt-4 max-w-2xl text-ink-soft/80">
          This demo is intentionally small: in-memory tasks validated by `@portable/shared`, plus a handoff panel that mirrors your markdown memory.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 font-[family-name:var(--font-display)] text-xl font-bold text-ink">
              Tasks API
            </h3>
            <TaskBoard />
          </div>
          <div>
            <h3 className="mb-4 font-[family-name:var(--font-display)] text-xl font-bold text-ink">
              Session handoff
            </h3>
            <HandoffPanel />
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            Starter prompt for any new AI session
          </h2>
          <pre className="mt-5 overflow-x-auto border border-ink/10 bg-ink px-5 py-4 text-sm leading-relaxed text-paper/90">
{`Read AGENTS.md, CONTEXT.md, and docs/handoff/CURRENT.md.
Continue from the Next section. Do not redo completed work.
Ask only if a blocker is unclear.`}
          </pre>
          <p className="mt-6 text-sm text-ink-soft/70">
            Run locally: `pnpm install && pnpm dev` → http://127.0.0.1:43123
          </p>
        </div>
      </section>

      <footer className="border-t border-ink/10 py-8 text-center text-sm text-ink-soft/60">
        Lisan al-Ghaib · context lives in the repo, not in one chat window
      </footer>
    </div>
  );
}
