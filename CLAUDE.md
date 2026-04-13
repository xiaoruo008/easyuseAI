# Browser Automation

本项目使用 Playwright 实现浏览器自动化测试和截图。

## 快速开始

```bash
# 打开首页并截图
pnpm browser home

# 跑主流程（首页→diagnosis→result→execute→submit）
pnpm browser flow

# 检查控制台报错
pnpm browser console http://localhost:3000

# 截取指定 URL
pnpm browser screenshot <url> <filename>
```

## 依赖

- `@playwright/test`（已安装）
- `tsx`（已安装，用于执行 TypeScript 脚本）
- Chromium 浏览器（`npx playwright install chromium`，首次需下载约 400MB）

## 输出文件

| 文件 | 说明 |
|------|------|
| `public/screenshots/*.png` | 各页面截图 |
| `public/browser-report.json` | 主流程报告（flow 命令生成） |
| `public/console-errors.log` | 控制台报错日志 |

## 配置

可通过环境变量指定基础 URL：

```bash
BASE_URL=https://your-site.vercel.app pnpm browser flow
```

## 详见

`.claude/skills/browser.md`
