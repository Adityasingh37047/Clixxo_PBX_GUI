/**
 * Scan FXS/E1-PRI for symbols used but not imported/defined in file.
 * Reports likely runtime ReferenceErrors from chrome migration.
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const GLOBALS = new Set([
  "React",
  "console",
  "window",
  "document",
  "Math",
  "Date",
  "JSON",
  "Promise",
  "Array",
  "Object",
  "String",
  "Number",
  "Boolean",
  "RegExp",
  "Error",
  "Map",
  "Set",
  "undefined",
  "null",
  "true",
  "false",
  "NaN",
  "Infinity",
  "parseInt",
  "parseFloat",
  "isNaN",
  "setTimeout",
  "clearTimeout",
  "setInterval",
  "clearInterval",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "localStorage",
  "sessionStorage",
  "fetch",
  "alert",
  "confirm",
  "prompt",
  "Event",
  "HTMLElement",
  "SVGElement",
]);

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(jsx|js)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function stripCommentsAndStrings(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/`(?:\\.|[^`\\])*`/g, "``");
}

function collectDefined(src) {
  const defined = new Set(GLOBALS);

  for (const m of src.matchAll(/\b(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/g)) {
    defined.add(m[1]);
  }
  for (const m of src.matchAll(/\bexport\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)) {
    defined.add(m[1]);
  }
  for (const m of src.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)/g)) {
    defined.add(m[1]);
  }

  for (const block of src.matchAll(/import\s*\{([\s\S]*?)\}\s*from\s*['"][^'"]+['"];?/g)) {
    for (const part of block[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
      if (asM) defined.add(asM[2].trim());
      else defined.add(t);
    }
  }

  for (const m of src.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from\s*['"][^'"]+['"];?/g)) {
    defined.add(m[1]);
  }

  for (const m of src.matchAll(/import\s*\*\s+as\s+([A-Za-z_$][\w$]*)\s+from/g)) {
    defined.add(m[1]);
  }

  for (const block of src.matchAll(/export\s*\{([\s\S]*?)\}\s*from\s*['"][^'"]+['"];?/g)) {
    for (const part of block[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
      if (asM) defined.add(asM[2].trim());
      else defined.add(t);
    }
  }

  for (const m of src.matchAll(/export\s*\{([^}]+)\}/g)) {
    if (m[0].includes(" from ")) continue;
    for (const part of m[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
      if (asM) defined.add(asM[1].trim());
      else defined.add(t);
    }
  }

  for (const m of src.matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)/g)) {
    defined.add(m[1]);
  }

  // default import React component names in JSX are usually PascalCase from import default
  for (const m of src.matchAll(/import\s+(\w+)\s*,\s*\{/g)) {
    defined.add(m[1]);
  }

  return defined;
}

function collectUsed(clean) {
  const used = new Set();
  for (const m of clean.matchAll(/\b([A-Z][A-Z0-9_]*)\b/g)) used.add(m[1]);
  for (const m of clean.matchAll(/\b([a-z_$][\w$]*)\b/g)) used.add(m[1]);
  return used;
}

const issues = [];
for (const mod of ["src/modules/FXS", "src/modules/E1-PRI"]) {
  for (const file of walk(path.join(ROOT, mod))) {
    const src = fs.readFileSync(file, "utf8");
    const clean = stripCommentsAndStrings(src);
    const defined = collectDefined(src);
    const used = collectUsed(clean);

    const missing = [];
    for (const sym of used) {
      if (defined.has(sym)) continue;
      // Only flag if actually referenced in original (not just common words)
      if (/^(div|span|form|table|tbody|tr|td|th|col|option|label|input|select|style|key|type|value|name|id|className|onClick|onChange|onSubmit|children|props|state|setState|useState|useEffect|useMemo|useCallback|useRef|return|if|else|for|while|switch|case|break|continue|new|this|super|typeof|instanceof|void|delete|export|import|from|default|async|await|try|catch|finally|throw|yield|enum|extends|implements|interface|package|private|protected|public|static|get|set|module|require)$/.test(sym)) continue;
      if (!src.includes(sym)) continue;
      // Must appear as identifier use, not only in strings (already stripped)
      const useRe = new RegExp(`\\b${sym.replace(/\$/g, "\\$")}\\b`);
      if (!useRe.test(clean)) continue;
      missing.push(sym);
    }

    if (missing.length) {
      // filter noise: only uppercase constants or fxs/e1 prefixed or known patterns
      const suspicious = missing.filter(
        (s) =>
          /^[A-Z_]+$/.test(s) ||
          /^(fxs|e1Pri|Btn|TH|Tooltip|Alert|Checkbox|Dialog|C)$/.test(s) ||
          s.includes("Modal") ||
          s.includes("Footer") ||
          s.includes("Style") ||
          s.includes("Breadcrumb") ||
          s.startsWith("PORT_FXS") ||
          s.startsWith("create"),
      );
      if (suspicious.length) {
        issues.push({ file: path.relative(ROOT, file), missing: suspicious.sort() });
      }
    }
  }
}

for (const i of issues) {
  console.log(i.file);
  for (const m of i.missing) console.log("  -", m);
}
console.log(`\n${issues.length} files with suspicious missing symbols`);
