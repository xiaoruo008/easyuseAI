#!/bin/bash
# stop-night-sessions.sh - 停止所有夜间值守任务

echo "[1/4] 停止 Claude Code..."
pkill -f "claude" 2>/dev/null || true

echo "[2/4] 停止 dev server..."
pkill -f "next dev" 2>/dev/null || true

echo "[3/4] 停止 tmux 会话..."
tmux kill-server 2>/dev/null || true

echo "[4/4] 清理残留进程..."
pkill -f "browser.ts" 2>/dev/null || true

echo ""
echo "=== 已停止 ==="
echo "所有 node/next/claude/tmux 进程已清理"
ps aux | grep -E 'claude|next dev' | grep -v grep | head -5 || echo "无残留进程"
