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

    // n8n webhook 通知（失败不阻塞主流程）
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          wechat,
          category: category ?? null,
          platform: platform ?? null,
          resultType: resultType ?? null,
          productImage: productImage ?? null,
          referenceImage: referenceImage ?? null,
          remark: remark ?? null,
        }),
      }).catch((err) => console.warn("[leads] n8n webhook failed:", err));
    }

    return NextResponse.json(lead, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建线索失败" }, { status: 500 });
  }
}
