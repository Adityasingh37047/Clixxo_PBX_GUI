import React, { useState } from "react";
import { postLinuxCmd } from "../../../api/apiService";
import { Alert } from "@mui/material";
import {
  LINUX_CLI_TITLE,
  LINUX_CLI_LABELS,
  LINUX_CLI_BUTTONS,
  LINUX_CLI_PLACEHOLDERS,
} from "../../../constants/LinuxCLIConstants";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 10px 30px rgba(15,23,42,0.06)",
  labelText: "#3E5475",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
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
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
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

const inputStyle = {
  width: "100%",
  fontSize: 13,
  padding: "6px 10px",
  borderRadius: 10,
  border: `1.5px solid ${C.cardBorder}`,
  background: C.cardBg,
  color: C.valueText,
  outline: "none",
  transition: "border-color 0.2s ease",
};

const inputInteraction = {
  onFocus: (e) => (e.target.style.borderColor = "#0284c7"),
  onBlur: (e) => (e.target.style.borderColor = C.cardBorder),
  onMouseEnter: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = "#64748b";
  },
  onMouseLeave: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = C.cardBorder;
  },
};

const LinuxCLI = () => {
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [commandError, setCommandError] = useState("");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const validateCommand = (cmd) => {
    if (!cmd || cmd.trim() === "") return "Please enter a command.";
    if (cmd.trim().length < 2)
      return "Command must be at least 2 characters long.";
    return "";
  };

  const executeCommand = async () => {
    setCommandError("");
    const validationError = validateCommand(command);
    if (validationError) {
      setCommandError(validationError);
      return;
    }
    setLoading(true);
    try {
      const apiResponse = await postLinuxCmd({ cmd: command.trim() });
      if (apiResponse.response && apiResponse.responseData !== undefined) {
        const timestamp = new Date().toLocaleString();
        const logEntry = `[${timestamp}] $ ${command.trim()}\n${apiResponse.responseData || ""}\n${"=".repeat(80)}\n`;
        setLogs((prev) => prev + logEntry);
        showMessage("success", "Command executed successfully!");
      } else {
        const timestamp = new Date().toLocaleString();
        const cmdName = command.trim().split(/\s+/)[0] || command.trim();
        const logEntry = `[${timestamp}] $ ${command.trim()}\n-bash: ${cmdName}: command not found\n${"=".repeat(80)}\n`;
        setLogs((prev) => prev + logEntry);
        showMessage("error", "Invalid or wrong command.");
      }
    } catch (error) {
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else if (error.response?.status === 500) {
        showMessage(
          "error",
          "Server error. The Linux command endpoint may have issues.",
        );
      } else {
        showMessage("error", error.message || "Failed to execute command");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs("");
    setCommand("");
    setCommandError("");
    showMessage("info", "Logs cleared!");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      executeCommand();
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
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
          <span>System</span>
          <span>&gt;</span>
          <span>System Settings</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {LINUX_CLI_TITLE}
          </span>
        </div>

        {/* ── Main Card ── */}
        <div
          style={{
            background: C.cardBg,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: C.cardShadow,
            marginBottom: 24,
            border: `1.5px solid ${C.cardBorder}`,
          }}
        >
          {/* Card Header (Left Aligned Title) */}
          <div
            style={{
              minHeight: 44,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              padding: "7px 14px",
              borderBottom: `1px solid ${C.divider}`,
              background: C.cardBg,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
                letterSpacing: "0.02em",
              }}
            >
              Linux CLI
            </span>
          </div>

          {/* Card Body */}
          <div style={{ padding: "24px 32px" }}>
            <div className="flex flex-col gap-6">
              {/* Command Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.labelText,
                    width: 120,
                    flexShrink: 0,
                  }}
                >
                  {LINUX_CLI_LABELS.command}
                </span>
                <div className="flex flex-col w-full max-w-md">
                  <input
                    type="text"
                    style={inputStyle}
                    value={command}
                    onChange={(e) => {
                      setCommand(e.target.value);
                      setCommandError("");
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={LINUX_CLI_PLACEHOLDERS.command}
                    disabled={loading}
                    {...inputInteraction}
                  />
                  <div style={{ minHeight: 0, marginTop: 0 }}>
                    {commandError && (
                      <span
                        style={{
                          color: C.errorRed,
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                      >
                        {commandError}
                      </span>
                    )}
                  </div>
                </div>
                {/* Buttons inline on desktop, wrapped on mobile */}
                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-4">
                  <Btn
                    variant="primary"
                    onClick={executeCommand}
                    disabled={loading || !command.trim()}
                    style={{ minWidth: 90 }}
                  >
                    {loading
                      ? LINUX_CLI_BUTTONS.loading
                      : LINUX_CLI_BUTTONS.submit}
                  </Btn>
                  <Btn variant="cancel" onClick={clearLogs} disabled={loading} style={{ minWidth: 90 }}>
                    {LINUX_CLI_BUTTONS.clear}
                  </Btn>
                </div>
              </div>

              {/* Logs Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.labelText,
                    width: 120,
                    flexShrink: 0,
                    paddingTop: 8,
                  }}
                >
                  {LINUX_CLI_LABELS.logs}
                </span>
                <textarea
                  style={{
                    ...inputStyle,
                    height: "auto",
                    minHeight: 300,
                    maxHeight: 500,
                    fontFamily: "monospace",
                    fontSize: 12,
                    lineHeight: 1.5,
                    resize: "vertical",
                    whiteSpace: "pre-wrap",
                    backgroundColor: "#f8fafc",
                    borderColor: C.cardBorder,
                  }}
                  value={logs}
                  onChange={(e) => setLogs(e.target.value)}
                  placeholder={LINUX_CLI_PLACEHOLDERS.logs}
                  readOnly
                  onFocus={(e) => (e.target.style.borderColor = "#0284c7")}
                  onBlur={(e) => (e.target.style.borderColor = C.cardBorder)}
                  onMouseEnter={(e) => {
                    if (document.activeElement !== e.target)
                      e.target.style.borderColor = "#64748b";
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target)
                      e.target.style.borderColor = C.cardBorder;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinuxCLI;
