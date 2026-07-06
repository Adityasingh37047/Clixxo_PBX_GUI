import React, { useState, useRef } from "react";
import {
  BACKUP_UPLOAD_TITLES,
  BACKUP_UPLOAD_LABELS,
  BACKUP_UPLOAD_BUTTON_LABELS,
  BACKUP_UPLOAD_BUTTON_VARIANTS,
  BACKUP_UPLOAD_BUTTON_STYLE,
  BACKUP_UPLOAD_CHOOSE_FILE_BUTTON_STYLE,
  BACKUP_UPLOAD_BREADCRUMB,
  BACKUP_UPLOAD_MESSAGES,
  BACKUP_UPLOAD_STATUS,
  BACKUP_UPLOAD_FILE,
  BACKUP_UPLOAD_TAR_FILE_REGEX,
  BACKUP_UPLOAD_MESSAGE_TIMEOUT_MS,
  BACKUP_UPLOAD_MESSAGE_DEFAULT,
} from "../../../constants/BackupUploadConstants";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { downloadBackup, restoreBackup } from "../../../api/apiService";

// ── Color palette (same as UserManage) ────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#30415A",
  mutedText: "#94a3b8",
  strongText: "#1e293b",
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

// ── Button Component (same as UserManage) ────────────────────────────────────
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
    },
    edit: {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
    delete: {
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
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
      {startIcon && <span style={{ display: "inline-flex" }}>{startIcon}</span>}
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

const BackupUploadPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const BackupUploadPageInnerStyle = {
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

const BackupUpload = () => {
  const [fileName, setFileName] = useState(BACKUP_UPLOAD_LABELS.NO_FILE);
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);

  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [message, setMessage] = useState(BACKUP_UPLOAD_MESSAGE_DEFAULT);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(
      () => setMessage(BACKUP_UPLOAD_MESSAGE_DEFAULT),
      BACKUP_UPLOAD_MESSAGE_TIMEOUT_MS,
    );
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setSelectedFile(f || null);
    setFileName(f ? f.name : BACKUP_UPLOAD_LABELS.NO_FILE);
  };

  const handleDownloadBackup = async () => {
    try {
      setLoadingBackup(true);
      setMessage(BACKUP_UPLOAD_MESSAGE_DEFAULT);
      const { blob, fileName } = await downloadBackup();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        fileName || BACKUP_UPLOAD_FILE.DEFAULT_FILE_NAME,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showMessage("success", BACKUP_UPLOAD_MESSAGES.BACKUP_DOWNLOAD_SUCCESS);
    } catch (e) {
      showMessage(
        "error",
        e.message || BACKUP_UPLOAD_MESSAGES.BACKUP_DOWNLOAD_FAILED,
      );
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleRestoreUpload = async () => {
    try {
      setMessage(BACKUP_UPLOAD_MESSAGE_DEFAULT);
      if (!selectedFile)
        throw new Error(BACKUP_UPLOAD_MESSAGES.SELECT_TAR_FILE);
      if (!BACKUP_UPLOAD_TAR_FILE_REGEX.test(selectedFile.name))
        throw new Error(BACKUP_UPLOAD_MESSAGES.ONLY_TAR_SUPPORTED);
      setLoadingRestore(true);
      const res = await restoreBackup(selectedFile);
      if (res?.response) {
        showMessage("success", BACKUP_UPLOAD_MESSAGES.RESTORE_SUCCESS);
      } else {
        throw new Error(res?.message || BACKUP_UPLOAD_MESSAGES.RESTORE_FAILED);
      }
    } catch (e) {
      showMessage("error", e.message || BACKUP_UPLOAD_MESSAGES.RESTORE_FAILED);
    } finally {
      setLoadingRestore(false);
    }
  };

  return (
    <div style={BackupUploadPageWrapStyle} data-native-scroll>
      <div style={BackupUploadPageInnerStyle}>
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
            flexWrap: "wrap",
          }}
        >
          <span>{BACKUP_UPLOAD_BREADCRUMB[0]}</span>
          <span>&gt;</span>
          <span>{BACKUP_UPLOAD_BREADCRUMB[1]}</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {BACKUP_UPLOAD_BREADCRUMB[2]}
          </span>
        </div>

        {/* Message Display */}
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage(BACKUP_UPLOAD_MESSAGE_DEFAULT)}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
        )}

        {/* Data Backup Section */}
        <div style={tableContainerStyle}>
          <div style={{ ...blueBarStyle, justifyContent: "left" }}>
            <span>{BACKUP_UPLOAD_TITLES.BACKUP}</span>
          </div>
          <div
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            style={{ padding: "24px 20px" }}
          >
            <span
              style={{
                fontSize: 14,
                color: C.valueText,
                fontWeight: 500,
                flex: 1,
              }}
            >
              {BACKUP_UPLOAD_LABELS.BACKUP_INSTRUCTION}
            </span>
            <div style={{ flexShrink: 0 }}>
              <Btn
                variant={BACKUP_UPLOAD_BUTTON_VARIANTS.BACKUP}
                onClick={handleDownloadBackup}
                disabled={loadingBackup || loadingRestore}
                style={BACKUP_UPLOAD_BUTTON_STYLE}
              >
                {loadingBackup ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <CircularProgress size={16} sx={{ color: "inherit" }} />
                    {BACKUP_UPLOAD_STATUS.BACKING_UP}
                  </div>
                ) : (
                  BACKUP_UPLOAD_BUTTON_LABELS.BACKUP
                )}
              </Btn>
            </div>
          </div>
        </div>

        {/* Restore Backup Section */}
        <div
          style={{
            ...tableContainerStyle,
            marginTop: 20,
          }}
        >
          <div style={{ ...blueBarStyle, justifyContent: "left" }}>
            <span>{BACKUP_UPLOAD_TITLES.UPLOAD}</span>
          </div>
          <div
            className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4"
            style={{ padding: "24px 20px" }}
          >
            <span
              style={{
                fontSize: 14,
                color: C.valueText,
                fontWeight: 500,
                flex: 1,
              }}
            >
              {BACKUP_UPLOAD_LABELS.UPLOAD_INSTRUCTION}
            </span>
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ flexShrink: 0 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={BACKUP_UPLOAD_FILE.ACCEPT_EXTENSION}
                onChange={handleFileChange}
                className="hidden"
                id={BACKUP_UPLOAD_FILE.INPUT_ID}
                disabled={loadingBackup || loadingRestore}
              />
              <Btn
                variant={BACKUP_UPLOAD_BUTTON_VARIANTS.CHOOSE_FILE}
                onClick={() => fileInputRef.current?.click()}
                disabled={loadingBackup || loadingRestore}
                style={BACKUP_UPLOAD_CHOOSE_FILE_BUTTON_STYLE}
              >
                {BACKUP_UPLOAD_BUTTON_LABELS.CHOOSE_FILE}
              </Btn>
              <span
                style={{
                  fontSize: 13,
                  color:
                    fileName === BACKUP_UPLOAD_LABELS.NO_FILE
                      ? C.mutedText
                      : C.valueText,
                  minWidth: 150,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 200,
                }}
              >
                {fileName}
              </span>
              <Btn
                variant={BACKUP_UPLOAD_BUTTON_VARIANTS.RESTORE}
                onClick={handleRestoreUpload}
                disabled={loadingBackup || loadingRestore}
                style={BACKUP_UPLOAD_BUTTON_STYLE}
              >
                {loadingRestore ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <CircularProgress size={16} sx={{ color: "inherit" }} />
                    {BACKUP_UPLOAD_STATUS.RESTORING}
                  </div>
                ) : (
                  BACKUP_UPLOAD_BUTTON_LABELS.RESTORE
                )}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupUpload;
