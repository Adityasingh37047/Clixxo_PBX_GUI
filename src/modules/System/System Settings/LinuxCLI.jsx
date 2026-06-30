import React, { useState } from "react";
import { postLinuxCmd } from "../../../api/apiService";
import { Alert } from "@mui/material";  
import { Tooltip } from "@mui/material";
import {
  LINUX_CLI_TITLE,
  LINUX_CLI_LABELS,
  LINUX_CLI_BUTTONS,
  LINUX_CLI_PLACEHOLDERS,
} from "../../../constants/LinuxCLIConstants";
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
  errorRed: "#dc2626",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const nativeFieldInputStyle = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: "#0f172a",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const { height: _nativeHeight, ...nativeFieldBase } = nativeFieldInputStyle;

const systemToolFieldInputStyle = {
  ...nativeFieldBase,
  width: "100%",
  padding: "6px 10px",
  borderRadius: 10,
  boxSizing: "border-box",
  background: "#fff",
  lineHeight: 1.4,
  minHeight: 34,
};

const inputStyle = systemToolFieldInputStyle;


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
const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: "#fff",
        color: "#334155",
        border: "1px solid #d1d5db",
        fontSize: 12,
        maxWidth: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

const tooltips = {
  command: "Enter the Linux command to execute.",
  logs: "Displays the output of the Linux command.",
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
      <div className="w-full" style={{ maxWidth: 1600 }}>
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
                <Tooltip
  title={tooltips.command}
  {...tooltipProps}
>
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
</Tooltip>
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
                <Tooltip
  title={tooltips.logs}
  {...tooltipProps}
>
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
</Tooltip>
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
                  {...inputInteraction}
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
