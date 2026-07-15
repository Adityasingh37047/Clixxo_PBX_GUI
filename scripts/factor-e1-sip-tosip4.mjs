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
const formFieldLabelIdx = lines.findIndex(
  (l, i) => i > pageStart && l.includes("const formFieldLabel"),
);
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

console.log({ pageStart, formFieldLabelIdx, returnLine, exportLine });

// ── FormFields ──
const header = `import React from "react";
import { Tooltip, CircularProgress } from "@mui/material";
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
write("components/SipToSipAccountFormFields.jsx", header + "\n" + safeBody + "\n");

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

// ── Hook: lines pageStart+1 .. formFieldLabelIdx-1, drop isCompact ──
let logic = lines.slice(pageStart + 1, formFieldLabelIdx).join("\n");
logic = logic.replace(
  /^\s*const isCompact = useMediaQuery\(SIP_TO_SIP_ACCOUNT_COMPACT_MQ\);\n/m,
  "",
);
logic = logic.replace(
  /\/\/ Validation functions[\s\S]*?const validateForm = \(\) => \{[\s\S]*?return errors;\n  \};\n\n/,
  "  const validateForm = () => validateSipToSipAccountForm(form);\n\n",
);
logic = logic.replace(
  /  const transformList = \(list\) => \{[\s\S]*?\};\n\n  const transformUiToApi = \(uiData\) => \(\{[\s\S]*?\}\);\n\n/,
  "",
);
logic = logic.replace(/transformList\(/g, "transformSipToSipAccountList(");
logic = logic.replace(/transformUiToApi\(/g, "transformSipToSipAccountUiToApi(");

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
${logic}
  return {
    accounts,
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

// ── Page: formFieldLabel .. before closing `};` of original component ──
let pageEnd = exportLine;
while (pageEnd > formFieldLabelIdx && lines[pageEnd - 1].trim() === "") pageEnd--;
if (lines[pageEnd - 1].trim() === "};") pageEnd -= 1;
const pageJsxInner = lines.slice(formFieldLabelIdx, pageEnd).join("\n");

const pageContent = `import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
  CircularProgress,
  Checkbox,
  InputAdornment,
  IconButton,
  FormControl,
  Select as MuiSelect,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  SIP_TO_SIP_ACCOUNT_FIELDS,
  SIP_TO_SIP_ACCOUNT_TABLE_COLUMNS,
  SIP_TO_SIP_ACCOUNT_FORM_LAYOUT,
  SIP_TO_SIP_ACCOUNT_BTN_INVERSE,
  SIP_TO_SIP_ACCOUNT_BTN_DELETE,
  SIP_TO_SIP_ACCOUNT_BTN_CLEAR_ALL,
  SIP_TO_SIP_ACCOUNT_BTN_ADD_NEW,
  SIP_TO_SIP_ACCOUNT_BTN_SAVE,
  SIP_TO_SIP_ACCOUNT_BTN_SAVING,
  SIP_TO_SIP_ACCOUNT_BTN_CLOSE,
  SIP_TO_SIP_ACCOUNT_MODAL_ADD_TITLE,
  SIP_TO_SIP_ACCOUNT_MODAL_EDIT_TITLE,
  SIP_TO_SIP_ACCOUNT_SECTION_GENERAL,
  SIP_TO_SIP_ACCOUNT_COL_MODIFY,
  SIP_TO_SIP_ACCOUNT_EMPTY_MESSAGE,
  SIP_TO_SIP_ACCOUNT_RECORD_LABEL,
  SIP_TO_SIP_ACCOUNT_SELECTED_SUFFIX,
  SIP_TO_SIP_ACCOUNT_EDIT_TITLE_ACCESS,
  SIP_TO_SIP_ACCOUNT_CODEC_EMPTY_AVAILABLE,
  SIP_TO_SIP_ACCOUNT_CODEC_EMPTY_SELECTED,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_PASSWORD,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTEXT,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTACT,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_EXTENSION,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_DOMAIN,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTACT_USER,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_OUTBOUND_PROXY,
  SIP_TO_SIP_ACCOUNT_CONTACT_PREFIX,
} from "../../../constants/SipToSipAccountConstants";
import { useSipToSipAccountPage } from "./hooks/useSipToSipAccountPage";
import {
  Btn,
  TH,
  SipToSipBreadcrumb,
  TableListLoading,
  TableListEmptyState,
  SipToSipPagination,
  SipToSipModalSectionHeading,
  SipToSipAllowCodecsSectionHeading,
  SipToSipSectionCard,
  SipToSipErrMsg,
  SipToSipFieldRow,
  SipToSipCodecDualList,
  SIP_TO_SIP_ACCOUNT_COMPACT_MQ,
} from "./components/SipToSipAccountFormFields";
import {
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
  C,
} from "./components/SipToSipAccountTableHelpers";

const SipToSipAccountPage = () => {
  const isCompact = useMediaQuery(SIP_TO_SIP_ACCOUNT_COMPACT_MQ);
  const vm = useSipToSipAccountPage();
  const {
    accounts,
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
  } = vm;

${pageJsxInner}
};

export default SipToSipAccountPage;
`;

write("SipToSipAccountPage.jsx", pageContent);
console.log("SipToSipAccount factor complete");
