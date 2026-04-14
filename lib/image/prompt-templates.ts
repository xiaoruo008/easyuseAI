/**
 * 服装图片生成 — Prompt 模板集合
 * V1 — 固定模板，不做动态 prompt 工程
 * 与 workflow-types.ts 中的 promptTemplate 保持同步
 */

// ─────────────────────────────────────────────
// 1. 白底主图
// ─────────────────────────────────────────────
export const MAIN_WHITE_TEMPLATES = {
  prompt: `Professional e-commerce product photography, clean pure white seamless background (RGB 255,255,255), {{garment_description}}, centered composition, bright studio lighting from upper-front, crisp fabric texture visible, no shadows on background, no watermark, ultra high resolution commercial photography`,

  negativePrompt: `grey background, off-white background, colored background, shadow on background, mannequin, person, text, logo, watermark, low quality, blurry, distorted, extra limbs, ugly, deformed`,

  resolve(garmentDescription: string): { prompt: string; negativePrompt: string } {
    return {
      prompt: this.prompt.replace(/\{\{garment_description\}\}/g, garmentDescription),
      negativePrompt: this.negativePrompt,
    };
  },
} as const;

// ─────────────────────────────────────────────
// 2. 模特上身图
// ─────────────────────────────────────────────
export const MODEL_PHOTO_TEMPLATES = {
  prompt: `Professional fashion photography, model wearing {{garment_description}}, natural warm studio lighting, upper-body or full-body shot, realistic human proportions, authentic pose, clean background or lifestyle context, bright and airy aesthetic, commercial quality, no watermark, ultra high resolution`,

  negativePrompt: `cartoon, anime, 3d render, doll, mannequin, ugly, deformed, extra limbs, blurry, low quality, distorted proportions, bad anatomy, wrong hands, text, logo, watermark, grey background, flat lay`,

  resolve(garmentDescription: string): { prompt: string; negativePrompt: string } {
    return {
      prompt: this.prompt.replace(/\{\{garment_description\}\}/g, garmentDescription),
      negativePrompt: this.negativePrompt,
    };
  },
} as const;

// ─────────────────────────────────────────────
// 3. 场景种草图
// ─────────────────────────────────────────────
export const LIFESTYLE_TEMPLATES = {
  prompt: `Beautiful lifestyle photography, {{garment_description}} styled in a {{scene_type}}, warm natural lighting, golden hour aesthetic, fashion editorial quality, Instagram-worthy composition, soft bokeh background, natural colors, trendy and aspirational mood, no watermark, ultra high resolution`,

  negativePrompt: `cartoon, anime, 3d render, mannequin, ugly, deformed, extra limbs, blurry, low quality, distorted, bad lighting, harsh shadows, text, logo, watermark, cluttered background, ugly composition`,

  resolve(garmentDescription: string, sceneType: string): { prompt: string; negativePrompt: string } {
    return {
      prompt: this.prompt
        .replace(/\{\{garment_description\}\}/g, garmentDescription)
        .replace(/\{\{scene_type\}\}/g, sceneType),
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

export type LifestyleScene = (typeof LIFESTYLE_SCENES)[number];

// ─────────────────────────────────────────────
// 4. 官网品牌图
// ─────────────────────────────────────────────
export const HERO_BRANDED_TEMPLATES = {
  prompt: `Luxury fashion hero shot, {{garment_description}}, dramatic studio lighting with rim light, editorial fashion magazine quality, high-end brand aesthetic, bold composition, ultra high resolution, no watermark`,

  negativePrompt: `ugly, deformed, extra limbs, blurry, low quality, distorted, text, logo, watermark, cluttered`,

  resolve(garmentDescription: string): { prompt: string; negativePrompt: string } {
    return {
      prompt: this.prompt.replace(/\{\{garment_description\}\}/g, garmentDescription),
      negativePrompt: this.negativePrompt,
    };
  },
} as const;

// ─────────────────────────────────────────────
// 5. 细节特写图
// ─────────────────────────────────────────────
export const DETAIL_CLOSEUP_TEMPLATES = {
  prompt: `Extreme close-up macro shot of {{garment_description}}, fabric texture details, stitch and seam quality visible, professional macro photography lighting, shallow depth of field, ultra sharp, no watermark`,

  negativePrompt: `blurry, low quality, distorted, ugly, deformed, text, logo, watermark, wide shot, full garment`,

  resolve(garmentDescription: string): { prompt: string; negativePrompt: string } {
    return {
      prompt: this.prompt.replace(/\{\{garment_description\}\}/g, garmentDescription),
      negativePrompt: this.negativePrompt,
    };
  },
} as const;

// ─────────────────────────────────────────────
// 6. 包装平铺图
// ─────────────────────────────────────────────
export const PACKAGING_FLAT_TEMPLATES = {
  prompt: `Professional flat lay photography, {{garment_description}} laid flat on clean white background, 90-degree top-down shot, even lighting, no wrinkles, true-to-life colors, no shadows, no watermark`,

  negativePrompt: `blurry, low quality, distorted, crooked, wrinkled, shadow, mannequin, text, logo, watermark`,

  resolve(garmentDescription: string): { prompt: string; negativePrompt: string } {
    return {
      prompt: this.prompt.replace(/\{\{garment_description\}\}/g, garmentDescription),
      negativePrompt: this.negativePrompt,
    };
  },
} as const;

// ─────────────────────────────────────────────
// 7. 前后对比图
// ─────────────────────────────────────────────
export const COMPARE_BEFOREAFTER_TEMPLATES = {
  prompt: `Split screen comparison, left side: raw unedited photo of {{garment_description}}, right side: professionally enhanced version with clean background and better lighting, side by side layout, labeled "Before" and "After", no watermark`,

  negativePrompt: `blurry, low quality, distorted, text other than labels, logo, watermark`,

  resolve(garmentDescription: string): { prompt: string; negativePrompt: string } {
    return {
      prompt: this.prompt.replace(/\{\{garment_description\}\}/g, garmentDescription),
      negativePrompt: this.negativePrompt,
    };
  },
} as const;

// ─────────────────────────────────────────────
// 8. 颜色变体图
// ─────────────────────────────────────────────
export const COLOR_VARIANT_TEMPLATES = {
  prompt: `Fashion flat lay, {{garment_description}}, now in {{target_color}} colorway, same design and cut, professional e-commerce product photography, clean background, no watermark`,

  negativePrompt: `ugly, deformed, extra limbs, blurry, low quality, distorted, text, logo, watermark`,

  resolve(garmentDescription: string, targetColor: string): { prompt: string; negativePrompt: string } {
    return {
      prompt: this.prompt
        .replace(/\{\{garment_description\}\}/g, garmentDescription)
        .replace(/\{\{target_color\}\}/g, targetColor),
      negativePrompt: this.negativePrompt,
    };
  },
} as const;

// ─────────────────────────────────────────────
// 9. 尺码参考图
// ─────────────────────────────────────────────
export const SIZE_GUIDE_TEMPLATES = {
  prompt: `Size guide photography, model wearing {{clothing_category}} in different sizes showing fit comparison, height and weight labels, professional e-commerce photography, clean background, no watermark`,

  negativePrompt: `ugly, deformed, blurry, low quality, text other than size labels, logo, watermark`,

  resolve(clothingCategory: string): { prompt: string; negativePrompt: string } {
    return {
      prompt: this.prompt.replace(/\{\{clothing_category\}\}/g, clothingCategory),
      negativePrompt: this.negativePrompt,
    };
  },
} as const;

// ─────────────────────────────────────────────
// 10. 背景替换图
// ─────────────────────────────────────────────
export const BACKGROUND_SWAP_TEMPLATES = {
  prompt: `Professional background replacement, {{garment_description}} placed in {{target_scene}}, natural soft studio lighting matching the new background, realistic shadow, seamless blend, no mannequin visible, no watermark`,

  negativePrompt: `mannequin visible, harsh edges, inconsistent lighting, blurry, low quality, distorted, text, logo, watermark, obvious compositing`,

  resolve(garmentDescription: string, targetScene: string): { prompt: string; negativePrompt: string } {
    return {
      prompt: this.prompt
        .replace(/\{\{garment_description\}\}/g, garmentDescription)
        .replace(/\{\{target_scene\}\}/g, targetScene),
      negativePrompt: this.negativePrompt,
    };
  },
} as const;

// ─────────────────────────────────────────────
// 11. 幽灵模特图
// ─────────────────────────────────────────────
export const GHOST_MANNEQUIN_TEMPLATES = {
  prompt: `Ghost mannequin effect, {{garment_description}} worn on invisible human form mannequin, subtle body shape visible through fabric, soft natural lighting, no face or hands visible, clean studio background, no watermark`,

  negativePrompt: `ugly, deformed, extra limbs, blurry, low quality, distorted, face visible, hands visible, mannequin stand visible, text, logo, watermark`,

  resolve(garmentDescription: string): { prompt: string; negativePrompt: string } {
    return {
      prompt: this.prompt.replace(/\{\{garment_description\}\}/g, garmentDescription),
      negativePrompt: this.negativePrompt,
    };
  },
} as const;

// ─────────────────────────────────────────────
// 12. 社交媒体配图
// ─────────────────────────────────────────────
export const SOCIAL_MEDIA_TEMPLATES = {
  prompt: `Trendy social media fashion photo, {{garment_description}} styled in a cozy {{scene_type}}, warm golden hour lighting, Instagram-worthy composition, soft color grading, slightly film grain aesthetic, no watermark, ultra high resolution`,

  negativePrompt: `ugly, deformed, extra limbs, blurry, low quality, distorted, text, logo, watermark, cluttered background, bad composition`,

  resolve(garmentDescription: string, sceneType: string): { prompt: string; negativePrompt: string } {
    return {
      prompt: this.prompt
        .replace(/\{\{garment_description\}\}/g, garmentDescription)
        .replace(/\{\{scene_type\}\}/g, sceneType),
      negativePrompt: this.negativePrompt,
    };
  },
} as const;

// ─────────────────────────────────────────────
// 统一导出映射（方便按类型查找）
// ─────────────────────────────────────────────
export const PROMPT_TEMPLATES = {
  main_white: MAIN_WHITE_TEMPLATES,
  model_photo: MODEL_PHOTO_TEMPLATES,
  lifestyle: LIFESTYLE_TEMPLATES,
  hero_branded: HERO_BRANDED_TEMPLATES,
  detail_closeup: DETAIL_CLOSEUP_TEMPLATES,
  packaging_flat: PACKAGING_FLAT_TEMPLATES,
  compare_beforeafter: COMPARE_BEFOREAFTER_TEMPLATES,
  color_variant: COLOR_VARIANT_TEMPLATES,
  size_guide: SIZE_GUIDE_TEMPLATES,
  background_swap: BACKGROUND_SWAP_TEMPLATES,
  ghost_mannequin: GHOST_MANNEQUIN_TEMPLATES,
  social_media: SOCIAL_MEDIA_TEMPLATES,
} as const;
