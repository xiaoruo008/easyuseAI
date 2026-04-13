/**
 * 图片生成固定参数配置
 * V1 — 所有类型统一使用这套参数，不做动态调参
 */

export const GENERATION_CONFIG = {
  model_photo: {
    model: "image-01",
    steps: 35,
    guidance: 8.0,
    aspectRatio: "3:4",
    n: 1,
    responseFormat: "url",
    quality: "high" as const,
    timeoutMs: 60000,
  },

  lifestyle: {
    model: "image-01",
    steps: 40,
    guidance: 8.5,
    aspectRatio: "3:4",
    n: 1,
    responseFormat: "url",
    quality: "premium" as const,
    timeoutMs: 60000,
  },

  main_white: {
    model: "image-01",
    steps: 30,
    guidance: 7.5,
    aspectRatio: "1:1",
    n: 1,
    responseFormat: "url",
    quality: "high" as const,
    timeoutMs: 60000,
  },
} as const;

export type ImageTypeKey = keyof typeof GENERATION_CONFIG;

/** 获取某类型的生成参数 */
export function getGenConfig(type: ImageTypeKey) {
  return GENERATION_CONFIG[type] ?? GENERATION_CONFIG.main_white;
}
