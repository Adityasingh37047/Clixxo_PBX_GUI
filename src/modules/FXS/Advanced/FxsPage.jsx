import React, { useState } from "react";
import {
  FXS_INITIAL_FORM,
  FXS_FIELD_TOOLTIPS,
  FXS_FIELDS,
  FXS_PAGE_BREADCRUMB_ROOT,
  FXS_PAGE_BREADCRUMB_SECTION,
  FXS_PAGE_TITLE,
  FXS_PAGE_CARD_TITLE,
  FXS_SAVE_LABEL,
  FXS_RESET_LABEL,
  FXS_LEFT_COLUMN_FIELD_KEYS,
  FXS_RIGHT_COLUMN_FIELD_KEYS,
} from "../../../constants/FxsConstants";
import { Alert, Checkbox, Tooltip } from "@mui/material";
// ── Local page UI (inlined from fxsSharedUi) ──

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

const FIELD_CONTROL_WIDTH = 220;
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

const nativeFieldSelectStyle = {
  width: "100%",
  minWidth: FIELD_CONTROL_WIDTH,
  maxWidth: FIELD_CONTROL_WIDTH,
  height: FIELD_CONTROL_HEIGHT,
  minHeight: FIELD_CONTROL_HEIGHT,
  padding: "0 28px 0 12px",
  fontSize: nativeFieldInputStyle.fontSize,
  lineHeight: `${FIELD_CONTROL_HEIGHT - 2}px`,
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

const fxsPageCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const FxsFieldRow = ({ label, tooltipKey, children, isLongLabel = false }) => {
  const tooltip = tooltipKey ? FXS_FIELD_TOOLTIPS[tooltipKey] || "" : "";
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
        lineHeight: 1.45,
        cursor: tooltip ? "help" : undefined,
        whiteSpace: "normal",
        overflowWrap: "break-word",
        wordBreak: "break-word",
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
        width: "100%",
        minHeight: 36,
        alignItems: isLongLabel ? "flex-start" : "center",
        paddingTop: isLongLabel ? 6 : 0,
        paddingBottom: isLongLabel ? 6 : 0,
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
  borderRadius: 10,
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
  padding: "20px 36px 20px",
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

const fxsPageFieldsColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  width: "100%",
};

const FxsAdvancedBreadcrumb = () => (
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
    <span>{FXS_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{FXS_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {FXS_PAGE_TITLE}
    </span>
  </div>
);

const FxsAdvancedPageShell = ({ children }) => (
  <div style={advancedPageWrapStyle} data-native-scroll>
    <div style={advancedPageInnerStyle}>{children}</div>
  </div>
);

const getFieldByKey = (key) => FXS_FIELDS.find((field) => field.key === key);

const FxsPage = () => {
  // Form state
  const [formData, setFormData] = useState(FXS_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // Keep existing alert(...) calls, but render them as toast notifications.
  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleKeyPress = (e, type) => {
    const key = e.keyCode || e.which;
    // Allow digits (48-57), comma (44), minus (45), backspace (8)
    if (type === "number") {
      if (!((key > 47 && key < 58) || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-comma-minus") {
      // For ringMode field
      if (!((key > 47 && key < 58) || key === 44 || key === 45 || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-minus") {
      // For fields that allow negative numbers
      if (!((key > 47 && key < 58) || key === 45 || key === 8)) {
        e.preventDefault();
      }
    }
  };

  const validateForm = () => {
    // Validate Ringing Mode if enabled
    if (formData.ringingSchemeEnabled && !formData.ringMode) {
      alert("Please input a ringing mode for Scheme!");
      return false;
    }

    if (formData.ringingSchemeEnabled && formData.ringMode) {
      const strArr = formData.ringMode.split(",");
      if (strArr[0] === "1") {
        if (strArr.length !== 3) {
          alert("Please input a ringing mode in the right format for Scheme!");
          return false;
        }
        const sum = parseInt(strArr[1]) + parseInt(strArr[2]);
        if (sum > 16000) {
          alert(
            "The sum duration at ON/OFF state for ringing scheme cannot be more than 16000ms！",
          );
          return false;
        }
        if (parseInt(strArr[1]) > 12000 || parseInt(strArr[2]) > 12000) {
          alert(
            "The duration at ON/OFF state for ringing scheme cannot be more than 12000ms！",
          );
          return false;
        }
        const minKeepTime = 50;
        if (
          parseInt(strArr[1]) < minKeepTime ||
          parseInt(strArr[2]) < minKeepTime
        ) {
          alert(
            "The duration at ON/OFF state for ringing scheme cannot be less than 50ms!",
          );
          return false;
        }
      } else if (strArr[0] === "2") {
        if (strArr.length !== 5) {
          alert("Please input a ringing mode in the right format for Scheme!");
          return false;
        }
        const sum =
          parseInt(strArr[1]) +
          parseInt(strArr[2]) +
          parseInt(strArr[3]) +
          parseInt(strArr[4]);
        if (sum > 16000) {
          alert(
            "The sum duration at ON/OFF state for ringing scheme cannot be more than 16000ms！",
          );
          return false;
        }
        if (
          parseInt(strArr[1]) > 12000 ||
          parseInt(strArr[2]) > 12000 ||
          parseInt(strArr[3]) > 12000 ||
          parseInt(strArr[4]) > 12000
        ) {
          alert(
            "The duration at ON/OFF state for ringing scheme cannot be more than 12000ms！",
          );
          return false;
        }
        const minKeepTime = 50;
        if (
          parseInt(strArr[1]) < minKeepTime ||
          parseInt(strArr[2]) < minKeepTime ||
          parseInt(strArr[3]) < minKeepTime ||
          parseInt(strArr[4]) < minKeepTime
        ) {
          alert(
            "The duration at ON/OFF state for ringing scheme cannot be less than 50ms!",
          );
          return false;
        }
      } else {
        alert("Please input a ringing mode in the right format for Scheme!");
        return false;
      }
    }

    // Validate Tone Energy
    const toneEnergy = parseInt(formData.toneEnergy);
    if (isNaN(toneEnergy) || toneEnergy < -35 || toneEnergy > 15) {
      alert("The value range of 'Tone Energy' is -35~15dB!");
      return false;
    }

    // Validate Hook-flash times if enabled
    if (formData.hookFlashDetection) {
      const hookFlashMinTime = parseInt(formData.hookFlashMinTime);
      const hookFlashMaxTime = parseInt(formData.hookFlashMaxTime);

      if (hookFlashMinTime < 80) {
        alert(
          "The minimum time for Hook-flash detection must be longer than 80ms!",
        );
        return false;
      }
      if (hookFlashMinTime > hookFlashMaxTime) {
        alert(
          "The minimum time for Hook-flash detection can not exceed the maximum time!",
        );
        return false;
      }
      if (hookFlashMaxTime < 80 || hookFlashMaxTime > 2000) {
        alert("The value range of 'Flash Signal Detection' is 80~2000ms");
        return false;
      }
    } else {
      // Validate Minimum Time Length of On-hook Detection
      const minHangupTime = parseInt(formData.minHangupTime);
      if (minHangupTime < 64 || minHangupTime > 2000) {
        alert(
          "The minimum time length of on-hook detection must be in the range of 64ms~2000ms!",
        );
        return false;
      }
    }

    // Validate Off-hook Dither Signal Duration
    const offHookDither = parseInt(formData.offHookDitherSignalDuration);
    if (offHookDither <= 0 || offHookDither % 16 !== 0) {
      alert(
        "Off-hook Dither Signal Duration must be longer than 0 and the integral times of 16!",
      );
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      alert("Settings saved successfully!");
    }
  };

  const handleReset = () => {
    setFormData({ ...FXS_INITIAL_FORM });
  };

  const shouldShowField = (field) => {
    if (!field?.conditional) return true;
    const conditionalValue = formData[field.conditional];
    if (field.conditionalValue !== undefined) {
      return conditionalValue === field.conditionalValue;
    }
    return !!conditionalValue;
  };

  const fieldInputStyle = {
    ...nativeFieldInputStyle,
  };

  const fieldSelectStyle = {
    ...nativeFieldSelectStyle,
  };

  const valueColStyle = {
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  };

  const controlSlotStyle = {
    width: FIELD_CONTROL_WIDTH,
    minWidth: FIELD_CONTROL_WIDTH,
    maxWidth: FIELD_CONTROL_WIDTH,
    height: FIELD_CONTROL_HEIGHT,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  const renderField = (fieldKey) => {
    const field = getFieldByKey(fieldKey);
    if (!field || !shouldShowField(field)) return null;

    const isLongLabel =
      field.label.length >= 42 ||
      field.key === "minHangupTime" ||
      field.key === "preferred18xResponse";

    return (
      <FxsFieldRow
        key={field.key}
        label={field.label}
        tooltipKey={field.key}
        isLongLabel={isLongLabel}
      >
        <div style={valueColStyle}>
          <div style={controlSlotStyle}>
            {field.type === "text" && (
              <input
                type="text"
                name={field.key}
                value={formData[field.key]}
                onChange={handleInputChange}
                onKeyPress={(e) =>
                  handleKeyPress(e, field.keyPressType || "number")
                }
                style={fieldInputStyle}
                {...nativeFieldInteraction}
                maxLength={field.maxLength || "31"}
              />
            )}
            {field.type === "select" && (
              <select
                name={field.key}
                value={formData[field.key]}
                onChange={handleInputChange}
                style={fieldSelectStyle}
                {...nativeFieldInteraction}
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {field.type === "checkbox" && (
              <Checkbox
                size="small"
                name={field.key}
                checked={!!formData[field.key]}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    [field.key]: !prev[field.key],
                  }))
                }
                sx={fxsPageCheckboxSx}
              />
            )}
          </div>
        </div>
      </FxsFieldRow>
    );
  };

  const leftColumnFields = FXS_LEFT_COLUMN_FIELD_KEYS.map((key) =>
    renderField(key),
  );
  const rightColumnFields = FXS_RIGHT_COLUMN_FIELD_KEYS.map((key) =>
    renderField(key),
  );

  return (
    <FxsAdvancedPageShell>
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

      <FxsAdvancedBreadcrumb />

      <div style={advancedTableContainerStyle}>
        <div style={advancedCardTitleBarStyle}>
          <span>{FXS_PAGE_CARD_TITLE}</span>
        </div>
        <div className="settings-dashboard-grid" style={dashboardGridStyle}>
          <div style={dashboardColumnLeftStyle}>
            <div style={fxsPageFieldsColStyle}>{leftColumnFields}</div>
          </div>

          <div className="settings-dashboard-divider" style={dashboardDividerCellStyle} aria-hidden="true">
            <div style={dashboardDividerLineStyle} />
          </div>

          <div style={dashboardColumnRightStyle}>
            <div style={fxsPageFieldsColStyle}>{rightColumnFields}</div>
          </div>
        </div>

        <div style={advancedFormInlineFooterStyle}>
          <Btn
            type="button"
            variant="primary"
            onClick={handleSave}
            style={advancedFormBtnStyle}
          >
            {FXS_SAVE_LABEL}
          </Btn>
          <Btn
            type="button"
            variant="cancel"
            onClick={handleReset}
            style={advancedFormBtnStyle}
          >
            {FXS_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </FxsAdvancedPageShell>
  );
};

export default FxsPage;
