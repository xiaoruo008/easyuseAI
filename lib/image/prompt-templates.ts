/**
 * 模特上身图 prompt 模板
 * V1 — 固定模板，不做动态 prompt 工程
 */

export const MODEL_PHOTO_TEMPLATES = {
  prompt: `Professional fashion photography, model wearing {{garment_description}}, natural warm studio lighting, upper-body or full-body shot, realistic human proportions, authentic pose, clean background or lifestyle context, bright and airy aesthetic, commercial quality, no watermark, ultra high resolution`,

  negativePrompt: `cartoon, anime, 3d render, doll, mannequin, ugly, deformed, extra limbs, blurry, low quality, distorted proportions, bad anatomy, wrong hands, text, logo, watermark, grey background, flat lay`,

  /** 模板变量填充 */
  resolve(garmentDescription: string): { prompt: string; negativePrompt: string } {
    return {
      prompt: this.prompt.replace(/\{\{garment_description\}\}/g, garmentDescription),
      negativePrompt: this.negativePrompt,
    };
  },
} as const;

/** 场景候选项（生活化上身图） */
export const LIFESTYLE_SCENES = [
  "cozy coffee shop",
  "urban street",
  "natural outdoor park",
  "minimalist home interior",
  "bookshop atmosphere",
] as const;

export type LifestyleScene = typeof LIFESTYLE_SCENES[number];
