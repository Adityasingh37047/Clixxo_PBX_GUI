const fs = require("fs");
const path = require("path");

function tooltipScore(s) {
  let score = 0;
  const patterns = [
    /tooltipKey/,
    /FIELD_TOOLTIPS/,
    /tooltipProps/,
    /FxsFieldLabel/,
    /formatFieldTooltipTitle/,
    /<Tooltip/,
  ];
  for (const p of patterns) if (p.test(s)) score += 8;
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

function resolveFile(filePath) {
  let t = fs.readFileSync(filePath, "utf8");
  if (!t.includes("<<<<<<< HEAD")) return false;
  let out = "";
  let i = 0;
  while (true) {
    const start = t.indexOf("<<<<<<< HEAD", i);
    if (start < 0) {
      out += t.slice(i);
      break;
    }
    out += t.slice(i, start);
    const mid = t.indexOf("=======", start);
    const end = t.indexOf(">>>>>>> develop", mid);
    if (mid < 0 || end < 0) {
      console.error("broken conflict in", filePath);
      return false;
    }
    const head = t.slice(start + "<<<<<<< HEAD".length + 1, mid);
    const develop = t.slice(mid + "=======".length + 1, end);
    out += resolveBlock(head, develop);
    i = end + ">>>>>>> develop".length;
    if (t[i] === "\n") i++;
    else if (t[i] === "\r" && t[i + 1] === "\n") i += 2;
  }
  fs.writeFileSync(filePath, out, "utf8");
  return true;
}

const files = [];
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(jsx|js|css)$/.test(ent.name)) {
      if (fs.readFileSync(p, "utf8").includes("<<<<<<< HEAD")) files.push(p);
    }
  }
}
walk("D:/Clixxo_PBX_GUI/src");
for (const f of files) {
  resolveFile(f);
  console.log("fixed", f.replace("D:\\Clixxo_PBX_GUI\\", ""));
}
