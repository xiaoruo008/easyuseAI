# n8n MCP 工具调用层 V1

> 版本：1.0.0
> 更新：2026-04-13
> 状态：设计底稿

---

## 1. 定位

MCP（Model Context Protocol）工具调用层负责：
- 作为 Hermes / 前端 与 n8n 工作流之间的**协议胶水层**
- 定义固定的 Webhook 请求格式和响应解析逻辑
- 不做业务决策，只做格式转换和错误归一化

---

## 2. 工具签名

### 2.1 核心工具

```
n8n_generate_image({
  session_id: string,
  type: ImageType,        // 枚举：main_white | model_photo | lifestyle | ...
  prompt: string,
  reference_image_url?: string,
  aspect_ratio?: "1:1" | "3:4" | "16:9",
  variables?: Record<string, string>,
})
```

### 2.2 返回结构

```typescript
interface N8nToolResult {
  success: boolean;
  data?: {
    image_url: string;
    thumbnail_url: string;
    provider: "minimax-cn" | "fallback";
    is_mock: boolean;
    type: ImageType;
    generated_at: string;
    latency_ms: number;
  };
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}
```

---

## 3. 请求构建规则

| 字段 | 来源 | 说明 |
|------|------|------|
| `session_id` | 必填，上游传入 | 用于日志串联 |
| `type` | 必填，上游传入 | 透传给 n8n Switch 路由 |
| `prompt` | 必填，上游 prompt | 服装描述文本 |
| `reference_image_url` | 可选 | 有则传，无则省略 |
| `aspect_ratio` | 可选，默认 1:1 | 透传 |
| `variables` | 可选 | 透传 prompt 变量 |

---

## 4. 响应归一化

| n8n 响应 | Hermes 看到 |
|---------|-----------|
| HTTP 200 + success=true | 正常图片 |
| HTTP 200 + isMock=true | 降级图片，标记 is_mock |
| HTTP 400 | 错误码 400，retryable=false |
| HTTP 500 / 网络异常 | 错误码 500，retryable=true |

---

## 5. 不做的事

- 不做 prompt 工程优化
- 不做模型选择
- 不做结果重排序
- 不缓存结果
