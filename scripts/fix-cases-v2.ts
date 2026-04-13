/**
 * 案例图局部修复 V2
 *
 * 只重做有问题的 3 张，保留第4张场景图
 * 核心修复：颜色偏差，强化 lavender 色彩约束
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { MiniMaxCNProvider } from "../lib/image/providers/minimax-cn";
import type { ImageTaskInput } from "../lib/image/types";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 用户上传的浅紫色西装原图
const NEW_BEFORE =
  "https://minimax-algeng-chat-tts.oss-cn-wulanchabu.aliyuncs.com/ccv2%2F2026-04-06%2FMiniMax-M2.7-highspeed%2F2027708094057816140%2Ff2915f4bbe62c01bd066348120b3f280f395315842c3007df51baa73e5b3283b..jpeg?Expires=1775543281&OSSAccessKeyId=LTAI5tGLnRTkBjLuYPjNcKQ8&Signature=hwiaZCaDv79RR%2BejmXTkw1uCiow%3D";

// 强化色彩约束：颜色问题是核心，必须单独强调
const COLOR_CONSTRAINT =
  "CRITICAL COLOR MATCH: The suit in the output MUST match the EXACT SAME lavender purple color from the reference image. " +
  "Restore the original color tone — do NOT make it darker, grayer, or duller. " +
  "Keep the color clean, soft, and bright. Same brightness, same saturation, same hue. " +
  "NEVER change to dark navy, gray, black, or any other color — it must remain light lavender purple.";

// 服装结构约束
const SUIT_STRUCTURE =
  "The suit structure must remain IDENTICAL — same lapels, same buttons, same collar shape, same silhouette. " +
  "Do NOT redesign or replace the garment. Do NOT crop into close-up detail only.";

const CASES = [
  {
    id: "fashion-bg-swap",
    label: "换背景",
    uploadAs: "fashion-bg-swap.jpg",
    prompt:
      COLOR_CONSTRAINT + " " + SUIT_STRUCTURE +
      " Place the EXACT SAME light lavender purple suit on a pure white background. " +
      "Professional e-commerce product photography. Even studio lighting from front-left. " +
      "Garment centered, fully visible, clean commercial style. High-end retail look. " +
      "The suit color must be clean lavender purple — not gray, not dark, not washed out.",
    aspectRatio: "1:1",
  },
  {
    id: "fashion-enhance",
    label: "商品精修",
    uploadAs: "fashion-enhance.jpg",
    prompt:
      COLOR_CONSTRAINT + " " + SUIT_STRUCTURE +
      " Enhance the existing photograph of the SAME suit. " +
      "Improve brightness slightly, sharpen details, improve fabric texture. " +
      "Keep the EXACT SAME lavender purple color — do not darken or desaturate. " +
      "The result should look like a brand website product photo of the SAME item. " +
      "Do NOT change the background significantly. Do NOT replace the garment.",
    aspectRatio: "3:4",
  },
  {
    id: "fashion-model",
    label: "模特图",
    uploadAs: "fashion-model.jpg",
    prompt:
      COLOR_CONSTRAINT + " " + SUIT_STRUCTURE +
      " Fashion photography, medium shot. The model wears the EXACT SAME light lavender purple suit from the reference image. " +
      "Full upper body and upper thighs clearly visible. Natural standing pose. " +
      "Clean minimal background, soft natural window lighting, warm authentic atmosphere. " +
      "The suit is clearly shown on the body — NOT a close-up of face or fabric detail only. " +
      "Color must be clean lavender purple, NOT dark, NOT gray.",
    aspectRatio: "3:4",
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

    let success = false;
    let imageUrl = "";

    for (let attempt = 1; attempt <= 2 && !success; attempt++) {
      try {
        const input: ImageTaskInput = {
          type: "product_photo",
          prompt: c.prompt,
          referenceImageUrl: NEW_BEFORE,
          aspectRatio: c.aspectRatio as "1:1" | "3:4" | "16:9",
        };

        const result = await provider.generate(input);
        console.log(`  [${attempt}] 生成成功`);

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
      console.log(`  ❌ 最终失败\n`);
    }
  }

  console.log("═══ 完成 ═══");
  console.log("第4张（场景图）保持不变: https://rysflxejfkpahmwokwrx.supabase.co/storage/v1/object/public/cases/fashion-lifestyle.jpg");
}

main().catch(console.error);
