import React, { useState, useEffect } from "react";
import { CircularProgress, Alert } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { uploadSqlPatch } from "../../../api/apiService";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
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
      fontWeight: 600,
      fontSize: 15,
      borderRadius: 6,
      boxShadow: "0 2px 8px #3E5475",
      textTransform: "none",
      padding: "6px 28px",
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
  paddingBottom: "24px",
};

const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 14px",
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
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
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
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
                    background: C.cardBg,
                    border: `1px solid ${C.cardBorder}`,
                    borderRadius: 6,
                    color: C.valueText,
                    fontWeight: 600,
                    fontSize: 13,
                    transition: "all .15s ease-in-out",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#f3f4f6";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = C.cardBg;
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
