import React, { useState } from "react";
import { Alert, Checkbox } from "@mui/material";
import {
  NAT_SETTINGS_FIELDS,
  NAT_SETTINGS_NOTE,
} from "../../../constants/NatSettingsConstants";

// ── Local page UI (inlined from fxsSharedUi) ──
const C = {
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
};

const FXS_VOIP_NAT_PAGE_WRAP =
  "bg-[#f8fafc] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const FXS_VOIP_NAT_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const FXS_VOIP_NAT_TABLE_CONTAINER =
  "w-full max-w-full mx-auto overflow-hidden rounded-[10px] border-[1.5px] border-[#9CA3AF] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]";
const FXS_VOIP_NAT_BLUE_BAR =
  "flex w-full min-h-[44px] flex-wrap items-center justify-start gap-[12px] rounded-t-[10px] border-b border-[#9CA3AF] bg-white px-[14px] py-[7px] text-[13px] font-bold text-[#3E5475]";
const FXS_VOIP_NAT_FORM_FOOTER =
  "flex w-full flex-wrap items-center justify-center gap-[12px] border-t border-[#9CA3AF] box-border px-[20px] py-[10px]";

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

const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

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

const FXS_VOIP_NAT_FIELD_INTERACTION = {
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

const FXS_VOIP_NAT_INPUT_STYLE = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: "#0f172a",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const FXS_VOIP_NAT_SELECT_STYLE = {
  width: FXS_VOIP_NAT_INPUT_STYLE.width,
  minHeight: 32,
  padding: "6px 28px 6px 8px",
  fontSize: FXS_VOIP_NAT_INPUT_STYLE.fontSize,
  lineHeight: 1.35,
  border: FXS_VOIP_NAT_INPUT_STYLE.border,
  borderRadius: FXS_VOIP_NAT_INPUT_STYLE.borderRadius,
  outline: FXS_VOIP_NAT_INPUT_STYLE.outline,
  backgroundColor: FXS_VOIP_NAT_INPUT_STYLE.backgroundColor,
  color: FXS_VOIP_NAT_INPUT_STYLE.color,
  boxSizing: FXS_VOIP_NAT_INPUT_STYLE.boxSizing,
  transition: FXS_VOIP_NAT_INPUT_STYLE.transition,
  appearance: "auto",
};

const FxsVoipNatBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>VoIP</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const FxsVoipNatPageShell = ({ children, fullWidth = false }) => (
  <div className={FXS_VOIP_NAT_PAGE_WRAP}>
    <div className={fullWidth ? "w-full max-w-full mx-auto" : FXS_VOIP_NAT_PAGE_INNER}>
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

const NAT_SETTINGS_SECTION_HEADING_COLOR = "#30415A";

const NatSettingsSectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: NAT_SETTINGS_SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
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

  // Group fields by section and method
  const groupedFields = NAT_SETTINGS_FIELDS.reduce((acc, field) => {
    if (!shouldShowField(field)) return acc;

    const sectionKey = field.section;
    if (!acc[sectionKey]) {
      acc[sectionKey] = {};
    }

    const methodKey = field.method || "no-method";
    if (!acc[sectionKey][methodKey]) {
      acc[sectionKey][methodKey] = [];
    }

    acc[sectionKey][methodKey].push(field);
    return acc;
  }, {});

  const fieldInputStyle = {
    ...FXS_VOIP_NAT_INPUT_STYLE,
    width: 220,
  };

  const fieldSelectStyle = {
    ...FXS_VOIP_NAT_SELECT_STYLE,
    width: 220,
  };

  const fieldLabelStyle = {
    width: 220,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 600,
    color: C.labelText,
    textAlign: "left",
  };

  const fieldControlStyle = {
    width: 220,
    flexShrink: 0,
  };

  const renderFieldRow = (field) => (
    <div
      key={field.key}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <label style={fieldLabelStyle}>{field.label}</label>
      <div style={fieldControlStyle}>{renderFieldControl(field)}</div>
    </div>
  );

  const renderFieldControl = (field) => {
    if (field.type === "readonly") {
      return (
        <div
          style={{
            ...fieldInputStyle,
            lineHeight: "28px",
            backgroundColor: "#e5e7eb",
          }}
        >
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
          {...FXS_VOIP_NAT_FIELD_INTERACTION}
        />
      );
    }
    if (field.type === "select") {
      return (
        <select
          value={form[field.key]}
          onChange={(e) => handleChange(field.key, e.target.value)}
          style={fieldSelectStyle}
          {...FXS_VOIP_NAT_FIELD_INTERACTION}
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
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <Checkbox
            size="small"
            checked={!!form[field.key]}
            onChange={() => handleCheckbox(field.key)}
            disabled={disabled}
            sx={{
              ...checkboxSx,
              ...(disabled
                ? { opacity: 0.6, cursor: "not-allowed" }
                : { cursor: "pointer" }),
            }}
          />
          <span
            style={{
              color: C.valueText,
              fontSize: 13,
              opacity: disabled ? 0.6 : 1,
            }}
          >
            Enable
          </span>
        </label>
      );
    }
    return null;
  };

  return (
    <FxsVoipNatPageShell>
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
      <FxsVoipNatBreadcrumb current="NAT Settings" />
      <div className={FXS_VOIP_NAT_TABLE_CONTAINER} style={{ marginBottom: 0 }}>
        <div className={FXS_VOIP_NAT_BLUE_BAR}>
          <span>NAT Settings</span>
        </div>
        <div style={{ padding: "24px 32px 0" }}>
          <div style={{ marginBottom: 12 }}>
            <div className="flex flex-col gap-4 w-full">
              {Object.entries(groupedFields).map(
                ([sectionName, methods], sectionIdx) => (
                  <div key={sectionName} className="flex flex-col gap-2 w-full">
                    <NatSettingsSectionHeading
                      title={sectionName}
                      isFirst={sectionIdx === 0}
                    />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        className="flex flex-col gap-6"
                        style={{ width: "fit-content", maxWidth: "100%" }}
                      >
                        {Object.entries(methods).map(([methodName, fields]) => (
                          <div
                            key={`${sectionName}-${methodName}`}
                            className="flex flex-col gap-2"
                          >
                            {methodName !== "no-method" && (
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: NAT_SETTINGS_SECTION_HEADING_COLOR,
                                  paddingLeft: methodName.endsWith("-")
                                    ? 0
                                    : 24,
                                }}
                              >
                                {methodName}
                              </div>
                            )}

                            <div
                              className="flex flex-col gap-2"
                              style={{
                                paddingLeft:
                                  methodName !== "no-method" ? 24 : 0,
                              }}
                            >
                              {fields.map((field) => renderFieldRow(field))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ),
              )}

              <div className="flex flex-col gap-0 w-full">
                <NatSettingsSectionHeading title="Note:" />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "max-content",
                      maxWidth: "100%",
                      textAlign: "left",
                    }}
                  >
                    {NAT_SETTINGS_NOTE.split("\n")
                      .filter(Boolean)
                      .map((line, index) => (
                        <p
                          key={index}
                          style={{
                            margin: 0,
                            color: C.mutedText,
                            fontSize: 11,
                            lineHeight: 1.45,
                            whiteSpace: "nowrap",
                            textAlign: "left",
                          }}
                        >
                          {line}
                        </p>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={FXS_VOIP_NAT_FORM_FOOTER}>
          <Btn type="button" onClick={handleSave} variant="formPrimary">
            Save
          </Btn>
          <Btn type="button" onClick={handleReset} variant="formCancel">
            Reset
          </Btn>
        </div>
      </div>
    </FxsVoipNatPageShell>
  );
};

export default NatSettingsPage;
