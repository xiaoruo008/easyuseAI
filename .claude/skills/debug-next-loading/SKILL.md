# debug-next-loading

> 排查 Next.js 本地开发时页面一直转圈、pending request、500、hydration 错误、`.next/` 缓存污染。

---

## 触发场景

触发词：描述以下任意一种情况
- 「页面一直转圈」
- 「浏览器标签一直在加载」
- 「dev server 报 500」
- 「Hydration mismatch」
- 「`__webpack_modules__[moduleId] is not a function`」
- 「页面加载了一半就停了」

---

## 分步执行流程

### Step 1 — 确认是 dev 还是构建问题

```bash
# dev 模式正常 HMR 连接（永远 pending 是正常的）
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

### Step 2 — 检查 dev server 日志

观察是否有：
- `PrismaClientInitializationError` → binaryTarget 问题
- `Module not found` → 依赖缺失
- `SyntaxError` → 代码语法错误
- 非 HMR 的持续 `wait — compiling...`

### Step 3 — 区分正常 vs 异常 pending

Network 面板过滤，以下 URL 永远 pending 是正常开发态行为：
- `/_next/webpack-hmr`（WebSocket 长连接）
- `/_next/static/...`（资源文件）

**除此以外**有请求 pending >5s，进入 Step 4。

### Step 4 — 定位异常请求

按以下优先级检查：

```
a) 静态页面路由（app/page.tsx、app/layout.tsx）
   → 是否有顶 await / async component 未正确处理

b) API 路由（app/api/*/route.ts）
   → 是否有未 return NextResponse 的代码路径
   → 是否有 Prisma/数据库连接超时

c) lib/ 层级
   → Prisma Client 初始化错误
   → 环境变量缺失导致崩溃
```

### Step 5 — 特定错误修复

| 错误 | 修复 |
|------|------|
| `PrismaClientInitializationError` | `prisma/schema.prisma` 的 `binaryTargets` 加 `debian-openssl-3.0.x`，`pnpm exec prisma generate` |
| `__webpack_modules__[moduleId] is not a function` | `rm -rf .next && pnpm dev` |
| Hydration mismatch | 检查 `layout.tsx` 是否有 `Date.now()`、`Math.random()`、时区相关逻辑 |
| API route 无 return | 确保所有分支都有 `return NextResponse.json(...)` |

### Step 6 — 清除缓存（最后手段）

```bash
rm -rf .next node_modules/.cache
pnpm dev
```

---

## 限制条件

- 只排查不修改业务逻辑
- 不清理 node_modules
- 不修改 `.env`
- 不顺手改 UI

---

## 输出格式

```
## 排查结果

### 正常开发态连接
- /_next/webpack-hmr

### 异常请求
- URL: xxx | 耗时: Ns | 原因: xxx | 文件: xxx:行号

### 修复方案
1. ...
2. ...

如果无异常：✅ 所有 pending 均为正常开发态连接。
```
