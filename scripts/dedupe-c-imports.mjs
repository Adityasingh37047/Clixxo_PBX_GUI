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

let n = 0;
for (const mod of ["src/modules/FXS", "src/modules/E1-PRI"]) {
  for (const file of walk(mod)) {
    let src = fs.readFileSync(file, "utf8");
    const orig = src;

    // Files that define local C object — drop pbxTokens import
    if (/export const C = \{/.test(src)) {
      src = src.replace(
        /^import \{ C \} from ["'][^"']*pbxTokens["'];\n?/m,
        "",
      );
    }

    // Remove standalone pbxTokens C import when C is also imported elsewhere
    const pbxImports = [...src.matchAll(/^import \{ C \} from ["']([^"']*pbxTokens)["'];\n?/gm)];
    const otherCImports = [...src.matchAll(/\bC\b[^;]*from ["'][^"']*(FormFields|TableHelpers|SharedFormFields|SharedTableHelpers)/g)];
    if (pbxImports.length && otherCImports.length) {
      src = src.replace(/^import \{ C \} from ["'][^"']*pbxTokens["'];\n?/m, "");
    }

    // Remove duplicate pbxTokens C imports (keep first only)
    const allPbxC = src.match(/^import \{ C \} from ["'][^"']*pbxTokens["'];\n?/gm);
    if (allPbxC && allPbxC.length > 1) {
      let first = true;
      src = src.replace(/^import \{ C \} from ["'][^"']*pbxTokens["'];\n?/gm, (m) => {
        if (first) {
          first = false;
          return m;
        }
        return "";
      });
    }

    if (src !== orig) {
      fs.writeFileSync(file, src);
      n++;
      console.log("deduped:", file);
    }
  }
}
console.log(`Done. ${n} files.`);
