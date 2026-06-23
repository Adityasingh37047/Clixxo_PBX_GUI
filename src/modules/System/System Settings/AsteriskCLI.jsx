import React, { useState } from "react";
import { postAsteriskCLI } from "../../../api/apiService";
import { Alert } from "@mui/material";
import {
  ASTERISK_CLI_TITLE,
  ASTERISK_CLI_LABELS,
  ASTERISK_CLI_BUTTONS,
  ASTERISK_CLI_PLACEHOLDERS,
} from "../../../constants/AsteriskCLIConstants";
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-subtle)",
  divider: "var(--border-subtle)",
  cardShadow: "var(--shadow-soft)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  strongText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "var(--accent-brand)",
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
// ── Local field UI (inlined from systemSharedUi) ──
const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";
const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
  el.style.backgroundColor = "var(--bg-main)";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
  el.style.backgroundColor = "var(--input-hover-bg)";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
  el.style.backgroundColor = "var(--bg-main)";
};

const nativeFieldInputStyle = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "var(--bg-main)",
  color: "var(--text-primary)",
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
  background: "var(--bg-main)",
  lineHeight: 1.4,
  minHeight: 34,
};

const inputStyle = systemToolFieldInputStyle;


const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[var(--border-subtle)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:opacity-90`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_ERROR = `${BTN_BASE} bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]`;
const BTN_DELETE = `${BTN_BASE} bg-[#fee2e2] text-[#991b1b] border-[#fecaca] hover:bg-[#fecaca]`;
const BTN_EDIT = `${BTN_BASE} bg-[#dcfce7] text-[#166534] border-[#bbf7d0] hover:bg-[#bbf7d0]`;
const BTN_DANGER = `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  error: BTN_ERROR,
  delete: BTN_DELETE,
  edit: BTN_EDIT,
  danger: BTN_DANGER,
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

const AsteriskCLI = () => {
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
    if (!cmd || cmd.trim() === "") {
      return "Please enter a command.";
    }
    if (cmd.trim().length < 2) {
      return "Command must be at least 2 characters long.";
    }
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
      console.log("Executing Asterisk CLI command:", command.trim());
      const apiResponse = await postAsteriskCLI({
        command: command.trim(),
      });

      console.log("Asterisk CLI Response:", apiResponse);

      if (apiResponse.response && apiResponse.responseData) {
        const responseDataStr = String(apiResponse.responseData).trim();
        const isError =
          responseDataStr.toLowerCase().includes("no such command") ||
          responseDataStr.toLowerCase().includes("invalid");

        if (isError) {
          const timestamp = new Date().toLocaleString();
          const cmdName = command.trim();
          const logEntry = `[${timestamp}] $ ${cmdName}\n${responseDataStr}\n${"=".repeat(80)}\n`;
          setLogs((prev) => prev + logEntry);
          showMessage("error", "Invalid or wrong command.");
        } else {
          const timestamp = new Date().toLocaleString();
          const logEntry = `[${timestamp}] $ ${command.trim()}\n${responseDataStr}\n${"=".repeat(80)}\n`;
          setLogs((prev) => prev + logEntry);
          showMessage("success", "Command executed successfully!");
        }
      } else {
        const timestamp = new Date().toLocaleString();
        const cmdName = command.trim();
        const logEntry = `[${timestamp}] $ ${cmdName}\nNo such command '${cmdName}' (type 'core show help' for other commands)\n${"=".repeat(80)}\n`;
        setLogs((prev) => prev + logEntry);
        showMessage("error", "Invalid or wrong command.");
      }
    } catch (error) {
      console.error("Error executing Asterisk CLI command:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else if (error.response?.status === 500) {
        showMessage(
          "error",
          "Server error. The Asterisk CLI endpoint may have issues.",
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
      className="clixxo-system-settings theme-page-bg min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={SYS_TOAST_SX}
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
            {ASTERISK_CLI_TITLE}
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
            border: `1px solid var(--border-subtle)`,
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
              Asterisk CLI
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
                  {ASTERISK_CLI_LABELS.command}
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
                    placeholder={ASTERISK_CLI_PLACEHOLDERS.command}
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
                      ? ASTERISK_CLI_BUTTONS.loading
                      : ASTERISK_CLI_BUTTONS.submit}
                  </Btn>
                  <Btn variant="cancel" onClick={clearLogs} disabled={loading} style={{ minWidth: 90 }}>
                    {ASTERISK_CLI_BUTTONS.clear}
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
                  {ASTERISK_CLI_LABELS.logs}
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
                    backgroundColor: "var(--row-alt)",
                    borderColor: C.cardBorder,
                  }}
                  value={logs}
                  onChange={(e) => setLogs(e.target.value)}
                  placeholder={ASTERISK_CLI_PLACEHOLDERS.logs}
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

export default AsteriskCLI;
