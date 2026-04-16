export type ImageTaskType = "product_photo" | "model_photo" | "background_swap" | "lifestyle";

export type ImageAspectRatio = "1:1" | "3:4" | "16:9";

export interface ImageTaskInput {
  type: ImageTaskType;
  prompt: string;
  referenceImageUrl?: string;
  style?: "minimal" | "luxury" | "commercial";
  aspectRatio?: ImageAspectRatio;
  /** 诊断类型，用于注入爆款前缀（可选） */
  diagnosisType?: "traffic" | "customer" | "efficiency" | "unclear";
}

export interface ImageTaskOutput {
  imageUrl: string;
  thumbnailUrl?: string;
  provider: string;
  model: string;
  generatedAt: string;
  latencyMs?: number;
}

export interface ImageTaskBatchOutput {
  images: ImageTaskOutput[];
  bestIndex: number;
}
