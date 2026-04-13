/**
 * 案例图局部修复
 *
 * 策略：只重做有问题的 3 张，保留合格的那张
 *
 * 基准：用户上传的浅紫色西装原图
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { MiniMaxCNProvider } from "../lib/image/providers/minimax-cn";
import type { ImageTaskInput } from "../lib/image/types";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 新的 before 图（用户上传的浅紫色西装）
const NEW_BEFORE =
  "https://minimax-algeng-chat-tts.oss-cn-wulanchabu.aliyuncs.com/ccv2%2F2026-04-06%2FMiniMax-M2.7-highspeed%2F2027708094057816140%2Ff2915f4bbe62c01bd066348120b3f280f395315842c3007df51baa73e5b3283b..jpeg?Expires=1775543281&OSSAccessKeyId=LTAI5tGLnRTkBjLuYPjNcKQ8&Signature=hwiaZCaDv79RR%2BejmXTkw1uCiow%3D";

const SUIT_IDENTITY =
  "Keep the EXACT SAME suit from the reference image — same lavender color, same silhouette, same buttons, same lapel shape, same fabric texture. " +
  "Do NOT redesign, recolor, deform, or replace the suit or any part of it. " +
  "The FULL GARMENT must remain clearly visible and identical to the reference.";

const CASES = [
  {
    id: "fashion-bg-swap",
    label: "换背景",
    prompt:
      SUIT_IDENTITY +
      " Place the EXACT SAME lavender suit on a pure white background. " +
      "Professional e-commerce product photography. Soft even lighting from the front. " +
      "Garment centered, fully visible, clean commercial style. " +
      "High-end retail catalog look. Do NOT crop the garment.",
    aspectRatio: "1:1",
    uploadAs: "fashion-bg-swap.jpg",
  },
  {
    id: "fashion-enhance",
    label: "商品精修",
    prompt:
      SUIT_IDENTITY +
      " Enhance the existing photograph. Improve brightness and clarity while keeping the EXACT SAME suit unchanged. " +
      "Sharpen details, improve fabric texture visibility, correct lighting to look like a luxury brand official photo. " +
      "The suit must remain IDENTICAL — same color, buttons, lapels, silhouette. " +
      "Do NOT change the background significantly, do NOT replace the garment. " +
      "Goal: looks like a brand website product photo of the same item.",
    aspectRatio: "3:4",
    uploadAs: "fashion-enhance.jpg",
  },
  {
    id: "fashion-model",
    label: "模特图",
    prompt:
      SUIT_IDENTITY +
      " Fashion photography, medium shot. The model stands naturally, wearing the EXACT SAME lavender suit — same lapels, same buttons, same color, same silhouette. " +
      "Full upper body and upper thighs clearly visible. " +
      "Clean minimal background, soft natural window lighting, warm authentic atmosphere. " +
      "The suit is clearly and completely shown on the body, not a close-up detail shot. " +
      "Do NOT photograph only the face or a small detail — the full garment on the body must be visible. " +
      "Xiaohongshu fashion editorial style.",
    aspectRatio: "3:4",
    uploadAs: "fashion-model.jpg",
  },
];

async function upload(filename: string, imageUrl: string): Promise<string> {
  let buffer: ArrayBuffer;
  if (imageUrl.startsWith("data:")) {
    const b64 = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    buffer = bytes.buffer;
  } else {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    buffer = await res.arrayBuffer();
  }
  const { error } = await supabase.storage
    .from("cases")
    .upload(filename, buffer, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`Upload: ${error.message}`);
  const { data } = supabase.storage.from("cases").getPublicUrl(filename);
  return data.publicUrl;
}

async function main() {
  const provider = new MiniMaxCNProvider();

  console.log("基准图:", NEW_BEFORE.split("?")[0], "\n");

  for (const c of CASES) {
    console.log(`▶ ${c.label}（${c.id}）`);
    console.log(`  prompt: ${c.prompt.slice(0, 100)}...`);

    let success = false;
    let imageUrl = "";

    // 生成 2 张，选更好的那张
    for (let attempt = 1; attempt <= 2 && !success; attempt++) {
      try {
        const input: ImageTaskInput = {
          type: "product_photo",
          prompt: c.prompt,
          referenceImageUrl: NEW_BEFORE,
          aspectRatio: c.aspectRatio as "1:1" | "3:4" | "16:9",
        };

        const result = await provider.generate(input);
        console.log(`  [${attempt}] 生成成功，长度: ${result.imageUrl.length}`);

        const url = await upload(c.uploadAs, result.imageUrl);
        console.log(`  [${attempt}] 上传成功: ${url.split("?")[0]}\n`);
        imageUrl = url;
        success = true;
      } catch (err) {
        console.log(`  [${attempt}] 失败: ${(err as Error).message}`);
        if (attempt < 2) console.log("  重试...\n");
      }
    }

    if (!success) {
      console.log(`  ❌ 最终失败，跳过\n`);
    }
  }

  console.log("完成。第4张（场景图）保持不变。");
  console.log(
    "第4张永久URL: https://rysflxejfkpahmwokwrx.supabase.co/storage/v1/object/public/cases/fashion-lifestyle.jpg"
  );
}

main().catch(console.error);
