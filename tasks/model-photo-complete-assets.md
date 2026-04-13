# 模特上身图 (model_photo) - 完整资产配置文档

更新时间：2026-04-12

## 文档说明

本文档围绕**模特上身图**功能，整理所有低风险辅助资产，包括：
- 拍摄引导文案
- 错误提示文案
- Prompt 与 Negative Prompt 草稿
- n8n Workflow JSON 草稿
- 字段说明

**不涉及**：核心 API 逻辑、数据库结构、支付逻辑

---

## 1. 拍摄引导文案

### 1.1 通用版（所有模特图）

```
📸 如何拍摄原图？

✅ 推荐方式
· 平铺拍摄：衣服展平在干净桌面或地面
· 悬挂拍摄：用衣架挂起，展现自然垂坠感
· 对折摆放：展现正面设计，注意对称

✅ 光线要求
· 选择明亮的室内或自然光
· 避免强烈阴影和反光
· 阴天光线最柔和均匀

✅ 角度建议
· 正面拍摄，保持水平
· 展现完整正面（领口到袖口）
· 避免倾斜和变形

✅ 细节注意
· 领口、袖口、下摆清晰可见
· 衣服展平，减少褶皱
· 纽扣/拉链/图案等细节完整

❌ 避免事项
· 不要折叠或揉成一团
· 不要有强烈阴影
· 不要背景过于杂乱
· 不要只拍局部特写
```

### 1.2 女装上衣模特图专用

```
👚 女装上衣 - 拍摄要点

推荐拍法：
1. 平铺在浅色床单或桌布上
2. 用衣架挂起，自然垂坠
3. 可简单搭配项链或包包（可选）

光线建议：
· 上午 10 点或下午 3 点的自然光最佳
· 避免正午强烈阳光
· 室内可用两盏台灯从两侧打光

角度参考：
· 正面 90 度，保持水平
· 展现领口设计（圆领/V 领/方领）
· 展现袖口细节（长袖/短袖/无袖）
· 展现下摆长度和版型

示例描述：
「这件白色衬衫正面平铺图，想做成年轻女性模特上身效果，
用于小红书种草，希望模特自然微笑，背景简洁」
```

### 1.3 女装连衣裙模特图专用

```
👗 女装连衣裙 - 拍摄要点

推荐拍法：
1. 悬挂拍摄，展现整体版型和裙摆
2. 平铺拍摄，裙摆自然展开
3. 可搭配腰带或配饰（可选）

光线建议：
· 柔和的自然光最佳
· 避免强烈直射光造成阴影
· 室内可用柔光箱或白炽灯

角度参考：
· 正面 90 度，展现整体版型
· 注意腰线位置和裙摆长度
· 展现领口和袖口设计
· 裙摆自然展开，无褶皱

示例描述：
「这条蓝色连衣裙悬挂图，裙摆自然展开，
想做成模特上身效果，用于详情页，希望模特优雅站姿，
背景干净简洁」
```

### 1.4 男装套装模特图专用

```
👔 男装套装 - 拍摄要点

推荐拍法：
1. 悬挂拍摄，展现西装版型
2. 平铺拍摄，左右对称展平
3. 可搭配领带或口袋巾（可选）

光线建议：
· 均匀柔和的光线
· 避免强烈阴影
· 展现面料质感

角度参考：
· 正面 90 度，左右对称
· 展现领口（平驳领/戗驳领）
· 展现纽扣和口袋细节
· 袖子自然摆放

示例描述：
「这套灰色西装正面悬挂图，想做成商务男士模特上身效果，
用于亚马逊主图，希望模特自信站姿，背景纯白」
```

---

## 2. 错误提示文案

### 2.1 输入验证错误

```javascript
const MODEL_PHOTO_INPUT_ERRORS = {
  // 图片格式错误
  invalid_image_format: {
    title: "图片格式不支持",
    message: "请上传 JPG 或 PNG 格式的图片。其他格式（如 HEIC、WebP）请先转换后上传。",
    action: "重新选择图片"
  },
  
  // 图片太大
  image_too_large: {
    title: "图片文件过大",
    message: "图片大小超过 10MB 限制。请压缩后重新上传，或使用手机拍摄较小分辨率版本。",
    action: "重新选择图片"
  },
  
  // 图片太小
  image_too_small: {
    title: "图片分辨率过低",
    message: "图片分辨率低于 800x600，可能影响生成效果。请上传更清晰的图片。",
    action: "重新选择图片"
  },
  
  // 未上传图片
  no_image_uploaded: {
    title: "请先上传原图",
    message: "模特图生成需要一张服装原图作为参考。请平铺或悬挂拍摄后上传。",
    action: "上传图片"
  },
  
  // 提示词为空
  prompt_empty: {
    title: "请描述你想要的效果",
    message: "简单描述模特姿势、风格或使用场景，可以帮助 AI 更好理解你的需求。",
    action: "填写描述"
  },
  
  // 提示词过长
  prompt_too_long: {
    title: "描述太长了",
    message: "提示词请控制在 500 字以内。简洁清晰的描述效果更好。",
    action: "精简描述"
  }
};
```

### 2.2 生成过程错误

```javascript
const MODEL_PHOTO_GENERATION_ERRORS = {
  // 超时错误
  timeout: {
    title: "生成超时",
    message: "图片生成时间较长，可能是网络波动或 AI 服务繁忙。建议稍等 1 分钟后重试。",
    action: "重试",
    severity: "warning"
  },
  
  // 次数用完
  quota_exhausted: {
    title: "免费次数已用完",
    message: "感谢你体验我们的服务！免费次数已用完，你可以：1) 留下联系方式获取 3 张免费券；2) 付费解锁继续制作。",
    action: "获取免费券",
    severity: "info"
  },
  
  // 提示词敏感
  prompt_sensitive: {
    title: "提示词包含敏感内容",
    message: "你的描述可能包含不适当的内容。请简化描述或使用预设模板。",
    action: "使用预设模板",
    severity: "warning"
  },
  
  // AI 服务不可用
  ai_service_unavailable: {
    title: "AI 服务暂时不可用",
    message: "图片生成服务暂时繁忙，请稍后再试。如多次失败，请联系客服协助。",
    action: "稍后重试",
    severity: "error"
  },
  
  // 生成失败（未知原因）
  generation_failed: {
    title: "生成失败",
    message: "图片生成时遇到未知错误。请检查原图质量后重试，或联系客服协助。",
    action: "重试",
    severity: "error"
  },
  
  // 参考图质量问题
  reference_quality_low: {
    title: "原图质量不佳",
    message: "上传的原图可能过于模糊或光线不足，影响生成效果。建议重新拍摄清晰图片。",
    action: "重新上传",
    severity: "warning"
  }
};
```

### 2.3 错误提示 UI 组件文案

```javascript
// 错误提示框（红色）
{error && (
  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
    <div className="flex items-start gap-3">
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-800">{error.title}</p>
        <p className="text-xs text-red-700 mt-1">{error.message}</p>
      </div>
      <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
)}

// 警告提示框（黄色）
{warning && (
  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
    <div className="flex items-start gap-3">
      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-800">{warning.title}</p>
        <p className="text-xs text-amber-700 mt-1">{warning.message}</p>
      </div>
    </div>
  </div>
)}

// 信息提示框（蓝色）
{info && (
  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div className="flex items-start gap-3">
      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-semibold text-blue-800">{info.title}</p>
        <p className="text-xs text-blue-700 mt-1">{info.message}</p>
      </div>
    </div>
  </div>
)}
```

---

## 3. Prompt 与 Negative Prompt 模板

### 3.1 女装上衣模特图

```json
{
  "type": "domestic_womenswear_top_model",
  "label": "国内女装上衣·模特图",
  "prompt": {
    "base": "Professional fashion model photography of woman wearing casual top blouse",
    "shot": "half body shot, natural relaxed pose",
    "lighting": "soft natural lighting, lifestyle aesthetic",
    "background": "clean minimalist background",
    "style": "commercial fashion style, xiaohongshu aesthetic",
    "details": "natural fabric draping, realistic body proportions, sharp focus on garment details, feminine elegance",
    "full": "Professional fashion model photography of woman wearing casual top blouse, half body shot, natural relaxed pose, soft natural lighting, lifestyle aesthetic, clean minimalist background, commercial fashion style, xiaohongshu aesthetic, natural fabric draping, realistic body proportions, sharp focus on garment details, feminine elegance"
  },
  "negative_prompt": {
    "base": "no distorted proportions, no unnatural poses",
    "specific": [
      "no heavy makeup or filters",
      "no wrinkled fabric",
      "no cluttered background",
      "no dull colors",
      "no stiff poses",
      "no facial features focus"
    ],
    "full": "no distorted proportions, no unnatural poses, no heavy makeup or filters, no wrinkled fabric, no cluttered background, no dull colors, no stiff poses, no facial features focus"
  },
  "params": {
    "aspectRatio": "3:4",
    "model": "image-01",
    "quality": "high",
    "style": "lifestyle"
  }
}
```

### 3.2 女装连衣裙模特图

```json
{
  "type": "domestic_womenswear_dress_model",
  "label": "国内女装连衣裙·模特图",
  "prompt": {
    "base": "Professional fashion model photography of woman wearing elegant dress",
    "shot": "full body shot, elegant natural pose",
    "lighting": "soft studio lighting with soft key light",
    "background": "clean minimalist background",
    "style": "commercial fashion aesthetic",
    "details": "natural fabric draping, realistic body proportions, sharp focus on garment details, feminine grace, flowing skirt movement",
    "full": "Professional fashion model photography of woman wearing elegant dress, full body shot, elegant natural pose, soft studio lighting with soft key light, clean minimalist background, commercial fashion aesthetic, natural fabric draping, realistic body proportions, sharp focus on garment details, feminine grace, flowing skirt movement"
  },
  "negative_prompt": {
    "base": "no distorted proportions, no unnatural poses",
    "specific": [
      "no facial features focus",
      "no wrinkled fabric",
      "no cluttered background",
      "no dull colors",
      "no stiff poses",
      "no flat lighting"
    ],
    "full": "no distorted proportions, no unnatural poses, no facial features focus, no wrinkled fabric, no cluttered background, no dull colors, no stiff poses, no flat lighting"
  },
  "params": {
    "aspectRatio": "3:4",
    "model": "image-01",
    "quality": "high",
    "style": "fashion"
  }
}
```

### 3.3 男装套装模特图

```json
{
  "type": "domestic_menswear_suit_set_model",
  "label": "国内男装套装·模特图",
  "prompt": {
    "base": "Professional fashion model photography of man wearing business suit",
    "shot": "full body shot, confident professional pose",
    "lighting": "studio lighting with soft key light",
    "background": "clean white or light gray background",
    "style": "commercial e-commerce style",
    "details": "natural fabric draping, realistic body proportions, sharp focus, masculine confidence",
    "full": "Professional fashion model photography of man wearing business suit, full body shot, confident professional pose, studio lighting with soft key light, clean white or light gray background, commercial e-commerce style, natural fabric draping, realistic body proportions, sharp focus, masculine confidence"
  },
  "negative_prompt": {
    "base": "no casual poses, no wrinkled suit",
    "specific": [
      "no distracting background",
      "no unnatural proportions",
      "no lifestyle setting",
      "no relaxed posture",
      "no facial features focus",
      "no harsh shadows"
    ],
    "full": "no casual poses, no wrinkled suit, no distracting background, no unnatural proportions, no lifestyle setting, no relaxed posture, no facial features focus, no harsh shadows"
  },
  "params": {
    "aspectRatio": "3:4",
    "model": "image-01",
    "quality": "high",
    "style": "commercial"
  }
}
```

### 3.4 跨境女装上衣模特图

```json
{
  "type": "cross_border_womenswear_top_model",
  "label": "跨境女装上衣·模特图",
  "prompt": {
    "base": "Professional lifestyle model photography of woman wearing casual top",
    "shot": "half body shot, relaxed natural pose",
    "lighting": "warm natural lighting",
    "background": "clean minimalist background",
    "style": "international e-commerce style",
    "details": "diverse model representation, sharp focus on garment details, natural fabric draping, realistic body proportions",
    "full": "Professional lifestyle model photography of woman wearing casual top, half body shot, relaxed natural pose, warm natural lighting, clean minimalist background, international e-commerce style, diverse model representation, sharp focus on garment details, natural fabric draping, realistic body proportions"
  },
  "negative_prompt": {
    "base": "no distorted proportions, no unnatural poses",
    "specific": [
      "no heavy makeup or filters",
      "no wrinkled fabric",
      "no cluttered background",
      "no dull colors",
      "no stiff poses"
    ],
    "full": "no distorted proportions, no unnatural poses, no heavy makeup or filters, no wrinkled fabric, no cluttered background, no dull colors, no stiff poses"
  },
  "params": {
    "aspectRatio": "3:4",
    "model": "image-01",
    "quality": "high",
    "style": "lifestyle"
  }
}
```

---

## 4. n8n Workflow JSON 草稿

```json
{
  "_meta": {
    "name": "模特上身图生成工作流",
    "version": "1.0.0",
    "description": "接收模特图生成请求 → 校验 → 解析 prompt → 调用 AI → 质检 → 返回结果",
    "trigger": "webhook",
    "updatedAt": "2026-04-12"
  },

  "nodes": [
    {
      "id": "webhook",
      "name": "Webhook 接收",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "image-generate-model",
        "responseMode": "lastNode",
        "options": { "rawBody": false }
      }
    },

    {
      "id": "validate",
      "name": "参数校验",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const { sessionId, type, prompt, referenceImageUrl } = $input.item.json;\nif (!sessionId || !type || type !== 'model_photo') {\n  throw new Error('无效请求：缺少必填参数或类型不匹配');\n}\nif (prompt && prompt.length > 500) {\n  throw new Error('提示词过长，请控制在 500 字以内');\n}\nreturn { sessionId, type, prompt, referenceImageUrl };"
      }
    },

    {
      "id": "fetchSession",
      "name": "获取 Session 数据",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "={{ $env.APP_URL + '/api/diagnosis/session/' + $json.sessionId + '/result' }}",
        "options": { "timeout": 10000 }
      }
    },

    {
      "id": "extractWorkflow",
      "name": "提取 Workflow Key",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const { fields } = $input.item.json;\nif (!fields) throw new Error('Session 数据缺少 fields');\nconst { market, gender, category, targetImage } = fields;\nconst workflowKey = `${market}_${gender}_${category}_${targetImage}`;\nif (!workflowKey.includes('model')) throw new Error('不支持模特图类型');\nreturn { workflowKey, fields };"
      }
    },

    {
      "id": "resolvePrompt",
      "name": "解析 Prompt 模板",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const { workflowKey, prompt: userPrompt } = $input.item.json;\nconst PROMPT_TEMPLATES = {\n  'domestic_womenswear_top_model': 'Professional fashion model photography of woman wearing casual top blouse, half body shot, natural relaxed pose, soft natural lighting, lifestyle aesthetic, clean minimalist background, commercial fashion style, natural fabric draping, realistic body proportions, sharp focus on garment details, feminine elegance',\n  'domestic_womenswear_dress_model': 'Professional fashion model photography of woman wearing elegant dress, full body shot, elegant natural pose, soft studio lighting, clean minimalist background, commercial fashion aesthetic, natural fabric draping, realistic body proportions, sharp focus on garment details, feminine grace, flowing skirt movement',\n  'domestic_menswear_suit_set_model': 'Professional fashion model photography of man wearing business suit, full body shot, confident professional pose, studio lighting with soft key light, clean white or light gray background, commercial e-commerce style, natural fabric draping, realistic body proportions, sharp focus, masculine confidence',\n  'cross_border_womenswear_top_model': 'Professional lifestyle model photography of woman wearing casual top, half body shot, relaxed natural pose, warm natural lighting, clean minimalist background, international e-commerce style, diverse model representation, sharp focus on garment details, natural fabric draping, realistic body proportions'\n};\nconst baseTemplate = PROMPT_TEMPLATES[workflowKey] || PROMPT_TEMPLATES['domestic_womenswear_top_model'];\nconst finalPrompt = userPrompt ? `${baseTemplate}\\n\\nUser Request: ${userPrompt}` : baseTemplate;\nreturn { workflowKey, finalPrompt };"
      }
    },

    {
      "id": "callAI",
      "name": "调用 AI 生图 API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "={{ $env.MINIMAX_IMAGE_BASE_URL }}{{ $env.MINIMAX_IMAGE_ENDPOINT }}",
        "authentication": "genericCredentialType",
        "genericAuthType": "bearerAuth",
        "sendBody": true,
        "body": {
          "model": "image-01",
          "prompt": "={{ $json.finalPrompt }}",
          "aspect_ratio": "3:4",
          "response_format": "url",
          "n": 1
        },
        "options": { "timeout": 60000 }
      }
    },

    {
      "id": "qualityCheck",
      "name": "质检 - 检查图片 URL",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const response = $input.item.json;\nconst imageUrl = response.data?.image_urls?.[0];\nif (!imageUrl || !imageUrl.startsWith('http')) {\n  throw new Error('生成的图片 URL 无效');\n}\nreturn { imageUrl, thumbnailUrl: imageUrl, provider: 'minimax-cn', model: response.model || 'image-01', generatedAt: new Date().toISOString() };"
      }
    },

    {
      "id": "respondSuccess",
      "name": "返回成功结果",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseCode": 200,
        "responseBody": {
          "success": true,
          "imageUrl": "={{ $json.imageUrl }}",
          "thumbnailUrl": "={{ $json.thumbnailUrl }}",
          "provider": "={{ $json.provider }}",
          "model": "={{ $json.model }}",
          "generatedAt": "={{ $json.generatedAt }}",
          "type": "model_photo"
        }
      }
    },

    {
      "id": "errorHandler",
      "name": "错误处理",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const error = $input.item.json.error;\nconst errorMessage = error.message || '未知错误';\nlet fallbackStrategy = 'log';\nlet fallbackImageUrl = null;\nif (errorMessage.includes('timeout')) { fallbackStrategy = 'retry'; }\nelse if (errorMessage.includes('quota')) { fallbackStrategy = 'mock'; fallbackImageUrl = 'https://placehold.co/800x1067/1a1a2e/ffffff?text=Model+Photo+Mock'; }\nelse if (errorMessage.includes('prompt')) { fallbackStrategy = 'simplify_prompt'; }\nreturn { errorMessage, fallbackStrategy, fallbackImageUrl };"
      }
    },

    {
      "id": "respondError",
      "name": "返回错误结果",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseCode": 200,
        "responseBody": {
          "success": false,
          "error": "={{ $json.errorMessage }}",
          "fallbackStrategy": "={{ $json.fallbackStrategy }}",
          "fallbackImageUrl": "={{ $json.fallbackImageUrl }}",
          "type": "model_photo"
        }
      }
    }
  ],

  "connections": {
    "Webhook 接收": { "main": [[{ "node": "参数校验", "type": "main" }]] },
    "参数校验": { "main": [[{ "node": "获取 Session 数据", "type": "main" }]] },
    "获取 Session 数据": { "main": [[{ "node": "提取 Workflow Key", "type": "main" }]] },
    "提取 Workflow Key": { "main": [[{ "node": "解析 Prompt 模板", "type": "main" }]] },
    "解析 Prompt 模板": { "main": [[{ "node": "调用 AI 生图 API", "type": "main" }]] },
    "调用 AI 生图 API": { "main": [[{ "node": "质检 - 检查图片 URL", "type": "main" }]] },
    "质检 - 检查图片 URL": { "main": [[{ "node": "返回成功结果", "type": "main" }]] }
  },

  "credentials": {
    "miniMaxApiKey": { "name": "MiniMax API Key", "type": "bearerAuth" }
  },

  "envVariables": {
    "MINIMAX_IMAGE_BASE_URL": "https://api.minimaxi.com",
    "MINIMAX_IMAGE_ENDPOINT": "/v1/image_generation",
    "APP_URL": "https://your-app.vercel.app",
    "TIMEOUT_MS": "60000",
    "MAX_RETRIES": "2"
  },

  "settings": { "executionOrder": "v1" }
}
```

---

## 5. 字段说明

### 5.1 输入字段

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `sessionId` | string | ✅ | 诊断会话 ID | "f9iscpt55mqmnvj6nmt" |
| `type` | string | ✅ | 动作类型 | "model_photo" |
| `prompt` | string | ❌ | 用户自定义描述 | "年轻女性模特，自然微笑" |
| `referenceImageUrl` | string | ❌ | 参考图 URL | "https://..." |
| `style` | string | ❌ | 风格选择 | "commercial" \| "lifestyle" |
| `aspectRatio` | string | ❌ | 输出比例 | "3:4" \| "16:9" |

### 5.2 输出字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `success` | boolean | 是否成功 | true |
| `imageUrl` | string | 生成图片 URL | "https://..." |
| `thumbnailUrl` | string | 缩略图 URL | "https://..." |
| `provider` | string | 提供商 | "minimax-cn" |
| `model` | string | AI 模型 | "image-01" |
| `generatedAt` | string | 生成时间 (ISO8601) | "2026-04-12T12:00:00Z" |
| `type` | string | 图片类型 | "model_photo" |
| `error` | string | 错误信息（失败时） | "生成超时" |
| `fallbackStrategy` | string | 降级策略（失败时） | "mock" |
| `fallbackImageUrl` | string | 降级图片 URL（失败时） | "https://..." |

### 5.3 Workflow Key 构成

```
workflowKey = ${market}_${gender}_${category}_${targetImage}

示例：
- domestic_womenswear_top_model
- domestic_womenswear_dress_model
- domestic_menswear_suit_set_model
- cross_border_womenswear_top_model
```

### 5.4 Fallback 策略

| 策略 | 说明 | 触发条件 |
|------|------|----------|
| `retry` | 重试 | 超时错误 |
| `mock` | 返回 mock 图片 | 次数用完、配额耗尽 |
| `simplify_prompt` | 简化 prompt 重试 | prompt 包含敏感词 |
| `switch_provider` | 切换提供商 | 当前 provider 不可用 |

---

## 6. 使用示例

### 6.1 请求示例

```json
POST /api/execute/generate
{
  "sessionId": "f9iscpt55mqmnvj6nmt",
  "type": "model_photo",
  "prompt": "年轻女性模特，自然站立姿势，微笑，适合小红书种草",
  "style": "lifestyle",
  "aspectRatio": "3:4"
}
```

### 6.2 成功响应

```json
{
  "success": true,
  "imageUrl": "https://cdn.example.com/generated/model_photo_123.jpg",
  "thumbnailUrl": "https://cdn.example.com/generated/model_photo_123_thumb.jpg",
  "provider": "minimax-cn",
  "model": "image-01",
  "generatedAt": "2026-04-12T12:00:00Z",
  "type": "model_photo"
}
```

### 6.3 失败响应

```json
{
  "success": false,
  "error": "生成超时",
  "fallbackStrategy": "retry",
  "fallbackImageUrl": null,
  "type": "model_photo"
}
```

---

## 文档用途

| 章节 | 用途 | 目标读者 |
|------|------|----------|
| 1. 拍摄引导文案 | 指导用户拍摄原图 | 最终用户 |
| 2. 错误提示文案 | UI 错误展示 | 前端开发 |
| 3. Prompt 模板 | AI 生图提示词 | 后端开发 |
| 4. n8n Workflow | 工作流配置参考 | 主执行器 |
| 5. 字段说明 | 输入输出规范 | 前后端开发 |

---

**文档完成，停止。**
