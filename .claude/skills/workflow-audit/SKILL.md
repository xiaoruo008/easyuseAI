# workflow-audit

> 审计 workflowKey → templateId → prompt 的链路完整性，排查生成结果异常、prompt 不生效、路由映射错误。

---

## 触发场景

触发词：
- 「检查 workflow」
- 「audit workflow」
- 「生成结果不对」
- 「某个 action 路由不到模板」
- 「prompt 没生效」
- 「workflow key 映射问题」

---

## 分步执行流程

### Step 1 — 读取核心文件

按此顺序读取（注意循环依赖）：

```bash
# 1. 路由映射
cat lib/types/fashion.ts

# 2. workflow 配置
cat lib/workflow.ts

# 3. 模板定义
cat lib/image/template.ts

# 4. 实际生成 API
cat app/api/execute/generate/route.ts

# 5. 图片生成入口
cat lib/image/index.ts
```

### Step 2 — 列出所有 workflowKey

从 `lib/workflow.ts` 的 `WORKFLOW_MAP` 中提取所有 key。

### Step 3 — 追踪链路完整性

对于每个 workflowKey，追踪：

```
workflowKey
  → templateId（lib/types/fashion.ts 的 routeFromAction）
    → TEMPLATES[templateId]（lib/image/template.ts）
    → ACTION_TEMPLATE_MAP[action]（lib/image/template.ts）
    → providerPriority（lib/workflow.ts）
    → fallbackStrategy（lib/workflow.ts）
```

### Step 4 — 验证 routeFromAction 边界

```typescript
// 重点验证这些已知边界：
routeFromAction("lifestyle", "domestic")
routeFromAction("fashion_model", "overseas")
routeFromAction("unknown_action", "top")
routeFromAction("model_photo", "domestic")
```

### Step 5 — 检查 promptVersion 策略

在 `app/api/execute/generate/route.ts` 中：
- `generateImageWithRetry` 有几次重试
- 每次重试的 prompt 策略
- `moderationRiskLevel` 对应的 safe prompt

### Step 6 — 检查 provider fallback

```
image generation
  → getProviderWithFallback(taskType)
    → minimax-cn / gemini-nanobanana / mock
      → 失败时降级逻辑
```

---

## 关键数据参考

### 12 个 workflowKey（lib/workflow.ts）

```
domestic_menswear_suit_set_main_white
domestic_menswear_suit_set_hero_branded
domestic_menswear_suit_set_model
domestic_womenswear_top_main_white
domestic_womenswear_top_model
domestic_womenswear_top_lifestyle
domestic_womenswear_dress_main_white
domestic_womenswear_dress_hero_branded
domestic_womenswear_dress_model
cross_border_menswear_suit_set_main_white
cross_border_womenswear_dress_main_white
cross_border_womenswear_top_model
```

### 9 个模板（lib/image/template.ts）

```
bg_white        白底主图        minimax-cn
bg_scene        场景换背景      minimax-cn
enhance          商品精修        minimax-cn
model_half       上半身模特      minimax-cn
model_full      全身模特        minimax-cn
lifestyle_flat  平铺场景图      minimax-cn
lifestyle_scene 生活场景图      minimax-cn
fashion_model   服装模特图      gemini-nanobanana
fashion_lifestyle 服装场景图   gemini-nanobanana
```

### action → template 映射

```
background_swap → bg_scene
product_photo   → enhance
model_photo     → model_half
lifestyle       → lifestyle_scene
fashion_model   → fashion_model
fashion_lifestyle → fashion_lifestyle
```

---

## 限制条件

- 只报告不一致之处，不自动修复
- 不删除未使用的 key
- 不修改 UI

---

## 输出格式

```
## Workflow Audit 报告

### 链路完整性
✅ routeFromAction → templateId 完整
❌ action=xxx → templateId 不存在

### promptVersion 策略
✅ 所有模板均有 v1 prompt
⚠️ action=xxx promptVersion=2 但无 safe prompt 降级

### fallback 链路
✅ provider → 白底图 fallback 完整
❌ provider 失败 → 无 fallback，直接暴露 error

### 待处理问题（按优先级）
1. [高] action=xxx → 模板不存在
2. [中] fallbackStrategy 未被调用
```
