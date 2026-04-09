/**
 * app/api/feishu/events/route.ts
 *
 * 飞书开放平台事件订阅 Webhook 入口
 *
 * 配置路径：飞书开放平台 → 应用功能 → 事件订阅
 * 事件订阅 URL：https://easyuse-ai.vercel.app/api/feishu/events
 *
 * 性能要求：主 POST handler 必须 < 1s 返回 { code: 0 }
 * 外部调用（AI / 飞书回复）通过 waitUntil 后台执行，不阻塞主流程
 */

import { NextRequest, NextResponse } from "next/server";
import { handleCommand } from "@/lib/commands";

// Vercel adds waitUntil to the global scope in the Node runtime
const _ctx = globalThis as typeof globalThis & { waitUntil?: (p: Promise<void>) => void };

// ── Challenge 处理 ─────────────────────────────────────────

function returnChallenge(challenge: string): NextResponse {
  return NextResponse.json({ challenge });
}

// ── GET: Challenge 验证 ─────────────────────────────────────
// 飞书在事件订阅页面点"验证地址"时发送 GET 请求

export async function GET(req: NextRequest) {
  const challenge = req.nextUrl.searchParams.get("challenge");
  if (!challenge) {
    return NextResponse.json({ error: "challenge required" }, { status: 400 });
  }
  return returnChallenge(challenge);
}

// ── POST: 事件处理（不阻塞原则）────────────────────────────
// 外部调用通过 Vercel waitUntil 后台执行，不阻塞主流程
// 主 handler 在 < 1s 内返回 { code: 0 }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  // ── 1. url_verification — 同步返回 challenge ────────────
  if (body.type === "url_verification") {
    const challenge = (body.challenge as string | undefined) ?? "";
    if (!challenge) {
      return NextResponse.json({ error: "challenge required" }, { status: 400 });
    }
    return returnChallenge(challenge);
  }

  // ── 2. 消息事件 — 异步处理，不阻塞 ─────────────────────
  if (body.header?.event_type === "im.message.receive_v1") {
    const event = body.event as {
      message_id: string;
      sender: { sender_id: { open_id: string } };
      message: { message_type: string; content: string };
    };

    const messageId = event.message_id ?? "";
    const openId = event.sender?.sender_id?.open_id ?? "";
    const messageType = event.message?.message_type ?? "";

    // 非 text 消息直接返回，不处理
    if (messageType !== "text") {
      return NextResponse.json({ code: 0 });
    }

    let text = "";
    try {
      const parsed = JSON.parse((event.message?.content ?? "{}") as string) as { text?: string };
      text = parsed.text ?? "";
    } catch {
      return NextResponse.json({ code: 0 });
    }

    if (!text.trim() || !text.trim().startsWith("/")) {
      return NextResponse.json({ code: 0 });
    }

    // ── 异步处理命令，不阻塞主流程 ─────────────────────
    // 使用 Vercel waitUntil 确保函数实例在回调完成前不被回收
    const bgTask = handleCommand(text, { messageId, userId: openId }).catch((err) => {
      console.error("[feishu] 命令处理异常:", err);
    });
    if (_ctx.waitUntil) {
      _ctx.waitUntil(bgTask);
    }

    // ── 立即返回，不等待 AI/数据库/飞书回复 ────────────────
    return NextResponse.json({ code: 0 });
  }

  // 未知事件类型，直接返回成功
  return NextResponse.json({ code: 0 });
}
