/**
 * 案例图下载与长期存储脚本
 *
 * 功能：
 * 1. 下载当前案例图（来自 MiniMax OSS 临时 URL）
 * 2. 上传到 Supabase Storage（永久 CDN URL）
 * 3. 输出新的永久 URL 并提示更新位置
 *
 * 运行: npx tsx scripts/fetch-and-store-cases.ts
 *
 * 需要环境变量：
 *   SUPABASE_URL（格式：https://xxx.supabase.co）
 *   SUPABASE_SERVICE_KEY（service_role key，在 Supabase 设置页面获取）
 *
 * 可选：
 *   如果未配置上面两个，则只验证 URL 是否有效，不上传
 */

import "dotenv/config";
import { writeFileSync } from "fs";
import { join } from "path";

// ── 配置 ──────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";

const CASES = [
  {
    id: "bg-swap",
    label: "换背景",
    url: "https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output/talkie/prod/img/2026-04-06/41ad8621-9a77-47fe-b86f-d59d858a4eb4_aigc.jpeg",
    filename: "case-bg-swap.jpg",
  },
  {
    id: "enhance",
    label: "商品精修",
    url: "https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output/talkie/prod/img/2026-04-06/c72a247d-40f1-4450-92cb-508f9e0ce571_aigc.jpeg",
    filename: "case-enhance.jpg",
  },
  {
    id: "model",
    label: "模特图",
    url: "https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output/talkie/prod/img/2026-04-06/26eb81a0-3236-4dd2-94b5-d5ad71ac0fea_aigc.jpeg",
    filename: "case-model.jpg",
  },
  {
    id: "lifestyle",
    label: "场景图",
    url: "https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output/talkie/prod/img/2026-04-06/acf39caa-e765-40f0-be9a-8d84120a2268_aigc.jpeg",
    filename: "case-lifestyle.jpg",
  },
];

// ── 诊断 ──────────────────────────────────────────────
console.log("═══ 案例图下载与存储脚本 ═══");
console.log("Supabase URL:", SUPABASE_URL ? "✓ 已配置" : "✗ 未配置（只验证，不上传）");
console.log("Supabase Key:", SUPABASE_SERVICE_KEY ? "✓ 已配置" : "✗ 未配置");

if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  console.log("\n将下载并上传到 Supabase Storage...");
} else {
  console.log("\n未配置 Supabase Storage，只验证图片 URL 有效性...");
}

// ── 下载单张图片 ──────────────────────────────────────
async function downloadImage(url: string): Promise<ArrayBuffer> {
  console.log(`  下载: ${url.slice(0, 60)}...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`下载失败 HTTP ${res.status}`);
  }
  return res.arrayBuffer();
}

// ── 上传到 Supabase Storage ─────────────────────────────
async function uploadToSupabase(
  bucket: string,
  filename: string,
  data: ArrayBuffer,
  contentType: string
): Promise<string> {
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${filename}`;

  console.log(`  上传至 Supabase: ${filename}`);

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": contentType,
    },
    body: data,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`上传失败 HTTP ${res.status}: ${text}`);
  }

  // 返回公开访问 URL
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
  return publicUrl;
}

// ── 验证图片 URL ───────────────────────────────────────
async function validateUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

// ── 主流程 ────────────────────────────────────────────
async function main() {
  const results: Array<{
    id: string;
    label: string;
    originalUrl: string;
    storedUrl: string;
    ok: boolean;
    method: string;
  }> = [];

  for (const c of CASES) {
    console.log(`\n处理: ${c.label} (${c.id})`);

    let storedUrl = "";
    let ok = false;
    let method = "";

    try {
      // ① 先验证原 URL 是否还可用
      const stillValid = await validateUrl(c.url);
      if (!stillValid) {
        console.log(`  ⚠️  原 URL 已失效（403/404），需要重新生成`);
        storedUrl = "";
        ok = false;
        method = "expired";
      } else if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        // 无 Storage 配置，跳过上传
        storedUrl = c.url;
        ok = true;
        method = "original";
        console.log(`  ✓ 原 URL 有效（未上传到永久存储）`);
      } else {
        // ② 下载图片
        const imageData = await downloadImage(c.url);

        // ③ 上传到 Supabase Storage
        storedUrl = await uploadToSupabase(
          "cases",
          c.filename,
          imageData,
          "image/jpeg"
        );
        ok = true;
        method = "supabase";
        console.log(`  ✅ 已上传，永久 URL: ${storedUrl}`);
      }
    } catch (err) {
      console.log(`  ❌ 失败: ${(err as Error).message}`);
      storedUrl = c.url;
      ok = false;
      method = "original-fallback";
    }

    results.push({
      id: c.id,
      label: c.label,
      originalUrl: c.url,
      storedUrl,
      ok,
      method,
    });
  }

  // ── 输出结果 ─────────────────────────────────────
  console.log("\n\n═══ 结果 ═══");
  const successCount = results.filter((r) => r.ok).length;
  console.log(`成功: ${successCount}/${results.length}\n`);

  for (const r of results) {
    const mark = r.ok ? "✅" : "⚠️ ";
    console.log(`${mark} ${r.label}`);
    console.log(`   存储方式: ${r.method}`);
    console.log(`   原URL: ${r.originalUrl.split("?")[0]}`);
    if (r.storedUrl && r.storedUrl !== r.originalUrl) {
      console.log(`   永久URL: ${r.storedUrl.split("?")[0]}`);
    }
    console.log("");
  }

  // ── 输出更新数据 ─────────────────────────────────
  console.log("═══ 更新 homepage 数据 ═══\n");
  const permanentCases = results.filter(
    (r) => r.ok && r.storedUrl && r.storedUrl !== r.originalUrl
  );

  if (permanentCases.length > 0) {
    console.log("// 新的永久 URL，复制到 app/page.tsx：\n");
    for (const r of permanentCases) {
      const key = `AFTER_${r.id.toUpperCase().replace("-", "_")}_URL`;
      console.log(`const ${key} =`);
      console.log(`  "${r.storedUrl}";\n`);
    }
  } else if (results.every((r) => r.ok)) {
    console.log("// 所有图片 URL 仍然有效（无需更新）");
  } else {
    console.log("// 以下图片需要重新生成：");
    for (const r of results.filter((r) => !r.ok)) {
      console.log(`// ${r.label} (${r.id}): ${r.originalUrl.split("?")[0]}`);
    }
  }
}

main().catch(console.error);
