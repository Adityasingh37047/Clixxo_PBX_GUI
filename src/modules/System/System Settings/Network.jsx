import React, { useState, useEffect, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import {
  NETWORK_PAGE_BREADCRUMB_ROOT,
  NETWORK_PAGE_BREADCRUMB_SECTION,
  NETWORK_PAGE_TITLE,
  NETWORK_CARD_TITLE,
  NETWORK_SECTION_HEADING_LEFT,
  NETWORK_SECTION_DNS,
  NETWORK_SECTION_ARP,
  NETWORK_BTN_SAVE,
  NETWORK_BTN_SAVING,
  NETWORK_BTN_RESET,
  NETWORK_BTN_RESETTING,
  NETWORK_LOADING_TEXT,
  NETWORK_PROGRESS_RESTART_DEFAULT,
  NETWORK_PROGRESS_CHECKING,
  NETWORK_PROGRESS_BACK_ONLINE,
  NETWORK_PROGRESS_SAVED_REBOOTING,
  NETWORK_PROGRESS_WAITING_REBOOT,
  NETWORK_LABEL_IPV4_TYPE,
  NETWORK_LABEL_IP_ADDRESS,
  NETWORK_LABEL_SUBNET_MASK,
  NETWORK_LABEL_DEFAULT_GATEWAY,
  NETWORK_LABEL_IPV6_ADDRESS,
  NETWORK_LABEL_IPV6_PREFIX,
  NETWORK_LABEL_VLAN_ENABLE,
  NETWORK_LABEL_PREFERRED_DNS,
  NETWORK_LABEL_STANDBY_DNS,
  NETWORK_LABEL_DEFAULT_MODE,
  NETWORK_RADIO_YES,
  NETWORK_RADIO_NO,
  NETWORK_OPTION_STATIC,
  NETWORK_OPTION_DHCP,
  NETWORK_VLAN_LAN1_FIELDS,
  NETWORK_VLAN1_FIELDS,
  NETWORK_VLAN2_FIELDS,
  NETWORK_VLAN3_FIELDS,
  NETWORK_FIELD_TOOLTIPS,
  NETWORK_CONFIRM_SAVE,
  NETWORK_ERR_INVALID_DATA,
  NETWORK_ERR_LOAD_TIMEOUT,
  NETWORK_ERR_LOAD_NOT_FOUND,
  NETWORK_ERR_LOAD_SERVER,
  NETWORK_ERR_LOAD_NETWORK,
  NETWORK_ERR_LOAD_FAILED,
  NETWORK_ERR_RESET_SUCCESS,
  NETWORK_ERR_RESET_FAILED,
  NETWORK_ERR_RESET_TIMEOUT,
  NETWORK_ERR_RESET_SERVER,
  NETWORK_ERR_RESET_NETWORK,
  NETWORK_ERR_RESET_FAILED_GENERIC,
  NETWORK_ERR_RESTART_TIMEOUT,
  NETWORK_ERR_REBOOT_FAILED,
  NETWORK_ERR_SAVE_FAILED,
  NETWORK_ERR_SAVE_FAILED_GENERIC,
  NETWORK_ERR_SAVE_TIMEOUT,
  NETWORK_ERR_SAVE_INVALID,
  NETWORK_ERR_SAVE_SERVER,
  NETWORK_ERR_SAVE_NETWORK,
  NETWORK_ERR_DHCP_ONLY_ONE,
  NETWORK_ERR_INVALID_IP,
  NETWORK_ERR_INVALID_SUBNET,
  NETWORK_ERR_INVALID_GATEWAY,
  NETWORK_ERR_INVALID_ARP,
} from "../../../constants/NetworkConstants";
import { Alert, CircularProgress, useMediaQuery } from "@mui/material";
import {
  fetchNetwork,
  resetNetworkSettings,
  saveNetworkSettings,
  postLinuxCmd,
  servicePing,
} from "../../../api/apiService";

const NETWORK_COMPACT_MQ = "(max-width: 768px)";
const NETWORK_SCROLL_CLASS = "network-scroll";
const NETWORK_LABEL_COL_WIDTH = 200;
const NETWORK_CONTROL_COL_WIDTH = 220;
const NETWORK_FIELD_COL_GAP = 8;
const NETWORK_FORM_PAD_X = 28;

const NETWORK_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

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
  sectionHeading: "#30415A",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;
// ── Local field UI (matches SipSipPage design language) ──
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
  width: NETWORK_CONTROL_COL_WIDTH,
  minWidth: NETWORK_CONTROL_COL_WIDTH,
  maxWidth: NETWORK_CONTROL_COL_WIDTH,
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

const systemFieldInputStyle = {
  ...nativeFieldInputStyle,
};

const systemFieldSelectStyle = {
  ...systemFieldInputStyle,
  appearance: "auto",
  minHeight: 36,
  height: 36,
  paddingTop: 7,
  paddingBottom: 7,
  lineHeight: 1.35,
  cursor: "pointer",
};

const inputStyle = systemFieldInputStyle;
const selectStyle = systemFieldSelectStyle;

const networkValueColStyle = {
  flex: "1 1 auto",
  minWidth: NETWORK_CONTROL_COL_WIDTH,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  justifyContent: "flex-start",
  paddingTop: 2,
};

const networkControlSlotStyle = {
  width: NETWORK_CONTROL_COL_WIDTH,
  minWidth: NETWORK_CONTROL_COL_WIDTH,
  maxWidth: NETWORK_CONTROL_COL_WIDTH,
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
};

const networkFieldErrorStyle = {
  fontSize: 11,
  color: C.errorRed,
  marginTop: 4,
  width: "100%",
};

const NetworkFieldRow = ({
  label,
  tooltipKey,
  children,
  labelColWidth = NETWORK_LABEL_COL_WIDTH,
}) => {
  const tooltip = tooltipKey ? NETWORK_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: "100%",
        lineHeight: 1.4,
        whiteSpace: "normal",
        overflowWrap: "break-word",
        wordBreak: "break-word",
        cursor: tooltip ? "help" : undefined,
      }}
    >
      {label}
    </label>
  );

  const labelWrapStyle = {
    flex: `0 0 ${labelColWidth}px`,
    width: labelColWidth,
    maxWidth: labelColWidth,
    minWidth: labelColWidth,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        minHeight: 36,
        gap: NETWORK_FIELD_COL_GAP,
      }}
    >
      <div style={labelWrapStyle}>
        {tooltip ? (
          <Tooltip title={tooltip} {...NETWORK_TOOLTIP_PROPS}>
            {labelNode}
          </Tooltip>
        ) : (
          labelNode
        )}
      </div>
      <div style={networkValueColStyle}>
        <div style={networkControlSlotStyle}>{children}</div>
      </div>
    </div>
  );
};

const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

const advancedFormBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  startIcon,
  form,
  component,
  title,
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
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
    error: {
      background: C.errorRed,
      color: C.cardBg,
      border: `1px solid ${C.errorRed}`,
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
      form={form}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding:
          variant === "primary" || variant === "cancel"
            ? "8px 32px"
            : "6px 14px",
        borderRadius: 8,
        fontSize: variant === "primary" || variant === "cancel" ? 14 : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: variant === "primary" || variant === "cancel" ? 38 : 30,
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
      {startIcon && (
        <span style={{ display: "flex", alignItems: "center" }}>
          {startIcon}
        </span>
      )}
      {children}
    </Component>
  );
};

const disabledInputStyle = {
  ...inputStyle,
  background: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
  borderColor: "#e2e8f0",
};

const SectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst
        ? SETTINGS_SECTION_HEADING_FIRST_MARGIN
        : SETTINGS_SECTION_HEADING_NEXT_MARGIN,
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.divider}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: NETWORK_SECTION_HEADING_LEFT,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: C.sectionHeading,
      }}
    >
      {title}
    </span>
  </div>
);

const networkPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const networkPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const networkTableContainerStyle = {
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

const networkHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: `10px ${NETWORK_FORM_PAD_X}px`,
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const networkDashboardGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact
    ? "1fr"
    : "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
  minHeight: "100%",
});

const networkDashboardColumnStyle = (isCompact) => ({
  display: "flex",
  flexDirection: "column",
  gap: SETTINGS_COLUMN_GAP,
  minWidth: 0,
  padding: isCompact
    ? `16px ${NETWORK_FORM_PAD_X}px 20px`
    : SETTINGS_COLUMN_PADDING_DESKTOP,
  background: C.cardBg,
});

const networkDashboardDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

const networkDashboardDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

const SETTINGS_SECTION_HEADING_FIRST_MARGIN = "12px 0 24px 0";
const SETTINGS_SECTION_HEADING_NEXT_MARGIN = "28px 0 24px 0";
const SETTINGS_FIELDS_STACK_GAP = 12;
const SETTINGS_COLUMN_GAP = 12;
const SETTINGS_COLUMN_PADDING_DESKTOP = "16px 36px 20px";

const networkDashboardFieldsStackStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: 0,
};

const networkFieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: SETTINGS_FIELDS_STACK_GAP,
  width: "100%",
};

const networkFixedAlertSx = {
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

const NetworkScrollbarStyles = () => (
  <style>{`
    .${NETWORK_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${NETWORK_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${NETWORK_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${NETWORK_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${NETWORK_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${NETWORK_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${NETWORK_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

const NetworkPageShell = ({ children, isCompact }) => (
  <div
    className={NETWORK_SCROLL_CLASS}
    style={{
      ...networkPageWrapStyle,
      ...(isCompact ? { padding: 8 } : {}),
    }}
    data-native-scroll
  >
    <div style={networkPageInnerStyle}>{children}</div>
  </div>
);

const NetworkBreadcrumb = () => (
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
    <span>{NETWORK_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{NETWORK_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {NETWORK_PAGE_TITLE}
    </span>
  </div>
);

const Network = () => {
  const isCompact = useMediaQuery(NETWORK_COMPACT_MQ);
  const labelColWidth = isCompact ? 160 : NETWORK_LABEL_COL_WIDTH;
  const [lanInterfaces, setLanInterfaces] = useState([]);
  const [dnsServers, setDnsServers] = useState(["", ""]);
  const [arpMode, setArpMode] = useState("1");
  const [loading, setLoading] = useState(true); // Start with loading true for initial load
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [resetting, setResetting] = useState(false);
  // Error states for each field
  const [ipErrors, setIpErrors] = useState([]);
  const [subnetErrors, setSubnetErrors] = useState([]);
  const [gatewayErrors, setGatewayErrors] = useState([]);
  const [dnsErrors, setDnsErrors] = useState(["", ""]);
  const [arpError, setArpError] = useState("");
  // VLAN state
  const [vlanEnabled, setVlanEnabled] = useState(false);
  const [vlanForm, setVlanForm] = useState({
    lan1Ip: "",
    lan1Mask: "",
    lan1Gw: "",
    vlan1Id: "",
    vlan1Ip: "",
    vlan1Mask: "",
    vlan1Gw: "",
    vlan2Id: "",
    vlan2Ip: "",
    vlan2Mask: "",
    vlan2Gw: "",
    vlan3Id: "",
    vlan3Ip: "",
    vlan3Mask: "",
    vlan3Gw: "",
  });
  // Removed showConfirm and pendingSave for native confirm
  const [hasChanges, setHasChanges] = useState(false);
  const [networkRestarting, setNetworkRestarting] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [pendingIps, setPendingIps] = useState([]);

  const [originalLanSnapshot, setOriginalLanSnapshot] = useState([]);
  const [originalDnsSnapshot, setOriginalDnsSnapshot] = useState(["", ""]);
  const [originalArp, setOriginalArp] = useState("1");
  const [originalVlanEnabled, setOriginalVlanEnabled] = useState(false);
  const [originalVlanSnapshot, setOriginalVlanSnapshot] = useState({});

  const pingIntervalRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 5000);
  };

  function isValidIPv4(ip) {
    return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      ip,
    );
  }
  function isValidSubnetMask(mask) {
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(mask)) return false;
    const parts = mask.split(".").map(Number);
    if (parts.some((p) => p < 0 || p > 255)) return false;
    // Valid mask: contiguous 1-bits followed by contiguous 0-bits.
    // When inverted, the result must be of the form 2^n - 1 (all trailing 1s),
    // which satisfies (inverted & (inverted + 1)) === 0.
    const num = parts.reduce((acc, p) => (acc << 8) | p, 0) >>> 0;
    const inverted = ~num >>> 0;
    return (inverted & (inverted + 1)) === 0;
  }
  function isValidArpMode(mode) {
    return mode === "1" || mode === "2";
  }
  const clearRestartPolling = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearRestartPolling();
    };
  }, []);

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchNetwork();

      if (data && data.data) {
        if (Array.isArray(data.data.interfaces)) {
          const allIfaces = data.data.interfaces;
          const filteredInterfaces = allIfaces
            .filter((iface) => {
              const kn = (iface.interface || "").toLowerCase();
              // Only physical LAN interfaces: eth0/eth1/... or enp4s0/enp4s1/...
              return /^eth\d+$/.test(kn) || /^enp\d+s\d+/.test(kn);
            })
            // Assign sequential "LAN 1", "LAN 2", … — ignore API name field which
            // may reflect a different device numbering (e.g. "LAN 6", "LAN 7")
            .map((iface, seqIdx) => ({
              ...iface,
              name: `LAN ${seqIdx + 1}`,
              ipv4Type: iface.ipv4Type || "Static",
            }))
            .sort((a, b) => {
              // Sort LAN 1, LAN 2, … in numeric order; unknown interfaces last
              const lanNum = (n) => {
                const m = String(n).match(/^LAN\s*(\d+)$/i);
                return m ? parseInt(m[1], 10) : 99;
              };
              return lanNum(a.name) - lanNum(b.name);
            });

          setLanInterfaces(filteredInterfaces);
          setOriginalLanSnapshot(normalizeLanArray(filteredInterfaces));

          const lan1 = filteredInterfaces[0] || {};
          // Detect VLAN sub-interfaces (e.g. enp4s0.100, eth0.100) using the
          // primary interface's actual kernel name as the parent
          const primaryKernelName = lan1.interface || "eth0";
          const vlanIface = allIfaces.find(
            (i) =>
              typeof i.interface === "string" &&
              i.interface.startsWith(`${primaryKernelName}.`) &&
              /\.\d+$/.test(i.interface),
          );
          const hasVlan = Boolean(vlanIface);

          // Try to read VLAN gateway from vlan.cfg if it exists
          let vlanGateway = "";
          if (hasVlan) {
            try {
              const vlanCfgGwCmd = `grep -E '^[[:space:]]*(#)?[[:space:]]*gateway[[:space:]]' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | sed 's/^[[:space:]]*#\\?[[:space:]]*gateway[[:space:]]*//' | awk '{print $1}'`;
              const vlanCfgGwRes = await postLinuxCmd({ cmd: vlanCfgGwCmd });
              const vlanCfgGw = (
                vlanCfgGwRes?.responseData ||
                vlanCfgGwRes?.response ||
                ""
              )
                .toString()
                .trim();
              if (
                vlanCfgGw &&
                /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(
                  vlanCfgGw,
                )
              ) {
                vlanGateway = vlanCfgGw;
                console.log(
                  "Read VLAN gateway from /etc/network/interfaces.d/vlan.cfg:",
                  vlanGateway,
                );
              }
            } catch (e) {
              console.warn("Failed to read VLAN gateway from vlan.cfg:", e);
            }
          }

          const initialVlan = {
            lan1Ip: lan1.ipAddress || "",
            lan1Mask: lan1.subnetMask || "",
            lan1Gw: lan1.defaultGateway || "",
            vlan1Id: hasVlan
              ? String(vlanIface.interface.split(".")[1] || "")
              : "",
            vlan1Ip: hasVlan ? vlanIface.ipAddress || "" : "",
            vlan1Mask: hasVlan ? vlanIface.subnetMask || "" : "",
            vlan1Gw: hasVlan
              ? vlanGateway || vlanIface.defaultGateway || ""
              : "",
            vlan2Id: "",
            vlan2Ip: "",
            vlan2Mask: "",
            vlan2Gw: "",
            vlan3Id: "",
            vlan3Ip: "",
            vlan3Mask: "",
            vlan3Gw: "",
          };

          setVlanEnabled(hasVlan);
          setVlanForm((prev) => ({ ...prev, ...initialVlan }));
          setOriginalVlanEnabled(hasVlan);
          setOriginalVlanSnapshot(normalizeVlanSnapshot(initialVlan));
        }
        const dnsSnap = data.data.dnsServers || ["", ""];
        const arpSnap = data.data.defaultArpMode || "1";
        setDnsServers(dnsSnap);
        setArpMode(arpSnap);
        setOriginalDnsSnapshot([...(dnsSnap || ["", ""])]);
        setOriginalArp(arpSnap);
      } else {
        throw new Error(NETWORK_ERR_INVALID_DATA);
      }
    } catch (err) {
      console.error("Network data fetch error:", err);

      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError(NETWORK_ERR_LOAD_TIMEOUT);
      } else if (err.response?.status === 404) {
        setError(NETWORK_ERR_LOAD_NOT_FOUND);
      } else if (err.response?.status >= 500) {
        setError(NETWORK_ERR_LOAD_SERVER);
      } else if (
        err.message?.includes("Network Error") ||
        err.message?.includes("Failed to fetch")
      ) {
        setError(NETWORK_ERR_LOAD_NETWORK);
      } else {
        setError(NETWORK_ERR_LOAD_FAILED);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
  }, []);

  const normalizeLanArray = (interfaces = []) =>
    (interfaces || []).map((lan, idx) => ({
      key: (lan?.interface || lan?.name || `index-${idx}`).toString(),
      ipAddress: lan?.ipAddress || "",
      subnetMask: lan?.subnetMask || "",
      defaultGateway: lan?.defaultGateway || "",
      ipv6Address: lan?.ipv6Address || "",
      ipv6Prefix: lan?.ipv6Prefix || "",
    }));

  const normalizeVlanSnapshot = (form = {}) => ({
    lan1Ip: form.lan1Ip || "",
    lan1Mask: form.lan1Mask || "",
    lan1Gw: form.lan1Gw || "",
    vlan1Id: form.vlan1Id || "",
    vlan1Ip: form.vlan1Ip || "",
    vlan1Mask: form.vlan1Mask || "",
    vlan1Gw: form.vlan1Gw || "",
    vlan2Id: form.vlan2Id || "",
    vlan2Ip: form.vlan2Ip || "",
    vlan2Mask: form.vlan2Mask || "",
    vlan2Gw: form.vlan2Gw || "",
    vlan3Id: form.vlan3Id || "",
    vlan3Ip: form.vlan3Ip || "",
    vlan3Mask: form.vlan3Mask || "",
    vlan3Gw: form.vlan3Gw || "",
  });

  const applyStaticDefaults = (lan) => {
    const next = { ...lan };
    const isLan1 = next.name === "LAN 1" || next.interface === "eth0";
    const isLan2 = next.name === "LAN 2" || next.interface === "eth1";

    // If we already have an IPv4 address (e.g. coming from DHCP) but no gateway,
    // derive a sensible default gateway from the IP itself (x.y.z.1) and a /24 mask.
    if (next.ipAddress && !next.defaultGateway && isValidIPv4(next.ipAddress)) {
      const parts = next.ipAddress.split(".");
      if (parts.length === 4) {
        next.defaultGateway = `${parts[0]}.${parts[1]}.${parts[2]}.1`;
      }
      if (!next.subnetMask) {
        next.subnetMask = "255.255.255.0";
      }
      return next;
    }

    // If there is no IP at all, fall back to our series defaults.
    if (isLan1) {
      if (!next.ipAddress) next.ipAddress = "192.168.0.101";
      if (!next.subnetMask) next.subnetMask = "255.255.255.0";
      if (!next.defaultGateway) next.defaultGateway = "192.168.0.1";
    } else if (isLan2) {
      if (!next.ipAddress) next.ipAddress = "192.168.1.101";
      if (!next.subnetMask) next.subnetMask = "255.255.255.0";
      if (!next.defaultGateway) next.defaultGateway = "192.168.1.1";
    }

    return next;
  };

  // Update setHasChanges to true on any input change
  const handleLanChange = (index, field, value) => {
    setHasChanges(true);
    setLanInterfaces((prev) => {
      const updated = [...prev];
      const current = updated[index] || {};
      let next = { ...current, [field]: value };

      // When switching back to Static, apply sensible defaults if needed,
      // but DO NOT auto-change other interfaces any more.
      if (field === "ipv4Type" && value === "Static") {
        next = applyStaticDefaults(next);
      }

      updated[index] = next;
      return updated;
    });
    // Clear error for the changed field
    if (field === "ipAddress") {
      setIpErrors((prev) => {
        const arr = [...prev];
        arr[index] = "";
        return arr;
      });
    }
    if (field === "subnetMask") {
      setSubnetErrors((prev) => {
        const arr = [...prev];
        arr[index] = "";
        return arr;
      });
    }
    if (field === "defaultGateway") {
      setGatewayErrors((prev) => {
        const arr = [...prev];
        arr[index] = "";
        return arr;
      });
    }
    if (field === "ipv4Type") {
      setIpErrors((prev) => {
        const arr = [...prev];
        arr[index] = "";
        return arr;
      });
      setSubnetErrors((prev) => {
        const arr = [...prev];
        arr[index] = "";
        return arr;
      });
      setGatewayErrors((prev) => {
        const arr = [...prev];
        arr[index] = "";
        return arr;
      });
    }
  };

  const handleDnsChange = (idx, value) => {
    setHasChanges(true);
    setDnsServers((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
    setDnsErrors((prev) => {
      const arr = [...prev];
      arr[idx] = "";
      return arr;
    });
  };

  const handleVlanChange = (field, value) => {
    setHasChanges(true);
    setVlanForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleArpChange = (e) => {
    setHasChanges(true);
    setArpMode(e.target.value);
    setArpError("");
  };

  const handleReset = async () => {
    clearRestartPolling();
    setNetworkRestarting(false);
    setProgressMessage("");
    try {
      setResetting(true);
      setError("");

      const resp = await resetNetworkSettings();

      if (resp.response) {
        await loadNetworkData();
        showToast(NETWORK_ERR_RESET_SUCCESS, "success");
      } else {
        throw new Error(resp.message || NETWORK_ERR_RESET_FAILED);
      }
    } catch (error) {
      console.error("Network reset error:", error);

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        setError(NETWORK_ERR_RESET_TIMEOUT);
      } else if (error.response?.status >= 500) {
        setError(NETWORK_ERR_RESET_SERVER);
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        setError(NETWORK_ERR_RESET_NETWORK);
      } else {
        setError(
          error.message || NETWORK_ERR_RESET_FAILED_GENERIC,
        );
      }
    } finally {
      setResetting(false);
    }
  };

  const pingDevice = async (targetIp) => {
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";
    const base = targetIp
      ? `${protocol}//${targetIp}${port}`
      : window.location.origin;
    const url = `${base}/api/service-ping`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Ping failed");
      const data = await res.json();
      return data;
    } finally {
      clearTimeout(timeout);
    }
  };

  const checkDeviceOnline = async (targetIp = null) => {
    try {
      const res = targetIp ? await pingDevice(targetIp) : await servicePing();
      if (res?.response) return true;
      return false;
    } catch (err) {
      if (
        err?.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        return true;
      }
      return false;
    }
  };

  const beginNetworkPolling = (
    initialMessage = NETWORK_PROGRESS_CHECKING,
    targetIpList = [],
  ) => {
    clearRestartPolling();
    setProgressMessage(initialMessage);
    const sanitizedTargets = (
      targetIpList && targetIpList.length
        ? targetIpList
        : [window.location.hostname]
    )
      .map((ip) => (ip || "").trim())
      .filter(Boolean);
    const targets = Array.from(
      new Set(
        sanitizedTargets.length ? sanitizedTargets : [window.location.hostname],
      ),
    );

    let attempts = 0;
    pingIntervalRef.current = setInterval(async () => {
      attempts += 1;
      for (const targetIp of targets) {
        const online = await checkDeviceOnline(targetIp);
        if (online) {
          clearRestartPolling();
          setProgressMessage(NETWORK_PROGRESS_BACK_ONLINE);
          setTimeout(() => {
            const protocol = window.location.protocol;
            const port = window.location.port ? `:${window.location.port}` : "";
            const redirectHost = targetIp || window.location.hostname;
            window.location.href = `${protocol}//${redirectHost}${port}/login`;
          }, 3000);
          return;
        }
      }
      if (attempts >= 60) {
        clearRestartPolling();
        setNetworkRestarting(false);
        setProgressMessage("");
        setError(
          NETWORK_ERR_RESTART_TIMEOUT,
        );
      }
    }, 5000);
  };

  const triggerNetworkRestart = async (targetsOverride = null) => {
    setNetworkRestarting(true);
    setProgressMessage(NETWORK_PROGRESS_SAVED_REBOOTING);
    try {
      const rebootCmd =
        'nohup sh -c "sleep 5; reboot" >/dev/null 2>&1 & echo REBOOT_TRIGGERED';
      await postLinuxCmd({ cmd: rebootCmd });
    } catch (err) {
      console.error("Failed to initiate reboot:", err);
      setNetworkRestarting(false);
      setProgressMessage("");
      setError(
        err?.message || NETWORK_ERR_REBOOT_FAILED,
      );
      return;
    }

    const targets = (targetsOverride && targetsOverride.length
      ? targetsOverride
      : pendingIps?.length
        ? pendingIps
        : null) || [window.location.hostname];

    restartTimeoutRef.current = setTimeout(() => {
      beginNetworkPolling(
        NETWORK_PROGRESS_WAITING_REBOOT,
        targets,
      );
    }, 8000);
  };

  // Move actual save logic here
  const actuallySave = async () => {
    setLoading(true);
    setError("");

    const subnetMaskToCidr = (mask) => {
      const parts = (mask || "").split(".").map((n) => parseInt(n, 10));
      if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255))
        return null;
      const bin = parts.map((p) => p.toString(2).padStart(8, "0")).join("");
      if (!/^1*0*$/.test(bin)) return null; // must be contiguous ones
      return bin.indexOf("0") === -1 ? 32 : bin.indexOf("0");
    };

    // Enforce: only one interface can be DHCP at a time
    const dhcpCount = (lanInterfaces || []).reduce((count, lan) => {
      const type = (lan?.ipv4Type || "Static").toUpperCase();
      return count + (type === "DHCP" ? 1 : 0);
    }, 0);

    if (dhcpCount > 1) {
      setLoading(false);
      showToast(
        NETWORK_ERR_DHCP_ONLY_ONE,
        "warning",
      );
      return;
    }

    // Validate all fields
    let valid = true;
    const ipErrs = new Array(lanInterfaces.length).fill("");
    const subnetErrs = new Array(lanInterfaces.length).fill("");
    const gatewayErrs = new Array(lanInterfaces.length).fill("");
    const dnsErrs = ["", ""];
    let arpErr = "";
    const candidatePriorities = new Map();
    const baselineMap = new Map(
      (originalLanSnapshot || []).map((item) => [item.key, item]),
    );

    lanInterfaces.forEach((lan, idx) => {
      const type = (lan.ipv4Type || "Static").toUpperCase();

      // For DHCP, skip IPv4-related validation and candidate IP selection
      if (type === "DHCP") {
        ipErrs[idx] = "";
        subnetErrs[idx] = "";
        gatewayErrs[idx] = "";
        return;
      }

      if (!isValidIPv4(lan.ipAddress)) {
        ipErrs[idx] = NETWORK_ERR_INVALID_IP;
        valid = false;
      } else {
        ipErrs[idx] = "";
      }
      if (!isValidSubnetMask(lan.subnetMask)) {
        subnetErrs[idx] = NETWORK_ERR_INVALID_SUBNET;
        valid = false;
      } else {
        subnetErrs[idx] = "";
      }
      if (!isValidIPv4(lan.defaultGateway)) {
        gatewayErrs[idx] = NETWORK_ERR_INVALID_GATEWAY;
        valid = false;
      } else {
        gatewayErrs[idx] = "";
      }

      const key = (lan.interface || lan.name || `index-${idx}`).toString();
      const baseline = baselineMap.get(key);
      const candidateIp = (lan.ipAddress || "").trim();
      const previousIp = (baseline?.ipAddress || "").trim();
      const ifaceName = (lan.interface || "").toLowerCase();
      const displayName = (lan.name || "").toLowerCase();
      const isPrimaryIface = ifaceName === "eth0" || displayName === "lan 1";

      const addCandidate = (ip, priority) => {
        if (!ip) return;
        const value = ip.trim();
        if (!value) return;
        const existing = candidatePriorities.get(value);
        if (existing === undefined || priority < existing) {
          candidatePriorities.set(value, priority);
        }
      };

      if (candidateIp && previousIp && candidateIp !== previousIp) {
        addCandidate(candidateIp, isPrimaryIface ? 0 : 1);
        addCandidate(previousIp, isPrimaryIface ? 2 : 3);
      } else if (candidateIp) {
        addCandidate(candidateIp, isPrimaryIface ? 0 : 5);
      }
    });

    if (dnsServers[0] && !isValidIPv4(dnsServers[0])) {
      dnsErrs[0] = NETWORK_ERR_INVALID_IP;
      valid = false;
    }
    if (dnsServers[1] && !isValidIPv4(dnsServers[1])) {
      dnsErrs[1] = NETWORK_ERR_INVALID_IP;
      valid = false;
    }
    if (!isValidArpMode(arpMode)) {
      arpErr = NETWORK_ERR_INVALID_ARP;
      valid = false;
    }
    setIpErrors(ipErrs);
    setSubnetErrors(subnetErrs);
    setGatewayErrors(gatewayErrs);
    setDnsErrors(dnsErrs);
    setArpError(arpErr);

    const currentHost = window.location.hostname;
    if (currentHost) {
      const existing = candidatePriorities.get(currentHost);
      candidatePriorities.set(
        currentHost,
        existing === undefined ? 10 : Math.min(existing, 10),
      );
    }

    const pendingList = Array.from(candidatePriorities.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([ip]) => ip);
    setPendingIps(pendingList);

    if (!valid) {
      setLoading(false);
      return;
    }

    try {
      const lanArray = lanInterfaces.map((lan) => ({
        name: lan.interface,
        ipv4Type: lan.ipv4Type || "Static",
        ipAddress: lan.ipAddress,
        subnetMask: lan.subnetMask,
        defaultGateway: lan.defaultGateway,
        ipv6Address: lan.ipv6Address,
        ipv6Prefix: lan.ipv6Prefix,
      }));
      const dnsArray = [
        { preferredDns: dnsServers[0] },
        { standbyDns: dnsServers[1] },
      ];
      const arpArray = [{ defaultArpMode: arpMode }];
      const payload = {
        vlanEnabled,
        vlan: vlanEnabled ? vlanForm : undefined,
        interfaces: vlanEnabled ? [] : lanArray,
        dnsServers: dnsArray,
        arpMode: arpArray,
      };
      console.log(payload);

      const response = await saveNetworkSettings(payload);

      if (response.response) {
        // If VLAN is enabled, configure VLAN interface using Linux CLI
        try {
          if (vlanEnabled) {
            const vlanId = String(vlanForm.vlan1Id || "").trim();
            const vlanIp = String(vlanForm.vlan1Ip || "").trim();
            const vlanMask = String(vlanForm.vlan1Mask || "").trim();
            const vlanGw = String(vlanForm.vlan1Gw || "").trim();
            const cidr = subnetMaskToCidr(vlanMask);
            // Use actual kernel name of first LAN interface as VLAN parent
            const parentIface = lanInterfaces[0]?.interface || "eth0";
            if (vlanId && vlanIp && cidr !== null) {
              const iface = `${parentIface}.${vlanId}`;
              const yaml = `network:\n  version: 2\n  renderer: networkd\n  ethernets:\n    ${parentIface}:\n      dhcp4: no\n  vlans:\n    ${iface}:\n      id: ${vlanId}\n      link: ${parentIface}\n      addresses: [${vlanIp}/${cidr}]${vlanGw ? `\n      routes:\n        - to: 0.0.0.0/0\n          via: ${vlanGw}` : ""}\n`;
              const interfacesCfg = `auto ${iface}\niface ${iface} inet static\n  address ${vlanIp}\n  netmask ${vlanMask}\n  vlan-raw-device ${parentIface}${vlanGw ? `\n  gateway ${vlanGw}` : ""}\n`;
              // Systemd boot persistence (most reliable across distros)
              // IMPORTANT:
              // - set PATH explicitly so systemd environment can find ip/ifconfig/modprobe on boot
              // - escape '$' later so it is not expanded during printf > file
              const bootScript = `#!/bin/sh\nPATH=/sbin:/bin:/usr/sbin:/usr/bin\nmodprobe 8021q 2>/dev/null || true\nparent=${parentIface}\nid=${vlanId}\niface=${parentIface}.${vlanId}\nip=${vlanIp}\ncidr=${cidr}\ngw=${vlanGw || ""}\n# Recreate idempotently\nip link set dev \"$parent\" up 2>/dev/null || ifconfig \"$parent\" up || true\nip link del dev \"$iface\" 2>/dev/null || vconfig rem \"$iface\" 2>/dev/null || true\nip link add link \"$parent\" name \"$iface\" type vlan id \"$id\" 2>/dev/null || vconfig add \"$parent\" \"$id\"\nip addr flush dev \"$iface\" 2>/dev/null || true\nip addr add \"$ip/$cidr\" dev \"$iface\" 2>/dev/null || ifconfig \"$iface\" \"$ip\" netmask ${vlanMask} up\nip link set dev \"$iface\" up 2>/dev/null || ifconfig \"$iface\" up 2>/dev/null || true\n[ -n \"$gw\" ] && (ip route add default via \"$gw\" dev \"$iface\" metric 200 2>/dev/null || true)\nexit 0\n`;
              // Escape $ and " so shell printf doesn't expand variables while writing the file
              const bootScriptEscaped = bootScript
                .replace(/\$/g, "\\$")
                .replace(/"/g, '\\"');
              const unitFile = `[Unit]\nDescription=Apply VLAN at boot\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=oneshot\nExecStart=/usr/local/bin/apply-vlan.sh\nRemainAfterExit=yes\n\n[Install] \nWantedBy=multi-user.target\n`;
              const cmd = [
                `modprobe 8021q 2>/dev/null || true`,
                // Write netplan persistence (do not apply now to avoid tearing down runtime VLAN)
                `if command -v netplan >/dev/null 2>&1; then printf '%s' "${yaml.replace(/"/g, '\\"')}" > /etc/netplan/99-vlan.yaml && sync || true; fi`,
                // Fallback to /etc/network/interfaces (+sync to ensure vlan.cfg is flushed)
                `if [ -f /etc/network/interfaces ] && ! command -v netplan >/dev/null 2>&1; then mkdir -p /etc/network/interfaces.d 2>/dev/null || true; printf '%s' "${interfacesCfg.replace(/"/g, '\\"')}" > /etc/network/interfaces.d/vlan.cfg 2>/dev/null && sync || { printf '%s' "${interfacesCfg.replace(/"/g, '\\"')}" >> /etc/network/interfaces && sync || true; }; fi`,
                // Systemd persistence fallback: write boot script and unit (+sync so they survive reboot)
                `mkdir -p /usr/local/bin 2>/dev/null || true && printf '%s' "${bootScriptEscaped}" > /usr/local/bin/apply-vlan.sh && chmod +x /usr/local/bin/apply-vlan.sh && sync || true`,
                `printf '%s' "${unitFile.replace(/"/g, '\\"')}" > /etc/systemd/system/apply-vlan.service && systemctl daemon-reload && systemctl enable apply-vlan.service 2>/dev/null && sync || true`,
                // Execute boot script once now to ensure VLAN is present immediately
                `/usr/local/bin/apply-vlan.sh 2>/dev/null || true`,
                // Bring up immediately (runtime)
                `ip link set dev ${parentIface} up 2>/dev/null || ifconfig ${parentIface} up || true`,
                `ip link del dev ${iface} 2>/dev/null || vconfig rem ${iface} 2>/dev/null || true`,
                `ip link add link ${parentIface} name ${iface} type vlan id ${vlanId} 2>/dev/null || vconfig add ${parentIface} ${vlanId}`,
                `ip addr flush dev ${iface} 2>/dev/null || true`,
                `ip addr add ${vlanIp}/${cidr} dev ${iface} 2>/dev/null || ifconfig ${iface} ${vlanIp} netmask ${vlanMask} up`,
                `ip link set dev ${iface} up 2>/dev/null || ifconfig ${iface} up || true`,
                // Add VLAN gateway as a HIGHER metric route so management path stays intact
                vlanGw
                  ? `ip route add default via ${vlanGw} dev ${iface} metric 200 2>/dev/null || true`
                  : "true",
                // Final verification
                `ip -o link show ${iface} 2>/dev/null | grep -q '${iface}' && echo "VLAN_CREATED ${iface} ${vlanIp}/${cidr}" || echo "VLAN_CREATE_FAILED ${iface}"`,
              ].join(" && ");
              const vlanRes = await postLinuxCmd({ cmd });
              const out = String(vlanRes?.responseData || "").trim();
              if (!/VLAN_CREATED/.test(out)) {
                showToast(
                  `VLAN create command did not confirm success. Output:\n${out || "(no output)"}`,
                  "warning",
                );
              }
            }
          } else {
            // VLAN disabled: remove any VLAN sub-interfaces of the primary LAN interface
            const parentIface = lanInterfaces[0]?.interface || "eth0";
            const removeCmd = [
              // Runtime removal of VLAN links
              `for i in $(ip -o link | awk -F\": \" '/^\\\d+: ${parentIface}\\\.[0-9]+/ {print $2}'); do ip link set dev \"$i\" down 2>/dev/null || ifconfig \"$i\" down 2>/dev/null || true; ip link del \"$i\" 2>/dev/null || vconfig rem \"$i\" 2>/dev/null || true; done`,
              // Remove default routes via VLANs with high metrics (safety)
              `ip route | awk '/${parentIface}\\.[0-9]+/ && /default/ {print $0}' | while read line; do set -- $line; ip route del default via $3 dev $5 2>/dev/null || true; done`,
              // Remove netplan vlan file if present
              `[ -f /etc/netplan/99-vlan.yaml ] && rm -f /etc/netplan/99-vlan.yaml && (command -v netplan >/dev/null 2>&1 && netplan apply || true) || true`,
              // Remove interfaces.d config and clean legacy interfaces file
              `[ -d /etc/network/interfaces.d ] && rm -f /etc/network/interfaces.d/vlan.cfg || true`,
              `sed -i '/^auto ${parentIface}\\.[0-9]\+$/,/^$/d' /etc/network/interfaces 2>/dev/null || true`,
              // Remove systemd boot persistence
              `systemctl disable --now apply-vlan.service 2>/dev/null || true`,
              `rm -f /etc/systemd/system/apply-vlan.service /usr/local/bin/apply-vlan.sh 2>/dev/null || true`,
              `systemctl daemon-reload 2>/dev/null || true`,
            ].join(" && ");
            await postLinuxCmd({ cmd: removeCmd });
          }
        } catch (_) {}

        setHasChanges(false);
        setLoading(false);
        await triggerNetworkRestart(pendingList);
        return;
      } else {
        throw new Error(response.message || NETWORK_ERR_SAVE_FAILED);
      }
    } catch (error) {
      console.error("Network save error:", error);

      let errorMessage = NETWORK_ERR_SAVE_FAILED_GENERIC;

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage = NETWORK_ERR_SAVE_TIMEOUT;
      } else if (error.response?.status === 400) {
        errorMessage = NETWORK_ERR_SAVE_INVALID;
      } else if (error.response?.status >= 500) {
        errorMessage = NETWORK_ERR_SAVE_SERVER;
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage = NETWORK_ERR_SAVE_NETWORK;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      if (!networkRestarting) {
        setLoading(false);
      }
    }
  };

  // Use native browser confirm dialog
  const handleSave = async (e) => {
    e.preventDefault();
    if (hasChanges) {
      const confirmed = window.confirm(NETWORK_CONFIRM_SAVE);
      if (!confirmed) {
        return; // User cancelled, do nothing
      }
      await actuallySave(); // Proceed with save and redirect
      return;
    }
    // If no changes, do nothing or show a message
  };

  const renderVlanInputField = (f) => (
    <NetworkFieldRow
      key={f.key}
      label={f.label}
      labelColWidth={labelColWidth}
    >
      <input
        type="text"
        value={vlanForm[f.key] || ""}
        onChange={(e) => handleVlanChange(f.key, e.target.value)}
        style={inputStyle}
        {...inputInteraction}
      />
    </NetworkFieldRow>
  );

  const renderLanFields = (lan, idx) => (
    <>
      <NetworkFieldRow
        label={NETWORK_LABEL_IPV4_TYPE}
        tooltipKey="ipv4NetworkType"
        labelColWidth={labelColWidth}
      >
        <select
          value={lan.ipv4Type || NETWORK_OPTION_STATIC}
          onChange={(e) => handleLanChange(idx, "ipv4Type", e.target.value)}
          style={selectStyle}
          {...inputInteraction}
        >
          <option value={NETWORK_OPTION_STATIC}>{NETWORK_OPTION_STATIC}</option>
          <option value={NETWORK_OPTION_DHCP}>{NETWORK_OPTION_DHCP}</option>
        </select>
      </NetworkFieldRow>

      {(lan.ipv4Type || NETWORK_OPTION_STATIC) === NETWORK_OPTION_STATIC && (
        <>
          <NetworkFieldRow
            label={NETWORK_LABEL_IP_ADDRESS}
            tooltipKey="ipAddress"
            labelColWidth={labelColWidth}
          >
            <input
              type="text"
              value={lan.ipAddress || ""}
              onChange={(e) =>
                handleLanChange(idx, "ipAddress", e.target.value)
              }
              style={{
                ...inputStyle,
                borderColor: ipErrors[idx] ? C.errorRed : OUTLINED_BORDER,
              }}
              {...inputInteraction}
            />
            {ipErrors[idx] && (
              <div style={networkFieldErrorStyle}>{ipErrors[idx]}</div>
            )}
          </NetworkFieldRow>

          <NetworkFieldRow
            label={NETWORK_LABEL_SUBNET_MASK}
            tooltipKey="subnetMask"
            labelColWidth={labelColWidth}
          >
            <input
              type="text"
              value={lan.subnetMask || ""}
              onChange={(e) =>
                handleLanChange(idx, "subnetMask", e.target.value)
              }
              style={{
                ...inputStyle,
                borderColor: subnetErrors[idx] ? C.errorRed : OUTLINED_BORDER,
              }}
              {...inputInteraction}
            />
            {subnetErrors[idx] && (
              <div style={networkFieldErrorStyle}>{subnetErrors[idx]}</div>
            )}
          </NetworkFieldRow>

          <NetworkFieldRow
            label={NETWORK_LABEL_DEFAULT_GATEWAY}
            tooltipKey="defaultGateway"
            labelColWidth={labelColWidth}
          >
            <input
              type="text"
              value={lan.defaultGateway || ""}
              onChange={(e) =>
                handleLanChange(idx, "defaultGateway", e.target.value)
              }
              style={{
                ...inputStyle,
                borderColor: gatewayErrors[idx] ? C.errorRed : OUTLINED_BORDER,
              }}
              {...inputInteraction}
            />
            {gatewayErrors[idx] && (
              <div style={networkFieldErrorStyle}>{gatewayErrors[idx]}</div>
            )}
          </NetworkFieldRow>

          <NetworkFieldRow
            label={NETWORK_LABEL_IPV6_ADDRESS}
            tooltipKey="ipv6Address"
            labelColWidth={labelColWidth}
          >
            <input
              type="text"
              value={lan.ipv6Address || ""}
              onChange={(e) =>
                handleLanChange(idx, "ipv6Address", e.target.value)
              }
              style={inputStyle}
              {...inputInteraction}
            />
          </NetworkFieldRow>

          <NetworkFieldRow
            label={NETWORK_LABEL_IPV6_PREFIX}
            tooltipKey="ipv6Prefix"
            labelColWidth={labelColWidth}
          >
            <input
              type="text"
              value={lan.ipv6Prefix || ""}
              onChange={(e) =>
                handleLanChange(idx, "ipv6Prefix", e.target.value)
              }
              style={inputStyle}
              {...inputInteraction}
            />
          </NetworkFieldRow>
        </>
      )}
    </>
  );

  return (
    <>
      <NetworkScrollbarStyles />
      <NetworkPageShell isCompact={isCompact}>
      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={networkFixedAlertSx}
        >
          {error}
        </Alert>
      )}

      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{
            ...networkFixedAlertSx,
            top: error ? 88 : 20,
            whiteSpace: "pre-line",
          }}
        >
          {toast.msg}
        </Alert>
      )}

      {networkRestarting && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className="bg-white rounded-lg flex flex-col items-center gap-4 pointer-events-auto"
            style={{
              minWidth: "300px",
              padding: "24px 32px",
              border: `1px solid ${C.cardBorder}`,
              boxShadow: C.cardShadow,
              borderRadius: CARD_RADIUS,
            }}
          >
            <CircularProgress size={50} sx={{ color: C.accent }} />
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: C.strongText,
                whiteSpace: "pre-line",
                textAlign: "center",
              }}
            >
              {progressMessage || NETWORK_PROGRESS_RESTART_DEFAULT}
            </div>
          </div>
        </div>
      )}

      <NetworkBreadcrumb />

      <div style={networkTableContainerStyle}>
          <div style={networkHeaderStyle}>
            <span>{NETWORK_CARD_TITLE}</span>
          </div>

          <div style={{ padding: 0, boxSizing: "border-box" }}>
            {loading ? (
              <div
                className="flex items-center justify-center w-full"
                style={{ minHeight: 400, padding: "48px 32px" }}
              >
                <div className="text-center">
                  <CircularProgress size={40} sx={{ color: C.accent }} />
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      color: C.mutedText,
                      fontWeight: 500,
                    }}
                  >
                    {NETWORK_LOADING_TEXT}
                  </div>
                </div>
              </div>
            ) : (
              <form
                id="network-settings-form"
                onSubmit={handleSave}
                className="flex flex-col gap-2"
              >
                <div
                  className={NETWORK_SCROLL_CLASS}
                  style={{ boxSizing: "border-box" }}
                >
                  <div style={networkDashboardGridStyle(isCompact)}>
                    <div style={networkDashboardColumnStyle(isCompact)}>
                      <div style={networkDashboardFieldsStackStyle}>
                        {!vlanEnabled &&
                          lanInterfaces.map((lan, idx) => (
                            <div key={lan.name || idx}>
                              <SectionHeading
                                title={lan.name || `LAN ${idx + 1}`}
                                isFirst={idx === 0}
                              />
                              <div style={networkFieldGroupStyle}>
                                {renderLanFields(lan, idx)}
                              </div>
                            </div>
                          ))}

                        <div
                          style={{
                            ...networkFieldGroupStyle,
                            marginTop:
                              !vlanEnabled && lanInterfaces.length > 0
                                ? 28
                                : 12,
                          }}
                        >
                          <NetworkFieldRow
                            label={NETWORK_LABEL_VLAN_ENABLE}
                            tooltipKey="vlanEnable"
                            labelColWidth={labelColWidth}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                minHeight: 32,
                                gap: 16,
                                width: "100%",
                              }}
                            >
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  cursor: "pointer",
                                }}
                              >
                                <input
                                  type="radio"
                                  name="vlanEnable"
                                  checked={vlanEnabled}
                                  onChange={() => {
                                    try {
                                      const lan1 =
                                        (lanInterfaces || []).find(
                                          (l) =>
                                            l.name === "LAN 1" ||
                                            l.interface === "eth0",
                                        ) || {};
                                      setVlanForm((prev) => ({
                                        ...prev,
                                        lan1Ip:
                                          lan1.ipAddress || prev.lan1Ip || "",
                                        lan1Mask:
                                          lan1.subnetMask || prev.lan1Mask || "",
                                        lan1Gw:
                                          lan1.defaultGateway ||
                                          prev.lan1Gw ||
                                          "",
                                      }));
                                    } catch (_) {}
                                    setVlanEnabled(true);
                                    setHasChanges(true);
                                  }}
                                  style={{ accentColor: OUTLINED_FOCUS }}
                                />
                                <span style={{ fontSize: 13, color: C.labelText }}>
                                  {NETWORK_RADIO_YES}
                                </span>
                              </label>
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  cursor: "pointer",
                                }}
                              >
                                <input
                                  type="radio"
                                  name="vlanEnable"
                                  checked={!vlanEnabled}
                                  onChange={() => {
                                    setVlanEnabled(false);
                                    setHasChanges(true);
                                  }}
                                  style={{ accentColor: OUTLINED_FOCUS }}
                                />
                                <span style={{ fontSize: 13, color: C.labelText }}>
                                  {NETWORK_RADIO_NO}
                                </span>
                              </label>
                            </div>
                          </NetworkFieldRow>

                          {vlanEnabled &&
                            NETWORK_VLAN_LAN1_FIELDS.map(renderVlanInputField)}
                          {vlanEnabled &&
                            NETWORK_VLAN1_FIELDS.map(renderVlanInputField)}
                          {vlanEnabled &&
                            NETWORK_VLAN2_FIELDS.map(renderVlanInputField)}
                          {vlanEnabled &&
                            NETWORK_VLAN3_FIELDS.map(renderVlanInputField)}
                        </div>
                      </div>
                    </div>

                    {!isCompact && (
                      <div
                        style={networkDashboardDividerCellStyle}
                        aria-hidden="true"
                      >
                        <div style={networkDashboardDividerLineStyle} />
                      </div>
                    )}

                    <div style={networkDashboardColumnStyle(isCompact)}>
                      <div style={networkDashboardFieldsStackStyle}>
                        <SectionHeading
                          title={NETWORK_SECTION_DNS}
                          isFirst
                        />
                        <div style={networkFieldGroupStyle}>
                          <NetworkFieldRow
                            label={NETWORK_LABEL_PREFERRED_DNS}
                            tooltipKey="preferredDnsServer"
                            labelColWidth={labelColWidth}
                          >
                              <input
                                type="text"
                                value={dnsServers[0] || ""}
                                onChange={(e) =>
                                  handleDnsChange(0, e.target.value)
                                }
                                style={{
                                  ...inputStyle,
                                  borderColor: dnsErrors[0]
                                    ? C.errorRed
                                    : OUTLINED_BORDER,
                                }}
                                {...inputInteraction}
                              />
                              {dnsErrors[0] && (
                                <div style={networkFieldErrorStyle}>
                                  {dnsErrors[0]}
                                </div>
                              )}
                            </NetworkFieldRow>

                            <NetworkFieldRow
                              label={NETWORK_LABEL_STANDBY_DNS}
                              tooltipKey="standbyDnsServer"
                              labelColWidth={labelColWidth}
                            >
                              <input
                                type="text"
                                value={dnsServers[1] || ""}
                                onChange={(e) =>
                                  handleDnsChange(1, e.target.value)
                                }
                                style={{
                                  ...inputStyle,
                                  borderColor: dnsErrors[1]
                                    ? C.errorRed
                                    : OUTLINED_BORDER,
                                }}
                                {...inputInteraction}
                              />
                              {dnsErrors[1] && (
                                <div style={networkFieldErrorStyle}>
                                  {dnsErrors[1]}
                                </div>
                              )}
                            </NetworkFieldRow>
                        </div>

                        <SectionHeading title={NETWORK_SECTION_ARP} />
                        <div style={networkFieldGroupStyle}>
                          <NetworkFieldRow
                            label={NETWORK_LABEL_DEFAULT_MODE}
                            tooltipKey="defaultMode"
                            labelColWidth={labelColWidth}
                          >
                              <select
                                value={arpMode}
                                onChange={handleArpChange}
                                style={{
                                  ...selectStyle,
                                  borderColor: arpError
                                    ? C.errorRed
                                    : OUTLINED_BORDER,
                                }}
                                {...inputInteraction}
                              >
                                <option value="1">1</option>
                                <option value="2">2</option>
                              </select>
                              {arpError && (
                                <div style={networkFieldErrorStyle}>
                                  {arpError}
                                </div>
                              )}
                            </NetworkFieldRow>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>

          {!loading && (
            <div style={advancedFormInlineFooterStyle}>
              <Btn
                variant="primary"
                type="submit"
                form="network-settings-form"
                disabled={loading || resetting || networkRestarting}
                style={advancedFormBtnStyle}
              >
                {loading && !resetting ? NETWORK_BTN_SAVING : NETWORK_BTN_SAVE}
              </Btn>
              <Btn
                variant="cancel"
                type="button"
                onClick={handleReset}
                disabled={resetting || networkRestarting}
                style={advancedFormBtnStyle}
              >
                {resetting ? NETWORK_BTN_RESETTING : NETWORK_BTN_RESET}
              </Btn>
            </div>
          )}
        </div>
    </NetworkPageShell>
    </>
  );
};

export default Network;
