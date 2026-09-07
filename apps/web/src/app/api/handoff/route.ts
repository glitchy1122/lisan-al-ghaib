import { NextResponse } from "next/server";
import { SessionHandoffSchema } from "@portable/shared";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Serves a machine-readable snapshot derived from the markdown handoff.
 * Agents still edit docs/handoff/CURRENT.md — this endpoint is for UI demos.
 */
export async function GET() {
  const handoffPath = path.join(
    process.cwd(),
    "../../docs/handoff/CURRENT.md",
  );

  let markdown = "";
  try {
    markdown = await readFile(handoffPath, "utf8");
  } catch {
    markdown = "";
  }

  const statusMatch = markdown.match(/Status\s*\|\s*`([^`]+)`/i);
  const goalMatch = markdown.match(/Goal\s*\|\s*([^|\n]+)/i);

  const snapshot = SessionHandoffSchema.parse({
    goal: goalMatch?.[1]?.trim() || "See docs/handoff/CURRENT.md",
    status: (statusMatch?.[1] as "ready_for_review") || "in_progress",
    done: extractChecks(markdown, "Done"),
    next: extractChecks(markdown, "Next"),
    openQuestions: ["None listed — check the handoff file."],
    filesTouched: ["docs/handoff/CURRENT.md", "AGENTS.md", "CONTEXT.md"],
    commandsToRun: ["pnpm install", "pnpm dev", "pnpm context:check"],
    updatedAt: new Date().toISOString(),
    updatedBy: "portable-kit",
  });

  return NextResponse.json({ handoff: snapshot, source: "docs/handoff/CURRENT.md" });
}

function extractChecks(md: string, heading: string): string[] {
  const re = new RegExp(`## ${heading}([\\s\\S]*?)(\\n## |$)`, "i");
  const block = md.match(re)?.[1] ?? "";
  return [...block.matchAll(/- \[[ xX]\] (.+)/g)].map((m) => m[1].trim());
}
