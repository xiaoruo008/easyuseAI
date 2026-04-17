# easyuseAI 运营手册

最后更新: 2026-04-17

---

## 系统架构

```
用户端流程:
  首页 → 诊断(5道题) → 案例页 → 提交线索 → /api/leads → n8n webhook → 飞书通知

后台流程:
  Dashboard → 查看线索 → 记反馈 → 执行任务 → /api/execute/generate → MiniMax → 返回图片
```

---

## 服务端口

| 服务 | 端口 | 用途 |
|------|------|------|
| Next.js 前端 | :3000 | 主站点 |
| Hermes Gateway | :8642 | AI 对话后端 |
| Hermes Web UI | :5173 | Web UI 控制台 |
| n8n | :5678 | 自动化工作流 |

---

## 核心 API

### POST /api/leads
提交客户线索，同时触发 n8n webhook

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张女士",
    "wechat": "zhang666",
    "category": "女装",
    "resultType": "traffic",
    "productImage": "https://example.com/product.jpg",
    "referenceImage": "https://example.com/ref.jpg",
    "diagnosisSessionId": "session_id_xxx"
  }'
```

响应: `201` → `{ lead: { id, name, contact, ... }, selectedProvider, priorityLevel }`

### GET /api/leads
查看所有线索

```bash
curl http://localhost:3000/api/leads
```

### POST /api/execute/generate
生成图片（后台执行）

```bash
curl -X POST http://localhost:3000/api/execute/generate \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "xxx",
    "action": "model_photo",
    "originalImageUrl": "https://...",
    "aspectRatio": "3:4",
    "style": "tmall",
    "diagnosisType": "image_poor"
  }'
```

---

## n8n 工作流

**Workflow ID**: `4dhn426ICQaYx5XF`
**名称**: EasyUseAI Lead Router
**Webhook 路径**: `/webhook/easyuse-lead`
**激活状态**: ❌ 需手动激活

### 激活方法
1. 打开 http://localhost:5678
2. 左侧菜单 → Workflows
3. 找到 "EasyUseAI Lead Router"
4. 点右上角 **Activate**（变成绿色）

### 路由逻辑
```
收到 leads → IF selectedProvider
  = "nanobanana" → Gemini 纳米香蕉
  = "minimax"   → MiniMax 国内版
  (默认)        → MiniMax
```

---

## 环境变量

```bash
# .env.local
N8N_WEBHOOK_URL=http://localhost:5678/webhook/easyuse-lead
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx
```

---

## 快速命令

```bash
# 系统状态检查
bash scripts/status.sh

# 链路打通检查
bash scripts/chain-check.sh

# 重启前端
cd /mnt/e/AI/easyuseAI && pnpm dev

# 查看最新线索
curl -s http://localhost:3000/api/leads | python3 -c "
import json,sys
leads=json.load(sys.stdin)
for l in leads[-5:]:
    print(f'{l[\"createdAt\"][:10]} | {l[\"name\"]} | {l[\"contact\"]} | {l[\"status\"]}')"
```

---

## 链路打通进度

```
✅ 前端首页     - 正常运行，CTA清晰
✅ 诊断流程     - 5道题 → 路由决策
✅ 提交线索     - /api/leads 返回201
✅ n8n webhook - webhook路径已配置
✅ 飞书通知     - 卡片格式已配置
❌ n8n workflow - 未激活（需手动点）
```

**激活 n8n workflow 后即可完整测试:**
1. 打开 http://localhost:5678 → 激活 workflow
2. 访问 http://localhost:3000/diagnosis
3. 完成5道题 → 提交线索
4. 飞书收到通知 ✅

---

## 已知问题

1. **n8n workflow 未激活** — 唯一卡点，必须人工激活
2. **测试线索堆积** — 可定期清理 `/api/leads` 中的测试数据
3. **selectedProvider 未存入数据库** — 只在 API 响应中返回，不影响功能

---

## 项目结构

```
app/
├── page.tsx              # 首页（before/after展示 + CTA）
├── diagnosis/page.tsx   # 诊断流程（5道题）
├── result/page.tsx       # 案例展示页
├── submit/page.tsx       # 提交线索页
├── execute/page.tsx      # 图片生成执行页
├── dashboard/leads/      # 线索管理后台
└── api/
    ├── leads/            # 线索 CRUD + n8n触发
    ├── execute/generate/ # 图片生成（MiniMax）
    ├── diagnosis/        # 诊断 session 管理
    ├── upload/           # 图片上传
    └── feishu/           # 飞书回调验证

lib/
├── image/                # 图片生成引擎
│   ├── template.ts      # 模板配置（TEMPLATE_TYPE_MAP）
│   ├── providers/       # MiniMax / Gemini 实现
│   └── prompt-templates.ts
├── db.ts                # 数据库操作
├── ai.ts                # AI 对话生成
├── feishu.ts            # 飞书通知
└── route-decision.ts    # 线索路由决策

ops/
├── CURRENT_TASK.md      # 当前任务追踪
└── n8n-workflow-*.json  # n8n 工作流备份
```
