import React, { useState } from "react";
import {
  RADIUS_FIELDS,
  LOCAL_IP_OPTIONS,
  CALL_TYPE_OPTIONS,
  RADIUS_BUTTONS,
} from "../../../constants/RadiusConstants";
import {
  Checkbox,
  Select,
  MenuItem,
  FormControlLabel,
  Alert,
} from "@mui/material";
// ── Color palette (same as AccountManage) ────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#3E5475",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

const SYS_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};
// ── Local field UI (inlined from maitenanceSharedUi) ──
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

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onFocus(e);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onBlur(e);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseEnter(e);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseLeave(e);
  },
};

const getSystemToolsInputInteraction = (hasError, errorColor = "#dc2626") => {
  if (!hasError) return inputInteraction;
  const ring = (el, focused) => {
    el.style.borderColor = errorColor;
    el.style.borderWidth = "1px";
    el.style.boxShadow = focused ? `0 0 0 1px ${errorColor}` : "none";
  };
  return {
    onFocus: (e) => ring(e.target, true),
    onBlur: (e) => ring(e.target, false),
    onMouseEnter: (e) => ring(e.target, document.activeElement === e.target),
    onMouseLeave: (e) => ring(e.target, document.activeElement === e.target),
  };
};

const systemToolsFieldInputStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 14,
  width: "100%",
  backgroundColor: "#f8fafc",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "#ffffff";
const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "#f1f5f9";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

const systemToolsEditableFieldInputStyle = {
  ...systemToolsFieldInputStyle,
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
};
const systemToolsEditableMuiSelectSx = {
  ...muiSelectSx,
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
  borderRadius: "6px",
  fontSize: 14,
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
  },
};
const inputStyle = systemToolsEditableFieldInputStyle;
const systemToolsMuiSelectSx = systemToolsEditableMuiSelectSx;

const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "calc(100% + 40px)",
  marginLeft: -20,
  marginRight: -20,
  marginTop: 0,
  marginBottom: 0,
  padding: "10px 20px 10px",
  borderTop: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

const advancedFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

// ── Button Component (same as AccountManage) ─────────────────────────────────
const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-white text-[#0f172a] border-[#9ca3af] hover:bg-[#e2e8f0]`;
const BTN_OUTLINE = `${BTN_BASE} bg-white text-[#3E5475] border-[#9CA3AF] hover:bg-[#e2e8f0]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_ERROR = `${BTN_BASE} bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]`;
const BTN_DELETE = `${BTN_BASE} bg-[#fee2e2] text-[#991b1b] border-[#fecaca] hover:bg-[#fecaca]`;
const BTN_EDIT = `${BTN_BASE} bg-[#dcfce7] text-[#166534] border-[#bbf7d0] hover:bg-[#bbf7d0]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  error: BTN_ERROR,
  delete: BTN_DELETE,
  edit: BTN_EDIT,
  danger: BTN_ERROR,
};

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title, startIcon }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {startIcon && <span className="inline-flex items-center">{startIcon}</span>}
    {children}
  </button>
);

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  marginBottom: 8,
};

const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.divider}`,
};

const callTypeCheckboxSx = {
  padding: "6px 8px",
  "& .MuiSvgIcon-root": { fontSize: 20 },
  color: "#64748b",
  "&.Mui-checked": { color: C.accent },
};

const CallTypeCheckbox = ({ checked, onChange, name, value, label }) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={checked}
        onChange={onChange}
        name={name}
        value={value}
        sx={callTypeCheckboxSx}
      />
    }
    label={<span style={{ fontSize: 14, color: C.valueText }}>{label}</span>}
    sx={{ margin: 0, marginLeft: 0 }}
    className="m-0 min-w-[140px] sm:min-w-[160px]"
  />
);

const ENABLE_CHECKBOX_FIELDS = RADIUS_FIELDS.filter(
  (f) => f.type === "checkbox",
);
const RADIUS_FORM_FIELDS = RADIUS_FIELDS.filter((f) => f.type !== "checkbox");

const RADIUS_INITIAL_FORM = {
  radius: false,
  certification: false,
  allowCalls: false,
  localIp: "",
  masterServer: "",
  sharedKey: "",
  spareServer: "",
  spareSharedKey: "",
  timeout: "",
  retransmission: "",
  transmitInterval: "",
  callType: [],
};

const Radius = () => {
  const [form, setForm] = useState(RADIUS_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCallTypeChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const arr = prev.callType || [];
      if (checked) {
        return { ...prev, callType: [...arr, value] };
      } else {
        return { ...prev, callType: arr.filter((v) => v !== value) };
      }
    });
  };

  const handleReset = () => {
    setForm(RADIUS_INITIAL_FORM);
    showToast("Form reset to default.", "success");
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast("Radius settings saved successfully!", "success");
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* ── Alerts ── */}
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={SYS_TOAST_SX}
        >
          {toast.msg}
        </Alert>
      )}

      {/* ── Breadcrumb ── */}
      <div className="w-full" style={{ maxWidth: 1000 }}>
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>Maintenance</span>
          <span>&gt;</span>
          <span>System Tool</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>Radius</span>
        </div>

        <form onSubmit={handleSave} autoComplete="off">
          <div style={tableContainerStyle}>
            {/* Header */}
            <div style={blueBarStyle}>
              <span>Radius Configuration</span>
            </div>

            <div className="px-5 pt-3 pb-0">
              <div
                className="w-full max-w-[640px] mx-auto"
                style={{ marginBottom: 12 }}
              >
                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {/* Enable checkboxes — same spacing as Call Type list, tighter rows only */}
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                    {ENABLE_CHECKBOX_FIELDS.map((field) => (
                      <React.Fragment key={field.name}>
                        <div className="flex items-center text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 break-words">
                          <span style={{ color: C.labelText }}>
                            {field.label}
                          </span>
                        </div>
                        <div className="flex items-center pl-2 sm:pl-0">
                          <CallTypeCheckbox
                            checked={!!form[field.name]}
                            onChange={handleChange}
                            name={field.name}
                            label={field.enableLabel}
                          />
                        </div>
                      </React.Fragment>
                    ))}
                  </div>

                  {RADIUS_FORM_FIELDS.map((field) =>
                    field.type === "checkboxGroup" ? (
                      <React.Fragment key={field.name || "callTypeGroup"}>
                        <div className="flex items-start min-h-[34px] pt-2 text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 break-words">
                          <span style={{ color: C.labelText }}>
                            {field.label}
                          </span>
                        </div>
                        <div className="flex flex-col min-h-[34px] pl-2 sm:pl-0 gap-0 pt-0.5">
                          {CALL_TYPE_OPTIONS.map((opt) => (
                            <CallTypeCheckbox
                              key={opt.value}
                              checked={form.callType.includes(opt.value)}
                              onChange={handleCallTypeChange}
                              name="callType"
                              value={opt.value}
                              label={opt.label}
                            />
                          ))}
                        </div>
                      </React.Fragment>
                    ) : (
                      <React.Fragment key={field.name}>
                        <div className="flex items-center text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 break-words min-h-[34px]">
                          <span style={{ color: C.labelText }}>
                            {field.label}
                          </span>
                        </div>
                        <div className="flex items-center min-h-[34px] pl-2 sm:pl-0">
                          {field.type === "select" ? (
                            <Select
                              value={form[field.name] || ""}
                              onChange={handleChange}
                              name={field.name}
                              size="small"
                              variant="outlined"
                              className="w-full"
                              displayEmpty
                              sx={{
                                ...systemToolsMuiSelectSx,
                                width: "100%",
                              }}
                            >
                              <MenuItem value="">
                                <em>Select Local IP</em>
                              </MenuItem>
                              {LOCAL_IP_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <input
                              type={
                                field.type === "password" ? "password" : "text"
                              }
                              name={field.name}
                              value={form[field.name] || ""}
                              onChange={handleChange}
                              style={inputStyle}
                              {...inputInteraction}
                            />
                          )}
                        </div>
                      </React.Fragment>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                ...advancedFormInlineFooterStyle,
                width: "100%",
                marginLeft: 0,
                marginRight: 0,
              }}
            >
              <Btn
                type="button"
                variant="cancel"
                onClick={handleReset}
                style={advancedFormBtnStyle}
              >
                Reset
              </Btn>
              <Btn
                type="submit"
                variant="primary"
                onClick={handleSave}
                style={advancedFormBtnStyle}
              >
                Save
              </Btn>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Radius;
