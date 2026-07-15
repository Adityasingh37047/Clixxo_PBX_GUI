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
let returnLine = -1;
for (let i = pageStart; i < lines.length; i++) {
  if (lines[i] === "  return (") {
    returnLine = i;
    break;
  }
}
const exportLine = lines.findIndex((l) => l.startsWith("export default SipTrunkGroup"));

// Helpers that are pure data → transformers (from getGroupIdValue through normalizeGroupIdForApi)
const getGroupIdIdx = lines.findIndex((l) =>
  l.startsWith("const getGroupIdValue"),
);
const componentIdx = pageStart;

console.log({ pageStart, returnLine, exportLine, getGroupIdIdx });

// ── Validators ──
write(
  "utils/SipTrunkGroupValidators.js",
  `import {
  SIP_TRUNK_GROUP_ERR_REQUIRED_FIELDS,
  SIP_TRUNK_GROUP_ERR_GROUP_ID_REQUIRED,
  SIP_TRUNK_GROUP_ERR_DUPLICATE_GROUP_ID,
} from "../../../../constants/SipTrunkGroupConstants";
import { resolveGroupIdValue } from "./SipTrunkGroupTransformers";

export const validateSipTrunkGroupForm = (formData, groups, editIndex) => {
  if (!formData.sipTrunkId || !formData.groupId) {
    return SIP_TRUNK_GROUP_ERR_REQUIRED_FIELDS;
  }
  if (!String(formData.groupId).trim()) {
    return SIP_TRUNK_GROUP_ERR_GROUP_ID_REQUIRED;
  }
  const newKey = String(formData.groupId).trim();
  const duplicate = groups.some((g, idx) => {
    if (editIndex >= 0 && idx === editIndex) return false;
    return resolveGroupIdValue(g) === newKey;
  });
  if (duplicate) {
    return SIP_TRUNK_GROUP_ERR_DUPLICATE_GROUP_ID;
  }
  return null;
};
`,
);

// Extract transformer helpers from HEAD (getGroupIdValue .. normalizeGroupIdForApi)
const transformerBlock = lines.slice(getGroupIdIdx, componentIdx).join("\n");
let transformerExports = transformerBlock.replace(/^const /gm, "export const ");
write(
  "utils/SipTrunkGroupTransformers.js",
  transformerExports + "\n",
);

// ── FormFields: lines 70..getGroupIdIdx (UI before transformers) ──
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

let formBody = lines.slice(69, getGroupIdIdx).join("\n");
formBody = formBody.replace(/^const /gm, "export const ");
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
} from "./SipTrunkGroupFormFields";
`,
);

// ── Hook: component body until return ──
const logic = lines.slice(pageStart + 1, returnLine).join("\n");
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
  getGroupIdValue,
  resolveGroupIdValue,
  IGNORED_GROUP_REF_VALUES,
  SIP_ROUTE_REF_FIELDS,
  SIP_MANIP_REF_FIELDS,
  SIP_MANIPULATION_TYPES,
  normalizeGroupRefValue,
  matchesGroupReference,
  itemReferencesGroup,
  getRouteList,
  countGroupsWithSameKey,
  normalizeGroupIdForApi,
} from "../utils/SipTrunkGroupTransformers";

export function useSipTrunkGroupPage() {
${logic}
  return {
    formData,
    setFormData,
    groups,
    trunkIds,
    editIndex,
    editingRecordId,
    selected,
    setSelected,
    page,
    setPage,
    loading,
    toast,
    setToast,
    isModalOpen,
    tableScrollRef,
    isInitialLoad,
    itemsPerPage,
    totalPages,
    pagedGroups,
    openAddNew,
    openEdit,
    closeModal,
    handleChange,
    handleSave,
    handleDeleteSelected,
    handleClearAll,
    handleDeleteOne,
    // expose anything else JSX may need
  };
}
`,
);

console.log("SipTrunkGroup hook/form drafted — need to fix return fields from JSX usage");
