import type { ImageProvider } from "./provider";
import type { ImageTaskInput, ImageTaskOutput } from "./types";

const PLACEHOLDER_IMAGES: Record<string, string> = {
  product_photo: "https://placehold.co/800x800/1a1a2e/ffffff?text=Product+Photo",
  model_photo: "https://placehold.co/600x800/1a1a2e/ffffff?text=Model+Photo",
  background_swap: "https://placehold.co/800x600/1a1a2e/ffffff?text=New+Background",
};

export class MockImageProvider implements ImageProvider {
  name = "mock";

  async generate(input: ImageTaskInput): Promise<ImageTaskOutput> {
    await new Promise((r) => setTimeout(r, 2000));

    const imageUrl = PLACEHOLDER_IMAGES[input.type] ?? PLACEHOLDER_IMAGES.product_photo;

    return {
      imageUrl,
      thumbnailUrl: imageUrl,
      provider: "mock",
      model: "placeholder",
      generatedAt: new Date().toISOString(),
    };
  }
}
