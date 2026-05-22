import React, { useState, useRef } from "react";
import {
  SIP_ACCOUNT_FIELDS,
  SIP_ACCOUNT_NOTE,
  SIP_ACCOUNT_UPLOAD,
  SIP_ACCOUNT_DOWNLOAD,
  SIP_ACCOUNT_SAVE_BUTTON,
} from "../../../constants/SIPAccountGeneratorConstants";
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
      background: C.primary,
      color: C.cardBg,
      border: `1px solid ${C.primary}`,
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
        return C.primaryHover;
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
        if (!disabled) e.currentTarget.style.backgroundColor = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = baseBg;
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

const SIPAccountGenerator = () => {
  const [form, setForm] = useState({
    sipTrunkNo: "0",
    registrationPeriod: "1800",
    registrationAddress: "",
    description: "default",
  });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(SIP_ACCOUNT_UPLOAD.noFile);
  const fileInputRef = useRef();
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setFileName(f ? f.name : SIP_ACCOUNT_UPLOAD.noFile);
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast("SIP Account saved successfully", "success");
    // Save logic here
  };

  const handleUpload = () => {
    if (!file) {
      showToast("Please select a file to upload", "error");
      return;
    }
    showToast("File uploaded successfully", "success");
    // Upload logic here
  };

  const handleDownload = () => {
    showToast("Download started", "success");
    // Download logic here
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
            Sip Account Generator
          </span>
        </div>

        <form onSubmit={handleSave} autoComplete="off">
          {/* SIP Account Generator Section */}
          <div style={tableContainerStyle}>
            <div style={blueBarStyle}>
              <span>SIP Account Generator</span>
            </div>
            <div className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Inputs Row */}
                <div className="flex flex-col md:flex-row flex-wrap gap-6 flex-1">
                  {/* SIP Trunk No. */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="sipTrunkNo"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      SIP Trunk No.
                    </label>
                    <input
                      id="sipTrunkNo"
                      name="sipTrunkNo"
                      type="text"
                      value={form.sipTrunkNo}
                      onChange={handleInputChange}
                      placeholder="0"
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: `1px solid ${C.cardBorder}`,
                        fontSize: 14,
                        width: "100%",
                        minWidth: 80,
                        backgroundColor: "#f8fafc",
                        outline: "none",
                        transition: "border-color 0.2s ease",
                      }}
                      {...inputInteraction}
                    />
                  </div>

                  {/* Registration Validity Period(s) */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="registrationPeriod"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      Registration Validity Period(s)
                    </label>
                    <input
                      id="registrationPeriod"
                      name="registrationPeriod"
                      type="text"
                      value={form.registrationPeriod}
                      onChange={handleInputChange}
                      placeholder="1800"
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: `1px solid ${C.cardBorder}`,
                        fontSize: 14,
                        width: "100%",
                        minWidth: 120,
                        backgroundColor: "#f8fafc",
                        outline: "none",
                        transition: "border-color 0.2s ease",
                      }}
                      {...inputInteraction}
                    />
                  </div>

                  {/* Registration Address */}
                  <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                    <label
                      htmlFor="registrationAddress"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      Registration Address
                    </label>
                    <input
                      id="registrationAddress"
                      name="registrationAddress"
                      type="text"
                      value={form.registrationAddress}
                      onChange={handleInputChange}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: `1px solid ${C.cardBorder}`,
                        fontSize: 14,
                        width: "100%",
                        backgroundColor: "#f8fafc",
                        outline: "none",
                        transition: "border-color 0.2s ease",
                      }}
                      {...inputInteraction}
                    />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="description"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      Description
                    </label>
                    <input
                      id="description"
                      name="description"
                      type="text"
                      value={form.description}
                      onChange={handleInputChange}
                      placeholder="default"
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: `1px solid ${C.cardBorder}`,
                        fontSize: 14,
                        width: "100%",
                        minWidth: 100,
                        backgroundColor: "#f8fafc",
                        outline: "none",
                        transition: "border-color 0.2s ease",
                      }}
                      {...inputInteraction}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-2 lg:mt-5">
                  <Btn
                    type="submit"
                    variant="primary"
                    style={{ minWidth: 100, height: 36 }}
                  >
                    {SIP_ACCOUNT_SAVE_BUTTON}
                  </Btn>
                </div>
              </div>

              {/* Note */}
              <div
                className="mt-4"
                style={{
                  fontSize: 13,
                  color: C.errorRed,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {SIP_ACCOUNT_NOTE}
              </div>
            </div>
          </div>
        </form>

        {/* Upload Section */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{SIP_ACCOUNT_UPLOAD.title}</span>
          </div>
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div style={{ flex: 1, color: C.valueText, fontSize: 14 }}>
              <div style={{ fontWeight: 500 }}>
                {SIP_ACCOUNT_UPLOAD.instruction}
              </div>
              <div style={{ color: C.mutedText, marginTop: 4 }}>
                {SIP_ACCOUNT_UPLOAD.prompt}
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-center">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <Btn
                variant="default"
                onClick={() => fileInputRef.current.click()}
                style={{ height: 36, minWidth: 120 }}
              >
                {SIP_ACCOUNT_UPLOAD.chooseFile}
              </Btn>
              <span
                style={{
                  color: C.labelText,
                  fontSize: 13,
                  maxWidth: 150,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {fileName}
              </span>
            </div>

            <div className="flex md:justify-end flex-1">
              <Btn
                variant="primary"
                onClick={handleUpload}
                style={{ minWidth: 110, height: 36 }}
              >
                {SIP_ACCOUNT_UPLOAD.button}
              </Btn>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{SIP_ACCOUNT_DOWNLOAD.title}</span>
          </div>
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 flex flex-col gap-1">
              <span
                style={{ color: C.labelText, fontSize: 13, fontWeight: 600 }}
              >
                {SIP_ACCOUNT_DOWNLOAD.fileLabel}
              </span>
              <span
                style={{ color: C.errorRed, fontSize: 14, fontWeight: 500 }}
              >
                {SIP_ACCOUNT_DOWNLOAD.fileName}
              </span>
            </div>

            <div
              style={{
                flex: 1,
                color: C.valueText,
                fontSize: 14,
                textAlign: "center",
              }}
            >
              {SIP_ACCOUNT_DOWNLOAD.instruction}
            </div>

            <div className="flex md:justify-end flex-1">
              <Btn
                variant="primary"
                onClick={handleDownload}
                style={{ minWidth: 110, height: 36 }}
              >
                {SIP_ACCOUNT_DOWNLOAD.button}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPAccountGenerator;
