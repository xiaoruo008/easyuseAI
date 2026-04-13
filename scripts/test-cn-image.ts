import "dotenv/config";

/**
 * MiniMax 国内版图片接口最小探测脚本
 *
 * 目标：用最少的参数、最直接的请求，探测接口真实响应
 *
 * 运行: npx tsx scripts/test-cn-image.ts
 */

const KEY = process.env.MINIMAX_API_KEY ?? process.env.AI_API_KEY ?? "";
const BASE = "https://api.minimaxi.com";
const PATH = "/v1/image_generation";

if (!KEY) {
  console.error("没有配置 API key，退出");
  process.exit(1);
}

console.log("=== MiniMax 国内版图片接口探测 ===");
console.log("Key 存在:", !!KEY);
console.log("Endpoint:", BASE + PATH);
console.log("");

// ── 最简请求（只含必填参数）──────────────────────────────
const body = JSON.stringify({
  model: "image-01",
  prompt: "a white cat on a sofa",
  n: 1,
});

console.log("请求体:", body);
console.log("");

async function call(): Promise<void> {
  console.log("发送请求...\n");

  let res: Response;
  try {
    res = await fetch(BASE + PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KEY}`,
      },
      body,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("socket hang up")) {
      console.error("❌ socket hang up");
      console.error("→ 服务端主动断开了连接");
      console.error("→ 可能原因：");
      console.error("  1. path 不对（但官方文档确认是 /v1/image_generation）");
      console.error("  2. 证书/TLS 问题");
      console.error("  3. 服务端限流");
      console.error("  4. 账户无图片接口权限");
    } else {
      console.error("❌ 请求失败:", msg);
    }
    return;
  }

  const status = res.status;
  let text = "";
  try {
    text = await res.text();
  } catch {
    text = "(无法读取响应体)";
  }

  console.log("HTTP 状态:", status);
  console.log("响应体:", text.slice(0, 500));

  if (status === 200) {
    try {
      const json = JSON.parse(text);
      const url = json?.data?.image_urls?.[0] ?? json?.data?.image_base64?.[0];
      if (url) {
        console.log("\n✅ 生成成功！图片 URL:", url.slice(0, 100));
      } else {
        console.log("\n⚠️ HTTP 200 但无图片数据");
      }
    } catch {
      console.log("\n⚠️ HTTP 200 但响应不是有效 JSON:", text.slice(0, 200));
    }
  } else if (status === 401 || status === 403) {
    console.error("\n❌ HTTP", status, "— Key 无权或无效");
  } else if (status === 429) {
    console.error("\n❌ HTTP 429 — 请求过于频繁");
  } else if (status >= 400) {
    console.error("\n❌ HTTP", status, "— 请求错误");
    // 尝试解析业务错误码
    try {
      const json = JSON.parse(text);
      if (json.base_resp) {
        console.error("业务错误码:", json.base_resp.status_code);
        console.error("业务错误信息:", json.base_resp.status_msg);
      }
    } catch {
      // 上面已经打印过 text
    }
  }
}

call();
