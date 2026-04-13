import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { MiniMaxCNProvider } from "../lib/image/providers/minimax-cn";
import type { ImageTaskInput } from "../lib/image/types";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const NEW_BEFORE =
  "https://minimax-algeng-chat-tts.oss-cn-wulanchabu.aliyuncs.com/ccv2%2F2026-04-06%2FMiniMax-M2.7-highspeed%2F2027708094057816140%2Ff2915f4bbe62c01bd066348120b3f280f395315842c3007df51baa73e5b3283b..jpeg?Expires=1775543281&OSSAccessKeyId=LTAI5tGLnRTkBjLuYPjNcKQ8&Signature=hwiaZCaDv79RR%2BejmXTkw1uCiow%3D";

const COLOR_CONSTRAINT =
  "CRITICAL COLOR MATCH: The suit in the output MUST match the EXACT SAME lavender purple color from the reference image. " +
  "Restore the original color tone — do NOT make it darker, grayer, or duller. " +
  "Keep the color clean, soft, and bright. Same brightness, same saturation, same hue. " +
  "NEVER change to dark navy, gray, black, or any other color — it must remain light lavender purple.";

const SUIT_STRUCTURE =
  "The suit structure must remain IDENTICAL — same lapels, same buttons, same collar shape, same silhouette. " +
  "Do NOT redesign or replace the garment. Do NOT crop into close-up detail only.";

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
  const prompt =
    COLOR_CONSTRAINT + " " + SUIT_STRUCTURE +
    " Place the EXACT SAME light lavender purple suit on a pure white background. " +
    "Professional e-commerce product photography. Even studio lighting from front-left. " +
    "Garment centered, fully visible, clean commercial style. High-end retail look. " +
    "The suit color must be clean lavender purple — not gray, not dark, not washed out.";

  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`▶ 换背景 attempt ${attempt}`);
    try {
      const input: ImageTaskInput = {
        type: "product_photo",
        prompt,
        referenceImageUrl: NEW_BEFORE,
        aspectRatio: "1:1",
      };
      const result = await provider.generate(input);
      console.log(`  生成成功，长度=${result.imageUrl.length}`);
      const url = await upload("fashion-bg-swap.jpg", result.imageUrl);
      console.log(`  上传成功: ${url.split("?")[0]}`);
      return;
    } catch (err) {
      console.log(`  失败: ${(err as Error).message}`);
      if (attempt < 3) console.log("  重试...\n");
    }
  }
  console.log("全部失败");
}

main().catch(console.error);
