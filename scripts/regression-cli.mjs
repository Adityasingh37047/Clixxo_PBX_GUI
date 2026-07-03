import { chromium } from 'playwright';
const BASE = 'http://localhost:5174';
const WIDTHS = [1920, 1600, 1440, 1366, 1280, 1113, 1024];

async function checkCli(page, name, path, scrollClass) {
  const issues = [];
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1200);
    const r = await page.evaluate((cls) => {
      const scroll = document.querySelector(`.${cls}`);
      const cmd = document.querySelector('input[type="text"], input:not([type="hidden"])');
      const title = document.body.innerText.includes('CLI') || document.body.innerText.includes('Asterisk') || document.body.innerText.includes('Linux');
      if (!scroll) return { ok: false, reason: 'no-scroll-panel' };
      const sr = scroll.getBoundingClientRect();
      const cs = getComputedStyle(scroll);
      const canScroll = cs.overflowY === 'auto' || cs.overflowY === 'scroll' || scroll.scrollHeight <= scroll.clientHeight + 5;
      return {
        ok: sr.height >= 80 && sr.width >= 200 && !!cmd && title,
        h: Math.round(sr.height),
        w: Math.round(sr.width),
        overflowY: cs.overflowY,
        canScroll,
        hasCmd: !!cmd,
      };
    }, scrollClass);
    if (!r.ok) issues.push({ page: name, width: w, ...r });
  }
  return issues;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ignoreHTTPSErrors: true });
await context.addInitScript(() => {
  sessionStorage.setItem('isAuthenticated', 'true');
  sessionStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'admin', access: { access_type: 'admin' } }));
});
await context.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"response":true,"data":{}}' }));
const page = await context.newPage();
const issues = [
  ...(await checkCli(page, 'Asterisk CLI', '/system-tools/asterisk-cli', 'asterisk-cli-scroll')),
  ...(await checkCli(page, 'Linux CLI', '/system-tools/linux-cli', 'linux-cli-scroll')),
];
console.log(JSON.stringify({ cliIssues: issues }, null, 2));
await browser.close();
process.exit(issues.length ? 1 : 0);
