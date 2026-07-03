import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, ignoreHTTPSErrors: true });
await context.addInitScript(() => {
  sessionStorage.setItem('isAuthenticated', 'true');
  sessionStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'admin', access: { access_type: 'admin' } }));
});
await context.route(/\/api(\/|$)/, (route) => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ response: true, data: { interfaces: [], lan: {}, wan: {} }, items: [], list: [], rows: [] }),
  });
});
const page = await context.newPage();
await page.goto('http://localhost:4173/system-tools/network', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(4000);
const info = await page.evaluate(() => ({
  bodyLen: document.body.innerText.length,
  snippet: document.body.innerText.slice(0, 300),
  hasMain: !!document.querySelector('main'),
  loading: document.body.innerText.includes('Loading') || !!document.querySelector('.MuiCircularProgress-root'),
  grid: !!document.querySelector('.settings-dashboard-grid'),
  inputs: document.querySelectorAll('input').length,
}));
console.log(JSON.stringify(info, null, 2));
await browser.close();
