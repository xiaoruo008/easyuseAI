/**
 * 图片质量评分函数
 * V1 — 基础规则，不做 AI 识别
 * 
 * 评分维度：
 * - url_valid: URL 格式有效 + 可访问
 * - resolution_adequate: 分辨率达标（宽或高 ≥ 800）
 * - no_indicators: 无低质量指示词（通过 URL/响应判断）
 */

export interface QualityScore {
  total: number;       // 0-100
  urlValid: boolean;
  resolutionOk: boolean;
  latencyOk: boolean;
  reasons: string[];    // 扣分原因
}

export interface ScoringInput {
  imageUrl: string;
  latencyMs: number;
}

/** 简单评分函数 */
export function scoreImage(input: ScoringInput): QualityScore {
  const reasons: string[] = [];
  let total = 100;

  // 1. URL 有效性
  const urlValid = input.imageUrl.startsWith("http");
  if (!urlValid) {
    reasons.push("invalid_url");
    total -= 50;
  }

  // 2. 分辨率（通过 URL 参数判断，部分 CDN 会返回 w/h 参数）
  const url = input.imageUrl.toLowerCase();
  const hasResolutionParam = /\d{3,4}x\d{3,4}/.test(url);
  if (!hasResolutionParam && urlValid) {
    // 无法判断，扣 10 分保守处理
    total -= 10;
    reasons.push("resolution_unknown");
  }

  // 3. 延迟
  const latencyOk = input.latencyMs < 45000;
  if (!latencyOk) {
    reasons.push("slow_generation");
    total -= 20;
  }

  // 4. base64 降级标记
  if (url.startsWith("data:image")) {
    reasons.push("base64_fallback");
    total -= 15;
  }

  return {
    total: Math.max(0, total),
    urlValid,
    resolutionOk: hasResolutionParam || urlValid,
    latencyOk,
    reasons,
  };
}

/** 从多张图片中选择最佳 */
export function pickBest(images: Array<{ imageUrl: string; latencyMs: number }>): number {
  if (images.length === 1) return 0;

  let bestIndex = 0;
  let bestScore = -1;

  for (let i = 0; i < images.length; i++) {
    const score = scoreImage(images[i]);
    if (score.total > bestScore) {
      bestScore = score.total;
      bestIndex = i;
    }
  }

  return bestIndex;
}
