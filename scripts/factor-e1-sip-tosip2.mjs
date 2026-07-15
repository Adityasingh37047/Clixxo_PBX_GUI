#!/usr/bin/env node
/**
 * Surgical factor of SipToSipAccountPage + SipTrunkGroup from _head_sip.
 * Preserves behavior: pre-component UI → FormFields; styles in TableHelpers;
 * logic → hook; JSX returns stay in Page (with form render helpers).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SIP = path.join(ROOT, "src/modules/E1-PRI/SIP");
const HEAD_DIR = path.join(ROOT, "scripts/_head_sip");

function write(rel, content) {
  const full = path.join(SIP, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.replace(/\r\n/g, "\n"), "utf8");
  console.log("wrote", rel, "(" + content.split("\n").length + " lines)");
}

function readHead(name) {
  return fs.readFileSync(path.join(HEAD_DIR, name), "utf8").replace(/\r\n/g, "\n");
}

// ═══════════════════════════════════════════════════════════
// SipToSipAccount — copy original into FormFields as implementation
// module, then thin Page re-exports through factored pieces.
//// Actually: keep original almost intact as hooks + page split via
// extracting the component body into a hook that returns a render fn.
// ═══════════════════════════════════════════════════════════

/**
 * Pragmatic approach that preserves 100% of dual-list pages:
 * 1. Move entire original file body into `components/XPageView.jsx` exporting
 *    the page component internals... 
 *
 * Better: rewrite original so it becomes thin by:
 * - FormFields.js: all consts before Page (exported)
 * - Hook: state+handlers (no JSX)
 * - Page: JSX that was in return + render* helpers
 */

{
  const src = readHead("SipToSipAccountPage.jsx");
  const lines = src.split("\n");
  const pageStart = lines.findIndex((l) =>
    l.startsWith("const SipToSipAccountPage"),
  );
  // Main return at indent 2
  let returnLine = -1;
  for (let i = pageStart; i < lines.length; i++) {
    if (lines[i] === "  return (") {
      returnLine = i;
      break;
    }
  }
  const exportLine = lines.findIndex((l) =>
    l.startsWith("export default SipToSipAccountPage"),
  );

  const renderAllowIdx = lines.findIndex(
    (l, i) => i > pageStart && l.includes("const renderAllowCodecsSection"),
  );
  const logicEnd = renderAllowIdx > 0 ? renderAllowIdx : returnLine;

  const safeFormFieldsHeader = `import React from "react";
import { Tooltip, CircularProgress, useMediaQuery } from "@mui/material";
import {
  SIP_TO_SIP_ACCOUNT_FIELD_TOOLTIPS,
  SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_ROOT,
  SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_SECTION,
  SIP_TO_SIP_ACCOUNT_PAGE_TITLE,
  SIP_TO_SIP_ACCOUNT_BTN_PREV,
  SIP_TO_SIP_ACCOUNT_BTN_NEXT,
  SIP_TO_SIP_ACCOUNT_LABEL_ALLOW_CODECS,
  SIP_TO_SIP_ACCOUNT_EMPTY_MESSAGE,
  SIP_TO_SIP_ACCOUNT_BTN_ADD_NEW,
} from "../../../../constants/SipToSipAccountConstants";
import { ExtensionCodecDualList as SipToSipCodecDualList } from "../../e1PriChrome";

export { SipToSipCodecDualList };
`;

  let safeBody = lines.slice(90, pageStart).join("\n");
  // Remove parseCodecList / normalizeAllowCodecs (now in transformers)
  const parseStart = safeBody.indexOf("\nconst parseCodecList = ");
  const normalizeEnd = safeBody.indexOf(
    'const normalizeAllowCodecs = (value) => parseCodecList(value).join(",");',
  );
  if (parseStart >= 0 && normalizeEnd >= 0) {
    const afterNormalize = safeBody.indexOf("\n", normalizeEnd);
    safeBody =
      safeBody.slice(0, parseStart) + safeBody.slice(afterNormalize + 1);
  }
  // Export top-level const
  safeBody = safeBody.replace(/^const /gm, "export const ");

  write(
    "components/SipToSipAccountFormFields.jsx",
    safeFormFieldsHeader + "\n" + safeBody + "\n",
  );

  write(
    "components/SipToSipAccountTableHelpers.js",
    `export {
  C,
  sipToSipPageWrapStyle,
  sipToSipInnerStyle,
  sipToSipFixedAlertSx,
  sipToSipTableStyle,
  sipToSipEditIconStyle,
  getSipToSipRowBg,
  getSipToSipTdStyle,
  sipToSipCardStyle,
  sipToSipToolbarStyle,
  sipToSipPaginationStyle,
  sipToSipSelectedBadgeStyle,
  sipToSipCancelBtnStyle,
  sipToSipPrimaryBtnStyle,
  sipToSipPageBadgeStyle,
  sipToSipTableCheckboxSx,
  sipToSipModalTextFieldSx,
  sipToSipModalSelectSx,
  sipToSipModalTitleStyle,
  sipToSipDialogPaperSx,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  sipToSipModalCancelBtnStyle,
  sipToSipModalFormPanelStyle,
  tdStyle,
  SIP_TO_SIP_ACCOUNT_COMPACT_MQ,
} from "./SipToSipAccountFormFields";
`,
  );

  console.log("FormFields extracted; logicEnd", logicEnd + 1, "return", returnLine + 1);
}
