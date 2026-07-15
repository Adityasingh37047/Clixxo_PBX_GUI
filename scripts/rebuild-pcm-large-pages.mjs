/**
 * Rebuild large PCM pages: shared chrome FormFields + styles-in-Page + logic-in-hook.
 * node scripts/rebuild-pcm-large-pages.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(".");
const PCM = path.join(ROOT, "src/modules/E1-PRI/PCM");
const HEAD = path.join(ROOT, "scripts/_head_pcm");

const PAGES = [
  {
    file: "PcmPstnPage.jsx",
    prefix: "PcmPstn",
    constants: "PcmPstnConstants",
    breadcrumb: [
      "PCM_PSTN_PAGE_BREADCRUMB_ROOT",
      "PCM_PSTN_PAGE_BREADCRUMB_SECTION",
      "PCM_PSTN_PAGE_TITLE",
    ],
    dialogWidth: 720,
  },
  {
    file: "PcmNumReceivingRulePage.jsx",
    prefix: "PcmNumReceivingRule",
    constants: "PcmNumReceivingRuleConstants",
    breadcrumb: [
      "PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_ROOT",
      "PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_SECTION",
      "PCM_NUM_RECEIVING_RULE_PAGE_TITLE",
    ],
    dialogWidth: 600,
  },
  {
    file: "PcmCircuitMaintenancePage.jsx",
    prefix: "PcmCircuitMaintenance",
    constants: "PcmCircuitMaintenanceConstants",
    breadcrumb: [
      "PCM_CIRCUIT_MAINTENANCE_PAGE_BREADCRUMB_ROOT",
      "PCM_CIRCUIT_MAINTENANCE_PAGE_BREADCRUMB_SECTION",
      "PCM_CIRCUIT_MAINTENANCE_PAGE_TITLE",
    ],
    dialogWidth: 600,
  },
  {
    file: "PcmTrunkGroupPage.jsx",
    prefix: "PcmTrunkGroup",
    constants: "PcmTrunkGroupConstants",
    breadcrumb: [
      "PCM_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT",
      "PCM_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION",
      "PCM_TRUNK_GROUP_PAGE_TITLE",
    ],
    dialogWidth: 720,
  },
];

function write(rel, content) {
  fs.writeFileSync(path.join(PCM, rel), content.replace(/\r\n/g, "\n"), "utf8");
  console.log("wrote", rel);
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
  if (returnIdx < 0) throw new Error("no return");

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

function stripLocalBtnThC(pre) {
  let out = pre;
  // Remove import lines — page will re-add needed ones
  out = out.replace(/^import[\s\S]*?;\s*$/gm, "");
  // Remove local C / Btn / TH / tdStyle if block-bodied
  out = out.replace(/const C = \{[\s\S]*?\n\};\n*/m, "");
  // Btn may use block body
  out = out.replace(/const Btn = \([\s\S]*?\n\};\n*/m, "");
  out = out.replace(/const TH = \([\s\S]*?\n\};\n*/m, "");
  out = out.replace(/const tdStyle = \{[\s\S]*?\n\};\n*/m, "");
  return out.trim() + "\n";
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
    "vals",
    "match",
    "el",
  ]);
  return [...returned].filter((id) => {
    if (noise.has(id)) return false;
    if (id.startsWith("validate")) return false;
    const re = new RegExp(
      `(?:const|let|function)\\s+${id}\\b|\\[\\s*${id}\\s*,`,
    );
    return re.test(logicBody);
  });
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
  const pageLocal = stripLocalBtnThC(preComponent);

  // Clean FormFields — shared only
  write(
    `components/${p.prefix}FormFields.jsx`,
    `import React from "react";
import {
  ${p.breadcrumb.join(",\n  ")},
} from "../../../../constants/${p.constants}";
import {
  PcmSharedBtn,
  PcmSharedTH,
  PcmSharedFieldLabel,
  PcmSharedFieldRow,
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
  pcmSharedFixedAlertSx,
  PcmSharedTableListLoading,
  PcmSharedTableListEmptyState,
  PcmSharedPagination,
  createPcmSharedDialogConfig,
  createPcmSharedBreadcrumb,
  PCM_SHARED_COMPACT_MQ,
  ExtensionCodecDualList,
} from "./PcmSharedFormFields";

export const Btn = PcmSharedBtn;
export const TH = PcmSharedTH;
export const C = pcmSharedC;
export const tdStyle = pcmSharedTdStyle;
export const checkboxSx = pcmSharedCheckboxSx;
export const ${SCREAMING}_COMPACT_MQ = PCM_SHARED_COMPACT_MQ;
export { ExtensionCodecDualList };
export { PcmSharedFieldLabel as ${p.prefix}FieldLabel };
export { PcmSharedFieldRow as ${p.prefix}FieldRow };
export {
  pcmSharedFormPanelStyle as ${camel}FormPanelStyle,
  pcmSharedInputStyle as ${camel}InputStyle,
  pcmSharedSelectStyle as ${camel}SelectStyle,
  pcmSharedInputInteraction as ${camel}InputInteraction,
  pcmSharedAddNewModalFooterStyle as ${camel}AddNewModalFooterStyle,
  pcmSharedAddNewModalFooterBtnStyle as ${camel}AddNewModalFooterBtnStyle,
  pcmSharedAddNewModalFooterCancelBtnStyle as ${camel}AddNewModalFooterCancelBtnStyle,
  pcmSharedCardStyle as ${camel}CardStyle,
  pcmSharedToolbarStyle as ${camel}ToolbarStyle,
  pcmSharedFixedAlertSx as ${camel}FixedAlertSx,
  PcmSharedTableListLoading as ${p.prefix}TableListLoading,
  PcmSharedTableListEmptyState as ${p.prefix}TableListEmptyState,
  PcmSharedPagination as ${p.prefix}Pagination,
};

export const ${p.prefix}Breadcrumb = createPcmSharedBreadcrumb(
  ${p.breadcrumb[0]},
  ${p.breadcrumb[1]},
  ${p.breadcrumb[2]},
);

export const ${camel}DialogConfig = createPcmSharedDialogConfig(${p.dialogWidth});
`,
  );

  // Validators — keep Pstn special case already written; others stub or extract
  const validations = extractValidateFns(src);
  if (p.prefix === "PcmPstn") {
    // keep manually fixed validators
  } else if (validations.length === 0) {
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

  // Hook
  let hookLogic = logicBody;
  for (const v of validations) {
    if (p.prefix === "PcmPstn" && v.name === "validateFormData") {
      // keep call but fix signature at call site below
    }
    const re = new RegExp(
      `const\\s+${v.name}\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*\\{[\\s\\S]*?\\n  \\};\\n?`,
    );
    hookLogic = hookLogic.replace(re, "");
  }
  if (p.prefix === "PcmPstn") {
    hookLogic = hookLogic.replace(
      /validateFormData\(formData\)/g,
      "validateFormData(formData, editIndex, allData)",
    );
  }

  const usesRef = /useRef\(/.test(hookLogic);
  const usesEffect = /useEffect\(/.test(hookLogic);
  const usesMedia = /useMediaQuery\(/.test(hookLogic);
  const hookHasJsx =
    /return\s*\(/.test(hookLogic) || /<[A-Za-z]/.test(hookLogic);

  const hookImports = [
    `import { useState${usesEffect ? ", useEffect" : ""}${usesRef ? ", useRef" : ""} } from "react";`,
  ];
  if (usesMedia)
    hookImports.push(
      `import useMediaQuery from "@mui/material/useMediaQuery";`,
    );

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
  if (p.prefix === "PcmPstn") {
    hookImports.push(
      `import { validateFormData } from "../utils/PcmPstnValidators";`,
    );
  } else if (validations.length) {
    hookImports.push(
      `import { ${validations.map((v) => v.name).join(", ")} } from "../utils/${p.prefix}Validators";`,
    );
  }
  if (usesMedia) {
    hookImports.push(
      `import { ${SCREAMING}_COMPACT_MQ } from "../components/${p.prefix}FormFields";`,
    );
  }

  // For hooks with JSX render helpers, import chrome + page-local styles via a side module
  // Keep render helpers working by importing Btn/TH/C/tdStyle; page-local style names
  // referenced inside render helpers must stay available — inject pageLocal styles into hook file.
  if (hookHasJsx) {
    hookImports.push(`import React from "react";`);
    // MUI used in render helpers — pull from original imports
    const muiImports = (src.match(/^import[\s\S]*?from\s+["']@mui[^"']+["'];?\s*$/gm) || []);
    for (const mi of muiImports) hookImports.push(mi);
    const iconImports = (src.match(/^import[\s\S]*?from\s+["']@mui\/icons-material[^"']+["'];?\s*$/gm) || []);
    for (const ii of iconImports) hookImports.push(ii);
    if (src.includes("createPortal")) {
      hookImports.push(`import { createPortal } from "react-dom";`);
    }
    hookImports.push(
      `import {\n  Btn,\n  TH,\n  C,\n  tdStyle,\n  checkboxSx,\n  ${p.prefix}Breadcrumb,\n  ${p.prefix}FieldLabel,\n} from "../components/${p.prefix}FormFields";`,
    );
  }

  let returns = collectReturns(hookLogic);

  const hookBody = hookHasJsx
    ? `${hookImports.join("\n")}

/* Page-local styles/helpers used by render functions */
${pageLocal}

export function ${hookName}() {
${hookLogic}

  return {
    ${returns.join(",\n    ")},
  };
}
`
    : `${hookImports.join("\n")}

export function ${hookName}() {
${hookLogic}

  return {
    ${returns.join(",\n    ")},
  };
}
`;

  write(`hooks/${hookName}${hookHasJsx ? ".jsx" : ".js"}`, hookBody);

  // Page with styles + JSX
  const pageImports = [`import React from "react";`];
  const origImports = src.match(/^import[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm) || [];
  for (const block of origImports) {
    if (block.includes("apiService")) continue;
    if (/from\s+["']react["']/.test(block)) continue;
    pageImports.push(block);
  }
  pageImports.push(`import { ${hookName} } from "./hooks/${hookName}";`);
  pageImports.push(`import {
  Btn,
  TH,
  C,
  tdStyle,
  checkboxSx,
  ${p.prefix}Breadcrumb,
  ${p.prefix}FieldLabel,
  ${camel}DialogConfig,
  ${camel}FormPanelStyle,
  ${camel}InputStyle,
  ${camel}SelectStyle,
  ${camel}InputInteraction,
  ${camel}AddNewModalFooterStyle,
  ${camel}AddNewModalFooterBtnStyle,
  ${camel}CardStyle,
  ${camel}ToolbarStyle,
} from "./components/${p.prefix}FormFields";`);
  pageImports.push(`import {
  CARD_RADIUS,
  ${camel}PageWrapStyle,
  ${camel}PageInnerStyle,
  ${camel}SelectedBadgeStyle,
  ${camel}FixedAlertSx,
  ${camel}EditIconStyle,
  handle${p.prefix}EditIconHover,
  get${p.prefix}RowBg,
} from "./components/${p.prefix}TableHelpers";`);

  const pageContent = hookHasJsx
    ? `${pageImports.join("\n")}

const ${componentName} = () => {
  const vm = ${hookName}();
  const {
    ${returns.join(",\n    ")},
  } = vm;

  ${jsxReturn}
};

export default ${componentName};
`
    : `${pageImports.join("\n")}

/* Page-local styles/helpers preserved from monolith */
${pageLocal}

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
  console.log("done", p.prefix);
}

console.log("Rebuild complete.");
