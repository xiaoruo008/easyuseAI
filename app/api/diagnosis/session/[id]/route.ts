import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await prisma.diagnosisSession.findUnique({ where: { id } });
  if (!session) return NextResponse.json({ error: "Session 不存在" }, { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { step, answers, completed, resultType, confidence } = body;

  try {
    const session = await prisma.diagnosisSession.update({
      where: { id },
      data: {
        ...(step !== undefined && { step }),
        ...(answers !== undefined && { answers }),
        ...(completed !== undefined && { completed }),
        ...(resultType !== undefined && { resultType }),
        ...(confidence !== undefined && { confidence }),
      },
    });
    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 404 });
  }
}
