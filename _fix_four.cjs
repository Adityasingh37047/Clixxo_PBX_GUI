const fs = require("fs");
const { execSync } = require("child_process");

const files = [
  "src/modules/FXS/Advanced/DialingTimeoutPage.jsx",
  "src/modules/Maitenance/System Tools/Radius.jsx",
  "src/modules/PBX/Extensions/ExtensionGroupsPage.jsx",
  "src/modules/PBX/Extensions/Extensions.jsx",
];

const base = execSync("git merge-base testing develop", {
  cwd: "D:/Clixxo_PBX_GUI",
  encoding: "utf8",
}).trim();

function tooltipScore(s) {
  let score = 0;
  for (const p of [
    /tooltipKey/,
    /FIELD_TOOLTIPS/,
    /tooltipProps/,
    /FxsFieldLabel/,
    /formatFieldTooltipTitle/,
    /<Tooltip/,
    /FilterField/,
  ]) {
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
    if (mid < 0 || end < 0) throw new Error("broken conflict");
    const head = t.slice(nl + 1, mid);
    const developNl = t.indexOf("\n", mid);
    const developEndNl = t.indexOf("\n", end);
    const develop = t.slice(developNl + 1, end);
    out += resolveBlock(head, develop);
    i = developEndNl + 1;
  }
  return out;
}

for (const f of files) {
  const cwd = "D:/Clixxo_PBX_GUI";
  execSync(`git show ${base}:${f} > _base.tmp`, { cwd, shell: true });
  execSync(`git show :2:${f} > _ours.tmp`, { cwd, shell: true });
  execSync(`git show :3:${f} > _theirs.tmp`, { cwd, shell: true });
  let merged;
  try {
    merged = execSync("git merge-file -p _ours.tmp _base.tmp _theirs.tmp", {
      cwd,
      encoding: "utf8",
    });
  } catch (e) {
    merged = e.stdout || fs.readFileSync(`${cwd}/_ours.tmp`, "utf8");
    if (e.stdout) merged = e.stdout;
    else throw e;
  }
  for (let n = 0; n < 5; n++) {
    if (!merged.includes("<<<<<<<")) break;
    merged = resolveConflicts(merged);
  }
  if (merged.includes("<<<<<<<")) {
    console.error("still conflicts", f);
  }
  fs.writeFileSync(`${cwd}/${f}`, merged, "utf8");
  console.log("wrote", f, "markers:", (merged.match(/<<<<<<</g) || []).length);
}
