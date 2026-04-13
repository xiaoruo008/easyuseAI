/**
 * 服装视觉系统 — 结构化类型
 *
 * 诊断答案结构化 + 模板路由 + 重试策略
 */

// ── 诊断答案结构化 ─────────────────────────────────

export type Market = "domestic" | "cross_border";
export type Gender = "menswear" | "womenswear" | "unisex";
export type Category =
  | "suit_set"    // 男装套装 / 女装套装
  | "top"          // 上装（衬衫/T恤/毛衣）
  | "dress"        // 连衣裙/裙装
  | "pants"        // 裤装
  | "lingerie";    // 内衣/贴身衣物

export type TargetImage =
  | "main_white"     // 白底主图
  | "hero_branded"   // 官网首图/品牌图
  | "model"          // 模特图
  | "lifestyle";     // 场景图

export type ReferenceQuality = "good" | "medium" | "poor";

export interface StructuredAnswers {
  market: Market;
  gender: Gender;
  category: Category;
  targetImage: TargetImage;
  referenceQuality: ReferenceQuality;
}

// ── 模板 Key（由结构化字段组合生成）────────────────────

export type FashionTemplateKey =
  // 套装
  | "suit_set_main_white"
  | "suit_set_hero_branded"
  | "suit_set_model"
  | "suit_set_lifestyle"
  // 上装
  | "top_main_white"
  | "top_hero_branded"
  | "top_model"
  | "top_lifestyle"
  // 连衣裙
  | "dress_main_white"
  | "dress_hero_branded"
  | "dress_model"
  | "dress_lifestyle"
  // 裤装
  | "pants_main_white"
  | "pants_hero_branded"
  | "pants_model"
  | "pants_lifestyle"
  // 内衣（保守策略）
  | "lingerie_main_white"
  | "lingerie_hero_branded";

// ── 模板路由配置 ──────────────────────────────────────

export interface TemplateRoute {
  /** 生成的 templateKey */
  key: FashionTemplateKey;
  /** 模板 ID（对应 image/template.ts 中的模板） */
  templateId: string;
  /** 是否使用参考图 */
  useReference: boolean;
  /** 是否走 Gemini（高质量） */
  preferGemini: boolean;
  /** 是否需要安全审核（内衣类） */
  moderationRiskLevel: "low" | "medium" | "high";
  /** 描述 */
  desc: string;
}

// ── 模板路由表 ──────────────────────────────────────

export const FASHION_TEMPLATE_ROUTES: TemplateRoute[] = [
  // ── 套装 ──────────────────────────────────────
  {
    key: "suit_set_main_white",
    templateId: "bg_white",
    useReference: true,
    preferGemini: false,
    moderationRiskLevel: "low",
    desc: "套装白底主图（国内/跨境通用）",
  },
  {
    key: "suit_set_hero_branded",
    templateId: "enhance",
    useReference: true,
    preferGemini: false,
    moderationRiskLevel: "low",
    desc: "套装官网品牌图（精修质感）",
  },
  {
    key: "suit_set_model",
    templateId: "fashion_model",
    useReference: true,
    preferGemini: true,
    moderationRiskLevel: "low",
    desc: "套装模特图（Gemini，高质量）",
  },
  {
    key: "suit_set_lifestyle",
    templateId: "fashion_lifestyle",
    useReference: true,
    preferGemini: true,
    moderationRiskLevel: "low",
    desc: "套装场景图（Gemini，高质量）",
  },

  // ── 上装 ──────────────────────────────────────
  {
    key: "top_main_white",
    templateId: "bg_white",
    useReference: true,
    preferGemini: false,
    moderationRiskLevel: "low",
    desc: "上装白底主图",
  },
  {
    key: "top_hero_branded",
    templateId: "enhance",
    useReference: true,
    preferGemini: false,
    moderationRiskLevel: "low",
    desc: "上装官网品牌图",
  },
  {
    key: "top_model",
    templateId: "model_half",
    useReference: false,
    preferGemini: false,
    moderationRiskLevel: "low",
    desc: "上装模特图",
  },
  {
    key: "top_lifestyle",
    templateId: "lifestyle_scene",
    useReference: false,
    preferGemini: false,
    moderationRiskLevel: "low",
    desc: "上装场景图",
  },

  // ── 连衣裙 ────────────────────────────────────
  {
    key: "dress_main_white",
    templateId: "bg_white",
    useReference: true,
    preferGemini: false,
    moderationRiskLevel: "low",
    desc: "连衣裙白底主图",
  },
  {
    key: "dress_hero_branded",
    templateId: "enhance",
    useReference: true,
    preferGemini: false,
    moderationRiskLevel: "low",
    desc: "连衣裙官网品牌图",
  },
  {
    key: "dress_model",
    templateId: "model_half",
    useReference: false,
    preferGemini: false,
    moderationRiskLevel: "medium",
    desc: "连衣裙模特图",
  },
  {
    key: "dress_lifestyle",
    templateId: "lifestyle_scene",
    useReference: false,
    preferGemini: false,
    moderationRiskLevel: "medium",
    desc: "连衣裙场景图",
  },

  // ── 裤装 ──────────────────────────────────────
  {
    key: "pants_main_white",
    templateId: "bg_white",
    useReference: true,
    preferGemini: false,
    moderationRiskLevel: "low",
    desc: "裤装白底主图",
  },
  {
    key: "pants_hero_branded",
    templateId: "enhance",
    useReference: true,
    preferGemini: false,
    moderationRiskLevel: "low",
    desc: "裤装官网品牌图",
  },
  {
    key: "pants_model",
    templateId: "model_half",
    useReference: false,
    preferGemini: false,
    moderationRiskLevel: "low",
    desc: "裤装模特图",
  },
  {
    key: "pants_lifestyle",
    templateId: "lifestyle_scene",
    useReference: false,
    preferGemini: false,
    moderationRiskLevel: "low",
    desc: "裤装场景图",
  },

  // ── 内衣（高约束，只做白底和官网图）─────────────
  {
    key: "lingerie_main_white",
    templateId: "bg_white",
    useReference: true,
    preferGemini: false,
    moderationRiskLevel: "high",
    desc: "内衣白底主图（最安全）",
  },
  {
    key: "lingerie_hero_branded",
    templateId: "enhance",
    useReference: true,
    preferGemini: false,
    moderationRiskLevel: "high",
    desc: "内衣官网品牌图（精修，不出模特）",
  },
];

// ── 从结构化字段生成 templateKey ────────────────────────

export function buildTemplateKey(structured: StructuredAnswers): FashionTemplateKey {
  const { category, targetImage } = structured;

  // 内衣特殊处理：不生成模特/场景图
  if (category === "lingerie") {
    if (targetImage === "main_white") return "lingerie_main_white";
    if (targetImage === "hero_branded") return "lingerie_hero_branded";
  }

  // 其他类目
  const categoryMap: Record<Category, string> = {
    suit_set: "suit_set",
    top: "top",
    dress: "dress",
    pants: "pants",
    lingerie: "lingerie",
  };

  const targetMap: Record<TargetImage, string> = {
    main_white: "main_white",
    hero_branded: "hero_branded",
    model: "model",
    lifestyle: "lifestyle",
  };

  return `${categoryMap[category]}_${targetMap[targetImage]}` as FashionTemplateKey;
}

// ── 查找路由 ──────────────────────────────────────

export function findRoute(key: FashionTemplateKey): TemplateRoute | null {
  return FASHION_TEMPLATE_ROUTES.find((r) => r.key === key) ?? null;
}

// ── 根据诊断答案推断模板路由 ────────────────────────────

export function resolveFashionRoute(structured: StructuredAnswers): TemplateRoute | null {
  const key = buildTemplateKey(structured);
  return findRoute(key);
}

// ── 从老 action 映射（兼容 execute 页面）───────────────

export function routeFromAction(
  action: string,
  category: Category = "top"
): TemplateRoute | null {
  const actionMap: Record<string, FashionTemplateKey> = {
    background_swap: "top_main_white",
    product_photo: "top_hero_branded",
    model_photo: "top_model",
    lifestyle: "top_lifestyle",
    fashion_model: "suit_set_model",
    fashion_lifestyle: "suit_set_lifestyle",
  };

  const key = actionMap[action] ?? `${category}_hero_branded`;
  return FASHION_TEMPLATE_ROUTES.find((r) => r.key === key) ?? null;
}

// ── 重试策略描述 ───────────────────────────────────

export type RetryStrategy = "safe_prompt" | "fallback_provider" | "stable_output";

export const RETRY_STRATEGY_STEPS: RetryStrategy[] = [
  "safe_prompt",
  "fallback_provider",
  "stable_output",
];

export function getRetryPrompt(attempt: number): string {
  // attempt 1 = 首次失败后换安全提示词
  if (attempt === 1) {
    return (
      "CRITICAL SAFETY NOTE: The previous image had quality issues. " +
      "Please prioritize: exact product color match, clean background, professional lighting. " +
      "Do not introduce any creative variations — stay faithful to the reference product."
    );
  }
  return "";
}
