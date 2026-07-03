import React, { useState, useRef, useEffect, useCallback } from "react";
import Tooltip from "@mui/material/Tooltip";
import { InfoOutlined } from "@mui/icons-material";
import {
  SCTRACK_RADIO_OPTIONS,
  SCTRACK_LABELS,
  SCTRACK_BUTTONS,
  SCTRACK_LOG_CANDIDATES,
  SCTRACK_POLL_MS,
  SCTRACK_MESSAGES,
  SCTRACK_ASTERISK_COMMANDS,
  SCTRACK_LINUX_COMMANDS,
  SCTRACK_CMD_RESULTS,
  SCTRACK_DEFAULT_TOAST,
  SCTRACK_TOAST_DURATION,
  SCTRACK_BREADCRUMB,
  SCTRACK_TRACE_HEADERS,
  SCTRACK_TOOLTIPS,
} from "../../../constants/SignalingCallTrackConstants";
import { postAsteriskCLI, postLinuxCmd } from "../../../api/apiService";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Alert } from "@mui/material";

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

const nativeFieldInteraction = {
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

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onFocus(e);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onBlur(e);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseEnter(e);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseLeave(e);
  },
};

const getSystemToolsInputInteraction = (hasError, errorColor = "#dc2626") => {
  if (!hasError) return inputInteraction;
  const ring = (el, focused) => {
    el.style.borderColor = errorColor;
    el.style.borderWidth = "1px";
    el.style.boxShadow = focused ? `0 0 0 1px ${errorColor}` : "none";
  };
  return {
    onFocus: (e) => ring(e.target, true),
    onBlur: (e) => ring(e.target, false),
    onMouseEnter: (e) => ring(e.target, document.activeElement === e.target),
    onMouseLeave: (e) => ring(e.target, document.activeElement === e.target),
  };
};

const systemToolsFieldInputStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 14,
  width: "100%",
  backgroundColor: "#f8fafc",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "#ffffff";
const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "#f1f5f9";

const systemToolsFieldInputStyleWhite = {
  ...systemToolsFieldInputStyle,
  backgroundColor: "#ffffff",
  borderRadius: 8,
  color: "#3E5475",
};
const inputStyle = systemToolsFieldInputStyleWhite;

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

const SignalingCallTrackPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const SignalingCallTrackPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};


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
  for (const path of SCTRACK_LOG_CANDIDATES) {
    const res = await postLinuxCmd({
      cmd: SCTRACK_LINUX_COMMANDS.CHECK_READABLE(path),
    });
    if (extractCmdOutput(res) === SCTRACK_CMD_RESULTS.OK) return path;
  }
  return SCTRACK_LOG_CANDIDATES[0];
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

const SignalingCallTrack = () => {
  const [filterType, setFilterType] = useState("caller");
  const [filterValue, setFilterValue] = useState("0");
  const [trackMessage, setTrackMessage] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(SCTRACK_DEFAULT_TOAST);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(SCTRACK_DEFAULT_TOAST), SCTRACK_TOAST_DURATION);
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
        cmd: SCTRACK_LINUX_COMMANDS.GET_LINE_COUNT(logPath),
      });
      const lineCount =
        parseInt(extractCmdOutput(wcRes), 10) || 0;
      if (lineCount <= lineCountRef.current) return;

      const newLines = lineCount - lineCountRef.current;
      const tailRes = await postLinuxCmd({
        cmd: SCTRACK_LINUX_COMMANDS.TAIL_LINES(newLines, logPath),
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
        cmd: SCTRACK_LINUX_COMMANDS.GET_LINE_COUNT(logPath),
      });
      lineCountRef.current = parseInt(extractCmdOutput(wcRes), 10) || 0;

      await runAsteriskCmd(SCTRACK_ASTERISK_COMMANDS.LOGGER_ON);

      stopPolling();
      pollRef.current = setInterval(() => {
        pollLogChunk();
      }, SCTRACK_POLL_MS);

      await pollLogChunk();
      setIsTracking(true);
      showToast(SCTRACK_MESSAGES.START_SUCCESS, "success");
    } catch (error) {
      console.error("Start call track error:", error);
      stopPolling();
      setIsTracking(false);
      showToast(error.message || SCTRACK_MESSAGES.START_FAILED, "error");
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
        await runAsteriskCmd(SCTRACK_ASTERISK_COMMANDS.LOGGER_OFF);
      } catch (error) {
        console.warn("pjsip set logger off:", error);
      }
      setIsTracking(false);
      showToast(SCTRACK_MESSAGES.STOP_SUCCESS, "success");
    } catch (error) {
      console.error("Stop call track error:", error);
      showToast(error.message || SCTRACK_MESSAGES.STOP_FAILED, "error");
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
      showToast(SCTRACK_MESSAGES.FILTER_CLEARED, "info");
    } else {
      showToast(SCTRACK_MESSAGES.FILTER_APPLIED(filterType, filterValue.trim()), "success");
    }
  };

  const handleClear = () => {
    rawMessageRef.current = "";
    setTrackMessage("");
    if (isTracking) {
      postLinuxCmd({
        cmd: SCTRACK_LINUX_COMMANDS.GET_LINE_COUNT(logPathRef.current),
      })
        .then((res) => {
          lineCountRef.current = parseInt(extractCmdOutput(res), 10) || 0;
        })
        .catch(() => {});
    }
    showToast(SCTRACK_MESSAGES.CLEAR_SUCCESS, "info");
  };

  const handleDownload = () => {
    const content = trackMessage || rawMessageRef.current;
    if (!content.trim()) {
      showToast(SCTRACK_MESSAGES.DOWNLOAD_EMPTY, "warning");
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
    showToast(SCTRACK_MESSAGES.DOWNLOAD_SUCCESS, "success");
  };

  useEffect(() => {
    return () => {
      stopPolling();
      if (isTrackingRef.current) {
        postAsteriskCLI({ command: SCTRACK_ASTERISK_COMMANDS.LOGGER_OFF }).catch(() => {});
      }
    };
  }, [stopPolling]);

  return (
<div style={SignalingCallTrackPageWrapStyle} data-native-scroll>
  <div style={SignalingCallTrackPageInnerStyle}>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(SCTRACK_DEFAULT_TOAST)}
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
          <span>{SCTRACK_BREADCRUMB[0]}</span>
          <span>&gt;</span>
          <span>{SCTRACK_BREADCRUMB[1]}</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {SCTRACK_BREADCRUMB[2]}
          </span>
        </div>

        <div style={tableContainerStyle}>
          <div style={{ ...blueBarStyle, justifyContent: "left" }}>
            <span>{SCTRACK_TRACE_HEADERS.title}</span>
          </div>

          <div style={{ padding: "24px 20px" }}>
            {/* Filter Row */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 32,
                marginBottom: 24,
                flexWrap: "wrap",
              }}
            >
              <RadioGroup
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                name="filterType"
                row
                style={{ gap: 16 }}
              >
                {SCTRACK_RADIO_OPTIONS.map((opt) => (
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
                      <span
                        style={{
                          fontSize: 14,
                          color: C.valueText,
                          fontWeight: 500,
                        }}
                      >
                        <Tooltip title={SCTRACK_TOOLTIPS.FILTER_TYPE} {...tooltipProps}>
                          <span style={{ color: C.labelText }}>{opt.label}</span>
                        </Tooltip>
                      </span>
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
                }}
                {...inputInteraction}
              />
            </div>

            {/* Buttons Row - Justify left as requested */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "flex-start",
                gap: 16,
                marginBottom: 32,
              }}
            >
              <Btn
                type="button"
                variant="primary"
                onClick={handleStart}
                disabled={busy || isTracking}
                style={{ minWidth: 100, height: 33, fontSize: 13 }}
              >
                {SCTRACK_BUTTONS.start}
              </Btn>
              <Btn
                type="button"
                variant="cancel"
                onClick={handleStop}
                disabled={busy || !isTracking}
                style={{ minWidth: 100, height: 33, fontSize: 13 }}
              >
                {SCTRACK_BUTTONS.stop}
              </Btn>
              <Btn
                type="button"
                variant="cancel"
                onClick={handleFilter}
                disabled={busy}
                style={{ minWidth: 100, height: 33, fontSize: 13 }}
              >
                {SCTRACK_BUTTONS.filter}
              </Btn>
              <Btn
                type="button"
                variant="cancel"
                onClick={handleClear}
                disabled={busy}
                style={{ minWidth: 100, height: 33, fontSize: 13 }}
              >
                {SCTRACK_BUTTONS.clear}
              </Btn>
              <Btn
                type="button"
                variant="cancel"
                onClick={handleDownload}
                disabled={busy}
                style={{ minWidth: 100, height: 33, fontSize: 13 }}
              >
                {SCTRACK_BUTTONS.download}
              </Btn>
            </div>

            {/* Track Message Textarea */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label
                style={{ fontSize: 14, color: C.labelText, fontWeight: 600 }}
              >
                <Tooltip title={SCTRACK_TOOLTIPS.TRACK_MESSAGE} {...tooltipProps}>
                  <span style={{ color: C.labelText }}>{SCTRACK_LABELS.trackMessage}</span>
                </Tooltip>
              </label>
              <textarea
                value={trackMessage}
                readOnly
                style={{
                  width: "100%",
                  minHeight: 220,
                  maxHeight: 400,
                  border: `1px solid ${OUTLINED_BORDER}`,
                  borderRadius: 10,
                  backgroundColor: C.pageBg,
                  color: C.valueText,
                  fontSize: 14,
                  padding: "12px",
                  fontFamily: "monospace",
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                {...inputInteraction}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalingCallTrack;
