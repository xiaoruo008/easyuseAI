#!/bin/bash
# start-night-sessions.sh - 启动夜间值守 tmux 会话

set -e

PROJECT="/mnt/e/AI/easyuseAI"
cd "$PROJECT"

echo "[1/3] 启动 dev server..."
tmux new-session -d -s dev -n server "cd $PROJECT && pnpm dev"
sleep 3

echo "[2/3] 启动 Claude Code 监控..."
tmux new-session -d -s claude -n monitor "echo 'Claude Code ready. Attach: tmux attach -t claude'"
sleep 1

echo "[3/3] 创建 Hermens 状态监控..."
tmux new-session -d -s hermes -n status "watch -n 60 'cat public/ops-status.json 2>/dev/null || echo \"no status yet\"'"
sleep 1

echo ""
echo "=== 启动完成 ==="
echo "dev server:    tmux attach -t dev"
echo "Claude Code:   tmux attach -t claude"
echo "Hermes 状态:   tmux attach -t hermes"
echo ""
echo "查看所有会话: tmux list-sessions"
echo "分离会话:     Ctrl+B D"
