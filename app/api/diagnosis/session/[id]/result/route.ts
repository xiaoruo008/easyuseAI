import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/db";
import { calculateResult, DIAGNOSIS_QUESTIONS } from "@/lib/diagnosis";
import type { AnswerValue } from "@/lib/diagnosis";
import { resolveWorkflow } from "@/lib/workflow";
import { deriveFashionFieldsFromDiagnosis } from "@/lib/diagnosis-workflow-map";
import { chat, isAIEnabled } from "@/lib/ai";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const action = new URL(_req.url).searchParams.get("action") ?? "";

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

    // 从诊断结果类型推导时尚字段（action 由客户端后续步骤提供）
    const derived = deriveFashionFieldsFromDiagnosis(result.type, action);
    const fields = { ...derived, contact: "" };
    const workflow = resolveWorkflow(fields);

    // ─── LLM 用户画像生成（Task3）───────────────────────────────
    let aiPersona: string | null = null;
    if (isAIEnabled()) {
      try {
        // 构建用户画像 Prompt
        const diagnosisText = DIAGNOSIS_QUESTIONS.map((q) => {
          const ans = answers["q" + q.id];
          if (!ans) return null;
          const opt = q.options.find((o) => o.value === ans);
          return `Q${q.id}: ${q.text}\nA${q.id}: ${opt?.label ?? ans}`;
        }).filter(Boolean).join("\n");

        const personaPrompt = [
          {
            role: "system" as const,
            content: `你是一个专业的商业咨询师。根据用户的诊断答案，生成一句精准的用户画像描述。

规则：
1. 画像必须基于用户已作答的答案，未作答的题目请忽略，不要提及"未作答"
2. 一句话说明用户的核心痛点和特征
3. 格式：「用户类型 + 痛点描述 + 期望」
4. 语言简洁专业，适合直接展示给用户
5. 不要解释，直接输出画像句子
6. 不要输出任何推理过程，不要输出任何标签

示例：
"内容引流效率低、有产品但缺流量的电商商家，期望找到高效的内容生产方式"
"客服响应慢、重复问题多的客服瓶颈商家，期望自动化处理提升效率"
"数据整理繁琐、渴望自动化提效的效率型商家，期望用工具替代重复劳动"`,
          },
          {
            role: "user" as const,
            content: `用户诊断答案如下：\n${diagnosisText}\n\n请根据以上答案，生成一句精准的用户画像描述。`,
          },
        ];

        const personaResponse = await chat(personaPrompt);
        // 过滤 MiniMax 推理标签：
        // 1. igonre**...** 格式（MiniMax thinking tags）
        // 2. <think>...</think> 格式（部分模型输出）
        // 3. 其他 <...> XML/HTML 残留
        const raw = personaResponse.content.trim();
        let stripped = raw
          .replace(/igonre\*\*[\s\S]*?igonre\*\*/gi, "")           // igonre**...**
          .replace(/<[\s\S]*?>/gi, "")                       // <anything>
          .replace(/\s+/g, " ")
          .trim();
        aiPersona = stripped;
      } catch (aiErr) {
        // AI 生成失败时降级使用规则结果，不阻塞主流程
        console.warn("[/api/diagnosis/session/[id]/result] AI persona generation failed:", aiErr);
        aiPersona = null;
      }
    }

    // 优先使用 LLM 生成的画像，否则使用规则结果
    const finalPersona = aiPersona ?? result.persona;

    return NextResponse.json({
      session: updated,
      result: {
        ...result,
        persona: finalPersona,
      },
      fields,
      workflow,
      // 额外返回 AI 生成的用户画像（供前端展示）
      aiPersona: aiPersona ?? null,
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
