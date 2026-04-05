/**
 * 生成4张不同的案例 after 图
 * 运行: npx tsx scripts/generate-cases.ts
 */

import "dotenv/config";

const API_KEY = process.env.MINIMAX_API_KEY || "";
const BASE_URL = "https://api.minimax.chat/v1";

const CASES = [
  {
    id: "bg-swap",
    name: "换背景",
    type: "background_swap",
    prompt: "Professional e-commerce product photography, clean white studio background, bright ambient light, sharp focus, pill bottle supplement product centered, high-end commercial quality, minimalist style",
    style: "commercial" as const,
    aspectRatio: "1:1" as const,
  },
  {
    id: "retouch",
    name: "商品精修",
    type: "product_photo",
    prompt: "Professional e-commerce product photography, bright professional lighting, clean background, supplement pill bottle product shot, enhanced colors and contrast, polished commercial quality, vibrant and clean look",
    style: "commercial" as const,
    aspectRatio: "1:1" as const,
  },
  {
    id: "model",
    name: "模特图",
    type: "model_photo",
    prompt: "Professional fashion model photography, model holding supplement pill bottle, warm studio lighting, natural skin tones, commercial quality, elegant and trustworthy feel, close-up product focus",
    style: "commercial" as const,
    aspectRatio: "3:4" as const,
  },
  {
    id: "scene",
    name: "场景图",
    type: "background_swap",
    prompt: "Lifestyle product photography, supplement pill bottle placed on elegant marble kitchen counter, warm morning light, modern minimalist background, photorealistic, professional commercial quality, inviting atmosphere",
    style: "luxury" as const,
    aspectRatio: "1:1" as const,
  },
];

async function generateImage(
  type: string,
  prompt: string,
  style: string,
  aspectRatio: string,
  referenceImageUrl?: string
): Promise<string> {
  const body: Record<string, unknown> = {
    model: "image-01",
    prompt,
    aspect_ratio: aspectRatio,
    response_format: "url",
    n: 1,
  };

  if (referenceImageUrl) {
    body.subject_reference = [
      {
        type: "character",
        image_file: referenceImageUrl,
      },
    ];
  }

  const res = await fetch(`${BASE_URL}/image_generation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MiniMax API error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    base_resp?: { status_code: number; status_msg?: string };
    data?: { image_urls?: string[]; image_base64?: string[] };
  };

  if (json.base_resp?.status_code !== 0) {
    throw new Error(
      `MiniMax error: ${json.base_resp?.status_msg ?? "unknown"}`
    );
  }

  const imageUrl =
    json.data?.image_urls?.[0] ??
    `data:image/jpeg;base64,${json.data?.image_base64?.[0]}`;

  if (!imageUrl) throw new Error("No image returned");

  return imageUrl;
}

async function main() {
  if (!API_KEY) {
    console.error("请设置 MINIMAX_API_KEY 环境变量");
    process.exit(1);
  }

  const REFERENCE_URL =
    "https://minimax-algeng-chat-tts.oss-cn-wulanchabu.aliyuncs.com/ccv2%2F2026-04-05%2FMiniMax-M2.7-highspeed%2F2027708094057816140%2F32a4d7fcfd86701f9da3ddc2b7922058a2761f92ccaf5bf8d20399e986802d1d..png?Expires=1775487954&OSSAccessKeyId=LTAI5tGLnRTkBjLuYPjNcKQ8&Signature=WmDLHsXcYjIfxsehK6Z240VtE1Y%3D";

  console.log("开始生成4张案例图...\n");

  const results: Array<{
    id: string;
    name: string;
    url: string;
  }> = [];

  for (const c of CASES) {
    try {
      console.log(`生成 [${c.name}] ...`);
      const url = await generateImage(
        c.type,
        c.prompt,
        c.style,
        c.aspectRatio,
        c.id === "bg-swap" || c.id === "retouch" ? REFERENCE_URL : undefined
      );
      results.push({ id: c.id, name: c.name, url });
      console.log(`  ✓ ${c.name} done`);
      // 间隔2秒避免限流
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`  ✗ ${c.name} failed:`, err instanceof Error ? err.message : err);
    }
  }

  console.log("\n─── 生成结果 ───");
  for (const r of results) {
    console.log(`\n// ${r.name} (${r.id})`);
    console.log(`AFTER_${r.id.toUpperCase()}_URL =`);
    console.log(`  "${r.url}";`);
  }
}

main().catch(console.error);
