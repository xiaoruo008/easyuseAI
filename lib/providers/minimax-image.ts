import type { ImageProvider } from "../image/provider";
import type { ImageTaskInput, ImageTaskOutput } from "../image/types";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY ?? "";
const MINIMAX_BASE_URL = "https://api.minimax.io";

const ASPECT_MAP: Record<string, string> = {
  "1:1": "1:1",
  "3:4": "3:4",
  "16:9": "16:9",
};

const MODEL = "image-01";

const TYPE_PROMPT_PREFIX: Record<string, string> = {
  product_photo:
    "Professional e-commerce product photography, clean white studio background, high-end commercial lighting, sharp focus, detailed product shot,",
  model_photo:
    "Professional fashion model photography, studio setting, natural skin tones, commercial quality, elegant and modern style,",
  background_swap:
    "Professional product placement in an elegant scene, photorealistic rendering, seamless integration,",
  lifestyle:
    "Elegant lifestyle product photography, natural ambient lighting, warm and inviting atmosphere, editorial quality, aspirational home scene,",
  fashion_model:
    "High-fashion editorial model photography, runway-inspired styling, luxury magazine aesthetic, dramatic lighting, premium fashion quality,",
  fashion_lifestyle:
    "Luxury lifestyle fashion photography, aspirational brand imagery, natural outdoor setting, editorial elegance, sophisticated mood,",
};

const STYLE_GUIDANCE: Record<string, string> = {
  luxury: "Luxury boutique aesthetic, editorial high-fashion quality, sophisticated refined mood, premium color grading, polished presentation.",
  minimal: "Minimalist clean aesthetic, simple and elegant composition, generous white space, understated sophistication.",
  commercial: "Commercial e-commerce standard, retail-ready quality, clean professional presentation, high conversion aesthetic.",
};

interface MiniMaxResponse {
  id: string;
  data: {
    image_urls?: string[];
    image_base64?: string[];
  };
  metadata: {
    success_count: number;
    failed_count: number;
  };
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

export class MiniMaxImageProvider implements ImageProvider {
  name = "minimax";

  async generate(input: ImageTaskInput): Promise<ImageTaskOutput> {
    if (!MINIMAX_API_KEY) {
      throw new Error("MINIMAX_API_KEY is not configured");
    }

    const aspectRatio = ASPECT_MAP[input.aspectRatio ?? "1:1"] ?? "1:1";
    const prefix = TYPE_PROMPT_PREFIX[input.type] ?? TYPE_PROMPT_PREFIX.product_photo;
    const styleGuidance = input.style ? (STYLE_GUIDANCE[input.style] ?? "") : "";
    const stylePrefix = styleGuidance ? `${styleGuidance} ` : "";
    const fullPrompt = `${stylePrefix}${prefix} ${input.prompt}`.slice(0, 1500);

    const body: Record<string, unknown> = {
      model: MODEL,
      prompt: fullPrompt,
      aspect_ratio: aspectRatio,
      response_format: "url",
      n: 1,
    };

    // 如果有参考图，添加 subject_reference
    if (input.referenceImageUrl) {
      body.subject_reference = [
        {
          type: "character",
          image_file: input.referenceImageUrl,
        },
      ];
    }

    const url = `${MINIMAX_BASE_URL}/v1/image_generation`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "unknown");
      throw new Error(`MiniMax API error ${res.status}: ${text}`);
    }

    const json = (await res.json()) as MiniMaxResponse;

    // 检查业务错误码
    if (json.base_resp?.status_code !== 0) {
      const code = json.base_resp?.status_code;
      const msg = json.base_resp?.status_msg ?? "unknown";
      throw new Error(`MiniMax API error code ${code}: ${msg}`);
    }

    // 优先取 url，没有则 base64
    let imageUrl = "";
    if (json.data?.image_urls?.length) {
      imageUrl = json.data.image_urls[0];
    } else if (json.data?.image_base64?.length) {
      imageUrl = `data:image/jpeg;base64,${json.data.image_base64[0]}`;
    }

    if (!imageUrl) {
      throw new Error("MiniMax returned no image");
    }

    return {
      imageUrl,
      thumbnailUrl: imageUrl,
      provider: "minimax",
      model: MODEL,
      generatedAt: new Date().toISOString(),
    };
  }
}
