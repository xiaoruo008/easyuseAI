import type { ImageProvider } from "./provider";
import type { ImageTaskInput, ImageTaskOutput, ImageTaskType } from "./types";
import { MockImageProvider } from "./mock-provider";
import { FalImageProvider } from "./fal-provider";
// MiniMax CN/International — P1紧急禁用，保留import但不注册到PROVIDER_MAP
// import { MiniMaxImageProvider } from "../providers/minimax-image";
// import { MiniMaxCNProvider } from "./providers/minimax-cn";
import { GeminiNanobananaProvider } from "./providers/gemini-nanobanana";
import { ReplicateImageProvider } from "./providers/replicate";
import path from "path";
import fs from "fs";

export type { ImageTaskInput, ImageTaskOutput, ImageProvider };
export type { ImageTaskType } from "./types";

const IMAGE_PROVIDER = process.env.IMAGE_PROVIDER ?? "mock";

export function getImageProvider(): ImageProvider {
  return getImageProviderForRequest(undefined);
}

/**
 * 根据请求级 provider 覆盖返回对应 provider。
 * selectedProvider 来自 leads 流程的路由决策（routeGenerationModel）。
 * 未提供 selectedProvider 时回退到 IMAGE_PROVIDER 环境变量。
 */
/**
 * P1紧急：MiniMax CN/International 已全面禁用
 * - MiniMaxCNProvider.generate() 直接抛出错误
 * - 此处移除所有 MiniMax 相关逻辑，防止误调用
 */
export function getImageProviderForRequest(selectedProvider?: "nanobanana"): ImageProvider {
  // 优先使用 leads 流程确定的 provider
  if (selectedProvider) {
    const envValue = PROVIDER_MAP[selectedProvider];
    if (envValue === "gemini-nanobanana" && process.env.GEMINI_API_KEY) {
      return new GeminiNanobananaProvider();
    }
    // selectedProvider 指定但 key 未配置，降级到环境变量
  }
  // 回退到环境变量
  if (IMAGE_PROVIDER === "gemini-nanobanana" && process.env.GEMINI_API_KEY) {
    return new GeminiNanobananaProvider();
  }
  if (IMAGE_PROVIDER === "fal" && process.env.IMAGE_API_KEY) {
    return new FalImageProvider();
  }
  if (IMAGE_PROVIDER === "replicate" && process.env.REPLICATE_API_TOKEN) {
    return new ReplicateImageProvider();
  }
  return new MockImageProvider();
}

export async function generateImage(input: ImageTaskInput): Promise<ImageTaskOutput> {
  const provider = getImageProvider();
  return provider.generate(input);
}

// 兼容 generate/route.ts 的调用方式
export interface GenerateImageOptions {
  templateId: string;
  variables?: Record<string, unknown>;
  originalImageUrl?: string;
  userRefinement?: string;
  aspectRatio?: "1:1" | "3:4" | "16:9";
  style?: "minimal" | "luxury" | "commercial";
  /** 诊断类型，用于注入爆款前缀（可选） */
  diagnosisType?: "traffic" | "customer" | "efficiency" | "unclear";
  /** Provider 路由覆盖：优先使用 leads 流程确定的 provider（可选） */
  selectedProvider?: "nanobanana";
}

// provider name映射（route-decision → IMAGE_PROVIDER值）
const PROVIDER_MAP: Record<string, string> = {
  nanobanana: "gemini-nanobanana",
};

// templateId → ImageTaskType 映射
const TEMPLATE_TYPE_MAP: Record<string, ImageTaskType> = {
  product_photo: "product_photo",
  model_photo: "model_photo",
  background_swap: "background_swap",
  bg_white: "product_photo",
  enhance: "product_photo",
  fashion_model: "model_photo",
  lifestyle: "lifestyle",              // 【修复】lifestyle → lifestyle（语义对齐）
  lifestyle_scene: "lifestyle",         // lifestyle/fashion_lifestyle 动作 → 正确使用生活场景前缀
  fashion_lifestyle: "lifestyle",      // 时尚生活图 → 生活场景语义
};

export async function generateImageFromOptions(opts: GenerateImageOptions): Promise<ImageTaskOutput> {
  const type = TEMPLATE_TYPE_MAP[opts.templateId] ?? "product_photo";
  // selectedProvider 覆盖：优先使用 leads 流程路由决策
  const provider = getImageProviderForRequest(opts.selectedProvider);
  const output = await provider.generate({
    type,
    prompt: opts.userRefinement ?? "",
    referenceImageUrl: opts.originalImageUrl,
    aspectRatio: opts.aspectRatio,
    style: opts.style,
    // 【修复】透传 diagnosisType 用于爆款前缀注入
    diagnosisType: opts.diagnosisType,
  });

  // 【新增】图片 URL 校验：检查返回的 URL 是否有效
  const imageUrlValid = output.imageUrl && 
    (output.imageUrl.startsWith("http") || 
     output.imageUrl.startsWith("/") || 
     output.imageUrl.startsWith("data:"));
  if (!imageUrlValid) {
    console.warn(`[generateImageFromOptions] ⚠️ 图片 URL 格式异常: ${output.imageUrl}`);
  }

  // MiniMax / 真实 URL：直接返回
  if (!output.imageUrl.startsWith("data:")) {
    return output;
  }

  // base64 URI（Google Imagen 等）：存到本地 public/uploads，返回真实 URL
  try {
    const base64Match = output.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) return output;

    const mimeType = base64Match[1];
    const base64Data = base64Match[2];
    const ext = mimeType === "image/png" ? "png" : "jpg";
    const filename = `imagen-${Date.now()}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

    const savedUrl = `/uploads/${filename}`;
    console.log(`[generateImageFromOptions] ✅ base64 图片已保存: ${savedUrl}`);
    return { ...output, imageUrl: savedUrl, thumbnailUrl: savedUrl };
  } catch (err) {
    console.error(`[generateImageFromOptions] ❌ base64 保存失败:`, err);
    return output;
  }
}
