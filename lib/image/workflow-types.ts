/**
 * 服装图片生成 — 12种需求类型定义
 * 
 * V1 版本，先完善 3 个核心类型，其余预留
 */

export type ClothingImageType =
  | "main_white"       // 白底主图
  | "model_photo"      // 模特上身图
  | "lifestyle"        // 场景种草图
  | "hero_branded"     // 官网品牌图
  | "detail_closeup"   // 细节特写图
  | "packaging_flat"   // 包装平铺图
  | "compare_beforeafter" // 前后对比图
  | "color_variant"   // 颜色变体图
  | "size_guide"       // 尺码参考图
  | "background_swap"  // 背景替换图
  | "ghost_mannequin"  // 幽灵模特图
  | "social_media";    // 社交媒体配图

export interface WorkflowTypeDefinition {
  type: ClothingImageType;
  label: string;
  labelEn: string;
  description: string;
  inputRequirements: {
    hasGarmentImage: boolean;
    hasMannequin?: boolean;
    minResolution?: [number, number];
    maxFileSizeMB?: number;
    supportedFormats: string[];
    notes: string;
  };
  targetEffect: string;
  promptTemplate: string;
  negativePrompt: string;
  params: {
    aspectRatio: "1:1" | "3:4" | "16:9" | "4:3";
    quality?: "standard" | "high" | "premium";
    seed?: number;
    steps?: number;
    guidance?: number;
  };
  fallback: {
    strategy: "retry_original" | "reduce_quality" | "simplify_prompt" | "manual_review" | "mock_image";
    maxRetries: number;
    mockImageUrl?: string;
  };
  output: {
    format: "url" | "base64";
    maxImages: number;
    deliverResolution: [number, number];
    watermark: boolean;
  };
}

// ─────────────────────────────────────────────
// 3 个核心类型（V1 完整版）
// ─────────────────────────────────────────────

export const WORKFLOW_TYPES: Record<ClothingImageType, WorkflowTypeDefinition> = {

  main_white: {
    type: "main_white",
    label: "白底主图",
    labelEn: "White Background Product Shot",
    description: "纯白背景的电商主图，适合淘宝/京东/抖音等平台商品详情页",
    inputRequirements: {
      hasGarmentImage: true,
      minResolution: [600, 600],
      maxFileSizeMB: 10,
      supportedFormats: ["jpg", "jpeg", "png", "webp"],
      notes: "衣物需平整铺开或挂拍，无严重褶皱即可",
    },
    targetEffect: "干净纯白背景（RGB 255,255,255 或接近纯白），服装主体清晰、色彩准确、边缘平滑无毛边",
    promptTemplate: `Professional e-commerce product photography, clean pure white seamless background (RGB 255,255,255), {{garment_description}}, centered composition, bright studio lighting from upper-front, crisp fabric texture visible, no shadows on background, no watermark, ultra high resolution commercial photography`,
    negativePrompt: "grey background, off-white background, colored background, shadow on background, mannequin, person, text, logo, watermark, low quality, blurry, distorted, extra limbs, ugly, deformed",
    params: {
      aspectRatio: "1:1",
      quality: "high",
      steps: 30,
      guidance: 7.5,
    },
    fallback: {
      strategy: "retry_original",
      maxRetries: 2,
    },
    output: {
      format: "url",
      maxImages: 1,
      deliverResolution: [1024, 1024],
      watermark: false,
    },
  },

  model_photo: {
    type: "model_photo",
    label: "模特上身图",
    labelEn: "Model Shot",
    description: "真人模特穿着服装的效果图，适合详情页场景化展示",
    inputRequirements: {
      hasGarmentImage: true,
      minResolution: [800, 1000],
      maxFileSizeMB: 15,
      supportedFormats: ["jpg", "jpeg", "png", "webp"],
      notes: "建议提供正面全身或半身穿着图，背景不限",
    },
    targetEffect: "自然生活场景，模特姿态真实，服装质感好，光线自然柔和，背景与服装风格匹配",
    promptTemplate: `Professional fashion photography, model wearing {{garment_description}}, natural warm studio lighting, upper-body or full-body shot, realistic human proportions, authentic pose, clean background or lifestyle context, bright and airy aesthetic, commercial quality, no watermark, ultra high resolution`,
    negativePrompt: "cartoon, anime, 3d render, doll, mannequin, ugly, deformed, extra limbs, blurry, low quality, distorted proportions, bad anatomy, wrong hands, text, logo, watermark, grey background, flat lay",
    params: {
      aspectRatio: "3:4",
      quality: "high",
      steps: 35,
      guidance: 8,
    },
    fallback: {
      strategy: "reduce_quality",
      maxRetries: 2,
    },
    output: {
      format: "url",
      maxImages: 1,
      deliverResolution: [1024, 1366],
      watermark: false,
    },
  },

  lifestyle: {
    type: "lifestyle",
    label: "场景种草图",
    labelEn: "Lifestyle Shot",
    description: "服装在生活场景中的氛围图，适合小红书/抖音/Instagram 種草",
    inputRequirements: {
      hasGarmentImage: true,
      minResolution: [800, 800],
      maxFileSizeMB: 15,
      supportedFormats: ["jpg", "jpeg", "png", "webp"],
      notes: "场景类型可选：室内/户外/咖啡馆/街拍等",
    },
    targetEffect: "具有故事感和氛围感的生活场景，服装融入自然，光线有层次，色调统一有美感",
    promptTemplate: `Beautiful lifestyle photography, {{garment_description}} styled in a {{scene_type}}, warm natural lighting, golden hour aesthetic, fashion editorial quality, Instagram-worthy composition, soft bokeh background, natural colors, trendy and aspirational mood, no watermark, ultra high resolution`,
    negativePrompt: "cartoon, anime, 3d render, mannequin, ugly, deformed, extra limbs, blurry, low quality, distorted, bad lighting, harsh shadows, text, logo, watermark, cluttered background, ugly composition",
    params: {
      aspectRatio: "3:4",
      quality: "premium",
      steps: 40,
      guidance: 8.5,
    },
    fallback: {
      strategy: "retry_original",
      maxRetries: 1,
      mockImageUrl: "/images/fallback/lifestyle-default.jpg",
    },
    output: {
      format: "url",
      maxImages: 1,
      deliverResolution: [1024, 1366],
      watermark: false,
    },
  },

  // ─────────────────────────────────────────────
  // 其余 9 个类型（V1 预留，基础结构）
  // ─────────────────────────────────────────────

  hero_branded: {
    type: "hero_branded",
    label: "官网品牌图",
    labelEn: "Hero Brand Image",
    description: "品牌官网用的大片级主图，强调调性和品牌感",
    inputRequirements: {
      hasGarmentImage: true,
      minResolution: [1200, 800],
      maxFileSizeMB: 20,
      supportedFormats: ["jpg", "jpeg", "png", "webp"],
      notes: "建议提供高分辨率平铺或挂拍图",
    },
    targetEffect: "品牌感强、视觉冲击力大的主视觉图，构图讲究，光影有戏剧性",
    promptTemplate: `Luxury fashion hero shot, {{garment_description}}, dramatic studio lighting with rim light, editorial fashion magazine quality, high-end brand aesthetic, bold composition, ultra high resolution, no watermark`,
    negativePrompt: "ugly, deformed, extra limbs, blurry, low quality, distorted, text, logo, watermark, cluttered",
    params: {
      aspectRatio: "16:9",
      quality: "premium",
      steps: 40,
      guidance: 9,
    },
    fallback: {
      strategy: "simplify_prompt",
      maxRetries: 1,
    },
    output: {
      format: "url",
      maxImages: 1,
      deliverResolution: [1920, 1080],
      watermark: false,
    },
  },

  detail_closeup: {
    type: "detail_closeup",
    label: "细节特写图",
    labelEn: "Detail Closeup",
    description: "服装面料、纹理、纽扣、刺绣等细节特写",
    inputRequirements: {
      hasGarmentImage: true,
      minResolution: [400, 400],
      maxFileSizeMB: 8,
      supportedFormats: ["jpg", "jpeg", "png", "webp"],
      notes: "特写区域建议占图片主体",
    },
    targetEffect: "高倍放大质感，纹理清晰，色彩准确，光线能体现面料质感",
    promptTemplate: `Extreme close-up macro shot of {{garment_description}}, fabric texture details, stitch and seam quality visible, professional macro photography lighting, shallow depth of field, ultra sharp, no watermark`,
    negativePrompt: "blurry, low quality, distorted, ugly, deformed, text, logo, watermark, wide shot, full garment",
    params: {
      aspectRatio: "1:1",
      quality: "high",
      steps: 30,
      guidance: 7,
    },
    fallback: {
      strategy: "retry_original",
      maxRetries: 1,
    },
    output: {
      format: "url",
      maxImages: 1,
      deliverResolution: [1024, 1024],
      watermark: false,
    },
  },

  packaging_flat: {
    type: "packaging_flat",
    label: "包装平铺图",
    labelEn: "Flat Lay Packaging",
    description: "服装平整铺展的俯视图，适合展示全貌和尺码",
    inputRequirements: {
      hasGarmentImage: true,
      minResolution: [800, 800],
      maxFileSizeMB: 10,
      supportedFormats: ["jpg", "jpeg", "png", "webp"],
      notes: "衣物需平整铺开，无褶皱",
    },
    targetEffect: "俯视角度，服装平整铺展，背景简洁，尺寸感真实",
    promptTemplate: `Professional flat lay photography, {{garment_description}} laid flat on clean white background, 90-degree top-down shot, even lighting, no wrinkles, true-to-life colors, no shadows, no watermark`,
    negativePrompt: "blurry, low quality, distorted, crooked, wrinkled, shadow, mannequin, text, logo, watermark",
    params: {
      aspectRatio: "1:1",
      quality: "standard",
      steps: 25,
      guidance: 7,
    },
    fallback: {
      strategy: "retry_original",
      maxRetries: 1,
    },
    output: {
      format: "url",
      maxImages: 1,
      deliverResolution: [1024, 1024],
      watermark: false,
    },
  },

  compare_beforeafter: {
    type: "compare_beforeafter",
    label: "前后对比图",
    labelEn: "Before/After Comparison",
    description: "原图与效果图并排对比，适用于展示修图能力",
    inputRequirements: {
      hasGarmentImage: true,
      minResolution: [600, 600],
      maxFileSizeMB: 10,
      supportedFormats: ["jpg", "jpeg", "png", "webp"],
      notes: "需提供原始参考图",
    },
    targetEffect: "左右或上下拼接，原图和效果图可对比，标注清晰",
    promptTemplate: `Split screen comparison, left side: raw unedited photo of {{garment_description}}, right side: professionally enhanced version with clean background and better lighting, side by side layout, labeled "Before" and "After", no watermark`,
    negativePrompt: "blurry, low quality, distorted, text other than labels, logo, watermark",
    params: {
      aspectRatio: "1:1",
      quality: "standard",
      steps: 25,
      guidance: 7,
    },
    fallback: {
      strategy: "manual_review",
      maxRetries: 0,
    },
    output: {
      format: "url",
      maxImages: 1,
      deliverResolution: [1024, 512],
      watermark: false,
    },
  },

  color_variant: {
    type: "color_variant",
    label: "颜色变体图",
    labelEn: "Color Variant",
    description: "同一款式不同颜色的展示图",
    inputRequirements: {
      hasGarmentImage: true,
      minResolution: [600, 600],
      maxFileSizeMB: 10,
      supportedFormats: ["jpg", "jpeg", "png", "webp"],
      notes: "可指定目标颜色，支持多色",
    },
    targetEffect: "保持原款剪裁和姿态，仅改变颜色，自然真实",
    promptTemplate: `Fashion flat lay, {{garment_description}}, now in {{target_color}} colorway, same design and cut, professional e-commerce product photography, clean background, no watermark`,
    negativePrompt: "ugly, deformed, extra limbs, blurry, low quality, distorted, text, logo, watermark",
    params: {
      aspectRatio: "1:1",
      quality: "high",
      steps: 30,
      guidance: 7.5,
    },
    fallback: {
      strategy: "retry_original",
      maxRetries: 1,
    },
    output: {
      format: "url",
      maxImages: 3,
      deliverResolution: [1024, 1024],
      watermark: false,
    },
  },

  size_guide: {
    type: "size_guide",
    label: "尺码参考图",
    labelEn: "Size Guide Image",
    description: "真人穿着尺码参考图，帮助消费者选择尺码",
    inputRequirements: {
      hasGarmentImage: false,
      supportedFormats: [],
      notes: "不需要输入图，根据服装品类生成尺码参考图",
    },
    targetEffect: "清晰标注各尺码适合的身高体重范围，穿着真实自然",
    promptTemplate: `Size guide photography, model wearing {{clothing_category}} in different sizes showing fit comparison, height and weight labels, professional e-commerce photography, clean background, no watermark`,
    negativePrompt: "ugly, deformed, blurry, low quality, text other than size labels, logo, watermark",
    params: {
      aspectRatio: "3:4",
      quality: "standard",
      steps: 25,
      guidance: 7,
    },
    fallback: {
      strategy: "mock_image",
      maxRetries: 0,
      mockImageUrl: "/images/fallback/size-guide-default.jpg",
    },
    output: {
      format: "url",
      maxImages: 1,
      deliverResolution: [800, 1067],
      watermark: false,
    },
  },

  background_swap: {
    type: "background_swap",
    label: "背景替换图",
    labelEn: "Background Swap",
    description: "保留原服装，更换背景场景",
    inputRequirements: {
      hasGarmentImage: true,
      hasMannequin: false,
      minResolution: [600, 600],
      maxFileSizeMB: 10,
      supportedFormats: ["jpg", "jpeg", "png", "webp"],
      notes: "衣物需边缘清晰，背景尽量单一",
    },
    targetEffect: "服装边缘自然，背景真实，光影一致，无生硬合成感",
    promptTemplate: `Professional background replacement, {{garment_description}} placed in {{target_scene}}, natural soft studio lighting matching the new background, realistic shadow, seamless blend, no mannequin visible, no watermark`,
    negativePrompt: "mannequin visible, harsh edges, inconsistent lighting, blurry, low quality, distorted, text, logo, watermark, obvious compositing",
    params: {
      aspectRatio: "3:4",
      quality: "high",
      steps: 35,
      guidance: 8,
    },
    fallback: {
      strategy: "retry_original",
      maxRetries: 2,
    },
    output: {
      format: "url",
      maxImages: 1,
      deliverResolution: [1024, 1366],
      watermark: false,
    },
  },

  ghost_mannequin: {
    type: "ghost_mannequin",
    label: "幽灵模特图",
    labelEn: "Ghost Mannequin",
    description: "用模特体型呈现服装效果，模特轮廓隐约可见但不明显",
    inputRequirements: {
      hasGarmentImage: true,
      minResolution: [600, 800],
      maxFileSizeMB: 10,
      supportedFormats: ["jpg", "jpeg", "png", "webp"],
      notes: "服装需平整或挂拍",
    },
    targetEffect: "服装呈现自然垂坠感，有隐约的人体轮廓，无面部细节，光影自然",
    promptTemplate: `Ghost mannequin effect, {{garment_description}} worn on invisible human form mannequin, subtle body shape visible through fabric, soft natural lighting, no face or hands visible, clean studio background, no watermark`,
    negativePrompt: "ugly, deformed, extra limbs, blurry, low quality, distorted, face visible, hands visible, mannequin stand visible, text, logo, watermark",
    params: {
      aspectRatio: "3:4",
      quality: "high",
      steps: 30,
      guidance: 7.5,
    },
    fallback: {
      strategy: "retry_original",
      maxRetries: 1,
    },
    output: {
      format: "url",
      maxImages: 1,
      deliverResolution: [1024, 1366],
      watermark: false,
    },
  },

  social_media: {
    type: "social_media",
    label: "社交媒体配图",
    labelEn: "Social Media Post",
    description: "适合小红书/抖音/Instagram 发的穿搭种草图",
    inputRequirements: {
      hasGarmentImage: true,
      minResolution: [800, 800],
      maxFileSizeMB: 15,
      supportedFormats: ["jpg", "jpeg", "png", "webp"],
      notes: "可选：配文文案由另一模块生成",
    },
    targetEffect: "画面精美有质感，色调温暖生活化，整体有传播性",
    promptTemplate: `Trendy social media fashion photo, {{garment_description}} styled in a cozy {{scene_type}}, warm golden hour lighting, Instagram-worthy composition, soft color grading, slightly film grain aesthetic, no watermark, ultra high resolution`,
    negativePrompt: "ugly, deformed, extra limbs, blurry, low quality, distorted, text, logo, watermark, cluttered background, bad composition",
    params: {
      aspectRatio: "3:4",
      quality: "premium",
      steps: 40,
      guidance: 8.5,
    },
    fallback: {
      strategy: "retry_original",
      maxRetries: 1,
      mockImageUrl: "/images/fallback/social-default.jpg",
    },
    output: {
      format: "url",
      maxImages: 1,
      deliverResolution: [1080, 1440],
      watermark: false,
    },
  },
};

// 辅助函数

export function getWorkflowType(type: ClothingImageType): WorkflowTypeDefinition {
  return WORKFLOW_TYPES[type];
}

export function getCoreTypes(): ClothingImageType[] {
  return ["main_white", "model_photo", "lifestyle"];
}

export function getAllTypes(): ClothingImageType[] {
  return Object.keys(WORKFLOW_TYPES) as ClothingImageType[];
}

export function resolvePrompt(
  type: ClothingImageType,
  variables: {
    garment_description: string;
    scene_type?: string;
    target_color?: string;
    clothing_category?: string;
    target_scene?: string;
  }
): { prompt: string; negativePrompt: string } {
  const def = WORKFLOW_TYPES[type];
  const prompt = def.promptTemplate
    .replace(/\{\{garment_description\}\}/g, variables.garment_description)
    .replace(/\{\{scene_type\}\}/g, variables.scene_type ?? "cozy coffee shop interior")
    .replace(/\{\{target_color\}\}/g, variables.target_color ?? "neutral beige")
    .replace(/\{\{clothing_category\}\}/g, variables.clothing_category ?? "casual top")
    .replace(/\{\{target_scene\}\}/g, variables.target_scene ?? "minimal white studio");

  return {
    prompt,
    negativePrompt: def.negativePrompt,
  };
}
