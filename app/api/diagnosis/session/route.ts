import { NextResponse } from "next/server";
import { createSession } from "@/lib/db";

export async function POST() {
  try {
    const session = await createSession();
    return NextResponse.json({ id: session.id, step: session.step }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
