import React, { useState, useRef, useEffect, useMemo } from "react";
import { Tooltip, useMediaQuery } from "@mui/material";
import {
  SIP_TRUNK_FIELDS,
  SIP_TRUNK_INITIAL_FORM,
  SIP_TRUNK_TABLE_COLUMNS,
  TRUNK_CODEC_OPTIONS,
  GLOBAL_SIP_PAGE_BREADCRUMB_ROOT,
  GLOBAL_SIP_PAGE_BREADCRUMB_SECTION,
  GLOBAL_SIP_PAGE_TITLE,
  GLOBAL_SIP_BTN_DELETE,
  GLOBAL_SIP_BTN_CLEAR_ALL,
  GLOBAL_SIP_BTN_ADD_NEW,
  GLOBAL_SIP_BTN_PREV,
  GLOBAL_SIP_BTN_NEXT,
  GLOBAL_SIP_BTN_SAVE,
  GLOBAL_SIP_BTN_SAVING,
  GLOBAL_SIP_BTN_CLOSE,
  GLOBAL_SIP_BTN_WORKING,
  GLOBAL_SIP_MODAL_ADD_TITLE,
  GLOBAL_SIP_MODAL_EDIT_TITLE,
  GLOBAL_SIP_COL_MODIFY,
  GLOBAL_SIP_EMPTY_MESSAGE,
  GLOBAL_SIP_RECORD_LABEL,
  GLOBAL_SIP_SELECTED_SUFFIX,
  GLOBAL_SIP_EDIT_TITLE_ACCESS,
  GLOBAL_SIP_TOOLTIP_DELETE,
  GLOBAL_SIP_FIELD_TOOLTIPS,
  GLOBAL_SIP_FORM_LAYOUT,
  GLOBAL_SIP_PLACEHOLDER_PASSWORD,
  GLOBAL_SIP_PLACEHOLDER_ENTER,
  GLOBAL_SIP_MSG_SELECT_TO_DELETE,
  GLOBAL_SIP_MSG_NO_TRUNKS_TO_CLEAR,
  GLOBAL_SIP_CONFIRM_DELETE,
  GLOBAL_SIP_CONFIRM_CLEAR_ALL,
  GLOBAL_SIP_MSG_DELETED,
  GLOBAL_SIP_MSG_DELETED_ALL,
  GLOBAL_SIP_MSG_SAVE_RESTART,
  GLOBAL_SIP_PAGINATION_SHOWING,
  GLOBAL_SIP_PAGINATION_PAGE_OF,
} from "../../../constants/SipTrunkConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  listGlobalSipSettings,
  createGlobalSipSettings,
  updateGlobalSipSettings,
  deleteGlobalSipSettings,
  fetchNetwork,
} from "../../../api/apiService";

// ── Local page UI (aligned with SipToSipAccountPage) ──
const GLOBAL_SIP_COMPACT_MQ = "(max-width: 768px)";
const GLOBAL_SIP_SCROLL_CLASS = "global-sip-scroll";

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
  amber: "#dc2626",
  errorRed: "#dc2626",
};

const SIP_TRUNK_TABLE_CARD_RADIUS = 10;

const systemSettingsTdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const SystemSettingsTH = ({ children, style: extra }) => (
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

const SystemSettingsBtn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
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
      fontWeight: 600,
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
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
      {startIcon && (
        <span style={{ display: "flex", alignItems: "center" }}>
          {startIcon}
        </span>
      )}
      {children}
    </button>
  );
};

const systemSettingsCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const systemSettingsSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const systemSettingsFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const systemSettingsPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const systemSettingsInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const systemSettingsCardStyle = {
  background: "#ffffff",
  borderRadius: SIP_TRUNK_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const systemSettingsToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: SIP_TRUNK_TABLE_CARD_RADIUS,
  borderTopRightRadius: SIP_TRUNK_TABLE_CARD_RADIUS,
};

const systemSettingsPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: SIP_TRUNK_TABLE_CARD_RADIUS,
  borderBottomRightRadius: SIP_TRUNK_TABLE_CARD_RADIUS,
  overflow: "hidden",
  flexWrap: "wrap",
  gap: 8,
};

const systemSettingsPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const systemSettingsCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const systemSettingsPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const systemSettingsModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const SystemSettingsBreadcrumb = () => (
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
    <span>{GLOBAL_SIP_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{GLOBAL_SIP_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {GLOBAL_SIP_PAGE_TITLE}
    </span>
  </div>
);

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

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
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const { height: _nh, ...nativeFieldBase } = {
  height: 32,
  width: 200,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 6,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const systemModalFieldInputStyle = {
  ...nativeFieldBase,
  minHeight: 32,
  height: 32,
  width: "100%",
  padding: "0 10px",
  lineHeight: 1.35,
};

const sipTrunkOutlinedInputRootSx = {
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

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": sipTrunkOutlinedInputRootSx,
  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
    fontSize: 13,
    padding: "8px 12px",
  },
};

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
        padding: "10px 12px",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

const GlobalSipFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = tooltipKey ? GLOBAL_SIP_FIELD_TOOLTIPS[tooltipKey] || "" : "";
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
    <Tooltip title={tooltip} {...tooltipProps}>
      {labelNode}
    </Tooltip>
  );
};

const GlobalSipScrollbarStyles = () => (
  <style>{`
    .${GLOBAL_SIP_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${GLOBAL_SIP_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${GLOBAL_SIP_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${GLOBAL_SIP_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${GLOBAL_SIP_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${GLOBAL_SIP_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${GLOBAL_SIP_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...sipTrunkOutlinedInputRootSx,
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

const modalSelectSx = {
  ...muiSelectSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "#fff",
  },
};

const systemModalSelectSx = {
  ...modalSelectSx,
  height: 36,
  "& .MuiOutlinedInput-root": { height: 36 },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
};

const localIpSelectSx = {
  ...systemModalSelectSx,
  width: "100%",
  maxWidth: 320,
  "& .MuiSelect-select": {
    ...systemModalSelectSx["& .MuiSelect-select"],
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "block",
    maxWidth: "100%",
  },
};

const modalFieldControlStyle = {
  width: 320,
  maxWidth: "100%",
  minWidth: 0,
  flexShrink: 0,
};

const modalFieldRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  maxWidth: 502,
  margin: "0 auto",
};

const getLocalIpDisplayLabel = (option, fallback = "") => {
  if (!option) return fallback;
  return option.shortLabel || option.label || fallback;
};

const buildLanIpv4Option = (idx, ipAddress) => ({
  value: ipAddress || `lan${idx + 1}-unavailable`,
  label: ipAddress
    ? `LAN ${idx + 1} (${ipAddress})`
    : `LAN ${idx + 1} (Unavailable)`,
  shortLabel: ipAddress
    ? `LAN ${idx + 1} (${ipAddress})`
    : `LAN ${idx + 1} (Unavailable)`,
  disabled: !ipAddress,
});

const buildLanIpv6Option = (idx, ipv6) => ({
  value: ipv6,
  label: `LAN ${idx + 1} IPv6 (${ipv6})`,
  shortLabel: `LAN ${idx + 1} IPv6`,
  title: ipv6,
});
const SipTrunkPage = () => {
  const isCompact = useMediaQuery(GLOBAL_SIP_COMPACT_MQ);
  // State
  const [registers, setRegisters] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(SIP_TRUNK_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [localIpOptions, setLocalIpOptions] = useState([
    { value: "lan1-unavailable", label: "LAN 1 (Unavailable)", disabled: true },
    { value: "lan2-unavailable", label: "LAN 2 (Unavailable)", disabled: true },
    { value: "0.0.0.0", label: "Any LAN (0.0.0.0)" },
  ]);

  const tableScrollRef = useRef(null);

  const fieldByName = useMemo(
    () =>
      SIP_TRUNK_FIELDS.reduce((acc, field) => {
        acc[field.name] = field;
        return acc;
      }, {}),
    [],
  );

  const modalFormFields = useMemo(() => {
    const names = GLOBAL_SIP_FORM_LAYOUT.flat();
    return names
      .map((name) => fieldByName[name])
      .filter(Boolean);
  }, [fieldByName]);
  const buildFormStateFromSettings = (settings = {}) => {
    const base = { ...SIP_TRUNK_INITIAL_FORM };
    if (settings.id !== undefined && settings.id !== null) {
      base.index = String(settings.id);
    }
    if (settings.description) {
      base.description =
        String(settings.description).trim() || base.description;
    }
    if (settings.local_ip !== undefined) {
      base.local_ip = String(settings.local_ip).trim();
    }
    if (settings.local_port !== undefined) {
      base.local_port = String(settings.local_port);
    }
    if (settings.transport_mode) {
      base.transport_mode = String(settings.transport_mode).toUpperCase();
    }
    base.local_ip = base.local_ip || SIP_TRUNK_INITIAL_FORM.local_ip;
    base.local_port = base.local_port || SIP_TRUNK_INITIAL_FORM.local_port;
    base.transport_mode =
      base.transport_mode || SIP_TRUNK_INITIAL_FORM.transport_mode;

    return base;
  };

  const renderCellValue = (colKey, row) => {
    if (colKey === "index") return null;
    const field = fieldByName[colKey];
    const raw = row[colKey];
    if (raw === undefined || raw === null || raw === "") return "--";
    if (colKey === "local_ip") {
      const match = localIpOptions.find((option) => option.value === raw);
      if (match) return getLocalIpDisplayLabel(match, raw);
    }
    if (field?.type === "select" && Array.isArray(field.options)) {
      const match = field.options.find((option) => option.value === raw);
      return match ? match.label : raw;
    }
    return raw;
  };

  // Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(registers.length / itemsPerPage));
  const pagedRegisters = registers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const fetchGlobalSipSettings = async () => {
    try {
      setLoading((prev) => ({ ...prev, fetch: true }));
      const payload = await listGlobalSipSettings();
      const list = payload?.message?.sip_settings;
      if (Array.isArray(list) && list.length > 0) {
        const rows = list.map((s) => ({
          ...buildFormStateFromSettings(s),
          id: s.id,
        }));
        setRegisters(rows);
      } else {
        setRegisters([]);
      }
    } catch (error) {
      console.error("Failed to fetch global SIP settings", error);
      setRegisters([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      fetchGlobalSipSettings();
      const loadLocalIps = async () => {
        try {
          const netData = await fetchNetwork();
          const allIfaces = netData?.data?.interfaces || [];

          // Keep only physical LAN interfaces (eth0/eth1 or enp*s*)
          const lanIfaces = allIfaces.filter((i) => {
            const name = (i.interface || "").toLowerCase();
            return /^eth\d+$/.test(name) || /^enp\d+s\d+/.test(name);
          });

          const orderedOptions = [];
          lanIfaces.forEach((iface, idx) => {
            orderedOptions.push(
              buildLanIpv4Option(idx, iface.ipAddress),
            );
            const ipv6 =
              iface.ipv6Address || iface.ipv6 || iface.ipv6_address || "";
            if (ipv6) {
              orderedOptions.push(buildLanIpv6Option(idx, ipv6));
            }
          });

          orderedOptions.push({ value: "0.0.0.0", label: "Any LAN (0.0.0.0)" });

          // Keep current form value selectable even if not in the list
          if (
            form.local_ip &&
            !orderedOptions.some((opt) => opt.value === form.local_ip)
          ) {
            orderedOptions.unshift({
              value: form.local_ip,
              label: form.local_ip,
            });
          }

          setLocalIpOptions(orderedOptions);
        } catch (error) {
          console.warn("Failed to load network interfaces for Local IP", error);
          setLocalIpOptions([
            {
              value: "lan1-unavailable",
              label: "LAN 1 (Unavailable)",
              disabled: true,
            },
            {
              value: "lan2-unavailable",
              label: "LAN 2 (Unavailable)",
              disabled: true,
            },
            { value: "0.0.0.0", label: "Any LAN (0.0.0.0)" },
          ]);
        }
      };
      loadLocalIps();
    }
  }, []);

  useEffect(() => {
    if (!form.local_ip) return;
    setLocalIpOptions((prev) => {
      if (prev.some((opt) => opt.value === form.local_ip)) return prev;
      return [...prev, { value: form.local_ip, label: form.local_ip }];
    });
  }, [form.local_ip]);

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Modal logic
  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      setForm(buildFormStateFromSettings(row));
      setEditIndex(idx);
    } else {
      setForm({ ...SIP_TRUNK_INITIAL_FORM });
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setShowPassword(false);
    setValidationErrors({});
  };

  // Form handling
  const handleChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      return next;
    });

    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleCodecChange = (codec, checked) => {
    setForm((prev) => {
      const currentCodecs = prev.allow_codecs
        ? prev.allow_codecs.split(",").map((c) => c.trim())
        : [];
      let newCodecs;

      if (checked) {
        // Add codec if not already present
        if (!currentCodecs.includes(codec)) {
          newCodecs = [...currentCodecs, codec];
        } else {
          newCodecs = currentCodecs;
        }
      } else {
        // Remove codec
        newCodecs = currentCodecs.filter((c) => c !== codec);
      }

      return { ...prev, allow_codecs: newCodecs.join(",") };
    });
  };

  const isCodecSelected = (codec) => {
    if (!form.allow_codecs) return false;
    const currentCodecs = form.allow_codecs.split(",").map((c) => c.trim());
    return currentCodecs.includes(codec);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSave = async () => {
    setLoading((prev) => ({ ...prev, save: true }));

    const safeTrim = (val, fallback = "") => {
      const value = val === undefined || val === null ? fallback : val;
      return String(value).trim();
    };

    const resolveLocalIp = () => {
      const current = safeTrim(form.local_ip, "0.0.0.0");
      if (current === "lan1-unavailable" || current === "lan2-unavailable") {
        return current === "lan1-unavailable"
          ? localIpOptions.find(
              (opt) => opt.label?.includes("LAN 1") && !opt.disabled,
            )?.value || "0.0.0.0"
          : localIpOptions.find(
              (opt) => opt.label?.includes("LAN 2") && !opt.disabled,
            )?.value || "0.0.0.0";
      }
      return current || "0.0.0.0";
    };

    const isEditing = editIndex !== null;
    const settingsPayload = {
      ...(isEditing ? { id: Number(form.index) } : {}),
      description: safeTrim(form.description) || undefined,
      local_ip: resolveLocalIp(),
      local_port: safeTrim(form.local_port, "5060") || "5060",
      transport_mode:
        safeTrim(form.transport_mode, "UDP").toUpperCase() || "UDP",
    };

    try {
      const fn = isEditing ? updateGlobalSipSettings : createGlobalSipSettings;
      const response = await fn(settingsPayload);
      if (response?.response) {
        showMessage(
          "success",
          `${response?.message || (isEditing ? "Entry updated" : "Entry created")}. ${GLOBAL_SIP_MSG_SAVE_RESTART}`,
        );
        await fetchGlobalSipSettings();
        setShowModal(false);
        setEditIndex(null);
      } else {
        showMessage("error", response?.message || "Save failed");
      }
    } catch (error) {
      showMessage("error", error?.message || "Failed to save settings");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // Table selection logic
  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(registers.map((_, idx) => idx));
    } else {
      setSelected([]);
    }
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("error", GLOBAL_SIP_MSG_SELECT_TO_DELETE);
      return;
    }
    if (!window.confirm(GLOBAL_SIP_CONFIRM_DELETE(selected.length))) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      for (const realIdx of selected) {
        const row = registers[realIdx];
        if (row?.id != null) await deleteGlobalSipSettings(row.id);
      }
      showMessage("success", GLOBAL_SIP_MSG_DELETED(selected.length));
      setSelected([]);
      await fetchGlobalSipSettings();
    } catch (error) {
      showMessage("error", error?.message || "Delete failed");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (registers.length === 0) {
      showMessage("info", GLOBAL_SIP_MSG_NO_TRUNKS_TO_CLEAR);
      return;
    }
    if (!window.confirm(GLOBAL_SIP_CONFIRM_CLEAR_ALL)) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const totalCount = registers.length;
      for (const row of registers) {
        if (row?.id != null) await deleteGlobalSipSettings(row.id);
      }
      setSelected([]);
      setPage(1);
      await fetchGlobalSipSettings();
      showMessage("success", GLOBAL_SIP_MSG_DELETED_ALL(totalCount));
    } catch (error) {
      showMessage("error", error?.message || "Failed to clear all trunks");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  const pagedStart = (page - 1) * itemsPerPage;

  return (
    <>
      <GlobalSipScrollbarStyles />
      <div
        className={GLOBAL_SIP_SCROLL_CLASS}
        style={{
          ...systemSettingsPageWrapStyle,
          ...(isCompact ? { padding: 8 } : {}),
        }}
        data-native-scroll
      >
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          sx={systemSettingsFixedAlertSx}
        >
          {message.text}
        </Alert>
      )}

      <div style={systemSettingsInnerStyle}>
        <SystemSettingsBreadcrumb />

        <div style={systemSettingsCardStyle}>
          <div
            style={{
              ...systemSettingsToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span style={systemSettingsSelectedBadgeStyle}>
                  {selected.length} {GLOBAL_SIP_SELECTED_SUFFIX}
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
              <SystemSettingsBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0 || loading.delete}
                style={systemSettingsCancelBtnStyle}
              >
                <Tooltip title={GLOBAL_SIP_TOOLTIP_DELETE} {...tooltipProps}>
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                </Tooltip>
                {loading.delete ? GLOBAL_SIP_BTN_WORKING : GLOBAL_SIP_BTN_DELETE}
              </SystemSettingsBtn>
              <SystemSettingsBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={registers.length === 0 || loading.delete}
                style={systemSettingsCancelBtnStyle}
              >
                {loading.delete ? GLOBAL_SIP_BTN_WORKING : GLOBAL_SIP_BTN_CLEAR_ALL}
              </SystemSettingsBtn>
              <SystemSettingsBtn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.save}
                style={systemSettingsPrimaryBtnStyle}
              >
                {GLOBAL_SIP_BTN_ADD_NEW}
              </SystemSettingsBtn>
            </div>
          </div>

          <div
            ref={tableScrollRef}
            className={GLOBAL_SIP_SCROLL_CLASS}
            style={
              loading.fetch || registers.length === 0
                ? {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 240,
                    padding: 24,
                    textAlign: "center",
                  }
                : {
                    overflowX: "auto",
                    overflowY: "auto",
                    width: "100%",
                  }
            }
          >
            {loading.fetch ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 48,
                }}
              >
                <CircularProgress size={28} style={{ color: C.accent }} />
              </div>
            ) : registers.length === 0 ? (
              <>
                <div
                  style={{
                    color: "#3E5475",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  {GLOBAL_SIP_EMPTY_MESSAGE}
                </div>
                <SystemSettingsBtn
                  onClick={() => handleOpenModal()}
                  variant="cancel"
                  disabled={loading.save}
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  {GLOBAL_SIP_BTN_ADD_NEW}
                </SystemSettingsBtn>
              </>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    <SystemSettingsTH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={
                          registers.length > 0 &&
                          selected.length === registers.length
                        }
                        indeterminate={
                          selected.length > 0 &&
                          selected.length < registers.length
                        }
                        onChange={handleSelectAll}
                        disabled={loading.delete}
                        sx={systemSettingsCheckboxSx}
                      />
                    </SystemSettingsTH>
                    {SIP_TRUNK_TABLE_COLUMNS.map((col) => (
                      <SystemSettingsTH
                        key={col.key}
                        style={{ position: "sticky", top: 0, zIndex: 10 }}
                      >
                        {col.label}
                      </SystemSettingsTH>
                    ))}
                    <SystemSettingsTH
                      style={{
                        width: 70,
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      {GLOBAL_SIP_COL_MODIFY}
                    </SystemSettingsTH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRegisters.map((reg, idx) => {
                    const realIdx = pagedStart + idx;
                    const isLastRow = idx === pagedRegisters.length - 1;
                    const isRowChecked = selected.includes(realIdx);
                    const rowBg = isRowChecked
                      ? "#eff6ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};

                    return (
                      <tr
                        key={realIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isRowChecked)
                            e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          if (!isRowChecked)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...systemSettingsTdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            width: 36,
                            ...lastRowCellStyle,
                            ...(isLastRow
                              ? {
                                  borderBottomLeftRadius:
                                    SIP_TRUNK_TABLE_CARD_RADIUS,
                                }
                              : {}),
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isRowChecked}
                            onChange={() => handleSelectRow(realIdx)}
                            disabled={loading.delete}
                            sx={systemSettingsCheckboxSx}
                          />
                        </td>
                        {SIP_TRUNK_TABLE_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            style={{
                              ...systemSettingsTdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {col.key === "index"
                              ? pagedStart + idx + 1
                              : renderCellValue(col.key, reg)}
                          </td>
                        ))}
                        <td
                          style={{
                            ...systemSettingsTdStyle,
                            background: rowBg,
                            borderRight: "none",
                            ...lastRowCellStyle,
                            ...(isLastRow
                              ? {
                                  borderBottomRightRadius:
                                    SIP_TRUNK_TABLE_CARD_RADIUS,
                                }
                              : {}),
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <EditDocumentIcon
                              titleAccess={GLOBAL_SIP_EDIT_TITLE_ACCESS}
                              onClick={() =>
                                !loading.delete && handleOpenModal(reg, realIdx)
                              }
                              style={{
                                cursor: loading.delete
                                  ? "not-allowed"
                                  : "pointer",
                                color: "#2563eb",
                                fontSize: 22,
                                opacity: loading.delete ? 0.5 : 0.7,
                                transition: "opacity 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (!loading.delete)
                                  e.currentTarget.style.opacity = "1";
                              }}
                              onMouseLeave={(e) => {
                                if (!loading.delete)
                                  e.currentTarget.style.opacity = "0.7";
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {registers.length > 0 && (
            <div style={systemSettingsPaginationStyle}>
              <span
                style={{ fontSize: 11, color: C.mutedText, lineHeight: 1.2 }}
              >
                {GLOBAL_SIP_PAGINATION_SHOWING(
                  registers.length,
                  GLOBAL_SIP_RECORD_LABEL,
                  page,
                )}
              </span>
              {totalPages > 1 && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <SystemSettingsBtn
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    variant="outline"
                  >
                    {GLOBAL_SIP_BTN_PREV}
                  </SystemSettingsBtn>
                  <span style={systemSettingsPageBadgeStyle}>
                    {GLOBAL_SIP_PAGINATION_PAGE_OF(page, totalPages)}
                  </span>
                  <SystemSettingsBtn
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    variant="outline"
                  >
                    {GLOBAL_SIP_BTN_NEXT}
                  </SystemSettingsBtn>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
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
        disableRestoreFocus
        disableEnforceFocus
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
            ? GLOBAL_SIP_MODAL_EDIT_TITLE
            : GLOBAL_SIP_MODAL_ADD_TITLE}
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
            {modalFormFields.map((field) => {
              const selectOptions =
                field.name === "local_ip"
                  ? localIpOptions
                  : field.options || [];

              return (
                <div
                  key={field.name}
                  style={{
                    ...modalFieldRowStyle,
                    alignItems:
                      field.type === "checkbox" && field.name === "allow_codecs"
                        ? "flex-start"
                        : "center",
                  }}
                >
                  <div
                    style={{
                      width: 170,
                      flexShrink: 0,
                      textAlign: "left",
                    }}
                  >
                    <GlobalSipFieldLabel tooltipKey={field.name}>
                      {field.label}:
                    </GlobalSipFieldLabel>
                  </div>
                  <div style={modalFieldControlStyle}>
                    {field.type === "select" ? (
                      <div className="w-full">
                        <MuiSelect
                          value={form[field.name] || ""}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          displayEmpty
                          fullWidth
                          renderValue={
                            field.name === "local_ip"
                              ? (selected) =>
                                  getLocalIpDisplayLabel(
                                    selectOptions.find(
                                      (option) => option.value === selected,
                                    ),
                                    selected,
                                  )
                              : undefined
                          }
                          sx={{
                            ...(field.name === "local_ip"
                              ? localIpSelectSx
                              : systemModalSelectSx),
                            borderRadius: "6px",
                            fontSize: 13,
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                maxWidth: 360,
                              },
                            },
                          }}
                        >
                          {selectOptions.map((option) => (
                            <MenuItem
                              key={option.value}
                              value={option.value}
                              disabled={option.disabled}
                              title={option.title || option.label}
                              sx={{ fontSize: 13, maxWidth: 360 }}
                            >
                              {field.name === "local_ip" && option.title ? (
                                <div style={{ minWidth: 0, width: "100%" }}>
                                  <div>{option.shortLabel || option.label}</div>
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: "#64748b",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {option.value}
                                  </div>
                                </div>
                              ) : (
                                option.label
                              )}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                        {validationErrors[field.name] && (
                          <div className="text-red-500 text-xs mt-1">
                            {validationErrors[field.name]}
                          </div>
                        )}
                      </div>
                    ) : field.type === "checkbox" ? (
                      field.name === "allow_codecs" ? (
                        <FormGroup row sx={{ gap: 1 }}>
                          {TRUNK_CODEC_OPTIONS.map((codec) => (
                            <FormControlLabel
                              key={codec.value}
                              control={
                                <Checkbox
                                  checked={isCodecSelected(codec.value)}
                                  onChange={(e) =>
                                    handleCodecChange(
                                      codec.value,
                                      e.target.checked,
                                    )
                                  }
                                  size="small"
                                  sx={systemSettingsCheckboxSx}
                                />
                              }
                              label={codec.label}
                              sx={{
                                margin: 0,
                                "& .MuiFormControlLabel-label": {
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: "#374151",
                                },
                              }}
                            />
                          ))}
                        </FormGroup>
                      ) : field.name === "working_period" ? (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={form[field.name] || false}
                            onChange={(e) => {
                              handleChange(field.name, e.target.checked);
                              if (e.target.checked) {
                                handleChange("working_period_text", "24 Hour");
                              } else {
                                handleChange("working_period_text", "");
                              }
                            }}
                            size="small"
                            sx={systemSettingsCheckboxSx}
                          />
                          <input
                            type="text"
                            value={form.working_period_text || ""}
                            onChange={(e) =>
                              handleChange(
                                "working_period_text",
                                e.target.value,
                              )
                            }
                            placeholder="24 Hour"
                            disabled={!form[field.name]}
                            style={{
                              ...systemModalFieldInputStyle,
                              flex: 1,
                              opacity: form[field.name] ? 1 : 0.6,
                            }}
                            {...inputInteraction}
                          />
                        </div>
                      ) : field.name === "sip_agent" ? (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={form[field.name] || false}
                            onChange={(e) =>
                              handleChange(field.name, e.target.checked)
                            }
                            size="small"
                            sx={systemSettingsCheckboxSx}
                          />
                          <span style={{ fontSize: 13, color: C.labelText }}>
                            Enable
                          </span>
                        </div>
                      ) : (
                        <Checkbox
                          checked={form[field.name] || false}
                          onChange={(e) =>
                            handleChange(field.name, e.target.checked)
                          }
                          size="small"
                          sx={systemSettingsCheckboxSx}
                        />
                      )
                    ) : field.type === "password" ? (
                      <div className="w-full">
                        <TextField
                          type={showPassword ? "text" : "password"}
                          value={form[field.name] || ""}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          size="small"
                          fullWidth
                          variant="outlined"
                          error={!!validationErrors[field.name]}
                          placeholder={GLOBAL_SIP_PLACEHOLDER_PASSWORD}
                          inputProps={{
                            style: {
                              ...systemModalFieldInputStyle,
                              padding: "0 8px",
                            },
                          }}
                          sx={{
                            ...muiTextFieldSx,
                            "& .MuiOutlinedInput-root": { height: 32 },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={togglePasswordVisibility}
                                  edge="end"
                                  size="small"
                                  sx={{ padding: "2px" }}
                                >
                                  {showPassword ? (
                                    <VisibilityOff fontSize="small" />
                                  ) : (
                                    <Visibility fontSize="small" />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        {validationErrors[field.name] && (
                          <div className="text-red-500 text-xs mt-1">
                            {validationErrors[field.name]}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full">
                        <input
                          type="text"
                          value={form[field.name] || ""}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          disabled={field.name === "index"}
                          placeholder={GLOBAL_SIP_PLACEHOLDER_ENTER(field.label)}
                          style={{
                            ...systemModalFieldInputStyle,
                            width: "100%",
                            borderColor: validationErrors[field.name]
                              ? "#dc2626"
                              : systemModalFieldInputStyle.border,
                          }}
                          {...inputInteraction}
                        />
                        {validationErrors[field.name] && (
                          <div className="text-red-500 text-xs mt-1">
                            {validationErrors[field.name]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: `1px solid ${C.cardBorder}`,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <SystemSettingsBtn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {loading.save ? GLOBAL_SIP_BTN_SAVING : GLOBAL_SIP_BTN_SAVE}
          </SystemSettingsBtn>
          <SystemSettingsBtn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={systemSettingsModalCancelBtnStyle}
          >
            {GLOBAL_SIP_BTN_CLOSE}
          </SystemSettingsBtn>
        </DialogActions>
      </Dialog>
      </div>
    </>
  );
};

export default SipTrunkPage;
