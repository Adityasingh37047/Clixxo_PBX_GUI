import { chromium } from 'playwright';
const BASE = 'http://localhost:4173';
const cases = [
  { page: 'Voicemail', path: '/voicemail/voicemail', btn: /add|new|create/i },
  { page: 'Record Settings', path: '/record-settings/record-settings', btn: /add|new|create|edit/i },
  { page: 'Call Queue', path: '/call-features/call-queue', btn: /add|new|create/i },
];
const widths = [1920, 1280, 1024];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ignoreHTTPSErrors: true });
await context.addInitScript(() => {
  sessionStorage.setItem('isAuthenticated', 'true');
  sessionStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'admin', access: { access_type: 'admin' } }));
});
await context.route(/\/api(\/|$)/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"response":true,"data":{},"items":[]}' }));
const page = await context.newPage();
const issues = [];
for (const c of cases) {
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(`${BASE}${c.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const btn = page.getByRole('button', { name: c.btn }).first();
    if (!(await btn.count())) continue;
    await btn.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => {
      const paper = document.querySelector('.MuiDialog-paper');
      if (!paper) return null;
      const content = paper.querySelector('.MuiDialogContent-root') || paper;
      const cs = getComputedStyle(content);
      return { sh: content.scrollHeight, ch: content.clientHeight, oy: cs.overflowY, mh: getComputedStyle(paper).maxHeight };
    });
    if (!r) { issues.push({ page: c.page, width: w, issue: 'dialog did not open' }); }
    else if (r.sh > r.ch + 30 && r.oy !== 'auto' && r.oy !== 'scroll') {
      issues.push({ page: c.page, width: w, issue: `no scroll oy=${r.oy} ${r.sh}/${r.ch}` });
    }
    await page.keyboard.press('Escape');
  }
}
console.log(JSON.stringify({ issues }, null, 2));
await browser.close();
process.exit(issues.length ? 1 : 0);
