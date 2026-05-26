import React, { useState } from "react";
import {
  CERTIFICATE_FIELDS,
  CERTIFICATE_BUTTONS,
  CERTIFICATE_NOTE,
} from "../../../constants/CertificateManageConstants";
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
  onMouseEnter: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = "#94a3b8";
  },
  onMouseLeave: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = C.cardBorder;
  },
};

const CertificateManage = () => {
  const [form, setForm] = useState({});
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAction = (btnName) => {
    showToast(`${btnName} action triggered successfully`, "success");
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
            Certificate Management
          </span>
        </div>

        <div style={tableContainerStyle}>
          {/* Header */}
          <div style={blueBarStyle}>
            <span>Certificate Management</span>
          </div>

          <div className="p-6">
            <div className="w-full max-w-4xl mx-auto">
              {/* Form Fields Grid */}
              <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {CERTIFICATE_FIELDS.map((field) => (
                  <React.Fragment key={field.name}>
                    <div className="flex items-center text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 whitespace-nowrap min-h-[34px]">
                      <span style={{ color: C.labelText }}>{field.label}:</span>
                    </div>
                    <div className="flex items-center min-h-[34px]">
                      <input
                        type="text"
                        name={field.name}
                        value={form[field.name] || ""}
                        onChange={handleChange}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: `1px solid ${C.cardBorder}`,
                          fontSize: 14,
                          width: "100%",
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
              </form>

              {/* Action Buttons */}
              <div
                className="flex flex-col sm:flex-row justify-center gap-6 mt-6 pt-4"
                style={{ borderTop: `1px solid ${C.divider}` }}
              >
                {CERTIFICATE_BUTTONS.map((btn) => (
                  <Btn
                    key={btn.name}
                    type="button"
                    variant={
                      btn.name.toLowerCase() === "generate" ||
                      btn.name.toLowerCase() === "download"
                        ? "primary"
                        : "cancel"
                    }
                    onClick={() => handleAction(btn.label)}
                    style={{ minWidth: 120, height: 34 }}
                  >
                    {btn.label}
                  </Btn>
                ))}
              </div>

              {/* Note */}
              <div className="w-full flex justify-center mt-6">
                <span
                  style={{
                    color: C.errorRed,
                    fontSize: 13,
                    fontWeight: 500,
                    textAlign: "center",
                    padding: "0 16px",
                  }}
                >
                  {CERTIFICATE_NOTE}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateManage;
