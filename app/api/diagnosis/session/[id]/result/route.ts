import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/db";
import { calculateResult } from "@/lib/diagnosis";
import type { AnswerValue } from "@/lib/diagnosis";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: "Session 不存在" }, { status: 404 });

  const answers = session.answers as Record<string, AnswerValue>;
  const result = calculateResult(answers);

  const updated = await updateSession(id, {
    completed: true,
    resultType: result.type,
    confidence: result.confidence,
  });

  return NextResponse.json({ session: updated, result });
}
