/**
 * White Background Product Image Pipeline
 * 路由A：白底图（商品100%保留）
 *
 * Pipeline:
 *  1. Call Replicate cjwbw/rembg model → transparent product PNG
 *  2. Server-side Canvas: composite transparent PNG onto white canvas with shadow
 *  3. Upload composite to /api/upload
 *  4. Return final image URL
 *
 * POST /api/removebg/composite
 * Body: {
 *   imageUrl: string;          // Product image URL (required)
 *   aspectRatio?: "1:1" | "3:4" | "16:9";
 * }
 *
 * Security:
 *  - No MiniMax fallback
 *  - No fal.ai background generation for white_bg route
 *  - If any step fails, return error immediately (do not generate fake images)
 */

import { NextRequest, NextResponse } from "next/server";
// Allow referencing local modules without tsconfig paths
// eslint-disable-next-line @typescript-eslint/no-var-requires
// eslint-disable-next-line import/extensions
const { removeBackgroundViaReplicate } = require("../../../../lib/image/providers/replicate-rembg");

export const runtime = "nodejs";

// Aspect ratio → canvas dimensions (shortest side = 1024)
const RATIO_SIZE: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "3:4": { width: 768, height: 1024 },
  "16:9": { width: 1024, height: 576 },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { imageUrl, aspectRatio = "1:1" } = body as {
      imageUrl: string;
      aspectRatio?: "1:1" | "3:4" | "16:9";
    };

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required", code: "MISSING_IMAGE" },
        { status: 400 }
      );
    }

    const dims = RATIO_SIZE[aspectRatio] ?? RATIO_SIZE["1:1"];

    // ── Step 1: Remove background via Replicate cjwbw/rembg ────────────
    let transparentUrl: string;
    try {
      const rbResult = await removeBackgroundViaReplicate({ imageUrl });
      transparentUrl = rbResult.resultUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[white-bg] Step 1 (replicate-rembg) failed: ${msg}`);
      return NextResponse.json(
        { error: `抠图失败: ${msg}`, step: "remove_background" },
        { status: 502 }
      );
    }

    // ── Step 2: Server-side white canvas composite ─────────────────────
    // Download transparent PNG, composite onto white canvas with shadow
    let compositeBase64: string;
    try {
      compositeBase64 = await compositeOnWhiteCanvas(transparentUrl, dims);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[white-bg] Step 2 (canvas composite) failed: ${msg}`);
      return NextResponse.json(
        { error: `白底合成失败: ${msg}`, step: "canvas_composite" },
        { status: 502 }
      );
    }

    // ── Step 3: Upload composite to /api/upload ───────────────────────
    let finalImageUrl: string;
    try {
      const uploadRes = await fetch(new URL("/api/upload", req.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: compositeBase64,
          mimeType: "image/jpeg",
          filename: "white-bg-product.jpg",
        }),
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text().catch(() => "unknown");
        throw new Error(`Upload failed HTTP ${uploadRes.status}: ${errText}`);
      }

      const { url } = await uploadRes.json() as { url: string };
      finalImageUrl = url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[white-bg] Step 3 (upload) failed: ${msg}`);
      return NextResponse.json(
        { error: `上传失败: ${msg}`, step: "upload" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      step: "done",
      result: {
        imageUrl: finalImageUrl,
        thumbnailUrl: finalImageUrl,
        provider: "replicate-rembg",
        model: "cjwbw/rembg",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[white-bg] Unexpected error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * Download transparent PNG, composite onto a white canvas with subtle shadow,
 * return as base64 JPEG.
 */
async function compositeOnWhiteCanvas(
  transparentPngUrl: string,
  dims: { width: number; height: number }
): Promise<string> {
  // Use sharp for server-side image processing
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sharp: any = require("sharp");

  // Download transparent PNG
  const response = await fetch(transparentPngUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch transparent PNG: HTTP ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  // Resize transparent PNG to fit nicely on canvas (max 80% of canvas dimension)
  const maxSize = Math.min(dims.width, dims.height) * 0.8;

  // Get original dimensions
  const metadata = await sharp(inputBuffer).metadata();
  const origW = metadata.width ?? maxSize;
  const origH = metadata.height ?? maxSize;
  const scale = Math.min(maxSize / origW, maxSize / origH, 1);
  const scaledW = Math.round(origW * scale);
  const scaledH = Math.round(origH * scale);

  // Center the product: x = (canvasW - scaledW) / 2, y = (canvasH - scaledH) / 2
  const offsetX = Math.round((dims.width - scaledW) / 2);
  const offsetY = Math.round((dims.height - scaledH) / 2);

  // Create white background SVG
  const svg = `<svg width="${dims.width}" height="${dims.height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${dims.width}" height="${dims.height}" fill="white"/>
  </svg>`;
  const whiteBg = Buffer.from(svg);

  // Resize transparent PNG to fit canvas
  const resizedPng = await sharp(inputBuffer)
    .resize(scaledW, scaledH, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Composite: white background first, then transparent product PNG on top
  const composite = await sharp(whiteBg, { density: 72 })
    .composite([
      {
        input: resizedPng,
        blend: "over",
        top: offsetY,
        left: offsetX,
      },
    ])
    .jpeg({ quality: 95 })
    .toBuffer();

  return composite.toString("base64");
}
