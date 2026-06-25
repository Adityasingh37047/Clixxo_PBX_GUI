import React, { useState } from "react";
import { Alert, Checkbox, Tooltip } from "@mui/material";
import {
  SIP_COMPATIBILITY_FIELDS,
  SIP_COMPATIBILITY_FIELD_TOOLTIPS,
} from "../../../constants/SipCompatibilityConstants";

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
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  accent: "var(--accent-brand)",
  amber: "#dc2626",
};

const FXS_VOIP_COMPAT_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const FXS_VOIP_COMPAT_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const FXS_VOIP_COMPAT_TABLE_CONTAINER =
  "w-full max-w-full mx-auto overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_4px_20px_rgba(15,23,42,0.06)]";
const FXS_VOIP_COMPAT_BLUE_BAR =
  "flex w-full min-h-[44px] flex-wrap items-center justify-start gap-[12px] rounded-t-[10px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] text-[13px] font-bold text-[var(--text-label)]";
const FXS_VOIP_COMPAT_FORM_FOOTER =
  "flex w-full flex-wrap items-center justify-center gap-[12px] border-t border-[var(--border-strong)] box-border px-[20px] py-[10px]";

const BTN_FORM_PRIMARY =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";

const BTN_FORM_CANCEL =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";

const Btn = ({ children, onClick, disabled, variant = "formPrimary", type }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={variant === "formCancel" ? BTN_FORM_CANCEL : BTN_FORM_PRIMARY}
  >
    {children}
  </button>
);

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

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
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const FXS_VOIP_COMPAT_FIELD_INTERACTION = {
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

const getFxsNativeFieldInteraction = (disabled) =>
  disabled ? {} : FXS_VOIP_COMPAT_FIELD_INTERACTION;

const FXS_VOIP_COMPAT_INPUT_STYLE = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "var(--bg-surface)",
  color: "var(--text-primary)",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const FXS_VOIP_COMPAT_SELECT_STYLE = {
  width: FXS_VOIP_COMPAT_INPUT_STYLE.width,
  minHeight: 32,
  padding: "6px 28px 6px 8px",
  fontSize: FXS_VOIP_COMPAT_INPUT_STYLE.fontSize,
  lineHeight: 1.35,
  border: FXS_VOIP_COMPAT_INPUT_STYLE.border,
  borderRadius: FXS_VOIP_COMPAT_INPUT_STYLE.borderRadius,
  outline: FXS_VOIP_COMPAT_INPUT_STYLE.outline,
  backgroundColor: FXS_VOIP_COMPAT_INPUT_STYLE.backgroundColor,
  color: FXS_VOIP_COMPAT_INPUT_STYLE.color,
  boxSizing: FXS_VOIP_COMPAT_INPUT_STYLE.boxSizing,
  transition: FXS_VOIP_COMPAT_INPUT_STYLE.transition,
  appearance: "auto",
};

const FxsVoipCompatBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>VoIP</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const FxsVoipCompatPageShell = ({ children, fullWidth = false }) => (
  <div className={FXS_VOIP_COMPAT_PAGE_WRAP}>
    <div className={fullWidth ? "w-full max-w-full mx-auto" : FXS_VOIP_COMPAT_PAGE_INNER}>
      {children}
    </div>
  </div>
);

const checkboxSx = {
  padding: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 18 },
};

const FormEnableCheckbox = ({
  checked,
  onChange,
  name,
  label = "Enable",
  id,
}) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
    }}
  >
    <Checkbox
      id={id || name}
      name={name}
      size="small"
      checked={!!checked}
      onChange={onChange}
      sx={checkboxSx}
    />
    <span style={{ fontSize: 13, color: C.valueText }}>{label}</span>
  </label>
);

const getInitialState = () => {
  const state = {};
  SIP_COMPATIBILITY_FIELDS.forEach((f) => {
    if (f.type === "select") {
      state[f.key] = f.options[0] || f.default || "";
    } else if (f.type === "checkbox") {
      state[f.key] = f.default || false;
    } else {
      state[f.key] = f.default || "";
    }
  });
  return state;
};

const SipCompatibilityPage = () => {
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
    const fieldDef = SIP_COMPATIBILITY_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (value === "" || /^\d+$/.test(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
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

    // Special case for Key field: show when sipEncryption is checked
    // (it will show regardless of encryptionCriterion value)
    if (field.key === "key") {
      return !!form.sipEncryption;
    }

    if (field.conditionalValues) {
      return field.conditionalValues.includes(conditionalValue);
    } else if (field.conditionalValue !== undefined) {
      return conditionalValue === field.conditionalValue;
    } else {
      return !!conditionalValue;
    }
  };

  const fieldInputStyle = {
    ...FXS_VOIP_COMPAT_INPUT_STYLE,
    width: 220,
  };

  const fieldSelectStyle = {
    ...FXS_VOIP_COMPAT_SELECT_STYLE,
    width: 220,
  };

  const labelColStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: C.labelText,
    flex: "0 0 48%",
    maxWidth: "48%",
    paddingRight: 24,
    textAlign: "left",
    lineHeight: 1.35,
  };

  const valueColStyle = {
    flex: "1 1 52%",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  };

  /** Same width as inputs; checkboxes align at the left edge of fill boxes */
  const controlSlotStyle = {
    width: 220,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  return (
    <FxsVoipCompatPageShell>
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
      <FxsVoipCompatBreadcrumb current="SIP Compatibility" />
      <div className={FXS_VOIP_COMPAT_TABLE_CONTAINER} style={{ marginBottom: 0 }}>
        <div className={FXS_VOIP_COMPAT_BLUE_BAR}>
          <span>SIP Compatibility</span>
        </div>
        <div style={{ padding: "24px 32px 0" }}>
          <div style={{ marginBottom: 12 }}>
            <div
              className="flex flex-col gap-3"
              style={{
                width: "100%",
                maxWidth: 640,
                margin: "0 auto",
              }}
            >
              {SIP_COMPATIBILITY_FIELDS.map((field) => {
                if (!shouldShowField(field)) return null;

                return (
                  <div
                    key={field.key}
                    className="flex flex-row items-start w-full"
                    style={{ gap: 0 }}
                  >
                    <label style={labelColStyle}>
                      <FxsFieldLabel
                        tooltipKey={field.key}
                        tooltips={SIP_COMPATIBILITY_FIELD_TOOLTIPS}
                      >
                        {field.label}
                      </FxsFieldLabel>
                    </label>
                    <div style={valueColStyle}>
                      {field.type === "text" && (
                        <div
                          style={{
                            ...controlSlotStyle,
                            width: field.key === "fxoHangupTime" ? "auto" : 220,
                            minWidth: 220,
                          }}
                        >
                          <input
                            type="text"
                            value={form[field.key]}
                            onChange={(e) =>
                              handleChange(field.key, e.target.value)
                            }
                            style={fieldInputStyle}
                            {...FXS_VOIP_COMPAT_FIELD_INTERACTION}
                          />
                          {field.key === "fxoHangupTime" && (
                            <span
                              style={{
                                color: C.valueText,
                                fontSize: 13,
                                flexShrink: 0,
                                marginLeft: 4,
                              }}
                            >
                              s
                            </span>
                          )}
                        </div>
                      )}

                      {field.type === "select" && (
                        <div style={controlSlotStyle}>
                          <select
                            value={form[field.key]}
                            onChange={(e) =>
                              handleChange(field.key, e.target.value)
                            }
                            style={fieldSelectStyle}
                            {...FXS_VOIP_COMPAT_FIELD_INTERACTION}
                          >
                            {field.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {field.type === "checkbox" && (
                        <div style={controlSlotStyle}>
                          <FormEnableCheckbox
                            checked={!!form[field.key]}
                            onChange={() => handleCheckbox(field.key)}
                            name={field.key}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className={FXS_VOIP_COMPAT_FORM_FOOTER}>
          <Btn type="button" onClick={handleSave} variant="formPrimary">
            Save
          </Btn>
          <Btn type="button" onClick={handleReset} variant="formCancel">
            Reset
          </Btn>
        </div>
      </div>
    </FxsVoipCompatPageShell>
  );
};

export default SipCompatibilityPage;
