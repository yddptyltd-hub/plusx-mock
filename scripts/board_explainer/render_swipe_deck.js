const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const BASE = path.join(__dirname);
  const OUT = path.join(__dirname, '../../public/board-explainer');

  // Render 6 cards at 1080x1920
  for (let n = 1; n <= 6; n++) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1080, height: 1920 });
    const file = path.resolve(`${BASE}/card_${n}.html`);
    await page.goto(`file://${file}`);
    await page.waitForTimeout(200);
    const outFile = path.join(OUT, `swipe-deck/card-${n}.png`);
    await page.screenshot({ path: outFile, fullPage: false });
    const size = fs.statSync(outFile).size;
    console.log(`card-${n}.png: ${(size/1024).toFixed(1)} KB`);
    await page.close();
  }

  // OG preview at 1200x630
  const ogPage = await browser.newPage();
  await ogPage.setViewportSize({ width: 1200, height: 630 });
  await ogPage.goto(`file://${path.resolve(BASE + '/og_preview.html')}`);
  await ogPage.waitForTimeout(200);
  const ogOut = path.join(OUT, 'og-preview.png');
  await ogPage.screenshot({ path: ogOut, fullPage: false });
  const ogSize = fs.statSync(ogOut).size;
  console.log(`og-preview.png: ${(ogSize/1024).toFixed(1)} KB`);
  await ogPage.close();

  await browser.close();
  console.log('All images rendered.');
})();
