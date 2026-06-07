import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:5173/verify');
  await page.waitForTimeout(2000);
  
  const content = await page.content();
  if (content.includes('Verify Ownership')) {
    console.log('SUCCESS: Page rendered.');
  } else {
    console.log('FAILED: Text not found.');
    console.log(content);
  }
  
  await browser.close();
})();
