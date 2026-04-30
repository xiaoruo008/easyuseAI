/**
 * Replicate rembg Provider
 *
 * Uses Replicate's cjwbw/rembg model for background removal.
 * Requires REPLICATE_API_TOKEN in .env.
 *
 * Model: cjwbw/rembg (version: fb8af171cfa1616ddcf1)
 * API Docs: https://replicate.com/cjwbw/rembg
 */

import type { ImageProvider } from "../provider";
import type { ImageTaskInput, ImageTaskOutput } from "../types";

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN ?? "";

const REMBG_MODEL = "cjwbw/rembg";
const REMBG_VERSION = "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";

export interface ReplicateRembgOutput {
  resultUrl: string;
  resultBase64?: string;
}

export interface ReplicateRembgOptions {
  imageUrl?: string;
  imageBase64?: string;
  model?: string;
}

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: unknown;
  error?: string;
}

/**
 * Remove background from an image using Replicate's cjwbw/rembg model.
 * Returns a transparent PNG.
 *
 * Uses direct fetch to avoid Replicate SDK TypeScript issues.
 * API: POST https://api.replicate.com/v1/predictions
 * Body: { version: "<full-hash>", input: { image: "<url-or-base64>" } }
 */
export async function removeBackgroundViaReplicate(
  options: ReplicateRembgOptions
): Promise<ReplicateRembgOutput> {
  if (!REPLICATE_API_TOKEN) {
    throw new Error(
      "[replicate-rembg] REPLICATE_API_TOKEN is not configured. " +
        "Please set REPLICATE_API_TOKEN in .env. " +
        "Get your token at: https://replicate.com/account/api-tokens"
    );
  }

  if (!options.imageUrl && !options.imageBase64) {
    throw new Error(
      "[replicate-rembg] Either imageUrl or imageBase64 must be provided"
    );
  }

  const imageInput = options.imageUrl ?? options.imageBase64;

  // Create prediction via direct HTTP (SDK has type issues)
  const createRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: REMBG_VERSION,
      input: { image: imageInput },
    }),
  });

  if (!createRes.ok) {
    const errBody = await createRes.json().catch(() => ({}));
    throw new Error(
      `[replicate-rembg] Failed to create prediction: HTTP ${createRes.status} ${JSON.stringify(errBody)}`
    );
  }

  const prediction = (await createRes.json()) as {
    id: string;
    status: string;
    urls: { get: string };
    output?: unknown;
    error?: string;
  };

  // Poll until done
  let finalPrediction = prediction;
  while (
    finalPrediction.status === "starting" ||
    finalPrediction.status === "processing"
  ) {
    await new Promise((r) => setTimeout(r, 3000));

    const pollRes = await fetch(finalPrediction.urls.get, {
      headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
    });
    finalPrediction = (await pollRes.json()) as typeof prediction;
  }

  if (finalPrediction.status !== "succeeded") {
    const errorMsg =
      finalPrediction.error ??
      `[replicate-rembg] Prediction status: ${finalPrediction.status}`;
    throw new Error(`[replicate-rembg] Background removal failed: ${errorMsg}`);
  }

  // Extract image URL from output
  const imageUrl = extractImageUrl(finalPrediction.output);
  if (!imageUrl) {
    throw new Error(
      "[replicate-rembg] No image URL in response. Output: " +
        JSON.stringify(finalPrediction.output)
    );
  }

  return {
    resultUrl: imageUrl,
  };
}

/**
 * Replicate Image Provider for Background Removal
 *
 * Uses the cjwbw/rembg model on Replicate for background removal.
 * Implements the ImageProvider interface for integration with the image pipeline.
 */
export class ReplicateRembgProvider implements ImageProvider {
  name = "replicate-rembg";

  async generate(input: ImageTaskInput): Promise<ImageTaskOutput> {
    const startMs = Date.now();

    if (!input.referenceImageUrl) {
      throw new Error("[replicate-rembg] referenceImageUrl is required for background removal");
    }

    const result = await removeBackgroundViaReplicate({
      imageUrl: input.referenceImageUrl,
    });

    const latencyMs = Date.now() - startMs;

    return {
      imageUrl: result.resultUrl,
      thumbnailUrl: result.resultUrl,
      provider: "replicate-rembg",
      model: `${REMBG_MODEL}:${REMBG_VERSION}`,
      generatedAt: new Date().toISOString(),
      latencyMs,
    };
  }
}

/**
 * Extract image URL from Replicate output.
 * Handles various output formats from the cjwbw/rembg model.
 */
function extractImageUrl(output: unknown): string | null {
  if (!output) return null;

  // Output can be a string URL directly
  if (typeof output === "string" && output.startsWith("http")) {
    return output;
  }

  // Output can be an array of URLs
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

  // Some outputs wrap in an object: { output: [...] }
  if (typeof output === "object") {
    const outObj = output as Record<string, unknown>;
    if (typeof outObj.output === "string" && outObj.output.startsWith("http")) {
      return outObj.output as string;
    }
    if (Array.isArray(outObj.output)) {
      return extractImageUrl(outObj.output);
    }
  }

  return null;
}

/**
 * Check if Replicate rembg API is configured and accessible.
 */
export async function checkReplicateRembgHealth(): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!REPLICATE_API_TOKEN) {
    return { ok: false, error: "REPLICATE_API_TOKEN not configured" };
  }

  try {
    const res = await fetch("https://api.replicate.com/v1/account", {
      headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
    });
    if (res.ok) return { ok: true };
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: JSON.stringify(err) };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
