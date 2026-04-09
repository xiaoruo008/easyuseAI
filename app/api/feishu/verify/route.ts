/**
 * app/api/feishu/verify/route.ts
 *
 * 极简飞书回调验证路由 —— 专门用于飞书后台"地址校验"
 * 不依赖数据库、SDK、环境变量，纯同步返回，无任何 IO。
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const challenge = req.nextUrl.searchParams.get("challenge") ?? "";
  return NextResponse.json({ challenge });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  // url_verification
  if (body?.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge ?? "" });
  }

  // 所有其他事件直接返回 code:0
  return NextResponse.json({ code: 0 });
}
