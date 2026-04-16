import { NextRequest, NextResponse } from "next/server";
import { createLead, getAllLeads } from "@/lib/db";

export async function GET() {
  const leads = await getAllLeads();
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, wechat, category, platform, resultType, productImage, referenceImage, remark } = body;

    if (!name || !wechat) {
      return NextResponse.json({ error: "姓名和微信号必填" }, { status: 400 });
    }

    const lead = await createLead({
      name,
      contact: wechat,
      businessType: category ?? resultType ?? null,
      note: remark ?? null,
      diagnosisSessionId: null,
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

    return NextResponse.json(lead, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建线索失败" }, { status: 500 });
  }
}
