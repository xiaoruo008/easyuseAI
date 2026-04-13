/**
 * n8n 工作流配置底稿 V1
 * 
 * 本文件定义 n8n 工作流的节点配置结构（代码骨架，非完整 n8n JSON）
 * 实际 n8n 节点需在 n8n Editor UI 中搭建
 */

import type { ClothingImageType, WorkflowTypeDefinition } from "./workflow-types";

export interface WorkflowNodeConfig {
  name: string;
  type: "webhook" | "code" | "http_request" | "if" | "retry" | "respond" | "error" | "log";
  description: string;
  nextOnSuccess?: string;
  nextOnError?: string;
  config: Record<string, unknown>;
}

export interface WorkflowStage {
  stage: number;
  name: string;
  nodes: WorkflowNodeConfig[];
}

export interface WorkflowConfig {
  version: string;
  name: string;
  description: string;
  trigger: "webhook";
  stages: WorkflowStage[];
  globalVariables: Record<string, unknown>;
  errorHandling: {
    maxRetries: number;
    retryDelayMs: number;
    deadLetterAction: "log" | "respond_error" | "manual_review";
  };
}

// ─────────────────────────────────────────────
// n8n 工作流标准结构（V1）
// ─────────────────────────────────────────────

export const IMAGE_WORKFLOW_CONFIG: WorkflowConfig = {
  version: "1.0.0",
  name: "服装图片生成工作流",
  description: "接收服装图片生成请求 → 校验 → 路由 → 调用 MiniMax 生图 → 质检 → 重试/降级 → 返回结果",
  trigger: "webhook",
  globalVariables: {
    // 可通过 n8n Credentials 引用环境变量
    MINIMAX_IMAGE_BASE_URL: "https://api.minimaxi.com",
    MINIMAX_IMAGE_ENDPOINT: "/v1/image_generation",
    DEFAULT_ASPECT_RATIO: "1:1",
    DEFAULT_QUALITY: "high",
    TIMEOUT_MS: 60000,
    MAX_RETRIES: 2,
  },
  errorHandling: {
    maxRetries: 2,
    retryDelayMs: 5000,
    deadLetterAction: "log",
  },

  // ── 工作流阶段定义 ──────────────────────────
  stages: [
    // ── Stage 1: Webhook 触发 ───────────────
    {
      stage: 1,
      name: "Webhook 触发",
      nodes: [
        {
          name: "Webhook 接收",
          type: "webhook",
          description: "接收前端 POST 请求，包含 sessionId, type, prompt, referenceImageUrl 等",
          nextOnSuccess: "参数校验",
          config: {
            httpMethod: "POST",
            path: "image-generate",
            responseMode: "lastNode",
            options: {
              rawBody: false,
              timeouts: {
                maxResponseDuration: 120000,
              },
            },
          },
        },
      ],
    },

    // ── Stage 2: 参数校验 ──────────────────
    {
      stage: 2,
      name: "参数校验",
      nodes: [
        {
          name: "校验必填参数",
          type: "code",
          description: "检查 sessionId、type、prompt 是否存在，type 是否在支持列表中",
          nextOnSuccess: "类型路由",
          nextOnError: "返回 400 错误",
          config: {
            language: "javaScript",
            // 伪代码逻辑：
            // const { sessionId, type, prompt } = $input.item.json;
            // if (!sessionId || !type || !prompt) {
            //   throw new Error('缺少必填参数');
            // }
            // if (!SUPPORTED_TYPES.includes(type)) {
            //   throw new Error(`不支持的图片类型: ${type}`);
            // }
          },
        },
      ],
    },

    // ── Stage 3: 类型路由 ───────────────────
    {
      stage: 3,
      name: "类型路由",
      nodes: [
        {
          name: "Switch 类型分支",
          type: "if",
          description: "根据 type 分发到不同的处理分支",
          nextOnSuccess: "调用生图 API",
          nextOnError: "返回 400 错误",
          config: {
            dataType: "string",
            value1: "={{ $json.body.type }}",
            rules: {
              rules: [
                { operation: "equals", value2: "main_white" },
                { operation: "equals", value2: "model_photo" },
                { operation: "equals", value2: "lifestyle" },
              ],
              fallback: "default",
            },
            // Switch 节点输出：
            // output 0 → main_white
            // output 1 → model_photo
            // output 2 → lifestyle
            // output 3 (fallback) → 不支持的类型返回错误
          },
        },
      ],
    },

    // ── Stage 4: 调用生图 API ──────────────
    {
      stage: 4,
      name: "调用生图 API",
      nodes: [
        {
          name: "HTTP Request - MiniMax 生图",
          type: "http_request",
          description: "携带完整 prompt、type 参数、referenceImageUrl 调用 MiniMax 图像生成接口",
          nextOnSuccess: "质检节点",
          nextOnError: "重试/降级",
          config: {
            method: "POST",
            url: "={{ $env.MINIMAX_IMAGE_BASE_URL }}{{ $env.MINIMAX_IMAGE_ENDPOINT }}",
            authentication: "genericCredentialType",
            genericAuthType: "bearerAuth",
            sendHeaders: true,
            headers: {
              "Content-Type": "application/json",
              Authorization: "=Bearer {{ $env.MOCK_API_KEY }}",
            },
            sendBody: true,
            body: {
              // 动态从 session 或 type 配置中取
              model: "image-01",
              prompt: "={{ $json.resolvedPrompt }}",
              aspect_ratio: "={{ $json.aspectRatio }}",
              response_format: "url",
              n: 1,
              // referenceImageUrl（可选）
              ...(true && {
                subject_reference: [{
                  type: "character",
                  image_file: "={{ $json.referenceImageUrl }}",
                }],
              }),
            },
            options: {
              timeout: "={{ $env.TIMEOUT_MS }}",
              response: {
                response: {
                  responseFormat: "json",
                },
              },
            },
          },
        },
      ],
    },

    // ── Stage 5: 质检 ──────────────────────
    {
      stage: 5,
      name: "质检",
      nodes: [
        {
          name: "质检 - 检查图片URL",
          type: "code",
          description: "检查 API 返回的图片 URL 是否有效，非空且格式正确",
          nextOnSuccess: "Respond to Webhook（成功）",
          nextOnError: "重试/降级",
          config: {
            language: "javaScript",
            // 伪代码：
            // const imageUrl = $input.item.json.data?.image_urls?.[0];
            // if (!imageUrl || !imageUrl.startsWith('http')) {
            //   throw new Error('生成的图片URL无效');
            // }
            // return { imageUrl, thumbnailUrl: imageUrl, provider: 'minimax-cn' };
          },
        },
      ],
    },

    // ── Stage 6: 重试/降级 ──────────────────
    {
      stage: 6,
      name: "重试/降级",
      nodes: [
        {
          name: "Retry - 重试逻辑",
          type: "retry",
          description: "根据错误类型判断：超时 → 重试；参数问题 → 简化 prompt 重试；其他 → 降级",
          nextOnSuccess: "Respond to Webhook（成功）",
          nextOnError: "Respond to Webhook（降级结果）",
          config: {
            retries: "={{ $env.MAX_RETRIES }}",
            retryWaitTime: "={{ $env.RETRY_DELAY_MS }}",
            retryMaxWaitTime: 30000,
            errorWorkflow: undefined,
            // 重试策略：
            // 1. 超时错误 → 直接重试（最多2次）
            // 2. 业务错误码 2049 → 降级到 mock 图片
            // 3. prompt 过长 → 截断后重试
            // 4. 其他 → 记录日志后返回降级结果
          },
        },
        {
          name: "降级 - 返回 fallback",
          type: "code",
          description: "当重试耗尽或明确降级时，返回 fallback 图片或优雅错误",
          nextOnSuccess: "Respond to Webhook（降级结果）",
          config: {
            language: "javaScript",
            // fallbackStrategy 从 type 配置中读取
            // switch ($json.fallbackStrategy) {
            //   case 'mock_image':
            //     return { imageUrl: $json.mockImageUrl, isMock: true };
            //   case 'manual_review':
            //     return { status: 'pending_review', reason: '需要人工审核' };
            //   default:
            //     throw new Error('生成失败，请稍后重试');
            // }
          },
        },
      ],
    },

    // ── Stage 7: 响应 ───────────────────────
    {
      stage: 7,
      name: "返回结果",
      nodes: [
        {
          name: "Respond to Webhook - 成功",
          type: "respond",
          description: "返回生成的图片 URL 和元数据",
          config: {
            respondWith: "json",
            responseCode: 200,
            responseBody: {
              success: true,
              imageUrl: "={{ $json.imageUrl }}",
              thumbnailUrl: "={{ $json.thumbnailUrl }}",
              provider: "minimax-cn",
              type: "={{ $json.type }}",
              generatedAt: "={{ $now }}",
            },
          },
        },
        {
          name: "Respond to Webhook - 降级",
          type: "respond",
          description: "返回降级结果或错误",
          config: {
            respondWith: "json",
            responseCode: 200,
            responseBody: {
              success: true,
              imageUrl: "={{ $json.imageUrl }}",
              thumbnailUrl: "={{ $json.thumbnailUrl }}",
              provider: "fallback",
              isMock: true,
              type: "={{ $json.type }}",
              generatedAt: "={{ $now }}",
            },
          },
        },
        {
          name: "Respond to Webhook - 错误",
          type: "respond",
          description: "返回 400/500 错误",
          config: {
            respondWith: "json",
            responseCode: 400,
            responseBody: {
              success: false,
              error: "={{ $json.errorMessage }}",
              type: "={{ $json.type ?? 'unknown' }}",
            },
          },
        },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// n8n Credentials 配置参考
// ─────────────────────────────────────────────

export const N8N_CREDENTIALS_CONFIG = {
  miniMaxApiKey: {
    name: "MiniMax API Key",
    type: "genericCredentialType",
    displayName: "MiniMax API Key",
    fields: {
      token: {
        type: "string",
        displayName: "Bearer Token",
        // 生产环境通过 n8n Environment Variable 引用：
        // {{ $env.MINIMAX_API_KEY }}
        default: "",
      },
    },
  },
};

// ─────────────────────────────────────────────
// 辅助函数
// ─────────────────────────────────────────────

/**
 * 根据 type 获取对应的工作流分支配置
 * 用于在 n8n Switch 节点之后选择正确的处理路径
 */
export function getWorkflowBranchConfig(type: ClothingImageType): {
  outputIndex: number;
  description: string;
} {
  const branchMap: Record<ClothingImageType, { outputIndex: number; description: string }> = {
    main_white:       { outputIndex: 0, description: "白底主图分支" },
    model_photo:      { outputIndex: 1, description: "模特上身图分支" },
    lifestyle:        { outputIndex: 2, description: "场景种草图分支" },
    hero_branded:     { outputIndex: 3, description: "官网品牌图分支" },
    detail_closeup:   { outputIndex: 4, description: "细节特写图分支" },
    packaging_flat:   { outputIndex: 5, description: "包装平铺图分支" },
    compare_beforeafter: { outputIndex: 6, description: "前后对比图分支" },
    color_variant:    { outputIndex: 7, description: "颜色变体图分支" },
    size_guide:       { outputIndex: 8, description: "尺码参考图分支" },
    background_swap:  { outputIndex: 9, description: "背景替换图分支" },
    ghost_mannequin:  { outputIndex: 10, description: "幽灵模特图分支" },
    social_media:     { outputIndex: 11, description: "社交媒体配图分支" },
  };

  return branchMap[type] ?? { outputIndex: 99, description: "未知类型" };
}

/**
 * 输出 n8n workflow JSON 结构的伪代码
 * 实际完整 JSON 需在 n8n Editor 中生成
 */
export function generateN8nWorkflowJson(): Record<string, unknown> {
  // 这里是简化版伪结构，实际使用时需要在 n8n Editor UI 中搭建
  // n8n workflow JSON 结构示例：
  return {
    name: IMAGE_WORKFLOW_CONFIG.name,
    nodes: [],
    connections: {},
    settings: {
      executionOrder: "v1",
    },
    staticData: null,
    tags: [],
  };
}
