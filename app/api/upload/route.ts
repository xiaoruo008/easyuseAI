import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    // ── multipart/form-data：文件上传 ───────────────────
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "缺少文件" }, { status: 400 });
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = file.name.split(".").pop() ?? "jpg";
      const filename = `${Date.now()}.${ext}`;
      const filePath = path.join(uploadDir, filename);
      const bytes = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(bytes));

      return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
    }

    // ── application/json：base64 图片（Google Imagen 等） ───
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

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = mimeType === "image/png" ? "png" : "jpg";
      const fn = requestedName ?? `${Date.now()}.${ext}`;
      const filePath = path.join(uploadDir, fn);
      fs.writeFileSync(filePath, Buffer.from(base64, "base64"));

      return NextResponse.json({ url: `/uploads/${fn}` }, { status: 201 });
    }

    return NextResponse.json({ error: "不支持的 Content-Type" }, { status: 415 });
  } catch {
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
