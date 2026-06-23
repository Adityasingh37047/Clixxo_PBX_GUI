import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  SCTRACK_TITLE,
  SCTRACK_RADIO_OPTIONS,
  SCTRACK_LABELS,
  SCTRACK_BUTTONS,
  SCTRACK_LOG_CANDIDATES,
  SCTRACK_POLL_MS,
} from "../../../constants/SignalingCallTrackConstants";
import { postAsteriskCLI, postLinuxCmd } from "../../../api/apiService";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Alert } from "@mui/material";

// ── Color palette (same as UserManage) ────────────────────────────────────────
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  divider: "var(--border-subtle)",
  cardShadow: "var(--shadow-soft)",
  labelText: "var(--text-primary)",
  valueText: "#3E5475",
  strongText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "#0284c7",
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
// ── Local field UI (inlined from maitenanceSharedUi) ──
const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";
const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

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
  backgroundColor: "var(--row-alt)",
  outline: "none",
  color: "var(--text-primary)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "var(--bg-main)";
const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "var(--bg-muted)";

const systemToolsFieldInputStyleWhite = {
  ...systemToolsFieldInputStyle,
  backgroundColor: "var(--bg-main)",
  borderRadius: 8,
  color: "var(--text-primary)",
};
const inputStyle = systemToolsFieldInputStyleWhite;

// ── Button Component (same as UserManage) ────────────────────────────────────
const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[var(--border-subtle)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:opacity-90`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_ERROR = `${BTN_BASE} bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]`;
const BTN_DELETE = `${BTN_BASE} bg-[#fee2e2] text-[#991b1b] border-[#fecaca] hover:bg-[#fecaca]`;
const BTN_EDIT = `${BTN_BASE} bg-[#dcfce7] text-[#166534] border-[#bbf7d0] hover:bg-[#bbf7d0]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  error: BTN_ERROR,
  delete: BTN_DELETE,
  edit: BTN_EDIT,
  danger: BTN_ERROR,
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

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxShadow: C.cardShadow,
  overflow: "hidden",
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
      cmd: `test -r '${path}' && echo OK || echo NO`,
    });
    if (extractCmdOutput(res) === "OK") return path;
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
  color: "var(--text-primary)",
  borderBottom: `1px solid ${C.divider}`,
};

const SignalingCallTrack = () => {
  const [filterType, setFilterType] = useState("caller");
  const [filterValue, setFilterValue] = useState("0");
  const [trackMessage, setTrackMessage] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
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
        cmd: `wc -l < '${logPath}' 2>/dev/null || echo 0`,
      });
      const lineCount =
        parseInt(extractCmdOutput(wcRes), 10) || 0;
      if (lineCount <= lineCountRef.current) return;

      const newLines = lineCount - lineCountRef.current;
      const tailRes = await postLinuxCmd({
        cmd: `tail -n ${newLines} '${logPath}' 2>/dev/null`,
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
        cmd: `wc -l < '${logPath}' 2>/dev/null || echo 0`,
      });
      lineCountRef.current = parseInt(extractCmdOutput(wcRes), 10) || 0;

      await runAsteriskCmd("pjsip set logger on");

      stopPolling();
      pollRef.current = setInterval(() => {
        pollLogChunk();
      }, SCTRACK_POLL_MS);

      await pollLogChunk();
      setIsTracking(true);
      showToast("Call track started.", "success");
    } catch (error) {
      console.error("Start call track error:", error);
      stopPolling();
      setIsTracking(false);
      showToast(error.message || "Failed to start call track.", "error");
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
        await runAsteriskCmd("pjsip set logger off");
      } catch (error) {
        console.warn("pjsip set logger off:", error);
      }
      setIsTracking(false);
      showToast("Call track stopped.", "success");
    } catch (error) {
      console.error("Stop call track error:", error);
      showToast(error.message || "Failed to stop call track.", "error");
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
      showToast("Filter cleared. Showing all messages.", "info");
    } else {
      showToast(`Filter applied (${filterType}: ${filterValue.trim()}).`, "success");
    }
  };

  const handleClear = () => {
    rawMessageRef.current = "";
    setTrackMessage("");
    if (isTracking) {
      postLinuxCmd({
        cmd: `wc -l < '${logPathRef.current}' 2>/dev/null || echo 0`,
      })
        .then((res) => {
          lineCountRef.current = parseInt(extractCmdOutput(res), 10) || 0;
        })
        .catch(() => {});
    }
    showToast("Track message cleared.", "info");
  };

  const handleDownload = () => {
    const content = trackMessage || rawMessageRef.current;
    if (!content.trim()) {
      showToast("No track message to download.", "warning");
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
    showToast("Track message downloaded.", "success");
  };

  useEffect(() => {
    return () => {
      stopPolling();
      if (isTrackingRef.current) {
        postAsteriskCLI({ command: "pjsip set logger off" }).catch(() => {});
      }
    };
  }, [stopPolling]);

  return (
    <div
      className="clixxo-system-settings theme-page-bg min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={SYS_TOAST_SX}
        >
          {toast.msg}
        </Alert>
      )}

      <div className="w-full" style={{ maxWidth: 1000 }}>
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
          <span>Maintenance</span>
          <span>&gt;</span>
          <span>System Tool</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Signaling Call Track
          </span>
        </div>

        <div style={tableContainerStyle}>
          <div style={{ ...blueBarStyle, justifyContent: "left" }}>
            <span>{SCTRACK_TITLE}</span>
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
                          color: "var(--text-muted)",
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
                        {opt.label}
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
                {SCTRACK_LABELS.trackMessage}
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
