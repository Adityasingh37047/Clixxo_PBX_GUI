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

function dedupeImportLine(line) {
  const m = line.match(/^import\s*\{([^}]+)\}\s*from\s*(.+);$/);
  if (!m) return line;
  const seen = new Set();
  const parts = [];
  for (const raw of m[1].split(",")) {
    const t = raw.trim();
    if (!t) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    parts.push(t);
  }
  return `import { ${parts.join(", ")} } from ${m[2]};`;
}

let n = 0;
for (const mod of ["src/modules/FXS", "src/modules/E1-PRI"]) {
  for (const file of walk(mod)) {
    let src = fs.readFileSync(file, "utf8");
    const orig = src;
    src = src.replace(/\b(\w+) as undefined\b/g, "$1");
    src = src
      .split("\n")
      .map((line) =>
        line.startsWith("import {") && line.includes("components/common")
          ? dedupeImportLine(line)
          : line,
      )
      .join("\n");
    if (src !== orig) {
      fs.writeFileSync(file, src);
      n++;
      console.log("fixed:", file);
    }
  }
}
console.log(`Done. ${n} files.`);
