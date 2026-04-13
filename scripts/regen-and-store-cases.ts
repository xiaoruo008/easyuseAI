/**
 * 案例图重新生成 + 永久存储
 *
 * 使用 supabase-js SDK 操作 Storage
 * - 检查/创建 cases bucket
 * - 重新生成 4 张案例图
 * - 上传到 Supabase Storage
 * - 输出永久 URL
 *
 * 运行: npx tsx scripts/regen-and-store-cases.ts
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { MiniMaxCNProvider } from "../lib/image/providers/minimax-cn";
import { MockImageProvider } from "../lib/image/mock-provider";
import type { ImageTaskInput } from "../lib/image/types";

// ── 配置 ──────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 原始 before 图片
const REAL_BEFORE =
  "https://minimax-algeng-chat-tts.oss-cn-wulanchabu.aliyuncs.com/ccv2%2F2026-04-06%2FMiniMax-M2.7-highspeed%2F2027708094057816140%2Fc191410b7ecb218778f305990a24962897294aee7f54a792f8f4c26d8aba8b06..jpeg?Expires=1775535518&OSSAccessKeyId=LTAI5tGLnRTkBjLuYPjNcKQ8&Signature=HjZRNjRroGNZA1XHSnPaQT7IanI%3D";

// ── 4 个案例 ──────────────────────────────────────────
const SUIT_IDENTITY =
  "The product must remain completely identical — same shape, same lavender color, same buttons, same lapels, same silhouette. " +
  "Do NOT alter, deform, recolor, or replace the product or any part of it in any way. " +
  "Do NOT crop into close-up detail only — the FULL GARMENT must be clearly visible.";

const CASES = [
  {
    id: "fashion-bg-swap",
    label: "换背景",
    prompt:
      SUIT_IDENTITY +
      " Place the exact same lavender suit on a pure white background, professional e-commerce product photography, soft even lighting, clean and minimal. The full garment must be clearly visible. High-end commercial style.",
    aspectRatio: "1:1",
  },
  {
    id: "fashion-enhance",
    label: "商品精修",
    prompt:
      SUIT_IDENTITY +
      " Enhance the image to look like a luxury brand official product photo. Maintain exact same color, buttons, lapels, and silhouette. Improve lighting, sharpness, and texture to brand-quality level. The full garment must be fully visible, not cropped.",
    aspectRatio: "3:4",
  },
  {
    id: "fashion-model",
    label: "模特图",
    prompt:
      "Fashion photography. The model wears the EXACT SAME lavender suit — same lapels, same buttons, same silhouette, same color. Full upper body visible, the garment is clearly and completely shown. Clean minimal background, natural soft window lighting, warm authentic atmosphere. Do NOT change the garment in any way.",
    aspectRatio: "3:4",
  },
  {
    id: "fashion-lifestyle",
    label: "场景图",
    prompt:
      "Fashion lifestyle photography. The garment is EXACTLY THE SAME lavender suit — same lapels, same buttons, same silhouette, same color. The suit is naturally placed in a stylish modern cafe corner, warm afternoon sunlight, coffee and books nearby. Lifestyle mood, Xiaohongshu style. The full garment must be visible. Do NOT change clothing.",
    aspectRatio: "1:1",
  },
];

// ── Step 1: 确认/创建 bucket ──────────────────────────
async function ensureBucket(): Promise<void> {
  // 检查是否已存在
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw new Error(`列出 bucket 失败: ${listErr.message}`);

  const exists = buckets?.find((b) => b.name === "cases");
  if (exists) {
    console.log("  bucket 'cases' 已存在");
    return;
  }

  // 创建 bucket（公开）
  const { error: createErr } = await supabase.storage.createBucket("cases", {
    public: true,
  });

  if (createErr && createErr.message !== "Already exists") {
    throw new Error(`创建 bucket 失败: ${createErr.message}`);
  }
  console.log("  bucket 'cases' 创建成功（公开）");
}

// ── Step 2: 生成图片 ──────────────────────────────────
async function generateImage(
  prompt: string,
  aspectRatio: string
): Promise<string> {
  const hasMiniMax = !!(
    process.env.MINIMAX_API_KEY || process.env.AI_API_KEY
  );
  const provider = hasMiniMax
    ? new MiniMaxCNProvider()
    : new MockImageProvider();

  const input: ImageTaskInput = {
    type: "product_photo",
    prompt,
    referenceImageUrl: REAL_BEFORE,
    aspectRatio: aspectRatio as "1:1" | "3:4" | "16:9",
  };

  const result = await provider.generate(input);
  return result.imageUrl;
}

// ── Step 3: 上传到 Supabase Storage ───────────────────
async function uploadToSupabase(
  filename: string,
  imageUrl: string
): Promise<string> {
  let buffer: ArrayBuffer;

  if (imageUrl.startsWith("data:")) {
    // base64 内嵌数据，直接解码
    const b64 = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    buffer = bytes.buffer;
    console.log(`  使用 base64 数据 (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
  } else {
    // 下载 OSS URL
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`下载图片失败 HTTP ${res.status}`);
    buffer = await res.arrayBuffer();
    console.log(`  下载完成 (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
  }

  // 上传
  const { error: uploadErr } = await supabase.storage
    .from("cases")
    .upload(filename, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadErr) throw new Error(`上传失败: ${uploadErr.message}`);

  // 获取公开 URL
  const { data } = supabase.storage.from("cases").getPublicUrl(filename);
  return data.publicUrl;
}

// ── 主流程 ───────────────────────────────────────────
async function main() {
  console.log("═══ 案例图重新生成 + 永久存储 ═══\n");
  console.log("Supabase:", SUPABASE_URL.split("//")[1].split(".")[0]);
  console.log("Key prefix:", SUPABASE_SERVICE_KEY.slice(0, 12));

  // ① bucket
  console.log("\n[1] 确认 Storage bucket...");
  await ensureBucket();

  // ② 生成 + 上传
  const results: Array<{
    id: string;
    label: string;
    url: string;
    ok: boolean;
    error?: string;
  }> = [];

  console.log("\n[2] 生成并上传 4 张案例图...\n");

  for (const c of CASES) {
    console.log(`▶ ${c.label} (${c.id})`);
    try {
      const imageUrl = await generateImage(c.prompt, c.aspectRatio);
      console.log(`  生成成功: ${imageUrl.slice(0, 60)}...`);
      const permanentUrl = await uploadToSupabase(`${c.id}.jpg`, imageUrl);
      console.log(`  上传成功: ${permanentUrl.split("?")[0]}\n`);
      results.push({ id: c.id, label: c.label, url: permanentUrl, ok: true });
    } catch (err) {
      const msg = (err as Error).message;
      console.log(`  ❌ 失败: ${msg}\n`);
      results.push({ id: c.id, label: c.label, url: "", ok: false, error: msg });
    }
  }

  // ③ 结果
  console.log("═══ 结果 ═══");
  const passed = results.filter((r) => r.ok).length;
  console.log(`成功: ${passed}/${results.length}\n`);

  for (const r of results) {
    const mark = r.ok ? "✅" : "❌";
    console.log(`${mark} ${r.label}`);
    if (r.ok) {
      console.log(`   ${r.url.split("?")[0]}`);
    } else {
      console.log(`   错误: ${r.error}`);
    }
  }

  // ④ 输出 homepage 更新
  if (passed === results.length) {
    console.log("\n═══ homepage 数据更新 ═══\n");
    for (const r of results) {
      const key = `AFTER_${r.id.toUpperCase().replace(/-/g, "_")}_URL`;
      console.log(`const ${key} =`);
      console.log(`  "${r.url.split("?")[0]}";\n`);
    }
  } else {
    console.log(`\n⚠️  只有 ${passed}/${results.length} 张成功`);
  }
}

main().catch(console.error);
