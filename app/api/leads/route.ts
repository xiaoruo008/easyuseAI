import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, contact, businessType, note, diagnosisSessionId } = body;

    if (!name || !contact) {
      return NextResponse.json({ error: "姓名和联系方式必填" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        contact,
        businessType: businessType ?? null,
        note: note ?? null,
        status: "NEW",
        diagnosisSessionId: diagnosisSessionId ?? null,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建线索失败" }, { status: 500 });
  }
}
