import React, { useState } from "react";
import {
  IDS_TYPES,
  IDS_INITIAL_FORM,
  IDS_WARNING_LOG,
  IDS_LOG_NOTE,
} from "../../../constants/IDSSettingsConstants";
import { Alert, Checkbox } from "@mui/material";
// ── Color palette (same as AccountManage) ────────────────────────────────────
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  divider: "var(--border-subtle)",
  cardShadow: "var(--shadow-soft)",
  labelText: "var(--text-primary)",
  valueText: "#3E5475",
  strongText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
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
  backgroundColor: "var(--row-alt)",
  outline: "none",
  color: "var(--text-primary)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "var(--bg-main)";
const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "var(--bg-muted)";

const systemToolsEditableFieldInputStyle = {
  ...systemToolsFieldInputStyle,
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
};
const systemToolsEditableFieldInputStyleCompact = {
  ...systemToolsFieldInputStyle,
  padding: "4px 10px",
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
};
const systemToolsReadOnlyFieldTextAreaStyle = {
  fontSize: 13,
  padding: "12px",
  backgroundColor: SYSTEM_TOOLS_FILL_BG_READ_ONLY,
  border: `1px solid ${OUTLINED_BORDER}`,
  color: "var(--text-primary)",
  outline: "none",
  fontFamily: "monospace",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
  borderRadius: 6,
  width: "100%",
};

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
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[var(--border-subtle)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:opacity-90`;
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
  color: "var(--text-primary)",
  borderBottom: `1px solid ${C.divider}`,
};

const IDSSettings = () => {
  const [form, setForm] = useState(IDS_INITIAL_FORM);
  const [log, setLog] = useState(IDS_WARNING_LOG);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleCheckbox = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const handleEnable = () => {
    setForm((prev) => ({ ...prev, enable: !prev.enable }));
  };
  const handleWarningThreshold = (idx, value) => {
    const arr = [...form.warningThresholds];
    arr[idx] = value;
    setForm((prev) => ({ ...prev, warningThresholds: arr }));
  };
  const handleBlacklistThreshold = (idx, value) => {
    const arr = [...form.blacklistThresholds];
    arr[idx] = value;
    setForm((prev) => ({ ...prev, blacklistThresholds: arr }));
  };
  const handleValidity = (value) => {
    setForm((prev) => ({ ...prev, blacklistValidity: value }));
  };
  const handleSave = (e) => {
    e.preventDefault();
    showToast("IDS Settings saved successfully!", "success");
  };
  const handleReset = () => {
    setForm(IDS_INITIAL_FORM);
    showToast("Form reset to default values", "info");
  };
  const handleDownload = () => {
    showToast("Download started", "success");
  };

  return (
    <div
      className="clixxo-system-settings theme-page-bg min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
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
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            IDS Settings
          </span>
        </div>

        {/* IDS Settings Section */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>IDS Settings</span>
          </div>

          <form onSubmit={handleSave} className="w-full">
            <div className="w-full px-5 pt-3 pb-0">
            <div
              className="w-full max-w-4xl mx-auto"
              style={{ marginBottom: 12 }}
            >
              {/* Enable Checkbox */}
              <div
                className="flex items-center gap-4 mb-3"
                style={{
                  borderBottom: `1px solid ${C.divider}`,
                  paddingBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.labelText,
                    minWidth: 100,
                  }}
                >
                  IDS Settings:
                </span>
                <div className="flex items-center gap-2">
                  <Checkbox
                    size="small"
                    checked={form.enable}
                    onChange={handleEnable}
                    sx={{
                      padding: "4px",
                      color: "var(--text-muted)",
                      "&.Mui-checked": { color: C.accent },
                    }}
                  />
                  <span style={{ fontSize: 14, color: C.valueText }}>
                    Enable
                  </span>
                </div>
              </div>

              {/* Table Header - Hidden on mobile, shown on larger screens */}
              <div className="hidden md:grid md:grid-cols-3 gap-x-4 gap-y-2 items-center w-full mb-3 px-2 py-2 rounded">
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: C.labelText }}
                >
                  Type
                </span>
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: C.labelText }}
                >
                  Warning Threshold (per 10 seconds)
                </span>
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: C.labelText }}
                >
                  Blacklist Threshold (per 10 seconds)
                </span>
              </div>

              {/* Desktop Layout - Grid table */}
              <div className="hidden md:grid md:grid-cols-3 gap-x-4 gap-y-3 items-center w-full px-2">
                {IDS_TYPES.map((type, idx) => (
                  <React.Fragment key={type.key}>
                    <div className="flex flex-row items-center gap-2 col-span-1">
                      <Checkbox
                        size="small"
                        checked={form[type.key]}
                        onChange={() => handleCheckbox(type.key)}
                        sx={{
                          padding: "4px",
                          color: "var(--text-muted)",
                          "&.Mui-checked": { color: C.accent },
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          color: C.valueText,
                          fontWeight: 500,
                        }}
                      >
                        {type.label}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <input
                        type="number"
                        value={form.warningThresholds[idx]}
                        onChange={(e) =>
                          handleWarningThreshold(idx, Number(e.target.value))
                        }
                        style={{
                          ...systemToolsEditableFieldInputStyleCompact,
                          maxWidth: 140,
                        }}
                        {...inputInteraction}
                      />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <input
                        type="number"
                        value={form.blacklistThresholds[idx]}
                        onChange={(e) =>
                          handleBlacklistThreshold(idx, Number(e.target.value))
                        }
                        style={{
                          ...systemToolsEditableFieldInputStyleCompact,
                          maxWidth: 140,
                        }}
                        {...inputInteraction}
                      />
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Mobile Layout - Stacked cards */}
              <div className="md:hidden space-y-3">
                {IDS_TYPES.map((type, idx) => (
                  <div
                    key={type.key}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: "var(--row-alt)",
                      border: `1px solid ${C.cardBorder}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Checkbox
                        size="small"
                        checked={form[type.key]}
                        onChange={() => handleCheckbox(type.key)}
                        sx={{
                          padding: "4px",
                          color: "var(--text-muted)",
                          "&.Mui-checked": { color: C.accent },
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          color: C.valueText,
                          fontWeight: 600,
                        }}
                      >
                        {type.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label
                          style={{
                            fontSize: 12,
                            color: C.labelText,
                            marginBottom: 4,
                          }}
                        >
                          Warning Threshold
                        </label>
                        <input
                          type="number"
                          value={form.warningThresholds[idx]}
                          onChange={(e) =>
                            handleWarningThreshold(idx, Number(e.target.value))
                          }
                          style={{
                            ...systemToolsEditableFieldInputStyleCompact,
                          }}
                          {...inputInteraction}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label
                          style={{
                            fontSize: 12,
                            color: C.labelText,
                            marginBottom: 4,
                          }}
                        >
                          Blacklist Threshold
                        </label>
                        <input
                          type="number"
                          value={form.blacklistThresholds[idx]}
                          onChange={(e) =>
                            handleBlacklistThreshold(
                              idx,
                              Number(e.target.value),
                            )
                          }
                          style={{
                            ...systemToolsEditableFieldInputStyleCompact,
                          }}
                          {...inputInteraction}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Blacklist Validity */}
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center mt-3 pt-3 gap-2"
                style={{ borderTop: `1px solid ${C.divider}` }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.labelText,
                    minWidth: 140,
                  }}
                >
                  Blacklist Validity(s)
                </span>
                <input
                  type="number"
                  value={form.blacklistValidity}
                  onChange={(e) => handleValidity(Number(e.target.value))}
                  style={{
                    ...systemToolsEditableFieldInputStyle,
                    maxWidth: 180,
                  }}
                  {...inputInteraction}
                />
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
              <Btn type="submit" variant="primary" style={advancedFormBtnStyle}>
                Save
              </Btn>
            </div>
          </form>
        </div>

        {/* IDS Warning Log Section */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>IDS Warning Log</span>
          </div>

          <div className="px-5 pt-3 pb-2">
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-2">
              {/* Log Display Area */}
              <textarea
                className="w-full rounded resize-y"
                style={{
                  ...systemToolsReadOnlyFieldTextAreaStyle,
                  minHeight: 120,
                  maxHeight: 200,
                  color: C.valueText,
                }}
                value={log}
                readOnly
                {...inputInteraction}
              />

              {/* Download Button */}
              <div className="flex justify-center">
                <Btn
                  variant="primary"
                  onClick={handleDownload}
                  style={{ minWidth: 110, height: 34 }}
                >
                  Download
                </Btn>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <p
          style={{
            margin: "16px 0 0",
            textAlign: "center",
            fontSize: 12,
            color: "#dc2626",
            width: "100%",
            whiteSpace: "nowrap",
            overflowX: "auto",
            lineHeight: 1.45,
          }}
        >
          {IDS_LOG_NOTE}
        </p>
      </div>
    </div>
  );
};

export default IDSSettings;
