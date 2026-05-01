/**
 * Replicate Image Provider
 *
 * Uses Replicate's prediction API to generate images via various models.
 * Requires REPLICATE_API_TOKEN in .env.
 *
 * SDK: replicate v1.4.0
 * Docs: https://replicate.com/docs
 */

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions */

import type { ImageProvider } from "../provider";
import type { ImageTaskInput, ImageTaskOutput } from "../types";

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN ?? "";
const DEFAULT_IMAGE_MODEL =
  process.env.REPLICATE_IMAGE_MODEL ?? "black-forest-labs/flux-schnell";

export class ReplicateImageProvider implements ImageProvider {
  name = "replicate";

  async generate(input: ImageTaskInput): Promise<ImageTaskOutput> {
    const startMs = Date.now();

    if (!REPLICATE_API_TOKEN) {
      throw new Error(
        "[Replicate] REPLICATE_API_TOKEN 未配置。" +
          " 请在 .env 中设置 REPLICATE_API_TOKEN。" +
          " 获取 Key：https://replicate.com/account/api-tokens"
      );
    }

    const prompt = input.prompt.trim();
    if (!prompt) {
      throw new Error("[Replicate] prompt 不能为空。");
    }

    // Lazy-load Replicate to avoid top-level import issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-require-imports
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    const ReplicateModule = require("replicate") as typeof import("replicate");
    const Replicate = ReplicateModule.default;
    const client = new Replicate({ auth: REPLICATE_API_TOKEN });

    const modelInput = this.buildModelInput(input);

    // Create prediction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prediction = (await client.predictions.create({
      model: DEFAULT_IMAGE_MODEL,
      input: modelInput,
    })) as any;

    // Wait for completion
    const finalPrediction = (await client.wait(prediction)) as any;

    const latencyMs = Date.now() - startMs;

    if (finalPrediction.status !== "succeeded") {
      const errorMsg =
        finalPrediction.error ??
        `[Replicate] 预测状态：${finalPrediction.status}`;
      throw new Error(`[Replicate] 生成失败：${errorMsg}`);
    }

    // Extract image URL from output
    const imageUrl = this.extractImageUrl(finalPrediction.output);
    if (!imageUrl) {
      throw new Error(
        "[Replicate] 响应中未找到图片 URL。输出：" +
          JSON.stringify(finalPrediction.output)
      );
    }

    return {
      imageUrl,
      thumbnailUrl: imageUrl,
      provider: "replicate",
      model: DEFAULT_IMAGE_MODEL,
      generatedAt: new Date().toISOString(),
      latencyMs,
    };
  }

  private buildModelInput(
    input: ImageTaskInput
  ): Record<string, unknown> {
    const prompt = input.prompt.trim();
    const base: Record<string, unknown> = { prompt };

    if (input.aspectRatio) {
      const ratioMap: Record<string, string> = {
        "1:1": "1:1",
        "3:4": "3:4",
        "16:9": "16:9",
      };
      const ratio = ratioMap[input.aspectRatio];
      if (ratio) {
        base.aspect_ratio = ratio;
        base.width = ratio === "1:1" ? 1024 : ratio === "3:4" ? 768 : 1280;
        base.height = ratio === "1:1" ? 1024 : ratio === "3:4" ? 1024 : 720;
      }
    }

    return base;
  }

  private extractImageUrl(output: unknown): string | null {
    if (!output) return null;

    // Replicate v1.x: output is typically an array of URLs or FileOutput objects
    // e.g. ["https://replicate.delivery/..."] or [URL { href: "..." }]
    if (typeof output === "string") {
      return output;
    }

    if (Array.isArray(output)) {
      for (const item of output) {
        if (typeof item === "string" && item.startsWith("http")) {
          return item;
        }
        // Handle URL object { href: "..." } from Replicate SDK
        if (item && typeof item === "object" && "href" in item) {
          const href = (item as { href: string }).href;
          if (typeof href === "string" && href.startsWith("http")) {
            return href;
          }
        }
        // Handle FileOutput-style { url: fn() } or { url: "..." }
        if (item && typeof item === "object" && "url" in item) {
          const urlProp = (item as { url: unknown }).url;
          const url = typeof urlProp === "function" ? (urlProp as () => string)() : urlProp;
          if (typeof url === "string" && url.startsWith("http")) {
            return url;
          }
        }
      }
    }

    // Some models wrap output in an object: { output: [...] }
    if (typeof output === "object") {
      const outObj = output as Record<string, unknown>;
      if (typeof outObj.output === "string") return outObj.output as string;
      if (Array.isArray(outObj.output)) {
        return this.extractImageUrl(outObj.output);
      }
    }

    return null;
  }
}
