#!/usr/bin/env node
import fs from "fs";
import path from "path";

const NUM_DIR = path.join(path.resolve("."), "src/modules/FXS/Num Manipulate");

const PAGES = [
  {
    prefix: "IPCallInCallerID",
    hook: "useIPCallInCallerIDPage",
    component: "IPCallInCallerID",
    file: "FxsIPCallInCallerID.jsx",
    constants: "FxsIPCallInCallerIDConstants",
    constPrefix: "IP_CALL_IN_CALLERID",
    isPstn: false,
  },
  {
    prefix: "IPCallInCalleeID",
    hook: "useIPCallInCalleeIDPage",
    component: "IPCallInCalleeID",
    file: "FxsIPCallInCalleeID.jsx",
    constants: "FxsIPCallInCalleeIDConstants",
    constPrefix: "IP_CALL_IN_CALLEEID",
    isPstn: false,
  },
  {
    prefix: "PSTNCallInCallerID",
    hook: "usePSTNCallInCallerIDPage",
    component: "PSTNCallInCallerID",
    file: "FxsPSTNCallInCallerID.jsx",
    constants: "FxsPSTNCallInCallerIDConstants",
    constPrefix: "PSTN_CALL_IN_CALLERID",
    isPstn: true,
  },
  {
    prefix: "PSTNCallInCalleeID",
    hook: "usePSTNCallInCalleeIDPage",
    component: "PSTNCallInCalleeID",
    file: "FxsPSTNCallInCalleeID.jsx",
    constants: "FxsPSTNCallInCalleeIDConstants",
    constPrefix: "PSTN_CALL_IN_CALLEEID",
    isPstn: true,
  },
];

function write(rel, content) {
  fs.writeFileSync(path.join(NUM_DIR, rel), content, "utf8");
  console.log("wrote", rel);
}

for (const p of PAGES) {
  const camel = p.prefix.charAt(0).toLowerCase() + p.prefix.slice(1);

  write(
    `components/${p.prefix}FormFields.jsx`,
    `export {
  NumManipulateBtn as ${p.prefix}Btn,
  NumManipulateTH as ${p.prefix}TH,
  NumManipulateFieldLabel as ${p.prefix}FieldLabel,
  NumManipulateModalFormFields as ${p.prefix}ModalFormFields,
  numManipulateCardStyle as ${camel}CardStyle,
  numManipulateToolbarStyle as ${camel}ToolbarStyle,
  numManipulatePaginationStyle as ${camel}PaginationStyle,
  numManipulateAddNewModalFooterStyle as ${camel}AddNewModalFooterStyle,
  numManipulateAddNewModalFooterBtnStyle as ${camel}AddNewModalFooterBtnStyle,
  numManipulateAddNewModalFooterCancelBtnStyle as ${camel}AddNewModalFooterCancelBtnStyle,
  numManipulateAddNewModalBackdropSlotProps as ${camel}AddNewModalBackdropSlotProps,
  numManipulateAddNewModalDialogContentSx as ${camel}AddNewModalDialogContentSx,
  numManipulateMuiTextFieldSx as ${camel}MuiTextFieldSx,
  numManipulateMuiSelectSx as ${camel}MuiSelectSx,
  numManipulateCheckboxSx as ${camel}CheckboxSx,
  numManipulateTdStyle as ${camel}TdStyle,
  createNumManipulateDialogConfig,
  createNumManipulateBreadcrumb,
} from "./NumManipulateSharedFormFields";

import { createNumManipulateBreadcrumb as createBreadcrumb } from "./NumManipulateSharedFormFields";
import {
  ${p.constPrefix}_PAGE_BREADCRUMB_ROOT,
  ${p.constPrefix}_PAGE_BREADCRUMB_SECTION,
  ${p.constPrefix}_PAGE_TITLE,
} from "../../../../constants/${p.constants}";

export const ${p.prefix}Breadcrumb = createBreadcrumb(
  ${p.constPrefix}_PAGE_BREADCRUMB_ROOT,
  ${p.constPrefix}_PAGE_BREADCRUMB_SECTION,
  ${p.constPrefix}_PAGE_TITLE,
);

export const ${camel}DialogConfig = createNumManipulateDialogConfig("${p.prefix}");
`,
  );

  write(
    `components/${p.prefix}TableHelpers.js`,
    `export {
  getNumManipulateRowBg as get${p.prefix}RowBg,
  numManipulateEditIconStyle as ${camel}EditIconStyle,
  handleNumManipulateEditIconHover as handle${p.prefix}EditIconHover,
  numManipulateFixedAlertSx as ${camel}FixedAlertSx,
  numManipulatePageWrapStyle as ${camel}PageWrapStyle,
  numManipulatePageInnerStyle as ${camel}PageInnerStyle,
  numManipulateSelectedBadgeStyle as ${camel}SelectedBadgeStyle,
  numManipulateToolbarBtnStyle as ${camel}ToolbarBtnStyle,
  numManipulateLoadingWrapStyle as ${camel}LoadingWrapStyle,
  numManipulateEmptyWrapStyle as ${camel}EmptyWrapStyle,
  numManipulateEmptyTitleStyle as ${camel}EmptyTitleStyle,
  numManipulateTableScrollStyle as ${camel}TableScrollStyle,
  NUM_MANIPULATE_CARD_RADIUS as ${p.prefix.toUpperCase()}_CARD_RADIUS,
} from "./NumManipulateSharedTableHelpers";
`,
  );

  const renderCell = p.isPstn
    ? `render${p.prefix}CellValue(col, item, pcmTrunkGroups, getPcmGroupIdLabel)`
    : `render${p.prefix}CellValue(col, item)`;

  write(
    p.file,
    `import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ${p.constPrefix}_TABLE_COLUMNS,
  ${p.constPrefix}_FIELD_TOOLTIPS,
  ${p.constPrefix}_EMPTY_MESSAGE,
  ${p.constPrefix}_MODAL_TITLE_ADD,
  ${p.constPrefix}_MODAL_TITLE_EDIT,
} from "../../../constants/${p.constants}";
import { C } from "../../../theme/pbxTokens";
import { ${p.hook} } from "./hooks/${p.hook}";
import { ${renderCell.split("(")[0]} } from "./utils/${p.prefix}Transformers";
import {
  ${p.prefix}Breadcrumb,
  ${p.prefix}Btn,
  ${p.prefix}TH,
  ${p.prefix}ModalFormFields,
  ${camel}CardStyle,
  ${camel}ToolbarStyle,
  ${camel}PaginationStyle,
  ${camel}AddNewModalFooterStyle,
  ${camel}AddNewModalFooterBtnStyle,
  ${camel}AddNewModalFooterCancelBtnStyle,
  ${camel}AddNewModalBackdropSlotProps,
  ${camel}AddNewModalDialogContentSx,
  ${camel}CheckboxSx,
  ${camel}TdStyle,
  ${camel}DialogConfig,
} from "./components/${p.prefix}FormFields";
import {
  get${p.prefix}RowBg,
  ${camel}EditIconStyle,
  handle${p.prefix}EditIconHover,
  ${camel}FixedAlertSx,
  ${camel}PageWrapStyle,
  ${camel}PageInnerStyle,
  ${camel}SelectedBadgeStyle,
  ${camel}ToolbarBtnStyle,
  ${camel}LoadingWrapStyle,
  ${camel}EmptyWrapStyle,
  ${camel}EmptyTitleStyle,
  ${camel}TableScrollStyle,
  ${p.prefix.toUpperCase()}_CARD_RADIUS,
} from "./components/${p.prefix}TableHelpers";

const ${p.component} = () => {
  const vm = ${p.hook}();
  const {
    isModalOpen,
    formData,
    rules,
    selected,
    page,
    loading,
    editIndex,
    toast,
    setToast,
    tableScrollRef,
    totalPages,
    pagedRules,${p.isPstn ? "\n    pcmTrunkGroups,\n    getPcmGroupIdLabel," : ""}
    getUpdatedFields,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleInputChange,
    handlePageChange,
    handleSelectRow,
    handleCheckAll,
    handleUncheckAll,
    handleInverse,
    handleDelete,
    handleClearAll,
    handleTableScroll,
    handleRefresh,
  } = vm;

  const { dialogSx, paperSx, modalTitleStyle } = ${camel}DialogConfig;

  const renderCellValue = (col, item) =>
    ${renderCell};

  return (
    <div style={${camel}PageWrapStyle}>
      <div style={${camel}PageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={${camel}FixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <${p.prefix}Breadcrumb />

        <div style={${camel}CardStyle}>
          <div style={${camel}ToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span style={${camel}SelectedBadgeStyle(C.accent)}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <${p.prefix}Btn
                variant="cancel"
                onClick={handleInverse}
                disabled={loading.delete || rules.length === 0}
                style={${camel}ToolbarBtnStyle}
              >
                Inverse
              </${p.prefix}Btn>
              <${p.prefix}Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                style={${camel}ToolbarBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    Delete
                  </>
                )}
              </${p.prefix}Btn>
              <${p.prefix}Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.delete || rules.length === 0}
                style={${camel}ToolbarBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Clear All"
                )}
              </${p.prefix}Btn>
              <${p.prefix}Btn
                variant="cancel"
                onClick={handleRefresh}
                disabled={loading.fetch}
                style={${camel}ToolbarBtnStyle}
              >
                {loading.fetch ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Refresh"
                )}
              </${p.prefix}Btn>
              <${p.prefix}Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.fetch}
                style={${camel}ToolbarBtnStyle}
              >
                + Add New
              </${p.prefix}Btn>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            {loading.fetch ? (
              <div style={${camel}LoadingWrapStyle}>
                <div style={{ textAlign: "center" }}>
                  <CircularProgress size={28} style={{ color: C.accent }} />
                  <div
                    style={{
                      marginTop: 12,
                      color: "#3E5475",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Loading number manipulations...
                  </div>
                </div>
              </div>
            ) : rules.length === 0 ? (
              <div style={${camel}EmptyWrapStyle}>
                <div style={${camel}EmptyTitleStyle}>
                  {${p.constPrefix}_EMPTY_MESSAGE}
                </div>
                <${p.prefix}Btn
                  variant="cancel"
                  onClick={() => handleOpenModal()}
                  style={${camel}ToolbarBtnStyle}
                >
                  + Add New Rule
                </${p.prefix}Btn>
              </div>
            ) : (
              <>
                <div
                  ref={tableScrollRef}
                  onScroll={handleTableScroll}
                  style={${camel}TableScrollStyle}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "separate",
                      borderSpacing: 0,
                    }}
                  >
                    <thead>
                      <tr>
                        <${p.prefix}TH
                          style={{ width: 40, padding: 0, borderLeft: "none" }}
                        >
                          <Checkbox
                            size="small"
                            checked={
                              rules.length > 0 &&
                              selected.length === rules.length
                            }
                            indeterminate={
                              selected.length > 0 &&
                              selected.length < rules.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) handleCheckAll();
                              else handleUncheckAll();
                            }}
                            sx={${camel}CheckboxSx}
                          />
                        </${p.prefix}TH>
                        <${p.prefix}TH style={{ width: 50 }}>ID</${p.prefix}TH>
                        {${p.constPrefix}_TABLE_COLUMNS.map((col) => (
                          <${p.prefix}TH key={col.key}>{col.label}</${p.prefix}TH>
                        ))}
                        <${p.prefix}TH style={{ width: 60, borderRight: "none" }}>
                          Modify
                        </${p.prefix}TH>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRules.map((item, idx) => {
                        const realIdx = (page - 1) * vm.itemsPerPage + idx;
                        const isSelected = selected.includes(realIdx);
                        const isLastRow = idx === pagedRules.length - 1;
                        const rowBg = get${p.prefix}RowBg(isSelected, idx);
                        const lastRowCellStyle = isLastRow
                          ? { borderBottom: "none" }
                          : {};

                        return (
                          <tr
                            key={item.id || realIdx}
                            style={{
                              background: rowBg,
                              borderBottom: isLastRow
                                ? "none"
                                : \`1px solid \${C.cardBorder}\`,
                              transition: "background-color 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.background = "#f1f5f9";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.background = rowBg;
                            }}
                          >
                            <td
                              style={{
                                ...${camel}TdStyle,
                                background: rowBg,
                                borderLeft: "none",
                                ...lastRowCellStyle,
                                ...(isLastRow
                                  ? { borderBottomLeftRadius: ${p.prefix.toUpperCase()}_CARD_RADIUS }
                                  : {}),
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={() => handleSelectRow(idx)}
                                sx={${camel}CheckboxSx}
                              />
                            </td>
                            <td
                              style={{
                                ...${camel}TdStyle,
                                background: rowBg,
                                ...lastRowCellStyle,
                              }}
                            >
                              {realIdx + 1}
                            </td>
                            {${p.constPrefix}_TABLE_COLUMNS.map((col) => (
                              <td
                                key={col.key}
                                style={{
                                  ...${camel}TdStyle,
                                  background: rowBg,
                                  ...lastRowCellStyle,
                                }}
                              >
                                {renderCellValue(col, item)}
                              </td>
                            ))}
                            <td
                              style={{
                                ...${camel}TdStyle,
                                background: rowBg,
                                borderRight: "none",
                                ...lastRowCellStyle,
                                ...(isLastRow
                                  ? { borderBottomRightRadius: ${p.prefix.toUpperCase()}_CARD_RADIUS }
                                  : {}),
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <EditDocumentIcon
                                  titleAccess="Edit"
                                  style={${camel}EditIconStyle}
                                  onClick={() => handleOpenModal(item, realIdx)}
                                  onMouseEnter={(e) =>
                                    handle${p.prefix}EditIconHover(e, true)
                                  }
                                  onMouseLeave={(e) =>
                                    handle${p.prefix}EditIconHover(e, false)
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={${camel}PaginationStyle}>
                  <span style={{ fontSize: 11, color: C.mutedText }}>
                    Showing {pagedRules.length} record
                    {pagedRules.length !== 1 ? "s" : ""} on page {page}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <${p.prefix}Btn
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      variant="outline"
                      style={{ borderRadius: 4 }}
                    >
                      ← Prev
                    </${p.prefix}Btn>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: C.accent,
                        background: "#e0f2fe",
                        padding: "5px 14px",
                        borderRadius: 4,
                        border: \`1px solid \${C.cardBorder}\`,
                      }}
                    >
                      Page {page} of {totalPages}
                    </span>
                    <${p.prefix}Btn
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      variant="outline"
                      style={{ borderRadius: 4 }}
                    >
                      Next →
                    </${p.prefix}Btn>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth={false}
          slotProps={${camel}AddNewModalBackdropSlotProps}
          sx={dialogSx}
          PaperProps={{ sx: paperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={modalTitleStyle}>
            {editIndex !== null
              ? ${p.constPrefix}_MODAL_TITLE_EDIT
              : ${p.constPrefix}_MODAL_TITLE_ADD}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              flex: "1 1 auto",
            }}
            sx={${camel}AddNewModalDialogContentSx}
          >
            <${p.prefix}ModalFormFields
              fields={getUpdatedFields()}
              fieldTooltips={${p.constPrefix}_FIELD_TOOLTIPS}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions sx={{ p: 0, m: 0 }} style={${camel}AddNewModalFooterStyle}>
            <${p.prefix}Btn
              variant="primary"
              onClick={handleSave}
              disabled={loading.save}
              style={${camel}AddNewModalFooterBtnStyle}
            >
              {loading.save
                ? "Saving..."
                : editIndex !== null
                  ? "Update"
                  : "Save"}
            </${p.prefix}Btn>
            <${p.prefix}Btn
              variant="cancel"
              onClick={handleCloseModal}
              disabled={loading.save}
              style={${camel}AddNewModalFooterCancelBtnStyle}
            >
              Close
            </${p.prefix}Btn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default ${p.component};
`,
  );
}

console.log("Done generating Num Manipulate pages");
