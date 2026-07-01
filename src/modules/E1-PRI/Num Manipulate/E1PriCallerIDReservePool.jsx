import React, { useState } from "react";
import {
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_FIELDS,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_TABLE_COLUMNS,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_INITIAL_FORM,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_FIELD_TOOLTIPS,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_PAGE_BREADCRUMB_ROOT,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_PAGE_BREADCRUMB_SECTION,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_PAGE_TITLE,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_EMPTY_MESSAGE,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_MODAL_TITLE_ADD,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_MODAL_TITLE_EDIT,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_LABEL,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_EMPTY_LABEL,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_DELETE_LABEL,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_CLEAR_ALL_LABEL,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_SAVE_LABEL,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_CLOSE_LABEL,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_NOTE,
} from "../../../constants/E1PriCallerIDReservePoolConstants";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
const NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_DIALOG_MARGIN = 24;
const NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_DIALOG_PAPER_SX = {
  margin: NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width: 500,
  maxWidth: "95vw",
  p: 0,
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};


const RESERVE_POOL_COMPACT_MQ = "(max-width: 768px)";

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

const E1PriFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

const E1PriFieldRow = ({
  label,
  tooltipKey,
  tooltips,
  children,
  labelWidth = 140,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    }}
  >
    <E1PriFieldLabel
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
    </E1PriFieldLabel>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;

const pageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const inputStyle = {
  width: "100%",
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const addHostFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  const Component = component || "button";

  return (
    <Component
      type={type}
      form={form}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {children}
    </Component>
  );
};

const cardStyle = {
  background: "#ffffff",
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const toolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
};

const footerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
};

const selectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const cancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const primaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const modalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const ReservePoolBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>{NUM_MANIPULATE_CALLERID_RESERVE_POOL_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{NUM_MANIPULATE_CALLERID_RESERVE_POOL_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {NUM_MANIPULATE_CALLERID_RESERVE_POOL_PAGE_TITLE}
    </span>
  </div>
);

const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 240,
      padding: 24,
      textAlign: "center",
    }}
  >
    <div
      style={{
        color: "#3E5475",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 16,
      }}
    >
      {message}
    </div>
    <Btn
      variant="cancel"
      onClick={onAddNew}
      style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
    >
      {buttonLabel}
    </Btn>
  </div>
);

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const tableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const CallerIDReservePool = () => {
  const isCompact = useMediaQuery(RESERVE_POOL_COMPACT_MQ);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(
    NUM_MANIPULATE_CALLERID_RESERVE_POOL_INITIAL_FORM,
  );
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [errors, setErrors] = useState({});

  const handleOpenModal = (item = null, index = -1) => {
    setFormData(
      item
        ? { ...item, originalIndex: index }
        : NUM_MANIPULATE_CALLERID_RESERVE_POOL_INITIAL_FORM,
    );
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = () => {
    const newErrors = {};
    NUM_MANIPULATE_CALLERID_RESERVE_POOL_FIELDS.forEach((field) => {
      if (
        !formData[field.name] ||
        formData[field.name].toString().trim() === ""
      ) {
        newErrors[field.name] = `${field.label} is required.`;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    const { originalIndex, ...dataToSave } = formData;
    setRows((prev) => {
      if (originalIndex !== undefined && originalIndex > -1) {
        const updated = [...prev];
        updated[originalIndex] = dataToSave;
        return updated;
      }
      return [...prev, dataToSave];
    });
    setIsModalOpen(false);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };

  const allRowsChecked = rows.length > 0 && selected.length === rows.length;
  const someRowsChecked = selected.length > 0 && !allRowsChecked;

  const handleCheckAll = () => {
    setSelected(allRowsChecked ? [] : rows.map((_, idx) => idx));
  };

  const handleDelete = () => {
    setRows(rows.filter((_, idx) => !selected.includes(idx)));
    setSelected([]);
  };

  const handleClearAll = () => {
    setRows([]);
    setSelected([]);
  };

  const isEditMode =
    formData.originalIndex !== undefined && formData.originalIndex > -1;

  return (
    <div
      style={{
        ...pageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={pageInnerStyle}>
        <ReservePoolBreadcrumb />

        <div style={cardStyle}>
          <div
            style={{
              ...toolbarStyle,
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
                <span style={selectedBadgeStyle}>
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
                onClick={handleDelete}
                disabled={selected.length === 0}
                style={cancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {NUM_MANIPULATE_CALLERID_RESERVE_POOL_DELETE_LABEL}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rows.length === 0}
                style={cancelBtnStyle}
              >
                {NUM_MANIPULATE_CALLERID_RESERVE_POOL_CLEAR_ALL_LABEL}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                style={primaryBtnStyle}
              >
                {NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_LABEL}
              </Btn>
            </div>
          </div>

          {rows.length === 0 ? (
            <TableListEmptyState
              message={NUM_MANIPULATE_CALLERID_RESERVE_POOL_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
              buttonLabel={NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_EMPTY_LABEL}
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
                    minWidth: 480,
                  }}
                >
                  <thead>
                    <tr>
                      <TH
                        style={{
                          width: 40,
                          padding: 0,
                          borderLeft: "none",
                        }}
                      >
                        <Checkbox
                          checked={allRowsChecked}
                          indeterminate={someRowsChecked}
                          onChange={handleCheckAll}
                          size="small"
                          sx={tableCheckboxSx}
                          disabled={rows.length === 0}
                        />
                      </TH>
                      {NUM_MANIPULATE_CALLERID_RESERVE_POOL_TABLE_COLUMNS.filter(
                        (col) => col.key !== "check" && col.key !== "modify",
                      ).map((col) => (
                        <TH key={col.key}>{col.label}</TH>
                      ))}
                      <TH style={{ width: 70, borderRight: "none" }}>
                        {NUM_MANIPULATE_CALLERID_RESERVE_POOL_TABLE_COLUMNS.find(
                          (col) => col.key === "modify",
                        )?.label || "Modify"}
                      </TH>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const isChecked = selected.includes(idx);
                      const isLastRow = idx === rows.length - 1;
                      const rowBg = isChecked
                        ? "#eff6ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};

                      return (
                        <tr
                          key={idx}
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
                              checked={isChecked}
                              onChange={() => handleSelectRow(idx)}
                              size="small"
                              sx={tableCheckboxSx}
                            />
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.no}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.callerId}
                          </td>
                          <td
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
                                onClick={() => handleOpenModal(row, idx)}
                                style={{
                                  cursor: "pointer",
                                  color: "#2563eb",
                                  fontSize: 22,
                                  opacity: 0.7,
                                  transition: "opacity 0.15s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = "1";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = "0.7";
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={footerStyle}>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {rows.length} record
                  {rows.length !== 1 ? "s" : ""}
                </span>
              </div>
            </>
          )}
        </div>

        <p
          style={{
            color: C.amber,
            fontSize: 11,
            lineHeight: 1.5,
            margin: "16px 0 0",
            padding: "0 4px",
            textAlign: "center",
          }}
        >
          {NUM_MANIPULATE_CALLERID_RESERVE_POOL_NOTE}
        </p>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        sx={NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_DIALOG_PAPER_SX,
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
            textAlign: "center",
            padding: "16px 24px",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            flexShrink: 0,
          }}
        >
          {isEditMode
            ? NUM_MANIPULATE_CALLERID_RESERVE_POOL_MODAL_TITLE_EDIT
            : NUM_MANIPULATE_CALLERID_RESERVE_POOL_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={addHostFormPanelStyle}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {NUM_MANIPULATE_CALLERID_RESERVE_POOL_FIELDS.map((field) => (
                  <E1PriFieldRow
                    key={field.name}
                    label={field.label}
                    tooltipKey={field.name}
                    tooltips={NUM_MANIPULATE_CALLERID_RESERVE_POOL_FIELD_TOOLTIPS}
                  >
                    <div style={{ width: "100%" }}>
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={formData[field.name] ?? ""}
                        onChange={handleInputChange}
                        min={field.min}
                        style={{
                          ...inputStyle,
                          ...(errors[field.name]
                            ? {
                                borderColor: C.amber,
                                boxShadow: "0 0 0 2px rgba(220, 38, 38, 0.12)",
                              }
                            : {}),
                        }}
                        {...inputInteraction}
                      />
                      {errors[field.name] && (
                        <div
                          style={{
                            color: C.amber,
                            fontSize: 11,
                            marginTop: 4,
                            textAlign: "left",
                          }}
                        >
                          {errors[field.name]}
                        </div>
                      )}
                    </div>
                  </E1PriFieldRow>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: `1px solid ${C.cardBorder}`,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Btn
            onClick={handleSave}
            variant="primary"
            style={{ minWidth: 110, height: 34, fontSize: 13 }}
          >
            {NUM_MANIPULATE_CALLERID_RESERVE_POOL_SAVE_LABEL}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            variant="cancel"
            style={{ ...modalCancelBtnStyle, height: 34 }}
          >
            {NUM_MANIPULATE_CALLERID_RESERVE_POOL_CLOSE_LABEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CallerIDReservePool;
