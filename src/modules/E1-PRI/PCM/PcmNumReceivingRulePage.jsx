import React from "react";
import { FOCUS_RING_SHADOW } from "../../../theme/pbxTokens";
import {
  PCM_NUM_RECEIVING_RULE_FIELDS,
  PCM_NUM_RECEIVING_RULE_INITIAL_FORM,
  PCM_NUM_RECEIVING_RULE_TABLE_COLUMNS,
  PCM_NUM_RECEIVING_RULE_FIELD_TOOLTIPS,
  PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_ROOT,
  PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_SECTION,
  PCM_NUM_RECEIVING_RULE_PAGE_TITLE,
  PCM_NUM_RECEIVING_RULE_EMPTY_MESSAGE,
  PCM_NUM_RECEIVING_RULE_MODAL_TITLE_ADD,
  PCM_NUM_RECEIVING_RULE_MODAL_TITLE_EDIT,
  PCM_NUM_RECEIVING_RULE_ADD_NEW_LABEL,
  PCM_NUM_RECEIVING_RULE_DELETE_LABEL,
  PCM_NUM_RECEIVING_RULE_SAVE_LABEL,
  PCM_NUM_RECEIVING_RULE_CLOSE_LABEL,
} from "../../../constants/PcmNumReceivingRuleConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Checkbox,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { usePcmNumReceivingRulePage } from "./hooks/usePcmNumReceivingRulePage";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as PcmNumRecvRuleBreadcrumb,
  ExtensionPagination as PcmNumRecvRulePagination,
  ExtensionTableListLoading as TableListLoading,
  ExtensionTableListEmptyState as TableListEmptyState,
  extensionTableCheckboxSx as checkboxSx,
  extensionPageWrapStyle as pcmNumRecvRulePageWrapStyle,
  extensionPageInnerStyle as pcmNumRecvRulePageInnerStyle,
  extensionCardStyle as pcmNumRecvRuleCardStyle,
  extensionToolbarStyle as pcmNumRecvRuleToolbarStyle,
  extensionPaginationStyle as pcmNumRecvRulePaginationStyle,
  extensionSelectedBadgeStyle as pcmNumRecvRuleSelectedBadgeStyle,
  extensionCancelBtnStyle as pcmNumRecvRuleCancelBtnStyle,
  extensionPrimaryBtnStyle as pcmNumRecvRulePrimaryBtnStyle,
  extensionPageBadgeStyle as pcmNumRecvRulePageBadgeStyle,
  extensionFixedAlertSx as pcmNumRecvRuleFixedAlertSx,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  extensionModalCancelBtnStyle as pcmNumRecvRuleModalCancelBtnStyle,
} from "../../../components/common";
import { C } from "../../../theme/pbxTokens";
import {
  pcmNumReceivingRuleEditIconStyle,
  handlePcmNumReceivingRuleEditIconHover,
  getPcmNumReceivingRuleRowBg,
} from "./components/PcmNumReceivingRuleTableHelpers";

/* Page-local styles/helpers preserved from monolith */
const PCM_NUM_RECEIVING_RULE_COMPACT_MQ = "(max-width: 768px)";

const PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_MARGIN = 24;
const PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_PAPER_SX = {
  margin: PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width: 500,
  maxWidth: "95vw",
  p: 0,
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};
// ── Page-local field label tooltip UI (not shared) ──
const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const PcmNumReceivingRuleFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const PcmNumReceivingRuleFieldRow = ({
  label,
  tooltipKey,
  tooltips,
  children,
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}
  >
    <PcmNumReceivingRuleFieldLabel
      tooltipKey={tooltipKey}
      tooltips={tooltips}
      style={{
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        display: "inline-block",
      }}
    >
      {label}
    </PcmNumReceivingRuleFieldLabel>
    <div style={{ flex: 1, minWidth: 0, width: "100%" }}>{children}</div>
  </div>
);

const PCM_NUM_RECV_RULE_OUTLINED_BORDER = "#d1d5db";
const PCM_NUM_RECV_RULE_OUTLINED_HOVER = "#9ca3af";
const PCM_NUM_RECV_RULE_OUTLINED_FOCUS = "#3E5475";
const PCM_NUM_RECV_RULE_FOCUS_RING_SHADOW =
  "0 0 0 2px rgba(62, 84, 117, 0.15)";

const pcmNumRecvRuleSetFieldDefault = (el) => {
  el.style.borderColor = PCM_NUM_RECV_RULE_OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const pcmNumRecvRuleSetFieldHover = (el) => {
  el.style.borderColor = PCM_NUM_RECV_RULE_OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const pcmNumRecvRuleSetFieldFocus = (el) => {
  el.style.borderColor = PCM_NUM_RECV_RULE_OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = PCM_NUM_RECV_RULE_FOCUS_RING_SHADOW;
};

const pcmNumRecvRuleInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    pcmNumRecvRuleSetFieldFocus(e.target);
  },
  onBlur: (e) => {
    pcmNumRecvRuleSetFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      pcmNumRecvRuleSetFieldFocus(e.target);
    } else {
      pcmNumRecvRuleSetFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      pcmNumRecvRuleSetFieldFocus(e.target);
    } else {
      pcmNumRecvRuleSetFieldDefault(e.target);
    }
  },
};

const pcmNumRecvRuleInputStyle = {
  width: "100%",
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${PCM_NUM_RECV_RULE_OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const pcmNumRecvRuleSelectStyle = {
  ...pcmNumRecvRuleInputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
};

// ── Local modal field UI (inlined from e1PriSharedUi) ──
const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

const modalTextFieldSx = {
  ...muiTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
  },
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
  },
};

const modalSelectSx = {
  ...muiSelectSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "#fff",
  },
};

const pcmNumReceivingRuleModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

const PcmNumReceivingRulePage = () => {
  const vm = usePcmNumReceivingRulePage();
  const {
    rules,
    selected,
    showModal,
    form,
    editIndex,
    loading,
    message,
    setMessage,
    page,
    isCompact,
    itemsPerPage,
    totalPages,
    pagedRules,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleSave,
    handleDelete,
    handleClearAll,
    handleSelectRow,
    handleCheckAllRows,
    handleUncheckAllRows,
    handleInverse,
    handlePageChange,
  } = vm;

  return (
    <div
      style={{
        ...pcmNumRecvRulePageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={pcmNumRecvRulePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={pcmNumRecvRuleFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <PcmNumRecvRuleBreadcrumb
          root={PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_ROOT}
          section={PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_SECTION}
          current={PCM_NUM_RECEIVING_RULE_PAGE_TITLE}
        />

        <div style={pcmNumRecvRuleCardStyle}>
          <div
            style={{
              ...pcmNumRecvRuleToolbarStyle,
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
              {selected.length > 0 && (
                <span style={pcmNumRecvRuleSelectedBadgeStyle}>
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
                disabled={loading.delete || loading.fetch || rules.length === 0}
                style={pcmNumRecvRuleCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                style={pcmNumRecvRuleCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {PCM_NUM_RECEIVING_RULE_DELETE_LABEL}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.delete || loading.fetch || rules.length === 0}
                style={pcmNumRecvRuleCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Clear All"
                )}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.save || loading.fetch}
                style={pcmNumRecvRulePrimaryBtnStyle}
              >
                {PCM_NUM_RECEIVING_RULE_ADD_NEW_LABEL}
              </Btn>
            </div>
          </div>

          {loading.fetch ? (
            <TableListLoading />
          ) : rules.length === 0 ? (
            <TableListEmptyState
              message={PCM_NUM_RECEIVING_RULE_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
            />
          ) : (
            <>
              <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                    minWidth: 900,
                    ...(isCompact ? { minWidth: 720 } : {}),
                  }}
                >
                  <thead>
                    <tr>
                      <TH style={{ width: 40, padding: 0, borderLeft: "none" }}>
                        <Checkbox
                          size="small"
                          checked={
                            pagedRules.length > 0 &&
                            pagedRules.every((_, idx) =>
                              selected.includes(
                                (page - 1) * itemsPerPage + idx,
                              ),
                            )
                          }
                          indeterminate={
                            pagedRules.some((_, idx) =>
                              selected.includes(
                                (page - 1) * itemsPerPage + idx,
                              ),
                            ) &&
                            !pagedRules.every((_, idx) =>
                              selected.includes(
                                (page - 1) * itemsPerPage + idx,
                              ),
                            )
                          }
                          onChange={() => {
                            const allSelected = pagedRules.every((_, idx) =>
                              selected.includes(
                                (page - 1) * itemsPerPage + idx,
                              ),
                            );
                            if (allSelected) handleUncheckAllRows();
                            else handleCheckAllRows();
                          }}
                          sx={checkboxSx}
                        />
                      </TH>
                      {PCM_NUM_RECEIVING_RULE_TABLE_COLUMNS.filter(
                        (c) => c.key !== "check",
                      ).map((c) => (
                        <TH
                          key={c.key}
                          style={
                            c.key === "modify"
                              ? { width: 70, borderRight: "none" }
                              : undefined
                          }
                        >
                          {c.label}
                        </TH>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const globalIndex = realIdx + 1;
                      const isRowChecked = selected.includes(realIdx);
                      const isLastRow = idx === pagedRules.length - 1;
                      const rowBg = isRowChecked
                        ? "#eff6ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};

                      return (
                        <tr
                          key={item.id || realIdx}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isRowChecked)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isRowChecked)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              borderLeft: "none",
                              width: 36,
                              ...lastRowCellStyle,
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isRowChecked}
                              onChange={() => handleSelectRow(realIdx)}
                              disabled={loading.delete}
                              sx={checkboxSx}
                            />
                          </td>
                          {PCM_NUM_RECEIVING_RULE_TABLE_COLUMNS.filter(
                            (col) => col.key !== "check",
                          ).map((col) => {
                            if (col.key === "index") {
                              return (
                                <td
                                  key={col.key}
                                  style={{
                                    ...tdStyle,
                                    background: rowBg,
                                    fontWeight: 400,
                                    ...lastRowCellStyle,
                                  }}
                                >
                                  {globalIndex}
                                </td>
                              );
                            }
                            if (col.key === "modify") {
                              return (
                                <td
                                  key={col.key}
                                  style={{
                                    ...tdStyle,
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
                                      onClick={() => {
                                        if (!loading.delete) {
                                          handleOpenModal(item, realIdx);
                                        }
                                      }}
                                      style={{
                                        cursor: loading.delete
                                          ? "not-allowed"
                                          : "pointer",
                                        color: "#2563eb",
                                        fontSize: 22,
                                        opacity: loading.delete ? 0.4 : 0.7,
                                        transition: "opacity 0.15s ease",
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!loading.delete)
                                          e.currentTarget.style.opacity = "1";
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!loading.delete)
                                          e.currentTarget.style.opacity = "0.7";
                                      }}
                                    />
                                  </div>
                                </td>
                              );
                            }
                            return (
                              <td
                                key={col.key}
                                style={{
                                  ...tdStyle,
                                  background: rowBg,
                                  fontWeight: 400,
                                  ...lastRowCellStyle,
                                }}
                              >
                                {item[col.key] !== undefined &&
                                item[col.key] !== "" ? (
                                  item[col.key]
                                ) : (
                                  <span style={{ color: C.mutedText }}>—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <PcmNumRecvRulePagination
                page={page}
                totalPages={totalPages}
                recordCount={pagedRules.length}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>

        {rules.length > 0 && (
          <div
            style={{
              fontSize: 11,
              color: C.amber,
              marginTop: 12,
              textAlign: "center",
            }}
          >
            Rule: "x"(lowercase) indicates a random number, "*" indicates
            multiple random characters.
          </div>
        )}
      </div>

      <Dialog
        open={showModal}
        onClose={() => {
          if (loading.save) return;
          handleCloseModal();
        }}
        maxWidth={false}
        sx={PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_PAPER_SX,
        }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: 16,
            padding: "16px 24px",
            textAlign: "center",
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            flexShrink: 0,
          }}
        >
          {editIndex !== null
            ? PCM_NUM_RECEIVING_RULE_MODAL_TITLE_EDIT
            : PCM_NUM_RECEIVING_RULE_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={pcmNumReceivingRuleModalFormPanelStyle}>
            {PCM_NUM_RECEIVING_RULE_FIELDS.map((field) => (
              <PcmNumReceivingRuleFieldRow
                key={field.name}
                label={`${field.label}:`}
                tooltipKey={field.name}
                tooltips={PCM_NUM_RECEIVING_RULE_FIELD_TOOLTIPS}
              >
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={form[field.name]}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    style={pcmNumRecvRuleSelectStyle}
                    {...pcmNumRecvRuleInputInteraction}
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={form[field.name] || ""}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    placeholder={field.placeholder || ""}
                    style={pcmNumRecvRuleInputStyle}
                    {...pcmNumRecvRuleInputInteraction}
                  />
                )}
              </PcmNumReceivingRuleFieldRow>
            ))}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              PCM_NUM_RECEIVING_RULE_SAVE_LABEL
            )}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={pcmNumRecvRuleModalCancelBtnStyle}
          >
            {PCM_NUM_RECEIVING_RULE_CLOSE_LABEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmNumReceivingRulePage;
