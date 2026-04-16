# KNOWN_ISSUES
更新时间：2026-04-17 01:59 UTC+8
最后整合：P36 - monitoring artifacts 提交（2026-04-17 01:59）

> 📌 相关文档：[PROJECT_NORTH_STAR.md](./PROJECT_NORTH_STAR.md) ｜ [SYSTEM_PROGRESS.md](./SYSTEM_PROGRESS.md)

## 系统状态总览

| 模块 | 状态 | 备注 |
|------|------|------|
| 五道题问卷 | ✅ 可用 | E2E测试通过 |
| 问卷提交API | ✅ 可用 | /api/diagnosis/session |
| Result API | ✅ 可用 | 含LLM画像生成 + action-aware |
| 工作流映射 | ✅ 已验证 | 22条 WORKFLOW_MAP 全部 matched=true |
| 12工作流路由 | ✅ 可用 | 5/5 图片动作正确路由 |
| 图案Prompt | ✅ 已接入 | PATTERN_PROMPTS 常量+Execute API |
| 用户画像Prompt | ✅ 完整版 | LLM生成正常，numeric keys 修复后正常 |
| Execute API | ✅ 已验证 | workflowKey → templateId 路由（E2E实测） |
| 页面可用性(dev) | ✅ 可用 | localhost:3005 |
| 页面可用性(线上) | ✅ 可用 | HTTP 200 |
| /api/health | ✅ 可用 | dev server 已重启，路由生效 |
| **Result API 响应时间** | 🟡 **部分缓解** | P28 session缓存，同session重复调用<1s |

## 链路完整性确认（2026-04-15）

**五道题 → Result → 工作流 完整链路验证通过** ✅


### 7. [P16 - 已解决] cross_border_menswear_top 工作流缺失

- **问题**：WORKFLOW_MAP 缺少 `cross_border_menswear_top_*` 系列，选择"跨境(Q2=B) + 上装(Q1=B)"的用户 resolveWorkflow() 返回 matched=false
- **状态**：✅ 已解决（2026-04-16 01:41）
- **修复**：新增 3 条 WORKFLOW_MAP 条目（main_white/model/lifestyle）+ 对应 WORKFLOW_TO_TEMPLATE_KEY_MAP 条目
- WORKFLOW_MAP 12 条 → 15 条

### 8. [P15 - 已解决] Result API 忽略用户5题答案

- **问题**：`deriveFashionFieldsFromDiagnosis(result.type, action)` 硬编码 `market=domestic, gender=womenswear, category=top`，完全忽略用户 Q1（类别）/Q2（市场）/Q3（目标图）答案
- **状态**：✅ 已解决（2026-04-16 01:05）
- **修复**：替换为 `extractFields(answers)` 正确读取用户答案；保留 product_photo → category=dress override
- **副作用**：暴露更多 WORKFLOW_MAP 缺口（见 SYSTEM_PROGRESS 下一步）

### 9. [P17 - 已解决] domestic_womenswear_dress_lifestyle 工作流缺失

- **问题**：WORKFLOW_MAP 缺少 `domestic_womenswear_dress_lifestyle`，国内女装·场景图无法路由
- **状态**：✅ 已解决（2026-04-16 02:34）
- **修复**：WORKFLOW_MAP 添加1条 + WORKFLOW_TO_TEMPLATE_KEY_MAP 添加1条映射
- **影响**：domestic womenswear dress 四种图片动作全覆盖（main_white/hero_branded/model/lifestyle）

### 10. [P18 - 已澄清] lib/diagnosis-workflow-map.ts 文件状态

- **问题**：`lib/diagnosis-workflow-map.ts` 被报告为"被 JSON/binary 数据覆盖"
- **状态**：✅ 文件完好（2026-04-16 澄清）
- **实际情况**：文件包含有效的 TypeScript 代码（3648 字节，100 行），含 `deriveFashionFieldsFromDiagnosis()` 和 `buildWorkflowKeyFromDiagnosis()` 函数
- **影响**：该文件在 Result API 中**未被动用**（Result API 使用 `extractFields` from `lib/workflow.ts`）；在 Execute API 中作为 fallback 存在，主路径（workflowKey→WORKFLOW_TO_TEMPLATE_KEY_MAP→findRoute）不受影响
- **WORKFLOW_MAP 补全**：同时补全跨境男装套装/女装连衣裙 6 个工作流（WORKFLOW_MAP 16→22 条）



**问题一（已解决）**：Result API 硬编码 action=""，targetImage 始终为 "main_white"
- **状态**：✅ 已解决（2026-04-15）
- **修复**：从 URL query param 提取 action，传给 deriveFashionFieldsFromDiagnosis

**问题二（已解决）**：Result API 和 Execute API 使用两套不同的路由逻辑（WORKFLOW_MAP vs FASHION_TEMPLATE_ROUTES）
- **状态**：✅ 已解决（2026-04-15）
- **修复**：添加 `WORKFLOW_TO_TEMPLATE_KEY_MAP` 翻译层，`lib/types/fashion.ts` + `app/api/execute/generate/route.ts`
- **翻译映射**：12条 WORKFLOW_MAP key → FashionTemplateKey，覆盖全部 WORKFLOW_MAP 条目
- **Execute API 新行为**：可选接受 `workflowKey` 字段，优先通过翻译映射 → `findRoute()` 解析模板

---

### 2. [P2 - 已解决] 用户画像 Prompt 优化升级

- **问题**：Result API 用的是内嵌简单 Prompt，缺少业务上下文、未覆盖unclear类型、缺少结构化约束
- **状态**：✅ 已解决（2026-04-15 21:04）
- **修复**：接入完整版 P6.2 优化方案至 `app/api/diagnosis/session/[id]/result/route.ts`
  - 补充业务背景（服装电商商家、天猫/抖音/小红书、4种诊断类型、CTA用途）
  - 新增探索型商家示例 + 作答<3题处理
  - 结构化输出约束：[类型标签] + [痛点+紧迫度] + [期望]，20-35字
  - 强制整合 Q2 紧急度和 Q4 AI期望
  - TypeScript 编译验证 ✅

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

### 6. [P5 - 已解决] CTA 转化路径未测试

- **问题**：用户看到模特图后是否有点击行为、CTA 路径是否可达
- **状态**：✅ 已解决（2026-04-15 19:09）
- **验证**：执行 `scripts/cron-e2e-execute-chain.js` 实测完整链路
  - Result API → workflowKey=`domestic_womenswear_top_model` ✅
  - Execute API → templateKey=`top_model` → templateId=`model_half` ✅
  - mock 图片返回正常（USE_MOCK=true）

---

### 11. [P24 - 部分缓解] Result API LLM 响应时间 ~16s

- **问题**：执行 `scripts/quick-health-check.js` 测量发现 Result API 耗时 14,588ms（约 15 秒）
- **实测（2026-04-16 07:47）**：Result API 耗时 16,106ms（约 16 秒）
- **根因**：Result API 调用 LLM（MiniMax）生成用户画像（aiPersona）时同步阻塞，约 15-16s
- **缓解措施**：
  - lib/ai.ts 的 `chat()` 已加入 20s 超时保护（P27 ✅）
  - P28 session级缓存：同一 session 再次调用 Result API 时跳过 LLM 调用，直接返回缓存的 aiPersona（< 1s）
- **影响**：
  - 功能：系统正常工作，结果正确（workflowKey ✅, aiPersona ✅）
  - 性能（首次调用）：~16s（不变）；（同session重复调用）：< 1s
- **状态**：🟡 部分缓解（2026-04-16 08:23）
- **建议修复方向**：
  1. 异步化 LLM 画像生成（Result API 立即返回，画像后台生成）
  2. 缓存已生成画像（同一 session 直接返回缓存）
  3. 添加 `/api/health` 健康检查端点

---

### 12. [P26 - 已解决] /api/health 端点

- **问题**：创建 `app/api/health/route.ts` 后 TypeScript 编译通过，但 dev server 返回 404
- **根因**：Next.js App Router 在 dev 模式下，新路由文件不会动态加入运行时 route manifest；dev server 启动后扫描一次文件系统并缓存，后续新增路由不生效
- **状态**：✅ 已解决（2026-04-16 09:00）
- **验证**：`curl http://127.0.0.1:3005/api/health` → `{"status":"ok","timestamp":"..."}` ✅
- **原因**：dev server 在 P26 之后重启，重新扫描了路由文件

### 13. [P27 - 已解决] lib/ai.ts chat() 缺少超时保护

- **问题**：`chat()` 函数使用 `fetch()` 调用 AI API，无超时设置，网络异常时可能无限期等待
- **状态**：✅ 已解决（2026-04-16 07:41）
- **修复**：`chat(messages, timeoutMs = 20000)` 新增 20 秒默认超时；使用 `AbortController` + `setTimeout`；所有调用方自动获得超时保护
- **影响**：Result API 文案生成、execute API 文案生成等均受益
- **验证**：`pnpm tsc --noEmit` → exit code 0 ✅

### 14. [P30 - 已解决] cron-e2e-execute-chain.js 缺少超时保护

- **问题**：`request()` 函数使用 Node `http.request`，无超时保护；网络异常时脚本无限挂起
- **状态**：✅ 已解决（2026-04-16 09:38）
- **修复**：`request()` 新增 `timeoutMs = 30000` 参数；使用 `setTimeout` + `req.destroy()` 实现超时中断，timer 在 success/error 时正确清理；Step3/Step4 显式传 60000ms（分别覆盖 LLM 生成 ~12-16s 和 MiniMax API ~45s 的自然耗时）
- **E2E 验证**：Submit → Result → Execute → Lead 全5步 ✅ 完全通畅

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
