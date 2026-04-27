/**
 * MiniMax 国内版（minimaxi.com）图片生成 Provider
 *
 * 已验证可用！
 * 探测结果：HTTP 200，image_urls 格式，base_resp.status_code=0 为成功
 *
 * API 文档：https://platform.minimaxi.com/docs/api-reference/image-generation
 * 接口地址：https://api.minimaxi.com/v1/image_generation
 *
 * 认证：Bearer Token
 */

import type { ImageProvider } from "../provider";
import type { ImageTaskInput, ImageTaskOutput, ImageTaskBatchOutput } from "../types";
import { pickBest } from "../quality-score";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY ?? "";
const MINIMAX_IMAGE_BASE_URL = process.env.MINIMAX_IMAGE_BASE_URL ?? "https://api.minimaxi.com";

const ASPECT_MAP: Record<string, string> = {
  "1:1": "1:1",
  "3:4": "3:4",
  "16:9": "16:9",
};

const MODEL = "image-01";

// 各 type 对应的 prompt 前缀（模板层已做产品不变约束，这里只做类型风格加成）
const STYLE_GUIDANCE: Record<string, string> = {
  luxury: "Luxury boutique aesthetic, editorial high-fashion quality, sophisticated refined mood, premium color grading, polished presentation.",
  minimal: "Minimalist clean aesthetic, simple and elegant composition, generous white space, understated sophistication.",
  commercial: "Commercial e-commerce standard, retail-ready quality, clean professional presentation, high conversion aesthetic.",
};

const TYPE_PROMPT_PREFIX: Record<string, string> = {
  product_photo: "Professional e-commerce product photography, clean studio lighting. The uploaded product is the ONLY subject — keep it 100% identical in shape, color, texture, details. DO NOT replace or modify the product. Only improve background and lighting.",
  model_photo: "Professional fashion/lifestyle product photography. The uploaded product is the ONLY subject — keep it 100% identical. If adding a model, the model must interact with the ORIGINAL product. DO NOT replace the product. Only improve scene and lighting.",
  background_swap: "Professional product photography with clean background. The uploaded product is the ONLY subject — keep it 100% identical. DO NOT generate a different product. Only change the background.",
  background: "Clean pure white or light neutral background, seamless studio product photography. The uploaded product is the ONLY subject — keep it 100% identical. DO NOT replace or modify the product.",
  enhance: "Professional commercial product photography, bright natural window light. The uploaded product is the ONLY subject — keep it 100% identical in shape, color, texture, details. DO NOT alter the product. Only enhance lighting and color.",
  lifestyle: "Product beautifully placed in a lifestyle scene, warm natural lighting. The uploaded product is the ONLY subject — keep it 100% identical. DO NOT replace the product with a different one. Only place the original product in a new scene.",
};

// 爆款前缀：根据诊断类型注入转化率增强 prompt
const TRENDING_PROMPT_PREFIX: Record<string, string> = {
  traffic: "Trending on social media, highly shareable viral content, ",
  customer: "Resonates deeply with target customers, emotional connection, ",
  efficiency: "Streamlined productivity aesthetic, clean and efficient visual, ",
  unclear: "Versatile commercial appeal, broad audience engagement, ",
};

interface MiniMaxCNResponse {
  id?: string;
  data?: {
    image_urls?: string[];
    image_base64?: string[];
  };
  metadata?: {
    success_count?: string | number;
    failed_count?: string | number;
  };
  base_resp?: {
    status_code?: number;
    status_msg?: string;
  };
}

export class MiniMaxCNProvider implements ImageProvider {
  name = "minimax-cn";

  async generate(input: ImageTaskInput): Promise<ImageTaskOutput> {
    if (!MINIMAX_API_KEY) {
      throw new Error(
        "[MiniMax-CN] MINIMAX_API_KEY 未配置。" +
          " 请在 .env 中设置 MINIMAX_API_KEY。" +
          " 开通图片权限：https://platform.minimaxi.com/user-center/basic-information/interface-key"
      );
    }

    const aspectRatio = ASPECT_MAP[input.aspectRatio ?? "1:1"] ?? "1:1";
    const typePrefix = TYPE_PROMPT_PREFIX[input.type] ?? TYPE_PROMPT_PREFIX.product_photo;
    const styleGuidance = input.style ? (STYLE_GUIDANCE[input.style] ?? "") : "";
    const stylePrefix = styleGuidance ? `${styleGuidance} ` : "";
    const trendingPrefix = input.diagnosisType ? (TRENDING_PROMPT_PREFIX[input.diagnosisType] ?? "") : "";
    const fullPrompt = `${trendingPrefix}${stylePrefix}${typePrefix} ${input.prompt}`.slice(0, 1500);

    const body: Record<string, unknown> = {
      model: MODEL,
      prompt: fullPrompt,
      aspect_ratio: aspectRatio,
      response_format: "base64", // base64 绕过 OSS URL IP 限制，返回永久可用路径
      n: 1,
    };

    if (input.referenceImageUrl) {
      body.subject_reference = [
        {
          type: "character",
          image_file: input.referenceImageUrl,
        },
      ];
    }

    const url = `${MINIMAX_IMAGE_BASE_URL}/v1/image_generation`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MINIMAX_API_KEY}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60000), // 60s 超时保护（API 耗时约 10-35s）
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[MiniMax-CN] ❌ 网络请求失败:", msg);
      if (msg.includes("timeout") || msg.includes("Timeout")) {
        throw new Error(`[MiniMax-CN] 请求超时（30秒），请稍后重试`);
      }
      throw new Error(`[MiniMax-CN] 网络请求失败：${msg}`);
    }

    const status = res.status;
    let rawText = "";
    try {
      rawText = await res.text();
    } catch {
      rawText = "(无法读取响应体)";
    }

    // ── 解析响应 ────────────────────────────────────────
    if (status !== 200) {
      // HTTP 错误
      let errMsg = `[MiniMax-CN] HTTP ${status}`;
      try {
        const json = JSON.parse(rawText) as MiniMaxCNResponse;
        const code = json.base_resp?.status_code;
        const msg = json.base_resp?.status_msg ?? "unknown";

        if (status === 401 || status === 403 || code === 401 || code === 403) {
          errMsg = `[MiniMax-CN] ❌ Key 无权（HTTP ${status}，code ${code ?? status}）。` +
            ` 请确认 MINIMAX_API_KEY 具有图片生成权限。` +
            ` 权限开通：https://platform.minimaxi.com/user-center/basic-information/interface-key`;
        } else if (code === 2049) {
          errMsg = `[MiniMax-CN] ❌ API Key 无图片权限（code 2049）。` +
            ` 需要开通图片接口权限：` +
            ` https://platform.minimaxi.com/user-center/basic-information/interface-key`;
        } else if (status === 429) {
          errMsg = `[MiniMax-CN] ❌ 请求过于频繁（HTTP 429），请稍后重试。`;
        } else {
          errMsg = `[MiniMax-CN] ❌ HTTP ${status}，业务错误（code ${code}）：${msg}`;
        }
      } catch {
        errMsg = `[MiniMax-CN] ❌ HTTP ${status}：${rawText.slice(0, 200)}`;
      }
      console.error(errMsg);
      throw new Error(errMsg);
    }

    // HTTP 200，解析 JSON
    let json: MiniMaxCNResponse;
    try {
      json = JSON.parse(rawText) as MiniMaxCNResponse;
    } catch {
      console.error("[MiniMax-CN] ❌ 响应 JSON 解析失败");
      throw new Error("[MiniMax-CN] 响应格式错误（非有效 JSON）：" + rawText.slice(0, 100));
    }

    // 业务状态码检查
    const bizCode = json.base_resp?.status_code;
    if (bizCode !== 0 && bizCode !== undefined) {
      const msg = json.base_resp?.status_msg ?? "unknown";
      if (bizCode === 2049) {
        const err = `[MiniMax-CN] ❌ Key 无图片权限（code 2049）。` +
          ` 请开通图片接口权限：` +
          ` https://platform.minimaxi.com/user-center/basic-information/interface-key`;
        console.error(err);
        throw new Error(err);
      }
      const err = `[MiniMax-CN] ❌ 业务错误（code ${bizCode}）：${msg}`;
      console.error(err);
      throw new Error(err);
    }

    // 提取图片 URL / base64
    // 优先 base64（绕过 OSS IP 限制），否则用 URL
    let imageUrl = "";
    if (json.data?.image_base64?.length) {
      imageUrl = `data:image/jpeg;base64,${json.data.image_base64[0]}`;
    } else if (json.data?.image_urls?.length) {
      imageUrl = decodeURIComponent(json.data.image_urls[0]);
    }

    if (!imageUrl) {
      console.error("[MiniMax-CN] ❌ 图片数据为空", JSON.stringify(json.data));
      throw new Error("[MiniMax-CN] 接口返回了空图片数据");
    }

    return {
      imageUrl,
      thumbnailUrl: imageUrl,
      provider: "minimax-cn",
      model: MODEL,
      generatedAt: new Date().toISOString(),
    };
  }

  /** 批量生成 + 自动选优 */
  async generateBatch(input: ImageTaskInput, n = 3): Promise<ImageTaskBatchOutput> {
    const batchN = Math.min(Math.max(1, n), 3); // 限制 1-3 张
    const start = Date.now();

    const aspectRatio = ASPECT_MAP[input.aspectRatio ?? "1:1"] ?? "1:1";
    const typePrefix = TYPE_PROMPT_PREFIX[input.type] ?? TYPE_PROMPT_PREFIX.product_photo;
    const styleGuidance = input.style ? (STYLE_GUIDANCE[input.style] ?? "") : "";
    const stylePrefix = styleGuidance ? `${styleGuidance} ` : "";
    const trendingPrefix = input.diagnosisType ? (TRENDING_PROMPT_PREFIX[input.diagnosisType] ?? "") : "";
    const fullPrompt = `${trendingPrefix}${stylePrefix}${typePrefix} ${input.prompt}`.slice(0, 1500);

    const body: Record<string, unknown> = {
      model: MODEL,
      prompt: fullPrompt,
      aspect_ratio: aspectRatio,
      response_format: "url",
      n: batchN,
    };

    if (input.referenceImageUrl) {
      body.subject_reference = [
        {
          type: "character",
          image_file: input.referenceImageUrl,
        },
      ];
    }

    const url = `${MINIMAX_IMAGE_BASE_URL}/v1/image_generation`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90000), // 批量最多 90s
    });

    const rawText = await res.text();

    if (res.status !== 200) {
      throw new Error(`[MiniMax-CN] 批量生成失败 HTTP ${res.status}: ${rawText.slice(0, 200)}`);
    }

    const json = JSON.parse(rawText) as MiniMaxCNResponse;
    const urls: string[] = [];

    if (json.data?.image_base64?.length) {
      for (const b64 of json.data.image_base64) {
        urls.push(`data:image/jpeg;base64,${b64}`);
      }
    } else if (json.data?.image_urls?.length) {
      for (const u of json.data.image_urls) {
        urls.push(decodeURIComponent(u));
      }
    }

    if (urls.length === 0) {
      throw new Error("[MiniMax-CN] 批量生成返回空图片数据");
    }

    const latencyMs = Date.now() - start;
    const images: ImageTaskOutput[] = urls.map((imageUrl) => ({
      imageUrl,
      thumbnailUrl: imageUrl,
      provider: "minimax-cn",
      model: MODEL,
      generatedAt: new Date().toISOString(),
      latencyMs,
    }));

    const bestIndex = pickBest(images.map((i) => ({ imageUrl: i.imageUrl, latencyMs: i.latencyMs ?? 0 })));

    return { images, bestIndex };
  }
}
