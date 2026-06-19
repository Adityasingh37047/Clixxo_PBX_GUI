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
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#3E5475",
  valueText: "#3E5475",
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

const systemToolsEditableFieldInputStyle = {
  ...systemToolsFieldInputStyle,
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
};
const inputStyle = systemToolsEditableFieldInputStyle;

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
  marginBottom: 24,
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
                      style={{ ...inputStyle, minWidth: 80 }}
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
                      style={{ ...inputStyle, minWidth: 120 }}
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
                      style={inputStyle}
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
                      style={{ ...inputStyle, minWidth: 100 }}
                      {...inputInteraction}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-2 lg:mt-5">
                  <Btn
                    type="submit"
                    variant="primary"
                    style={{ minWidth: 100, height: 34 }}
                  >
                    {SIP_ACCOUNT_SAVE_BUTTON}
                  </Btn>
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
                {SIP_ACCOUNT_NOTE}
              </p>
            </div>
          </div>
        </form>

        {/* Upload Section */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{SIP_ACCOUNT_UPLOAD.title}</span>
          </div>
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div style={{ flex: 1, color: C.valueText, fontSize: 13 }}>
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
                variant="cancel"
                onClick={() => fileInputRef.current.click()}
                style={{ minWidth: 110, height: 34, fontSize: 13 }}
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
                style={{ minWidth: 110, height: 34 }}
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
                style={{ color: C.errorRed, fontSize: 13, fontWeight: 500 }}
              >
                {SIP_ACCOUNT_DOWNLOAD.fileName}
              </span>
            </div>

            <div
              style={{
                flex: 1,
                color: C.valueText,
                fontSize: 13,
                textAlign: "center",
              }}
            >
              {SIP_ACCOUNT_DOWNLOAD.instruction}
            </div>

            <div className="flex md:justify-end flex-1">
              <Btn
                variant="primary"
                onClick={handleDownload}
                style={{ minWidth: 110, height: 34 }}
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
