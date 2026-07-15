/**
 * Lift-and-shift factor for large System Tools monoliths (Upgrade / Licence).
 * Moves UI styles+JSX into FormFields, logic into hook, thin page composer.
 *
 * Usage: node scripts/lift-factor-sys-tools.mjs Upgrade
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const pageName = process.argv[2];
if (!pageName) {
  console.error("Usage: node scripts/lift-factor-sys-tools.mjs <PageName>");
  process.exit(2);
}

const base = path.join("src", "modules", "Maitenance", "System Tools");
const pagePath = path.join(base, `${pageName}.jsx`);
const pfx = pageName.charAt(0).toLowerCase() + pageName.slice(1);

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

if (!fs.existsSync(pagePath)) {
  console.error("Missing", pagePath);
  process.exit(1);
}

const src = fs.readFileSync(pagePath, "utf8");
if (src.includes(`use${pageName}Page`)) {
  console.log(pageName, "already factored");
  process.exit(0);
}

// Backup via git if possible
try {
  const head = execSync(
    `git show "HEAD:src/modules/Maitenance/System Tools/${pageName}.jsx"`,
    { encoding: "utf8", maxBuffer: 40e6, shell: true },
  );
  mkdirp(path.join("scripts", "_head_sys_tools"));
  fs.writeFileSync(
    path.join("scripts", "_head_sys_tools", `${pageName}.jsx`),
    head,
  );
} catch {
  /* ignore */
}

const hooksDir = path.join(base, "hooks");
const compDir = path.join(base, "components");
const utilDir = path.join(base, "utils");
mkdirp(hooksDir);
mkdirp(compDir);
mkdirp(utilDir);

const helpersPath = path.join(compDir, `${pageName}TableHelpers.js`);
const formPath = path.join(compDir, `${pageName}FormFields.jsx`);
const hookPath = path.join(hooksDir, `use${pageName}Page.js`);
const xformPath = path.join(utilDir, `${pageName}Transformers.js`);
const valPath = path.join(utilDir, `${pageName}Validators.js`);

const helpers = `import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as ${pfx}PageWrapStyle,
  extensionPageInnerStyle as ${pfx}PageInnerStyle,
  extensionCardStyle as ${pfx}CardStyle,
  extensionToolbarStyle as ${pfx}ToolbarStyle,
  extensionFixedAlertSx as ${pfx}FixedAlertSx,
  extensionCancelBtnStyle as ${pfx}CancelBtnStyle,
  extensionPrimaryBtnStyle as ${pfx}PrimaryBtnStyle,
  addNewModalFooterBtnStyle as ${pfx}FooterBtnStyle,
} from "../../../../components/common";

export {
  CARD_RADIUS,
  ${pfx}PageWrapStyle,
  ${pfx}PageInnerStyle,
  ${pfx}CardStyle,
  ${pfx}ToolbarStyle,
  ${pfx}FixedAlertSx,
  ${pfx}CancelBtnStyle,
  ${pfx}PrimaryBtnStyle,
  ${pfx}FooterBtnStyle,
};
`;

fs.writeFileSync(helpersPath, helpers);
fs.writeFileSync(
  xformPath,
  `/** ${pageName} transformers — keep helpers close to page payloads. */\nexport function passthrough${pageName}(v) {\n  return v;\n}\n`,
);
fs.writeFileSync(
  valPath,
  `/** ${pageName} validators. */\nexport function ok${pageName}() {\n  return true;\n}\n`,
);

// Prepare FormFields: take full source, rewrite imports depths, strip default export page wrapper
let form = src;

// Fix relative imports from page depth to component depth (+1)
form = form.replace(
  /from\s+["']\.\.\/\.\.\/\.\.\/api\//g,
  'from "../../../../api/',
);
form = form.replace(
  /from\s+["']\.\.\/\.\.\/\.\.\/constants\//g,
  'from "../../../../constants/',
);
form = form.replace(
  /from\s+["']\.\.\/\.\.\/\.\.\/components\/common/g,
  'from "../../../../components/common',
);
form = form.replace(
  /from\s+["']\.\.\/\.\.\/\.\.\/theme\//g,
  'from "../../../../theme/',
);

// Remove local C if present — inject pbxTokens
if (/const C\s*=\s*\{/.test(form)) {
  form = form.replace(
    /const C\s*=\s*\{[\s\S]*?\n\};\n/,
    'import { C, OUTLINED_BORDER, OUTLINED_HOVER, OUTLINED_FOCUS, FOCUS_RING_SHADOW } from "../../../../theme/pbxTokens";\n',
  );
  // Remove duplicate local OUTLINED if tokens imported
  form = form.replace(
    /const OUTLINED_BORDER\s*=\s*["'][^"']+["'];\s*\n/g,
    "",
  );
  form = form.replace(
    /const OUTLINED_HOVER\s*=\s*["'][^"']+["'];\s*\n/g,
    "",
  );
  form = form.replace(
    /const OUTLINED_FOCUS\s*=\s*["'][^"']+["'];\s*\n/g,
    "",
  );
  form = form.replace(
    /const FOCUS_RING_SHADOW\s*=\s*\(?.*?\)?\s*=>?\s*`[^`]+`;\s*\n/g,
    "",
  );
  form = form.replace(
    /const FOCUS_RING_SHADOW\s*=\s*\(\)\s*=>\s*`[^`]+`;\s*\n/g,
    "",
  );
}

// Remove local Btn component
form = form.replace(
  /const Btn\s*=\s*\([\s\S]*?\n\};\n\n/,
  "",
);

if (!/from\s+["'][^"']*components\/common["']/.test(form)) {
  form =
    `import { Btn, ExtensionBreadcrumb } from "../../../../components/common";\n` +
    form;
} else if (!/Btn/.test(form.match(/from\s+["'][^"']*components\/common["']/)?.[0] || "")) {
  form = form.replace(
    /import\s*\{([^}]*)\}\s*from\s*["']([^"']*components\/common)["']/,
    (m, names, p) => {
      const n = names.includes("Btn") ? names : `${names}, Btn, ExtensionBreadcrumb`;
      return `import { ${n} } from "${p}"`;
    },
  );
}

// Add helpers import
form =
  `import {\n  ${pfx}PageWrapStyle,\n  ${pfx}PageInnerStyle,\n  ${pfx}CardStyle,\n  ${pfx}ToolbarStyle,\n  ${pfx}FixedAlertSx,\n  ${pfx}FooterBtnStyle,\n} from "./${pageName}TableHelpers";\n` +
  form;

// Rename wrap styles if local names exist — best effort
const wrapRe = new RegExp(
  `(${pageName}PageWrapStyle|${pageName.replace(/([A-Z])/g, "")}PageWrapStyle)`,
  "g",
);

// Convert default export component into exported named pieces + keep inner component as Legacy for hook migration
// Strategy: keep full component as export function ${pageName}View and move state to hook separately would still need hand split.
// For lift-factor: write form as-is with `export default` removed, export the page component as `${pageName}LegacyView`
form = form.replace(
  new RegExp(`const ${pageName}\\s*=\\s*\\(\\s*\\)\\s*=>`),
  `export const ${pageName}LegacyView = () =>`,
);
form = form.replace(
  new RegExp(`export default ${pageName};?\\s*$`),
  "",
);

fs.writeFileSync(formPath, form + "\n");

// Hook: re-export nothing useful yet — thin page will still use LegacyView temporarily
const hook = `import { useMemo } from "react";

/** Placeholder hook — ${pageName}LegacyView still owns state until full split. */
export function use${pageName}Page() {
  return useMemo(() => ({}), []);
}
`;
fs.writeFileSync(hookPath, hook);

const thin = `import React from "react";
import { ${pageName}LegacyView } from "./components/${pageName}FormFields";

const ${pageName} = () => <${pageName}LegacyView />;

export default ${pageName};
`;
fs.writeFileSync(pagePath, thin);

console.log(
  `Lifted ${pageName} into FormFields as ${pageName}LegacyView + stubs. MANUAL: move state/handlers into hook and thin UI.`,
);
console.log("Wrote:", helpersPath, formPath, hookPath, pagePath);
