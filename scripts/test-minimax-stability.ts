import "dotenv/config";

/**
 * MiniMax 图片生成 API 稳定性测试
 * 
 * 运行: npx tsx scripts/test-minimax-stability.ts
 */

const KEY = process.env.MINIMAX_API_KEY ?? "";
const BASE = process.env.MINIMAX_IMAGE_BASE_URL ?? "https://api.minimaxi.com";
const PATH = "/v1/image_generation";

if (!KEY) {
  console.error("❌ 没有配置 API key，退出");
  process.exit(1);
}

console.log("=== MiniMax 图片生成 API 稳定性测试 ===\n");

interface TestResult {
  prompt: string;
  success: boolean;
  imageUrl: string;
  latencySeconds: number;
  error?: string;
}

// 3 种测试场景
const prompts = [
  {
    name: "电商白底产品图",
    prompt: "a elegant ceramic coffee mug on pure white background, soft studio lighting, commercial product photography, high detail, sharp focus",
    model: "image-01",
    aspect_ratio: "1:1",
  },
  {
    name: "模特上身图",
    prompt: "a fashion model wearing a casual denim jacket and white tee, standing in studio, natural skin tones, professional photography, commercial quality",
    model: "image-01",
    aspect_ratio: "3:4",
  },
  {
    name: "ins风场景图",
    prompt: "a minimalist Scandinavian living room with a plant corner, soft natural window light, aesthetic interior design, warm neutral tones, editorial photography style",
    model: "image-01",
    aspect_ratio: "16:9",
  },
];

async function callImageAPI(prompt: string, model: string, aspectRatio: string): Promise<TestResult> {
  const start = Date.now();
  
  const body = JSON.stringify({
    model,
    prompt,
    aspect_ratio: aspectRatio,
    response_format: "url",
    n: 1,
  });

  let res: Response;
  try {
    res = await fetch(BASE + PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KEY}`,
      },
      body,
      signal: AbortSignal.timeout(90000), // 90s 超时
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      prompt,
      success: false,
      imageUrl: "",
      latencySeconds: (Date.now() - start) / 1000,
      error: msg,
    };
  }

  const latencySeconds = (Date.now() - start) / 1000;
  let rawText = "";
  try {
    rawText = await res.text();
  } catch {
    rawText = "(无法读取响应体)";
  }

  if (res.status !== 200) {
    return {
      prompt,
      success: false,
      imageUrl: "",
      latencySeconds,
      error: `HTTP ${res.status}: ${rawText.slice(0, 200)}`,
    };
  }

  try {
    const json = JSON.parse(rawText);
    if (json.base_resp?.status_code !== 0 && json.base_resp?.status_code !== undefined) {
      return {
        prompt,
        success: false,
        imageUrl: "",
        latencySeconds,
        error: `业务错误 ${json.base_resp.status_code}: ${json.base_resp.status_msg}`,
      };
    }

    const imageUrl =
      json.data?.image_urls?.[0]
        ? decodeURIComponent(json.data.image_urls[0])
        : json.data?.image_base64?.[0]
          ? `[base64 data]`
          : "";

    if (!imageUrl) {
      return {
        prompt,
        success: false,
        imageUrl: "",
        latencySeconds,
        error: "图片数据为空",
      };
    }

    return {
      prompt,
      success: true,
      imageUrl,
      latencySeconds,
    };
  } catch {
    return {
      prompt,
      success: false,
      imageUrl: "",
      latencySeconds,
      error: `JSON解析失败: ${rawText.slice(0, 100)}`,
    };
  }
}

async function run() {
  const results: Array<{ name: string } & TestResult> = [];

  for (const test of prompts) {
    console.log(`\n📸 测试: ${test.name}`);
    console.log(`   Prompt: "${test.prompt}"`);
    
    const result = await callImageAPI(test.prompt, test.model, test.aspect_ratio);
    results.push({ name: test.name, ...result });

    if (result.success) {
      console.log(`   ✅ 成功`);
      console.log(`   🖼️  图片: ${result.imageUrl.slice(0, 80)}...`);
      console.log(`   ⏱️  耗时: ${result.latencySeconds.toFixed(1)}s`);
    } else {
      console.log(`   ❌ 失败: ${result.error}`);
      console.log(`   ⏱️  耗时: ${result.latencySeconds.toFixed(1)}s`);
    }

    // 间隔 3s 再测
    if (prompts.indexOf(test) < prompts.length - 1) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  // 汇总
  console.log("\n\n=== 测试结果汇总 ===");
  const successCount = results.filter((r) => r.success).length;
  const total = results.length;
  const avgTime =
    results.reduce((sum, r) => sum + r.latencySeconds, 0) / total;

  for (const r of results) {
    console.log(`\n【${r.name}】`);
    console.log(`prompt: "${r.prompt}"`);
    console.log(`成功: ${r.success ? "yes" : "no"}`);
    console.log(`图片链接: ${r.success ? r.imageUrl : "-"}`);
    console.log(`耗时: ${r.latencySeconds.toFixed(1)}s`);
  }

  console.log(`\n=== 最终汇总 ===`);
  console.log(`成功率: ${successCount}/${total} (${((successCount / total) * 100).toFixed(0)}%)`);
  console.log(`平均耗时: ${avgTime.toFixed(1)}s`);

  const best = results
    .filter((r) => r.success)
    .sort((a, b) => a.latencySeconds - b.latencySeconds)[0];
  if (best) {
    console.log(`最优 prompt 模板: ${best.name} (${best.latencySeconds.toFixed(1)}s)`);
  }
}

run().catch(console.error);
