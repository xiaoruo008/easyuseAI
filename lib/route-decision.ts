/**
 * 模型路由判断函数
 *
 * 根据用户诊断信息、问卷答案和提交数据，判断该用户应该走 MiniMax（默认）还是 NanoBanana（高质量）生图。
 *
 * 评分规则：
 * | 条件 | 分值 |
 * |------|------|
 * | platform 包含 TikTok Shop / Amazon / 独立站（跨境） | +2 |
 * | monthlyFrequency >= 10件（10-50件 或 50件以上） | +2 |
 * | resultType 是 model_upgrade / lifestyle_upgrade / brand_scene | +2 |
 * | 同时上传了 productImage + referenceImage | +2 |
 * | 有 wechat | +1 |
 * | painPoint 是"风格不统一"或"缺乏场景感"或"模特费太贵" | +1 |
 *
 * 阈值：总分 >= 6 且跨境平台 -> nanobanana，否则 minimax
 */

export interface RouteDecisionInput {
  // 来自 Diagnosis 模型
  painPoint?: string;
  resultType?: string;
  // 来自 answers JSON
  platform?: string | string[];
  monthlyFrequency?: string;
  brandStyle?: string;
  // 来自 submit 页数据
  hasProductImage?: boolean;
  hasReferenceImage?: boolean;
  hasWechat?: boolean;
}

export interface RouteDecision {
  provider: "minimax" | "nanobanana";
  priorityLevel: "default" | "high_value";
  reasons: string[];
}

// 跨境平台关键词
const CROSS_BORDER_PLATFORMS = [
  "tiktok",
  "amazon",
  "独立站",
  "tiktok shop",
  "跨境",
];

// 高质量图片类型（对应 NanoBanana）
const HIGH_QUALITY_RESULT_TYPES = [
  "model_upgrade",
  "lifestyle_upgrade",
  "brand_scene",
  "model",
  "lifestyle",
  "brand_scene",
];

// 高频上新关键词
const HIGH_FREQUENCY_PATTERNS = [
  "10-50",
  "50",
  "10",
  "50件",
  "10件",
  "10-50件",
  "50件以上",
];

// 痛点关键词
const PAIN_POINT_KEYWORDS = [
  "风格不统一",
  "缺乏场景感",
  "模特费太贵",
];

/**
 * 检查平台是否为跨境平台
 */
function isCrossBorderPlatform(platform: string | string[] | undefined): boolean {
  if (!platform) return false;

  const platforms = Array.isArray(platform) ? platform : [platform];
  const platformStr = platforms.join(" ").toLowerCase();

  return CROSS_BORDER_PLATFORMS.some((cp) => platformStr.includes(cp.toLowerCase()));
}

/**
 * 检查月上新频率是否 >= 10件
 */
function isHighFrequencyMonthly(monthlyFrequency: string | undefined): boolean {
  if (!monthlyFrequency) return false;

  const freq = monthlyFrequency.toLowerCase();

  // 检查是否包含高频关键词
  return HIGH_FREQUENCY_PATTERNS.some((pattern) => freq.includes(pattern));
}

/**
 * 检查 resultType 是否为高质量图片类型
 */
function isHighQualityResultType(resultType: string | undefined): boolean {
  if (!resultType) return false;

  return HIGH_QUALITY_RESULT_TYPES.includes(resultType.toLowerCase());
}

/**
 * 检查是否有高质量图片（同时有 productImage + referenceImage）
 */
function hasHighQualityImages(hasProductImage: boolean | undefined, hasReferenceImage: boolean | undefined): boolean {
  return Boolean(hasProductImage && hasReferenceImage);
}

/**
 * 检查是否有 wechat
 */
function hasWechatContact(hasWechat: boolean | undefined): boolean {
  return Boolean(hasWechat);
}

/**
 * 检查 painPoint 是否为特定关键词
 */
function hasSpecificPainPoint(painPoint: string | undefined): boolean {
  if (!painPoint) return false;

  const pain = painPoint.toLowerCase();
  return PAIN_POINT_KEYWORDS.some((keyword) => pain.includes(keyword));
}

/**
 * 计算路由评分
 */
export function routeGenerationModel(input: RouteDecisionInput): RouteDecision {
  try {
    const reasons: string[] = [];
    let score = 0;

    // 1. 跨境平台 +2
    if (isCrossBorderPlatform(input.platform)) {
      score += 2;
      reasons.push("跨境平台（TikTok/Amazon/独立站）");
    }

    // 2. 月上新 >= 10件 +2
    if (isHighFrequencyMonthly(input.monthlyFrequency)) {
      score += 2;
      reasons.push("月上新 >= 10件");
    }

    // 3. 高质量图片类型 +2
    if (isHighQualityResultType(input.resultType)) {
      score += 2;
      reasons.push(`高质量图片类型（${input.resultType}）`);
    }

    // 4. 同时上传 productImage + referenceImage +2
    if (hasHighQualityImages(input.hasProductImage, input.hasReferenceImage)) {
      score += 2;
      reasons.push("同时上传产品图+参考图");
    }

    // 5. 有 wechat +1
    if (hasWechatContact(input.hasWechat)) {
      score += 1;
      reasons.push("有微信联系方式");
    }

    // 6. 特定痛点 +1
    if (hasSpecificPainPoint(input.painPoint)) {
      score += 1;
      reasons.push(`痛点相关（${input.painPoint}）`);
    }

    // 判断逻辑：总分 >= 6 且跨境平台 -> nanobanana，否则 minimax
    const isCrossBorder = isCrossBorderPlatform(input.platform);
    const provider: "minimax" | "nanobanana" = score >= 6 && isCrossBorder ? "nanobanana" : "minimax";
    const priorityLevel: "default" | "high_value" = score >= 4 ? "high_value" : "default";

    return {
      provider,
      priorityLevel,
      reasons,
    };
  } catch {
    // 路由判断失败时默认 minimax
    console.warn("[route-decision] 路由判断异常，默认使用 minimax");
    return {
      provider: "minimax",
      priorityLevel: "default",
      reasons: ["路由判断异常，默认 minimax"],
    };
  }
}
