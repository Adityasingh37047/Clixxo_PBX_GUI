import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
await ctx.addInitScript(() => {
  sessionStorage.setItem('isAuthenticated', 'true');
  sessionStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'admin', access: { access_type: 'admin' } }));
});
await ctx.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"response":true,"data":{}}' }));
const page = await ctx.newPage();
await page.goto('http://localhost:5174/system-tools/asterisk-cli', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
const info = await page.evaluate(() => ({
  url: location.href,
  title: document.title,
  text: document.body.innerText.slice(0, 500),
  classes: [...document.querySelectorAll('[class*="cli"]')].map(e => e.className),
  inputs: document.querySelectorAll('input').length,
  html: document.querySelector('main')?.innerHTML?.slice(0, 800) || 'no main',
}));
console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: 'scripts/asterisk-cli-debug.png', fullPage: true });
await browser.close();
