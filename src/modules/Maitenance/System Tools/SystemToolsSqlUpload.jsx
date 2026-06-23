import React, { useState, useEffect } from "react";
import { CircularProgress, Alert } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { uploadSqlPatch } from "../../../api/apiService";

const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  divider: "var(--border-subtle)",
  cardShadow: "var(--shadow-soft)",
  labelText: "var(--text-secondary)",
  valueText: "var(--text-primary)",
  strongText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

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

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title, form }) => (
  <button
    type={type}
    form={form}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {children}
  </button>
);

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  paddingBottom: "24px",
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
  color: "var(--text-primary)",
  borderBottom: `1px solid ${C.divider}`,
};

const SystemToolsSqlUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
    setError("");
    setFileName(f ? f.name : "No file chosen");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a .sql file.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".sql")) {
      setError("Only .sql files are allowed.");
      return;
    }
    setIsUploading(true);
    setError("");
    try {
      const res = await uploadSqlPatch(file);
      if (res?.success) {
        showToast(res.message || "Database restored successfully");
        setFile(null);
        setFileName("No file chosen");
      } else {
        setError(res?.message || "Upload failed");
      }
    } catch (err) {
      setError(err?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="clixxo-system-settings theme-page-bg min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
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
          }}
        >
          <span>Maintenance</span>
          <span>&gt;</span>
          <span>System Tool</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            SQL Upload
          </span>
        </div>

        {/* Global Toast */}
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
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
          <div style={blueBarStyle}>SQL Upload</div>

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
                <label
                  htmlFor="sql-file-input"
                  className="cursor-pointer select-none"
                  style={{
                    padding: "8px 16px",
                    background: "var(--border-subtle)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 6,
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: 13,
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                    transition: "background 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "var(--row-alt)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "var(--border-subtle)";
                  }}
                >
                  Choose File
                </label>
                <input
                  id="sql-file-input"
                  type="file"
                  accept=".sql"
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
                variant="primary"
                onClick={handleUpload}
                disabled={isUploading}
                style={{
                  width: "100%",
                  height: 40,
                }}
              >
                {isUploading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CloudUploadIcon fontSize="small" />
                )}
                <span style={{ marginLeft: "8px" }}>
                  {isUploading ? "Uploading..." : "Upload SQL"}
                </span>
              </Btn>

              <div
                style={{
                  fontSize: 12,
                  color: C.mutedText,
                  textAlign: "center",
                }}
              >
                Upload a verified .sql update file. Only use files from trusted
                sources.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemToolsSqlUpload;
