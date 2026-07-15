/**
 * Remove fxsChrome.jsx / e1PriChrome.jsx — wire FXS & E1-PRI to components/common
 * using PBX alias pattern (extensionX as pageX).
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const COMMON_SYMBOLS = new Set([
  "Btn",
  "TH",
  "tdStyle",
  "getExtensionRowBg",
  "getExtensionTdStyle",
  "ExtensionEditIcon",
  "ExtensionDeleteIcon",
  "ExtensionPagination",
  "extensionTableCheckboxSx",
  "ExtensionTableListEmptyState",
  "ExtensionTableListLoading",
  "ExtensionModalSectionHeading",
  "EXTENSION_MODAL_SECTION_BG",
  "EXTENSION_MODAL_SECTION_HEADING_COLOR",
  "ExtensionCodecDualList",
  "EXTENSION_TABLE_CARD_RADIUS",
  "addNewModalFooterStyle",
  "addNewModalFooterBtnStyle",
  "addNewModalFooterCancelBtnStyle",
  "extensionCancelBtnStyle",
  "extensionSelectedBadgeStyle",
  "extensionFixedAlertSx",
  "extensionPaginationStyle",
  "extensionPageBadgeStyle",
  "extensionPageWrapStyle",
  "extensionPageInnerStyle",
  "extensionCardStyle",
  "extensionToolbarStyle",
  "extensionPrimaryBtnStyle",
  "ExtensionBreadcrumb",
]);

const TOKEN_SYMBOLS = new Set([
  "C",
  "OUTLINED_BORDER",
  "OUTLINED_FOCUS",
  "OUTLINED_HOVER",
  "FOCUS_RING_SHADOW",
]);

/** chrome export name -> common export name */
const FXS_TO_COMMON = {
  FXS_CARD_RADIUS: "EXTENSION_TABLE_CARD_RADIUS",
  fxsPageWrapStyle: "extensionPageWrapStyle",
  fxsPageInnerStyle: "extensionPageInnerStyle",
  fxsCardStyle: "extensionCardStyle",
  fxsToolbarStyle: "extensionToolbarStyle",
  fxsToolbarBtnStyle: "addNewModalFooterBtnStyle",
  fxsCancelBtnStyle: "extensionCancelBtnStyle",
  fxsPaginationStyle: "extensionPaginationStyle",
  fxsPageBadgeStyle: "extensionPageBadgeStyle",
  fxsFixedAlertSx: "extensionFixedAlertSx",
  fxsAddNewModalFooterStyle: "addNewModalFooterStyle",
  fxsAddNewModalFooterBtnStyle: "addNewModalFooterBtnStyle",
  fxsAddNewModalFooterCancelBtnStyle: "addNewModalFooterCancelBtnStyle",
  FxsBreadcrumb: "ExtensionBreadcrumb",
};

const E1_TO_COMMON = {
  E1_PRI_CARD_RADIUS: "EXTENSION_TABLE_CARD_RADIUS",
  e1PriPageWrapStyle: "extensionPageWrapStyle",
  e1PriPageInnerStyle: "extensionPageInnerStyle",
  e1PriCardStyle: "extensionCardStyle",
  e1PriToolbarStyle: "extensionToolbarStyle",
  e1PriToolbarBtnStyle: "addNewModalFooterBtnStyle",
  e1PriCancelBtnStyle: "extensionCancelBtnStyle",
  e1PriPaginationStyle: "extensionPaginationStyle",
  e1PriPageBadgeStyle: "extensionPageBadgeStyle",
  e1PriFixedAlertSx: "extensionFixedAlertSx",
  e1PriAddNewModalFooterStyle: "addNewModalFooterStyle",
  e1PriAddNewModalFooterBtnStyle: "addNewModalFooterBtnStyle",
  e1PriAddNewModalFooterCancelBtnStyle: "addNewModalFooterCancelBtnStyle",
  E1PriBreadcrumb: "ExtensionBreadcrumb",
};

const FXS_LOCAL = new Set([
  "fxsModalTitleStyle",
  "fxsModalBackdropSlotProps",
  "fxsModalDialogContentSx",
  "fxsDialogSx",
  "createFxsDialogPaperSx",
  "fxsFormInlineFooterStyle",
]);

const E1_LOCAL = new Set([
  "e1PriModalTitleStyle",
  "e1PriModalBackdropSlotProps",
  "e1PriModalDialogContentSx",
  "e1PriDialogSx",
  "createE1PriDialogPaperSx",
  "e1PriFormInlineFooterStyle",
]);

function relImport(fromFile, target) {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, target).replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(jsx|js)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function parseSpecs(specStr) {
  const specs = [];
  for (const part of specStr.split(",")) {
    const t = part.trim();
    if (!t) continue;
    const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
    if (asM) specs.push({ imported: asM[1].trim(), local: asM[2].trim() });
    else specs.push({ imported: t, local: t });
  }
  return specs;
}

function findChromeImports(src, chromeName) {
  const results = [];
  const re = new RegExp(
    `(import\\s*\\{([\\s\\S]*?)\\}\\s*from\\s*['"][^'"]*${chromeName}['"];?|export\\s*\\{([\\s\\S]*?)\\}\\s*from\\s*['"][^'"]*${chromeName}['"];?)`,
    "g",
  );
  let m;
  while ((m = re.exec(src)) !== null) {
    const isExport = m[0].startsWith("export");
    const specStr = m[2] || m[3];
    results.push({
      full: m[0],
      specs: parseSpecs(specStr),
      isExport,
      index: m.index,
    });
  }
  return results;
}

function resolveSymbol(imported, isE1) {
  if (COMMON_SYMBOLS.has(imported)) return { kind: "common", name: imported };
  if (TOKEN_SYMBOLS.has(imported)) return { kind: "tokens", name: imported };
  const map = isE1 ? E1_TO_COMMON : FXS_TO_COMMON;
  if (map[imported]) return { kind: "common", name: map[imported] };
  const localSet = isE1 ? E1_LOCAL : FXS_LOCAL;
  if (localSet.has(imported)) return { kind: "local", name: imported };
  return null;
}

function buildLocalBlock(isE1, neededLocals, tokensPath) {
  if (!neededLocals.size) return "";
  const lines = [];
  const needsC = [...neededLocals].some(
    (n) => n.includes("FormInlineFooter") || n.includes("create"),
  );
  if (needsC) {
    lines.push(`import { C } from "${tokensPath}";`);
  }

  const radius = isE1 ? 4 : 8;
  const defaultWidth = isE1 ? 600 : 500;
  const prefix = isE1 ? "e1Pri" : "fxs";
  const PREFIX = isE1 ? "E1" : "FXS";

  if (neededLocals.has(`${prefix}ModalTitleStyle`)) {
    lines.push(`
export const ${prefix}ModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: ${radius},
  borderTopRightRadius: ${radius},
  flexShrink: 0,
};`);
  }
  if (neededLocals.has(`${prefix}ModalBackdropSlotProps`)) {
    lines.push(`
export const ${prefix}ModalBackdropSlotProps = {
  backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
};`);
  }
  if (neededLocals.has(`${prefix}ModalDialogContentSx`)) {
    lines.push(`
export const ${prefix}ModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};`);
  }
  if (neededLocals.has(`${prefix}DialogSx`)) {
    lines.push(`
export const ${prefix}DialogSx = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};`);
  }
  if (neededLocals.has(`create${isE1 ? "E1Pri" : "Fxs"}DialogPaperSx`)) {
    const fn = isE1 ? "createE1PriDialogPaperSx" : "createFxsDialogPaperSx";
    lines.push(`
const ${PREFIX}_DIALOG_MARGIN = 24;
const ${PREFIX}_DIALOG_LAYOUT_OFFSET = 80;

export const ${fn} = (width = ${defaultWidth}) => ({
  margin: ${PREFIX}_DIALOG_MARGIN,
  maxHeight: \`calc(100vh - \${${PREFIX}_DIALOG_LAYOUT_OFFSET}px - \${${PREFIX}_DIALOG_MARGIN * 2}px)\`,
  display: "flex",
  flexDirection: "column",
  width,
  maxWidth: "95vw",
  p: 0,
  borderRadius: "${radius}px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
});`);
  }
  if (neededLocals.has(`${prefix}FormInlineFooterStyle`)) {
    lines.push(`
export const ${prefix}FormInlineFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 28px",
  borderTop: \`1px solid \${C.divider}\`,
  background: C.cardBg,
  boxSizing: "border-box",
};`);
  }

  return lines.join("\n");
}

function migrateFile(filePath, isE1) {
  const chromeName = isE1 ? "e1PriChrome" : "fxsChrome";
  let src = fs.readFileSync(filePath, "utf8");
  if (!src.includes(chromeName)) return false;

  const imports = findChromeImports(src, chromeName);
  if (!imports.length) return false;

  const commonPath = relImport(filePath, path.join(ROOT, "src/components/common"));
  const tokensPath = relImport(filePath, path.join(ROOT, "src/theme/pbxTokens"));

  const commonMap = new Map(); // commonName -> local alias (or same)
  const tokenMap = new Map();
  const neededLocals = new Set();
  const reExportBlocks = [];
  const commonReExports = new Map();

  for (const block of imports) {
    for (const { imported, local } of block.specs) {
      const resolved = resolveSymbol(imported, isE1);
      if (!resolved) {
        console.warn(`  unknown: ${imported} in ${filePath}`);
        continue;
      }
      if (resolved.kind === "common") {
        commonMap.set(resolved.name, local);
        if (block.isExport) {
          commonReExports.set(local, resolved.name);
        }
      } else if (resolved.kind === "tokens") {
        tokenMap.set(resolved.name, local);
      } else if (resolved.kind === "local") {
        neededLocals.add(imported);
        if (block.isExport) {
          reExportBlocks.push({ imported, local });
        }
      }
    }
  }

  // Remove all chrome import/export blocks
  for (const block of imports) {
    src = src.replace(block.full, "");
  }

  const newLines = [];
  if (tokenMap.size) {
    const items = [...tokenMap.entries()].map(([n, l]) =>
      l === n ? n : `${n} as ${l}`,
    );
    newLines.push(`import { ${items.join(", ")} } from "${tokensPath}";`);
  }

  const localUsed = new Set();
  for (const block of imports) {
    if (block.isExport) continue;
    for (const { imported, local } of block.specs) {
      const resolved = resolveSymbol(imported, isE1);
      if (resolved?.kind === "common") localUsed.add(resolved.name);
    }
  }

  const commonImports = [...commonMap.entries()].filter(
    ([name]) => localUsed.has(name) || !commonReExports.size,
  );
  if (commonImports.length) {
    const items = commonImports.map(([n, l]) => (l === n ? n : `${n} as ${l}`));
    newLines.push(`import { ${items.join(", ")} } from "${commonPath}";`);
  }

  const localBlock = buildLocalBlock(isE1, neededLocals, tokensPath);
  if (localBlock) newLines.push(localBlock);

  if (commonReExports.size) {
    const items = [...commonReExports.entries()].map(
      ([local, commonName]) => `${commonName} as ${local}`,
    );
    newLines.push(`export { ${items.join(", ")} } from "${commonPath}";`);
  }

  for (const { imported, local } of reExportBlocks) {
    newLines.push(
      local !== imported
        ? `export { ${imported} as ${local} };`
        : `export { ${imported} };`,
    );
  }

  // Insert new imports at top (after existing react import if any)
  const insert = newLines.filter(Boolean).join("\n\n");
  const reactMatch = src.match(/^import React[^\n]*\n/m);
  if (reactMatch) {
    src = src.replace(reactMatch[0], reactMatch[0] + "\n" + insert + "\n");
  } else {
    src = insert + "\n\n" + src;
  }

  // Add root prop to ExtensionBreadcrumb usages
  const root = isE1 ? "E1-PRI" : "FXS";
  for (const [, local] of commonMap.entries()) {
    if (local === "ExtensionBreadcrumb") {
      // replace <ExtensionBreadcrumb without root=
      src = src.replace(
        /<ExtensionBreadcrumb(\s)(?!root=)/g,
        `<ExtensionBreadcrumb root="${root}"$1`,
      );
    }
  }
  // Also for aliased breadcrumbs
  for (const [commonName, local] of commonMap.entries()) {
    if (commonName === "ExtensionBreadcrumb" && local !== "ExtensionBreadcrumb") {
      src = src.replace(
        new RegExp(`<${local}(\\s)(?!root=)`, "g"),
        `<${local} root="${root}"$1`,
      );
    }
  }

  // Clean duplicate blank lines
  src = src.replace(/\n{3,}/g, "\n\n");

  fs.writeFileSync(filePath, src);
  return true;
}

function main() {
  let count = 0;
  for (const mod of ["FXS", "E1-PRI"]) {
    const isE1 = mod === "E1-PRI";
    const modPath = path.join(ROOT, "src/modules", mod);
    for (const file of walk(modPath)) {
      if (file.endsWith(`${isE1 ? "e1PriChrome" : "fxsChrome"}.jsx`)) continue;
      if (migrateFile(file, isE1)) {
        console.log("migrated:", path.relative(ROOT, file));
        count++;
      }
    }
  }

  // Delete chrome files
  for (const f of [
    path.join(ROOT, "src/modules/FXS/fxsChrome.jsx"),
    path.join(ROOT, "src/modules/E1-PRI/e1PriChrome.jsx"),
  ]) {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f);
      console.log("deleted:", path.relative(ROOT, f));
    }
  }

  console.log(`\nDone. Migrated ${count} files.`);
}

main();
