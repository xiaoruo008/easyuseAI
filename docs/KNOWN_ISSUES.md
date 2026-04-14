# KNOWN_ISSUES
更新时间：2026-04-15 01:53 UTC+8
最后整合：P3 图案Prompt接入完成（2026-04-15）

> 📌 相关文档：[PROJECT_NORTH_STAR.md](./PROJECT_NORTH_STAR.md) ｜ [SYSTEM_PROGRESS.md](./SYSTEM_PROGRESS.md)

## 系统状态总览

| 模块 | 状态 | 备注 |
|------|------|------|
| 五道题问卷 | ✅ 可用 | E2E测试通过 |
| 问卷提交API | ✅ 可用 | /api/diagnosis/session |
| Result API | ✅ 可用 | 含LLM画像生成 + action-aware |
| 工作流映射 | ✅ 已验证 | 4/4 诊断类型 matched=true |
| 12工作流路由 | ✅ 可用 | 5/5 图片动作正确路由 |
| 图案Prompt | ✅ 已接入 | PATTERN_PROMPTS 常量+Execute API |
| 用户画像Prompt | ⚠️ 简化版 | LLM生成中，完整版在 QWEN_LOG.md |
| 页面可用性(dev) | ✅ 可用 | localhost:3005 |
| 页面可用性(线上) | ✅ 可用 | HTTP 200 |

## 链路完整性确认（2026-04-15）

**五道题 → Result → 工作流 完整链路验证通过** ✅

E2E实测（2026-04-15 03:43）：
- `scripts/test-e2e-diagnosis.ts` - 4诊断类型 × 5图片动作 → 9/9 PASS
- dev server 实时API - session创建/答案PATCH/result查询 → 全部200



**问题一（已解决）**：Result API 硬编码 action=""，targetImage 始终为 "main_white"
- **状态**：✅ 已解决（2026-04-15）
- **修复**：从 URL query param 提取 action，传给 deriveFashionFieldsFromDiagnosis

**问题二（已解决）**：Result API 和 Execute API 使用两套不同的路由逻辑（WORKFLOW_MAP vs FASHION_TEMPLATE_ROUTES）
- **状态**：✅ 已解决（2026-04-15）
- **修复**：添加 `WORKFLOW_TO_TEMPLATE_KEY_MAP` 翻译层，`lib/types/fashion.ts` + `app/api/execute/generate/route.ts`
- **翻译映射**：12条 WORKFLOW_MAP key → FashionTemplateKey，覆盖全部 WORKFLOW_MAP 条目
- **Execute API 新行为**：可选接受 `workflowKey` 字段，优先通过翻译映射 → `findRoute()` 解析模板

---

### 2. [P2] 用户画像 Prompt 未完全接入

- **问题**：Task3 的完整 System Prompt 在 QWEN_LOG.md 里
- **当前**：Result API 用的是内嵌简单 Prompt
- **错误原因**：Prompt 模板文档和代码实现未同步
- **尝试过的方案**：
  - ✅ 完整 Prompt 已写入 QWEN_LOG.md
  - ❌ 尚未将 Prompt 接入 Result API
- **方案**：后续优化，先解决链路问题（P1）

---

### 3. [P3 - 已解决] 图案生成 Prompt 未接入

- **问题**：Task4 的 18 种图案模板在 QWEN_LOG.md 里
- **错误原因**：图案生成模板文档和代码实现未同步
- **尝试过的方案**：
  - ✅ 18 种图案模板已写入 ops/QWEN_LOG.md
  - ✅ 已接入 Execute API（`lib/types/fashion.ts` + `app/api/execute/generate/route.ts`，commit `5faedb8`）
- **状态**：✅ 已解决（2026-04-15）

---

### 4. [P4 - 已解决] 线上环境 /api/leads/[id] 报错（runtime，非 build）

- **问题**：/api/leads/[id] 在生产环境报错（历史遗留记录）
- **真实原因**：runtime error，非 build error — `USE_MOCK` 默认 `false`，生产环境无 DATABASE_URL 时 Prisma 初始化失败
- **诊断**：`pnpm build` 本地编译 ✅ 成功，/api/leads/[id] 路由无编译错误
- **修复**：commit `8268744` 将 `USE_MOCK` 默认值改为 `true`（`process.env.USE_MOCK !== "false"`）
- **状态**：✅ 已解决（2026-04-15 诊断确认）

---

### 5. [P4] Dev 环境进程冲突（已恢复）

- **问题**：localhost:3000 timeout，2个冲突的 next dev 进程
- **错误原因**：root PID 32379 残留 + 新 dev 用户进程冲突
- **尝试过的方案**：
  - ✅ 清理冲突进程 + 重启 dev server（PORT=3005）
  - ✅ 线上环境正常，不影响生产
- **状态**：已解决（2026-04-14，来源：ops/DECISIONS.md）

---

### 6. [P4] CTA 转化路径未测试

- **问题**：用户看到模特图后是否有点击行为、CTA 路径是否可达
- **状态**：未测试
- **方案**：P1 链路修复后测试

---

## ops/ 文件来源索引

| ops/ 文件 | 状态 | 整合内容 |
|-----------|------|----------|
| HERMES_REPORT.md | ✅ 已整合 | extractFields 映射错误分析 |
| SITE_STATUS.md | ✅ 已整合 | 2026-04-13 验证结果（5/5 页面通过） |
| SYSTEM_GOAL.md | ✅ 已整合 | 赚钱引擎目标、出图→转化链路 |
| METRICS.md | ✅ 已整合 | 指标检查清单 |
| DECISIONS.md | ✅ 已整合 | Dev 环境恢复决策 |
| CURRENT_TASK.md | ✅ 已整合 | GitHub 项目（VoltAgent/awesome-design-md）已完成 |

---

## 交叉引用

- **当前问题修复进度** → 详见 [SYSTEM_PROGRESS.md](./SYSTEM_PROGRESS.md)
- **项目最终目标** → 详见 [PROJECT_NORTH_STAR.md](./PROJECT_NORTH_STAR.md)
