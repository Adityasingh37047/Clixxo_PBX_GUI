import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  PCM_MAINTENANCE_HEADERS,
  PCM_LOOPBACK_HEADERS,
  PCM0_HEADERS,
  PCM0_STATUS_ROW,
  PCM0_CHECK_ROW,
  PCM_MAINTENANCE_BUTTONS,
  PCM_LOOPBACK_BUTTONS,
  PCM0_BUTTONS,
} from "../../../constants/PcmCircuitMaintenanceConstants";
import { Checkbox, Tooltip, useMediaQuery } from "@mui/material";
import { listPstn, listChannelState } from "../../../api/apiService";
import CallEndIcon from "@mui/icons-material/CallEnd";
import RingVolumeIcon from "@mui/icons-material/RingVolume";
import SettingsPhoneIcon from "@mui/icons-material/SettingsPhone";
import PhoneForwardedIcon from "@mui/icons-material/PhoneForwarded";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import PhonePausedIcon from "@mui/icons-material/PhonePaused";
import PermPhoneMsgIcon from "@mui/icons-material/PermPhoneMsg";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import SystemSecurityUpdateWarningIcon from "@mui/icons-material/SystemSecurityUpdateWarning";
import AppSettingsAltIcon from "@mui/icons-material/AppSettingsAlt";
import PhoneLockedIcon from "@mui/icons-material/PhoneLocked";

// Square status color block (matches PSTN Status page)
const STATUS_BOX_PX = 22;

const colorBlock = (color, size = STATUS_BOX_PX) => (
  <div
    style={{
      background: color,
      border: "1px solid #6b7280",
      borderRadius: 0,
      width: size,
      height: size,
      minWidth: size,
      minHeight: size,
      flexShrink: 0,
      boxSizing: "border-box",
      margin: "0 auto",
    }}
  />
);

const statusCellContentStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: 28,
  margin: "0 auto",
};

// Material-UI icons for status (same as PSTN Status page)
const ICONS = [
  <div className="w-6 h-6 bg-green-500 flex items-center justify-center cursor-pointer">
    <CallEndIcon style={{ color: "white", fontSize: "15px" }} />
  </div>, // Idle (green phone)
  <div
    className="w-6 h-6 flex items-center justify-center cursor-pointer"
    style={{ backgroundColor: "#D4AF37" }}
  >
    <RingVolumeIcon style={{ color: "white", fontSize: "15px" }} />
  </div>, // Ringing (golden-brown bell)
  <div className="w-6 h-6 bg-blue-500 flex items-center justify-center cursor-pointer">
    <SettingsPhoneIcon style={{ color: "white", fontSize: "15px" }} />
  </div>, // Wait Answer (blue settings phone)
  <div className="w-6 h-6 bg-blue-500 flex items-center justify-center cursor-pointer">
    <PhoneForwardedIcon style={{ color: "white", fontSize: "15px" }} />
  </div>, // Dialing (blue phone forwarded)
  <div
    className="w-6 h-6 flex items-center justify-center cursor-pointer"
    style={{ backgroundColor: "#20B2AA" }}
  >
    <PhoneInTalkIcon style={{ color: "white", fontSize: "15px" }} />
  </div>, // Talking (teal phone in talk)
  <div className="w-6 h-6 bg-red-500 flex items-center justify-center cursor-pointer">
    <PhonePausedIcon style={{ color: "white", fontSize: "15px" }} />
  </div>, // Pending (red phone paused)
  <div className="w-6 h-6 bg-blue-500 flex items-center justify-center cursor-pointer">
    <PermPhoneMsgIcon style={{ color: "white", fontSize: "15px" }} />
  </div>, // Wait Message (blue phone message)
  <div
    className="w-6 h-6 flex items-center justify-center cursor-pointer"
    style={{ backgroundColor: "#8A2BE2" }}
  >
    <PhoneDisabledIcon style={{ color: "white", fontSize: "15px" }} />
  </div>, // Blocked (purple phone disabled)
  <div className="w-6 h-6 bg-orange-500 flex items-center justify-center cursor-pointer">
    <SystemSecurityUpdateWarningIcon
      style={{ color: "white", fontSize: "15px" }}
    />
  </div>, // Reset (orange warning)
  <div className="w-6 h-6 bg-gray-500 flex items-center justify-center cursor-pointer">
    <AppSettingsAltIcon style={{ color: "white", fontSize: "15px" }} />
  </div>, // Unavailable (gray settings)
  <div className="w-6 h-6 bg-red-600 flex items-center justify-center cursor-pointer">
    <PhoneLockedIcon style={{ color: "white", fontSize: "15px" }} />
  </div>, // Unusable (dark red phone locked)
];

// ── Color palette (matches PSTN Call In CallerID) ─────────────────────────────
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "#3E5475",
  mutedText: "var(--text-muted)",
  strongText: "var(--text-primary)",
  accent: "var(--accent-brand)",
};

const CARD_RADIUS = 10;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "cancel",
  style: extraStyle,
}) => {
  const styles = {
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
    },
    cancel: {
      background: "#cbd5e1",
      color: "var(--text-secondary)",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.cancel;
  const hoverBg =
    variant === "primary"
      ? "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)"
      : "#b6c2d3";
  const baseBg = s.background;
  return (
    <button
      type="button"
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

const cardStyle = {
  background: "var(--bg-surface)",
  borderRadius: 10,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  marginBottom: 24,
};

// Channel grid cards must allow inner horizontal scroll (overflow:hidden clips scrollbars)
const channelCardStyle = {
  ...cardStyle,
  overflow: "hidden",
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.cardBorder}`,
  background: "var(--bg-surface)",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  textAlign: "center",
  width: "100%",
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
};

const actionBarStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  minHeight: 44,
  padding: "7px 14px",
  borderTop: `1px solid ${C.cardBorder}`,
  background: "var(--bg-surface)",
  justifyContent: "center",
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

// PCM Maintenance & LoopBack only — tighter vertical spacing so page fits at 100% zoom
const topConfigCardStyle = {
  ...cardStyle,
  marginBottom: 25,
};

const topConfigCardLastStyle = {
  ...cardStyle,
  marginBottom: 25,
};

const topConfigSectionHeaderStyle = {
  ...sectionHeaderStyle,
};

const topConfigActionBarStyle = {
  ...actionBarStyle,
  flexWrap: "wrap",
  overflowX: "hidden",
};

const topConfigCellStyle = {
  padding: "5px 12px",
};

const tableCellStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  background: "var(--bg-surface)",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
};

const labelCellStyle = {
  ...tableCellStyle,
  fontWeight: 600,
  width: "50%",
  borderLeft: "none",
};

const valueCellStyle = {
  ...tableCellStyle,
  width: "50%",
};

const channelThStyle = {
  background: "var(--table-header-bg)",
  color: C.labelText,
  fontWeight: 700,
  fontSize: 10,
  padding: "6px 2px",
  textAlign: "center",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
  overflow: "hidden",
};

const channelTdStyle = {
  padding: "4px 2px",
  textAlign: "center",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  fontSize: 12,
  color: C.valueText,
  background: "var(--bg-surface)",
  overflow: "hidden",
};

const channelRowLabelStyle = {
  ...channelTdStyle,
  fontWeight: 600,
  color: C.labelText,
  borderLeft: "none",
  width: 72,
  minWidth: 72,
  maxWidth: 72,
  padding: "6px 4px",
  fontSize: 11,
};

const channelTableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "fixed",
};

const CHANNEL_LABEL_COL_WIDTH = 72;
const CHANNEL_COL_SCROLL_WIDTH = 31;

/** Locked at ~100% browser zoom. Do NOT refresh while Ctrl+/- shrinks innerWidth. */
const zoomBaselineRef = { innerWidth: 0, dpr: 1 };

const lockZoomBaseline = (force = false) => {
  const iw = window.innerWidth;
  if (!iw) return;
  if (force || !zoomBaselineRef.innerWidth) {
    zoomBaselineRef.innerWidth = iw;
    zoomBaselineRef.dpr = window.devicePixelRatio || 1;
  }
};

/** Widen baseline when the window grows at 100% zoom (not browser zoom-in). */
const syncZoomBaselineIfWindowWidened = () => {
  const iw = window.innerWidth;
  const baseW = zoomBaselineRef.innerWidth;
  if (!baseW || !iw) return;
  if (iw > baseW) {
    zoomBaselineRef.innerWidth = iw;
    zoomBaselineRef.dpr = window.devicePixelRatio || 1;
  }
};

/**
 * ≥110% zoom: touchpad (visualViewport.scale) OR Ctrl+/- / Ctrl+wheel
 * (innerWidth shrinks vs locked baseline; scale often stays 1.0 on Windows).
 */
const isBrowserZoomAtLeast110 = () => {
  const scale = window.visualViewport?.scale ?? 1;
  if (scale >= 1.09) return true;
  if (Math.round(scale * 100) >= 110) return true;

  const baseW = zoomBaselineRef.innerWidth;
  const iw = window.innerWidth;
  if (baseW > 0 && iw > 0) {
    const widthZoom = baseW / iw;
    // Was 1.29 (130%) — must match 110% for Ctrl+/wheel when scale stays 1.0
    if (widthZoom >= 1.09) return true;
  }

  const baseDpr = zoomBaselineRef.dpr;
  const dpr = window.devicePixelRatio || 1;
  if (baseDpr > 0 && dpr / baseDpr >= 1.09) return true;

  return false;
};

const useBrowserZoom110 = () => {
  const [highZoom, setHighZoom] = useState(false);

  useEffect(() => {
    const measure = () => {
      const baseW = zoomBaselineRef.innerWidth;
      const iw = window.innerWidth;
      // Ctrl+0 or zoomed back out to ~100%
      if (baseW && iw > 0 && iw >= baseW * 0.97) {
        lockZoomBaseline(true);
      } else {
        syncZoomBaselineIfWindowWidened();
      }
      setHighZoom(isBrowserZoomAtLeast110());
    };

    lockZoomBaseline(true);

    const onWheel = (e) => {
      if (e.ctrlKey) {
        requestAnimationFrame(measure);
        setTimeout(measure, 50);
        setTimeout(measure, 200);
      }
    };

    const onKeyDown = (e) => {
      if (
        e.ctrlKey &&
        (e.key === "+" ||
          e.key === "-" ||
          e.key === "=" ||
          e.key === "0" ||
          e.key === "_")
      ) {
        if (e.key === "0" || e.key === "_") {
          lockZoomBaseline(true);
        }
        setTimeout(measure, 50);
        setTimeout(measure, 200);
      }
    };

    measure();

    window.addEventListener("resize", measure);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
    };
  }, []);

  return highZoom;
};

const AdaptiveChannelTable = ({ channelCount, scrollEnabled, children }) => {
  const tableMinWidth =
    CHANNEL_LABEL_COL_WIDTH + channelCount * CHANNEL_COL_SCROLL_WIDTH;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        overflowX: scrollEnabled ? "auto" : "hidden",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <table
        style={{
          ...channelTableStyle,
          width: "100%",
          maxWidth: "100%",
          minWidth: scrollEnabled ? tableMinWidth : 0,
        }}
      >
        {children}
      </table>
    </div>
  );
};

const lastTableRowCellStyle = { borderBottom: "none" };

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "fixed",
};

const checkboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
};

const PAGE_CHROME_OFFSET = 80; // navbar + layout padding
const PCM_COMPACT_MQ = "(max-width: 768px)";

const PcmCircuitMaintenancePage = () => {
  const highZoom = useBrowserZoom110();
  const isCompact = useMediaQuery(PCM_COMPACT_MQ);
  const channelScroll = highZoom || isCompact;

  // State for checkboxes and table data
  const [maintenanceChecked, setMaintenanceChecked] = useState(false);
  const [loopbackChecked, setLoopbackChecked] = useState(false);
  const [pcm0Checked, setPcm0Checked] = useState(Array(32).fill(false));

  // State for PCM span status and channel states (like PSTN Status page)
  const [isSpanUp, setIsSpanUp] = useState(false);
  const [channels, setChannels] = useState([]);
  const [spansData, setSpansData] = useState([]);
  const pollingRef = useRef(null);
  const aliveRef = useRef(true);

  const contentRef = useRef(null);
  // true = content taller than viewport → allow page scroll (e.g. 120% zoom)
  const [contentOverflows, setContentOverflows] = useState(false);

  const measurePageFit = useCallback(() => {
    if (isCompact) {
      setContentOverflows(true);
      return;
    }
    if (!isBrowserZoomAtLeast110()) {
      setContentOverflows(false);
      return;
    }
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const available = window.innerHeight - PAGE_CHROME_OFFSET;
    const totalContent = contentEl.scrollHeight + 32; // page padding (16 × 2)
    setContentOverflows(totalContent > available + 1);
  }, [isCompact]);

  useEffect(() => {
    const schedule = () => requestAnimationFrame(measurePageFit);

    schedule();
    const ro = new ResizeObserver(schedule);
    const contentEl = contentRef.current;
    if (contentEl) ro.observe(contentEl);

    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);

    const onWheel = (e) => {
      if (e.ctrlKey) {
        setTimeout(schedule, 50);
        setTimeout(schedule, 250);
      }
    };
    const onKeyDown = (e) => {
      if (
        e.ctrlKey &&
        (e.key === "+" ||
          e.key === "-" ||
          e.key === "=" ||
          e.key === "0" ||
          e.key === "_")
      ) {
        setTimeout(schedule, 50);
        setTimeout(schedule, 250);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [measurePageFit, spansData.length, channels.length, highZoom, isCompact]);

  useEffect(() => {
    measurePageFit();
  }, [contentOverflows, measurePageFit, highZoom, isCompact]);

  // Map API channel state -> icon index (same as PSTN Status page)
  const stateToIconIndex = (state) => {
    const s = (state || "").toLowerCase();
    // Ringing states (incoming and outgoing)
    if (s === "ringing" || s === "ring" || s === "alerting") return 1;
    // Wait Answer / Pre-answer states
    if (s === "wait" || s === "wait answer" || s === "waiting") return 2;
    // Dialing states (outgoing calls)
    if (
      s === "dialing" ||
      s === "dial" ||
      s === "calling" ||
      s.includes("dial")
    )
      return 3;
    // Talking / Connected states
    if (s === "talking" || s === "up" || s === "answered" || s === "connected")
      return 4;
    // Pending / Progress states
    if (s === "pending" || s === "progress" || s === "proceeding") return 5;
    // Wait Message
    if (s === "wait message" || s.includes("message")) return 6;
    // Down/Busy states
    if (s === "down" || s === "busy") return 0;
    // Default to Idle for unknown states
    return 0;
  };

  // Compute PCM0 values based on span status and channel states
  const pcm0Values = React.useMemo(() => {
    const vals = Array.from({ length: 32 }, (_, i) => {
      if (i === 0) return "frame"; // Channel 0: Frame Sync (black)
      if (i === 16) return "signaling"; // Channel 16: Signaling (blue)
      if (!isSpanUp) return "red";
      const ch = channels.find((c) => Number(c.channelid) === i) || null;
      const idx = stateToIconIndex(ch?.state);
      return idx; // 0..N icon index when span is up, default idle (0) if empty state
    });
    return vals;
  }, [channels, isSpanUp]);

  // Load span status and channel states with sequential logic (same as PSTN Status page)
  useEffect(() => {
    let timeoutId = null;
    let abortController = null;
    aliveRef.current = true;

    const fetchStatusSequential = async () => {
      try {
        // 1) Fetch PSTN data first
        const pstnRes = await listPstn();

        // Parse PSTN response - handle different response formats
        let raw = [];
        if (Array.isArray(pstnRes)) raw = pstnRes;
        else if (Array.isArray(pstnRes?.output)) raw = pstnRes.output;
        else if (Array.isArray(pstnRes?.message)) raw = pstnRes.message;
        else if (Array.isArray(pstnRes?.data)) raw = pstnRes.data;

        // Build spansData for all configured spans (so UI can render each PCM block)
        const currentIP = (() => {
          try {
            return window.location.hostname;
          } catch {
            return "0.0.0.0";
          }
        })();
        const spans = (raw || [])
          .map((it) => {
            const spanId = it?.span_id ?? it?.span?.id ?? it?.id;
            if (spanId == null) return null;
            const status = it?.span_status || "";
            const mainStatus = status.toLowerCase().includes("up")
              ? "up"
              : "down";
            const bchan = it?.span?.bchan || it?.channels?.channel || "";
            const hardhdlc = it?.span?.hardhdlc || "";
            let channelRanges = [0];
            if (bchan) {
              const ranges = String(bchan).split(",");
              ranges.forEach((range) => {
                if (range.includes("-")) {
                  const [start, end] = range
                    .split("-")
                    .map((n) => parseInt(n.trim()));
                  if (!isNaN(start) && !isNaN(end)) {
                    for (let i = start; i <= end; i++) channelRanges.push(i);
                  }
                } else {
                  const single = parseInt(range.trim());
                  if (!isNaN(single)) channelRanges.push(single);
                }
              });
            } else {
              const start = (parseInt(spanId) - 1) * 32;
              for (let i = start; i < start + 32; i++) channelRanges.push(i);
            }
            const hdlcChannel = hardhdlc
              ? parseInt(hardhdlc)
              : (parseInt(spanId) - 1) * 32 + 16;
            if (!channelRanges.includes(hdlcChannel))
              channelRanges.push(hdlcChannel);
            return {
              spanId: parseInt(spanId),
              status: mainStatus,
              name: `PCM${parseInt(spanId) - 1}`,
              ip: currentIP,
              channelRanges: channelRanges.sort((a, b) => a - b),
              hdlcChannel,
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.spanId - b.spanId);
        setSpansData(spans);

        // Check if ANY span is up and active
        const hasActiveSpan = spans.some((s) => s.status === "up");
        setIsSpanUp(hasActiveSpan);

        // 2) Only call channelstate API if at least one span is up
        if (!hasActiveSpan) {
          setChannels([]);
          // Schedule next run after 1s for faster updates
          if (aliveRef.current)
            timeoutId = setTimeout(fetchStatusSequential, 1000);
          return;
        }

        // 3) Call channelstate API if PSTN is up and active
        try {
          // Add timeout to prevent hanging (reduced to 800ms for faster updates)
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("ChannelState API timeout")),
              800,
            ),
          );

          const cs = await Promise.race([listChannelState(), timeoutPromise]);

          const arr = Array.isArray(cs?.message) ? cs.message : [];
          const normalized = arr.map((item) => {
            const channelState = String(item?.state || "");
            // Debug: Log non-idle states to console to see what Asterisk reports
            if (
              channelState &&
              channelState.toLowerCase() !== "idle" &&
              channelState.toLowerCase() !== ""
            ) {
              console.log(
                "Channel State:",
                item?.channelid,
                "=",
                channelState,
                "App:",
                item?.application,
              );
            }
            return {
              channelid: String(item?.channelid || ""),
              channel: String(item?.channel || ""),
              state: channelState,
              application: String(item?.application || ""),
              appdata: String(item?.appdata || ""),
              destination: String(item?.destination || ""),
              dahdi_status: item?.dahdi_status || {},
            };
          });
          setChannels(normalized);
        } catch (channelError) {
          console.warn("ChannelState API error or timeout:", channelError);
          setChannels([]); // Clear channels on error
        }

        // 4) Schedule next run after 1s (1000ms) for faster state updates
        if (aliveRef.current)
          timeoutId = setTimeout(fetchStatusSequential, 1000);
      } catch (e) {
        console.warn("PCM Maintenance PSTN/ChannelState fetch error:", e);
        // Schedule next run after 1s on error as well
        if (aliveRef.current)
          timeoutId = setTimeout(fetchStatusSequential, 1000);
      }
    };

    fetchStatusSequential();

    return () => {
      aliveRef.current = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (abortController) abortController.abort();
    };
  }, []);

  // PCM Maintenance section
  const renderPcmMaintenance = () => (
    <div style={{ ...topConfigCardStyle, marginBottom: channelScroll ? 25 : 14 }}>
      <div style={topConfigSectionHeaderStyle}>PCM Maintenance</div>
      <div style={{ overflowX: "hidden" }}>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={{ ...labelCellStyle, ...topConfigCellStyle }}>
                PCM No.
              </td>
              <td
                style={{
                  ...valueCellStyle,
                  ...topConfigCellStyle,
                  borderRight: "none",
                }}
              >
                0
              </td>
            </tr>
            <tr>
              <td style={{ ...labelCellStyle, ...topConfigCellStyle }}>
                PCM Status
              </td>
              <td
                style={{
                  ...valueCellStyle,
                  ...topConfigCellStyle,
                  borderRight: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    minHeight: 20,
                  }}
                >
                  {colorBlock("#0070a8")}
                </div>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  ...labelCellStyle,
                  ...topConfigCellStyle,
                  ...lastTableRowCellStyle,
                }}
              >
                Check
              </td>
              <td
                style={{
                  ...valueCellStyle,
                  ...topConfigCellStyle,
                  borderRight: "none",
                  ...lastTableRowCellStyle,
                }}
              >
                <Checkbox
                  size="small"
                  checked={maintenanceChecked}
                  onChange={() => setMaintenanceChecked((v) => !v)}
                  sx={checkboxSx}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        style={{
          ...topConfigActionBarStyle,
          ...(isCompact ? { justifyContent: "center", gap: 8 } : {}),
        }}
      >
        <Btn onClick={() => setMaintenanceChecked(true)}>Check All</Btn>
        <Btn onClick={() => setMaintenanceChecked(false)}>Uncheck All</Btn>
        <Btn onClick={() => setMaintenanceChecked((v) => !v)}>Inverse</Btn>
        <Btn disabled={!maintenanceChecked}>Block</Btn>
        <Btn disabled={!maintenanceChecked}>Unblock</Btn>
        <Btn
          disabled={!maintenanceChecked}
          style={isCompact ? { minWidth: 0 } : { minWidth: 180 }}
        >
          Physical Connect
        </Btn>
        <Btn
          disabled={!maintenanceChecked}
          style={isCompact ? { minWidth: 0 } : { minWidth: 180 }}
        >
          Physical Disconnect
        </Btn>
      </div>
    </div>
  );

  // PCM LoopBack Config section
  const renderPcmLoopback = () => (
    <div
      style={{ ...topConfigCardLastStyle, marginBottom: channelScroll ? 25 : 14 }}
    >
      <div style={topConfigSectionHeaderStyle}>PCM LoopBack Config</div>
      <div style={{ overflowX: "hidden" }}>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={{ ...labelCellStyle, ...topConfigCellStyle }}>
                PCM No.
              </td>
              <td
                style={{
                  ...valueCellStyle,
                  ...topConfigCellStyle,
                  borderRight: "none",
                }}
              >
                0
              </td>
            </tr>
            <tr>
              <td style={{ ...labelCellStyle, ...topConfigCellStyle }}>
                PCM LoopBack Status
              </td>
              <td
                style={{
                  ...valueCellStyle,
                  ...topConfigCellStyle,
                  borderRight: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    minHeight: 20,
                  }}
                >
                  {colorBlock("#ccc")}
                </div>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  ...labelCellStyle,
                  ...topConfigCellStyle,
                  ...lastTableRowCellStyle,
                }}
              >
                Check
              </td>
              <td
                style={{
                  ...valueCellStyle,
                  ...topConfigCellStyle,
                  borderRight: "none",
                  ...lastTableRowCellStyle,
                }}
              >
                <Checkbox
                  size="small"
                  checked={loopbackChecked}
                  onChange={() => setLoopbackChecked((v) => !v)}
                  sx={checkboxSx}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        style={{
          ...topConfigActionBarStyle,
          ...(isCompact ? { justifyContent: "center", gap: 8 } : {}),
        }}
      >
        <Btn onClick={() => setLoopbackChecked(true)}>Check All</Btn>
        <Btn onClick={() => setLoopbackChecked(false)}>Uncheck All</Btn>
        <Btn onClick={() => setLoopbackChecked((v) => !v)}>Inverse</Btn>
        <Btn
          disabled={!loopbackChecked}
          style={isCompact ? { minWidth: 0 } : { minWidth: 160 }}
        >
          Local LoopBack
        </Btn>
        <Btn
          disabled={!loopbackChecked}
          style={isCompact ? { minWidth: 0 } : { minWidth: 160 }}
        >
          Remote LoopBack
        </Btn>
        <Btn
          disabled={!loopbackChecked}
          style={isCompact ? { minWidth: 0 } : { minWidth: 120 }}
        >
          UnLoopBack
        </Btn>
      </div>
    </div>
  );

  // PCM0 section
  const handlePcm0Check = (idx) => {
    setPcm0Checked((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };
  const allChecked = pcm0Checked.every(Boolean);
  const noneChecked = pcm0Checked.every((v) => !v);
  const handleCheckAll = () => setPcm0Checked(Array(32).fill(true));
  const handleUncheckAll = () => setPcm0Checked(Array(32).fill(false));
  const handleInverse = () => setPcm0Checked((prev) => prev.map((v) => !v));

  const channelThFit = (extra = {}) => ({
    ...channelThStyle,
    whiteSpace: channelScroll ? "nowrap" : "normal",
    padding: channelScroll ? "6px 2px" : "3px 1px",
    fontSize: channelScroll ? 10 : 9,
    overflow: "hidden",
    ...extra,
  });

  const channelLabelThFit = (extra = {}) => ({
    ...channelThFit({ borderLeft: "none", ...extra }),
    width: channelScroll ? CHANNEL_LABEL_COL_WIDTH : "8%",
    minWidth: channelScroll ? CHANNEL_LABEL_COL_WIDTH : 0,
    maxWidth: channelScroll ? CHANNEL_LABEL_COL_WIDTH : "8%",
  });

  const channelLabelTdFit = (extra = {}) => ({
    ...channelRowLabelStyle,
    width: channelScroll ? 72 : "8%",
    minWidth: channelScroll ? 72 : 0,
    maxWidth: channelScroll ? 72 : "8%",
    fontSize: channelScroll ? 11 : 10,
    padding: channelScroll ? "6px 4px" : "4px 2px",
    whiteSpace: channelScroll ? "nowrap" : "normal",
    ...extra,
  });

  const channelDataTdFit = (extra = {}) => ({
    ...channelTdStyle,
    padding: channelScroll ? "4px 2px" : "2px 1px",
    fontSize: channelScroll ? 12 : 10,
    overflow: "hidden",
    ...extra,
  });

  const statusDataTdFit = (extra = {}) => ({
    ...channelDataTdFit(extra),
    textAlign: "center",
    verticalAlign: "middle",
    padding: channelScroll ? "6px 2px" : "5px 1px",
  });

  // Update PCM0_HEADERS in the component
  const PCM0_HEADERS = Array(32)
    .fill("")
    .map((_, i) => {
      if (i === 0) return "Channel No.";
      return i.toString();
    });

  const PCM0_STATUS_ROW = Array(32)
    .fill("")
    .map((_, i) => {
      if (i === 0) return "Status";
      return "gray";
    });

  const PCM0_CHECK_ROW = Array(32)
    .fill("")
    .map((_, i) => {
      if (i === 0) return "Check";
      return "";
    });

  const renderPcm0 = () => {
    return (
      <div style={{ ...channelCardStyle, marginBottom: channelScroll ? 24 : 12 }}>
        <div style={sectionHeaderStyle}>PCM 0</div>
        <AdaptiveChannelTable channelCount={32} scrollEnabled={channelScroll}>
          <thead>
            <tr>
              <th style={channelLabelThFit()}>Channel No.</th>
              {Array.from({ length: 32 }, (_, i) => (
                <th
                  key={i}
                  style={channelThFit(i === 31 ? { borderRight: "none" } : {})}
                >
                  {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={channelLabelTdFit()}>Status</td>
              {pcm0Values.map((v, i) => {
                const ch =
                  channels.find((c) => Number(c.channelid) === i) || {};

                // Extract caller from channel field (e.g., "DAHDI/i1/1202210116-1" -> "1202210116")
                let caller = "";
                if (ch.channel) {
                  const channelMatch = ch.channel.match(/DAHDI\/[^/]+\/(\d+)/);
                  if (channelMatch) {
                    caller = channelMatch[1];
                  }
                }

                // Extract called from appdata field (e.g., "Dial(PJSIP/07309377930@..." -> "07309377930")
                let called = "";
                if (ch.appdata) {
                  const appdataMatch = ch.appdata.match(/Dial\([^/]+\/(\d+)@/);
                  if (appdataMatch) {
                    called = appdataMatch[1];
                  }
                }

                const info = {
                  channel: ch.channel || `DAHDI/${i}`,
                  state:
                    ch.state ||
                    (v === "unusable"
                      ? "Unusable"
                      : v === "red"
                        ? "Reserved"
                        : "Idle"),
                  inService:
                    ch?.dahdi_status?.in_service ||
                    (v === "unusable" ? "No" : "Yes"),
                  caller: caller,
                  called: called,
                };
                const tooltipContent = (
                  <div style={{ whiteSpace: "pre-line" }}>
                    <div>
                      <strong>Channel:</strong> {info.channel}
                    </div>
                    <div>
                      <strong>State:</strong> {info.state}
                    </div>
                    <div>
                      <strong>In Service:</strong> {info.inService}
                    </div>
                    {info.caller ? (
                      <div>
                        <strong>Caller:</strong> {info.caller}
                      </div>
                    ) : null}
                    {info.called ? (
                      <div>
                        <strong>Called:</strong> {info.called}
                      </div>
                    ) : null}
                  </div>
                );
                return (
                  <td key={i} style={statusDataTdFit()}>
                    <Tooltip
                      title={tooltipContent}
                      arrow
                      placement="top"
                      enterDelay={0}
                      enterNextDelay={0}
                      leaveDelay={100}
                      componentsProps={{
                        tooltip: {
                          sx: {
                            bgcolor: "#fff",
                            color: "#111",
                            border: "1px solid #bbb",
                            boxShadow: 2,
                            fontSize: 12,
                          },
                        },
                        arrow: { sx: { color: "#fff" } },
                      }}
                    >
                      <div style={statusCellContentStyle}>
                        {v === "frame" ? (
                          colorBlock("#222")
                        ) : v === "signaling" ? (
                          colorBlock("#0070a8")
                        ) : v === "red" ? (
                          colorBlock("#e53935")
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: STATUS_BOX_PX,
                              height: STATUS_BOX_PX,
                              margin: "0 auto",
                            }}
                          >
                            {ICONS[Number(v) || 0]}
                          </div>
                        )}
                      </div>
                    </Tooltip>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td style={{ ...channelLabelTdFit(), ...lastTableRowCellStyle }}>
                Check
              </td>
              {Array.from({ length: 32 }, (_, i) => (
                <td
                  key={i}
                  style={{
                    ...statusDataTdFit(),
                    ...lastTableRowCellStyle,
                    ...(i === 31 ? { borderRight: "none" } : {}),
                  }}
                >
                  <div style={statusCellContentStyle}>
                    <Checkbox
                      size="small"
                      checked={pcm0Checked[i] || false}
                      onChange={() => handlePcm0Check(i)}
                      sx={checkboxSx}
                    />
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </AdaptiveChannelTable>
        <div
          style={{
            ...actionBarStyle,
            ...(isCompact ? { justifyContent: "center", gap: 8 } : {}),
          }}
        >
          <Btn onClick={handleCheckAll}>Check All</Btn>
          <Btn onClick={handleUncheckAll}>Uncheck All</Btn>
          <Btn onClick={handleInverse}>Inverse</Btn>
          <Btn disabled={!(allChecked || pcm0Checked.some(Boolean))}>Block</Btn>
          <Btn disabled={!(allChecked || pcm0Checked.some(Boolean))}>
            Unblock
          </Btn>
        </div>
      </div>
    );
  };

  // Render a full block (Maintenance, Loopback, Channel table) for a span
  const renderSpanBlock = (span) => {
    const pcmData = span.channelRanges || [];
    const pcmValues = pcmData.map((channelId) => {
      if (channelId === 0) return "frame";
      if (channelId === span.hdlcChannel) return "signaling";
      if (span.status !== "up") return "red";
      const ch =
        channels.find((c) => Number(c.channelid) === channelId) || null;
      return stateToIconIndex(ch?.state);
    });

    return (
      <div
        key={span.spanId}
        style={{ ...channelCardStyle, marginBottom: channelScroll ? 24 : 12 }}
      >
        <div style={sectionHeaderStyle}>
          {span.name} · {span.ip}
        </div>
        <AdaptiveChannelTable
          channelCount={span.channelRanges.length}
          scrollEnabled={channelScroll}
        >
          <thead>
            <tr>
              <th style={channelLabelThFit()}>Channel No.</th>
              {span.channelRanges.map((chId, i) => (
                <th
                  key={i}
                  style={channelThFit(
                    i === span.channelRanges.length - 1
                      ? { borderRight: "none" }
                      : {},
                  )}
                >
                  {chId}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={channelLabelTdFit()}>Status</td>
              {span.channelRanges.map((channelId, i) => {
                const v = pcmValues[i];
                const ch =
                  channels.find((c) => Number(c.channelid) === channelId) || {};
                let caller = "";
                if (ch.channel) {
                  const m = ch.channel.match(/DAHDI\/[^/]+\/(\d+)/);
                  if (m) caller = m[1];
                }
                let called = "";
                if (ch.appdata) {
                  const m = ch.appdata.match(/Dial\([^/]+\/(\d+)@/);
                  if (m) called = m[1];
                }
                const info = {
                  channel: ch.channel || `DAHDI/${channelId}`,
                  state:
                    ch.state ||
                    (v === "unusable"
                      ? "Unusable"
                      : v === "red"
                        ? "Reserved"
                        : "Idle"),
                  inService:
                    ch?.dahdi_status?.in_service ||
                    (v === "unusable" ? "No" : "Yes"),
                  caller,
                  called,
                };
                const tooltipContent = (
                  <div style={{ whiteSpace: "pre-line" }}>
                    <div>
                      <strong>Channel:</strong> {info.channel}
                    </div>
                    <div>
                      <strong>State:</strong> {info.state}
                    </div>
                    <div>
                      <strong>In Service:</strong> {info.inService}
                    </div>
                    {info.caller ? (
                      <div>
                        <strong>Caller:</strong> {info.caller}
                      </div>
                    ) : null}
                    {info.called ? (
                      <div>
                        <strong>Called:</strong> {info.called}
                      </div>
                    ) : null}
                  </div>
                );
                return (
                  <td key={i} style={statusDataTdFit()}>
                    <Tooltip title={tooltipContent} arrow placement="top">
                      <div style={statusCellContentStyle}>
                        {v === "frame" ? (
                          colorBlock("#222")
                        ) : v === "signaling" ? (
                          colorBlock("#0070a8")
                        ) : v === "red" ? (
                          colorBlock("#e53935")
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: STATUS_BOX_PX,
                              height: STATUS_BOX_PX,
                              margin: "0 auto",
                            }}
                          >
                            {ICONS[Number(v) || 0]}
                          </div>
                        )}
                      </div>
                    </Tooltip>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td style={{ ...channelLabelTdFit(), ...lastTableRowCellStyle }}>
                Check
              </td>
              {span.channelRanges.map((_, i) => (
                <td
                  key={i}
                  style={{
                    ...statusDataTdFit(),
                    ...lastTableRowCellStyle,
                    ...(i === span.channelRanges.length - 1
                      ? { borderRight: "none" }
                      : {}),
                  }}
                >
                  <div style={statusCellContentStyle}>
                    <Checkbox
                      size="small"
                      checked={pcm0Checked[i] || false}
                      onChange={() => handlePcm0Check(i)}
                      sx={checkboxSx}
                    />
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </AdaptiveChannelTable>
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        padding: isCompact ? 8 : 16,
        boxSizing: "border-box",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        ...(highZoom || isCompact || contentOverflows
          ? { minHeight: "calc(100vh - 80px)", overflowY: "auto" }
          : {
              height: "calc(100vh - 80px)",
              maxHeight: "calc(100vh - 80px)",
              overflow: "hidden",
            }),
      }}
    >
      <div
        ref={contentRef}
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          overflow: isCompact ? "visible" : "hidden",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: channelScroll ? 16 : 10,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <span>E1-PRI</span>
          <span>&gt;</span>
          <span>PCM</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Circuit Maintenance
          </span>
        </div>

        {renderPcmMaintenance()}
        {renderPcmLoopback()}

        {spansData.length > 0 ? spansData.map(renderSpanBlock) : renderPcm0()}
      </div>
    </div>
  );
};

export default PcmCircuitMaintenancePage;
