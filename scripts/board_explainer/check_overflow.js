const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  const htmlFile = path.resolve('public/board-explainer/index.html');
  await page.goto(`file://${htmlFile}`);
  await page.waitForTimeout(300);
  
  const offenders = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const results = [];
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1) {
        results.push({tag: el.tagName, id: el.id, cls: el.className, right: Math.round(r.right), width: Math.round(r.width)});
      }
    });
    return results.slice(0, 10);
  });
  console.log('Overflow offenders:', JSON.stringify(offenders, null, 2));
  await browser.close();
})();
