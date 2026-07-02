import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  OUTBOUND_ROUTE_DEFAULT_CALLER_CONVERSION,
  OUTBOUND_ROUTE_DEFAULT_DIAL_PATTERN,
  OUTBOUND_ROUTE_ENABLE_OPTIONS,
  OUTBOUND_ROUTE_FIELD_TOOLTIPS,
  OUTBOUND_ROUTE_PASSWORD_OPTIONS,
  OUTBOUND_ROUTE_REMEMORY_HUNT_OPTIONS,
  OUTBOUND_ROUTE_TIME_CONDITION_OPTIONS,
} from "../../../constants/OutboundRouteConstants";
import {
  createOutboundRoute,
  deleteOutboundRoute,
  fetchSipAccounts,
  listOutboundRoutes,
  listSipRegistrations,
  updateOutboundRoute,
} from "../../../api/apiService";

const OUTBOUND_ROUTE_COMPACT_MQ = "(max-width: 768px)";

// ── Color Palette ─────────────────────────────────────────────────────────────
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
  successGreen: "#16a34a",
  errorRed: "#dc2626",
  codecBoxBorder: "#c5ccd6",
  codecBoxAvailableBg: "#f8fafc",
  codecStripBg: "#ffffff",
  codecStripBorder: "#ced4de",
  codecStripSelectedBg: "#f1f5f9",
  codecStripSelectedBorder: "#8fa3b8",
  codecBtnBorder: "#9ca3af",
  codecBtnBg: "#d9dde3",
  placeholderText: "#94a3b8",
};

// ── Local page UI ──
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  title,
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

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
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

const outboundRouteTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const getOutboundRouteRowBg = (isSelected, idx) =>
  isSelected ? "#eff6ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

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

const addNewModalFooterCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const outboundRouteModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const outboundRoutePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const outboundRoutePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const OutboundRouteBreadcrumb = ({ section, current, style }) => (
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

const OUTBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD = 10;
const OUTBOUND_ROUTE_LIST_DISPLAY_LIMIT = 6;

const formatOutboundRouteItemListDisplay = (
  items,
  {
    threshold = OUTBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD,
    limit = OUTBOUND_ROUTE_LIST_DISPLAY_LIMIT,
    mapItem = (x) => String(x),
    separator = ", ",
    ellipsis = "....",
  } = {},
) => {
  if (!items?.length) return "";
  const labels = items.map(mapItem).filter((v) => v !== "" && v != null);
  if (!labels.length) return "";
  if (labels.length <= threshold) {
    return labels.join(separator);
  }
  return `${labels.slice(0, limit).join(separator)}${ellipsis}`;
};

const OUTBOUND_ROUTE_MODAL_SECTION_BG = "#f8fafc";
const OUTBOUND_ROUTE_MODAL_SECTION_HEADING_COLOR = "#30415A";

const OUTBOUND_ROUTE_TOOLTIP_PROPS = {
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
      },
    },
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

const formatOutboundTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const OutboundFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = OUTBOUND_ROUTE_FIELD_TOOLTIPS[tooltipKey] || "";
  const label = (
    <span
      style={{
        fontSize: 13,
        color: C.labelText,
        fontWeight: 600,
        whiteSpace: "nowrap",
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return label;
  return (
    <Tooltip
      title={formatOutboundTooltipTitle(tooltip)}
      {...OUTBOUND_ROUTE_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const OutboundRouteModalSectionHeading = ({ title, tooltipKey, isFirst = false }) => {
  const heading = (
    <span
      style={{
        position: "absolute",
        top: -10,
        left: -6,
        background: OUTBOUND_ROUTE_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: OUTBOUND_ROUTE_MODAL_SECTION_HEADING_COLOR,
        cursor: tooltipKey ? "help" : undefined,
      }}
    >
      {title}
    </span>
  );
  const tooltip = tooltipKey ? OUTBOUND_ROUTE_FIELD_TOOLTIPS[tooltipKey] : "";
  return (
    <div
      style={{
        margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
      {tooltip ? (
        <Tooltip
          title={formatOutboundTooltipTitle(tooltip)}
          {...OUTBOUND_ROUTE_TOOLTIP_PROPS}
        >
          {heading}
        </Tooltip>
      ) : (
        heading
      )}
    </div>
  );
};

const outboundRouteDualListLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "center",
  marginBottom: 8,
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const outboundRouteOutlinedInputRootSx = {
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

const outboundRouteModalTextFieldSx = {
  "& .MuiOutlinedInput-root": outboundRouteOutlinedInputRootSx,
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
    fontSize: 13,
    padding: "8px 12px",
  },
};

const outboundRouteModalTextFieldFullSx = {
  ...outboundRouteModalTextFieldSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...outboundRouteOutlinedInputRootSx,
    minHeight: 36,
    height: 36,
    fontSize: 13,
  },
  "& .MuiOutlinedInput-input": {
    padding: "7px 10px",
    fontSize: 13,
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
};

const outboundRouteModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...outboundRouteOutlinedInputRootSx,
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

const nativeFieldInputStyle = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: "#0f172a",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

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

const getNativeFieldInteraction = (disabled) =>
  disabled ? {} : nativeFieldInteraction;

const outboundRouteModalPaperSx = {
  width: 900,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const outboundRouteModalDialogContentSx = {
  maxHeight: "calc(100vh - 180px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const outboundRouteModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const OUTBOUND_ROUTE_TABLE_CARD_RADIUS = 10;

const outboundRouteCardStyle = {
  background: "#ffffff",
  borderRadius: OUTBOUND_ROUTE_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const outboundRouteToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: OUTBOUND_ROUTE_TABLE_CARD_RADIUS,
  borderTopRightRadius: OUTBOUND_ROUTE_TABLE_CARD_RADIUS,
};

const outboundRoutePaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: OUTBOUND_ROUTE_TABLE_CARD_RADIUS,
  borderBottomRightRadius: OUTBOUND_ROUTE_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const outboundRouteSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const outboundRouteCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const outboundRoutePrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const outboundRoutePageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const outboundRouteFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const outboundRouteModalFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  overflow: "hidden",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const OutboundRoutePagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  style,
}) => (
  <div style={{ ...outboundRoutePaginationStyle, ...style }}>
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
      <span style={outboundRoutePageBadgeStyle}>
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

const OUTBOUND_ROUTE_CODEC_LIST_BOX_HEIGHT = 188;
const OUTBOUND_ROUTE_CODEC_BTN_COL_WIDTH = 40;
const OUTBOUND_ROUTE_CODEC_BTN_GAP = 6;
const OUTBOUND_ROUTE_CODEC_BTN_HEIGHT =
  (OUTBOUND_ROUTE_CODEC_LIST_BOX_HEIGHT - OUTBOUND_ROUTE_CODEC_BTN_GAP * 3) / 4;
const OUTBOUND_ROUTE_CODEC_LIST_LABEL_OFFSET = 28;

const getOutboundRouteCodecListBoxStyle = (isEmpty) => ({
  width: "100%",
  minHeight: OUTBOUND_ROUTE_CODEC_LIST_BOX_HEIGHT,
  height: OUTBOUND_ROUTE_CODEC_LIST_BOX_HEIGHT,
  border: `1px solid ${C.codecBoxBorder}`,
  background: C.codecBoxAvailableBg,
  borderRadius: 6,
  padding: isEmpty ? 0 : "8px 8px",
  boxSizing: "border-box",
  overflowY: "auto",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: isEmpty ? "center" : "stretch",
  justifyContent: isEmpty ? "center" : "flex-start",
  gap: 4,
});

const outboundRouteCodecListEmptyStyle = {
  color: C.placeholderText,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "center",
  userSelect: "none",
  padding: "0 16px",
};

const outboundRouteCodecStripStyle = (isSelected) => ({
  display: "block",
  width: "100%",
  padding: "6px 8px",
  borderRadius: 5,
  fontSize: 13,
  fontWeight: 400,
  color: C.valueText,
  textAlign: "center",
  background: isSelected ? C.codecStripSelectedBg : C.codecStripBg,
  border: `1px solid ${isSelected ? C.codecStripSelectedBorder : C.codecStripBorder}`,
  cursor: "pointer",
  userSelect: "none",
  boxSizing: "border-box",
  lineHeight: 1.35,
  flexShrink: 0,
  transition: "background 0.12s ease, border-color 0.12s ease",
});

const outboundRouteCodecDualListBtnStyle = {
  width: OUTBOUND_ROUTE_CODEC_BTN_COL_WIDTH,
  height: OUTBOUND_ROUTE_CODEC_BTN_HEIGHT,
  borderRadius: 6,
  border: `1px solid ${C.codecBtnBorder}`,
  background: C.codecBtnBg,
  color: "#111827",
  fontSize: 12,
  fontWeight: 600,
  fontFamily: "inherit",
  lineHeight: 1,
  padding: 0,
  margin: 0,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  flexShrink: 0,
  boxShadow: "none",
  transition: "background 0.12s ease, transform 0.1s ease, box-shadow 0.1s ease",
  userSelect: "none",
};

const outboundRouteCodecDualListReorderBtnStyle = {
  ...outboundRouteCodecDualListBtnStyle,
  fontSize: 11,
  fontWeight: 500,
  color: C.mutedText,
};

const outboundRouteCodecBtnColumnStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: OUTBOUND_ROUTE_CODEC_BTN_GAP,
  height: OUTBOUND_ROUTE_CODEC_LIST_BOX_HEIGHT,
  width: OUTBOUND_ROUTE_CODEC_BTN_COL_WIDTH,
};

const OutboundRouteCodecDualListBtn = ({ onClick, title, children, reorder }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={
      reorder
        ? outboundRouteCodecDualListReorderBtnStyle
        : outboundRouteCodecDualListBtnStyle
    }
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#c5cbd3";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = C.codecBtnBg;
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "none";
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.background = "#b3bac4";
      e.currentTarget.style.transform = "translateY(1px) scale(0.96)";
      e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(15, 23, 42, 0.15)";
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.background = "#c5cbd3";
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    {children}
  </button>
);

const OutboundRouteCodecListBox = ({
  items,
  selectedIds,
  onToggle,
  emptyText,
  getLabel,
}) => {
  const isEmpty = items.length === 0;
  return (
    <div style={getOutboundRouteCodecListBoxStyle(isEmpty)}>
      {isEmpty ? (
        <div style={outboundRouteCodecListEmptyStyle}>{emptyText}</div>
      ) : (
        items.map((item) => {
          const id =
            typeof item === "string" ? item : (item.value ?? item.id);
          const label = getLabel ? getLabel(id) : item.label || id;
          const isSelected = selectedIds.includes(id);
          return (
            <div
              key={id}
              role="option"
              aria-selected={isSelected}
              onClick={() => onToggle(id)}
              style={outboundRouteCodecStripStyle(isSelected)}
            >
              {label}
            </div>
          );
        })
      )}
    </div>
  );
};

const OUTBOUND_ROUTE_MODAL_LABEL_WIDTH = 185;
const OUTBOUND_ROUTE_MODAL_FIELD_WIDTH = 210;
const OUTBOUND_ROUTE_RIGHT_LABEL_PADDING_LEFT = 28;

const FieldRow = ({
  label,
  tooltipKey,
  children,
  wide = false,
  labelWidth = 130,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: wide ? "flex-start" : "center",
      gap: 12,
      width: "100%",
      minHeight: 36,
    }}
  >
    {tooltipKey ? (
      <OutboundFieldLabel
        tooltipKey={tooltipKey}
        style={{
          textAlign: "left",
          minWidth: labelWidth,
          width: "auto",
          flexShrink: 0,
          paddingTop: wide ? 4 : 0,
        }}
      >
        {label}
      </OutboundFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          color: C.labelText,
          fontWeight: 600,
          whiteSpace: "nowrap",
          textAlign: "left",
          minWidth: labelWidth,
          width: "auto",
          flexShrink: 0,
          paddingTop: wide ? 4 : 0,
        }}
      >
        {label}
      </label>
    )}
    <div style={{ flex: 1, minWidth: 0, width: "100%" }}>{children}</div>
  </div>
);

const outboundRouteModalControlSx = {
  ...outboundRouteModalTextFieldFullSx,
  "& .MuiOutlinedInput-root": {
    ...outboundRouteModalTextFieldFullSx["& .MuiOutlinedInput-root"],
    height: 36,
    minHeight: 36,
  },
};

const OutboundLeftField = ({ children }) => (
  <div
    style={{
      width: OUTBOUND_ROUTE_MODAL_FIELD_WIDTH,
      maxWidth: "100%",
      minHeight: 36,
      display: "flex",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

const OutboundRightRow = ({
  label,
  tooltipKey,
  children,
  fieldWidth = OUTBOUND_ROUTE_MODAL_FIELD_WIDTH,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
      minHeight: 36,
    }}
  >
    {tooltipKey ? (
      <OutboundFieldLabel
        tooltipKey={tooltipKey}
        style={{
          textAlign: "left",
          width: OUTBOUND_ROUTE_MODAL_LABEL_WIDTH,
          minWidth: OUTBOUND_ROUTE_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          paddingLeft: OUTBOUND_ROUTE_RIGHT_LABEL_PADDING_LEFT,
          boxSizing: "border-box",
        }}
      >
        {label}
      </OutboundFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          color: C.labelText,
          fontWeight: 600,
          whiteSpace: "nowrap",
          textAlign: "left",
          width: OUTBOUND_ROUTE_MODAL_LABEL_WIDTH,
          minWidth: OUTBOUND_ROUTE_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          paddingLeft: OUTBOUND_ROUTE_RIGHT_LABEL_PADDING_LEFT,
          boxSizing: "border-box",
        }}
      >
        {label}
      </label>
    )}
    <div style={{ width: fieldWidth, flexShrink: 0 }}>{children}</div>
  </div>
);

const outboundRightColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  width: "100%",
};

const SectionCard = ({ title, tooltipKey, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <OutboundRouteModalSectionHeading
      title={title}
      tooltipKey={tooltipKey}
      isFirst={isFirst}
    />
    <div>{children}</div>
  </div>
);

const outboundCompactInputStyle = {
  ...nativeFieldInputStyle,
  width: "100%",
  height: 36,
  padding: "7px 10px",
};

const outboundPatternActionBtnStyle = {
  height: 32,
  width: 32,
  border: "1px solid #6b7280",
  backgroundColor: "#d9dde3",
  color: "#111827",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  borderRadius: 4,
  padding: 0,
  lineHeight: 1,
};

const OutboundRoutesPage = () => {
  const isCompact = useMediaQuery(OUTBOUND_ROUTE_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
    members: false,
    trunks: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedMembersRef = useRef(false);
  const hasLoadedTrunksRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [nextRoute, setNextRoute] = useState(false);
  const [enabled, setEnabled] = useState("Yes");
  const [passwordType, setPasswordType] = useState("None");
  const [singlePin, setSinglePin] = useState("");
  const [rememoryHunt, setRememoryHunt] = useState("No");
  const [timeConditions, setTimeConditions] = useState([]);
  const [dialPatterns, setDialPatterns] = useState([
    { ...OUTBOUND_ROUTE_DEFAULT_DIAL_PATTERN },
  ]);
  const [callerConversion, setCallerConversion] = useState({
    ...OUTBOUND_ROUTE_DEFAULT_CALLER_CONVERSION,
  });

  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);
  const [availableExtensionSelected, setAvailableExtensionSelected] = useState(
    [],
  );
  const [chosenExtensionSelected, setChosenExtensionSelected] = useState([]);

  const [availableTrunks, setAvailableTrunks] = useState([]);
  const [memberTrunks, setMemberTrunks] = useState([]);
  const [availableTrunkSelected, setAvailableTrunkSelected] = useState([]);
  const [chosenTrunkSelected, setChosenTrunkSelected] = useState([]);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage((current) =>
      Math.min(
        Math.max(1, current),
        Math.max(1, Math.ceil(rows.length / itemsPerPage)),
      ),
    );
  }, [rows]);

  const [message, setMessage] = useState({ type: "", text: "" });
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };
  const showAlert = (text) => showMessage("error", text);

  const normalizeList = (raw) => {
    const list = raw?.message ?? raw?.data ?? raw;
    return Array.isArray(list) ? list : [];
  };

  const toUiYesNo = (value, defaultValue = "No") => {
    if (typeof value === "string") {
      const normalized = value.toLowerCase();
      if (normalized === "yes") return "Yes";
      if (normalized === "no") return "No";
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return defaultValue;
  };

  const toApiYesNo = (value, defaultValue = "no") => {
    const normalized = String(value || "").toLowerCase();
    if (normalized === "yes") return "yes";
    if (normalized === "no") return "no";
    return defaultValue;
  };

  const mapPasswordTypeToUi = (apiValue) =>
    String(apiValue || "").toLowerCase() === "single_pin"
      ? "Single Pin"
      : "None";
  const mapPasswordTypeToApi = (uiValue) =>
    uiValue === "Single Pin" ? "single_pin" : "none";

  const mapRouteFromApi = (item) => {
    const timeCond = item?.time_condition || {};
    const callerConv = item?.caller_number_conversion || {};
    const dial = Array.isArray(item?.dial_patterns) ? item.dial_patterns : [];

    const uiTime = [];
    const all = !!timeCond?.all;
    if (timeCond?.work_time) uiTime.push("WorkTime");
    if (all) uiTime.push("All");
    if (all && timeCond?.holiday) uiTime.push("Holiday");

    const parsedNextRoute =
      typeof item?.next_route === "string"
        ? item.next_route.toLowerCase() === "yes"
        : !!item?.next_route;

    const parsedRmemory =
      typeof item?.rrmemory_hunt === "string"
        ? item.rrmemory_hunt.toLowerCase() === "yes"
        : !!(item?.rrmemory_hunt ?? item?.rrmemory_hunt);

    return {
      id: item?.id,
      name: String(item?.name || ""),
      priority: String(item?.priority ?? ""),
      description: String(item?.description || ""),
      nextRoute: parsedNextRoute,
      enabled: toUiYesNo(item?.enabled, "Yes"),
      passwordType: mapPasswordTypeToUi(item?.password_type),
      singlePin: item?.password_pin != null ? String(item.password_pin) : "",
      rememoryHunt: parsedRmemory ? "Yes" : "No",
      timeConditions: uiTime,
      callerConversion: {
        strip: String(callerConv?.strip ?? 0),
        front: String(callerConv?.front ?? ""),
        suffix: String(callerConv?.suffix ?? ""),
      },
      memberExtensions: Array.isArray(item?.member_extensions)
        ? item.member_extensions.map(String)
        : [],
      memberTrunks: Array.isArray(item?.member_trunks)
        ? item.member_trunks.map(String)
        : [],
      dialPatterns:
        dial.length > 0
          ? dial.map((d) => ({
              pattern: String(d?.pattern ?? ""),
              strip: String(d?.strip ?? 0),
              front: String(d?.front ?? ""),
              suffix: String(d?.suffix ?? ""),
              delay: String(d?.delay_ms ?? 0),
            }))
          : [{ ...OUTBOUND_ROUTE_DEFAULT_DIAL_PATTERN, pattern: "^\\d*$" }],
    };
  };

  const fetchOutboundRoutes = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listOutboundRoutes();
      if (!res?.response) {
        showAlert(res?.message || "Failed to load outbound routes.");
        setRows([]);
        return;
      }
      setRows(normalizeList(res).map(mapRouteFromApi));
    } catch (err) {
      showAlert(err?.message || "Failed to load outbound routes.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, members: true }));
    try {
      const res = await fetchSipAccounts();
      const list = normalizeList(res)
        .map((item) => {
          const ext = item?.extension ?? item?.ext ?? item?.id ?? item;
          const display = item?.display_name ?? item?.name ?? "";
          return {
            id: String(ext ?? ""),
            label: display
              ? `${String(ext ?? "")}-${display}`
              : String(ext ?? ""),
          };
        })
        .filter((item) => item.id);
      setAvailableExtensions(list);
      hasLoadedMembersRef.current = true;
    } catch (err) {
      showAlert(err?.message || "Failed to load extension list.");
      setAvailableExtensions([]);
    } finally {
      setLoading((prev) => ({ ...prev, members: false }));
    }
  };

  const loadTrunks = async () => {
    setLoading((prev) => ({ ...prev, trunks: true }));
    try {
      const res = await listSipRegistrations();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      const trunks = list
        .map((t) => {
          const id = t?.trunkId || t?.trunk_id || t?.id || t;
          const name = t?.name || t?.trunk_name || "";
          const domain =
            t?.domain_id || t?.domain || t?.sip_server || t?.host || "";
          const label =
            name && domain
              ? `${name} : ${domain}`
              : name
                ? name
                : domain
                  ? domain
                  : String(id || "");
          return { id: String(id), label };
        })
        .filter((t) => t.id);
      setAvailableTrunks(trunks);
      hasLoadedTrunksRef.current = true;
    } catch (err) {
      showAlert(err?.message || "Failed to load trunk list.");
      setAvailableTrunks([]);
    } finally {
      setLoading((prev) => ({ ...prev, trunks: false }));
    }
  };

  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((item) => map.set(item.id, item.label));
    return map;
  }, [availableExtensions]);

  const trunkLabelMap = useMemo(() => {
    const map = new Map();
    availableTrunks.forEach((item) => map.set(item.id, item.label));
    return map;
  }, [availableTrunks]);

  const getExtensionLabel = (id) => extensionLabelMap.get(id) || id;
  const getTrunkLabel = (id) => trunkLabelMap.get(id) || id;

  const extensionAvailableList = useMemo(
    () =>
      availableExtensions.filter((item) => !memberExtensions.includes(item.id)),
    [availableExtensions, memberExtensions],
  );

  const trunkAvailableList = useMemo(
    () => availableTrunks.filter((item) => !memberTrunks.includes(item.id)),
    [availableTrunks, memberTrunks],
  );

  const resetForm = () => {
    setEditId(null);
    setName("");
    setPriority("");
    setDescription("");
    setNextRoute(false);
    setEnabled("Yes");
    setPasswordType("None");
    setSinglePin("");
    setRememoryHunt("No");
    setTimeConditions([]);
    setDialPatterns([{ ...OUTBOUND_ROUTE_DEFAULT_DIAL_PATTERN, pattern: "^\\d*$" }]);
    setCallerConversion({ ...OUTBOUND_ROUTE_DEFAULT_CALLER_CONVERSION });
    setMemberExtensions([]);
    setMemberTrunks([]);
    setAvailableExtensionSelected([]);
    setChosenExtensionSelected([]);
    setAvailableTrunkSelected([]);
    setChosenTrunkSelected([]);
  };

  const ensureFormListsLoaded = async () => {
    const promises = [];
    if (!hasLoadedMembersRef.current) promises.push(loadExtensions());
    if (!hasLoadedTrunksRef.current) promises.push(loadTrunks());
    if (promises.length > 0) await Promise.allSettled(promises);
  };

  useEffect(() => {
    const load = async () => {
      await Promise.allSettled([loadExtensions(), loadTrunks()]);
      await fetchOutboundRoutes();
    };
    load();
  }, []);

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    await ensureFormListsLoaded();
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setPriority(row.priority || "");
    setDescription(row.description || "");
    setNextRoute(!!row.nextRoute);
    setEnabled(row.enabled || "Yes");
    setPasswordType(row.passwordType || "None");
    setSinglePin(row.singlePin || "");
    setRememoryHunt(row.rememoryHunt || "No");
    setTimeConditions(
      Array.isArray(row.timeConditions) ? row.timeConditions : [],
    );
    setDialPatterns(
      Array.isArray(row.dialPatterns) && row.dialPatterns.length > 0
        ? row.dialPatterns
        : [{ ...OUTBOUND_ROUTE_DEFAULT_DIAL_PATTERN }],
    );
    setCallerConversion(
      row.callerConversion || { ...OUTBOUND_ROUTE_DEFAULT_CALLER_CONVERSION },
    );
    setMemberExtensions(
      Array.isArray(row.memberExtensions) ? row.memberExtensions : [],
    );
    setMemberTrunks(Array.isArray(row.memberTrunks) ? row.memberTrunks : []);
    setAvailableExtensionSelected([]);
    setChosenExtensionSelected([]);
    setAvailableTrunkSelected([]);
    setChosenTrunkSelected([]);
    setShowModal(true);
    await ensureFormListsLoaded();
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleCheckAll = () => setSelected(rows.map((_, i) => i));
  const handleUncheckAll = () => setSelected([]);
  const handleSelectRow = (idx) =>
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert("Please select at least one row to delete.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} record(s)?`,
      )
    )
      return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const idsToDelete = selected
        .map((idx) => rows[idx]?.id)
        .filter((id) => id != null);
      const results = await Promise.all(
        idsToDelete.map((id) => deleteOutboundRoute(id)),
      );
      const failed = results.find((r) => !r?.response);
      if (failed)
        showAlert(failed?.message || "Failed to delete one or more routes.");
      else showMessage("success", "Outbound route(s) deleted successfully.");
      await fetchOutboundRoutes();
      setSelected([]);
      setPage(1);
    } catch (err) {
      showAlert(err?.message || "Failed to delete route(s).");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showAlert("Name is required.");
      return;
    }
    const parsedPriority = Number(priority);
    if (
      !Number.isInteger(parsedPriority) ||
      parsedPriority < 1 ||
      parsedPriority > 99999
    ) {
      showAlert("Priority must be a number between 1 and 99999.");
      return;
    }
    if (passwordType === "Single Pin" && !singlePin.trim()) {
      showAlert("Please enter password for Single Pin.");
      return;
    }
    if (passwordType === "Single Pin" && !/^\d{1,16}$/.test(singlePin.trim())) {
      showAlert("Password PIN must be digits only (1–16 digits).");
      return;
    }
    if (memberExtensions.length === 0) {
      showAlert("Please select at least one member extension.");
      return;
    }
    if (memberTrunks.length === 0) {
      showAlert("Please select at least one member trunk.");
      return;
    }
    if (timeConditions.includes("Holiday") && !timeConditions.includes("All")) {
      showAlert("Holiday is only valid when All is checked.");
      return;
    }

    const time_condition = {
      work_time: timeConditions.includes("WorkTime"),
      holiday: timeConditions.includes("Holiday"),
      all: timeConditions.includes("All"),
    };

    const dial_patterns = dialPatterns
      .filter((d) => String(d.pattern || "").trim())
      .map((d) => ({
        pattern: String(d.pattern || "").trim(),
        strip: Number(d.strip || 0),
        front: String(d.front || ""),
        suffix: String(d.suffix || ""),
        delay_ms: Number(d.delay || 0),
      }));

    const apiPayload = {
      name: trimmedName,
      priority: parsedPriority,
      description: description || null,
      next_route: toApiYesNo(nextRoute ? "yes" : "no", "yes"),
      enabled: toApiYesNo(enabled, "yes"),
      password_type: mapPasswordTypeToApi(passwordType),
      password_pin: passwordType === "Single Pin" ? singlePin.trim() : null,
      rrmemory_hunt: toApiYesNo(rememoryHunt, "no"),
      time_condition,
      dial_patterns:
        dial_patterns.length > 0 ? dial_patterns : [{ pattern: "^\\d*$" }],
      caller_number_conversion: {
        strip: Number(callerConversion.strip || 0),
        front: String(callerConversion.front || ""),
        suffix: String(callerConversion.suffix || ""),
      },
      member_extensions: [...memberExtensions],
      member_trunks: [...memberTrunks],
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const res =
        editId != null
          ? await updateOutboundRoute(editId, apiPayload)
          : await createOutboundRoute(apiPayload);
      if (!res?.response) {
        showAlert(res?.message || "Failed to save outbound route.");
        return;
      }
      showMessage(
        "success",
        editId != null
          ? "Outbound route updated successfully."
          : "Outbound route created successfully.",
      );
      await fetchOutboundRoutes();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || "Failed to save outbound route.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const toggleTimeCondition = (value) => {
    setTimeConditions((prev) => {
      if (value === "Holiday" && !prev.includes("All")) return prev;
      const exists = prev.includes(value);
      const next = exists
        ? prev.filter((item) => item !== value)
        : [...prev, value];
      if (value === "All" && exists) {
        return next.filter((item) => item !== "Holiday");
      }
      return next;
    });
  };

  const updateDialPattern = (index, key, value) => {
    setDialPatterns((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  };

  const addDialPattern = () =>
    setDialPatterns((prev) => [
      ...prev,
      { ...OUTBOUND_ROUTE_DEFAULT_DIAL_PATTERN, pattern: "^\\d*$" },
    ]);
  const removeDialPatternAt = (index) =>
    setDialPatterns((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );

  const addSelectedExtensions = () => {
    if (availableExtensionSelected.length === 0) return;
    setMemberExtensions((prev) => [
      ...prev,
      ...availableExtensionSelected.filter((id) => !prev.includes(id)),
    ]);
    setAvailableExtensionSelected([]);
  };
  const addAllExtensions = () => {
    setMemberExtensions(availableExtensions.map((item) => item.id));
    setAvailableExtensionSelected([]);
  };
  const removeSelectedExtensions = () => {
    if (chosenExtensionSelected.length === 0) return;
    setMemberExtensions((prev) =>
      prev.filter((id) => !chosenExtensionSelected.includes(id)),
    );
    setChosenExtensionSelected([]);
  };
  const removeAllExtensions = () => {
    setMemberExtensions([]);
    setChosenExtensionSelected([]);
  };

  const toggleAvailableExtensionSelect = (id) => {
    setAvailableExtensionSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleChosenExtensionSelect = (id) => {
    setChosenExtensionSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const moveExtToBottom = () => {
    if (!chosenExtensionSelected.length) return;
    setMemberExtensions((prev) => {
      const rest = prev.filter((id) => !chosenExtensionSelected.includes(id));
      const chosen = prev.filter((id) => chosenExtensionSelected.includes(id));
      return [...rest, ...chosen];
    });
  };
  const moveExtUp = () => {
    if (!chosenExtensionSelected.length) return;
    setMemberExtensions((prev) => {
      const arr = [...prev];
      for (let i = 1; i < arr.length; i++) {
        if (
          chosenExtensionSelected.includes(arr[i]) &&
          !chosenExtensionSelected.includes(arr[i - 1])
        )
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      }
      return arr;
    });
  };
  const moveExtDown = () => {
    if (!chosenExtensionSelected.length) return;
    setMemberExtensions((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 2; i >= 0; i--) {
        if (
          chosenExtensionSelected.includes(arr[i]) &&
          !chosenExtensionSelected.includes(arr[i + 1])
        )
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      }
      return arr;
    });
  };
  const moveExtToTop = () => {
    if (!chosenExtensionSelected.length) return;
    setMemberExtensions((prev) => {
      const chosen = prev.filter((id) => chosenExtensionSelected.includes(id));
      const rest = prev.filter((id) => !chosenExtensionSelected.includes(id));
      return [...chosen, ...rest];
    });
  };

  const addSelectedTrunks = () => {
    if (availableTrunkSelected.length === 0) return;
    setMemberTrunks((prev) => [
      ...prev,
      ...availableTrunkSelected.filter((id) => !prev.includes(id)),
    ]);
    setAvailableTrunkSelected([]);
  };
  const addAllTrunks = () => {
    setMemberTrunks(availableTrunks.map((item) => item.id));
    setAvailableTrunkSelected([]);
  };
  const removeSelectedTrunks = () => {
    if (chosenTrunkSelected.length === 0) return;
    setMemberTrunks((prev) =>
      prev.filter((id) => !chosenTrunkSelected.includes(id)),
    );
    setChosenTrunkSelected([]);
  };
  const removeAllTrunks = () => {
    setMemberTrunks([]);
    setChosenTrunkSelected([]);
  };

  const toggleAvailableTrunkSelect = (id) => {
    setAvailableTrunkSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleChosenTrunkSelect = (id) => {
    setChosenTrunkSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const moveTrunkToBottom = () => {
    if (!chosenTrunkSelected.length) return;
    setMemberTrunks((prev) => {
      const rest = prev.filter((id) => !chosenTrunkSelected.includes(id));
      const chosen = prev.filter((id) => chosenTrunkSelected.includes(id));
      return [...rest, ...chosen];
    });
  };
  const moveTrunkUp = () => {
    if (!chosenTrunkSelected.length) return;
    setMemberTrunks((prev) => {
      const arr = [...prev];
      for (let i = 1; i < arr.length; i++) {
        if (
          chosenTrunkSelected.includes(arr[i]) &&
          !chosenTrunkSelected.includes(arr[i - 1])
        )
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      }
      return arr;
    });
  };
  const moveTrunkDown = () => {
    if (!chosenTrunkSelected.length) return;
    setMemberTrunks((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 2; i >= 0; i--) {
        if (
          chosenTrunkSelected.includes(arr[i]) &&
          !chosenTrunkSelected.includes(arr[i + 1])
        )
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      }
      return arr;
    });
  };
  const moveTrunkToTop = () => {
    if (!chosenTrunkSelected.length) return;
    setMemberTrunks((prev) => {
      const chosen = prev.filter((id) => chosenTrunkSelected.includes(id));
      const rest = prev.filter((id) => !chosenTrunkSelected.includes(id));
      return [...chosen, ...rest];
    });
  };

  const allRowsSelected =
    rows.length > 0 && rows.every((_, index) => selected.includes(index));
  const someRowsSelected =
    rows.some((_, index) => selected.includes(index)) && !allRowsSelected;

  return (
    <div style={{ ...outboundRoutePageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
      <div style={outboundRoutePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={outboundRouteFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <OutboundRouteBreadcrumb section="Call Control" current="Outbound Routes" />

        <div style={outboundRouteCardStyle}>
          <div
            style={{
              ...outboundRouteToolbarStyle,
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
              {selected.length > 0 && (
                <span style={outboundRouteSelectedBadgeStyle}>
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
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                variant="cancel"
                style={outboundRouteCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.save || loading.list}
                variant="primary"
                style={outboundRoutePrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              flex: 1,
            }}
          >
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
                message="No outbound routes found."
                onAddNew={handleOpenAddModal}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                  minWidth: 900,
                  ...(isCompact ? { minWidth: 720 } : {}),
                }}
              >
                <thead>
                  <tr>
                    <TH
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
                        checked={allRowsSelected}
                        indeterminate={someRowsSelected}
                        onChange={() =>
                          allRowsSelected
                            ? handleUncheckAll()
                            : handleCheckAll()
                        }
                        sx={outboundRouteTableCheckboxSx}
                      />
                    </TH>
                    <TH
                      style={{
                        width: 36,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      ID
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Priority
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Password
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Member Extensions
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Member Trunks
                    </TH>
                    <TH
                      style={{
                        width: 70,
                        borderRight: "none",
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
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    const rowBg = isSelected
                      ? "#eff6ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    return (
                      <tr
                        key={row.id}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            width: 36,
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(realIdx)}
                            disabled={loading.delete}
                            sx={outboundRouteTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.priority}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span
                            style={{
                              color:
                                row.enabled === "Yes" ? "#16a34a" : "#475569",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.enabled}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.passwordType === "Single Pin"
                            ? `Single Pin (${row.singlePin || ""})`
                            : row.passwordType}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            whiteSpace: "normal",
                            wordBreak: "break-all",
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.memberExtensions?.length > 0 ? (
                            <span
                              title={
                                row.memberExtensions.length >
                                OUTBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD
                                  ? row.memberExtensions
                                      .map(getExtensionLabel)
                                      .join(", ")
                                  : undefined
                              }
                            >
                              {formatOutboundRouteItemListDisplay(row.memberExtensions, {
                                mapItem: getExtensionLabel,
                              })}
                            </span>
                          ) : (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            whiteSpace: "normal",
                            wordBreak: "break-all",
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.memberTrunks?.length > 0 ? (
                            <span
                              title={
                                row.memberTrunks.length >
                                OUTBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD
                                  ? row.memberTrunks
                                      .map(getTrunkLabel)
                                      .join(", ")
                                  : undefined
                              }
                            >
                              {formatOutboundRouteItemListDisplay(row.memberTrunks, {
                                mapItem: getTrunkLabel,
                              })}
                            </span>
                          ) : (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderRight: "none",
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
                              onClick={() => handleOpenEditModal(row)}
                              style={{
                                cursor: loading.delete
                                  ? "not-allowed"
                                  : "pointer",
                                color: "#2563eb",
                                fontSize: 22,
                                opacity: loading.delete ? 0.4 : 0.7,
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

          {!isInitialLoad && rows.length > 0 && (
            <OutboundRoutePagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={(p) =>
                setPage(Math.min(totalPages, Math.max(1, p)))
              }
            />
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{ "& .MuiDialog-container": { alignItems: "flex-start", pt: 5 } }}
        PaperProps={{ sx: outboundRouteModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={outboundRouteModalTitleStyle}>
          {editId != null ? "Edit Outbound Route" : "Add Outbound Route"}
        </DialogTitle>
        <DialogContent
          className="app-main-scroll"
          style={{ padding: "24px", backgroundColor: "#ffffff" }}
          sx={outboundRouteModalDialogContentSx}
        >
          <div style={outboundRouteModalFormStyle}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                gap: "8px 28px",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <FieldRow label="Name *" tooltipKey="name">
                  <OutboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      sx={outboundRouteModalControlSx}
                    />
                  </OutboundLeftField>
                </FieldRow>
                <FieldRow label="Priority *" tooltipKey="priority">
                  <OutboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      sx={outboundRouteModalControlSx}
                    />
                  </OutboundLeftField>
                </FieldRow>
                <FieldRow label="Description" tooltipKey="description">
                  <OutboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      sx={outboundRouteModalControlSx}
                    />
                  </OutboundLeftField>
                </FieldRow>
                <FieldRow label="Rmemory Hunt" tooltipKey="rememory_hunt">
                  <OutboundLeftField>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={rememoryHunt}
                        onChange={(e) => setRememoryHunt(e.target.value)}
                        sx={outboundRouteModalSelectSx}
                      >
                        {OUTBOUND_ROUTE_REMEMORY_HUNT_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </OutboundLeftField>
                </FieldRow>
              </div>

              <div style={outboundRightColStyle}>
                <OutboundRightRow label="Next Route" tooltipKey="next_route">
                  <Checkbox
                    checked={nextRoute}
                    onChange={(e) => setNextRoute(e.target.checked)}
                    size="small"
                    sx={outboundRouteTableCheckboxSx}
                  />
                </OutboundRightRow>
                <OutboundRightRow label="Enabled *" tooltipKey="enabled">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={outboundRouteModalSelectSx}
                    >
                      {OUTBOUND_ROUTE_ENABLE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </OutboundRightRow>
                <OutboundRightRow label="Password" tooltipKey="password">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={passwordType}
                      onChange={(e) => {
                        setPasswordType(e.target.value);
                        if (e.target.value !== "Single Pin") setSinglePin("");
                      }}
                      sx={outboundRouteModalSelectSx}
                    >
                      {OUTBOUND_ROUTE_PASSWORD_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </OutboundRightRow>
                {passwordType === "Single Pin" && (
                  <OutboundRightRow
                    label="Enter Password"
                    tooltipKey="enter_password"
                  >
                    <TextField
                      size="small"
                      fullWidth
                      value={singlePin}
                      onChange={(e) => setSinglePin(e.target.value)}
                      sx={outboundRouteModalControlSx}
                    />
                  </OutboundRightRow>
                )}
                <OutboundRightRow
                  label="Time Condition"
                  tooltipKey="time_condition"
                  fieldWidth={280}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    {OUTBOUND_ROUTE_TIME_CONDITION_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        style={{
                          fontSize: 13,
                          color: C.valueText,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={timeConditions.includes(opt)}
                          onChange={() => toggleTimeCondition(opt)}
                          disabled={
                            opt === "Holiday" && !timeConditions.includes("All")
                          }
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </OutboundRightRow>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <OutboundRouteModalSectionHeading
                title="Dial Patterns"
                tooltipKey="dial_patterns"
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 72px",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                {["Patterns", "Strip", "Front", "Suffix", "Delay"].map(
                  (heading) => (
                    <div
                      key={heading}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      {heading}
                    </div>
                  ),
                )}
                <div />
              </div>
              {dialPatterns.map((item, index) => (
                <div
                  key={`pattern-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 72px",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  {["pattern", "strip", "front", "suffix", "delay"].map(
                    (field) => (
                      <input
                        key={field}
                        style={outboundCompactInputStyle}
                        placeholder={
                          field === "delay" ? "Unit is ms" : undefined
                        }
                        value={item[field]}
                        onChange={(e) =>
                          updateDialPattern(index, field, e.target.value)
                        }
                        {...getNativeFieldInteraction()}
                      />
                    ),
                  )}
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      type="button"
                      style={outboundPatternActionBtnStyle}
                      onClick={addDialPattern}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      style={{
                        ...outboundPatternActionBtnStyle,
                        opacity: dialPatterns.length <= 1 ? 0.5 : 1,
                      }}
                      onClick={() => removeDialPatternAt(index)}
                      disabled={dialPatterns.length <= 1}
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 8 }}>
              <OutboundRouteModalSectionHeading
                title="Caller Number Conversion"
                tooltipKey="caller_number_conversion"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                {["Strip", "Front", "Suffix"].map((heading) => (
                  <div
                    key={heading}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.labelText,
                    }}
                  >
                    {heading}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                }}
              >
                {["strip", "front", "suffix"].map((field) => (
                  <input
                    key={field}
                    style={outboundCompactInputStyle}
                    value={callerConversion[field]}
                    onChange={(e) =>
                      setCallerConversion((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    {...getNativeFieldInteraction()}
                  />
                ))}
              </div>
            </div>

            <SectionCard
              title="Member Extensions *"
              tooltipKey="member_extensions"
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `1fr ${OUTBOUND_ROUTE_CODEC_BTN_COL_WIDTH}px 1fr ${OUTBOUND_ROUTE_CODEC_BTN_COL_WIDTH}px`,
                  gap: 10,
                  width: "100%",
                  alignItems: "start",
                }}
              >
                <div>
                  <div style={outboundRouteDualListLabelStyle}>Available</div>
                  <OutboundRouteCodecListBox
                    items={loading.members ? [] : extensionAvailableList}
                    selectedIds={availableExtensionSelected}
                    onToggle={toggleAvailableExtensionSelect}
                    emptyText={
                      loading.members ? "Loading extensions..." : "No extensions"
                    }
                    getLabel={(id) => {
                      const item = extensionAvailableList.find((x) => x.id === id);
                      return item?.label || getExtensionLabel(id);
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{ height: OUTBOUND_ROUTE_CODEC_LIST_LABEL_OFFSET }}
                    aria-hidden="true"
                  />
                  <div style={outboundRouteCodecBtnColumnStyle}>
                    <OutboundRouteCodecDualListBtn onClick={addSelectedExtensions}>
                      &gt;
                    </OutboundRouteCodecDualListBtn>
                    <OutboundRouteCodecDualListBtn onClick={addAllExtensions}>
                      &gt;&gt;
                    </OutboundRouteCodecDualListBtn>
                    <OutboundRouteCodecDualListBtn onClick={removeSelectedExtensions}>
                      &lt;
                    </OutboundRouteCodecDualListBtn>
                    <OutboundRouteCodecDualListBtn onClick={removeAllExtensions}>
                      &lt;&lt;
                    </OutboundRouteCodecDualListBtn>
                  </div>
                </div>
                <div>
                  <div style={outboundRouteDualListLabelStyle}>Selected</div>
                  <OutboundRouteCodecListBox
                    items={memberExtensions}
                    selectedIds={chosenExtensionSelected}
                    onToggle={toggleChosenExtensionSelect}
                    emptyText="No selected extensions"
                    getLabel={getExtensionLabel}
                  />
                </div>
                <div>
                  <div
                    style={{ height: OUTBOUND_ROUTE_CODEC_LIST_LABEL_OFFSET }}
                    aria-hidden="true"
                  />
                  <div style={outboundRouteCodecBtnColumnStyle}>
                    <OutboundRouteCodecDualListBtn
                      reorder
                      title="Move to bottom"
                      onClick={moveExtToBottom}
                    >
                      vv
                    </OutboundRouteCodecDualListBtn>
                    <OutboundRouteCodecDualListBtn
                      reorder
                      title="Move up"
                      onClick={moveExtUp}
                    >
                      ^
                    </OutboundRouteCodecDualListBtn>
                    <OutboundRouteCodecDualListBtn
                      reorder
                      title="Move down"
                      onClick={moveExtDown}
                    >
                      v
                    </OutboundRouteCodecDualListBtn>
                    <OutboundRouteCodecDualListBtn
                      reorder
                      title="Move to top"
                      onClick={moveExtToTop}
                    >
                      ^^
                    </OutboundRouteCodecDualListBtn>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Member Trunks *" tooltipKey="member_trunks">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `1fr ${OUTBOUND_ROUTE_CODEC_BTN_COL_WIDTH}px 1fr ${OUTBOUND_ROUTE_CODEC_BTN_COL_WIDTH}px`,
                  gap: 10,
                  width: "100%",
                  alignItems: "start",
                }}
              >
                <div>
                  <div style={outboundRouteDualListLabelStyle}>Available</div>
                  <OutboundRouteCodecListBox
                    items={loading.trunks ? [] : trunkAvailableList}
                    selectedIds={availableTrunkSelected}
                    onToggle={toggleAvailableTrunkSelect}
                    emptyText={
                      loading.trunks ? "Loading trunks..." : "No trunks"
                    }
                    getLabel={(id) => {
                      const item = trunkAvailableList.find((x) => x.id === id);
                      return item?.label || getTrunkLabel(id);
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{ height: OUTBOUND_ROUTE_CODEC_LIST_LABEL_OFFSET }}
                    aria-hidden="true"
                  />
                  <div style={outboundRouteCodecBtnColumnStyle}>
                    <OutboundRouteCodecDualListBtn onClick={addSelectedTrunks}>
                      &gt;
                    </OutboundRouteCodecDualListBtn>
                    <OutboundRouteCodecDualListBtn onClick={addAllTrunks}>
                      &gt;&gt;
                    </OutboundRouteCodecDualListBtn>
                    <OutboundRouteCodecDualListBtn onClick={removeSelectedTrunks}>
                      &lt;
                    </OutboundRouteCodecDualListBtn>
                    <OutboundRouteCodecDualListBtn onClick={removeAllTrunks}>
                      &lt;&lt;
                    </OutboundRouteCodecDualListBtn>
                  </div>
                </div>
                <div>
                  <div style={outboundRouteDualListLabelStyle}>Selected</div>
                  <OutboundRouteCodecListBox
                    items={memberTrunks}
                    selectedIds={chosenTrunkSelected}
                    onToggle={toggleChosenTrunkSelect}
                    emptyText="No selected trunks"
                    getLabel={getTrunkLabel}
                  />
                </div>
                <div>
                  <div
                    style={{ height: OUTBOUND_ROUTE_CODEC_LIST_LABEL_OFFSET }}
                    aria-hidden="true"
                  />
                  <div style={outboundRouteCodecBtnColumnStyle}>
                    <OutboundRouteCodecDualListBtn
                      reorder
                      title="Move to bottom"
                      onClick={moveTrunkToBottom}
                    >
                      vv
                    </OutboundRouteCodecDualListBtn>
                    <OutboundRouteCodecDualListBtn
                      reorder
                      title="Move up"
                      onClick={moveTrunkUp}
                    >
                      ^
                    </OutboundRouteCodecDualListBtn>
                    <OutboundRouteCodecDualListBtn
                      reorder
                      title="Move down"
                      onClick={moveTrunkDown}
                    >
                      v
                    </OutboundRouteCodecDualListBtn>
                    <OutboundRouteCodecDualListBtn
                      reorder
                      title="Move to top"
                      onClick={moveTrunkToTop}
                    >
                      ^^
                    </OutboundRouteCodecDualListBtn>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save && <CircularProgress size={20} color="inherit" />}
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={outboundRouteModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OutboundRoutesPage;
