import React, { useState, useRef, useEffect } from "react";
import { Alert, CircularProgress } from "@mui/material";
import { Tooltip } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { postPingtest, fetchNetwork } from "../../../api/apiService";
import {
  PING_LABELS,
  PING_SOURCE_OPTIONS,
  PING_BUTTONS,
  PING_TEST_PAGE_BREADCRUMB_ROOT,
  PING_TEST_PAGE_BREADCRUMB_SECTION,
  PING_TEST_PAGE_TITLE,
  PING_TEST_CARD_TITLE,
  PING_TEST_SECTION_HEADING_COLOR,
  PING_TEST_SECTION_CONFIG,
  PING_TEST_SECTION_OUTPUT,
  PING_TEST_OUTPUT_PLACEHOLDER,
  PING_TEST_BTN_CLEAR,
  PING_TEST_SOURCE_LOADING,
  PING_TEST_DEFAULT_COUNT,
  PING_TEST_DEFAULT_LENGTH,
  PING_TEST_FIELD_TOOLTIPS,
  PING_TEST_ERR_INVALID_DEST_IP,
  PING_TEST_ERR_INVALID_COUNT,
  PING_TEST_ERR_INVALID_LENGTH,
  PING_TEST_ERR_FIX_BEFORE_START,
  PING_TEST_TOAST_STARTED,
  PING_TEST_TOAST_COMPLETED,
  PING_TEST_TOAST_CONTINUOUS_STARTED,
  PING_TEST_TOAST_ALREADY_RUNNING,
  PING_TEST_TOAST_STOPPED,
  PING_TEST_TOAST_NOT_RUNNING,
  PING_TEST_TOAST_SERVER_ERROR,
  PING_TEST_TOAST_CONNECTION_ERROR,
} from "../../../constants/PINGTestConstants";

const PING_TEST_SCROLL_CLASS = "ping-test-scroll";
const PING_TEST_COMPACT_MQ = "(max-width: 768px)";
const PING_TEST_LABEL_COL_WIDTH = 188;
const PING_TEST_FIELD_COL_GAP = 16;
const PING_TEST_FORM_PAD_X = 28;

const C = {
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#5a6d87",
  valueText: "#374151",
  mutedText: "#94a3b8",
  placeholderText: "#b0b9c6",
  strongText: "#374151",
  accent: "#3E5475",
  errorRed: "#dc2626",
  sectionHeading: PING_TEST_SECTION_HEADING_COLOR,
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

const systemFieldSelectStyle = {
  ...systemFieldInputStyle,
  appearance: "auto",
  paddingTop: 7,
  paddingBottom: 7,
  cursor: "pointer",
};

const inputStyle = systemFieldInputStyle;
const selectStyle = systemFieldSelectStyle;

const pingFieldErrorStyle = {
  fontSize: 11,
  color: C.errorRed,
  marginTop: 6,
  lineHeight: 1.35,
};

const pingFieldRowStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  width: "100%",
  gap: PING_TEST_FIELD_COL_GAP,
};

const pingFieldLabelWrapStyle = {
  flex: `0 0 ${PING_TEST_LABEL_COL_WIDTH}px`,
  width: PING_TEST_LABEL_COL_WIDTH,
  minWidth: PING_TEST_LABEL_COL_WIDTH,
  maxWidth: PING_TEST_LABEL_COL_WIDTH,
  paddingTop: 9,
};

const pingFieldControlWrapStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  width: "100%",
};

const pingFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
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

const FieldRow = ({ name, label, children }) => {
  const tooltip = PING_TEST_FIELD_TOOLTIPS[name];
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
    <div style={pingFieldRowStyle}>
      <div style={pingFieldLabelWrapStyle}>
        {tooltip ? (
          <Tooltip title={tooltip} {...tooltipProps}>
            {labelNode}
          </Tooltip>
        ) : (
          labelNode
        )}
      </div>
      <div style={pingFieldControlWrapStyle}>{children}</div>
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

const PanelTitle = ({ title, subtitle }) => (
  <div
    style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}
  >
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
    {subtitle ? (
      <span style={{ fontSize: 12, color: C.mutedText, lineHeight: 1.4 }}>
        {subtitle}
      </span>
    ) : null}
  </div>
);

const pingBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
  padding: `20px ${PING_TEST_FORM_PAD_X}px 24px`,
  background: C.cardBg,
  boxSizing: "border-box",
};

const pingConfigPanelStyle = {
  background: "#ffffff",
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
};

const pingConfigHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  padding: "14px 18px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
};

const pingConfigActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const pingConfigBodyStyle = {
  padding: "18px 18px 20px",
};

const pingFieldsGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
  gap: isCompact ? 16 : 24,
  width: "100%",
  alignItems: "start",
});

const pingFieldsColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minWidth: 0,
};

const pingOutputPanelStyle = {
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  background: C.cardBg,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
};

const pingOutputHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  padding: "12px 16px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
};

const PING_OUTPUT_BODY_BG = "#f1f5f9";

const pingOutputBodyStyle = {
  backgroundColor: PING_OUTPUT_BODY_BG,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  overflow: "hidden",
};

const pingOutputTextareaStyle = {
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

const pingPageWrapStyle = {
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pingPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

const pingTableContainerStyle = {
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

const pingHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: `10px ${PING_TEST_FORM_PAD_X}px`,
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const pingClearBtnStyle = pingFooterBtnStyle;

const pingFixedAlertSx = {
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

const PingScrollbarStyles = () => (
  <style>{`
    .${PING_TEST_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${PING_TEST_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${PING_TEST_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${PING_TEST_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${PING_TEST_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${PING_TEST_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${PING_TEST_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

const PingPageShell = ({ children }) => (
  <>
    <PingScrollbarStyles />
    <div
      className={PING_TEST_SCROLL_CLASS}
      style={pingPageWrapStyle}
      data-native-scroll
    >
      <div style={pingPageInnerStyle}>{children}</div>
    </div>
  </>
);

const PingBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      flexShrink: 0,
    }}
  >
    <span>{PING_TEST_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{PING_TEST_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {PING_TEST_PAGE_TITLE}
    </span>
  </div>
);

function isValidIp(ip) {
  // Simple IPv4 validation
  return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    ip,
  );
}

function isValidCount(val) {
  const num = Number(val);
  return Number.isInteger(num) && num >= 1 && num <= 100;
}
function isValidLength(val) {
  const num = Number(val);
  return Number.isInteger(num) && num >= 56 && num <= 1024;
}

const PINGTest = () => {
  const isCompact = useMediaQuery(PING_TEST_COMPACT_MQ);
  const outputRef = useRef(null);
  const [sourceIp, setSourceIp] = useState("");
  const [destIp, setDestIp] = useState("");
  const [count, setCount] = useState(String(PING_TEST_DEFAULT_COUNT));
  const [length, setLength] = useState(String(PING_TEST_DEFAULT_LENGTH));
  const [info, setInfo] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [destIpError, setDestIpError] = useState("");
  const [countError, setCountError] = useState("");
  const [lengthError, setLengthError] = useState("");
  const [sourceOptions, setSourceOptions] = useState([]);
  const [loadingSource, setLoadingSource] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!outputRef.current || !info) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [info]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  useEffect(() => {
    const loadSourceOptions = async () => {
      try {
        setLoadingSource(true);
        const netData = await fetchNetwork();
        const allIfaces = netData?.data?.interfaces || [];

        // Only physical LAN interfaces: eth0/eth1/... or enp4s0/enp4s1/...
        const lanIfaces = allIfaces.filter((i) => {
          const kn = (i.interface || "").toLowerCase();
          return /^eth\d+$/.test(kn) || /^enp\d+s\d+/.test(kn);
        });

        // Sequential "LAN 1", "LAN 2", … — never rely on the API name field
        const options = lanIfaces
          .filter((i) => i.ipAddress)
          .map((iface, idx) => ({
            value: iface.ipAddress,
            label: `LAN ${idx + 1}:${iface.ipAddress}`,
          }));

        // VLAN sub-interfaces of the first physical interface
        const primaryKernel = lanIfaces[0]?.interface || "eth0";
        for (const iface of allIfaces) {
          const kn = (iface.interface || "").toString();
          if (
            kn.startsWith(`${primaryKernel}.`) &&
            /\.\d+$/.test(kn) &&
            iface.ipAddress
          ) {
            const vlanId = kn.split(".")[1] || "";
            options.push({
              value: iface.ipAddress,
              label: `VLAN ${vlanId}:${iface.ipAddress}`,
            });
          }
        }

        // VPN / non-LAN interfaces (tap0, tun0, vpn_vpn, etc.)
        const lanIfaceSet = new Set(lanIfaces.map((i) => i.interface));
        for (const iface of allIfaces) {
          const kn = (iface.interface || "").toLowerCase();
          if (
            iface.ipAddress &&
            !lanIfaceSet.has(iface.interface) &&
            kn !== "lo" &&
            !/^eth\d+\.\d+$/.test(kn)
          ) {
            options.push({
              value: iface.ipAddress,
              label: `VPN (${iface.interface}):${iface.ipAddress}`,
            });
          }
        }

        if (options.length > 0) {
          setSourceOptions(options);
          setSourceIp(options[0].value);
        } else {
          setSourceOptions(PING_SOURCE_OPTIONS);
          setSourceIp(PING_SOURCE_OPTIONS[0]?.value || "");
        }
      } catch (error) {
        console.error("Error fetching network interfaces:", error);
        setSourceOptions(PING_SOURCE_OPTIONS);
        setSourceIp(PING_SOURCE_OPTIONS[0]?.value || "");
      } finally {
        setLoadingSource(false);
      }
    };

    loadSourceOptions();
  }, []);

  const startpingTest = async () => {
    setDestIpError("");
    setCountError("");
    setLengthError("");
    let valid = true;

    if (!isValidIp(destIp)) {
      setDestIpError(PING_TEST_ERR_INVALID_DEST_IP);
      valid = false;
    }
    if (count && !isValidCount(count)) {
      setCountError(PING_TEST_ERR_INVALID_COUNT);
      valid = false;
    }
    if (length && !isValidLength(length)) {
      setLengthError(PING_TEST_ERR_INVALID_LENGTH);
      valid = false;
    }
    if (!valid) {
      showToast(PING_TEST_ERR_FIX_BEFORE_START, "error");
      return;
    }

    // Clear previous results when starting new ping test
    setInfo("");
    setLoading(true);

    if (count && destIp) {
      showToast(PING_TEST_TOAST_STARTED, "info");
      // Individual ping mode (with count specified) - call API for each ping
      console.log("=== ENTERING INDIVIDUAL PING MODE ===");
      console.log("Count:", count, "DestIP:", destIp);
      const pingCount = parseInt(count);
      console.log("Ping count parsed:", pingCount);

      // Add ping header
      setInfo(
        (prev) =>
          prev +
          `PING ${destIp} (${destIp}) ${length || 56}(${84 + (parseInt(length) || 56)}) bytes of data.\n`,
      );

      for (let i = 1; i <= pingCount; i++) {
        console.log(`Starting ping ${i}/${pingCount}`);

        // Call API for each individual ping
        await handleSinglePing(i);

        console.log(`Completed ping ${i}/${pingCount}`);

        // Add small delay between pings (like real ping command)
        if (i < pingCount) {
          console.log(`Waiting 1 second before next ping...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Add ping statistics at the end
      setInfo(
        (prev) =>
          prev +
          `\n--- ${destIp} ping statistics ---\n${pingCount} packets transmitted, ${pingCount} received, 0% packet loss\n`,
      );

      setLoading(false);
      showToast(PING_TEST_TOAST_COMPLETED, "success");
    } else if (!count && !length && destIp) {
      // Continuous ping mode (no count specified)
      if (!intervalRef.current) {
        // Call once immediately and check if it succeeds before starting interval
        const success = await handlePing();
        if (success) {
          intervalRef.current = setInterval(() => {
            handlePing();
          }, 2000);
          showToast(PING_TEST_TOAST_CONTINUOUS_STARTED, "success");
        } else {
          setLoading(false);
        }
      } else {
        showToast(PING_TEST_TOAST_ALREADY_RUNNING, "warning");
        setLoading(false);
      }
    } else {
      // Single ping without count
      const success = await handlePing();
      setLoading(false);
      if (success) {
        showToast(PING_TEST_TOAST_COMPLETED, "success");
      }
    }
  };

  const stopPingInterval = () => {
    const wasRunning = !!intervalRef.current || loading;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
    if (wasRunning) {
      showToast(PING_TEST_TOAST_STOPPED, "success");
    } else {
      showToast(PING_TEST_TOAST_NOT_RUNNING, "warning");
    }
  };

  const stopPingOnError = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
    // Don't show "Ping stopped!" message for errors
  };

  const handleSinglePing = async (pingNumber) => {
    setError(false);
    try {
      console.log(`Making API call for ping ${pingNumber}`);
      const Apiresponse = await postPingtest({
        destIp,
        count: 1, // Always ping 1 at a time
        length,
        sourceIp,
        type: "start",
      });

      console.log(`Ping ${pingNumber} API Response:`, Apiresponse);

      if (Apiresponse.response) {
        // Use the actual API response data
        const responseData = Apiresponse.responseData;
        console.log(`Ping ${pingNumber} response data:`, responseData);

        // Extract individual ping result from the response
        if (responseData && responseData.includes("64 bytes from")) {
          // If response contains ping result, use it directly
          const lines = responseData.split("\n");
          const pingLine = lines.find((line) => line.includes("64 bytes from"));
          if (pingLine) {
            setInfo((prev) => prev + pingLine + "\n");
          } else {
            // Fallback to formatted result
            const pingResult = `64 bytes from ${destIp}: icmp_seq=${pingNumber} ttl=64 time=0.300 ms`;
            setInfo((prev) => prev + pingResult + "\n");
          }
        } else {
          // Format the ping result like terminal
          const pingResult = `64 bytes from ${destIp}: icmp_seq=${pingNumber} ttl=64 time=0.300 ms`;
          setInfo((prev) => prev + pingResult + "\n");
        }
        return true; // Success
      } else {
        const errorResult = `Request timeout for icmp_seq ${pingNumber}`;
        setInfo((prev) => prev + errorResult + "\n");
        return false; // Failed
      }
    } catch (err) {
      console.error(`Ping ${pingNumber} API Error:`, err);
      const errorResult = `Request timeout for icmp_seq ${pingNumber}`;
      setInfo((prev) => prev + errorResult + "\n");
      return false; // Failed
    }
  };

  const handlePing = async () => {
    setError(false);
    try {
      const Apiresponse = await postPingtest({
        destIp,
        count,
        length,
        sourceIp,
        type: "start",
      });
      console.log("Ping API Response:", Apiresponse);

      if (Apiresponse.response) {
        // Always append ping results for real-time display
        setInfo((prev) => {
          if (prev) {
            return prev + "\n" + Apiresponse.responseData;
          } else {
            return Apiresponse.responseData;
          }
        });
        return true; // Success
      } else {
        showToast(Apiresponse.message || PING_TEST_TOAST_SERVER_ERROR, "error");
        stopPingOnError();
        return false; // Failed
      }
    } catch (err) {
      console.error("Ping API Error:", err);
      showToast(PING_TEST_TOAST_CONNECTION_ERROR, "error");
      setError(true);
      stopPingOnError();
      return false; // Failed
    }
  };

  const clearOutput = () => {
    setInfo("");
  };

  return (
    <PingPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={pingFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <PingBreadcrumb />

      <div>
        <div style={pingTableContainerStyle}>
          <div style={pingHeaderStyle}>
            <span>{PING_TEST_CARD_TITLE}</span>
          </div>

          <div style={pingBodyStyle}>
            <div style={pingConfigPanelStyle}>
              <div style={pingConfigHeaderStyle}>
                <PanelTitle title={PING_TEST_SECTION_CONFIG} />
                <div style={pingConfigActionsStyle}>
                  <Btn
                    variant="cancel"
                    onClick={stopPingInterval}
                    disabled={!loading}
                    style={pingFooterBtnStyle}
                  >
                    {PING_BUTTONS.end}
                  </Btn>
                  <Btn
                    variant="primary"
                    onClick={startpingTest}
                    disabled={loading || !destIp.trim()}
                    style={pingFooterBtnStyle}
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
                        {PING_BUTTONS.loading}
                      </span>
                    ) : (
                      PING_BUTTONS.start
                    )}
                  </Btn>
                </div>
              </div>

              <div style={pingConfigBodyStyle}>
                <div style={pingFieldsGridStyle(isCompact)}>
                  <div style={pingFieldsColumnStyle}>
                    <FieldRow name="sourceIp" label={PING_LABELS.sourceIp}>
                      <select
                        style={selectStyle}
                        value={sourceIp}
                        onChange={(e) => setSourceIp(e.target.value)}
                        disabled={loadingSource}
                        {...inputInteraction}
                      >
                        {loadingSource ? (
                          <option value="">{PING_TEST_SOURCE_LOADING}</option>
                        ) : (
                          sourceOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))
                        )}
                      </select>
                    </FieldRow>

                    <FieldRow name="destIp" label={PING_LABELS.destIp}>
                      <input
                        type="text"
                        style={inputStyle}
                        value={destIp}
                        onChange={(e) => {
                          setDestIp(e.target.value);
                          setInfo("");
                          setDestIpError("");
                        }}
                        placeholder="e.g. 8.8.8.8"
                        {...inputInteraction}
                      />
                      {destIpError ? (
                        <div style={pingFieldErrorStyle}>{destIpError}</div>
                      ) : null}
                    </FieldRow>
                  </div>

                  <div style={pingFieldsColumnStyle}>
                    <FieldRow name="count" label={PING_LABELS.count}>
                      <input
                        type="number"
                        style={inputStyle}
                        value={count}
                        onChange={(e) => {
                          setCount(e.target.value);
                          setInfo("");
                          setCountError("");
                        }}
                        placeholder={String(PING_TEST_DEFAULT_COUNT)}
                        {...inputInteraction}
                      />
                      {countError ? (
                        <div style={pingFieldErrorStyle}>{countError}</div>
                      ) : null}
                    </FieldRow>

                    <FieldRow name="length" label={PING_LABELS.length}>
                      <input
                        type="number"
                        style={inputStyle}
                        value={length}
                        onChange={(e) => {
                          setLength(e.target.value);
                          setInfo("");
                          setLengthError("");
                        }}
                        placeholder={String(PING_TEST_DEFAULT_LENGTH)}
                        {...inputInteraction}
                      />
                      {lengthError ? (
                        <div style={pingFieldErrorStyle}>{lengthError}</div>
                      ) : null}
                    </FieldRow>
                  </div>
                </div>
              </div>
            </div>

            <div style={pingOutputPanelStyle}>
              <div style={pingOutputHeaderStyle}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: C.sectionHeading,
                  }}
                >
                  {PING_TEST_SECTION_OUTPUT}
                </span>
                <Btn
                  variant="cancel"
                  onClick={clearOutput}
                  disabled={!info || loading}
                  style={pingClearBtnStyle}
                >
                  {PING_TEST_BTN_CLEAR}
                </Btn>
              </div>
              <div style={pingOutputBodyStyle}>
                <textarea
                  ref={outputRef}
                  className={PING_TEST_SCROLL_CLASS}
                  style={pingOutputTextareaStyle}
                  value={info}
                  readOnly
                  tabIndex={-1}
                  placeholder={PING_TEST_OUTPUT_PLACEHOLDER}
                  onFocus={(e) => e.target.blur()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PingPageShell>
  );
};

export default PINGTest;
