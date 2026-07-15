/**
 * Fix FXS toolbar buttons to match SipRegisterPage:
 * - cancel actions use extensionCancelBtnStyle (no minWidth:100)
 * - primary actions use extensionPrimaryBtnStyle
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(jsx|js)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function patchTableHelpers(file, src) {
  let out = src;
  const m = src.match(
    /addNewModalFooterBtnStyle as (\w+ToolbarBtnStyle)/,
  );
  if (!m) return src;
  const oldName = m[1];
  const prefix = oldName.replace(/ToolbarBtnStyle$/, "");
  const cancelName = `${prefix}ToolbarCancelBtnStyle`;
  const primaryName = `${prefix}ToolbarPrimaryBtnStyle`;

  if (src.includes(cancelName)) return src;

  if (src.includes("export {")) {
    out = out.replace(
      `addNewModalFooterBtnStyle as ${oldName}`,
      `extensionCancelBtnStyle as ${cancelName},\n  extensionPrimaryBtnStyle as ${primaryName},\n  addNewModalFooterBtnStyle as ${oldName}`,
    );
  } else if (src.includes("import {")) {
    out = out.replace(
      /import \{([^}]+)\} from "([^"]+components\/common)";/,
      (block, specs, commonPath) => {
        if (specs.includes(cancelName)) return block;
        return `import { ${specs.trim()}, extensionCancelBtnStyle as ${cancelName}, extensionPrimaryBtnStyle as ${primaryName} } from "${commonPath}";`;
      },
    );
    out += `\nexport const ${oldName} = ${cancelName};\n`;
  }

  if (!out.includes(`export const ${oldName}`) && !out.includes(`as ${oldName}`)) {
    out += `\nexport { ${cancelName} as ${oldName} };\n`;
  }

  return out;
}

function patchPageToolbarStyles(src) {
  let out = src;
  const pairs = [
    ...src.matchAll(/(\w+ToolbarBtnStyle)/g),
  ].map((m) => m[1]);
  const unique = [...new Set(pairs)];
  for (const oldName of unique) {
    const prefix = oldName.replace(/ToolbarBtnStyle$/, "");
    const cancelName = `${prefix}ToolbarCancelBtnStyle`;
    const primaryName = `${prefix}ToolbarPrimaryBtnStyle`;
    if (!src.includes(cancelName) && !src.includes(`${prefix}ToolbarCancelBtnStyle`)) continue;

    // variant="primary" -> primary style
    out = out.replace(
      new RegExp(
        `(variant="primary"[^>]*\\n[^>]*style=\\{)${oldName}(\\})`,
        "g",
      ),
      `$1${primaryName}$2`,
    );
    out = out.replace(
      new RegExp(
        `(style=\\{)${oldName}(\\}[^>]*\\n[^>]*variant="primary")`,
        "g",
      ),
      `$1${primaryName}$2`,
    );
    // remaining cancel variant buttons
    out = out.replace(
      new RegExp(`variant="cancel"[^>]*style=\\{${oldName}\\}`, "g"),
      (s) => s.replace(oldName, cancelName),
    );
    out = out.replace(
      new RegExp(`style=\\{${oldName}\\}[^>]*variant="cancel"`, "g"),
      (s) => s.replace(oldName, cancelName),
    );
  }

  // fxsToolbarBtnStyle in Port pages
  if (src.includes("fxsToolbarBtnStyle") && src.includes("fxsToolbarCancelBtnStyle")) {
    out = out.replace(
      /variant="primary"([^>]*?)style=\{fxsToolbarBtnStyle\}/gs,
      'variant="primary"$1style={fxsToolbarPrimaryBtnStyle}',
    );
    out = out.replace(
      /variant="cancel"([^>]*?)style=\{fxsToolbarBtnStyle\}/gs,
      'variant="cancel"$1style={fxsToolbarCancelBtnStyle}',
    );
    out = out.replace(
      /style=\{fxsToolbarBtnStyle\}([^>]*?)variant="primary"/gs,
      'style={fxsToolbarPrimaryBtnStyle}$1variant="primary"',
    );
    out = out.replace(
      /style=\{fxsToolbarBtnStyle\}([^>]*?)variant="cancel"/gs,
      'style={fxsToolbarCancelBtnStyle}$1variant="cancel"',
    );
  }

  return out;
}

function addFxsToolbarStylesToFormFields(src) {
  if (!src.includes("fxsToolbarBtnStyle") || src.includes("fxsToolbarCancelBtnStyle")) {
    return src;
  }
  return src.replace(
    /import \{([^}]+)\} from "([^"]+components\/common)";/,
    (block, specs, p) => {
      if (specs.includes("extensionCancelBtnStyle")) return block;
      return `import { ${specs.trim()}, extensionCancelBtnStyle as fxsToolbarCancelBtnStyle, extensionPrimaryBtnStyle as fxsToolbarPrimaryBtnStyle } from "${p}";`;
    },
  );
}

function fixUseMediaQuery(src) {
  if (!src.includes("useMediaQuery(") || /import[^;]*useMediaQuery/.test(src)) {
    return src;
  }
  const mui = src.match(/import \{([^}]+)\} from "@mui\/material";/);
  if (mui) {
    const parts = mui[1].split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.includes("useMediaQuery")) parts.push("useMediaQuery");
    return src.replace(
      mui[0],
      `import { ${parts.join(", ")} } from "@mui/material";`,
    );
  }
  return `import { useMediaQuery } from "@mui/material";\n${src}`;
}

let count = 0;
for (const mod of ["src/modules/FXS"]) {
  for (const file of walk(path.join(ROOT, mod))) {
    let src = fs.readFileSync(file, "utf8");
    const orig = src;

    if (file.includes("VoIP") && file.includes("FormFields")) {
      src = fixUseMediaQuery(src);
    }

    if (file.endsWith("TableHelpers.js")) {
      src = patchTableHelpers(file, src);
    }

    if (file.includes("FormFields.jsx") && file.includes("Port")) {
      src = addFxsToolbarStylesToFormFields(src);
    }

    if (file.endsWith("Page.jsx") || file.endsWith("page.jsx")) {
      src = patchPageToolbarStyles(src);
    }

    // Num manipulate pages
    if (/Fxs(IP|PSTN)/.test(file)) {
      src = patchPageToolbarStyles(src);
    }

    if (src !== orig) {
      fs.writeFileSync(file, src);
      count++;
      console.log("fixed:", path.relative(ROOT, file));
    }
  }
}
console.log(`Done. ${count} files updated.`);
