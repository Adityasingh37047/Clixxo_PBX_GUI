/**
 * Verify page imports resolve to actual exports from FormFields/TableHelpers/hooks.
 * Plus: page destructure keys vs last hook return { }.
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(jsx|js)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function exportsOf(file) {
  if (!fs.existsSync(file)) return new Set();
  const src = fs.readFileSync(file, "utf8");
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g))
    names.add(m[1]);
  for (const m of src.matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)/g))
    names.add(m[1]);
  for (const m of src.matchAll(/export\s+\{([^}]+)\}/g)) {
    if (m[0].includes(" from ")) {
      // export { a as b } from 'x' — local name is b for importers of THIS file... actually re-export uses as alias as export name
      for (const part of m[1].split(",")) {
        const t = part.trim();
        if (!t) continue;
        const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
        names.add(asM ? asM[2].trim() : t.trim());
      }
      continue;
    }
    for (const part of m[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
      names.add(asM ? asM[2].trim() : t);
    }
  }
  // export { X as Y } from — covered
  // export { Foo as Bar } mid-file without from — local export of Foo under Bar
  return names;
}

function lastReturnKeys(src) {
  const idx = src.lastIndexOf("\n  return {");
  const idx2 = src.lastIndexOf("\n    return {");
  const startSearch = Math.max(idx, idx2);
  if (startSearch < 0) {
    const ri = src.lastIndexOf("return {");
    if (ri < 0) return [];
    return parseKeys(src, ri);
  }
  return parseKeys(src, startSearch);
}

function parseKeys(src, returnIdx) {
  let i = src.indexOf("{", returnIdx);
  if (i < 0) return [];
  let d = 0;
  const start = i;
  for (; i < src.length; i++) {
    if (src[i] === "{") d++;
    else if (src[i] === "}") {
      d--;
      if (d === 0) {
        const block = src.slice(start, i + 1);
        return [
          ...new Set(
            [...block.matchAll(/^\s{2,10}([A-Za-z_][A-Za-z0-9_]*)\s*[,}]/gm)].map(
              (m) => m[1],
            ),
          ),
        ];
      }
    }
  }
  return [];
}

const issues = [];
const pages = [
  ...walk(path.join(ROOT, "src/modules/FXS")),
  ...walk(path.join(ROOT, "src/modules/E1-PRI")),
  ...walk(path.join(ROOT, "src/modules/CDR")),
].filter((f) => /Page\.jsx$|TrunkGroup\.jsx$|CallCount\.jsx$/.test(f));

for (const page of pages) {
  const src = fs.readFileSync(page, "utf8");
  const rel = path.relative(ROOT, page).replace(/\\/g, "/");
  const dir = path.dirname(page);

  // Resolve relative imports of local modules
  for (const m of src.matchAll(
    /import\s*\{([\s\S]*?)\}\s*from\s*['"](\.[^'"]+)['"]/g,
  )) {
    const spec = m[2];
    let target = path.resolve(dir, spec);
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      if (fs.existsSync(path.join(target, "index.js")))
        target = path.join(target, "index.js");
      else if (fs.existsSync(path.join(target, "index.jsx")))
        target = path.join(target, "index.jsx");
      else {
        issues.push(`${rel}: cannot resolve directory import ${spec}`);
        continue;
      }
    } else if (!fs.existsSync(target)) {
      if (fs.existsSync(target + ".jsx")) target += ".jsx";
      else if (fs.existsSync(target + ".js")) target += ".js";
      else if (fs.existsSync(path.join(target, "index.js")))
        target = path.join(target, "index.js");
      else {
        issues.push(`${rel}: cannot resolve import ${spec}`);
        continue;
      }
    }
    if (fs.statSync(target).isDirectory()) {
      issues.push(`${rel}: import resolves to directory ${spec}`);
      continue;
    }
    const exp = exportsOf(target);
    if (exp.size === 0) continue; // maybe re-exports hard to parse; skip empty cautiously
    for (const part of m[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
      const imported = asM ? asM[1].trim() : t;
      if (imported === "default") continue;
      if (!exp.has(imported)) {
        // Allow if file has `export *` — rare
        if (/export\s+\*/.test(fs.readFileSync(target, "utf8"))) continue;
        issues.push(
          `${rel}: missing export '${imported}' from ${path.relative(ROOT, target).replace(/\\/g, "/")}`,
        );
      }
    }
  }

  // Hook return vs destructure
  const hookCall = src.match(/\b(use[A-Za-z0-9_]+Page)\s*\(/);
  if (hookCall) {
    const hookName = hookCall[1];
    const dest =
      src.match(
        new RegExp(
          `const\\s*\\{([\\s\\S]*?)\\}\\s*=\\s*(?:vm|${hookName}\\s*\\()`,
        ),
      )?.[1] || "";
    const keys = dest
      .split(",")
      .map((s) =>
        s
          .trim()
          .replace(/\/\/.*$/, "")
          .split("=")[0]
          .trim()
          .split(":")[0]
          .trim(),
      )
      .filter((s) => s && /^[A-Za-z_]/.test(s));

    // find hook file
    let hookFile = null;
    for (const hm of src.matchAll(
      /import\s*\{([\s\S]*?)\}\s*from\s*['"](\.[^'"]+)['"]/g,
    )) {
      if (hm[1].includes(hookName)) {
        let t = path.resolve(dir, hm[2]);
        if (!fs.existsSync(t)) {
          if (fs.existsSync(t + ".jsx")) t += ".jsx";
          else if (fs.existsSync(t + ".js")) t += ".js";
        }
        hookFile = t;
        break;
      }
    }
    if (hookFile && fs.existsSync(hookFile)) {
      const hookSrc = fs.readFileSync(hookFile, "utf8");
      const returned = new Set(lastReturnKeys(hookSrc));
      for (const k of keys) {
        if (!returned.has(k)) {
          issues.push(
            `${rel}: destructures '${k}' but ${hookName} return may not expose it`,
          );
        }
      }
    }
  }
}

const text = issues.length
  ? issues.join("\n")
  : "No page import/export or hook wiring issues found.";
fs.writeFileSync(path.join(ROOT, "scripts/audit-page-wiring.txt"), text + "\n");
console.log(text);
console.log(`\n(${issues.length} issues)`);
