import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      contact,
      businessType,
      serviceType,
      note,
      diagnosisSessionId,
      productImageUrl,
      referenceImageUrl,
    } = body;

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      // n8n URL 未配置时静默跳过，不阻塞主流程
      return NextResponse.json({ skipped: true, reason: "N8N_WEBHOOK_URL not configured" });
    }

    const payload = {
      name,
      contact,
      businessType: businessType || serviceType || null,
      serviceType,
      note,
      diagnosisSessionId,
      productImage: productImageUrl || null,
      referenceImage: referenceImageUrl || null,
      submittedAt: new Date().toISOString(),
    };

    const webhookRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!webhookRes.ok) {
      console.warn("[notify] n8n webhook failed:", webhookRes.status);
      return NextResponse.json({ error: "通知发送失败" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.warn("[notify] n8n webhook error:", err);
    return NextResponse.json({ error: "通知异常" }, { status: 500 });
  }
}
