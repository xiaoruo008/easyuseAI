/**
 * 模型路由判断函数（单一函数，集中所有判断逻辑）
 *
 * 规则：默认 minimax
 *       只有同时满足以下三个条件才升级到 nanobanana：
 *         ① 跨境平台（TikTok / Amazon / 独立站 / 跨境）
 *         ② 高付费意愿（月上新 >= 10件 OR 同时上传了产品图 + 参考图）
 *         ③ 高难度图片需求（resultType 是 model_upgrade / lifestyle_upgrade / brand_scene
 *                             OR painPoint 包含"风格不统一"/"缺乏场景感"/"模特费太贵"）
 */

export interface RouteDecisionInput {
  painPoint?: string;       // 核心问题
  resultType?: string;      // 诊断结果类型
  platform?: string | string[];  // 平台选择
  monthlyFrequency?: string; // 月上新频率
  hasProductImage?: boolean;
  hasReferenceImage?: boolean;
}

export interface RouteDecision {
  provider: "minimax" | "nanobanana";
  priorityLevel: "default" | "high_value";
  reasons: string[];
}

// ── 条件判断辅助函数 ─────────────────────────────────────

function isCrossBorder(platform: string | string[] | undefined): boolean {
  if (!platform) return false;
  const CROSS_BORDER_KEYWORDS = [
    "tiktok", "amazon", "独立站", "跨境",
    "tiktok shop",
  ];
  const str = (Array.isArray(platform) ? platform : [platform])
    .join(" ").toLowerCase();
  return CROSS_BORDER_KEYWORDS.some((kw) => str.includes(kw));
}

function hasHighPayIntent(
  monthlyFrequency: string | undefined,
  hasProductImage: boolean | undefined,
  hasReferenceImage: boolean | undefined,
): boolean {
  // 月上新 >= 10件
  if (monthlyFrequency) {
    const f = monthlyFrequency.toLowerCase();
    if (f.includes("10-50") || f.includes("50") || f.includes("50件以上")) return true;
  }
  // 同时上传了产品图 + 参考图（主动投入，意愿强）
  if (hasProductImage && hasReferenceImage) return true;
  return false;
}

function hasHighDifficultyImageNeed(
  resultType: string | undefined,
  painPoint: string | undefined,
): boolean {
  // resultType 为高质量图片类型
  const HIGH_QUALITY_TYPES = [
    "model_upgrade", "lifestyle_upgrade", "brand_scene",
    "model", "lifestyle", "brand_scene",
  ];
  if (resultType && HIGH_QUALITY_TYPES.includes(resultType.toLowerCase())) return true;

  // painPoint 含高难度相关关键词
  if (painPoint) {
    const HIGH_DIFFICULTY_KEYWORDS = [
      "风格不统一", "缺乏场景感", "模特费太贵",
    ];
    const p = painPoint.toLowerCase();
    if (HIGH_DIFFICULTY_KEYWORDS.some((kw) => p.includes(kw))) return true;
  }
  return false;
}

// ── 单一路由函数 ─────────────────────────────────────────

export function routeGenerationModel(input: RouteDecisionInput): RouteDecision {
  const reasons: string[] = [];

  const crossBorder  = isCrossBorder(input.platform);
  const highIntent   = hasHighPayIntent(input.monthlyFrequency, input.hasProductImage, input.hasReferenceImage);
  const highDiff     = hasHighDifficultyImageNeed(input.resultType, input.painPoint);

  if (crossBorder)  reasons.push("① 跨境平台");
  if (highIntent)   reasons.push("② 高付费意愿");
  if (highDiff)     reasons.push("③ 高难度图片需求");

  // 三个条件全部满足 → nanobanana，否则 minimax（默认）
  const provider: "minimax" | "nanobanana" =
    crossBorder && highIntent && highDiff ? "nanobanana" : "minimax";

  const priorityLevel: "default" | "high_value" =
    crossBorder && highIntent ? "high_value" : "default";

  return { provider, priorityLevel, reasons };
}
