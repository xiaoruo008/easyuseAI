# deploy-vercel

> 执行 Vercel 部署前检查、环境变量确认、部署执行、部署后验证的完整流程。

---

## 触发场景

触发词：
- 「帮我部署」
- 「部署到线上」
- 「vercel --prod」
- 「部署后报 500」
- 「不知道生产环境变量对不对」

---

## 分步执行流程

### Step 1 — 本地构建验证

```bash
rm -rf .next
pnpm build
```

必须通过：
- `✓ Compiled successfully`
- `✓ Generating static pages (N/N)`
- 无 Prisma 错误

### Step 2 — 检查环境变量清单

确认以下变量已在 **Vercel Dashboard → Settings → Environment Variables** 配置（Production + Preview + Development）：

| 变量名 | 当前值 | 说明 |
|--------|--------|------|
| `AI_API_KEY` | ✓ | MiniMax API Key |
| `AI_BASE_URL` | ✓ | `https://api.minimax.chat/v1` |
| `AI_MODEL` | ✓ | `MiniMax-M2.7-highspeed` |
| `USE_MOCK` | ✓ | `false`（生产） |
| `IMAGE_PROVIDER` | ✓ | `minimax-cn` |
| `MINIMAX_API_KEY` | ✓ | 同 AI_API_KEY |
| `MINIMAX_IMAGE_BASE_URL` | ✓ | `https://api.minimaxi.com` |
| `DATABASE_URL` | ✓ | Supabase PostgreSQL |
| `SUPABASE_URL` | ✓ | Supabase 项目 URL |
| `NEXT_PUBLIC_APP_URL` | ✓ | 线上 URL |
| `FEISHU_APP_ID` | ⚠️ | 需要真实值 |
| `FEISHU_APP_SECRET` | ⚠️ | 需要真实值 |

如果任何 ✓ 变量缺失，手动添加后需要 Redeploy。
如果 ⚠️ 变量缺失，飞书机器人不工作，但网站正常运行。

### Step 3 — 执行部署

```bash
vercel whoami   # 确认已登录
vercel --prod --yes
```

### Step 4 — 部署后验证

```bash
# 1. 确认 HTTP 200
curl -s -o /dev/null -w "%{http_code}" https://easyuse-ai.vercel.app/

# 2. 确认 feishu challenge 验证
vercel curl "/api/feishu/events?challenge=test" --deployment easyuse-ai.vercel.app
# 期望：{"challenge":"test"}

# 3. 确认关键页面
curl -s -o /dev/null -w "%{http_code}" https://easyuse-ai.vercel.app/diagnosis
curl -s -o /dev/null -w "%{http_code}" https://easyuse-ai.vercel.app/result
```

### Step 5 — 如需修改环境变量后重新生效

修改 Vercel 环境变量后，必须 Redeploy：
```bash
vercel --prod --yes
```

---

## 已知生产环境变量参考

```
AI_API_KEY = sk-cp-GUjAFfD52rtpGnOmqijhPNC4VLOQ2ValpxKlLIZZ6B1wtR8ifnrxPO88n7f6kpEP0xD-NKfEnMIEThxkfzgw6FsClDMen3Z2aiVDFix95gUkJjTXI3gMGFE
AI_BASE_URL = https://api.minimax.chat/v1
AI_MODEL = MiniMax-M2.7-highspeed
MINIMAX_API_KEY = 同 AI_API_KEY
MINIMAX_IMAGE_BASE_URL = https://api.minimaxi.com
```

---

## 限制条件

- 不修改业务逻辑
- 不推送 .env 到 git
- 不删除 Vercel 项目
- 不在日志中输出任何 API Key

---

## 输出格式

```
## Vercel 部署报告

Build: ✅ 通过 / ❌ 失败
环境变量: ✅ 完整 / ❌ 缺失: xxx
部署: https://easyuse-ai.vercel.app [READY/FAILED]
feishu challenge: ✅ / ❌
首页: HTTP xxx
```

如需重新部署：`vercel --prod --yes`
