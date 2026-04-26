import { NextResponse } from "next/server";
import { createSession, updateSession } from "@/lib/db";
import { calculateResult, type AnswerValue } from "@/lib/diagnosis";

// Default answers that represent a typical quick-start user:
// - Q1: "没有好图片" (A)
// - Q2: "偶尔请摄影师" (B)
// - Q3: "提转化" (C)
// - Q4: "没用过，不知道怎么开始" (A)
// - Q5: "先了解免费方案" (A)
// - Q6: "1~3款" (A)
// - Q7: "服装/鞋包配饰" (A)
// - Q8: "亚马逊/独立站/跨境" (C)
const DEFAULT_ANSWERS: Record<number, AnswerValue> = {
  1: "A",
  2: "B",
  3: "C",
  4: "A",
  5: "A",
  6: "A",
  7: "A",
  8: "C",
};

export async function POST() {
  try {
    // 1. Create a new session
    const session = await createSession();
    const sessionId = session.id;

    // 2. Calculate result with default answers (bypasses 8-step questionnaire)
    const result = calculateResult(DEFAULT_ANSWERS);

    // 3. Save answers and mark completed
    await updateSession(sessionId, {
      step: 8,
      answers: DEFAULT_ANSWERS as unknown as Record<string, string>,
      completed: true,
      resultType: result.type,
      confidence: result.confidence,
    });

    // 4. Return session ID for redirect to /result
    return NextResponse.json(
      { id: sessionId, resultType: result.type },
      { status: 201 }
    );
  } catch (err) {
    console.error("[/api/quick-start]", err);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
