/**
 * Extended regression: dialogs, ISDN h-scroll, desktop parity metrics.
 */
import { chromium } from 'playwright';

const BASE = process.env.REGRESSION_BASE_URL || 'http://localhost:4173';
const DESKTOP_WIDTHS = [1920, 1600, 1440];
const NARROW_WIDTHS = [1366, 1280, 1113, 1024];

async function setup() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 900 }, ignoreHTTPSErrors: true });
  await context.addInitScript(() => {
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'admin', access: { access_type: 'admin' } }));
  });
  await context.route(/\/api(\/|$)/, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ response: true, data: { interfaces: [], extensions: [], items: [] }, items: [], list: [], rows: [] }),
    });
  });
  const page = await context.newPage();
  return { browser, page };
}

async function desktopParity(page) {
  const issues = [];
  const settingsPath = '/system-tools/network';
  for (const w of DESKTOP_WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(`${BASE}${settingsPath}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const m = await page.evaluate(() => {
      const outlet = document.querySelector('.app-page-outlet');
      const grid = document.querySelector('.settings-dashboard-grid');
      const native = document.querySelector('[data-native-scroll]');
      const divider = document.querySelector('.settings-dashboard-divider');
      return {
        outletPad: outlet ? getComputedStyle(outlet).paddingLeft : null,
        gridCols: grid ? getComputedStyle(grid).gridTemplateColumns : null,
        dividerDisplay: divider ? getComputedStyle(divider).display : null,
        nativePad: native ? getComputedStyle(native).paddingLeft : null,
      };
    });
    if (m.outletPad !== '16px') issues.push({ check: 'desktop-outlet-padding', width: w, detail: m.outletPad });
    if (!m.gridCols || m.gridCols.split(' ').length < 2) issues.push({ check: 'desktop-grid-not-2col', width: w, detail: m.gridCols });
    if (m.dividerDisplay === 'none') issues.push({ check: 'desktop-divider-hidden', width: w, detail: m.dividerDisplay });
    if (m.nativePad === '8px') issues.push({ check: 'desktop-native-8px', width: w, detail: m.nativePad });
  }
  return issues;
}

async function isdnHorizontalScroll(page) {
  const issues = [];
  for (const w of NARROW_WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(`${BASE}/isdn/isdn`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const r = await page.evaluate(() => {
      const main = document.querySelector('main');
      const doc = document.documentElement;
      const contentWide = [...document.querySelectorAll('div')].some((d) => d.scrollWidth >= 1350);
      const mainCanScroll = main && main.scrollWidth > main.clientWidth + 4;
      const docCanScroll = doc.scrollWidth > doc.clientWidth + 4;
      return { contentWide, mainCanScroll, docCanScroll, mainSW: main?.scrollWidth, mainCW: main?.clientWidth, vw: window.innerWidth };
    });
    if (r.contentWide && !r.mainCanScroll && !r.docCanScroll) {
      issues.push({ check: 'isdn-no-h-scroll', width: w, detail: JSON.stringify(r) });
    }
  }
  return issues;
}

async function extensionsDialogScroll(page) {
  const issues = [];
  for (const w of [1920, 1280, 1024]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(`${BASE}/extensions/extensions`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    const addBtn = page.getByRole('button', { name: /add|new|create/i }).first();
    if (!(await addBtn.count())) {
      issues.push({ check: 'dialog-not-found', width: w, detail: 'no add button' });
      continue;
    }
    await addBtn.click();
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => {
      const paper = document.querySelector('.MuiDialog-paper');
      if (!paper) return { open: false };
      const content = paper.querySelector('.MuiDialogContent-root') || paper;
      const cs = getComputedStyle(content);
      return {
        open: true,
        scrollH: content.scrollHeight,
        clientH: content.clientHeight,
        overflowY: cs.overflowY,
        maxHeight: getComputedStyle(paper).maxHeight,
      };
    });
    if (!r.open) {
      issues.push({ check: 'dialog-not-open', width: w, detail: 'MuiDialog missing' });
    } else if (r.scrollH > r.clientH + 30 && r.overflowY !== 'auto' && r.overflowY !== 'scroll') {
      issues.push({ check: 'dialog-no-scroll', width: w, detail: `oy=${r.overflowY} ${r.scrollH}/${r.clientH}` });
    }
    await page.keyboard.press('Escape');
  }
  return issues;
}

async function cliPages(page) {
  const issues = [];
  const pages = [
    { name: 'Asterisk CLI', path: '/system-tools/asterisk-cli', cls: 'asterisk-cli-scroll' },
    { name: 'Linux CLI', path: '/system-tools/linux-cli', cls: 'linux-cli-scroll' },
  ];
  for (const pg of pages) {
    for (const w of [1920, 1280, 1024]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(`${BASE}${pg.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      const r = await page.evaluate((cls) => {
        const panel = document.querySelector(`.${cls}`);
        const input = document.querySelector('input[type="text"], input:not([type="hidden"])');
        if (!panel || !input) return { ok: false, panel: !!panel, input: !!input };
        const pr = panel.getBoundingClientRect();
        const cs = getComputedStyle(panel);
        return { ok: pr.height >= 100 && pr.width >= 200, h: pr.height, w: pr.width, oy: cs.overflowY };
      }, pg.cls);
      if (!r.ok) issues.push({ page: pg.name, width: w, check: 'cli-broken', detail: JSON.stringify(r) });
    }
  }
  return issues;
}

async function pcmScroll(page) {
  const issues = [];
  for (const w of [1920, 1280, 1024]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(`${BASE}/pcm/circuit-maintenance`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => {
      const main = document.querySelector('main');
      const tables = [...document.querySelectorAll('table')];
      const wideTable = tables.find((t) => t.scrollWidth > t.clientWidth + 5);
      if (!wideTable) return { wide: false };
      let w = wideTable.parentElement;
      for (let i = 0; i < 12 && w; i++) {
        const cs = getComputedStyle(w);
        if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && w.scrollWidth > w.clientWidth) {
          return { wide: true, scrollable: true };
        }
        w = w.parentElement;
      }
      const mainScroll = main && main.scrollWidth > main.clientWidth + 4;
      return { wide: true, scrollable: false, mainScroll };
    });
    if (r.wide && !r.scrollable && !r.mainScroll) {
      issues.push({ check: 'pcm-no-scroll', width: w, detail: JSON.stringify(r) });
    }
  }
  return issues;
}

const { browser, page } = await setup();
const all = [
  ...(await desktopParity(page)),
  ...(await isdnHorizontalScroll(page)),
  ...(await extensionsDialogScroll(page)),
  ...(await cliPages(page)),
  ...(await pcmScroll(page)),
];
console.log(JSON.stringify({ issueCount: all.length, issues: all }, null, 2));
await browser.close();
process.exit(all.length ? 1 : 0);
