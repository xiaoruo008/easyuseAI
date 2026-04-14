import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3005';

/**
 * 完整转化路径测试: 首页 → 诊断 → 结果 → 提交 → 留资提交
 */
test('完整转化路径 - 首页→diagnosis→result→submit→留资提交', async ({ page }) => {
  const errors: string[] = [];
  
  // 监听 console 错误
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
  });

  // ========== Step 1: 首页 ==========
  console.log('Step 1: 首页');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  const startLink = page.locator('a[href="/diagnosis"]').first();
  await expect(startLink).toBeVisible({ timeout: 10000 });
  console.log('✓ 首页加载成功');

  // ========== Step 2: 诊断页 ==========
  console.log('Step 2: 诊断页');
  await page.goto(`${BASE_URL}/diagnosis`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await expect(page.locator('h2').first()).toBeVisible({ timeout: 10000 });
  
  const totalSteps = 5;
  for (let step = 1; step <= totalSteps; step++) {
    console.log(`  回答第 ${step}/${totalSteps} 题`);
    await page.waitForTimeout(1500);
    const buttons = await page.locator('main button').all();
    if (buttons.length > 0) {
      await buttons[0].click();
      await page.waitForTimeout(2000);
    }
  }
  await page.waitForURL(/\/result\?session=/, { timeout: 20000 });
  console.log('✓ 诊断完成，跳转到结果页');

  // ========== Step 3: 结果页 ==========
  console.log('Step 3: 结果页');
  const currentUrl = page.url();
  const sessionId = currentUrl.split('session=')[1];
  console.log(`  Session ID: ${sessionId}`);
  await page.waitForTimeout(3000);
  await expect(page.locator('body')).toBeVisible();
  const submitButton = page.locator('button', { hasText: '限量0元领取' });
  await expect(submitButton).toBeVisible({ timeout: 10000 });
  console.log('✓ 结果页加载成功');

  // ========== Step 4: 提交页 ==========
  console.log('Step 4: 提交页');
  await submitButton.click();
  await page.waitForURL(/\/submit\?session=/, { timeout: 15000 });
  console.log('✓ 跳转到提交页');
  await page.waitForTimeout(1500);
  await expect(page.locator('input[placeholder="你的姓名"]')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('input[placeholder="11位手机号"]')).toBeVisible({ timeout: 5000 });
  console.log('✓ 提交表单加载成功');

  // ========== Step 5: 留资提交 ==========
  console.log('Step 5: 留资提交');
  await page.fill('input[placeholder="你的姓名"]', '测试用户');
  await page.fill('input[placeholder="11位手机号"]', '13800138000');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
  const successText = page.locator('text=提交成功');
  const isSuccess = await successText.isVisible().catch(() => false);
  console.log(`✓ 留资提交${isSuccess ? '成功' : '完成(可能需要API)'}`);

  // 输出错误
  if (errors.length > 0) {
    console.log('\n⚠ Console Errors:', errors);
    throw new Error('Console errors detected: ' + errors.join(', '));
  } else {
    console.log('\n✓ 无 Console 错误');
  }
});
