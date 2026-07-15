import fs from "fs";
import path from "path";

const ROOT = process.cwd();

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/FormFields\.jsx$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function defined(src) {
  const d = new Set(["React"]);
  for (const m of src.matchAll(/import\s*\{([\s\S]*?)\}\s*from/g)) {
    for (const part of m[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const asM = t.match(/\bas\s+(\w+)$/);
      d.add(asM ? asM[1] : t.split(/\s+/).pop());
    }
  }
  for (const m of src.matchAll(/import\s+(\w+)\s+from/g)) {
    if (!m[0].includes("{")) d.add(m[1]);
  }
  for (const m of src.matchAll(/\bexport\s+const\s+(\w+)/g)) d.add(m[1]);
  for (const m of src.matchAll(/\b(?:const|let|function)\s+(\w+)/g)) d.add(m[1]);
  return d;
}

const checks = [
  "Btn",
  "TH",
  "Tooltip",
  "Checkbox",
  "Alert",
  "TextField",
  "Select",
  "MenuItem",
  "C",
  "FOCUS_RING_SHADOW",
  "tdStyle",
  "fxsAddNewModalFooterBtnStyle",
  "fxsAddNewModalFooterStyle",
  "fxsAddNewModalFooterCancelBtnStyle",
];

const bad = [];
for (const mod of ["src/modules/FXS", "src/modules/E1-PRI"]) {
  for (const file of walk(path.join(ROOT, mod))) {
    const src = fs.readFileSync(file, "utf8");
    const d = defined(src);
    for (const sym of checks) {
      const used =
        src.includes(`<${sym}`) ||
        src.includes(`</${sym}`) ||
        new RegExp(`\\b${sym}\\b`).test(
          src.replace(/export const \w+ =/g, "").replace(/import[\s\S]*?from/g, ""),
        );
      if (used && !d.has(sym)) bad.push([path.relative(ROOT, file), sym]);
    }
  }
}

for (const [f, c] of bad) console.log(`${f}: missing ${c}`);
console.log(`\ntotal ${bad.length} issues`);
