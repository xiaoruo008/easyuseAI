# Ops Summary

## Round 359 — 2026-04-17 03:44:00

**结果**: ✅ 全部通过

- HTTP: 200 OK (port 3005; port 3000 连接失败 — 已知迁移)
- Console: 0 errors
- Flow: 5/5 steps (首页 → Diagnosis → Result → Execute → Submit)
- Mobile: 3/3 pages (首页, Diagnosis, Result)
- 连续通过: 38 次
- 累计 stable: 45 次
- 通知: 网站基本稳定 ✓

---

## Round 353 — 2026-04-16 21:12:28

**结果**: ✅ 全部通过

- HTTP: 200 OK (port 3005; port 3000 连接失败 — 已知迁移)
- Console: 0 errors
- Flow: 5/5 steps (首页 → Diagnosis → Result → Execute → Submit)
- Mobile: 3/3 pages (首页, Diagnosis, Result)
- 连续通过: 32 次
- 累计 stable: 39 次

---

## Round 357 — 2026-04-16 23:06:39

**结果**: ✅ 全部通过

- HTTP: 200 OK (port 3005; port 3000 连接失败 — 已知迁移)
- Console: 0 errors
- Flow: 5/5 steps (首页 → Diagnosis → Result → Execute → Submit)
- Mobile: 3/3 pages (首页, Diagnosis, Result)
- 连续通过: 36 次
- 累计 stable: 43 次

---

---

## Round 360 — 2026-04-17 00:19:00

**结果**: ❌ 检查失败

- HTTP: 404 on port 3000 — 端口已迁移，dev server 实际运行在 **port 3005** (200 OK)
- Console: ✅ 通过 (npx tsx scripts/browser.ts console http://localhost:3005 — 0 errors)
- Flow: ⚠️ 4/5 — 首页失败（browser.ts 脚本默认使用 port 3000，而非 BASE_URL）
- Mobile: ⚠️ 0/3 — 所有页面失败（同上，port 3000 无响应）
- 连续通过: 0 次（因端口 3000 检查失败）
- 累计 stable: 45 次

**问题**: 脚本 `browser.ts` 硬编码端口 3000，与当前 dev server 端口 3005 不一致。需要更新脚本或配置以支持 BASE_URL。

