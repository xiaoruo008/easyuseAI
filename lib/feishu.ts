/**
 * lib/feishu.ts — 飞书开放平台 API 辅助函数
 *
 * 环境变量（需在 Vercel / .env 中配置）：
 *   FEISHU_APP_ID     — 飞书应用 App ID
 *   FEISHU_APP_SECRET — 飞书应用 App Secret
 *   FEISHU_BOT_TOKEN  — 长期访问令牌（可选，优先用 tenant_access_token）
 */

const FEISHU_APP_ID = process.env.FEISHU_APP_ID ?? "";
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET ?? "";

// ── tenant_access_token 获取 ────────────────────────────────────

let _cachedToken: { token: string; expiresAt: number } | null = null;

export async function getTenantToken(): Promise<string> {
  if (_cachedToken && Date.now() < _cachedToken.expiresAt - 60_000) {
    return _cachedToken.token;
  }

  const res = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET }),
  });

  if (!res.ok) {
    throw new Error(`获取 tenant_access_token 失败: HTTP ${res.status}`);
  }

  const json = await res.json() as { tenant_access_token: string; expire: number };
  if (!json.tenant_access_token) {
    throw new Error(`获取 tenant_access_token 失败: ${JSON.stringify(json)}`);
  }

  _cachedToken = { token: json.tenant_access_token, expiresAt: Date.now() + json.expire * 1000 };
  return _cachedToken.token;
}

// ── 发送消息 ─────────────────────────────────────────────────

export interface SendTextPayload { msg_type: "text"; content: { text: string } }
export interface SendInteractivePayload {
  msg_type: "interactive";
  content: { card: Record<string, unknown> };
}

export type SendPayload = SendTextPayload | SendInteractivePayload;

export async function feishuSendMessage(
  receiveId: string,
  receiveIdType: "open_id" | "user_id" | "union_id" | "email" | "chat_id",
  payload: SendPayload
): Promise<void> {
  const token = await getTenantToken();

  const res = await fetch("https://open.feishu.cn/open-apis/im/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      receive_id: receiveId,
      receive_id_type: receiveIdType,
      msg_type: payload.msg_type,
      content: JSON.stringify(payload.content),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`飞书发消息失败: HTTP ${res.status} — ${text.slice(0, 200)}`);
  }
}

export async function replyText(messageId: string, text: string): Promise<void> {
  const token = await getTenantToken();

  const res = await fetch(`https://open.feishu.cn/open-apis/im/v1/messages/${messageId}/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      msg_type: "text",
      content: JSON.stringify({ text }),
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`飞书回复消息失败: HTTP ${res.status} — ${t.slice(0, 200)}`);
  }
}

// ── 新线索通知 ───────────────────────────────────────────────
// 发送到飞书群或指定用户
// 环境变量：FEISHU_CONSULTANT_BOT_ID（群机器人 ID 或用户 open_id）

export interface LeadNotification {
  name: string;
  phone: string;
  company?: string | null;
  serviceType?: string | null;
  note?: string | null;
  diagnosisSessionId?: string | null;
}

export async function notifyNewLead(lead: LeadNotification): Promise<void> {
  const botId = process.env.FEISHU_CONSULTANT_BOT_ID;
  if (!botId) {
    console.warn("[feishu] FEISHU_CONSULTANT_BOT_ID 未配置，跳过线索通知");
    return;
  }

  const token = await getTenantToken();

  const card = {
    header: {
      title: { tag: "plain_text", content: "🆕 新线索提交" },
      template: "red",
    },
    elements: [
      {
        tag: "div",
        text: { tag: "lark_md", content: `**姓名：** ${lead.name}\n**电话：** ${lead.phone}\n**公司：** ${lead.company ?? "—"}\n**需求类型：** ${lead.serviceType ?? "—"}\n**备注：** ${lead.note ?? "无"}` },
      },
      {
        tag: "action",
        actions: [
          {
            tag: "button",
            text: { tag: "plain_text", content: "查看详情 →" },
            type: "primary",
            url: `https://easyuse-ai.vercel.app/dashboard/leads`,
          },
        ],
      },
    ],
  };

  const res = await fetch("https://open.feishu.cn/open-apis/im/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      receive_id: botId,
      receive_id_type: "chat_id",
      msg_type: "interactive",
      content: JSON.stringify({ card }),
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`飞书线索通知失败: HTTP ${res.status} — ${t.slice(0, 200)}`);
  }
}
