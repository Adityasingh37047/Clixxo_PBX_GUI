import React, { useState } from "react";
import {
  FR_TITLE,
  FR_INSTRUCTION,
  FR_BUTTON,
  FR_BREADCRUMB,
  FR_CONFIRM,
  FR_COMMANDS,
  FR_MESSAGES,
  FR_STATUS,
  FR_DEFAULT_TOAST,
  FR_TOAST_DURATION,
} from "../../../constants/FactoryResetConstants";
import { Alert, CircularProgress } from "@mui/material";
import { postLinuxCmd } from "../../../api/apiService";

// ── Color palette (same as UserManage) ────────────────────────────────────────
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

const FactoryResetPageWrapStyle = {    
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const FactoryResetPageInnerStyle = {
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

const FactoryReset = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(FR_DEFAULT_TOAST);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(FR_DEFAULT_TOAST), FR_TOAST_DURATION);
  };

  const handleReset = async () => {
    if (window.confirm(FR_CONFIRM.first)) {
      if (window.confirm(FR_CONFIRM.second)) {
        await performReset();
      }
    }
  };

  const performReset = async () => {
    setLoading(true);
    try {
      // Restore astdb from the factory SQL file
      const cmd = FR_COMMANDS.reset;
      const apiResponse = await postLinuxCmd({ cmd });

      if (apiResponse?.response) {
        showToast(FR_MESSAGES.success, "success");
      } else {
        const output = String(apiResponse?.responseData || "").trim();
        showToast(output || FR_MESSAGES.commandFailed, "error");
      }
    } catch (error) {
      console.error("Factory reset error:", error);
      showToast(error.message || FR_MESSAGES.resetFailed, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div style={FactoryResetPageWrapStyle} data-native-scroll>
      <div style={FactoryResetPageInnerStyle}>
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
          <span>{FR_BREADCRUMB[0]}</span>
          <span>&gt;</span>
          <span>{FR_BREADCRUMB[1]}</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {FR_BREADCRUMB[2]}
          </span>
        </div>

        {/* Alerts */}
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast(FR_DEFAULT_TOAST)}
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
              variant="primary"
              onClick={handleReset}
              disabled={loading}
              style={{ minWidth: 140, height: 38, fontSize: 13 }}
            >
              {loading ? FR_STATUS.resetting : FR_BUTTON}
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
              {FR_STATUS.overlayMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactoryReset;
