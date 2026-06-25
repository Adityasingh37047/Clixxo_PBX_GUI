const fs = require("fs");
const path = require("path");

const CONFLICT_RE =
  /<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>> develop\r?\n/g;

function tooltipScore(s) {
  let score = 0;
  const patterns = [
    /tooltipKey/,
    /E1PriFieldLabel/,
    /FilterField/,
    /TimeConditionFieldLabel/,
    /FIELD_TOOLTIPS/,
    /_TOOLTIPS/,
    /formatFieldTooltipTitle/,
    /FIELD_TOOLTIP_PROPS/,
    /<Tooltip/,
    /Tooltip,/,
    /tooltips=\{/,
  ];
  for (const p of patterns) if (p.test(s)) score += 8;
  return score;
}

function styleScore(s) {
  let score = 0;
  if (/className=/.test(s)) score += 6;
  if (/var\(--/.test(s)) score += 6;
  if (/bg-\[var/.test(s)) score += 4;
  if (/_PAGE_|_TABLE_|_BLUE_BAR_|_FORM_|clixxo-/.test(s)) score += 4;
  if (/const [A-Z_]+ =\s*"/.test(s)) score += 3;
  // develop-only style objects we should avoid if head has classes
  if (/sipPcmCardStyle/.test(s)) score -= 20;
  if (/sx=\{\{/.test(s) && !/className=/.test(s)) score -= 1;
  return score;
}

function isImportBlock(s) {
  const t = s.trim();
  return t.startsWith("import ") || (t.includes("\nimport ") && !t.includes("return ("));
}

function resolveBlock(head, develop) {
  const h = head;
  const d = develop;
  const ht = h.trim();
  const dt = d.trim();
  if (!ht) return d;
  if (!dt) return h;

  const ts = tooltipScore(h);
  const td = tooltipScore(d);
  const ss = styleScore(h);
  const sd = styleScore(d);

  if (isImportBlock(ht) && isImportBlock(dt)) {
    if (td > ts) return d;
    if (ts > td) return h;
    return d.length >= h.length ? d : h;
  }

  // Tooltip label swap: develop label + prefer head TextField if className richer
  if (td > ts && /E1PriFieldLabel|FilterField|TimeConditionFieldLabel/.test(d)) {
    if (ss > sd + 2) {
      // keep head but try to inject develop label - fallback develop (usually same className on fields)
    }
    return d;
  }

  if (ss > sd + 1 && ts <= td) return h;
  if (td > ts && sd >= ss - 2) return d;
  if (ss > sd) return h;
  if (td > ts) return d;
  return h.length >= d.length ? h : d;
}

function resolveFile(filePath) {
  let text = fs.readFileSync(filePath, "utf8");
  if (!text.includes("<<<<<<< HEAD")) return false;
  const newText = text.replace(CONFLICT_RE, (_, head, develop) => resolveBlock(head, develop));
  if (newText === text) return false;
  fs.writeFileSync(filePath, newText, "utf8");
  return true;
}

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(jsx|js|css)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

let changed = 0;
for (const p of walk("D:/Clixxo_PBX_GUI/src")) {
  if (resolveFile(p)) {
    changed++;
    console.log("resolved:", p.replace("D:\\Clixxo_PBX_GUI\\", ""));
  }
}
console.log("files auto-resolved:", changed);
