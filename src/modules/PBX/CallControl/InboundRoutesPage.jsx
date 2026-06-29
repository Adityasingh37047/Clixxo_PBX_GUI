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
  INBOUND_ROUTE_DESTINATION_NEEDS_TARGET,
  INBOUND_ROUTE_DESTINATION_OPTIONS,
  INBOUND_ROUTE_DEST_TYPE_TO_UI,
  INBOUND_ROUTE_ENABLE_OPTIONS,
  INBOUND_ROUTE_FIELD_TOOLTIPS,
  INBOUND_ROUTE_MOBILITY_OPTIONS,
  INBOUND_ROUTE_SEND_RINGTONE_OPTIONS,
  INBOUND_ROUTE_T38_OPTIONS,
  INBOUND_ROUTE_TIME_CONDITION_OPTIONS,
  INBOUND_ROUTE_UI_TO_DEST_TYPE,
} from "../../../constants/InboundRouteConstants";
import {
  createInboundRoute,
  deleteInboundRoute,
  listInboundRoutes,
  listIvrDestinations,
  listSipRegistrations,
  updateInboundRoute,
} from "../../../api/apiService";

const INBOUND_ROUTE_COMPACT_MQ = "(max-width: 768px)";

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
  errorRed: "#dc2626",
  successGreen: "#16a34a",
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

const inboundRouteTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const getInboundRouteRowBg = (isSelected, idx) =>
  isSelected ? "#eff6ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

const inboundRouteModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const inboundRoutePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const inboundRoutePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const InboundRouteBreadcrumb = ({ section, current, style }) => (
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

const INBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD = 10;
const INBOUND_ROUTE_LIST_DISPLAY_LIMIT = 6;

const formatInboundRouteItemListDisplay = (
  items,
  {
    threshold = INBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD,
    limit = INBOUND_ROUTE_LIST_DISPLAY_LIMIT,
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

const INBOUND_ROUTE_MODAL_SECTION_BG = "#f8fafc";
const INBOUND_ROUTE_MODAL_SECTION_HEADING_COLOR = "#30415A";

const INBOUND_ROUTE_TOOLTIP_PROPS = {
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

const formatInboundTooltipTitle = (text) => {
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

const InboundFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = INBOUND_ROUTE_FIELD_TOOLTIPS[tooltipKey] || "";
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
      title={formatInboundTooltipTitle(tooltip)}
      {...INBOUND_ROUTE_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const InboundRouteModalSectionHeading = ({ title, tooltipKey, isFirst = false }) => {
  const heading = (
    <span
      style={{
        position: "absolute",
        top: -10,
        left: -6,
        background: INBOUND_ROUTE_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: INBOUND_ROUTE_MODAL_SECTION_HEADING_COLOR,
        cursor: tooltipKey ? "help" : undefined,
      }}
    >
      {title}
    </span>
  );
  const tooltip = tooltipKey ? INBOUND_ROUTE_FIELD_TOOLTIPS[tooltipKey] : "";
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
          title={formatInboundTooltipTitle(tooltip)}
          {...INBOUND_ROUTE_TOOLTIP_PROPS}
        >
          {heading}
        </Tooltip>
      ) : (
        heading
      )}
    </div>
  );
};

const inboundRouteDualListLabelStyle = {
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

const inboundRouteOutlinedInputRootSx = {
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

const inboundRouteModalTextFieldSx = {
  "& .MuiOutlinedInput-root": inboundRouteOutlinedInputRootSx,
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
    fontSize: 13,
    padding: "8px 12px",
  },
};

const inboundRouteModalTextFieldFullSx = {
  ...inboundRouteModalTextFieldSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...inboundRouteOutlinedInputRootSx,
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

const inboundRouteModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...inboundRouteOutlinedInputRootSx,
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

const inboundRouteModalPaperSx = {
  width: 900,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const inboundRouteModalDialogContentSx = {
  maxHeight: "calc(100vh - 180px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const inboundRouteModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const INBOUND_ROUTE_TABLE_CARD_RADIUS = 10;

const inboundRouteCardStyle = {
  background: "#ffffff",
  borderRadius: INBOUND_ROUTE_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const inboundRouteToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: INBOUND_ROUTE_TABLE_CARD_RADIUS,
  borderTopRightRadius: INBOUND_ROUTE_TABLE_CARD_RADIUS,
};

const inboundRoutePaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: INBOUND_ROUTE_TABLE_CARD_RADIUS,
  borderBottomRightRadius: INBOUND_ROUTE_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const inboundRouteSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const inboundRouteCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const inboundRoutePrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const inboundRoutePageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const inboundRouteFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const inboundRouteModalFormStyle = {
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

const inboundRouteModalActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const InboundRoutePagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  style,
}) => (
  <div style={{ ...inboundRoutePaginationStyle, ...style }}>
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
      <span style={inboundRoutePageBadgeStyle}>
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

const INBOUND_ROUTE_CODEC_LIST_BOX_HEIGHT = 188;
const INBOUND_ROUTE_CODEC_BTN_COL_WIDTH = 40;
const INBOUND_ROUTE_CODEC_BTN_GAP = 6;
const INBOUND_ROUTE_CODEC_BTN_HEIGHT =
  (INBOUND_ROUTE_CODEC_LIST_BOX_HEIGHT - INBOUND_ROUTE_CODEC_BTN_GAP * 3) / 4;
const INBOUND_ROUTE_CODEC_LIST_LABEL_OFFSET = 28;

const getInboundRouteCodecListBoxStyle = (isEmpty) => ({
  width: "100%",
  minHeight: INBOUND_ROUTE_CODEC_LIST_BOX_HEIGHT,
  height: INBOUND_ROUTE_CODEC_LIST_BOX_HEIGHT,
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

const inboundRouteCodecListEmptyStyle = {
  color: C.placeholderText,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "center",
  userSelect: "none",
  padding: "0 16px",
};

const inboundRouteCodecStripStyle = (isSelected) => ({
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

const inboundRouteCodecDualListBtnStyle = {
  width: INBOUND_ROUTE_CODEC_BTN_COL_WIDTH,
  height: INBOUND_ROUTE_CODEC_BTN_HEIGHT,
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

const inboundRouteCodecDualListReorderBtnStyle = {
  ...inboundRouteCodecDualListBtnStyle,
  fontSize: 11,
  fontWeight: 500,
  color: C.mutedText,
};

const inboundRouteCodecBtnColumnStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: INBOUND_ROUTE_CODEC_BTN_GAP,
  height: INBOUND_ROUTE_CODEC_LIST_BOX_HEIGHT,
  width: INBOUND_ROUTE_CODEC_BTN_COL_WIDTH,
};

const InboundRouteCodecDualListBtn = ({ onClick, title, children, reorder }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={
      reorder
        ? inboundRouteCodecDualListReorderBtnStyle
        : inboundRouteCodecDualListBtnStyle
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

const InboundRouteCodecListBox = ({
  items,
  selectedIds,
  onToggle,
  emptyText,
  getLabel,
}) => {
  const isEmpty = items.length === 0;
  return (
    <div style={getInboundRouteCodecListBoxStyle(isEmpty)}>
      {isEmpty ? (
        <div style={inboundRouteCodecListEmptyStyle}>{emptyText}</div>
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
              style={inboundRouteCodecStripStyle(isSelected)}
            >
              {label}
            </div>
          );
        })
      )}
    </div>
  );
};

const INBOUND_ROUTE_MODAL_LABEL_WIDTH = 185;
const INBOUND_ROUTE_MODAL_FIELD_WIDTH = 210;
const INBOUND_ROUTE_RIGHT_LABEL_PADDING_LEFT = 28;

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
    }}
  >
    {tooltipKey ? (
      <InboundFieldLabel
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
      </InboundFieldLabel>
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

/** Left column — same fill-box size as right; label position unchanged */
const InboundLeftField = ({ children }) => (
  <div style={{ width: INBOUND_ROUTE_MODAL_FIELD_WIDTH, maxWidth: "100%" }}>
    {children}
  </div>
);

const InboundRightRow = ({ label, tooltipKey, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
    }}
  >
    {tooltipKey ? (
      <InboundFieldLabel
        tooltipKey={tooltipKey}
        style={{
          textAlign: "left",
          width: INBOUND_ROUTE_MODAL_LABEL_WIDTH,
          minWidth: INBOUND_ROUTE_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          paddingLeft: INBOUND_ROUTE_RIGHT_LABEL_PADDING_LEFT,
          boxSizing: "border-box",
        }}
      >
        {label}
      </InboundFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          color: C.labelText,
          fontWeight: 600,
          whiteSpace: "nowrap",
          textAlign: "left",
          width: INBOUND_ROUTE_MODAL_LABEL_WIDTH,
          minWidth: INBOUND_ROUTE_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          paddingLeft: INBOUND_ROUTE_RIGHT_LABEL_PADDING_LEFT,
          boxSizing: "border-box",
        }}
      >
        {label}
      </label>
    )}
    <div style={{ width: INBOUND_ROUTE_MODAL_FIELD_WIDTH, flexShrink: 0 }}>
      {children}
    </div>
  </div>
);

const inboundRightColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  width: "100%",
};

const SectionCard = ({ title, tooltipKey, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <InboundRouteModalSectionHeading
      title={title}
      tooltipKey={tooltipKey}
      isFirst={isFirst}
    />
    <div>{children}</div>
  </div>
);

const InboundRoutesPage = () => {
  const isCompact = useMediaQuery(INBOUND_ROUTE_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
    trunks: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedTrunksRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [didPattern, setDidPattern] = useState("");
  const [callerIdPattern, setCallerIdPattern] = useState("");
  const [distinctiveRingTone, setDistinctiveRingTone] = useState("");
  const [enableT38, setEnableT38] = useState("No");
  const [enableTimeCondition, setEnableTimeCondition] = useState("No");
  const [destination, setDestination] = useState("");
  const [enabled, setEnabled] = useState("Yes");
  const [priority, setPriority] = useState("102");
  const [enableMobilityExtension, setEnableMobilityExtension] = useState("No");
  const [sendRingTone, setSendRingTone] = useState("Remote");
  const [destinationTarget, setDestinationTarget] = useState("");
  const [extensionRange, setExtensionRange] = useState("");

  const [destinations, setDestinations] = useState({});
  const hasLoadedDestinationDataRef = useRef(false);

  const [availableTrunks, setAvailableTrunks] = useState([]);
  const [selectedTrunks, setSelectedTrunks] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

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

  const mapDestTypeToUi = (destType) =>
    INBOUND_ROUTE_DEST_TYPE_TO_UI[String(destType || "").toLowerCase()] || "";
  const mapUiToDestType = (uiDest) =>
    INBOUND_ROUTE_UI_TO_DEST_TYPE[uiDest] || "call_queue";

  /** Ring-group list API uses `rg_number` (same as Ring Group page); do not use DB id as dial target. */
  const getRingGroupDialNumber = (g) => {
    if (!g || typeof g !== "object") return "";
    const n =
      g.rg_number ?? g.ring_group_no ?? g.group_no ?? g.group ?? g.page_number;
    if (n != null && String(n).trim() !== "") return String(n).trim();
    return "";
  };

  /** If dest_value was saved as ring-group row id, map it to the real group number (e.g. 6200). */
  const resolveRingGroupDestValue = (storedValue, ringGroupsList) => {
    if (storedValue == null || storedValue === "") return "";
    const s = String(storedValue).trim();
    if (!Array.isArray(ringGroupsList) || ringGroupsList.length === 0) return s;

    if (ringGroupsList.some((g) => getRingGroupDialNumber(g) === s)) return s;

    const byId = ringGroupsList.find((g) => String(g?.id) === s);
    if (byId) {
      const dial = getRingGroupDialNumber(byId);
      return dial || s;
    }
    return s;
  };

  const mapRouteFromApi = (item, ringGroupsList = []) => {
    const uiDestination = mapDestTypeToUi(item?.dest_type);
    const rawDestValue =
      item?.dest_value != null ? String(item.dest_value) : "";
    const destinationTargetRaw =
      uiDestination === "Extension_Range"
        ? ""
        : uiDestination === "Ring Groups"
          ? resolveRingGroupDestValue(rawDestValue, ringGroupsList)
          : rawDestValue;
    return {
      id: item?.id,
      name: String(item?.name || ""),
      didPattern: String(item?.did_pattern || ""),
      callerIdPattern: String(item?.callerid_pattern || ""),
      distinctiveRingTone: String(item?.distinctive_ringtone || ""),
      enableT38: toUiYesNo(item?.enable_t38, "No"),
      enableTimeCondition: toUiYesNo(item?.enable_time_condition, "No"),
      destination: uiDestination,
      destinationTarget: destinationTargetRaw,
      extensionRange: uiDestination === "Extension_Range" ? rawDestValue : "",
      memberTrunks: Array.isArray(item?.member_trunks)
        ? item.member_trunks.map(String)
        : [],
      enabled: toUiYesNo(item?.enabled, "Yes"),
      priority: String(item?.priority ?? "100"),
      enableMobilityExtension: toUiYesNo(item?.enable_mobility_ext, "No"),
      sendRingTone: String(item?.send_ringtone || "Remote"),
    };
  };

  const fetchInboundRoutes = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listInboundRoutes();
      if (!res?.response) {
        showAlert(res?.message || "Failed to load inbound routes.");
        setRows([]);
        return;
      }
      const list = Array.isArray(res?.message)
        ? res.message
        : res?.message
          ? [res.message]
          : [];
      setRows(list.map((row) => mapRouteFromApi(row, [])));
    } catch (err) {
      showAlert(err?.message || "Failed to load inbound routes.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchInboundRoutes();
  }, []);

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
          const host = t?.host || t?.sip_server || "";
          let label = "";
          if (name && host) label = `${name}@${host}`;
          else if (name) label = name;
          else if (host) label = host;
          else label = String(id || "");
          return { id: String(id), label: label || String(id || "") };
        })
        .filter((t) => t.id);
      setAvailableTrunks(trunks);
      hasLoadedTrunksRef.current = true;
    } catch (err) {
      showAlert(err?.message || "Failed to load trunks.");
      setAvailableTrunks([]);
    } finally {
      setLoading((prev) => ({ ...prev, trunks: false }));
    }
  };

  const loadDestinationData = async () => {
    try {
      const res = await listIvrDestinations();
      if (res?.response && res?.message && typeof res.message === "object") {
        setDestinations(res.message);
      }
      hasLoadedDestinationDataRef.current = true;
    } catch {
      setDestinations({});
    }
  };

  const DEST_UI_TO_API_KEY = {
    Extensions: "Extensions",
    Voicemails: "Voicemails",
    "Fax To Mail": "FaxToMail",
    "Ring Groups": "RingGroups",
    "Conference Rooms": "ConferenceRooms",
    "IVR Menus": "IVR",
    "Call Queue": "CallQueue",
    CallBacks: "Callbacks",
    DISA: "DISA",
    Trunks: "Trunks",
    Outbound: "Outbound",
    Other: "Other",
  };

  const getDestinationChoices = () => {
    const apiKey = DEST_UI_TO_API_KEY[destination];
    if (!apiKey) return [];
    const list = Array.isArray(destinations[apiKey])
      ? destinations[apiKey]
      : [];
    return list.map((opt) => ({
      id: String(opt.value),
      label: String(opt.label),
    }));
  };

  const destinationChoices = getDestinationChoices();
  const needsDestinationTarget =
    INBOUND_ROUTE_DESTINATION_NEEDS_TARGET.has(destination);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setDidPattern("");
    setCallerIdPattern("");
    setDistinctiveRingTone("");
    setEnableT38("No");
    setEnableTimeCondition("No");
    setDestination("");
    setEnabled("Yes");
    setPriority("102");
    setEnableMobilityExtension("No");
    setSendRingTone("Remote");
    setDestinationTarget("");
    setExtensionRange("");
    setSelectedTrunks([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    const loaders = [];
    if (!hasLoadedTrunksRef.current) loaders.push(loadTrunks());
    if (!hasLoadedDestinationDataRef.current)
      loaders.push(loadDestinationData());
    if (loaders.length > 0) await Promise.allSettled(loaders);
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setDidPattern(row.didPattern || "");
    setCallerIdPattern(row.callerIdPattern || "");
    setDistinctiveRingTone(row.distinctiveRingTone || "");
    setEnableT38(row.enableT38 || "No");
    setEnableTimeCondition(row.enableTimeCondition || "No");
    setDestination(row.destination || "Call Queue");
    setEnabled(row.enabled || "Yes");
    setPriority(row.priority || "102");
    setEnableMobilityExtension(row.enableMobilityExtension || "No");
    setSendRingTone(row.sendRingTone || "Remote");
    setDestinationTarget(row.destinationTarget || "");
    setExtensionRange(row.extensionRange || "");
    setSelectedTrunks(Array.isArray(row.memberTrunks) ? row.memberTrunks : []);
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    const loaders = [];
    if (!hasLoadedTrunksRef.current) loaders.push(loadTrunks());
    if (!hasLoadedDestinationDataRef.current)
      loaders.push(loadDestinationData());
    if (loaders.length > 0) await Promise.allSettled(loaders);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const trunkLabelMap = useMemo(() => {
    const map = new Map();
    availableTrunks.forEach((t) => {
      map.set(t.id, t.label);
    });
    return map;
  }, [availableTrunks]);

  const getTrunkLabel = (id) => trunkLabelMap.get(id) || id;

  const availableList = useMemo(
    () => availableTrunks.filter((t) => !selectedTrunks.includes(t.id)),
    [availableTrunks, selectedTrunks],
  );

  const addSelectedTrunks = () => {
    if (availableSelected.length === 0) return;
    setSelectedTrunks((prev) => [
      ...prev,
      ...availableSelected.filter((id) => !prev.includes(id)),
    ]);
    setAvailableSelected([]);
  };

  const addAllTrunks = () => {
    setSelectedTrunks(availableTrunks.map((t) => t.id));
    setAvailableSelected([]);
  };

  const removeSelectedTrunks = () => {
    if (chosenSelected.length === 0) return;
    setSelectedTrunks((prev) =>
      prev.filter((id) => !chosenSelected.includes(id)),
    );
    setChosenSelected([]);
  };

  const removeAllTrunks = () => {
    setSelectedTrunks([]);
    setChosenSelected([]);
  };

  const toggleAvailableTrunkSelect = (id) => {
    setAvailableSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleChosenTrunkSelect = (id) => {
    setChosenSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const moveTrunkToBottom = () => {
    if (!chosenSelected.length) return;
    setSelectedTrunks((prev) => {
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      return [...rest, ...chosen];
    });
  };
  const moveTrunkUp = () => {
    if (!chosenSelected.length) return;
    setSelectedTrunks((prev) => {
      const arr = [...prev];
      for (let i = 1; i < arr.length; i++) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i - 1])
        )
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      }
      return arr;
    });
  };
  const moveTrunkDown = () => {
    if (!chosenSelected.length) return;
    setSelectedTrunks((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 2; i >= 0; i--) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i + 1])
        )
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      }
      return arr;
    });
  };
  const moveTrunkToTop = () => {
    if (!chosenSelected.length) return;
    setSelectedTrunks((prev) => {
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      return [...chosen, ...rest];
    });
  };

  const handleSelectRow = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  // Page-level checkbox helpers
  const pageIndices = pagedRows.map((_, i) => (page - 1) * itemsPerPage + i);
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;
  const handleToggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) => prev.filter((i) => !pageIndices.includes(i)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...pageIndices])));
    }
  };

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
        idsToDelete.map((id) => deleteInboundRoute(id)),
      );
      const failed = results.find((res) => !res?.response);
      if (failed) {
        showAlert(failed?.message || "Failed to delete one or more routes.");
      } else {
        showMessage("success", "Inbound route(s) deleted successfully.");
      }
      await fetchInboundRoutes();
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
    if (!destination) {
      showAlert("Destination is required.");
      return;
    }
    const parsedPriority = Number(priority);
    if (
      !Number.isInteger(parsedPriority) ||
      parsedPriority < 1 ||
      parsedPriority > 9999
    ) {
      showAlert("Priority must be a number between 1 and 9999.");
      return;
    }
    if (destination === "Extension_Range") {
      if (!extensionRange.trim()) {
        showAlert("Extension range is required (example: 100-136).");
        return;
      }
      const rangePattern = /^\d+\s*-\s*\d+$/;
      if (!rangePattern.test(extensionRange.trim())) {
        showAlert("Invalid extension range format. Use format like 100-136.");
        return;
      }
    } else if (destinationChoices.length > 0 && !destinationTarget) {
      showAlert("Please select a destination target.");
      return;
    }

    const payload = {
      id: editId ?? Date.now(),
      name: trimmedName,
      didPattern,
      callerIdPattern,
      distinctiveRingTone,
      enableT38,
      enableTimeCondition,
      destination,
      destinationTarget:
        destination === "Extension_Range" ? "" : destinationTarget,
      extensionRange:
        destination === "Extension_Range" ? extensionRange.trim() : "",
      enabled,
      priority,
      enableMobilityExtension,
      sendRingTone,
      memberTrunks: [...selectedTrunks],
    };

    const destType = mapUiToDestType(destination);
    const destValue =
      destination === "Extension_Range"
        ? extensionRange.trim()
        : destinationTarget;

    const apiPayload = {
      name: payload.name,
      did_pattern: payload.didPattern || "",
      callerid_pattern: payload.callerIdPattern || "",
      distinctive_ringtone: payload.distinctiveRingTone || "",
      enable_t38: toApiYesNo(payload.enableT38, "no"),
      enable_time_condition: toApiYesNo(payload.enableTimeCondition, "no"),
      dest_type: destType,
      dest_value: destValue || "",
      member_trunks: Array.isArray(payload.memberTrunks)
        ? payload.memberTrunks
        : [],
      enabled: toApiYesNo(payload.enabled, "yes"),
      priority: parsedPriority,
      enable_mobility_ext: toApiYesNo(payload.enableMobilityExtension, "no"),
      send_ringtone: payload.sendRingTone || "Remote",
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const response =
        editId != null
          ? await updateInboundRoute(editId, apiPayload)
          : await createInboundRoute(apiPayload);
      if (!response?.response) {
        showAlert(response?.message || "Failed to save inbound route.");
        return;
      }
      showMessage(
        "success",
        editId != null
          ? "Inbound route updated successfully."
          : "Inbound route created successfully.",
      );
      await fetchInboundRoutes();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || "Failed to save inbound route.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  return (
    <div style={{ ...inboundRoutePageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
      <div style={inboundRoutePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={inboundRouteFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <InboundRouteBreadcrumb section="Call Control" current="Inbound Routes" />

        <div style={inboundRouteCardStyle}>
          <div
            style={{
              ...inboundRouteToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span style={inboundRouteSelectedBadgeStyle}>
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
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
                style={inboundRouteCancelBtnStyle}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                )}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.save}
                variant="primary"
                style={inboundRoutePrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              flex: 1,
              ...(isCompact
                ? { overflowX: "auto", WebkitOverflowScrolling: "touch" }
                : {}),
            }}
          >
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
                message="No inbound routes found."
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
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        disabled={loading.delete}
                        sx={inboundRouteTableCheckboxSx}
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
                      DID Pattern
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Caller ID Pattern
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Destination
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
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
                    const rowBg = getInboundRouteRowBg(isSelected, idx);
                    const destinationStr =
                      row.destination === "Extension_Range"
                        ? `${row.destination}: ${row.extensionRange || ""}`
                        : row.destinationTarget
                          ? `${row.destination}: ${row.destinationTarget}`
                          : row.destination;
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
                            sx={inboundRouteTableCheckboxSx}
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
                          {row.didPattern || (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.callerIdPattern || (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {destinationStr || (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
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
                            whiteSpace: "normal",
                            wordBreak: "break-all",
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.memberTrunks?.length > 0 ? (
                            <span
                              title={
                                row.memberTrunks.length >
                                INBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD
                                  ? row.memberTrunks
                                      .map(getTrunkLabel)
                                      .join(", ")
                                  : undefined
                              }
                            >
                              {formatInboundRouteItemListDisplay(row.memberTrunks, {
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
            <InboundRoutePagination
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
        PaperProps={{ sx: inboundRouteModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={inboundRouteModalTitleStyle}>
          {editId != null ? "Edit Inbound Route" : "Add Inbound Route"}
        </DialogTitle>
        <DialogContent
          className="app-main-scroll"
          style={{ padding: "24px", backgroundColor: "#ffffff" }}
          sx={inboundRouteModalDialogContentSx}
        >
          <div style={inboundRouteModalFormStyle}>
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
                  <InboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      sx={inboundRouteModalTextFieldFullSx}
                    />
                  </InboundLeftField>
                </FieldRow>
                <FieldRow label="DID Pattern" tooltipKey="did_pattern">
                  <InboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={didPattern}
                      onChange={(e) => setDidPattern(e.target.value)}
                      sx={inboundRouteModalTextFieldFullSx}
                    />
                  </InboundLeftField>
                </FieldRow>
                <FieldRow
                  label="Caller ID Pattern"
                  tooltipKey="caller_id_pattern"
                >
                  <InboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={callerIdPattern}
                      onChange={(e) => setCallerIdPattern(e.target.value)}
                      sx={inboundRouteModalTextFieldFullSx}
                    />
                  </InboundLeftField>
                </FieldRow>
                <FieldRow
                  label="Distinctive RingTone"
                  tooltipKey="distinctive_ringtone"
                >
                  <InboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={distinctiveRingTone}
                      onChange={(e) => setDistinctiveRingTone(e.target.value)}
                      sx={inboundRouteModalTextFieldFullSx}
                    />
                  </InboundLeftField>
                </FieldRow>
                <FieldRow label="Enable T.38" tooltipKey="enable_t38">
                  <InboundLeftField>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={enableT38}
                        onChange={(e) => setEnableT38(e.target.value)}
                        sx={inboundRouteModalSelectSx}
                      >
                        {INBOUND_ROUTE_T38_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </InboundLeftField>
                </FieldRow>
                <FieldRow label="Destination *" tooltipKey="destination">
                  <InboundLeftField>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setDestinationTarget("");
                          setExtensionRange("");
                        }}
                        displayEmpty
                        sx={inboundRouteModalSelectSx}
                      >
                        <MenuItem value="">
                          <em>Select</em>
                        </MenuItem>
                        {INBOUND_ROUTE_DESTINATION_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </InboundLeftField>
                </FieldRow>
              </div>

              <div style={inboundRightColStyle}>
                <InboundRightRow label="Enabled" tooltipKey="enabled">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={inboundRouteModalSelectSx}
                    >
                      {INBOUND_ROUTE_ENABLE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                <InboundRightRow label="Priority" tooltipKey="priority">
                  <TextField
                    size="small"
                    fullWidth
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    sx={inboundRouteModalTextFieldFullSx}
                  />
                </InboundRightRow>

                <InboundRightRow
                  label="Enable Mobility Extension"
                  tooltipKey="enable_mobility_extension"
                >
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enableMobilityExtension}
                      onChange={(e) =>
                        setEnableMobilityExtension(e.target.value)
                      }
                      sx={inboundRouteModalSelectSx}
                    >
                      {INBOUND_ROUTE_MOBILITY_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                <InboundRightRow
                  label="Send RingTone"
                  tooltipKey="send_ringtone"
                >
                  <FormControl size="small" fullWidth>
                    <Select
                      value={sendRingTone}
                      onChange={(e) => setSendRingTone(e.target.value)}
                      sx={inboundRouteModalSelectSx}
                    >
                      {INBOUND_ROUTE_SEND_RINGTONE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                <InboundRightRow
                  label="Enable Time Condition"
                  tooltipKey="enable_time_condition"
                >
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enableTimeCondition}
                      onChange={(e) => setEnableTimeCondition(e.target.value)}
                      sx={inboundRouteModalSelectSx}
                    >
                      {INBOUND_ROUTE_TIME_CONDITION_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                {destination === "Extension_Range" ? (
                  <InboundRightRow
                    label="Extension Range *"
                    tooltipKey="extension_range"
                  >
                    <TextField
                      size="small"
                      fullWidth
                      value={extensionRange}
                      onChange={(e) => setExtensionRange(e.target.value)}
                      placeholder="100-136"
                      sx={inboundRouteModalTextFieldFullSx}
                    />
                  </InboundRightRow>
                ) : needsDestinationTarget ? (
                  <InboundRightRow
                    label="Destination Value *"
                    tooltipKey="destination_value"
                  >
                    <FormControl size="small" fullWidth>
                      <Select
                        value={destinationTarget}
                        onChange={(e) => setDestinationTarget(e.target.value)}
                        displayEmpty
                        sx={inboundRouteModalSelectSx}
                      >
                        <MenuItem
                          value=""
                          disabled={destinationChoices.length === 0}
                        >
                          <em>Select</em>
                        </MenuItem>
                        {destinationChoices.length === 0 ? (
                          <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                            No options available
                          </MenuItem>
                        ) : (
                          destinationChoices.map((opt) => (
                            <MenuItem
                              key={opt.id}
                              value={opt.id}
                              sx={{ fontSize: 13 }}
                            >
                              {opt.label}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </InboundRightRow>
                ) : null}
              </div>
            </div>

            <SectionCard title="Member Trunks *" tooltipKey="member_trunks">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `1fr ${INBOUND_ROUTE_CODEC_BTN_COL_WIDTH}px 1fr ${INBOUND_ROUTE_CODEC_BTN_COL_WIDTH}px`,
                  gap: 10,
                  width: "100%",
                  alignItems: "start",
                }}
              >
                <div>
                  <div style={inboundRouteDualListLabelStyle}>Available</div>
                  <InboundRouteCodecListBox
                    items={loading.trunks ? [] : availableList}
                    selectedIds={availableSelected}
                    onToggle={toggleAvailableTrunkSelect}
                    emptyText={
                      loading.trunks ? "Loading trunks..." : "No trunks"
                    }
                    getLabel={(id) => {
                      const item = availableList.find((t) => t.id === id);
                      return item?.label || getTrunkLabel(id);
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{ height: INBOUND_ROUTE_CODEC_LIST_LABEL_OFFSET }}
                    aria-hidden="true"
                  />
                  <div style={inboundRouteCodecBtnColumnStyle}>
                    <InboundRouteCodecDualListBtn onClick={addSelectedTrunks}>
                      &gt;
                    </InboundRouteCodecDualListBtn>
                    <InboundRouteCodecDualListBtn onClick={addAllTrunks}>
                      &gt;&gt;
                    </InboundRouteCodecDualListBtn>
                    <InboundRouteCodecDualListBtn onClick={removeSelectedTrunks}>
                      &lt;
                    </InboundRouteCodecDualListBtn>
                    <InboundRouteCodecDualListBtn onClick={removeAllTrunks}>
                      &lt;&lt;
                    </InboundRouteCodecDualListBtn>
                  </div>
                </div>
                <div>
                  <div style={inboundRouteDualListLabelStyle}>Selected</div>
                  <InboundRouteCodecListBox
                    items={selectedTrunks}
                    selectedIds={chosenSelected}
                    onToggle={toggleChosenTrunkSelect}
                    emptyText="No selected trunks"
                    getLabel={getTrunkLabel}
                  />
                </div>
                <div>
                  <div
                    style={{ height: INBOUND_ROUTE_CODEC_LIST_LABEL_OFFSET }}
                    aria-hidden="true"
                  />
                  <div style={inboundRouteCodecBtnColumnStyle}>
                    <InboundRouteCodecDualListBtn
                      reorder
                      title="Move to bottom"
                      onClick={moveTrunkToBottom}
                    >
                      vv
                    </InboundRouteCodecDualListBtn>
                    <InboundRouteCodecDualListBtn
                      reorder
                      title="Move up"
                      onClick={moveTrunkUp}
                    >
                      ^
                    </InboundRouteCodecDualListBtn>
                    <InboundRouteCodecDualListBtn
                      reorder
                      title="Move down"
                      onClick={moveTrunkDown}
                    >
                      v
                    </InboundRouteCodecDualListBtn>
                    <InboundRouteCodecDualListBtn
                      reorder
                      title="Move to top"
                      onClick={moveTrunkToTop}
                    >
                      ^^
                    </InboundRouteCodecDualListBtn>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </DialogContent>
        <DialogActions style={inboundRouteModalActionsStyle}>
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="primary"
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} style={{ color: "#fff" }} />{" "}
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={inboundRouteModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InboundRoutesPage;
