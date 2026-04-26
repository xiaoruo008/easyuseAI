# 内容生产批处理报告

**运行时间**: 2026-04-22 09:02 UTC
**批次ID**: content_batch_20260422

---

## 环境检查

| 项目 | 状态 | 备注 |
|------|------|------|
| Python 3.10.12 | ✅ | 可用 |
| scripts/qwen_runner.py | ✅ | 存在 |
| ops/QWEN_FRESH_CONTENT_BATCH_PROMPT.md | ✅ | 存在 |
| scripts/dedupe_check_preview.py | ✅ | 存在 |
| DASHSCOPE_API_KEY | ⚠️ 未设置 | 无法进行真实 Qwen 调用 |

---

## Qwen 批量生成

**执行状态**: ⚠️ 跳过（无 API Key）

**失败原因**: `DASHSCOPE_API_KEY` 环境变量未设置，Qwen Runner 依次尝试：
1. API 模式 → HTTP 401（认证失败）
2. CLI 模式 → `qwen` 命令不存在或挂起

**后续行动**:
- 需要设置 `DASHSCOPE_API_KEY` 环境变量（百炼平台获取）
- 获取后执行：
  ```bash
  DASHSCOPE_API_KEY=your_key_here python3 scripts/qwen_runner.py \
    ops/QWEN_FRESH_CONTENT_BATCH_PROMPT.md \
    --output logs/qwen_batch_$(date +%Y%m%d_%H%M%S).log
  ```

**日志文件**: `logs/qwen_batch_20260422_090200.log`（不完整，仅到 CLI 尝试阶段）

---

## 去重检查

**执行状态**: ✅ 成功

**检查目录**: `ops/`（20个 .md 文件）

**摘要**:

| 指标 | 数值 |
|------|------|
| 总记录数 | 20 |
| 精确重复组 | 4 组（8条记录） |
| 模糊重复对 | 4 对 |
| 重复率 | 40.0% |
| 唯一记录 | 8 |
| 状态 | ⚠️ 有重复内容 |

**精确重复详情**:
1. `CLAUDE_REPORT.md` × 2 — DEPRECATED 归档标记重复
2. `HERMES_LOG.md` × 2 — DEPRECATED 归档标记重复
3. `METRICS.md` × 2 — DEPRECATED 归档标记重复
4. `SITE_STATUS.md` × 2 — DEPRECATED 归档标记重复

> 注：当前重复源为 ops 目录中的过时文档标记，非内容本身重复。

**模糊重复**: 均为同类 .md 文件内部的自相似（metadata 字段重叠），无实际内容重复风险。

---

## 归档文件

```
logs/
├── qwen_batch_20260422_090200.log          # Qwen Runner 执行日志（不完整）
├── dedupe_ops_20260422_090135.json         # 去重 JSON 报告
├── dedupe_ops_20260422_090135.html         # 去重 HTML 报告
└── content_batch_summary_20260422_090252.md # 本摘要文件
```

---

## 后续建议

1. **设置 API Key**（P0）
   - 前往阿里云百炼平台获取 `DASHSCOPE_API_KEY`
   - 设置到环境变量后重跑 Qwen 生成步骤

2. **清理 ops/ 重复文件**（P1）
   - CLAUDE_REPORT.md / HERMES_LOG.md / METRICS.md / SITE_STATUS.md 已有 DEPRECATED 标记
   - 建议归档到 `ops/archive/` 或删除

3. **建立内容输出目录**（P1）
   - 创建 `data/batch_content/` 存放 Qwen 生成结果
   - `logs/batch_content_output.jsonl` 为生成目标文件

4. **串联到 EasyUseAI 站内**（P2）
   - 生成的 JSONL 内容可导入产品描述数据库
   - 或作为 prompt 模板来源接入 execute 页面
