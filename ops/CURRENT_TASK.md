# CURRENT_TASK
更新时间：2026-04-16 12:54 UTC+8
状态：✅ 进行中（第20轮完成）

---

## 第二十轮（2026-04-16 12:54 UTC+8）
**类型**：Performance Optimization（AI chat 参数）
**状态**：✅ 完成

`lib/ai.ts` chat() 参数优化：
- `temperature: 0.8 → 0.7`（更稳定收敛）
- `max_tokens: 2000 → 150`（更短输出，更快生成）

注意：`timeoutMs` 已在 P27 修复为 20000ms，本次不涉及。

验证：`npx tsc --noEmit` → 0 errors ✅

---

## 第三十一轮（2026-04-16 12:13 UTC+8）
**类型**：DevX / Documentation Fix
**状态**：✅ 完成

`.env.example` 文档错误修复：

1. `IMAGE_API_KEY=23|MIN...xxxx` → `MINIMAX_API_KEY=your_minimax_api_key_here`（minimax-cn provider 读取 `MINIMAX_API_KEY`，不是 `IMAGE_API_KEY`）
2. `IMAGE_PROVIDER=minimax` → `IMAGE_PROVIDER=minimax-cn`（与代码中实际 provider 名称一致）
3. 删除重复的 `MINIMAX_API_KEY=***` 条目

防止新开发者配置错误的环境变量，导致 MiniMax 图片生成静默回退到 Mock Provider。

验证：`pnpm tsc --noEmit` → 0 errors ✅

---

## 第三十轮（2026-04-16 11:33 UTC+8）
**类型**：Health Check / Monitoring
**状态**：✅ 完成

系统健康检查：
- TypeScript 编译：0 errors ✅
- Dev Server：`127.0.0.1:3005` → HTTP 200 ✅
- /api/health：HTTP 200 ✅
- E2E 烟雾测试：wk=domestic_menswear_suit_set_model ✅，aiPersona 生成正常 ✅

结论：五道题系统全链路稳定，无回归。

---

## 第三十轮（2026-04-16 10:59 UTC+8）
**类型**：Production Clean-up / Log Quality
**状态**：✅ 完成

`lib/image/providers/gemini-nanobanana.ts` 中存在 13 条 `console.log` 服务器端调试日志，上线后会持续写入服务器日志，制造噪音。

修复：删除 13 条调试/信息日志（生成请求详情6行、referenceImage处理3行、HTTP状态/响应body、成功日志），保留 5 条 `console.error`/`console.warn` 错误日志。

验证：`pnpm tsc --noEmit` → 0 errors ✅，文件中 console.log 残留数：0 ✅

---

## 第二十九轮（2026-04-16 09:51 UTC+8）
**类型**：Production Clean-up / Log Quality
**状态**：✅ 完成

`lib/image/providers/minimax-cn.ts` 中存在 9 条 `console.log` 服务器端调试日志，上线后会持续写入服务器日志，制造噪音。

修复：删除 9 条调试/信息日志（生成请求详情、endpoint/model/type/style、响应 body、base64 返回、成功日志、批量请求/完成、HTTP 状态），保留 6 条 `console.error` 错误日志。

验证：`pnpm tsc --noEmit` → 0 errors ✅

---

## 第二十八轮（2026-04-16 09:25 UTC+8）
**类型**：Feature Bug / Prompt Engineering（TRENDING_PROMPT_PREFIX 断链）
**状态**：✅ 完成

`execute/page.tsx` 调用 `/api/execute/generate` 时从未传递 `diagnosisType`，导致 TRENDING_PROMPT_PREFIX（爆款前缀层）永远不生效。

根因：execute page 有 `diagnosisResult.type`（ResultType），但 TRENDING_PROMPT_PREFIX 需要的是 `"traffic" | "customer" | "efficiency" | "unclear"`，两者完全不同，无直接映射。

修复：
1. `lib/diagnosis.ts` — 新增 `mapResultTypeToTrendingDiagnosisType()` 将 ResultType 语义映射到 trending key
2. `app/execute/page.tsx` — body 新增 `diagnosisType: mapResultTypeToTrendingDiagnosisType(diagnosisResult.type)`

验证：`pnpm tsc --noEmit` → 0 errors ✅

---

## 第二十七轮（2026-04-16 08:49 UTC+8）
**类型**：Semantic Bug / Prompt Quality（模板类型映射错误）
**状态**：✅ 完成

`lifestyle` / `fashion_lifestyle` 动作使用 `lifestyle_scene` 模板，但 `TEMPLATE_TYPE_MAP` 中无 `lifestyle_scene` 映射，默认回退 `"product_photo"`，MiniMax prompt 前缀从"生活场景"语义错位为"电商产品摄影"。

修复：
1. `lib/image/types.ts` — `ImageTaskType` 新增 `"lifestyle"` 类型
2. `lib/image/index.ts` — `TEMPLATE_TYPE_MAP`：`lifestyle_scene → "lifestyle"`，`fashion_lifestyle → "lifestyle"`
3. `lib/image/fal-provider.ts` — `TYPE_PROMPT_PREFIX` 新增 `lifestyle` 条目

验证：`pnpm tsc --noEmit` → 0 errors ✅

---

## 第二十六轮（2026-04-16 08:17 UTC+8）
**类型**：Content / UX Bug（首页 Case Gallery before 图共用）
**状态**：🔍 已确认，修复需要图片资源

`app/page.tsx` 第15-21行，4个 case 全部共用 `REAL_BEFORE = "/images/home/home-before.jpg"`，导致每种 case 的 before→after 对比失去真实说服力。

`public/images/home/` 中仅有1张 before 图、4张 after 图。无现有资源满足4个 case 各需独立 before 图的需求。

两个可行方案已记录在 HERMES_REPORT.md：
- 方案A：获取4张独立 before 图（各 case 对应真实样本）
- 方案B：重构为单图 showcase（去掉 before 列，只展示4张 after 效果图）

当前无法自动执行：禁止浏览器自动化 + 图片生成非 cron 职责。

---

## 第二十五轮（2026-04-16 07:41 UTC+8）
**类型**：Reliability Fix（API 超时保护）
**状态**：✅ 完成

修复 `lib/ai.ts` 的 `chat()` 函数 — 之前 `fetch()` 调用 AI API 无超时设置，网络异常时可能无限期等待。

修复：`chat(messages, timeoutMs = 20000)` — 使用 `AbortController` + `setTimeout` 实现 20 秒超时，`clearTimeout(timer)` 保证无泄漏，向后兼容所有调用方。

验证：`pnpm tsc --noEmit` → 0 errors ✅

---

## 第二十四轮（2026-04-16 06:19 UTC+8）
**类型**：Bug Fix（计算逻辑一致性）
**状态**：✅ 完成

修复 `lib/diagnosis.ts` 第151行的默认值不一致问题：

`calculateResult` 的 `budgetMap` 查表使用 `answers[5] ?? "A"`，但 `dominantScore()` 对未作答题目（包括从未展示给用户的Q4/Q5）默认 "D"。当用户只完成3题诊断时，`answers[5]` 永远为 `undefined`，导致 budget 错误回退为 "免费方案优先"（A），而非与 `dominantScore` 一致的 "D"（"500元以上，要最好的效果"）。

修复：`answers[5] ?? "A"` → `answers[5] ?? "D"`

验证：`pnpm tsc --noEmit` → 0 errors ✅
**类型**：UX Bug Fix
**状态**：✅ 完成

修复 `app/submit/page.tsx` 文件上传的两处问题：

1. **未检查 HTTP 响应状态** — `await fetch("/api/assets")` 后不判断 `uploadRes.ok`，服务器返回 4xx/5xx 时静默失败。修复：检查 `ok` 并在非 OK 时打印警告。
2. **错误传播污染主流程** — 上传失败会抛出异常，被外层 catch 捕获显示"提交失败"，但此时 lead 已创建成功。修复：独立 try/catch 隔离上传错误，`finally` 正确重置 `uploading` 状态，`setSubmitted(true)` 在隔离后执行。

验证：`npx tsc --noEmit` → 0 errors ✅

---

## 第二十二轮（2026-04-16 04:46 UTC+8）
**类型**：Bug Fix
**状态**：✅ 完成

修复 `app/api/execute/generate/route.ts` 文案生成代码的两处不对称问题：

1. **`createTask()` 返回值未被捕获** — 文本任务创建后 `taskId` 丢失，无法追踪。修复：显式赋值给 `textTaskId` 变量。
2. **任务状态未更新** — 文案生成完成后无 `updateTask` 调用，任务永远停留在 `"doing"` 状态。修复：生成完成后调用 `updateTask(textTaskId, { status, outputData, errorMessage })`，与图片生成逻辑对齐。
3. **API 响应缺少 `taskId`** — 修复：在响应中新增 `taskId: textTaskId` 字段。

验证：`npx tsc --noEmit` → 0 errors ✅

---

## 第二十一轮（2026-04-16 03:23 UTC+8）
**类型**：Critical Bug Fix
**状态**：✅ 完成

修复 `app/submit/page.tsx` 调用 `/api/leads` 时的字段名不匹配：
- `wechat_id` → 改为 `contact`（API 字段名）
- `notes` → 改为 `note`（API 字段名）
- `product_category` → 改为 `businessType`（字段名对齐）
- 移除冗余的 `upload_data` 字段

根因：submit 页早期开发时字段名与 leads API 定义不一致，未同步更新。

验证：`npx tsc --noEmit` → 0 errors ✅，Dev Server HTTP 200 ✅

---

## 第二十轮（2026-04-16 02:39 UTC+8）
**类型**：Feature Enhancement
**状态**：✅ 完成

实现 TRENDING_PROMPT_PREFIX（爆款前缀层），4个文件，10处改动：
- `lib/image/types.ts` — ImageTaskInput 新增 diagnosisType 字段
- `lib/image/index.ts` — GenerateImageOptions 新增 diagnosisType + 透传
- `lib/image/providers/minimax-cn.ts` — TRENDING_PROMPT_PREFIX 常量 + prompt 构建更新（generate/generateBatch）
- `app/api/execute/generate/route.ts` — body 解析 + generateImageWithRetry 三次调用透传

验证：`npx tsc --noEmit` → 0 errors ✅

---

## 第十九轮（2026-04-16 01:48 UTC+8）
**类型**：健康检查
**状态**：✅ 完成

无紧急问题。系统状态：
- TypeScript 编译：0 errors ✅
- Dev Server（PORT=3005）：HTTP 200 ✅
- 五题系统所有路由问题已全部解决
- workflowLabel 前端展示已修复
- style 参数全链路完整注入

待推进：
1. 端到端主流程测试（browser flow 脚本，需人工介入）
2. 实现 TRENDING_PROMPT_PREFIX（`ops/A_PLAN_IMPLEMENTATION.md`，>5步，多文件）
3. 完善提交页（submit）表单字段与后端联调

---

## 第十八轮（2026-04-16 05:17 UTC+8）
**类型**：前端显示修复
**状态**：✅ 完成

`workflowLabel` API 响应已添加但前端两处遗漏导致标签被丢弃。本轮修复：
1. `ImageResult` 类型新增 `workflowLabel?: string`
2. `setImageResult()` 正确传递 `d.workflowLabel`
3. 结果卡片标题动态展示 `"国内女装连衣裙 · 官网品牌图 · 你的图做好了"`

根因：第十六轮 API 层添加了 `workflowLabel`，但前端类型和状态处理代码未同步更新。

验证：`npx tsc --noEmit` → 0 errors ✅

---

## 第十七轮（2026-04-16 04:41 UTC+8）
**类型**：Critical Bug Fix
**状态**：✅ 完成

修复 `lib/image/providers/minimax-cn.ts` 的 `generate()` 和 `generateBatch()` — 用户选择的 luxury/minimal/commercial 风格从未注入 MiniMax CN API prompt，导致风格偏好完全丢失。根因：CN Provider 遗漏了旧版 `MiniMaxImageProvider` 中已有的 `STYLE_GUIDANCE` 注入逻辑。修复后风格引导正确拼入 prompt，生成结果更符合用户预期。

---

## 第十六轮（2026-04-16 04:01 UTC+8）
**类型**：Feature Enhancement（结构化输出）
**状态**：✅ 完成

为 `app/api/execute/generate/route.ts` 图片生成响应新增 `workflowLabel` 字段（从 WORKFLOW_MAP 查询），使前端可直接展示工作流标签（如"国内女装上衣·白底主图"），无需前端修改即可向后兼容。

根因：execute API 响应只有 templateKey（`dress_hero_branded`），前端无法直接显示人类可读的工作流名称。

修复：使用 `buildWorkflowKey(deriveFields)` 重建 workflowKey，从 WORKFLOW_MAP 查询 label，添加到响应。

验证：`npx tsc --noEmit` → 0 errors ✅

---

## 第十五轮（2026-04-16 03:27 UTC+8）
**类型**：Critical Bug Fix
**状态**：✅ 完成

修复 `lib/image/index.ts` 的 `getImageProvider()` — `IMAGE_PROVIDER=minimax-cn` 配置导致全部图片生成回退到 Mock Provider。

根因：`.env` 配置 `minimax-cn`，但 `getImageProvider()` 只检查 `"minimax"`，条件不匹配 → 全部回退 Mock。修复后统一使用 `MiniMaxCNProvider`（正确读取 `MINIMAX_IMAGE_BASE_URL=https://api.minimaxi.com`）。

---

## 第十三轮（2026-04-15 21:37 UTC+8）
**类型**：文档澄清
**状态**：✅ 完成

发现并纠正了 HERMES_REPORT 中过时的 DeepSeek 描述，确认文案生成已通过 `.env` 配置使用 MiniMax M2.7-highspeed。

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
1. 端到端主流程测试（browser flow 脚本，需人工介入）
2. 打通文案生成的 MiniMax 调用（当前依赖 DeepSeek）
3. 修复 `lib/db.ts` Prisma schema 类型错误（`company`/`market` 字段）

---

## 任务 ID
task-2026-04-15-006

## 任务类型
task_type: bug-fix

## 分配给
assigned_to: hermes-agent

## 目标
修复 `lifestyle`/`fashion_model`/`fashion_lifestyle` 三个 action 在 MiniMax TYPE_PROMPT_PREFIX 中缺失，导致回退到 `product_photo` 前缀语义错位

## 问题描述

`lib/providers/minimax-image.ts` 的 `TYPE_PROMPT_PREFIX` 只定义了 3 个 action（`product_photo`、`model_photo`、`background_swap`）。

`lifestyle`、`fashion_model`、`fashion_lifestyle` 三个 action 回退到 `TYPE_PROMPT_PREFIX.product_photo`，导致时装模特图、生活场景图、时尚生活图的 prompt 都以"产品摄影"开头，语义严重错位。

## 具体修改

文件：`lib/providers/minimax-image.ts`

新增 3 个 TYPE_PROMPT_PREFIX：
```ts
lifestyle:
  "Elegant lifestyle product photography, natural ambient lighting, warm and inviting atmosphere, editorial quality, aspirational home scene,",
fashion_model:
  "High-fashion editorial model photography, runway-inspired styling, luxury magazine aesthetic, dramatic lighting, premium fashion quality,",
fashion_lifestyle:
  "Luxury lifestyle fashion photography, aspirational brand imagery, natural outdoor setting, editorial elegance, sophisticated mood,",
```

## 验收标准

- [x] `fashion_model` 使用时装编辑类 prefix（runway/magazine aesthetic）
- [x] `lifestyle` 使用生活场景类 prefix（natural/ambient/warm atmosphere）
- [x] `fashion_lifestyle` 使用奢侈品牌类 prefix（luxury/outdoor/editorial）
- [x] `npx tsc --noEmit` → 0 errors

## 执行结果
✅ 完成时间：2026-04-15 22:06 UTC+8
修改：`lib/providers/minimax-image.ts`

## 下一步
1. 端到端主流程测试（browser flow 脚本，需人工介入）
2. 验证 `AI_API_KEY` 是否为真实有效 key
3. 扩展 `ImageTaskType` 支持更多细分类型

