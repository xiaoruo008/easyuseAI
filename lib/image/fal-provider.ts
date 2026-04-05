import type { ImageProvider } from "./provider";
import type { ImageTaskInput, ImageTaskOutput } from "./types";

// fal.ai FLUX Schnell — 快速生图，有免费额度
// API 文档：https://fal.ai/models/fal-ai/flux/schnell

const FAL_API_KEY = process.env.IMAGE_API_KEY ?? "";
const FAL_MODEL = "fal-ai/flux/schnell";

const ASPECT_MAP: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "3:4": { width: 768, height: 1024 },
  "16:9": { width: 1024, height: 576 },
};

const TYPE_PROMPT_PREFIX: Record<string, string> = {
  product_photo:
    "Professional e-commerce product photography, studio lighting, clean white background, high quality commercial photo,",
  model_photo:
    "Professional fashion model photography, studio setting, commercial quality, elegant pose,",
  background_swap:
    "Professional product placed in an elegant scene, photorealistic background,",
};

export class FalImageProvider implements ImageProvider {
  name = "fal";

  async generate(input: ImageTaskInput): Promise<ImageTaskOutput> {
    if (!FAL_API_KEY) {
      throw new Error("IMAGE_API_KEY not configured for fal.ai");
    }

    const dims = ASPECT_MAP[input.aspectRatio ?? "1:1"] ?? ASPECT_MAP["1:1"];
    const prefix = TYPE_PROMPT_PREFIX[input.type] ?? TYPE_PROMPT_PREFIX.product_photo;
    const fullPrompt = `${prefix} ${input.prompt}`;

    const res = await fetch("https://queue.fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${FAL_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        image_size: { width: dims.width, height: dims.height },
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "unknown");
      throw new Error(`fal.ai error ${res.status}: ${text}`);
    }

    const data = await res.json();
    const imageUrl = data.images?.[0]?.url;
    if (!imageUrl) {
      throw new Error("fal.ai returned no image");
    }

    return {
      imageUrl,
      thumbnailUrl: imageUrl,
      provider: "fal",
      model: FAL_MODEL,
      generatedAt: new Date().toISOString(),
    };
  }
}
