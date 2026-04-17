import { NextRequest, NextResponse } from "next/server";
import { createLead, getAllLeads, getSession } from "@/lib/db";
import { routeGenerationModel, type RouteDecisionInput } from "@/lib/route-decision";

export async function GET() {
  const leads = await getAllLeads();
  return NextResponse.json(leads);
}

/**
 * 指数退避重试辅助函数
 * @param fn 要执行的异步函数
 * @param maxRetries 最大重试次数
 * @param baseDelayMs 基础延迟（毫秒）
 */
async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<{ result?: T; error?: string; attempts: number }> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return { result, attempts: attempt };
    } catch (err) {
      lastError = err;
      console.warn(`[leads] ⏳ 重试 ${attempt}/${maxRetries} 失败: ${(err as Error).message}`);
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  return { error: (lastError as Error)?.message ?? "unknown", attempts: maxRetries };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const { name, wechat, category, platform, resultType, productImage, referenceImage, remark, diagnosisSessionId } = body;

    if (!name || !wechat) {
      return NextResponse.json({ error: "姓名和微信号必填" }, { status: 400 });
    }

    // 读取 session 数据用于路由判断
    interface SessionDataForRouting {
      painPoint?: string;
      resultType?: string;
      answers?: Record<string, unknown>;
    }
    let sessionData: SessionDataForRouting | null = null;
    if (diagnosisSessionId) {
      try {
        const session = await getSession(diagnosisSessionId);
        if (session) {
          sessionData = {
            painPoint: (session as unknown as { painPoint?: string }).painPoint,
            resultType: session.resultType ?? undefined,
            answers: session.answers as Record<string, unknown> | undefined,
          };
        }
      } catch {
        console.warn("[leads] failed to fetch session for routing:", diagnosisSessionId);
      }
    }

    // 构建路由决策输入
    const routeInput: RouteDecisionInput = {
      painPoint: sessionData?.painPoint,
      resultType: resultType ?? sessionData?.resultType,
      platform: platform ?? (sessionData?.answers as Record<string, unknown>)?.platform as string | string[] | undefined,
      monthlyFrequency: (sessionData?.answers as Record<string, unknown>)?.monthlyFrequency as string | undefined,
      hasProductImage: Boolean(productImage),
      hasReferenceImage: Boolean(referenceImage),
    };

    // 执行路由判断
    const routeDecision = routeGenerationModel(routeInput);

    const lead = await createLead({
      name,
      contact: wechat,
      businessType: category ?? resultType ?? null,
      note: remark ?? null,
      diagnosisSessionId: diagnosisSessionId ?? null,
    });

    console.log(`[leads] ✅ 新线索创建成功`, {
      leadId: lead.id,
      name,
      businessType: category ?? resultType,
      diagnosisSessionId,
      routeProvider: routeDecision.provider,
      priorityLevel: routeDecision.priorityLevel,
      durationMs: Date.now() - startTime,
    });

    // 【新增】触发 n8n 出图流程（指数退避重试）
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      const notifyPayload = {
        name,
        contact: wechat,
        businessType: category ?? resultType ?? null,
        serviceType: resultType ?? null,
        note: remark ?? null,
        diagnosisSessionId: diagnosisSessionId ?? null,
        productImageUrl: productImage ?? null,
        referenceImageUrl: referenceImage ?? null,
        // 传递路由决策信息供 n8n 使用
        routeProvider: routeDecision.provider,
        priorityLevel: routeDecision.priorityLevel,
      };

      const n8nResult = await withExponentialBackoff(
        async () => {
          const res = await fetch(n8nWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(notifyPayload),
          });
          if (!res.ok) {
            throw new Error(`n8n webhook HTTP ${res.status}`);
          }
          return res.json();
        },
        3,  // maxRetries
        1000  // baseDelayMs
      );

      if (n8nResult.error) {
        console.error(`[leads] ❌ n8n 触发失败（已重试 ${n8nResult.attempts} 次）:`, n8nResult.error);
      } else {
        console.log(`[leads] ✅ n8n 出图流程已触发（尝试 ${n8nResult.attempts} 次）`, {
          leadId: lead.id,
          diagnosisSessionId,
        });
      }
    } else {
      console.warn(`[leads] ⚠️ N8N_WEBHOOK_URL 未配置，跳过出图触发`);
    }

    // 飞书通知（原有逻辑，保持不变）
    const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
    if (webhookUrl) {
      const card = {
        msg_type: "interactive",
        card: {
          header: {
            title: {
              tag: "plain_text",
              content: "🆕 新线索来了",
            },
            template: "purple",
          },
          elements: [
            {
              tag: "div",
              text: {
                tag: "lark_md",
                content: [
                  `**姓名：** ${name}`,
                  `**微信：** ${wechat}`,
                  `**品类：** ${category ?? resultType ?? "-"}`,
                  `**类型：** ${resultType ?? "-"}`,
                  remark ? `**备注：** ${remark}` : null,
                  productImage ? `**产品图：** ${productImage}` : null,
                  referenceImage ? `**参考图：** ${referenceImage}` : null,
                  `**推荐模型：** ${routeDecision.provider === "nanobanana" ? "NanoBanana（高质量）" : "MiniMax（默认）"}`,
                  `**优先级：** ${routeDecision.priorityLevel === "high_value" ? "高价值客户" : "普通客户"}`,
                  routeDecision.reasons.length > 0 ? `**路由原因：** ${routeDecision.reasons.join("；")}` : null,
                ].filter(Boolean).join("\n"),
              },
            },
          ],
        },
      };

      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      }).catch((err) => console.warn("[leads] feishu notify failed:", err));
    }

    return NextResponse.json({
      lead,
      selectedProvider: routeDecision.provider,
      priorityLevel: routeDecision.priorityLevel,
      routeReasons: routeDecision.reasons,
    }, { status: 201 });
  } catch (err) {
    console.error(`[leads] ❌ 创建线索异常:`, err);
    return NextResponse.json({ error: "创建线索失败" }, { status: 500 });
  }
}
