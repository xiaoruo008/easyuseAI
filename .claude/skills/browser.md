# Browser Automation Skill

## 触发方式

Claude Code 可以通过以下方式调用浏览器自动化能力：

1. **直接调用脚本**（推荐）：`npx tsx scripts/browser.ts <command>`
2. **在 Bash 中运行**单个 Playwright 命令
3. **编写临时脚本**到 `scripts/` 目录后执行

> ⚠️ `pnpm browser` 不在此项目的 `package.json` 中注册，不要使用。

## 能力范围

### 可执行操作

- 打开任意 URL（本地 `localhost:3000` 或线上站点）
- 截图（全页面 / 指定元素）
- 检查控制台错误和未捕获异常
- 跑完整用户流程并生成报告
- 读取页面文本内容
- 点击按钮、填写表单（需在脚本中实现）

### 核心链路验证

```
首页 → /diagnosis → /result → /execute → /submit
```

使用 `pnpm browser flow` 一次性验证所有页面可访问性和控制台状态。

### 截图能力

截图保存在 `public/screenshots/` 目录，可用于：
- 视觉回归对比
- 调试报告附件
- CI/CD 构建产物

## 常用命令速查

**注意：** `pnpm browser` 不在此项目的 `package.json` 中注册。直接用 `tsx` 调用脚本：

```bash
# 1. 打开首页截图
npx tsx scripts/browser.ts home

# 2. 跑主流程（包含 5 个页面截图 + 控制台检查）
npx tsx scripts/browser.ts flow

# 3. 检查控制台报错
npx tsx scripts/browser.ts console http://localhost:3000

# 4. 截图任意 URL
npx tsx scripts/browser.ts screenshot https://example.com output.png

# 5. 移动端截图 (iPhone 14 Pro)
npx tsx scripts/browser.ts mobile
```

## 技术栈

- **Playwright 1.59** + Chromium（headless）
- **Node.js** + TypeScript，入口 `scripts/browser.ts`
- 无需额外服务，本地执行

## 扩展方式

如需添加新操作（如"点击登录按钮"、"填写表单"），直接在 `scripts/browser.ts` 中添加新的 async 函数命令即可。

## 环境要求

- `pnpm install` 后即可使用
- 首次运行若提示缺少 Chromium：`npx playwright install chromium`
