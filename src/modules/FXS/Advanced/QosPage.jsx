import React, { useState } from "react";
import {
  QOS_INITIAL_FORM,
  QOS_FIELD_TOOLTIPS,
  QOS_PAGE_BREADCRUMB_ROOT,
  QOS_PAGE_BREADCRUMB_SECTION,
  QOS_PAGE_TITLE,
  QOS_CARD_TITLE,
  QOS_SAVE_LABEL,
  QOS_RESET_LABEL,
} from "../../../constants/QosConstants";
import { Alert, Checkbox, Tooltip } from "@mui/material";

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
  accent: "#3E5475",
  fieldBg: "#ffffff",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 8;
const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
}) => {
  const styles = {
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
  };
  const s = styles[variant] || styles.primary;
  const hoverBg =
    variant === "cancel"
      ? "#b6c2d3"
      : "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";
  const activeBg =
    variant === "cancel"
      ? "#a3b1c2"
      : "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)";

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
        : "inset 0 2px 4px rgba(15, 23, 42, 0.15)";
  };

  return (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 28px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        height: 34,
        lineHeight: "34px",
        boxSizing: "border-box",
        minWidth: 110,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
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
    </button>
  );
};

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

const FIELD_CONTROL_WIDTH = 160;
const FIELD_CONTROL_HEIGHT = 36;

const nativeFieldInputStyle = {
  width: "100%",
  minWidth: FIELD_CONTROL_WIDTH,
  maxWidth: FIELD_CONTROL_WIDTH,
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

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
};

const pageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,,
  boxSizing: "border-box",
};

const cardStyle = {
  width: "100%",
  background: C.cardBg,
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: C.cardShadow,
  display: "flex",
  flexDirection: "column",
};

const cardTitleBarStyle = {
  width: "100%",
  minHeight: 44,
  padding: "10px 28px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
  background: C.cardBg,
};

const formBodyStyle = {
  padding: "20px 28px 8px",
  display: "flex",
  flexDirection: "column",
  maxWidth: 720,
  width: "100%",
  margin: "0 auto",
  boxSizing: "border-box",
};

const footerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
};

const QosBreadcrumb = () => (
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
    <span>{QOS_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{QOS_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{QOS_PAGE_TITLE}</span>
  </div>
);

const QosFieldRow = ({ label, tooltipKey, children }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      width: "100%",
      minHeight: 36,
      alignItems: "center",
      marginBottom: 10,
    }}
  >
    <div
      style={{
        flex: "1 1 auto",
        minWidth: 0,
        paddingRight: 24,
        textAlign: "left",
        lineHeight: 1.45,
      }}
    >
      <FxsFieldLabel tooltipKey={tooltipKey} tooltips={QOS_FIELD_TOOLTIPS}>
        {label}
      </FxsFieldLabel>
    </div>
    <div
      style={{
        flex: "0 0 auto",
        width: FIELD_CONTROL_WIDTH,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {children}
    </div>
  </div>
);

const QosPage = () => {
  const [formData, setFormData] = useState(QOS_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleSave = () => {
    if (formData.qosEnabled) {
      const mediaQos = parseInt(formData.mediaPremiumQos, 10);
      if (Number.isNaN(mediaQos) || mediaQos < 0 || mediaQos > 63) {
        alert("The range of 'Media Premium QoS' is 0~63!");
        return;
      }
      const controlQos = parseInt(formData.controlPremiumQos, 10);
      if (Number.isNaN(controlQos) || controlQos < 0 || controlQos > 63) {
        alert("The range of 'Control Premium QoS' is 0~63!");
        return;
      }
    }
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(QOS_INITIAL_FORM);
  };

  const handleKeyPressInteger = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 48 && key <= 57) || key === 8)) {
      e.preventDefault();
    }
  };

  return (
    <div style={pageWrapStyle}>
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

      <QosBreadcrumb />

      <div style={cardStyle}>
        <div style={cardTitleBarStyle}>{QOS_CARD_TITLE}</div>

        <div style={formBodyStyle}>
          <QosFieldRow label="QoS" tooltipKey="qosEnabled">
            <Checkbox
              id="qosEnabled"
              name="qosEnabled"
              size="small"
              checked={!!formData.qosEnabled}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  qosEnabled: !prev.qosEnabled,
                }))
              }
              sx={checkboxSx}
            />
          </QosFieldRow>

          {formData.qosEnabled && (
            <>
              <QosFieldRow
                label="Media Premium QoS"
                tooltipKey="mediaPremiumQos"
              >
                <input
                  id="mediaPremiumQos"
                  type="text"
                  value={formData.mediaPremiumQos || ""}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setFormData((prev) => ({
                      ...prev,
                      mediaPremiumQos: v,
                    }));
                  }}
                  onKeyPress={handleKeyPressInteger}
                  maxLength={2}
                  style={nativeFieldInputStyle}
                  {...nativeFieldInteraction}
                />
              </QosFieldRow>

              <QosFieldRow
                label="Control Premium QoS"
                tooltipKey="controlPremiumQos"
              >
                <input
                  id="controlPremiumQos"
                  type="text"
                  value={formData.controlPremiumQos || ""}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setFormData((prev) => ({
                      ...prev,
                      controlPremiumQos: v,
                    }));
                  }}
                  onKeyPress={handleKeyPressInteger}
                  maxLength={2}
                  style={nativeFieldInputStyle}
                  {...nativeFieldInteraction}
                />
              </QosFieldRow>
            </>
          )}
        </div>

        <div style={footerStyle}>
          <Btn type="button" variant="primary" onClick={handleSave}>
            {QOS_SAVE_LABEL}
          </Btn>
          <Btn type="button" variant="cancel" onClick={handleReset}>
            {QOS_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default QosPage;
