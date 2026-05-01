import { NextRequest, NextResponse } from "next/server";
import { uploadToImgBB } from "@/lib/storage/imgbb-uploader";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    // ── multipart/form-data：文件上传 → imgBB ─────────────────────────
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "缺少文件" }, { status: 400 });
      }

      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "只支持图片文件" }, { status: 400 });
      }

      // 上传到 imgBB，返回真实 HTTPS URL
      const result = await uploadToImgBB(file);

      console.log(`[Upload] ✅ imgBB: ${file.name} → ${result.url} (${result.size} bytes)`);

      return NextResponse.json({ url: result.url, thumbnailUrl: result.thumb }, { status: 201 });
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

      // 构造 data URL 传给 imgBB uploader
      const dataUrl = `data:${mimeType};base64,${base64}`;
      const result = await uploadToImgBB(dataUrl, requestedName);

      return NextResponse.json({ url: result.url, thumbnailUrl: result.thumb }, { status: 201 });
    }

    return NextResponse.json({ error: "不支持的 Content-Type" }, { status: 415 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Upload] ❌ error:", message);
    return NextResponse.json({ error: `上传失败: ${message}` }, { status: 500 });
  }
}
