import { test, expect } from '@playwright/test';

test('simple homepage test', async ({ page }) => {
  await page.goto('http://localhost:3005');
  await expect(page.locator('body')).toBeVisible();
});
