/**
 * remove.bg + fal.ai composite pipeline API
 *
 * Pipeline:
 *  1. Call remove.bg API → transparent product PNG
 *  2. Call fal.ai FLUX Schnell API → generated background image（P1紧急：MiniMax已禁用）
 *  3. Return both URLs → client-side Canvas compositing
 *  4. Client uploads composed result via /api/upload
 *
 * POST /api/removebg/composite
 * Body: {
 *   imageUrl: string;           // Product image URL (required)
 *   backgroundPrompt?: string;   // Background prompt
 *   aspectRatio?: "1:1" | "3:4" | "16:9";
 *   style?: "minimal" | "luxury" | "commercial";
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { removeBackground } from "@/lib/image/providers/removebg";
import { FalImageProvider } from "@/lib/image/fal-provider";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      imageUrl,
      backgroundPrompt = "clean white studio background, professional e-commerce product photography",
      aspectRatio = "1:1",
      style,
    } = body as {
      imageUrl: string;
      backgroundPrompt?: string;
      aspectRatio?: "1:1" | "3:4" | "16:9";
      style?: "minimal" | "luxury" | "commercial";
    };

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    // ── Step 1: Remove background via remove.bg ────────────────────────
    let transparentUrl: string;
    let transparentBase64: string | undefined;

    try {
      const rbResult = await removeBackground({
        imageUrl,
        size: "auto",
        format: "png",
      });
      transparentUrl = rbResult.resultUrl;
      transparentBase64 = rbResult.resultBase64;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[removebg+composite] Step 1 (removebg) failed: ${msg}`);
      return NextResponse.json(
        {
          error: `remove.bg failed: ${msg}`,
          step: "remove_background",
        },
        { status: 502 }
      );
    }

    // ── Step 2: Generate background via fal.ai FLUX Schnell（P1紧急：MiniMax已禁用）────────
    let backgroundUrl: string;

    try {
      const falProvider = new FalImageProvider();
      const bgResult = await falProvider.generate({
        type: "background_swap",
        prompt: backgroundPrompt,
        aspectRatio: aspectRatio as "1:1" | "3:4" | "16:9",
        style: style as "minimal" | "luxury" | "commercial" | undefined,
      });
      backgroundUrl = bgResult.imageUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[removebg+composite] Step 2 (fal.ai background) failed: ${msg}`);
      return NextResponse.json(
        {
          error: `背景生成失败: ${msg}`,
          step: "background_generation",
        },
        { status: 502 }
      );
    }

    // ── Step 3: Return both URLs for client-side Canvas compositing ─────
    // The client-side JS will:
    //  1. Load transparentUrl as PNG (with alpha)
    //  2. Load backgroundUrl as JPG（fal.ai生成的背景）
    //  3. Draw background on canvas, then draw transparent PNG on top
    //  4. Convert canvas to Blob, upload via POST /api/upload (base64)
    //  5. Return final composed image URL

    return NextResponse.json({
      success: true,
      step: "pipeline_ready",
      data: {
        transparentUrl,       // Transparent PNG from remove.bg
        backgroundUrl,        // Generated background from MiniMax
        transparentBase64,    // base64 PNG (avoids CORS if remote URL)
      },
      instructions: {
        composite:
          "Load transparentUrl (PNG with alpha) and backgroundUrl, " +
          "composite them on a <canvas>, convert to base64 JPEG, " +
          "upload via POST /api/upload with { base64, mimeType: 'image/jpeg' }",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[removebg+composite] Unexpected error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
