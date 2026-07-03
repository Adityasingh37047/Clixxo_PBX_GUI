import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1920, height: 900 }, ignoreHTTPSErrors: true });
await context.addInitScript(() => {
  try {
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'admin', access: { access_type: 'admin' } }));
  } catch (_) {}
});
await context.route('**/api/**', (route) => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ response: true, data: {}, items: [], list: [], rows: [] }),
  });
});
const page = await context.newPage();
const paths = ['/system-tools/network', '/system-tools/asterisk-cli', '/isdn/isdn'];
for (const path of paths) {
  await page.goto(`http://localhost:5174${path}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(2000);
  const info = await page.evaluate((p) => ({
    path: p,
    bodyLen: document.body.innerText.length,
    snippet: document.body.innerText.slice(0, 200),
    hasMain: !!document.querySelector('main'),
    cliScroll: document.querySelectorAll('.asterisk-cli-scroll, .linux-cli-scroll').length,
    nativeScroll: document.querySelectorAll('[data-native-scroll]').length,
    settingsGrid: document.querySelectorAll('.settings-dashboard-grid').length,
    inputs: document.querySelectorAll('input').length,
  }), path);
  console.log(JSON.stringify(info));
}
await browser.close();
