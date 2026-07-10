import React, { useState, useEffect, useRef } from "react";
import { CircularProgress, Alert } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { uploadSqlPatch } from "../../../api/apiService";
import {
  SQL_UPLOAD_PAGE_TITLE,
  SQL_UPLOAD_BREADCRUMB,
  SQL_UPLOAD_LABELS,
  SQL_UPLOAD_BUTTON_LABELS,
  SQL_UPLOAD_BUTTON_VARIANTS,
  SQL_UPLOAD_BUTTON_STYLE,
  SQL_UPLOAD_UPLOAD_BUTTON_STYLE,
  SQL_UPLOAD_MESSAGES,
  SQL_UPLOAD_FILE,
  SQL_UPLOAD_DEFAULT_TOAST,
  SQL_UPLOAD_TOAST_DURATION_MS,
  SQL_UPLOAD_ERROR_HIDE_MS,
} from "../../../constants/SqlUploadConstants";
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#94a3b8",
  strongText: "#1e293b",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  amber: "#dc2626",
  errorRed: "#dc2626",
  gridHeaderBg: "#F8FAFC",
};

const CARD_RADIUS = 4;
const FIELD_RADIUS = 6;

// ── Local field UI (matches Network.jsx design language) ──
const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;  


const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  component,
  startIcon,
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
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    danger: {
      background: C.errorRed,
      color: C.cardBg,
      border: `0.5px solid ${C.errorRed}`,
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

const SystemToolsSqlUploadPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const SystemToolsSqlUploadPageInnerStyle = {
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
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.divider}`,
};

const SystemToolsSqlUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState(SQL_UPLOAD_LABELS.noFile);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(SQL_UPLOAD_DEFAULT_TOAST);
  const fileInputRef = useRef();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(
      () => setToast(SQL_UPLOAD_DEFAULT_TOAST),
      SQL_UPLOAD_TOAST_DURATION_MS,
    );
  };

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), SQL_UPLOAD_ERROR_HIDE_MS);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
    setError("");
    setFileName(f ? f.name : SQL_UPLOAD_LABELS.noFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError(SQL_UPLOAD_MESSAGES.chooseFileRequired);
      return;
    }
    if (!file.name.toLowerCase().endsWith(".sql")) {
      setError(SQL_UPLOAD_MESSAGES.sqlOnly);
      return;
    }
    setIsUploading(true);
    setError("");
    try {
      const res = await uploadSqlPatch(file);
      if (res?.success) {
        showToast(res.message || SQL_UPLOAD_MESSAGES.restoreSuccess);
        setFile(null);
        setFileName(SQL_UPLOAD_LABELS.noFile);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setError(res?.message || SQL_UPLOAD_MESSAGES.uploadFailed);
      }
    } catch (err) {
      setError(err?.message || SQL_UPLOAD_MESSAGES.uploadFailed);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={SystemToolsSqlUploadPageWrapStyle} data-native-scroll>
      <div style={SystemToolsSqlUploadPageInnerStyle}>
        {/* Breadcrumb */}
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <span>{SQL_UPLOAD_BREADCRUMB[0]}</span>
          <span>&gt;</span>
          <span>{SQL_UPLOAD_BREADCRUMB[1]}</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {SQL_UPLOAD_BREADCRUMB[2]}
          </span>
        </div>

        {/* Global Toast */}
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast(SQL_UPLOAD_DEFAULT_TOAST)}
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 9999,
              boxShadow: C.cardShadow,
            }}
          >
            {toast.msg}
          </Alert>
        )}

        {/* Global Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 9999,
              boxShadow: C.cardShadow,
            }}
          >
            {error}
          </Alert>
        )}

        <div style={tableContainerStyle}>
          {/* Header */}
          <div style={blueBarStyle}>{SQL_UPLOAD_PAGE_TITLE}</div>

          <div
            style={{
              padding: "32px 24px",
              maxWidth: 500,
              width: "100%",
              margin: "0 auto",
            }}
          >
            <div className="flex flex-col items-center gap-6">
              <div
                className="flex items-center gap-4 w-full"
                style={{
                  background: C.pageBg,
                  padding: "16px",
                  borderRadius: "12px",
                  border: `1px dashed ${C.cardBorder}`,
                }}
              >
                <Btn
                  variant={SQL_UPLOAD_BUTTON_VARIANTS.CHOOSE_FILE}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={SQL_UPLOAD_BUTTON_STYLE}
                >
                  {SQL_UPLOAD_BUTTON_LABELS.CHOOSE_FILE}
                </Btn>
                <input
                  ref={fileInputRef}
                  id={SQL_UPLOAD_FILE.inputId}
                  type="file"
                  accept={SQL_UPLOAD_FILE.accept}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <span
                  style={{
                    color: C.mutedText,
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "200px",
                  }}
                  title={fileName}
                >
                  {fileName}
                </span>
              </div>

              <Btn
                variant={SQL_UPLOAD_BUTTON_VARIANTS.UPLOAD}
                onClick={handleUpload}
                disabled={isUploading}
                style={SQL_UPLOAD_UPLOAD_BUTTON_STYLE}
              >
                {isUploading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CloudUploadIcon fontSize="small" />
                )}
                <span style={{ marginLeft: "8px" }}>
                  {isUploading
                    ? SQL_UPLOAD_BUTTON_LABELS.UPLOADING
                    : SQL_UPLOAD_BUTTON_LABELS.UPLOAD}
                </span>
              </Btn>

              <div
                style={{
                  fontSize: 12,
                  color: C.mutedText,
                  textAlign: "center",
                }}
              >
                {SQL_UPLOAD_LABELS.instruction}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemToolsSqlUpload;
