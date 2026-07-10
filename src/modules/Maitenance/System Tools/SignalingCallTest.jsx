import React, { useState, useRef, useEffect, useCallback } from "react";
import { Alert, CircularProgress, Tooltip, useMediaQuery } from "@mui/material";
import {
  SIGNALING_CALL_TEST_LABELS,
  SIGNALING_CALL_TEST_TYPE_OPTIONS,
  SIGNALING_CALL_TEST_TRUNK_GROUP_OPTIONS,
  SIGNALING_CALL_TEST_BUTTON_LABELS,
  SIGNALING_CALL_TEST_BUTTON_VARIANTS,
  SIGNALING_CALL_TEST_BUTTON_STYLE,
  SIGNALING_CALL_TEST_LOG_CANDIDATES,
  SIGNALING_CALL_TEST_POLL_MS,
  SIGNALING_CALL_TEST_POLL_DURATION_MS,
  SIGNALING_CALL_TEST_MESSAGES,
  SIGNALING_CALL_TEST_TOOLTIPS,
  SIGNALING_CALL_TEST_BREADCRUMB,
  SIGNALING_CALL_TEST_DEFAULTS,
  SIGNALING_CALL_TEST_COMMANDS,
  SIGNALING_CALL_TEST_LOG_MESSAGES,
  SIGNALING_CALL_TEST_TRACE_HEADERS,
  SIGNALING_CALL_TEST_CARD_TITLE,
  SIGNALING_CALL_TEST_SECTION_CONFIG,
  SIGNALING_CALL_TEST_SECTION_OUTPUT,
  SIGNALING_CALL_TEST_OUTPUT_PLACEHOLDER,
  SIGNALING_CALL_TEST_SECTION_HEADING_COLOR,
  SIGNALING_CALL_TEST_FORM_PAD_X,
  SIGNALING_CALL_TEST_LABEL_COL_WIDTH,
  SIGNALING_CALL_TEST_FIELD_COL_GAP,
} from "../../../constants/SignalingCallTestConstants";
import {
  postAsteriskCLI,
  postLinuxCmd,
  amiOriginate,
  listGroups,
} from "../../../api/apiService";

const SIGNALING_CALL_TEST_SCROLL_CLASS = "sct-scroll";
const SIGNALING_CALL_TEST_COMPACT_MQ = "(max-width: 768px)";

const C = {
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#5a6d87",
  valueText: "#374151",
  mutedText: "#94a3b8",
  errorRed: "#dc2626",
  sectionHeading: SIGNALING_CALL_TEST_SECTION_HEADING_COLOR,
};

const CARD_RADIUS = 4;  
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
  el.style.boxShadow = FOCUS_RING_SHADOW();
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

const systemFieldInputStyle = {
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  padding: "0 12px",
  borderRadius: FIELD_RADIUS,
  border: `1px solid ${OUTLINED_BORDER}`,
  outline: "none",
  background: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  fontSize: 13,
  lineHeight: 1.35,
  minHeight: 36,
  height: 36,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const systemFieldSelectStyle = {
  ...systemFieldInputStyle,
  appearance: "auto",
  paddingTop: 7,
  paddingBottom: 7,
  cursor: "pointer",
};

const inputStyle = systemFieldInputStyle;
const selectStyle = systemFieldSelectStyle;

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
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const sctFieldRowStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  width: "100%",
  gap: SIGNALING_CALL_TEST_FIELD_COL_GAP,
};

const sctFieldLabelWrapStyle = {
  flex: `0 0 ${SIGNALING_CALL_TEST_LABEL_COL_WIDTH}px`,
  width: SIGNALING_CALL_TEST_LABEL_COL_WIDTH,
  minWidth: SIGNALING_CALL_TEST_LABEL_COL_WIDTH,
  maxWidth: SIGNALING_CALL_TEST_LABEL_COL_WIDTH,
  paddingTop: 9,
};

const sctFieldControlWrapStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  width: "100%",
};

const FieldRow = ({ name, label, children }) => {
  const tooltip = SIGNALING_CALL_TEST_TOOLTIPS[name];
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: "100%",
        lineHeight: 1.4,
        wordBreak: "break-word",
        cursor: tooltip ? "help" : "default",
      }}
    >
      {label}
    </label>
  );

  return (
    <div style={sctFieldRowStyle}>
      <div style={sctFieldLabelWrapStyle}>
        {tooltip ? (
          <Tooltip title={tooltip} {...tooltipProps}>
            {labelNode}
          </Tooltip>
        ) : (
          labelNode
        )}
      </div>
      <div style={sctFieldControlWrapStyle}>{children}</div>
    </div>
  );
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
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
    },
    cancel: {
      background: "#e2e8f0",
      color: "#475569",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#d4dce6",
      default: "#f1f5f9",
    }[variant] || "#f1f5f9";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#c5ced9",
      default: "#e2e8f0",
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
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
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
      {children}
    </button>
  );
};

const PanelTitle = ({ title }) => (
  <span
    style={{
      fontSize: 14,
      fontWeight: 600,
      color: C.sectionHeading,
      letterSpacing: "0.01em",
    }}
  >
    {title}
  </span>
);  

const sctBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
  padding: `20px ${SIGNALING_CALL_TEST_FORM_PAD_X}px 24px`,
  background: C.cardBg,
  boxSizing: "border-box",
};

const sctConfigPanelStyle = {
  background: "#ffffff",
  border: `1px solid ${C.divider}`,
  borderRadius: 4,
  overflow: "hidden",
};

const sctConfigHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  padding: "14px 18px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
};

const sctConfigActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const sctConfigBodyStyle = {
  padding: "18px 18px 20px",
};

const sctFieldsGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
  gap: isCompact ? 16 : 24,
  width: "100%",
  alignItems: "start",
});

const sctFieldsColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minWidth: 0,
};

const sctOutputPanelStyle = {
  border: `1px solid ${C.divider}`,
  borderRadius: 4,
  overflow: "hidden",
  background: "#ffffff",
};

const sctOutputHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  padding: "12px 16px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
};

const SIGNALING_CALL_TEST_OUTPUT_BODY_BG = "#f1f5f9";

const sctOutputBodyStyle = {
  backgroundColor: SIGNALING_CALL_TEST_OUTPUT_BODY_BG,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  overflow: "hidden",
};

const sctOutputTextareaStyle = {
  display: "block",
  width: "100%",
  minHeight: 200,
  maxHeight: 320,
  margin: 0,
  padding: "12px 16px 16px",
  border: "none",
  borderRadius: 0,
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
  fontSize: 13,
  lineHeight: 1.6,
  fontFamily: "monospace",
  color: C.labelText,
  backgroundColor: "transparent",
  whiteSpace: "pre-wrap",
  cursor: "default",
};

const sctPageWrapStyle = {
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
  backgroundColor: "#f8fafc",
};

const sctPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

const sctTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const sctHeaderStyle = {
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

const sctFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  maxWidth: 500,
  wordBreak: "break-word",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontWeight: 500,
};

const SctBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: C.mutedText,
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      flexShrink: 0,
    }}
  >
    <span>{SIGNALING_CALL_TEST_BREADCRUMB[0]}</span>
    <span>&gt;</span>
    <span>{SIGNALING_CALL_TEST_BREADCRUMB[1]}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{SIGNALING_CALL_TEST_BREADCRUMB[2]}</span>
  </div>
);

const extractCmdOutput = (res) =>
  String(res?.responseData ?? res?.data ?? "").trim();

const resolveAsteriskLogPath = async () => {
  for (const path of SIGNALING_CALL_TEST_LOG_CANDIDATES) {
    const res = await postLinuxCmd({
      cmd: SIGNALING_CALL_TEST_COMMANDS.CHECK_READABLE(path),
    });
    if (extractCmdOutput(res) === "OK") return path;
  }
  return SIGNALING_CALL_TEST_LOG_CANDIDATES[0];
};

const getTestTypeLabel = (value) =>
  SIGNALING_CALL_TEST_TYPE_OPTIONS.find((opt) => opt.value === value)?.label || value;

const getTrunkGroupLabel = (value, options) =>
  options.find((opt) => opt.value === value)?.label || value;

const SignalingCallTest = () => {
  const isCompact = useMediaQuery(SIGNALING_CALL_TEST_COMPACT_MQ);
  const outputRef = useRef(null);
  const [testType, setTestType] = useState(SIGNALING_CALL_TEST_TYPE_OPTIONS[0].value);
  const [trunkGroup, setTrunkGroup] = useState(
    SIGNALING_CALL_TEST_TRUNK_GROUP_OPTIONS[0].value,
  );
  const [trunkGroupOptions, setTrunkGroupOptions] = useState(
    SIGNALING_CALL_TEST_TRUNK_GROUP_OPTIONS,
  );
  const [callerId, setCallerId] = useState("");
  const [calledId, setCalledId] = useState("");
  const [originalCallee, setOriginalCallee] = useState("");
  const [trace, setTrace] = useState("");
  const [busy, setBusy] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [toast, setToast] = useState(SIGNALING_CALL_TEST_DEFAULTS.toast);

  const logPathRef = useRef("");
  const lineCountRef = useRef(0);
  const pollRef = useRef(null);
  const pollStopRef = useRef(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (!outputRef.current || !trace) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [trace]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(SIGNALING_CALL_TEST_DEFAULTS.toast), SIGNALING_CALL_TEST_DEFAULTS.toastTimeout);
  };

  const appendTrace = useCallback((chunk) => {
    if (!chunk) return;
    setTrace((prev) => (prev ? `${prev}\n${chunk}` : chunk));
  }, []);

  const stopTestSession = useCallback(async () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (pollStopRef.current) {
      clearTimeout(pollStopRef.current);
      pollStopRef.current = null;
    }
    if (isRunningRef.current) {
      try {
        await postAsteriskCLI({ command: SIGNALING_CALL_TEST_COMMANDS.LOGGER_OFF });
      } catch (_) {}
    }
    isRunningRef.current = false;
    setIsRunning(false);
  }, []);

  const pollLogChunk = useCallback(async () => {
    const logPath = logPathRef.current;
    if (!logPath) return;

    try {
      const wcRes = await postLinuxCmd({
        cmd: SIGNALING_CALL_TEST_COMMANDS.COUNT_LINES(logPath),
      });
      const lineCount = parseInt(extractCmdOutput(wcRes), 10) || 0;
      if (lineCount <= lineCountRef.current) return;

      const newLines = lineCount - lineCountRef.current;
      const tailRes = await postLinuxCmd({
        cmd: SIGNALING_CALL_TEST_COMMANDS.TAIL_LINES(newLines, logPath),
      });
      const chunk = extractCmdOutput(tailRes);
      lineCountRef.current = lineCount;
      appendTrace(chunk);
    } catch (error) {
      console.error(SIGNALING_CALL_TEST_LOG_MESSAGES.POLL_ERROR, error);
    }
  }, [appendTrace]);

  const runAsteriskCmd = async (command) => {
    const res = await postAsteriskCLI({ command });
    if (!res?.response) {
      throw new Error(res?.message || `Failed: ${command}`);
    }
    return extractCmdOutput(res);
  };

  useEffect(() => {
    const loadTrunkGroups = async () => {
      try {
        const res = await listGroups();
        const groups = Array.isArray(res?.message) ? res.message : [];
        if (!groups.length) return;

        const options = groups
          .map((group) => {
            const id = String(group.group_id ?? group.id ?? "").trim();
            if (!id) return null;
            return { value: id, label: `SIP Trunk Group[${id}]` };
          })
          .filter(Boolean);

        if (options.length) {
          setTrunkGroupOptions(options);
          setTrunkGroup((prev) =>
            options.some((opt) => opt.value === prev)
              ? prev
              : options[0].value,
          );
        }
      } catch (error) {
        console.warn(SIGNALING_CALL_TEST_LOG_MESSAGES.TRUNK_LOAD_ERROR, error);
      }
    };

    loadTrunkGroups();
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (pollStopRef.current) clearTimeout(pollStopRef.current);
      if (isRunningRef.current) {
        postAsteriskCLI({ command: SIGNALING_CALL_TEST_COMMANDS.LOGGER_OFF }).catch(() => {});
      }
    };
  }, []);

  const handleStart = async () => {
    if (busy || isRunning) return;

    const caller = callerId.trim();
    const called = calledId.trim();
    const original = originalCallee.trim();

    if (!called) {
      showToast(SIGNALING_CALL_TEST_MESSAGES.CALLED_ID_REQUIRED, "error");
      return;
    }

    setBusy(true);
    await stopTestSession();

    const header = [
      `=== ${SIGNALING_CALL_TEST_TRACE_HEADERS.TITLE} ===`,
      `${SIGNALING_CALL_TEST_TRACE_HEADERS.TIME}: ${new Date().toLocaleString()}`,
      `${SIGNALING_CALL_TEST_TRACE_HEADERS.TEST_TYPE}: ${getTestTypeLabel(testType)}`,
      `${SIGNALING_CALL_TEST_TRACE_HEADERS.TRUNK_GROUP}: ${getTrunkGroupLabel(trunkGroup, trunkGroupOptions)}`,
      `${SIGNALING_CALL_TEST_TRACE_HEADERS.CALLER_ID}: ${caller || SIGNALING_CALL_TEST_TRACE_HEADERS.EMPTY}`,
      `${SIGNALING_CALL_TEST_TRACE_HEADERS.CALLED_ID}: ${called}`,
      `${SIGNALING_CALL_TEST_TRACE_HEADERS.ORIGINAL_CALLEE}: ${original || SIGNALING_CALL_TEST_TRACE_HEADERS.EMPTY}`,
      "",
    ].join("\n");

    setTrace(header);

    try {
      const logPath = await resolveAsteriskLogPath();
      logPathRef.current = logPath;

      const wcRes = await postLinuxCmd({
        cmd: SIGNALING_CALL_TEST_COMMANDS.COUNT_LINES(logPath),
      });
      lineCountRef.current = parseInt(extractCmdOutput(wcRes), 10) || 0;

      await runAsteriskCmd(SIGNALING_CALL_TEST_COMMANDS.LOGGER_ON);
      isRunningRef.current = true;
      setIsRunning(true);

      pollRef.current = setInterval(() => {
        pollLogChunk();
      }, SIGNALING_CALL_TEST_POLL_MS);

      pollStopRef.current = setTimeout(async () => {
        await stopTestSession();
        appendTrace(`\n${SIGNALING_CALL_TEST_TRACE_HEADERS.TITLE}`);
        showToast(SIGNALING_CALL_TEST_MESSAGES.SIGNALING_FINISHED, "info");
      }, SIGNALING_CALL_TEST_POLL_DURATION_MS);

      appendTrace(SIGNALING_CALL_TEST_MESSAGES.SENDING_ORIGINATE);
      const originatePayload = { extension: called };
      if (caller) {
        originatePayload.callerid = `"${caller}" <${caller}>`;
      }

      const origRes = await amiOriginate(originatePayload);
      if (origRes?.response === false) {
        appendTrace(
          `Originate failed: ${origRes?.message || SIGNALING_CALL_TEST_MESSAGES.UNKNOWN_ERROR}`,
        );
        showToast(origRes?.message || SIGNALING_CALL_TEST_MESSAGES.ORIGINATE_FAILED, "error");
      } else {
        appendTrace(
          origRes?.message ||
            origRes?.responseData ||
            SIGNALING_CALL_TEST_MESSAGES.ORIGINATE_REQUEST_SENT,
        );
        showToast(SIGNALING_CALL_TEST_MESSAGES.SIGNALING_STARTED, "success");
      }

      await pollLogChunk();
    } catch (error) {
      console.error(SIGNALING_CALL_TEST_LOG_MESSAGES.SIGNALING_ERROR, error);
      await stopTestSession();
      appendTrace(`${SIGNALING_CALL_TEST_LOG_MESSAGES.SIGNALING_ERROR}: ${error.message || SIGNALING_CALL_TEST_MESSAGES.FAILED_TO_START_TEST}`);
      showToast(error.message || SIGNALING_CALL_TEST_MESSAGES.FAILED_TO_START_TEST, "error");
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async () => {
    await stopTestSession();
    setCallerId("");
    setCalledId("");
    setOriginalCallee("");
    setTrace("");
    showToast(SIGNALING_CALL_TEST_MESSAGES.FORM_CLEARED, "success");
  };

  const canStart = Boolean(calledId.trim());
  const hasClearableData =
    Boolean(trace.trim()) ||
    Boolean(callerId.trim()) ||
    Boolean(calledId.trim()) ||
    Boolean(originalCallee.trim());

  return (
    <div className={SIGNALING_CALL_TEST_SCROLL_CLASS} style={sctPageWrapStyle} data-native-scroll>
      <div style={sctPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast(SIGNALING_CALL_TEST_DEFAULTS.toast)}
            sx={sctFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <SctBreadcrumb />

        <div style={sctTableContainerStyle}>
          <div style={sctHeaderStyle}>
            <span>{SIGNALING_CALL_TEST_CARD_TITLE}</span>
          </div>

          <div style={sctBodyStyle}>
            <div style={sctConfigPanelStyle}>
              <div style={sctConfigHeaderStyle}>
                <PanelTitle title={SIGNALING_CALL_TEST_SECTION_CONFIG} />
                <div style={sctConfigActionsStyle}>
                  <Btn
                    variant={SIGNALING_CALL_TEST_BUTTON_VARIANTS.PRIMARY}
                    type="button"
                    onClick={handleStart}
                    disabled={busy || isRunning || !canStart}
                    style={SIGNALING_CALL_TEST_BUTTON_STYLE}
                  >
                    {busy ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <CircularProgress size={12} color="inherit" />
                        {SIGNALING_CALL_TEST_BUTTON_LABELS.STARTING}
                      </span>
                    ) : (
                      SIGNALING_CALL_TEST_BUTTON_LABELS.START
                    )}
                  </Btn>
                </div>
              </div>

              <div style={sctConfigBodyStyle}>
                <div style={sctFieldsGridStyle(isCompact)}>
                  <div style={sctFieldsColumnStyle}>
                    <FieldRow name="testType" label={SIGNALING_CALL_TEST_LABELS.testType}>
                      <select
                        style={selectStyle}
                        value={testType}
                        onChange={(e) => setTestType(e.target.value)}
                        {...inputInteraction}
                      >
                        {SIGNALING_CALL_TEST_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </FieldRow>

                    <FieldRow name="trunkGroup" label={SIGNALING_CALL_TEST_LABELS.trunkGroup}>
                      <select
                        style={selectStyle}
                        value={trunkGroup}
                        onChange={(e) => setTrunkGroup(e.target.value)}
                        {...inputInteraction}
                      >
                        {trunkGroupOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </FieldRow>

                    <FieldRow name="callerId" label={SIGNALING_CALL_TEST_LABELS.callerId}>
                      <input
                        type="text"
                        style={inputStyle}
                        value={callerId}
                        onChange={(e) => setCallerId(e.target.value)}
                        {...inputInteraction}
                      />
                    </FieldRow>
                  </div>

                  <div style={sctFieldsColumnStyle}>
                    <FieldRow name="calledId" label={SIGNALING_CALL_TEST_LABELS.calledId}>
                      <input
                        type="text"
                        style={inputStyle}
                        value={calledId}
                        onChange={(e) => setCalledId(e.target.value)}
                        {...inputInteraction}
                      />
                    </FieldRow>

                    <FieldRow
                      name="originalCallee"
                      label={SIGNALING_CALL_TEST_LABELS.originalCallee}
                    >
                      <input
                        type="text"
                        style={inputStyle}
                        value={originalCallee}
                        onChange={(e) => setOriginalCallee(e.target.value)}
                        {...inputInteraction}
                      />
                    </FieldRow>
                  </div>
                </div>
              </div>
            </div>

            <div style={sctOutputPanelStyle}>
              <div style={sctOutputHeaderStyle}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: C.sectionHeading,
                  }}
                >
                  {SIGNALING_CALL_TEST_SECTION_OUTPUT}
                </span>
                <Btn
                  variant={SIGNALING_CALL_TEST_BUTTON_VARIANTS.CANCEL}
                  type="button"
                  onClick={handleClear}
                  disabled={busy || !hasClearableData}
                  style={SIGNALING_CALL_TEST_BUTTON_STYLE}
                >
                  {SIGNALING_CALL_TEST_BUTTON_LABELS.CLEAR}
                </Btn>
              </div>
              <div style={sctOutputBodyStyle}>
                <textarea
                  ref={outputRef}
                  className={SIGNALING_CALL_TEST_SCROLL_CLASS}
                  style={sctOutputTextareaStyle}
                  value={trace}
                  readOnly
                  tabIndex={-1}
                  placeholder={SIGNALING_CALL_TEST_OUTPUT_PLACEHOLDER}
                  onFocus={(e) => e.target.blur()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalingCallTest;
