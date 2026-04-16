import { NextRequest, NextResponse } from "next/server";
import { createLead, getAllLeads, getSession } from "@/lib/db";
import { routeGenerationModel, type RouteDecisionInput } from "@/lib/route-decision";

export async function GET() {
  const leads = await getAllLeads();
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
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
      brandStyle: (sessionData?.answers as Record<string, unknown>)?.brandStyle as string | undefined,
      hasProductImage: Boolean(productImage),
      hasReferenceImage: Boolean(referenceImage),
      hasWechat: Boolean(wechat),
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

    // 飞书通知
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
  } catch {
    return NextResponse.json({ error: "创建线索失败" }, { status: 500 });
  }
}
