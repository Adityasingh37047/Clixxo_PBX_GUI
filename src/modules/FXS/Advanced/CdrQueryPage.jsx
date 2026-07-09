import React, { useState } from "react";
import { Alert, Tooltip } from "@mui/material";
import {
  CDR_QUERY_INITIAL_FORM,
  CDR_QUERY_FIELD_TOOLTIPS,
  CDR_QUERY_FIELDS,
  CDR_QUERY_PAGE_BREADCRUMB_ROOT,
  CDR_QUERY_PAGE_BREADCRUMB_SECTION,
  CDR_QUERY_PAGE_TITLE,
  CDR_QUERY_CARD_TITLE,
  CDR_QUERY_BUTTON_LABEL,
} from "../../../constants/CdrQueryConstants";

const FIELD_LABEL_COLOR = "#3E5475";
const CDR_LABEL_WIDTH = 190;
const CDR_FIELD_WIDTH = 132;
const CDR_DURATION_FIELD_WIDTH = 56;

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
  fieldBg: "#ffffff",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 8;
const FIELD_CONTROL_HEIGHT = 36;

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

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";

const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;

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
  el.style.boxShadow = FOCUS_RING_SHADOW();
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

const nativeFieldBaseStyle = {
  height: FIELD_CONTROL_HEIGHT,
  minHeight: FIELD_CONTROL_HEIGHT,
  padding: "0 12px",
  fontSize: 13,
  lineHeight: `${FIELD_CONTROL_HEIGHT - 2}px`,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: C.fieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const compactFieldStyle = {
  ...nativeFieldBaseStyle,
  width: CDR_FIELD_WIDTH,
  minWidth: CDR_FIELD_WIDTH,
  maxWidth: CDR_FIELD_WIDTH,
};

const durationFieldStyle = {
  ...nativeFieldBaseStyle,
  width: CDR_DURATION_FIELD_WIDTH,
  minWidth: CDR_DURATION_FIELD_WIDTH,
  maxWidth: CDR_DURATION_FIELD_WIDTH,
  padding: "0 8px",
};

const nativeFieldSelectStyle = {
  ...compactFieldStyle,
  padding: "0 28px 0 12px",
  appearance: "auto",
  cursor: "pointer",
};

const CdrQueryFieldRow = ({ label, tooltipKey, children }) => {
  const tooltip = tooltipKey ? CDR_QUERY_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        width: CDR_LABEL_WIDTH,
        flexShrink: 0,
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        textAlign: "left",
        lineHeight: 1.45,
        cursor: tooltip ? "help" : undefined,
      }}
    >
      {label}
    </label>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        width: "fit-content",
        maxWidth: "100%",
      }}
    >
      {tooltip ? (
        <Tooltip
          title={formatFieldTooltipTitle(tooltip)}
          {...FIELD_TOOLTIP_PROPS}
        >
          {labelNode}
        </Tooltip>
      ) : (
        labelNode
      )}
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
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

const advancedTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
};

const advancedCardTitleBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const cdrQueryFormBodyStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px 36px 24px",
  width: "100%",
  boxSizing: "border-box",
};

const cdrQueryFieldsColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  width: "fit-content",
  maxWidth: "100%",
};

const cdrQueryFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

const advancedFormBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const CdrQueryBreadcrumb = () => (
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
    <span>{CDR_QUERY_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{CDR_QUERY_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {CDR_QUERY_PAGE_TITLE}
    </span>
  </div>
);

const CdrQueryPageShell = ({ children }) => (
  <div style={advancedPageWrapStyle}>
    <div style={advancedPageInnerStyle}>{children}</div>
  </div>
);

const CdrQueryPage = () => {
  const [formData, setFormData] = useState(CDR_QUERY_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStringKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (
      key === 32 ||
      key === 46 ||
      key === 95 ||
      key === 8 ||
      (key >= 48 && key <= 57) ||
      (key >= 65 && key <= 90) ||
      (key >= 97 && key <= 122)
    ) {
      return;
    }
    e.preventDefault();
  };

  const handleNumberKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if ((key > 47 && key < 58) || key === 8) {
      return;
    }
    e.preventDefault();
  };

  const handleQuery = () => {
    if (
      formData.startdate &&
      formData.enddate &&
      formData.startdate > formData.enddate
    ) {
      alert("The Ending Date should not be earlier than the Starting Date!");
      return;
    }

    const minTalkTime = Number(formData.mintalktime);
    const maxTalkTime = Number(formData.maxtalktime);
    if (
      formData.mintalktime &&
      formData.maxtalktime &&
      minTalkTime > maxTalkTime
    ) {
      alert(
        "The max talk duration should not be smaller than the min talk duration!",
      );
      return;
    }

    alert("Query submitted successfully!");
  };

  const renderFieldControl = (field) => {
    if (field.type === "date") {
      return (
        <input
          id={field.key}
          type="date"
          name={field.key}
          value={formData[field.key] || ""}
          onChange={handleInputChange}
          style={compactFieldStyle}
          {...nativeFieldInteraction}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          id={field.key}
          name={field.key}
          value={formData[field.key]}
          onChange={handleInputChange}
          style={nativeFieldSelectStyle}
          {...nativeFieldInteraction}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "duration") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <input
            id={field.minKey}
            type="text"
            name={field.minKey}
            value={formData[field.minKey] || ""}
            onChange={handleInputChange}
            onKeyPress={handleNumberKeyPress}
            style={durationFieldStyle}
            {...nativeFieldInteraction}
          />
          <span style={{ fontSize: 13, color: C.mutedText }}>—</span>
          <input
            id={field.maxKey}
            type="text"
            name={field.maxKey}
            value={formData[field.maxKey] || ""}
            onChange={handleInputChange}
            onKeyPress={handleNumberKeyPress}
            style={durationFieldStyle}
            {...nativeFieldInteraction}
          />
        </div>
      );
    }

    return (
      <input
        id={field.key}
        type="text"
        name={field.key}
        value={formData[field.key] || ""}
        onChange={handleInputChange}
        onKeyPress={
          field.keyPressType === "string" ? handleStringKeyPress : undefined
        }
        style={compactFieldStyle}
        {...nativeFieldInteraction}
      />
    );
  };

  return (
    <CdrQueryPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {toast.msg}
        </Alert>
      )}

      <CdrQueryBreadcrumb />

      <div style={advancedTableContainerStyle}>
        <div style={advancedCardTitleBarStyle}>
          <span>{CDR_QUERY_CARD_TITLE}</span>
        </div>

        <div style={cdrQueryFormBodyStyle}>
          <div style={cdrQueryFieldsColStyle}>
            {CDR_QUERY_FIELDS.map((field) => (
              <CdrQueryFieldRow
                key={field.key}
                label={field.label}
                tooltipKey={field.tooltipKey || field.key}
              >
                {renderFieldControl(field)}
              </CdrQueryFieldRow>
            ))}
          </div>
        </div>

        <div style={cdrQueryFooterStyle}>
          <Btn
            type="button"
            variant="primary"
            onClick={handleQuery}
            style={advancedFormBtnStyle}
          >
            {CDR_QUERY_BUTTON_LABEL}
          </Btn>
        </div>
      </div>
    </CdrQueryPageShell>
  );
};

export default CdrQueryPage;
