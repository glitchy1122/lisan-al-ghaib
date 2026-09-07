"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import type { Task, TaskStatus } from "@portable/shared";

const statuses: TaskStatus[] = ["todo", "doing", "done", "blocked"];

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) throw new Error("Could not load tasks");
        const data = (await res.json()) as { tasks: Task[] };
        if (!cancelled) {
          setTasks(data.tasks);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchTasks();
    return () => {
      cancelled = true;
    };
  }, []);

  function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      setError(null);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), status: "todo" }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(body?.error ?? "Create failed");
        return;
      }
      const created = (await res.json()) as { task: Task };
      setTitle("");
      setTasks((prev) => [created.task, ...prev]);
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onCreate} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="task-title">
          New task
        </label>
        <input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a slice task…"
          className="min-h-12 flex-1 border border-ink/15 bg-paper/80 px-4 text-base outline-none transition focus:border-teal"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 bg-ink px-5 text-sm font-semibold tracking-wide text-paper transition hover:bg-teal disabled:opacity-60"
        >
          {pending ? "Saving…" : "Add task"}
        </button>
      </form>

      {loading ? (
        <p className="text-ink-soft/80">Loading tasks…</p>
      ) : null}
      {error ? (
        <p className="text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && tasks.length === 0 ? (
        <p className="text-ink-soft/80">No tasks yet — add the first slice.</p>
      ) : null}

      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex flex-col gap-1 border-b border-ink/10 py-3 sm:flex-row sm:items-baseline sm:justify-between"
          >
            <div>
              <p className="font-medium text-ink">{task.title}</p>
              {task.notes ? (
                <p className="text-sm text-ink-soft/75">{task.notes}</p>
              ) : null}
            </div>
            <StatusPill status={task.status} />
          </li>
        ))}
      </ul>

      <p className="text-xs tracking-wide text-ink-soft/60">
        Validated by Zod in `@portable/shared` — same contract for API and UI.
        Status vocabulary: {statuses.join(" · ")}
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: TaskStatus }) {
  const tone =
    status === "done"
      ? "text-teal"
      : status === "blocked"
        ? "text-danger"
        : status === "doing"
          ? "text-sand"
          : "text-ink-soft/70";
  return (
    <span className={`text-xs font-semibold uppercase tracking-[0.14em] ${tone}`}>
      {status}
    </span>
  );
}
