/**
 * Generate factored PCM pages: pre-component → FormFields, logic → hook, JSX → Page.
 * node scripts/generate-pcm-factored.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(".");
const PCM = path.join(ROOT, "src/modules/E1-PRI/PCM");
const HEAD = path.join(ROOT, "scripts/_head_pcm");

const PAGES = [
  {
    file: "PcmTrunkPage.jsx",
    prefix: "PcmTrunk",
    constants: "PcmTrunkConstants",
    breadcrumbConsts: [
      "PCM_TRUNK_PAGE_BREADCRUMB_ROOT",
      "PCM_TRUNK_PAGE_BREADCRUMB_SECTION",
      "PCM_TRUNK_PAGE_TITLE",
    ],
    dialogWidth: 600,
    apis: [],
  },
  {
    file: "PcmPstnPage.jsx",
    prefix: "PcmPstn",
    constants: "PcmPstnConstants",
    breadcrumbConsts: [
      "PCM_PSTN_PAGE_BREADCRUMB_ROOT",
      "PCM_PSTN_PAGE_BREADCRUMB_SECTION",
      "PCM_PSTN_PAGE_TITLE",
    ],
    dialogWidth: 720,
    apis: ["listPstn", "createPstn", "deletePstn"],
  },
  {
    file: "PcmNumReceivingRulePage.jsx",
    prefix: "PcmNumReceivingRule",
    constants: "PcmNumReceivingRuleConstants",
    breadcrumbConsts: [
      "PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_ROOT",
      "PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_SECTION",
      "PCM_NUM_RECEIVING_RULE_PAGE_TITLE",
    ],
    dialogWidth: 600,
    apis: ["listNumRecv", "createNumRecv", "deleteNumRecv"],
  },
  {
    file: "PcmCircuitMaintenancePage.jsx",
    prefix: "PcmCircuitMaintenance",
    constants: "PcmCircuitMaintenanceConstants",
    breadcrumbConsts: [
      "PCM_CIRCUIT_MAINTENANCE_PAGE_BREADCRUMB_ROOT",
      "PCM_CIRCUIT_MAINTENANCE_PAGE_BREADCRUMB_SECTION",
      "PCM_CIRCUIT_MAINTENANCE_PAGE_TITLE",
    ],
    dialogWidth: 600,
    apis: ["listPstn", "listChannelState"],
  },
  {
    file: "PcmTrunkGroupPage.jsx",
    prefix: "PcmTrunkGroup",
    constants: "PcmTrunkGroupConstants",
    breadcrumbConsts: [
      "PCM_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT",
      "PCM_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION",
      "PCM_TRUNK_GROUP_PAGE_TITLE",
    ],
    dialogWidth: 720,
    apis: [
      "listPstn",
      "listPstnGroups",
      "savePstnGroup",
      "deletePstnGroup",
      "listIpPstnRoutes",
      "listNumberManipulations",
    ],
  },
];

function write(rel, content) {
  const full = path.join(PCM, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.replace(/\r\n/g, "\n"), "utf8");
  console.log("wrote", rel, `(${content.length} chars)`);
}

function extractBalanced(src, openBraceIdx) {
  let depth = 0;
  for (let i = openBraceIdx; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0)
        return { body: src.slice(openBraceIdx + 1, i), end: i };
    }
  }
  return null;
}

function splitComponent(src, componentName) {
  const compRe = new RegExp(
    `const ${componentName}\\s*=\\s*\\(\\)\\s*=>\\s*\\{`,
  );
  const compMatch = src.match(compRe);
  if (!compMatch) throw new Error("no component " + componentName);
  const bodyStart = compMatch.index + compMatch[0].length;

  let depth = 1;
  let returnIdx = -1;
  for (let i = bodyStart; i < src.length; i++) {
    const c = src[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) break;
    } else if (
      c === "r" &&
      depth === 1 &&
      src.slice(i, i + 7) === "return " &&
      /[\s;{}]/.test(src[i - 1] || " ")
    ) {
      returnIdx = i;
      break;
    }
  }
  if (returnIdx < 0) throw new Error("no return for " + componentName);

  const logicBody = src.slice(bodyStart, returnIdx).trim();
  let j = returnIdx + "return".length;
  while (/\s/.test(src[j])) j++;
  let pDepth = 0;
  let jsxEnd = -1;
  for (let i = j; i < src.length; i++) {
    if (src[i] === "(") pDepth++;
    else if (src[i] === ")") {
      pDepth--;
      if (pDepth === 0) {
        jsxEnd = i + 1;
        if (src[jsxEnd] === ";") jsxEnd++;
        break;
      }
    }
  }
  return {
    logicBody,
    jsxReturn: src.slice(returnIdx, jsxEnd).trim(),
    preComponent: src.slice(0, compMatch.index),
  };
}

function collectReturns(logicBody) {
  const returned = new Set();
  const stateRe = /const\s*\[\s*([A-Za-z_][\w]*)\s*,\s*([A-Za-z_][\w]*)\s*\]/g;
  let m;
  while ((m = stateRe.exec(logicBody))) {
    returned.add(m[1]);
    returned.add(m[2]);
  }
  for (const line of logicBody.split("\n")) {
    const trimmed = line.trim();
    const cm = trimmed.match(
      /^(?:const|let|function)\s+([A-Za-z_][\w]*)\s*[=(]/,
    );
    if (cm) returned.add(cm[1]);
  }
  const noise = new Set([
    "newTs",
    "newVal",
    "realIdx",
    "newTrunks",
    "updated",
    "i",
    "idx",
    "item",
    "res",
    "response",
    "error",
    "e",
    "prev",
    "sel",
    "data",
    "timeoutId",
    "timeoutPromise",
    "deletePromises",
    "results",
    "successCount",
    "failCount",
    "selectedItems",
    "apiData",
    "spanPayload",
    "validationErrors",
    "errorMessage",
    "friendlyMessage",
    "nextSpanId",
    "intervalMs",
    "current",
    "savePromises",
  ]);
  return [...returned].filter((id) => {
    if (noise.has(id)) return false;
    const re = new RegExp(
      `(?:const|let|function)\\s+${id}\\b|\\[\\s*${id}\\s*,`,
    );
    return re.test(logicBody);
  });
}

function stripLocalChrome(pre) {
  // Remove local Btn / TH / C object defs — replaced by shared chrome aliases
  let out = pre;
  // Remove `const C = { ... };`
  out = out.replace(
    /const C = \{[\s\S]*?\n\};\n*/m,
    "/* C from e1PriChrome via shared */\n",
  );
  // Remove local Btn component
  out = out.replace(
    /const Btn = \(\{[\s\S]*?\n\};\n*/m,
    "/* Btn from e1PriChrome via shared */\n",
  );
  // Remove local TH
  out = out.replace(
    /const TH = \(\{[\s\S]*?\n\};\n*/m,
    "/* TH from e1PriChrome via shared */\n",
  );
  // Remove local tdStyle if present as const tdStyle = {
  out = out.replace(
    /const tdStyle = \{[\s\S]*?\n\};\n*/m,
    "/* tdStyle from e1PriChrome via shared */\n",
  );
  // Strip import lines (reattach selectively)
  out = out.replace(/^import[\s\S]*?;\s*$/gm, "");
  return out.trim() + "\n";
}

function extractValidateFns(src) {
  const validations = [];
  const validateRe =
    /const\s+(validate\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>\s*\{/g;
  let m;
  while ((m = validateRe.exec(src))) {
    const bal = extractBalanced(src, m.index + m[0].length - 1);
    if (!bal) continue;
    validations.push({ name: m[1], args: m[2], body: bal.body });
  }
  return validations;
}

function getImportBlocks(src) {
  return src.match(/^import[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm) || [];
}

for (const p of PAGES) {
  const src = fs.readFileSync(path.join(HEAD, p.file), "utf8");
  const componentName = p.file.replace(".jsx", "");
  const hookName = `use${p.prefix}Page`;
  const camel = p.prefix.charAt(0).toLowerCase() + p.prefix.slice(1);
  const SCREAMING = p.prefix.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();

  const { logicBody, jsxReturn, preComponent } = splitComponent(
    src,
    componentName,
  );

  // ── Validators ──
  const validations = extractValidateFns(src);
  if (validations.length === 0) {
    write(
      `utils/${p.prefix}Validators.js`,
      `export const validate${p.prefix}Form = () => null;\n`,
    );
  } else {
    write(
      `utils/${p.prefix}Validators.js`,
      validations
        .map((v) => `export const ${v.name} = (${v.args}) => {${v.body}};\n`)
        .join("\n"),
    );
  }

  // ── Transformers (stub + any obvious pure helpers from pre) ──
  write(
    `utils/${p.prefix}Transformers.js`,
    `export const format${p.prefix}DisplayValue = (value) =>\n` +
      `  value === undefined || value === null || value === "" ? "--" : String(value);\n`,
  );

  // ── TableHelpers ──
  write(
    `components/${p.prefix}TableHelpers.js`,
    `export {
  getPcmSharedRowBg as get${p.prefix}RowBg,
  getPcmSharedEditIconStyle as get${p.prefix}EditIconStyle,
  handlePcmSharedEditIconHover as handle${p.prefix}EditIconHover,
  pcmSharedEditIconStyle as ${camel}EditIconStyle,
  pcmSharedFixedAlertSx as ${camel}FixedAlertSx,
  pcmSharedPageWrapStyle as ${camel}PageWrapStyle,
  pcmSharedPageInnerStyle as ${camel}PageInnerStyle,
  pcmSharedSelectedBadgeStyle as ${camel}SelectedBadgeStyle,
  pcmSharedModalCancelBtnStyle as ${camel}ModalCancelBtnStyle,
  pcmSharedTableScrollStyle as ${camel}TableScrollStyle,
  pcmSharedToolbarBtnStyle as ${camel}ToolbarBtnStyle,
  pcmSharedCancelBtnStyle as ${camel}CancelBtnStyle,
  pcmSharedC as ${camel}C,
  PCM_SHARED_CARD_RADIUS as ${SCREAMING}_CARD_RADIUS,
} from "./PcmSharedTableHelpers";

export { ${SCREAMING}_CARD_RADIUS as CARD_RADIUS };
`,
  );

  // ── FormFields: shared chrome + preserved page-local chrome from pre ──
  const cleanedPre = stripLocalChrome(preComponent);
  const formImports = new Set([
    'import React from "react";',
    'import { Tooltip } from "@mui/material";',
  ]);
  // Keep mui/icon imports that pre/JSX helpers need
  for (const block of getImportBlocks(src)) {
    if (block.includes("apiService")) continue;
    if (block.includes("constants/")) {
      formImports.add(block.replace(/\.\.\/\.\.\/\.\.\//, "../../../../"));
      continue;
    }
    if (
      block.includes("@mui") ||
      block.includes("@mui/icons") ||
      block.includes("createPortal")
    ) {
      formImports.add(block);
    }
  }

  const formFieldsContent = `${[...formImports].join("\n")}
import {
  PcmSharedBtn,
  PcmSharedTH,
  pcmSharedTdStyle,
  pcmSharedC,
  pcmSharedCardStyle,
  pcmSharedToolbarStyle,
  pcmSharedCheckboxSx,
  pcmSharedAddNewModalFooterStyle,
  pcmSharedAddNewModalFooterBtnStyle,
  pcmSharedAddNewModalFooterCancelBtnStyle,
  pcmSharedFormPanelStyle,
  pcmSharedInputStyle,
  pcmSharedSelectStyle,
  pcmSharedInputInteraction,
  createPcmSharedDialogConfig,
  createPcmSharedBreadcrumb,
  PCM_SHARED_COMPACT_MQ,
} from "./PcmSharedFormFields";

export const Btn = PcmSharedBtn;
export const TH = PcmSharedTH;
export const tdStyle = pcmSharedTdStyle;
export const C = pcmSharedC;
export const ${camel}CardStyle = pcmSharedCardStyle;
export const ${camel}ToolbarStyle = pcmSharedToolbarStyle;
export const ${camel}CheckboxSx = pcmSharedCheckboxSx;
export const ${camel}AddNewModalFooterStyle = pcmSharedAddNewModalFooterStyle;
export const ${camel}AddNewModalFooterBtnStyle = pcmSharedAddNewModalFooterBtnStyle;
export const ${camel}AddNewModalFooterCancelBtnStyle = pcmSharedAddNewModalFooterCancelBtnStyle;
export const ${camel}FormPanelStyle = pcmSharedFormPanelStyle;
export const ${camel}InputStyle = pcmSharedInputStyle;
export const ${camel}SelectStyle = pcmSharedSelectStyle;
export const ${camel}InputInteraction = pcmSharedInputInteraction;
export const ${SCREAMING}_COMPACT_MQ = PCM_SHARED_COMPACT_MQ;

export const ${p.prefix}Breadcrumb = createPcmSharedBreadcrumb(
  ${p.breadcrumbConsts[0]},
  ${p.breadcrumbConsts[1]},
  ${p.breadcrumbConsts[2]},
);

export const ${camel}DialogConfig = createPcmSharedDialogConfig(${p.dialogWidth});

/* ── Preserved page-local styles / helpers from monolith ── */
${cleanedPre}

/* Aliases so JSX keeps working after chrome migration */
export const addNewModalFooterStyle = typeof addNewModalFooterStyle !== "undefined"
  ? addNewModalFooterStyle
  : pcmSharedAddNewModalFooterStyle;
`;

  // Fix the broken alias at the end - don't self-reference
  // Instead export common aliases explicitly after cleanedPre
  const formFieldsFixed = `${[...formImports].join("\n")}
import {
  PcmSharedBtn,
  PcmSharedTH,
  pcmSharedTdStyle,
  pcmSharedC,
  pcmSharedCardStyle,
  pcmSharedToolbarStyle,
  pcmSharedCheckboxSx,
  pcmSharedAddNewModalFooterStyle,
  pcmSharedAddNewModalFooterBtnStyle,
  pcmSharedAddNewModalFooterCancelBtnStyle,
  pcmSharedFormPanelStyle,
  pcmSharedInputStyle,
  pcmSharedSelectStyle,
  pcmSharedInputInteraction,
  createPcmSharedDialogConfig,
  createPcmSharedBreadcrumb,
  PCM_SHARED_COMPACT_MQ,
  ExtensionCodecDualList,
} from "./PcmSharedFormFields";

export const Btn = PcmSharedBtn;
export const TH = PcmSharedTH;
export const C = pcmSharedC;
export { pcmSharedTdStyle as tdStyle };
export { pcmSharedCheckboxSx as checkboxSx };
export { PCM_SHARED_COMPACT_MQ as ${SCREAMING}_COMPACT_MQ };
export { ExtensionCodecDualList };

export const ${p.prefix}Breadcrumb = createPcmSharedBreadcrumb(
  ${p.breadcrumbConsts[0]},
  ${p.breadcrumbConsts[1]},
  ${p.breadcrumbConsts[2]},
);

export const ${camel}DialogConfig = createPcmSharedDialogConfig(${p.dialogWidth});

/* Preserved page-local styles / helpers (Btn/TH/C/tdStyle stripped) */
${cleanedPre}
`;

  write(`components/${p.prefix}FormFields.jsx`, formFieldsFixed);

  // ── Hook ──
  let hookLogic = logicBody;
  for (const v of validations) {
    const re = new RegExp(
      `const\\s+${v.name}\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*\\{[\\s\\S]*?\\n  \\};\\n?`,
    );
    hookLogic = hookLogic.replace(re, "");
  }

  const usesRef = /useRef\(/.test(hookLogic);
  const usesEffect = /useEffect\(/.test(hookLogic);
  const usesMedia = /useMediaQuery\(/.test(hookLogic);
  const hookHasJsx =
    /return\s*\(/.test(hookLogic) || /<[A-Za-z]/.test(hookLogic);

  const hookImports = [
    `import { useState${usesEffect ? ", useEffect" : ""}${usesRef ? ", useRef" : ""} } from "react";`,
  ];
  if (usesMedia) {
    hookImports.push(
      `import useMediaQuery from "@mui/material/useMediaQuery";`,
    );
  }

  const constImport = (
    src.match(
      /import\s*\{([^}]+)\}\s*from\s*["']\.\.\/\.\.\/\.\.\/constants\/[^"']+["']/,
    ) || []
  )[1];
  if (constImport) {
    hookImports.push(
      `import {\n  ${constImport.trim()}\n} from "../../../../constants/${p.constants}";`,
    );
  }
  const apiImport = (
    src.match(
      /import\s*\{([^}]+)\}\s*from\s*["']\.\.\/\.\.\/\.\.\/api\/apiService["']/,
    ) || []
  )[1];
  if (apiImport) {
    hookImports.push(
      `import {\n  ${apiImport.trim()}\n} from "../../../../api/apiService";`,
    );
  }
  if (validations.length) {
    hookImports.push(
      `import { ${validations.map((v) => v.name).join(", ")} } from "../utils/${p.prefix}Validators";`,
    );
  }
  if (usesMedia) {
    hookImports.push(
      `import { ${SCREAMING}_COMPACT_MQ } from "../components/${p.prefix}FormFields";`,
    );
  }
  // Hooks with JSX may need chrome for render helpers
  if (hookHasJsx) {
    hookImports.push(
      `import {\n  Btn,\n  TH,\n  C,\n  tdStyle,\n  checkboxSx,\n  ${p.prefix}Breadcrumb,\n} from "../components/${p.prefix}FormFields";`,
    );
    hookImports.push(
      `import {\n  ${camel}PageWrapStyle as pcm${p.prefix.replace(/^Pcm/, "")}PageWrapStyle,\n  ${camel}PageInnerStyle,\n  CARD_RADIUS,\n} from "../components/${p.prefix}TableHelpers";`,
    );
  }

  let returns = collectReturns(hookLogic);
  // drop validate* from returns (imported)
  returns = returns.filter((id) => !id.startsWith("validate"));

  const hookContent = `${hookImports.join("\n")}

export function ${hookName}() {
${hookLogic}

  return {
    ${returns.join(",\n    ")},
  };
}
`;
  write(`hooks/${hookName}${hookHasJsx ? ".jsx" : ".js"}`, hookContent);

  // ── Page ──
  const pageImportBlocks = [];
  pageImportBlocks.push(`import React from "react";`);
  for (const block of getImportBlocks(src)) {
    if (block.includes("apiService")) continue;
    if (block.includes("react'") || block.includes('react"')) continue;
    // constants kept for JSX labels
    pageImportBlocks.push(block);
  }
  pageImportBlocks.push(
    `import { ${hookName} } from "./hooks/${hookName}";`,
  );
  pageImportBlocks.push(`import * as FormFields from "./components/${p.prefix}FormFields";`);
  pageImportBlocks.push(`import {
  Btn,
  TH,
  C,
  tdStyle,
  checkboxSx,
  ${p.prefix}Breadcrumb,
  ${camel}DialogConfig,
} from "./components/${p.prefix}FormFields";`);
  pageImportBlocks.push(`import {
  CARD_RADIUS,
  ${camel}PageWrapStyle,
  ${camel}PageInnerStyle,
  ${camel}SelectedBadgeStyle,
  ${camel}FixedAlertSx,
  ${camel}EditIconStyle,
  handle${p.prefix}EditIconHover,
  get${p.prefix}RowBg,
} from "./components/${p.prefix}TableHelpers";`);

  // Destructure common FormFields locals used by JSX (re-export everything as named via star)
  // Also bind legacy names from FormFields module
  const pageContent = `${pageImportBlocks.join("\n")}

const {
  addNewModalFooterStyle = FormFields.${camel}AddNewModalFooterStyle,
  addNewModalFooterBtnStyle = FormFields.${camel}AddNewModalFooterBtnStyle,
  pcmTrunkModalFormPanelStyle = FormFields.${camel}FormPanelStyle,
  pcmTrunkSelectStyle = FormFields.${camel}SelectStyle,
  pcmTrunkInputInteraction = FormFields.${camel}InputInteraction,
  pcmTrunkModalCancelBtnStyle = FormFields.pcmTrunkModalCancelBtnStyle,
} = FormFields;

const ${componentName} = () => {
  const vm = ${hookName}();
  const {
    ${returns.join(",\n    ")},
  } = vm;

  ${jsxReturn}
};

export default ${componentName};
`;

  write(p.file, pageContent);
  console.log(
    `=== ${p.prefix} APIs: ${p.apis.length ? p.apis.join(", ") : "(local-only)"} ===`,
  );
}

console.log("Done.");
