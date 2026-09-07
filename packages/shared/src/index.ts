import { z } from "zod";

/** Shared DTO contracts — web and API import from here so types never drift. */
export const TaskStatusSchema = z.enum(["todo", "doing", "done", "blocked"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  status: TaskStatusSchema,
  notes: z.string().max(2000).optional(),
  updatedAt: z.string().datetime(),
});
export type Task = z.infer<typeof TaskSchema>;

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  status: TaskStatusSchema.optional().default("todo"),
  notes: z.string().max(2000).optional(),
});
export type CreateTask = z.infer<typeof CreateTaskSchema>;

export const HandoffStatusSchema = z.enum([
  "in_progress",
  "blocked",
  "ready_for_review",
  "done",
]);
export type HandoffStatus = z.infer<typeof HandoffStatusSchema>;

export const SessionHandoffSchema = z.object({
  goal: z.string().min(1),
  status: HandoffStatusSchema,
  done: z.array(z.string()),
  next: z.array(z.string()),
  openQuestions: z.array(z.string()),
  filesTouched: z.array(z.string()),
  commandsToRun: z.array(z.string()),
  updatedAt: z.string().datetime(),
  updatedBy: z.string().min(1),
});
export type SessionHandoff = z.infer<typeof SessionHandoffSchema>;
