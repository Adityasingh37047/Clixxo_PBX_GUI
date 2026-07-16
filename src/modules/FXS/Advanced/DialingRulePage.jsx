import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Alert,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  DIALING_RULE_TABLE_COLUMNS,
  DIALING_RULE_EMPTY_MESSAGE,
  DIALING_RULE_MODAL_TITLE_ADD,
  DIALING_RULE_MODAL_TITLE_EDIT,
} from "../../../constants/DialingRuleConstants";
import { C } from "../../../theme/pbxTokens";
import { Btn } from "../../../components/common";
import { useDialingRulePage } from "./hooks/useDialingRulePage";
import {
  DialingRuleBreadcrumb,
  DialingRuleFieldRow,
  DialingRulePageShell,
  DIALING_RULE_ADD_NEW_DIALOG_PAPER_SX,
  DIALING_RULE_ADD_NEW_DIALOG_SX,
  dialingRuleAddHostFormPanelStyle,
  dialingRuleAddNewModalBackdropSlotProps,
  dialingRuleAddNewModalDialogContentSx,
  dialingRuleAddNewModalFooterBtnStyle,
  dialingRuleAddNewModalFooterCancelBtnStyle,
  dialingRuleAddNewModalFooterStyle,
  dialingRuleAdvancedModalTitleStyle,
  dialingRuleModalDialogContentStyle,
  dialingRuleMuiSelectSx,
  dialingRuleMuiTextFieldSx,
  dialingRuleTextFieldInputProps,
} from "./components/DialingRuleFormFields";
import {
  TH,
  tdStyle,
  dialingRuleCardStyle,
  dialingRuleEmptyMessageStyle,
  dialingRuleEmptyStateStyle,
  dialingRuleFixedAlertSx,
  dialingRuleHeaderStyle,
  dialingRulePaginationPageBadgeStyle,
  dialingRulePaginationStyle,
  dialingRuleSelectedBadgeStyle,
  dialingRuleTableBodyStyle,
  dialingRuleTableCheckboxSx,
  dialingRuleTableStyle,
  dialingRuleToolbarCancelBtnStyle,
  dialingRuleToolbarPrimaryBtnStyle,
  dialingRuleToolbarBtnStyle,
  dialingRuleEditIconStyle,
  getDialingRuleRowBg,
  handleDialingRuleEditIconHover,
  handleDialingRuleRowHover,
  PCM_TRUNK_GROUP_TD_GAP,
  PCM_TRUNK_GROUP_TH_GAP,
} from "./components/DialingRuleTableHelpers";

const DATA_COLUMNS = DIALING_RULE_TABLE_COLUMNS.filter(
  (c) => c.key !== "check" && c.key !== "modify",
);

const DialingRulePage = () => {
  const vm = useDialingRulePage();
  const {
    isModalOpen,
    formData,
    rules,
    selected,
    page,
    itemsPerPage,
    totalPages,
    pagedRules,
    editIndex,
    indexSelect,
    toast,
    clearToast,
    getAvailableIndices,
    handleOpenModal,
    handleCloseModal,
    handleIndexSelectChange,
    handleInputChange,
    handleSave,
    handleSelectRow,
    handleCheckAll,
    handleUncheckAll,
    handleInverse,
    handleDelete,
    handleClearAll,
    handlePageChange,
    pagedSelectedCount,
    allPagedChecked,
  } = vm;

  return (
    <DialingRulePageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={clearToast}
          sx={dialingRuleFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <DialingRuleBreadcrumb />

      <div style={dialingRuleCardStyle}>
        <div style={dialingRuleHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {selected.length > 0 && (
              <span style={dialingRuleSelectedBadgeStyle}>
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
            <Btn
              variant="cancel"
              onClick={handleInverse}
              disabled={rules.length === 0}
              style={dialingRuleToolbarCancelBtnStyle}
            >
              Inverse
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleDelete}
              disabled={selected.length === 0}
              style={dialingRuleToolbarCancelBtnStyle}
            >
              Delete
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleClearAll}
              disabled={rules.length === 0}
              style={dialingRuleToolbarCancelBtnStyle}
            >
              Clear All
            </Btn>
            <Btn
              variant="primary"
              onClick={() => handleOpenModal()}
              style={dialingRuleToolbarPrimaryBtnStyle}
            >
              + Add New
            </Btn>
          </div>
        </div>

        <div style={dialingRuleTableBodyStyle}>
          {rules.length === 0 ? (
            <div style={dialingRuleEmptyStateStyle}>
              <div style={dialingRuleEmptyMessageStyle}>
                {DIALING_RULE_EMPTY_MESSAGE}
              </div>
              <Btn
                variant="cancel"
                onClick={() => handleOpenModal()}
                style={dialingRuleToolbarCancelBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          ) : (
            <table style={dialingRuleTableStyle}>
              <thead>
                <tr>
                  <TH
                    style={{
                      width: 40,
                      padding: 0,
                      borderLeft: "none",
                      ...PCM_TRUNK_GROUP_TH_GAP,
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={allPagedChecked}
                      indeterminate={
                        pagedSelectedCount > 0 && !allPagedChecked
                      }
                      onChange={(e) => {
                        if (e.target.checked) handleCheckAll();
                        else handleUncheckAll();
                      }}
                      sx={dialingRuleTableCheckboxSx}
                    />
                  </TH>
                  {DATA_COLUMNS.map((col) => (
                    <TH key={col.key} style={PCM_TRUNK_GROUP_TH_GAP}>
                      {col.label}
                    </TH>
                  ))}
                  <TH
                    style={{
                      width: 70,
                      borderRight: "none",
                      ...PCM_TRUNK_GROUP_TH_GAP,
                    }}
                  >
                    Modify
                  </TH>
                </tr>
              </thead>
              <tbody>
                {pagedRules.map((item, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  const isSelected = selected.includes(realIdx);
                  const isLastRow = idx === pagedRules.length - 1;
                  const rowBg = getDialingRuleRowBg(isSelected, idx);
                  const lastRowCellStyle = isLastRow
                    ? { borderBottom: "none" }
                    : {};

                  return (
                    <tr
                      key={realIdx}
                      style={{
                        background: rowBg,
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        handleDialingRuleRowHover(e, isSelected, rowBg, true)
                      }
                      onMouseLeave={(e) =>
                        handleDialingRuleRowHover(e, isSelected, rowBg, false)
                      }
                    >
                      <td
                        style={{
                          ...tdStyle,
                          ...PCM_TRUNK_GROUP_TD_GAP,
                          background: rowBg,
                          borderLeft: "none",
                          width: 36,
                          ...lastRowCellStyle,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => handleSelectRow(idx)}
                          sx={dialingRuleTableCheckboxSx}
                        />
                      </td>
                      {DATA_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            ...tdStyle,
                            ...PCM_TRUNK_GROUP_TD_GAP,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {item[col.key]}
                        </td>
                      ))}
                      <td
                        style={{
                          ...tdStyle,
                          ...PCM_TRUNK_GROUP_TD_GAP,
                          background: rowBg,
                          borderRight: "none",
                          ...lastRowCellStyle,
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
                            style={dialingRuleEditIconStyle}
                            onMouseEnter={(e) =>
                              handleDialingRuleEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleDialingRuleEditIconHover(e, false)
                            }
                            onClick={() => handleOpenModal(item, realIdx)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {rules.length > 0 && (
          <div style={dialingRulePaginationStyle}>
            <span style={{ fontSize: 11, color: C.mutedText }}>
              Showing {pagedRules.length} record
              {pagedRules.length !== 1 ? "s" : ""} on page {page}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                variant="outline"
                style={{ borderRadius: 4 }}
              >
                ← Prev
              </Btn>
              <span style={dialingRulePaginationPageBadgeStyle}>
                Page {page} of {totalPages}
              </span>
              <Btn
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                variant="outline"
                style={{ borderRadius: 4 }}
              >
                Next →
              </Btn>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        slotProps={dialingRuleAddNewModalBackdropSlotProps}
        sx={DIALING_RULE_ADD_NEW_DIALOG_SX}
        PaperProps={{ sx: DIALING_RULE_ADD_NEW_DIALOG_PAPER_SX }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={dialingRuleAdvancedModalTitleStyle}>
          {editIndex !== null
            ? DIALING_RULE_MODAL_TITLE_EDIT
            : DIALING_RULE_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={dialingRuleModalDialogContentStyle}
          sx={dialingRuleAddNewModalDialogContentSx}
        >
          <div style={dialingRuleAddHostFormPanelStyle}>
            <DialingRuleFieldRow label="Index:" tooltipKey="index">
              <FormControl size="small" fullWidth>
                <MuiSelect
                  value={indexSelect || ""}
                  onChange={(e) => handleIndexSelectChange(e.target.value)}
                  sx={dialingRuleMuiSelectSx}
                >
                  {getAvailableIndices(editIndex).map((opt) => (
                    <MenuItem
                      key={opt.value}
                      value={opt.value}
                      sx={{ fontSize: 13 }}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </FormControl>
            </DialingRuleFieldRow>
            <DialingRuleFieldRow label="Description:" tooltipKey="description">
              <TextField
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                size="small"
                fullWidth
                variant="outlined"
                sx={dialingRuleMuiTextFieldSx}
                inputProps={dialingRuleTextFieldInputProps}
              />
            </DialingRuleFieldRow>
            <DialingRuleFieldRow label="Dialing Rule:" tooltipKey="dialingRule">
              <TextField
                name="dialingRule"
                value={formData.dialingRule || ""}
                onChange={handleInputChange}
                size="small"
                fullWidth
                variant="outlined"
                sx={dialingRuleMuiTextFieldSx}
                inputProps={dialingRuleTextFieldInputProps}
              />
            </DialingRuleFieldRow>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={dialingRuleAddNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            style={dialingRuleAddNewModalFooterBtnStyle}
          >
            Save
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            style={dialingRuleAddNewModalFooterCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </DialingRulePageShell>
  );
};

export default DialingRulePage;
