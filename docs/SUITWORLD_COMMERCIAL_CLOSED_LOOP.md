# Suit World 男装西装商品化闭环方案
> 版本：v1.0 | 范围：男装西装模特图 | 不重构主链路

---

## 背景确认

- `/api/execute/generate` 可成功出图 ✅
- 正确参数链路：`action=model_photo` + `category=suit_set` + `scene=model_studio` + `gender=menswear` + `market=cross_border`
- `suit_set_model` 模板已验证可命中 ✅
- 当前重点：稳定产出可商用图

---

## Part 1《批量生成方案》

### 脚本路径
```
scripts/suitworld-batch-generate.js
```

### 使用方式
```bash
# 默认生成 5 张
node scripts/suitworld-batch-generate.js

# 指定数量
node scripts/suitworld-batch-generate.js --count=10 --port=3005
```

### 内部流程（不对外暴露）
```
Step 1: POST /api/diagnosis/session           创建带时间戳 session
Step 2: PATCH /api/diagnosis/session/:id      提交 {1:A,2:B,3:C,4:A,5:B} 命中 suit_set_model
Step 3: 循环 N 次 POST /api/execute/generate  携带完整参数
Step 4: 汇总结果 → 输出 logs/suitworld_batch_<timestamp>.json
```

### 固定参数包（已验证）
```javascript
const BASE_PARAMS = {
  action: 'model_photo',
  category: 'suit_set',
  scene: 'model_studio',
  gender: 'menswear',
  market: 'cross_border',
  choiceMode: true,
  extraFeatures: '',
  aspectRatio: '3:4',
  // referenceImageUrl: ''  // 留空时用纯 prompt 生成
};
```

### sessionId 自动带时间戳
- batchId 格式：`suitworld_batch_<timestamp>`
- 每个生成结果独立记录 `generatedAt`

### 每张记录字段
| 字段 | 来源 |
|------|------|
| imageUrl | `res.result.imageUrl` |
| provider | `res.result.provider` |
| model | `res.result.model` |
| prompt | 输入 prompt |
| extraFeatures | 输入参数 |
| generatedAt | `res.generatedAt` |

---

## Part 2《筛图 JSON 结构》

### 输出文件路径
```
logs/suitworld_batch_<timestamp>.json
```

### JSON 结构
```json
{
  "session": "suitworld_batch_<timestamp>",
  "timestamp": "2026-04-23T...",
  "params": {
    "action": "model_photo",
    "category": "suit_set",
    "scene": "model_studio",
    "gender": "menswear",
    "market": "cross_border",
    "choiceMode": true,
    "aspectRatio": "3:4"
  },
  "summary": {
    "total": 5,
    "success": 4,
    "failed": 1,
    "providerDrift": false,
    "providers": ["minimax-cn"],
    "models": ["image-01"],
    "avgLatencyMs": 12500
  },
  "images": [
    {
      "index": 0,
      "url": "https://...",
      "quality": "ok|reject",
      "reject_reason": "",
      "fabric": "ok|reject",
      "tailoring": "ok|reject",
      "structure": "ok|reject",
      "trousers": "ok|reject",
      "style": "ok|reject",
      "composition": "ok|partial|poor",
      "detail": "ok|blur|poor",
      "tiktok_ad_feel": "high|medium|low",
      "provider": "minimax-cn",
      "model": "image-01",
      "latencyMs": 12340,
      "generatedAt": "2026-04-23T...",
      "_score": 100,
      "_reasons": ["全维度ok(+100)", "构图完整(+15)", "细节清晰(+10)"]
    }
  ],
  "consistency": "high|medium|low",
  "best_image": "https://...",
  "best_image_score": 125,
  "best_image_reasons": ["全维度ok(+100)", "构图完整(+15)", "细节清晰(+10)", "TikTok感强(+8)"],
  "needs_human_review": false,
  "notes": ""
}
```

### consistency 判定规则
| 条件 | 结果 |
|------|------|
| provider + model 都唯一 | `high` |
| provider 唯一，model 有漂移 | `medium` |
| provider 有漂移 | `low` |

### 字段说明
- `quality`：总质量标记，`ok` = 成功出图，`reject` = 失败/异常
- `fabric`：面料质感是否清晰（褶皱/纹理正常 vs. 模糊/变形）
- `tailoring`：裁剪线条是否利落（肩线/袖型/腰线）
- `structure`：整体结构是否完整（西装外套 + 裤子是否配套）
- `trousers`：裤子是否正常（长度/版型/褶皱）
- `style`：风格是否符合商务定位
- `composition`：构图完整度（全身 vs. 半身 vs. 残缺）
- `detail`：西装细节（纽扣/领口/口袋）清晰度
- `tiktok_ad_feel`：是否有 TikTok 广告感（光线/背景/模特姿态）

---

## Part 3《最佳图选择规则》

### 选择算法（自动评分）
```javascript
function scoreImage(img) {
  let score = 0;

  // 优先：所有维度都为 ok
  const allOk = ['fabric','tailoring','structure','trousers','style']
    .every(k => img[k] === 'ok');
  if (allOk) score += 100;
  else score -= rejectCount * 20;

  // 次优先：构图最完整
  if (composition === 'ok') score += 15;
  else if (composition === 'partial') score += 5;

  // 再次优先：西装细节最清晰
  if (detail === 'ok') score += 10;
  else if (detail === 'blur') score -= 5;

  // 再次优先：更像 TikTok 广告图
  if (tiktok_ad_feel === 'high') score += 8;
  else if (tiktok_ad_feel === 'low') score -= 3;

  return score;
}
```

### 评分档位
| 分值 | 含义 |
|------|------|
| ≥ 100 | 优秀，可直接商用 |
| 80-99 | 良好，小修可用 |
| 60-79 | 一般，需较大修改 |
| < 60 | 差，建议废弃 |

### 最佳图选择输出
```javascript
{
  best_image: "https://...",
  best_image_score: 125,
  best_image_reasons: ["全维度ok(+100)", "构图完整(+15)", "细节清晰(+10)", "TikTok感强(+8)"],
  needs_human_review: false  // score < 80 → true
}
```

### 人工复核规则
| 条件 | 是否需要人工复核 |
|------|----------------|
| 最佳分 ≥ 80 | ⚠️ 需要（建议抽检） |
| 最佳分 < 80 | ✅ 必须人工审核 |
| 无图成功 | ✅ 人工排查原因 |
| 多张并列第一 | ✅ 人工二选一 |

### 输出
- `best_image`：自动选出的最佳图 URL
- `needs_human_review`：是否需要人工复核（boolean）
- 实际部署建议：分值 ≥ 100 可自动商用，< 100 全部进人工复核队列

---

## Part 4《Suit World 参数模板建议》

### 推荐固定参数（不可让用户改）
```javascript
const FIXED_PARAMS = {
  action: 'model_photo',        // 锁定
  category: 'suit_set',         // 锁定
  scene: 'model_studio',        // 锁定：studio 光效最稳定
  gender: 'menswear',           // 锁定
  market: 'cross_border',       // 锁定：跨境电商场景
  choiceMode: true,             // 锁定：使用模板自动拼 prompt
  aspectRatio: '3:4',           // 锁定：3:4 最适合男装模特图
};
```

### 推荐可变参数（可让用户选）
```javascript
const VARIABLE_PARAMS = {
  extraFeatures: [
    '',                          // 黑色商务（默认）
    '深蓝色',                    // 深蓝色商务
    '炭灰色',                    // 炭灰色休闲
    '条纹款式',                  // 条纹
  ],
  referenceImageUrl: [
    '',                          // 无参考，纯 prompt（默认）
    '<用户上传参考图>',          // 有参考，AI 保持服装一致性
  ],
};
```

### 颜色扩展方案
| 颜色 | extraFeatures 值 | 说明 |
|------|-----------------|------|
| 黑色商务（默认） | `''` | 标准黑色西装 |
| 深蓝色 | `深蓝色` 或 `navy blue` | 深蓝商务西装 |
| 炭灰色 | `炭灰色` 或 `charcoal` | 休闲西装 |
| 浅灰色 | `浅灰色` 或 `light grey` | 浅色商务 |
| 条纹款 | `条纹款式` 或 `pinstripe` | 正式条纹西装 |

### 扣型扩展方案
| 扣型 | extraFeatures 追加值 |
|------|---------------------|
| 单排扣（默认） | `单排扣` |
| 双排扣 | `双排扣` 或 `double-breasted` |
| 两粒扣 | `两粒扣` 或 `two-button` |
| 三粒扣 | `三粒扣` 或 `three-button` |

### 版型扩展方案
| 版型 | extraFeatures 追加值 |
|------|---------------------|
| 修身款 | `修身版型` 或 `slim fit` |
| 标准款（默认） | `标准版型` 或 `regular fit` |
| 宽松款 | `宽松版型` 或 `relaxed fit` |
| 韩版 | `韩版休闲` 或 `korean style` |

### 哪些参数不要让前端用户改
| 参数 | 原因 |
|------|------|
| `action` | model_photo 是唯一正确路径 |
| `category` | suit_set 是西装专用类目 |
| `scene` | model_studio 光效最稳定 |
| `gender` | menswear 固定男装 |
| `market` | cross_border 跨境电商标准 |
| `choiceMode` | 必须为 true 才能命中模板 |
| `aspectRatio` | 3:4 最适合男装模特图，1:1 会裁掉下半身 |

---

## Part 5《商品页 / TikTok 双用途建议》

### 同一张图是否适合两种用途？
**结论：不适合，建议拆成两个 prompt 版本**

| 维度 | 商品页主图 | TikTok 封面图 |
|------|----------|--------------|
| 背景 | 纯白/浅灰（白底主图要求） | 有氛围感（生活场景/光影） |
| 模特姿势 | 标准化中立站姿 | 动态/自信/有感染力 |
| 光线 | 均匀柔光（产品质感） | 有戏剧感（种草感） |
| 构图 | 全身正面 | 上半身为主（适应竖屏） |
| 风格 | 专业电商标准 | 社交媒体种草感 |
| 图片比例 | 3:4 或 1:1 | 9:16 或 4:5（竖屏） |

### 建议：拆成两个 prompt 版本

#### 版本 A：Listing 版（商品页主图/辅图）
```javascript
const LISTING_PROMPT = `
Professional studio model photography of man wearing tailored business suit,
full body shot, neutral standing pose, facing camera directly,
pure white background, even studio lighting,
Amazon/Temu e-commerce standard, sharp focus,
natural fabric texture, realistic proportions,
centered composition, no shadows on background,
commercial product photography standard
`.trim();
```

**用途**：亚马逊/Temu 商品主图、Shopify 商品页

#### 版本 B：TikTok Ad 版（短视频素材封面图）
```javascript
const TIKTOK_AD_PROMPT = `
Professional fashion photography of confident male model wearing stylish business suit,
half body close-up shot, dynamic confident pose with slight smile,
modern urban background with soft bokeh, cinematic warm lighting,
TikTok social media aesthetic, aspirational lifestyle energy,
sharp suit details visible, luxury brand feel,
vibrant yet professional color grading,
high engagement social media cover photo style
`.trim();
```

**用途**：TikTok 视频封面、小红书主图、Instagram 商业帖子

### 复用策略
```
同一批次生成 5 张图
  → 人工从 5 张中选出 1-2 张适合 Listing
  → 人工从 5 张中选出 1-2 张适合 TikTok
  → 各自进入对应的修图/上传流程
```

### 不建议自动分流的原因
1. 两种用途对构图/光线/背景要求差异大
2. 自动判断误差率高，必须人工决策
3. 当前阶段（商品化闭环 v1）人工筛选成本最低

---

## Part 6《最小风险排查》

### 风险 1：批量生成时 provider 是否漂移
```
✅ 监控字段：summary.providerDrift（boolean）
✅ 脚本输出：Provider 漂移检测，漂移时报错并记录
✅ 触发条件：providerSet.length > 1
✅ 处理建议：provider 漂移时，这批结果整体标记为 consistency=low，人工抽检
```

### 风险 2：extraFeatures 为空时是否风格退化
```
⚠️  当前设计：extraFeatures 为空时走模板默认风格（黑色商务西装）
⚠️  风险：模板默认风格可能偏通用，不够差异化
✅  缓解：extraFeatures 空 = 默认商务风，已经过验证可商用
✅  改进方向：后续可增加「颜色引导词」注入，默认给一个黑色商务变体
```

### 风险 3：reference 图质量差时是否污染结果
```
⚠️  当前设计：referenceImageUrl 留空，用纯 prompt 生成
⚠️  风险：reference 图质量差会导致 AI 复刻错误细节（褶皱/变形/色差）
✅  当前阶段策略：不传 referenceImageUrl，完全依赖 prompt 控制
✅  后续方向：reference 图必须经过「质量预检」才能进入生成流程
   - 预检维度：分辨率 > 1024px、背景不太杂乱、衣服占图 > 30%
   - 预检工具：可复用现有 browser_vision 做快速质检
```

### 额外风险 4：批量生成耗尽 token/配额
```
⚠️  风险：连续 5 张图的 API 消耗约等于 5 次单独生成
✅  缓解：脚本加了 35s 单次超时 + 总进度显示，可随时 Ctrl+C 中断
✅  建议：首次批量运行建议 --count=3 验证，确认稳定后再扩量
```

### 额外风险 5：sessionId 复用导致结果关联
```
✅  验证：每个生成请求携带同一个 sessionId（符合链路要求）
✅  无风险：sessionId 只用于关联诊断上下文，不影响图片内容
```

---

## 下一步最值得做的 3 件事

### Top 1：验证批量生成稳定性（预计 30 分钟）
```
执行：node scripts/suitworld-batch-generate.js --count=5
目标：
  - 确认 5 张中 ≥ 3 张可商用
  - 确认 provider 不漂移
  - 确认 JSON 日志格式正确
意义：这是整个闭环的基础，批量不稳定则后续无从谈起
```

### Top 2：建立「人工复核标记」流程（预计 1 小时）
```
执行：在 logs/ JSON 基础上，增加人工审核入口
目标：
  - 对 5 张图进行人工 quality review
  - 填写 fabric/tailoring/structure/trousers/style 五个维度
  - 记录 best_image 选择理由
意义：
  - 建立第一批 ground truth 数据
  - 后续可用于训练自动化筛图模型
  - 形成「生成→审核→记录」最小闭环
```

### Top 3：建立参数沉淀文档（预计 1 小时）
```
执行：基于 Part 4 输出，建立 docs/SUITWORLD_PARAMS.md
目标：
  - 沉淀最优参数包（颜色/扣型/版型组合）
  - 建立「商品页参数模板」和「TikTok 参数模板」两套配置
  - 记录每个参数组合的实际出图效果评分
意义：为后续扩展到其他品类（女装/裤装）提供可复用方法论
```

---

## 文件清单

| 文件路径 | 用途 |
|---------|------|
| `scripts/suitworld-batch-generate.js` | 批量生成脚本 |
| `logs/suitworld_batch_<timestamp>.json` | 批量结果日志 |
| `docs/SUITWORLD_COMMERCIAL_CLOSED_LOOP.md` | 本文档（完整方案） |
| `docs/SUITWORLD_PARAMS.md` | 参数沉淀文档（后续建立） |
