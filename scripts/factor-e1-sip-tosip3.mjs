#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SIP = path.join(ROOT, "src/modules/E1-PRI/SIP");
const HEAD = path.join(ROOT, "scripts/_head_sip/SipToSipAccountPage.jsx");

function write(rel, content) {
  const full = path.join(SIP, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.replace(/\r\n/g, "\n"), "utf8");
  console.log("wrote", rel, "(" + content.split("\n").length + " lines)");
}

const src = fs.readFileSync(HEAD, "utf8").replace(/\r\n/g, "\n");
const lines = src.split("\n");
const pageStart = lines.findIndex((l) =>
  l.startsWith("const SipToSipAccountPage"),
);
let returnLine = -1;
for (let i = pageStart; i < lines.length; i++) {
  if (lines[i] === "  return (") {
    returnLine = i;
    break;
  }
}
const renderAllowIdx = lines.findIndex(
  (l, i) => i > pageStart && l.includes("const renderAllowCodecsSection"),
);

console.log({ pageStart, returnLine, renderAllowIdx });

const header = `import React from "react";
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
const parseStart = safeBody.indexOf("\nconst parseCodecList = ");
const normalizeMarker =
  'const normalizeAllowCodecs = (value) => parseCodecList(value).join(",");';
const normalizeEnd = safeBody.indexOf(normalizeMarker);
if (parseStart >= 0 && normalizeEnd >= 0) {
  const afterNormalize = safeBody.indexOf("\n", normalizeEnd);
  safeBody = safeBody.slice(0, parseStart) + safeBody.slice(afterNormalize + 1);
}
safeBody = safeBody.replace(/^const /gm, "export const ");

write(
  "components/SipToSipAccountFormFields.jsx",
  header + "\n" + safeBody + "\n",
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

// Extract hook logic: pageStart+1 .. renderAllowIdx-1
const logicLines = lines.slice(pageStart + 1, renderAllowIdx);
// Remove leading/trailing braces context — logicLines starts with state decls inside component
// Build hook file
const hookBody = logicLines
  .join("\n")
  // validation funcs inside hook → use imported validators
  .replace(
    /\/\/ Validation functions[\s\S]*?const validateForm = \(\) => \{[\s\S]*?return errors;\n  \};\n\n/,
    `  const validateForm = () => validateSipToSipAccountForm(form);\n\n`,
  )
  .replace(
    /const transformList = \(list\) => \{[\s\S]*?\};\n\n  const transformUiToApi = \(uiData\) => \(\{[\s\S]*?\}\);\n\n/,
    "",
  )
  .replace(/transformList\(/g, "transformSipToSipAccountList(")
  .replace(/transformUiToApi\(/g, "transformSipToSipAccountUiToApi(")
  .replace(/parseCodecList\(/g, "parseCodecList(")
  .replace(/normalizeAllowCodecs\(/g, "normalizeAllowCodecs(");

write(
  "hooks/useSipToSipAccountPage.js",
  `import { useEffect, useRef, useState, useMemo } from "react";
import {
  SIP_TO_SIP_ACCOUNT_CODEC_OPTIONS,
  SIP_TO_SIP_ACCOUNT_INITIAL_FORM,
  SIP_TO_SIP_ACCOUNT_ERR_DUPLICATE_EXTENSION,
  SIP_TO_SIP_ACCOUNT_ERR_LOAD_FAILED,
  SIP_TO_SIP_ACCOUNT_ERR_SAVE_FAILED,
  SIP_TO_SIP_ACCOUNT_ERR_DELETE_FAILED,
  SIP_TO_SIP_ACCOUNT_ERR_CLEAR_ALL_FAILED,
  SIP_TO_SIP_ACCOUNT_MSG_NO_ACCOUNTS_TO_CLEAR,
  SIP_TO_SIP_ACCOUNT_CONFIRM_DELETE,
  SIP_TO_SIP_ACCOUNT_CONFIRM_CLEAR_ALL,
  SIP_TO_SIP_ACCOUNT_ALERT_DELETE_BLOCKED,
  SIP_TO_SIP_ACCOUNT_ALERT_CLEAR_BLOCKED,
} from "../../../../constants/SipToSipAccountConstants";
import {
  fetchSipAccounts,
  fetchSipIpTrunkAccounts,
  createSipIpTrunkAccount,
  updateSipIpTrunkAccount,
  deleteSipIpTrunkAccount,
  listGroups,
} from "../../../../api/apiService";
import {
  parseCodecList,
  normalizeAllowCodecs,
  transformSipToSipAccountList,
  transformSipToSipAccountUiToApi,
} from "../utils/SipToSipAccountTransformers";
import {
  validateSipToSipAccountForm,
  validateExtension,
  validatePassword,
  validateContext,
  validateAllowCodecs,
  validateContact,
} from "../utils/SipToSipAccountValidators";

export function useSipToSipAccountPage() {
${hookBody}
  return {
    accounts,
    pjsipExtensions,
    selected,
    setSelected,
    showModal,
    modalScrollRef,
    showPassword,
    message,
    setMessage,
    loading,
    form,
    editIndex,
    validationErrors,
    isInitialLoad,
    selectedCodecList,
    allCodecOptions,
    getCodecLabel,
    updateCodecList,
    togglePasswordVisibility,
    handleOpenModal,
    handleCloseModal,
    handleChange,
    handleSave,
    handleDelete,
    handleClearAll,
    page,
    setPage,
    totalPages,
    pagedAccounts,
    itemsPerPage,
  };
}
`,
);

// Build thin page from render helpers + return JSX
const renderAndJsx = lines.slice(renderAllowIdx, exportLineIdx()).join("\n");

function exportLineIdx() {
  return lines.findIndex((l) => l.startsWith("export default SipToSipAccountPage"));
}

console.log("hook/page pieces ready");
