import React, { useState } from "react";
import { Alert, Checkbox, Tooltip, useMediaQuery } from "@mui/material";
import {
  NAT_SETTINGS_FIELDS,
  NAT_SETTINGS_NOTE,
  NAT_SETTINGS_FIELD_TOOLTIPS,
  FXS_NAT_SETTINGS_BREADCRUMB_ROOT,
  FXS_NAT_SETTINGS_BREADCRUMB_SECTION,
  FXS_NAT_SETTINGS_PAGE_TITLE,
  FXS_NAT_SETTINGS_CARD_TITLE,
  FXS_NAT_SETTINGS_LEFT_SECTION_TITLE,
  FXS_NAT_SETTINGS_RIGHT_SECTION_TITLE,
  FXS_NAT_SETTINGS_SAVE_LABEL,
  FXS_NAT_SETTINGS_RESET_LABEL,
  FXS_NAT_SETTINGS_NOTE_LABEL,
  FXS_NAT_SETTINGS_SECTION_HEADING_LEFT,
  FXS_NAT_SETTINGS_SECTION_HEADING_COLOR,
  FXS_NAT_SETTINGS_LEFT_COLUMN_FIELD_KEYS,
  FXS_NAT_SETTINGS_RIGHT_COLUMN_FIELD_KEYS,
} from "../../../constants/NatSettingsConstants";

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

const NatFieldRow = ({ label, tooltipKey, children }) => {
  const tooltip = tooltipKey
    ? NAT_SETTINGS_FIELD_TOOLTIPS[tooltipKey] || ""
    : "";
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        flex: "1 1 auto",
        minWidth: 0,
        paddingRight: 16,
        textAlign: "left",
        lineHeight: 1.4,
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
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        minHeight: 36,
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
      {children}
    </div>
  );
};

// ── Local page UI (matches SIP Settings / Compatibility) ──
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
  fieldReadonlyBg: "#f1f5f9",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 8;

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

const nativeFieldInputStyle = {
  height: 36,
  width: "100%",
  maxWidth: 220,
  padding: "0 12px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: C.fieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeFieldSelectStyle = {
  width: "100%",
  maxWidth: 220,
  minHeight: 36,
  height: 36,
  padding: "0 28px 0 12px",
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
  cursor: "pointer",
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

const pageFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const advancedFormInlineFooterStyle = {
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
  borderRadius: 4,
  minWidth: 100,
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

const dashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
};

const dashboardColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: "16px 36px 20px",
  boxSizing: "border-box",
};

const dashboardColumnLeftStyle = {
  ...dashboardColumnStyle,
  background: C.cardBg,
};

const dashboardColumnRightStyle = {
  ...dashboardColumnStyle,
  background: C.cardBg,
};

const noteSectionStyle = {
  width: "100%",
  padding: "16px 36px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
};

const noteTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.strongText,
  marginBottom: 8,
  textAlign: "left",
};

const noteTextStyle = {
  margin: 0,
  color: C.mutedText,
  fontSize: 11,
  lineHeight: 1.5,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  textAlign: "left",
};

const dashboardDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

const dashboardDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

const fxsNatSettingsFieldsColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  width: "100%",
};

const fxsNatSettingsCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const FxsNatSettingsSectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  return (
  <div
    style={{
      margin: isFirst
        ? isLaptopNarrow
          ? "20px 0 24px 0"
          : "12px 0 24px 0"
        : "28px 0 24px 0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.divider}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : FXS_NAT_SETTINGS_SECTION_HEADING_LEFT,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: FXS_NAT_SETTINGS_SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
  );
};

const FxsNatSettingsBreadcrumb = () => (
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
    <span>{FXS_NAT_SETTINGS_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{FXS_NAT_SETTINGS_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {FXS_NAT_SETTINGS_PAGE_TITLE}
    </span>
  </div>
);

const FxsNatSettingsPageShell = ({ children }) => (
  <div style={advancedPageWrapStyle} data-native-scroll>
    <div style={advancedPageInnerStyle}>{children}</div>
  </div>
);

const getInitialState = () => {
  const state = {};
  NAT_SETTINGS_FIELDS.forEach((f) => {
    if (f.type === "select") {
      state[f.key] = f.default || f.options[0] || "";
    } else if (f.type === "checkbox") {
      state[f.key] = f.default !== undefined ? f.default : false;
    } else if (f.type === "readonly") {
      state[f.key] = f.default || "";
    } else {
      state[f.key] = f.default || "";
    }
  });
  return state;
};

const NatSettingsPage = () => {
  const [form, setForm] = useState(getInitialState());
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleChange = (key, value) => {
    const fieldDef = NAT_SETTINGS_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (value === "" || /^\d+$/.test(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    // Prevent checking/unchecking Auto Detect NAT IP when Learn NAT is unchecked
    if (key === "autoDetectNatIp" && !form.learnNat) {
      return;
    }

    setForm((prev) => {
      const newValue = !prev[key];
      const updates = { [key]: newValue };

      // When Learn NAT is unchecked, uncheck Auto Detect NAT IP
      if (key === "learnNat" && !newValue) {
        updates.autoDetectNatIp = false;
      }

      return { ...prev, ...updates };
    });
  };

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setForm(getInitialState());
  };

  // Check if field should be shown based on conditional logic
  const shouldShowField = (field) => {
    if (!field.conditional) return true;

    const conditionalValue = form[field.conditional];

    if (field.conditionalValues) {
      return field.conditionalValues.includes(conditionalValue);
    } else if (field.conditionalValue !== undefined) {
      return conditionalValue === field.conditionalValue;
    } else {
      return !!conditionalValue;
    }
  };

  const fieldInputStyle = {
    ...nativeFieldInputStyle,
    width: "100%",
  };

  const fieldSelectStyle = {
    ...nativeFieldSelectStyle,
    width: "100%",
  };

  const fieldReadonlyStyle = {
    ...fieldInputStyle,
    backgroundColor: C.fieldReadonlyBg,
    lineHeight: "36px",
    display: "flex",
    alignItems: "center",
  };

  const valueColStyle = {
    flex: "1 1 auto",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  };

  const controlSlotStyle = {
    width: 220,
    maxWidth: "100%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  const leftColumnFields = NAT_SETTINGS_FIELDS.filter((f) =>
    FXS_NAT_SETTINGS_LEFT_COLUMN_FIELD_KEYS.includes(f.key),
  );
  const rightColumnFields = NAT_SETTINGS_FIELDS.filter((f) =>
    FXS_NAT_SETTINGS_RIGHT_COLUMN_FIELD_KEYS.includes(f.key),
  );

  const renderFieldControl = (field) => {
    if (field.type === "readonly") {
      return (
        <div style={{ ...fieldReadonlyStyle, width: "100%" }}>
          {form[field.key] || field.default || ""}
        </div>
      );
    }
    if (field.type === "text") {
      return (
        <input
          type="text"
          value={form[field.key]}
          onChange={(e) => handleChange(field.key, e.target.value)}
          style={fieldInputStyle}
          {...nativeFieldInteraction}
        />
      );
    }
    if (field.type === "select") {
      return (
        <select
          value={form[field.key]}
          onChange={(e) => handleChange(field.key, e.target.value)}
          style={fieldSelectStyle}
          {...nativeFieldInteraction}
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === "checkbox") {
      const disabled = field.key === "autoDetectNatIp" && !form.learnNat;
      return (
        <Checkbox
          size="small"
          checked={!!form[field.key]}
          onChange={() => handleCheckbox(field.key)}
          disabled={disabled}
          sx={fxsNatSettingsCheckboxSx}
        />
      );
    }
    return null;
  };

  const renderField = (field) => {
    if (!shouldShowField(field)) return null;

    return (
      <NatFieldRow key={field.key} label={field.label} tooltipKey={field.key}>
        <div style={valueColStyle}>
          <div style={controlSlotStyle}>{renderFieldControl(field)}</div>
        </div>
      </NatFieldRow>
    );
  };

  return (
    <FxsNatSettingsPageShell>
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


      <FxsNatSettingsBreadcrumb />

      <div style={advancedTableContainerStyle}>
        <div style={advancedCardTitleBarStyle}>
          <span>{FXS_NAT_SETTINGS_CARD_TITLE}</span>
        </div>
        <div className="settings-dashboard-grid" style={dashboardGridStyle}>
          <div style={dashboardColumnLeftStyle}>
            <FxsNatSettingsSectionHeading
              title={FXS_NAT_SETTINGS_LEFT_SECTION_TITLE}
              isFirst
            />
            <div style={fxsNatSettingsFieldsColStyle}>
              {leftColumnFields.map((field) => renderField(field))}
            </div>
          </div>

          <div className="settings-dashboard-divider" style={dashboardDividerCellStyle} aria-hidden="true">
            <div style={dashboardDividerLineStyle} />
          </div>

          <div style={dashboardColumnRightStyle}>
            <FxsNatSettingsSectionHeading
              title={FXS_NAT_SETTINGS_RIGHT_SECTION_TITLE}
              isFirst
            />
            <div style={fxsNatSettingsFieldsColStyle}>
              {rightColumnFields.map((field) => renderField(field))}
            </div>
          </div>
        </div>

        {NAT_SETTINGS_NOTE ? (
          <div style={noteSectionStyle}>
            <div style={noteTitleStyle}>{FXS_NAT_SETTINGS_NOTE_LABEL}</div>
            <div style={{ width: "100%", boxSizing: "border-box" }}>
              {NAT_SETTINGS_NOTE.split("\n")
                .filter(Boolean)
                .map((line, index) => (
                  <p
                    key={index}
                    style={{
                      ...noteTextStyle,
                      margin: index === 0 ? 0 : "8px 0 0",
                    }}
                  >
                    {line}
                  </p>
                ))}
            </div>
          </div>
        ) : null}

        <div style={advancedFormInlineFooterStyle}>
          <Btn
            type="button"
            onClick={handleSave}
            variant="primary"
            style={advancedFormBtnStyle}
          >
            {FXS_NAT_SETTINGS_SAVE_LABEL}
          </Btn>
          <Btn
            type="button"
            onClick={handleReset}
            variant="cancel"
            style={advancedFormBtnStyle}
          >
            {FXS_NAT_SETTINGS_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </FxsNatSettingsPageShell>
  );
};

export default NatSettingsPage;
