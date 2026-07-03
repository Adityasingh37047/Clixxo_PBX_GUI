import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const logs = [];
ctx.on('page', p => p.on('console', m => logs.push(m.text())));
ctx.on('page', p => p.on('pageerror', e => logs.push('PAGEERROR: ' + e.message)));
await ctx.addInitScript(() => {
  sessionStorage.setItem('isAuthenticated', 'true');
  sessionStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'admin', access: { access_type: 'admin' } }));
});
await ctx.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"response":true,"data":{}}' }));
const page = await ctx.newPage();
page.on('console', m => logs.push(m.text()));
page.on('pageerror', e => logs.push('PAGEERROR: ' + e.message));
for (const port of [5173, 5174]) {
  try {
    await page.goto(`http://localhost:${port}/system-tools/network`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    const info = await page.evaluate(() => ({
      port: location.port,
      url: location.href,
      bodyLen: document.body.innerText.length,
      hasMain: !!document.querySelector('main'),
      hasNativeScroll: !!document.querySelector('[data-native-scroll]'),
      rootHtml: document.getElementById('root')?.innerHTML?.slice(0, 200),
    }));
    console.log('PORT', port, JSON.stringify(info));
  } catch (e) {
    console.log('PORT', port, 'FAIL', e.message);
  }
}
console.log('LOGS', logs.slice(0, 20));
await browser.close();
