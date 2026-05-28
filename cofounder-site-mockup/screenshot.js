const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch();

  for (let i = 1; i <= 8; i++) {
    const v = `v0${i}`;
    const fileUrl = `file://${path.join(__dirname, 'cofounder-site-mockup/variations', v, 'index.html')}`;

    // Desktop
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktopPage.goto(fileUrl);
    await desktopPage.screenshot({ path: `cofounder-site-mockup/variations/${v}/desktop.png`, fullPage: true });
    await desktopPage.close();

    // Mobile
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobilePage.goto(fileUrl);
    await mobilePage.screenshot({ path: `cofounder-site-mockup/variations/${v}/mobile.png`, fullPage: true });
    await mobilePage.close();

    console.log(`Saved screenshots for ${v}`);
  }

  await browser.close();
})();
