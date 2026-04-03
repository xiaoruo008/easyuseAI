import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await prisma.diagnosisSession.create({
      data: { step: 1, answers: {}, completed: false },
    });
    return NextResponse.json({ id: session.id, step: session.step }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
