/**
 * 服装工作流路由系统
 *
 * 5题答案 → StructuredAnswer → workflowKey → WorkflowConfig
 */

import type { Market, Gender, Category, TargetImage } from "@/lib/types/fashion";

// ── 工作流配置 ─────────────────────────────────────

export interface WorkflowConfig {
  label: string;
  providerPriority: ("minimax-cn" | "gemini-nanobanana" | "mock")[];
  promptVersion: string;
  outputRatio: string;
  fallbackStrategy: "safe_prompt" | "switch_provider" | "degrade_to_white";
}

// ── 从5题答案提取结构化字段 ───────────────────────────

export interface DiagnosisFields {
  market: Market;
  gender: Gender;
  category: Category;
  targetImage: TargetImage;
  contact: string;
}

const CATEGORY_MAP: Record<string, Category> = {
  A: "suit_set",
  B: "top",
  C: "dress",
  D: "pants",
};

const MARKET_MAP: Record<string, Market> = {
  A: "domestic",
  B: "cross_border",
  C: "domestic",
  D: "domestic",
};

const TARGET_IMAGE_MAP: Record<string, TargetImage> = {
  A: "main_white",
  B: "hero_branded",
  C: "model",
  D: "lifestyle",
};

const GENDER_FROM_CATEGORY: Record<Category, Gender> = {
  suit_set: "menswear",
  top: "womenswear",
  dress: "womenswear",
  pants: "menswear",
  lingerie: "womenswear",
};

export function extractFields(
  answers: Record<string | number, string>,
  contact?: string
): DiagnosisFields {
  const category = CATEGORY_MAP[answers[1] ?? answers["1"] ?? "B"] ?? "top";
  const market = MARKET_MAP[answers[2] ?? answers["2"] ?? "A"] ?? "domestic";
  const targetImage = TARGET_IMAGE_MAP[answers[3] ?? answers["3"] ?? "A"] ?? "main_white";
  const gender = GENDER_FROM_CATEGORY[category];

  return { market, gender, category, targetImage, contact: contact ?? "" };
}

// ── workflowKey 生成 ──────────────────────────────

export type WorkflowKey =
  | "domestic_menswear_suit_set_main_white"
  | "domestic_menswear_suit_set_hero_branded"
  | "domestic_menswear_suit_set_model"
  | "domestic_menswear_suit_set_lifestyle"
  | "domestic_womenswear_top_main_white"
  | "domestic_womenswear_top_model"
  | "domestic_womenswear_top_lifestyle"
  | "domestic_womenswear_dress_main_white"
  | "domestic_womenswear_dress_hero_branded"
  | "domestic_womenswear_dress_model"
  | "domestic_womenswear_dress_lifestyle"
  | "cross_border_menswear_suit_set_main_white"
  | "cross_border_menswear_suit_set_hero_branded"
  | "cross_border_menswear_suit_set_model"
  | "cross_border_menswear_suit_set_lifestyle"
  | "cross_border_womenswear_dress_main_white"
  | "cross_border_womenswear_dress_hero_branded"
  | "cross_border_womenswear_dress_model"
  | "cross_border_womenswear_dress_lifestyle"
  | "cross_border_womenswear_top_model"
  | "cross_border_menswear_top_main_white"
  | "cross_border_menswear_top_model"
  | "cross_border_menswear_top_lifestyle";

export function buildWorkflowKey(fields: DiagnosisFields): string {
  return `${fields.market}_${fields.gender}_${fields.category}_${fields.targetImage}`;
}

// ── 22 套工作流配置 ──────────────────────────────────

export const WORKFLOW_MAP: Record<string, WorkflowConfig> = {
  // ── 国内 · 男装套装 ────────────────────────────
  domestic_menswear_suit_set_main_white: {
    label: "国内男装套装 · 白底主图",
    providerPriority: ["minimax-cn", "mock"],
    promptVersion: "v1-suit-white",
    outputRatio: "3:4",
    fallbackStrategy: "degrade_to_white",
  },
  domestic_menswear_suit_set_hero_branded: {
    label: "国内男装套装 · 官网品牌图",
    providerPriority: ["minimax-cn", "mock"],
    promptVersion: "v1-suit-brand",
    outputRatio: "4:5",
    fallbackStrategy: "safe_prompt",
  },
  domestic_menswear_suit_set_model: {
    label: "国内男装套装 · 模特图",
    providerPriority: ["gemini-nanobanana", "minimax-cn", "mock"],
    promptVersion: "v1-suit-model",
    outputRatio: "3:4",
    fallbackStrategy: "switch_provider",
  },
  domestic_menswear_suit_set_lifestyle: {
    label: "国内男装套装 · 场景图",
    providerPriority: ["gemini-nanobanana", "minimax-cn", "mock"],
    promptVersion: "v1-suit-lifestyle",
    outputRatio: "4:5",
    fallbackStrategy: "switch_provider",
  },

  // ── 国内 · 女装上衣 ────────────────────────────
  domestic_womenswear_top_main_white: {
    label: "国内女装上衣 · 白底主图",
    providerPriority: ["minimax-cn", "mock"],
    promptVersion: "v1-top-white",
    outputRatio: "3:4",
    fallbackStrategy: "degrade_to_white",
  },
  domestic_womenswear_top_model: {
    label: "国内女装上衣 · 模特图",
    providerPriority: ["gemini-nanobanana", "minimax-cn", "mock"],
    promptVersion: "v1-top-model",
    outputRatio: "3:4",
    fallbackStrategy: "switch_provider",
  },
  domestic_womenswear_top_lifestyle: {
    label: "国内女装上衣 · 场景图",
    providerPriority: ["gemini-nanobanana", "minimax-cn", "mock"],
    promptVersion: "v1-top-lifestyle",
    outputRatio: "4:5",
    fallbackStrategy: "switch_provider",
  },

  // ── 国内 · 女装连衣裙 ──────────────────────────
  domestic_womenswear_dress_main_white: {
    label: "国内女装连衣裙 · 白底主图",
    providerPriority: ["minimax-cn", "mock"],
    promptVersion: "v1-dress-white",
    outputRatio: "3:4",
    fallbackStrategy: "degrade_to_white",
  },
  domestic_womenswear_dress_hero_branded: {
    label: "国内女装连衣裙 · 官网品牌图",
    providerPriority: ["minimax-cn", "mock"],
    promptVersion: "v1-dress-brand",
    outputRatio: "4:5",
    fallbackStrategy: "safe_prompt",
  },
  domestic_womenswear_dress_model: {
    label: "国内女装连衣裙 · 模特图",
    providerPriority: ["gemini-nanobanana", "minimax-cn", "mock"],
    promptVersion: "v1-dress-model",
    outputRatio: "3:4",
    fallbackStrategy: "switch_provider",
  },
  domestic_womenswear_dress_lifestyle: {
    label: "国内女装·场景图",
    providerPriority: ["gemini-nanobanana", "minimax-cn", "mock"],
    promptVersion: "v1-dress-lifestyle",
    outputRatio: "4:5",
    fallbackStrategy: "switch_provider",
  },

  // ── 跨境 · 男装上装 ────────────────────────────
  cross_border_menswear_top_main_white: {
    label: "跨境男装上装 · 白底主图",
    providerPriority: ["minimax-cn", "mock"],
    promptVersion: "v1-xb-menswear-top-white",
    outputRatio: "3:4",
    fallbackStrategy: "degrade_to_white",
  },
  cross_border_menswear_top_model: {
    label: "跨境男装上装 · 模特图",
    providerPriority: ["gemini-nanobanana", "minimax-cn", "mock"],
    promptVersion: "v1-xb-menswear-top-model",
    outputRatio: "3:4",
    fallbackStrategy: "switch_provider",
  },
  cross_border_menswear_top_lifestyle: {
    label: "跨境男装上装 · 场景图",
    providerPriority: ["gemini-nanobanana", "minimax-cn", "mock"],
    promptVersion: "v1-xb-menswear-top-lifestyle",
    outputRatio: "4:5",
    fallbackStrategy: "switch_provider",
  },

  // ── 跨境 · 男装套装 ────────────────────────────
  cross_border_menswear_suit_set_main_white: {
    label: "跨境男装套装 · 白底主图",
    providerPriority: ["minimax-cn", "mock"],
    promptVersion: "v1-xb-suit-white",
    outputRatio: "1:1",
    fallbackStrategy: "degrade_to_white",
  },
  cross_border_menswear_suit_set_hero_branded: {
    label: "跨境男装套装 · 官网品牌图",
    providerPriority: ["minimax-cn", "mock"],
    promptVersion: "v1-xb-suit-brand",
    outputRatio: "4:5",
    fallbackStrategy: "safe_prompt",
  },
  cross_border_menswear_suit_set_model: {
    label: "跨境男装套装 · 模特图",
    providerPriority: ["gemini-nanobanana", "minimax-cn", "mock"],
    promptVersion: "v1-xb-suit-model",
    outputRatio: "3:4",
    fallbackStrategy: "switch_provider",
  },
  cross_border_menswear_suit_set_lifestyle: {
    label: "跨境男装套装 · 场景图",
    providerPriority: ["gemini-nanobanana", "minimax-cn", "mock"],
    promptVersion: "v1-xb-suit-lifestyle",
    outputRatio: "4:5",
    fallbackStrategy: "switch_provider",
  },

  // ── 跨境 · 女装连衣裙 ──────────────────────────
  cross_border_womenswear_dress_main_white: {
    label: "跨境女装连衣裙 · 白底主图",
    providerPriority: ["minimax-cn", "mock"],
    promptVersion: "v1-xb-dress-white",
    outputRatio: "1:1",
    fallbackStrategy: "degrade_to_white",
  },
  cross_border_womenswear_dress_hero_branded: {
    label: "跨境女装连衣裙 · 官网品牌图",
    providerPriority: ["minimax-cn", "mock"],
    promptVersion: "v1-xb-dress-brand",
    outputRatio: "4:5",
    fallbackStrategy: "safe_prompt",
  },
  cross_border_womenswear_dress_model: {
    label: "跨境女装连衣裙 · 模特图",
    providerPriority: ["gemini-nanobanana", "minimax-cn", "mock"],
    promptVersion: "v1-xb-dress-model",
    outputRatio: "3:4",
    fallbackStrategy: "switch_provider",
  },
  cross_border_womenswear_dress_lifestyle: {
    label: "跨境女装连衣裙 · 场景图",
    providerPriority: ["gemini-nanobanana", "minimax-cn", "mock"],
    promptVersion: "v1-xb-dress-lifestyle",
    outputRatio: "4:5",
    fallbackStrategy: "switch_provider",
  },

  // ── 跨境 · 女装上衣 ────────────────────────────
  cross_border_womenswear_top_model: {
    label: "跨境女装上衣 · 模特图",
    providerPriority: ["gemini-nanobanana", "minimax-cn", "mock"],
    promptVersion: "v1-xb-top-model",
    outputRatio: "3:4",
    fallbackStrategy: "switch_provider",
  },
};

// ── 查询工作流 ───────────────────────────────────

export function resolveWorkflow(fields: DiagnosisFields): {
  workflowKey: string;
  config: WorkflowConfig | null;
  matched: boolean;
} {
  const workflowKey = buildWorkflowKey(fields);
  const config = WORKFLOW_MAP[workflowKey] ?? null;
  return { workflowKey, config, matched: config !== null };
}
