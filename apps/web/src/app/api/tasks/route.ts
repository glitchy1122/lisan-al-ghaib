import { NextResponse } from "next/server";
import {
  CreateTaskSchema,
  type Task,
} from "@portable/shared";

const tasks: Task[] = [
  {
    id: "t1",
    title: "Read AGENTS.md + handoff before coding",
    status: "done",
    notes: "Portable context bootstrap",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "t2",
    title: "Park session in docs/handoff/CURRENT.md",
    status: "doing",
    notes: "Required before switching IDE/AI",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "t3",
    title: "Customize CONTEXT.md for your product",
    status: "todo",
    updatedAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const task: Task = {
    id: `t${Date.now()}`,
    title: parsed.data.title,
    status: parsed.data.status,
    notes: parsed.data.notes,
    updatedAt: new Date().toISOString(),
  };
  tasks.unshift(task);
  return NextResponse.json({ task }, { status: 201 });
}
