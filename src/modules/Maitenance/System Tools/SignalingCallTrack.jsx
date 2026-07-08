import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Alert,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import {
  SIGNALING_CALL_TRACK_RADIO_OPTIONS,
  SIGNALING_CALL_TRACK_BUTTON_LABELS,
  SIGNALING_CALL_TRACK_BUTTON_VARIANTS,
  SIGNALING_CALL_TRACK_BUTTON_STYLE,
  SIGNALING_CALL_TRACK_LOG_CANDIDATES,
  SIGNALING_CALL_TRACK_POLL_MS,
  SIGNALING_CALL_TRACK_MESSAGES,
  SIGNALING_CALL_TRACK_ASTERISK_COMMANDS,
  SIGNALING_CALL_TRACK_LINUX_COMMANDS,
  SIGNALING_CALL_TRACK_CMD_RESULTS,
  SIGNALING_CALL_TRACK_TOAST_DEFAULT,
  SIGNALING_CALL_TRACK_TOAST_DURATION_MS,
  SIGNALING_CALL_TRACK_BREADCRUMB,
  SIGNALING_CALL_TRACK_TOOLTIPS,
  SIGNALING_CALL_TRACK_CARD_TITLE,
  SIGNALING_CALL_TRACK_SECTION_OUTPUT,
  SIGNALING_CALL_TRACK_OUTPUT_PLACEHOLDER,
  SIGNALING_CALL_TRACK_SECTION_HEADING_COLOR,
  SIGNALING_CALL_TRACK_FORM_PAD_X,
} from "../../../constants/SignalingCallTrackConstants";
import { postAsteriskCLI, postLinuxCmd } from "../../../api/apiService";

const SIGNALING_CALL_TRACK_SCROLL_CLASS = "sctrack-scroll";
const C = {
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#5a6d87",
  valueText: "#374151",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  errorRed: "#dc2626",
  sectionHeading: SIGNALING_CALL_TRACK_SECTION_HEADING_COLOR,
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

const inputStyle = systemFieldInputStyle;

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
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
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
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 36,
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


const sctrackBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
  padding: `20px ${SIGNALING_CALL_TRACK_FORM_PAD_X}px 24px`,
  background: C.cardBg,
  boxSizing: "border-box",
};

const sctrackFilterRowStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 32,
  flexWrap: "wrap",
};

const sctrackToolbarRowStyle = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "flex-start",
  gap: 16,
};

const sctrackOutputPanelStyle = {
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  background: "#ffffff",
};

const sctrackOutputHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  padding: "12px 16px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
};

const SIGNALING_CALL_TRACK_OUTPUT_BODY_BG = "#f1f5f9";

const sctrackOutputBodyStyle = {
  backgroundColor: SIGNALING_CALL_TRACK_OUTPUT_BODY_BG,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  overflow: "hidden",
};

const sctrackOutputTextareaStyle = {
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

const sctrackPageWrapStyle = {
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
  backgroundColor: "#f8fafc",
};

const sctrackPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

const sctrackTableContainerStyle = {
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

const sctrackHeaderStyle = {
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

const sctrackFixedAlertSx = {
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

const SctrackBreadcrumb = () => (
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
    <span>{SIGNALING_CALL_TRACK_BREADCRUMB[0]}</span>
    <span>&gt;</span>
    <span>{SIGNALING_CALL_TRACK_BREADCRUMB[1]}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {SIGNALING_CALL_TRACK_BREADCRUMB[2]}
    </span>
  </div>
);

const extractCmdOutput = (res) =>
  String(res?.responseData ?? res?.data ?? "").trim();

const applyTrackFilter = (text, type, value) => {
  if (!text) return "";
  if (type === "none" || !String(value || "").trim()) return text;

  const needle = String(value).trim().toLowerCase();
  const lines = text.split("\n");

  if (type === "caller") {
    return lines
      .filter((line) => {
        const lower = line.toLowerCase();
        if (!lower.includes(needle)) return false;
        return (
          lower.includes("caller") ||
          lower.includes("from:") ||
          lower.includes("cli") ||
          lower.includes("from-uri") ||
          lower.includes("from_uri")
        );
      })
      .join("\n");
  }

  if (type === "callee") {
    return lines
      .filter((line) => {
        const lower = line.toLowerCase();
        if (!lower.includes(needle)) return false;
        return (
          lower.includes("callee") ||
          lower.includes("to:") ||
          lower.includes("called") ||
          lower.includes("to-uri") ||
          lower.includes("to_uri") ||
          lower.includes("request-uri")
        );
      })
      .join("\n");
  }

  return lines.filter((line) => line.toLowerCase().includes(needle)).join("\n");
};

const resolveAsteriskLogPath = async () => {
  for (const path of SIGNALING_CALL_TRACK_LOG_CANDIDATES) {
    const res = await postLinuxCmd({
      cmd: SIGNALING_CALL_TRACK_LINUX_COMMANDS.CHECK_READABLE(path),
    });
    if (extractCmdOutput(res) === SIGNALING_CALL_TRACK_CMD_RESULTS.OK) return path;
  }
  return SIGNALING_CALL_TRACK_LOG_CANDIDATES[0];
};

const SignalingCallTrack = () => {
  const outputRef = useRef(null);
  const [filterType, setFilterType] = useState("caller");
  const [filterValue, setFilterValue] = useState("0");
  const [trackMessage, setTrackMessage] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(SIGNALING_CALL_TRACK_TOAST_DEFAULT);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(SIGNALING_CALL_TRACK_TOAST_DEFAULT), SIGNALING_CALL_TRACK_TOAST_DURATION_MS);
  };

  const rawMessageRef = useRef("");
  const logPathRef = useRef("");
  const lineCountRef = useRef(0);
  const pollRef = useRef(null);
  const appliedFilterRef = useRef({ type: "none", value: "" });
  const isTrackingRef = useRef(false);

  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  useEffect(() => {
    if (!outputRef.current || !trackMessage) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [trackMessage]);

  const refreshDisplay = useCallback(() => {
    const { type, value } = appliedFilterRef.current;
    setTrackMessage(applyTrackFilter(rawMessageRef.current, type, value));
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollLogChunk = useCallback(async () => {
    const logPath = logPathRef.current;
    if (!logPath) return;

    try {
      const wcRes = await postLinuxCmd({
        cmd: SIGNALING_CALL_TRACK_LINUX_COMMANDS.GET_LINE_COUNT(logPath),
      });
      const lineCount = parseInt(extractCmdOutput(wcRes), 10) || 0;
      if (lineCount <= lineCountRef.current) return;

      const newLines = lineCount - lineCountRef.current;
      const tailRes = await postLinuxCmd({
        cmd: SIGNALING_CALL_TRACK_LINUX_COMMANDS.TAIL_LINES(newLines, logPath),
      });
      const chunk = extractCmdOutput(tailRes);
      lineCountRef.current = lineCount;

      if (chunk) {
        rawMessageRef.current = rawMessageRef.current
          ? `${rawMessageRef.current}\n${chunk}`
          : chunk;
        refreshDisplay();
      }
    } catch (error) {
      console.error("Call track poll error:", error);
    }
  }, [refreshDisplay]);

  const runAsteriskCmd = async (command) => {
    const res = await postAsteriskCLI({ command });
    if (!res?.response) {
      throw new Error(res?.message || `Failed: ${command}`);
    }
    return extractCmdOutput(res);
  };

  const handleStart = async () => {
    if (isTracking || busy) return;
    setBusy(true);
    try {
      const logPath = await resolveAsteriskLogPath();
      logPathRef.current = logPath;

      const wcRes = await postLinuxCmd({
        cmd: SIGNALING_CALL_TRACK_LINUX_COMMANDS.GET_LINE_COUNT(logPath),
      });
      lineCountRef.current = parseInt(extractCmdOutput(wcRes), 10) || 0;

      await runAsteriskCmd(SIGNALING_CALL_TRACK_ASTERISK_COMMANDS.LOGGER_ON);

      stopPolling();
      pollRef.current = setInterval(() => {
        pollLogChunk();
      }, SIGNALING_CALL_TRACK_POLL_MS);

      await pollLogChunk();
      setIsTracking(true);
      showToast(SIGNALING_CALL_TRACK_MESSAGES.START_SUCCESS, "success");
    } catch (error) {
      console.error("Start call track error:", error);
      stopPolling();
      setIsTracking(false);
      showToast(error.message || SIGNALING_CALL_TRACK_MESSAGES.START_FAILED, "error");
    } finally {
      setBusy(false);
    }
  };

  const handleStop = async () => {
    if (busy) return;
    setBusy(true);
    try {
      stopPolling();
      try {
        await runAsteriskCmd(SIGNALING_CALL_TRACK_ASTERISK_COMMANDS.LOGGER_OFF);
      } catch (error) {
        console.warn("pjsip set logger off:", error);
      }
      setIsTracking(false);
      showToast(SIGNALING_CALL_TRACK_MESSAGES.STOP_SUCCESS, "success");
    } catch (error) {
      console.error("Stop call track error:", error);
      showToast(error.message || SIGNALING_CALL_TRACK_MESSAGES.STOP_FAILED, "error");
    } finally {
      setBusy(false);
    }
  };

  const handleFilter = () => {
    appliedFilterRef.current = {
      type: filterType,
      value: filterValue.trim(),
    };
    refreshDisplay();
    if (filterType === "none" || !filterValue.trim()) {
      showToast(SIGNALING_CALL_TRACK_MESSAGES.FILTER_CLEARED, "info");
    } else {
      showToast(
        SIGNALING_CALL_TRACK_MESSAGES.FILTER_APPLIED(filterType, filterValue.trim()),
        "success",
      );
    }
  };

  const handleClear = () => {
    rawMessageRef.current = "";
    setTrackMessage("");
    if (isTracking) {
      postLinuxCmd({
        cmd: SIGNALING_CALL_TRACK_LINUX_COMMANDS.GET_LINE_COUNT(logPathRef.current),
      })
        .then((res) => {
          lineCountRef.current = parseInt(extractCmdOutput(res), 10) || 0;
        })
        .catch(() => {});
    }
    showToast(SIGNALING_CALL_TRACK_MESSAGES.CLEAR_SUCCESS, "info");
  };

  const handleDownload = () => {
    const content = trackMessage || rawMessageRef.current;
    if (!content.trim()) {
      showToast(SIGNALING_CALL_TRACK_MESSAGES.DOWNLOAD_EMPTY, "warning");
      return;
    }
    const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "_");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `signaling_call_track_${dateStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(SIGNALING_CALL_TRACK_MESSAGES.DOWNLOAD_SUCCESS, "success");
  };

  useEffect(() => {
    return () => {
      stopPolling();
      if (isTrackingRef.current) {
        postAsteriskCLI({ command: SIGNALING_CALL_TRACK_ASTERISK_COMMANDS.LOGGER_OFF }).catch(
          () => {},
        );
      }
    };
  }, [stopPolling]);

  const hasTrackData = Boolean(trackMessage.trim());
  const canFilter =
    filterType === "none" || Boolean(filterValue.trim());

  return (
    <div
      className={SIGNALING_CALL_TRACK_SCROLL_CLASS}
      style={sctrackPageWrapStyle}
      data-native-scroll
    >
      <div style={sctrackPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast(SIGNALING_CALL_TRACK_TOAST_DEFAULT)}
            sx={sctrackFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <SctrackBreadcrumb />

        <div style={sctrackTableContainerStyle}>
          <div style={sctrackHeaderStyle}>
            <span>{SIGNALING_CALL_TRACK_CARD_TITLE}</span>
          </div>

          <div style={sctrackBodyStyle}>
            <div style={sctrackFilterRowStyle}>
              <RadioGroup
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                name="filterType"
                row
                style={{ gap: 16 }}
              >
                {SIGNALING_CALL_TRACK_RADIO_OPTIONS.map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    control={
                      <Radio
                        size="small"
                        sx={{
                          p: 0.5,
                          color: "#64748b",
                          "&.Mui-checked": { color: C.accent },
                        }}
                      />
                    }
                    label={
                      <Tooltip
                        title={SIGNALING_CALL_TRACK_TOOLTIPS.filterType}
                        {...tooltipProps}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            color: C.valueText,
                            fontWeight: 500,
                          }}
                        >
                          {opt.label}
                        </span>
                      </Tooltip>
                    }
                    sx={{ margin: 0 }}
                  />
                ))}
              </RadioGroup>
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                style={{
                  ...inputStyle,
                  minWidth: 120,
                  maxWidth: 180,
                  width: "auto",
                }}
                disabled={filterType === "none"}
                {...inputInteraction}
              />
            </div>

            <div style={sctrackToolbarRowStyle}>
              <Btn
                type="button"
                variant={SIGNALING_CALL_TRACK_BUTTON_VARIANTS.PRIMARY}
                onClick={handleStart}
                disabled={busy || isTracking}
                style={SIGNALING_CALL_TRACK_BUTTON_STYLE}
              >
                {SIGNALING_CALL_TRACK_BUTTON_LABELS.START}
              </Btn>
              <Btn
                type="button"
                variant={SIGNALING_CALL_TRACK_BUTTON_VARIANTS.CANCEL}
                onClick={handleStop}
                disabled={busy || !isTracking}
                style={SIGNALING_CALL_TRACK_BUTTON_STYLE}
              >
                {SIGNALING_CALL_TRACK_BUTTON_LABELS.STOP}
              </Btn>
              <Btn
                type="button"
                variant={SIGNALING_CALL_TRACK_BUTTON_VARIANTS.CANCEL}
                onClick={handleFilter}
                disabled={busy || !hasTrackData || !canFilter}
                style={SIGNALING_CALL_TRACK_BUTTON_STYLE}
              >
                {SIGNALING_CALL_TRACK_BUTTON_LABELS.FILTER}
              </Btn>
              <Btn
                type="button"
                variant={SIGNALING_CALL_TRACK_BUTTON_VARIANTS.CANCEL}
                onClick={handleClear}
                disabled={busy || !hasTrackData}
                style={SIGNALING_CALL_TRACK_BUTTON_STYLE}
              >
                {SIGNALING_CALL_TRACK_BUTTON_LABELS.CLEAR}
              </Btn>
              <Btn
                type="button"
                variant={SIGNALING_CALL_TRACK_BUTTON_VARIANTS.CANCEL}
                onClick={handleDownload}
                disabled={busy || !hasTrackData}
                style={SIGNALING_CALL_TRACK_BUTTON_STYLE}
              >
                {SIGNALING_CALL_TRACK_BUTTON_LABELS.DOWNLOAD}
              </Btn>
            </div>

            <div style={sctrackOutputPanelStyle}>
              <div style={sctrackOutputHeaderStyle}>
                <Tooltip
                  title={SIGNALING_CALL_TRACK_TOOLTIPS.trackMessage}
                  {...tooltipProps}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: C.sectionHeading,
                      cursor: "help",
                    }}
                  >
                    {SIGNALING_CALL_TRACK_SECTION_OUTPUT}
                  </span>
                </Tooltip>
              </div>
              <div style={sctrackOutputBodyStyle}>
                <textarea
                  ref={outputRef}
                  className={SIGNALING_CALL_TRACK_SCROLL_CLASS}
                  style={sctrackOutputTextareaStyle}
                  value={trackMessage}
                  readOnly
                  tabIndex={-1}
                  placeholder={SIGNALING_CALL_TRACK_OUTPUT_PLACEHOLDER}
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

export default SignalingCallTrack;
