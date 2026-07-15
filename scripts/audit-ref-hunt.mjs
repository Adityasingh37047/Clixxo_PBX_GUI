/**
 * Runtime ReferenceError hunter for factored modules.
 * Conservative: only flags identifiers very likely to crash at render.
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const ROOTS = ["src/modules/FXS", "src/modules/E1-PRI", "src/modules/CDR"];

const KW = new Set(
  `break case catch class const continue debugger default delete do else
  export extends finally for function if import in instanceof let new return
  super switch this throw try typeof var void while with yield enum await
  implements interface package private protected public static null true false
  undefined NaN Infinity Math Date JSON Object Array String Number Boolean
  RegExp Error Map Map Set WeakMap WeakSet Promise Symbol BigInt Reflect Proxy
  console window document navigator location history localStorage sessionStorage
  fetch parseInt parseFloat isNaN isFinite encodeURI encodeURIComponent
  decodeURI decodeURIComponent setTimeout clearTimeout setInterval clearInterval
  requestAnimationFrame cancelAnimationFrame atob btoa structuredClone
  React Fragment StrictMode Suspense`.split(/\s+/),
);

const HOOKS = [
  "useState",
  "useEffect",
  "useCallback",
  "useMemo",
  "useRef",
  "useLayoutEffect",
  "useImperativeHandle",
  "useReducer",
  "useContext",
  "useId",
  "useMediaQuery",
];

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(jsx|js)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function strip(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/`(?:\\.|[^`\\])*`/g, "``");
}

function definedNames(src) {
  const d = new Set(KW);
  // import React, { a as b, c } from 'x'
  for (const m of src.matchAll(
    /import\s+(?:([A-Za-z_$][\w$]*)\s*,\s*)?\{([\s\S]*?)\}\s*from\s*['"][^'"]+['"]/g,
  )) {
    if (m[1]) d.add(m[1]);
    for (const part of m[2].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
      if (asM) {
        d.add(asM[1].trim());
        d.add(asM[2].trim());
      } else d.add(t);
    }
  }
  for (const m of src.matchAll(
    /import\s+([A-Za-z_$][\w$]*)\s+from\s*['"][^'"]+['"]/g,
  ))
    d.add(m[1]);
  for (const m of src.matchAll(
    /import\s*\*\s+as\s+([A-Za-z_$][\w$]*)\s+from/g,
  ))
    d.add(m[1]);
  for (const m of src.matchAll(
    /\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g,
  ))
    d.add(m[1]);
  for (const m of src.matchAll(
    /\bexport\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
  ))
    d.add(m[1]);
  for (const m of src.matchAll(/\bexport\s+const\s+([A-Za-z_$][\w$]*)/g))
    d.add(m[1]);
  // destructuring bindings
  for (const m of src.matchAll(
    /(?:const|let|var)\s*\{([\s\S]*?)\}\s*=/g,
  )) {
    for (const part of m[1].split(",")) {
      const t = part.trim().replace(/\s*=.*/, "").trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s*:\s*(.+)$/);
      d.add(asM ? asM[2].trim().split(/\s|=/)[0] : t.split(/\s|=/)[0]);
    }
  }
  for (const m of src.matchAll(
    /(?:const|let|var)\s*\[([^\]]+)\]\s*=/g,
  )) {
    for (const part of m[1].split(",")) {
      const t = part.trim();
      if (t && /^[A-Za-z_$]/.test(t)) d.add(t);
    }
  }
  // function params (shallow)
  for (const m of src.matchAll(
    /(?:function\s+[A-Za-z_$][\w$]*|(?:const|let)\s+[A-Za-z_$][\w$]*\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>)\s*(?:\(([^)]*)\)|)/g,
  )) {
    /* skip rough */
  }
  return d;
}

const issues = [];

for (const root of ROOTS) {
  for (const file of walk(path.join(ROOT, root))) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    const src = fs.readFileSync(file, "utf8");
    const clean = strip(src);
    const defined = definedNames(src);

    // Hook imports
    for (const h of HOOKS) {
      const all = [...clean.matchAll(new RegExp(`\\b${h}\\s*\\(`, "g"))].length;
      const pref = [
        ...clean.matchAll(new RegExp(`\\bReact\\.${h}\\s*\\(`, "g")),
      ].length;
      if (all - pref <= 0) continue;
      if (defined.has(h)) continue;
      issues.push({ rel, kind: "hook", detail: h });
    }

    // JSX components <Foo or </Foo>
    for (const m of clean.matchAll(/<\/?([A-Z][A-Za-z0-9_]*)\b/g)) {
      const name = m[1];
      if (defined.has(name)) continue;
      // intrinsic-ish
      if (/^(Fragment)$/.test(name)) continue;
      issues.push({ rel, kind: "jsx", detail: name });
    }

    // Style / sx constants commonly left behind after factor
    if (/Page\.jsx$|FormFields\.jsx$|TrunkGroup\.jsx$|CallCount\.jsx$/.test(rel)) {
      for (const m of clean.matchAll(
        /\b([a-z][A-Za-z0-9]*(?:Style|Sx|Class)|[A-Z][A-Z0-9_]{4,}|addNewModalFooter(?:Btn|CancelBtn)?Style)\b/g,
      )) {
        const name = m[1];
        if (defined.has(name)) continue;
        if (/^(TABLE|TEXT|HTML|JSON|HTTP|POST|GET|PUT|TRUE|FALSE|NULL)$/.test(name))
          continue;
        // MUST be used as value not only type
        if (!new RegExp(`\\b${name}\\b`).test(clean)) continue;
        // High signal: *Style / *Sx / SCREAMING with page prefix
        if (
          /Style$|Sx$|Class$|ScrollbarStyles$/.test(name) ||
          /^(PCM_|FXS_|SIP_|ROUTE_|PORT_|E1_|HA_|CDR_)/.test(name)
        ) {
          issues.push({ rel, kind: "style", detail: name });
        }
      }
    }
  }
}

const uniq = [];
const seen = new Set();
for (const i of issues) {
  const k = `${i.rel}|${i.kind}|${i.detail}`;
  if (seen.has(k)) continue;
  seen.add(k);
  uniq.push(i);
}

const by = {};
for (const i of uniq) (by[i.kind] ||= []).push(i);

let out = "=== REF ERROR HUNT ===\n\n";
for (const k of Object.keys(by).sort()) {
  out += `--- ${k} (${by[k].length}) ---\n`;
  for (const i of by[k]) out += `  ${i.rel}: ${i.detail}\n`;
  out += "\n";
}
out += `Total: ${uniq.length}\n`;
fs.writeFileSync(path.join(ROOT, "scripts/audit-ref-hunt.txt"), out);
console.log(out);
