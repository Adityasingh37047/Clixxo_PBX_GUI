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

// ── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ msg, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.3)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "10vh",
      }}
    >
      <div
        style={{
          background: C.cardBg,
          borderRadius: 12,
          padding: "24px 28px",
          width: "min(90vw, 360px)",
          border: `1px solid ${C.cardBorder}`,
          boxShadow:
            "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        }}
      >
        <p
          style={{
            margin: "0 0 20px",
            fontSize: 14,
            fontWeight: 600,
            color: C.valueText,
            lineHeight: 1.5,
          }}
        >
          {msg}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn
            variant="danger"
            onClick={onConfirm}
            style={{ height: 32, padding: "0 16px" }}
          >
            Confirm
          </Btn>
          <Btn
            variant="default"
            onClick={onCancel}
            style={{ height: 32, padding: "0 16px" }}
          >
            Cancel
          </Btn>
        </div>
      </div>
    </div>
  );
}

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

const FactoryReset = () => {
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 5000);
  };

  const handleReset = async () => {
    setConfirmDialog({
      msg: "If you factory reset the PBX, everything will be erased. Do you want to continue?",
      onConfirm: () => {
        setConfirmDialog({
          msg: "Are you absolutely sure?",
          onConfirm: async () => {
            setConfirmDialog(null);
            await performReset();
          },
          onCancel: () => setConfirmDialog(null),
        });
      },
      onCancel: () => setConfirmDialog(null),
    });
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
            Factory Reset
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
              variant="danger"
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
          <div className="bg-white rounded-md shadow-xl px-10 py-6 flex flex-col items-center gap-4 max-w-sm text-center">
            <CircularProgress />
            <div className="text-gray-700 text-sm whitespace-pre-line font-medium">
              Resetting database to factory settings...
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {confirmDialog && (
        <ConfirmDialog
          msg={confirmDialog.msg}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </div>
  );
};

export default FactoryReset;
