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

const SYS_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};
const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "calc(100% + 40px)",
  marginLeft: -20,
  marginRight: -20,
  marginTop: 0,
  marginBottom: 0,
  padding: "10px 20px 10px",
  borderTop: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

const advancedFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

// ── Button Component (same as UserManage) ────────────────────────────────────
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

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title }) => (
  <button
    type={type}
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
      className="clixxo-system-settings theme-page-bg min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
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
            sx={SYS_TOAST_SX}
          >
            {toast.msg}
          </Alert>
        )}

        {/* Content Box */}
        <div style={tableContainerStyle}>
          <div style={{ ...blueBarStyle, justifyContent: "left" }}>
            <span>{MR_TITLE}</span>
          </div>
          <div style={{ padding: "8px 32px 0" }}>
            <div
              className="w-full min-h-[400px] max-h-[60vh] text-sm p-4 font-mono overflow-auto border-0 outline-none"
              style={{
                backgroundColor: C.cardBg,
                color: C.valueText,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                resize: "none",
                marginBottom: 12,
              }}
            >
              {record || MR_PLACEHOLDER}
            </div>
          </div>

          <div style={advancedFormInlineFooterStyle}>
            <Btn
              variant="primary"
              type="button"
              onClick={handleCheck}
              disabled={loading}
              style={advancedFormBtnStyle}
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
              variant="cancel"
              type="button"
              onClick={handleDownload}
              disabled={loading}
              style={advancedFormBtnStyle}
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
        </div>

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
          {MR_NOTE}
        </p>
      </div>
    </div>
  );
};

export default ModificationRecord;
