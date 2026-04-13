# 远程控制手册

## 连接信息

| 项目 | 值 |
|------|---|
| 主机 IP | 172.29.126.216 |
| SSH 端口 | 2222 |
| 用户名 | root |
| 项目路径 | /mnt/e/AI/easyuseAI |
| 网站地址 | http://localhost:3000 |

## 手机 Termius 连接步骤

1. 打开 Termius → 点击 + → **New Host**
2. **Label**: `AI Server`
3. **IP**: `172.29.126.216`
4. **Port**: `2222`
5. **Username**: `root`
6. **Password**: *(找你拿)*
7. 点击保存 → 连接

> 如果 2222 不通，尝试 22 端口（有些网络会映射）。

## 快速命令（手机端执行）

### 查看 Claude Code 进度
```bash
tail -50 ~/.claude/projects/*/sessions/*/transcript* 2>/dev/null | tail -30
```

### 查看 Hermes 进度（当前会话输出）
```bash
tail -30 ~/.hermes/logs/*.log 2>/dev/null || echo "无日志"
```

### 查看截图目录
```bash
ls -lt /mnt/e/AI/easyuseAI/public/screenshots/ | head -15
```

### 查看最后一轮修复报告
```bash
cat /mnt/e/AI/easyuseAI/public/browser-report.json 2>/dev/null | python3 -m json.tool | tail -30
```

### 查看 ops 状态
```bash
cat /mnt/e/AI/easyuseAI/public/ops-status.json 2>/dev/null || echo "未生成"
```

### 一键停止所有任务
```bash
pkill -f "claude" 2>/dev/null; pkill -f "next dev" 2>/dev/null; echo "已停止"
```

### 只重启 dev server
```bash
pkill -f "next dev" 2>/dev/null; sleep 2; cd /mnt/e/AI/easyuseAI && pnpm dev &
```

### 只重启 Claude Code（需要 token）
```bash
pkill -f "claude" 2>/dev/null
export ANTHROPIC_AUTH_TOKEN="<你的token>"
export ANTHROPIC_BASE_URL="https://api.minimaxi.com/anthropic"
export ANTHROPIC_MODEL="MiniMax-M2.7"
claude --no-input &
```

### 查看最近 5 次检查结果
```bash
cat /mnt/e/AI/easyuseAI/public/ops-summary.md 2>/dev/null | head -50
```

### 强制推送 Git（如需要）
```bash
cd /mnt/e/AI/easyuseAI && git add -A && git commit -m "night save" && git push
```

## 紧急联系
- 需要人工介入时，查看 `docs/feishu-setup.md` 配置飞书通知
