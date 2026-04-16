import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/db";
import { calculateResult, DIAGNOSIS_QUESTIONS } from "@/lib/diagnosis";
import type { AnswerValue } from "@/lib/diagnosis";
import { extractFields, resolveWorkflow } from "@/lib/workflow";
import { deriveFashionFieldsFromDiagnosis } from "@/lib/diagnosis-workflow-map";
import { chat, isAIEnabled } from "@/lib/ai";

// Session-level AI persona cache — skips ~16s LLM call on repeat requests
const personaCache = new Map<string, string>();

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

    // 从用户5题答案推导时尚字段（action 用于 product_photo 的 category override）
    // 修复：之前 deriveFashionFieldsFromDiagnosis 完全忽略用户 Q1-Q3 答案，
    // 导致无论用户选什么，都默认 domestic+womenswear+top
    const extracted = extractFields(answers);
    // product_photo → hero_branded 只存在于 dress category，需 override
    const category = action === "product_photo" ? "dress" : extracted.category;
    const fields = { ...extracted, category, contact: "" };
    const workflow = resolveWorkflow(fields);

    // ─── LLM 用户画像生成（Task3）───────────────────────────────
    let aiPersona: string | null = null;
    if (isAIEnabled()) {
      if (personaCache.has(id)) {
        aiPersona = personaCache.get(id)!;
      } else {
        // Fire-and-forget：立即返回，不等 LLM 完成
        // 首次调用 aiPersona=null（用 rule-based），LLM 在后台更新缓存供后续调用复用
        const diagnosisText = DIAGNOSIS_QUESTIONS.map((q) => {
          const ans = answers[q.id];
          if (!ans) return null;
          const opt = q.options.find((o) => o.value === ans);
          return `Q${q.id}: ${q.text}\nA${q.id}: ${opt?.label ?? ans}`;
        }).filter(Boolean).join("\n");

        const personaPrompt = [
          {
            role: "system" as const,
            content: `背景：
- 用户是服装电商商家（平台：天猫/抖音/小红书）
- 诊断类型（result.type）共4种：traffic（流量型）、customer（客户型）、work（效率型）、unclear（不明确型）
- 生成的用户画像将用于：工作流推荐优先级、CTA 文案个性化、客服跟进话术生成

你是一个专业的商业咨询师。根据用户的诊断答案，生成一句精准的用户画像描述。

规则：
1. 画像必须基于用户已作答的答案，未作答的题目请忽略，不要提及"未作答"
2. 若用户作答题目不足3道，画像应以探索型商家描述，重点输出"建议优先做XX"
3. 格式：「[诊断类型标签] + [核心痛点（1个）] + [期望（1个）」，总字数控制在20-35字
   - 诊断类型标签必须从以下四个选一：流量型商家 / 客户型商家 / 效率型商家 / 探索型商家
   - 平台信息（天猫/抖音/小红书）若从答案中可推断则加入，否则省略
4. 语言简洁专业，适合直接展示给用户
5. 不要解释，直接输出画像句子
6. 不要输出任何推理过程，不要输出任何标签
7. 画像必须整合以下两个维度的信息（若用户已作答）：
   - Q2（时间投入）：体现紧急程度（"每天处理"→高紧迫，<1小时→低紧迫）
   - Q4（AI期望）：直接引用用户的AI诉求（如"希望AI生成内容"、"希望AI自动回复客户"）

示例：
"小红书内容种草效果差、缺乏持续内容产出能力的内容型商家，期望AI辅助内容生产"
"客服响应慢、重复问题多的客户型商家，期望AI自动处理高频重复问题"
"数据整理繁琐、渴望自动化提效的效率型商家，期望用工具替代重复劳动"
"刚入局服装电商、需求不清晰的探索期商家，期望明确最该先解决的问题"
"多平台运营、什么都想做但缺重点的迷茫型商家，期望找到核心突破口"`,
          },
          {
            role: "user" as const,
            content: `用户诊断答案如下：\n${diagnosisText}\n\n诊断答案包含Q1（痛点）、Q2（时间投入）、Q3（平台）、Q4（AI期望）、Q5（内容现状）。请综合以上信息，生成一句包含"痛点+紧急度+AI期望"的用户画像。`,
          },
        ];

        chat(personaPrompt)
          .then((personaResponse) => {
            const raw = personaResponse.content.trim();
            let stripped = raw;
            stripped = stripped.replace(/\*\*igonre\*\*/gi, "");
            stripped = stripped.replace(/igonre\*\*/gi, "");
            let prev = "";
            while (prev !== stripped) {
              prev = stripped;
              stripped = stripped.replace(/\*\*[^*]+\*\*/g, "");
            }
            if (stripped.length < 10) stripped = result.persona;
            stripped = stripped
              .replace(/<[\s\S]*?>/gi, "")
              .replace(/\s+/g, " ")
              .trim();
            personaCache.set(id, stripped);
          })
          .catch((aiErr) => {
            console.warn("[/api/diagnosis/session/[id]/result] AI persona generation failed:", aiErr);
          });

        // 首次调用返回 null（rule-based）；同 session 后续调用走缓存
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
