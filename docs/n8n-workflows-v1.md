# n8n 服装图片生成工作流 V1

> 版本：1.0.0
> 更新：2026-04-13
> 状态：配置底稿，待 n8n Editor 搭建验证

---

## 1. 工作流总览

```
Webhook → 校验 → 类型路由 → 调生图 → 质检 → 重试/降级 → Respond to Webhook
```

### 1.1 触发方式

- **触发类型**：Webhook（POST）
- **端点路径**：`/webhook/image-generate`
- **认证方式**：Bearer Token（在 Header 中传递）

### 1.2 请求格式

```json
{
  "sessionId": "sess_xxxx",
  "type": "main_white",
  "prompt": "深蓝色羊毛大衣，英伦风格",
  "referenceImageUrl": "https://...",
  "aspectRatio": "1:1",
  "variables": {
    "scene_type": "cozy coffee shop",
    "target_color": "navy blue"
  }
}
```

### 1.3 响应格式

```json
{
  "success": true,
  "imageUrl": "https://...",
  "thumbnailUrl": "https://...",
  "provider": "minimax-cn",
  "type": "main_white",
  "generatedAt": "2026-04-13T..."
}
```

---

## 2. 节点详解

### Stage 1｜Webhook 接收

| 字段 | 值 |
|------|-----|
| 节点类型 | Webhook |
| HTTP 方法 | POST |
| 路径 | `image-generate` |
| 响应模式 | 最后一节点 |
| 超时 | 120s（API 生图耗时约 10-35s） |

### Stage 2｜参数校验

```
必填：sessionId, type, prompt
可选：referenceImageUrl, aspectRatio, variables
```

- `type` 必须在 `SUPPORTED_TYPES` 列表中（12 种）
- `prompt` 最多 1500 字
- `referenceImageUrl` 如果提供，必须是有效 URL

### Stage 3｜类型路由（Switch）

根据 `type` 分发到不同分支：

| type | 分支输出 | 说明 |
|------|---------|------|
| `main_white` | Output 0 | 白底主图 |
| `model_photo` | Output 1 | 模特上身图 |
| `lifestyle` | Output 2 | 场景种草图 |
| `hero_branded` | Output 3 | 官网品牌图 |
| `detail_closeup` | Output 4 | 细节特写图 |
| `packaging_flat` | Output 5 | 包装平铺图 |
| `compare_beforeafter` | Output 6 | 前后对比图 |
| `color_variant` | Output 7 | 颜色变体图 |
| `size_guide` | Output 8 | 尺码参考图 |
| `background_swap` | Output 9 | 背景替换图 |
| `ghost_mannequin` | Output 10 | 幽灵模特图 |
| `social_media` | Output 11 | 社交媒体配图 |
| 其他 | Fallback | 返回 400 错误 |

### Stage 4｜调用生图 API

- **Provider**：MiniMax 国内版（`api.minimaxi.com`）
- **模型**：`image-01`
- **认证**：Bearer Token
- **超时**：60s（AbortSignal）

#### 请求 Body 构建

```json
{
  "model": "image-01",
  "prompt": "<resolved prompt>",
  "aspect_ratio": "<from type config>",
  "response_format": "url",
  "n": 1,
  "subject_reference": [
    {
      "type": "character",
      "image_file": "<referenceImageUrl if provided>"
    }
  ]
}
```

### Stage 5｜质检

检查项：
1. HTTP 状态码 = 200
2. 业务状态码 `base_resp.status_code` = 0
3. `data.image_urls` 非空
4. URL 格式正确（以 http 开头）

### Stage 6｜重试/降级策略

| 错误类型 | 策略 | 最大重试 |
|---------|------|---------|
| 网络超时 | 等待 5s 重试 | 2 次 |
| HTTP 429（限流） | 等待 30s 重试 | 2 次 |
| 业务错误码 2049（无权限） | 降级到 fallback | 不重试 |
| 其他 HTTP 错误 | 简化 prompt 重试 | 1 次 |
| 质检失败（图为空/URL无效） | 等待 5s 重试 | 2 次 |

#### 降级输出（Fallback）

当所有重试失败后：

```json
{
  "success": true,
  "imageUrl": "/images/fallback/<type>-default.jpg",
  "thumbnailUrl": "/images/fallback/<type>-default.jpg",
  "provider": "fallback",
  "isMock": true,
  "type": "<type>"
}
```

### Stage 7｜Respond to Webhook

| 场景 | HTTP Code | success |
|------|----------|---------|
| 正常返回 | 200 | true |
| 降级返回 | 200 | true |
| 参数校验失败 | 400 | false |
| 服务端错误 | 500 | false |

---

## 3. 12 种服装图片类型

### 3.1 白底主图 `main_white`

**场景**：淘宝/京东/抖音商品详情页主图

| 字段 | 值 |
|------|-----|
| 输入要求 | 服装原图，≥600×600，无严重褶皱 |
| 目标效果 | 纯白背景（RGB 255,255,255），服装清晰，边缘平滑 |
| 尺寸比例 | 1:1 |
| 输出规格 | 1024×1024，JPG，无水印 |
| Fallback | 重试 2 次后返回 fallback |

**Prompt 要点**：
> clean pure white seamless background, centered composition, bright studio lighting, crisp fabric texture visible, no shadows on background

**Negative Prompt**：
> grey background, off-white, colored background, shadow, mannequin, text, watermark

---

### 3.2 模特上身图 `model_photo`

**场景**：详情页场景化展示

| 字段 | 值 |
|------|-----|
| 输入要求 | 服装原图，≥800×1000，建议正面穿着图 |
| 目标效果 | 自然生活场景，模特真实，服装质感好 |
| 尺寸比例 | 3:4 |
| 输出规格 | 1024×1366，JPG，无水印 |
| Fallback | 降低 quality 重试 |

**Prompt 要点**：
> natural warm studio lighting, upper-body or full-body shot, realistic human proportions, authentic pose, clean background or lifestyle context

**Negative Prompt**：
> cartoon, anime, 3d render, mannequin, ugly, deformed, extra limbs, blurry, flat lay

---

### 3.3 场景种草图 `lifestyle`

**场景**：小红书/抖音/Instagram 种草

| 字段 | 值 |
|------|-----|
| 输入要求 | 服装原图，≥800×800，可选场景类型 |
| 目标效果 | 有故事感氛围感，光线有层次，色调统一 |
| 尺寸比例 | 3:4 |
| 输出规格 | 1024×1366，JPG，无水印 |
| Fallback | 重试 1 次后返回默认 fallback 图 |

**Prompt 要点**：
> beautiful lifestyle photography, warm natural lighting, golden hour aesthetic, fashion editorial quality, Instagram-worthy composition

**Negative Prompt**：
> cartoon, anime, mannequin, ugly, deformed, blurry, harsh shadows, cluttered background, bad composition

---

### 3.4 其他 9 种类型（V1 预留）

| type | label | 状态 | 说明 |
|------|-------|------|------|
| `hero_branded` | 官网品牌图 | 预留 | 品牌感强的大片 |
| `detail_closeup` | 细节特写图 | 预留 | 面料/纽扣/刺绣特写 |
| `packaging_flat` | 包装平铺图 | 预留 | 俯视平铺展示 |
| `compare_beforeafter` | 前后对比图 | 预留 | 原图与效果图对比 |
| `color_variant` | 颜色变体图 | 预留 | 同款多色展示 |
| `size_guide` | 尺码参考图 | 预留 | 不需要输入图 |
| `background_swap` | 背景替换图 | 预留 | 换背景场景 |
| `ghost_mannequin` | 幽灵模特图 | 预留 | 隐约人体轮廓 |
| `social_media` | 社交媒体配图 | 预留 | 小红书/抖音配图 |

---

## 4. 不接入的模块

| 模块 | 原因 |
|------|------|
| 支付 | 不在本次 V1 范围 |
| CRM / 飞书 | 不在本次 V1 范围 |
| 图片存储（OSS） | V1 直接返回 MiniMax URL，前端处理 |
| 用户管理系统 | 依赖现有 session 机制 |
| 日志系统 | n8n 内置执行日志即可 |

---

## 5. 环境变量（n8n Credentials）

```bash
MINIMAX_API_KEY=sk-xxxx
MINIMAX_IMAGE_BASE_URL=https://api.minimaxi.com
MINIMAX_IMAGE_ENDPOINT=/v1/image_generation
TIMEOUT_MS=60000
MAX_RETRIES=2
```

---

## 6. 下一步

- [ ] 在 n8n Editor UI 中搭建完整工作流
- [ ] 配置 MiniMax API Credentials
- [ ] 配置 Webhook 测试端点
- [ ] 联调前端 `/api/execute/generate` 与 n8n Webhook
- [ ] 验证 3 个核心类型的生图效果
- [ ] 添加监控和告警（可选）

---

## 附录 A：n8n 工作流 JSON 结构

> 完整 JSON 需在 n8n Editor UI 中导出，以下为结构参考

```json
{
  "name": "服装图片生成工作流",
  "nodes": [
    {
      "name": "Webhook 接收",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [0, 0],
      "parameters": {}
    },
    {
      "name": "参数校验",
      "type": "n8n-nodes-base.code",
      "position": [200, 0]
    },
    {
      "name": "Switch 类型分支",
      "type": "n8n-nodes-base.switch",
      "position": [400, 0]
    },
    {
      "name": "MiniMax 生图",
      "type": "n8n-nodes-base.httpRequest",
      "position": [600, 0]
    },
    {
      "name": "质检",
      "type": "n8n-nodes-base.code",
      "position": [800, 0]
    },
    {
      "name": "Respond 成功",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1000, -100]
    },
    {
      "name": "Respond 降级",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1000, 0]
    }
  ],
  "connections": {},
  "settings": {
    "executionOrder": "v1"
  }
}
```

## 附录 B：Prompt 变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| `{{garment_description}}` | 服装描述（核心） | "深蓝色双排扣羊毛大衣" |
| `{{scene_type}}` | 场景类型（lifestyle 用） | "cozy coffee shop" |
| `{{target_color}}` | 目标颜色（color_variant 用） | "navy blue" |
| `{{clothing_category}}` | 服装品类（size_guide 用） | "casual top" |
| `{{target_scene}}` | 目标场景（background_swap 用） | "minimal white studio" |
