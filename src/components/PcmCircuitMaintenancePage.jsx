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
} from "../constants/PcmCircuitMaintenanceConstants";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { listPstn, listChannelState } from "../api/apiService";
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

const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  successGreen: "#16a34a",
  errorRed: "#dc2626",
  amber: "#d97706",
};

// ── Shared: Action Button Component ──────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
}) => {
  const variants = {
    default: {
      background: "#1e293b",
      color: "#fff",
      border: "1px solid #9ca3af",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `0.5px solid ${C.cardBorder}`,
    },
    danger: {
      background: "#fef2f2",
      color: C.errorRed,
      border: `0.5px solid #fecaca`,
    },
    accent: {
      background: C.cardBg,
      color: C.accent,
      border: `0.5px solid ${C.cardBorder}`,
    },
  };
  const s = variants[variant] || variants.default;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s,
        fontSize: 11,
        fontWeight: 600,
        padding: "5px 14px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        transition: "opacity 0.15s ease",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
};

// ── Shared: Table Header Component ────────────────────────────────────────────
const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f3f4f6",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 10.5,
      padding: "9px 8px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `0.5px solid #9ca3af`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      ...extra,
    }}
  >
    {children}
  </th>
);

// Color block function to match PSTN Status page
const colorBlock = (color) => (
  <div
    className="w-6 h-6 mx-auto border border-gray-500"
    style={{ background: color, borderRadius: 0 }}
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
    <div className="mb-4 w-full max-w-full mx-auto" style={{ padding: 4 }}>
      <div
        style={{
          background: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 14px",
            borderBottom: `1px solid ${C.cardBorder}`,
            background: "#DCE6F2",
            fontWeight: 600,
            fontSize: 14,
            color: C.labelText,
          }}
        >
          PCM Maintenance
        </div>
        <div className="overflow-x-auto w-full">
          <table
            className="w-full border-collapse"
            style={{ tableLayout: "fixed" }}
          >
            <tbody>
              <tr
                style={{
                  background: "#ffffff",
                  borderBottom: `0.5px solid ${C.cardBorder}`,
                }}
              >
                <td
                  style={{
                    width: "50%",
                    padding: "7px 8px",
                    fontSize: 12,
                    color: C.valueText,
                    textAlign: "center",
                    borderRight: "0.5px solid #edf2f7",
                    fontWeight: 600,
                  }}
                >
                  PCM No.
                </td>
                <td
                  style={{
                    width: "50%",
                    padding: "7px 8px",
                    fontSize: 12,
                    color: C.valueText,
                    textAlign: "center",
                  }}
                >
                  0
                </td>
              </tr>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: `0.5px solid ${C.cardBorder}`,
                }}
              >
                <td
                  style={{
                    width: "50%",
                    padding: "7px 8px",
                    fontSize: 12,
                    color: C.valueText,
                    textAlign: "center",
                    borderRight: "0.5px solid #edf2f7",
                    fontWeight: 600,
                  }}
                >
                  PCM Status
                </td>
                <td
                  style={{
                    width: "50%",
                    padding: "7px 8px",
                    fontSize: 12,
                    color: C.valueText,
                    textAlign: "center",
                  }}
                >
                  <div
                    className="flex items-center justify-center w-full h-full"
                    style={{ minHeight: 24 }}
                  >
                    {colorBlock("#0070a8")}
                  </div>
                </td>
              </tr>
              <tr style={{ background: "#ffffff" }}>
                <td
                  style={{
                    width: "50%",
                    padding: "7px 8px",
                    fontSize: 12,
                    color: C.valueText,
                    textAlign: "center",
                    borderRight: "0.5px solid #edf2f7",
                    fontWeight: 600,
                  }}
                >
                  Check
                </td>
                <td
                  style={{
                    width: "50%",
                    padding: "4px 0",
                    textAlign: "center",
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={maintenanceChecked}
                    onChange={() => setMaintenanceChecked((v) => !v)}
                    sx={{
                      padding: "1px",
                      color: C.accent,
                      "&.Mui-checked": { color: C.accent },
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "10px 14px",
            borderTop: `0.5px solid ${C.cardBorder}`,
            background: "#f8fafc",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <Btn onClick={() => setMaintenanceChecked(true)} variant="outline">
            Check All
          </Btn>
          <Btn onClick={() => setMaintenanceChecked(false)} variant="outline">
            Uncheck All
          </Btn>
          <Btn
            onClick={() => setMaintenanceChecked((v) => !v)}
            variant="outline"
          >
            Inverse
          </Btn>
          <Btn disabled={!maintenanceChecked} variant="default">
            Block
          </Btn>
          <Btn disabled={!maintenanceChecked} variant="default">
            Unblock
          </Btn>
          <Btn disabled={!maintenanceChecked} variant="accent">
            Physical Connect
          </Btn>
          <Btn disabled={!maintenanceChecked} variant="danger">
            Physical Disconnect
          </Btn>
        </div>
      </div>
    </div>
  );

  // PCM LoopBack Config section
  const renderPcmLoopback = () => (
    <div className="mb-4 w-full max-w-full mx-auto" style={{ padding: 4 }}>
      <div
        style={{
          background: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 14px",
            borderBottom: `1px solid ${C.cardBorder}`,
            background: "#DCE6F2",
            fontWeight: 600,
            fontSize: 14,
            color: C.labelText,
          }}
        >
          PCM LoopBack Config
        </div>
        <div className="overflow-x-auto w-full">
          <table
            className="w-full border-collapse"
            style={{ tableLayout: "fixed" }}
          >
            <tbody>
              <tr
                style={{
                  background: "#ffffff",
                  borderBottom: `0.5px solid ${C.cardBorder}`,
                }}
              >
                <td
                  style={{
                    width: "50%",
                    padding: "7px 8px",
                    fontSize: 12,
                    color: C.valueText,
                    textAlign: "center",
                    borderRight: "0.5px solid #edf2f7",
                    fontWeight: 600,
                  }}
                >
                  PCM No.
                </td>
                <td
                  style={{
                    width: "50%",
                    padding: "7px 8px",
                    fontSize: 12,
                    color: C.valueText,
                    textAlign: "center",
                  }}
                >
                  0
                </td>
              </tr>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: `0.5px solid ${C.cardBorder}`,
                }}
              >
                <td
                  style={{
                    width: "50%",
                    padding: "7px 8px",
                    fontSize: 12,
                    color: C.valueText,
                    textAlign: "center",
                    borderRight: "0.5px solid #edf2f7",
                    fontWeight: 600,
                  }}
                >
                  PCM LoopBack Status
                </td>
                <td
                  style={{
                    width: "50%",
                    padding: "7px 8px",
                    fontSize: 12,
                    color: C.valueText,
                    textAlign: "center",
                  }}
                >
                  <div
                    className="flex items-center justify-center w-full h-full"
                    style={{ minHeight: 24 }}
                  >
                    {colorBlock("#ccc")}
                  </div>
                </td>
              </tr>
              <tr style={{ background: "#ffffff" }}>
                <td
                  style={{
                    width: "50%",
                    padding: "7px 8px",
                    fontSize: 12,
                    color: C.valueText,
                    textAlign: "center",
                    borderRight: "0.5px solid #edf2f7",
                    fontWeight: 600,
                  }}
                >
                  Check
                </td>
                <td
                  style={{
                    width: "50%",
                    padding: "4px 0",
                    textAlign: "center",
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={loopbackChecked}
                    onChange={() => setLoopbackChecked((v) => !v)}
                    sx={{
                      padding: "1px",
                      color: C.accent,
                      "&.Mui-checked": { color: C.accent },
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "10px 14px",
            borderTop: `0.5px solid ${C.cardBorder}`,
            background: "#f8fafc",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <Btn onClick={() => setLoopbackChecked(true)} variant="outline">
            Check All
          </Btn>
          <Btn onClick={() => setLoopbackChecked(false)} variant="outline">
            Uncheck All
          </Btn>
          <Btn onClick={() => setLoopbackChecked((v) => !v)} variant="outline">
            Inverse
          </Btn>
          <Btn disabled={!loopbackChecked} variant="default">
            Local LoopBack
          </Btn>
          <Btn disabled={!loopbackChecked} variant="default">
            Remote LoopBack
          </Btn>
          <Btn disabled={!loopbackChecked} variant="danger">
            UnLoopBack
          </Btn>
        </div>
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
      <div className="mb-4 w-full max-w-full mx-auto" style={{ padding: 4 }}>
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 14px",
              borderBottom: `1px solid ${C.cardBorder}`,
              background: "#DCE6F2",
              fontWeight: 600,
              fontSize: 14,
              color: C.labelText,
            }}
          >
            PCM 0
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse whitespace-nowrap">
              <thead>
                <tr>
                  <TH style={{ width: 96, minWidth: 96 }}>Channel No.</TH>
                  {Array.from({ length: 32 }, (_, i) => (
                    <TH key={i} style={{ width: 40, minWidth: 40 }}>
                      {i}
                    </TH>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{
                    background: "#ffffff",
                    borderBottom: `0.5px solid ${C.cardBorder}`,
                    transition: "background 0.1s ease",
                  }}
                >
                  <td
                    style={{
                      padding: "7px 8px",
                      fontSize: 12,
                      color: C.valueText,
                      textAlign: "center",
                      fontWeight: 600,
                      borderRight: "0.5px solid #edf2f7",
                    }}
                  >
                    Status
                  </td>
                  {pcm0Values.map((v, i) => {
                    const ch =
                      channels.find((c) => Number(c.channelid) === i) || {};

                    // Extract caller from channel field (e.g., "DAHDI/i1/1202210116-1" -> "1202210116")
                    let caller = "";
                    if (ch.channel) {
                      const channelMatch =
                        ch.channel.match(/DAHDI\/[^/]+\/(\d+)/);
                      if (channelMatch) {
                        caller = channelMatch[1];
                      }
                    }

                    // Extract called from appdata field (e.g., "Dial(PJSIP/07309377930@..." -> "07309377930")
                    let called = "";
                    if (ch.appdata) {
                      const appdataMatch =
                        ch.appdata.match(/Dial\([^/]+\/(\d+)@/);
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
                      <td
                        key={i}
                        style={{
                          padding: "7px 8px",
                          fontSize: 12,
                          color: C.valueText,
                          textAlign: "center",
                          borderRight: "0.5px solid #edf2f7",
                        }}
                      >
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
                <tr style={{ background: "#f8fafc" }}>
                  <td
                    style={{
                      padding: "7px 8px",
                      fontSize: 12,
                      color: C.valueText,
                      textAlign: "center",
                      fontWeight: 600,
                      borderRight: "0.5px solid #edf2f7",
                    }}
                  >
                    Check
                  </td>
                  {Array.from({ length: 32 }, (_, i) => (
                    <td
                      key={i}
                      style={{
                        padding: "4px 0",
                        textAlign: "center",
                        borderRight: "0.5px solid #edf2f7",
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={pcm0Checked[i] || false}
                        onChange={() => handlePcm0Check(i)}
                        sx={{
                          padding: "1px",
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                        }}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: "10px 14px",
              borderTop: `0.5px solid ${C.cardBorder}`,
              background: "#f8fafc",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <Btn onClick={handleCheckAll} variant="outline">
              Check All
            </Btn>
            <Btn onClick={handleUncheckAll} variant="outline">
              Uncheck All
            </Btn>
            <Btn onClick={handleInverse} variant="outline">
              Inverse
            </Btn>
            <Btn
              disabled={!(allChecked || pcm0Checked.some(Boolean))}
              variant="default"
            >
              Block
            </Btn>
            <Btn
              disabled={!(allChecked || pcm0Checked.some(Boolean))}
              variant="default"
            >
              Unblock
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
        className="mb-4 w-full max-w-full mx-auto"
        style={{ padding: 4 }}
      >
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 14px",
              borderBottom: `1px solid ${C.cardBorder}`,
              background: "#DCE6F2",
              fontWeight: 600,
              fontSize: 14,
              color: C.labelText,
            }}
          >
            {span.name} · {span.ip}
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse whitespace-nowrap">
              <thead>
                <tr>
                  <TH style={{ width: 96, minWidth: 96 }}>Channel No.</TH>
                  {span.channelRanges.map((chId, i) => (
                    <TH key={i} style={{ width: 40, minWidth: 40 }}>
                      {chId}
                    </TH>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{
                    background: "#ffffff",
                    borderBottom: `0.5px solid ${C.cardBorder}`,
                    transition: "background 0.1s ease",
                  }}
                >
                  <td
                    style={{
                      padding: "7px 8px",
                      fontSize: 12,
                      color: C.valueText,
                      textAlign: "center",
                      fontWeight: 600,
                      borderRight: "0.5px solid #edf2f7",
                    }}
                  >
                    Status
                  </td>
                  {span.channelRanges.map((channelId, i) => {
                    const v = pcmValues[i];
                    const ch =
                      channels.find((c) => Number(c.channelid) === channelId) ||
                      {};
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
                      <td
                        key={i}
                        style={{
                          padding: "7px 8px",
                          fontSize: 12,
                          color: C.valueText,
                          textAlign: "center",
                          borderRight: "0.5px solid #edf2f7",
                        }}
                      >
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
                <tr style={{ background: "#f8fafc" }}>
                  <td
                    style={{
                      padding: "7px 8px",
                      fontSize: 12,
                      color: C.valueText,
                      textAlign: "center",
                      fontWeight: 600,
                      borderRight: "0.5px solid #edf2f7",
                    }}
                  >
                    Check
                  </td>
                  {span.channelRanges.map((channelId, i) => (
                    <td
                      key={channelId}
                      style={{
                        padding: "4px 0",
                        textAlign: "center",
                        borderRight: "0.5px solid #edf2f7",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={pcm0Checked[channelId] || false}
                        onChange={() => handlePcm0Check(channelId)}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: "24px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: C.mutedText, marginBottom: 12 }}>
              E1-PRI &rsaquo; PCM &rsaquo;{" "}
              <span style={{ color: C.valueText, fontWeight: 600 }}>
                PSTN Settings
              </span>
            </div>
            {/* <div style={{ fontSize: 16, color: C.labelText, fontWeight: 700 }}>
              PCM Circuit Maintenance
            </div> */}
          </div>
        </div>

        {/* Always show single Maintenance and LoopBack config at the top */}
        {renderPcmMaintenance()}
        {renderPcmLoopback()}

        {/* Then render per-span channel tables (one block per span). If no spans, show PCM0 fallback */}
        {spansData.length > 0 ? spansData.map(renderSpanBlock) : renderPcm0()}
      </div>
    </div>
  );
};

export default PcmCircuitMaintenancePage;
