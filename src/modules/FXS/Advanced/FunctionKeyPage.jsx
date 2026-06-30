import React, { useState } from "react";
import {
  FUNCTION_KEY_FIELDS,
  getInitialFormState,
  FUNCTION_KEY_FIELD_TOOLTIPS,
  FUNCTION_KEY_PAGE_BREADCRUMB_ROOT,
  FUNCTION_KEY_PAGE_BREADCRUMB_SECTION,
  FUNCTION_KEY_PAGE_TITLE,
  FUNCTION_KEY_CARD_TITLE,
  FUNCTION_KEY_SECTIONS_ORDER,
  FUNCTION_KEY_SAVE_LABEL,
  FUNCTION_KEY_RESET_LABEL,
} from "../../../constants/FunctionKeyConstants";
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
  sectionTitle: "#30415A",
  fieldBg: "#ffffff",
  rowAlt: "#f8fafc",
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

const nativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    e.target.style.borderColor = OUTLINED_FOCUS;
    e.target.style.boxShadow = "0 0 0 2px rgba(62, 84, 117, 0.15)";
  },
  onBlur: (e) => {
    e.target.style.borderColor = OUTLINED_BORDER;
    e.target.style.boxShadow = "none";
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || document.activeElement === e.target) return;
    e.target.style.borderColor = OUTLINED_HOVER;
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) return;
    e.target.style.borderColor = OUTLINED_BORDER;
  },
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
  padding: 16,
  boxSizing: "border-box",
};

const cardStyle = {
  width: "100%",
  background: C.cardBg,
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: C.cardShadow,
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

const cardBodyStyle = {
  padding: "14px 28px 4px",
};

const sectionBlockStyle = {
  marginBottom: 20,
};

const sectionTitleStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: C.sectionTitle,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 8,
};

const FK_TH_STYLE = { padding: "8px 14px" };
const FK_TD_STYLE = {
  padding: "6px 14px",
  lineHeight: 1.2,
  verticalAlign: "middle",
};

const FK_CONTROL_WIDTH = 130;
const FK_CONTROL_HEIGHT = 28;

const tableShellStyle = {
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  background: C.cardBg,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "fixed",
};

const TH = ({ children, align = "left", width, style: extraStyle }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "8px 14px",
      textAlign: align,
      borderBottom: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      width,
      ...extraStyle,
    }}
  >
    {children}
  </th>
);

const footerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
};

const keyInputStyle = (enabled) => ({
  width: "100%",
  maxWidth: FK_CONTROL_WIDTH,
  height: FK_CONTROL_HEIGHT,
  padding: "0 8px",
  fontSize: 12,
  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  letterSpacing: "0.03em",
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 6,
  outline: "none",
  backgroundColor: enabled ? C.fieldBg : "#f8fafc",
  color: enabled ? C.valueText : C.mutedText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
});

const modeSelectStyle = (enabled) => ({
  width: "100%",
  maxWidth: FK_CONTROL_WIDTH,
  height: FK_CONTROL_HEIGHT,
  padding: "0 8px",
  fontSize: 12,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 6,
  outline: "none",
  backgroundColor: enabled ? C.fieldBg : "#f8fafc",
  color: enabled ? C.valueText : C.mutedText,
  boxSizing: "border-box",
  cursor: enabled ? "pointer" : "not-allowed",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
});

const FunctionKeyBreadcrumb = () => (
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
    <span>{FUNCTION_KEY_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{FUNCTION_KEY_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {FUNCTION_KEY_PAGE_TITLE}
    </span>
  </div>
);

const FunctionKeyPage = () => {
  const [formData, setFormData] = useState(getInitialFormState());
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    showToast(msg, /successfully/i.test(String(msg)) ? "success" : "error");
  };

  const groupedFields = FUNCTION_KEY_FIELDS.reduce((acc, field) => {
    if (!acc[field.section]) acc[field.section] = [];
    acc[field.section].push(field);
    return acc;
  }, {});

  const handleEnableChange = (field) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const enabled = !prev[field.enableKey];
      newData[field.enableKey] = enabled;
      if (enabled && prev[field.modeKey] === "0") {
        newData[field.functionKeyKey] = field.defaultValue;
      }
      return newData;
    });
  };

  const handleModeChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field.modeKey]: value };
      if (value === "0") {
        newData[field.functionKeyKey] = field.defaultValue;
      }
      return newData;
    });
  };

  const handleFunctionKeyChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field.functionKeyKey]: value }));
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (
      !(
        key === 8 ||
        key === 127 ||
        (key >= 48 && key <= 57) ||
        key === 42 ||
        key === 35
      )
    ) {
      e.preventDefault();
    }
  };

  const focusField = (field) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(field.functionKeyKey);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus();
    });
  };

  const validateForm = () => {
    const pattern1 = /^\*\d{0,9}\*{0,1}$/;
    const pattern2 = /^\*#\d{0,9}\*#$/;
    const funkeyArr = [];

    for (const field of FUNCTION_KEY_FIELDS) {
      if (!formData[field.enableKey]) continue;

      const functionKey = formData[field.functionKeyKey];
      const mode = formData[field.modeKey];
      const pattern = field.isReboot ? pattern2 : pattern1;

      if (mode === "1" && !pattern.test(functionKey)) {
        alert(
          field.isReboot
            ? `Please input the function key for '${field.name}' in the right format, like *#88921532*#`
            : `Please input the function key for '${field.name}', in the right format, like ${field.defaultValue}`,
        );
        focusField(field);
        return false;
      }

      if (functionKey && funkeyArr.includes(functionKey)) {
        alert("Function key repeated!");
        focusField(field);
        return false;
      }
      if (functionKey) funkeyArr.push(functionKey);
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) alert("Settings saved successfully!");
  };

  const handleReset = () => setFormData(getInitialFormState());

  const renderSectionTable = (sectionName) => {
    const fields = groupedFields[sectionName] || [];

    return (
      <div
        key={sectionName}
        style={sectionBlockStyle}
        id={`section-${sectionName.replace(/\s+/g, "-").toLowerCase()}`}
      >
        <div style={sectionTitleStyle}>{sectionName}</div>
        <div style={tableShellStyle}>
          <table style={tableStyle}>
            <colgroup>
              <col style={{ width: "46%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "22%" }} />
            </colgroup>
            <thead>
              <tr>
                <TH style={FK_TH_STYLE}>Function</TH>
                <TH align="center" style={FK_TH_STYLE}>
                  Enable
                </TH>
                <TH align="center" style={FK_TH_STYLE}>
                  Function Key
                </TH>
                <TH align="center" style={FK_TH_STYLE}>
                  Mode
                </TH>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, idx) => {
                const enabled = formData[field.enableKey];
                const mode = formData[field.modeKey];
                const functionKey = formData[field.functionKeyKey];
                const isDefaultMode = mode === "0";
                const maxLength = field.isReboot ? 12 : 7;
                const rowBg = !enabled
                  ? "#fafbfc"
                  : idx % 2 === 1
                    ? C.rowAlt
                    : C.cardBg;
                const isLast = idx === fields.length - 1;

                return (
                  <tr
                    key={field.id}
                    style={{
                      background: rowBg,
                      opacity: enabled ? 1 : 0.72,
                    }}
                  >
                    <td
                      style={{
                        ...FK_TD_STYLE,
                        fontSize: 12,
                        color: C.labelText,
                        fontWeight: 600,
                        borderBottom: isLast ? "none" : `1px solid ${C.divider}`,
                        borderRight: `1px solid ${C.divider}`,
                      }}
                    >
                      <FxsFieldLabel
                        tooltipKey={field.functionKeyKey}
                        tooltips={FUNCTION_KEY_FIELD_TOOLTIPS}
                      >
                        {field.name}
                      </FxsFieldLabel>
                    </td>
                    <td
                      style={{
                        ...FK_TD_STYLE,
                        textAlign: "center",
                        borderBottom: isLast ? "none" : `1px solid ${C.divider}`,
                        borderRight: `1px solid ${C.divider}`,
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={enabled}
                        onChange={() => handleEnableChange(field)}
                        sx={checkboxSx}
                      />
                    </td>
                    <td
                      style={{
                        ...FK_TD_STYLE,
                        textAlign: "center",
                        borderBottom: isLast ? "none" : `1px solid ${C.divider}`,
                        borderRight: `1px solid ${C.divider}`,
                      }}
                    >
                      <input
                        id={field.functionKeyKey}
                        type="text"
                        value={functionKey}
                        onChange={(e) =>
                          handleFunctionKeyChange(field, e.target.value)
                        }
                        onKeyPress={handleKeyPress}
                        disabled={!enabled || isDefaultMode}
                        maxLength={maxLength}
                        style={keyInputStyle(enabled && !isDefaultMode)}
                        {...nativeFieldInteraction}
                      />
                    </td>
                    <td
                      style={{
                        ...FK_TD_STYLE,
                        textAlign: "center",
                        borderBottom: isLast ? "none" : `1px solid ${C.divider}`,
                      }}
                    >
                      <select
                        value={mode}
                        onChange={(e) =>
                          handleModeChange(field, e.target.value)
                        }
                        disabled={!enabled}
                        style={modeSelectStyle(enabled)}
                        {...nativeFieldInteraction}
                      >
                        <option value="0">Default</option>
                        <option value="1">User-defined</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
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

      <FunctionKeyBreadcrumb />

      <div style={cardStyle}>
        <div style={cardTitleBarStyle}>{FUNCTION_KEY_CARD_TITLE}</div>

        <div style={cardBodyStyle}>
          {FUNCTION_KEY_SECTIONS_ORDER.map(renderSectionTable)}
        </div>

        <div style={footerStyle}>
          <Btn type="button" variant="primary" onClick={handleSave}>
            {FUNCTION_KEY_SAVE_LABEL}
          </Btn>
          <Btn type="button" variant="cancel" onClick={handleReset}>
            {FUNCTION_KEY_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default FunctionKeyPage;
