import React, { useState, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import { InfoOutlined } from "@mui/icons-material";
import {
  SIP_ACCOUNT_FORM_FIELDS,
  SIP_ACCOUNT_NOTE,
  SIP_ACCOUNT_UPLOAD,
  SIP_ACCOUNT_DOWNLOAD,
  SIP_ACCOUNT_SAVE_BUTTON,
  SIP_ACCOUNT_MESSAGES,
  SIP_ACCOUNT_DEFAULT_FORM,
  SIP_ACCOUNT_TOAST_DEFAULT,
  SIP_ACCOUNT_TOAST_DURATION,
  SIP_ACCOUNT_BREADCRUMB,
} from "../../../constants/SIPAccountGeneratorConstants";
import { Alert } from "@mui/material";
// ── Color palette (same as AccountManage) ────────────────────────────────────
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
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  amber: "#dc2626",
  errorRed: "#dc2626",
  gridHeaderBg: "#F8FAFC",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

// ── Local field UI (matches Network.jsx design language) ──
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

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: "#fff",
        color: "#334155",
        border: "1px solid #d1d5db",
        fontSize: 12,
        maxWidth: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
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
    error: {
      background: C.errorRed,
      color: C.cardBg,
      border: `1px solid ${C.errorRed}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      error: "#b91c1c",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      error: "#991b1b",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

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
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 36,
        gap: 6,
        whiteSpace: "nowrap",
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
      {startIcon && (
        <span style={{ display: "inline-flex" }}>
          {startIcon}
        </span>
      )}
      {children}
    </Component>
  );
};
const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const SIPAccountGeneratorPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const SIPAccountGeneratorPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
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
  const [form, setForm] = useState(SIP_ACCOUNT_DEFAULT_FORM);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(SIP_ACCOUNT_UPLOAD.noFile);
  const fileInputRef = useRef();
  const [toast, setToast] = useState(SIP_ACCOUNT_TOAST_DEFAULT);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(SIP_ACCOUNT_TOAST_DEFAULT);
    }, SIP_ACCOUNT_TOAST_DURATION);
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
    showToast(SIP_ACCOUNT_MESSAGES.SAVE_SUCCESS, "success");
    // Save logic here
  };

  const handleUpload = () => {
    if (!file) {
      showToast(SIP_ACCOUNT_MESSAGES.FILE_REQUIRED, "error");
      return;
    }
    showToast(SIP_ACCOUNT_MESSAGES.UPLOAD_SUCCESS, "success");
    // Upload logic here
  };

  const handleDownload = () => {
    showToast(SIP_ACCOUNT_MESSAGES.DOWNLOAD_STARTED, "success");
    // Download logic here
  };

  return (
    <div style={SIPAccountGeneratorPageWrapStyle} data-native-scroll>
      <div style={SIPAccountGeneratorPageInnerStyle}>
    
      {/* ── Alerts ── */}
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(SIP_ACCOUNT_TOAST_DEFAULT)}
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
          <span>{SIP_ACCOUNT_BREADCRUMB[0]}</span>
          <span>&gt;</span>
          <span>{SIP_ACCOUNT_BREADCRUMB[1]}</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {SIP_ACCOUNT_BREADCRUMB[2]}
          </span>
        </div>

        <form onSubmit={handleSave} autoComplete="off">
          {/* SIP Account Generator Section */}
          <div style={tableContainerStyle}>
            <div style={blueBarStyle}>
            <span>{SIP_ACCOUNT_BREADCRUMB[2]}</span>
            </div>
            <div className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Inputs Row */}
            {/* Inputs Row */}
<div className="flex flex-col md:flex-row flex-wrap gap-6 flex-1">
  {SIP_ACCOUNT_FORM_FIELDS.map((field) => (
    <div
      key={field.name}
      className={`flex flex-col gap-1 ${
        field.flex ? "flex-1 min-w-[200px]" : ""
      }`}
    >
      <label
        htmlFor={field.name}
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
        }}
      >
        <Tooltip title={field.tooltip} {...tooltipProps}>
          <span style={{ color: C.labelText }}>
            {field.label}
          </span>
        </Tooltip>
      </label>

      <input
        id={field.name}
        name={field.name}
        type={field.type}
        value={form[field.name]}
        onChange={handleInputChange}
        placeholder={field.placeholder}
        style={{
          ...inputStyle,
          ...(field.minWidth && {
            minWidth: field.minWidth,
          }),
        }}
        {...inputInteraction}
      />
    </div>
  ))}
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
                  color: C.accent,
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
        <div style={{
    ...tableContainerStyle,
    marginTop: 20,
  }}>
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
        <div style={{
    ...tableContainerStyle,
    marginTop: 20,
  }}>
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
