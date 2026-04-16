import type { ImageProvider } from "./provider";
import type { ImageTaskInput, ImageTaskOutput, ImageTaskType } from "./types";
import { MockImageProvider } from "./mock-provider";
import { FalImageProvider } from "./fal-provider";
import { MiniMaxImageProvider } from "../providers/minimax-image";
import { MiniMaxCNProvider } from "./providers/minimax-cn";
import { GeminiNanobananaProvider } from "./providers/gemini-nanobanana";
import path from "path";
import fs from "fs";

export type { ImageTaskInput, ImageTaskOutput, ImageProvider };
export type { ImageTaskType } from "./types";

const IMAGE_PROVIDER = process.env.IMAGE_PROVIDER ?? "mock";

export function getImageProvider(): ImageProvider {
  if (IMAGE_PROVIDER === "gemini-nanobanana" && process.env.GEMINI_API_KEY) {
    return new GeminiNanobananaProvider();
  }
  if ((IMAGE_PROVIDER === "minimax" || IMAGE_PROVIDER === "minimax-cn") && process.env.MINIMAX_API_KEY) {
    return new MiniMaxCNProvider();
  }
  if (IMAGE_PROVIDER === "fal" && process.env.IMAGE_API_KEY) {
    return new FalImageProvider();
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
}

// templateId → ImageTaskType 映射
// 决定 MiniMax CN TYPE_PROMPT_PREFIX 的类型前缀（语义对齐很重要）
const TEMPLATE_TYPE_MAP: Record<string, ImageTaskType> = {
  product_photo: "product_photo",
  model_photo: "model_photo",
  background_swap: "background_swap",
  bg_white: "product_photo",
  enhance: "product_photo",
  fashion_model: "model_photo",
  lifestyle: "product_photo",
  lifestyle_scene: "lifestyle",         // lifestyle/fashion_lifestyle 动作 → 正确使用生活场景前缀
  fashion_lifestyle: "lifestyle",        // 时尚生活图 → 生活场景语义
};

export async function generateImageFromOptions(opts: GenerateImageOptions): Promise<ImageTaskOutput> {
  const type = TEMPLATE_TYPE_MAP[opts.templateId] ?? "product_photo";
  const provider = getImageProvider();
  const output = await provider.generate({
    type,
    prompt: opts.userRefinement ?? "",
    referenceImageUrl: opts.originalImageUrl,
    aspectRatio: opts.aspectRatio,
    style: opts.style,
  });

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
    return { ...output, imageUrl: savedUrl, thumbnailUrl: savedUrl };
  } catch {
    return output;
  }
}
