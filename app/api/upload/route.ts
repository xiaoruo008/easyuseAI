import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    // ── multipart/form-data：文件上传 → 返回 data URL ───────────────
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "缺少文件" }, { status: 400 });
      }

      // 检查文件类型
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "只支持图片文件" }, { status: 400 });
      }

      // 读取为 ArrayBuffer → base64 → data URL
      // 不写服务器文件系统，Vercel serverless 友好
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      console.log(`[Upload] file=${file.name} size=${file.size} type=${file.type} dataUrlLength=${dataUrl.length}`);

      return NextResponse.json({ url: dataUrl }, { status: 201 });
    }

    // ── application/json：base64 图片 ────────────────────────────────
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { base64, mimeType = "image/jpeg", filename: requestedName } = body as {
        base64?: string;
        mimeType?: string;
        filename?: string;
      };

      if (!base64) {
        return NextResponse.json({ error: "缺少 base64" }, { status: 400 });
      }

      const dataUrl = `data:${mimeType};base64,${base64}`;
      return NextResponse.json({ url: dataUrl }, { status: 201 });
    }

    return NextResponse.json({ error: "不支持的 Content-Type" }, { status: 415 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Upload] ❌ unexpected error:", message);
    return NextResponse.json({ error: `上传失败: ${message}` }, { status: 500 });
  }
}
