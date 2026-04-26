/**
 * 验证 execute 页面 prompt 预填功能
 * 跑真实链路：diagnosis → result → execute → 生成
 */

import { chromium, type Page, type Request } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

interface NetworkRequest {
  url: string;
  method: string;
  body?: string;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 收集 /api/execute/generate 请求
  const executeRequests: NetworkRequest[] = [];
  page.on('request', (req) => {
    if (req.url().includes('/api/execute/generate')) {
      executeRequests.push({
        url: req.url(),
        method: req.method(),
        body: req.postData() ?? undefined,
      });
    }
  });

  let sessionId = '';
  let executePageLoaded = false;
  let textareaContent = '';
  let promptPreviewText = '';
  let generateClicked = false;
  let hasResultImage = false;
  let errorMessage = '';

  try {
    console.log('=== Step 1: 打开 diagnosis 页面 ===');
    await page.goto(`${BASE}/diagnosis`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // 截图 diagnosis 页面
    await page.screenshot({ path: 'public/screenshots/01-diagnosis.png', fullPage: true });
    console.log('✅ diagnosis 页面已截图');

    // 五道题的答案选项（根据 diagnosis 问卷固定选项）
    // 通常是 A/B/C/D 选项，我们用默认值
    console.log('=== Step 2: 提交五道题 ===');

    // 找到所有单选按钮并选择第一个选项（跳过"我需要为..."类型的开放题）
    const radios = await page.$$('input[type="radio"]');
    console.log(`  找到 ${radios.length} 个单选按钮`);

    // 选择第一个可用选项
    if (radios.length > 0) {
      // 按选项组选择，每组选 A
      let count = 0;
      const selected: string[] = [];
      for (const radio of radios) {
        const value = await radio.getAttribute('value');
        const name = await radio.getAttribute('name');
        if (value && name && !selected.includes(name)) {
          selected.push(name);
          await radio.click();
          count++;
          if (count >= 5) break; // 只选前5个
        }
      }
      console.log(`  选择了 ${count} 个答案`);
    }

    await page.waitForTimeout(500);

    // 找提交按钮
    const submitBtn = await page.$('button[type="submit"], button:has-text("提交"), button:has-text("开始诊断")');
    if (submitBtn) {
      await submitBtn.click();
      console.log('✅ 点击了提交按钮');
    } else {
      console.log('⚠ 未找到提交按钮，尝试查找下一步按钮');
      const nextBtn = await page.$('button:has-text("下一步"), button:has-text("继续")');
      if (nextBtn) await nextBtn.click();
    }

    // 等待 result 页面或继续答题
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'public/screenshots/02-after-submit.png', fullPage: true });

    const currentUrl = page.url();
    console.log(`  当前 URL: ${currentUrl}`);

    if (currentUrl.includes('/result')) {
      sessionId = new URL(currentUrl).searchParams.get('session') ?? '';
      console.log(`✅ 已跳转到 result 页面，sessionId=${sessionId}`);
    } else {
      // 可能还在 diagnosis 页面，继续找提交按钮
      console.log('⚠ 仍在 diagnosis 页面，继续查找提交按钮');
      const submitBtn2 = await page.$('button:has-text("提交"), button[type="submit"]');
      if (submitBtn2) await submitBtn2.click();
      await page.waitForTimeout(3000);
      if (page.url().includes('/result')) {
        sessionId = new URL(page.url()).searchParams.get('session') ?? '';
        console.log(`✅ 跳转到 result，sessionId=${sessionId}`);
      }
    }

    // 如果有 sessionId，尝试直接进入 result 页面
    if (!sessionId || !currentUrl.includes('/result')) {
      // 尝试从 localStorage 或 previous page 获取 session
      console.log('  尝试通过 API 创建 session...');
      const sessionRes = await page.evaluate(async (base) => {
        const r = await fetch(`${base}/api/diagnosis/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'verify-test', contact: 'test@test.com' })
        });
        return r.json();
      }, BASE);
      sessionId = sessionRes.id ?? '';
      console.log(`  通过 API 创建 session: ${sessionId}`);

      if (sessionId) {
        // 提交答案
        await page.evaluate(async ({ sessionId: sid, base }) => {
          await fetch(`${base}/api/diagnosis/session/${sid}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              answers: { 1: 'A', 2: 'A', 3: 'C', 4: 'A', 5: 'B' },
              action: 'model_photo',
              completed: true
            })
          });
        }, { sessionId, base: BASE });

        await page.goto(`${BASE}/result?session=${sessionId}`, { waitUntil: 'networkidle', timeout: 30000 });
        console.log(`✅ 进入 result 页面: ${page.url()}`);
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'public/screenshots/03-result.png', fullPage: true });

    // 在 result 页面找"立即在线生成"按钮
    console.log('=== Step 3: 在 result 页面找生成按钮 ===');
    const generateBtn = await page.$('a[href*="/execute"], button:has-text("立即在线生成"), a:has-text("立即在线生成")');
    if (generateBtn) {
      await generateBtn.click();
      console.log('✅ 点击了生成按钮');
    } else {
      // 尝试直接导航到 execute
      const resultUrl = page.url();
      const sessId = new URL(resultUrl).searchParams.get('session') ?? sessionId;
      if (sessId) {
        await page.goto(`${BASE}/execute?session=${sessId}&action=model_photo`, { waitUntil: 'networkidle', timeout: 30000 });
        console.log('✅ 直接进入 execute 页面');
      }
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'public/screenshots/04-execute.png', fullPage: true });

    console.log('=== Step 4: 检查 execute 页面 ===');
    executePageLoaded = true;

    // 检查 textarea 内容
    const textarea = await page.$('textarea');
    if (textarea) {
      textareaContent = await textarea.inputValue();
      console.log(`  textarea 内容长度: ${textareaContent.length}`);
      console.log(`  textarea 前100字: ${textareaContent.substring(0, 100)}...`);
      if (textareaContent.length > 0) {
        console.log('✅ textarea 已预填内容');
      } else {
        console.log('❌ textarea 内容为空');
      }
    } else {
      console.log('❌ 未找到 textarea');
    }

    // 检查任务预览卡片
    const previewCard = await page.$('.rounded-xl.bg-gradient-to-br, [class*="bg-gray-900"]');
    if (previewCard) {
      promptPreviewText = await previewCard.textContent() ?? '';
      console.log(`  任务预览: ${promptPreviewText.replace(/\s+/g, ' ').trim().substring(0, 80)}`);
    }

    // 检查"④ 生成的 Prompt"区域
    const promptSection = await page.$('h3:has-text("生成的 Prompt"), h3:has-text("Prompt")');
    if (promptSection) {
      console.log('✅ 找到 Prompt 区域');
    }

    // 点击生成按钮
    console.log('=== Step 5: 点击生成按钮 ===');
    const createBtn = await page.$('button:has-text("开始生成"), button:has-text("立即帮我做一版"), button:has-text("开始生成")');
    if (createBtn) {
      generateClicked = true;
      await createBtn.click();
      console.log('✅ 点击了生成按钮');
    } else {
      console.log('❌ 未找到生成按钮');
    }

    // 等待生成结果（最多60秒）
    console.log('  等待生成结果（最多60秒）...');
    const startTime = Date.now();
    let foundImage = false;

    while (Date.now() - startTime < 60000 && !foundImage) {
      await page.waitForTimeout(3000);

      // 检查是否有图片结果
      const imgEl = await page.$('img[alt="制作结果"], .rounded-xl.border img');
      if (imgEl) {
        const src = await imgEl.getAttribute('src');
        if (src && !src.includes('placeholder') && !src.includes('loading')) {
          foundImage = true;
          hasResultImage = true;
          console.log(`✅ 找到生成图片: ${src.substring(0, 80)}...`);
          await page.screenshot({ path: 'public/screenshots/05-result.png', fullPage: true });
        }
      }

      // 检查是否有错误
      const errorEl = await page.$('.text-red-500, [class*="error"]');
      if (errorEl) {
        errorMessage = await errorEl.textContent() ?? '未知错误';
        console.log(`❌ 出现错误: ${errorMessage}`);
        break;
      }

      // 检查是否还在 loading
      const loadingEl = await page.$('.animate-spin');
      if (!loadingEl && !foundImage) {
        const currentUrl2 = page.url();
        console.log(`  当前 URL: ${currentUrl2}`);
      }
    }

    if (foundImage) {
      console.log('✅ 生成成功');
    } else {
      console.log('⚠ 60秒内未检测到图片结果');
    }

    // 打印捕获到的 API 请求
    console.log('\n=== API 请求捕获 ===');
    if (executeRequests.length > 0) {
      for (const req of executeRequests) {
        console.log(`  ${req.method} ${req.url}`);
        if (req.body) {
          try {
            const parsed = JSON.parse(req.body);
            console.log(`  Body: prompt="${parsed.prompt?.substring(0, 60)}..."`);
            console.log(`  Body keys: ${Object.keys(parsed).join(', ')}`);
            if (parsed.choiceMode !== undefined) {
              console.log(`  ⚠ choiceMode=${parsed.choiceMode}（旧字段未删除）`);
            }
          } catch {
            console.log(`  Body: ${req.body.substring(0, 100)}`);
          }
        }
      }
    } else {
      console.log('  未捕获到 /api/execute/generate 请求');
    }

  } catch (err) {
    console.error('❌ 脚本执行出错:', err);
  } finally {
    await browser.close();
  }

  // 输出报告
  console.log('\n========== 验证报告 ==========');
  console.log(`Part 1: execute 预填是否成功    → ${textareaContent.length > 0 ? '✅ YES' : '❌ NO'}`);
  console.log(`Part 2: generate API 请求       → ${executeRequests.length > 0 ? '✅ 已捕获' : '⚠ 未捕获'}`);
  console.log(`Part 3: 真实图片是否生成       → ${hasResultImage ? '✅ YES' : '⚠ NO（超时或API问题）'}`);
  console.log(`Part 4: 失败点定位              → ${errorMessage || 'N/A'}`);
  console.log('================================\n');
}

run().catch(console.error);
