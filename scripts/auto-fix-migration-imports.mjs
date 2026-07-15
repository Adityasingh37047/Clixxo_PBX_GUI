/**
 * Auto-fix missing imports from chrome migration in FXS/E1-PRI.
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const CONSTANTS_DIR = path.join(ROOT, "src/constants");

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(jsx|js)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function relImport(fromFile, target) {
  let rel = path.relative(path.dirname(fromFile), target).replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel.replace(/\.jsx?$/, "");
}

function buildConstantIndex() {
  const map = new Map();
  for (const file of walk(CONSTANTS_DIR)) {
    const src = fs.readFileSync(file, "utf8");
    for (const m of src.matchAll(/export const (\w+)/g)) {
      map.set(m[1], file);
    }
  }
  return map;
}

const constantIndex = buildConstantIndex();

const MUI_COMPONENTS = [
  "Alert",
  "Checkbox",
  "Tooltip",
  "TextField",
  "Select",
  "MenuItem",
  "FormControl",
  "Dialog",
  "DialogTitle",
  "DialogContent",
  "DialogActions",
  "CircularProgress",
  "useMediaQuery",
];

function getDefinedSymbols(src) {
  const defined = new Set([
    "React",
    "console",
    "window",
    "document",
    "undefined",
    "null",
    "true",
    "false",
  ]);
  for (const m of src.matchAll(/\b(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/g)) {
    defined.add(m[1]);
  }
  for (const m of src.matchAll(/\bexport\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)) {
    defined.add(m[1]);
  }
  for (const block of src.matchAll(/import\s*\{([\s\S]*?)\}\s*from/g)) {
    for (const part of block[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
      defined.add(asM ? asM[2].trim() : t);
    }
  }
  for (const m of src.matchAll(/import\s+([A-Za-z_$][\w$]*)\s*,/g)) {
    defined.add(m[1]);
  }
  for (const m of src.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from/g)) {
    if (!m[0].includes("{")) defined.add(m[1]);
  }
  for (const m of src.matchAll(/\bexport\s+const\s+([A-Za-z_$][\w$]*)/g)) {
    defined.add(m[1]);
  }
  return defined;
}

function ensureCommonImport(src, filePath, addSpecs) {
  if (!addSpecs.length) return src;
  const commonPath = relImport(filePath, path.join(ROOT, "src/components/common"));
  const re = new RegExp(
    `import\\s*\\{([\\s\\S]*?)\\}\\s*from\\s*['"]${commonPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"];?`,
  );
  const m = src.match(re);
  const existing = new Set();
  if (m) {
    for (const part of m[1].split(",")) {
      const t = part.trim();
      if (t) existing.add(t);
    }
    const merged = [...existing, ...addSpecs.filter((s) => !existing.has(s))];
    if (merged.length === existing.size) return src;
    return src.replace(
      m[0],
      `import { ${merged.join(", ")} } from "${commonPath}";`,
    );
  }
  const insert = `import { ${addSpecs.join(", ")} } from "${commonPath}";\n`;
  const react = src.match(/^import React[^\n]*\n/);
  if (react) return src.replace(react[0], react[0] + insert);
  return insert + src;
}

function ensureMuiImport(src, components) {
  if (!components.length) return src;
  const re = /import\s*\{([^}]*)\}\s*from\s*['"]@mui\/material['"];?/;
  const m = src.match(re);
  if (m) {
    const existing = m[1].split(",").map((s) => s.trim()).filter(Boolean);
    const set = new Set(existing);
    let changed = false;
    for (const c of components) {
      if (!set.has(c)) {
        existing.push(c);
        changed = true;
      }
    }
    if (!changed) return src;
    return src.replace(m[0], `import { ${existing.join(", ")} } from "@mui/material";`);
  }
  const insert = `import { ${components.join(", ")} } from "@mui/material";\n`;
  const react = src.match(/^import React[^\n]*\n/);
  if (react) return src.replace(react[0], react[0] + insert);
  return insert + src;
}

function ensureTokenImport(src, filePath, tokens) {
  if (!tokens.length) return src;
  const tokenPath = relImport(filePath, path.join(ROOT, "src/theme/pbxTokens"));
  const re = new RegExp(
    `import\\s*\\{([\\s\\S]*?)\\}\\s*from\\s*['"]${tokenPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"];?`,
  );
  const m = src.match(re);
  if (m) {
    const existing = m[1].split(",").map((s) => s.trim()).filter(Boolean);
    const set = new Set(existing);
    let changed = false;
    for (const t of tokens) {
      if (!set.has(t)) {
        existing.push(t);
        changed = true;
      }
    }
    if (!changed) return src;
    return src.replace(m[0], `import { ${existing.join(", ")} } from "${tokenPath}";`);
  }
  const insert = `import { ${tokens.join(", ")} } from "${tokenPath}";\n`;
  const react = src.match(/^import React[^\n]*\n/);
  if (react) return src.replace(react[0], react[0] + insert);
  return insert + src;
}

function ensureConstantsImport(src, filePath, names) {
  if (!names.length) return src;
  const byFile = new Map();
  for (const name of names) {
    const cf = constantIndex.get(name);
    if (!cf) continue;
    if (!byFile.has(cf)) byFile.set(cf, []);
    byFile.get(cf).push(name);
  }
  let out = src;
  for (const [cf, namesForFile] of byFile) {
    const constPath = relImport(filePath, cf);
    const re = new RegExp(
      `import\\s*\\{([\\s\\S]*?)\\}\\s*from\\s*['"]${constPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"];?`,
    );
    const m = out.match(re);
    if (m) {
      const existing = m[1].split(",").map((s) => s.trim()).filter(Boolean);
      const set = new Set(existing);
      for (const n of namesForFile) set.add(n);
      out = out.replace(
        m[0],
        `import { ${[...set].join(", ")} } from "${constPath}";`,
      );
    } else {
      const insert = `import { ${namesForFile.join(", ")} } from "${constPath}";\n`;
      const react = out.match(/^import React[^\n]*\n/);
      out = react
        ? out.replace(react[0], react[0] + insert)
        : insert + out;
    }
  }
  return out;
}

let fixed = 0;
for (const mod of ["src/modules/FXS", "src/modules/E1-PRI"]) {
  for (const file of walk(path.join(ROOT, mod))) {
    let src = fs.readFileSync(file, "utf8");
    const orig = src;
    const defined = getDefinedSymbols(src);

    // fxsAddNewModalFooterBtnStyle alias fix
    if (
      src.includes("fxsAddNewModalFooterBtnStyle") &&
      !defined.has("fxsAddNewModalFooterBtnStyle")
    ) {
      src = ensureCommonImport(src, file, [
        "addNewModalFooterBtnStyle as fxsAddNewModalFooterBtnStyle",
      ]);
      defined.add("fxsAddNewModalFooterBtnStyle");
    }

    // fxsPaginationStyle alias fix
    if (src.includes("fxsPaginationStyle") && !defined.has("fxsPaginationStyle")) {
      src = ensureCommonImport(src, file, [
        "extensionPaginationStyle as fxsPaginationStyle",
      ]);
      defined.add("fxsPaginationStyle");
    }

    // FXS_CARD_RADIUS alias fix
    if (src.includes("FXS_CARD_RADIUS") && !defined.has("FXS_CARD_RADIUS")) {
      src = ensureCommonImport(src, file, [
        "EXTENSION_TABLE_CARD_RADIUS as FXS_CARD_RADIUS",
      ]);
      defined.add("FXS_CARD_RADIUS");
    }

    // MUI components
    const muiNeeded = MUI_COMPONENTS.filter(
      (c) => new RegExp(`<${c}[\\s/>]`).test(src) && !defined.has(c),
    );
    src = ensureMuiImport(src, muiNeeded);
    muiNeeded.forEach((c) => defined.add(c));

    // FOCUS_RING_SHADOW
    if (src.includes("FOCUS_RING_SHADOW") && !defined.has("FOCUS_RING_SHADOW")) {
      src = ensureTokenImport(src, file, ["FOCUS_RING_SHADOW"]);
    }

    // Constants from src/constants
    const constUsed = [
      ...new Set(
        [...src.matchAll(/\b([A-Z][A-Z0-9_]{3,})\b/g)]
          .map((m) => m[1])
          .filter((n) => constantIndex.has(n) && !defined.has(n)),
      ),
    ];
    src = ensureConstantsImport(src, file, constUsed);

    if (src !== orig) {
      fs.writeFileSync(file, src);
      fixed++;
      console.log("fixed:", path.relative(ROOT, file));
    }
  }
}
console.log(`\nDone. ${fixed} files updated.`);
