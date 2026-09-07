"use client";

import { useEffect, useState } from "react";
import type { SessionHandoff } from "@portable/shared";

export function HandoffPanel() {
  const [handoff, setHandoff] = useState<SessionHandoff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/handoff");
        if (!res.ok) throw new Error("Handoff API unavailable");
        const data = (await res.json()) as { handoff: SessionHandoff };
        if (!cancelled) setHandoff(data.handoff);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load handoff");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-ink-soft/80">Reading handoff…</p>;
  }
  if (error || !handoff) {
    return (
      <p className="text-danger" role="alert">
        {error ?? "No handoff"} — open `docs/handoff/CURRENT.md` directly.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
            Live handoff
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            {handoff.goal}
          </h3>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-sand">
          {handoff.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <List title="Done" items={handoff.done} />
        <List title="Next" items={handoff.next} />
      </div>

      <p className="text-sm text-ink-soft/70">
        Source of truth remains the markdown file. Edit it when you switch tools —
        chat history will not follow you.
      </p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft/60">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-ink-soft/70">None listed</p>
      ) : (
        <ul className="space-y-2 text-sm text-ink">
          {items.map((item) => (
            <li key={item} className="border-l-2 border-teal/40 pl-3">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
