# vercel-deploy-debug

> Vercel 部署问题诊断：Build 失败、Runtime 错误、环境变量问题、域名配置的全面排查。

---

## 触发场景

触发词：
- 「部署失败」
- 「build 报错」
- 「vercel 报错」
- 「生产环境 500」
- 「vercel 日志」
- 「部署后页面空白」

---

## 分步执行流程

### Step 1 — 获取部署信息

```bash
# 查看最近部署
vercel ls

# 查看特定部署详情
vercel inspect $DEPLOYMENT_URL

# 查看实时日志
vercel logs $DEPLOYMENT_URL --follow
```

### Step 2 — 区分 Build 失败 vs Runtime 错误

```
Build 失败特征：
- vercel.json 配置错误
- 依赖安装失败
- TypeScript 编译错误
- .next/ 构建产物问题

Runtime 错误特征：
- 页面能访问但功能异常
- API 返回 500
- 环境变量缺失
- 第三方服务连接失败
```

### Step 3 — Build 失败排查

```bash
# 本地模拟 build
rm -rf .next
pnpm build

# 常见 Build 错误：
| 错误 | 原因 | 解决方案 |
|------|------|----------|
| Module not found | 依赖缺失 | pnpm install |
| Type error | TS 类型错误 | 修改代码或 tsconfig |
| Prisma error | binaryTarget 不匹配 | prisma generate |
| Export error | getStaticPaths 问题 | 检查页面导出 |
```

### Step 4 — Runtime 错误排查

```bash
# 本地生产模式测试
pnpm build && pnpm start

# 检查环境变量
vercel env pull  # 拉取生产环境变量到 .env.local
cat .env.local

# 检查 Vercel Dashboard 环境变量配置
# Settings → Environment Variables
```

### Step 5 — 环境变量检查清单

确认以下变量在 Vercel Dashboard 已配置（Production + Preview + Development）：

```
必需变量：
- DATABASE_URL（Supabase PostgreSQL）
- NEXT_PUBLIC_APP_URL（线上 URL）
- AI_API_KEY / MINIMAX_API_KEY
- AI_BASE_URL（生产环境应为真实 API）

可选变量：
- FEISHU_APP_ID / FEISHU_APP_SECRET
- USE_MOCK（生产必须为 false）
```

### Step 6 — 域名和 DNS 配置

```bash
# 检查域名解析
dig $DOMAIN

# 检查 SSL 证书
openssl s_client -connect $DOMAIN:443 -servername $DOMAIN

# 检查 Vercel 域名配置
vercel domains ls
```

---

## 常见部署问题速查

### Build 成功但页面空白

```
原因：.next/ 缓存问题
解决：清空缓存重新部署
vercel --force
```

### API Route 500

```
原因：环境变量缺失或格式错误
解决：检查 .env 和 Vercel Dashboard
```

### 静态资源 404

```
原因：_next/static 路径问题
解决：vercel.json 配置 rewrite 或检查 build 输出
```

### 跨域问题

```
原因：CORS 配置缺失
解决：添加 cors() 中间件
```

---

## 限制条件

- 不修改 vercel.json 核心配置
- 不删除已部署的项目
- 不在日志中输出 API Key
- 不修改生产数据

---

## 输出格式

```
## Vercel 部署诊断报告

### 部署状态
- URL: $DEPLOYMENT_URL
- 状态: ✅ Success / ❌ Failed

### Build 日志
[摘要或错误信息]

### Runtime 错误
[错误堆栈]

### 环境变量
✅ 完整 / ❌ 缺失: xxx

### 修复建议
1. xxx
2. xxx

### 重新部署命令
vercel --prod --yes
```
