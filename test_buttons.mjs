import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

// Listen for console errors
const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
  }
});

page.on('pageerror', err => {
  errors.push(err.message);
});

try {
  // Navigate to result page with a session ID (we need a real session to see the buttons)
  // First let's check the diagnosis page to create a session
  await page.goto('http://localhost:3005/diagnosis', { waitUntil: 'networkidle' });
  
  // Wait for the page to load
  await page.waitForTimeout(2000);
  
  // Check if there are any buttons on the diagnosis page
  const buttons = await page.$$('button');
  console.log('Number of buttons on diagnosis page:', buttons.length);
  
  // Check for errors
  if (errors.length > 0) {
    console.log('Console errors:', errors);
  } else {
    console.log('No console errors found');
  }
  
} catch (err) {
  console.error('Test error:', err.message);
}

await browser.close();
