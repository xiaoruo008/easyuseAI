#!/usr/bin/env bash
set -euo pipefail

cd /mnt/e/AI/easyuseAI

pkill -f "claude --permission-mode dontAsk" || true
pkill -f "qwen --approval-mode yolo" || true

sleep 2

nohup claude --permission-mode dontAsk > /tmp/claude.log 2>&1 &
nohup qwen --approval-mode yolo > /tmp/qwen.log 2>&1 &
