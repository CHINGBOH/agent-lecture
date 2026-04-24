const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  
  await page.keyboard.press('p');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/ppt_cover.png' });
  
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/ppt_slide2.png' });
  
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/ppt_slide3.png' });
  
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/ppt_slide4.png' });
  
  await browser.close();
})();
