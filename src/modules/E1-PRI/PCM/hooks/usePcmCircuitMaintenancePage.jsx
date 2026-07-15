import React, { useState, useEffect, useRef, useCallback } from "react";
import { Checkbox, Tooltip } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  PCM_CIRCUIT_MAINTENANCE_PAGE_BREADCRUMB_ROOT,
  PCM_CIRCUIT_MAINTENANCE_PAGE_BREADCRUMB_SECTION,
  PCM_CIRCUIT_MAINTENANCE_PAGE_TITLE,
  PCM_CIRCUIT_MAINTENANCE_SECTION_MAINTENANCE,
  PCM_CIRCUIT_MAINTENANCE_SECTION_LOOPBACK,
  PCM_CIRCUIT_MAINTENANCE_PCM0_TITLE,
  PCM_CIRCUIT_MAINTENANCE_PCM_DEFAULT_NO,
  PCM_CIRCUIT_MAINTENANCE_LABEL_PCM_NO,
  PCM_CIRCUIT_MAINTENANCE_LABEL_PCM_STATUS,
  PCM_CIRCUIT_MAINTENANCE_LABEL_LOOPBACK_STATUS,
  PCM_CIRCUIT_MAINTENANCE_LABEL_CHECK,
  PCM_CIRCUIT_MAINTENANCE_LABEL_CHANNEL_NO,
  PCM_CIRCUIT_MAINTENANCE_LABEL_STATUS,
  PCM_CIRCUIT_MAINTENANCE_BTN_CHECK_ALL,
  PCM_CIRCUIT_MAINTENANCE_BTN_UNCHECK_ALL,
  PCM_CIRCUIT_MAINTENANCE_BTN_INVERSE,
  PCM_CIRCUIT_MAINTENANCE_BTN_BLOCK,
  PCM_CIRCUIT_MAINTENANCE_BTN_UNBLOCK,
  PCM_CIRCUIT_MAINTENANCE_BTN_PHYSICAL_CONNECT,
  PCM_CIRCUIT_MAINTENANCE_BTN_PHYSICAL_DISCONNECT,
  PCM_CIRCUIT_MAINTENANCE_BTN_LOCAL_LOOPBACK,
  PCM_CIRCUIT_MAINTENANCE_BTN_REMOTE_LOOPBACK,
  PCM_CIRCUIT_MAINTENANCE_BTN_UNLOOPBACK,
  PCM_CIRCUIT_MAINTENANCE_TOOLTIP_CHANNEL,
  PCM_CIRCUIT_MAINTENANCE_TOOLTIP_STATE,
  PCM_CIRCUIT_MAINTENANCE_TOOLTIP_IN_SERVICE,
  PCM_CIRCUIT_MAINTENANCE_TOOLTIP_CALLER,
  PCM_CIRCUIT_MAINTENANCE_TOOLTIP_CALLED,
  PCM_CIRCUIT_MAINTENANCE_STATE_UNUSABLE,
  PCM_CIRCUIT_MAINTENANCE_STATE_RESERVED,
  PCM_CIRCUIT_MAINTENANCE_STATE_IDLE,
  PCM_CIRCUIT_MAINTENANCE_IN_SERVICE_YES,
  PCM_CIRCUIT_MAINTENANCE_IN_SERVICE_NO,
} from "../../../../constants/PcmCircuitMaintenanceConstants";
import {
  listPstn, listChannelState
} from "../../../../api/apiService";

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

import { Btn } from "../../../../components/common";
import {
  TH,
  C,
  tdStyle,
  checkboxSx,
  PcmCircuitMaintenanceBreadcrumb,
  PcmCircuitMaintenanceFieldLabel,
  PCM_CIRCUIT_MAINTENANCE_COMPACT_MQ,
} from "../components/PcmCircuitMaintenanceFormFields";

/* Page-local styles/helpers used by render functions */
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

// ── Page-local UI (not shared) ──

const PCM_CIRCUIT_MAINTENANCE_CARD_RADIUS = 4;

const PCM_CIRCUIT_MAINTENANCE_LAPTOP_NARROW_MQ = "(max-width: 1366px)";
const PCM_CIRCUIT_MAINTENANCE_SHADOW_GUTTER = 14;
const PCM_CIRCUIT_MAINTENANCE_CARD_SHADOW =
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)";
const PCM_CIRCUIT_MAINTENANCE_SCROLL_CLASS = "pcm-circuit-maintenance-scroll";

const pcmCircuitMaintenancePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pcmCircuitMaintenancePageInnerStyle = {
  width: `calc(100% + ${PCM_CIRCUIT_MAINTENANCE_SHADOW_GUTTER * 2}px)`,
  maxWidth: `calc(100% + ${PCM_CIRCUIT_MAINTENANCE_SHADOW_GUTTER * 2}px)`,
  marginLeft: -PCM_CIRCUIT_MAINTENANCE_SHADOW_GUTTER,
  marginRight: -PCM_CIRCUIT_MAINTENANCE_SHADOW_GUTTER,
  paddingLeft: PCM_CIRCUIT_MAINTENANCE_SHADOW_GUTTER,
  paddingRight: PCM_CIRCUIT_MAINTENANCE_SHADOW_GUTTER,
  boxSizing: "border-box",
};

const PCM_CIRCUIT_MAINTENANCE_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  enterDelay: 0,
  enterNextDelay: 0,
  leaveDelay: 100,
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

const pcmCircuitMaintenanceCancelBtnStyle = {
  minWidth: 88,
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  fontWeight: 600,
  borderRadius: 4,
};

const cardStyle = {
  background: C.cardBg,
  borderRadius: PCM_CIRCUIT_MAINTENANCE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  width: "100%",
  boxSizing: "border-box",
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
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  textAlign: "center",
  width: "100%",
  borderTopLeftRadius: PCM_CIRCUIT_MAINTENANCE_CARD_RADIUS,
  borderTopRightRadius: PCM_CIRCUIT_MAINTENANCE_CARD_RADIUS,
};

const actionBarStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  minHeight: 44,
  padding: "7px 14px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  justifyContent: "center",
  borderBottomLeftRadius: PCM_CIRCUIT_MAINTENANCE_CARD_RADIUS,
  borderBottomRightRadius: PCM_CIRCUIT_MAINTENANCE_CARD_RADIUS,
};

const pcmCircuitMaintenanceShadowWrapStyle = {
  borderRadius: PCM_CIRCUIT_MAINTENANCE_CARD_RADIUS,
  overflow: "visible",
  boxShadow: PCM_CIRCUIT_MAINTENANCE_CARD_SHADOW,
  width: "100%",
  boxSizing: "border-box",
};

const pcmCircuitMaintenanceCardInnerStyle = {
  ...cardStyle,
  marginBottom: 0,
};

const pcmCircuitMaintenanceChannelCardInnerStyle = {
  ...channelCardStyle,
  marginBottom: 0,
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
  boxSizing: "border-box",
};

const topConfigCellStyleLaptop = {
  ...topConfigCellStyle,
  padding: "8px 12px",
};

const tableCellStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  background: C.cardBg,
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
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
  background: "#F8FAFC",
  color: C.labelText,
  fontWeight: 700,
  fontSize: 10,
  padding: "6px 2px",
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
  overflow: "hidden",
};

const channelTdStyle = {
  padding: "4px 2px",
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  fontSize: 12,
  color: C.valueText,
  background: C.cardBg,
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
      className={
        scrollEnabled ? PCM_CIRCUIT_MAINTENANCE_SCROLL_CLASS : undefined
      }
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

const extractCallerFromChannel = (ch) => {
  if (!ch?.channel) return "";
  const match = ch.channel.match(/DAHDI\/[^/]+\/(\d+)/);
  return match ? match[1] : "";
};

const extractCalledFromAppdata = (ch) => {
  if (!ch?.appdata) return "";
  const match = ch.appdata.match(/Dial\([^/]+\/(\d+)@/);
  return match ? match[1] : "";
};

const buildChannelTooltipInfo = (ch, channelId, v) => ({
  channel: ch.channel || `DAHDI/${channelId}`,
  state:
    ch.state ||
    (v === "unusable"
      ? PCM_CIRCUIT_MAINTENANCE_STATE_UNUSABLE
      : v === "red"
        ? PCM_CIRCUIT_MAINTENANCE_STATE_RESERVED
        : PCM_CIRCUIT_MAINTENANCE_STATE_IDLE),
  inService:
    ch?.dahdi_status?.in_service ||
    (v === "unusable"
      ? PCM_CIRCUIT_MAINTENANCE_IN_SERVICE_NO
      : PCM_CIRCUIT_MAINTENANCE_IN_SERVICE_YES),
  caller: extractCallerFromChannel(ch),
  called: extractCalledFromAppdata(ch),
});

const renderChannelTooltipContent = (info) => (
  <div style={{ whiteSpace: "pre-line" }}>
    <div>
      <strong>{PCM_CIRCUIT_MAINTENANCE_TOOLTIP_CHANNEL}:</strong> {info.channel}
    </div>
    <div>
      <strong>{PCM_CIRCUIT_MAINTENANCE_TOOLTIP_STATE}:</strong> {info.state}
    </div>
    <div>
      <strong>{PCM_CIRCUIT_MAINTENANCE_TOOLTIP_IN_SERVICE}:</strong>{" "}
      {info.inService}
    </div>
    {info.caller ? (
      <div>
        <strong>{PCM_CIRCUIT_MAINTENANCE_TOOLTIP_CALLER}:</strong> {info.caller}
      </div>
    ) : null}
    {info.called ? (
      <div>
        <strong>{PCM_CIRCUIT_MAINTENANCE_TOOLTIP_CALLED}:</strong> {info.called}
      </div>
    ) : null}
  </div>
);

const statusIndicatorStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: STATUS_BOX_PX,
  height: STATUS_BOX_PX,
  margin: "0 auto",
};

const renderStatusIndicator = (v) => {
  if (v === "frame") return colorBlock("#222");
  if (v === "signaling") return colorBlock("#0070a8");
  if (v === "red") return colorBlock("#e53935");
  return <div style={statusIndicatorStyle}>{ICONS[Number(v) || 0]}</div>;
};

const PcmCircuitMaintenanceStatusTooltip = ({ info, children }) => (
  <Tooltip
    title={renderChannelTooltipContent(info)}
    {...PCM_CIRCUIT_MAINTENANCE_TOOLTIP_PROPS}
  >
    {children}
  </Tooltip>
);

export const PcmCircuitMaintenanceScrollbarStyles = () => (
  <style>{`
    .${PCM_CIRCUIT_MAINTENANCE_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${PCM_CIRCUIT_MAINTENANCE_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${PCM_CIRCUIT_MAINTENANCE_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${PCM_CIRCUIT_MAINTENANCE_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${PCM_CIRCUIT_MAINTENANCE_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${PCM_CIRCUIT_MAINTENANCE_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${PCM_CIRCUIT_MAINTENANCE_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

export { PCM_CIRCUIT_MAINTENANCE_SCROLL_CLASS };

const PAGE_CHROME_OFFSET = 80;

export function usePcmCircuitMaintenancePage() {
const highZoom = useBrowserZoom110();
  const isCompact = useMediaQuery(PCM_CIRCUIT_MAINTENANCE_COMPACT_MQ);
  const isLaptopNarrow = useMediaQuery(PCM_CIRCUIT_MAINTENANCE_LAPTOP_NARROW_MQ);
  const tightenActionBar = isCompact || isLaptopNarrow;
  const channelScroll = highZoom || isCompact;

  // State for checkboxes and table data
  const [maintenanceChecked, setMaintenanceChecked] = useState(false);
  const [loopbackChecked, setLoopbackChecked] = useState(false);
  const [pcm0Checked, setPcm0Checked] = useState(Array(32).fill(false));

  // State for PCM span status and channel states (like PSTN Status page)
  const [isSpanUp, setIsSpanUp] = useState(false);
  const [channels, setChannels] = useState([]);
  const [spansData, setSpansData] = useState([]);
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
    };
  }, []);

  // PCM Maintenance section
  const renderPcmMaintenance = () => {
    const configCell = isLaptopNarrow ? topConfigCellStyleLaptop : topConfigCellStyle;
    return (
    <div
      style={{
        ...pcmCircuitMaintenanceShadowWrapStyle,
        marginBottom: channelScroll ? 25 : 14,
      }}
    >
      <div style={pcmCircuitMaintenanceCardInnerStyle}>
      <div style={topConfigSectionHeaderStyle}>
        {PCM_CIRCUIT_MAINTENANCE_SECTION_MAINTENANCE}
      </div>
      <div style={{ overflowX: "hidden" }}>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={{ ...labelCellStyle, ...configCell }}>
                {PCM_CIRCUIT_MAINTENANCE_LABEL_PCM_NO}
              </td>
              <td
                style={{
                  ...valueCellStyle,
                  ...configCell,
                  borderRight: "none",
                }}
              >
                {PCM_CIRCUIT_MAINTENANCE_PCM_DEFAULT_NO}
              </td>
            </tr>
            <tr>
              <td style={{ ...labelCellStyle, ...configCell }}>
                {PCM_CIRCUIT_MAINTENANCE_LABEL_PCM_STATUS}
              </td>
              <td
                style={{
                  ...valueCellStyle,
                  ...configCell,
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
                  ...configCell,
                  ...lastTableRowCellStyle,
                }}
              >
                {PCM_CIRCUIT_MAINTENANCE_LABEL_CHECK}
              </td>
              <td
                style={{
                  ...valueCellStyle,
                  ...configCell,
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
          ...(tightenActionBar ? { justifyContent: "center", gap: 8 } : {}),
        }}
      >
        <Btn variant="cancel"
          onClick={() => setMaintenanceChecked(true)}
          style={pcmCircuitMaintenanceCancelBtnStyle}
        >
          {PCM_CIRCUIT_MAINTENANCE_BTN_CHECK_ALL}
        </Btn>
        <Btn variant="cancel"
          onClick={() => setMaintenanceChecked(false)}
          style={pcmCircuitMaintenanceCancelBtnStyle}
        >
          {PCM_CIRCUIT_MAINTENANCE_BTN_UNCHECK_ALL}
        </Btn>
        <Btn variant="cancel"
          onClick={() => setMaintenanceChecked((v) => !v)}
          style={pcmCircuitMaintenanceCancelBtnStyle}
        >
          {PCM_CIRCUIT_MAINTENANCE_BTN_INVERSE}
        </Btn>
        <Btn variant="cancel" disabled={!maintenanceChecked} style={pcmCircuitMaintenanceCancelBtnStyle}>
          {PCM_CIRCUIT_MAINTENANCE_BTN_BLOCK}
        </Btn>
        <Btn variant="cancel" disabled={!maintenanceChecked} style={pcmCircuitMaintenanceCancelBtnStyle}>
          {PCM_CIRCUIT_MAINTENANCE_BTN_UNBLOCK}
        </Btn>
        <Btn variant="cancel"
          disabled={!maintenanceChecked}
          style={tightenActionBar ? pcmCircuitMaintenanceCancelBtnStyle : { ...pcmCircuitMaintenanceCancelBtnStyle, minWidth: 180 }}
        >
          {PCM_CIRCUIT_MAINTENANCE_BTN_PHYSICAL_CONNECT}
        </Btn>
        <Btn variant="cancel"
          disabled={!maintenanceChecked}
          style={tightenActionBar ? pcmCircuitMaintenanceCancelBtnStyle : { ...pcmCircuitMaintenanceCancelBtnStyle, minWidth: 180 }}
        >
          {PCM_CIRCUIT_MAINTENANCE_BTN_PHYSICAL_DISCONNECT}
        </Btn>
      </div>
      </div>
    </div>
    );
  };

  // PCM LoopBack Config section
  const renderPcmLoopback = () => {
    const configCell = isLaptopNarrow ? topConfigCellStyleLaptop : topConfigCellStyle;
    return (
    <div
      style={{
        ...pcmCircuitMaintenanceShadowWrapStyle,
        marginBottom: channelScroll ? 25 : 14,
      }}
    >
      <div style={pcmCircuitMaintenanceCardInnerStyle}>
      <div style={topConfigSectionHeaderStyle}>
        {PCM_CIRCUIT_MAINTENANCE_SECTION_LOOPBACK}
      </div>
      <div style={{ overflowX: "hidden" }}>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={{ ...labelCellStyle, ...configCell }}>
                {PCM_CIRCUIT_MAINTENANCE_LABEL_PCM_NO}
              </td>
              <td
                style={{
                  ...valueCellStyle,
                  ...configCell,
                  borderRight: "none",
                }}
              >
                {PCM_CIRCUIT_MAINTENANCE_PCM_DEFAULT_NO}
              </td>
            </tr>
            <tr>
              <td style={{ ...labelCellStyle, ...configCell }}>
                {PCM_CIRCUIT_MAINTENANCE_LABEL_LOOPBACK_STATUS}
              </td>
              <td
                style={{
                  ...valueCellStyle,
                  ...configCell,
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
                  ...configCell,
                  ...lastTableRowCellStyle,
                }}
              >
                {PCM_CIRCUIT_MAINTENANCE_LABEL_CHECK}
              </td>
              <td
                style={{
                  ...valueCellStyle,
                  ...configCell,
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
          ...(tightenActionBar ? { justifyContent: "center", gap: 8 } : {}),
        }}
      >
        <Btn variant="cancel"
          onClick={() => setLoopbackChecked(true)}
          style={pcmCircuitMaintenanceCancelBtnStyle}
        >
          {PCM_CIRCUIT_MAINTENANCE_BTN_CHECK_ALL}
        </Btn>
        <Btn variant="cancel"
          onClick={() => setLoopbackChecked(false)}
          style={pcmCircuitMaintenanceCancelBtnStyle}
        >
          {PCM_CIRCUIT_MAINTENANCE_BTN_UNCHECK_ALL}
        </Btn>
        <Btn variant="cancel"
          onClick={() => setLoopbackChecked((v) => !v)}
          style={pcmCircuitMaintenanceCancelBtnStyle}
        >
          {PCM_CIRCUIT_MAINTENANCE_BTN_INVERSE}
        </Btn>
        <Btn variant="cancel"
          disabled={!loopbackChecked}
          style={tightenActionBar ? pcmCircuitMaintenanceCancelBtnStyle : { ...pcmCircuitMaintenanceCancelBtnStyle, minWidth: 160 }}
        >
          {PCM_CIRCUIT_MAINTENANCE_BTN_LOCAL_LOOPBACK}
        </Btn>
        <Btn variant="cancel"
          disabled={!loopbackChecked}
          style={tightenActionBar ? pcmCircuitMaintenanceCancelBtnStyle : { ...pcmCircuitMaintenanceCancelBtnStyle, minWidth: 160 }}
        >
          {PCM_CIRCUIT_MAINTENANCE_BTN_REMOTE_LOOPBACK}
        </Btn>
        <Btn variant="cancel"
          disabled={!loopbackChecked}
          style={tightenActionBar ? pcmCircuitMaintenanceCancelBtnStyle : { ...pcmCircuitMaintenanceCancelBtnStyle, minWidth: 120 }}
        >
          {PCM_CIRCUIT_MAINTENANCE_BTN_UNLOOPBACK}
        </Btn>
      </div>
      </div>
    </div>
    );
  };

  // PCM0 section
  const handlePcm0Check = (idx) => {
    setPcm0Checked((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };
  const allChecked = pcm0Checked.every(Boolean);
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

  const renderPcm0 = () => {
    return (
      <div
        style={{
          ...pcmCircuitMaintenanceShadowWrapStyle,
          marginBottom: channelScroll ? 24 : 12,
        }}
      >
        <div style={pcmCircuitMaintenanceChannelCardInnerStyle}>
        <div style={sectionHeaderStyle}>{PCM_CIRCUIT_MAINTENANCE_PCM0_TITLE}</div>
        <AdaptiveChannelTable channelCount={32} scrollEnabled={channelScroll}>
          <thead>
            <tr>
              <th style={channelLabelThFit()}>{PCM_CIRCUIT_MAINTENANCE_LABEL_CHANNEL_NO}</th>
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
              <td style={channelLabelTdFit()}>{PCM_CIRCUIT_MAINTENANCE_LABEL_STATUS}</td>
              {pcm0Values.map((v, i) => {
                const ch =
                  channels.find((c) => Number(c.channelid) === i) || {};
                const info = buildChannelTooltipInfo(ch, i, v);

                return (
                  <td key={i} style={statusDataTdFit()}>
                    <PcmCircuitMaintenanceStatusTooltip info={info}>
                      <div style={statusCellContentStyle}>
                        {renderStatusIndicator(v)}
                      </div>
                    </PcmCircuitMaintenanceStatusTooltip>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td style={{ ...channelLabelTdFit(), ...lastTableRowCellStyle }}>
                {PCM_CIRCUIT_MAINTENANCE_LABEL_CHECK}
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
          <Btn variant="cancel" onClick={handleCheckAll} style={pcmCircuitMaintenanceCancelBtnStyle}>
            {PCM_CIRCUIT_MAINTENANCE_BTN_CHECK_ALL}
          </Btn>
          <Btn variant="cancel" onClick={handleUncheckAll} style={pcmCircuitMaintenanceCancelBtnStyle}>
            {PCM_CIRCUIT_MAINTENANCE_BTN_UNCHECK_ALL}
          </Btn>
          <Btn variant="cancel" onClick={handleInverse} style={pcmCircuitMaintenanceCancelBtnStyle}>
            {PCM_CIRCUIT_MAINTENANCE_BTN_INVERSE}
          </Btn>
          <Btn variant="cancel"
            disabled={!(allChecked || pcm0Checked.some(Boolean))}
            style={pcmCircuitMaintenanceCancelBtnStyle}
          >
            {PCM_CIRCUIT_MAINTENANCE_BTN_BLOCK}
          </Btn>
          <Btn variant="cancel"
            disabled={!(allChecked || pcm0Checked.some(Boolean))}
            style={pcmCircuitMaintenanceCancelBtnStyle}
          >
            {PCM_CIRCUIT_MAINTENANCE_BTN_UNBLOCK}
          </Btn>
        </div>
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
        style={{
          ...pcmCircuitMaintenanceShadowWrapStyle,
          marginBottom: channelScroll ? 24 : 12,
        }}
      >
        <div style={pcmCircuitMaintenanceChannelCardInnerStyle}>
        <div style={sectionHeaderStyle}>
          {span.name} · {span.ip}
        </div>
        <AdaptiveChannelTable
          channelCount={span.channelRanges.length}
          scrollEnabled={channelScroll}
        >
          <thead>
            <tr>
              <th style={channelLabelThFit()}>{PCM_CIRCUIT_MAINTENANCE_LABEL_CHANNEL_NO}</th>
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
              <td style={channelLabelTdFit()}>{PCM_CIRCUIT_MAINTENANCE_LABEL_STATUS}</td>
              {span.channelRanges.map((channelId, i) => {
                const v = pcmValues[i];
                const ch =
                  channels.find((c) => Number(c.channelid) === channelId) || {};
                const info = buildChannelTooltipInfo(ch, channelId, v);

                return (
                  <td key={i} style={statusDataTdFit()}>
                    <PcmCircuitMaintenanceStatusTooltip info={info}>
                      <div style={statusCellContentStyle}>
                        {renderStatusIndicator(v)}
                      </div>
                    </PcmCircuitMaintenanceStatusTooltip>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td style={{ ...channelLabelTdFit(), ...lastTableRowCellStyle }}>
                {PCM_CIRCUIT_MAINTENANCE_LABEL_CHECK}
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
      </div>
    );
  };

  return {
    maintenanceChecked,
    loopbackChecked,
    pcm0Checked,
    isSpanUp,
    channels,
    spansData,
    contentOverflows,
    highZoom,
    isCompact,
    isLaptopNarrow,
    tightenActionBar,
    channelScroll,
    aliveRef,
    contentRef,
    measurePageFit,
    stateToIconIndex,
    pcm0Values,
    renderPcmMaintenance,
    renderPcmLoopback,
    handlePcm0Check,
    allChecked,
    handleCheckAll,
    handleUncheckAll,
    handleInverse,
    channelThFit,
    channelLabelThFit,
    channelLabelTdFit,
    channelDataTdFit,
    statusDataTdFit,
    renderPcm0,
    renderSpanBlock,
  };
}
