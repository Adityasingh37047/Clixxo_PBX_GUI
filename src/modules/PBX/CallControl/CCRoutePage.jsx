import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  CircularProgress,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  CC_ROUTE_ENABLE_OPTIONS,
  CC_ROUTE_FIELD_TOOLTIPS,
  CC_ROUTE_INTERVAL_OPTIONS,
  CC_ROUTE_KEEP_MINUTES_TO_LABEL,
  CC_ROUTE_RECORD_KEEP_OPTIONS,
  CC_ROUTE_THROUGH_OPTIONS,
} from "../../../constants/CCRouteConstants";
import {
  createCCRoute,
  deleteCCRoute,
  fetchCCRouteExtensions,
  fetchCCRoutes,
  updateCCRoute,
} from "../../../api/apiService";
const CC_ROUTE_COMPACT_MQ = "(max-width: 768px)";

const CC_ROUTE_INTERVAL_VALUE_SET = new Set(
  CC_ROUTE_INTERVAL_OPTIONS.map((o) => o.value),
);
const getCcRouteIntervalLabel = (value) => {
  const found = CC_ROUTE_INTERVAL_OPTIONS.find(
    (o) => o.value === String(value),
  );
  return found ? found.label : `${value}s`;
};

// ── Normalization Helpers ─────────────────────────────────────────────────────
function normalizeThroughFromApi(value) {
  const mode = String(value || "").toLowerCase();
  return mode === "from_come_in" || mode === "from come in"
    ? "From Come In"
    : "Auto";
}
function normalizeEnabledFromApi(value) {
  return value === true || String(value || "").toLowerCase() === "yes"
    ? "Yes"
    : "No";
}
function normalizeRecordKeepTime(route) {
  if (route?.record_keep_time) return String(route.record_keep_time);
  const minutes = Number(route?.keep_minutes);
  return CC_ROUTE_KEEP_MINUTES_TO_LABEL[minutes] || "8 hours";
}
function normalizeRoute(item) {
  const rawInterval = Number(item.interval_minutes ?? item.cc_interval_time);
  const normalizedInterval =
    Number.isFinite(rawInterval) && rawInterval > 0
      ? rawInterval <= 5
        ? rawInterval * 60
        : rawInterval
      : 10;
  const ccIntervalTime = CC_ROUTE_INTERVAL_VALUE_SET.has(String(normalizedInterval))
    ? String(normalizedInterval)
    : "10";
  return {
    id: item.id,
    ccIntervalTime,
    through: normalizeThroughFromApi(item.through_mode ?? item.through),
    recordKeepTime: normalizeRecordKeepTime(item),
    enabled: normalizeEnabledFromApi(item.enabled ?? item.enable),
    memberExtensions: Array.isArray(item.extensions)
      ? item.extensions.map(String)
      : [],
  };
}

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
  codecBtnBorder: "#c9d0d9",
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
  const Component = component || "button";

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

const addNewModalFooterCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const ccRouteModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const ccRoutePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const ccRoutePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const CcRouteBreadcrumb = ({ section, current, style }) => (
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

const CC_ROUTE_LIST_TRUNCATE_THRESHOLD = 10;
const CC_ROUTE_LIST_DISPLAY_LIMIT = 6;

const formatCcRouteItemListDisplay = (
  items,
  {
    threshold = CC_ROUTE_LIST_TRUNCATE_THRESHOLD,
    limit = CC_ROUTE_LIST_DISPLAY_LIMIT,
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

const CC_ROUTE_MODAL_SECTION_BG = "#f8fafc";
const CC_ROUTE_MODAL_SECTION_HEADING_COLOR = "#30415A";

const CC_ROUTE_TOOLTIP_PROPS = {
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

const formatCcTooltipTitle = (text) => {
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

const CcFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = CC_ROUTE_FIELD_TOOLTIPS[tooltipKey] || "";
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
    <Tooltip title={formatCcTooltipTitle(tooltip)} {...CC_ROUTE_TOOLTIP_PROPS}>
      {label}
    </Tooltip>
  );
};

const ThWithTooltip = ({ tooltipKey, children, style: extra }) => {
  const tooltip = CC_ROUTE_FIELD_TOOLTIPS[tooltipKey];
  const content = (
    <span
      style={{ cursor: tooltip ? "help" : undefined, display: "inline-block" }}
    >
      {children}
    </span>
  );
  return (
    <TH style={extra}>
      {tooltip ? (
        <Tooltip
          title={formatCcTooltipTitle(tooltip)}
          {...CC_ROUTE_TOOLTIP_PROPS}
        >
          {content}
        </Tooltip>
      ) : (
        content
      )}
    </TH>
  );
};

const CcRouteModalSectionHeading = ({ title, tooltipKey, isFirst = false }) => {
  const heading = (
    <span
      style={{
        position: "absolute",
        top: -10,
        left: -6,
        background: CC_ROUTE_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: CC_ROUTE_MODAL_SECTION_HEADING_COLOR,
        cursor: tooltipKey ? "help" : undefined,
      }}
    >
      {title}
    </span>
  );
  const tooltip = tooltipKey ? CC_ROUTE_FIELD_TOOLTIPS[tooltipKey] : "";
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
          title={formatCcTooltipTitle(tooltip)}
          {...CC_ROUTE_TOOLTIP_PROPS}
        >
          {heading}
        </Tooltip>
      ) : (
        heading
      )}
    </div>
  );
};

const ccRouteDualListLabelStyle = {
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

const ccRouteOutlinedInputRootSx = {
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

const ccRouteModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...ccRouteOutlinedInputRootSx,
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

const ccRouteModalPaperSx = {
  width: 900,
  maxWidth: "95vw",
  mx: "auto",
  my: 0,
  maxHeight: "calc(100vh - 80px - 48px)",
  display: "flex",
  flexDirection: "column",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const ccRouteModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  flexShrink: 0,
};

const CC_ROUTE_TABLE_CARD_RADIUS = 10;

const ccRouteCardStyle = {
  background: "#ffffff",
  borderRadius: CC_ROUTE_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const ccRouteToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: CC_ROUTE_TABLE_CARD_RADIUS,
  borderTopRightRadius: CC_ROUTE_TABLE_CARD_RADIUS,
};

const ccRoutePaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: CC_ROUTE_TABLE_CARD_RADIUS,
  borderBottomRightRadius: CC_ROUTE_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const ccRouteSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const ccRouteCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const ccRoutePrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const ccRoutePageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const ccRouteFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const CcRoutePagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  style,
}) => (
  <div style={{ ...ccRoutePaginationStyle, ...style }}>
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
      <span style={ccRoutePageBadgeStyle}>
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

// ── Shared UI Components ──────────────────────────────────────────────────────
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
const ccRouteTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const ccRouteEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const handleCcRouteEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

const getCcRouteTdStyle = (rowBg, lastRowCellStyle, extra = {}) => ({
  ...tdStyle,
  background: rowBg,
  ...lastRowCellStyle,
  ...extra,
});

const getCcRouteRowBg = (isSelected, idx) =>
  isSelected ? "#eff6ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

const ccRouteModalFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

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
      <CcFieldLabel
        tooltipKey={tooltipKey}
        style={{
          whiteSpace: "nowrap",
          textAlign: "left",
          width: labelWidth,
          flexShrink: 0,
          paddingTop: wide ? 4 : 0,
        }}
      >
        {label}
      </CcFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          color: C.labelText,
          fontWeight: 600,
          whiteSpace: "nowrap",
          textAlign: "left",
          width: labelWidth,
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

const SectionCard = ({ title, tooltipKey, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <CcRouteModalSectionHeading
      title={title}
      tooltipKey={tooltipKey}
      isFirst={isFirst}
    />
    <div>{children}</div>
  </div>
);

const CC_ROUTE_CODEC_LIST_BOX_HEIGHT = 188;
const CC_ROUTE_CODEC_BTN_COL_WIDTH = 40;
const CC_ROUTE_CODEC_BTN_GAP = 6;
const CC_ROUTE_CODEC_BTN_HEIGHT =
  (CC_ROUTE_CODEC_LIST_BOX_HEIGHT - CC_ROUTE_CODEC_BTN_GAP * 3) / 4;
const CC_ROUTE_CODEC_LIST_LABEL_OFFSET = 28;

const getCcRouteCodecListBoxStyle = (isEmpty) => ({
  width: "100%",
  minHeight: CC_ROUTE_CODEC_LIST_BOX_HEIGHT,
  height: CC_ROUTE_CODEC_LIST_BOX_HEIGHT,
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

const ccRouteCodecListEmptyStyle = {
  color: C.placeholderText,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "center",
  userSelect: "none",
  padding: "0 16px",
};

const ccRouteCodecStripStyle = (isSelected) => ({
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

const ccRouteCodecDualListBtnStyle = {
  width: CC_ROUTE_CODEC_BTN_COL_WIDTH,
  height: CC_ROUTE_CODEC_BTN_HEIGHT,
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

const ccRouteCodecDualListReorderBtnStyle = {
  ...ccRouteCodecDualListBtnStyle,
  fontSize: 11,
  fontWeight: 500
};

const ccRouteCodecDualListReorderDownBtnStyle = {
  ...ccRouteCodecDualListReorderBtnStyle,
  fontWeight: 400,
};

const ccRouteCodecBtnColumnStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: CC_ROUTE_CODEC_BTN_GAP,
  height: CC_ROUTE_CODEC_LIST_BOX_HEIGHT,
  width: CC_ROUTE_CODEC_BTN_COL_WIDTH,
};

const CcRouteCodecDualListBtn = ({ onClick, title, children, reorder, down }) => (
  <button
    type="button"
    data-codec-action-btn
    title={title}
    onClick={onClick}
    style={
      down
        ? ccRouteCodecDualListReorderDownBtnStyle
        : reorder
          ? ccRouteCodecDualListReorderBtnStyle
          : ccRouteCodecDualListBtnStyle
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
      e.currentTarget.style.boxShadow = "inset 0 1px 3px rgba(15, 23, 42, 0.18)";
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

const CcRouteCodecListBox = ({
  items,
  selectedIds,
  onToggle,
  onDragSelect,
  onClearHighlight,
  emptyText,
  getLabel,
}) => {
  const isEmpty = items.length === 0;
  const listRef = useRef(null);
  const isDragSelectingRef = useRef(false);
  const didDragRef = useRef(false);
  const dragAnchorIndexRef = useRef(null);
  const lastClickIndexRef = useRef(null);

  const getItemId = (item) => typeof item === "string" ? item : (item.value ?? item.extension);
  const itemIds = useMemo(() => items.map(getItemId), [items]);

  const applyRangeToIndex = (currIdx) => {
    if (currIdx < 0) return;
    if (dragAnchorIndexRef.current === null) {
      dragAnchorIndexRef.current = currIdx;
    }
    const anchor = dragAnchorIndexRef.current;
    const from = Math.min(anchor, currIdx);
    const to = Math.max(anchor, currIdx);
    onDragSelect?.(itemIds.slice(from, to + 1));
  };

  const applyRangeBetween = (fromIdx, toIdx) => {
    if (fromIdx < 0 || toIdx < 0) return;
    const from = Math.min(fromIdx, toIdx);
    const to = Math.max(fromIdx, toIdx);
    onDragSelect?.(itemIds.slice(from, to + 1));
  };

  const applyRangeAtPoint = (clientX, clientY) => {
    const el = document.elementFromPoint(clientX, clientY);
    const strip = el?.closest?.("[data-codec-strip-id]");
    if (!strip || !listRef.current?.contains(strip)) return;
    const id = strip.getAttribute("data-codec-strip-id");
    if (!id) return;
    applyRangeToIndex(itemIds.indexOf(id));
  };

  const autoScrollList = (clientY) => {
    const container = listRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const edge = 28;
    const speed = 10;
    if (clientY < rect.top + edge) {
      container.scrollTop -= speed;
    } else if (clientY > rect.bottom - edge) {
      container.scrollTop += speed;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragSelectingRef.current || !(e.buttons & 1)) return;
      didDragRef.current = true;
      autoScrollList(e.clientY);
      applyRangeAtPoint(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      isDragSelectingRef.current = false;
      dragAnchorIndexRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [itemIds, onDragSelect]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    isDragSelectingRef.current = true;
    didDragRef.current = false;
    dragAnchorIndexRef.current = null;

    const strip = e.target.closest?.("[data-codec-strip-id]");
    if (strip && listRef.current?.contains(strip)) {
      const id = strip.getAttribute("data-codec-strip-id");
      const idx = itemIds.indexOf(id);
      if (idx !== -1) {
        dragAnchorIndexRef.current = idx;
        applyRangeToIndex(idx);
        lastClickIndexRef.current = idx;
      }
    }
  };

  const handleClick = (id, e) => {
    if (didDragRef.current) {
      e.preventDefault();
      didDragRef.current = false;
      const idx = itemIds.indexOf(id);
      if (idx !== -1) lastClickIndexRef.current = idx;
      return;
    }

    const idx = itemIds.indexOf(id);
    if (idx === -1) return;

    if (e.ctrlKey || e.metaKey) {
      onToggle(id);
      lastClickIndexRef.current = idx;
      return;
    }

    if (e.shiftKey && lastClickIndexRef.current !== null) {
      applyRangeBetween(lastClickIndexRef.current, idx);
      return;
    }

    onDragSelect?.([id]);
    lastClickIndexRef.current = idx;
  };

  const handleContainerClick = (e) => {
    if (didDragRef.current) return;
    if (e.target.closest?.("[data-codec-strip-id]")) return;
    onClearHighlight?.();
    lastClickIndexRef.current = null;
  };

  return (
    <div
      ref={listRef}
      data-codec-list-box
      style={getCcRouteCodecListBoxStyle(isEmpty)}
      onMouseDown={handleMouseDown}
      onClick={handleContainerClick}
    >
      {isEmpty ? (
        <div style={ccRouteCodecListEmptyStyle}>{emptyText}</div>
      ) : (
        items.map((item) => {
          const id = getItemId(item);
          const label = getLabel ? getLabel(id) : item.label || id;
          const isSelected = selectedIds.includes(id);
          return (
            <div
              key={id}
              data-codec-strip-id={id}
              role="option"
              aria-selected={isSelected}
              onClick={(e) => handleClick(id, e)}
              style={ccRouteCodecStripStyle(isSelected)}
            >
              {label}
            </div>
          );
        })
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const CCRoutePage = () => {
  const isCompact = useMediaQuery(CC_ROUTE_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
    extensions: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedExtensionsRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [ccIntervalTime, setCcIntervalTime] = useState("10");
  const [through, setThrough] = useState("Auto");
  const [recordKeepTime, setRecordKeepTime] = useState("8 hours");
  const [enabled, setEnabled] = useState("No");
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [selectedExtensions, setSelectedExtensions] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const showAlert = (text) => showMessage("error", text);

  const resetForm = () => {
    setEditId(null);
    setCcIntervalTime("10");
    setThrough("Auto");
    setRecordKeepTime("8 hours");
    setEnabled("No");
    setSelectedExtensions([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const loadRows = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const res = await fetchCCRoutes();
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setRows(list.map(normalizeRoute));
    } catch (err) {
      showAlert(err?.message || "Failed to load CC routes.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await fetchCCRouteExtensions();
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      const exts = list
        .map((item) => ({
          extension: String(item?.extension ?? "").trim(),
          label: String(item?.label ?? item?.extension ?? "").trim(),
        }))
        .filter((item) => item.extension)
        .sort(
          (a, b) =>
            (parseInt(a.extension, 10) || 0) - (parseInt(b.extension, 10) || 0),
        );
      setAvailableExtensions(exts);
      hasLoadedExtensionsRef.current = true;
    } catch (err) {
      showAlert(err?.message || "Failed to load extensions.");
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((item) =>
      map.set(item.extension, item.label || item.extension),
    );
    return map;
  }, [availableExtensions]);

  const getExtensionLabel = (ext) => extensionLabelMap.get(ext) || ext;

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setCcIntervalTime(row.ccIntervalTime);
    setThrough(row.through);
    setRecordKeepTime(row.recordKeepTime);
    setEnabled(row.enabled);
    setSelectedExtensions(
      Array.isArray(row.memberExtensions) ? row.memberExtensions : [],
    );
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleCloseModal = () => {
    if (!loading.save) setShowModal(false);
  };

  const availableList = useMemo(
    () =>
      availableExtensions.filter(
        (item) => !selectedExtensions.includes(item.extension),
      ),
    [availableExtensions, selectedExtensions],
  );

  const addSelectedExtensions = () => {
    if (availableSelected.length === 0) return;
    setSelectedExtensions((prev) => [
      ...prev,
      ...availableSelected.filter((ext) => !prev.includes(ext)),
    ]);
    setAvailableSelected([]);
  };

  const addAllExtensions = () => {
    setSelectedExtensions(availableExtensions.map((item) => item.extension));
    setAvailableSelected([]);
  };

  const removeSelectedExtensions = () => {
    if (chosenSelected.length === 0) return;
    setSelectedExtensions((prev) =>
      prev.filter((ext) => !chosenSelected.includes(ext)),
    );
    setChosenSelected([]);
  };

  const removeAllExtensions = () => {
    setSelectedExtensions([]);
    setChosenSelected([]);
  };

  const toggleAvailableExtensionSelect = (id) => {
    setAvailableSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleChosenExtensionSelect = (id) => {
    setChosenSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAvailableExtensions = (ids) => setAvailableSelected(ids);

  const selectChosenExtensions = (ids) => setChosenSelected(ids);

  const clearMemberExtensionHighlight = () => {
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  useEffect(() => {
    if (!showModal) return undefined;

    const handleOutsideClear = (e) => {
      if (!availableSelected.length && !chosenSelected.length) return;
      if (e.target.closest("[data-codec-strip-id]")) return;
      if (e.target.closest("[data-codec-action-btn]")) return;
      if (e.target.closest("[data-codec-list-box]")) return;
      clearMemberExtensionHighlight();
    };

    document.addEventListener("mousedown", handleOutsideClear);
    return () => document.removeEventListener("mousedown", handleOutsideClear);
  }, [showModal, availableSelected, chosenSelected]);

  // ── Sorting Logic ───────────────────────────────────────────────────────────
  const moveExtensionToBottom = () => {
    if (!chosenSelected.length) return;
    setSelectedExtensions((prev) => {
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      return [...rest, ...chosen];
    });
  };

  const moveExtensionUp = () => {
    if (!chosenSelected.length) return;
    setSelectedExtensions((prev) => {
      const arr = [...prev];
      for (let i = 1; i < arr.length; i++) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i - 1])
        ) {
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        }
      }
      return arr;
    });
  };

  const moveExtensionDown = () => {
    if (!chosenSelected.length) return;
    setSelectedExtensions((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 2; i >= 0; i--) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i + 1])
        ) {
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        }
      }
      return arr;
    });
  };

  const moveExtensionToTop = () => {
    if (!chosenSelected.length) return;
    setSelectedExtensions((prev) => {
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

  const pageIndices = pagedRows.map((_, i) => (page - 1) * itemsPerPage + i);
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleAll = () => {
    if (allPageSelected)
      setSelected((prev) => prev.filter((i) => !pageIndices.includes(i)));
    else setSelected((prev) => Array.from(new Set([...prev, ...pageIndices])));
  };

  const handleDelete = async () => {
    if (selected.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} record(s)?`,
      )
    )
      return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const ids = selected.map((i) => rows[i]?.id).filter(Boolean);
      await Promise.all(ids.map((id) => deleteCCRoute(id)));
      setSelected([]);
      await loadRows();
      showMessage("success", `Deleted ${ids.length} item(s).`);
    } catch (err) {
      showAlert(err?.message || "Failed to delete CC route.");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    if (selectedExtensions.length === 0) {
      showAlert("Please select at least one member extension.");
      return;
    }
    const apiPayload = {
      cc_interval_time: Number(ccIntervalTime),
      through,
      record_keep_time: recordKeepTime,
      enable: enabled,
      extensions: selectedExtensions,
    };
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editId != null) {
        await updateCCRoute({ id: editId, ...apiPayload });
        showMessage("success", "CC route updated.");
      } else {
        await createCCRoute(apiPayload);
        showMessage("success", "CC route created.");
      }
      await loadRows();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || "Failed to save CC route.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  return (
    <div style={{ ...ccRoutePageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
      <div style={ccRoutePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={ccRouteFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <CcRouteBreadcrumb section="Call Control" current="CC Route" />

        <div style={ccRouteCardStyle}>
          <div
            style={{
              ...ccRouteToolbarStyle,
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
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span style={ccRouteSelectedBadgeStyle}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="cancel"
                style={ccRouteCancelBtnStyle}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                )}{" "}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.save || loading.fetch}
                variant="primary"
                style={ccRoutePrimaryBtnStyle}
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
                message="No CC routes found."
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
                        sx={ccRouteTableCheckboxSx}
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
                    <ThWithTooltip
                      tooltipKey="cc_interval_time"
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      CC Interval Time
                    </ThWithTooltip>
                    <ThWithTooltip
                      tooltipKey="through"
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      Through
                    </ThWithTooltip>
                    <ThWithTooltip
                      tooltipKey="record_keep_time"
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      Record Keep Time
                    </ThWithTooltip>
                    <ThWithTooltip
                      tooltipKey="enable"
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      Enable
                    </ThWithTooltip>
                    <ThWithTooltip
                      tooltipKey="member_extensions"
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      Member Extensions
                    </ThWithTooltip>
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
                    const rowBg = getCcRouteRowBg(isSelected, idx);
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
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
                        <td style={getCcRouteTdStyle(rowBg, lastRowCellStyle)}>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(realIdx)}
                            sx={ccRouteTableCheckboxSx}
                          />
                        </td>
                        <td style={getCcRouteTdStyle(rowBg, lastRowCellStyle)}>
                          {realIdx + 1}
                        </td>
                        <td style={getCcRouteTdStyle(rowBg, lastRowCellStyle)}>
                          {getCcRouteIntervalLabel(row.ccIntervalTime)}
                        </td>
                        <td style={getCcRouteTdStyle(rowBg, lastRowCellStyle)}>
                          {row.through}
                        </td>
                        <td style={getCcRouteTdStyle(rowBg, lastRowCellStyle)}>
                          {row.recordKeepTime}
                        </td>
                        <td style={getCcRouteTdStyle(rowBg, lastRowCellStyle)}>
                          {row.enabled}
                        </td>
                        <td style={getCcRouteTdStyle(rowBg, lastRowCellStyle)}>
                          {row.memberExtensions?.length > 0 ? (
                            <span
                              title={
                                row.memberExtensions.length >
                                CC_ROUTE_LIST_TRUNCATE_THRESHOLD
                                  ? row.memberExtensions
                                      .map(getExtensionLabel)
                                      .join(", ")
                                  : undefined
                              }
                            >
                              {formatCcRouteItemListDisplay(
                                row.memberExtensions,
                                {
                                  mapItem: getExtensionLabel,
                                },
                              )}
                            </span>
                          ) : (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={getCcRouteTdStyle(rowBg, lastRowCellStyle, {
                            textAlign: "center",
                            padding: "7px 8px",
                            borderRight: "none",
                          })}
                        >
                          <EditDocumentIcon
                            titleAccess="Edit"
                            onClick={() => handleOpenEditModal(row)}
                            style={ccRouteEditIconStyle}
                            onMouseEnter={(e) =>
                              handleCcRouteEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleCcRouteEditIconHover(e, false)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && (
            <CcRoutePagination
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

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={showModal}
        onClose={handleCloseModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-start",
            justifyContent: "center",
            pt: 8,
          },
        }}
        PaperProps={{ sx: ccRouteModalPaperSx }}
      >
        <DialogTitle style={ccRouteModalTitleStyle}>
          {editId != null ? "Edit CC Route" : "Add CC Route"}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
          sx={{ WebkitOverflowScrolling: "touch" }}
        >
          <div style={ccRouteModalFormStyle}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                gap: "8px 32px",
              }}
            >
              <FieldRow
                label="CC Interval Time *"
                tooltipKey="cc_interval_time"
              >
                <FormControl size="small" fullWidth>
                  <Select
                    value={ccIntervalTime}
                    onChange={(e) => setCcIntervalTime(e.target.value)}
                    sx={ccRouteModalSelectSx}
                  >
                    {CC_ROUTE_INTERVAL_OPTIONS.map((o) => (
                      <MenuItem
                        key={o.value}
                        value={o.value}
                        sx={{ fontSize: 13 }}
                      >
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FieldRow>
              <FieldRow
                label="Record Keep Time *"
                tooltipKey="record_keep_time"
              >
                <FormControl size="small" fullWidth>
                  <Select
                    value={recordKeepTime}
                    onChange={(e) => setRecordKeepTime(e.target.value)}
                    sx={ccRouteModalSelectSx}
                  >
                    {CC_ROUTE_RECORD_KEEP_OPTIONS.map((o) => (
                      <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FieldRow>
              <FieldRow label="Through *" tooltipKey="through">
                <FormControl size="small" fullWidth>
                  <Select
                    value={through}
                    onChange={(e) => setThrough(e.target.value)}
                    sx={ccRouteModalSelectSx}
                  >
                    {CC_ROUTE_THROUGH_OPTIONS.map((o) => (
                      <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FieldRow>
              <FieldRow label="Enable *" tooltipKey="enable">
                <FormControl size="small" fullWidth>
                  <Select
                    value={enabled}
                    onChange={(e) => setEnabled(e.target.value)}
                    sx={ccRouteModalSelectSx}
                  >
                    {CC_ROUTE_ENABLE_OPTIONS.map((o) => (
                      <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FieldRow>
            </div>

            <SectionCard
              title="Member Extensions"
              tooltipKey="member_extensions"
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `1fr ${CC_ROUTE_CODEC_BTN_COL_WIDTH}px 1fr ${CC_ROUTE_CODEC_BTN_COL_WIDTH}px`,
                  gap: 10,
                  width: "100%",
                  alignItems: "start",
                }}
              >
                <div>
                  <div style={ccRouteDualListLabelStyle}>Available</div>
                  <CcRouteCodecListBox
                    items={availableList}
                    selectedIds={availableSelected}
                    onToggle={toggleAvailableExtensionSelect}
                    onDragSelect={selectAvailableExtensions}
                    onClearHighlight={clearMemberExtensionHighlight}
                    emptyText="No extensions"
                    getLabel={(id) => {
                      const item = availableList.find(
                        (x) => x.extension === id,
                      );
                      return item?.label || getExtensionLabel(id);
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{ height: CC_ROUTE_CODEC_LIST_LABEL_OFFSET }}
                    aria-hidden="true"
                  />
                  <div style={ccRouteCodecBtnColumnStyle}>
                    <CcRouteCodecDualListBtn
                      onClick={addSelectedExtensions}
                      title="Move selected to Selected"
                    >
                      &gt;
                    </CcRouteCodecDualListBtn>
                    <CcRouteCodecDualListBtn
                      onClick={addAllExtensions}
                      title="Move all to Selected"
                    >
                      &gt;&gt;
                    </CcRouteCodecDualListBtn>
                    <CcRouteCodecDualListBtn
                      onClick={removeSelectedExtensions}
                      title="Move selected to Available"
                    >
                      &lt;
                    </CcRouteCodecDualListBtn>
                    <CcRouteCodecDualListBtn
                      onClick={removeAllExtensions}
                      title="Move all to Available"
                    >
                      &lt;&lt;
                    </CcRouteCodecDualListBtn>
                  </div>
                </div>
                <div>
                  <div style={ccRouteDualListLabelStyle}>Selected</div>
                  <CcRouteCodecListBox
                    items={selectedExtensions}
                    selectedIds={chosenSelected}
                    onToggle={toggleChosenExtensionSelect}
                    onDragSelect={selectChosenExtensions}
                    onClearHighlight={clearMemberExtensionHighlight}
                    emptyText="No selected extensions"
                    getLabel={getExtensionLabel}
                  />
                </div>
                <div>
                  <div
                    style={{ height: CC_ROUTE_CODEC_LIST_LABEL_OFFSET }}
                    aria-hidden="true"
                  />
                  <div style={ccRouteCodecBtnColumnStyle}>
                    <CcRouteCodecDualListBtn
                      reorder
                      title="Move to bottom"
                      down
                      onClick={moveExtensionToBottom}
                    >
                      vv
                    </CcRouteCodecDualListBtn>
                    <CcRouteCodecDualListBtn
                      reorder
                      title="Move up"
                      onClick={moveExtensionUp}
                    >
                      ^
                    </CcRouteCodecDualListBtn>
                    <CcRouteCodecDualListBtn
                      reorder
                      title="Move down"
                      down
                      onClick={moveExtensionDown}
                    >
                      v
                    </CcRouteCodecDualListBtn>
                    <CcRouteCodecDualListBtn
                      reorder
                      title="Move to top"
                      onClick={moveExtensionToTop}
                    >
                      ^^
                    </CcRouteCodecDualListBtn>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={ccRouteModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CCRoutePage;
