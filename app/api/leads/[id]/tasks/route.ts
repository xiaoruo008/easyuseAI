import { NextRequest, NextResponse } from "next/server";
import { getTasksByLead } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "缺少 leadId" }, { status: 400 });
  const tasks = await getTasksByLead(id);
  return NextResponse.json({ tasks });
}
