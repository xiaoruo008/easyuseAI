import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    AI_API_KEY_exists: !!process.env.AI_API_KEY,
    AI_API_KEY_length: (process.env.AI_API_KEY ?? "").length,
    AI_API_KEY_preview: process.env.AI_API_KEY ? process.env.AI_API_KEY.slice(0, 10) + "..." : "EMPTY",
    AI_BASE_URL: process.env.AI_BASE_URL ?? "not set",
    AI_MODEL: process.env.AI_MODEL ?? "not set",
    REPLICATE_API_TOKEN_exists: !!process.env.REPLICATE_API_TOKEN,
  });
}
