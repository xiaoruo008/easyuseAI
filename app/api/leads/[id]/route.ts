import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { conversations: { orderBy: { createdAt: "asc" } } },
  });
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
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.contact !== undefined && { contact: body.contact }),
        ...(body.businessType !== undefined && { businessType: body.businessType }),
        ...(body.note !== undefined && { note: body.note }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });
    return NextResponse.json(lead);
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 404 });
  }
}
