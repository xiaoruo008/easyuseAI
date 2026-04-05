/**
 * 生成4张差异化案例 after 图
 * 每次运行前检查 prompt 确保差异最大化
 *
 * 运行: npx tsx scripts/generate-cases.ts
 * 需要 .env 中有 MINIMAX_API_KEY
 */

import "dotenv/config";

// 优先用图片专用 KEY，没有则用 chat KEY（共用额度）
const API_KEY =
  process.env.MINIMAX_API_KEY ||
  process.env.AI_API_KEY ||
  "";
const BASE_URL = "https://api.minimax.io";

// 原始随手拍图（所有4张 after 共用这一张 before）
const SHARED_BEFORE_URL =
  "https://minimax-algeng-chat-tts.oss-cn-wulanchabu.aliyuncs.com/ccv2%2F2026-04-05%2FMiniMax-M2.7-highspeed%2F2027708094057816140%2F32a4d7fcfd86701f9da3ddc2b7922058a2761f92ccaf5bf8d20399e986802d1d..png?Expires=1775487954&OSSAccessKeyId=LTAI5tGLnRTkBjLuYPjNcKQ8&Signature=WmDLHsXcYjIfxsehK6Z240VtE1Y%3D";

// 4个案例定义：每个 type 必须有完全不同的视觉结果
const CASES = [
  {
    id: "bg-swap",
    label: "换背景",
    // 纯白底 → 干净电商风
    prompt:
      "Professional supplement pill bottle on pure white background, studio product photography, bright even lighting from front, ultra-clean minimal background, high-end e-commerce quality, sharp focus on product label, commercial photography style",
    style: "commercial" as const,
    aspectRatio: "1:1" as const,
    useReference: true,
  },
  {
    id: "enhance",
    label: "商品精修",
    // 提亮+增强质感 → 像品牌官网图
    prompt:
      "Professional product photo of supplement pill bottle, bright natural window lighting, light beige textured background, polished commercial quality, enhanced contrast and color saturation, product looks premium and trustworthy, brand-quality photography",
    style: "commercial" as const,
    aspectRatio: "1:1" as const,
    useReference: true,
  },
  {
    id: "model",
    label: "模特图",
    // 人物手持产品 → 真实生活场景
    prompt:
      "Young Asian woman holding supplement pill bottle, casual elegant pose, warm cozy living room background with soft natural light, lifestyle product photography, authentic and trustworthy feel, close-up on hands and product, commercial quality",
    style: "commercial" as const,
    aspectRatio: "3:4" as const,
    useReference: false,
  },
  {
    id: "lifestyle",
    label: "场景图",
    // 产品在精致场景中 → 小红书种草风
    prompt:
      "Supplement pill bottle placed on white marble kitchen counter next to a green plant and a cup of coffee, morning sunlight streaming in, modern minimalist aesthetic, lifestyle flat lay photography, Xiaohongshu Chinese lifestyle style, warm and inviting atmosphere, photorealistic",
    style: "luxury" as const,
    aspectRatio: "1:1" as const,
    useReference: false,
  },
] as const;

async function generate(
  prompt: string,
  style: string,
  aspectRatio: string,
  referenceUrl?: string,
  retries = 3
): Promise<string> {
  const body: Record<string, unknown> = {
    model: "image-01",
    prompt,
    aspect_ratio: aspectRatio,
    response_format: "url",
    n: 1,
  };

  if (referenceUrl) {
    body.subject_reference = [
      {
        type: "character",
        image_file: referenceUrl,
      },
    ];
  }

  let lastError = "";

  for (let i = 0; i < retries; i++) {
    const res = await fetch(`${BASE_URL}/image_generation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429 || res.status === 403) {
      const wait = (i + 1) * 5000;
      console.log(`  rate-limited, waiting ${wait}ms...`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }

    if (!res.ok) {
      lastError = `API error ${res.status}: ${await res.text()}`;
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }

    const json = (await res.json()) as {
      base_resp?: { status_code: number; status_msg?: string };
      data?: { image_urls?: string[]; image_base64?: string[] };
    };

    if (json.base_resp?.status_code !== 0) {
      lastError = json.base_resp?.status_msg ?? "unknown error";
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }

    const url =
      json.data?.image_urls?.[0] ??
      `data:image/jpeg;base64,${json.data?.image_base64?.[0]}`;

    if (!url) throw new Error("no image returned");
    return url;
  }

  throw new Error(lastError);
}

async function main() {
  if (!API_KEY) {
    console.error("MINIMAX_API_KEY not set in .env");
    process.exit(1);
  }

  console.log("原始图:", SHARED_BEFORE_URL.split("?")[0], "\n");

  const results: Array<{ id: string; label: string; afterUrl: string }> = [];

  for (const c of CASES) {
    process.stdout.write(`[${c.label}] generating... `);
    try {
      const afterUrl = await generate(
        c.prompt,
        c.style,
        c.aspectRatio,
        c.useReference ? SHARED_BEFORE_URL : undefined
      );
      results.push({ id: c.id, label: c.label, afterUrl });
      console.log("✓");
      // 间隔3秒避免限流
      await new Promise((r) => setTimeout(r, 3000));
    } catch (err) {
      console.error("✗", err instanceof Error ? err.message : err);
    }
  }

  console.log("\n─── 生成结果 ───\n");
  console.log("// 原始随手拍图（before，所有案例共用）");
  console.log("const REAL_BEFORE =");
  console.log(`  "${SHARED_BEFORE_URL}";\n`);
  for (const r of results) {
    console.log(`// ${r.label} (${r.id})`);
    console.log(`const AFTER_${r.id.toUpperCase().replace("-", "_")}_URL =`);
    console.log(`  "${r.afterUrl}";\n`);
  }

  console.log("─── cases 数据结构 ───\n");
  for (const r of results) {
    const c = CASES.find((x) => x.id === r.id)!;
    console.log(`  {`);
    console.log(`    id: "${c.id}",`);
    console.log(`    label: "${c.label}",`);
    console.log(`    beforeUrl: REAL_BEFORE,`);
    console.log(`    afterUrl: AFTER_${c.id.toUpperCase().replace("-", "_")}_URL,`);
    console.log(`    from: "...",`);
    console.log(`    scene: "...",`);
    console.log(`    result: "..."`);
    console.log(`  },`);
  }
}

main().catch(console.error);
