import React, { useState } from "react";
import {
  PORT_FXS_ADVANCED_TABLE_COLUMNS,
  PORT_FXS_ADVANCED_ITEMS_PER_PAGE,
  PORT_FXS_ADVANCED_TOTAL_PORTS,
  PORT_FXS_ADVANCED_INITIAL_DATA,
  PORT_FXS_ADVANCED_BATCH_MODIFY_NOTES,
  PORT_FXS_ADVANCED_BATCH_MODIFY_TITLE,
  PORT_FXS_ADVANCED_BATCH_MODIFY_LABEL,
  PORT_FXS_ADVANCED_PAGE_BREADCRUMB_ROOT,
  PORT_FXS_ADVANCED_PAGE_BREADCRUMB_SECTION,
  PORT_FXS_ADVANCED_PAGE_TITLE,
  WEEK_DAYS,
  PORT_FXS_ADVANCED_FIELD_TOOLTIPS,
} from "../../../constants/PortFxsAdvancedPageConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Alert,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";

const PORT_FXS_ADVANCED_ADD_NEW_DIALOG_MARGIN = 24;
const PORT_FXS_ADVANCED_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const PORT_FXS_ADVANCED_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const PORT_FXS_ADVANCED_ADD_NEW_DIALOG_PAPER_SX = {
  margin: PORT_FXS_ADVANCED_ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${PORT_FXS_ADVANCED_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${PORT_FXS_ADVANCED_ADD_NEW_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width: 720,
  maxWidth: "95vw",
  p: 0,
  borderRadius: "8px",
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

const FxsFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

// ── Local page UI (inlined from fxsSharedUi) ──

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
  strongText: "#1f2937",
  accent: "#3E5475",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;

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
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
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
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";

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
        borderRadius: 8,
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

const nativeFieldInteraction = {
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

const nativeFieldInputStyle = {
  height: 32,
  width: 200,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeFieldSelectStyle = {
  width: nativeFieldInputStyle.width,
  height: 32,
  minHeight: 32,
  padding: "0 28px 0 10px",
  fontSize: nativeFieldInputStyle.fontSize,
  lineHeight: 1.35,
  border: nativeFieldInputStyle.border,
  borderRadius: nativeFieldInputStyle.borderRadius,
  outline: nativeFieldInputStyle.outline,
  backgroundColor: nativeFieldInputStyle.backgroundColor,
  color: nativeFieldInputStyle.color,
  boxSizing: nativeFieldInputStyle.boxSizing,
  transition: nativeFieldInputStyle.transition,
  appearance: "auto",
};

const fxsNativeFieldInputStyle = nativeFieldInputStyle;
const fxsNativeFieldSelectStyle = nativeFieldSelectStyle;
const fxsNativeFieldInteraction = nativeFieldInteraction;


const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
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
      borderBottom: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      position: "sticky",
      top: 0,
      zIndex: 10,
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

const PCM_TRUNK_GROUP_TH_GAP = { padding: "8px 14px" };

const portFxsAdvancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,
  boxSizing: "border-box",
};

const portFxsAdvancedPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const portFxsAdvancedCardStyle = {
  width: "100%",
  background: C.cardBg,
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: C.cardShadow,
  display: "flex",
  flexDirection: "column",
};

const portFxsAdvancedHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  minHeight: 44,
  padding: "10px 28px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  flexWrap: "wrap",
  gap: 12,
  boxSizing: "border-box",
};

const portFxsAdvancedTableBodyStyle = {
  overflowX: "auto",
  overflowY: "auto",
  width: "100%",
  boxSizing: "border-box",
};

const portFxsAdvancedPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 28px",
  background: C.cardBg,
  borderTop: `1px solid ${C.divider}`,
  overflow: "hidden",
};

const PortFxsAdvancedBreadcrumb = () => (
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
    <span>{PORT_FXS_ADVANCED_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{PORT_FXS_ADVANCED_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {PORT_FXS_ADVANCED_PAGE_TITLE}
    </span>
  </div>
);

const routeTdStyle = {
  ...tdStyle,
  fontSize: 12,
  padding: "6px 8px",
  lineHeight: 1.2,
};

const routeThExtra = {
  fontSize: 10.5,
  padding: "9px 8px",
  letterSpacing: "0.04em",
};

const advancedFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const fxsDialogActionsStyle = {
  padding: "16px 24px",
  background: "#f8fafc",
  borderTop: `1px solid ${C.divider}`,
  justifyContent: "center",
  gap: 12,
  flexShrink: 0,
};

const FieldRow = ({
  label,
  tooltipKey,
  children,
  required,
  align = "center",
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: align,
      justifyContent: "center",
      gap: 12,
      minHeight: align === "flex-start" ? undefined : 32,
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      <FxsFieldLabel
        tooltipKey={tooltipKey}
        tooltips={PORT_FXS_ADVANCED_FIELD_TOOLTIPS}
      >
        {label}
      </FxsFieldLabel>
      {required && <span style={{ color: "#dc2626" }}> *</span>}
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const inputStyle = {
  ...fxsNativeFieldInputStyle,
  width: "100%",
};

const selectStyle = {
  ...fxsNativeFieldSelectStyle,
  width: "100%",
};

const inputInteraction = fxsNativeFieldInteraction;

// ── Initial State Logic ───────────────────────────────────────────────────────
const initializePortData = () => {
  return Array.from({ length: PORT_FXS_ADVANCED_TOTAL_PORTS }, (_, i) => ({
    ...PORT_FXS_ADVANCED_INITIAL_DATA,
    port: i + 1,
  }));
};

const getInitialBatchForm = () => {
  const form = {
    port: "1",
    type: "FXS",
    forbidOutgoingCall: false,
    wayOfForbidOutgoingCall: "All time",
    blacklistOfFxsOutCalls: "",
    prohibitLimitCount: 1,
  };

  for (let i = 1; i <= 5; i++) {
    form[`period${i}Start1`] = "00:00:00";
    form[`period${i}End1`] = "00:00:00";
    form[`period${i}Start2`] = "00:00:00";
    form[`period${i}End2`] = "00:00:00";
    form[`period${i}Start3`] = "00:00:00";
    form[`period${i}End3`] = "00:00:00";
    WEEK_DAYS.forEach((day, idx) => {
      form[`period${i}Week${idx}`] = false;
    });
  }

  return form;
};

// ── Main Component ────────────────────────────────────────────────────────────
const PortFxsAdvancedPage = () => {
  const [ports, setPorts] = useState(initializePortData());
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batchForm, setBatchForm] = useState(getInitialBatchForm());
  const [prohibitLimitCount, setProhibitLimitCount] = useState(1);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(ports.length / PORT_FXS_ADVANCED_ITEMS_PER_PAGE),
  );
  const pagedPorts = ports.slice(
    (page - 1) * PORT_FXS_ADVANCED_ITEMS_PER_PAGE,
    page * PORT_FXS_ADVANCED_ITEMS_PER_PAGE,
  );

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  const handleOpenModal = (port = null) => {
    if (port) {
      setBatchForm((prev) => ({
        ...getInitialBatchForm(),
        port: String(port.port),
        type: port.type || "FXS",
      }));
    } else {
      setBatchForm(getInitialBatchForm());
    }
    setProhibitLimitCount(1);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setBatchForm(getInitialBatchForm());
    setProhibitLimitCount(1);
  };

  const handleBatchModify = () => {
    handleOpenModal();
  };

  const handleFormChange = (key, value) => {
    setBatchForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckbox = (key) => {
    setBatchForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePeriodCountChange = (action) => {
    if (action === "plus" && prohibitLimitCount < 5) {
      setProhibitLimitCount((prev) => prev + 1);
    } else if (action === "minus" && prohibitLimitCount > 1) {
      setProhibitLimitCount((prev) => prev - 1);
    }
  };

  const shouldShowField = (field) => {
    if (!field.conditional) return true;
    return !!batchForm[field.conditional];
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (
      batchForm.forbidOutgoingCall &&
      batchForm.wayOfForbidOutgoingCall === "Select time"
    ) {
      for (let i = 1; i <= prohibitLimitCount; i++) {
        const start1 = batchForm[`period${i}Start1`];
        const end1 = batchForm[`period${i}End1`];
        if (!start1 || !end1) {
          showMessage(
            "error",
            `Please input the start and end time for period ${i}!`,
          );
          return;
        }
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        if (!timeRegex.test(start1) || !timeRegex.test(end1)) {
          showMessage(
            "error",
            `Please input the time in the right format (hh:mm:ss) for period ${i}!`,
          );
          return;
        }
      }
    }

    showMessage("success", "Batch modify settings saved successfully!");
    handleCloseModal();
  };

  const handleCancel = () => {
    handleCloseModal();
  };

  const handleReset = () => {
    setBatchForm(getInitialBatchForm());
    setProhibitLimitCount(1);
  };

  const renderTimePeriods = () => {
    if (
      !batchForm.forbidOutgoingCall ||
      batchForm.wayOfForbidOutgoingCall !== "Select time"
    ) {
      return null;
    }

    const periods = [];
    for (let i = 1; i <= prohibitLimitCount; i++) {
      periods.push(
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "16px 12px",
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 6,
            marginTop: 8,
            backgroundColor: "#f8fafc",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: C.labelText }}>
            Time Period {i}
          </div>
          <FieldRow label="Period 1 (hh:mm:ss):" tooltipKey="periodStart">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                value={batchForm[`period${i}Start1`] || "00:00:00"}
                onChange={(e) =>
                  handleFormChange(`period${i}Start1`, e.target.value)
                }
                style={{ ...inputStyle, width: 100 }}
                {...inputInteraction}
                maxLength={8}
                placeholder="00:00:00"
              />
              <span style={{ color: C.mutedText }}>-</span>
              <input
                type="text"
                value={batchForm[`period${i}End1`] || "00:00:00"}
                onChange={(e) =>
                  handleFormChange(`period${i}End1`, e.target.value)
                }
                style={{ ...inputStyle, width: 100 }}
                {...inputInteraction}
                maxLength={8}
                placeholder="00:00:00"
              />
            </div>
          </FieldRow>
          <FieldRow label="Period 2 (hh:mm:ss):" tooltipKey="periodStart">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                value={batchForm[`period${i}Start2`] || "00:00:00"}
                onChange={(e) =>
                  handleFormChange(`period${i}Start2`, e.target.value)
                }
                style={{ ...inputStyle, width: 100 }}
                {...inputInteraction}
                maxLength={8}
                placeholder="00:00:00"
              />
              <span style={{ color: C.mutedText }}>-</span>
              <input
                type="text"
                value={batchForm[`period${i}End2`] || "00:00:00"}
                onChange={(e) =>
                  handleFormChange(`period${i}End2`, e.target.value)
                }
                style={{ ...inputStyle, width: 100 }}
                {...inputInteraction}
                maxLength={8}
                placeholder="00:00:00"
              />
            </div>
          </FieldRow>
          <FieldRow label="Period 3 (hh:mm:ss):" tooltipKey="periodStart">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                value={batchForm[`period${i}Start3`] || "00:00:00"}
                onChange={(e) =>
                  handleFormChange(`period${i}Start3`, e.target.value)
                }
                style={{ ...inputStyle, width: 100 }}
                {...inputInteraction}
                maxLength={8}
                placeholder="00:00:00"
              />
              <span style={{ color: C.mutedText }}>-</span>
              <input
                type="text"
                value={batchForm[`period${i}End3`] || "00:00:00"}
                onChange={(e) =>
                  handleFormChange(`period${i}End3`, e.target.value)
                }
                style={{ ...inputStyle, width: 100 }}
                {...inputInteraction}
                maxLength={8}
                placeholder="00:00:00"
              />
            </div>
          </FieldRow>
          <FieldRow label="Week:" tooltipKey="periodWeek">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {WEEK_DAYS.map((day, idx) => (
                <label
                  key={day}
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
                    checked={!!batchForm[`period${i}Week${idx}`]}
                    onChange={() =>
                      handleFormChange(
                        `period${i}Week${idx}`,
                        !batchForm[`period${i}Week${idx}`],
                      )
                    }
                    sx={{ ...checkboxSx, marginRight: "4px" }}
                  />
                  {day}
                </label>
              ))}
            </div>
          </FieldRow>
        </div>,
      );
    }
    return periods;
  };

  const renderModalForm = () => (
    <form onSubmit={handleSave}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FieldRow label="Port:" tooltipKey="port">
          <select
            value={batchForm.port}
            onChange={(e) => handleFormChange("port", e.target.value)}
            style={selectStyle}
            {...inputInteraction}
          >
            {Array.from({ length: PORT_FXS_ADVANCED_TOTAL_PORTS }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {i + 1}
              </option>
            ))}
          </select>
        </FieldRow>

        <FieldRow label="Type:" tooltipKey="type">
          <input
            type="text"
            value={batchForm.type || "FXS"}
            onChange={(e) => handleFormChange("type", e.target.value)}
            style={{ ...inputStyle, backgroundColor: "#f3f4f6" }}
            {...inputInteraction}
            readOnly
          />
        </FieldRow>

        <FieldRow label="Forbid Outgoing Call:" tooltipKey="forbidOutgoingCall">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              color: C.valueText,
              cursor: "pointer",
            }}
          >
            <Checkbox
              size="small"
              checked={!!batchForm.forbidOutgoingCall}
              onChange={() => handleCheckbox("forbidOutgoingCall")}
              sx={checkboxSx}
            />
            Enable
          </label>
        </FieldRow>

        {shouldShowField({ conditional: "forbidOutgoingCall" }) && (
          <FieldRow label="Way Of Forbid Outgoing Call:" tooltipKey="wayOfForbidOutgoingCall">
            <select
              value={batchForm.wayOfForbidOutgoingCall}
              onChange={(e) =>
                handleFormChange("wayOfForbidOutgoingCall", e.target.value)
              }
              style={selectStyle}
              {...inputInteraction}
            >
              <option value="All time">All time</option>
              <option value="Select time">Select time</option>
            </select>
          </FieldRow>
        )}

        {batchForm.forbidOutgoingCall &&
          batchForm.wayOfForbidOutgoingCall === "Select time" && (
            <>
              {renderTimePeriods()}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  {prohibitLimitCount < 5 && (
                    <Btn
                      variant="cancel"
                      onClick={() => handlePeriodCountChange("plus")}
                      style={{ padding: "4px 12px", height: 28 }}
                    >
                      + Add Period
                    </Btn>
                  )}
                  {prohibitLimitCount > 1 && (
                    <Btn
                      variant="cancel"
                      onClick={() => handlePeriodCountChange("minus")}
                      style={{ padding: "4px 12px", height: 28 }}
                    >
                      - Remove Period
                    </Btn>
                  )}
                </div>
              </div>
            </>
          )}

        <FieldRow label="Blacklist of FXS Out Calls:" align="flex-start" tooltipKey="blacklistOfFxsOutCalls">
          <textarea
            value={batchForm.blacklistOfFxsOutCalls}
            onChange={(e) =>
              handleFormChange("blacklistOfFxsOutCalls", e.target.value)
            }
            style={{
              ...inputStyle,
              height: "80px",
              resize: "vertical",
              padding: "8px 10px",
              lineHeight: 1.4,
            }}
            {...inputInteraction}
            maxLength={1000}
          />
        </FieldRow>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: "0 4px",
          fontSize: 12,
          color: "#dc2626",
          textAlign: "center",
        }}
      >
        <div
          style={{
            lineHeight: 1.6,
            display: "inline-grid",
            gridTemplateColumns: "40px auto",
            textAlign: "left",
            columnGap: 0,
            color: C.accent,
          }}
        >
          <div>Note:</div>
          <div>{PORT_FXS_ADVANCED_BATCH_MODIFY_NOTES[0].replace(/^Note:/, "")}</div>
          <div></div>
          <div>{PORT_FXS_ADVANCED_BATCH_MODIFY_NOTES[1]}</div>
        </div>
      </div>
    </form>
  );

  return (
    <div style={portFxsAdvancedPageWrapStyle}>
      <div style={portFxsAdvancedPageInnerStyle}>
        {/* Error / Success Banner */}
        {message.text && (
          <Alert
            severity={
              message.type === "error"
                ? "error"
                : message.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
        )}

        <PortFxsAdvancedBreadcrumb />

        <div style={portFxsAdvancedCardStyle}>
          <div style={portFxsAdvancedHeaderStyle}>
            <Btn
              onClick={handleBatchModify}
              variant="primary"
              style={{ height: 30, padding: "6px 14px", fontSize: 12 }}
            >
              {PORT_FXS_ADVANCED_BATCH_MODIFY_LABEL}
            </Btn>
          </div>

          <div style={portFxsAdvancedTableBodyStyle}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: 600,
              }}
            >
              <thead>
                <tr>
                  {PORT_FXS_ADVANCED_TABLE_COLUMNS.map((col) => (
                    <TH
                      key={col.key}
                      style={{
                        ...(col.key === "modify"
                          ? { width: 70, borderRight: "none" }
                          : {}),
                        ...routeThExtra,
                        ...PCM_TRUNK_GROUP_TH_GAP,
                      }}
                    >
                      {col.label}
                    </TH>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedPorts.map((port, idx) => {
                  const rowBg = idx % 2 === 1 ? "#f8fafc" : "#ffffff";
                  const isLastRow = idx === pagedPorts.length - 1;
                  const lastRowCellStyle = isLastRow
                    ? { borderBottom: "none" }
                    : {};
                  return (
                    <tr
                      key={port.port}
                      style={{
                        background: rowBg,
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f1f5f9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = rowBg;
                      }}
                    >
                      {PORT_FXS_ADVANCED_TABLE_COLUMNS.map((col) => {
                        if (col.key === "modify") {
                          return (
                            <td
                              key={col.key}
                              style={{
                                ...routeTdStyle,
                                background: rowBg,
                                borderRight: "none",
                                ...lastRowCellStyle,
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "center" }}>
                                <EditDocumentIcon
                                  titleAccess="Edit"
                                  style={{
                                    cursor: "pointer",
                                    color: "#2563eb",
                                    fontSize: 22,
                                    opacity: 0.7,
                                    transition: "opacity 0.15s ease",
                                  }}
                                  onClick={() => handleOpenModal(port)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = "1";
                                  }}
                                  onMouseLeave={(e) => {
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
                              ...routeTdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {port[col.key]}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {ports.length > 0 && (
            <div style={portFxsAdvancedPaginationStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedPorts.length} record{pagedPorts.length !== 1 ? "s" : ""} on
                page {page}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  variant="outline"
                >
                  ← Prev
                </Btn>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.accent,
                    background: "#e0f2fe",
                    padding: "5px 14px",
                    borderRadius: 6,
                    border: `1px solid ${C.divider}`,
                  }}
                >
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  variant="outline"
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
          sx={PORT_FXS_ADVANCED_ADD_NEW_DIALOG_SX}
          PaperProps={{
            sx: PORT_FXS_ADVANCED_ADD_NEW_DIALOG_PAPER_SX,
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
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              flexShrink: 0,
            }}
          >
            {PORT_FXS_ADVANCED_BATCH_MODIFY_TITLE}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              overflowY: "auto",
              flex: "1 1 auto",
            }}
          >
            <div style={advancedFormPanelStyle}>{renderModalForm()}</div>
          </DialogContent>
          <DialogActions style={fxsDialogActionsStyle}>
            <Btn
              variant="primary"
              onClick={handleSave}
              style={{ minWidth: 100, height: 34, fontSize: 13 }}
            >
              Modify
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleReset}
              style={{ minWidth: 100, height: 34 }}
            >
              Reset
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleCloseModal}
              style={{ minWidth: 100, height: 34 }}
            >
              Close
            </Btn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default PortFxsAdvancedPage;
