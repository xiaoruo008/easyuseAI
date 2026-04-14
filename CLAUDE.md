# Browser Automation

本项目使用 Playwright 实现浏览器自动化测试和截图。

## 快速开始

```bash
# 打开首页并截图
npx tsx scripts/browser.ts home

# 跑主流程（首页→diagnosis→result→execute→submit）
npx tsx scripts/browser.ts flow

# 检查控制台报错
npx tsx scripts/browser.ts console http://localhost:3000

# 截取指定 URL
npx tsx scripts/browser.ts screenshot <url> <filename>
```

## 依赖

- `@playwright/test`（已安装）
- `tsx`（已安装，用于执行 TypeScript 脚本）
- Chromium 浏览器（`npx playwright install chromium`，首次需下载约 400MB）

> ⚠️ `pnpm browser` 不在此项目的 `package.json` 中注册。**必须**使用 `npx tsx scripts/browser.ts <command>`，不能用 `pnpm browser`。

## 输出文件

| 文件 | 说明 |
|------|------|
| `public/screenshots/*.png` | 各页面截图 |
| `public/browser-report.json` | 主流程报告（flow 命令生成） |
| `public/console-errors.log` | 控制台报错日志 |

## 配置

可通过环境变量指定基础 URL：

```bash
BASE_URL=https://your-site.vercel.app npx tsx scripts/browser.ts flow
```

## 详见

`.claude/skills/browser.md`
