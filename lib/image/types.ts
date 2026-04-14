export type ImageTaskType = "product_photo" | "model_photo" | "background_swap";

export type ImageAspectRatio = "1:1" | "3:4" | "16:9";

export interface ImageTaskInput {
  type: ImageTaskType;
  prompt: string;
  referenceImageUrl?: string;
  style?: "minimal" | "luxury" | "commercial";
  aspectRatio?: ImageAspectRatio;
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
