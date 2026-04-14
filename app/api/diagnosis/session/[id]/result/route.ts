import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/db";
import { calculateResult } from "@/lib/diagnosis";
import type { AnswerValue } from "@/lib/diagnosis";
import { extractFields, resolveWorkflow } from "@/lib/workflow";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getSession(id);
    if (!session) {
      return NextResponse.json({ error: "Session 不存在" }, { status: 404 });
    }

    const answers = session.answers as Record<string, AnswerValue>;
    const result = calculateResult(answers);

    const updated = await updateSession(id, {
      completed: true,
      resultType: result.type,
      confidence: result.confidence,
    });

    // session.contact 已添加到 MockDiagnosisSession（可能为 null）
    const fields = extractFields(answers, session.contact ?? undefined);
    const workflow = resolveWorkflow(fields);

    return NextResponse.json({
      session: updated,
      result,
      fields,
      workflow,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    console.error("[/api/diagnosis/session/[id]/result]", message, err);
    return NextResponse.json(
      { error: "诊断结果计算失败", detail: message },
      { status: 500 }
    );
  }
}
