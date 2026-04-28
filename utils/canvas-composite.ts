/**
 * Canvas Composite Utility
 * 
 * Used by the removebg_composite pipeline to composite:
 * 1. A transparent product PNG (from remove.bg)
 * 2. A generated background image (from fal.ai FLUX Schnell — P1紧急：MiniMax已禁用)
 * 
 * Flow: draw background → draw transparent PNG on top → toDataURL → upload
 */

interface CompositeOptions {
  /** Transparent product image URL (from remove.bg) */
  transparentUrl?: string;
  /** Transparent product image as base64 data URL (from remove.bg) */
  transparentBase64?: string;
  /** Generated background image URL (from MiniMax) */
  backgroundUrl: string;
  /** Output format - jpeg or png */
  outputFormat?: "jpeg" | "png";
  /** JPEG quality 0-1, default 0.95 */
  quality?: number;
  /** If true, use 1:1 aspect ratio, otherwise auto-detect from background */
  forceSquare?: boolean;
}

interface CompositeResult {
  base64: string;
  width: number;
  height: number;
  format: "jpeg" | "png";
}

/**
 * Load an image from URL or base64 and return HTMLImageElement
 */
async function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${source}`));
    img.src = source;
  });
}

/**
 * Composite transparent product image over a background image using Canvas API
 */
export async function compositeImages(options: CompositeOptions): Promise<CompositeResult> {
  const {
    transparentUrl,
    transparentBase64,
    backgroundUrl,
    outputFormat = "jpeg",
    quality = 0.95,
    forceSquare = false,
  } = options;

  // Validate inputs
  if (!backgroundUrl) {
    throw new Error("backgroundUrl is required");
  }
  if (!transparentUrl && !transparentBase64) {
    throw new Error("Either transparentUrl or transparentBase64 is required");
  }

  // Load images
  const [backgroundImg, transparentImg] = await Promise.all([
    loadImage(backgroundUrl),
    loadImage(transparentBase64 || transparentUrl!),
  ]);

  // Determine output dimensions
  let outputWidth = backgroundImg.naturalWidth;
  let outputHeight = backgroundImg.naturalHeight;

  // If forceSquare, make it 1:1 using the smaller dimension
  if (forceSquare) {
    const size = Math.min(outputWidth, outputHeight);
    outputWidth = size;
    outputHeight = size;
  }

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // If forceSquare, we need to crop the background to 1:1 from center
  if (forceSquare) {
    const srcSize = Math.min(backgroundImg.naturalWidth, backgroundImg.naturalHeight);
    const srcX = (backgroundImg.naturalWidth - srcSize) / 2;
    const srcY = (backgroundImg.naturalHeight - srcSize) / 2;
    ctx.drawImage(backgroundImg, srcX, srcY, srcSize, srcSize, 0, 0, outputWidth, outputHeight);
  } else {
    ctx.drawImage(backgroundImg, 0, 0, outputWidth, outputHeight);
  }

  // Calculate product placement: center the transparent image on the canvas
  // Scale the product to fit within the canvas while maintaining aspect ratio
  // Use 80% of the canvas width as max product width to leave some padding
  const maxProductWidth = outputWidth * 0.8;
  const maxProductHeight = outputHeight * 0.8;

  let productWidth = transparentImg.naturalWidth;
  let productHeight = transparentImg.naturalHeight;

  // Scale down if necessary
  if (productWidth > maxProductWidth || productHeight > maxProductHeight) {
    const widthRatio = maxProductWidth / productWidth;
    const heightRatio = maxProductHeight / productHeight;
    const ratio = Math.min(widthRatio, heightRatio);
    productWidth *= ratio;
    productHeight *= ratio;
  }

  // Center the product
  const productX = (outputWidth - productWidth) / 2;
  const productY = (outputHeight - productHeight) / 2;

  // Draw transparent product on top
  ctx.drawImage(transparentImg, productX, productY, productWidth, productHeight);

  // Convert to base64
  const mimeType = outputFormat === "png" ? "image/png" : "image/jpeg";
  const base64 = canvas.toDataURL(mimeType, quality);

  return {
    base64,
    width: outputWidth,
    height: outputHeight,
    format: outputFormat,
  };
}

/**
 * Upload a base64 image to /api/upload and return the URL
 */
export async function uploadCompositeImage(
  base64: string,
  filename: string = "composite.jpg"
): Promise<string> {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      base64,
      mimeType: filename.endsWith(".png") ? "image/png" : "image/jpeg",
      filename,
    }),
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const { url } = await response.json();
  return url;
}
