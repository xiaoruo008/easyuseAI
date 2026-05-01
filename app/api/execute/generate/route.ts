import { NextRequest, NextResponse } from "next/server";
import { createTask, updateTask, getOrCreateLeadForSession } from "@/lib/db";
import { generateContent, isAIEnabled } from "@/lib/ai";
import { generateImageFromOptions } from "@/lib/image";
import { FalImageProvider } from "@/lib/image/fal-provider";
import type { GenerateResult } from "@/lib/ai";
import type { ImageTaskOutput } from "@/lib/image";
import { routeFromAction, getRetryPrompt, WORKFLOW_TO_TEMPLATE_KEY_MAP, findRoute, PATTERN_PROMPTS, type TargetImage } from "@/lib/types/fashion";
import { deriveFashionFieldsFromDiagnosis } from "@/lib/diagnosis-workflow-map";
import { WORKFLOW_MAP, buildWorkflowKey } from "@/lib/workflow";
import type { ResultType } from "@/lib/diagnosis";
import { buildGarmentDescription, mapChoiceToTemplateKey } from "@/lib/image/user-choices";

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

// P0紧急停止：model_photo/fashion_model/fashion_lifestyle 已禁用（MiniMax character reference 商品保持失败）
const DISABLED_ACTIONS = new Set(["model_photo", "fashion_model", "fashion_lifestyle"]);

const IMAGE_ACTIONS = new Set([
  "product_photo",
  "background_swap",
  "lifestyle",
  "removebg_composite",
]);

const ACTION_TASKTYPE: Record<string, string> = {
  product_photo: "图片生成",
  background_swap: "图片生成",
  lifestyle: "图片生成",
  removebg_composite: "图片生成",
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
  style?: "minimal" | "luxury" | "commercial";
  diagnosisType?: "traffic" | "customer" | "efficiency" | "unclear";
  selectedProvider?: "nanobanana";
}): Promise<{ output: ImageTaskOutput; errorMessage: string | null }> {
  const { templateId, originalImageUrl, userRefinement, aspectRatio, style, diagnosisType, selectedProvider } = opts;

  // 第1次：正常生成
  try {
    const output = await generateImageFromOptions({
      templateId,
      variables: {},
      originalImageUrl,
      userRefinement,
      aspectRatio: (aspectRatio as "1:1" | "3:4" | "16:9") ?? "1:1",
      style,
      diagnosisType,
      selectedProvider,
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
      style,
      diagnosisType,
      selectedProvider,
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
      style,
      diagnosisType,
      selectedProvider,
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

  // ── MiniMax 健康检查（已禁用 — P1紧急停止MiniMax链路）────────────
  // P1紧急：所有MiniMax生图已禁用，货不对版问题必须彻底解决
  // const ctx = globalThis as typeof globalThis & { waitUntil?: (p: Promise<void>) => void };
  // if (ctx.waitUntil) {
  //   ctx.waitUntil(
  //     healthCheckAI().then((hc) => {
  //       if (hc.ok) {
  //         console.log(`[healthCheck] ✅ MiniMax 可用 | model=${hc.model} | HTTP ${hc.status}`);
  //       } else {
  //         console.error(`[healthCheck] ❌ MiniMax 不可用 | model=${hc.model} | HTTP ${hc.status} | error=${hc.error}`);
  //       }
  //     }).catch(() => {})
  //   );
  // }

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
    // 支持前端传来的 originalImageUrl（与 referenceImageUrl 等效）
    originalImageUrl,
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
    diagnosisType,
    // Provider 路由（来自 leads 流程的路由决策）
    selectedProvider,
    // Choice 模式（自动拼 prompt）
    choiceMode,
    extraFeatures,
    scene,
    // 用于 removebg_composite pipeline
    templateAction,
    // 产品图 base64（来自 execute page 新上传）
    productImageBase64,
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
    originalImageUrl?: string;
    market?: string;
    gender?: string;
    category?: string;
    targetImage?: string;
    referenceQuality?: string;
    workflowKey?: string;
    userBusinessType?: string;
    userPainPoint?: string;
    userPersona?: string;
    diagnosisType?: string;
    selectedProvider?: "nanobanana";
    choiceMode?: boolean;
    extraFeatures?: string;
    scene?: string;
    templateAction?: string;
    productImageBase64?: string;
  };

  // === Choice 模式：自动拼 prompt ===
  let autoPrompt: string | undefined;
  let autoWorkflowKey: string | undefined;
  const useChoiceMode = choiceMode === true;

  if (useChoiceMode && category && gender && scene) {
    try {
      autoPrompt = buildGarmentDescription({
        gender: gender as "menswear" | "womenswear" | "unisex",
        category: category as import("@/lib/image/user-choices").ProductCategory,
        extraFeatures,
      });
      autoWorkflowKey = mapChoiceToTemplateKey({
        market: (market ?? "domestic") as "domestic" | "cross_border",
        gender: gender as "menswear" | "womenswear" | "unisex",
        category: category as import("@/lib/image/user-choices").ProductCategory,
        scene: scene as import("@/lib/image/user-choices").SceneType,
      });
    } catch (e) {
      console.warn("[choiceMode] auto prompt build failed, fallback:", e);
    }
  }

  const effectivePrompt = useChoiceMode && autoPrompt ? autoPrompt : prompt;
  const effectiveWorkflowKey = useChoiceMode && autoWorkflowKey ? autoWorkflowKey : workflowKey;

  const isImageAction = IMAGE_ACTIONS.has(action);

  // P0紧急：检查是否在禁用列表
  if (DISABLED_ACTIONS.has(action)) {
    return NextResponse.json(
      {
        error: "该功能暂停服务",
        code: "FEATURE_DISABLED",
        message: "模特上身/生活场景/品牌场景功能因商品保持问题已暂停，请使用「白底图」或「背景替换」",
      },
      { status: 403 }
    );
  }
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
    // Choice 模式下使用自动生成的 effectiveWorkflowKey
    let route = null;
    if (effectiveWorkflowKey && WORKFLOW_TO_TEMPLATE_KEY_MAP[effectiveWorkflowKey]) {
      const templateKey = WORKFLOW_TO_TEMPLATE_KEY_MAP[effectiveWorkflowKey];
      route = findRoute(templateKey) ?? null;
    }

    // 回退到 routeFromAction 逻辑
    // removebg_composite 使用 templateAction 来查询 workflow（action 本身是 pipeline 标识）
    if (!route) {
      const effectiveAction = action === "removebg_composite" ? (templateAction ?? action) : action;
      route = routeFromAction(effectiveAction, cat as Parameters<typeof routeFromAction>[1]);
    }

    if (!route) {
      return NextResponse.json({ error: `未知 action: ${action}` }, { status: 400 });
    }

    const templateId = route.templateId;
    const templateKey = route.key;

    // 根据推导的时尚字段构建 workflowKey，用于查询工作流标签
    const workflowKeyForLabel = buildWorkflowKey({
      market: resolvedMarket as "domestic" | "cross_border",
      gender: resolvedGender as "menswear" | "womenswear",
      category: cat as "top" | "dress" | "suit_set",
      targetImage: resolvedTargetImage as TargetImage,
      contact: "",
    });
    const workflowLabel = WORKFLOW_MAP[workflowKeyForLabel]?.label ?? null;

    // 从 PATTERN_PROMPTS 获取图案指导（作为生成基础 prompt）
    const basePatternPrompt = PATTERN_PROMPTS[templateKey] ?? null;

    // ① 建 Task
    const taskId = resolvedLeadId
      ? await createTask({
          leadId: resolvedLeadId,
          taskType,
          status: "doing",
          inputData: { action, templateId, userPrompt: effectivePrompt, referenceImageUrl, aspectRatio, style },
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

    console.log("[generate] 📥 request payload:", {
      action,
      choiceMode,
      referenceImageUrl,
      originalImageUrl,
      effectiveRefUrl: effectiveRefUrl || "(empty)",
      hasReferenceImage,
      templateId,
    });

    // ── 产品保留约束（当提供了原始产品图时注入）────────────────────
    // 强制要求 AI 保留用户上传的产品主体，不允许替换
    // 支持两种字段名：originalImageUrl（前端新字段）或 referenceImageUrl（API 旧字段）
    const hasReferenceImage = !!(referenceImageUrl || originalImageUrl);
    const effectiveRefUrl = referenceImageUrl || originalImageUrl || "";
    const PRODUCT_PRESERVE_PREFIX = hasReferenceImage
      ? "【产品保留强制约束】The uploaded product image is the ONLY subject. " +
        "KEEP IT 100% IDENTICAL — exact same shape, structure, details, color, pattern, texture. " +
        "DO NOT replace the product. DO NOT generate a different product or object. " +
        "DO NOT add unrelated people or subjects. " +
        "ONLY improve: background, lighting, shadows, environment, visual mood. " +
        "The product must remain completely unchanged. "
      : "";

    // 构建诊断上下文注入 prompt（增强 MiniMax 生成效果）
    const ctxParts: string[] = [];
    if (userPersona) ctxParts.push(`目标用户：${userPersona}`);
    if (userPainPoint) ctxParts.push(`核心需求：${userPainPoint}`);
    if (userBusinessType) ctxParts.push(`业务类型：${userBusinessType}`);
    if (style) ctxParts.push(`风格：${style}`);
    const diagnosisContext = ctxParts.length > 0 ? `${ctxParts.join("，")}。` : "";
    const enrichedPrompt = `${diagnosisContext}${effectivePrompt ?? ""}`.trim();

    // 构建最终 prompt：产品保留约束 + 图案指导 + 诊断上下文 + 用户输入
    // 【新增】如果有 productImageBase64，强制指定产品图为主体
    const basePrompt = basePatternPrompt
      ? `${PRODUCT_PRESERVE_PREFIX}${basePatternPrompt} ${enrichedPrompt}`.trim()
      : `${PRODUCT_PRESERVE_PREFIX}${enrichedPrompt}`.trim();
    const finalPrompt = productImageBase64
      ? `Use the uploaded product image as the main subject. ${basePrompt}`
      : basePrompt;

    // ── removebg_composite: 路由到新版 composite endpoint ───────────────────────
    // 新版流程：Replicate cjwbw/rembg 抠图 → 服务端白底画布合成 → 上传 → 返回最终 URL
    // 保证产品 100% 保留，因为产品是抠图后贴上去的，不是 AI 生成的
    if (action === "removebg_composite") {
      if (!effectiveRefUrl) {
        return NextResponse.json(
          { error: "removebg_composite 需要 originalImageUrl 或 referenceImageUrl", code: "MISSING_IMAGE" },
          { status: 400 }
        );
      }

      // 调用新的 composite endpoint（服务端白底合成）
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
      const compositeRes = await fetch(`${baseUrl}/api/removebg/composite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: effectiveRefUrl,
          aspectRatio: (aspectRatio as "1:1" | "3:4" | "16:9") ?? "1:1",
        }),
      });

      const compositeData = await compositeRes.json();

      if (!compositeRes.ok || !compositeData.success) {
        return NextResponse.json(
          {
            error: compositeData.error ?? "白底图生成失败",
            step: compositeData.step ?? "unknown",
            code: "COMPOSITE_FAILED",
          },
          { status: 502 }
        );
      }

      // 返回与旧版兼容的格式
      return NextResponse.json({
        success: true,
        action: "removebg_composite",
        type: "pipeline",
        step: "done",
        result: compositeData.result,
        source: "ai",
      });
    }

    // ② 执行生成（带重试降级）
    // 使用 effectiveRefUrl：前端 originalImageUrl 或 API referenceImageUrl
    const { output, errorMessage } = await generateImageWithRetry({
      templateId,
      originalImageUrl: effectiveRefUrl || undefined,
      userRefinement: finalPrompt,
      aspectRatio,
      category: cat,
      style: (style as "minimal" | "luxury" | "commercial") ?? undefined,
      diagnosisType: (diagnosisType as "traffic" | "customer" | "efficiency" | "unclear") ?? undefined,
      selectedProvider,
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
      workflowLabel,
      selectedProvider,
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

  // 创建任务并捕获 taskId（与图片生成保持一致）
  const textTaskId = resolvedLeadId
    ? await createTask({
        leadId: resolvedLeadId,
        taskType,
        status: "doing",
        inputData: { action, type, businessType, painPoint },
        outputData: null,
      }).then((t) => (t as { id: string }).id)
    : null;

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

  // 生成完成后更新任务状态（与图片生成保持一致）
  if (textTaskId) {
    await updateTask(textTaskId, {
      status: errorMessage ? "failed" : "done",
      outputData: { title: result.title, items: result.items },
      errorMessage: errorMessage ?? null,
    });
  }

  return NextResponse.json({
    success: !errorMessage,
    action,
    type,
    taskCategory: "text",
    taskId: textTaskId,
    result: { title: result.title, items: result.items },
    source: result.source,
    model: result.model,
    generatedAt: new Date().toISOString(),
    error: errorMessage,
  });
}
