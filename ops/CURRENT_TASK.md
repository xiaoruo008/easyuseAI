# CURRENT TASK
更新时间：2026-04-15 01:00 UTC+8
状态：✅ 完成

---

## 任务 ID
task-2026-04-14-002

## 任务类型
task_type: bug-fix

## 分配给
assigned_to: hermes-agent

## 目标
修复 deriveFashionFieldsFromDiagnosis 返回 gender:"unisex" 导致工作流匹配永远失败的问题

## 问题描述

`deriveFashionFieldsFromDiagnosis()` 在 `lib/diagnosis-workflow-map.ts` 中返回 `gender: "unisex"`。

但 `lib/workflow.ts` 的 WORKFLOW_MAP 只有 `menswear` 和 `womenswear` 两种 gender，不存在 "unisex" 工作流。

导致 `resolveWorkflow()` 永远返回 `matched: false`：
```
domestic_unisex_top_main_white → WORKFLOW_MAP[workflowKey] = null → matched: false
```

## 具体修改

文件：`lib/diagnosis-workflow-map.ts`

DIAGNOSIS_DEFAULTS 中 4 处 `gender: "unisex"` → `gender: "womenswear"`

## 验收标准

- [x] DIAGNOSIS_DEFAULTS 中所有 gender 值为 "womenswear"（无 "unisex"）
- [x] 工作流匹配返回 matched=true（4种诊断类型均已验证）
- [x] 工作流标签正确显示（"国内女装上衣 · 白底主图"）

## 执行结果
✅ 完成时间：2026-04-14 23:44 UTC+8
修改：lib/diagnosis-workflow-map.ts
- traffic: gender "unisex" → "womenswear"
- customer: gender "unisex" → "womenswear"
- efficiency: gender "unisex" → "womenswear"
- unclear: gender "unisex" → "womenswear"

验证：scripts/verify-workflow-match.ts（直接调用函数，无须启动 dev server）
- traffic → matched: true, label: 国内女装上衣 · 白底主图
- customer → matched: true, label: 国内女装上衣 · 白底主图
- efficiency → matched: true, label: 国内女装上衣 · 白底主图
- unclear → matched: true, label: 国内女装上衣 · 白底主图

---

## 任务 ID
task-2026-04-15-001

## 任务类型
task_type: bug-fix

## 分配给
assigned_to: hermes-agent

## 目标
修复 execute/page.tsx 调用 Result API 时未传递 action 参数，导致工作流路由无法根据用户选择的 action 正确路由

## 问题描述

`app/execute/page.tsx` 第64行调用 Result API 时：

```tsx
fetch(`/api/diagnosis/session/${sessionId}/result`)  // ← 没有传 action 参数
```

`actionId` 变量在作用域内可用（来自 URL params `?session=xxx&action=y`），但调用 Result API 时未传递。

Result API `deriveFashionFieldsFromDiagnosis(type, "")` 收到空字符串 action，targetImage 只能默认为 "main_white"，无法根据用户选择的 action（如 model_photo、product_photo 等）正确路由到 12 套工作流之一。

## 具体修改

文件：`app/execute/page.tsx`

```tsx
// 修改前
fetch(`/api/diagnosis/session/${sessionId}/result`)
  .then(...)
}, [sessionId]);

// 修改后
const resultUrl = actionId
  ? `/api/diagnosis/session/${sessionId}/result?action=${encodeURIComponent(actionId)}`
  : `/api/diagnosis/session/${sessionId}/result`;
fetch(resultUrl)
  .then(...)
}, [sessionId, actionId]);
```

## 验收标准

- [x] execute/page.tsx 调用 Result API 时传递 action 参数（URL query string）
- [x] useEffect 依赖数组包含 actionId
- [x] action 为空字符串时不附加 query param（兼容 result/page.tsx 的无 action 场景）

## 执行结果
✅ 完成时间：2026-04-15 00:15 UTC+8
修改：app/execute/page.tsx

修复后预期行为：
- 用户选择 action `model_photo` → execute 页面 URL 包含 `?action=model_photo`
- execute/page.tsx 调用 `/api/diagnosis/session/[id]/result?action=model_photo`
- Result API: `deriveFashionFieldsFromDiagnosis(type, "model_photo")` → targetImage="model"
- 工作流：`domestic_womenswear_top_model` → matched: true

---

## 任务 ID
task-2026-04-15-002

## 任务类型
task_type: bug-fix

## 分配给
assigned_to: hermes-agent

## 目标
修复 `product_photo` action 路由到不存在的工作流 `top_hero_branded`

## 问题描述

`ACTION_TARGET_IMAGE_MAP` 中 `product_photo → hero_branded`，但 `deriveFashionFieldsFromDiagnosis` 使用 `DIAGNOSIS_DEFAULTS.category = "top"`。

`WORKFLOW_MAP` 中 `hero_branded` 只存在于 `suit_set` 和 `dress` category，**不存在 `top_hero_branded`**。

导致：`product_photo + 任何诊断类型 → domestic_womenswear_top_hero_branded → matched: false`

## 具体修改

文件：`lib/diagnosis-workflow-map.ts`

新增 `ACTION_CATEGORY_OVERRIDE`：
```ts
const ACTION_CATEGORY_OVERRIDE: Record<string, Category> = {
  product_photo: "dress",
};
```

修改 `deriveFashionFieldsFromDiagnosis`：
```ts
const category = ACTION_CATEGORY_OVERRIDE[action] ?? defaults.category;
```

## 验收标准

- [x] `product_photo + any diagnosis` → `domestic_womenswear_dress_hero_branded` matched: true
- [x] 其他 5 个 action 组合（background_swap/model_photo/lifestyle/fashion_model/fashion_lifestyle）均不受影响
- [x] 全部 24 个组合（6 actions × 4 diagnosis types）matched: true

## 执行结果
✅ 完成时间：2026-04-15 01:00 UTC+8
修改：lib/diagnosis-workflow-map.ts

验证结果：
- product_photo + traffic/customer/efficiency/unclear → domestic_womenswear_dress_hero_branded ✅
- background_swap + any → domestic_womenswear_top_main_white ✅
- model_photo + any → domestic_womenswear_top_model ✅
- lifestyle + any → domestic_womenswear_top_lifestyle ✅
- fashion_model + any → domestic_womenswear_top_model ✅
- fashion_lifestyle + any → domestic_womenswear_top_lifestyle ✅

## 下一步
五题系统所有路由问题已全部解决。下一步可推进：
1. 端到端主流程测试（browser flow 脚本）
2. 完善结构化模板输出（execute API 的 prompt 优化）
3. 检查 execute API 实际调用 MiniMax 时是否有参数遗漏

---

## 任务 ID
task-2026-04-15-003

## 任务类型
task_type: feature

## 分配给
assigned_to: hermes-agent

## 目标
为图片生成 prompt 注入诊断上下文（painPoint、persona、businessType、style），提升 MiniMax 生成结果的个性化程度

## 问题描述

`execute/generate/route.ts` 调用 `generateImageFromOptions` 时，prompt 只有：
1. 固定的 `TYPE_PROMPT_PREFIX` 前缀（"Professional e-commerce product photography..."）
2. 用户自己在输入框填写的文字

缺少用户业务场景上下文，导致生成结果千篇一律。

## 具体修改

### 文件1：`app/api/execute/generate/route.ts`
新增参数接收：
```ts
userBusinessType,  // 业务类型
userPainPoint,      // 核心痛点
userPersona,        // 用户画像
style,              // 风格（商业/极简/高端）
```

构建诊断上下文字符串 prepend 到用户 prompt：
```ts
const ctxParts: string[] = [];
if (userPersona) ctxParts.push(`目标用户：${userPersona}`);
if (userPainPoint) ctxParts.push(`核心需求：${userPainPoint}`);
if (userBusinessType) ctxParts.push(`业务类型：${userBusinessType}`);
if (style) ctxParts.push(`风格：${style}`);
const diagnosisContext = ctxParts.length > 0 ? `${ctxParts.join("，")}。` : "";
const enrichedPrompt = `${diagnosisContext}${prompt ?? ""}`.trim();
```

### 文件2：`app/execute/page.tsx`
调用 generate API 时新增：
```tsx
body.userPainPoint = diagnosisResult.painPoint;
body.userPersona = diagnosisResult.persona;
```

## 验收标准

- [x] `userPainPoint` 从 `diagnosisResult.painPoint` 正确传递
- [x] `userPersona` 从 `diagnosisResult.persona` 正确传递
- [x] MiniMax prompt 包含诊断上下文（目标用户、核心需求、业务类型、风格）
- [x] 不影响现有文案生成逻辑（图片增强不影响文字）

## 执行结果
✅ 完成时间：2026-04-15 01:38 UTC+8
修改：`app/api/execute/generate/route.ts`、`app/execute/page.tsx`

## 发现的其他问题（未解决）
1. `lifestyle`/`fashion_model`/`fashion_lifestyle` 在 `TEMPLATE_TYPE_MAP` 缺失 → 回退为 `product_photo`
2. 文案生成使用 DeepSeek，与 MiniMax 图片生成是独立系统

---

## 任务 ID
task-2026-04-15-004

## 任务类型
task_type: bug-fix

## 分配给
assigned_to: hermes-agent

## 目标
修复 `lifestyle`、`fashion_model`、`fashion_lifestyle` 三个 action 在 `TEMPLATE_TYPE_MAP` 中缺失映射，全部错误回退为 `product_photo` 的问题

## 问题描述

`lib/image/index.ts` 的 `TEMPLATE_TYPE_MAP` 只定义了 4 个映射：
```ts
product_photo → product_photo
model_photo → model_photo
background_swap → background_swap
bg_white → product_photo
```

缺失：`lifestyle`、`fashion_model`、`fashion_lifestyle` → 均回退到 `product_photo`

## 具体修改

文件：`lib/image/index.ts`

```ts
const TEMPLATE_TYPE_MAP: Record<string, ImageTaskType> = {
  product_photo: "product_photo",
  model_photo: "model_photo",
  background_swap: "background_swap",
  bg_white: "product_photo",
  fashion_model: "model_photo",
  lifestyle: "product_photo",
  fashion_lifestyle: "product_photo",
};
```

## 验收标准

- [x] `fashion_model` 映射到 `model_photo`（时装模特图语义匹配）
- [x] `lifestyle` 映射到 `product_photo`（生活场景图）
- [x] `fashion_lifestyle` 映射到 `product_photo`（时尚生活图）
- [x] 调用 `generateImageFromOptions` 时不再因缺失映射而回退

## 执行结果
✅ 完成时间：2026-04-15 02:12 UTC+8
修改：`lib/image/index.ts`

## 下一步
1. 端到端主流程测试（browser flow 脚本）
2. 打通文案生成的 MiniMax 调用（当前依赖 DeepSeek）
3. 扩展 `ImageTaskType` 支持更多细分类型（lifestyle 等）

---

## 任务 ID
task-2026-04-15-005

## 任务类型
task_type: bug-fix

## 分配给
assigned_to: hermes-agent

## 目标
修复 `execute/page.tsx` 中 `IMAGE_ACTIONS` 与后端 `generate/route.ts` 不一致

## 问题描述

前端 `app/execute/page.tsx` 第17行：
```tsx
const IMAGE_ACTIONS = new Set(["product_photo", "model_photo", "background_swap"]);
```

后端 `app/api/execute/generate/route.ts` 第83-90行：
```ts
const IMAGE_ACTIONS = new Set([
  "product_photo", "model_photo", "background_swap",
  "lifestyle", "fashion_model", "fashion_lifestyle",
]);
```

缺失：`lifestyle`、`fashion_model`、`fashion_lifestyle` 三个 action。

导致：这三个 action 在前端被当作 text task，`isImageTask = false`，前端渲染错误的 UI 组件（文案结果而非图片结果）。

## 具体修改

文件：`app/execute/page.tsx`

```tsx
// 修改前
const IMAGE_ACTIONS = new Set(["product_photo", "model_photo", "background_swap"]);

// 修改后
const IMAGE_ACTIONS = new Set(["product_photo", "model_photo", "background_swap", "lifestyle", "fashion_model", "fashion_lifestyle"]);
```

## 验收标准

- [x] `execute/page.tsx` 的 `IMAGE_ACTIONS` 包含全部 6 个图片 action
- [x] `lifestyle`、`fashion_model`、`fashion_lifestyle` 在前端正确识别为 image task
- [x] 不影响现有 `product_photo`、`model_photo`、`background_swap` 的行为

## 执行结果
✅ 完成时间：2026-04-15 04:14 UTC+8
修改：`app/execute/page.tsx` 第17行

## 下一步
1. 端到端主流程测试（browser flow 脚本）
2. 打通文案生成的 MiniMax 调用（当前依赖 DeepSeek）
3. 修复 `lib/db.ts` Prisma schema 类型错误（`company`/`market` 字段）

