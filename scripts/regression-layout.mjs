/**
 * Layout regression at DevTools viewport widths.
 * Run: node scripts/regression-layout.mjs
 */
import { chromium } from 'playwright';

const WIDTHS = [1920, 1600, 1440, 1366, 1280, 1113, 1024];
const BASE = process.env.REGRESSION_BASE_URL || 'http://localhost:4173';

const PAGES = [
  { name: 'Network', path: '/system-tools/network', type: 'settings' },
  { name: 'Storage', path: '/system-tools/storage', type: 'settings' },
  { name: 'Management', path: '/system-tools/management', type: 'settings' },
  { name: 'FXS SIP', path: '/voip/sip', type: 'settings' },
  { name: 'FXS Media', path: '/voip/media', type: 'settings' },
  { name: 'SIP Compatibility', path: '/voip/sip-compatibility', type: 'settings' },
  { name: 'NAT Settings', path: '/voip/nat-settings', type: 'settings' },
  { name: 'FXS General', path: '/advanced/general', type: 'settings' },
  { name: 'DTMF', path: '/advanced/dtmf', type: 'settings' },
  { name: 'E1 SIP', path: '/sip/sip', type: 'settings' },
  { name: 'E1 Media', path: '/sip/media', type: 'settings' },
  { name: 'Feature Code', path: '/feature-code/feature-code', type: 'feature' },
  { name: 'PCM Circuit Maintenance', path: '/pcm/circuit-maintenance', type: 'pcm' },
  { name: 'ISDN', path: '/isdn/isdn', type: 'isdn' },
  { name: 'Asterisk CLI', path: '/system-tools/asterisk-cli', type: 'cli' },
  { name: 'Linux CLI', path: '/system-tools/linux-cli', type: 'cli' },
  { name: 'PbxMonitor', path: '/pbx-status/pbx-monitor', type: 'table' },
  { name: 'Extensions', path: '/extensions/extensions', type: 'table' },
  { name: 'Call Count', path: '/call-detail-records/call-count', type: 'table' },
];

async function runChecks(page, pageType) {
  return page.evaluate((ptype) => {
    function rectsOverlap(a, b, gap = 2) {
      return !(
        a.right < b.left + gap ||
        a.left > b.right - gap ||
        a.bottom < b.top + gap ||
        a.top > b.bottom - gap
      );
    }

    function isScrollable(el) {
      if (!el) return false;
      const cs = getComputedStyle(el);
      const ox = cs.overflowX;
      return (ox === 'auto' || ox === 'scroll' || ox === 'overlay') && el.scrollWidth > el.clientWidth + 2;
    }

    function isVertScrollable(el) {
      if (!el) return false;
      const cs = getComputedStyle(el);
      const oy = cs.overflowY;
      return (oy === 'auto' || oy === 'scroll' || oy === 'overlay') && el.scrollHeight > el.clientHeight + 2;
    }

    function findScrollAncestor(el) {
      let node = el;
      while (node && node !== document.body) {
        if (isScrollable(node) || isVertScrollable(node)) return node;
        node = node.parentElement;
      }
      return null;
    }

    const issues = [];

    const dividers = [
      ...document.querySelectorAll('hr, .MuiDivider-root, .settings-dashboard-divider'),
    ].filter((d) => {
      const r = d.getBoundingClientRect();
      return r.width > 30 || r.height > 1;
    });

    document.querySelectorAll('h1,h2,h3,h4,h5,h6,.MuiTypography-h6').forEach((h) => {
      const hr = h.getBoundingClientRect();
      if (hr.width < 20 || hr.height < 10) return;
      const text = (h.textContent || '').trim();
      if (!text || text.length > 80) return;
      dividers.forEach((d) => {
        const dr = d.getBoundingClientRect();
        if (rectsOverlap(hr, dr, -1)) {
          issues.push({ check: 'heading-divider-overlap', detail: text.slice(0, 50) });
        }
      });
    });

    document.querySelectorAll('.MuiPaper-root, [class*="MuiPaper"]').forEach((card) => {
      const cr = card.getBoundingClientRect();
      if (cr.width < 120 || cr.height < 50) return;
      card.querySelectorAll('input,select,textarea,.MuiSelect-root,.MuiOutlinedInput-root,button').forEach((ch) => {
        const chr = ch.getBoundingClientRect();
        if (chr.width < 10) return;
        const pad = 1;
        if (chr.left < cr.left - pad || chr.right > cr.right + pad) {
          let clipped = false;
          let p = ch.parentElement;
          while (p && p !== card) {
            const ps = getComputedStyle(p);
            if (ps.overflow === 'hidden' || ps.overflowX === 'hidden') {
              clipped = true;
              break;
            }
            p = p.parentElement;
          }
          if (!clipped && !findScrollAncestor(ch)) {
            issues.push({ check: 'card-content-overlap', detail: ch.tagName });
          }
        }
      });
    });

    document.querySelectorAll('input:not([type="hidden"]),select,textarea,.MuiSelect-select,.MuiInputBase-input').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 10 || r.height < 8) return;
      if (el.scrollWidth > el.clientWidth + 4) {
        issues.push({ check: 'input-clipped', detail: el.getAttribute('name') || el.id || 'control' });
      }
      let p = el.parentElement;
      for (let i = 0; i < 8 && p; i++) {
        const pr = p.getBoundingClientRect();
        const ps = getComputedStyle(p);
        if ((ps.overflow === 'hidden' || ps.overflowX === 'hidden') && pr.width > 50) {
          if (r.right > pr.right + 3 || r.left < pr.left - 3) {
            issues.push({ check: 'input-parent-clip', detail: el.getAttribute('name') || el.tagName });
            break;
          }
        }
        p = p.parentElement;
      }
    });

    document.querySelectorAll('.MuiSelect-root').forEach((sel) => {
      const r = sel.getBoundingClientRect();
      if (r.width < 10) return;
      const root = sel.closest('.MuiFormControl-root') || sel;
      const rr = root.getBoundingClientRect();
      if (r.right > rr.right + 4) {
        issues.push({ check: 'dropdown-clipped', detail: 'MuiSelect' });
      }
    });

    document.querySelectorAll('table').forEach((table) => {
      if (table.scrollWidth <= table.clientWidth + 3) return;
      let wrap = table.parentElement;
      let found = false;
      for (let i = 0; i < 12 && wrap; i++) {
        if (isScrollable(wrap)) {
          found = true;
          break;
        }
        wrap = wrap.parentElement;
      }
      if (!found) {
        const main = document.querySelector('main');
        if (!isScrollable(main)) {
          issues.push({ check: 'table-no-h-scroll', detail: 'wide-table' });
        }
      }
    });

    document.querySelectorAll('.MuiDialog-paper').forEach((paper) => {
      const content = paper.querySelector('.MuiDialogContent-root') || paper;
      if (content.scrollHeight > content.clientHeight + 24) {
        const cs = getComputedStyle(content);
        if (cs.overflowY !== 'auto' && cs.overflowY !== 'scroll' && !isVertScrollable(paper)) {
          issues.push({ check: 'dialog-no-scroll', detail: 'dialog-content' });
        }
      }
    });

    if (ptype === 'isdn') {
      const main = document.querySelector('main');
      const body = document.body;
      const root = document.documentElement;
      const wideChild = [...document.querySelectorAll('div')].find((d) => d.scrollWidth >= 1380);
      if (wideChild && window.innerWidth < 1400) {
        const canScroll =
          isScrollable(main) ||
          isScrollable(body) ||
          isScrollable(root) ||
          main?.scrollWidth > main?.clientWidth + 5 ||
          root.scrollWidth > root.clientWidth + 5;
        if (!canScroll) {
          issues.push({ check: 'isdn-no-h-scroll', detail: `viewport=${window.innerWidth}` });
        }
      }
    }

    if (ptype === 'cli') {
      const terminal = document.querySelector('.asterisk-cli-scroll, .linux-cli-scroll, textarea, pre');
      if (!terminal) {
        issues.push({ check: 'cli-missing', detail: 'no terminal panel' });
      } else {
        const tr = terminal.getBoundingClientRect();
        const cs = getComputedStyle(terminal);
        if (tr.height < 80) issues.push({ check: 'cli-too-small', detail: `h=${Math.round(tr.height)}` });
        if (cs.overflowY !== 'auto' && cs.overflowY !== 'scroll' && terminal.scrollHeight > terminal.clientHeight + 20) {
          issues.push({ check: 'cli-no-scroll', detail: 'output panel' });
        }
      }
      const cmd = document.querySelector('input[type="text"], input:not([type="hidden"])');
      if (!cmd) issues.push({ check: 'cli-missing', detail: 'no command input' });
    }

    if (ptype === 'pcm') {
      const tables = document.querySelectorAll('table');
      tables.forEach((t) => {
        if (t.scrollWidth > t.clientWidth + 5) {
          let w = t.parentElement;
          let ok = false;
          for (let i = 0; i < 10 && w; i++) {
            if (isScrollable(w)) {
              ok = true;
              break;
            }
            w = w.parentElement;
          }
          if (!ok) issues.push({ check: 'pcm-no-scroll', detail: 'table' });
        }
      });
    }

    if (ptype === 'settings' && window.innerWidth >= 1440) {
      const grid = document.querySelector('.settings-dashboard-grid');
      if (grid) {
        const cols = getComputedStyle(grid).gridTemplateColumns;
        const parts = cols.split(' ').filter(Boolean);
        if (parts.length === 1 && parts[0].includes('1fr')) {
          issues.push({ check: 'desktop-grid-stacked', detail: cols });
        }
      }
    }

    const seen = new Set();
    return issues.filter((i) => {
      const k = `${i.check}:${i.detail}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, pageType);
}

async function run() {
  let browser;
  const allIssues = [];

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 900 }, ignoreHTTPSErrors: true });

    await context.addInitScript(() => {
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('user', JSON.stringify({
        username: 'admin',
        role: 'admin',
        access: { access_type: 'admin' },
      }));
    });

    await context.route(/\/api(\/|$)/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ response: true, data: {}, items: [], list: [], rows: [] }),
      });
    });

    const page = await context.newPage();

    for (const pg of PAGES) {
      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: 900 });
        try {
          await page.goto(`${BASE}${pg.path}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
        } catch (e) {
          allIssues.push({ page: pg.name, width: w, check: 'navigation', detail: String(e.message).slice(0, 80) });
          continue;
        }
        await page.waitForTimeout(1500);

        if (page.url().includes('/login')) {
          allIssues.push({ page: pg.name, width: w, check: 'auth-redirect', detail: 'login' });
          continue;
        }

        const loaded = await page.evaluate(() => ({
          hasMain: !!document.querySelector('main'),
          bodyLen: (document.body?.innerText || '').trim().length,
        }));
        if (!loaded.hasMain || loaded.bodyLen < 30) {
          allIssues.push({
            page: pg.name,
            width: w,
            check: 'page-not-loaded',
            detail: `main=${loaded.hasMain} text=${loaded.bodyLen}`,
          });
          continue;
        }

        const issues = await runChecks(page, pg.type);
        for (const issue of issues) {
          allIssues.push({ page: pg.name, width: w, ...issue });
        }
      }
    }

    const grouped = {};
    for (const i of allIssues) {
      const key = `${i.page} @ ${i.width}px`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(`${i.check}: ${i.detail}`);
    }

    console.log(JSON.stringify({ issueCount: allIssues.length, grouped, allIssues }, null, 2));
    process.exit(allIssues.length > 0 ? 1 : 0);
  } catch (e) {
    console.error('Runner failed:', e);
    process.exit(2);
  } finally {
    if (browser) await browser.close();
  }
}

run();
