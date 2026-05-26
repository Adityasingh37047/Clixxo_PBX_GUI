import React, { useState } from "react";
import {
  IDS_TYPES,
  IDS_INITIAL_FORM,
  IDS_WARNING_LOG,
  IDS_LOG_NOTE,
} from "../../../constants/IDSSettingsConstants";
import { Alert } from "@mui/material";

// ── Color palette (same as AccountManage) ────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  divider: "#f1f5f9",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#64748b",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

// ── Button Component (same as AccountManage) ─────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  startIcon,
  component,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background: "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

  const Component = component || "button";

  return (
    <Component
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 36,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {startIcon && <span style={{ display: "inline-flex" }}>{startIcon}</span>}
      {children}
    </Component>
  );
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 20,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  marginBottom: 24,
};

const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "0 20px",
  fontWeight: 700,
  fontSize: 13,
  color: C.strongText,
  borderBottom: `1px solid ${C.divider}`,
};

const inputInteraction = {
  onFocus: (e) => (e.target.style.borderColor = C.accent),
  onBlur: (e) => (e.target.style.borderColor = C.cardBorder),
  onMouseEnter: (e) => { if (document.activeElement !== e.target) e.target.style.borderColor = "#94a3b8" },
  onMouseLeave: (e) => { if (document.activeElement !== e.target) e.target.style.borderColor = C.cardBorder },
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
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* ── Alerts ── */}
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
            boxShadow: 3,
          }}
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

          <form onSubmit={handleSave} className="w-full p-6">
            <div className="w-full max-w-4xl mx-auto">
              {/* Enable Checkbox */}
              <div
                className="flex items-center gap-4 mb-6"
                style={{
                  borderBottom: `1px solid ${C.divider}`,
                  paddingBottom: 16,
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
                  <input
                    type="checkbox"
                    checked={form.enable}
                    onChange={handleEnable}
                    style={{ accentColor: C.accent, width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: 14, color: C.valueText }}>
                    Enable
                  </span>
                </div>
              </div>

              {/* Table Header - Hidden on mobile, shown on larger screens */}
              <div className="hidden md:grid md:grid-cols-3 gap-x-4 gap-y-2 items-center w-full mb-4 px-2 py-2 rounded bg-slate-50">
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: C.strongText }}
                >
                  Type
                </span>
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: C.strongText }}
                >
                  Warning Threshold (per 10 seconds)
                </span>
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: C.strongText }}
                >
                  Blacklist Threshold (per 10 seconds)
                </span>
              </div>

              {/* Desktop Layout - Grid table */}
              <div className="hidden md:grid md:grid-cols-3 gap-x-4 gap-y-3 items-center w-full px-2">
                {IDS_TYPES.map((type, idx) => (
                  <React.Fragment key={type.key}>
                    <div className="flex flex-row items-center gap-2 col-span-1">
                      <input
                        type="checkbox"
                        checked={form[type.key]}
                        onChange={() => handleCheckbox(type.key)}
                        style={{ accentColor: C.accent, width: 16, height: 16 }}
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
                          padding: "4px 10px",
                          borderRadius: 6,
                          border: `1px solid ${C.cardBorder}`,
                          fontSize: 14,
                          width: "100%",
                          maxWidth: 140,
                          backgroundColor: "#f8fafc",
                          outline: "none",
                          color: C.valueText,
                          transition: "border-color 0.2s ease",
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
                          padding: "4px 10px",
                          borderRadius: 6,
                          border: `1px solid ${C.cardBorder}`,
                          fontSize: 14,
                          width: "100%",
                          maxWidth: 140,
                          backgroundColor: "#f8fafc",
                          outline: "none",
                          color: C.valueText,
                          transition: "border-color 0.2s ease",
                        }}
                        {...inputInteraction}
                      />
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Mobile Layout - Stacked cards */}
              <div className="md:hidden space-y-4">
                {IDS_TYPES.map((type, idx) => (
                  <div
                    key={type.key}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: "#f8fafc",
                      border: `1px solid ${C.cardBorder}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={form[type.key]}
                        onChange={() => handleCheckbox(type.key)}
                        style={{ accentColor: C.accent, width: 16, height: 16 }}
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
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: `1px solid ${C.cardBorder}`,
                            fontSize: 14,
                            width: "100%",
                            backgroundColor: "#fff",
                            outline: "none",
                            color: C.valueText,
                            transition: "border-color 0.2s ease",
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
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: `1px solid ${C.cardBorder}`,
                            fontSize: 14,
                            width: "100%",
                            backgroundColor: "#fff",
                            outline: "none",
                            color: C.valueText,
                            transition: "border-color 0.2s ease",
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
                className="flex flex-col sm:flex-row items-start sm:items-center mt-6 pt-6 gap-4"
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
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: `1px solid ${C.cardBorder}`,
                    fontSize: 14,
                    width: "100%",
                    maxWidth: 180,
                    backgroundColor: "#f8fafc",
                    outline: "none",
                    color: C.valueText,
                    transition: "border-color 0.2s ease",
                  }}
                  {...inputInteraction}
                />
              </div>

              {/* Action Buttons */}
              <div
                className="flex flex-col sm:flex-row justify-center gap-6 mt-8 pt-6"
                style={{ borderTop: `1px solid ${C.divider}` }}
              >
                <Btn
                  type="button"
                  variant="cancel"
                  onClick={handleReset}
                  style={{ minWidth: 120, height: 34 }}
                >
                  Reset
                </Btn>
                <Btn
                  type="submit"
                  variant="primary"
                  style={{ minWidth: 120, height: 34 }}
                >
                  Save
                </Btn>
              </div>
            </div>
          </form>
        </div>

        {/* IDS Warning Log Section */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>IDS Warning Log</span>
          </div>

          <div className="p-6">
            <div className="w-full max-w-4xl mx-auto">
              {/* Log Display Area */}
              <textarea
                className="w-full rounded resize-y"
                style={{
                  minHeight: 140,
                  maxHeight: 220,
                  fontSize: 13,
                  padding: "12px",
                  backgroundColor: "#f8fafc",
                  border: `1px solid ${C.cardBorder}`,
                  color: C.valueText,
                  fontFamily: "monospace",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                value={log}
                readOnly
                {...inputInteraction}
              />

              {/* Download Button */}
              <div className="flex flex-col sm:flex-row justify-center mt-6">
                <Btn
                  variant="primary"
                  onClick={handleDownload}
                  style={{ minWidth: 120, height: 34 }}
                >
                  Download
                </Btn>
              </div>

              {/* Note */}
              <div className="text-center mt-4">
                <span
                  style={{ color: C.errorRed, fontSize: 13, fontWeight: 500 }}
                >
                  {IDS_LOG_NOTE}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDSSettings;
