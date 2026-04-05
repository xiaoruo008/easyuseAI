import type { ImageProvider } from "./provider";
import type { ImageTaskInput, ImageTaskOutput } from "./types";
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
