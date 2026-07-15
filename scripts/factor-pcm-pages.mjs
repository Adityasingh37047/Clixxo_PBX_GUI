/**
 * Factors remaining PCM monolith pages into Page/hook/utils/components.
 * Run: node scripts/factor-pcm-pages.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(".");
const PCM = path.join(ROOT, "src/modules/E1-PRI/PCM");
const HEAD = path.join(ROOT, "scripts/_head_pcm");

function write(rel, content) {
  const full = path.join(PCM, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.replace(/\r\n/g, "\n"), "utf8");
  console.log("wrote", rel);
}

function readHead(name) {
  return fs.readFileSync(path.join(HEAD, name), "utf8");
}

function extractFn(src, name) {
  const re = new RegExp(
    `(?:const|function)\\s+${name}\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*\\{`,
  );
  const m = src.match(re);
  if (!m) {
    const re2 = new RegExp(`function\\s+${name}\\s*\\([^)]*\\)\\s*\\{`);
    const m2 = src.match(re2);
    if (!m2) return null;
    return extractBalanced(src, m2.index + m2[0].length - 1);
  }
  return extractBalanced(src, m.index + m[0].length - 1);
}

function extractBalanced(src, openBraceIdx) {
  let depth = 0;
  for (let i = openBraceIdx; i < src.length; i++) {
    const c = src[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return src.slice(openBraceIdx + 1, i);
    }
  }
  return null;
}

function extractConstBlock(src, name) {
  const idx = src.indexOf(`const ${name}`);
  if (idx < 0) return null;
  // find end at next top-level const/function/export at column 0-ish, heuristic: matching braces/parens
  let i = idx;
  // skip to = 
  const eq = src.indexOf("=", idx);
  let j = eq + 1;
  while (j < src.length && /\s/.test(src[j])) j++;
  if (src[j] === "(" || src[j] === "{" || src[j] === "[") {
    const open = src[j];
    const close = open === "(" ? ")" : open === "{" ? "}" : "]";
    let depth = 0;
    for (let k = j; k < src.length; k++) {
      if (src[k] === open) depth++;
      else if (src[k] === close) {
        depth--;
        if (depth === 0) {
          // include trailing ;
          let end = k + 1;
          if (src[end] === ";") end++;
          return src.slice(idx, end);
        }
      }
    }
  }
  // arrow function assigned
  const arrow = src.indexOf("=>", eq);
  if (arrow > 0) {
    let k = arrow + 2;
    while (k < src.length && /\s/.test(src[k])) k++;
    if (src[k] === "{") {
      const body = extractBalanced(src, k);
      if (body != null) {
        const end = k + body.length + 2; // {} 
        let end2 = end;
        if (src[end2] === ";") end2++;
        return src.slice(idx, end2);
      }
    }
  }
  // simple until semicolon at depth 0
  let depth = 0;
  for (let k = eq + 1; k < src.length; k++) {
    const c = src[k];
    if (c === "{" || c === "(" || c === "[") depth++;
    else if (c === "}" || c === ")" || c === "]") depth--;
    else if (c === ";" && depth === 0) return src.slice(idx, k + 1);
  }
  return null;
}

// ── Shared thin FormFields / TableHelpers generators ──
function writePageChrome(prefix, breadcrumbRoot, breadcrumbSection, breadcrumbTitle, dialogWidth = 600) {
  write(
    `components/${prefix}FormFields.jsx`,
    `import React from "react";
export {
  PcmSharedBtn as ${prefix}Btn,
  PcmSharedTH as ${prefix}TH,
  PcmSharedFieldLabel as ${prefix}FieldLabel,
  PcmSharedFieldRow as ${prefix}FieldRow,
  pcmSharedFormPanelStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}FormPanelStyle,
  pcmSharedInputStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}InputStyle,
  pcmSharedSelectStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}SelectStyle,
  pcmSharedInputInteraction as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}InputInteraction,
  pcmSharedAddNewModalFooterStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}AddNewModalFooterStyle,
  pcmSharedAddNewModalFooterBtnStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}AddNewModalFooterBtnStyle,
  pcmSharedAddNewModalFooterCancelBtnStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}AddNewModalFooterCancelBtnStyle,
  pcmSharedAddNewModalBackdropSlotProps as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}AddNewModalBackdropSlotProps,
  pcmSharedAddNewModalDialogContentSx as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}AddNewModalDialogContentSx,
  pcmSharedTdStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}TdStyle,
  pcmSharedC as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}C,
  pcmSharedCardStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}CardStyle,
  pcmSharedToolbarStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}ToolbarStyle,
  pcmSharedPaginationStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}PaginationStyle,
  pcmSharedCheckboxSx as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}CheckboxSx,
  pcmSharedToolbarBtnStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}ToolbarBtnStyle,
  pcmSharedCancelBtnStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}CancelBtnStyle,
  pcmSharedPrimaryBtnStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}PrimaryBtnStyle,
  PcmSharedTableListLoading as ${prefix}TableListLoading,
  PcmSharedTableListEmptyState as ${prefix}TableListEmptyState,
  PcmSharedPagination as ${prefix}Pagination,
  PCM_SHARED_COMPACT_MQ as ${prefix.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase()}_COMPACT_MQ,
  createPcmSharedDialogConfig,
  createPcmSharedBreadcrumb,
} from "./PcmSharedFormFields";

import {
  createPcmSharedBreadcrumb as createBreadcrumb,
  createPcmSharedDialogConfig,
} from "./PcmSharedFormFields";

export const ${prefix}Breadcrumb = createBreadcrumb(
  ${breadcrumbRoot},
  ${breadcrumbSection},
  ${breadcrumbTitle},
);

export const ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}DialogConfig =
  createPcmSharedDialogConfig(${dialogWidth});
`,
  );

  write(
    `components/${prefix}TableHelpers.js`,
    `export {
  getPcmSharedRowBg as get${prefix}RowBg,
  getPcmSharedEditIconStyle as get${prefix}EditIconStyle,
  handlePcmSharedEditIconHover as handle${prefix}EditIconHover,
  pcmSharedEditIconStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}EditIconStyle,
  pcmSharedFixedAlertSx as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}FixedAlertSx,
  pcmSharedPageWrapStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}PageWrapStyle,
  pcmSharedPageInnerStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}PageInnerStyle,
  pcmSharedSelectedBadgeStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}SelectedBadgeStyle,
  pcmSharedModalCancelBtnStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}ModalCancelBtnStyle,
  pcmSharedTableScrollStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}TableScrollStyle,
  pcmSharedToolbarBtnStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}ToolbarBtnStyle,
  pcmSharedCancelBtnStyle as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}CancelBtnStyle,
  pcmSharedC as ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}C,
  PCM_SHARED_CARD_RADIUS as ${prefix.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase()}_CARD_RADIUS,
} from "./PcmSharedTableHelpers";
`,
  );
}

console.log("factor-pcm-pages helper loaded (manual writes follow in same run)");
