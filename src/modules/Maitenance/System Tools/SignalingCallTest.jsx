import React, { useState, useRef, useEffect, useCallback } from "react";
import Tooltip from "@mui/material/Tooltip";
import { InfoOutlined } from "@mui/icons-material";
import {
  SCT_TITLE,
  SCT_LABELS,
  SCT_TEST_TYPE_OPTIONS,
  SCT_TRUNK_GROUP_OPTIONS,
  SCT_BUTTONS,
  SCT_TRACE_LABEL,
  SCT_LOG_CANDIDATES,
  SCT_POLL_MS,
  SCT_POLL_DURATION_MS,
} from "../../../constants/SignalingCallTestConstants";
import {
  postAsteriskCLI,
  postLinuxCmd,
  amiOriginate,
  listGroups,
} from "../../../api/apiService";
import { Alert } from "@mui/material";
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
const systemToolsFieldSelectStyleWhite = {
  ...systemToolsFieldInputStyleWhite,
  appearance: "auto",
};
const inputStyle = systemToolsFieldInputStyleWhite;
const selectStyle = systemToolsFieldSelectStyleWhite;

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
    testType: "Specifies the test type.",
    trunkGroup: "Specifies the SIP trunk group.",
    callerId: "Specifies the caller ID.",
    calledId: "Specifies the called ID.",
    originalCallee: "Specifies the original callee ID.",
  };

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

const SignalingCallTestPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const SignalingCallTestPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.divider}`,
};

const extractCmdOutput = (res) =>
  String(res?.responseData ?? res?.data ?? "").trim();

const resolveAsteriskLogPath = async () => {
  for (const path of SCT_LOG_CANDIDATES) {
    const res = await postLinuxCmd({
      cmd: `test -r '${path}' && echo OK || echo NO`,
    });
    if (extractCmdOutput(res) === "OK") return path;
  }
  return SCT_LOG_CANDIDATES[0];
};

const getTestTypeLabel = (value) =>
  SCT_TEST_TYPE_OPTIONS.find((opt) => opt.value === value)?.label || value;

const getTrunkGroupLabel = (value, options) =>
  options.find((opt) => opt.value === value)?.label || value;

const SignalingCallTest = () => {
  const [testType, setTestType] = useState(SCT_TEST_TYPE_OPTIONS[0].value);
  const [trunkGroup, setTrunkGroup] = useState(
    SCT_TRUNK_GROUP_OPTIONS[0].value,
  );
  const [trunkGroupOptions, setTrunkGroupOptions] = useState(
    SCT_TRUNK_GROUP_OPTIONS,
  );
  const [callerId, setCallerId] = useState("");
  const [calledId, setCalledId] = useState("");
  const [originalCallee, setOriginalCallee] = useState("");
  const [trace, setTrace] = useState("");
  const [busy, setBusy] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const logPathRef = useRef("");
  const lineCountRef = useRef(0);
  const pollRef = useRef(null);
  const pollStopRef = useRef(null);
  const isRunningRef = useRef(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
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
        await postAsteriskCLI({ command: "pjsip set logger off" });
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
        cmd: `wc -l < '${logPath}' 2>/dev/null || echo 0`,
      });
      const lineCount = parseInt(extractCmdOutput(wcRes), 10) || 0;
      if (lineCount <= lineCountRef.current) return;

      const newLines = lineCount - lineCountRef.current;
      const tailRes = await postLinuxCmd({
        cmd: `tail -n ${newLines} '${logPath}' 2>/dev/null`,
      });
      const chunk = extractCmdOutput(tailRes);
      lineCountRef.current = lineCount;
      appendTrace(chunk);
    } catch (error) {
      console.error("Signaling call test poll error:", error);
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
        console.warn("Failed to load SIP trunk groups:", error);
      }
    };

    loadTrunkGroups();
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (pollStopRef.current) clearTimeout(pollStopRef.current);
      if (isRunningRef.current) {
        postAsteriskCLI({ command: "pjsip set logger off" }).catch(() => {});
      }
    };
  }, []);

  const handleStart = async () => {
    if (busy || isRunning) return;

    const caller = callerId.trim();
    const called = calledId.trim();
    const original = originalCallee.trim();

    if (!called) {
      showToast("CalledID is required to start the test.", "error");
      return;
    }

    setBusy(true);
    await stopTestSession();

    const header = [
      "=== Signaling Call Test ===",
      `Time: ${new Date().toLocaleString()}`,
      `Test Type: ${getTestTypeLabel(testType)}`,
      `SIP Trunk Group: ${getTrunkGroupLabel(trunkGroup, trunkGroupOptions)}`,
      `CallerID: ${caller || "(empty)"}`,
      `CalledID: ${called}`,
      `Original CalleeID: ${original || "(empty)"}`,
      "",
    ].join("\n");

    setTrace(header);

    try {
      const logPath = await resolveAsteriskLogPath();
      logPathRef.current = logPath;

      const wcRes = await postLinuxCmd({
        cmd: `wc -l < '${logPath}' 2>/dev/null || echo 0`,
      });
      lineCountRef.current = parseInt(extractCmdOutput(wcRes), 10) || 0;

      await runAsteriskCmd("pjsip set logger on");
      isRunningRef.current = true;
      setIsRunning(true);

      pollRef.current = setInterval(() => {
        pollLogChunk();
      }, SCT_POLL_MS);

      pollStopRef.current = setTimeout(async () => {
        await stopTestSession();
        appendTrace("\n=== Test capture ended ===");
        showToast("Signaling call test finished.", "info");
      }, SCT_POLL_DURATION_MS);

      appendTrace("Sending test originate request...");
      const originatePayload = { extension: called };
      if (caller) {
        originatePayload.callerid = `"${caller}" <${caller}>`;
      }

      const origRes = await amiOriginate(originatePayload);
      if (origRes?.response === false) {
        appendTrace(
          `Originate failed: ${origRes?.message || "Unknown error"}`,
        );
        showToast(origRes?.message || "Originate failed.", "error");
      } else {
        appendTrace(
          origRes?.message ||
            origRes?.responseData ||
            "Originate request sent.",
        );
        showToast("Signaling call test started.", "success");
      }

      await pollLogChunk();
    } catch (error) {
      console.error("Signaling call test error:", error);
      await stopTestSession();
      appendTrace(`Error: ${error.message || "Failed to start test."}`);
      showToast(error.message || "Failed to start signaling call test.", "error");
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
    showToast("Form and trace cleared.", "info");
  };

  const inputProps = inputInteraction;

  return (
    <div
      style={SignalingCallTestPageWrapStyle} data-native-scroll>
      <div style={SignalingCallTestPageInnerStyle}>
    
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
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
          <span>Maintenance</span>
          <span>&gt;</span>
          <span>System Tool</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Signaling Call Test
          </span>
        </div>

        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{SCT_TITLE}</span>
          </div>

          <div className="w-full px-5 pt-3 pb-2 flex flex-col items-center">
            <form className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center">
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                }}
              >
                <Tooltip title={tooltips.testType} {...tooltipProps}>
                  <span style={{ color: C.labelText }}>{SCT_LABELS.testType}</span>
                </Tooltip>
              </label>
              <select
                style={selectStyle}
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                {...inputProps}
              >
                {SCT_TEST_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                }}
              >
                <Tooltip title={tooltips.trunkGroup} {...tooltipProps}>
                  <span style={{ color: C.labelText }}>{SCT_LABELS.trunkGroup}</span>
                </Tooltip>
              </label>
              <select
                style={selectStyle}
                value={trunkGroup}
                onChange={(e) => setTrunkGroup(e.target.value)}
                {...inputProps}
              >
                {trunkGroupOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                }}
              >
                <Tooltip title={tooltips.callerId} {...tooltipProps}>
                  <span style={{ color: C.labelText }}>{SCT_LABELS.callerId}</span>
                </Tooltip>
              </label>
              <input
                type="text"
                style={inputStyle}
                value={callerId}
                onChange={(e) => setCallerId(e.target.value)}
                {...inputProps}
              />

              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                }}
              >
                <Tooltip title={tooltips.calledId} {...tooltipProps}>
                  <span style={{ color: C.labelText }}>{SCT_LABELS.calledId}</span>
                </Tooltip>
              </label>
              <input
                type="text"
                style={inputStyle}
                value={calledId}
                onChange={(e) => setCalledId(e.target.value)}
                {...inputProps}
              />

              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                }}
              >
                <Tooltip title={tooltips.originalCallee} {...tooltipProps}>
                  <span style={{ color: C.labelText }}>{SCT_LABELS.originalCallee}</span>
                </Tooltip>
              </label>
              <input
                type="text"
                style={inputStyle}
                value={originalCallee}
                onChange={(e) => setOriginalCallee(e.target.value)}
                {...inputProps}
              />
            </form>

            {/* Action Buttons */}
            <div className="w-full mt-3 flex flex-col items-center">
              <div
                className="w-full max-w-2xl flex flex-row flex-wrap justify-center gap-3 pt-2 pb-2"
                style={{ borderTop: `1px solid ${C.divider}` }}
              >
                <Btn
                  variant="primary"
                  type="button"
                  onClick={handleStart}
                  disabled={busy || isRunning}
                  style={{ minWidth: 100, height: 33, fontSize: 13 }}
                >
                  {busy ? "Starting…" : SCT_BUTTONS.start}
                </Btn>
                <Btn
                  variant="cancel"
                  type="button"
                  onClick={handleClear}
                  disabled={busy}
                  style={{ minWidth: 100, height: 33, fontSize: 13 }}
                >
                  {SCT_BUTTONS.clear}
                </Btn>
              </div>
              <div
                style={{
                  width: "calc(100% - 32px)",
                  marginLeft: 16,
                  marginRight: 16,
                  borderBottom: `1px solid ${C.divider}`,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Signaling Trace — same size/layout as Signaling Call Track › Track Message */}
            <div
              className="w-full mt-1 pt-2 pb-2"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignSelf: "stretch",
              }}
            >
              <label
                style={{
                  fontSize: 14,
                  color: C.labelText,
                  fontWeight: 600,
                }}
              >
                <Tooltip title={tooltips.trace} {...tooltipProps}>
                  <span style={{ color: C.labelText }}>{SCT_TRACE_LABEL}</span>
                </Tooltip>
              </label>
              <textarea
                value={trace}
                readOnly
                style={{
                  width: "100%",
                  minHeight: 220,
                  maxHeight: 400,
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 10,
                  backgroundColor: C.pageBg,
                  color: C.valueText,
                  fontSize: 14,
                  padding: "12px",
                  fontFamily: "monospace",
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                }}
                {...inputProps}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalingCallTest;
