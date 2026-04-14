# SYSTEM_PROGRESS
更新时间：2026-04-15 01:53 UTC+8
最后整合：P3 图案Prompt接入（2026-04-15 01:53）

> 📌 相关文档：[PROJECT_NORTH_STAR.md](./PROJECT_NORTH_STAR.md) ｜ [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)

## 系统状态总览

| 模块 | 状态 | 备注 |
|------|------|------|
| 五道题问卷 | ✅ 可用 | E2E测试通过 |
| 问卷提交API | ✅ 可用 | /api/diagnosis/session |
| Result API | ✅ 可用 | 含LLM画像生成 |
| 工作流映射 | ✅ 已验证 | deriveFashionFieldsFromDiagnosis → resolveWorkflow → matched=true（2026-04-14实测） |
| 12工作流路由 | ✅ 可用 | routeFromAction() |
| 图案Prompt | ✅ 已接入 | PATTERN_PROMPTS 常量（lib/types/fashion.ts）+ Execute API 注入 |
| 用户画像Prompt | ✅ 文档完成 | QWEN_LOG.md |
| 模特上身图(model_photo) | ✅ 可用 | 真实OSS图片URL返回 |
| 页面可用性(dev) | ✅ 可用 | localhost:3005 |
| 页面可用性(线上) | ✅ 可用 | HTTP 200 |

## 核心问题（2026-04-14 本轮验证结论）

**已确认：五道题 → Result → 工作流链路完全通畅**

E2E实测结果：
```
POST /api/diagnosis/session → session_id: "uo34t0fskcmnyrf21n"
GET  /api/diagnosis/session/{id}/result
  → fields: { market:"domestic", gender:"womenswear", category:"top", targetImage:"main_white" }
  → workflow.matched: true ✅
  → workflowKey: "domestic_womenswear_top_main_white"
```

**`gender=unisex` 问题已排除**：
- `deriveFashionFieldsFromDiagnosis()` 对所有诊断类型统一返回 `gender: "womenswear"`
- WORKFLOW_MAP 有 `domestic_womenswear_top_main_white` → matched ✅
- 链路断裂问题（SYSTEM_PROGRESS 旧记录）实际上在之前已被 `deriveFashionFieldsFromDiagnosis()` 的实现解决

## 链路完整性（重新评估）

```
五道题提交 → Result API → deriveFashionFieldsFromDiagnosis() → ✅ TypeScript编译通过
                              ↓
                       resolveWorkflow(fields) → ✅ action-aware workflowKey
```

## 本轮修复（2026-04-15 第二轮）

**P1.4 - 五道题完整链路验证（已完成，2026-04-15 03:43）**：
- **验证方法**：
  1. `scripts/test-e2e-diagnosis.ts` - TypeScript单元测试（4诊断类型×5图片动作）
  2. 实时API测试 - dev server `localhost:3005` 真实HTTP请求
- **链路验证结果**：
  - 4/4 诊断类型（traffic/customer/efficiency/unclear）→ `matched=true` ✅
  - 5/5 图片动作（product_photo/model_photo/background_swap/lifestyle/fashion_model）→ 正确templateId ✅
  - Result API `?action=model_photo` → `workflowKey=domestic_womenswear_top_model` ✅
  - Result API `?action=write_marketing_content` → `workflowKey=domestic_womenswear_top_main_white`（内容动作默认main_white，符合预期）✅
- **E2E测试**：dev server POST /api/diagnosis/session → 201 ✅，PATCH answers → 200 ✅，GET /result → 200 ✅
- **结论**：五道题 → Result → 工作流 完整链路完全通畅，无断点

**P1.3 - Result页 router 未定义 bug（已完成，2026-04-15 01:16）**：
- **问题**：`app/result/page.tsx` 使用 `router.push()` 导航到 Execute 页面，但未导入/定义 `useRouter`，导致"立刻开始"免费试用按钮失效
- **修复**：
  1. 导入添加 `useRouter`
  2. `ResultContent` 组件内添加 `const router = useRouter()`
- **验证**：TypeScript `tsc --noEmit` ✅ 干净通过
- **影响**：五道题 → Result → Execute 转化链路的核心按钮（立即试用）

**P3 - 图案生成 Prompt 接入（已完成，2026-04-15 01:53）**：
- **问题**：18套图案生成 Prompt 模板仅存于 ops/QWEN_LOG.md 文档，未接入 Execute API 实际生成流程
- **修复**：
  1. 在 `lib/types/fashion.ts` 末尾添加 `PATTERN_PROMPTS` 常量（18条 key-value，value 为英文 examplePrompt）
  2. 在 `app/api/execute/generate/route.ts` 中，Execute API 在调用 `generateImageWithRetry` 前，查询 `PATTERN_PROMPTS[templateKey]`
  3. 最终 prompt 构成为：`basePatternPrompt + diagnosisContext + userPrompt`
- **翻译映射示例**：`suit_set_model` → "Full-body flat lay of a tailored 2-piece business suit set..." + 用户输入
- **验证**：TypeScript `tsc --noEmit` ✅ 通过
- **提交**：`5faedb8`

**P4 - 线上 /api/leads/[id] 报错诊断（已完成，2026-04-15 03:00）**：
- **问题**：KNOWN_ISSUES 记录"线上 build 报错"，错误原因：未知
- **诊断结果**：`pnpm build` 本地编译 ✅ 成功，/api/leads/[id] 路由无编译错误 → **真实问题是 runtime error**
- **根因**：`USE_MOCK` 旧逻辑默认 false，线上无 DATABASE_URL 时 Prisma 初始化 crash
- **已修复**：commit `8268744` 将 `USE_MOCK` 默认值改为 `true`（`process.env.USE_MOCK !== "false"`）
- **结论**：P4 问题已在更早前被修复，本次诊断确认其已解决，无需进一步行动

---

## 本轮修复（2026-04-15 第一轮）

**P1.1 - Result API 路由一致性修复**（已完成，2026-04-15）：
- **问题**：Result API `deriveFashionFieldsFromDiagnosis(result.type, "")` 硬编码 action=""，导致 `targetImage` 始终为 "main_white"
- **修复**：从请求 URL query param 提取 `action`，传递给 `deriveFashionFieldsFromDiagnosis(result.type, action)`
- **文件**：`app/api/diagnosis/session/[id]/result/route.ts`（line 15 + line 32）
- **状态**：✅ 已提交

**P1.2 - Execute API 支持 Result workflowKey**（本轮新增，2026-04-15）：
- **问题**：Result API 返回 `workflowKey`（如 `domestic_womenswear_top_main_white`），Execute API 使用 `routeFromAction()` 生成 `templateKey`（如 `top_model`），两套系统不兼容
- **修复**：
  1. 在 `lib/types/fashion.ts` 添加 `WORKFLOW_TO_TEMPLATE_KEY_MAP`（12条映射，覆盖全部 WORKFLOW_MAP 条目）
  2. 在 `app/api/execute/generate/route.ts` 支持可选 `workflowKey` 字段，优先使用翻译映射 → `findRoute()` 解析模板
  3. 未提供 `workflowKey` 时降级为原有 `routeFromAction()` 逻辑
- **翻译映射示例**：`domestic_womenswear_top_main_white` → `top_main_white`
- **状态**：✅ 已提交

**Result API 路由现状**：
- 修复前：`deriveFashionFieldsFromDiagnosis(type, "")` → 始终 `"main_white"`
- 修复后：`deriveFashionFieldsFromDiagnosis(type, action)` → action-aware
- Execute API：已是 action-aware ✅

## 当前瓶颈（已修正）

**最大瓶颈（P1）- 已排除**：
- ❌ `gender=unisex` 不在 WORKFLOW_MAP → **实测无此问题**，deriveFashionFieldsFromDiagnosis 统一返回 womenswear ✅

**P1 瓶颈 - Result/Execute 路由不一致**：✅ **本轮已解决**（P1.2）
- ⚠️ Result API 返回 `workflowKey`（如 `domestic_womenswear_top_main_white`），但 Execute API 使用 `routeFromAction()` 路由，**两套路由逻辑不一致**
  - Result API：`deriveFashionFieldsFromDiagnosis() → resolveWorkflow()` → WORKFLOW_MAP（12套）
  - Execute API：`deriveFashionFieldsFromDiagnosis() → routeFromAction()` → FASHION_TEMPLATE_ROUTES（20+套）
- **已修复**：添加 `WORKFLOW_TO_TEMPLATE_KEY_MAP` 翻译层，Execute API 支持 `workflowKey` 直接路由
- ⚠️ 五道题 action 标签是业务语言（"写引流内容"），不是时尚字段名

**次要瓶颈：**
- 用户画像 Prompt 未完全接入（Result API 用内嵌简单 Prompt，完整版在 QWEN_LOG.md）
- 图案生成 Prompt 未接入（18种模板在 QWEN_LOG.md）
- CTA 转化路径未测试
- app/result/page.tsx 有 router 未定义错误（与本题链路无关）

## 下一步

1. 【P1】统一 Result API 和 Execute API 的路由逻辑（Result 返回的 workflowKey 应被 Execute 使用）
2. 【P2】接入完整用户画像 Prompt（QWEN_LOG.md）
3. 【P3】接入图案生成 Prompt（18种模板，QWEN_LOG.md）
4. 【P4】测试 CTA 转化路径

---

## 历史记录（来自 ops/ 整合）

### 2026-04-13 验证结果（来源：ops/SITE_STATUS.md）
| 检查项 | 结果 |
|--------|------|
| 线上首页 | ✅ HTTP 200 |
| localhost:3005 | ✅ HTTP 200（EXECUTOR 已修复） |
| /execute | ✅ HTTP 200 |
| /result | ✅ HTTP 200 |
| /diagnosis | ✅ HTTP 200 |
| /submit | ✅ HTTP 200 |
| POST /api/diagnosis/session | ✅ HTTP 200 |
| POST /api/execute/generate (model_photo) | ✅ HTTP 200 + 真实OSS图片URL |
| browser flow | ✅ 5/5 通过 |
| browser mobile | ✅ 页面均可访问 |
| browser console | ✅ 无报错 |

### 2026-04-14 Dev环境恢复（来源：ops/DECISIONS.md）
- **判断依据：** 线上完全正常，本地 localhost:3000 timeout，2个冲突 next dev 进程
- **行动：** 清理冲突进程 + 重启 dev server（PORT=3005）
- **结论：** 非线上 P0 问题，仅影响本地开发调试

### 2026-04-14 GitHub任务（来源：ops/CURRENT_TASK.md）
- 任务：VoltAgent/awesome-design-md 项目识别
- 结论：非可运行应用，是静态资源库，无需部署
