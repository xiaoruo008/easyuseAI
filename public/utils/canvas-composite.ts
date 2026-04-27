/**
 * Client-side Canvas compositing utility
 *
 * Usage:
 *   const result = await compositeImages({
 *     transparentUrl: "https://...", // PNG with alpha from remove.bg
 *     backgroundUrl: "https://...",   // Generated background from MiniMax
 *     transparentBase64: "...",      // optional base64 PNG (avoids CORS)
 *   });
 *
 *   // Upload the result
 *   const uploadRes = await fetch("/api/upload", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({
 *       base64: result.base64,
 *       mimeType: "image/jpeg",
 *       filename: "composite.png"
 *     })
 *   });
 *   const { url } = await uploadRes.json();
 */

export interface CompositeOptions {
  /** URL to transparent PNG (from remove.bg) */
  transparentUrl?: string;
  /** URL to background image (from MiniMax) */
  backgroundUrl?: string;
  /** base64 PNG data (avoids CORS issues with transparentUrl) */
  transparentBase64?: string;
  /** base64 background data */
  backgroundBase64?: string;
  /** Output quality for JPEG compression (0-1), default 0.92 */
  quality?: number;
  /** Output format: "png" | "jpeg" | "webp", default "jpeg" */
  outputFormat?: "png" | "jpeg" | "webp";
  /** Scale the product image relative to background (0-1), default 1 */
  productScale?: number;
  /** X offset for product placement (0-1 ratio of canvas width), default 0.5 */
  productX?: number;
  /** Y offset for product placement (0-1 ratio of canvas height), default 0.5 */
  productY?: number;
}

export interface CompositeResult {
  /** base64 encoded composed image */
  base64: string;
  /** Data URL */
  dataUrl: string;
  /** Blob for direct upload */
  blob: Blob;
  /** Canvas element (for preview) */
  canvas: HTMLCanvasElement;
  /** Width of the composed image */
  width: number;
  /** Height of the composed image */
  height: number;
  /** The loaded transparent product image */
  productImage: HTMLImageElement;
  /** The loaded background image */
  backgroundImage: HTMLImageElement;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function base64ToDataUrl(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Load an image from a base64 string (avoids CORS)
 */
function loadImageFromBase64(
  base64: string,
  mimeType = "image/png"
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load base64 image"));
    img.src = base64ToDataUrl(base64, mimeType);
  });
}

/**
 * Composite a transparent product image onto a background image using Canvas API.
 * Returns the composed image as base64, data URL, and blob.
 */
export async function compositeImages(
  options: CompositeOptions
): Promise<CompositeResult> {
  const {
    transparentUrl,
    backgroundUrl,
    transparentBase64,
    backgroundBase64,
    quality = 0.92,
    outputFormat = "jpeg",
    productScale = 1,
    productX = 0.5,
    productY = 0.5,
  } = options;

  // ── Step 1: Load both images ──────────────────────────────────────────
  let productImg: HTMLImageElement;
  let bgImg: HTMLImageElement;

  if (transparentBase64) {
    productImg = await loadImageFromBase64(transparentBase64, "image/png");
  } else if (transparentUrl) {
    productImg = await loadImage(transparentUrl);
  } else {
    throw new Error("Either transparentUrl or transparentBase64 is required");
  }

  if (backgroundBase64) {
    bgImg = await loadImageFromBase64(backgroundBase64, "image/jpeg");
  } else if (backgroundUrl) {
    bgImg = await loadImage(backgroundUrl);
  } else {
    throw new Error("Either backgroundUrl or backgroundBase64 is required");
  }

  // ── Step 2: Determine output canvas size ────────────────────────────
  // Use the larger dimension of the background, with the aspect ratio of the background
  let canvasWidth = bgImg.naturalWidth;
  let canvasHeight = bgImg.naturalHeight;

  // Scale the product to fit reasonably on the canvas
  // Product should be about 60-80% of the canvas height by default
  const targetProductHeight = canvasHeight * 0.7 * productScale;
  const productScaleRatio = targetProductHeight / productImg.naturalHeight;
  const productDisplayWidth = productImg.naturalWidth * productScaleRatio;
  const productDisplayHeight = productImg.naturalHeight * productScaleRatio;

  // If product is wider than canvas, scale down to fit
  if (productDisplayWidth > canvasWidth * 0.9) {
    const widthRatio = (canvasWidth * 0.9) / productDisplayWidth;
    const adjustedProductHeight = productDisplayHeight * widthRatio;
    // Use the smaller of the two constraints
    const finalScale = Math.min(widthRatio, productScaleRatio * widthRatio);
    // Actually just use width constraint
    const scaleToFit = (canvasWidth * 0.9) / productDisplayWidth;
    // Recalculate
  }

  // Actually: determine product display size fitting in canvas
  const maxProductWidth = canvasWidth * 0.85;
  const maxProductHeight = canvasHeight * 0.75;
  let pDisplayW = productImg.naturalWidth;
  let pDisplayH = productImg.naturalHeight;

  // Scale to fit within max bounds
  if (pDisplayW > maxProductWidth) {
    const ratio = maxProductWidth / pDisplayW;
    pDisplayW = maxProductWidth;
    pDisplayH = pDisplayH * ratio;
  }
  if (pDisplayH > maxProductHeight) {
    const ratio = maxProductHeight / pDisplayH;
    pDisplayH = maxProductHeight;
    pDisplayW = pDisplayW * ratio;
  }

  // Position the product (centered by default)
  const pX = canvasWidth * productX - pDisplayW / 2;
  const pY = canvasHeight * productY - pDisplayH / 2;

  // ── Step 3: Create canvas and composite ──────────────────────────────
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d")!;

  // Draw background (no alpha)
  ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);

  // Draw transparent product on top
  // 'source-over' composite: draw on top of background, using alpha channel
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(productImg, pX, pY, pDisplayW, pDisplayH);

  // ── Step 4: Export ───────────────────────────────────────────────────
  const mimeType =
    outputFormat === "png"
      ? "image/png"
      : outputFormat === "webp"
      ? "image/webp"
      : "image/jpeg";

  const dataUrl = canvas.toDataURL(mimeType, quality);
  // Remove the "data:..." prefix to get raw base64
  const rawBase64 = dataUrl.replace(/^data:[^;]+;base64,/, "");

  // Convert to Blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to create blob from canvas"));
      },
      mimeType,
      quality
    );
  });

  return {
    base64: rawBase64,
    dataUrl,
    blob,
    canvas,
    width: canvasWidth,
    height: canvasHeight,
    productImage: productImg,
    backgroundImage: bgImg,
  };
}

/**
 * Full pipeline: composite + upload
 * Calls /api/removebg/composite then composites and uploads.
 */
export async function runRemoveBgCompositePipeline(
  imageUrl: string,
  backgroundPrompt: string,
  uploadEndpoint = "/api/upload"
): Promise<{ composedUrl: string; transparentUrl: string; backgroundUrl: string }> {
  // Step 1: Call the pipeline API
  const pipelineRes = await fetch("/api/removebg/composite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageUrl,
      backgroundPrompt,
    }),
  });

  if (!pipelineRes.ok) {
    const err = await pipelineRes.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? `Pipeline API failed with ${pipelineRes.status}`);
  }

  const pipeline = await pipelineRes.json();
  const { transparentUrl, backgroundUrl, transparentBase64 } = pipeline.data;

  // Step 2: Client-side composite using Canvas API
  const composite = await compositeImages({
    transparentUrl,
    backgroundUrl,
    transparentBase64,
    outputFormat: "jpeg",
    quality: 0.92,
  });

  // Step 3: Upload composed result
  const uploadRes = await fetch(uploadEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      base64: composite.base64,
      mimeType: "image/jpeg",
      filename: `composite-${Date.now()}.jpg`,
    }),
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload failed: ${uploadRes.status}`);
  }

  const { url: composedUrl } = await uploadRes.json();

  return { composedUrl, transparentUrl, backgroundUrl };
}
