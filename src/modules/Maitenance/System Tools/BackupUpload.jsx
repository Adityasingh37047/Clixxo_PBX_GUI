import React, { useState, useRef } from "react";
import {
  BU_TITLES,
  BU_LABELS,
  BU_BUTTONS,
} from "../../../constants/BackupUploadConstants";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { downloadBackup, restoreBackup } from "../../../api/apiService";

// ── Color palette (same as UserManage) ────────────────────────────────────────
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

// ── Button Component (same as UserManage) ────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
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
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
      case "edit":
        return "#bbf7d0";
      case "delete":
        return "#fecaca";
      case "danger":
        return "#b91c1c";
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
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
      {children}
    </button>
  );
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 20,
  boxShadow: C.cardShadow,
  overflow: "hidden",
};

const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  marginLeft: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.strongText,
  borderBottom: `1px solid ${C.divider}`,
};

const BackupUpload = () => {
  const [fileName, setFileName] = useState(BU_LABELS.noFile);
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);

  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setSelectedFile(f || null);
    setFileName(f ? f.name : BU_LABELS.noFile);
  };

  const handleDownloadBackup = async () => {
    try {
      setLoadingBackup(true);
      setMessage({ type: "", text: "" });
      const { blob, fileName } = await downloadBackup();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "backup.tar");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showMessage("success", "Backup downloaded successfully");
    } catch (e) {
      showMessage("error", e.message || "Backup download failed");
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleRestoreUpload = async () => {
    try {
      setMessage({ type: "", text: "" });
      if (!selectedFile) throw new Error("Please select a .tar backup file");
      if (!/\.tar$/i.test(selectedFile.name))
        throw new Error("Only .tar files are supported");
      setLoadingRestore(true);
      const res = await restoreBackup(selectedFile);
      if (res?.response) {
        showMessage(
          "success",
          "Restore completed. Please restart the system to apply changes.",
        );
      } else {
        throw new Error(res?.message || "Restore failed");
      }
    } catch (e) {
      showMessage("error", e.message || "Restore failed");
    } finally {
      setLoadingRestore(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
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
          <span>Maintenance</span>
          <span>&gt;</span>
          <span>System Tool</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Backup & Upload
          </span>
        </div>

        {/* Message Display */}
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
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
        <div style={{ ...tableContainerStyle, marginBottom: 24 }}>
          <div style={{ ...blueBarStyle, justifyContent: "left" }}>
            <span>{BU_TITLES.backup}</span>
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
              {BU_LABELS.backupInstruction}
            </span>
            <div style={{ flexShrink: 0 }}>
              <Btn
                variant="primary"
                onClick={handleDownloadBackup}
                disabled={loadingBackup || loadingRestore}
                style={{ minWidth: 140, height: 36, fontSize: 13 }}
              >
                {loadingBackup ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <CircularProgress size={16} sx={{ color: "inherit" }} />
                    Backing up...
                  </div>
                ) : (
                  BU_BUTTONS.backup
                )}
              </Btn>
            </div>
          </div>
        </div>

        {/* Restore Backup Section */}
        <div style={tableContainerStyle}>
          <div style={{ ...blueBarStyle, justifyContent: "left" }}>
            <span>{BU_TITLES.upload}</span>
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
              {BU_LABELS.uploadInstruction}
            </span>
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ flexShrink: 0 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".tar"
                onChange={handleFileChange}
                className="hidden"
                id="backup-file-input"
                disabled={loadingBackup || loadingRestore}
              />
              <Btn
                variant="default"
                onClick={() => fileInputRef.current?.click()}
                disabled={loadingBackup || loadingRestore}
                style={{ minWidth: 120, height: 36, fontSize: 13 }}
              >
                {BU_LABELS.chooseFile}
              </Btn>
              <span
                style={{
                  fontSize: 13,
                  color:
                    fileName === BU_LABELS.noFile ? C.mutedText : C.valueText,
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
                variant="primary"
                onClick={handleRestoreUpload}
                disabled={loadingBackup || loadingRestore}
                style={{ minWidth: 140, height: 36, fontSize: 13 }}
              >
                {loadingRestore ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <CircularProgress size={16} sx={{ color: "inherit" }} />
                    Restoring...
                  </div>
                ) : (
                  BU_BUTTONS.upload
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
