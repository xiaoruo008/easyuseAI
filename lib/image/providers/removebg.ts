/**
 * remove.bg Provider
 *
 * API Docs: https://www.remove.bg/api
 * Free tier: 50 calls/month for new users
 * Pricing: https://remove.bg/pricing
 *
 * Endpoint: POST https://api.remove.bg/v1.0/removebg
 * Auth: X-Api-Key header
 */

const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY ?? "";
const REMOVEBG_API_URL = "https://api.remove.bg/v1.0/removebg";

export interface RemoveBgOutput {
  resultUrl: string;     // URL to transparent PNG (temporary or uploaded)
  resultBase64?: string; // base64 PNG data
  tempUrl?: string;     // temporary URL from remove.bg (short-lived)
}

export interface RemoveBgOptions {
  imageUrl?: string;     // URL to the source image
  imageBase64?: string;  // base64 encoded image
  size?: "auto" | "preview" | "full" | "4k";
  format?: "png" | "jpg" | "webp";
  cropped?: boolean;
}

interface RemoveBgResponse {
  data?: {
    result_url?: string;
    result_base64?: string;
    temp_url?: string;
    attributes?: {
      width?: number;
      height?: number;
    };
  };
  errors?: Array<{ code: string; title: string; detail?: string }>;
}

/**
 * Remove background from an image using remove.bg API.
 * Returns a transparent PNG.
 */
export async function removeBackground(
  options: RemoveBgOptions
): Promise<RemoveBgOutput> {
  if (!REMOVEBG_API_KEY) {
    throw new Error(
      "[removebg] REMOVEBG_API_KEY is not configured. " +
      "Get your free API key at https://remove.bg/api"
    );
  }

  const size = options.size ?? "auto";
  const format = options.format ?? "png";
  const cropped = options.cropped ?? false;

  // Build form data
  const formData = new FormData();
  
  if (options.imageUrl) {
    formData.append("image_url", options.imageUrl);
  } else if (options.imageBase64) {
    // Decode base64 and create a File object
    const binaryString = atob(options.imageBase64.replace(/^data:image\/\w+;base64,/, ""));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "image/png" });
    formData.append("image_file", blob, "image.png");
  } else {
    throw new Error("[removebg] Either imageUrl or imageBase64 must be provided");
  }

  formData.append("size", size);
  formData.append("format", format);
  if (cropped) {
    formData.append("cropped", "true");
  }

  const response = await fetch(REMOVEBG_API_URL, {
    method: "POST",
    headers: {
      "X-Api-Key": REMOVEBG_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "unknown error");
    throw new Error(`[removebg] HTTP ${response.status}: ${text}`);
  }

  const json = (await response.json()) as RemoveBgResponse;

  if (json.errors && json.errors.length > 0) {
    const err = json.errors[0];
    throw new Error(`[removebg] API error (${err.code}): ${err.title} — ${err.detail ?? ""}`);
  }

  if (!json.data?.result_url && !json.data?.result_base64) {
    throw new Error("[removebg] No result returned from API");
  }

  return {
    resultUrl: json.data!.result_url ?? "",
    resultBase64: json.data!.result_base64,
    tempUrl: json.data!.temp_url,
  };
}

/**
 * Check if remove.bg API is configured and accessible.
 */
export async function checkRemoveBgHealth(): Promise<{
  ok: boolean;
  error?: string;
  quotaUsed?: number;
  quotaTotal?: number;
}> {
  if (!REMOVEBG_API_KEY) {
    return { ok: false, error: "REMOVEBG_API_KEY not configured" };
  }

  try {
    // Call with a minimal test to check quota
    const formData = new FormData();
    formData.append("image_url", "https://via.placeholder.com/1.png");
    formData.append("size", "preview");
    formData.append("format", "png");

    const response = await fetch(REMOVEBG_API_URL, {
      method: "POST",
      headers: { "X-Api-Key": REMOVEBG_API_KEY },
      body: formData,
    });

    if (response.ok) {
      return { ok: true };
    }

    const json = (await response.json()) as RemoveBgResponse;
    return {
      ok: false,
      error: json.errors?.[0]?.title ?? `HTTP ${response.status}`,
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
