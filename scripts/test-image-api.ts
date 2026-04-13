/**
 * MiniMax 图片接口探测脚本
 * 运行: npx tsx scripts/test-image-api.ts
 */
import "dotenv/config";

const KEY = process.env.MINIMAX_API_KEY ?? process.env.AI_API_KEY ?? "";
const BASE_URL = process.env.MINIMAX_IMAGE_BASE_URL ?? "https://api.minimax.chat";

if (!KEY) {
  console.error("没有配置任何 API key");
  process.exit(1);
}

console.log(`Key: ${KEY.slice(0, 10)}...`);
console.log(`Base: ${BASE_URL}`);
console.log("");

async function test(url: string, body: unknown, label: string) {
  process.stdout.write(`测试 ${label}... `);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KEY}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log(`HTTP ${res.status}`);
    if (text) console.log("  返回:", text.slice(0, 300));
    return res.status;
  } catch (e) {
    console.log("请求失败:", (e as Error).message);
    return null;
  }
}

async function main() {
  // 探测可用 endpoint
  const endpoints = [
    { url: `${BASE_URL}/v1/image_generation`, body: { model: "image-01", prompt: "a white cat", aspect_ratio: "1:1", n: 1, response_format: "url" }, label: "POST /v1/image_generation" },
    { url: `${BASE_URL}/v1/images/generations`, body: { model: "image-01", prompt: "a white cat", n: 1 }, label: "POST /v1/images/generations" },
  ];

  for (const ep of endpoints) {
    await test(ep.url, ep.body, ep.label);
    await new Promise(r => setTimeout(r, 2000));
  }
}

main();
