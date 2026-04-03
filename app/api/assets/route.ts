import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const leadId = formData.get("leadId") as string | null;

    if (!file || !leadId) {
      return NextResponse.json({ error: "缺少 file 或 leadId" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Asset 简化：仅返回上传信息，不入库（避免与新 Lead/Diagnosis/Task 结构冲突）
    const asset = {
      id: Math.random().toString(36).slice(2),
      leadId,
      type: file.type.startsWith("image/") ? "image" : "document",
      filename: file.name,
      url: `/uploads/${filename}`,
      size: file.size,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(asset, { status: 201 });
  } catch {
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
