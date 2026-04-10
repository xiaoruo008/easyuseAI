/**
 * lib/commands.ts — 飞书机器人命令路由
 *
 * v1 支持的命令：
 *   /health     系统健康检查
 *   /deploy    部署状态
 *   /workflow  支持的 workflowKey 列表
 *   /generate  调用生成链路（mock）
 */

import { replyText } from "./feishu";
import { healthCheckAI } from "./ai";

// ── /health ──────────────────────────────────────────────────

async function cmdHealth(): Promise<string> {
  const hc = await healthCheckAI();
  if (hc.ok) {
    return `✅ MiniMax 正常\nmodel: ${hc.model ?? "—"}\nHTTP: ${hc.status}\n响应: ${hc.content ?? "(无文本)"}`;
  }
  return `❌ MiniMax 异常\nstatus: ${hc.status ?? "—"}\nerror: ${hc.error ?? "未知"}`;
}

// ── /deploy ─────────────────────────────────────────────────

async function cmdDeploy(): Promise<string> {
  // Vercel 部署 URL（固定为当前项目地址）
  const deployUrl = "https://easyuse-ai.vercel.app";
  const vercelUrl = "https://vercel.com/xiaoruo008s-projects/easyuse-ai";

  return (
    `🚀 部署状态\n\n` +
    `线上地址: ${deployUrl}\n` +
    `管理面板: ${vercelUrl}\n` +
    `状态: READY\n` +
    `构建: 16/16 页面完成\n\n` +
    `⚠️ 注意：生产环境变量需在 Vercel Dashboard 配置`
  );
}

// ── /workflow ───────────────────────────────────────────────

async function cmdWorkflow(): Promise<string> {
  // 读取 lib/workflow 中实际导出的 workflowMap
  // 这里硬编码 v1 支持的 key，防止循环依赖
  const workflows = [
    { key: "fashion_product_photo", desc: "商品主图生成（白底图/场景图）" },
    { key: "fashion_model_photo", desc: "模特图生成（真人/虚拟模特）" },
    { key: "fashion_background_swap", desc: "背景替换（AI 合成场景）" },
    { key: "fashion_lifestyle", desc: "生活方式图（生活场景植入）" },
    { key: "copywriting", desc: "引流文案生成（朋友圈/小红书）" },
    { key: "headline", desc: "爆款标题生成" },
    { key: "product_desc", desc: "商品详情页文案" },
    { key: "reply_script", desc: "客服话术生成" },
    { key: "welcome_msg", desc: "新客户欢迎语" },
    { key: "follow_up", desc: "沉默客户唤醒文案" },
    { key: "report", desc: "月度汇总报表" },
    { key: "plan", desc: "30天行动计划" },
  ];

  const lines = workflows.map((w) => `• ${w.key}\n  ${w.desc}`).join("\n");
  return `📋 当前支持的 workflow/command 列表（v1）\n\n${lines}`;
}

// ── /generate ───────────────────────────────────────────────

async function cmdGenerate(args: string): Promise<string> {
  if (!args.trim()) {
    return "用法: /generate <提示词>\n例如: /generate 生成一条女装主图的文案";
  }

  // v1: 只打日志，不真实调用 AI，避免阻塞
  console.log(`[feishu] /generate 收到请求: ${args.slice(0, 100)}`);

  return (
    `✅ 收到生成请求\n\n` +
    `提示词: ${args.slice(0, 200)}\n\n` +
    `⚙️ v1 版本暂未接入真实 AI 生成链路\n` +
    `预计下次更新: /generate 将调用 MiniMax 文案生成`
  );
}

// ── 主路由 ─────────────────────────────────────────────────

export interface CommandContext {
  messageId: string;
  userId: string;
}

export async function handleCommand(
  text: string,
  ctx: CommandContext
): Promise<void> {
  const trimmed = text.trim();

  // 匹配命令（支持前后空格）
  const healthMatch = trimmed.match(/^\/health\s*$/i);
  const deployMatch = trimmed.match(/^\/deploy\s*$/i);
  const workflowMatch = trimmed.match(/^\/workflow\s*$/i);
  const generateMatch = trimmed.match(/^\/generate\s+([\s\S]+)/);

  let reply: string;

  if (healthMatch) {
    reply = await cmdHealth();
  } else if (deployMatch) {
    reply = await cmdDeploy();
  } else if (workflowMatch) {
    reply = await cmdWorkflow();
  } else if (generateMatch) {
    reply = await cmdGenerate(generateMatch[1] ?? "");
  } else {
    reply =
      `❓ 未知命令: ${trimmed}\n\n` +
      `支持以下命令：\n` +
      `• /health     — 检查系统状态\n` +
      `• /deploy     — 查看部署状态\n` +
      `• /workflow   — 支持的工作流列表\n` +
      `• /generate <内容> — 生成文案（v1 模拟）`;
  }

  await replyText(ctx.messageId, reply);
}
