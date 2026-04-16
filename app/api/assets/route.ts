import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

async function saveFile(file: File | null, uploadDir: string): Promise<{ filename: string; url: string } | null> {
  if (!file) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);
  return { filename, url: `/uploads/${filename}` };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const leadId = formData.get("leadId") as string | null;

    if (!leadId) {
      return NextResponse.json({ error: "缺少 leadId" }, { status: 400 });
    }

    const productImage = formData.get("productImage") as File | null;
    const referenceImage = formData.get("referenceImage") as File | null;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savedFiles = await Promise.all([
      saveFile(productImage, uploadDir),
      saveFile(referenceImage, uploadDir),
    ]);

    const assets = savedFiles.filter((r): r is { filename: string; url: string } => r !== null).map((r, i) => ({
      id: Math.random().toString(36).slice(2),
      leadId,
      type: "image",
      filename: r!.filename,
      url: r!.url,
      size: 0,
      createdAt: new Date().toISOString(),
      role: i === 0 ? "productImage" : "referenceImage",
    }));

    return NextResponse.json(assets, { status: 201 });
  } catch {
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
