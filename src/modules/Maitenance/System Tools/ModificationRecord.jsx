import React, { useState } from "react";
import {
  MR_TITLE,
  MR_BUTTONS,
  MR_NOTE,
  MR_PLACEHOLDER,
} from "../../../constants/ModificationRecordConstants";
import { Alert, CircularProgress } from "@mui/material";
import { postLinuxCmd } from "../../../api/apiService";

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
        return C.primaryHover;
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
        if (!disabled) e.currentTarget.style.backgroundColor = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = baseBg;
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

const ModificationRecord = () => {
  const [record, setRecord] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 5000);
  };

  // Handle check button click - fetch latest 100 lines from /var/log/auth.log
  const handleCheck = async () => {
    try {
      setLoading(true);
      const fetchCmd = `tail -n 100 /var/log/auth.log 2>/dev/null || echo "Error reading auth.log"`;
      const response = await postLinuxCmd({ cmd: fetchCmd });
      const logData = String(response?.responseData || "").trim();

      if (logData.includes("Error reading auth.log") || !logData) {
        setRecord("Error: Could not read /var/log/auth.log or file is empty.");
      } else {
        setRecord(logData);
      }
    } catch (error) {
      console.error("Error fetching auth.log:", error);
      setRecord("Error: Failed to fetch auth.log. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle download button click - download whole /var/log/auth.log file
  const handleDownload = async () => {
    try {
      setLoading(true);
      const fetchCmd = `cat /var/log/auth.log 2>/dev/null || echo "Error reading auth.log"`;
      const response = await postLinuxCmd({ cmd: fetchCmd });
      const logData = String(response?.responseData || "").trim();

      if (logData.includes("Error reading auth.log")) {
        showToast("Error: Could not read /var/log/auth.log.", "error");
        return;
      }

      if (!logData) {
        showToast("auth.log file is empty.", "error");
        return;
      }

      const blob = new Blob([logData], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "auth.log";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading auth.log:", error);
      showToast(
        "Error: Failed to download auth.log. Please try again.",
        "error",
      );
    } finally {
      setLoading(false);
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
            Modification Record
          </span>
        </div>

        {/* Alerts */}
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

        {/* Content Box */}
        <div style={tableContainerStyle}>
          <div style={{ ...blueBarStyle, justifyContent: "left" }}>
            <span>{MR_TITLE}</span>
          </div>
          <div style={{ padding: 0 }}>
            <div
              className="w-full min-h-[400px] max-h-[60vh] text-sm p-4 font-mono overflow-auto border-0 outline-none"
              style={{
                backgroundColor: C.cardBg,
                color: C.valueText,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                resize: "none",
              }}
            >
              {record || MR_PLACEHOLDER}
            </div>
          </div>
        </div>

        {/* Buttons Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            marginTop: 24,
          }}
        >
          <Btn
            variant="primary"
            onClick={handleCheck}
            disabled={loading}
            style={{ minWidth: 120, height: 36, fontSize: 13 }}
          >
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CircularProgress size={16} sx={{ color: "inherit" }} />
                Loading...
              </div>
            ) : (
              MR_BUTTONS.check
            )}
          </Btn>
          <Btn
            variant="default"
            onClick={handleDownload}
            disabled={loading}
            style={{ minWidth: 120, height: 36, fontSize: 13 }}
          >
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CircularProgress size={16} sx={{ color: "inherit" }} />
                Loading...
              </div>
            ) : (
              MR_BUTTONS.download
            )}
          </Btn>
        </div>

        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
        >
          <span
            style={{
              color: C.errorRed,
              fontSize: 13,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {MR_NOTE}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModificationRecord;
