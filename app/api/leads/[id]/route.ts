import { NextRequest, NextResponse } from "next/server";
import { getLead, updateLead } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) return NextResponse.json({ error: "线索不存在" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  try {
    const lead = await updateLead(id, body);
    return NextResponse.json(lead);
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 404 });
  }
}
