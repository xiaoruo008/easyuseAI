// lib/ai.ts — 统一 AI 调用层
// 兼容 OpenAI / DeepSeek / 通义千问 / 任何 OpenAI-compatible API
//
// 环境变量：
//   AI_API_KEY   — API 密钥（必填，否则 fallback 到 mock）
//   AI_BASE_URL  — API 地址（默认 https://api.deepseek.com/v1）
//   AI_MODEL     — 模型名（默认 deepseek-chat）

const API_KEY = process.env.AI_API_KEY ?? "";
const BASE_URL = process.env.AI_BASE_URL ?? "https://api.deepseek.com/v1";
const MODEL = process.env.AI_MODEL ?? "deepseek-chat";

export function isAIEnabled(): boolean {
  return API_KEY.length > 0;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatResponse {
  content: string;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export async function chat(messages: ChatMessage[], timeoutMs = 20000): Promise<ChatResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 150,
    }),
    signal: controller.signal,
  });
  clearTimeout(timer);

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown error");
    throw new Error(`AI API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  if (!choice?.message?.content) {
    throw new Error("AI API returned empty response");
  }

  return {
    content: choice.message.content,
    model: data.model ?? MODEL,
    usage: data.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  };
}

// ─── 任务 Prompt 模板 ──────────────────────────────────────────

const PROMPTS: Record<string, (ctx: TaskContext) => ChatMessage[]> = {
  copywriting: (ctx) => [
    { role: "system", content: "你是一个专业的社交媒体营销文案专家。用户是中国中小商家，不懂技术，需要直接可用的引流文案。输出3条完整文案，每条包含【标题】和【正文】和【引导语】。不要解释，直接给文案。" },
    { role: "user", content: `我的业务类型是：${ctx.businessType ?? "电商"}。我的核心痛点是：${ctx.painPoint ?? "内容没人看"}。请帮我生成3条适合发朋友圈/小红书的引流文案。` },
  ],
  headline: (ctx) => [
    { role: "system", content: "你是爆款标题专家。针对中国中小商家，生成10个高点击率标题。每个标题一行，前面加序号。不要解释。" },
    { role: "user", content: `我的业务类型是：${ctx.businessType ?? "电商"}。痛点：${ctx.painPoint ?? "获客难"}。请生成10个爆款标题。` },
  ],
  product_desc: (ctx) => [
    { role: "system", content: "你是电商详情页文案专家。输出3段商品描述：【核心卖点】【用户证言】【限时优惠】。直接给文案，不要解释。" },
    { role: "user", content: `业务类型：${ctx.businessType ?? "电商"}。请为我的产品生成商品详情页描述。` },
  ],
  reply_script: (ctx) => [
    { role: "system", content: "你是客服话术专家。生成3套客服回复话术，分别应对：客户问价、客户犹豫、客户议价。每套包含完整回复内容。不要解释。" },
    { role: "user", content: `业务类型：${ctx.businessType ?? "服务"}。痛点：${ctx.painPoint ?? "客服回复慢"}。请生成3套客服标准话术。` },
  ],
  welcome_msg: () => [
    { role: "system", content: "你是客户运营专家。生成3条新客户欢迎语，适合微信/企微自动发送。语气亲切专业。不要解释。" },
    { role: "user", content: "请生成3条新客户欢迎语模板。" },
  ],
  follow_up: () => [
    { role: "system", content: "你是客户唤醒专家。生成3条沉默客户跟进文案，语气不能太推销，要自然贴心。不要解释。" },
    { role: "user", content: "请生成3条沉默客户唤醒文案。" },
  ],
  report: () => [
    { role: "system", content: "你是数据分析专家。模拟生成一份月度销售汇总报表，包含总订单、营收、热销TOP3、复购率。用真实感的数字。不要解释。" },
    { role: "user", content: "请生成一份6月份月度销售汇总报表。" },
  ],
  plan: (ctx) => [
    { role: "system", content: "你是商业顾问。根据用户情况，生成一份30天行动计划，分4周，每周有明确目标和具体动作。不要解释。" },
    { role: "user", content: `业务类型：${ctx.businessType ?? "未知"}。痛点：${ctx.painPoint ?? "方向不明确"}。请生成30天行动计划。` },
  ],
};

export interface TaskContext {
  businessType?: string;
  painPoint?: string;
  userInput?: string;
}

export interface GenerateResult {
  title: string;
  items: string[];
  source: "ai" | "mock";
  model?: string;
}

export async function generateContent(
  action: string,
  ctx: TaskContext
): Promise<GenerateResult> {
  const promptFn = PROMPTS[action];
  if (!promptFn || !isAIEnabled()) {
    throw new Error("NO_AI");
  }

  const messages = promptFn(ctx);
  const response = await chat(messages);

  const lines = response.content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const ACTION_TITLES: Record<string, string> = {
    copywriting: "生成结果：3条引流文案",
    headline: "生成结果：10个爆款标题",
    product_desc: "生成结果：商品详情页描述",
    reply_script: "生成结果：客服回复话术",
    welcome_msg: "生成结果：新客户欢迎语",
    follow_up: "生成结果：沉默客户唤醒文案",
    report: "生成结果：月度汇总报表",
    plan: "生成结果：30天行动计划",
  };

  return {
    title: ACTION_TITLES[action] ?? "生成完成",
    items: lines,
    source: "ai",
    model: response.model,
  };
}

// ─── 健康检查 ────────────────────────────────────────────────

export interface HealthCheckResult {
  ok: boolean;
  model?: string;
  status: number;
  content?: string;
  error?: string;
}

export async function healthCheckAI(): Promise<HealthCheckResult> {
  if (!API_KEY) {
    return { ok: false, status: 0, error: "No API key configured" };
  }
  try {
    const res = await fetch(`${BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        ok: true,
        status: res.status,
        model: data.model ?? MODEL,
        content: JSON.stringify(data).slice(0, 100),
      };
    }
    return { ok: false, status: res.status, error: `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, status: 0, error: String(err) };
  }
}
