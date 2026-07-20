import React, { useState, useRef, useEffect } from "react";
import { Alert, CircularProgress } from "@mui/material";
import { Tooltip } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { postLinuxCmd } from "../../../api/apiService";
import {
  LINUX_CLI_LABELS,
  LINUX_CLI_BUTTONS,
  LINUX_CLI_PLACEHOLDERS,
  LINUX_CLI_PAGE_BREADCRUMB_ROOT,
  LINUX_CLI_PAGE_BREADCRUMB_SECTION,
  LINUX_CLI_PAGE_TITLE,
  LINUX_CLI_CARD_TITLE,
  LINUX_CLI_FIELD_TOOLTIPS,
  LINUX_CLI_ERR_EMPTY_COMMAND,
  LINUX_CLI_ERR_SHORT_COMMAND,
  LINUX_CLI_TOAST_SUCCESS,
  LINUX_CLI_TOAST_INVALID_COMMAND,
  LINUX_CLI_TOAST_CLEARED,
  LINUX_CLI_TOAST_NETWORK_ERROR,
  LINUX_CLI_TOAST_SERVER_ERROR,
  LINUX_CLI_TOAST_EXECUTE_FAILED,
} from "../../../constants/LinuxCLIConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../theme/pbxTokens";
import {
  Btn,
  ExtensionBreadcrumb,
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as cliPageWrapStyle,
  extensionPageInnerStyle as cliPageInnerStyleBase,
  extensionFixedAlertSx as cliFixedAlertSx,
} from "../../../components/common";

const CLI_CARD_SHADOW =
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)";

const LINUX_CLI_SCROLL_CLASS = "linux-cli-scroll";
const LINUX_CLI_COMPACT_MQ = "(max-width: 768px)";
const LINUX_CLI_FORM_PAD_X = 28;


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
    .${LINUX_CLI_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${LINUX_CLI_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${LINUX_CLI_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${LINUX_CLI_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${LINUX_CLI_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${LINUX_CLI_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${LINUX_CLI_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

const CliPageShell = ({ children }) => (
  <>
    <CliScrollbarStyles />
    <div
      className={LINUX_CLI_SCROLL_CLASS}
      style={cliPageWrapStyle}
      data-native-scroll
    >
      <div style={cliPageInnerStyle}>{children}</div>
    </div>
  </>
);

const CliBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={LINUX_CLI_PAGE_BREADCRUMB_ROOT}
    section={LINUX_CLI_PAGE_BREADCRUMB_SECTION}
    current={LINUX_CLI_PAGE_TITLE}
  />
);

const LinuxCLI = () => {
  const isCompact = useMediaQuery(LINUX_CLI_COMPACT_MQ);
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
      return LINUX_CLI_ERR_EMPTY_COMMAND;
    }
    if (cmd.trim().length < 2) {
      return LINUX_CLI_ERR_SHORT_COMMAND;
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
      const apiResponse = await postLinuxCmd({ cmd: cmdName });

      if (apiResponse.response && apiResponse.responseData !== undefined) {
        setLogs((prev) =>
          prev + buildLogEntry(cmdName, apiResponse.responseData || ""),
        );
        showToast(LINUX_CLI_TOAST_SUCCESS, "success");
      } else {
        const cmdToken = cmdName.split(/\s+/)[0] || cmdName;
        const fallbackMessage = `-bash: ${cmdToken}: command not found`;
        setLogs((prev) => prev + buildLogEntry(cmdName, fallbackMessage));
        showToast(LINUX_CLI_TOAST_INVALID_COMMAND, "error");
      }
    } catch (error) {
      console.error("Error executing Linux command:", error);
      if (error.message === "Network Error") {
        showToast(LINUX_CLI_TOAST_NETWORK_ERROR, "error");
      } else if (error.response?.status === 500) {
        showToast(LINUX_CLI_TOAST_SERVER_ERROR, "error");
      } else {
        showToast(error.message || LINUX_CLI_TOAST_EXECUTE_FAILED, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs("");
    setCommand("");
    setCommandError("");
    showToast(LINUX_CLI_TOAST_CLEARED, "info");
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

      <CliBreadcrumb />

      <div style={cliTableContainerStyle}>
        <div style={cliHeaderStyle}>
          <span>{LINUX_CLI_CARD_TITLE}</span>
        </div>

        <div style={cliBodyStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={commandRowStyle}>
              <Tooltip title={LINUX_CLI_FIELD_TOOLTIPS.command} {...tooltipProps}>
                <span style={{ ...inlineLabelStyle, paddingTop: isCompact ? 0 : 9 }}>
                  {LINUX_CLI_LABELS.command}
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
                    placeholder={LINUX_CLI_PLACEHOLDERS.command}
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
                        {LINUX_CLI_BUTTONS.loading}
                      </span>
                    ) : (
                      LINUX_CLI_BUTTONS.submit
                    )}
                  </Btn>
                  <Btn
                    variant="cancel"
                    onClick={clearLogs}
                    disabled={loading}
                    style={cliFooterBtnStyle}
                  >
                    {LINUX_CLI_BUTTONS.clear}
                  </Btn>
                </div>
              </div>
            </div>

            <div style={logsRowStyle}>
              <Tooltip title={LINUX_CLI_FIELD_TOOLTIPS.logs} {...tooltipProps}>
                <span
                  style={{
                    ...inlineLabelStyle,
                    paddingTop: isCompact ? 0 : 10,
                  }}
                >
                  {LINUX_CLI_LABELS.logs}
                </span>
              </Tooltip>

              <textarea
                ref={logsRef}
                className={LINUX_CLI_SCROLL_CLASS}
                style={{
                  ...logsTextareaStyle,
                  flex: 1,
                  minWidth: 0,
                }}
                value={logs}
                readOnly
                placeholder={LINUX_CLI_PLACEHOLDERS.logs}
                {...inputInteraction}
              />
            </div>
          </div>
        </div>
      </div>
    </CliPageShell>
  );
};

export default LinuxCLI;
