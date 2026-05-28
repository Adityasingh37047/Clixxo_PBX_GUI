import React, { useState, useRef, useEffect } from "react";
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
import { Checkbox, Tooltip } from "@mui/material";
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

// Color block function to match PSTN Status page
const colorBlock = (color) => (
  <div
    className="mx-auto border border-gray-500"
    style={{
      background: color,
      borderRadius: 0,
      width: "100%",
      maxWidth: 22,
      height: 22,
      aspectRatio: "1",
    }}
  />
);

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
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#3E5475",
  mutedText: "#94a3b8",
  accent: "#3E5475",
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
      color: "#374151",
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
  background: "#ffffff",
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
  padding: "14px 18px",
  borderBottom: `1px solid ${C.cardBorder}`,
  background: "#ffffff",
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
  gap: 8,
  padding: "14px 18px",
  borderTop: `1px solid ${C.cardBorder}`,
  background: "#ffffff",
  justifyContent: "center",
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

const tableCellStyle = {
  padding: "10px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  background: "#ffffff",
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
  background: "#F8FAFC",
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
  background: "#ffffff",
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
// When container is narrower than this, enable horizontal scroll (e.g. at 120% browser zoom)
const CHANNEL_COL_SCROLL_WIDTH = 31;

const AdaptiveChannelTable = ({ channelCount, children }) => {
  const containerRef = useRef(null);
  const [layout, setLayout] = useState({ containerWidth: 0, vvScale: 1 });

  const tableMinWidth =
    CHANNEL_LABEL_COL_WIDTH + channelCount * CHANNEL_COL_SCROLL_WIDTH;

  const needsScroll =
    (layout.containerWidth > 0 && layout.containerWidth < tableMinWidth) ||
    layout.vvScale >= 1.15;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      setLayout({
        containerWidth: container.clientWidth,
        vvScale: window.visualViewport?.scale ?? 1,
      });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);

    const onWheel = (e) => {
      if (e.ctrlKey) requestAnimationFrame(measure);
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
        setTimeout(measure, 50);
        setTimeout(measure, 250);
      }
    };

    window.addEventListener("resize", measure);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
    };
  }, [channelCount, tableMinWidth]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        overflowX: needsScroll ? "auto" : "hidden",
      }}
    >
      <table
        style={{
          ...channelTableStyle,
          width: "100%",
          minWidth: tableMinWidth,
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
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
};

const PcmCircuitMaintenancePage = () => {
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
    <div style={cardStyle}>
      <div style={sectionHeaderStyle}>PCM Maintenance</div>
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelCellStyle}>PCM No.</td>
              <td style={{ ...valueCellStyle, borderRight: "none" }}>0</td>
            </tr>
            <tr>
              <td style={labelCellStyle}>PCM Status</td>
              <td style={{ ...valueCellStyle, borderRight: "none" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    minHeight: 24,
                  }}
                >
                  {colorBlock("#0070a8")}
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ ...labelCellStyle, ...lastTableRowCellStyle }}>
                Check
              </td>
              <td
                style={{
                  ...valueCellStyle,
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
      <div style={actionBarStyle}>
        <Btn onClick={() => setMaintenanceChecked(true)}>Check All</Btn>
        <Btn onClick={() => setMaintenanceChecked(false)}>Uncheck All</Btn>
        <Btn onClick={() => setMaintenanceChecked((v) => !v)}>Inverse</Btn>
        <Btn disabled={!maintenanceChecked}>Block</Btn>
        <Btn disabled={!maintenanceChecked}>Unblock</Btn>
        <Btn disabled={!maintenanceChecked} style={{ minWidth: 180 }}>
          Physical Connect
        </Btn>
        <Btn disabled={!maintenanceChecked} style={{ minWidth: 180 }}>
          Physical Disconnect
        </Btn>
      </div>
    </div>
  );

  // PCM LoopBack Config section
  const renderPcmLoopback = () => (
    <div style={cardStyle}>
      <div style={sectionHeaderStyle}>PCM LoopBack Config</div>
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelCellStyle}>PCM No.</td>
              <td style={{ ...valueCellStyle, borderRight: "none" }}>0</td>
            </tr>
            <tr>
              <td style={labelCellStyle}>PCM LoopBack Status</td>
              <td style={{ ...valueCellStyle, borderRight: "none" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    minHeight: 24,
                  }}
                >
                  {colorBlock("#ccc")}
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ ...labelCellStyle, ...lastTableRowCellStyle }}>
                Check
              </td>
              <td
                style={{
                  ...valueCellStyle,
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
      <div style={actionBarStyle}>
        <Btn onClick={() => setLoopbackChecked(true)}>Check All</Btn>
        <Btn onClick={() => setLoopbackChecked(false)}>Uncheck All</Btn>
        <Btn onClick={() => setLoopbackChecked((v) => !v)}>Inverse</Btn>
        <Btn disabled={!loopbackChecked} style={{ minWidth: 160 }}>
          Local LoopBack
        </Btn>
        <Btn disabled={!loopbackChecked} style={{ minWidth: 160 }}>
          Remote LoopBack
        </Btn>
        <Btn disabled={!loopbackChecked} style={{ minWidth: 120 }}>
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
      <div style={channelCardStyle}>
        <div style={sectionHeaderStyle}>PCM 0</div>
        <AdaptiveChannelTable channelCount={32}>
          <thead>
            <tr>
              <th
                style={{
                  ...channelThStyle,
                  width: CHANNEL_LABEL_COL_WIDTH,
                  borderLeft: "none",
                }}
              >
                Channel No.
              </th>
              {Array.from({ length: 32 }, (_, i) => (
                <th
                  key={i}
                  style={{
                    ...channelThStyle,
                    ...(i === 31 ? { borderRight: "none" } : {}),
                  }}
                >
                  {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={channelRowLabelStyle}>Status</td>
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
                  <td key={i} style={channelTdStyle}>
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
                      <div
                        className="flex items-center justify-center w-full h-full"
                        style={{ minHeight: 24 }}
                      >
                        {v === "frame"
                          ? colorBlock("#222") // Black for Frame Sync (channel 0)
                          : v === "signaling"
                            ? colorBlock("#0070a8") // Blue for Signaling (channel 16)
                            : v === "red"
                              ? colorBlock("#e53935") // Red when span is down
                              : ICONS[Number(v) || 0]}{" "}
                        {/* Material UI icons when span is up */}
                      </div>
                    </Tooltip>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td style={{ ...channelRowLabelStyle, ...lastTableRowCellStyle }}>
                Check
              </td>
              {Array.from({ length: 32 }, (_, i) => (
                <td
                  key={i}
                  style={{
                    ...channelTdStyle,
                    ...lastTableRowCellStyle,
                    ...(i === 31 ? { borderRight: "none" } : {}),
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={pcm0Checked[i] || false}
                    onChange={() => handlePcm0Check(i)}
                    sx={checkboxSx}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </AdaptiveChannelTable>
        <div style={actionBarStyle}>
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
      <div key={span.spanId} style={channelCardStyle}>
        <div style={sectionHeaderStyle}>
          {span.name} · {span.ip}
        </div>
        <AdaptiveChannelTable channelCount={span.channelRanges.length}>
          <thead>
            <tr>
              <th
                style={{
                  ...channelThStyle,
                  width: CHANNEL_LABEL_COL_WIDTH,
                  borderLeft: "none",
                }}
              >
                Channel No.
              </th>
              {span.channelRanges.map((chId, i) => (
                <th
                  key={i}
                  style={{
                    ...channelThStyle,
                    ...(i === span.channelRanges.length - 1
                      ? { borderRight: "none" }
                      : {}),
                  }}
                >
                  {chId}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={channelRowLabelStyle}>Status</td>
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
                  <td key={i} style={channelTdStyle}>
                    <Tooltip title={tooltipContent} arrow placement="top">
                      <div
                        className="flex items-center justify-center w-full h-full"
                        style={{ minHeight: 24 }}
                      >
                        {v === "frame"
                          ? colorBlock("#222")
                          : v === "signaling"
                            ? colorBlock("#0070a8")
                            : v === "red"
                              ? colorBlock("#e53935")
                              : ICONS[Number(v) || 0]}
                      </div>
                    </Tooltip>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td style={{ ...channelRowLabelStyle, ...lastTableRowCellStyle }}>
                Check
              </td>
              {span.channelRanges.map((_, i) => (
                <td
                  key={i}
                  style={{
                    ...channelTdStyle,
                    ...lastTableRowCellStyle,
                    ...(i === span.channelRanges.length - 1
                      ? { borderRight: "none" }
                      : {}),
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={pcm0Checked[i] || false}
                    onChange={() => handlePcm0Check(i)}
                    sx={checkboxSx}
                  />
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
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            display: "flex",
            gap: 4,
          }}
        >
          E1-PRI &rsaquo; PCM &rsaquo;{" "}
          <span style={{ color: "#1e293b", fontWeight: 600 }}>
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
