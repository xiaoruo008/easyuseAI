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
    preferGemini: false,
    moderationRiskLevel: "low",
    desc: "套装模特图",
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
// 修复: 现在正确结合 category 和 action 的 targetImage 类型

export function routeFromAction(
  action: string,
  category: Category = "top"
): TemplateRoute | null {
  // action → targetImage 类型映射
  const actionTargetMap: Record<string, string> = {
    background_swap: "main_white",
    product_photo: "hero_branded",
    model_photo: "model",
    lifestyle: "lifestyle",
    fashion_model: "model",
    fashion_lifestyle: "lifestyle",
  };

  const targetImage = actionTargetMap[action];
  
  if (!targetImage) {
    // 未知 action，使用 category + 默认 hero_branded
    const key = `${category}_hero_branded` as FashionTemplateKey;
    return FASHION_TEMPLATE_ROUTES.find((r) => r.key === key) ?? null;
  }

  // 正确组合: {category}_{targetImage}
  const key = `${category}_${targetImage}` as FashionTemplateKey;
  const route = FASHION_TEMPLATE_ROUTES.find((r) => r.key === key);
  
  // 如果找不到完全匹配，回退到 category + hero_branded
  if (!route) {
    const fallbackKey = `${category}_hero_branded` as FashionTemplateKey;
    return FASHION_TEMPLATE_ROUTES.find((r) => r.key === fallbackKey) ?? null;
  }
  
  return route;
}

// ── WORKFLOW_KEY → TEMPLATE_KEY 翻译表 ──────────────────
// 用于将 Result API 返回的 workflowKey（如 domestic_womenswear_top_main_white）
// 翻译为 Execute API 使用的 templateKey（如 top_main_white）

export const WORKFLOW_TO_TEMPLATE_KEY_MAP: Record<string, FashionTemplateKey> = {
  // 国内 · 男装套装
  domestic_menswear_suit_set_main_white: "suit_set_main_white",
  domestic_menswear_suit_set_hero_branded: "suit_set_hero_branded",
  domestic_menswear_suit_set_model: "suit_set_model",
  domestic_menswear_suit_set_lifestyle: "suit_set_lifestyle",
  // 国内 · 女装上衣
  domestic_womenswear_top_main_white: "top_main_white",
  domestic_womenswear_top_model: "top_model",
  domestic_womenswear_top_lifestyle: "top_lifestyle",
  // 国内 · 女装连衣裙
  domestic_womenswear_dress_main_white: "dress_main_white",
  domestic_womenswear_dress_hero_branded: "dress_hero_branded",
  domestic_womenswear_dress_model: "dress_model",
  domestic_womenswear_dress_lifestyle: "dress_lifestyle",
  // 跨境 · 男装套装
  cross_border_menswear_suit_set_main_white: "suit_set_main_white",
  cross_border_menswear_suit_set_hero_branded: "suit_set_hero_branded",
  cross_border_menswear_suit_set_model: "suit_set_model",
  cross_border_menswear_suit_set_lifestyle: "suit_set_lifestyle",
  // 跨境 · 男装上装
  cross_border_menswear_top_main_white: "top_main_white",
  cross_border_menswear_top_model: "top_model",
  cross_border_menswear_top_lifestyle: "top_lifestyle",
  // 跨境 · 女装连衣裙
  cross_border_womenswear_dress_main_white: "dress_main_white",
  cross_border_womenswear_dress_hero_branded: "dress_hero_branded",
  cross_border_womenswear_dress_model: "dress_model",
  cross_border_womenswear_dress_lifestyle: "dress_lifestyle",
  // 跨境 · 女装上衣
  cross_border_womenswear_top_model: "top_model",
};

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
      "Do not introduce any creative variations — stay faithful to the reference product. " +
      "IMPORTANT: The uploaded product image is the ONLY subject. KEEP IT 100% IDENTICAL. " +
      "DO NOT replace or generate a different product. Only improve background and lighting."
    );
  }
  return "";
}

// ── 图案生成 Prompt 模板（来自 ops/QWEN_LOG.md 第4291-4838行）───────────
// 18 套完整的图案生成 Prompt 模板，含 visualStyle/composition/mood/keywords
// 用于在 Execute API 中注入专业图案风格指导，改善图片生成质量

export const PATTERN_PROMPTS: Record<FashionTemplateKey, string> = {
  // ── 套装 ────────────────────────────────────────────────────────────
  suit_set_main_white:
    "Full-body flat lay of a tailored 2-piece business suit set on a pure white background, pristine white studio backdrop, professional and clean product photography, sharp tailoring details visible, natural fabric drape, high-end commercial quality, minimal shadows, even diffused lighting, front-facing centered composition, e-commerce standard.",
  suit_set_hero_branded:
    "Professional brand photograph of a premium business suit set featuring a well-groomed male model in an elegant standing pose, soft studio lighting with subtle rim light and defined shadows, high-end fashion aesthetic, tailored fit showcasing construction details, luxury brand quality, polished and refined presentation, confident executive energy, warm sophisticated color grading.",
  suit_set_model:
    "Professional full-body fashion photograph of a male model wearing a tailored suit in an urban setting, modern city backdrop or clean studio background, confident sophisticated energy, natural relaxed posture with slight stance, high-end fashion editorial quality, sharp polished aesthetic, bright natural lighting, commercial fashion standard, authentic executive presence.",
  suit_set_lifestyle:
    "Lifestyle photograph of a professional male model wearing a smart casual suit in a natural urban setting like a stylish cafe terrace or city street, soft natural daylight, relaxed yet sophisticated atmosphere, modern cityscape background, authentic aspirational mood, warm inviting color palette, shallow depth of field with pleasing bokeh, high production value, premium lifestyle brand aesthetic.",

  // ── 上装 ────────────────────────────────────────────────────────────
  top_main_white:
    "Clean white background product photograph of a stylish casual top garment, crisp white studio backdrop, front-facing flat lay or hung shot, even natural lighting, crisp fabric texture, minimal shadows, commercial e-commerce quality, fresh and clean aesthetic, centered composition, detailed neckline and sleeve texture visible.",
  top_hero_branded:
    "Polished brand photograph of a model wearing a stylish casual top, half or full-body composition in soft directional studio lighting with subtle rim light, premium fashion aesthetic, relaxed approachable energy, high-end commercial quality, clean sophisticated composition, warm inviting color grading, natural skin tone lighting, aspirational yet accessible mood.",
  top_model:
    "Natural fashion photograph of a model wearing a casual top, half-body composition with soft natural background, fresh approachable energy, relaxed pose with slight smile, good skin lighting, commercial fashion quality, bright clean color grading, authentic lifestyle feel, natural expression, everyday fashion mood.",
  top_lifestyle:
    "Lifestyle photograph of a model wearing a stylish top in a natural setting like a cafe terrace or home environment, soft natural daylight, relaxed aspirational atmosphere, authentic everyday moment, warm color palette, shallow depth of field with pleasing bokeh, high production value, casual elegant mood, lifestyle brand aesthetic.",

  // ── 连衣裙 ──────────────────────────────────────────────────────────
  dress_main_white:
    "Pristine white background product photograph of an elegant dress, front-facing full-length or three-quarter composition, even diffused studio lighting, smooth fabric drape, refined details and texture visible, commercial e-commerce quality, soft sophisticated aesthetic, centered composition, delicate hemline and neckline details clear.",
  dress_hero_branded:
    "Elegant brand photograph of a beautiful woman wearing a flowing midi dress, full-body composition in soft studio lighting with subtle shadows, high-end fashion aesthetic, feminine sophisticated energy, luxurious fabric movement visible, polished refined presentation, warm skin-tone lighting, elegant standing pose, premium brand quality.",
  dress_model:
    "Fashion editorial photograph of a female model wearing an elegant dress, full-body natural pose in bright clean setting or soft bokeh background, confident graceful energy, good skin lighting with natural expression, commercial fashion quality, polished refined aesthetic, warm feminine color grading, stylish summer afternoon mood.",
  dress_lifestyle:
    "Romantic lifestyle photograph of a female model wearing an elegant dress in a beautiful outdoor garden or stylish cafe setting, soft natural daylight with warm tones, dreamy feminine atmosphere, authentic aspirational moment, gentle color palette with soft bokeh, high production value, whimsical romantic mood, feminine summer aesthetic.",

  // ── 裤装 ────────────────────────────────────────────────────────────
  pants_main_white:
    "Clean white background product photograph of a pair of stylish tailored pants, front-facing flat lay with even lighting, crisp fabric texture, well-defined silhouette and tailoring details visible, commercial e-commerce quality, minimal shadows, professional and clean aesthetic, centered composition, waistband and stitching details clear.",
  pants_hero_branded:
    "Polished brand photograph of a model wearing tailored wide-leg pants, full-body composition in professional studio lighting, sharp sophisticated aesthetic, urban modern energy, high-end commercial quality, clean structured presentation, confident polished look, warm neutral color grading, premium fashion brand mood.",
  pants_model:
    "Natural fashion photograph of a model wearing stylish pants, half or full-body composition with clean background, relaxed confident energy, natural pose and expression, good lighting, commercial fashion quality, bright clean color grading, authentic urban style mood, everyday sophistication.",
  pants_lifestyle:
    "Lifestyle photograph of a model wearing casual chic pants in an urban setting like a stylish city street or cozy cafe, soft natural daylight, relaxed aspirational atmosphere, authentic everyday moment, warm color palette, shallow depth of field with pleasing bokeh, high production value, modern urban lifestyle mood, sophisticated casual aesthetic.",

  // ── 内衣（保守策略，只做白底和官网图）──────────────────────────────
  lingerie_main_white:
    "Elegant white background product photograph of a delicate lace lingerie set, tasteful flat lay or mannequin form presentation, soft diffused studio lighting, fine fabric texture and delicate details visible, high-end intimate apparel quality, modest sophisticated aesthetic, commercial e-commerce safe presentation, no visible body, clean and refined mood.",
  lingerie_hero_branded:
    "Elegant brand photograph of a luxurious lingerie set, full product shot on a polished form or styled flat lay with exquisite lighting to highlight fabric texture and delicate lace details, high-end intimate apparel aesthetic, sophisticated refined mood, soft shadows and premium color grading, no model in frame, polished tasteful presentation, luxury boutique quality.",
};
