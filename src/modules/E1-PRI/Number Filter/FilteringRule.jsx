import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Checkbox,
  useMediaQuery,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  NUMBER_FILTER_RULE_COLUMNS,
  NUMBER_FILTER_RULE_DROPDOWN_OPTIONS,
  NUMBER_FILTER_RULE_FIELD_TOOLTIPS,
  NUMBER_FILTER_RULE_EMPTY_MESSAGE,
  NUMBER_FILTER_RULE_MODAL_TITLE_ADD,
  NUMBER_FILTER_RULE_MODAL_TITLE_EDIT,
  NUMBER_FILTER_RULE_ADD_NEW_LABEL,
  NUMBER_FILTER_RULE_ADD_NEW_EMPTY_LABEL,
  NUMBER_FILTER_RULE_DELETE_LABEL,
  NUMBER_FILTER_RULE_CLEAR_ALL_LABEL,
  NUMBER_FILTER_RULE_SAVE_LABEL,
  NUMBER_FILTER_RULE_CLOSE_LABEL,
} from "../../../constants/NumberFilterRuleConstants";
import { useFilteringRulePage } from "./hooks/useFilteringRulePage";
import { FILTERING_RULE_FORM_FIELDS } from "./utils/FilteringRuleTransformers";
import {
  FilteringRuleBreadcrumb,
  FilteringRuleBtn,
  FilteringRuleTH,
  FilteringRuleFieldRow,
  FilteringRuleTableListLoading,
  FilteringRuleTableListEmptyState,
  filteringRuleFormPanelStyle,
  filteringRuleSelectStyle,
  filteringRuleDisabledInputStyle,
  filteringRuleInputInteraction,
  filteringRuleAddNewModalFooterStyle,
  filteringRuleAddNewModalFooterBtnStyle,
  filteringRuleAddNewModalFooterCancelBtnStyle,
  filteringRuleCheckboxSx,
  filteringRuleTdStyle,
  filteringRuleC as C,
  filteringRuleFixedAlertSx,
  filteringRuleCardStyle,
  filteringRuleToolbarStyle,
  filteringRuleCancelBtnStyle,
  filteringRuleToolbarBtnStyle,
  FILTERING_RULE_COMPACT_MQ,
  filteringRuleDialogConfig,
} from "./components/FilteringRuleFormFields";
import {
  getFilteringRuleRowBg,
  filteringRulePageWrapStyle,
  filteringRulePageInnerStyle,
  filteringRuleSelectedBadgeStyle,
  filteringRuleTableScrollStyle,
  filteringRuleFooterStyle,
} from "./components/FilteringRuleTableHelpers";

const FilteringRule = () => {
  const isCompact = useMediaQuery(FILTERING_RULE_COMPACT_MQ);
  const vm = useFilteringRulePage();
  const {
    rows,
    modalOpen,
    editIndex,
    form,
    groupOptions,
    toast,
    setToast,
    isLoading,
    isInitialLoad,
    isDeleting,
    allRowsChecked,
    someRowsChecked,
    openModal,
    closeModal,
    handleFormChange,
    handleSave,
    handleCheck,
    handleCheckAll,
    handleDelete,
    handleClearAll,
  } = vm;

  const { dialogSx, paperSx, modalTitleStyle } = filteringRuleDialogConfig;

  return (
    <div
      style={{
        ...filteringRulePageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={filteringRulePageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={filteringRuleFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <FilteringRuleBreadcrumb />

        <div style={filteringRuleCardStyle}>
          <div
            style={{
              ...filteringRuleToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: 1,
                minWidth: 0,
              }}
            >
              {rows.some((r) => r.checked) && (
                <span style={filteringRuleSelectedBadgeStyle}>
                  {rows.filter((r) => r.checked).length} selected
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
              <FilteringRuleBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={
                  isInitialLoad || !rows.some((r) => r.checked) || isDeleting
                }
                style={filteringRuleCancelBtnStyle}
              >
                {isDeleting ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {NUMBER_FILTER_RULE_DELETE_LABEL}
              </FilteringRuleBtn>
              <FilteringRuleBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={isInitialLoad || rows.length === 0 || isDeleting}
                style={filteringRuleCancelBtnStyle}
              >
                {NUMBER_FILTER_RULE_CLEAR_ALL_LABEL}
              </FilteringRuleBtn>
              <FilteringRuleBtn
                variant="primary"
                onClick={() => openModal()}
                disabled={isInitialLoad || isDeleting || isLoading}
                style={filteringRuleToolbarBtnStyle}
              >
                {NUMBER_FILTER_RULE_ADD_NEW_LABEL}
              </FilteringRuleBtn>
            </div>
          </div>

          {isInitialLoad ? (
            <FilteringRuleTableListLoading />
          ) : rows.length === 0 ? (
            <FilteringRuleTableListEmptyState
              message={NUMBER_FILTER_RULE_EMPTY_MESSAGE}
              onAddNew={() => openModal()}
              buttonLabel={NUMBER_FILTER_RULE_ADD_NEW_EMPTY_LABEL}
            />
          ) : (
            <>
              <div style={filteringRuleTableScrollStyle}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                    minWidth: 1800,
                    ...(isCompact ? { minWidth: 1200 } : {}),
                  }}
                >
                  <thead>
                    <tr>
                      {NUMBER_FILTER_RULE_COLUMNS.map((col) => (
                        <FilteringRuleTH
                          key={col.key}
                          style={{
                            ...(col.key === "check"
                              ? {
                                  borderLeft: "none",
                                  width: 40,
                                  padding: 0,
                                }
                              : {}),
                            ...(col.key === "originalCallerIdPoolBlacklist"
                              ? { borderRight: "none" }
                              : {}),
                            width:
                              col.key === "check"
                                ? 40
                                : col.key === "description"
                                  ? 180
                                  : [
                                        "callerIdPoolWhitelist",
                                        "callerIdPoolBlacklist",
                                        "calleeIdPoolWhitelist",
                                        "calleeIdPoolBlacklist",
                                        "originalCallerIdPoolWhitelist",
                                        "originalCallerIdPoolBlacklist",
                                      ].includes(col.key)
                                    ? 160
                                    : [
                                          "callerIdWhitelist",
                                          "calleeIdWhitelist",
                                          "callerIdBlacklist",
                                          "calleeIdBlacklist",
                                        ].includes(col.key)
                                      ? 140
                                      : 100,
                          }}
                        >
                          {col.key === "check" ? (
                            <Checkbox
                              checked={allRowsChecked}
                              indeterminate={someRowsChecked}
                              onChange={handleCheckAll}
                              size="small"
                              sx={filteringRuleCheckboxSx}
                              disabled={rows.length === 0}
                            />
                          ) : (
                            col.label
                          )}
                        </FilteringRuleTH>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const realIdx = idx;
                      const isChecked = row?.checked || false;
                      const isLastRow = idx === rows.length - 1;
                      const rowBg = getFilteringRuleRowBg(isChecked, realIdx);
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};
                      return (
                        <tr
                          key={row.id || realIdx}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isChecked)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isChecked)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          {NUMBER_FILTER_RULE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={{
                                ...filteringRuleTdStyle,
                                background: rowBg,
                                fontWeight:
                                  col.key === "check" ? undefined : 400,
                                ...(col.key === "check"
                                  ? { borderLeft: "none", width: 36 }
                                  : {}),
                                ...(col.key ===
                                "originalCallerIdPoolBlacklist"
                                  ? { borderRight: "none" }
                                  : {}),
                                ...lastRowCellStyle,
                              }}
                            >
                              {col.key === "check" ? (
                                <Checkbox
                                  checked={isChecked}
                                  onChange={() => handleCheck(realIdx)}
                                  size="small"
                                  disabled={isDeleting}
                                  sx={filteringRuleCheckboxSx}
                                />
                              ) : col.key === "id" ? (
                                realIdx + 1
                              ) : (
                                row[col.key]
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={filteringRuleFooterStyle}>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {rows.length} record
                  {rows.length !== 1 ? "s" : ""}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => {
          if (isLoading) return;
          closeModal();
        }}
        maxWidth={false}
        sx={dialogSx}
        PaperProps={{ sx: paperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={modalTitleStyle}>
          {editIndex !== null
            ? NUMBER_FILTER_RULE_MODAL_TITLE_EDIT
            : NUMBER_FILTER_RULE_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={filteringRuleFormPanelStyle}>
            <FilteringRuleFieldRow
              label="No.:"
              tooltipKey="id"
              tooltips={NUMBER_FILTER_RULE_FIELD_TOOLTIPS}
              labelWidth={240}
              fieldWidth="min(100%, 280px)"
            >
              <input
                type="text"
                name="id"
                value={editIndex !== null ? editIndex + 1 : rows.length + 1}
                disabled
                readOnly
                style={filteringRuleDisabledInputStyle}
              />
            </FilteringRuleFieldRow>
            {FILTERING_RULE_FORM_FIELDS.map((field) => (
              <FilteringRuleFieldRow
                key={field.key}
                label={field.label}
                tooltipKey={field.key}
                tooltips={NUMBER_FILTER_RULE_FIELD_TOOLTIPS}
                labelWidth={240}
                fieldWidth="min(100%, 280px)"
              >
                <select
                  name={field.key}
                  value={form[field.key] || "none"}
                  onChange={handleFormChange}
                  style={filteringRuleSelectStyle}
                  {...filteringRuleInputInteraction}
                >
                  {[
                    ...NUMBER_FILTER_RULE_DROPDOWN_OPTIONS,
                    ...Array.from(
                      new Set(
                        (groupOptions[field.optionsKey] || []).filter(
                          (o) => o !== "none",
                        ),
                      ),
                    ),
                  ].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "none" ? "None" : opt}
                    </option>
                  ))}
                </select>
              </FilteringRuleFieldRow>
            ))}
          </div>
        </DialogContent>
        <DialogActions
          sx={{ p: 0, m: 0 }}
          style={filteringRuleAddNewModalFooterStyle}
        >
          <FilteringRuleBtn
            onClick={handleSave}
            variant="primary"
            style={filteringRuleAddNewModalFooterBtnStyle}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              NUMBER_FILTER_RULE_SAVE_LABEL
            )}
          </FilteringRuleBtn>
          <FilteringRuleBtn
            onClick={closeModal}
            variant="cancel"
            style={filteringRuleAddNewModalFooterCancelBtnStyle}
            disabled={isLoading}
          >
            {NUMBER_FILTER_RULE_CLOSE_LABEL}
          </FilteringRuleBtn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FilteringRule;
