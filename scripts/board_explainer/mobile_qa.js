const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // iPhone 390x844
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ media: 'screen' });
  const htmlFile = path.resolve('/Users/dynamic/Projects/plusx-mock/public/board-explainer/index.html');
  await page.goto(`file://${htmlFile}`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/mobile_qa_top.png', fullPage: false });
  console.log('Top screenshot saved');

  // Check play button visible
  const btn = await page.$('#play-btn');
  const btnBox = await btn.boundingBox();
  console.log(`Play button: x=${btnBox.x.toFixed(0)}, y=${btnBox.y.toFixed(0)}, w=${btnBox.width}, h=${btnBox.height}`);
  const viewHeight = 844;
  const viewWidth = 390;
  console.log(`Button bottom-right: right edge at ${(btnBox.x + btnBox.width).toFixed(0)}/${viewWidth}, bottom at ${(btnBox.y + btnBox.height).toFixed(0)}/${viewHeight}`);

  // Scroll to section 7 (table section) and screenshot
  await page.evaluate(() => {
    document.getElementById('section-7').scrollIntoView();
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/mobile_qa_s7.png', fullPage: false });
  console.log('Section 7 screenshot saved');

  // Check for horizontal overflow
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`Horizontal overflow: ${overflow}`);

  // Check section 8 table
  await page.evaluate(() => {
    document.getElementById('section-8').scrollIntoView();
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/mobile_qa_s8.png', fullPage: false });
  console.log('Section 8 screenshot saved');

  await browser.close();
})();
