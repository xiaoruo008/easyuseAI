# 模特上身图 (model_photo) - 辅助优化文案

更新时间：2026-04-12

## 1. Execute 页上传提示文案优化

### 当前 placeholder
```
actionId === "model_photo" ? "描述你想要的模特效果" : ...
```

### 优化后 placeholder（建议）
```
actionId === "model_photo" 
  ? "例如：年轻女性模特，自然站立姿势，微笑，适合小红书种草" 
  : ...
```

### 完整 placeholder 方案
```javascript
placeholder={
  actionId === "product_photo" 
    ? "例如：放在纯白背景里，光线柔和，专业电商风" 
    : actionId === "background_swap" 
      ? "例如：把背景换成现代简约的咖啡馆场景" 
      : actionId === "model_photo"
        ? "例如：年轻女性模特，自然站立姿势，微笑，适合小红书种草"
        : "描述你想要的图片效果"
}
```

---

## 2. 拍摄指导文案（给用户）

### 2.1 通用版（适合所有模特图）

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

### 2.2 女装上衣模特图专用

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

### 2.3 女装连衣裙模特图专用

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

### 2.4 男装套装模特图专用

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

## 3. 模特图提示词模板库

### 3.1 女装上衣模特图

```
// 休闲风
Professional fashion model photography of young woman wearing casual blouse,
half body shot, natural relaxed pose, soft smile,
warm natural lighting, lifestyle aesthetic,
clean minimalist background, commercial fashion style,
natural fabric draping, realistic body proportions,
sharp focus on garment details, feminine elegance

Negative: no distorted proportions, no unnatural poses,
no heavy makeup, no wrinkles, no busy background

// 通勤风
Professional fashion model photography of woman wearing business blouse,
half body shot, confident professional pose,
studio lighting with soft key light,
clean white or light gray background,
commercial e-commerce style, sharp focus,
natural fabric draping, realistic body proportions

Negative: no casual poses, no wrinkled clothing,
no distracting background elements

// 小红书种草风
Professional lifestyle model photography of young woman wearing trendy top,
half body shot, casual natural pose, genuine smile,
soft warm lighting, instagram aesthetic,
minimalist background with subtle texture,
commercial social media style, vibrant colors,
sharp focus on garment, youthful energy

Negative: no stiff poses, no dull colors,
no cluttered background, no heavy filters
```

### 3.2 女装连衣裙模特图

```
// 优雅风
Professional fashion model photography of woman wearing elegant dress,
full body shot, graceful standing pose,
soft studio lighting, clean minimalist background,
commercial fashion style, natural fabric draping,
flowing skirt movement, feminine grace,
sharp focus on garment details

Negative: no distorted proportions, no unnatural poses,
no wrinkled fabric, no busy background

// 休闲风
Professional lifestyle model photography of woman wearing casual dress,
full body shot, relaxed natural pose, genuine smile,
warm natural lighting, outdoor or indoor lifestyle setting,
clean background, commercial social media style,
natural fabric draping, youthful energy

Negative: no stiff poses, no formal wear aesthetic,
no dull colors, no cluttered background

// 晚宴风
Professional fashion model photography of woman wearing evening dress,
full body shot, elegant poised pose,
dramatic studio lighting with rim light,
dark or gradient background, luxury aesthetic,
flowing fabric movement, sophisticated elegance,
sharp focus on dress details

Negative: no casual poses, no bright background,
no wrinkled fabric, no amateur lighting
```

### 3.3 男装套装模特图

```
// 商务风
Professional fashion model photography of man wearing business suit,
full body shot, confident professional pose,
studio lighting with soft key light,
clean white or light gray background,
commercial e-commerce style, sharp focus,
natural fabric draping, realistic body proportions,
masculine confidence

Negative: no casual poses, no wrinkled suit,
no distracting background, no unnatural proportions

// 休闲西装风
Professional lifestyle model photography of man wearing casual suit jacket,
half body shot, relaxed confident pose,
warm natural lighting, lifestyle aesthetic,
minimalist background with subtle texture,
commercial social media style, sharp focus,
natural fabric draping, modern masculine style

Negative: no stiff formal poses, no dull colors,
no cluttered background, no wrinkled fabric

// 亚马逊主图风
Professional studio model photography of man wearing suit,
full body shot, neutral standing pose,
even studio lighting, pure white background,
Amazon e-commerce standard, sharp focus,
natural fabric draping, realistic proportions,
centered composition

Negative: no shadows on background, no casual poses,
no wrinkled suit, no lifestyle elements,
no watermarks or text
```

---

## 4. n8n Workflow JSON 草稿（模特图专用分支）

```json
{
  "_comment": "模特上身图 (model_photo) n8n 工作流配置草稿 V1",
  "_description": "用于主执行器参考，实际节点需在 n8n Editor UI 中搭建",
  "_updatedAt": "2026-04-12",

  "workflowName": "模特上身图生成工作流",
  "trigger": "webhook",
  
  "nodes": [
    {
      "id": "webhook-receive",
      "name": "Webhook 接收",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "image-generate-model",
        "responseMode": "lastNode",
        "options": {
          "rawBody": false
        }
      }
    },

    {
      "id": "validate-params",
      "name": "参数校验",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// 校验必填参数\nconst { sessionId, type, prompt, referenceImageUrl } = $input.item.json;\n\nif (!sessionId || !type) {\n  throw new Error('缺少必填参数：sessionId 或 type');\n}\n\nif (type !== 'model_photo') {\n  throw new Error('类型不匹配：期望 model_photo');\n}\n\n// 校验 prompt 长度\nif (prompt && prompt.length > 1000) {\n  throw new Error('提示词过长，请控制在 1000 字以内');\n}\n\nreturn { sessionId, type, prompt, referenceImageUrl };"
      }
    },

    {
      "id": "fetch-session-data",
      "name": "获取 Session 数据",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "={{ $env.APP_URL + '/api/diagnosis/session/' + $json.sessionId + '/result' }}",
        "options": {
          "timeout": 10000
        }
      }
    },

    {
      "id": "extract-workflow-key",
      "name": "提取 Workflow Key",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// 从 session 数据提取 workflow 字段\nconst { result, fields } = $input.item.json;\n\nif (!fields) {\n  throw new Error('Session 数据缺少 fields');\n}\n\nconst { market, gender, category, targetImage } = fields;\nconst workflowKey = `${market}_${gender}_${category}_${targetImage}`;\n\n// 校验是否为模特图类型\nif (!workflowKey.includes('model')) {\n  throw new Error('当前 workflow 不支持模特图类型');\n}\n\nreturn { workflowKey, fields, result };"
      }
    },

    {
      "id": "resolve-prompt-template",
      "name": "解析提示词模板",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// 根据 workflowKey 选择提示词模板\nconst { workflowKey, fields, prompt: userPrompt } = $input.item.json;\n\n// 提示词模板库\nconst PROMPT_TEMPLATES = {\n  'domestic_womenswear_top_model': `\nProfessional fashion model photography of woman wearing casual top,\nhalf body shot, natural relaxed pose,\nsoft natural lighting, lifestyle aesthetic,\nclean minimalist background, commercial fashion style,\nnatural fabric draping, realistic body proportions,\nsharp focus on garment details, feminine elegance\n\nNegative: no distorted proportions, no unnatural poses,\nno heavy makeup, no wrinkles`,\n\n  'domestic_womenswear_dress_model': `\nProfessional fashion model photography of woman wearing elegant dress,\nfull body shot, graceful standing pose,\nsoft studio lighting, clean minimalist background,\ncommercial fashion style, natural fabric draping,\nflowing skirt movement, feminine grace\n\nNegative: no distorted proportions, no unnatural poses,\nno wrinkled fabric, no busy background`,\n\n  'domestic_menswear_suit_set_model': `\nProfessional fashion model photography of man wearing business suit,\nfull body shot, confident professional pose,\nstudio lighting with soft key light,\nclean white or light gray background,\ncommercial e-commerce style, sharp focus,\nnatural fabric draping, realistic body proportions\n\nNegative: no casual poses, no wrinkled suit,\nno distracting background`,\n\n  'cross_border_womenswear_top_model': `\nProfessional lifestyle model photography of woman wearing casual top,\nhalf body shot, relaxed natural pose,\nwarm natural lighting, international e-commerce style,\nclean background, diverse model representation,\nsharp focus on garment details\n\nNegative: no distorted proportions, no unnatural poses,\nno heavy makeup, no wrinkles`\n};\n\nconst baseTemplate = PROMPT_TEMPLATES[workflowKey] || PROMPT_TEMPLATES['domestic_womenswear_top_model'];\n\n// 拼接用户自定义 prompt\nconst finalPrompt = userPrompt \n  ? `${baseTemplate}\\n\\nUser Request: ${userPrompt}`\n  : baseTemplate;\n\nreturn { workflowKey, fields, finalPrompt, baseTemplate };"
      }
    },

    {
      "id": "call-minimax-api",
      "name": "调用 MiniMax 生图 API",
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
          "aspect_ratio": "={{ $json.fields.targetImage === 'model' ? '3:4' : '1:1' }}",
          "response_format": "url",
          "n": 1
        },
        "options": {
          "timeout": 60000
        }
      }
    },

    {
      "id": "quality-check",
      "name": "质检 - 检查图片 URL",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// 检查 API 返回的图片 URL 是否有效\nconst response = $input.item.json;\nconst imageUrl = response.data?.image_urls?.[0];\n\nif (!imageUrl || !imageUrl.startsWith('http')) {\n  throw new Error('生成的图片 URL 无效');\n}\n\nreturn {\n  imageUrl: imageUrl,\n  thumbnailUrl: imageUrl,\n  provider: 'minimax-cn',\n  model: response.model || 'image-01',\n  generatedAt: new Date().toISOString()\n};"
      }
    },

    {
      "id": "respond-success",
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
      "id": "error-handler",
      "name": "错误处理",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// 错误分类处理\nconst error = $input.item.json.error;\nconst errorMessage = error.message || '未知错误';\n\nlet fallbackStrategy = 'log';\nlet fallbackImageUrl = null;\n\n// 超时错误 → 建议重试\nif (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {\n  fallbackStrategy = 'retry';\n}\n// 业务错误码 → 降级到 mock\nelse if (errorMessage.includes('2049') || errorMessage.includes('quota')) {\n  fallbackStrategy = 'mock';\n  fallbackImageUrl = 'https://placehold.co/800x800/1a1a2e/ffffff?text=Model+Photo+Mock';\n}\n// prompt 问题 → 简化后重试\nelse if (errorMessage.includes('prompt') || errorMessage.includes('invalid')) {\n  fallbackStrategy = 'simplify_prompt';\n}\n\nreturn {\n  errorMessage,\n  fallbackStrategy,\n  fallbackImageUrl,\n  errorType: error.constructor?.name || 'Error'\n};"
      }
    },

    {
      "id": "respond-error",
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
    "Webhook 接收": {
      "main": [[{ "node": "参数校验", "type": "main" }]]
    },
    "参数校验": {
      "main": [[{ "node": "获取 Session 数据", "type": "main" }]]
    },
    "获取 Session 数据": {
      "main": [[{ "node": "提取 Workflow Key", "type": "main" }]]
    },
    "提取 Workflow Key": {
      "main": [[{ "node": "解析提示词模板", "type": "main" }]]
    },
    "解析提示词模板": {
      "main": [[{ "node": "调用 MiniMax 生图 API", "type": "main" }]]
    },
    "调用 MiniMax 生图 API": {
      "main": [[{ "node": "质检 - 检查图片 URL", "type": "main" }]]
    },
    "质检 - 检查图片 URL": {
      "main": [[{ "node": "返回成功结果", "type": "main" }]]
    }
  },

  "settings": {
    "executionOrder": "v1"
  },

  "credentials": {
    "miniMaxApiKey": {
      "name": "MiniMax API Key",
      "type": "bearerAuth"
    }
  },

  "envVariables": {
    "MINIMAX_IMAGE_BASE_URL": "https://api.minimaxi.com",
    "MINIMAX_IMAGE_ENDPOINT": "/v1/image_generation",
    "APP_URL": "https://your-app.vercel.app",
    "TIMEOUT_MS": "60000",
    "MAX_RETRIES": "2"
  }
}
```

---

## 5. 错误提示文案优化

### 当前错误提示
```
alert("制作失败，请重试")
```

### 优化后错误提示（模特图专用）
```javascript
const MODEL_PHOTO_ERROR_MESSAGES = {
  timeout: "生成超时，可能是网络波动。建议：1) 稍等 1 分钟后重试；2) 检查网络连接。",
  quota: "免费次数已用完。您可以：1) 留下联系方式获取 3 张免费券；2) 付费解锁。",
  invalid_prompt: "提示词可能包含敏感内容。建议：1) 简化描述；2) 使用预设模板。",
  invalid_image: "上传的图片格式不支持。建议：1) 使用 JPG/PNG 格式；2) 重新拍摄上传。",
  default: "制作时遇到点小问题，可能是网络波动或 AI 服务暂时繁忙。建议：1) 稍等 1 分钟再试；2) 检查网络连接；3) 如果多次失败，请联系顾问协助。"
};
```

---

## 6. Result 页模特图按钮文案优化

### 当前文案
```
{ id: "model_photo", label: "出模特图", desc: "生成真实模特上身效果", icon: "👤", category: "image" }
```

### 优化后文案
```
{ 
  id: "model_photo", 
  label: "模特上身图", 
  desc: "生成真实模特穿着效果，适合种草", 
  icon: "👤", 
  category: "image",
  tags: ["种草必备", "真实展示"]
}
```

---

## 文件用途说明

| 章节 | 用途 | 目标文件 |
|------|------|----------|
| 1 | Execute 页 placeholder 优化 | `app/execute/page.tsx` |
| 2 | 拍摄指导文案 | `app/execute/page.tsx` 或单独组件 |
| 3 | 提示词模板库 | `lib/image/template.ts` |
| 4 | n8n Workflow JSON 草稿 | 主执行器参考 |
| 5 | 错误提示文案 | `app/execute/page.tsx` |
| 6 | Result 页按钮文案 | `lib/diagnosis.ts` |
