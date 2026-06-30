import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Tooltip,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  NUM_MANIPULATE_CALLERID_POOL_TABLE_COLUMNS,
  NUM_MANIPULATE_CALLERID_POOL_MODAL_FIELDS,
  NUM_MANIPULATE_CALLERID_POOL_INITIAL_FORM,
  NUM_MANIPULATE_CALLERID_POOL_FIELD_TOOLTIPS,
  NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS,
  NUM_MANIPULATE_CALLERID_POOL_PAGE_BREADCRUMB_ROOT,
  NUM_MANIPULATE_CALLERID_POOL_PAGE_BREADCRUMB_SECTION,
  NUM_MANIPULATE_CALLERID_POOL_PAGE_TITLE,
  NUM_MANIPULATE_CALLERID_POOL_IP_PSTN_PANEL_TITLE,
  NUM_MANIPULATE_CALLERID_POOL_PSTN_IP_PANEL_TITLE,
  NUM_MANIPULATE_CALLERID_POOL_MODAL_TITLE,
  NUM_MANIPULATE_CALLERID_POOL_ADD_NEW_LABEL,
  NUM_MANIPULATE_CALLERID_POOL_DELETE_LABEL,
  NUM_MANIPULATE_CALLERID_POOL_CLEAR_ALL_LABEL,
  NUM_MANIPULATE_CALLERID_POOL_SAVE_LABEL,
  NUM_MANIPULATE_CALLERID_POOL_CLOSE_LABEL,
  NUM_MANIPULATE_CALLERID_POOL_SET_LABEL,
  NUM_MANIPULATE_CALLERID_POOL_NOTE,
} from "../../../constants/E1PriCallerIDPoolConstants";
import { addNewDialogSx, mergeAddNewDialogPaperSx } from "../../../utils/addNewDialogSx";

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
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
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
        whiteSpace: "normal",
        lineHeight: 1.2,
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
  cardShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

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

const selectStyle = {
  ...inputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
};

const addHostFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: FIELD_RADIUS,
  padding: 20,
};

const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

const panelCardStyle = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
};

const panelToolbarStyle = {
  minHeight: 44,
  padding: "10px 16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
  background: C.cardBg,
  borderBottom: `1px solid ${C.divider}`,
};

const panelSectionTitleStyle = {
  fontSize: 14,
  fontWeight: 500,
  color: C.labelText,
  letterSpacing: "-0.01em",
};

const panelFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 16px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
};

const topControlsCardStyle = {
  ...panelCardStyle,
  marginBottom: 16,
  flex: "none",
};

const topControlsBodyStyle = {
  padding: "16px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const CallerIDPoolBreadcrumb = () => (
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
      flexShrink: 0,
    }}
  >
    <span>{NUM_MANIPULATE_CALLERID_POOL_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{NUM_MANIPULATE_CALLERID_POOL_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {NUM_MANIPULATE_CALLERID_POOL_PAGE_TITLE}
    </span>
  </div>
);

const AdvancedPageShell = ({ children }) => (
  <div style={advancedPageWrapStyle}>
    <div style={advancedPageInnerStyle}>{children}</div>
  </div>
);

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
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
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
        padding:
          variant === "primary" || variant === "cancel"
            ? "8px 32px"
            : "6px 14px",
        borderRadius: 8,
        fontSize: variant === "primary" || variant === "cancel" ? 14 : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: variant === "primary" || variant === "cancel" ? 38 : 30,
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

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `1px solid ${C.cardBorder}`,
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
  background: "#ffffff",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const checkboxSx = {
  padding: "1px",
  color: C.accent,
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const headerCheckThStyle = {
  padding: "1px 14px",
  lineHeight: 1,
};

const CallerIDPool = () => {
  const [prefix, setPrefix] = useState("");
  const [startDate, setStartDate] = useState("");
  const [usageCycle, setUsageCycle] = useState("0");
  const [outboundCallerId, setOutboundCallerId] = useState("0");
  const [designationMode, setDesignationMode] = useState("SIP Side Reject");
  const [destinationPcm, setDestinationPcm] = useState("PCM");

  const [rowsIpPstn, setRowsIpPstn] = useState([]);
  const [checkedIpPstn, setCheckedIpPstn] = useState([]);
  const [rowsPstnIp, setRowsPstnIp] = useState([]);
  const [checkedPstnIp, setCheckedPstnIp] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(NUM_MANIPULATE_CALLERID_POOL_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [modalTable, setModalTable] = useState("ip_pstn");

  const handleCheck = (table, idx) => {
    if (table === "ip_pstn") {
      setCheckedIpPstn((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
      );
    } else {
      setCheckedPstnIp((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
      );
    }
  };

  const handleCheckAll = (table, selectAll) => {
    if (table === "ip_pstn") {
      setCheckedIpPstn(selectAll ? rowsIpPstn.map((_, idx) => idx) : []);
    } else {
      setCheckedPstnIp(selectAll ? rowsPstnIp.map((_, idx) => idx) : []);
    }
  };

  const handleDelete = (table) => {
    if (table === "ip_pstn") {
      setRowsIpPstn((rows) => rows.filter((_, idx) => !checkedIpPstn.includes(idx)));
      setCheckedIpPstn([]);
    } else {
      setRowsPstnIp((rows) => rows.filter((_, idx) => !checkedPstnIp.includes(idx)));
      setCheckedPstnIp([]);
    }
  };

  const handleClear = (table) => {
    if (table === "ip_pstn") {
      setRowsIpPstn([]);
      setCheckedIpPstn([]);
    } else {
      setRowsPstnIp([]);
      setCheckedPstnIp([]);
    }
  };

  const handleAddNew = (table) => {
    setModalData(NUM_MANIPULATE_CALLERID_POOL_INITIAL_FORM);
    setEditIndex(null);
    setModalTable(table);
    setShowModal(true);
  };

  const handleEdit = (table, idx) => {
    const row = table === "ip_pstn" ? rowsIpPstn[idx] : rowsPstnIp[idx];
    let callerIdRangeStart = "";
    let callerIdRangeEnd = "";
    if (row.callerIdRange) {
      if (row.callerIdRange.includes("--")) {
        [callerIdRangeStart, callerIdRangeEnd] = row.callerIdRange.split("--");
      } else {
        callerIdRangeStart = row.callerIdRange;
      }
    }
    setModalData({ ...row, callerIdRangeStart, callerIdRangeEnd });
    setEditIndex(idx);
    setModalTable(table);
    setShowModal(true);
  };

  const handleModalChange = (key, value) => {
    setModalData((data) => ({ ...data, [key]: value }));
  };

  const handleModalSave = () => {
    const dataToSave = {
      ...modalData,
      callerIdRange: `${modalData.callerIdRangeStart || ""}${modalData.callerIdRangeEnd ? "--" + modalData.callerIdRangeEnd : ""}`,
    };
    if (modalTable === "ip_pstn") {
      if (editIndex !== null) {
        setRowsIpPstn((rows) =>
          rows.map((row, idx) => (idx === editIndex ? dataToSave : row)),
        );
      } else {
        setRowsIpPstn((rows) => [...rows, dataToSave]);
      }
    } else {
      if (editIndex !== null) {
        setRowsPstnIp((rows) =>
          rows.map((row, idx) => (idx === editIndex ? dataToSave : row)),
        );
      } else {
        setRowsPstnIp((rows) => [...rows, dataToSave]);
      }
    }
    setShowModal(false);
    setEditIndex(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditIndex(null);
  };

  const handleSet = (e) => {
    e.preventDefault();
  };

  const renderTablePanel = ({
    title,
    rows,
    checkedItems,
    tableKey,
    onCheck,
    onCheckAll,
    onDelete,
    onClear,
    onAddNew,
    onEdit,
  }) => {
    const columns =
      tableKey === "pstn_ip"
        ? NUM_MANIPULATE_CALLERID_POOL_TABLE_COLUMNS.map((col) =>
            col.key === "destinationPcm"
              ? { ...col, label: "Source PCM" }
              : col,
          )
        : NUM_MANIPULATE_CALLERID_POOL_TABLE_COLUMNS;

    const dataColumns = columns.filter(
      (col) => col.key !== "check" && col.key !== "modify",
    );
    const allChecked = rows.length > 0 && checkedItems.length === rows.length;
    const someChecked = checkedItems.length > 0 && !allChecked;

    return (
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={panelCardStyle}>
          <div style={panelToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={panelSectionTitleStyle}>{title}</span>
              {checkedItems.length > 0 && (
                <span
                  style={{
                    background: "#eff6ff",
                    color: C.labelText,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: `1px solid ${C.accentDark}`,
                  }}
                >
                  {checkedItems.length} selected
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
                onClick={onDelete}
                disabled={checkedItems.length === 0}
                style={{ height: 30, padding: "6px 14px", fontSize: 12 }}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {NUM_MANIPULATE_CALLERID_POOL_DELETE_LABEL}
              </Btn>
              <Btn
                variant="cancel"
                onClick={onClear}
                disabled={rows.length === 0}
                style={{ height: 30, padding: "6px 14px", fontSize: 12 }}
              >
                {NUM_MANIPULATE_CALLERID_POOL_CLEAR_ALL_LABEL}
              </Btn>
              <Btn
                variant="primary"
                onClick={onAddNew}
                style={{ height: 30, padding: "6px 16px", fontSize: 12 }}
              >
                {NUM_MANIPULATE_CALLERID_POOL_ADD_NEW_LABEL}
              </Btn>
            </div>
          </div>

          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 360 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: 500,
              }}
            >
              <thead>
                <tr>
                  <TH
                    style={{
                      width: 56,
                      borderLeft: "none",
                      ...headerCheckThStyle,
                    }}
                  >
                    <Checkbox
                      checked={allChecked}
                      indeterminate={someChecked}
                      onChange={() => onCheckAll(!allChecked)}
                      size="small"
                      sx={checkboxSx}
                      disabled={rows.length === 0}
                    />
                  </TH>
                  {dataColumns.map((col) => (
                    <TH key={col.key}>{col.label}</TH>
                  ))}
                  <TH style={{ width: 80, borderRight: "none" }}>Modify</TH>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={dataColumns.length + 2}
                      style={{
                        textAlign: "center",
                        padding: "36px 0",
                        color: C.mutedText,
                        fontSize: 13,
                        fontWeight: 600,
                        borderBottom: "none",
                      }}
                    >
                      No entries found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => {
                    const isChecked = checkedItems.includes(idx);
                    const isLastRow = idx === rows.length - 1;
                    const rowBg = isChecked
                      ? "#f0f9ff"
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
                          transition: "background 0.1s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isChecked)
                            e.currentTarget.style.background = "#f1f5f9";
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
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            checked={isChecked}
                            onChange={() => onCheck(idx)}
                            size="small"
                            sx={checkboxSx}
                          />
                        </td>
                        {dataColumns.map((col) => (
                          <td
                            key={col.key}
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {row[col.key]}
                          </td>
                        ))}
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
                              style={{
                                cursor: "pointer",
                                color: "#2563eb",
                                fontSize: 22,
                                opacity: 0.7,
                                transition: "opacity 0.15s ease",
                              }}
                              onClick={() => onEdit(idx)}
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
                  })
                )}
              </tbody>
            </table>
          </div>

          {rows.length > 0 && (
            <div style={panelFooterStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {rows.length} record
                {rows.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AdvancedPageShell>
      <CallerIDPoolBreadcrumb />

      <form onSubmit={handleSet}>
        <div style={topControlsCardStyle}>
          <div style={topControlsBodyStyle}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 20,
                alignItems: "center",
              }}
            >
              <E1PriFieldRow
                label="Manipulate IP->PSTN CallerIDs with Designated Prefix:"
                tooltipKey="prefix"
                tooltips={NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS}
                labelWidth={320}
              >
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  style={inputStyle}
                  {...inputInteraction}
                />
              </E1PriFieldRow>

              <E1PriFieldRow
                label="Starting Date:"
                tooltipKey="startDate"
                tooltips={NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS}
              >
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={inputStyle}
                  {...inputInteraction}
                />
              </E1PriFieldRow>

              <E1PriFieldRow
                label="Usage Cycle (Day):"
                tooltipKey="usageCycle"
                tooltips={NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS}
              >
                <input
                  type="number"
                  value={usageCycle}
                  onChange={(e) => setUsageCycle(e.target.value)}
                  style={inputStyle}
                  {...inputInteraction}
                />
              </E1PriFieldRow>

              <E1PriFieldRow
                label="Destination PCM:"
                tooltipKey="destinationPcm"
                tooltips={NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS}
              >
                <select
                  value={destinationPcm}
                  onChange={(e) => setDestinationPcm(e.target.value)}
                  style={selectStyle}
                  {...inputInteraction}
                >
                  <option value="PCM">PCM</option>
                  <option value="Any">PCM Group</option>
                </select>
              </E1PriFieldRow>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 20,
                alignItems: "center",
              }}
            >
              <E1PriFieldRow
                label="IP->PSTN Outbound Calls with Designated CallerID:"
                tooltipKey="outboundCallerId"
                tooltips={NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS}
                labelWidth={320}
              >
                <input
                  type="text"
                  value={outboundCallerId}
                  onChange={(e) => setOutboundCallerId(e.target.value)}
                  style={inputStyle}
                  {...inputInteraction}
                />
              </E1PriFieldRow>

              <E1PriFieldRow
                label="IP->PSTN Designation Mode:"
                tooltipKey="designationMode"
                tooltips={NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS}
                labelWidth={200}
              >
                <select
                  value={designationMode}
                  onChange={(e) => setDesignationMode(e.target.value)}
                  style={selectStyle}
                  {...inputInteraction}
                >
                  <option value="SIP Side Reject">SIP Side Reject</option>
                  <option value="Other">Designated CallerID</option>
                </select>
              </E1PriFieldRow>

              <Btn type="submit" variant="primary" style={{ height: 34, fontSize: 13 }}>
                {NUM_MANIPULATE_CALLERID_POOL_SET_LABEL}
              </Btn>
            </div>
          </div>
        </div>
      </form>

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          width: "100%",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        {renderTablePanel({
          title: NUM_MANIPULATE_CALLERID_POOL_IP_PSTN_PANEL_TITLE,
          rows: rowsIpPstn,
          checkedItems: checkedIpPstn,
          tableKey: "ip_pstn",
          onCheck: (idx) => handleCheck("ip_pstn", idx),
          onCheckAll: (selectAll) => handleCheckAll("ip_pstn", selectAll),
          onDelete: () => handleDelete("ip_pstn"),
          onClear: () => handleClear("ip_pstn"),
          onAddNew: () => handleAddNew("ip_pstn"),
          onEdit: (idx) => handleEdit("ip_pstn", idx),
        })}
        {renderTablePanel({
          title: NUM_MANIPULATE_CALLERID_POOL_PSTN_IP_PANEL_TITLE,
          rows: rowsPstnIp,
          checkedItems: checkedPstnIp,
          tableKey: "pstn_ip",
          onCheck: (idx) => handleCheck("pstn_ip", idx),
          onCheckAll: (selectAll) => handleCheckAll("pstn_ip", selectAll),
          onDelete: () => handleDelete("pstn_ip"),
          onClear: () => handleClear("pstn_ip"),
          onAddNew: () => handleAddNew("pstn_ip"),
          onEdit: (idx) => handleEdit("pstn_ip", idx),
        })}
      </div>

      <p
        style={{
          color: C.amber,
          fontSize: 11,
          lineHeight: 1.5,
          margin: "0 0 16px",
          padding: "0 4px",
        }}
      >
        {NUM_MANIPULATE_CALLERID_POOL_NOTE}
      </p>

      <Dialog
        open={showModal}
        onClose={handleModalClose}
        maxWidth={false}
        sx={addNewDialogSx}
        PaperProps={{
          sx: mergeAddNewDialogPaperSx({
            width: 500,
            maxWidth: "95vw",
            p: 0,
            borderRadius: `${CARD_RADIUS}px`,
            overflow: "hidden",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
          }),
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
            padding: "14px 24px",
            letterSpacing: "-0.01em",
            flexShrink: 0,
          }}
        >
          {NUM_MANIPULATE_CALLERID_POOL_MODAL_TITLE}
        </DialogTitle>

        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={{ ...addHostFormPanelStyle, gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {NUM_MANIPULATE_CALLERID_POOL_MODAL_FIELDS.filter(
                (f) => f.key !== "callerIdRange",
              ).map((field) => (
                <E1PriFieldRow
                  key={field.key}
                  label={
                    field.key === "destinationPcm" && modalTable === "pstn_ip"
                      ? "Source PCM:"
                      : `${field.label}:`
                  }
                  tooltipKey={field.key}
                  tooltips={NUM_MANIPULATE_CALLERID_POOL_FIELD_TOOLTIPS}
                >
                  {field.type === "select" ? (
                    <select
                      value={modalData[field.key]}
                      onChange={(e) =>
                        handleModalChange(field.key, e.target.value)
                      }
                      style={selectStyle}
                      {...inputInteraction}
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={modalData[field.key] ?? ""}
                      onChange={(e) =>
                        handleModalChange(field.key, e.target.value)
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  )}
                </E1PriFieldRow>
              ))}

              <E1PriFieldRow
                label="CallerID:"
                tooltipKey="callerIdRange"
                tooltips={NUM_MANIPULATE_CALLERID_POOL_FIELD_TOOLTIPS}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <input
                    type="text"
                    placeholder="Start"
                    value={modalData.callerIdRangeStart ?? ""}
                    onChange={(e) =>
                      handleModalChange("callerIdRangeStart", e.target.value)
                    }
                    style={inputStyle}
                    {...inputInteraction}
                  />
                  <span
                    style={{
                      color: C.mutedText,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    --
                  </span>
                  <input
                    type="text"
                    placeholder="End"
                    value={modalData.callerIdRangeEnd ?? ""}
                    onChange={(e) =>
                      handleModalChange("callerIdRangeEnd", e.target.value)
                    }
                    style={inputStyle}
                    {...inputInteraction}
                  />
                </div>
              </E1PriFieldRow>
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
            borderBottomLeftRadius: CARD_RADIUS,
            borderBottomRightRadius: CARD_RADIUS,
          }}
        >
          <Btn
            onClick={handleModalSave}
            variant="primary"
            style={{ minWidth: 110, height: 34, fontSize: 13 }}
          >
            {NUM_MANIPULATE_CALLERID_POOL_SAVE_LABEL}
          </Btn>
          <Btn
            onClick={handleModalClose}
            variant="cancel"
            style={{
              minWidth: 100,
              height: 34,
              fontSize: 13,
              background: "#cbd5e1",
              color: "#374151",
              border: "1px solid #cbd5e1",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            {NUM_MANIPULATE_CALLERID_POOL_CLOSE_LABEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </AdvancedPageShell>
  );
};

export default CallerIDPool;
