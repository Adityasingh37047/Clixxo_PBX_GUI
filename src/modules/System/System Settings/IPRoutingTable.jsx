import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  IP_ROUTING_TABLE_COLUMNS,
  IP_ROUTING_TABLE_MODAL_FIELDS,
  IP_ROUTING_TABLE_INITIAL_ROW,
  IP_ROUTING_TABLE_PAGE_BREADCRUMB_ROOT,
  IP_ROUTING_TABLE_PAGE_BREADCRUMB_SECTION,
  IP_ROUTING_TABLE_PAGE_TITLE,
  IP_ROUTING_TABLE_BTN_DELETE,
  IP_ROUTING_TABLE_BTN_CLEAR_ALL,
  IP_ROUTING_TABLE_BTN_ADD_NEW,
  IP_ROUTING_TABLE_BTN_SAVE,
  IP_ROUTING_TABLE_BTN_APPLYING,
  IP_ROUTING_TABLE_BTN_CLOSE,
  IP_ROUTING_TABLE_BTN_WORKING,
  IP_ROUTING_TABLE_MODAL_ADD_TITLE,
  IP_ROUTING_TABLE_MODAL_EDIT_TITLE,
  IP_ROUTING_TABLE_EMPTY_MESSAGE,
  IP_ROUTING_TABLE_RECORD_LABEL,
  IP_ROUTING_TABLE_SELECTED_SUFFIX,
  IP_ROUTING_TABLE_EDIT_TITLE_ACCESS,
  IP_ROUTING_TABLE_LOADING_TITLE,
  IP_ROUTING_TABLE_LOADING_SUBTITLE,
  IP_ROUTING_TABLE_NETWORK_LOADING,
  IP_ROUTING_TABLE_PAGINATION_SHOWING,
  IP_ROUTING_TABLE_FIELD_TOOLTIPS,
  IP_ROUTING_TABLE_FORM_LAYOUT,
  IP_ROUTING_TABLE_ERR_REQUIRED_FIELDS,
  IP_ROUTING_TABLE_ERR_INVALID_MASK,
  IP_ROUTING_TABLE_ERR_NETWORK_LOADING,
  IP_ROUTING_TABLE_ERR_SEGMENT_CONFLICT,
  IP_ROUTING_TABLE_ERR_INVALID_DESTINATION,
  IP_ROUTING_TABLE_ERR_INVALID_GATEWAY,
  IP_ROUTING_TABLE_MSG_SAVED,
  IP_ROUTING_TABLE_MSG_APPLY_FAILED,
  IP_ROUTING_TABLE_CONFIRM_DELETE,
  IP_ROUTING_TABLE_CONFIRM_CLEAR_ALL,
  IP_ROUTING_TABLE_MSG_DELETED,
  IP_ROUTING_TABLE_MSG_CLEARED,
} from "../../../constants/IPRoutingTableConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Alert,
  Checkbox,
  Tooltip,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { fetchNetwork, postLinuxCmd } from "../../../api/apiService";

const IP_ROUTE_TABLE_COMPACT_MQ = "(max-width: 768px)";
const IP_ROUTE_TABLE_SCROLL_CLASS = "ip-route-table-scroll";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#6b7280",
  strongText: "#0f172a",
  accent: "#3E5475",
  errorRed: "#dc2626",
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const IP_ROUTE_TABLE_CARD_RADIUS = 10;

const ipRouteOutlinedInputRootSx = {
  backgroundColor: "#fff",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "& fieldset": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover fieldset": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

const ipRouteModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  borderRadius: "6px",
  ...ipRouteOutlinedInputRootSx,
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    minHeight: 36,
    height: 36,
    backgroundColor: "#fff",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
    fontSize: 13,
    backgroundColor: "#fff",
  },
};

const setIpRouteFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setIpRouteFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setIpRouteFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

const ipRouteModalInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setIpRouteFieldFocus(e.target);
  },
  onBlur: (e) => {
    setIpRouteFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setIpRouteFieldFocus(e.target);
    } else {
      setIpRouteFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setIpRouteFieldFocus(e.target);
    } else {
      setIpRouteFieldDefault(e.target);
    }
  },
};

const ipRouteModalFieldInputStyle = {
  minHeight: 32,
  height: 32,
  width: "100%",
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 6,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  lineHeight: 1.35,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const ipRouteModalFieldControlStyle = {
  width: 320,
  maxWidth: "100%",
  minWidth: 0,
  flexShrink: 0,
};

const ipRouteModalFieldRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  maxWidth: 502,
  margin: "0 auto",
};

const IP_ROUTE_FIELD_TOOLTIP_PROPS = {
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
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

const IpRouteFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = tooltipKey
    ? IP_ROUTING_TABLE_FIELD_TOOLTIPS[tooltipKey] || ""
    : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        cursor: tooltip ? "help" : undefined,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={tooltip} {...IP_ROUTE_FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const IpRouteTableScrollbarStyles = () => (
  <style>{`
    .${IP_ROUTE_TABLE_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${IP_ROUTE_TABLE_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${IP_ROUTE_TABLE_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${IP_ROUTE_TABLE_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${IP_ROUTE_TABLE_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${IP_ROUTE_TABLE_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${IP_ROUTE_TABLE_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
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
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: "#dc2626",
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
    accent: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      accent: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      accent: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
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
      variant === "primary" || variant === "accent"
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
    </Component>
  );
};

const addNewModalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "16px 24px",
  boxSizing: "border-box",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const ipRouteModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      position: "sticky",
      top: 0,
      zIndex: 10,
      ...extra,
    }}
  >
    {children}
  </th>
);

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const ipRouteTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const ipRouteFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const getIpRouteTdStyle = (rowBg, lastRowCellStyle, extra = {}) => ({
  ...tdStyle,
  background: rowBg,
  ...lastRowCellStyle,
  ...extra,
});

const getIpRouteRowBg = (isSelected, idx) =>
  isSelected ? "#eff6ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

const IpRouteTableEditIcon = ({ disabled, onClick }) => (
  <EditDocumentIcon
    titleAccess={IP_ROUTING_TABLE_EDIT_TITLE_ACCESS}
    onClick={() => {
      if (!disabled) onClick();
    }}
    style={{
      cursor: disabled ? "not-allowed" : "pointer",
      color: "#2563eb",
      fontSize: 22,
      opacity: disabled ? 0.4 : 0.7,
      transition: "opacity 0.15s ease",
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "1";
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "0.7";
    }}
  />
);

const ipRoutePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const ipRoutePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const IpRouteTableBreadcrumb = () => (
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
    }}
  >
    <span>{IP_ROUTING_TABLE_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{IP_ROUTING_TABLE_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {IP_ROUTING_TABLE_PAGE_TITLE}
    </span>
  </div>
);

const ipRouteCardStyle = {
  background: "#ffffff",
  borderRadius: IP_ROUTE_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const ipRouteToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: IP_ROUTE_TABLE_CARD_RADIUS,
  borderTopRightRadius: IP_ROUTE_TABLE_CARD_RADIUS,
};

const ipRoutePaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: IP_ROUTE_TABLE_CARD_RADIUS,
  borderBottomRightRadius: IP_ROUTE_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const ipRouteSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const ipRouteCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const ipRoutePrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const IpRouteTableEmptyState = ({
  message,
  onAddNew,
  disabled,
  buttonLabel = IP_ROUTING_TABLE_BTN_ADD_NEW,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 240,
      padding: 24,
      textAlign: "center",
    }}
  >
    <div
      style={{
        color: "#3E5475",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 16,
      }}
    >
      {message}
    </div>
    <Btn
      variant="cancel"
      onClick={onAddNew}
      disabled={disabled}
      style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
    >
      {buttonLabel}
    </Btn>
  </div>
);

const IPRoutingTable = () => {
  const isCompact = useMediaQuery(IP_ROUTE_TABLE_COMPACT_MQ);
  const LOCAL_STORAGE_KEY = "ipRoutingTableRows";
  const [rows, setRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ ...IP_ROUTING_TABLE_INITIAL_ROW });
  const [networkOptions, setNetworkOptions] = useState(
    IP_ROUTING_TABLE_MODAL_FIELDS.find((f) => f.key === "networkPort")
      ?.options || [],
  );
  const [networkLoading, setNetworkLoading] = useState(false);

  // Custom scrollbar state
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    top: 0,
    height: 0,
    scrollHeight: 0,
  });
  const [savingRoute, setSavingRoute] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const modalFieldByKey = useMemo(
    () =>
      IP_ROUTING_TABLE_MODAL_FIELDS.reduce((acc, field) => {
        acc[field.key] = field;
        return acc;
      }, {}),
    [],
  );

  const modalFormFields = useMemo(() => {
    const names = IP_ROUTING_TABLE_FORM_LAYOUT.flat();
    return names.map((key) => modalFieldByKey[key]).filter(Boolean);
  }, [modalFieldByKey]);

  const selectedCount = rows.filter((r) => r.checked).length;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // Local storage helpers
  const saveRowsLocal = (data) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch {}
  };
  const loadRowsLocal = () => {
    try {
      const s = localStorage.getItem(LOCAL_STORAGE_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  };

  // Normalize row numbers so 'no' is always sequential (0,1,2,...) and not user-controlled
  const normalizeRows = (list) =>
    (list || []).map((row, idx) => ({
      ...row,
      no: idx + 1,
    }));

  // Persistent routes file helpers - save routes to config file for boot persistence
  const ROUTES_CONFIG_FILE = "/etc/network/interfaces.d/ip-routes.cfg";
  const ROUTES_SCRIPT_FILE = "/etc/network/if-up.d/load-ip-routes";
  const ROUTES_LOADER_SCRIPT = "/usr/local/bin/clixxo-load-ip-routes.sh";
  const ROUTES_SYSTEMD_SERVICE = "clixxo-ip-routes.service";

  // Save all routes to persistent config file
  const saveRoutesToFile = async (
    routesList,
    currentNetworkOptions = networkOptions,
  ) => {
    try {
      // Build routes file content - format: ip route add <route> for each route
      const routeCommands = routesList
        .map((route) => {
          const dest = String(route.destination || "").trim();
          const mask = String(route.subnetMask || "").trim();
          const portLabel = String(route.networkPort || "").trim();

          if (!dest || !mask || !portLabel) return null;

          // Get interface name from port label
          const selectedInterface = currentNetworkOptions.find(
            (o) => o.value === portLabel,
          );
          let iface = "eth0";
          if (selectedInterface && selectedInterface.iface) {
            iface = selectedInterface.iface;
          } else {
            const low = portLabel.toLowerCase();
            if (low.startsWith("lan 1")) iface = "eth0";
            else if (low.startsWith("lan 2")) iface = "eth1";
            else if (low.startsWith("vpn")) {
              const match = portLabel.match(/\(([^)]+)\)/);
              iface = match ? match[1] : "tun0";
            } else if (low.startsWith("vlan")) {
              // VLAN is usually eth0.X (from vlan.cfg); fallback eth0.1 for persistence
              const vlanMatch = portLabel.match(/VLAN\s*(\d+)/i);
              iface = vlanMatch ? `eth0.${vlanMatch[1]}` : "eth0.1";
            }
          }

          // Calculate prefix from mask
          const maskToPrefix = (m) => {
            const parts = m.split(".").map((n) => parseInt(n, 10));
            if (
              parts.length !== 4 ||
              parts.some((n) => isNaN(n) || n < 0 || n > 255)
            )
              return null;
            const bits = parts
              .map((n) => n.toString(2).padStart(8, "0"))
              .join("");
            if (!/^1*0*$/.test(bits)) return null;
            return bits.indexOf("0") === -1 ? 32 : bits.indexOf("0");
          };
          const prefix = maskToPrefix(mask);
          if (prefix === null) return null;

          // Calculate network IP
          const ipToNumber = (ip) => {
            const parts = ip.split(".").map((n) => parseInt(n, 10));
            if (
              parts.length !== 4 ||
              parts.some((n) => isNaN(n) || n < 0 || n > 255)
            )
              return null;
            return (
              (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
            );
          };
          const destNum = ipToNumber(dest);
          if (destNum === null) return null;
          const networkMask =
            prefix === 32 ? 0xffffffff : (~0 >>> 0) << (32 - prefix);
          const networkNum = (destNum & networkMask) >>> 0;
          const networkIp = [
            (networkNum >>> 24) & 0xff,
            (networkNum >>> 16) & 0xff,
            (networkNum >>> 8) & 0xff,
            networkNum & 0xff,
          ].join(".");

          // Build route command
          // VPN interfaces (including SoftEther vpn_vpn) may need gateway
          const isVpnInterface =
            portLabel.toLowerCase().startsWith("vpn") ||
            (iface &&
              (iface.startsWith("tun") ||
                iface.startsWith("tap") ||
                iface.includes("vpn")));

          // Priority: Use gateway from saved route data, then from interface info
          let gateway = String(route.gateway || "").trim() || null;
          if (!gateway && selectedInterface && selectedInterface.gateway) {
            gateway = selectedInterface.gateway;
          }

          let routeCmd;
          if (isVpnInterface) {
            // VPN routes should use gateway if available (required for SoftEther vpn_vpn)
            if (gateway) {
              routeCmd = `ip route add ${networkIp}/${prefix} via ${gateway} dev ${iface} 2>/dev/null || true`;
            } else {
              routeCmd = `ip route add ${networkIp}/${prefix} dev ${iface} 2>/dev/null || true`;
            }
          } else if (gateway) {
            routeCmd = `ip route add ${networkIp}/${prefix} via ${gateway} dev ${iface} 2>/dev/null || true`;
          } else {
            routeCmd = `ip route add ${networkIp}/${prefix} dev ${iface} 2>/dev/null || true`;
          }

          return routeCmd;
        })
        .filter(Boolean);

      // Create config file content
      const fileContent = `# IP Routes Configuration - Auto-generated by IP Routing Table UI
# This file is automatically updated when routes are added/deleted from the UI
# Routes are loaded on boot via systemd service clixxo-ip-routes.service and /etc/network/if-up.d/load-ip-routes

${routeCommands.join("\n")}
`;

      // Save to file
      const saveCmd = `cat > ${ROUTES_CONFIG_FILE} << 'EOF'\n${fileContent}EOF\nchmod 644 ${ROUTES_CONFIG_FILE}`;
      // Helper: run route commands from config file (used by both if-up.d and systemd loader)
      const runRoutesFromFile = `
run_routes() {
  local f="$1"
  [ ! -f "$f" ] && return 0
  while IFS= read -r line || [ -n "$line" ]; do
    [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]] && continue
    eval "$line" 2>/dev/null || true
  done < "$f"
}`;

      // 1) if-up.d script (for systems using ifupdown)
      const ifUpScriptContent = `#!/bin/bash
# Auto-generated: load IP routes when interfaces come up (ifupdown only)
ROUTES_FILE="${ROUTES_CONFIG_FILE}"
${runRoutesFromFile}
if [ -f "$ROUTES_FILE" ]; then sleep 2; run_routes "$ROUTES_FILE"; fi
`;
      const createIfUpCmd = `cat > ${ROUTES_SCRIPT_FILE} << 'IFUPEOF'\n${ifUpScriptContent}IFUPEOF\nchmod 755 ${ROUTES_SCRIPT_FILE}`;

      // 2) systemd loader script - runs at boot, waits for LAN/VLAN then VPN (tap0, vpn_vpn)
      const loaderScriptContent = `#!/bin/bash
# CLIXXO IP routes loader - runs at boot so routes persist after reboot
# Supports LAN1/LAN2, VLAN (eth0.X), SoftEther (vpn_vpn), OpenVPN (tap0)
ROUTES_FILE="${ROUTES_CONFIG_FILE}"
${runRoutesFromFile}
[ ! -f "$ROUTES_FILE" ] && exit 0
# First pass: LAN/VLAN are usually up
sleep 5
run_routes "$ROUTES_FILE"
# Second pass: VPN interfaces (vpn_vpn, tap0) often come up later
sleep 15
run_routes "$ROUTES_FILE"
exit 0
`;
      const createLoaderCmd = `cat > ${ROUTES_LOADER_SCRIPT} << 'LOADEREOF'\n${loaderScriptContent}LOADEREOF\nchmod 755 ${ROUTES_LOADER_SCRIPT}`;

      // 3) systemd service - runs after network is up so routes apply on every boot
      const systemdContent = `[Unit]
Description=CLIXXO load persistent IP routes (LAN/VLAN/VPN/tap0)
After=network-online.target network.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=${ROUTES_LOADER_SCRIPT}
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
`;
      const createSystemdCmd = `cat > /etc/systemd/system/${ROUTES_SYSTEMD_SERVICE} << 'SVCEOF'\n${systemdContent}SVCEOF`;

      // Combine all commands into a single batch execution to drastically reduce network latency
      const batchCmds = [
        saveCmd,
        ...(routeCommands.length > 0 ? [routeCommands.join("\n")] : []),
        createIfUpCmd,
        createLoaderCmd,
        createSystemdCmd,
        "systemctl daemon-reload 2>/dev/null; systemctl enable " +
          ROUTES_SYSTEMD_SERVICE +
          " 2>/dev/null; true",
      ].join("\n");

      await postLinuxCmd({ cmd: batchCmds });

      console.log(
        "Routes saved to persistent config file:",
        ROUTES_CONFIG_FILE,
      );
      return true;
    } catch (error) {
      console.error("Failed to save routes to file:", error);
      return false;
    }
  };

  const handleTableScroll = (e) => {
    setScrollState({
      top: e.target.scrollTop,
      height: e.target.clientHeight,
      scrollHeight: e.target.scrollHeight,
    });
  };

  useEffect(() => {
    if (tableScrollRef.current) {
      setScrollState({
        top: tableScrollRef.current.scrollTop,
        height: tableScrollRef.current.clientHeight,
        scrollHeight: tableScrollRef.current.scrollHeight,
      });
    }
  }, [rows.length]);

  // Load persisted rows on mount
  useEffect(() => {
    const persisted = loadRowsLocal();
    if (Array.isArray(persisted) && persisted.length)
      setRows(normalizeRows(persisted));
  }, []);

  // Persist rows whenever they change
  useEffect(() => {
    saveRowsLocal(rows);
  }, [rows]);

  const openModal = (rowIdx = null) => {
    setEditIndex(rowIdx);
    if (rowIdx !== null) {
      setForm({ ...rows[rowIdx] });
    } else {
      setForm({ ...IP_ROUTING_TABLE_INITIAL_ROW, no: rows.length + 1 });
    }
    // Always refresh network options when opening modal (prefer LAN1 when adding new)
    loadNetworkOptions(rowIdx !== null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditIndex(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // When network port changes, auto-fill gateway if available from interface
      if (name === "networkPort" && value) {
        const selectedInterface = networkOptions.find((o) => o.value === value);
        if (selectedInterface && selectedInterface.gateway && !prev.gateway) {
          // Auto-fill gateway if interface has one and form doesn't have a gateway yet
          updated.gateway = selectedInterface.gateway;
        }
      }

      return updated;
    });
  };

  const handleSave = async (e) => {
    e && e.preventDefault && e.preventDefault();
    const dest = String(form.destination || "").trim();
    const mask = String(form.subnetMask || "").trim();
    const portLabel = String(form.networkPort || "").trim();
    if (!dest || !mask || !portLabel) {
      showToast(IP_ROUTING_TABLE_ERR_REQUIRED_FIELDS, "error");
      return;
    }

    // Convert dotted netmask to CIDR prefix (e.g., 255.255.255.0 -> 24)
    const maskToPrefix = (m) => {
      const parts = m.split(".").map((n) => parseInt(n, 10));
      if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255))
        return null;
      const bits = parts.map((n) => n.toString(2).padStart(8, "0")).join("");
      if (!/^1*0*$/.test(bits)) return null; // must be contiguous
      return bits.indexOf("0") === -1 ? 32 : bits.indexOf("0");
    };
    const prefix = maskToPrefix(mask);
    if (prefix == null) {
      showToast(IP_ROUTING_TABLE_ERR_INVALID_MASK, "error");
      return;
    }

    // Get the selected interface to get the actual interface name
    const selectedInterfaceForIface = networkOptions.find(
      (o) => o.value === portLabel,
    );
    let iface = "eth0"; // default fallback
    if (selectedInterfaceForIface && selectedInterfaceForIface.iface) {
      // Use the actual interface name from the selected option (this will be the real name like tun0, tap0, vpn_vpn, etc.)
      iface = selectedInterfaceForIface.iface;
    } else {
      // Fallback to label-based mapping if interface not found in options
      const low = portLabel.toLowerCase();
      if (low.startsWith("lan 1")) iface = "eth0";
      else if (low.startsWith("lan 2")) iface = "eth1";
      else if (low.startsWith("vpn")) {
        // For VPN, try to extract interface name from label if available, otherwise default to tun0
        // Label format might be "VPN:IP (interface_name)" or just "VPN:IP"
        const match = portLabel.match(/\(([^)]+)\)/);
        iface = match ? match[1] : "tun0";
      } else if (low.startsWith("vlan")) iface = "vlan0";
    }

    // Prevent routing to a segment already directly attached to another interface (unselected WAN/LAN)
    const ipToNumber = (ip) => {
      const parts = ip.split(".").map((n) => parseInt(n, 10));
      if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255))
        return null;
      return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    };
    const getNetworkAddress = (ip, pfx) => {
      const ipNum = ipToNumber(ip);
      if (ipNum === null) return null;
      const mask = pfx === 32 ? 0xffffffff : (~0 >>> 0) << (32 - pfx);
      return (ipNum & mask) >>> 0;
    };
    const isInNetwork = (ip, networkIp, prefix) => {
      // Convert both IPs to their network addresses and compare
      const ipNum = ipToNumber(ip);
      const networkIpNum = ipToNumber(networkIp);
      if (ipNum === null || networkIpNum === null) return false;

      // Calculate network mask
      const mask = prefix === 32 ? 0xffffffff : (~0 >>> 0) << (32 - prefix);

      // Get network addresses by applying mask
      const ipNetwork = (ipNum & mask) >>> 0;
      const networkIpNetwork = (networkIpNum & mask) >>> 0;

      // They're in the same network if their network addresses match
      const result = ipNetwork === networkIpNetwork;
      return result;
    };

    // Check if destination IP falls within any interface's network (selected or unselected)
    // We need to block if destination is in the same network as:
    // 1. The selected interface (can't route to directly connected network through same interface)
    // 2. Any unselected interface (can't route to directly connected network through different interface)
    if (!networkOptions || networkOptions.length === 0) {
      showToast(IP_ROUTING_TABLE_ERR_NETWORK_LOADING, "error");
      return;
    }

    const allInterfaces = networkOptions || [];
    let conflict = false;

    for (const o of allInterfaces) {
      if (!o.ip) continue;

      // Get mask - prefer stored mask, fallback to 255.255.255.0
      let maskStr = "255.255.255.0";
      if (o.mask && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(o.mask)) {
        maskStr = o.mask;
      }

      const pfx = maskToPrefix(maskStr);
      if (pfx === null) continue; // Invalid mask, skip

      // Check if destination IP is within this interface's network
      const inNetwork = isInNetwork(dest, o.ip, pfx);

      if (inNetwork) {
        conflict = true;
        break;
      }
    }

    if (conflict) {
      showToast(IP_ROUTING_TABLE_ERR_SEGMENT_CONFLICT, "error");
      return;
    }

    // Calculate network address from destination IP and prefix
    // If destination is a host IP, convert it to network address
    const destNum = ipToNumber(dest);
    if (destNum === null) {
      showToast(IP_ROUTING_TABLE_ERR_INVALID_DESTINATION, "error");
      return;
    }
    const networkMask =
      prefix === 32 ? 0xffffffff : (~0 >>> 0) << (32 - prefix);
    const networkNum = (destNum & networkMask) >>> 0;
    const networkIp = [
      (networkNum >>> 24) & 0xff,
      (networkNum >>> 16) & 0xff,
      (networkNum >>> 8) & 0xff,
      networkNum & 0xff,
    ].join(".");

    // Get gateway - prioritize manually entered gateway from form, then from interface info
    // VPN interfaces (including SoftEther vpn_vpn) may need a gateway
    const selectedInterface = networkOptions.find((o) => o.value === portLabel);
    // Detect VPN interface: check if label starts with VPN or iface name is tun*/tap*/vpn* (including vpn_vpn)
    const isVpnInterface =
      portLabel.toLowerCase().startsWith("vpn") ||
      (iface &&
        (iface.startsWith("tun") ||
          iface.startsWith("tap") ||
          iface.includes("vpn"))); // This matches vpn_vpn, vpn_vpn1, etc.

    // Priority 1: Use manually entered gateway from form (user specified)
    let gateway = String(form.gateway || "").trim() || null;

    // Priority 2: If no manual gateway, get from selected interface info
    if (!gateway && selectedInterface && selectedInterface.gateway) {
      gateway = selectedInterface.gateway;
    }

    // Priority 3: For VPN interfaces, if gateway still not found, try to extract from existing routes
    if (isVpnInterface && !gateway && iface) {
      try {
        // Query existing routes for this VPN interface to extract gateway
        // Look for routes with "via" keyword which indicates a gateway
        const routeCmd = `ip route show dev ${iface} | grep " via " | head -1 | awk '{for(i=1;i<=NF;i++){if($i=="via"){print $(i+1); exit}}}'`;
        const routeRes = await postLinuxCmd({ cmd: routeCmd });
        if (routeRes) {
          const extractedGw = (
            routeRes.output ||
            routeRes.responseData ||
            routeRes.message ||
            ""
          )
            .toString()
            .trim();
          if (
            /^(?:\d{1,3}\.){3}\d{1,3}$/.test(extractedGw) &&
            extractedGw !== "0.0.0.0"
          ) {
            gateway = extractedGw;
            console.log(
              `✓ Extracted gateway ${gateway} for VPN interface ${iface} (SoftEther vpn_vpn)`,
            );
          }
        }
      } catch (e) {
        console.log(
          "Could not query gateway from routes for VPN interface:",
          e,
        );
      }
    }

    if (gateway && !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(gateway)) {
      showToast(IP_ROUTING_TABLE_ERR_INVALID_GATEWAY, "error");
      return;
    }

    // Build route command
    // For VPN: use gateway if available (required for SoftEther vpn_vpn), otherwise route directly
    // For others: use gateway if available, otherwise use dev only
    let routeTarget;
    if (isVpnInterface) {
      // VPN routes should use gateway if available (especially for SoftEther vpn_vpn)
      // If gateway is available, use it; otherwise route directly through interface
      if (gateway) {
        routeTarget = `${networkIp}/${prefix} via ${gateway} dev ${iface}`;
      } else {
        routeTarget = `${networkIp}/${prefix} dev ${iface}`;
      }
    } else if (gateway) {
      routeTarget = `${networkIp}/${prefix} via ${gateway} dev ${iface}`;
    } else {
      routeTarget = `${networkIp}/${prefix} dev ${iface}`;
    }

    // Use 'add' command - it will work whether route exists or not
    // If route exists, we'll delete it first, then add the new one
    const deleteCmd = `ip route delete ${routeTarget} 2>/dev/null || true`;
    const addCmd = `ip route add ${routeTarget}`;

    // OPTIMISTIC UI: Immediately update the table and close the modal
    let updatedRows;
    if (editIndex !== null) {
      const newRows = [...rows];
      newRows[editIndex] = {
        ...form,
        checked: false,
        gateway: gateway || form.gateway || "",
      };
      updatedRows = normalizeRows(newRows);
    } else {
      const newRows = [
        ...rows,
        { ...form, checked: false, gateway: gateway || form.gateway || "" },
      ];
      updatedRows = normalizeRows(newRows);
    }
    setRows(updatedRows);
    saveRowsLocal(updatedRows);
    closeModal();
    showToast(IP_ROUTING_TABLE_MSG_SAVED, "success");

    // Perform backend operations silently in the background
    postLinuxCmd({ cmd: `${deleteCmd}; ${addCmd}` })
      .then(() => {
        // Save routes to persistent config file
        saveRoutesToFile(updatedRows, networkOptions).catch((err) => {
          console.error("Failed to save routes to persistent file:", err);
        });
      })
      .catch((err) => {
        showToast(
          err?.message || IP_ROUTING_TABLE_MSG_APPLY_FAILED,
          "error",
        );
      });
  };

  const handleCheck = (idx) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, checked: !row.checked } : row,
      ),
    );
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setRows((prev) => prev.map((row) => ({ ...row, checked })));
  };

  const handleDelete = () => {
    const itemsToDelete = rows
      .map((row, idx) => ({ row, idx }))
      .filter((item) => item.row.checked);
    if (itemsToDelete.length === 0 || savingRoute) return;

    const isConfirmed = window.confirm(
      IP_ROUTING_TABLE_CONFIRM_DELETE(itemsToDelete.length),
    );
    if (!isConfirmed) return;

    setSavingRoute(true);

    const maskToPrefix = (m) => {
      const parts = String(m || "")
        .split(".")
        .map((n) => parseInt(n, 10));
      if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255))
        return null;
      const bits = parts.map((n) => n.toString(2).padStart(8, "0")).join("");
      if (!/^1*0*$/.test(bits)) return null;
      return bits.indexOf("0") === -1 ? 32 : bits.indexOf("0");
    };
    const ipToNumber = (ip) => {
      const parts = ip.split(".").map((n) => parseInt(n, 10));
      if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255))
        return null;
      return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    };

    const deletePromises = itemsToDelete.map(async ({ row }) => {
      const dest = String(row.destination || "").trim();
      const mask = String(row.subnetMask || "").trim();
      const portLabel = String(row.networkPort || "").trim();

      if (!dest || !mask || !portLabel) return;

      const pfx = maskToPrefix(mask);
      if (pfx === null) return;

      // Calculate network address (same as when adding)
      const destNum = ipToNumber(dest);
      if (destNum === null) return;

      const networkMask = pfx === 32 ? 0xffffffff : (~0 >>> 0) << (32 - pfx);
      const networkNum = (destNum & networkMask) >>> 0;
      const networkIp = [
        (networkNum >>> 24) & 0xff,
        (networkNum >>> 16) & 0xff,
        (networkNum >>> 8) & 0xff,
        networkNum & 0xff,
      ].join(".");

      // Get the actual interface name from network options (same as when adding)
      const selectedInterfaceForIface = networkOptions.find(
        (o) => o.value === portLabel,
      );
      let iface = "eth0"; // default fallback
      if (selectedInterfaceForIface && selectedInterfaceForIface.iface) {
        // Use the actual interface name from the selected option (this will be the real name like tun0, tap0, vpn_vpn, etc.)
        iface = selectedInterfaceForIface.iface;
      } else {
        // Fallback to label-based mapping
        const low = portLabel.toLowerCase();
        if (low.startsWith("lan 1")) iface = "eth0";
        else if (low.startsWith("lan 2")) iface = "eth1";
        else if (low.startsWith("vpn")) {
          // For VPN, try to extract interface name from label if available, otherwise default to tun0
          // Label format might be "VPN:IP (interface_name)" or just "VPN:IP"
          const match = portLabel.match(/\(([^)]+)\)/);
          iface = match ? match[1] : "tun0";
        } else if (low.startsWith("vlan")) iface = "vlan0";
      }

      // Get gateway - prioritize saved gateway from row data, then from interface info
      const selectedInterface = networkOptions.find(
        (o) => o.value === portLabel,
      );
      // Detect VPN interface: check if label starts with VPN or iface name is tun*/tap*/vpn*
      const isVpnInterface =
        portLabel.toLowerCase().startsWith("vpn") ||
        (iface &&
          (iface.startsWith("tun") ||
            iface.startsWith("tap") ||
            iface.includes("vpn")));
      // Priority 1: Use gateway from saved row data (user entered manually)
      let gateway = String(row.gateway || "").trim() || null;

      // Priority 2: If no saved gateway, get from interface info
      if (!gateway && selectedInterface && selectedInterface.gateway) {
        gateway = selectedInterface.gateway;
      }

      // Build delete command matching the exact format used when adding
      let routeTarget;
      if (isVpnInterface) {
        // VPN routes may use gateway (especially for SoftEther vpn_vpn)
        // Try both with and without gateway to ensure deletion
        if (gateway) {
          routeTarget = `${networkIp}/${pfx} via ${gateway} dev ${iface}`;
        } else {
          routeTarget = `${networkIp}/${pfx} dev ${iface}`;
        }
      } else if (gateway) {
        routeTarget = `${networkIp}/${pfx} via ${gateway} dev ${iface}`;
      } else {
        routeTarget = `${networkIp}/${pfx} dev ${iface}`;
      }

      // Try multiple delete formats to ensure route is removed
      // For VPN interfaces, try both with and without gateway since they might have been added either way
      const deleteCmds = [
        `ip route delete ${routeTarget}`,
        `ip route del ${routeTarget}`,
        // Also try without gateway in case it was added differently (or vice versa)
        gateway && isVpnInterface
          ? `ip route delete ${networkIp}/${pfx} dev ${iface}`
          : null,
        gateway && isVpnInterface
          ? `ip route del ${networkIp}/${pfx} dev ${iface}`
          : null,
        !gateway && isVpnInterface && selectedInterface?.gateway
          ? `ip route delete ${networkIp}/${pfx} via ${selectedInterface.gateway} dev ${iface}`
          : null,
        !gateway && isVpnInterface && selectedInterface?.gateway
          ? `ip route del ${networkIp}/${pfx} via ${selectedInterface.gateway} dev ${iface}`
          : null,
      ].filter(Boolean);

      // Try each delete command until one succeeds
      for (const cmd of deleteCmds) {
        try {
          await postLinuxCmd({ cmd: `${cmd} 2>/dev/null || true` });
          // If we get here, the command executed (even if route didn't exist)
          break;
        } catch (e) {
          // Continue to next format
          continue;
        }
      }
    });

    Promise.allSettled(deletePromises)
      .then(async () => {
        const remainingRowsRaw = rows.filter(
          (_, idx) => !itemsToDelete.some((i) => i.idx === idx),
        );
        const remainingRows = normalizeRows(remainingRowsRaw);
        setRows(remainingRows);

        // Update persistent config file with remaining routes
        await saveRoutesToFile(remainingRows, networkOptions);
        showToast(
          IP_ROUTING_TABLE_MSG_DELETED(itemsToDelete.length),
          "success",
        );
      })
      .finally(() => {
        setSavingRoute(false);
      });
  };

  const handleClearAll = () => {
    if (rows.length === 0 || savingRoute) return;

    const isConfirmed = window.confirm(IP_ROUTING_TABLE_CONFIRM_CLEAR_ALL);
    if (!isConfirmed) return;

    setSavingRoute(true);
    const maskToPrefix = (m) => {
      const parts = String(m || "")
        .split(".")
        .map((n) => parseInt(n, 10));
      if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255))
        return null;
      const bits = parts.map((n) => n.toString(2).padStart(8, "0")).join("");
      if (!/^1*0*$/.test(bits)) return null;
      return bits.indexOf("0") === -1 ? 32 : bits.indexOf("0");
    };
    const ipToNumber = (ip) => {
      const parts = ip.split(".").map((n) => parseInt(n, 10));
      if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255))
        return null;
      return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    };

    const deletePromises = rows.map(async (r) => {
      const dest = String(r.destination || "").trim();
      const mask = String(r.subnetMask || "").trim();
      const portLabel = String(r.networkPort || "").trim();

      if (!dest || !mask || !portLabel) return;

      const pfx = maskToPrefix(mask);
      if (pfx === null) return;

      // Calculate network address (same as when adding)
      const destNum = ipToNumber(dest);
      if (destNum === null) return;

      const networkMask = pfx === 32 ? 0xffffffff : (~0 >>> 0) << (32 - pfx);
      const networkNum = (destNum & networkMask) >>> 0;
      const networkIp = [
        (networkNum >>> 24) & 0xff,
        (networkNum >>> 16) & 0xff,
        (networkNum >>> 8) & 0xff,
        networkNum & 0xff,
      ].join(".");

      // Get the actual interface name from network options (same as when adding)
      const selectedInterfaceForIface = networkOptions.find(
        (o) => o.value === portLabel,
      );
      let iface = "eth0"; // default fallback
      if (selectedInterfaceForIface && selectedInterfaceForIface.iface) {
        // Use the actual interface name from the selected option (this will be the real name like tun0, tap0, vpn_vpn, etc.)
        iface = selectedInterfaceForIface.iface;
      } else {
        // Fallback to label-based mapping
        const low = portLabel.toLowerCase();
        if (low.startsWith("lan 1")) iface = "eth0";
        else if (low.startsWith("lan 2")) iface = "eth1";
        else if (low.startsWith("vpn")) {
          // For VPN, try to extract interface name from label if available, otherwise default to tun0
          // Label format might be "VPN:IP (interface_name)" or just "VPN:IP"
          const match = portLabel.match(/\(([^)]+)\)/);
          iface = match ? match[1] : "tun0";
        } else if (low.startsWith("vlan")) iface = "vlan0";
      }

      // Get gateway from interface (same logic as when adding)
      const selectedInterface = networkOptions.find(
        (o) => o.value === portLabel,
      );
      // Detect VPN interface: check if label starts with VPN or iface name is tun*/tap*/vpn*
      const isVpnInterface =
        portLabel.toLowerCase().startsWith("vpn") ||
        (iface &&
          (iface.startsWith("tun") ||
            iface.startsWith("tap") ||
            iface.includes("vpn")));
      // Priority 1: Use gateway from saved row data (user entered manually)
      let gateway = String(r.gateway || "").trim() || null;

      // Priority 2: If no saved gateway, get from interface info
      if (!gateway && selectedInterface && selectedInterface.gateway) {
        gateway = selectedInterface.gateway;
      }

      // Build delete command matching the exact format used when adding
      let routeTarget;
      if (isVpnInterface) {
        // VPN routes may use gateway (especially for SoftEther vpn_vpn)
        // Try both with and without gateway to ensure deletion
        if (gateway) {
          routeTarget = `${networkIp}/${pfx} via ${gateway} dev ${iface}`;
        } else {
          routeTarget = `${networkIp}/${pfx} dev ${iface}`;
        }
      } else if (gateway) {
        routeTarget = `${networkIp}/${pfx} via ${gateway} dev ${iface}`;
      } else {
        routeTarget = `${networkIp}/${pfx} dev ${iface}`;
      }

      // Try multiple delete formats to ensure route is removed
      // For VPN interfaces, try both with and without gateway since they might have been added either way
      const deleteCmds = [
        `ip route delete ${routeTarget}`,
        `ip route del ${routeTarget}`,
        // Also try without gateway in case it was added differently (or vice versa)
        gateway && isVpnInterface
          ? `ip route delete ${networkIp}/${pfx} dev ${iface}`
          : null,
        gateway && isVpnInterface
          ? `ip route del ${networkIp}/${pfx} dev ${iface}`
          : null,
        !gateway && isVpnInterface && selectedInterface?.gateway
          ? `ip route delete ${networkIp}/${pfx} via ${selectedInterface.gateway} dev ${iface}`
          : null,
        !gateway && isVpnInterface && selectedInterface?.gateway
          ? `ip route del ${networkIp}/${pfx} via ${selectedInterface.gateway} dev ${iface}`
          : null,
      ].filter(Boolean);

      // Try each delete command until one succeeds
      for (const cmd of deleteCmds) {
        try {
          await postLinuxCmd({ cmd: `${cmd} 2>/dev/null || true` });
          // If we get here, the command executed (even if route didn't exist)
          break;
        } catch (e) {
          // Continue to next format
          continue;
        }
      }
    });

    Promise.allSettled(deletePromises)
      .then(async () => {
        const cleared = normalizeRows([]);
        setRows(cleared);
        // Update persistent config file (empty)
        await saveRoutesToFile(cleared, networkOptions);
        showToast(IP_ROUTING_TABLE_MSG_CLEARED, "success");
      })
      .finally(() => {
        setSavingRoute(false);
      });
  };

  const loadNetworkOptions = async (isEditing = false) => {
    try {
      setNetworkLoading(true);
      const netData = await fetchNetwork();
      const allIfaces = netData?.data?.interfaces || [];

      // Physical LAN interfaces only (eth* or enp*s*)
      const lanIfaces = allIfaces.filter((i) => {
        const name = (i.interface || "").toLowerCase();
        return /^eth\d+$/.test(name) || /^enp\d+s\d+/.test(name);
      });

      const options = lanIfaces
        .map((iface, idx) => ({
          value: `Lan ${idx + 1}:${iface.ipAddress || ""}`,
          label: `Lan ${idx + 1}:${iface.ipAddress || ""}`,
          iface: iface.interface,
          ip: iface.ipAddress || "",
          mask: iface.subnetMask || "",
          gateway: iface.activeGateway || iface.configuredGateway || "",
        }))
        .filter((o) => o.ip);

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
            value: `VPN (${iface.interface}):${iface.ipAddress}`,
            label: `VPN (${iface.interface}):${iface.ipAddress}`,
            iface: iface.interface,
            ip: iface.ipAddress || "",
            mask: iface.subnetMask || "",
            gateway: iface.activeGateway || iface.configuredGateway || "",
          });
        }
      }

      const fallback =
        IP_ROUTING_TABLE_MODAL_FIELDS.find((f) => f.key === "networkPort")
          ?.options || [];

      setNetworkOptions(options.length > 0 ? options : fallback);

      // Auto-select: prefer Lan 1, otherwise first available
      const preferred = (options[0] && options[0].value) || "";
      if (!isEditing && preferred) {
        setForm((prev) => ({ ...prev, networkPort: preferred }));
      } else if (
        isEditing &&
        options.length > 0 &&
        !options.some((o) => o.value === form.networkPort)
      ) {
        setForm((prev) => ({ ...prev, networkPort: preferred }));
      }
    } catch (e) {
      console.warn("Failed to load network interfaces for Network Port:", e);
      setNetworkOptions(
        IP_ROUTING_TABLE_MODAL_FIELDS.find((f) => f.key === "networkPort")
          ?.options || [],
      );
    } finally {
      setNetworkLoading(false);
    }
  };

  // Also attempt to load options on mount so dropdown is ready on first open
  useEffect(() => {
    loadNetworkOptions(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <IpRouteTableScrollbarStyles />
      <div
        className={IP_ROUTE_TABLE_SCROLL_CLASS}
        style={{
          ...ipRoutePageWrapStyle,
          ...(isCompact ? { padding: 8 } : {}),
        }}
        data-native-scroll
      >
      <div style={ipRoutePageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={ipRouteFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        {savingRoute && modalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: 8,
                boxShadow:
                  "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                pointerEvents: "auto",
                minWidth: 260,
              }}
            >
              <CircularProgress size={28} style={{ color: C.accent }} />
              <div
                style={{ fontSize: 13, fontWeight: 600, color: C.valueText }}
              >
                {IP_ROUTING_TABLE_LOADING_TITLE}
              </div>
              <div style={{ fontSize: 11, color: C.mutedText }}>
                {IP_ROUTING_TABLE_LOADING_SUBTITLE}
              </div>
            </div>
          </div>
        )}

        <IpRouteTableBreadcrumb />

        <div style={ipRouteCardStyle}>
          <div
            style={{
              ...ipRouteToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: 1,
                minWidth: 0,
              }}
            >
              {selectedCount > 0 && (
                <span style={ipRouteSelectedBadgeStyle}>
                  {selectedCount} {IP_ROUTING_TABLE_SELECTED_SUFFIX}
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={!rows.some((r) => r.checked) || savingRoute}
                style={ipRouteCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {savingRoute ? IP_ROUTING_TABLE_BTN_WORKING : IP_ROUTING_TABLE_BTN_DELETE}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rows.length === 0 || savingRoute}
                style={ipRouteCancelBtnStyle}
              >
                {savingRoute ? IP_ROUTING_TABLE_BTN_WORKING : IP_ROUTING_TABLE_BTN_CLEAR_ALL}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => openModal(null)}
                disabled={savingRoute}
                style={ipRoutePrimaryBtnStyle}
              >
                {IP_ROUTING_TABLE_BTN_ADD_NEW}
              </Btn>
            </div>
          </div>

          {rows.length === 0 ? (
            <IpRouteTableEmptyState
              message={IP_ROUTING_TABLE_EMPTY_MESSAGE}
              onAddNew={() => openModal(null)}
              disabled={savingRoute}
            />
          ) : (
            <>
              <div
                className={IP_ROUTE_TABLE_SCROLL_CLASS}
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  flex: 1,
                }}
                ref={tableScrollRef}
                onScroll={handleTableScroll}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                    minWidth: 900,
                  }}
                >
                  <thead>
                    <tr>
                      {IP_ROUTING_TABLE_COLUMNS.map((col) => {
                        if (col.key === "checked") {
                          return (
                            <TH
                              key={col.key}
                              style={{
                                width: 40,
                                padding: 0,
                                borderLeft: "none",
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={
                                  rows.length > 0 &&
                                  rows.every((r) => r.checked)
                                }
                                indeterminate={
                                  rows.some((r) => r.checked) &&
                                  !rows.every((r) => r.checked)
                                }
                                onChange={handleSelectAll}
                                sx={ipRouteTableCheckboxSx}
                              />
                            </TH>
                          );
                        }
                        if (col.key === "modify") {
                          return (
                            <TH
                              key={col.key}
                              style={{ width: 70, borderRight: "none" }}
                            >
                              {col.label}
                            </TH>
                          );
                        }
                        return <TH key={col.key}>{col.label}</TH>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const isLastRow = idx === rows.length - 1;
                      const isRowChecked = row.checked || false;
                      const rowBg = getIpRouteRowBg(isRowChecked, idx);
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};

                      return (
                        <tr
                          key={`row-${row.no ?? idx}`}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isRowChecked)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isRowChecked)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={getIpRouteTdStyle(rowBg, lastRowCellStyle, {
                              width: 36,
                              borderLeft: "none",
                            })}
                          >
                            <Checkbox
                              size="small"
                              checked={isRowChecked}
                              onChange={() => handleCheck(idx)}
                              sx={ipRouteTableCheckboxSx}
                            />
                          </td>
                          <td
                            style={getIpRouteTdStyle(
                              rowBg,
                              lastRowCellStyle,
                            )}
                          >
                            {row.no}
                          </td>
                          <td
                            style={getIpRouteTdStyle(
                              rowBg,
                              lastRowCellStyle,
                            )}
                          >
                            {row.destination}
                          </td>
                          <td
                            style={getIpRouteTdStyle(
                              rowBg,
                              lastRowCellStyle,
                            )}
                          >
                            {row.subnetMask}
                          </td>
                          <td
                            style={getIpRouteTdStyle(
                              rowBg,
                              lastRowCellStyle,
                            )}
                          >
                            {row.networkPort}
                          </td>
                          <td
                            style={getIpRouteTdStyle(rowBg, lastRowCellStyle, {
                              borderRight: "none",
                            })}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <IpRouteTableEditIcon
                                disabled={savingRoute}
                                onClick={() => openModal(idx)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={ipRoutePaginationStyle}>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  {IP_ROUTING_TABLE_PAGINATION_SHOWING(
                    rows.length,
                    IP_ROUTING_TABLE_RECORD_LABEL,
                  )}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => {
          if (!savingRoute) closeModal();
        }}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{
          sx: {
            width: 600,
            maxWidth: "96vw",
            mx: "auto",
            p: 0,
            borderRadius: "8px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: 16,
            padding: "16px 24px",
            textAlign: "center",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          {editIndex !== null
            ? IP_ROUTING_TABLE_MODAL_EDIT_TITLE
            : IP_ROUTING_TABLE_MODAL_ADD_TITLE}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
              marginTop: 0,
            }}
          >
            {modalFormFields.map((field) => (
              <div key={field.key} style={ipRouteModalFieldRowStyle}>
                <div
                  style={{
                    width: 170,
                    flexShrink: 0,
                    textAlign: "left",
                  }}
                >
                  <IpRouteFieldLabel tooltipKey={field.key}>
                    {field.label}:
                  </IpRouteFieldLabel>
                </div>
                <div style={ipRouteModalFieldControlStyle}>
                  {field.type === "text" || field.type === "number" ? (
                    <input
                      name={field.key}
                      type={field.key === "gateway" ? "text" : field.type}
                      value={form[field.key] || ""}
                      onChange={handleFormChange}
                      placeholder={field.placeholder || ""}
                      style={ipRouteModalFieldInputStyle}
                      {...ipRouteModalInputInteraction}
                    />
                  ) : null}
                  {field.type === "select" ? (
                    <Select
                      name={field.key}
                      value={
                        field.key === "networkPort" && form[field.key]
                          ? networkOptions.some(
                              (o) => o.value === form[field.key],
                            )
                            ? form[field.key]
                            : ""
                          : form[field.key] || ""
                      }
                      onChange={handleFormChange}
                      fullWidth
                      sx={{
                        ...ipRouteModalSelectSx,
                        borderRadius: "6px",
                        fontSize: 13,
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: { maxHeight: 200, overflow: "auto" },
                        },
                      }}
                    >
                      {field.key === "networkPort" && networkLoading && (
                        <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                          {IP_ROUTING_TABLE_NETWORK_LOADING}
                        </MenuItem>
                      )}
                      {(field.key === "networkPort"
                        ? networkOptions
                        : field.options
                      ).map((opt) => (
                        <MenuItem
                          key={opt.value}
                          value={opt.value}
                          sx={{ fontSize: 13 }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={savingRoute}
            style={addNewModalFooterBtnStyle}
          >
            {savingRoute ? IP_ROUTING_TABLE_BTN_APPLYING : IP_ROUTING_TABLE_BTN_SAVE}
          </Btn>
          <Btn
            variant="cancel"
            onClick={closeModal}
            disabled={savingRoute}
            style={ipRouteModalCancelBtnStyle}
          >
            {IP_ROUTING_TABLE_BTN_CLOSE}
          </Btn>
        </DialogActions>
      </Dialog>
      </div>
    </>
  );
};

export default IPRoutingTable;
