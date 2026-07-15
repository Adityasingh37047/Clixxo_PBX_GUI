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

function hasCImport(src) {
  return /import\s*\{[^}]*\bC\b[^}]*\}\s*from\s*["'][^"']*pbxTokens["']/.test(src);
}

function usesC(src) {
  return /\bC\.[a-zA-Z_]/.test(src) || /\$\{C\./.test(src);
}

const issues = [];
for (const mod of ["src/modules/FXS", "src/modules/E1-PRI"]) {
  for (const file of walk(mod)) {
    const src = fs.readFileSync(file, "utf8");
    if (usesC(src) && !hasCImport(src)) {
      issues.push(file);
    }
  }
}

for (const file of issues) {
  let src = fs.readFileSync(file, "utf8");
  if (src.startsWith("import ")) {
    const firstLineEnd = src.indexOf("\n") + 1;
    src =
      src.slice(0, firstLineEnd) +
      `import { C } from "${path
        .relative(path.dirname(file), "src/theme/pbxTokens")
        .replace(/\\/g, "/")
        .replace(/^(?!\.)/, "./")}";\n` +
      src.slice(firstLineEnd);
  } else {
    src = `import { C } from "${path
      .relative(path.dirname(file), "src/theme/pbxTokens")
      .replace(/\\/g, "/")
      .replace(/^(?!\.)/, "./")}";\n\n${src}`;
  }
  fs.writeFileSync(file, src);
  console.log("fixed C import:", file);
}

// Fix PortFxsTableHelpers fxsPaginationStyle
const portFxs = "src/modules/FXS/Port/components/PortFxsTableHelpers.js";
let src = fs.readFileSync(portFxs, "utf8");
if (src.includes("fxsPaginationStyle") && !src.includes("extensionPaginationStyle")) {
  src = src.replace(
    'import { tdStyle } from "../../../../components/common";',
    'import { tdStyle, extensionPaginationStyle as fxsPaginationStyle } from "../../../../components/common";',
  );
  fs.writeFileSync(portFxs, src);
  console.log("fixed fxsPaginationStyle:", portFxs);
}

console.log(`Done. ${issues.length} files needed C import.`);
