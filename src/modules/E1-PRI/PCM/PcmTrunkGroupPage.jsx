import React from "react";
import { FOCUS_RING_SHADOW } from "../../../theme/pbxTokens";
import {
  PCM_TRUNK_GROUP_FIELDS,
  PCM_TRUNK_GROUP_INITIAL_FORM,
  PCM_TRUNK_GROUP_TABLE_COLUMNS,
  PCM_TRUNK_GROUP_FIELD_TOOLTIPS,
  PCM_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT,
  PCM_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION,
  PCM_TRUNK_GROUP_PAGE_TITLE,
  PCM_TRUNK_GROUP_EMPTY_MESSAGE,
  PCM_TRUNK_GROUP_MODAL_TITLE_ADD,
  PCM_TRUNK_GROUP_MODAL_TITLE_EDIT,
  PCM_TRUNK_GROUP_ADD_NEW_LABEL,
  PCM_TRUNK_GROUP_DELETE_LABEL,
  PCM_TRUNK_GROUP_SAVE_LABEL,
  PCM_TRUNK_GROUP_CLOSE_LABEL,
} from "../../../constants/PcmTrunkGroupConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Checkbox,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { usePcmTrunkGroupPage } from "./hooks/usePcmTrunkGroupPage";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as PcmTrunkGroupBreadcrumb,
  ExtensionPagination as PcmTrunkGroupPagination,
  ExtensionTableListLoading as TableListLoading,
  ExtensionTableListEmptyState as TableListEmptyState,
  extensionPageWrapStyle as pcmTrunkGroupPageWrapStyle,
  extensionPageInnerStyle as pcmTrunkGroupPageInnerStyle,
  extensionCardStyle as pcmTrunkGroupCardStyle,
  extensionToolbarStyle as pcmTrunkGroupToolbarStyle,
  extensionSelectedBadgeStyle as pcmTrunkGroupSelectedBadgeStyle,
  extensionCancelBtnStyle as pcmTrunkGroupCancelBtnStyle,
  extensionPrimaryBtnStyle as pcmTrunkGroupPrimaryBtnStyle,
  extensionFixedAlertSx as pcmTrunkGroupFixedAlertSx,
  extensionTableCheckboxSx as checkboxSx,
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
} from "../../../components/common";
import { C } from "../../../theme/pbxTokens";
import {
  pcmTrunkGroupEditIconStyle,
  handlePcmTrunkGroupEditIconHover,
  getPcmTrunkGroupRowBg,
} from "./components/PcmTrunkGroupTableHelpers";

/* Page-local styles/helpers preserved from monolith */
const PCM_TRUNK_GROUP_COMPACT_MQ = "(max-width: 768px)";

const PCM_TRUNK_GROUP_ADD_NEW_DIALOG_MARGIN = 24;
const PCM_TRUNK_GROUP_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const PCM_TRUNK_GROUP_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const PCM_TRUNK_GROUP_ADD_NEW_DIALOG_PAPER_SX = {
  margin: PCM_TRUNK_GROUP_ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${PCM_TRUNK_GROUP_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${PCM_TRUNK_GROUP_ADD_NEW_DIALOG_MARGIN * 2}px)`,
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

const PcmTrunkGroupFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

// ── Color palette (matches Extensions) ────────────────────────────────────────

const addNewModalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "16px 24px",
  boxSizing: "border-box",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const pcmTrunkGroupModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
  borderRadius: 4,
};

const PCM_TRUNK_GROUP_OUTLINED_BORDER = "#d1d5db";
const PCM_TRUNK_GROUP_OUTLINED_HOVER = "#9ca3af";
const PCM_TRUNK_GROUP_OUTLINED_FOCUS = "#3E5475";
const PCM_TRUNK_GROUP_FOCUS_RING_SHADOW =
  "0 0 0 2px rgba(62, 84, 117, 0.15)";

const pcmTrunkGroupSetFieldDefault = (el) => {
  el.style.borderColor = PCM_TRUNK_GROUP_OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const pcmTrunkGroupSetFieldHover = (el) => {
  el.style.borderColor = PCM_TRUNK_GROUP_OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const pcmTrunkGroupSetFieldFocus = (el) => {
  el.style.borderColor = PCM_TRUNK_GROUP_OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = PCM_TRUNK_GROUP_FOCUS_RING_SHADOW;
};

const pcmTrunkGroupInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    pcmTrunkGroupSetFieldFocus(e.target);
  },
  onBlur: (e) => {
    pcmTrunkGroupSetFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      pcmTrunkGroupSetFieldFocus(e.target);
    } else {
      pcmTrunkGroupSetFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      pcmTrunkGroupSetFieldFocus(e.target);
    } else {
      pcmTrunkGroupSetFieldDefault(e.target);
    }
  },
};

const pcmTrunkGroupInputStyle = {
  width: "100%",
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${PCM_TRUNK_GROUP_OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const pcmTrunkGroupSelectStyle = {
  ...pcmTrunkGroupInputStyle,
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
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
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
  "& .MuiOutlinedInput-input": { backgroundColor: "#fff" },
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

const pcmTrunkGroupModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

const pcmTrunkGroupTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

// const LOCAL_STORAGE_KEY = 'pcmTrunkGroups';

const PcmTrunkGroupPage = () => {
  const vm = usePcmTrunkGroupPage();
  const {
    groups,
    isModalOpen,
    formData,
    setFormData,
    selected,
    page,
    setPage,
    spansData,
    isLoadingSpans,
    isSaving,
    isLoadingData,
    message,
    setMessage,
    isCompact,
    tableScrollRef,
    itemsPerPage,
    totalPages,
    pagedGroups,
    handleOpenModal,
    isSpanAvailable,
    handleCloseModal,
    handleInputChange,
    handleTrunkCheckbox,
    handleCheckAll,
    handleUncheckAll,
    handleSave,
    handleSelectRow,
    allPageSelected,
    somePageSelected,
    handleToggleAll,
    handleInverse,
    handleDeleteSelected,
    handleClearAll,
  } = vm;

  return (
    <div
      style={{
        ...pcmTrunkGroupPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          sx={pcmTrunkGroupFixedAlertSx}
        >
          {message.text}
        </Alert>
      )}

      <div style={pcmTrunkGroupPageInnerStyle}>
        <PcmTrunkGroupBreadcrumb
          root={PCM_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT}
          section={PCM_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION}
          current={PCM_TRUNK_GROUP_PAGE_TITLE}
        />

        <div style={pcmTrunkGroupCardStyle}>
          <div
            style={{
              ...pcmTrunkGroupToolbarStyle,
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
                <span style={pcmTrunkGroupSelectedBadgeStyle}>
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
                disabled={isLoadingData || groups.length === 0}
                style={pcmTrunkGroupCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={isLoadingData || groups.length === 0}
                style={pcmTrunkGroupCancelBtnStyle}
              >
                {isLoadingData ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Clear All"
                )}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDeleteSelected}
                disabled={isLoadingData || selected.length === 0}
                style={pcmTrunkGroupCancelBtnStyle}
              >
                {isLoadingData ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    {PCM_TRUNK_GROUP_DELETE_LABEL}
                  </>
                )}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={isLoadingSpans}
                style={pcmTrunkGroupPrimaryBtnStyle}
              >
                {PCM_TRUNK_GROUP_ADD_NEW_LABEL}
              </Btn>
            </div>
          </div>

          {isLoadingData ? (
            <TableListLoading />
          ) : groups.length === 0 ? (
            <TableListEmptyState
              message={PCM_TRUNK_GROUP_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
            />
          ) : (
            <>
              <div
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  flex: 1,
                }}
              >
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
                      <TH
                        style={{
                          width: 40,
                          padding: 0,
                          borderLeft: "none",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={allPageSelected}
                          indeterminate={somePageSelected}
                          onChange={handleToggleAll}
                          sx={pcmTrunkGroupTableCheckboxSx}
                        />
                      </TH>
                      {PCM_TRUNK_GROUP_TABLE_COLUMNS.filter(
                        (c) => c.key !== "check",
                      ).map((c) => (
                        <TH
                          key={c.key}
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 10,
                            ...(c.key === "modify" ? { borderRight: "none" } : {}),
                          }}
                        >
                          {c.label}
                        </TH>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedGroups.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isRowChecked = selected.includes(realIdx);
                      const isLastRow = idx === pagedGroups.length - 1;
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
                          key={realIdx}
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
                              width: 36,
                              borderLeft: "none",
                              ...lastRowCellStyle,
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isRowChecked}
                              onChange={() => handleSelectRow(realIdx)}
                              disabled={isLoadingData}
                              sx={pcmTrunkGroupTableCheckboxSx}
                            />
                          </td>

                          {PCM_TRUNK_GROUP_TABLE_COLUMNS.filter(
                            (col) => col.key !== "check",
                          ).map((col) => {
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
                                        if (!isLoadingData) {
                                          handleOpenModal(item, realIdx);
                                        }
                                      }}
                                      style={{
                                        cursor: isLoadingData
                                          ? "not-allowed"
                                          : "pointer",
                                        color: "#2563eb",
                                        fontSize: 22,
                                        opacity: isLoadingData ? 0.4 : 0.7,
                                        transition: "opacity 0.15s ease",
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!isLoadingData)
                                          e.currentTarget.style.opacity = "1";
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!isLoadingData)
                                          e.currentTarget.style.opacity = "0.7";
                                      }}
                                    />
                                  </div>
                                </td>
                              );
                            }
                            if (col.key === "pstnIds") {
                              return (
                                <td
                                  key={col.key}
                                  style={{
                                    ...tdStyle,
                                    background: rowBg,
                                    ...lastRowCellStyle,
                                  }}
                                >
                                  {item.pstnIds && item.pstnIds.length > 0 ? (
                                    item.pstnIds.join(", ")
                                  ) : (
                                    <span style={{ color: C.mutedText }}>
                                      —
                                    </span>
                                  )}
                                </td>
                              );
                            }
                            return (
                              <td
                                key={col.key}
                                style={{
                                  ...tdStyle,
                                  background: rowBg,
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

              {groups.length > 0 && (
                <PcmTrunkGroupPagination
                  page={page}
                  totalPages={totalPages}
                  recordCount={pagedGroups.length}
                  recordLabel="PCM trunk group"
                  onPageChange={(p) => setPage(p)}
                />
              )}
            </>
          )}
        </div>
      </div>
      {/* Modal Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        sx={PCM_TRUNK_GROUP_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: PCM_TRUNK_GROUP_ADD_NEW_DIALOG_PAPER_SX,
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
          {formData.originalIndex !== undefined
            ? PCM_TRUNK_GROUP_MODAL_TITLE_EDIT
            : PCM_TRUNK_GROUP_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={pcmTrunkGroupModalFormPanelStyle}>
            {PCM_TRUNK_GROUP_FIELDS.map((field) => (
              <div
                key={field.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <PcmTrunkGroupFieldLabel
                  tooltipKey={field.name}
                  tooltips={PCM_TRUNK_GROUP_FIELD_TOOLTIPS}
                  style={{
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    width: 170,
                    flexShrink: 0,
                    textAlign: "left",
                    display: "inline-block",
                  }}
                >
                  {field.label}:
                </PcmTrunkGroupFieldLabel>
                <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      style={pcmTrunkGroupSelectStyle}
                      {...pcmTrunkGroupInputInteraction}
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
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      placeholder={field.placeholder || ""}
                      style={pcmTrunkGroupInputStyle}
                      {...pcmTrunkGroupInputInteraction}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* PCM Trunks Block */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: "12px",
                gap: 8,
                marginTop: 4,
              }}
            >
              {/* Warning message for multiple trunk selection */}
              {formData.pstnIds && formData.pstnIds.length > 1 && (
                <div
                  style={{
                    padding: "8px 12px",
                    background: "#fffbeb",
                    border: "1px solid #fef3c7",
                    borderRadius: 6,
                    color: "#b45309",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  <strong>Note:</strong> You have selected{" "}
                  {formData.pstnIds.length} PSTN IDs. This will create{" "}
                  {formData.pstnIds.length} separate groups, each with a unique
                  Group ID.
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <PcmTrunkGroupFieldLabel
                  tooltipKey="pstnIds"
                  tooltips={PCM_TRUNK_GROUP_FIELD_TOOLTIPS}
                  style={{
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    width: 160,
                    marginTop: 2,
                    display: "inline-block",
                  }}
                >
                  PCM Trunks:
                </PcmTrunkGroupFieldLabel>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 2,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.labelText,
                      cursor: "pointer",
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={(() => {
                        const isEditing = formData.originalIndex !== undefined;
                        const availableSpans = spansData.filter((span) =>
                          isSpanAvailable(
                            span.spanNo,
                            isEditing,
                            formData.originalIndex,
                          ),
                        );
                        return (
                          availableSpans.length > 0 &&
                          formData.pstnIds &&
                          formData.pstnIds.length === availableSpans.length
                        );
                      })()}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const isEditing =
                            formData.originalIndex !== undefined;
                          const availableSpans = spansData
                            .filter((span) =>
                              isSpanAvailable(
                                span.spanNo,
                                isEditing,
                                formData.originalIndex,
                              ),
                            )
                            .map((span) => String(span.spanNo));
                          setFormData((prev) => ({
                            ...prev,
                            pstnIds: availableSpans,
                          }));
                        } else {
                          setFormData((prev) => ({ ...prev, pstnIds: [] }));
                        }
                      }}
                      sx={{
                        padding: "2px",
                        color: "#64748b",
                        "&.Mui-checked": { color: "#0284c7" },
                      }}
                    />
                    Check All
                  </label>
                  <span
                    style={{
                      fontSize: 10.5,
                      color: C.mutedText,
                      marginTop: 2,
                    }}
                  >
                    Selects all available PSTN spans
                    {(() => {
                      const isEditing = formData.originalIndex !== undefined;
                      const availableCount = spansData.filter((span) =>
                        isSpanAvailable(
                          span.spanNo,
                          isEditing,
                          formData.originalIndex,
                        ),
                      ).length;
                      const usedCount = spansData.length - availableCount;
                      return (
                        <span style={{ marginLeft: 4 }}>
                          ({availableCount} available
                          {usedCount > 0 ? `, ${usedCount} used` : ""})
                        </span>
                      );
                    })()}
                  </span>
                  {formData.pstnIds && formData.pstnIds.length > 1 && (
                    <span
                      style={{
                        fontSize: 10.5,
                        color: "#0284c7",
                        fontWeight: 600,
                        marginTop: 2,
                      }}
                    >
                      Will create {formData.pstnIds.length} separate groups
                    </span>
                  )}
                </div>
              </div>
              {/* Spans checklist grid */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 8,
                  padding: "8px 0 0 0",
                }}
              >
                {isLoadingSpans ? (
                  <div style={{ fontSize: 12, color: C.mutedText }}>
                    Loading spans...
                  </div>
                ) : spansData.length > 0 ? (
                  spansData.map((span) => {
                    const isEditing = formData.originalIndex !== undefined;
                    const isAvailable = isSpanAvailable(
                      span.spanNo,
                      isEditing,
                      formData.originalIndex,
                    );
                    const isChecked =
                      formData.pstnIds &&
                      formData.pstnIds.includes(String(span.spanNo));
                    const isUsed = !isAvailable && !isChecked;

                    return (
                      <label
                        key={span.spanNo}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: isChecked ? "#f0f9ff" : "#ffffff",
                          border: `1px solid ${
                            isChecked ? "#0284c7" : C.cardBorder
                          }`,
                          borderRadius: 6,
                          padding: "2px 8px",
                          cursor: isAvailable ? "pointer" : "not-allowed",
                          opacity: isAvailable ? 1 : 0.6,
                          fontSize: 12,
                          fontWeight: 600,
                          color: isUsed ? C.errorRed : C.labelText,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          disabled={!isAvailable}
                          onChange={() =>
                            handleTrunkCheckbox(String(span.spanNo))
                          }
                          sx={{
                            padding: "2px",
                            color: "#64748b",
                            "&.Mui-checked": { color: "#0284c7" },
                          }}
                        />
                        <span style={{ marginLeft: 4 }}>
                          {span.spanNo}
                          {isUsed && (
                            <span
                              style={{
                                fontSize: 10,
                                color: C.errorRed,
                                marginLeft: 4,
                              }}
                            >
                              (used)
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <div style={{ fontSize: 12, color: C.mutedText }}>
                    No spans available
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            style={addNewModalFooterBtnStyle}
          >
            {isSaving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              PCM_TRUNK_GROUP_SAVE_LABEL
            )}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={isSaving}
            style={pcmTrunkGroupModalCancelBtnStyle}
          >
            {PCM_TRUNK_GROUP_CLOSE_LABEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmTrunkGroupPage;
