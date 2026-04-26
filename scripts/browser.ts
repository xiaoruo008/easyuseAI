#!/usr/bin/env node
/**
 * Browser Automation Script — Playwright + Next.js
 *
 * Usage:
 *   pnpm browser <command> [options]
 *
 * Commands:
 *   screenshot <url> <file>     截图保存到 public/screenshots/
 *   home                        打开首页截图并保存
 *   console <url>               检查控制台报错 + 失败请求 (4xx/5xx)
 *   flow                         跑主流程：首页→diagnosis→result→execute→submit
 *   mobile                       移动端截图: 首页 / diagnosis / result (iPhone 14 Pro)
 *
 * Examples:
 *   pnpm browser home
 *   pnpm browser screenshot http://localhost:3000 output.png
 *   pnpm browser console http://localhost:3000
 *   pnpm browser flow
 *   pnpm browser mobile
 */

import { chromium, devices, type Browser, type Page, type ConsoleMessage, type Request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = path.join(process.cwd(), 'public', 'screenshots');
const REPORT_FILE = path.join(process.cwd(), 'public', 'browser-report.json');
const CONSOLE_LOG_FILE = path.join(process.cwd(), 'public', 'console-errors.log');
const NETWORK_LOG_FILE = path.join(process.cwd(), 'public', 'network-errors.log');

// ─── Bootstrap ───────────────────────────────────────────────────────────────

async function ensureBrowser(): Promise<Browser> {
  return chromium.launch({ headless: true });
}

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

async function withPage(browser: Browser, url: string, fn: (page: Page) => Promise<void>) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await fn(page);
  } finally {
    await page.close();
  }
}

// ─── Commands ─────────────────────────────────────────────────────────────────

async function cmdHome() {
  const browser = await ensureBrowser();
  const url = process.env.BASE_URL || 'http://localhost:3000';
  const screenshotPath = path.join(SCREENSHOTS_DIR, 'home.png');

  await ensureDir(SCREENSHOTS_DIR);

  await withPage(browser, url, async (page) => {
    // 等待页面稳定
    await page.waitForTimeout(2000);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✓ 首页截图已保存: public/screenshots/home.png`);
    console.log(`  页面标题: ${await page.title()}`);
    console.log(`  URL: ${page.url()}`);
  });

  await browser.close();
}

async function cmdScreenshot(targetUrl: string, filename: string) {
  const browser = await ensureBrowser();
  const screenshotPath = path.join(SCREENSHOTS_DIR, filename);
  await ensureDir(SCREENSHOTS_DIR);

  await withPage(browser, targetUrl, async (page) => {
    await page.waitForTimeout(1500);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✓ 截图已保存: public/screenshots/${filename}`);
    console.log(`  页面标题: ${await page.title()}`);
    console.log(`  URL: ${page.url()}`);
  });

  await browser.close();
}

async function cmdConsole(targetUrl: string) {
  const browser = await ensureBrowser();
  const errors: string[] = [];
  const failedRequests: { url: string; status: number; failure?: string }[] = [];

  await withPage(browser, targetUrl, async (page) => {
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        errors.push(`[console.error] ${msg.text()}`);
      }
    });

    page.on('pageerror', (err) => {
      errors.push(`[pageerror] ${err.message}`);
    });

    page.on('response', (response: Request) => {
      const status = response.status();
      if (status >= 400) {
        failedRequests.push({
          url: response.url(),
          status,
          failure: response.statusText(),
        });
      }
    });

    // 等待足够长让页面执行
    await page.waitForTimeout(4000);
  });

  await browser.close();

  const filteredErrors = errors.filter(e =>
    !e.includes('favicon') &&
    !e.includes('net::ERR_BLOCKED') &&
    !e.includes('favicon.ico')
  );

  console.log(`\n━━━ ${targetUrl} ━━━\n`);

  // Console errors
  if (filteredErrors.length === 0) {
    console.log(`✓ 控制台无报错`);
  } else {
    console.log(`✗ 控制台报错 (${filteredErrors.length}):`);
    filteredErrors.forEach(e => console.log(`  ${e}`));
    fs.writeFileSync(CONSOLE_LOG_FILE, filteredErrors.join('\n'));
    console.log(`\n  已保存到: public/console-errors.log`);
  }

  // Network errors
  if (failedRequests.length === 0) {
    console.log(`✓ 无失败请求 (4xx/5xx)`);
  } else {
    console.log(`\n✗ 失败请求 (${failedRequests.length}):`);
    failedRequests.forEach(r => {
      const icon = r.status >= 500 ? '⚠' : '✗';
      console.log(`  ${icon} [${r.status}] ${r.url}`);
      if (r.failure) console.log(`      → ${r.failure}`);
    });
    fs.writeFileSync(NETWORK_LOG_FILE, JSON.stringify(failedRequests, null, 2));
    console.log(`\n  已保存到: public/network-errors.json`);
  }

  if (filteredErrors.length === 0 && failedRequests.length === 0) {
    console.log(`\n✅ 全部通过，无任何报错\n`);
  } else {
    console.log(`\n`);
  }
}

async function cmdDiagnosisFlow() {
  const browser = await ensureBrowser();
  await ensureDir(SCREENSHOTS_DIR);

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const steps: { name: string; passed: boolean; errors: string[]; screenshot?: string }[] = [];

  const context = await browser.newContext();
  const page = await context.newPage();
  const errors: string[] = [];

  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

  try {
    // Step 1: 首页
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'diag-home.png'), fullPage: true });
    steps.push({ name: '首页', passed: true, errors: [], screenshot: 'diag-home.png' });
    console.log('✓ 首页');

    // Step 2: Diagnosis
    await page.goto(`${baseUrl}/diagnosis`, { waitUntil: 'networkidle', timeout: 30000 });

    // 等待 session 初始化（"正在初始化..."消失，显示选项）
    try {
      await page.waitForFunction(() => {
        const btns = document.querySelectorAll('button');
        return btns.length > 0;
      }, { timeout: 10000 });
    } catch {
      steps.push({ name: 'Diagnosis-初始化', passed: false, errors: ['等待选项按钮超时，session 可能未创建'], screenshot: 'diag-init-fail.png' });
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'diag-init-fail.png'), fullPage: true });
      console.log('✗ Diagnosis 初始化超时');
      await context.close();
      await browser.close();
      fs.writeFileSync(REPORT_FILE, JSON.stringify({ timestamp: new Date().toISOString(), diagnosisFlow: steps, errors }, null, 2));
      return;
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'diag-q1.png'), fullPage: true });

    // 答题 1-8: 选择第一个选项，Q8 之后等待跳转到 result
    for (let q = 1; q <= 8; q++) {
      const btns = await page.$$('button');
      if (btns.length > 0) {
        await btns[0].click();
        // Q8 之后不等计时器，直接等 URL 变化（Q8会触发API调用+redirect）
        if (q < 8) {
          await page.waitForTimeout(1500);
          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `diag-q${q+1}.png`), fullPage: true });
        }
      }
    }

    // Step 6: 等待跳转到 Result 页面（Q5 点击后 router.push 已触发）
    try {
      await page.waitForURL('**/result*', { timeout: 10000 });
      // 等待 result 页面内容加载完成（loading spinner 消失）
      await page.waitForFunction(() => {
        const spinner = document.querySelector('.animate-spin');
        return !spinner;
      }, { timeout: 8000 }).catch(() => {/* ignore if no spinner */});
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'diag-result.png'), fullPage: true });
      steps.push({ name: 'Result', passed: true, errors: [], screenshot: 'diag-result.png' });
      console.log('✓ Result 页面已到达');
    } catch {
      steps.push({ name: 'Result', passed: false, errors: ['答题后未跳转到 result'], screenshot: 'diag-stuck.png' });
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'diag-stuck.png'), fullPage: true });
      console.log('✗ 答题后未跳转到 result');
    }

    // Step 7: 点击 CTA 按钮，验证跳转到 /submit 或 /execute
    const ctaTextPatterns = ['立即在线生成', '让顾问帮我做', '加微信', '免费试做', '提交需求'];
    let ctaClicked = false;
    try {
      const allBtns = await page.$$('button');
      for (const btn of allBtns) {
        const text = await btn.innerText();
        if (ctaTextPatterns.some(pt => text.includes(pt))) {
          await btn.click();
          ctaClicked = true;
          await page.waitForTimeout(2000);
          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'diag-submit.png'), fullPage: true });
          break;
        }
      }
    } catch (err) {
      console.log(`  CTA 点击异常: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (ctaClicked) {
      const currentUrl = page.url();
      if (currentUrl.includes('/submit')) {
        steps.push({ name: 'Submit', passed: true, errors: [], screenshot: 'diag-submit.png' });
        console.log('✓ Submit 页面已到达');
      } else {
        steps.push({ name: 'Submit', passed: false, errors: [`点击 CTA 后未到达 submit，仍在 ${currentUrl}`], screenshot: 'diag-stuck.png' });
        console.log(`✗ 点击 CTA 后未到达 submit，当前: ${currentUrl}`);
      }
    } else {
      steps.push({ name: 'Submit', passed: false, errors: ['未找到 CTA 按钮'], screenshot: 'diag-result.png' });
      console.log('✗ 未找到 CTA 按钮');
    }

    steps.push({ name: 'Diagnosis', passed: true, errors: [], screenshot: 'diag-q1.png' });

  } catch (err) {
    errors.push(`[Exception] ${err instanceof Error ? err.message : String(err)}`);
  }

  await context.close();
  await browser.close();

  const filteredErrors = errors.filter(e => !e.includes('favicon'));
  const report = {
    timestamp: new Date().toISOString(),
    diagnosisFlow: true,
    summary: { total: steps.length, passed: steps.filter(s => s.passed).length, failed: steps.filter(s => !s.passed).length },
    steps,
    errors: filteredErrors,
  };
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`\n报告已保存: public/browser-report.json`);
  console.log(`概览: ${report.summary.passed}/${report.summary.total} 步骤通过`);
  if (filteredErrors.length > 0) {
    console.log(`错误:\n  ${filteredErrors.join('\n  ')}`);
  }
}

async function cmdMobile() {
  const browser = await ensureBrowser();
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  // iPhone 14 Pro dimensions
  const iPhone = devices['iPhone 14 Pro'];

  await ensureDir(SCREENSHOTS_DIR);

  const pages = [
    { name: '首页', path: '' },
    { name: 'Diagnosis', path: '/diagnosis' },
    { name: 'Result', path: '/result' },
  ];

  console.log(`\n━━━ Mobile (iPhone 14 Pro — 393×852) ━━━\n`);

  for (const p of pages) {
    const context = await browser.newContext({
      ...iPhone,
    });
    const page = await context.newPage();
    const url = `${baseUrl}${p.path}`;
    const screenshotPath = path.join(SCREENSHOTS_DIR, `mobile-${p.name.toLowerCase()}.png`);

    try {
      const errors: string[] = [];
      page.on('console', (msg: ConsoleMessage) => {
        if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
      });
      page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const filteredErrors = errors.filter(e => !e.includes('favicon'));
      const status = filteredErrors.length === 0 ? '✓' : '✗';
      console.log(`${status} ${p.name} → ${screenshotPath}`);
      if (filteredErrors.length > 0) {
        filteredErrors.forEach(e => console.log(`    ${e}`));
      }
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log();
}

async function cmdFlow() {
  const browser = await ensureBrowser();
  await ensureDir(SCREENSHOTS_DIR);

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const steps: { name: string; url: string; passed: boolean; errors: string[]; screenshot?: string }[] = [];

  const flowUrls = [
    { name: '首页', url: baseUrl },
    { name: 'Diagnosis', url: `${baseUrl}/diagnosis` },
    { name: 'Result', url: `${baseUrl}/result` },
    { name: 'Execute', url: `${baseUrl}/execute` },
    { name: 'Submit', url: `${baseUrl}/submit` },
  ];

  for (const step of flowUrls) {
    const stepErrors: string[] = [];
    const screenshotName = `flow-${step.name.toLowerCase()}.png`;

    await withPage(browser, step.url, async (page) => {
      page.on('console', (msg: ConsoleMessage) => {
        if (msg.type() === 'error') {
          stepErrors.push(`[console.error] ${msg.text()}`);
        }
      });
      page.on('pageerror', (err) => {
        stepErrors.push(`[pageerror] ${err.message}`);
      });

      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, screenshotName), fullPage: true });

      // 简单验证：页面有内容且 URL 正确
      const bodyText = await page.evaluate(() => document.body?.innerText || '');
      const hasContent = bodyText.trim().length > 0;
      const urlMatch = page.url().includes(step.url.replace(baseUrl, ''));

      if (!hasContent) stepErrors.push('页面内容为空');
      if (!urlMatch) stepErrors.push(`URL 不匹配: 期望包含 ${step.url}，实际 ${page.url()}`);
    });

    steps.push({
      name: step.name,
      url: step.url,
      passed: stepErrors.length === 0,
      errors: stepErrors,
      screenshot: screenshotName,
    });

    const status = stepErrors.length === 0 ? '✓' : '✗';
    console.log(`${status} ${step.name} (${step.url})`);
    if (stepErrors.length > 0) {
      stepErrors.forEach(e => console.log(`    ${e}`));
    } else {
      console.log(`    截图: public/screenshots/${screenshotName}`);
    }
  }

  await browser.close();

  // 生成报告
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl,
    summary: {
      total: flowUrls.length,
      passed: steps.filter(s => s.passed).length,
      failed: steps.filter(s => !s.passed).length,
    },
    steps,
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`\n报告已保存: public/browser-report.json`);
  console.log(`概览: ${report.summary.passed}/${report.summary.total} 步骤通过`);
}

// ─── CLI Entry ────────────────────────────────────────────────────────────────

const [,, command, ...args] = process.argv;

(async () => {
  try {
    switch (command) {
      case 'home':
        await cmdHome();
        break;
      case 'screenshot':
        if (args.length < 2) {
          console.error('Usage: pnpm browser screenshot <url> <filename>');
          process.exit(1);
        }
        await cmdScreenshot(args[0], args[1]);
        break;
      case 'console':
        if (args.length < 1) {
          console.error('Usage: pnpm browser console <url>');
          process.exit(1);
        }
        await cmdConsole(args[0]);
        break;
      case 'flow':
        await cmdFlow();
        break;
      case 'mobile':
        await cmdMobile();
        break;
      case 'diagnosis':
        await cmdDiagnosisFlow();
        break;
      default:
        console.log(`Browser Automation Script\n`);
        console.log(`Usage: pnpm browser <command> [options]\n`);
        console.log(`Commands:`);
        console.log(`  home           打开首页并截图 (public/screenshots/home.png)`);
        console.log(`  screenshot     截取指定 URL`);
        console.log(`  console        检查控制台报错 + 失败请求 (4xx/5xx)`);
        console.log(`  flow           跑主流程: 首页→diagnosis→result→execute→submit`);
        console.log(`  mobile         移动端截图: 首页 / diagnosis / result (iPhone 14 Pro)`);
        console.log(`  diagnosis      交互式诊断流程: 首页→答题→result`);
        process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
})();
