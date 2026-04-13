/**
 * Gemini Nano Banana 图片生成 Provider（正确调用方式）
 *
 * 已验证的接口格式：
 *   POST /v1beta/models/{model}:generateContent
 *   Body: { contents: { parts: [text] }, generationConfig: { responseModalities: ["TEXT","IMAGE"] } }
 *   响应: candidates[0].content.parts[] 遍历，找 inlineData
 *
 * 模型：
 *   gemini-3.1-flash-image-preview（高吞吐，限流时返回429）
 *   gemini-3-pro-image-preview（高质量，限流时返回429）
 *
 * 错误码：
 *   429 → 配额用尽（当前免费key的情况）
 *   404 → 模型不存在
 *   400 "paid plans" → Imagen需要付费
 */

import type { ImageProvider } from "../provider";
import type { ImageTaskInput, ImageTaskOutput } from "../types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image-preview";

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64
  };
}

interface GeminiContent {
  parts: GeminiPart[];
}

interface GeminiCandidate {
  content?: GeminiContent;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: {
    code: number;
    message: string;
  };
}

export class GeminiNanobananaProvider implements ImageProvider {
  name = "gemini-nanobanana";

  async generate(input: ImageTaskInput): Promise<ImageTaskOutput> {
    if (!GEMINI_API_KEY) {
      throw new Error(
        "[Gemini] GEMINI_API_KEY 未配置。" +
          " 请在 .env 中设置 GEMINI_API_KEY。" +
          " 获取 Key：https://aistudio.google.com"
      );
    }

    console.log("[Gemini] 生成请求");
    console.log("  provider:     gemini-nanobanana");
    console.log("  model:       ", IMAGE_MODEL);
    console.log("  type:        ", input.type);
    console.log("  aspectRatio: ", input.aspectRatio ?? "1:1");
    console.log("  hasReference:", !!input.referenceImageUrl);

    // ── 构造请求体 ──────────────────────────────
    const parts: GeminiPart[] = [{ text: input.prompt }];

    // 如果有参考图，添加 base64 图片
    if (input.referenceImageUrl) {
      try {
        const refRes = await fetch(input.referenceImageUrl);
        if (refRes.ok) {
          const refBuf = await refRes.arrayBuffer();
          const refBase64 = Buffer.from(refBuf).toString("base64");
          parts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: refBase64,
            },
          });
          console.log("  referenceImage: 已添加（base64）");
        } else {
          console.log("  referenceImage: 获取失败（HTTP", refRes.status + "），跳过");
        }
      } catch (e) {
        console.log("  referenceImage: 获取异常（", (e as Error).message + "），跳过");
      }
    }

    const body = {
      contents: { parts },
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"] as string[],
      },
    };

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent` +
      `?key=${GEMINI_API_KEY}`;

    // ── 发送请求 ────────────────────────────────
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Gemini] 网络错误:", msg);
      throw new Error(`[Gemini] 网络请求失败：${msg}`);
    }

    const status = res.status;
    let rawText = "";
    try {
      rawText = await res.text();
    } catch {
      rawText = "(无法读取响应体)";
    }

    console.log("[Gemini] HTTP 状态:", status);
    if (rawText) console.log("[Gemini] 响应前200字:", rawText.slice(0, 200));

    // ── 错误码解析 ────────────────────────────
    if (status !== 200) {
      let errMsg = `[Gemini] HTTP ${status}`;

      try {
        const errJson = JSON.parse(rawText) as GeminiResponse;
        if (errJson.error) {
          const code = errJson.error.code;
          const msg = errJson.error.message ?? "";

          if (status === 429) {
            errMsg =
              `[Gemini] ⚠️ 配额用尽（HTTP 429）。` +
              ` 免费 key 图片额度已用完，请升级或等待重置。` +
              ` 模型：${IMAGE_MODEL}`;
          } else if (msg.includes("paid plans") || msg.includes("upgrade your account")) {
            errMsg =
              `[Gemini] ⚠️ ${IMAGE_MODEL} 需要付费计划。` +
              ` 当前 key 无此模型权限。`;
          } else if (status === 404) {
            errMsg = `[Gemini] 模型 ${IMAGE_MODEL} 不存在（HTTP 404）。` +
              ` 请检查 GEMINI_IMAGE_MODEL 配置。`;
          } else {
            errMsg = `[Gemini] HTTP ${status}（code ${code}）：${msg}`;
          }
        }
      } catch {
        errMsg = `[Gemini] HTTP ${status}：${rawText.slice(0, 100)}`;
      }

      console.error(errMsg);
      throw new Error(errMsg);
    }

    // ── 解析响应 ──────────────────────────────
    let json: GeminiResponse;
    try {
      json = JSON.parse(rawText) as GeminiResponse;
    } catch {
      throw new Error(`[Gemini] 响应 JSON 解析失败：${rawText.slice(0, 100)}`);
    }

    if (json.error) {
      throw new Error(`[Gemini] 错误（code ${json.error.code}）：${json.error.message}`);
    }

    // 遍历 parts，找 inlineData（图片）
    const responseParts = json.candidates?.[0]?.content?.parts ?? [];
    let imageBase64 = "";
    for (const part of responseParts) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        imageBase64 = part.inlineData.data;
        console.log("[Gemini] 找到图片 part，mimeType:", part.inlineData.mimeType);
        break;
      }
    }

    if (!imageBase64) {
      // 没有图片 part，说明当前模型不支持图片输出（但请求是成功的）
      console.warn("[Gemini] 响应中无图片 part。当前模型可能不支持图片输出。");
      const partsSummary = responseParts.map((p) => ({ hasText: Boolean(p.text), hasInline: Boolean(p.inlineData) }));
      console.warn("[Gemini] parts 内容:", JSON.stringify(partsSummary));
      throw new Error(
        `[Gemini] 模型 ${IMAGE_MODEL} 返回了文本但未返回图片。` +
          ` 当前 key 可能无权使用此模型生成图片，或模型不支持图片输出。` +
          ` 建议升级到付费计划或切换模型。`
      );
    }

    const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
    console.log("[Gemini] ✅ 生成成功（base64，长度:", imageBase64.length + ")");

    return {
      imageUrl,
      thumbnailUrl: imageUrl,
      provider: "gemini-nanobanana",
      model: IMAGE_MODEL,
      generatedAt: new Date().toISOString(),
    };
  }
}
