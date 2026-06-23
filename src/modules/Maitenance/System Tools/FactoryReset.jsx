import React, { useState } from "react";
import {
  FR_TITLE,
  FR_INSTRUCTION,
  FR_BUTTON,
} from "../../../constants/FactoryResetConstants";
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
  valueText: "#3e5475",
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

const FactoryReset = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 5000);
  };

  const handleReset = async () => {
    if (
      window.confirm(
        "If you factory reset the PBX, everything will be erased. Do you want to continue?",
      )
    ) {
      if (window.confirm("Are you absolutely sure?")) {
        await performReset();
      }
    }
  };

  const performReset = async () => {
    setLoading(true);
    try {
      // Restore astdb from the factory SQL file
      const cmd = "mysql astdb < /root/clixxo/DB/astdb.sql 2>&1";
      const apiResponse = await postLinuxCmd({ cmd });

      if (apiResponse?.response) {
        showToast(
          "Factory reset completed. Database astdb has been restored from astdb.sql.",
          "success",
        );
      } else {
        const output = String(apiResponse?.responseData || "").trim();
        showToast(
          output || "Factory reset command did not complete successfully.",
          "error",
        );
      }
    } catch (error) {
      console.error("Factory reset error:", error);
      showToast(
        error.message ||
          "Failed to run factory reset. Please check logs on the device.",
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
            Factory Reset
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
            <span>{FR_TITLE}</span>
          </div>
          <div
            style={{
              padding: "32px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: 14,
                color: C.valueText,
                marginBottom: 24,
                fontWeight: 500,
              }}
            >
              {FR_INSTRUCTION}
            </span>
            <Btn
              variant="primary"
              onClick={handleReset}
              disabled={loading}
              style={{ minWidth: 140, height: 38, fontSize: 13 }}
            >
              {loading ? "Resetting..." : FR_BUTTON}
            </Btn>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-surface)] rounded-md shadow-xl px-10 py-6 flex flex-col items-center gap-4 max-w-sm text-center">
            <CircularProgress />
            <div className="text-[var(--text-secondary)] text-sm whitespace-pre-line font-medium">
              Resetting database to factory settings...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactoryReset;
