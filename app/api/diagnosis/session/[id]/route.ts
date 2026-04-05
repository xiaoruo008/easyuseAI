import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: "Session 不存在" }, { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  try {
    const session = await updateSession(id, body);
    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 404 });
  }
}
