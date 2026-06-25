const fs = require("fs");
const path = require("path");

function tooltipScore(s) {
  let score = 0;
  for (const p of [/tooltipKey/, /FIELD_TOOLTIPS/, /tooltipProps/, /FxsFieldLabel/, /formatFieldTooltipTitle/, /<Tooltip/, /FilterField/]) {
    if (p.test(s)) score += 8;
  }
  return score;
}
function styleScore(s) {
  let score = 0;
  if (/className=/.test(s)) score += 6;
  if (/var\(--/.test(s)) score += 6;
  if (/btnVariantCls/.test(s)) score += 4;
  return score;
}
function resolveBlock(head, develop) {
  const ht = head.trim();
  const dt = develop.trim();
  if (!ht) return develop;
  if (!dt) return head;
  const ts = tooltipScore(head);
  const td = tooltipScore(develop);
  const ss = styleScore(head);
  const sd = styleScore(develop);
  if (td > ts && ss <= sd + 1) return develop;
  if (ss > sd + 1 && ts <= td) return head;
  if (td > ts) return develop;
  if (ss > sd) return head;
  return head.length >= develop.length ? head : develop;
}
function resolveConflicts(text) {
  let t = text;
  let out = "";
  let i = 0;
  while (true) {
    const start = t.indexOf("<<<<<<<", i);
    if (start < 0) {
      out += t.slice(i);
      break;
    }
    out += t.slice(i, start);
    const nl = t.indexOf("\n", start);
    const mid = t.indexOf("=======", nl + 1);
    const end = t.indexOf(">>>>>>>", mid + 1);
    if (mid < 0 || end < 0) throw new Error("broken conflict at " + start);
    const head = t.slice(nl + 1, mid);
    const develop = t.slice(t.indexOf("\n", mid) + 1, end);
    out += resolveBlock(head, develop);
    i = t.indexOf("\n", end) + 1;
  }
  return out;
}

const files = [
  "src/modules/Maitenance/System Tools/Radius.jsx",
  "src/modules/PBX/Extensions/ExtensionGroupsPage.jsx",
  "src/modules/PBX/Extensions/Extensions.jsx",
];
for (const f of files) {
  const p = path.join("D:/Clixxo_PBX_GUI", f);
  let text = fs.readFileSync(p, "utf8");
  for (let n = 0; n < 30 && text.includes("<<<<<<<"); n++) {
    text = resolveConflicts(text);
  }
  fs.writeFileSync(p, text, "utf8");
  console.log(f, (text.match(/<<<<<<</g) || []).length);
}
