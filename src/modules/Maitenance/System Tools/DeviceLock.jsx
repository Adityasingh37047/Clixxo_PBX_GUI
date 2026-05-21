import React, { useState, useEffect } from "react";
import {
  DEVICE_LOCK_OPTIONS,
  DEVICE_LOCK_LABELS,
} from "../../../constants/DeviceLockConstants";
import { Alert, TextField } from "@mui/material";

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
  paddingBottom: "24px",
};

const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.strongText,
  borderBottom: `1px solid ${C.divider}`,
};

const DeviceLock = () => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const handleOptionChange = (option) => {
    setSelectedOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const handleReset = () => {
    setSelectedOptions({});
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleLock = (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please fill out both password fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Add lock logic here
    showToast("Device locked successfully!");
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
            Device Lock
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
          <div style={blueBarStyle}>{DEVICE_LOCK_LABELS.title}</div>

          <form
            onSubmit={handleLock}
            style={{ padding: "32px 24px", maxWidth: 600, margin: "0 auto" }}
          >
            <div className="space-y-6">
              <div
                style={{
                  fontSize: 14,
                  color: C.valueText,
                  textAlign: "center",
                  lineHeight: 1.6,
                  fontWeight: 500,
                  marginBottom: "32px",
                }}
              >
                {DEVICE_LOCK_LABELS.instruction}
              </div>

              {/* Checkbox Options */}
              <div className="flex justify-center gap-8 mb-8 flex-wrap">
                {DEVICE_LOCK_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center cursor-pointer select-none"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      transition: "color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.color = C.strongText)
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.color = C.labelText)
                    }
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedOptions[opt.value]}
                      onChange={() => handleOptionChange(opt.value)}
                      style={{
                        marginRight: "8px",
                        width: "16px",
                        height: "16px",
                        accentColor: C.primary,
                        cursor: "pointer",
                      }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              {/* Password Fields */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <label
                    style={{
                      width: 180,
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.labelText,
                      textAlign: "right",
                      marginRight: 16,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {DEVICE_LOCK_LABELS.password}:
                  </label>
                  <TextField
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        height: 36,
                        fontSize: 13,
                        backgroundColor: C.cardBg,
                        "& fieldset": { borderColor: C.cardBorder },
                        "&:hover fieldset": { borderColor: "#888" },
                        "&.Mui-focused fieldset": { borderColor: C.primary },
                      },
                      "& .MuiInputBase-input": {
                        fontSize: 13,
                        color: C.valueText,
                        padding: "6px 10px",
                      },
                    }}
                    autoComplete="new-password"
                  />
                </div>

                <div className="flex items-center">
                  <label
                    style={{
                      width: 180,
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.labelText,
                      textAlign: "right",
                      marginRight: 16,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {DEVICE_LOCK_LABELS.confirmPassword}:
                  </label>
                  <TextField
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        height: 36,
                        fontSize: 13,
                        backgroundColor: C.cardBg,
                        "& fieldset": { borderColor: C.cardBorder },
                        "&:hover fieldset": { borderColor: "#888" },
                        "&.Mui-focused fieldset": { borderColor: C.primary },
                      },
                      "& .MuiInputBase-input": {
                        fontSize: 13,
                        color: C.valueText,
                        padding: "6px 10px",
                      },
                    }}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 pt-6">
                <Btn
                  variant="primary"
                  onClick={handleLock}
                  type="submit"
                  style={{ height: 36, padding: "0 24px", fontSize: 13 }}
                >
                  {DEVICE_LOCK_LABELS.lock}
                </Btn>
                <Btn
                  variant="default"
                  onClick={handleReset}
                  type="button"
                  style={{ height: 36, padding: "0 24px", fontSize: 13 }}
                >
                  {DEVICE_LOCK_LABELS.reset}
                </Btn>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeviceLock;
