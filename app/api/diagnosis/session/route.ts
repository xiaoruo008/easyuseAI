import { NextResponse } from "next/server";
import { createSession } from "@/lib/db";

export async function POST() {
  try {
    const session = await createSession();
    return NextResponse.json({ id: session.id, step: session.step }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
