import type { ImageTaskInput, ImageTaskOutput } from "./types";

export interface ImageProvider {
  name: string;
  generate(input: ImageTaskInput): Promise<ImageTaskOutput>;
}
