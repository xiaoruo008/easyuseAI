import { NextRequest, NextResponse } from "next/server";
import { createTask, updateTask, getOrCreateLeadForSession } from "@/lib/db";
import { generateContent, isAIEnabled, healthCheckAI } from "@/lib/ai";
import { generateImageFromOptions } from "@/lib/image";
import type { GenerateResult } from "@/lib/ai";
import type { ImageTaskOutput } from "@/lib/image";
import { routeFromAction, getRetryPrompt, WORKFLOW_TO_TEMPLATE_KEY_MAP, findRoute, PATTERN_PROMPTS } from "@/lib/types/fashion";
import { deriveFashionFieldsFromDiagnosis } from "@/lib/diagnosis-workflow-map";
import type { ResultType } from "@/lib/diagnosis";

// ── 静态文案结果 ─────────────────────────────────
const MOCK_TEXT_RESULTS: Record<string, { title: string; items: string[] }> = {
  copywriting: {
    title: "生成结果：3条引流文案",
    items: [
      "【标题】闺蜜以为我花了3000，其实我只用了一个免费工具",
      "【正文】昨天帮一位开女装店的老板用这个方法，1条朋友圈带来了3400元成交……",
      "【引导】评论区扣「方法」，我把教程发给你",
    ],
  },
  headline: {
    title: "生成结果：10个爆款标题",
    items: [
      "用了这个方法，我的订单从每天3单变成了20单",
      "一个设置，让我的小红书点赞从10个涨到了800个",
    ],
  },
  product_desc: {
    title: "生成结果：商品详情页描述",
    items: [
      "【核心卖点】精选材质，透气舒适，穿一整天也不累",
      "【用户证言】已经帮助3000+用户解决XX问题，好评率98%",
    ],
  },
  reply_script: {
    title: "生成结果：10套客服话术",
    items: [
      "客户问价：「您好！这款目前活动价¥299，比平时省60元，还赠送……」",
      "客户犹豫：「非常理解您的顾虑，我可以帮您申请延长保修……」",
    ],
  },
  welcome_msg: {
    title: "生成结果：新客户欢迎语",
    items: [
      "欢迎！感谢您的信任，我会尽快跟进您的需求",
      "我们会在24小时内为您准备专属方案，请保持电话畅通",
    ],
  },
  follow_up: {
    title: "生成结果：沉默客户唤醒文案",
    items: [
      "Hi，上次看到您浏览了我们的页面，一直没下单，是否还有顾虑？",
    ],
  },
  report: {
    title: "生成结果：月度汇总报表",
    items: [
      "【6月汇总】总订单847单，总营收¥213,450，较上月↑18.3%",
    ],
  },
  data_clean: {
    title: "生成结果：数据清洗完成",
    items: [
      "原始数据12,847条，去重后有效数据12,031条",
    ],
  },
  schedule: {
    title: "生成结果：30天执行排期表",
    items: [
      "第1-7天：梳理产品卖点，收集用户反馈，建立内容素材库",
    ],
  },
  consult: {
    title: "已记录您的意向",
    items: ["顾问将在24小时内添加您的微信", "请保持手机畅通"],
  },
  plan: {
    title: "生成结果：30天行动计划",
    items: ["第1周：解决获客问题", "第2周：验证内容效果"],
  },
};

const IMAGE_ACTIONS = new Set([
  "product_photo",
  "model_photo",
  "background_swap",
  "lifestyle",
  "fashion_model",
  "fashion_lifestyle",
]);

const ACTION_TASKTYPE: Record<string, string> = {
  product_photo: "图片生成",
  model_photo: "图片生成",
  background_swap: "图片生成",
  lifestyle: "图片生成",
  fashion_model: "图片生成",
  fashion_lifestyle: "图片生成",
  copywriting: "内容生成",
  headline: "内容生成",
  product_desc: "内容生成",
  reply_script: "客服话术",
  welcome_msg: "客服话术",
  follow_up: "客服话术",
  report: "数据处理",
  data_clean: "数据处理",
  schedule: "数据处理",
  consult: "咨询规划",
  plan: "咨询规划",
};

// ── 图片生成（带重试降级）─────────────────────────────

async function generateImageWithRetry(opts: {
  templateId: string;
  originalImageUrl?: string;
  userRefinement?: string;
  aspectRatio?: string;
  category?: string;
}): Promise<{ output: ImageTaskOutput; errorMessage: string | null }> {
  const { templateId, originalImageUrl, userRefinement, aspectRatio } = opts;

  // 第1次：正常生成
  try {
    const output = await generateImageFromOptions({
      templateId,
      variables: {},
      originalImageUrl,
      userRefinement,
      aspectRatio: (aspectRatio as "1:1" | "3:4" | "16:9") ?? "1:1",
    });
    return { output, errorMessage: null };
  } catch (err) {
    console.error(`[generate] 第1次失败: ${(err as Error).message}`);
  }

  // 第2次：换安全提示词重试
  try {
    const safeRefinement = getRetryPrompt(1);
    const output = await generateImageFromOptions({
      templateId,
      variables: {},
      originalImageUrl,
      userRefinement: safeRefinement + (userRefinement ? ` ${userRefinement}` : ""),
      aspectRatio: (aspectRatio as "1:1" | "3:4" | "16:9") ?? "1:1",
    });
    return { output, errorMessage: "prompt_v2" };
  } catch (err) {
    console.error(`[generate] 第2次失败: ${(err as Error).message}`);
  }

  // 第3次：降级为白底图（最稳定输出）
  try {
    console.warn(`[generate] 降级为白底图`);
    const output = await generateImageFromOptions({
      templateId: "bg_white",
      variables: {},
      originalImageUrl,
      aspectRatio: "1:1",
    });
    return { output, errorMessage: "stable_fallback" };
  } catch (err) {
    const msg = (err as Error).message;
    console.error(`[generate] 白底降级也失败: ${msg}`);
    return {
      output: {
        imageUrl: "https://placehold.co/800x800/1a1a2e/ffffff?text=Generation+Failed",
        provider: "error",
        model: "none",
        generatedAt: new Date().toISOString(),
      },
      errorMessage: msg,
    };
  }
}

// ── POST handler ───────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "无效请求" }, { status: 400 });

  // ── MiniMax 健康检查（异步打日志，不阻塞主流程）────────────
  // 使用 waitUntil 确保在响应返回后仍能完成日志记录
  const ctx = globalThis as typeof globalThis & { waitUntil?: (p: Promise<void>) => void };
  if (ctx.waitUntil) {
    ctx.waitUntil(
      healthCheckAI().then((hc) => {
        if (hc.ok) {
          console.log(`[healthCheck] ✅ MiniMax 可用 | model=${hc.model} | HTTP ${hc.status}`);
        } else {
          console.error(`[healthCheck] ❌ MiniMax 不可用 | model=${hc.model} | HTTP ${hc.status} | error=${hc.error}`);
        }
      }).catch(() => {})
    );
  }

  const {
    sessionId,
    action,
    type,
    leadId: reqLeadId,
    businessType,
    painPoint,
    prompt,
    style,
    aspectRatio,
    referenceImageUrl,
    // 结构化字段（可选）
    market,
    gender,
    category,
    targetImage,
    referenceQuality,
    workflowKey,
    // 诊断上下文（用于 prompt 增强）
    userBusinessType,
    userPainPoint,
    userPersona,
  } = body as {
    sessionId?: string;
    action: string;
    type?: string;
    leadId?: string;
    businessType?: string;
    painPoint?: string;
    prompt?: string;
    style?: string;
    aspectRatio?: string;
    referenceImageUrl?: string;
    market?: string;
    gender?: string;
    category?: string;
    targetImage?: string;
    referenceQuality?: string;
    workflowKey?: string;
    userBusinessType?: string;
    userPainPoint?: string;
    userPersona?: string;
  };

  const isImageAction = IMAGE_ACTIONS.has(action);
  const taskType = ACTION_TASKTYPE[action] ?? "内容生成";

  // 解析 leadId
  let resolvedLeadId = reqLeadId ?? "";
  if (!resolvedLeadId && sessionId) {
    try {
      const lead = await getOrCreateLeadForSession(sessionId);
      resolvedLeadId = lead?.id ?? "";
    } catch {
      // ignore
    }
  }

  // ── 图片生成 ─────────────────────────────────────
  if (isImageAction) {
    // 推导时尚字段：当未明确提供时，从诊断结果类型推导
    const derivedFields = deriveFashionFieldsFromDiagnosis(
      (type ?? "unclear") as ResultType,
      action
    );
    
    // 解析模板路由（使用推导的或明确提供的字段）
    const cat = (category ?? derivedFields.category) as string;
    const resolvedMarket = market ?? derivedFields.market;
    const resolvedGender = gender ?? derivedFields.gender;
    const resolvedTargetImage = targetImage ?? derivedFields.targetImage;
    
    // 优先使用 workflowKey 翻译（Result API → Execute API）
    let route = null;
    if (workflowKey && WORKFLOW_TO_TEMPLATE_KEY_MAP[workflowKey]) {
      const templateKey = WORKFLOW_TO_TEMPLATE_KEY_MAP[workflowKey];
      route = findRoute(templateKey) ?? null;
    }
    
    // 回退到 routeFromAction 逻辑
    if (!route) {
      route = routeFromAction(action, cat as Parameters<typeof routeFromAction>[1]);
    }

    if (!route) {
      return NextResponse.json({ error: `未知 action: ${action}` }, { status: 400 });
    }

    const templateId = route.templateId;
    const templateKey = route.key;

    // 从 PATTERN_PROMPTS 获取图案指导（作为生成基础 prompt）
    const basePatternPrompt = PATTERN_PROMPTS[templateKey] ?? null;

    // ① 建 Task
    const taskId = resolvedLeadId
      ? await createTask({
          leadId: resolvedLeadId,
          taskType,
          status: "doing",
          inputData: { action, templateId, userPrompt: prompt, referenceImageUrl, aspectRatio },
          outputData: null,
          market: resolvedMarket,
          gender: resolvedGender,
          category: cat,
          targetImage: resolvedTargetImage,
          referenceQuality: referenceQuality ?? "medium",
          templateKey,
          promptVersion: 1,
          moderationRiskLevel: route.moderationRiskLevel,
          retryStrategy: undefined,
        }).then((t) => (t as { id: string }).id)
      : null;

    // 构建诊断上下文注入 prompt（增强 MiniMax 生成效果）
    const ctxParts: string[] = [];
    if (userPersona) ctxParts.push(`目标用户：${userPersona}`);
    if (userPainPoint) ctxParts.push(`核心需求：${userPainPoint}`);
    if (userBusinessType) ctxParts.push(`业务类型：${userBusinessType}`);
    if (style) ctxParts.push(`风格：${style}`);
    const diagnosisContext = ctxParts.length > 0 ? `${ctxParts.join("，")}。` : "";
    const enrichedPrompt = `${diagnosisContext}${prompt ?? ""}`.trim();

    // 构建最终 prompt：图案指导 + 诊断上下文 + 用户输入
    const finalPrompt = basePatternPrompt
      ? `${basePatternPrompt} ${enrichedPrompt}`.trim()
      : enrichedPrompt;

    // ② 执行生成（带重试降级）
    const { output, errorMessage } = await generateImageWithRetry({
      templateId,
      originalImageUrl: referenceImageUrl,
      userRefinement: finalPrompt,
      aspectRatio,
      category: cat,
    });

    // ③ 写回 Task
    if (taskId) {
      await updateTask(taskId, {
        status: errorMessage ? "failed" : "done",
        outputData: {
          imageUrl: output.imageUrl,
          thumbnailUrl: output.thumbnailUrl,
          provider: output.provider,
          model: output.model,
          generatedAt: output.generatedAt,
        },
        errorMessage,
        templateKey,
        promptVersion: errorMessage ? 2 : 1,
        retryStrategy: errorMessage ? (errorMessage === "prompt_v2" ? "safe_prompt" : "stable_output") : undefined,
      });
    }

    return NextResponse.json({
      success: !errorMessage,
      action,
      type,
      taskCategory: "image",
      taskId,
      templateKey,
      templateId,
      result: {
        imageUrl: output.imageUrl,
        thumbnailUrl: output.thumbnailUrl,
        provider: output.provider,
        model: output.model,
      },
      source: output.provider === "mock" || output.provider === "error" ? "mock" : "ai",
      generatedAt: output.generatedAt,
      error: errorMessage,
    });
  }

  // ── 文案生成 ─────────────────────────────────────
  let result: GenerateResult;
  let errorMessage: string | null = null;

  if (resolvedLeadId) {
    await createTask({
      leadId: resolvedLeadId,
      taskType,
      status: "doing",
      inputData: { action, type, businessType, painPoint },
      outputData: null,
    }).then((t) => t as { id: string });
  }

  if (isAIEnabled()) {
    try {
      result = await generateContent(action, { businessType: businessType ?? type, painPoint });
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "生成失败";
      const mock = MOCK_TEXT_RESULTS[action] ?? { title: "生成完成", items: ["结果已生成"] };
      result = { ...mock, source: "mock" };
    }
  } else {
    await new Promise((r) => setTimeout(r, 800));
    const mock = MOCK_TEXT_RESULTS[action] ?? { title: "生成完成", items: ["结果已生成"] };
    result = { ...mock, source: "mock" };
  }

  return NextResponse.json({
    success: !errorMessage,
    action,
    type,
    taskCategory: "text",
    result: { title: result.title, items: result.items },
    source: result.source,
    model: result.model,
    generatedAt: new Date().toISOString(),
    error: errorMessage,
  });
}
