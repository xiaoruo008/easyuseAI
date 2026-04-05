import { NextRequest, NextResponse } from "next/server";
import { createTask, updateTask, getOrCreateLeadForSession } from "@/lib/db";
import { generateContent, isAIEnabled } from "@/lib/ai";
import { generateImage } from "@/lib/image";
import type { GenerateResult } from "@/lib/ai";
import type { ImageTaskInput, ImageTaskOutput } from "@/lib/image";

const IMAGE_ACTIONS = new Set(["product_photo", "model_photo", "background_swap"]);

const ACTION_TASKTYPE: Record<string, string> = {
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
  product_photo: "图片生成",
  model_photo: "图片生成",
  background_swap: "图片生成",
};

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
      "我老婆说我终于不用半夜回客户消息了",
    ],
  },
  product_desc: {
    title: "生成结果：商品详情页描述",
    items: [
      "【核心卖点】精选材质，透气舒适，穿一整天也不累",
      "【用户证言】已经帮助3000+用户解决XX问题，好评率98%",
      "【限时优惠】今日下单额外赠送运费险，收到不满意直接退",
    ],
  },
  reply_script: {
    title: "生成结果：10套客服话术",
    items: [
      "客户问价：「您好！这款目前活动价¥299，比平时省60元，还赠送……」",
      "客户犹豫：「非常理解您的顾虑，我可以帮您申请延长保修……」",
      "客户议价：「我们目前是统一价，不过我可以帮您申请……」",
    ],
  },
  welcome_msg: {
    title: "生成结果：新客户欢迎语",
    items: [
      "欢迎！感谢您的信任，我会尽快跟进您的需求",
      "我们会在24小时内为您准备专属方案，请保持电话畅通",
      "如有紧急问题，可直接微信联系顾问：easyuse_ai",
    ],
  },
  follow_up: {
    title: "生成结果：沉默客户唤醒文案",
    items: [
      "Hi，上次看到您浏览了我们的页面，一直没下单，是否还有顾虑？",
      "如果我们知道，我们可以尽力帮您解决，今天下单额外赠送……",
      "如果您已经不需要，也请告知我，以免继续打扰您",
    ],
  },
  report: {
    title: "生成结果：月度汇总报表",
    items: [
      "【6月汇总】总订单847单，总营收¥213,450，较上月↑18.3%",
      "热销TOP3：①产品A 234单 ②产品B 189单 ③产品C 156单",
      "复购率23.4%（上月19.2%），新增客户127位",
    ],
  },
  data_clean: {
    title: "生成结果：数据清洗完成",
    items: [
      "原始数据12,847条，去重后有效数据12,031条",
      "发现3个格式错误（手机号位数不足），已自动修正",
      "数据已按日期和产品分类整理，可直接下载",
    ],
  },
  schedule: {
    title: "生成结果：30天执行排期表",
    items: [
      "第1-7天：梳理产品卖点，收集用户反馈，建立内容素材库",
      "第8-21天：每天发布1条内容，测试不同标题和封面",
      "第22-30天：分析数据，保留互动最高的3种内容形式",
    ],
  },
  consult: {
    title: "已记录您的意向",
    items: [
      "顾问将在24小时内添加您的微信",
      "请保持手机畅通，顾问会提前预约通话时间",
      "咨询是完全免费的，无需任何费用",
    ],
  },
  plan: {
    title: "生成结果：30天行动计划",
    items: [
      "第1周：解决获客问题（具体动作：搭建内容素材库）",
      "第2周：验证内容效果（判断标准：单篇互动>50）",
      "第3周：扩大发布规模（触发条件：3篇内容验证成功）",
    ],
  },
};

async function buildOrGetLead(sessionId: string) {
  const lead = await getOrCreateLeadForSession(sessionId);
  return lead;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "无效请求" }, { status: 400 });

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
  } = body as {
    sessionId?: string;
    action: string;
    type: string;
    leadId?: string;
    businessType?: string;
    painPoint?: string;
    prompt?: string;
    style?: string;
    aspectRatio?: string;
    referenceImageUrl?: string;
  };

  const isImageAction = IMAGE_ACTIONS.has(action);
  const taskType = ACTION_TASKTYPE[action] ?? "内容生成";
  const effectiveLeadId = reqLeadId ?? "";
  const effectiveSessionId = sessionId ?? "";

  // 如果有 sessionId 但没有 leadId，尝试查找
  let resolvedLeadId = effectiveLeadId;
  if (!resolvedLeadId && effectiveSessionId) {
    const lead = await buildOrGetLead(effectiveSessionId);
    if (lead) resolvedLeadId = lead.id;
  }

  // ── 图片生成 ─────────────────────────────────────────────
  if (isImageAction) {
    const input: ImageTaskInput = {
      type: action as ImageTaskInput["type"],
      prompt: prompt ?? `${businessType ?? "电商"} ${action === "background_swap" ? "专业场景" : "高端展示"}`,
      referenceImageUrl,
      style: (style as ImageTaskInput["style"]) ?? "commercial",
      aspectRatio: (aspectRatio as ImageTaskInput["aspectRatio"]) ?? "1:1",
    };

    // ① 先建 Task（doing 状态）
    const taskId = resolvedLeadId
      ? await createTask({
          leadId: resolvedLeadId,
          taskType,
          status: "doing",
          inputData: { action, ...input },
          outputData: null,
        }).then((t) => (t as { id: string }).id)
      : null;

    // ② 执行生成
    let output: ImageTaskOutput;
    let errorMessage: string | null = null;

    try {
      output = await generateImage(input);
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "生成失败";
      output = {
        imageUrl: "https://placehold.co/800x800/1a1a2e/ffffff?text=Generation+Failed",
        provider: "error",
        model: "none",
        generatedAt: new Date().toISOString(),
      };
    }

    // ③ 写回 Task 结果
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
      });
    }

    return NextResponse.json({
      success: !errorMessage,
      action,
      type,
      taskCategory: "image",
      taskId,
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

  // ── 文案生成 ─────────────────────────────────────────────
  let result: GenerateResult;
  let errorMessage: string | null = null;

  const taskId = resolvedLeadId
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

  if (taskId) {
    await updateTask(taskId, {
      status: errorMessage && errorMessage !== "生成失败" ? "failed" : "done",
      outputData: { title: result.title, items: result.items, source: result.source },
      errorMessage,
    });
  }

  return NextResponse.json({
    success: !errorMessage || errorMessage === "生成失败",
    action,
    type,
    taskCategory: "text",
    taskId,
    result: { title: result.title, items: result.items },
    source: result.source,
    model: result.model,
    generatedAt: new Date().toISOString(),
    error: errorMessage,
  });
}
