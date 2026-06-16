import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  sipRegisterFields,
  SIP_REGISTER_INITIAL_FORM,
  CODEC_OPTIONS,
  SIP_REGISTER_COUNTRY_OPTIONS,
  SIP_REGISTER_TRANSPORT_OPTIONS,
  SIP_REGISTER_YES_NO,
  SIP_REGISTER_ETH_PORT_OPTIONS,
  SIP_REGISTER_OUTBOUND_CID_SOURCE_OPTIONS,
  SIP_REGISTER_HEADER_ID_OPTIONS,
  SIP_REGISTER_CONTACT_OPTIONS,
  SIP_REGISTER_DTMF_OPTIONS,
} from "../../../constants/SipRegisterConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Tabs,
  Tab,
  useMediaQuery,
} from "@mui/material";
import {
  fetchSipAccounts,
  listSipTrunks,
  createSipTrunk,
  updateSipTrunk,
  deleteSipTrunk,
  fetchSystemInfo,
} from "../../../api/apiService";
const PBX_COMPACT_MQ = "(max-width: 768px)";

// ── Local page UI (inlined from pbxSharedUi) ──
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
};

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
      color: C.amber,
      border: "0.5px solid #fecaca",
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
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
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
    </Component>
  );
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
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `1px solid ${C.cardBorder}`,
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
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
};

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

const pbxPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pbxPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const PbxBreadcrumb = ({ section, current, style }) => (
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
      ...style,
    }}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);
const TableListLoading = () => (
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
);

const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
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
        marginBottom: showButton && onAddNew ? 16 : 0,
      }}
    >
      {message}
    </div>
    {showButton && onAddNew ? (
      <Btn
        variant="cancel"
        onClick={onAddNew}
        style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

const PBX_MODAL_TAB_BAR_STYLE = {
  borderBottom: "1px solid #e5e7eb",
  background: "#ffffff",
};

const PBX_MODAL_TAB_ACTIVE_COLOR = "#3E5475";
const PBX_MODAL_TAB_INACTIVE_COLOR = "#374151";

const pbxModalTabsSx = {
  minHeight: 45,
  "& .MuiTab-root": {
    color: PBX_MODAL_TAB_INACTIVE_COLOR,
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 45,
  },
  "& .MuiTab-root.Mui-selected": {
    color: PBX_MODAL_TAB_ACTIVE_COLOR,
    fontWeight: 700,
  },
};

const PbxModalTabs = ({ value, onChange, tabs, fullWidth = true }) => (
  <div style={PBX_MODAL_TAB_BAR_STYLE}>
    <Tabs
      value={value}
      onChange={(_, next) => onChange(next)}
      variant={fullWidth ? "fullWidth" : "standard"}
      TabIndicatorProps={{
        style: { backgroundColor: PBX_MODAL_TAB_ACTIVE_COLOR, height: 2 },
      }}
      sx={pbxModalTabsSx}
    >
      {tabs.map((t) => (
        <Tab key={t.id} label={t.label} value={t.id} />
      ))}
    </Tabs>
  </div>
);

const TRUNK_SECTION_HEADING_COLOR = "#30415A";
const TRUNK_FIELD_LABEL_COLOR = "#3E5475";
const PBX_MODAL_SECTION_BG = "#f8fafc";

const TrunkModalSectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: PBX_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: TRUNK_SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
);

const TRUNK_TABLE_SCROLL_CLASS = "trunk-table-scroll";

const trunkTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  maxHeight: 460,
  borderBottom: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

const trunkTableInnerStyle = {
  minWidth: "100%",
  width: "max-content",
  borderBottom: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

const trunkModalPaperSx = {
  width: 900,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const trunkModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const trunkModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  paddingTop: 0,
  paddingBottom: 0,
  boxSizing: "border-box",
};

const trunkModalActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: C.pageBg,
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const trunkModalPrimaryBtnStyle = {
  minWidth: 100,
  height: 33,
  fontSize: 13,
};

const trunkModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const trunkAdaptTextFieldSx = {
  ...muiTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
    fontSize: 12,
  },
  "& .MuiOutlinedInput-input": {
    fontSize: 12,
    padding: "6px 8px",
    "&::placeholder": {
      fontSize: 12,
      opacity: 0.65,
    },
  },
};

const trunkAdaptRowActionBtnSx = {
  border: "1px solid #cbd5e1",
  borderRadius: 1,
  width: 32,
  height: 32,
  padding: 0,
  backgroundColor: "#cbd5e1",
  color: "#374151",
  "&:hover": {
    backgroundColor: "#b6c2d3",
  },
};

const trunkDodCompactInputStyle = {
  height: 28,
  width: "100%",
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 6,
  outline: "none",
  backgroundColor: "#fff",
  color: "#0f172a",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  cursor: "text",
};

const trunkDodToolbarBtnStyle = {
  height: 30,
  fontSize: 12,
  padding: "6px 14px",
  borderRadius: 10,
};

const pbxDualListLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#3E5475",
  textAlign: "center",
  marginBottom: 8,
};

const pbxDualListSelectStyle = {
  width: "100%",
  height: 160,
  border: `1px solid ${C.cardBorder}`,
  background: "#fff",
  borderRadius: 4,
  padding: "4px 8px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  overflowY: "auto",
};

const pbxDualListBtnStyle = {
  height: 36,
  width: "100%",
  border: "1px solid #6b7280",
  backgroundColor: "#d9dde3",
  color: "#111827",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  lineHeight: 1,
  padding: 0,
  margin: 0,
  cursor: "pointer",
  display: "block",
  boxSizing: "border-box",
  textAlign: "center",
};

const PbxDualListBtn = ({ onClick, title, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={pbxDualListBtnStyle}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#c5cbd3";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "#d9dde3";
    }}
  >
    {children}
  </button>
);

const SIP_PCM_TABLE_CARD_RADIUS = 10;

const sipPcmCardStyle = {
  background: "#ffffff",
  borderRadius: SIP_PCM_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const sipPcmToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.cardBorder}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: SIP_PCM_TABLE_CARD_RADIUS,
  borderTopRightRadius: SIP_PCM_TABLE_CARD_RADIUS,
};

const sipPcmPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: SIP_PCM_TABLE_CARD_RADIUS,
  borderBottomRightRadius: SIP_PCM_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const sipPcmSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const sipPcmCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const sipPcmPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const sipPcmPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const SipPcmPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  style,
}) => (
  <div style={{ ...sipPcmPaginationStyle, ...style }}>
    <span style={{ fontSize: 11, color: C.mutedText }}>
      Showing {recordCount} {recordLabel}
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
      >
        ← Prev
      </Btn>
      <span style={sipPcmPageBadgeStyle}>
        Page {page} of {totalPages}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
      >
        Next →
      </Btn>
    </div>
  </div>
);

const DOD_DUAL_LIST_LABEL_OFFSET = 28;

const Pill = ({ text, bg, color }) => (
  <span
    style={{
      background: bg,
      color,
      padding: "4px 8px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.01em",
      whiteSpace: "nowrap",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      maxWidth: "100%",
    }}
  >
    {text}
  </span>
);

const formatSipRegisterStatusLabel = (raw) => {
  const s = String(raw || "").trim();
  if (s.toLowerCase() === "not registering") return "Not registered";
  return s;
};

/** Map backend registration_status strings to text-only pill colors */
const getSipRegisterStatusStyle = (raw) => {
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  if (!s) return { bg: "transparent", color: "#475569" };

  const isFailure =
    s === "unregistered" ||
    s === "not registered" ||
    s === "not registering" ||
    s.startsWith("not regist") ||
    s === "rejected" ||
    s.includes("reject") ||
    s.includes("failed") ||
    s.includes("failure");

  if (isFailure) {
    return { bg: "transparent", color: "#dc2626" };
  }

  if (s === "pending" || s === "registering" || s.includes("pending")) {
    return { bg: "transparent", color: "#d97706" };
  }

  if (s === "registered" || s.includes("registered")) {
    return { bg: "transparent", color: "#16a34a" };
  }

  return { bg: "transparent", color: "#475569" };
};

const SIP_REGISTER_TABLE_WIDE_MIN = 1400;

const SIP_REGISTER_HIDDEN_TABLE_FIELDS = [
  "index",
  "password",
  "provider",
  "Domain name",
  "Contact User",
  "Outbound Proxy",
  "sip_header",
  "from_user",
  "expire_in_sec",
  "context",
  "allow_codecs",
];

const SIP_REGISTER_VISIBLE_TABLE_FIELDS = sipRegisterFields.filter(
  (f) => !SIP_REGISTER_HIDDEN_TABLE_FIELDS.includes(f.name),
);

const sipRegisterCheckboxCellStyle = {
  width: 40,
  minWidth: 40,
  maxWidth: 40,
  padding: 0,
  borderLeft: "none",
  textAlign: "center",
  verticalAlign: "middle",
};

const sipRegisterCheckboxWrapStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: 32,
};

const sipRegisterIdCellStyle = {
  width: 44,
  minWidth: 44,
  maxWidth: 44,
  textAlign: "center",
  padding: "6px 2px",
};

const sipRegisterIdCenterWrapStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  textAlign: "center",
};

const sipRegisterStatusCellStyle = {
  width: 118,
  minWidth: 118,
  maxWidth: 118,
  textAlign: "center",
  padding: "7px 4px",
};

const sipRegisterModifyCellStyle = {
  width: 70,
  minWidth: 70,
  maxWidth: 70,
  padding: "7px 6px",
  borderRight: "none",
};

/** 100% — headers may use 2 lines; data stays single line */
const sipRegisterHeaderCellStyle100 = {
  whiteSpace: "normal",
  overflow: "visible",
  fontSize: 10,
  letterSpacing: "0.04em",
  padding: "6px 4px",
  lineHeight: 1.15,
  verticalAlign: "middle",
  wordBreak: "break-word",
};

const sipRegisterDataCellStyle100 = {
  whiteSpace: "nowrap",
  overflow: "visible",
  fontSize: 11,
  paddingLeft: 5,
  paddingRight: 5,
  lineHeight: 1.3,
  verticalAlign: "middle",
};

const SIP_REGISTER_TABLE_HEADER_LABELS = {
  trunk_id: "Trunk ID",
  username: "Username",
  auth_username: "Auth User",
  server_domain: "Server Domain",
  client_domain: "Client Domain",
  identity_ip: "Ident. IP",
};

const getSipRegisterDataCellStyle = (zoomed) =>
  zoomed ? sipRegisterZoomCellStyle : sipRegisterDataCellStyle100;

const getSipRegisterHeaderCellStyle = (zoomed) =>
  zoomed ? sipRegisterZoomCellStyle : sipRegisterHeaderCellStyle100;

const sipRegisterFieldColumnWidths = {
  trunk_id: 100,
  username: 140,
  auth_username: 130,
  server_domain: 240,
  client_domain: 320,
  identity_ip: 130,
};

/** 100% zoom — fits headers + longest SIP value on one line, no horizontal scroll */
const sipRegisterFieldColumnPercents = {
  trunk_id: "7%",
  username: "10%",
  auth_username: "9%",
  server_domain: "15%",
  client_domain: "18%",
  identity_ip: "10%",
};

const SIP_REGISTER_ZOOM_TABLE_WIDTH = Math.max(
  SIP_REGISTER_TABLE_WIDE_MIN,
  40 +
    44 +
    118 +
    72 +
    Object.values(sipRegisterFieldColumnWidths).reduce(
      (sum, width) => sum + width,
      0,
    ),
);

const sipRegisterZoomCellStyle = {
  whiteSpace: "nowrap",
  overflow: "visible",
  maxWidth: "none",
};

const sipRegisterFixedCellStyle = (baseStyle, zoomed) =>
  zoomed
    ? { ...baseStyle, maxWidth: "none" }
    : {
        ...baseStyle,
        width: undefined,
        minWidth: undefined,
        maxWidth: undefined,
      };

/** Locked at ~100% browser zoom. Do NOT refresh while Ctrl+/- shrinks innerWidth. */
const sipRegisterZoomBaselineRef = { innerWidth: 0, dpr: 1 };
/** Ctrl+/− steps from 100% (Chrome: 100→110→125…; ≥2 ≈ 125%). */
const sipRegisterZoomStepsRef = { current: 0 };

const lockSipRegisterZoomBaseline = (force = false) => {
  const iw = window.innerWidth;
  if (!iw) return;
  if (force || !sipRegisterZoomBaselineRef.innerWidth) {
    sipRegisterZoomBaselineRef.innerWidth = iw;
    sipRegisterZoomBaselineRef.dpr = window.devicePixelRatio || 1;
  }
};

const syncSipRegisterZoomBaselineIfWindowWidened = () => {
  const iw = window.innerWidth;
  const baseW = sipRegisterZoomBaselineRef.innerWidth;
  if (!baseW || !iw) return;
  if (iw > baseW) {
    sipRegisterZoomBaselineRef.innerWidth = iw;
    sipRegisterZoomBaselineRef.dpr = window.devicePixelRatio || 1;
  }
};

/** Scroll at ≥115% (Ctrl+ ×2 ≈ 125%). ≤100% incl. 90%/80% = no scroll. */
const SIP_REGISTER_ZOOM_SCROLL_MIN = 1.14;
const SIP_REGISTER_ZOOM_SCROLL_STEPS = 2;

const isSipRegisterBrowserZoomedIn = () => {
  if (sipRegisterZoomStepsRef.current >= SIP_REGISTER_ZOOM_SCROLL_STEPS) {
    return true;
  }
  if (sipRegisterZoomStepsRef.current > 0) {
    return false;
  }

  const scale = window.visualViewport?.scale ?? 1;
  if (scale > 0 && scale < 1.05) return false;
  if (scale >= SIP_REGISTER_ZOOM_SCROLL_MIN) return true;
  if (Math.round(scale * 100) >= 115) return true;

  const baseW = sipRegisterZoomBaselineRef.innerWidth;
  const iw = window.innerWidth;
  if (baseW > 0 && iw > 0) {
    if (iw > baseW * 1.02) return false;
    if (baseW / iw >= SIP_REGISTER_ZOOM_SCROLL_MIN) return true;
  }

  const baseDpr = sipRegisterZoomBaselineRef.dpr;
  const dpr = window.devicePixelRatio || 1;
  if (baseDpr > 0 && dpr / baseDpr >= SIP_REGISTER_ZOOM_SCROLL_MIN) return true;

  return false;
};

const scheduleSipRegisterZoomMeasure = (measure) => {
  requestAnimationFrame(measure);
  [50, 150, 300, 600, 900].forEach((ms) => setTimeout(measure, ms));
};

const useSipRegisterBrowserZoom110 = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const [highZoom, setHighZoom] = useState(false);

  useEffect(() => {
    const measure = () => {
      const scale = window.visualViewport?.scale ?? 1;
      const iw = window.innerWidth;
      const baseW = sipRegisterZoomBaselineRef.innerWidth;

      if (
        sipRegisterZoomStepsRef.current <= 0 &&
        (scale < 1.05 || (baseW && iw > 0 && iw >= baseW * 0.98))
      ) {
        lockSipRegisterZoomBaseline(true);
      } else if (iw > baseW) {
        syncSipRegisterZoomBaselineIfWindowWidened();
      }

      setHighZoom(isSipRegisterBrowserZoomedIn());
    };

    const bumpZoomSteps = (delta) => {
      sipRegisterZoomStepsRef.current = Math.max(
        -5,
        Math.min(10, sipRegisterZoomStepsRef.current + delta),
      );
    };

    const onWheel = (e) => {
      if (!e.ctrlKey) return;
      if (e.deltaY < 0) bumpZoomSteps(1);
      else if (e.deltaY > 0) bumpZoomSteps(-1);
      scheduleSipRegisterZoomMeasure(measure);
    };

    const onKeyDown = (e) => {
      if (!e.ctrlKey) return;
      if (e.key === "+" || e.key === "=") {
        bumpZoomSteps(1);
        scheduleSipRegisterZoomMeasure(measure);
      } else if (e.key === "-" || e.key === "_") {
        bumpZoomSteps(-1);
        scheduleSipRegisterZoomMeasure(measure);
      } else if (e.key === "0") {
        sipRegisterZoomStepsRef.current = 0;
        lockSipRegisterZoomBaseline(true);
        scheduleSipRegisterZoomMeasure(measure);
      }
    };

    lockSipRegisterZoomBaseline(true);
    sipRegisterZoomStepsRef.current = 0;
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

const SipRegisterPage = () => {
  // State
  const [trunks, setTrunks] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(SIP_REGISTER_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [modalTab, setModalTab] = useState("basic");
  const [dodRows, setDodRows] = useState([]);
  const [dodSelected, setDodSelected] = useState([]);
  const [adaptRows, setAdaptRows] = useState([
    { matchMode: "", strip: "", prepend: "" },
  ]);
  const [dnisRows, setDnisRows] = useState([
    { dnisNumber: "", dnisName: "", replaceCid: "No" },
  ]);
  const [ethPortOptions, setEthPortOptions] = useState(
    SIP_REGISTER_ETH_PORT_OPTIONS.map((v) => ({ value: v, label: v })),
  );
  const tableScrollRef = useRef(null);
  const [tableContainerWidth, setTableContainerWidth] = useState(0);
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const allowHorizontalScroll = useSipRegisterBrowserZoom110();
  const tableMinWidth = allowHorizontalScroll
    ? Math.max(
        SIP_REGISTER_ZOOM_TABLE_WIDTH,
        tableContainerWidth > 0
          ? tableContainerWidth + 120
          : SIP_REGISTER_ZOOM_TABLE_WIDTH,
      )
    : "100%";

  useEffect(() => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = 0;
    }
  }, [allowHorizontalScroll, tableMinWidth]);

  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return undefined;

    const measureContainer = () => {
      setTableContainerWidth(el.clientWidth);
    };

    measureContainer();
    const ro = new ResizeObserver(measureContainer);
    ro.observe(el);
    window.addEventListener("resize", measureContainer);
    window.visualViewport?.addEventListener("resize", measureContainer);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureContainer);
      window.visualViewport?.removeEventListener("resize", measureContainer);
    };
  }, [trunks.length, allowHorizontalScroll]);

  const PREFERRED_ASSERTED_IDENTITY_OPTIONS = [
    "None",
    "Extension Number",
    "Trunk User Name",
    "DOD Number",
  ];
  const REMOTE_PARTY_ID_OPTIONS = [
    "None",
    "Extension Number",
    "Trunk User Name",
  ];
  const CONTACT_MODE_OPTIONS = ["Extension Number", "Trunk User Name"];

  // DOD Add modal (DNIS-like extension dual-list)
  const [showDodAddModal, setShowDodAddModal] = useState(false);
  const [dodAddName, setDodAddName] = useState("");
  const [dodAddNumber, setDodAddNumber] = useState("");
  const [dodMemberExtensions, setDodMemberExtensions] = useState([]);
  const [dodAvailableSelected, setDodAvailableSelected] = useState([]);
  const [dodChosenSelected, setDodChosenSelected] = useState([]);
  const [dodAvailableExtensions, setDodAvailableExtensions] = useState([]);
  const dodHasLoadedExtensionsRef = useRef(false);

  const dodExtensionLabelMap = useMemo(() => {
    const map = new Map();
    dodAvailableExtensions.forEach((e) => map.set(e.value, e.label));
    return map;
  }, [dodAvailableExtensions]);

  const getDodExtLabel = (ext) => dodExtensionLabelMap.get(ext) || ext;

  const dodAvailableList = useMemo(
    () =>
      dodAvailableExtensions.filter(
        (e) => !dodMemberExtensions.includes(e.value),
      ),
    [dodAvailableExtensions, dodMemberExtensions],
  );

  const dodAvailableSelectedInList = useMemo(
    () =>
      dodAvailableSelected.filter((id) =>
        dodAvailableList.some((t) => t.value === id),
      ),
    [dodAvailableSelected, dodAvailableList],
  );

  const resetDodAddForm = () => {
    setDodAddName("");
    setDodAddNumber("");
    setDodMemberExtensions([]);
    setDodAvailableSelected([]);
    setDodChosenSelected([]);
  };

  const loadDodExtensions = async () => {
    try {
      const res = await fetchSipAccounts();
      const sipList = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      const exts = sipList
        .filter((e) => e && e.extension)
        .map((e) => {
          const ext = String(e.extension);
          const display = (e.display_name || e.name || "").trim();
          return {
            value: ext,
            label: display ? `${ext}-${display}` : ext,
          };
        })
        .sort((a, b) => {
          const an = parseInt(a.value, 10);
          const bn = parseInt(b.value, 10);
          if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn)
            return an - bn;
          return a.label.localeCompare(b.label);
        });
      setDodAvailableExtensions(exts);
      dodHasLoadedExtensionsRef.current = true;
    } catch (e) {
      showMessage("error", e?.message || "Failed to load extensions");
      setDodAvailableExtensions([]);
      dodHasLoadedExtensionsRef.current = true;
    }
  };

  const handleOpenDodAddModal = async () => {
    resetDodAddForm();
    setShowDodAddModal(true);
    if (!dodHasLoadedExtensionsRef.current) await loadDodExtensions();
  };

  const dodAddSelectedMembers = () => {
    if (!dodAvailableSelected.length) return;
    setDodMemberExtensions((prev) => [
      ...prev,
      ...dodAvailableSelected.filter((id) => !prev.includes(id)),
    ]);
    setDodAvailableSelected([]);
  };

  const dodAddAllMembers = () => {
    setDodMemberExtensions(dodAvailableExtensions.map((e) => e.value));
    setDodAvailableSelected([]);
  };

  const dodRemoveSelectedMembers = () => {
    if (!dodChosenSelected.length) return;
    setDodMemberExtensions((prev) =>
      prev.filter((id) => !dodChosenSelected.includes(id)),
    );
    setDodChosenSelected([]);
  };

  const dodRemoveAllMembers = () => {
    setDodMemberExtensions([]);
    setDodChosenSelected([]);
  };

  const handleConfirmDodAdd = () => {
    const name = dodAddName.trim();
    const number = dodAddNumber.trim();
    if (!name) return showMessage("error", "DOD Name is required");
    if (!number) return showMessage("error", "DOD Number is required");
    if (!dodMemberExtensions.length)
      return showMessage("error", "Please select at least one extension");

    setDodRows((prev) => [
      ...prev,
      {
        dodName: name,
        dodNumber: number,
        bindExtensions: [...dodMemberExtensions],
      },
    ]);
    setDodSelected([]);
    setShowDodAddModal(false);
    resetDodAddForm();
  };

  // Pagination + Search
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const filteredRows = trunks;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const pagedRows = filteredRows.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const dataEmpty = trunks.length === 0;

  // Load trunks on component mount
  useEffect(() => {
    // Prevent duplicate calls during React StrictMode or development double-rendering
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadTrunks();
    }
  }, []);

  // Load ETH port dropdown options when SIP Register modal opens.
  // This keeps the menu consistent and shows VPN options only when VPN interfaces are detected.
  useEffect(() => {
    if (!showModal) return;

    const getIpFromInterfaceObject = (obj) => {
      if (!obj || typeof obj !== "object") return null;
      if (Array.isArray(obj["IP Address"]) && obj["IP Address"][0])
        return obj["IP Address"][0];
      if (Array.isArray(obj["Ip Address"]) && obj["Ip Address"][0])
        return obj["Ip Address"][0];
      if (Array.isArray(obj["ip_address"]) && obj["ip_address"][0])
        return obj["ip_address"][0];
      if (typeof obj["IP Address"] === "string") return obj["IP Address"];
      if (typeof obj["Ip Address"] === "string") return obj["Ip Address"];
      if (typeof obj["ip_address"] === "string") return obj["ip_address"];
      return null;
    };

    const loadEthPortOptions = async () => {
      try {
        const sysInfo = await fetchSystemInfo();
        const details = sysInfo?.details || {};
        const lanInterfaces =
          details.LAN_INTERFACES || details.lan_interfaces || null;

        const interfacesArray = Array.isArray(lanInterfaces)
          ? lanInterfaces
          : lanInterfaces && typeof lanInterfaces === "object"
            ? Object.entries(lanInterfaces).map(([name, data]) => ({
                name,
                data,
              }))
            : [];

        let vpnOpenVpnIp = null;
        let vpnSoftEtherIp = null;

        interfacesArray.forEach((iface) => {
          const name = String(iface?.name || iface?.Name || "").toLowerCase();
          const ip = getIpFromInterfaceObject(iface?.data || iface);

          if (ip) {
            if (
              name.includes("tap0") ||
              name === "tap0" ||
              name.includes("tun0") ||
              name === "tun0"
            ) {
              vpnOpenVpnIp = vpnOpenVpnIp || ip;
            }
            if (name.includes("vpn_vpn") || name === "vpn_vpn") {
              vpnSoftEtherIp = vpnSoftEtherIp || ip;
            }
          }
        });

        // Fallback to direct network object access
        const network = sysInfo?.network || {};
        vpnOpenVpnIp =
          vpnOpenVpnIp ||
          getIpFromInterfaceObject(network?.tap0) ||
          getIpFromInterfaceObject(network?.tun0);
        vpnSoftEtherIp =
          vpnSoftEtherIp || getIpFromInterfaceObject(network?.vpn_vpn);

        const nextOptions = [
          { value: "ETH0", label: "ETH0" },
          { value: "ETH1", label: "ETH1" },
        ];

        if (vpnOpenVpnIp) {
          nextOptions.push({
            value: "OpenVPN",
            label: vpnOpenVpnIp ? `OpenVPN (${vpnOpenVpnIp})` : "OpenVPN",
          });
        }

        if (vpnSoftEtherIp) {
          nextOptions.push({
            value: vpnSoftEtherIp,
            label: `SoftEther VPN IP (${vpnSoftEtherIp})`,
          });
        }

        setEthPortOptions(nextOptions);

        const validValues = new Set(nextOptions.map((o) => o.value));
        setForm((prev) => {
          if (validValues.has(prev.ui_eth_port)) return prev;
          return {
            ...prev,
            ui_eth_port: nextOptions[0]?.value || prev.ui_eth_port,
          };
        });
      } catch (e) {
        // If system info is not available, keep ETH0/ETH1 only.
        setEthPortOptions(
          SIP_REGISTER_ETH_PORT_OPTIONS.map((v) => ({ value: v, label: v })),
        );
      }
    };

    loadEthPortOptions();
  }, [showModal]);

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Helper to strip "sip:" prefix for display
  const stripSipPrefix = (value) => {
    if (!value) return "";
    return value.replace(/^sip:/i, "");
  };

  // Fields that require "sip:" prefix
  const SIP_PREFIX_FIELDS = [
    "provider",
    "sip_header",
    "Outbound Proxy",
    "server_domain",
    "client_domain",
  ];

  // Transform API data to UI format
  const transformApiToUi = (apiData) => {
    const toBool = (v) => {
      if (typeof v === "boolean") return v;
      const s = v == null ? "" : String(v).toLowerCase();
      return (
        s === "true" ||
        s === "yes" ||
        s === "1" ||
        s === "running" ||
        s === "connected"
      );
    };

    const toYesNo = (v) => (toBool(v) ? "Yes" : "No");
    const normalizeTransport = (v) => {
      const s = v == null ? "" : String(v).toLowerCase();
      if (s === "udp" || s === "tcp" || s === "tls") return s;
      return s || "udp";
    };
    const mapEthPort = (v) => {
      const s = v == null ? "" : String(v);
      if (s.toLowerCase() === "lan") return "ETH0";
      if (s.toLowerCase() === "wan") return "ETH1";
      return s;
    };

    const mapOutboundCallerIdSource = (v) => {
      const s = v == null ? "" : String(v);
      if (s === "register_name") return "Register Name";
      return "Transparent caller";
    };

    const mapRecording = (v) => {
      const s = v == null ? "" : String(v).toLowerCase();
      if (s === "yes" || s === "true") return "Yes";
      return "No";
    };

    const mapContactMode = (v) => {
      const s = v == null ? "" : String(v);
      if (s === "trunk_username" || s.toLowerCase() === "trunk user name")
        return "Trunk User Name";
      if (s === "extension_number" || s.toLowerCase() === "extension number")
        return "Extension Number";
      return "Trunk User Name";
    };

    const parseSelectedCodecs = (codecsObj) => {
      if (!codecsObj || typeof codecsObj !== "object") return "";
      const selected = Object.entries(codecsObj)
        .filter(([, enabled]) => !!enabled)
        .map(([codec]) => codec);
      return selected.join(",");
    };

    const deriveUiRegister = (registerVal, expireSecondsVal) => {
      // Backend may send boolean `register: true/false` or string.
      // Prefer `register` when provided; otherwise infer from expire seconds.
      const regBool = toBool(registerVal);
      if (regBool) return "Yes";

      const exp = expireSecondsVal == null ? "" : String(expireSecondsVal);
      // If expire is non-zero, treat as registered.
      return exp === "0" || exp === "" ? "No" : "Yes";
    };

    const items = Array.isArray(apiData) ? apiData : [];
    return items.map((item, index) => {
      const trunkId = item?.trunk_id ?? item?.trunkId ?? "";

      const codecsObj = item?.codecs || {};
      const allow_codecs = parseSelectedCodecs(codecsObj);

      const expireSeconds = item?.expire_seconds ?? item?.expire_in_sec ?? "";
      const ui_register = deriveUiRegister(item?.register, expireSeconds);
      const expire_in_sec =
        ui_register === "No" ? "0" : String(expireSeconds ?? "");

      const eth_port = mapEthPort(item?.eth_port ?? "");

      const ui_country = item?.country ?? "General";
      const ui_transport = normalizeTransport(item?.transport ?? "udp");
      const ui_enable_srtp = toBool(item?.enable_srtp);
      const ui_match_username = toYesNo(item?.match_username);
      // Backend may send enable_proxy/proxy_ip either at root or inside `advance`
      // Backend responses sometimes use `outbound_proxy` instead of `proxy_ip`
      // and may omit `enable_proxy` even when a proxy exists.
      const outboundProxyVal =
        item?.proxy_ip ??
        item?.advance?.proxy_ip ??
        item?.advance?.proxyIp ??
        item?.outbound_proxy ??
        item?.advance?.outbound_proxy ??
        "";

      const ui_enable_proxy =
        toBool(item?.enable_proxy ?? item?.advance?.enable_proxy) ||
        (outboundProxyVal != null &&
          String(outboundProxyVal).trim() !== "" &&
          String(outboundProxyVal).trim().toLowerCase() !== "none");

      const ui_outbound_cid_source = mapOutboundCallerIdSource(
        item?.outbound_callerid ?? "",
      );
      const ui_show_outbound_cid_name = toBool(item?.show_outbound_cid_name);

      const ui_record = mapRecording(item?.recording);
      const ui_enabled = toYesNo(item?.enabled);

      const advance = item?.advance || {};
      const ui_contact_mode = mapContactMode(advance?.contact);

      const ui_send_privacy_id =
        String(advance?.send_privacy_id ?? "").toLowerCase() === "yes"
          ? "Yes"
          : "No";
      const ui_enable_early_session =
        String(advance?.enable_early_session ?? "").toLowerCase() === "yes"
          ? "Yes"
          : "No";
      const ui_enable_early_media =
        String(advance?.enable_early_media ?? "").toLowerCase() === "yes"
          ? "Yes"
          : "No";

      const registerStatus =
        item?.registration_status ?? item?.register_status ?? "";

      const dodRows = Array.isArray(item?.dod)
        ? item.dod.map((d) => ({
            dodName: d?.dod_name ?? d?.dodName ?? "",
            dodNumber: d?.dod_number ?? d?.dodNumber ?? "",
            bindExtensions: Array.isArray(d?.extensions)
              ? d.extensions.map(String)
              : Array.isArray(d?.extension)
                ? d.extension.map(String)
                : [],
          }))
        : [];

      const adaptRows = Array.isArray(item?.adapt_callerid)
        ? item.adapt_callerid.map((a) => ({
            matchMode: a?.match_mode ?? a?.matchMode ?? "",
            strip: a?.strip ?? "",
            prepend: a?.prepend ?? "",
          }))
        : [{ matchMode: "", strip: "", prepend: "" }];

      const result = {
        index: index.toString(),

        // Table fields (legacy list rendering)
        trunk_id: trunkId,
        username: item?.username ?? "",
        context: item?.context ?? "",
        allow_codecs,
        expire_in_sec,
        provider: stripSipPrefix(item?.trunk_ip_domain ?? item?.provider ?? ""),
        password: item?.password ?? "",
        sip_header: stripSipPrefix(item?.sip_header ?? ""),
        "Domain name": item?.["Domain name"] ?? item?.from_domain ?? "",
        "Contact User": item?.["Contact User"] ?? item?.contact_user ?? "",
        "Outbound Proxy": stripSipPrefix(
          item?.["Outbound Proxy"] ?? item?.outbound_proxy ?? "",
        ),
        server_domain: stripSipPrefix(item?.server_domain ?? ""),
        client_domain: stripSipPrefix(item?.client_domain ?? ""),
        auth_username:
          item?.auth_username ?? item?.auth_user ?? item?.authUser ?? "",
        // Keep From User bound to backend `from_user` only.
        // `auth_username` is a different server field and should not auto-fill this UI input.
        from_user: item?.from_user ?? "",
        identity_ip: item?.identity_ip ?? "",
        registerStatus: registerStatus || "",

        // Modal/UI fields
        ui_country,
        ui_transport,
        ui_enable_srtp,
        ui_register,
        ui_reg_fail_retry: String(item?.reg_fail_retry ?? ""),
        ui_match_username,
        ui_enable_proxy,
        ui_proxy_ip: stripSipPrefix(outboundProxyVal),
        ui_outbound_cid_source,
        ui_show_outbound_cid_name,
        ui_outbound_cid_name: item?.outbound_cid_name ?? "",
        ui_outbound_cid_number: item?.outbound_cid_number ?? "",
        ui_record,
        ui_enabled,
        ui_eth_port: eth_port,

        // Basic form fields
        ui_trunk_type: item?.trunk_type ?? "sip",

        // Advance form fields
        ui_get_called_id_type: advance?.get_called_id_type ?? "",
        ui_options_interval: advance?.options_interval_s ?? "",
        ui_tx_volume: String(advance?.tx_volume ?? "0"),
        ui_rx_volume: String(advance?.rx_volume ?? "0"),
        ui_send_privacy_id,
        ui_sip_force_contact: advance?.sip_force_contact ?? "",
        ui_p_preferred_identity: advance?.p_preferred_identity ?? "None",
        ui_p_asserted_identity: advance?.p_asserted_identity ?? "None",
        ui_remote_party_id: advance?.remote_party_id ?? "None",
        ui_contact_mode,
        ui_limit_max_calls: String(advance?.limit_max_calls ?? "0"),
        ui_enable_early_session,
        ui_enable_early_media,
        ui_user_phone: toBool(advance?.user_phone),
        ui_call_timeout: String(advance?.call_timeout_s ?? "30"),
        ui_max_call_duration: String(advance?.max_call_duration_s ?? "6000"),
        ui_dnis: toBool(advance?.dnis),
        ui_dtmf_transmit: advance?.dtmf_transmit_mode ?? "RFC2833",

        // Complex sections
        dodRows,
        adaptRows,
      };

      return result;
    });
  };

  // Transform UI data to API format
  const transformUiToApi = (uiData) => {
    const toLowerYesNo = (v) => (v === "Yes" ? "yes" : "no");
    const toYesNoBool = (v) => v === "Yes";

    const selectedCodecsSet = new Set(
      (uiData.allow_codecs || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );

    const codecs = {};
    CODEC_OPTIONS.forEach((c) => {
      codecs[c.value] = selectedCodecsSet.has(c.value);
    });

    const outboundCallerId =
      uiData.ui_outbound_cid_source === "Register Name"
        ? "register_name"
        : "transparent_caller";

    const contact =
      uiData.ui_contact_mode === "Trunk User Name"
        ? "trunk_username"
        : "extension_number";

    const advance = {
      get_called_id_type: uiData.ui_get_called_id_type ?? "",
      options_interval_s: uiData.ui_options_interval ?? "",
      tx_volume: uiData.ui_tx_volume ?? "0",
      rx_volume: uiData.ui_rx_volume ?? "0",
      send_privacy_id: toLowerYesNo(uiData.ui_send_privacy_id),
      sip_force_contact: uiData.ui_sip_force_contact ?? "",
      p_preferred_identity: uiData.ui_p_preferred_identity ?? "None",
      p_asserted_identity: uiData.ui_p_asserted_identity ?? "None",
      remote_party_id: uiData.ui_remote_party_id ?? "None",
      contact,
      limit_max_calls: uiData.ui_limit_max_calls ?? "0",
      enable_early_session: toLowerYesNo(uiData.ui_enable_early_session),
      enable_early_media: toLowerYesNo(uiData.ui_enable_early_media),
      user_phone: !!uiData.ui_user_phone,
      call_timeout_s: uiData.ui_call_timeout ?? "30",
      max_call_duration_s: uiData.ui_max_call_duration ?? "6000",
      dnis: !!uiData.ui_dnis,
      dtmf_transmit_mode: uiData.ui_dtmf_transmit ?? "RFC2833",
    };

    const dod = (dodRows || []).map((row) => ({
      dod_name: row.dodName ?? "",
      dod_number: row.dodNumber ?? "",
      extensions: Array.isArray(row.bindExtensions)
        ? row.bindExtensions.map(String)
        : [],
    }));

    const adapt_callerid = (adaptRows || []).map((row) => ({
      match_mode: row.matchMode ?? "",
      strip: row.strip ?? "",
      prepend: row.prepend ?? "",
    }));

    return {
      trunk_id: uiData.trunk_id,
      trunk_name: uiData.trunk_id, // UI currently edits trunk_id only; reuse for trunk_name
      country: uiData.ui_country,
      transport: String(uiData.ui_transport || "udp").toUpperCase(),
      enable_srtp: !!uiData.ui_enable_srtp,
      register: uiData.ui_register === "Yes" ? "yes" : "no",
      username: uiData.username ?? "",
      auth_username: uiData.auth_username ?? "",
      password: uiData.password ?? "",
      reg_fail_retry: uiData.ui_reg_fail_retry ?? 30,
      expire_seconds:
        uiData.ui_register === "No" ? 0 : (uiData.expire_in_sec ?? 1800),
      match_username: toYesNoBool(uiData.ui_match_username),
      enable_proxy: !!uiData.ui_enable_proxy,
      proxy_ip: uiData.ui_proxy_ip ?? "",
      trunk_ip_domain: uiData.provider ?? "",
      outbound_callerid: outboundCallerId,
      show_outbound_cid_name: !!uiData.ui_show_outbound_cid_name,
      outbound_cid_name: uiData.ui_outbound_cid_name ?? "",
      outbound_cid_number: uiData.ui_outbound_cid_number ?? "",
      recording: toLowerYesNo(uiData.ui_record),
      enabled: uiData.ui_enabled === "Yes",
      eth_port: uiData.ui_eth_port ?? "ETH0",
      context: uiData.context ?? "",
      from_user: uiData.from_user ?? "",

      codecs,
      advance,
      dod,
      adapt_callerid,
    };
  };

  // Load trunks from API
  const loadTrunks = async (isRefresh = false) => {
    // Prevent concurrent calls
    if (loading.fetch) {
      return;
    }

    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      console.log("Attempting to load SIP trunks...");
      const response = await listSipTrunks();
      console.log("SIP trunks response:", response);
      if (response.response && response.message) {
        const transformedTrunks = transformApiToUi(response.message);
        console.log("Transformed trunks:", transformedTrunks);
        setTrunks(transformedTrunks);
      } else {
        console.log("Invalid response format:", response);
        showMessage("error", "Failed to load SIP trunks");
      }
    } catch (error) {
      console.error("Error loading SIP trunks:", error);
      if (!isRefresh) {
        // Only show error on initial load, not on refresh after operations
        if (error.message === "Network Error") {
          showMessage("error", "Network error. Please check your connection.");
        } else if (error.response?.status === 500) {
          showMessage(
            "error",
            "Server error. The list endpoint may have issues.",
          );
        } else {
          showMessage("error", error.message || "Failed to load SIP trunks");
        }
      } else {
        // For refresh errors, just log them - don't disturb the user
        console.warn("Refresh failed, keeping existing data:", error.message);
      }
      // Only set empty array on initial load failure, not on refresh
      if (!isRefresh) {
        setTrunks([]);
      }
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };
  // Modal logic
  const handleOpenModal = (row = null, idx = null) => {
    setModalTab("basic");
    setDodSelected([]);
    setAdaptRows([{ matchMode: "", strip: "", prepend: "" }]);
    setDnisRows([{ dnisNumber: "", dnisName: "", replaceCid: "No" }]);
    setValidationErrors({});
    if (row && idx !== null) {
      const uiReg =
        row.ui_register ??
        (String(row.expire_in_sec ?? "") === "0" ? "No" : "Yes");
      setForm({ ...SIP_REGISTER_INITIAL_FORM, ...row, ui_register: uiReg });
      setEditIndex(idx);
      setDodRows(Array.isArray(row.dodRows) ? row.dodRows : []);
      setAdaptRows(
        Array.isArray(row.adaptRows) && row.adaptRows.length
          ? row.adaptRows
          : [{ matchMode: "", strip: "", prepend: "" }],
      );
      setDnisRows(
        Array.isArray(row.dnisRows) && row.dnisRows.length
          ? row.dnisRows
          : [{ dnisNumber: "", dnisName: "", replaceCid: "No" }],
      );
    } else {
      const nextIndex = trunks.length.toString();
      setForm({
        ...SIP_REGISTER_INITIAL_FORM,
        index: nextIndex,
      });
      setEditIndex(null);
      setDodRows([]);
    }
    setShowDodAddModal(false);
    resetDodAddForm();
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setModalTab("basic");
    setShowDodAddModal(false);
    resetDodAddForm();
    setDodRows([]);
    setDodSelected([]);
    setAdaptRows([{ matchMode: "", strip: "", prepend: "" }]);
    setDnisRows([{ dnisNumber: "", dnisName: "", replaceCid: "No" }]);
    setShowPassword(false); // Reset password visibility when closing modal
    setValidationErrors({}); // Clear validation errors when closing modal
  };
  const handleChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "ui_register") {
        if (value === "Yes") {
          // Default expire when switching Register=Yes (matches screenshot)
          if (!next.expire_in_sec || String(next.expire_in_sec).trim() === "")
            next.expire_in_sec = "1800";
        } else {
          // When Register=No, expire is forced to 0 for save payload.
          next.expire_in_sec = "0";
        }
      }
      return next;
    });

    // Clear validation error for this field when user starts typing
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }

    // Real-time validation for specific fields
    let error = null;
    switch (key) {
      case "trunk_id":
        error = validateTrunkId(value);
        break;
      case "username":
        error = validateUsername(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "context":
        error = validateContext(value);
        break;
      case "allow_codecs":
        error = validateAllowCodecs(value);
        break;
      case "expire_in_sec":
        error = validateExpireInSec(value);
        break;
      case "provider":
        error = validateProvider(value);
        break;
      case "sip_header":
        error = validateSipHeader(value);
        break;
      case "server_domain":
        error = validateServerDomain(value);
        break;
      case "client_domain":
        error = validateClientDomain(value);
        break;
      case "identity_ip":
        error = validateIdentityIp(value);
        break;
      case "ui_reg_fail_retry":
        if (!value || String(value).trim() === "")
          error = "RegFail Retry is required";
        else if (!/^\d+$/.test(String(value).trim()))
          error = "RegFail Retry must be a number";
        break;
      case "ui_proxy_ip":
        if (form.ui_enable_proxy && (!value || String(value).trim() === ""))
          error = "Proxy IP is required";
        break;
      case "ui_match_username":
        if (value !== "Yes" && value !== "No")
          error = "Match Username must be Yes or No";
        break;
      case "ui_country":
        if (!value || String(value).trim() === "")
          error = "Country is required";
        break;
      default:
        break;
    }

    if (error) {
      setValidationErrors((prev) => ({ ...prev, [key]: error }));
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

      const newCodecsString = newCodecs.join(",");

      // Clear validation error for allow_codecs when user changes codecs
      if (validationErrors.allow_codecs) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.allow_codecs;
          return newErrors;
        });
      }

      // Real-time validation
      const codecError = validateAllowCodecs(newCodecsString);
      if (codecError) {
        setValidationErrors((prev) => ({ ...prev, allow_codecs: codecError }));
      }

      return { ...prev, allow_codecs: newCodecsString };
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

  // Validation functions
  const validateTrunkId = (trunkId) => {
    if (!trunkId || trunkId.trim() === "") {
      return "Trunk ID is required";
    }
    return null;
  };

  const validateUsername = (username) => {
    if (!username || username.trim() === "") {
      return "Username is required";
    }
    return null;
  };

  const validatePassword = (password) => {
    if (!password || password.trim() === "") {
      return "Password is required";
    }
    return null;
  };

  const validateContext = (context) => {
    if (!context || context.trim() === "") {
      return "Context is required";
    }
    return null;
  };

  const validateAllowCodecs = (allowCodecs) => {
    if (!allowCodecs || allowCodecs.trim() === "") {
      return "Allow Codecs is required";
    }
    return null;
  };

  const validateExpireInSec = (expireInSec) => {
    const valueStr = expireInSec == null ? "" : String(expireInSec);
    if (valueStr.trim() === "") return "Expire In Sec is required";
    // Optional: ensure it is a positive integer
    if (!/^\d+$/.test(valueStr)) return "Expire In Sec must be a number";
    return null;
  };

  const validateProvider = (provider) => {
    if (!provider || provider.trim() === "") {
      return "Provider is required (e.g., example.com:5060)";
    }
    return null;
  };

  const validateSipHeader = (sipHeader) => {
    if (!sipHeader || sipHeader.trim() === "") {
      return "SIP Header is required (e.g., example.com)";
    }
    return null;
  };

  const validateServerDomain = (serverDomain) => {
    if (!serverDomain || serverDomain.trim() === "") {
      return "Server Domain is required (e.g., sip.domain.in)";
    }
    return null;
  };

  const validateClientDomain = (clientDomain) => {
    if (!clientDomain || clientDomain.trim() === "") {
      return "Client Domain is required (e.g., +91XXXXXXXXXX@sip.domain.in)";
    }
    return null;
  };

  const validateIdentityIp = (identityIp) => {
    if (!identityIp || identityIp.trim() === "") {
      return "Identity IP is required (e.g., 15.158.34.15)";
    }
    return null;
  };

  const validateForm = (data = form) => {
    const errors = {};

    const merged = {
      ...data,
      expire_in_sec:
        data.ui_register === "No" ? "0" : data.expire_in_sec || "3600",
    };

    const isNonEmpty = (v) =>
      v !== undefined && v !== null && String(v).trim() !== "";

    const trunkIdError = validateTrunkId(merged.trunk_id);
    if (trunkIdError) errors.trunk_id = trunkIdError;

    if (!merged.ui_country || String(merged.ui_country).trim() === "") {
      errors.ui_country = "Country is required";
    }

    const allowCodecsError = validateAllowCodecs(merged.allow_codecs);
    if (allowCodecsError) errors.allow_codecs = allowCodecsError;

    const providerError = validateProvider(merged.provider);
    if (providerError) errors.provider = providerError;

    if (merged.ui_register === "Yes") {
      const usernameError = validateUsername(merged.username);
      if (usernameError) errors.username = usernameError;

      const passwordError = validatePassword(merged.password);
      if (passwordError) errors.password = passwordError;

      const expireInSecError = validateExpireInSec(merged.expire_in_sec);
      if (expireInSecError) errors.expire_in_sec = expireInSecError;

      const regFailRetry = merged.ui_reg_fail_retry;
      if (!regFailRetry || String(regFailRetry).trim() === "") {
        errors.ui_reg_fail_retry = "RegFail Retry is required";
      } else if (!/^\d+$/.test(String(regFailRetry).trim())) {
        errors.ui_reg_fail_retry = "RegFail Retry must be a number";
      }

      if (
        merged.ui_match_username !== "Yes" &&
        merged.ui_match_username !== "No"
      ) {
        errors.ui_match_username = "Match Username must be Yes or No";
      }

      if (merged.ui_enable_proxy) {
        const proxyIp = merged.ui_proxy_ip;
        if (!proxyIp || String(proxyIp).trim() === "") {
          errors.ui_proxy_ip = "Proxy IP is required";
        }
      }
    }

    // These fields are part of the previous "SIP registration" UI.
    // Since the UI no longer shows them (to match your screenshot),
    // they should be optional for save.
    if (isNonEmpty(merged.sip_header)) {
      const sipHeaderError = validateSipHeader(merged.sip_header);
      if (sipHeaderError) errors.sip_header = sipHeaderError;
    }

    if (isNonEmpty(merged.server_domain)) {
      const serverDomainError = validateServerDomain(merged.server_domain);
      if (serverDomainError) errors.server_domain = serverDomainError;
    }

    if (isNonEmpty(merged.client_domain)) {
      const clientDomainError = validateClientDomain(merged.client_domain);
      if (clientDomainError) errors.client_domain = clientDomainError;
    }

    if (isNonEmpty(merged.identity_ip)) {
      const identityIpError = validateIdentityIp(merged.identity_ip);
      if (identityIpError) errors.identity_ip = identityIpError;
    }

    return errors;
  };

  const buildMergedFormForSave = () => ({
    ...form,
    context: form.context || "sip1",
    expire_in_sec:
      form.ui_register === "No" ? "0" : form.expire_in_sec || "3600",
  });

  const handleSave = async () => {
    const mergedForm = buildMergedFormForSave();
    const validationErrors = validateForm(mergedForm);

    if (Object.keys(validationErrors).length > 0) {
      const firstKey = Object.keys(validationErrors)[0];
      if (
        [
          "sip_header",
          "server_domain",
          "client_domain",
          "identity_ip",
          "Outbound Proxy",
        ].includes(firstKey)
      ) {
        setModalTab("advance");
      } else if (firstKey === "allow_codecs") {
        setModalTab("codec");
      } else {
        setModalTab("basic");
      }
      showMessage("error", validationErrors[firstKey]);
      return;
    }

    // Prevent duplicate registration: same Trunk ID (name) + Username
    // (case-insensitive, trimmed). Allow when editing the same row.
    if (mergedForm.ui_register === "Yes") {
      const norm = (v) =>
        String(v ?? "")
          .trim()
          .toLowerCase();
      const nextTrunkId = norm(mergedForm.trunk_id);
      const nextUsername = norm(mergedForm.username);
      const duplicateIndex = trunks.findIndex((t, idx) => {
        if (editIndex !== null && idx === editIndex) return false;
        return (
          norm(t?.trunk_id) === nextTrunkId &&
          norm(t?.username) === nextUsername
        );
      });

      if (nextTrunkId && nextUsername && duplicateIndex !== -1) {
        showMessage(
          "error",
          "Duplicate trunk not allowed: same Trunk ID and Username already exists.",
        );
        setModalTab("basic");
        return;
      }
    }

    setLoading((prev) => ({ ...prev, save: true }));
    const closeModalAfterSuccess = () => {
      setShowModal(false);
      setEditIndex(null);
      setModalTab("basic");
      setDodRows([]);
      setDodSelected([]);
      setAdaptRows([{ matchMode: "", strip: "", prepend: "" }]);
      setDnisRows([{ dnisNumber: "", dnisName: "", replaceCid: "No" }]);
      setShowPassword(false);
      setValidationErrors({});
    };

    try {
      const apiData = transformUiToApi(mergedForm);

      if (editIndex !== null) {
        console.log("Updating SIP trunk with data:", apiData);
        const response = await updateSipTrunk(apiData);
        console.log("Update response:", response);
        if (response.response) {
          showMessage(
            "success",
            response.message || "Trunk updated successfully",
          );
          setForm((prev) => ({ ...prev, ...mergedForm }));
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await loadTrunks(true);
          } catch (reloadError) {
            console.warn("Failed to reload trunks after update:", reloadError);
            setTrunks((prev) =>
              prev.map((trunk, idx) =>
                idx === editIndex
                  ? { ...trunk, ...mergedForm, registerStatus: "registered" }
                  : trunk,
              ),
            );
          }
          closeModalAfterSuccess();
        } else {
          showMessage("error", "Failed to update trunk");
        }
      } else {
        console.log("Creating SIP trunk with data:", apiData);
        const response = await createSipTrunk(apiData);
        console.log("Create response:", response);
        if (response.response) {
          showMessage(
            "success",
            response.message || "Trunk created successfully",
          );
          setForm((prev) => ({ ...prev, ...mergedForm }));
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await loadTrunks(true);
          } catch (reloadError) {
            console.warn(
              "Failed to reload trunks after creation:",
              reloadError,
            );
            setTrunks((prev) => {
              const newTrunk = {
                index: prev.length.toString(),
                trunk_id: mergedForm.trunk_id,
                username: mergedForm.username,
                context: mergedForm.context,
                allow_codecs: mergedForm.allow_codecs,
                expire_in_sec: mergedForm.expire_in_sec,
                provider: mergedForm.provider,
                sip_header: mergedForm.sip_header,
                registerStatus: "registered",
              };
              return [...prev, newTrunk];
            });
          }
          closeModalAfterSuccess();
        } else if (response.limit_exceeded) {
          showMessage(
            "error",
            `Maximum trunk limit (${response.limit}) reached. Please upgrade your license.`,
          );
        } else {
          showMessage("error", response.message || "Failed to create trunk");
        }
      }
    } catch (error) {
      console.error("Error saving SIP trunk:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to save trunk");
      }
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };
  // Table selection logic (trunk_id based)
  const allPageSelected =
    pagedRows.length > 0 &&
    pagedRows
      .map((r) => r.trunk_id)
      .filter(Boolean)
      .every((id) => selectedIds.includes(id));
  const somePageSelected =
    pagedRows.some((r) => r.trunk_id && selectedIds.includes(r.trunk_id)) &&
    !allPageSelected;

  const handleToggleRow = (trunk_id) => {
    if (!trunk_id) return;
    setSelectedIds((prev) =>
      prev.includes(trunk_id)
        ? prev.filter((id) => id !== trunk_id)
        : [...prev, trunk_id],
    );
  };
  const handleToggleAll = () => {
    const pageIds = pagedRows.map((r) => r.trunk_id).filter(Boolean);
    if (!pageIds.length) return;
    setSelectedIds((prev) =>
      allPageSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...prev, ...pageIds])),
    );
  };
  const handleInverse = () => {
    const allIds = trunks.map((t) => t.trunk_id).filter(Boolean);
    setSelectedIds(allIds.filter((id) => !selectedIds.includes(id)));
  };
  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      showMessage("error", "Please select trunks to delete");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} trunk(s)?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = selectedIds.map(
        async (id) => await deleteSipTrunk(id),
      );
      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) => result.status === "fulfilled" && result.value.response,
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        showMessage("success", `${successCount} trunk(s) deleted successfully`);
        try {
          await loadTrunks(true);
        } catch {
          setTrunks((prev) =>
            prev.filter((t) => !selectedIds.includes(t.trunk_id)),
          );
        }
        setSelectedIds([]);
      }

      if (failCount > 0) {
        showMessage("error", `Failed to delete ${failCount} trunk(s)`);
      }
    } catch (error) {
      showMessage("error", error.message || "Failed to delete trunks");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };
  const handleClearAll = async () => {
    if (trunks.length === 0) {
      showMessage("info", "No trunks to clear");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete ALL SIP trunks? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      console.log(
        "Clearing all trunks:",
        trunks.map((t) => t.trunk_id),
      );
      const deletePromises = trunks.map(async (trunk) => {
        console.log("Deleting trunk:", trunk.trunk_id);
        return await deleteSipTrunk(trunk.trunk_id);
      });

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) => result.status === "fulfilled" && result.value.response,
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        showMessage(
          "success",
          `All ${successCount} trunk(s) deleted successfully`,
        );

        // Try to reload data, but don't fail if it doesn't work
        try {
          await loadTrunks(true); // Reload trunks to get fresh data
        } catch (reloadError) {
          console.warn(
            "Failed to reload after clear all, clearing local state:",
            reloadError,
          );
          // Clear all items from local state as fallback
          setTrunks([]);
        }
        setSelectedIds([]);
        setPage(1);
      }

      if (failCount > 0) {
        showMessage("error", `Failed to delete ${failCount} trunk(s)`);
      }
    } catch (error) {
      showMessage("error", error.message || "Failed to clear all trunks");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };
  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  return (
    <div style={{ ...pbxPageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
      <div style={pbxPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
        )}

        <PbxBreadcrumb section="Trunks" current="SIP Register" />

        <div style={sipPcmCardStyle}>
          <div
            style={{
              ...sipPcmToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span style={sipPcmSelectedBadgeStyle}>
                  {selected.length} selected
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
                onClick={handleInverse}
                disabled={loading.delete}
                style={sipPcmCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.delete || trunks.length === 0}
                style={sipPcmCancelBtnStyle}
              >
                Clear All
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={loading.delete || selectedIds.length === 0}
                style={sipPcmCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    Delete
                  </>
                )}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.fetch}
                style={sipPcmPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            {isInitialLoad ? (
              <TableListLoading />
            ) : dataEmpty ? (
              <TableListEmptyState
                message="No SIP register trunks found."
                onAddNew={() => handleOpenModal()}
              />
            ) : (
              <>
                <div
                  ref={tableScrollRef}
                  className={TRUNK_TABLE_SCROLL_CLASS}
                  style={{
                    ...trunkTableScrollStyle,
                    overflowX: allowHorizontalScroll ? "auto" : "hidden",
                    borderBottom: "none",
                  }}
                >
                  <div
                    style={{
                      ...trunkTableInnerStyle,
                      minWidth: allowHorizontalScroll ? tableMinWidth : "100%",
                      width: allowHorizontalScroll ? tableMinWidth : "100%",
                      borderBottom: "none",
                    }}
                  >
                    <table
                      style={{
                        width: allowHorizontalScroll ? tableMinWidth : "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        tableLayout: allowHorizontalScroll ? "auto" : "fixed",
                        minWidth: allowHorizontalScroll
                          ? tableMinWidth
                          : "100%",
                      }}
                    >
                      <colgroup>
                        <col
                          style={{
                            width: allowHorizontalScroll ? 40 : "3%",
                          }}
                        />
                        <col
                          style={{
                            width: allowHorizontalScroll ? 44 : "3%",
                          }}
                        />
                        {SIP_REGISTER_VISIBLE_TABLE_FIELDS.map((field) => (
                          <col
                            key={field.name}
                            style={{
                              width: allowHorizontalScroll
                                ? sipRegisterFieldColumnWidths[field.name]
                                : sipRegisterFieldColumnPercents[field.name],
                            }}
                          />
                        ))}
                        <col
                          style={{
                            width: allowHorizontalScroll ? 118 : "10%",
                          }}
                        />
                        <col
                          style={{
                            width: allowHorizontalScroll ? 72 : "6%",
                          }}
                        />
                      </colgroup>
                      <thead>
                        <tr>
                          <TH
                            style={{
                              ...sipRegisterFixedCellStyle(
                                sipRegisterCheckboxCellStyle,
                                allowHorizontalScroll,
                              ),
                              position: "sticky",
                              top: 0,
                              zIndex: 10,
                            }}
                          >
                            <div style={sipRegisterCheckboxWrapStyle}>
                              <Checkbox
                                size="small"
                                checked={allPageSelected}
                                indeterminate={somePageSelected}
                                onChange={handleToggleAll}
                                sx={checkboxSx}
                              />
                            </div>
                          </TH>
                          <TH
                            style={{
                              ...sipRegisterFixedCellStyle(
                                sipRegisterIdCellStyle,
                                allowHorizontalScroll,
                              ),
                              textAlign: "center",
                              position: "sticky",
                              top: 0,
                              zIndex: 10,
                            }}
                          >
                            <div style={sipRegisterIdCenterWrapStyle}>ID</div>
                          </TH>
                          {SIP_REGISTER_VISIBLE_TABLE_FIELDS.map((field) => (
                            <TH
                              key={field.name}
                              title={field.label}
                              style={getSipRegisterHeaderCellStyle(
                                allowHorizontalScroll,
                              )}
                            >
                              {SIP_REGISTER_TABLE_HEADER_LABELS[field.name] ??
                                field.label}
                            </TH>
                          ))}
                          <TH
                            style={{
                              ...sipRegisterFixedCellStyle(
                                sipRegisterStatusCellStyle,
                                allowHorizontalScroll,
                              ),
                              ...getSipRegisterHeaderCellStyle(
                                allowHorizontalScroll,
                              ),
                              position: "sticky",
                              top: 0,
                              zIndex: 10,
                            }}
                          >
                            <div style={sipRegisterIdCenterWrapStyle}>
                              Status
                            </div>
                          </TH>
                          <TH
                            style={{
                              ...sipRegisterFixedCellStyle(
                                sipRegisterModifyCellStyle,
                                allowHorizontalScroll,
                              ),
                              ...getSipRegisterHeaderCellStyle(
                                allowHorizontalScroll,
                              ),
                              position: "sticky",
                              top: 0,
                              zIndex: 10,
                            }}
                          >
                            Modify
                          </TH>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedRows.map((trunk, idx) => {
                          const realIdx = (page - 1) * itemsPerPage + idx;
                          const isSelected =
                            trunk.trunk_id &&
                            selectedIds.includes(trunk.trunk_id);
                          const isLastRow = idx === pagedRows.length - 1;
                          const rowBg = isSelected
                            ? "#f0f9ff"
                            : idx % 2 === 1
                              ? "#f8fafc"
                              : "#ffffff";
                          const lastRowCellStyle = isLastRow
                            ? { borderBottom: "none" }
                            : {};
                          const { bg: statusBg, color: statusColor } =
                            getSipRegisterStatusStyle(trunk.registerStatus);
                          return (
                            <tr
                              key={trunk.trunk_id || idx}
                              style={{
                                background: rowBg,
                                transition: "background-color 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected)
                                  e.currentTarget.style.background = "#f1f5f9";
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected)
                                  e.currentTarget.style.background = rowBg;
                              }}
                            >
                              <td
                                style={{
                                  ...tdStyle,
                                  ...sipRegisterFixedCellStyle(
                                    sipRegisterCheckboxCellStyle,
                                    allowHorizontalScroll,
                                  ),
                                  background: rowBg,
                                  ...lastRowCellStyle,
                                }}
                              >
                                <div style={sipRegisterCheckboxWrapStyle}>
                                  <Checkbox
                                    size="small"
                                    disabled={!trunk.trunk_id}
                                    checked={
                                      !!trunk.trunk_id &&
                                      selectedIds.includes(trunk.trunk_id)
                                    }
                                    onChange={() =>
                                      handleToggleRow(trunk.trunk_id)
                                    }
                                    sx={checkboxSx}
                                  />
                                </div>
                              </td>
                              <td
                                style={{
                                  ...tdStyle,
                                  ...sipRegisterFixedCellStyle(
                                    sipRegisterIdCellStyle,
                                    allowHorizontalScroll,
                                  ),
                                  background: rowBg,
                                  ...lastRowCellStyle,
                                }}
                              >
                                <div style={sipRegisterIdCenterWrapStyle}>
                                  {(page - 1) * itemsPerPage + idx + 1}
                                </div>
                              </td>
                              {SIP_REGISTER_VISIBLE_TABLE_FIELDS.map(
                                (field) => {
                                  const value = trunk[field.name];
                                  const hasValue =
                                    value !== undefined &&
                                    value !== null &&
                                    value !== "";
                                  const displayValue =
                                    hasValue &&
                                    SIP_PREFIX_FIELDS.includes(field.name)
                                      ? `sip:${value}`
                                      : hasValue
                                        ? value
                                        : "—";
                                  return (
                                    <td
                                      key={field.name}
                                      title={String(displayValue)}
                                      style={{
                                        ...tdStyle,
                                        background: rowBg,
                                        fontWeight:
                                          field.name === "trunk_id" ? 600 : 400,
                                        ...getSipRegisterDataCellStyle(
                                          allowHorizontalScroll,
                                        ),
                                        ...lastRowCellStyle,
                                      }}
                                    >
                                      {displayValue}
                                    </td>
                                  );
                                },
                              )}
                              <td
                                style={{
                                  ...tdStyle,
                                  ...sipRegisterFixedCellStyle(
                                    sipRegisterStatusCellStyle,
                                    allowHorizontalScroll,
                                  ),
                                  background: rowBg,
                                  ...lastRowCellStyle,
                                }}
                              >
                                <div style={sipRegisterIdCenterWrapStyle}>
                                  {trunk.registerStatus ? (
                                    <Pill
                                      text={formatSipRegisterStatusLabel(
                                        trunk.registerStatus,
                                      )}
                                      bg={statusBg}
                                      color={statusColor}
                                    />
                                  ) : (
                                    <span style={{ color: C.mutedText }}>
                                      —
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td
                                style={{
                                  ...tdStyle,
                                  ...sipRegisterFixedCellStyle(
                                    sipRegisterModifyCellStyle,
                                    allowHorizontalScroll,
                                  ),
                                  background: rowBg,
                                  ...lastRowCellStyle,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                >
                                  <EditDocumentIcon
                                    titleAccess="Edit"
                                    style={{
                                      cursor: loading.delete
                                        ? "not-allowed"
                                        : "pointer",
                                      color: "#2563eb",
                                      fontSize: 22,
                                      opacity: loading.delete ? 0.4 : 0.7,
                                      transition: "opacity 0.15s ease",
                                    }}
                                    onClick={() =>
                                      !loading.delete &&
                                      handleOpenModal(trunk, realIdx)
                                    }
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
                  </div>
                </div>
              </>
            )}
          </div>

          {!isInitialLoad && filteredRows.length > 0 && (
            <SipPcmPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        sx={{ "& .MuiDialog-container": { alignItems: "flex-start", pt: 5 } }}
        PaperProps={{ sx: trunkModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={trunkModalTitleStyle}>
          {editIndex !== null ? "Edit SIP Register" : "Add SIP Register"}
        </DialogTitle>

        <PbxModalTabs
          value={modalTab}
          onChange={setModalTab}
          tabs={[
            { id: "basic", label: "BASIC" },
            { id: "codec", label: "CODEC" },
            { id: "advance", label: "ADVANCE" },
            { id: "dod", label: "DOD" },
            { id: "adapt", label: "ADAPT CALLER ID" },
          ]}
        />

        <DialogContent
          style={{
            padding: "20px",
            backgroundColor: "#ffffff",
          }}
        >
          <style>
            {`
        .sip-reg .MuiOutlinedInput-root,
        .sip-reg .MuiSelect-root,
        .sip-reg .MuiSelect-select,
        .sip-reg .MuiInputBase-root input {
          background: #ffffff !important;
          border-radius: 6px !important;
        }

        .sip-reg .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline {
          border-color: ${OUTLINED_BORDER} !important;
          border-width: 1px !important;
        }

        .sip-reg .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
          border-color: ${OUTLINED_HOVER} !important;
        }

        .sip-reg .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: ${OUTLINED_FOCUS} !important;
          border-width: 2px !important;
        }

        

        .sip-reg label,
        .sip-reg .MuiFormControlLabel-label,
        .sip-reg .MuiInputLabel-root {
          color: ${TRUNK_FIELD_LABEL_COLOR} !important;
        }

        .sip-reg label {
          text-align: left !important;
        }

        .sip-reg .MuiFormControlLabel-label,
        .sip-reg .MuiInputLabel-root {
          font-size: 13px !important;
          font-weight: 600 !important;
        }

      `}
          </style>

          <div className="sip-reg" style={trunkModalFormPanelStyle}>
            {modalTab === "basic" && (
              <div className="p-3 sm:p-5">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-10 gap-y-0">
                  <div className="space-y-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Trunk Type <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1 min-w-0">
                        <RadioGroup
                          row
                          value={form.ui_trunk_type}
                          onChange={(e) =>
                            handleChange("ui_trunk_type", e.target.value)
                          }
                        >
                          <FormControlLabel
                            value="sip"
                            control={<Radio size="small" />}
                            label="SIP"
                          />
                        </RadioGroup>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Trunk Name <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1 min-w-0">
                        <TextField
                          size="small"
                          fullWidth
                          value={form.trunk_id || ""}
                          onChange={(e) =>
                            handleChange("trunk_id", e.target.value)
                          }
                          error={!!validationErrors.trunk_id}
                          placeholder="Trunk Name"
                          disabled={editIndex !== null}
                          inputProps={{ style: { fontSize: 13 } }}
                        />
                        {validationErrors.trunk_id && (
                          <div className="text-red-500 text-xs mt-0.5">
                            {validationErrors.trunk_id}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Select Country <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl
                          fullWidth
                          size="small"
                          error={!!validationErrors.ui_country}
                        >
                          <MuiSelect
                            value={form.ui_country}
                            onChange={(e) =>
                              handleChange("ui_country", e.target.value)
                            }
                            sx={{ fontSize: 13 }}
                          >
                            {SIP_REGISTER_COUNTRY_OPTIONS.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                        {validationErrors.ui_country && (
                          <div className="text-red-500 text-xs mt-0.5">
                            {validationErrors.ui_country}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Transport
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_transport}
                            onChange={(e) =>
                              handleChange("ui_transport", e.target.value)
                            }
                            sx={{ fontSize: 13 }}
                          >
                            {SIP_REGISTER_TRANSPORT_OPTIONS.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Enable SRTP
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!form.ui_enable_srtp}
                              onChange={(e) =>
                                handleChange("ui_enable_srtp", e.target.checked)
                              }
                              size="small"
                              sx={checkboxSx}
                            />
                          }
                          label=""
                          sx={{
                            checkboxSx,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Register <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_register}
                            onChange={(e) =>
                              handleChange("ui_register", e.target.value)
                            }
                            sx={{ fontSize: 13 }}
                          >
                            {SIP_REGISTER_YES_NO.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    {form.ui_register === "Yes" && (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                            Username <span className="text-red-500">*</span>
                          </label>
                          <div className="flex-1 min-w-0">
                            <TextField
                              size="small"
                              fullWidth
                              value={form.username || ""}
                              onChange={(e) =>
                                handleChange("username", e.target.value)
                              }
                              error={!!validationErrors.username}
                              placeholder="Username"
                              inputProps={{ style: { fontSize: 14 } }}
                            />
                            {validationErrors.username && (
                              <div className="text-red-500 text-xs mt-0.5">
                                {validationErrors.username}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                            Auth Username
                          </label>
                          <div className="flex-1 min-w-0">
                            <TextField
                              size="small"
                              fullWidth
                              value={form.auth_username || ""}
                              onChange={(e) =>
                                handleChange("auth_username", e.target.value)
                              }
                              inputProps={{ style: { fontSize: 14 } }}
                              placeholder="Auth Username"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                            RegFail Retry{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex-1 min-w-0">
                            <TextField
                              size="small"
                              fullWidth
                              value={form.ui_reg_fail_retry || ""}
                              onChange={(e) =>
                                handleChange(
                                  "ui_reg_fail_retry",
                                  e.target.value,
                                )
                              }
                              error={!!validationErrors.ui_reg_fail_retry}
                              placeholder="30"
                              inputProps={{ style: { fontSize: 14 } }}
                            />
                            {validationErrors.ui_reg_fail_retry && (
                              <div className="text-red-500 text-xs mt-0.5">
                                {validationErrors.ui_reg_fail_retry}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Outbound CallerId Source
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_outbound_cid_source}
                            onChange={(e) =>
                              handleChange(
                                "ui_outbound_cid_source",
                                e.target.value,
                              )
                            }
                            displayEmpty
                            sx={{ fontSize: 13 }}
                          >
                            {SIP_REGISTER_OUTBOUND_CID_SOURCE_OPTIONS.map(
                              (c) => (
                                <MenuItem key={c || "_empty"} value={c}>
                                  {c || <em>—</em>}
                                </MenuItem>
                              ),
                            )}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Record
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_record}
                            onChange={(e) =>
                              handleChange("ui_record", e.target.value)
                            }
                            sx={{ fontSize: 13 }}
                          >
                            {SIP_REGISTER_YES_NO.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Enabled <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_enabled}
                            onChange={(e) =>
                              handleChange("ui_enabled", e.target.value)
                            }
                            sx={{ fontSize: 13 }}
                          >
                            {SIP_REGISTER_YES_NO.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Eth Port <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_eth_port}
                            onChange={(e) =>
                              handleChange("ui_eth_port", e.target.value)
                            }
                            sx={{ fontSize: 13 }}
                          >
                            {(ethPortOptions.length
                              ? ethPortOptions
                              : SIP_REGISTER_ETH_PORT_OPTIONS.map((v) => ({
                                  value: v,
                                  label: v,
                                }))
                            ).map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Trunk IP/Domain <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1 min-w-0">
                        <TextField
                          size="small"
                          fullWidth
                          value={form.provider || ""}
                          onChange={(e) =>
                            handleChange("provider", e.target.value)
                          }
                          error={!!validationErrors.provider}
                          placeholder="host:port or domain"
                          inputProps={{ style: { fontSize: 13 } }}
                        />
                        {validationErrors.provider && (
                          <div className="text-red-500 text-xs mt-0.5">
                            {validationErrors.provider}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Show Outbound CallerID Name
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!form.ui_show_outbound_cid_name}
                              onChange={(e) =>
                                handleChange(
                                  "ui_show_outbound_cid_name",
                                  e.target.checked,
                                )
                              }
                              size="small"
                              sx={checkboxSx}
                            />
                          }
                          label=""
                          sx={checkboxSx}
                        />
                      </div>
                    </div>
                    {form.ui_show_outbound_cid_name && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                          Outbound CallerId Name
                        </label>
                        <div className="flex-1 min-w-0">
                          <TextField
                            size="small"
                            fullWidth
                            value={form.ui_outbound_cid_name}
                            onChange={(e) =>
                              handleChange(
                                "ui_outbound_cid_name",
                                e.target.value,
                              )
                            }
                            inputProps={{ style: { fontSize: 13 } }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Outbound CallerId Number
                      </label>
                      <div className="flex-1 min-w-0">
                        <TextField
                          size="small"
                          fullWidth
                          value={form.ui_outbound_cid_number}
                          onChange={(e) =>
                            handleChange(
                              "ui_outbound_cid_number",
                              e.target.value,
                            )
                          }
                          inputProps={{ style: { fontSize: 13 } }}
                        />
                      </div>
                    </div>

                    {form.ui_register === "Yes" && (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="flex-1 min-w-0">
                            <TextField
                              type={showPassword ? "text" : "password"}
                              size="small"
                              fullWidth
                              value={form.password || ""}
                              onChange={(e) =>
                                handleChange("password", e.target.value)
                              }
                              error={!!validationErrors.password}
                              inputProps={{ style: { fontSize: 14 } }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      size="small"
                                      onClick={togglePasswordVisibility}
                                      edge="end"
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
                            {validationErrors.password && (
                              <div className="text-red-500 text-xs mt-0.5">
                                {validationErrors.password}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                            Expire Seconds{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex-1 min-w-0">
                            <TextField
                              size="small"
                              fullWidth
                              value={form.expire_in_sec || ""}
                              onChange={(e) =>
                                handleChange("expire_in_sec", e.target.value)
                              }
                              error={!!validationErrors.expire_in_sec}
                              inputProps={{ style: { fontSize: 14 } }}
                            />
                            {validationErrors.expire_in_sec && (
                              <div className="text-red-500 text-xs mt-0.5">
                                {validationErrors.expire_in_sec}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                            Match Username{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex-1 min-w-0">
                            <FormControl
                              fullWidth
                              size="small"
                              error={!!validationErrors.ui_match_username}
                            >
                              <MuiSelect
                                value={form.ui_match_username || "Yes"}
                                onChange={(e) =>
                                  handleChange(
                                    "ui_match_username",
                                    e.target.value,
                                  )
                                }
                                sx={{ fontSize: 14 }}
                              >
                                {SIP_REGISTER_YES_NO.map((c) => (
                                  <MenuItem key={c} value={c}>
                                    {c}
                                  </MenuItem>
                                ))}
                              </MuiSelect>
                            </FormControl>
                            {validationErrors.ui_match_username && (
                              <div className="text-red-500 text-xs mt-0.5">
                                {validationErrors.ui_match_username}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                            Enable Proxy
                          </label>
                          <div className="flex-1 min-w-0 flex items-center">
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={!!form.ui_enable_proxy}
                                  onChange={(e) =>
                                    handleChange(
                                      "ui_enable_proxy",
                                      e.target.checked,
                                    )
                                  }
                                  size="small"
                                  sx={checkboxSx}
                                />
                              }
                              label=""
                              sx={checkboxSx}
                            />
                          </div>
                        </div>

                        {form.ui_enable_proxy && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                            <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                              Proxy IP <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-1 min-w-0">
                              <TextField
                                size="small"
                                fullWidth
                                value={form.ui_proxy_ip || ""}
                                onChange={(e) =>
                                  handleChange("ui_proxy_ip", e.target.value)
                                }
                                error={!!validationErrors.ui_proxy_ip}
                                inputProps={{ style: { fontSize: 14 } }}
                              />
                              {validationErrors.ui_proxy_ip && (
                                <div className="text-red-500 text-xs mt-0.5">
                                  {validationErrors.ui_proxy_ip}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {modalTab === "codec" && (
              <div className="p-3 sm:p-5 flex flex-col items-center">
                <p
                  className="text-[13px] mb-3 text-center"
                  style={{
                    color: TRUNK_SECTION_HEADING_COLOR,
                    fontWeight: 600,
                  }}
                >
                  Select codecs allowed on this trunk (required).
                </p>
                <FormGroup
                  row
                  sx={{ flexWrap: "wrap", gap: 1, justifyContent: "center" }}
                >
                  {CODEC_OPTIONS.map((codec) => (
                    <FormControlLabel
                      key={codec.value}
                      control={
                        <Checkbox
                          checked={isCodecSelected(codec.value)}
                          onChange={(e) =>
                            handleCodecChange(codec.value, e.target.checked)
                          }
                          size="small"
                          sx={checkboxSx}
                        />
                      }
                      label={codec.label}
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontSize: 13,
                          color: TRUNK_FIELD_LABEL_COLOR,
                          fontWeight: 600,
                        },
                      }}
                    />
                  ))}
                </FormGroup>
                {validationErrors.allow_codecs && (
                  <div className="text-red-500 text-xs mt-2 text-center">
                    {validationErrors.allow_codecs}
                  </div>
                )}
              </div>
            )}

            {modalTab === "advance" && (
              <div className="p-3 sm:p-5 space-y-6">
                <div className="hidden">
                  <h3 className="text-base font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-1">
                    SIP registration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
                        SIP Header
                      </label>
                      <div className="flex-1 min-w-0">
                        <TextField
                          size="small"
                          fullWidth
                          value={form.sip_header || ""}
                          onChange={(e) =>
                            handleChange("sip_header", e.target.value)
                          }
                          error={!!validationErrors.sip_header}
                          placeholder="+91...@sip.domain"
                          inputProps={{ style: { fontSize: 14 } }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span className="text-sm text-gray-600">
                                  sip:
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                        {validationErrors.sip_header && (
                          <div className="text-red-500 text-xs mt-0.5">
                            {validationErrors.sip_header}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
                        Server Domain
                      </label>
                      <div className="flex-1 min-w-0">
                        <TextField
                          size="small"
                          fullWidth
                          value={form.server_domain || ""}
                          onChange={(e) =>
                            handleChange("server_domain", e.target.value)
                          }
                          error={!!validationErrors.server_domain}
                          inputProps={{ style: { fontSize: 14 } }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span className="text-sm text-gray-600">
                                  sip:
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                        {validationErrors.server_domain && (
                          <div className="text-red-500 text-xs mt-0.5">
                            {validationErrors.server_domain}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
                        Client Domain
                      </label>
                      <div className="flex-1 min-w-0">
                        <TextField
                          size="small"
                          fullWidth
                          value={form.client_domain || ""}
                          onChange={(e) =>
                            handleChange("client_domain", e.target.value)
                          }
                          error={!!validationErrors.client_domain}
                          inputProps={{ style: { fontSize: 14 } }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span className="text-sm text-gray-600">
                                  sip:
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                        {validationErrors.client_domain && (
                          <div className="text-red-500 text-xs mt-0.5">
                            {validationErrors.client_domain}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
                        Outbound Proxy
                      </label>
                      <div className="flex-1 min-w-0">
                        <TextField
                          size="small"
                          fullWidth
                          value={form["Outbound Proxy"] || ""}
                          onChange={(e) =>
                            handleChange("Outbound Proxy", e.target.value)
                          }
                          inputProps={{ style: { fontSize: 14 } }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span className="text-sm text-gray-600">
                                  sip:
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
                        Identifier IP
                      </label>
                      <div className="flex-1 min-w-0">
                        <TextField
                          size="small"
                          fullWidth
                          value={form.identity_ip || ""}
                          onChange={(e) =>
                            handleChange("identity_ip", e.target.value)
                          }
                          error={!!validationErrors.identity_ip}
                          inputProps={{ style: { fontSize: 14 } }}
                        />
                        {validationErrors.identity_ip && (
                          <div className="text-red-500 text-xs mt-0.5">
                            {validationErrors.identity_ip}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <TrunkModalSectionHeading title="VoIP Settings" isFirst />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    {[
                      ["Get CalledID Type", "ui_get_called_id_type"],
                      ["OPTIONS Interval (s)", "ui_options_interval"],
                      ["TX Volume", "ui_tx_volume"],
                      ["RX Volume", "ui_rx_volume"],
                      ["From User", "from_user"],
                      ["From Domain", "Domain name"],
                    ].map(([lbl, key]) => (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1"
                      >
                        <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                          {lbl}
                        </label>
                        <div className="flex-1 min-w-0">
                          <TextField
                            size="small"
                            fullWidth
                            value={form[key] || ""}
                            onChange={(e) => handleChange(key, e.target.value)}
                            inputProps={{ style: { fontSize: 14 } }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Send Privacy ID
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_send_privacy_id}
                            onChange={(e) =>
                              handleChange("ui_send_privacy_id", e.target.value)
                            }
                            sx={{ fontSize: 14 }}
                          >
                            {SIP_REGISTER_YES_NO.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Sip Force Contact
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_sip_force_contact || ""}
                            displayEmpty
                            onChange={(e) =>
                              handleChange(
                                "ui_sip_force_contact",
                                e.target.value,
                              )
                            }
                            sx={{ fontSize: 14 }}
                          >
                            <MenuItem value="">
                              <em>—</em>
                            </MenuItem>
                            {SIP_REGISTER_YES_NO.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <TrunkModalSectionHeading title="Outbound parameters" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        P-Preferred-Identity
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_p_preferred_identity || "None"}
                            onChange={(e) =>
                              handleChange(
                                "ui_p_preferred_identity",
                                e.target.value,
                              )
                            }
                            sx={{ fontSize: 14 }}
                          >
                            {PREFERRED_ASSERTED_IDENTITY_OPTIONS.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Remote-Party-ID
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_remote_party_id || "None"}
                            onChange={(e) =>
                              handleChange("ui_remote_party_id", e.target.value)
                            }
                            sx={{ fontSize: 14 }}
                          >
                            {REMOTE_PARTY_ID_OPTIONS.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        P-Asserted-Identity
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_p_asserted_identity || "None"}
                            onChange={(e) =>
                              handleChange(
                                "ui_p_asserted_identity",
                                e.target.value,
                              )
                            }
                            sx={{ fontSize: 14 }}
                          >
                            {PREFERRED_ASSERTED_IDENTITY_OPTIONS.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Contact
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_contact_mode || "Trunk User Name"}
                            onChange={(e) =>
                              handleChange("ui_contact_mode", e.target.value)
                            }
                            sx={{ fontSize: 14 }}
                          >
                            {CONTACT_MODE_OPTIONS.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <TrunkModalSectionHeading title="Other Settings" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Limit Max Calls
                      </label>
                      <div className="flex-1 min-w-0">
                        <TextField
                          size="small"
                          fullWidth
                          value={form.ui_limit_max_calls}
                          onChange={(e) =>
                            handleChange("ui_limit_max_calls", e.target.value)
                          }
                          inputProps={{ style: { fontSize: 14 } }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Enable Early Session
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_enable_early_session}
                            onChange={(e) =>
                              handleChange(
                                "ui_enable_early_session",
                                e.target.value,
                              )
                            }
                            sx={{ fontSize: 14 }}
                          >
                            {SIP_REGISTER_YES_NO.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Enable Early Media
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_enable_early_media}
                            onChange={(e) =>
                              handleChange(
                                "ui_enable_early_media",
                                e.target.value,
                              )
                            }
                            sx={{ fontSize: 14 }}
                          >
                            {SIP_REGISTER_YES_NO.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        User Phone
                      </label>
                      <div className="flex-1 min-w-0 flex items-center">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!form.ui_user_phone}
                              onChange={(e) =>
                                handleChange("ui_user_phone", e.target.checked)
                              }
                              size="small"
                              sx={checkboxSx}
                            />
                          }
                          label=""
                          sx={checkboxSx}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Call Timeout(s)
                      </label>
                      <div className="flex-1 min-w-0">
                        <TextField
                          size="small"
                          fullWidth
                          value={form.ui_call_timeout}
                          onChange={(e) =>
                            handleChange("ui_call_timeout", e.target.value)
                          }
                          inputProps={{ style: { fontSize: 14 } }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        DTMF Transmit Mode
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ui_dtmf_transmit}
                            onChange={(e) =>
                              handleChange("ui_dtmf_transmit", e.target.value)
                            }
                            sx={{ fontSize: 14 }}
                          >
                            {SIP_REGISTER_DTMF_OPTIONS.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        Max Call Duration (s)
                      </label>
                      <div className="flex-1 min-w-0">
                        <TextField
                          size="small"
                          fullWidth
                          value={form.ui_max_call_duration}
                          onChange={(e) =>
                            handleChange("ui_max_call_duration", e.target.value)
                          }
                          inputProps={{ style: { fontSize: 14 } }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                      <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0">
                        DNIS
                      </label>
                      <div className="flex-1 min-w-0 flex items-center">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!form.ui_dnis}
                              onChange={(e) =>
                                handleChange("ui_dnis", e.target.checked)
                              }
                              size="small"
                              sx={checkboxSx}
                            />
                          }
                          label=""
                          sx={checkboxSx}
                        />
                      </div>
                    </div>
                  </div>
                  {form.ui_dnis && (
                    <div className="mt-3 bg-white border border-gray-200 rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="font-semibold"
                          style={{
                            fontSize: 13,
                            color: TRUNK_SECTION_HEADING_COLOR,
                          }}
                        >
                          DNIS Settings
                        </div>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setDnisRows((r) => [
                              ...r,
                              {
                                dnisNumber: "",
                                dnisName: "",
                                replaceCid: "No",
                              },
                            ])
                          }
                          sx={{ border: "1px solid #ccc", borderRadius: 1 }}
                          aria-label="add dnis row"
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </div>

                      <div className="overflow-x-auto border border-gray-200 rounded">
                        <table className="w-full min-w-[520px] text-sm">
                          <thead>
                            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                              <th className="p-2 text-left font-medium">
                                DNIS Number
                              </th>
                              <th className="p-2 text-left font-medium">
                                DNIS Name
                              </th>
                              <th className="p-2 text-left font-medium">
                                Replace CID
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {dnisRows.map((row, i) => (
                              <tr key={i} className="border-b border-gray-100">
                                <td className="p-1">
                                  <TextField
                                    size="small"
                                    fullWidth
                                    value={row.dnisNumber}
                                    onChange={(e) =>
                                      setDnisRows((prev) =>
                                        prev.map((x, j) =>
                                          j === i
                                            ? {
                                                ...x,
                                                dnisNumber: e.target.value,
                                              }
                                            : x,
                                        ),
                                      )
                                    }
                                    inputProps={{ style: { fontSize: 13 } }}
                                  />
                                </td>
                                <td className="p-1">
                                  <TextField
                                    size="small"
                                    fullWidth
                                    value={row.dnisName}
                                    onChange={(e) =>
                                      setDnisRows((prev) =>
                                        prev.map((x, j) =>
                                          j === i
                                            ? {
                                                ...x,
                                                dnisName: e.target.value,
                                              }
                                            : x,
                                        ),
                                      )
                                    }
                                    inputProps={{ style: { fontSize: 13 } }}
                                  />
                                </td>
                                <td className="p-1 w-[180px]">
                                  <FormControl fullWidth size="small">
                                    <MuiSelect
                                      value={row.replaceCid || "No"}
                                      onChange={(e) =>
                                        setDnisRows((prev) =>
                                          prev.map((x, j) =>
                                            j === i
                                              ? {
                                                  ...x,
                                                  replaceCid: e.target.value,
                                                }
                                              : x,
                                          ),
                                        )
                                      }
                                      sx={{ fontSize: 14 }}
                                    >
                                      {SIP_REGISTER_YES_NO.map((c) => (
                                        <MenuItem key={c} value={c}>
                                          {c}
                                        </MenuItem>
                                      ))}
                                    </MuiSelect>
                                  </FormControl>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {modalTab === "dod" && (
              <div className="p-3 sm:p-5">
                <div className="flex flex-wrap gap-2 mb-3">
                  {["ADD", "DELETE", "IMPORT", "EXPORT"].map((lbl) => (
                    <Btn
                      key={lbl}
                      type="button"
                      variant="cancel"
                      style={trunkDodToolbarBtnStyle}
                      onClick={() => {
                        if (lbl === "ADD") handleOpenDodAddModal();
                        else if (lbl === "DELETE") {
                          if (!dodSelected.length) {
                            showMessage("error", "Select DOD rows to delete");
                            return;
                          }
                          setDodRows((rows) =>
                            rows.filter((_, i) => !dodSelected.includes(i)),
                          );
                          setDodSelected([]);
                        } else
                          showMessage(
                            "info",
                            `${lbl} is not connected to the API yet.`,
                          );
                      }}
                    >
                      {lbl}
                    </Btn>
                  ))}
                </div>

                {showDodAddModal ? (
                  <div className="mt-2 bg-white border border-gray-200 rounded-md p-3 sm:p-4 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-4 w-full">
                      <div className="flex items-center gap-8 min-w-0">
                        <label
                          className="text-[13px] font-semibold text-[#3E5475] whitespace-nowrap shrink-0"
                          style={{ width: 110 }}
                        >
                          DOD Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="flex-1 min-w-0"
                          style={trunkDodCompactInputStyle}
                          value={dodAddName}
                          onChange={(e) => setDodAddName(e.target.value)}
                          {...nativeFieldInteraction}
                        />
                      </div>
                      <div className="flex items-center gap-8 min-w-0">
                        <label
                          className="text-[13px] font-semibold text-[#3E5475] whitespace-nowrap shrink-0"
                          style={{ width: 110 }}
                        >
                          DOD Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="flex-1 min-w-0"
                          style={trunkDodCompactInputStyle}
                          value={dodAddNumber}
                          onChange={(e) => setDodAddNumber(e.target.value)}
                          {...nativeFieldInteraction}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: 4 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 48px 1fr",
                          ...(isCompact
                            ? { gridTemplateColumns: "1fr", gap: 12 }
                            : {}),
                          gap: 12,
                          alignItems: "start",
                        }}
                      >
                        <div>
                          <div style={pbxDualListLabelStyle}>Available</div>
                          <select
                            multiple
                            value={dodAvailableSelectedInList}
                            onChange={(e) =>
                              setDodAvailableSelected(
                                Array.from(
                                  e.target.selectedOptions,
                                  (opt) => opt.value,
                                ),
                              )
                            }
                            style={pbxDualListSelectStyle}
                          >
                            {dodAvailableExtensions.length === 0 &&
                            !dodHasLoadedExtensionsRef.current ? (
                              <option disabled value="">
                                Loading extensions...
                              </option>
                            ) : dodAvailableList.length === 0 ? (
                              <option disabled value="">
                                No extensions
                              </option>
                            ) : (
                              dodAvailableList.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {getDodExtLabel(t.value)}
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            height: pbxDualListSelectStyle.height,
                            paddingTop: DOD_DUAL_LIST_LABEL_OFFSET,
                            boxSizing: "content-box",
                          }}
                        >
                          <PbxDualListBtn onClick={dodAddSelectedMembers}>
                            &gt;
                          </PbxDualListBtn>
                          <PbxDualListBtn onClick={dodAddAllMembers}>
                            &gt;&gt;
                          </PbxDualListBtn>
                          <PbxDualListBtn onClick={dodRemoveSelectedMembers}>
                            &lt;
                          </PbxDualListBtn>
                          <PbxDualListBtn onClick={dodRemoveAllMembers}>
                            &lt;&lt;
                          </PbxDualListBtn>
                        </div>

                        <div>
                          <div style={pbxDualListLabelStyle}>Selected</div>
                          <select
                            multiple
                            value={dodChosenSelected}
                            onChange={(e) =>
                              setDodChosenSelected(
                                Array.from(
                                  e.target.selectedOptions,
                                  (opt) => opt.value,
                                ),
                              )
                            }
                            style={pbxDualListSelectStyle}
                          >
                            {dodMemberExtensions.length === 0 ? (
                              <option disabled value="">
                                No selected extensions
                              </option>
                            ) : (
                              dodMemberExtensions.map((id) => (
                                <option key={id} value={id}>
                                  {getDodExtLabel(id)}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-4">
                      <Btn
                        type="button"
                        variant="primary"
                        onClick={handleConfirmDodAdd}
                        style={trunkDodToolbarBtnStyle}
                      >
                        ENSURE
                      </Btn>
                      <Btn
                        type="button"
                        variant="cancel"
                        onClick={() => {
                          setShowDodAddModal(false);
                          resetDodAddForm();
                        }}
                        style={trunkDodToolbarBtnStyle}
                      >
                        CANCEL
                      </Btn>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200 rounded">
                    <table className="w-full min-w-[480px] text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                          <th className="p-2 w-10 text-left">
                            <input
                              type="checkbox"
                              aria-label="select all dod"
                              onChange={(e) =>
                                e.target.checked
                                  ? setDodSelected(dodRows.map((_, i) => i))
                                  : setDodSelected([])
                              }
                              checked={
                                dodRows.length > 0 &&
                                dodSelected.length === dodRows.length
                              }
                            />
                          </th>
                          <th className="p-2 text-left font-medium">
                            DOD Number
                          </th>
                          <th className="p-2 text-left font-medium">
                            DOD Name
                          </th>
                          <th className="p-2 text-left font-medium">
                            Bind Extension
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dodRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="p-6 text-center text-gray-400"
                            >
                              No DOD entries. Click ADD to add a row.
                            </td>
                          </tr>
                        ) : (
                          dodRows.map((row, i) => (
                            <tr key={i} className="border-b border-gray-100">
                              <td className="p-2">
                                <input
                                  type="checkbox"
                                  checked={dodSelected.includes(i)}
                                  onChange={() =>
                                    setDodSelected((s) =>
                                      s.includes(i)
                                        ? s.filter((x) => x !== i)
                                        : [...s, i],
                                    )
                                  }
                                />
                              </td>
                              <td className="p-1">
                                <TextField
                                  size="small"
                                  fullWidth
                                  value={row.dodNumber}
                                  onChange={(e) =>
                                    setDodRows((rows) =>
                                      rows.map((x, j) =>
                                        j === i
                                          ? {
                                              ...x,
                                              dodNumber: e.target.value,
                                            }
                                          : x,
                                      ),
                                    )
                                  }
                                  sx={muiTextFieldSx}
                                  inputProps={{ style: { fontSize: 13 } }}
                                />
                              </td>
                              <td className="p-1">
                                <TextField
                                  size="small"
                                  fullWidth
                                  value={row.dodName}
                                  onChange={(e) =>
                                    setDodRows((rows) =>
                                      rows.map((x, j) =>
                                        j === i
                                          ? { ...x, dodName: e.target.value }
                                          : x,
                                      ),
                                    )
                                  }
                                  sx={muiTextFieldSx}
                                  inputProps={{ style: { fontSize: 13 } }}
                                />
                              </td>
                              <td className="p-1">
                                <TextField
                                  size="small"
                                  fullWidth
                                  value={
                                    Array.isArray(row.bindExtensions)
                                      ? row.bindExtensions.join(", ")
                                      : row.bindExtension || ""
                                  }
                                  onChange={(e) => {
                                    const raw = e.target.value || "";
                                    const list = raw
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean);
                                    setDodRows((rows) =>
                                      rows.map((x, j) =>
                                        j === i
                                          ? {
                                              ...x,
                                              bindExtensions: list,
                                              bindExtension: raw,
                                            }
                                          : x,
                                      ),
                                    );
                                  }}
                                  sx={muiTextFieldSx}
                                  inputProps={{ style: { fontSize: 13 } }}
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {modalTab === "adapt" && (
              <div className="p-3 sm:p-5">
                <div
                  className="grid gap-2 items-center text-[12px] font-semibold border-b border-gray-200 pb-2 mb-3"
                  style={{
                    gridTemplateColumns: "1fr 1fr 1fr 32px",
                  }}
                >
                  <span style={{ color: TRUNK_FIELD_LABEL_COLOR }}>
                    Match Mode
                  </span>
                  <span style={{ color: TRUNK_FIELD_LABEL_COLOR }}>Strip</span>
                  <span style={{ color: TRUNK_FIELD_LABEL_COLOR }}>
                    Prepend
                  </span>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setAdaptRows((r) => [
                        ...r,
                        { matchMode: "", strip: "", prepend: "" },
                      ])
                    }
                    sx={trunkAdaptRowActionBtnSx}
                    aria-label="add adapt row"
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </div>
                <div className="space-y-2">
                  {adaptRows.map((row, i) => (
                    <div
                      key={i}
                      className="grid gap-2 items-center"
                      style={{
                        gridTemplateColumns:
                          adaptRows.length > 1
                            ? "1fr 1fr 1fr 32px"
                            : "1fr 1fr 1fr",
                      }}
                    >
                      <TextField
                        size="small"
                        placeholder="Match"
                        value={row.matchMode}
                        onChange={(e) =>
                          setAdaptRows((r) =>
                            r.map((x, j) =>
                              j === i ? { ...x, matchMode: e.target.value } : x,
                            ),
                          )
                        }
                        sx={trunkAdaptTextFieldSx}
                      />
                      <TextField
                        size="small"
                        placeholder="Strip"
                        value={row.strip}
                        onChange={(e) =>
                          setAdaptRows((r) =>
                            r.map((x, j) =>
                              j === i ? { ...x, strip: e.target.value } : x,
                            ),
                          )
                        }
                        sx={trunkAdaptTextFieldSx}
                      />
                      <TextField
                        size="small"
                        placeholder="Prepend"
                        value={row.prepend}
                        onChange={(e) =>
                          setAdaptRows((r) =>
                            r.map((x, j) =>
                              j === i ? { ...x, prepend: e.target.value } : x,
                            ),
                          )
                        }
                        sx={trunkAdaptTextFieldSx}
                      />
                      {adaptRows.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() =>
                            setAdaptRows((r) => r.filter((_, j) => j !== i))
                          }
                          sx={trunkAdaptRowActionBtnSx}
                          aria-label="remove adapt row"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions style={trunkModalActionsStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={trunkModalPrimaryBtnStyle}
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} color="inherit" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={trunkModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SipRegisterPage;
