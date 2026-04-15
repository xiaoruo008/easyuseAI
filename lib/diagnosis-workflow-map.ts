/**
 * 诊断结果类型 → 时尚工作流字段映射
 *
 * 五道题诊断产生 ResultType (image_poor/image_cost/image_stability/image_start)
 * 十二时尚工作流需要 Market/Gender/Category/TargetImage
 *
 * 这个映射层解决两个系统之间的连接问题:
 * 1. 诊断问题是业务痛点，不是服装类别
 * 2. 需要根据诊断结果和执行动作推导合适的时尚字段
 */

import type { ResultType } from "@/lib/diagnosis";
import type { Market, Gender, Category, TargetImage } from "@/lib/types/fashion";

// 诊断结果类型 → 时尚字段（默认值）
// 这些是通用默认值，适用于没有明确时尚偏好时的推导
const DIAGNOSIS_DEFAULTS: Record<ResultType, { market: Market; gender: Gender; category: Category }> = {
  image_poor: {
    market: "domestic",   // 图片质量差 → 国内电商为主
    gender: "womenswear", // WORKFLOW_MAP 无 unisex，默认女性用户
    category: "top",       // 上装最常见
  },
  image_cost: {
    market: "domestic",
    gender: "womenswear",
    category: "top",       // 成本敏感 → 白底主图最实惠
  },
  image_stability: {
    market: "domestic",
    gender: "womenswear",
    category: "top",       // AI不稳定 → 商品主图
  },
  image_start: {
    market: "domestic",
    gender: "womenswear",
    category: "top",       // 刚开始 → 默认上衣
  },
};

// 动作 → 目标图片类型（TargetImage）的映射
const ACTION_TARGET_IMAGE_MAP: Record<string, TargetImage> = {
  // 图片生成动作
  product_photo: "hero_branded",   // 商品图 → 品牌主图
  background_swap: "main_white",   // 换背景 → 白底主图
  model_photo: "model",             // 模特图 → 模特图
  lifestyle: "lifestyle",            // 场景图 → 场景图
  // 服装专用动作
  fashion_model: "model",          // 服装模特图
  fashion_lifestyle: "lifestyle",   // 服装场景图
};

// 动作 → category 覆盖（当 action 隐含特定 category 时使用）
// WORKFLOW_MAP 中 hero_branded 只存在于 suit_set/dress，不存在 top，
// 所以 product_photo 必须 override category=dress 才能正确路由到 domestic_womenswear_dress_hero_branded
const ACTION_CATEGORY_OVERRIDE: Record<string, Category> = {
  product_photo: "dress",  // hero_branded 只在 dress/suit_set 存在，top 无 hero_branded
};

export interface FashionWorkflowFields {
  market: Market;
  gender: Gender;
  category: Category;
  targetImage: TargetImage;
}

/**
 * 从诊断结果类型和执行动作推导时尚工作流字段
 * 
 * @param resultType - 诊断结果类型 (traffic/customer/efficiency/unclear)
 * @param action - 执行动作 ID (product_photo/background_swap/model_photo等)
 * @returns 时尚工作流所需的所有字段
 */
export function deriveFashionFieldsFromDiagnosis(
  resultType: ResultType,
  action: string
): FashionWorkflowFields {
  const defaults = DIAGNOSIS_DEFAULTS[resultType] ?? DIAGNOSIS_DEFAULTS["image_start"];
  const targetImage = ACTION_TARGET_IMAGE_MAP[action] ?? "main_white";
  const category = ACTION_CATEGORY_OVERRIDE[action] ?? defaults.category;

  return {
    market: defaults.market,
    gender: defaults.gender,
    category,
    targetImage,
  };
}

/**
 * 根据动作和诊断结果获取模板路由 Key
 * 
 * 用于 execute API 路由到正确的 12 套时尚工作流之一
 */
export function buildWorkflowKeyFromDiagnosis(
  resultType: ResultType,
  action: string
): string {
  const fields = deriveFashionFieldsFromDiagnosis(resultType, action);
  return `${fields.market}_${fields.gender}_${fields.category}_${fields.targetImage}`;
}
