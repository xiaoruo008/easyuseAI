# 方案：最小改动实现 TRENDING_PROMPT_PREFIX（爆款前缀层）

## 一、当前 prompt 构建顺序

```
用户 prompt 输入
       │
       ▼
┌─────────────────────────┐
│  stylePrefix (optional) │  ← STYLE_GUIDANCE[input.style]（如 "Luxury boutique aesthetic..."）
└──────────┬──────────────┘
           │ concat
           ▼
┌─────────────────────────┐
│  typePrefix             │  ← TYPE_PROMPT_PREFIX[input.type]（如 "Professional e-commerce..."）
└──────────┬──────────────┘
           │ concat
           ▼
┌─────────────────────────┐
│  fullPrompt             │  = `${stylePrefix}${typePrefix} ${input.prompt}`.slice(0, 1500)
└─────────────────────────┘
```

**拼接公式**：`stylePrefix + typePrefix + " " + userPrompt`

- `stylePrefix`：可选，取决于用户是否选择了 `minimal | luxury | commercial`
- `typePrefix`：必选，取决于 `input.type`（`product_photo | model_photo | background_swap | lifestyle`）
- 顺序：style → type → prompt

---

## 二、相关文件及当前字段

### 2.1 `lib/image/types.ts` — ImageTaskInput 接口

**路径**：`/mnt/e/AI/easyuseAI/lib/image/types.ts`，第 5-11 行

```typescript
export interface ImageTaskInput {
  type: ImageTaskType;                    // 必填
  prompt: string;                         // 必填
  referenceImageUrl?: string;             // 可选
  style?: "minimal" | "luxury" | "commercial"; // 可选
  aspectRatio?: ImageAspectRatio;         // 可选
}
```

**当前无 `diagnosisType` 字段**。

### 2.2 `lib/image/index.ts` — GenerateImageOptions 接口

**路径**：`/mnt/e/AI/easyuseAI/lib/image/index.ts`，第 32-39 行

```typescript
export interface GenerateImageOptions {
  templateId: string;
  variables?: Record<string, unknown>;
  originalImageUrl?: string;
  userRefinement?: string;
  aspectRatio?: "1:1" | "3:4" | "16:9";
  style?: "minimal" | "luxury" | "commercial";
}
```

### 2.3 `lib/image/providers/minimax-cn.ts` — prompt 构建逻辑

**路径**：`/mnt/e/AI/easyuseAI/lib/image/providers/minimax-cn.ts`

| 行号 | 内容 |
|------|------|
| 29-36 | `TYPE_PROMPT_PREFIX` 定义（各 type 的前缀） |
| 38-42 | `STYLE_GUIDANCE` 定义（各 style 的引导词） |
| 63-76 | `generate()` 方法：prompt 拼接逻辑 |
| 73 | `const typePrefix = TYPE_PROMPT_PREFIX[input.type] ?? TYPE_PROMPT_PREFIX.product_photo;` |
| 74 | `const styleGuidance = input.style ? (STYLE_GUIDANCE[input.style] ?? "") : "";` |
| 75 | `const stylePrefix = styleGuidance ? \`${styleGuidance} \` : "";` |
| 76 | `const fullPrompt = \`${stylePrefix}${typePrefix} ${input.prompt}\`.slice(0, 1500);` |
| 220-228 | `generateBatch()` 方法：同样的 prompt 拼接逻辑 |

### 2.4 `app/api/execute/generate/route.ts` — 参数传递链

**路径**：`/mnt/e/AI/easyuseAI/app/api/execute/generate/route.ts`

| 行号 | 内容 |
|------|------|
| 114-178 | `generateImageWithRetry()` 函数：接收 `opts`，解构出 `templateId`, `originalImageUrl`, `userRefinement`, `aspectRatio`, `style` |
| 126, 142, 158 | 三次调用 `generateImageFromOptions()`，传参结构一致 |
| 201-243 | POST handler 接收 body：解构出 `style`, `aspectRatio`, `referenceImageUrl` 等 |

**注意**：当前 `route.ts` 的 body 解析中**没有 `diagnosisType` 字段**。

---

## 三、完整参数链

```
route.ts POST body
  ├── sessionId
  ├── action
  ├── type           ← 诊断结果类型（ResultType）
  ├── style          ← 风格选择
  ├── aspectRatio
  ├── referenceImageUrl
  ├── userPersona    ← 诊断上下文
  ├── userPainPoint  ← 诊断上下文
  ├── userBusinessType ← 诊断上下文
  └── ... (无 diagnosisType)

         ▼ route.ts 调用 generateImageWithRetry() 时传入
generateImageWithRetry(opts: {
  templateId, originalImageUrl, userRefinement,
  aspectRatio, category, style
})

         ▼ generateImageFromOptions() 调用 provider.generate()
provider.generate({
  type, prompt, referenceImageUrl, aspectRatio, style
  // 无 diagnosisType
})

         ▼ MiniMaxCNProvider.generate() 构建 prompt
fullPrompt = `${stylePrefix}${typePrefix} ${input.prompt}`
```

---

## 四、最小改动实现方案

### 改动 1：ImageTaskInput 新增 diagnosisType 字段

**文件**：`lib/image/types.ts`  
**行号**：第 11 行（`aspectRatio?: ImageAspectRatio;` 之后）

**改动内容**：在 `ImageTaskInput` 接口中新增可选字段

```typescript
export interface ImageTaskInput {
  type: ImageTaskType;
  prompt: string;
  referenceImageUrl?: string;
  style?: "minimal" | "luxury" | "commercial";
  aspectRatio?: ImageAspectRatio;
  diagnosisType?: "traffic" | "customer" | "efficiency" | "unclear";  // ← 新增
}
```

**是否影响接口协议**：❌ 否。这是新增可选字段（`?`），所有现有调用方不传此字段时行为完全不变。

---

### 改动 2：GenerateImageOptions 新增 diagnosisType 字段

**文件**：`lib/image/index.ts`  
**行号**：第 39 行（`style?: ...` 之后）

**改动内容**：在 `GenerateImageOptions` 接口中新增可选字段

```typescript
export interface GenerateImageOptions {
  templateId: string;
  variables?: Record<string, unknown>;
  originalImageUrl?: string;
  userRefinement?: string;
  aspectRatio?: "1:1" | "3:4" | "16:9";
  style?: "minimal" | "luxury" | "commercial";
  diagnosisType?: "traffic" | "customer" | "efficiency" | "unclear";  // ← 新增
}
```

**是否影响接口协议**：❌ 否。可选字段，不传则不传。

---

### 改动 3：generateImageFromOptions() 透传 diagnosisType

**文件**：`lib/image/index.ts`  
**行号**：第 55-61 行（`provider.generate()` 调用）

**改动内容**：将 `diagnosisType` 从 `GenerateImageOptions` 透传给 `provider.generate()`

```typescript
// 第 55-61 行，改为：
return provider.generate({
  type,
  prompt: opts.userRefinement ?? "",
  referenceImageUrl: opts.originalImageUrl,
  aspectRatio: opts.aspectRatio,
  style: opts.style,
  diagnosisType: opts.diagnosisType,  // ← 新增透传
});
```

**是否影响接口协议**：❌ 否。仅增加透传逻辑。

---

### 改动 4：MiniMaxCNProvider 新增 TRENDING_PROMPT_PREFIX

**文件**：`lib/image/providers/minimax-cn.ts`  
**行号**：第 36 行之后（`TYPE_PROMPT_PREFIX` 定义块之后）

**新增常量**：

```typescript
// 爆款前缀：根据诊断类型注入转化率增强 prompt
const TRENDING_PROMPT_PREFIX: Record<string, string> = {
  traffic:    "Trending on social media, highly shareable viral content, ",
  customer:   "Resonates deeply with target customers, emotional connection, ",
  efficiency: "Streamlined productivity aesthetic, clean and efficient visual, ",
  unclear:    "Versatile commercial appeal, broad audience engagement, ",
};
```

---

### 改动 5：generate() 和 generateBatch() 的 prompt 构建逻辑

**文件**：`lib/image/providers/minimax-cn.ts`  
**行号**：
- `generate()` 方法：第 73-76 行
- `generateBatch()` 方法：第 225-228 行

**当前逻辑（generate() 第 73-76 行）**：

```typescript
const typePrefix = TYPE_PROMPT_PREFIX[input.type] ?? TYPE_PROMPT_PREFIX.product_photo;
const styleGuidance = input.style ? (STYLE_GUIDANCE[input.style] ?? "") : "";
const stylePrefix = styleGuidance ? `${styleGuidance} ` : "";
const fullPrompt = `${stylePrefix}${typePrefix} ${input.prompt}`.slice(0, 1500);
```

**改为**：

```typescript
const typePrefix = TYPE_PROMPT_PREFIX[input.type] ?? TYPE_PROMPT_PREFIX.product_photo;
const styleGuidance = input.style ? (STYLE_GUIDANCE[input.style] ?? "") : "";
const stylePrefix = styleGuidance ? `${styleGuidance} ` : "";
const trendingPrefix = input.diagnosisType ? (TRENDING_PROMPT_PREFIX[input.diagnosisType] ?? "") : "";
const fullPrompt = `${trendingPrefix}${stylePrefix}${typePrefix} ${input.prompt}`.slice(0, 1500);
```

**新的 prompt 拼接顺序**：`trendingPrefix + stylePrefix + typePrefix + userPrompt`

**generateBatch() 也做同样修改**（第 225-228 行）。

**是否影响接口协议**：❌ 否。仅改变 prompt 内容，不改变输入输出结构。

---

### 改动 6：route.ts 传递 diagnosisType

**文件**：`app/api/execute/generate/route.ts`  
**行号**：
- 第 114-121 行：`generateImageWithRetry()` 参数接口
- 第 126, 142, 158 行：三次 `generateImageFromOptions()` 调用

**6a. 修改 generateImageWithRetry 参数接口**（第 114-121 行）：

```typescript
// 原来：
async function generateImageWithRetry(opts: {
  templateId: string;
  originalImageUrl?: string;
  userRefinement?: string;
  aspectRatio?: string;
  category?: string;
  style?: "minimal" | "luxury" | "commercial";
}): Promise<...>

// 改为：
async function generateImageWithRetry(opts: {
  templateId: string;
  originalImageUrl?: string;
  userRefinement?: string;
  aspectRatio?: string;
  category?: string;
  style?: "minimal" | "luxury" | "commercial";
  diagnosisType?: "traffic" | "customer" | "efficiency" | "unclear";  // ← 新增
}): Promise<...>
```

**6b. 修改 generateImageWithRetry 调用处**（第 126, 142, 158 行）：

每次调用 `generateImageFromOptions({...})` 时，增加 `diagnosisType` 透传。

**6c. 修改 route.ts POST body 解析**（第 201-243 行）：

在 body 解构中新增 `diagnosisType` 字段：

```typescript
const {
  sessionId,
  action,
  type,
  leadId: reqLeadId,
  // ... 现有字段 ...
  // 诊断上下文
  userBusinessType,
  userPainPoint,
  userPersona,
  diagnosisType,  // ← 新增（从 Result API 传入）
} = body as { ... };
```

**6d. 修改 generateImageWithRetry 调用时传入 diagnosisType**（第 330-337 行）：

```typescript
const { output, errorMessage } = await generateImageWithRetry({
  templateId,
  originalImageUrl: referenceImageUrl,
  userRefinement: finalPrompt,
  aspectRatio,
  category: cat,
  style: (style as "minimal" | "luxury" | "commercial") ?? undefined,
  diagnosisType: diagnosisType as any,  // ← 新增
});
```

**是否影响接口协议**：❌ 否。新增可选字段，不传则行为完全不变。

---

## 五、改动汇总表

| # | 文件 | 行号 | 改动类型 | 描述 |
|---|------|------|----------|------|
| 1 | `lib/image/types.ts` | ~11 | 新增字段 | `ImageTaskInput.diagnosisType?: "traffic" \| "customer" \| "efficiency" \| "unclear"` |
| 2 | `lib/image/index.ts` | ~39 | 新增字段 | `GenerateImageOptions.diagnosisType?: ...` |
| 3 | `lib/image/index.ts` | ~61 | 透传 | `provider.generate()` 调用增加 `diagnosisType: opts.diagnosisType` |
| 4 | `lib/image/providers/minimax-cn.ts` | ~37 | 新增常量 | `TRENDING_PROMPT_PREFIX` 定义（4个 diagnosis type 对应前缀） |
| 5 | `lib/image/providers/minimax-cn.ts` | ~76 | 修改拼接 | `generate()` 的 `fullPrompt` 改为含 `trendingPrefix` |
| 6 | `lib/image/providers/minimax-cn.ts` | ~228 | 修改拼接 | `generateBatch()` 的 `fullPrompt` 改为含 `trendingPrefix` |
| 7 | `app/api/execute/generate/route.ts` | ~121 | 新增参数 | `generateImageWithRetry()` opts 增加 `diagnosisType` |
| 8 | `app/api/execute/generate/route.ts` | ~201-243 | 新增解析 | POST body 解构增加 `diagnosisType` |
| 9 | `app/api/execute/generate/route.ts` | ~330-337 | 透传 | `generateImageWithRetry()` 调用增加 `diagnosisType` |
| 10 | `app/api/execute/generate/route.ts` | ~126,142,158 | 透传 | 三处 `generateImageFromOptions()` 调用增加 `diagnosisType` |

---

## 六、是否满足约束条件

| 约束 | 结论 |
|------|------|
| 不改接口协议 | ✅ 满足。所有改动均为新增**可选**字段（`?`），现有调用方不传时行为完全不变。 |
| 不改返回结构 | ✅ 满足。`ImageTaskOutput` 和 API 返回结构完全不变，仅改变传入 provider 的 prompt 内容。 |

---

## 七、prompt 构建顺序变化对比

### 改动前

```
stylePrefix + typePrefix + " " + userPrompt
[可选]     [必选]        [用户输入]
```

### 改动后

```
trendingPrefix + stylePrefix + typePrefix + " " + userPrompt
[可选]       [可选]     [必选]        [用户输入]
```

- `trendingPrefix` 仅在 `input.diagnosisType` 有值时注入
- 总 prompt 长度仍然限制在 1500 字符（`.slice(0, 1500)`）

---

## 八、注意事项

1. **TRENDING_PROMPT_PREFIX 的具体文案**由 Qwen 负责编写，以上仅为占位结构。
2. `diagnosisType` 的值 `"traffic" | "customer" | "efficiency" | "unclear"` 需要与 Result API 侧协商一致，确保 route.ts 能从 body 中正确拿到此字段。
3. 如果未来 FalProvider 或其他 Provider 也需要支持 `diagnosisType`，只需在各自 provider 的 `generate()` 中做同样处理即可，`ImageTaskInput` 已定义通用字段。
