import { NextRequest, NextResponse } from "next/server";
import { createLead, getAllLeads } from "@/lib/db";

export async function GET() {
  const leads = await getAllLeads();
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, contact, phone, businessType, serviceType, note, diagnosisSessionId } = body;

    const contactValue = contact || phone;
    if (!name || !contactValue) {
      return NextResponse.json({ error: "姓名和联系方式必填" }, { status: 400 });
    }

    const lead = await createLead({
      name,
      contact: contactValue,
      businessType: businessType ?? serviceType ?? null,
      note: note ?? null,
      diagnosisSessionId: diagnosisSessionId ?? null,
    });

    return NextResponse.json(lead, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建线索失败" }, { status: 500 });
  }
}
