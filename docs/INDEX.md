# 📋 项目状态索引 — 单一真相源
更新时间：2026-04-14 21:30 UTC+8

## ⚠️ 文件规范

**只读这些文件，其他不要碰：**

| 优先级 | 文件 | 用途 |
|--------|------|------|
| 🥇 | `docs/PROJECT_NORTH_STAR.md` | **最终目标**（只写一次） |
| 🥇 | `docs/SYSTEM_PROGRESS.md` | **当前系统状态**（每轮更新） |
| 🥇 | `docs/KNOWN_ISSUES.md` | **已知问题**（发现就更新） |
| 🥈 | `ops/HERMES_REPORT.md` | 每轮执行汇报 |
| 🥈 | `ops/CURRENT_TASK.md` | 当前任务（最小推进单位） |

**只允许存在的文件（删除其他）：**
```
docs/
  PROJECT_NORTH_STAR.md   ← 目标
  SYSTEM_PROGRESS.md      ← 状态
  KNOWN_ISSUES.md        ← 问题

ops/
  HERMES_REPORT.md        ← 循环汇报
  CURRENT_TASK.md         ← 当前任务
  QWEN_LOG.md            ← Qwen内容产出
  EXECUTOR_LOG.md        ← 执行记录
```

**删除（重复/废弃）：**
```
根目录 EXECUTOR_LOG.md  → 已移到 ops/
根目录 QWEN_LOG.md      → 已移到 ops/
根目录 ops-summary.md    → 废弃
public/ops-summary.md    → 废弃
public/ops-status.json   → 废弃
tasks/                   → 全部废弃
ops/CLAUDE_REPORT.md     → 废弃
ops/HERMES_LOG.md        → 废弃
ops/METRICS.md           → 废弃
ops/DECISIONS.md         → 废弃
ops/SYSTEM_GOAL.md       → 已整合到 docs/
```

## 循环流程

```
每30分钟：
1. 读 docs/SYSTEM_PROGRESS.md
2. 读 docs/KNOWN_ISSUES.md
3. 选1个最小任务写入 ops/CURRENT_TASK.md
4. 分配给 Claude Code 或 Qwen Code
5. 执行后更新 docs/SYSTEM_PROGRESS.md
6. 写入 ops/HERMES_REPORT.md
7. 完成后更新 ops/CURRENT_TASK.md
```

## 当前链路

```
五道题提交 → Result API → extractFields() [有bug] → 工作流
                              ↓
                    deriveFashionFieldsFromDiagnosis()
                              ↓
                    应使用这个但目前没用
```

## 下一轮目标

修复 result/route.ts：使用 deriveFashionFieldsFromDiagnosis() 替代 extractFields()
