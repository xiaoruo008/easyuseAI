/**
 * Gemini Nano Banana 专项测试
 *
 * 测试 gemini-nanobanana.ts 的实际调用能力
 *
 * 运行: npx tsx scripts/test-gemini-nanobanana.ts
 */

import "dotenv/config";
import { GeminiNanobananaProvider } from "../lib/image/providers/gemini-nanobanana";
import type { ImageTaskInput } from "../lib/image/types";

// 服装原图（before）
const REF_IMAGE =
  "https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output/talkie/prod/img/2026-04-06/41ad8621-9a77-47fe-b86f-d59d858a4eb4_aigc.jpeg";

const TESTS = [
  {
    id: "fashion-model",
    label: "服装模特图",
    type: "model_photo" as const,
    prompt:
      "Professional fashion photography. The model wears the EXACT SAME garment — same lavender color, same lapels, same buttons, same silhouette. Full upper body visible. Clean background, natural soft lighting.",
  },
  {
    id: "fashion-lifestyle",
    label: "服装场景图",
    type: "background_swap" as const,
    prompt:
      "Fashion lifestyle photography. The garment is EXACTLY THE SAME — same lavender color, same lapels, same buttons. Naturally placed in a modern cafe setting. Warm inviting atmosphere.",
  },
];

async function runTest(test: (typeof TESTS)[number]) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`测试: ${test.label} (${test.id})`);
  console.log("═".repeat(60));

  const provider = new GeminiNanobananaProvider();

  const input: ImageTaskInput = {
    type: test.type,
    prompt: test.prompt,
    referenceImageUrl: REF_IMAGE,
    aspectRatio: "1:1",
  };

  console.log("model:", process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image-preview");
  console.log("hasRef:", !!input.referenceImageUrl);

  try {
    const result = await provider.generate(input);
    console.log("\n✅ 成功!");
    console.log("provider:", result.provider);
    console.log("model:", result.model);
    console.log("imageUrl (前80字):", result.imageUrl.slice(0, 80));
    console.log("generatedAt:", result.generatedAt);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log("\n❌ 失败:", msg.slice(0, 200));
    return false;
  }
}

async function main() {
  console.log("═══ Gemini Nano Banana 测试 ═══");
  console.log("API Key:", (process.env.GEMINI_API_KEY ?? "").slice(0, 10) + "...");
  console.log("Model:", process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image-preview");
  console.log("Ref Image:", REF_IMAGE.split("?")[0]);

  let passed = 0;
  for (const test of TESTS) {
    const ok = await runTest(test);
    if (ok) passed++;
    await new Promise((r) => setTimeout(r, 5000));
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log(`结果: ${passed}/${TESTS.length} 通过`);
  console.log("═".repeat(60));

  if (passed === 0) {
    console.log("\n当前 Gemini 图片额度耗尽或模型不可用。");
    console.log("所有请求会自动 fallback 到 minimax-cn，不会阻塞前台。");
  }
}

main().catch(console.error);
