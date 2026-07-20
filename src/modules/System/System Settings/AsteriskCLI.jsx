import React, { useState, useRef, useEffect } from "react";
import { Alert, CircularProgress } from "@mui/material";
import { Tooltip } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { postAsteriskCLI } from "../../../api/apiService";
import {
  ASTERISK_CLI_LABELS,
  ASTERISK_CLI_BUTTONS,
  ASTERISK_CLI_PLACEHOLDERS,
  ASTERISK_CLI_PAGE_BREADCRUMB_ROOT,
  ASTERISK_CLI_PAGE_BREADCRUMB_SECTION,
  ASTERISK_CLI_PAGE_TITLE,
  ASTERISK_CLI_CARD_TITLE,
  ASTERISK_CLI_FIELD_TOOLTIPS,
  ASTERISK_CLI_ERR_EMPTY_COMMAND,
  ASTERISK_CLI_ERR_SHORT_COMMAND,
  ASTERISK_CLI_TOAST_SUCCESS,
  ASTERISK_CLI_TOAST_INVALID_COMMAND,
  ASTERISK_CLI_TOAST_CLEARED,
  ASTERISK_CLI_TOAST_NETWORK_ERROR,
  ASTERISK_CLI_TOAST_SERVER_ERROR,
  ASTERISK_CLI_TOAST_EXECUTE_FAILED,
} from "../../../constants/AsteriskCLIConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../theme/pbxTokens";
import {
  Btn,
  ExtensionBreadcrumb as AsteriskCliBreadcrumb,
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as cliPageWrapStyle,
  extensionPageInnerStyle as cliPageInnerStyleBase,
  extensionFixedAlertSx as cliFixedAlertSx,
} from "../../../components/common";

const CLI_CARD_SHADOW =
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)";

const ASTERISK_CLI_SCROLL_CLASS = "asterisk-cli-scroll";
const ASTERISK_CLI_COMPACT_MQ = "(max-width: 768px)";
const ASTERISK_CLI_FORM_PAD_X = 28;


const FIELD_RADIUS = 6;


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
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

const nativeFieldInputStyle = {
  height: 32,
  width: 200,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
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

const systemFieldInputStyle = {
  ...nativeFieldBase,
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  padding: "0 12px",
  borderRadius: FIELD_RADIUS,
  boxSizing: "border-box",
  background: "#fff",
  lineHeight: 1.35,
  minHeight: 36,
  height: 36,
};

const inputStyle = systemFieldInputStyle;

const logsTextareaStyle = {
  ...systemFieldInputStyle,
  height: "auto",
  minHeight: 300,
  maxHeight: 500,
  padding: "12px 14px",
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
  fontSize: 12,
  lineHeight: 1.5,
  resize: "vertical",
  whiteSpace: "pre-wrap",
  backgroundColor: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
};

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const inlineLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  width: 120,
  minWidth: 120,
  flexShrink: 0,
  lineHeight: 1.4,
};


const cliFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const cliPageInnerStyle = {
  ...cliPageInnerStyleBase,
  display: "flex",
  flexDirection: "column",
};

const cliTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: CLI_CARD_SHADOW,
  overflow: "hidden",
  boxSizing: "border-box",
};

const cliHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const cliBodyStyle = {
  padding: "24px 32px 32px",
  boxSizing: "border-box",
};


const CliScrollbarStyles = () => (
  <style>{`
    .${ASTERISK_CLI_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${ASTERISK_CLI_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${ASTERISK_CLI_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${ASTERISK_CLI_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${ASTERISK_CLI_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${ASTERISK_CLI_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${ASTERISK_CLI_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

const CliPageShell = ({ children }) => (
  <>
    <CliScrollbarStyles />
    <div
      className={ASTERISK_CLI_SCROLL_CLASS}
      style={cliPageWrapStyle}
      data-native-scroll
    >
      <div style={cliPageInnerStyle}>{children}</div>
    </div>
  </>
);

const AsteriskCLI = () => {
  const isCompact = useMediaQuery(ASTERISK_CLI_COMPACT_MQ);
  const logsRef = useRef(null);
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [commandError, setCommandError] = useState("");

  useEffect(() => {
    if (!logsRef.current || !logs) return;
    logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 5000);
  };

  const validateCommand = (cmd) => {
    if (!cmd || cmd.trim() === "") {
      return ASTERISK_CLI_ERR_EMPTY_COMMAND;
    }
    if (cmd.trim().length < 2) {
      return ASTERISK_CLI_ERR_SHORT_COMMAND;
    }
    return "";
  };

  const buildLogEntry = (cmdName, responseDataStr) => {
    const timestamp = new Date().toLocaleString();
    return `[${timestamp}] $ ${cmdName}\n${responseDataStr}\n${"=".repeat(80)}\n`;
  };

  const executeCommand = async () => {
    setCommandError("");

    const validationError = validateCommand(command);
    if (validationError) {
      setCommandError(validationError);
      return;
    }

    setLoading(true);
    const cmdName = command.trim();

    try {
      const apiResponse = await postAsteriskCLI({ command: cmdName });

      if (apiResponse.response && apiResponse.responseData) {
        const responseDataStr = String(apiResponse.responseData).trim();
        const isError =
          responseDataStr.toLowerCase().includes("no such command") ||
          responseDataStr.toLowerCase().includes("invalid");

        setLogs((prev) => prev + buildLogEntry(cmdName, responseDataStr));

        if (isError) {
          showToast(ASTERISK_CLI_TOAST_INVALID_COMMAND, "error");
        } else {
          showToast(ASTERISK_CLI_TOAST_SUCCESS, "success");
        }
      } else {
        const fallbackMessage = `No such command '${cmdName}' (type 'core show help' for other commands)`;
        setLogs((prev) => prev + buildLogEntry(cmdName, fallbackMessage));
        showToast(ASTERISK_CLI_TOAST_INVALID_COMMAND, "error");
      }
    } catch (error) {
      console.error("Error executing Asterisk CLI command:", error);
      if (error.message === "Network Error") {
        showToast(ASTERISK_CLI_TOAST_NETWORK_ERROR, "error");
      } else if (error.response?.status === 500) {
        showToast(ASTERISK_CLI_TOAST_SERVER_ERROR, "error");
      } else {
        showToast(error.message || ASTERISK_CLI_TOAST_EXECUTE_FAILED, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs("");
    setCommand("");
    setCommandError("");
    showToast(ASTERISK_CLI_TOAST_CLEARED, "info");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      executeCommand();
    }
  };

  const commandRowStyle = {
    display: "flex",
    flexDirection: isCompact ? "column" : "row",
    alignItems: isCompact ? "stretch" : "flex-start",
    gap: isCompact ? 12 : 16,
    width: "100%",
  };

  const logsRowStyle = {
    display: "flex",
    flexDirection: isCompact ? "column" : "row",
    alignItems: isCompact ? "stretch" : "flex-start",
    gap: isCompact ? 12 : 16,
    width: "100%",
  };

  return (
    <CliPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={cliFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <AsteriskCliBreadcrumb
        root={ASTERISK_CLI_PAGE_BREADCRUMB_ROOT}
        section={ASTERISK_CLI_PAGE_BREADCRUMB_SECTION}
        current={ASTERISK_CLI_PAGE_TITLE}
      />

      <div style={cliTableContainerStyle}>
        <div style={cliHeaderStyle}>
          <span>{ASTERISK_CLI_CARD_TITLE}</span>
        </div>

        <div style={cliBodyStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={commandRowStyle}>
              <Tooltip title={ASTERISK_CLI_FIELD_TOOLTIPS.command} {...tooltipProps}>
                <span style={{ ...inlineLabelStyle, paddingTop: isCompact ? 0 : 9 }}>
                  {ASTERISK_CLI_LABELS.command}
                </span>
              </Tooltip>

              <div
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: isCompact ? "column" : "row",
                  alignItems: isCompact ? "stretch" : "flex-start",
                  gap: 12,
                  minWidth: 0,
                  maxWidth: isCompact ? "100%" : 640,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input
                    type="text"
                    style={inputStyle}
                    value={command}
                    onChange={(e) => {
                      setCommand(e.target.value);
                      setCommandError("");
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={ASTERISK_CLI_PLACEHOLDERS.command}
                    disabled={loading}
                    {...inputInteraction}
                  />
                  {commandError ? (
                    <span
                      style={{
                        color: C.errorRed,
                        fontSize: 11,
                        marginTop: 6,
                        display: "block",
                      }}
                    >
                      {commandError}
                    </span>
                  ) : null}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    flexShrink: 0,
                    paddingTop: isCompact ? 0 : 3,
                  }}
                >
                  <Btn
                    variant="primary"
                    onClick={executeCommand}
                    disabled={loading || !command.trim()}
                    style={cliFooterBtnStyle}
                  >
                    {loading ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <CircularProgress size={12} color="inherit" />
                        {ASTERISK_CLI_BUTTONS.loading}
                      </span>
                    ) : (
                      ASTERISK_CLI_BUTTONS.submit
                    )}
                  </Btn>
                  <Btn
                    variant="cancel"
                    onClick={clearLogs}
                    disabled={loading}
                    style={cliFooterBtnStyle}
                  >
                    {ASTERISK_CLI_BUTTONS.clear}
                  </Btn>
                </div>
              </div>
            </div>

            <div style={logsRowStyle}>
              <Tooltip title={ASTERISK_CLI_FIELD_TOOLTIPS.logs} {...tooltipProps}>
                <span
                  style={{
                    ...inlineLabelStyle,
                    paddingTop: isCompact ? 0 : 10,
                  }}
                >
                  {ASTERISK_CLI_LABELS.logs}
                </span>
              </Tooltip>

              <textarea
                ref={logsRef}
                className={ASTERISK_CLI_SCROLL_CLASS}
                style={{
                  ...logsTextareaStyle,
                  flex: 1,
                  minWidth: 0,
                }}
                value={logs}
                readOnly
                placeholder={ASTERISK_CLI_PLACEHOLDERS.logs}
                {...inputInteraction}
              />
            </div>
          </div>
        </div>
      </div>
    </CliPageShell>
  );
};

export default AsteriskCLI;
