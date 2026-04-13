# 夜间值守 playbook

## 当前架构

```
next dev (localhost:3000)  ← 运行在 pts/0
Hermes Agent               ← 当前会话
Claude Code               ← 按需启动
浏览器自动化              ← scripts/browser.ts
```

## 值守流程

### 正常流程
1. 每 20 分钟健康检查一次
2. 检查内容：首页、diagnosis 入口、browser flow、browser mobile、browser console
3. 更新 `public/ops-status.json` 和 `public/ops-summary.md`
4. 生成 `public/ops-dashboard.html` 夜间看板

### 修复流程（自动化）
- 检查失败 → Claude Code 修复任务（最多 2 次）
- 2 次修复仍失败 → 通知人工

### 稳定流程
- 连续 2 次检查通过 → 发"网站基本稳定"通知

## 通知规则

| 情况 | 动作 |
|------|------|
| 需人工付款 | 立即通知 + 付款链接 |
| 需人工登录 | 立即通知 |
| 需人工验证码 | 立即通知 |
| 需云控制台确认 | 立即通知 |
| 连续修复失败 | 立即通知 |
| 网站基本稳定 | 发一次稳定通知 |

## 飞书通知配置

飞书 webhook 配置方法见 `docs/feishu-setup.md`。
配置完成后通知脚本位于 `scripts/send-feishu-notify.sh`。

未配置飞书时，通知生成为本地文件：
- `public/pending-notifications.json`

## 安全边界

- ❌ 不 force push
- ❌ 不生产迁移
- ❌ 不修改腾讯云正式资源（只读）
- ❌ 不替人付款
- ✅ 只通知人工处理

## 可视化看板

打开 `public/ops-dashboard.html` 查看：
- 当前任务
- 最近 5 次检查结果
- 关键截图链接
- 当前阻塞项
- 最后更新时间
