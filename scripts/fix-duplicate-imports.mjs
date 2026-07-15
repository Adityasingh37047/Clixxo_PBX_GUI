import fs from "fs";
import path from "path";

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(jsx|js)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function dedupeImports(src) {
  const lines = src.split("\n");
  const seenC = new Set();
  const out = [];
  for (const line of lines) {
    const m = line.match(/^import\s*\{\s*C\s*\}\s*from\s*['"]([^'"]+)['"];?\s*$/);
    if (m) {
      const key = `C:${m[1]}`;
      if (seenC.has(key)) continue;
      seenC.add(key);
    }
    out.push(line);
  }
  return out.join("\n");
}

function mergeTokenImports(src) {
  const importRe = /^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]*pbxTokens)['"];?\s*$/gm;
  const matches = [...src.matchAll(importRe)];
  if (matches.length <= 1) return src;

  const names = new Set();
  let tokenPath = matches[0][2];
  for (const m of matches) {
    tokenPath = m[2];
    m[1].split(",").forEach((part) => {
      const t = part.trim();
      if (t) names.add(t);
    });
  }

  let firstIndex = matches[0].index;
  let lastEnd = matches[matches.length - 1].index + matches[matches.length - 1][0].length;
  const merged = `import { ${[...names].join(", ")} } from "${tokenPath}";`;
  return src.slice(0, firstIndex) + merged + src.slice(lastEnd);
}

let count = 0;
for (const mod of ["src/modules/FXS", "src/modules/E1-PRI"]) {
  for (const file of walk(mod)) {
    const orig = fs.readFileSync(file, "utf8");
    let next = dedupeImports(orig);
    next = mergeTokenImports(next);
    next = next.replace(/\n{3,}/g, "\n\n");
    if (next !== orig) {
      fs.writeFileSync(file, next);
      count++;
      console.log("fixed:", file);
    }
  }
}
console.log(`Done. ${count} files fixed.`);
