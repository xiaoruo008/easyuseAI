import type { ImageProvider } from "./provider";
import type { ImageTaskInput, ImageTaskOutput, ImageTaskType } from "./types";
import { MockImageProvider } from "./mock-provider";
import { FalImageProvider } from "./fal-provider";
import { MiniMaxImageProvider } from "../providers/minimax-image";

export type { ImageTaskInput, ImageTaskOutput, ImageProvider };
export type { ImageTaskType } from "./types";

const IMAGE_PROVIDER = process.env.IMAGE_PROVIDER ?? "mock";

export function getImageProvider(): ImageProvider {
  if (IMAGE_PROVIDER === "minimax" && process.env.MINIMAX_API_KEY) {
    return new MiniMaxImageProvider();
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
}

// templateId → ImageTaskType 映射
const TEMPLATE_TYPE_MAP: Record<string, ImageTaskType> = {
  product_photo: "product_photo",
  model_photo: "model_photo",
  background_swap: "background_swap",
  bg_white: "product_photo",
  fashion_model: "model_photo",
  lifestyle: "product_photo",
  fashion_lifestyle: "product_photo",
};

export async function generateImageFromOptions(opts: GenerateImageOptions): Promise<ImageTaskOutput> {
  const type = TEMPLATE_TYPE_MAP[opts.templateId] ?? "product_photo";
  const provider = getImageProvider();
  return provider.generate({
    type,
    prompt: opts.userRefinement ?? "",
    referenceImageUrl: opts.originalImageUrl,
    aspectRatio: opts.aspectRatio,
    style: opts.style,
  });
}
