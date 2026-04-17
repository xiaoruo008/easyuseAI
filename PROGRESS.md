# easyuseAI 项目进度

最后更新: 2026-04-17 23:38

## 系统状态

| 服务 | 端口 | 状态 |
|------|------|------|
| Next.js 前端 | :3005 | ✅ 运行中 |
| Hermes Gateway | :8642 | ✅ 运行中 |
| Hermes Web UI | :5173 | ✅ 运行中 |
| n8n | :5678 | ✅ 运行中 |

## 链路打通状态

```
前端提交 → /api/leads → n8n webhook → 飞书通知
   ✅          ✅           ❌           ?
```

**卡点: n8n workflow 未激活**
- 用户需手动打开 http://localhost:5678
- 找到 "EasyUseAI Lead Router" (ID: 4dhn426ICQaYx5XF)
- 点右上角 Activate (变绿色)

## 已修复的 Bug

- [x] **字段名不匹配** — leads API 发送 `routeProvider`，n8n IF 节点期望 `selectedProvider`。已修复 `route.ts` 第114行
- [x] **N8N_WEBHOOK_URL 路径错误** — 从 `/webhook/image-generate` 改为 `/webhook/easyuse-lead`

## 已完成功能

### 前端
- [x] 案例墙组件 (CaseWall.tsx)
- [x] 风格分类 Tab (电商白底/模特上身/ins风)
- [x] 原图/效果图对比展示
- [x] CTA 文案: "免费试做1张"
- [x] 提交页优化

### 后端
- [x] /api/leads 接口 (201 创建成功)
- [x] TEMPLATE_TYPE_MAP 修复
- [x] diagnosisType 透传
- [x] 飞书 webhook 卡片格式
- [x] 指数退避重试 (3次: 1s/2s/4s)

### 基础设施
- [x] 状态检查脚本: `bash scripts/status.sh`
- [x] 链路检查脚本: `bash scripts/chain-check.sh`

## 待完成

- [ ] n8n workflow 激活 (需人工)
- [ ] 完整链路测试 (人工确认飞书收到消息)
- [ ] 案例图片真实数据填充
- [ ] prompt 模板优化

## 快速命令

```bash
# 系统状态
bash /mnt/e/AI/easyuseAI/scripts/status.sh

# 链路检查
bash /mnt/e/AI/easyuseAI/scripts/chain-check.sh

# 重启前端
cd /mnt/e/AI/easyuseAI && pnpm dev

# 检查 n8n
curl http://localhost:5678/health
```
