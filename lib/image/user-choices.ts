// 用户选择 → prompt 片段映射
// 目的：让用户不用手写 prompt，只需点选即可自动组装

export type ProductCategory =
  | "suit"
  | "shirt"
  | "tshirt"
  | "outerwear"
  | "dress"
  | "skirt"
  | "pants"
  | "knitwear"
  | "activewear"
  | "underwear"
  | "accessory";

export type SceneType =
  | "white_hero" // 主图白底
  | "model_studio" // 模特室内
  | "lifestyle" // 生活场景
  | "brand_hero"; // 品牌海报

export type Gender = "menswear" | "womenswear" | "unisex";

// ========== 产品类别 → 英文描述 ==========
export const CATEGORY_LABELS: Record<
  ProductCategory,
  { zh: string; en: string; emoji: string }
> = {
  suit: { zh: "西装套装", en: "tailored suit set", emoji: "🤵" },
  shirt: { zh: "衬衫", en: "button-up shirt", emoji: "👔" },
  tshirt: { zh: "T恤", en: "premium t-shirt", emoji: "👕" },
  outerwear: { zh: "外套/大衣", en: "coat or jacket", emoji: "🧥" },
  dress: { zh: "连衣裙", en: "elegant dress", emoji: "👗" },
  skirt: { zh: "半身裙", en: "skirt", emoji: "👗" },
  pants: { zh: "裤装", en: "trousers", emoji: "👖" },
  knitwear: { zh: "针织/毛衣", en: "knitwear sweater", emoji: "🧶" },
  activewear: { zh: "运动装", en: "activewear set", emoji: "🏃" },
  underwear: { zh: "内衣", en: "lingerie", emoji: "👙" },
  accessory: { zh: "配饰", en: "fashion accessory", emoji: "👜" },
};

// ========== 场景类型 → 模板 key 片段 ==========
export const SCENE_LABELS: Record<
  SceneType,
  { zh: string; en: string; emoji: string; desc: string }
> = {
  white_hero: {
    zh: "主图白底",
    en: "clean white background product shot",
    emoji: "⬜",
    desc: "淘宝/亚马逊标准主图",
  },
  model_studio: {
    zh: "模特上身",
    en: "studio model wearing",
    emoji: "👤",
    desc: "室内摄影棚，真实模特展示",
  },
  lifestyle: {
    zh: "生活场景",
    en: "lifestyle scene with natural setting",
    emoji: "🌆",
    desc: "街拍/室外/自然光感",
  },
  brand_hero: {
    zh: "品牌海报",
    en: "cinematic brand campaign photography",
    emoji: "✨",
    desc: "小红书/社媒封面，有调性",
  },
};

// ========== 根据用户选择生成 garment_description ==========
export function buildGarmentDescription(opts: {
  gender: Gender;
  category: ProductCategory;
  extraFeatures?: string; // 用户选填：颜色/材质/风格形容词
}): string {
  const { gender, category, extraFeatures } = opts;
  const genderStr =
    gender === "menswear"
      ? "men's"
      : gender === "womenswear"
      ? "women's"
      : "unisex";
  const catEn = CATEGORY_LABELS[category]?.en ?? 'product';
  const extra = extraFeatures?.trim();

  return extra ? `${genderStr} ${catEn}, ${extra}` : `${genderStr} ${catEn}`;
}

// ========== 场景 + 品类 → 模板 key 映射 ==========
// 对应现有 lib/image/prompt-templates.ts 里的 FashionTemplateKey
export function mapChoiceToTemplateKey(opts: {
  market: "domestic" | "cross_border";
  gender: Gender;
  category: ProductCategory;
  scene: SceneType;
}): string {
  const { market, gender, category, scene } = opts;
  const genderSeg = gender === "unisex" ? "womenswear" : gender;
  const sceneSeg =
    scene === "white_hero"
      ? "hero_white"
      : scene === "model_studio"
      ? "model_studio"
      : scene === "lifestyle"
      ? "lifestyle"
      : "hero_branded";

  // 格式：domestic_womenswear_dress_hero_branded
  return `${market}_${genderSeg}_${category}_${sceneSeg}`;
}

// ========== 推荐：根据 action 自动推荐场景 ==========
export function recommendSceneFromAction(action: string): SceneType {
  switch (action) {
    case "product_photo":
      return "white_hero";
    case "model_photo":
      return "model_studio";
    case "fashion_model":
      return "model_studio";
    case "background_swap":
      return "brand_hero";
    case "lifestyle":
      return "lifestyle";
    case "fashion_lifestyle":
      return "lifestyle";
    default:
      return "white_hero";
  }
}

// ========== 推荐：根据诊断 painPoint 推荐品类 ==========
// 如果诊断结果里没有明确 category，用这个兜底
export function recommendCategoryFromContext(opts: {
  gender?: Gender;
  painPoint?: string;
}): ProductCategory {
  const { gender, painPoint } = opts;

  if (gender === "menswear") return "suit";
  if (painPoint?.includes("连衣裙") || painPoint?.includes("dress"))
    return "dress";

  return "dress"; // 默认
}
