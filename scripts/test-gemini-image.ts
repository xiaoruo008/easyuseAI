/**
 * Gemini Nano Banana 图片生成接口探测
 *
 * 目标：找到正确的 generateContent 调用方式
 * 测试：
 * 1. 不同模型名称
 * 2. response_modalities = ["IMAGE"]
 * 3. 图生图（带参考图）
 * 4. 纯文生图
 */

import "dotenv/config";

const KEY = process.env.GEMINI_API_KEY ?? "AIzaSyC8X3V_K2WUxMgoxNTdYUk52WSHB8FcGwY";
const BASE = "https://generativelanguage.googleapis.com/v1beta";
const REF_IMAGE = "https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output/talkie/prod/img/2026-04-06/41ad8621-9a77-47fe-b86f-d59d858a4eb4_aigc.jpeg";

const MODELS = [
  "gemini-2.0-flash-preview",
  "gemini-3.0-flash-preview",
  "gemini-3.1-flash-preview",
  "gemini-3.1-flash-image-preview",
  "gemini-3-pro-image-preview",
];

const PROMPT = "A light lavender suit on a pure white background, professional e-commerce product photo, full garment visible";

async function generateContent(model: string, body: unknown): Promise<{status: number; body: string}> {
  const url = `${BASE}/models/${model}:generateContent?key=${KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text.slice(0, 300) };
}

async function testModel(model: string, label: string) {
  console.log(`\n─── ${label} (${model}) ───`);
  // Test 1: plain text generation (should always work for multimodal models)
  const textBody = {
    contents: [{ parts: [{ text: "Say OK in one word" }] }],
  };
  const t1 = await generateContent(model, textBody);
  console.log(`text only: HTTP ${t1.status} | ${t1.body.slice(0, 80)}`);

  // Test 2: text + IMAGE response
  const imgBody = {
    contents: { parts: [{ text: PROMPT }] },
    generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
  };
  const t2 = await generateContent(model, imgBody);
  console.log(`TEXT+IMAGE: HTTP ${t2.status} | ${t2.body.slice(0, 120)}`);

  // Test 3: with image input
  try {
    const refRes = await fetch(REF_IMAGE);
    const refBuf = await refRes.arrayBuffer();
    const refBase64 = Buffer.from(refBuf).toString("base64");
    const imgWithRef = {
      contents: {
        parts: [
          { text: "Keep the suit exactly the same. Place it on a white background, professional photo." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: refBase64,
            },
          },
        ],
      },
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    };
    const t3 = await generateContent(model, imgWithRef);
    console.log(`with image: HTTP ${t3.status} | ${t3.body.slice(0, 120)}`);
  } catch (e) {
    console.log(`with image: ERROR ${(e as Error).message}`);
  }
}

async function main() {
  console.log("GEMINI_API_KEY:", KEY.slice(0, 10) + "...");
  for (const model of MODELS) {
    await testModel(model, model);
    await new Promise((r) => setTimeout(r, 2000));
  }
}

main().catch(console.error);
