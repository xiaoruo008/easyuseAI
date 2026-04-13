/**
 * 商品图生成模板引擎 V2
 *
 * 核心目标：消除 AI 抽卡问题，让结果稳定、可控、可复现。
 *
 * 架构原则：
 * - 用户不直接写 prompt，只选选项
 * - prompt 在后端拼接，模板参数固定化
 * - 每个模板有固定构图、光线、风格，不可随意变更
 * - 可变部分通过 variableSlots 选择，不开放自由输入
 *
 * 模板 -> 固定参数 + 可变槽位 -> 拼接 prompt
 */

import type { ImageAspectRatio } from "./types";

// ── 可变槽位 ─────────────────────────────────────────────

export type VariableKey = "scene" | "lighting" | "model_age" | "model_gender";

export interface VariableOption {
  value: string;
  label: string;
  promptFragment: string; // 英文，拼接进 prompt
}

export interface VariableSlot {
  key: VariableKey;
  label: string;
  required: boolean;
  options: VariableOption[];
}

// ── 构图类型 ─────────────────────────────────────────────

export type CompositionType =
  | "product_shot"      // 纯产品（白底/精修）
  | "half_body"         // 模特上半身
  | "full_body"         // 模特全身
  | "flat_lay"          // 平铺俯拍
  | "scene_placement";   // 产品在场景中

// ── 光线类型 ─────────────────────────────────────────────

export type LightingType =
  | "soft"      // 柔光（电商白底）
  | "natural"   // 自然光（暖调生活感）
  | "studio"    // 专业影棚光
  | "warm"      // 暖色调
  | "cold";     // 冷色调

// ── 风格 ────────────────────────────────────────────────

export type ImageStylePreset = "xiaohongshu" | "tmall" | "jd" | "general";

// ── 模板配置 ─────────────────────────────────────────────

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  composition: CompositionType;
  lighting: LightingType;
  style: ImageStylePreset;
  sceneTemplate: string;       // 英文场景模板，变量用 {{key}} 占位
  constraints: string[];       // 禁止项列表
  productInvariance: string;   // 产品不变描述
  variableSlots: VariableSlot[];
  aspectRatios: ImageAspectRatio[];
  useReference: boolean;       // 是否需要参考图
}

// ── 产品不变约束（所有模板共享） ──────────────────────────

const PRODUCT_INVARIANCE =
  "The product must remain completely identical — same shape, same color, same material, same buttons, same texture, same style. " +
  "Do NOT alter, deform, recolor, or replace the product or any part of it in any way. " +
  "Do NOT crop into close-up detail only — the FULL GARMENT must be clearly visible.";

// ── 场景模板（英文，{{scene}} 等为变量占位）───────────────

// ── 模板注册表 ───────────────────────────────────────────

const TEMPLATES: Record<string, TemplateConfig> = {

  // ── 换背景 ──────────────────────────────────────────
  bg_white: {
    id: "bg_white",
    name: "白底主图",
    description: "纯白背景，适合电商主图",
    composition: "product_shot",
    lighting: "soft",
    style: "tmall",
    sceneTemplate:
      "Clean pure white background, seamless infinite cove, professional studio product photography, even diffused frontal lighting, no shadows on background, ultra-clean commercial look",
    constraints: [
      "Pure white background only, no gradients, no textures, no shadows",
      "Product centered, straight-on front view",
      "No human figures in image",
    ],
    productInvariance: PRODUCT_INVARIANCE,
    variableSlots: [],
    aspectRatios: ["1:1", "3:4", "16:9"],
    useReference: true,
  },

  bg_scene: {
    id: "bg_scene",
    name: "场景换背景",
    description: "换到目标场景背景",
    composition: "scene_placement",
    lighting: "natural",
    style: "xiaohongshu",
    sceneTemplate:
      "Product placed naturally in a {{scene}} setting, realistic depth of field, natural ambient lighting, photorealistic compositing, the product blends naturally into the scene",
    constraints: [
      "Product must look naturally placed, not obviously composited",
      "Lighting direction must be consistent across product and background",
      "No obvious cutout edges or halo effects around product",
    ],
    productInvariance: PRODUCT_INVARIANCE,
    variableSlots: [
      {
        key: "scene",
        label: "场景类型",
        required: true,
        options: [
          { value: "cafe", label: "咖啡馆", promptFragment: "cozy modern cafe interior with warm wood tones" },
          { value: "home", label: "现代家居", promptFragment: "modern minimalist home interior, white walls, natural light" },
          { value: "outdoor", label: "户外自然", promptFragment: "outdoor natural environment, soft sunlight, greenery background" },
          { value: "office", label: "精致办公", promptFragment: "stylish modern office desk setup, clean and professional" },
        ],
      },
    ],
    aspectRatios: ["1:1", "16:9"],
    useReference: true,
  },

  // ── 商品精修 ────────────────────────────────────────
  enhance: {
    id: "enhance",
    name: "商品精修",
    description: "提升光线、质感、清晰度",
    composition: "product_shot",
    lighting: "studio",
    style: "jd",
    sceneTemplate:
      "Professional commercial product photography, enhanced studio lighting with improved contrast and saturation, product appears more vibrant and premium, clean background, sharp focus, commercially polished look",
    constraints: [
      "Product must not change shape, color, label, or any visual element",
      "Only lighting and color grading enhancement allowed",
      "Background remains clean and uncluttered",
    ],
    productInvariance: PRODUCT_INVARIANCE,
    variableSlots: [],
    aspectRatios: ["1:1", "3:4"],
    useReference: true,
  },

  // ── 模特图 ─────────────────────────────────────────
  model_half: {
    id: "model_half",
    name: "上半身模特",
    description: "模特手持产品，上半身展示",
    composition: "half_body",
    lighting: "natural",
    style: "xiaohongshu",
    sceneTemplate:
      "{{model_gender}} {{model_age}} person naturally holding the product, upper body shot, {{lighting}} lighting, {{scene}} background, authentic lifestyle photography, warm and trustworthy atmosphere, shallow depth of field. The product identity must remain completely unchanged — same color, same shape, same material.",
    constraints: [
      "Product must remain completely unchanged — same bottle, same label, same text",
      "Model is optional human element — product must still be clearly visible and primary",
      "No unrealistic product placement or size distortion",
      "Model and product must have consistent lighting",
    ],
    productInvariance: PRODUCT_INVARIANCE,
    variableSlots: [
      {
        key: "model_gender",
        label: "模特性别",
        required: false,
        options: [
          { value: "young_woman", label: "年轻女性", promptFragment: "young Asian woman" },
          { value: "mature_woman", label: "成熟女性", promptFragment: "mature Asian woman" },
          { value: "man", label: "男性", promptFragment: "Asian man" },
          { value: "none", label: "不出现人物", promptFragment: "" },
        ],
      },
      {
        key: "model_age",
        label: "模特年龄感",
        required: false,
        options: [
          { value: "young", label: "年轻", promptFragment: "young adult" },
          { value: "middle", label: "中年", promptFragment: "middle-aged" },
        ],
      },
      {
        key: "lighting",
        label: "光线",
        required: false,
        options: [
          { value: "warm", label: "暖色调", promptFragment: "warm soft natural" },
          { value: "cool", label: "冷色调", promptFragment: "cool soft natural" },
          { value: "golden", label: "黄金时段", promptFragment: "golden hour warm sunlight" },
        ],
      },
      {
        key: "scene",
        label: "背景",
        required: false,
        options: [
          { value: "home", label: "家居", promptFragment: "cozy home interior" },
          { value: "cafe", label: "咖啡馆", promptFragment: "stylish cafe" },
          { value: "outdoor", label: "户外", promptFragment: "outdoor with natural light" },
        ],
      },
    ],
    aspectRatios: ["3:4", "1:1"],
    useReference: false,
  },

  model_full: {
    id: "model_full",
    name: "全身模特",
    description: "模特全身展示产品",
    composition: "full_body",
    lighting: "natural",
    style: "xiaohongshu",
    sceneTemplate:
      "{{model_gender}} {{model_age}} person in full body shot holding or wearing the product, {{scene}} setting, {{lighting}} lighting, authentic lifestyle photography, full body visible, warm and natural atmosphere",
    constraints: [
      "Product must remain completely unchanged — same bottle, same label, same text",
      "Full body must be visible, product clearly shown",
      "No unrealistic pose or product placement",
    ],
    productInvariance: PRODUCT_INVARIANCE,
    variableSlots: [
      {
        key: "model_gender",
        label: "模特性别",
        required: false,
        options: [
          { value: "young_woman", label: "年轻女性", promptFragment: "young Asian woman" },
          { value: "mature_woman", label: "成熟女性", promptFragment: "mature Asian woman" },
          { value: "man", label: "男性", promptFragment: "Asian man" },
          { value: "none", label: "不出现人物", promptFragment: "" },
        ],
      },
      {
        key: "model_age",
        label: "模特年龄感",
        required: false,
        options: [
          { value: "young", label: "年轻", promptFragment: "young adult" },
          { value: "middle", label: "中年", promptFragment: "middle-aged" },
        ],
      },
      {
        key: "scene",
        label: "背景",
        required: false,
        options: [
          { value: "street", label: "街景", promptFragment: "urban street lifestyle" },
          { value: "home", label: "家居", promptFragment: "modern home interior" },
          { value: "outdoor", label: "户外", promptFragment: "outdoor natural environment" },
        ],
      },
      {
        key: "lighting",
        label: "光线",
        required: false,
        options: [
          { value: "warm", label: "暖色调", promptFragment: "warm natural sunlight" },
          { value: "golden", label: "黄金时段", promptFragment: "golden hour warm light" },
        ],
      },
    ],
    aspectRatios: ["3:4", "1:1", "16:9"],
    useReference: false,
  },

  // ── 场景图 ──────────────────────────────────────────
  lifestyle_flat: {
    id: "lifestyle_flat",
    name: "平铺场景图",
    description: "产品平铺俯拍，生活感",
    composition: "flat_lay",
    lighting: "natural",
    style: "xiaohongshu",
    sceneTemplate:
      "Flat lay composition, product placed elegantly on {{scene}}, overhead camera angle, natural soft lighting, lifestyle props arranged tastefully around the product, authentic Xiaohongshu aesthetic, warm and inviting atmosphere",
    constraints: [
      "Product must remain completely unchanged",
      "Props may be added to create lifestyle context but product stays the same",
      "Camera angle is overhead/flat lay only",
    ],
    productInvariance: PRODUCT_INVARIANCE,
    variableSlots: [
      {
        key: "scene",
        label: "场景",
        required: true,
        options: [
          { value: "marble", label: "白色大理石", promptFragment: "white marble kitchen counter" },
          { value: "linen", label: "亚麻布", promptFragment: "natural linen texture surface" },
          { value: "wood", label: "木桌面", promptFragment: "light wood textured surface" },
          { value: "bed", label: "床品", promptFragment: "soft bedding with neutral tones" },
        ],
      },
    ],
    aspectRatios: ["1:1", "3:4"],
    useReference: false,
  },

  lifestyle_scene: {
    id: "lifestyle_scene",
    name: "生活场景图",
    description: "产品融入生活场景",
    composition: "scene_placement",
    lighting: "warm",
    style: "xiaohongshu",
    sceneTemplate:
      "Product naturally placed in {{scene}} setting, warm inviting atmosphere, {{lighting}} lighting, lifestyle photography, photorealistic, authentic Chinese social media aesthetic",
    constraints: [
      "Product must remain completely unchanged",
      "Product must look naturally integrated into the scene",
      "No obvious compositing or artificial edges",
    ],
    productInvariance: PRODUCT_INVARIANCE,
    variableSlots: [
      {
        key: "scene",
        label: "场景",
        required: true,
        options: [
          { value: "kitchen", label: "精致厨房", promptFragment: "modern kitchen with marble counter" },
          { value: "living", label: "客厅一角", promptFragment: "cozy living room with natural light" },
          { value: "desk", label: "办公桌", promptFragment: "stylish desk with coffee and plants" },
          { value: "outdoor", label: "户外休闲", promptFragment: "outdoor cafe terrace setting" },
        ],
      },
      {
        key: "lighting",
        label: "光线",
        required: false,
        options: [
          { value: "morning", label: "晨光", promptFragment: "morning sunlight streaming through window" },
          { value: "evening", label: "暖色晚光", promptFragment: "warm evening ambient light" },
          { value: "indoor", label: "室内柔光", promptFragment: "soft indoor ambient lighting" },
        ],
      },
    ],
    aspectRatios: ["1:1", "16:9"],
    useReference: false,
  },

  // ── 服装类模板（高约束，走 Gemini）────────────────────
  fashion_model: {
    id: "fashion_model",
    name: "服装模特图",
    description: "模特穿同款服装，适合种草",
    composition: "half_body",
    lighting: "natural",
    style: "xiaohongshu",
    sceneTemplate:
      "Professional fashion photography. The model wears the EXACT SAME garment — same color, same style, same lapels, same buttons, same silhouette. " +
      "Full upper body visible, the garment is clearly and completely shown. " +
      "Do NOT change the garment in any way. " +
      "Clean minimal background, natural soft window lighting, warm authentic atmosphere. " +
      "The garment identity must remain 100% unchanged.",
    constraints: [
      "The garment must be IDENTICAL — same color, lapels, buttons, silhouette",
      "Do NOT allow the model to appear wearing a different color or style of clothing",
      "Do NOT crop into fabric close-up only — the full garment must be visible",
      "No color shift, style change, or deformation of the garment",
    ],
    productInvariance:
      "The clothing garment must remain completely unchanged — same color, same lapel shape, same buttons, same silhouette, same fabric texture. " +
      "Do NOT alter the garment color, style, cut, or any visual element. " +
      "The model may be wearing the garment but the garment itself is never modified.",
    variableSlots: [],
    aspectRatios: ["3:4", "1:1"],
    useReference: true,
  },

  fashion_lifestyle: {
    id: "fashion_lifestyle",
    name: "服装场景图",
    description: "服装融入生活场景，适合社媒种草",
    composition: "scene_placement",
    lighting: "warm",
    style: "xiaohongshu",
    sceneTemplate:
      "Fashion lifestyle photography. The garment is naturally placed in a lifestyle setting. " +
      "The garment is EXACTLY THE SAME — same color, same lapels, same buttons, same silhouette, same fabric. " +
      "The full garment is clearly visible and naturally integrated into the scene. " +
      "Do NOT modify the garment in any way. " +
      "Warm inviting atmosphere, suitable for Xiaohongshu or Instagram.",
    constraints: [
      "The garment must remain completely identical — same color, lapels, buttons, silhouette",
      "Do NOT alter the garment color, style, or texture",
      "Do NOT crop or show only a fabric close-up — full garment must be visible",
      "The garment should look naturally part of the lifestyle scene",
    ],
    productInvariance:
      "The clothing garment must remain completely unchanged — same color, same lapel shape, same buttons, same silhouette, same fabric texture. " +
      "Do NOT alter, recolor, or deform the garment in any way. " +
      "The garment identity is preserved exactly.",
    variableSlots: [
      {
        key: "scene",
        label: "场景",
        required: true,
        options: [
          { value: "kitchen", label: "精致厨房", promptFragment: "modern kitchen with marble counter" },
          { value: "living", label: "客厅", promptFragment: "cozy living room with natural light" },
          { value: "cafe", label: "咖啡馆", promptFragment: "stylish cafe with warm lighting" },
          { value: "street", label: "街景", promptFragment: "urban street with modern architecture" },
        ],
      },
    ],
    aspectRatios: ["1:1", "16:9"],
    useReference: true,
  },
};

// ── 模板选择映射 ────────────────────────────────────────
// execute page action -> 推荐模板 ID

export const ACTION_TEMPLATE_MAP: Record<string, string> = {
  background_swap: "bg_scene",
  product_photo: "enhance",
  model_photo: "model_half",
  lifestyle: "lifestyle_scene",
  // 服装专用
  fashion_model: "fashion_model",
  fashion_lifestyle: "fashion_lifestyle",
};

// ── 获取模板 ────────────────────────────────────────────

export function getTemplate(id: string): TemplateConfig | null {
  return TEMPLATES[id] ?? null;
}

export function getAllTemplates(): TemplateConfig[] {
  return Object.values(TEMPLATES);
}

// ── prompt 拼接引擎 ─────────────────────────────────────

interface BuildPromptOptions {
  template: TemplateConfig;
  variables: Partial<Record<VariableKey, string>>; // key -> selected value
  userRefinement?: string; // 用户简短效果描述（如"更亮一些"）
}

function resolveScene(template: TemplateConfig, variables: Partial<Record<VariableKey, string>>): string {
  let scene = template.sceneTemplate;

  // 替换 {{key}} 占位符
  for (const slot of template.variableSlots) {
    const selectedValue = variables[slot.key];
    if (selectedValue) {
      const option = slot.options.find((o) => o.value === selectedValue);
      if (option) {
        scene = scene.replaceAll(`{{${slot.key}}}`, option.promptFragment);
      }
    }
  }

  // 清理未替换的占位符
  scene = scene.replaceAll(/\{\{[^}]+\}\}/g, "").replace(/\s+/g, " ").trim();
  return scene;
}

export function buildPrompt(options: BuildPromptOptions): string {
  const { template, variables, userRefinement } = options;

  const scene = resolveScene(template, variables);

  const parts: string[] = [
    // 场景
    scene + ",",
    // 产品不变（最优先）
    template.productInvariance,
    // 禁止项
    ...template.constraints.map((c) => `Do not: ${c}.`),
  ];

  // 融入用户效果描述（只影响光线/氛围，不改变产品）
  if (userRefinement && userRefinement.trim()) {
    parts.push(
      `User requested visual refinement: "${userRefinement.trim()}". Apply this refinement to lighting, color temperature, or overall mood only — the product itself and its packaging must remain completely unchanged.`
    );
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

// ── 公开接口 ────────────────────────────────────────────

import type { ImageTaskInput } from "./types";

/**
 * 用户在执行页选择的生成选项
 */
export interface ImageGenerationOptions {
  /** 模板 ID，如 "bg_scene", "model_half" */
  templateId: string;
  /** 可变槽位选择的值，如 { scene: "cafe", lighting: "warm" } */
  variables: Partial<Record<VariableKey, string>>;
  /** 产品原图 URL（参考图） */
  originalImageUrl?: string;
  /** 用户对效果的简短描述（可选） */
  userRefinement?: string;
  /** 比例 */
  aspectRatio?: ImageAspectRatio;
}

/**
 * 将 ImageGenerationOptions 转换为 provider 所需的 ImageTaskInput。
 * 所有 prompt 拼接在后端完成，不暴露给前端。
 */
export function buildTaskInputFromOptions(options: ImageGenerationOptions): ImageTaskInput {
  const template = TEMPLATES[options.templateId];
  if (!template) {
    throw new Error(`[template] 未知模板ID: ${options.templateId}`);
  }

  const prompt = buildPrompt({
    template,
    variables: options.variables ?? {},
    userRefinement: options.userRefinement,
  });

  return {
    type: template.id.split("_")[0] as ImageTaskInput["type"], // 取第一段作为 type
    prompt,
    referenceImageUrl: template.useReference ? options.originalImageUrl : undefined,
    aspectRatio: options.aspectRatio ?? template.aspectRatios[0],
  };
}
