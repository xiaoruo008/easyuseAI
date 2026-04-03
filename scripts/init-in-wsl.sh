#!/usr/bin/env bash
# 在 WSL 中执行：安装依赖并生成 Prisma Client（路径对应 /mnt/e/AI/easyuseAI）
set -euo pipefail
cd "$(dirname "$0")/.."
echo "==> 目录: $(pwd)"
if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  echo "==> 已从 .env.example 创建 .env（请按需修改 DATABASE_URL）"
fi
command -v pnpm >/dev/null || { echo "请先安装 pnpm: corepack enable && corepack prepare pnpm@latest --activate"; exit 1; }
pnpm install
pnpm exec prisma generate
echo "==> 完成。启动: pnpm dev"
