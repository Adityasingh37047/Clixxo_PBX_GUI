#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SIP = path.join(ROOT, "src/modules/E1-PRI/SIP");
const HEAD = path.join(ROOT, "scripts/_head_sip/SipTrunkGroup.jsx");

function write(rel, content) {
  const full = path.join(SIP, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.replace(/\r\n/g, "\n"), "utf8");
  console.log("wrote", rel, "(" + content.split("\n").length + " lines)");
}

const src = fs.readFileSync(HEAD, "utf8").replace(/\r\n/g, "\n");
const lines = src.split("\n");
const pageStart = lines.findIndex((l) => l.startsWith("const SipTrunkGroup ="));
const getGroupIdIdx = lines.findIndex((l) =>
  l.startsWith("const getGroupIdValue"),
);
let returnLine = -1;
for (let i = pageStart; i < lines.length; i++) {
  if (lines[i] === "  return (") {
    returnLine = i;
    break;
  }
}
const exportLine = lines.findIndex((l) =>
  l.startsWith("export default SipTrunkGroup"),
);
console.log({ pageStart, getGroupIdIdx, returnLine, exportLine });

write(
  "utils/SipTrunkGroupValidators.js",
  `/** Group ID: alphanumeric only (spaces stripped). */
export const sanitizeSipTrunkGroupId = (value) =>
  String(value ?? "").replace(/[^a-zA-Z0-9]/g, "");
`,
);

let transformerExports = lines
  .slice(getGroupIdIdx, pageStart)
  .join("\n")
  .replace(/^const /gm, "export const ");
write("utils/SipTrunkGroupTransformers.js", transformerExports + "\n");

const formHeader = `import React from "react";
import { Tooltip, CircularProgress } from "@mui/material";
import {
  SIP_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT,
  SIP_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION,
  SIP_TRUNK_GROUP_PAGE_TITLE,
  SIP_TRUNK_GROUP_BTN_PREV,
  SIP_TRUNK_GROUP_BTN_NEXT,
  SIP_TRUNK_GROUP_EMPTY_MESSAGE,
  SIP_TRUNK_GROUP_BTN_ADD_NEW,
  SIP_TRUNK_GROUP_FIELD_TOOLTIPS,
} from "../../../../constants/SipTrunkGroupConstants";
`;
let formBody = lines
  .slice(69, getGroupIdIdx)
  .join("\n")
  .replace(/^const /gm, "export const ");
write(
  "components/SipTrunkGroupFormFields.jsx",
  formHeader + "\n" + formBody + "\n",
);

write(
  "components/SipTrunkGroupTableHelpers.js",
  `export {
  C,
  sipTrunkGroupPageWrapStyle,
  sipTrunkGroupPageInnerStyle,
  sipTrunkGroupFixedAlertSx,
  getSipTrunkGroupTdStyle,
  getSipTrunkGroupRowBg,
  sipTrunkGroupCardStyle,
  sipTrunkGroupToolbarStyle,
  sipTrunkGroupPaginationStyle,
  sipTrunkGroupSelectedBadgeStyle,
  sipTrunkGroupCancelBtnStyle,
  sipTrunkGroupPrimaryBtnStyle,
  sipTrunkGroupPageBadgeStyle,
  sipTrunkGroupTableCheckboxSx,
  sipTrunkGroupModalTextFieldSx,
  sipTrunkGroupModalSelectSx,
  SIP_TRUNK_GROUP_SCROLL_CLASS,
  SIP_TRUNK_GROUP_ADD_NEW_DIALOG_SX,
  SIP_TRUNK_GROUP_ADD_NEW_DIALOG_PAPER_SX,
  addNewModalDialogContentSx,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  sipTrunkGroupModalCancelBtnStyle,
  tdStyle,
  TH,
  Btn,
} from "./SipTrunkGroupFormFields";
`,
);

let logic = lines.slice(pageStart + 1, returnLine).join("\n");
// Use transformer imports instead of local bindings (already extracted)
// Logic already references resolveGroupIdValue etc as free names — they'll come from imports.

write(
  "hooks/useSipTrunkGroupPage.js",
  `import { useState, useEffect } from "react";
import {
  SIP_TRUNK_GROUP_INITIAL_FORM,
  SIP_TRUNK_GROUP_ERR_REQUIRED_FIELDS,
  SIP_TRUNK_GROUP_ERR_GROUP_ID_REQUIRED,
  SIP_TRUNK_GROUP_ERR_DUPLICATE_GROUP_ID,
  SIP_TRUNK_GROUP_ERR_SAVE_FAILED,
  SIP_TRUNK_GROUP_ERR_NETWORK,
  SIP_TRUNK_GROUP_ERR_SELECT_TO_DELETE,
  SIP_TRUNK_GROUP_ERR_DELETE_FAILED,
  SIP_TRUNK_GROUP_ERR_IN_USE,
  SIP_TRUNK_GROUP_MSG_UPDATED,
  SIP_TRUNK_GROUP_MSG_SAVED,
  SIP_TRUNK_GROUP_MSG_DELETED_ONE,
  SIP_TRUNK_GROUP_MSG_DELETED_MANY,
  SIP_TRUNK_GROUP_MSG_DELETED_ALL,
  SIP_TRUNK_GROUP_CONFIRM_DELETE_SELECTED,
  SIP_TRUNK_GROUP_CONFIRM_CLEAR_ALL,
  SIP_TRUNK_GROUP_CONFIRM_DELETE_ONE,
} from "../../../../constants/SipTrunkGroupConstants";
import {
  addGroup,
  listGroups,
  deleteGroup,
  listSipRegistrations,
  fetchSipIpTrunkAccounts,
  listIpPstnRoutes,
  listNumberManipulations,
} from "../../../../api/apiService";
import {
  resolveGroupIdValue,
  SIP_ROUTE_REF_FIELDS,
  SIP_MANIP_REF_FIELDS,
  SIP_MANIPULATION_TYPES,
  itemReferencesGroup,
  getRouteList,
  countGroupsWithSameKey,
  normalizeGroupIdForApi,
} from "../utils/SipTrunkGroupTransformers";

export function useSipTrunkGroupPage() {
${logic}
  return {
    formData,
    groups,
    trunkIds,
    editIndex,
    editingRecordId,
    selected,
    setSelected,
    page,
    setPage,
    loading,
    showModal,
    message,
    setMessage,
    isInitialLoad,
    itemsPerPage,
    totalPages,
    pagedGroups,
    allPageSelected,
    somePageSelected,
    handleTogglePageSelection,
    handleInputChange,
    handleSave,
    handleAddNew,
    handleSelectRow,
    handleInverse,
    handleDelete,
    handleClearAll,
    handlePageChange,
    handleSingleDelete,
  };
}
`,
);

let pageEnd = exportLine;
while (pageEnd > returnLine && lines[pageEnd - 1].trim() === "") pageEnd--;
if (lines[pageEnd - 1].trim() === "};") pageEnd -= 1;
const pageJsx = lines.slice(returnLine, pageEnd).join("\n");

write(
  "SipTrunkGroup.jsx",
  `import React from "react";
import {
  SIP_TRUNK_GROUP_TABLE_COLUMNS,
  SIP_TRUNK_GROUP_FIELD_TOOLTIPS,
  SIP_TRUNK_GROUP_BTN_INVERSE,
  SIP_TRUNK_GROUP_BTN_DELETE,
  SIP_TRUNK_GROUP_BTN_CLEAR_ALL,
  SIP_TRUNK_GROUP_BTN_ADD_NEW,
  SIP_TRUNK_GROUP_BTN_SAVE,
  SIP_TRUNK_GROUP_BTN_SAVING,
  SIP_TRUNK_GROUP_BTN_CLOSE,
  SIP_TRUNK_GROUP_MODAL_ADD_TITLE,
  SIP_TRUNK_GROUP_MODAL_EDIT_TITLE,
  SIP_TRUNK_GROUP_LABEL_SIP_TRUNK_ID,
  SIP_TRUNK_GROUP_LABEL_GROUP_ID,
  SIP_TRUNK_GROUP_PLACEHOLDER_SELECT_TRUNK,
  SIP_TRUNK_GROUP_PLACEHOLDER_NO_OPTIONS,
  SIP_TRUNK_GROUP_PLACEHOLDER_GROUP_ID,
  SIP_TRUNK_GROUP_EMPTY_MESSAGE,
  SIP_TRUNK_GROUP_RECORD_LABEL,
  SIP_TRUNK_GROUP_SELECTED_SUFFIX,
  SIP_TRUNK_GROUP_PAGINATION_SHOWING,
  SIP_TRUNK_GROUP_PAGINATION_PAGE_OF,
} from "../../../constants/SipTrunkGroupConstants";
import {
  Checkbox,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useSipTrunkGroupPage } from "./hooks/useSipTrunkGroupPage";
import {
  Btn,
  TH,
  SipTrunkGroupFieldLabel,
  SipTrunkGroupBreadcrumb,
  SipTrunkGroupScrollbarStyles,
  SipTrunkGroupTableListLoading,
  SipTrunkGroupTableListEmptyState,
  SipTrunkGroupPagination,
} from "./components/SipTrunkGroupFormFields";
import {
  C,
  sipTrunkGroupPageWrapStyle,
  sipTrunkGroupPageInnerStyle,
  sipTrunkGroupFixedAlertSx,
  getSipTrunkGroupTdStyle,
  getSipTrunkGroupRowBg,
  sipTrunkGroupCardStyle,
  sipTrunkGroupToolbarStyle,
  sipTrunkGroupPaginationStyle,
  sipTrunkGroupSelectedBadgeStyle,
  sipTrunkGroupCancelBtnStyle,
  sipTrunkGroupPrimaryBtnStyle,
  sipTrunkGroupPageBadgeStyle,
  sipTrunkGroupTableCheckboxSx,
  sipTrunkGroupModalTextFieldSx,
  sipTrunkGroupModalSelectSx,
  SIP_TRUNK_GROUP_SCROLL_CLASS,
  SIP_TRUNK_GROUP_ADD_NEW_DIALOG_SX,
  SIP_TRUNK_GROUP_ADD_NEW_DIALOG_PAPER_SX,
  addNewModalDialogContentSx,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  sipTrunkGroupModalCancelBtnStyle,
} from "./components/SipTrunkGroupTableHelpers";

const SipTrunkGroup = () => {
  const vm = useSipTrunkGroupPage();
  const {
    formData,
    groups,
    trunkIds,
    editIndex,
    editingRecordId,
    selected,
    setSelected,
    page,
    setPage,
    loading,
    showModal,
    message,
    setMessage,
    isInitialLoad,
    itemsPerPage,
    totalPages,
    pagedGroups,
    allPageSelected,
    somePageSelected,
    handleTogglePageSelection,
    handleInputChange,
    handleSave,
    handleAddNew,
    handleSelectRow,
    handleInverse,
    handleDelete,
    handleClearAll,
    handlePageChange,
    handleSingleDelete,
  } = vm;

${pageJsx}
};

export default SipTrunkGroup;
`,
);

console.log("SipTrunkGroup factor complete");
