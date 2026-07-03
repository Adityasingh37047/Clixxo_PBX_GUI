import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listIvrDestinations } from "../../../api/apiService";
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
import axiosInstance from "../../../api/axiosInstance";
import { listOutboundRouteExtensions } from "../../../api/apiService";
import {
  OUTBOUND_RESTRICTION_ENABLE_OPTIONS,
  OUTBOUND_RESTRICTION_FIELD_TOOLTIPS,
} from "../../../constants/OutboundRestrictionConstants";

const OUTBOUND_RESTRICTION_COMPACT_MQ = "(max-width: 768px)";

// ── Outbound Restriction API (local — does not modify apiService) ─────────────
const orPost = async (payload) => {
  try {
    const response = await axiosInstance.post("/outbound-restriction", payload);
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      throw new Error("Network Error");
    }
    throw error.response?.data || { message: "Server unavailable" };
  }
};

const listOutboundRestrictions = () => orPost({ type: "list" });
const createOutboundRestriction = (data) => orPost({ type: "create", ...data });
const updateOutboundRestriction = (id, data) =>
  orPost({ type: "update", id: Number(id), ...data });
const deleteOutboundRestriction = (id) =>
  orPost({ type: "delete", id: Number(id) });

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
  title,
  type,
  form,
  component,
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
        transition: "all 0.15s ease",
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

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
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

const outboundRestrictionModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const outboundRestrictionPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const outboundRestrictionPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const OutboundRestrictionBreadcrumb = ({ section, current, style }) => (
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

const OUTBOUND_RESTRICTION_LIST_TRUNCATE_THRESHOLD = 10;
const OUTBOUND_RESTRICTION_LIST_DISPLAY_LIMIT = 6;

const formatOutboundRestrictionItemListDisplay = (
  items,
  {
    threshold = OUTBOUND_RESTRICTION_LIST_TRUNCATE_THRESHOLD,
    limit = OUTBOUND_RESTRICTION_LIST_DISPLAY_LIMIT,
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

const OUTBOUND_RESTRICTION_MODAL_SECTION_BG = "#f8fafc";
const OUTBOUND_RESTRICTION_MODAL_SECTION_HEADING_COLOR = "#30415A";

const OUTBOUND_RESTRICTION_TOOLTIP_PROPS = {
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

const formatOutboundRestrictionTooltipTitle = (text) => {
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

const RestrictionFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = OUTBOUND_RESTRICTION_FIELD_TOOLTIPS[tooltipKey] || "";
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
      title={formatOutboundRestrictionTooltipTitle(tooltip)}
      {...OUTBOUND_RESTRICTION_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const OutboundRestrictionModalSectionHeading = ({ title, tooltipKey, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  const heading = (
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : -6,
        background: OUTBOUND_RESTRICTION_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: OUTBOUND_RESTRICTION_MODAL_SECTION_HEADING_COLOR,
        cursor: tooltipKey ? "help" : undefined,
      }}
    >
      {title}
    </span>
  );
  const tooltip = tooltipKey
    ? OUTBOUND_RESTRICTION_FIELD_TOOLTIPS[tooltipKey]
    : "";
  return (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "16px 0 24px 0"
            : "0 0 24px 0"
          : "16px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
      {tooltip ? (
        <Tooltip
          title={formatOutboundRestrictionTooltipTitle(tooltip)}
          {...OUTBOUND_RESTRICTION_TOOLTIP_PROPS}
        >
          {heading}
        </Tooltip>
      ) : (
        heading
      )}
    </div>
  );
};

const outboundRestrictionDualListLabelStyle = {
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

const outboundRestrictionOutlinedInputRootSx = {
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

const outboundRestrictionModalTextFieldSx = {
  "& .MuiOutlinedInput-root": outboundRestrictionOutlinedInputRootSx,
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
    fontSize: 13,
    padding: "8px 12px",
  },
};

const outboundRestrictionModalTextFieldFullSx = {
  ...outboundRestrictionModalTextFieldSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...outboundRestrictionOutlinedInputRootSx,
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

const outboundRestrictionModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...outboundRestrictionOutlinedInputRootSx,
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

const outboundRestrictionModalPaperSx = {
  width: 900,
  maxWidth: "95vw",
  margin: 24,
  maxHeight: "calc(100vh - 80px - 48px)",
  display: "flex",
  flexDirection: "column",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const outboundRestrictionModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const OUTBOUND_RESTRICTION_TABLE_CARD_RADIUS = 10;

const outboundRestrictionCardStyle = {
  background: "#ffffff",
  borderRadius: OUTBOUND_RESTRICTION_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const outboundRestrictionToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: OUTBOUND_RESTRICTION_TABLE_CARD_RADIUS,
  borderTopRightRadius: OUTBOUND_RESTRICTION_TABLE_CARD_RADIUS,
};

const outboundRestrictionPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: OUTBOUND_RESTRICTION_TABLE_CARD_RADIUS,
  borderBottomRightRadius: OUTBOUND_RESTRICTION_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const outboundRestrictionSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const outboundRestrictionCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const outboundRestrictionPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const outboundRestrictionPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const outboundRestrictionFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const OutboundRestrictionPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  style,
}) => (
  <div style={{ ...outboundRestrictionPaginationStyle, ...style }}>
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
      <span style={outboundRestrictionPageBadgeStyle}>
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
      <RestrictionFieldLabel
        tooltipKey={tooltipKey}
        style={{
          textAlign: "left",
          width: labelWidth,
          minWidth: labelWidth,
          flexShrink: 0,
          paddingTop: wide ? 4 : 0,
        }}
      >
        {label}
      </RestrictionFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          color: C.labelText,
          fontWeight: 600,
          whiteSpace: "nowrap",
          textAlign: "left",
          width: labelWidth,
          minWidth: labelWidth,
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

const OUTBOUND_RESTRICTION_MODAL_LABEL_WIDTH = 185;
const OUTBOUND_RESTRICTION_MODAL_FIELD_WIDTH = 210;
const OUTBOUND_RESTRICTION_RIGHT_LABEL_PADDING_LEFT = 28;
const OUTBOUND_RESTRICTION_LEFT_FIELD_LABEL_WIDTH = 168;

/** Left column — same fill-box size as right; label position unchanged */
const OutboundLeftField = ({ children }) => (
  <div
    style={{
      width: OUTBOUND_RESTRICTION_MODAL_FIELD_WIDTH,
      maxWidth: "100%",
    }}
  >
    {children}
  </div>
);

const OutboundRightRow = ({ label, tooltipKey, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
    }}
  >
    {tooltipKey ? (
      <RestrictionFieldLabel
        tooltipKey={tooltipKey}
        style={{
          textAlign: "left",
          width: OUTBOUND_RESTRICTION_MODAL_LABEL_WIDTH,
          minWidth: OUTBOUND_RESTRICTION_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          paddingLeft: OUTBOUND_RESTRICTION_RIGHT_LABEL_PADDING_LEFT,
          boxSizing: "border-box",
        }}
      >
        {label}
      </RestrictionFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          color: C.labelText,
          fontWeight: 600,
          whiteSpace: "nowrap",
          textAlign: "left",
          width: OUTBOUND_RESTRICTION_MODAL_LABEL_WIDTH,
          minWidth: OUTBOUND_RESTRICTION_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          paddingLeft: OUTBOUND_RESTRICTION_RIGHT_LABEL_PADDING_LEFT,
          boxSizing: "border-box",
        }}
      >
        {label}
      </label>
    )}
    <div
      style={{
        width: OUTBOUND_RESTRICTION_MODAL_FIELD_WIDTH,
        flexShrink: 0,
      }}
    >
      {children}
    </div>
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
    <OutboundRestrictionModalSectionHeading
      title={title}
      tooltipKey={tooltipKey}
      isFirst={isFirst}
    />
    <div>{children}</div>
  </div>
);

const outboundRestrictionModalFormStyle = {
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

const OUTBOUND_RESTRICTION_CODEC_LIST_BOX_HEIGHT = 188;
const OUTBOUND_RESTRICTION_CODEC_BTN_COL_WIDTH = 40;
const OUTBOUND_RESTRICTION_CODEC_BTN_GAP = 6;
const OUTBOUND_RESTRICTION_CODEC_BTN_HEIGHT =
  (OUTBOUND_RESTRICTION_CODEC_LIST_BOX_HEIGHT -
    OUTBOUND_RESTRICTION_CODEC_BTN_GAP * 3) /
  4;
const OUTBOUND_RESTRICTION_CODEC_LIST_LABEL_OFFSET = 28;

const getOutboundRestrictionCodecListBoxStyle = (isEmpty) => ({
  width: "100%",
  minHeight: OUTBOUND_RESTRICTION_CODEC_LIST_BOX_HEIGHT,
  height: OUTBOUND_RESTRICTION_CODEC_LIST_BOX_HEIGHT,
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

const outboundRestrictionCodecListEmptyStyle = {
  color: C.placeholderText,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "center",
  userSelect: "none",
  padding: "0 16px",
};

const outboundRestrictionCodecStripStyle = (isSelected) => ({
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

const outboundRestrictionCodecDualListBtnStyle = {
  width: OUTBOUND_RESTRICTION_CODEC_BTN_COL_WIDTH,
  height: OUTBOUND_RESTRICTION_CODEC_BTN_HEIGHT,
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

const outboundRestrictionCodecDualListReorderBtnStyle = {
  ...outboundRestrictionCodecDualListBtnStyle,
  fontSize: 11,
  fontWeight: 500
};

const outboundRestrictionCodecDualListReorderDownBtnStyle = {
  ...outboundRestrictionCodecDualListReorderBtnStyle,
  fontWeight: 400,
};

const outboundRestrictionCodecBtnColumnStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: OUTBOUND_RESTRICTION_CODEC_BTN_GAP,
  height: OUTBOUND_RESTRICTION_CODEC_LIST_BOX_HEIGHT,
  width: OUTBOUND_RESTRICTION_CODEC_BTN_COL_WIDTH,
};

const OutboundRestrictionCodecDualListBtn = ({
  onClick,
  title,
  children,
  reorder,
  down,
}) => (
  <button
    type="button"
    data-codec-action-btn
    title={title}
    onClick={onClick}
        style={
      down
        ? outboundRestrictionCodecDualListReorderDownBtnStyle
        : reorder
          ? outboundRestrictionCodecDualListReorderBtnStyle
          : outboundRestrictionCodecDualListBtnStyle
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
      e.currentTarget.style.boxShadow =
        "inset 0 1px 3px rgba(15, 23, 42, 0.18)";
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

const OutboundRestrictionCodecListBox = ({
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

  const getItemId = (item) => typeof item === "string" ? item : (item.value ?? item.extension ?? item.id);
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
      style={getOutboundRestrictionCodecListBoxStyle(isEmpty)}
      onMouseDown={handleMouseDown}
      onClick={handleContainerClick}
    >
      {isEmpty ? (
        <div style={outboundRestrictionCodecListEmptyStyle}>{emptyText}</div>
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
              style={outboundRestrictionCodecStripStyle(isSelected)}
            >
              {label}
            </div>
          );
        })
      )}
    </div>
  );
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

const mapRestrictionFromApi = (item) => ({
  id: item?.id,
  name: String(item?.name || ""),
  timeLimit: String(
    item?.time_limit ?? item?.timeLimit ?? item?.time_limit_sec ?? "",
  ),
  callsLimit: String(
    item?.calls_limit ??
      item?.number_of_calls_limit ??
      item?.callsLimit ??
      item?.call_limit ??
      "",
  ),
  autoCancelRestriction: toUiYesNo(
    item?.auto_cancel_restriction ?? item?.auto_cancel ?? item?.autoCancel,
    "No",
  ),
  memberExtensions: Array.isArray(item?.member_extensions)
    ? item.member_extensions.map(String)
    : Array.isArray(item?.extensions)
      ? item.extensions.map(String)
      : [],
  enabled: toUiYesNo(item?.enabled ?? item?.enable, "Yes"),
});

const yesNoCellStyle = (value) => ({
  color: value === "Yes" ? "#16a34a" : "#475569",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
});

const OutboundRestrictions = () => {
  const isCompact = useMediaQuery(OUTBOUND_RESTRICTION_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
    extensions: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedExtensionsRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [callsLimit, setCallsLimit] = useState("");
  const [autoCancelRestriction, setAutoCancelRestriction] = useState("No");
  const [enabled, setEnabled] = useState("Yes");
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);

  const [message, setMessage] = useState({ type: "", text: "" });
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };
  const showAlert = (text) => showMessage("error", text);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter((row) => {
      const extStr = (row.memberExtensions || []).join(" ").toLowerCase();
      return (
        (row.name || "").toLowerCase().includes(q) ||
        (row.timeLimit || "").toLowerCase().includes(q) ||
        (row.callsLimit || "").toLowerCase().includes(q) ||
        (row.autoCancelRestriction || "").toLowerCase().includes(q) ||
        (row.enabled || "").toLowerCase().includes(q) ||
        extStr.includes(q)
      );
    });
  }, [rows, searchQuery]);
  const loadDestinations = async () => {
    try {
      const data = await listIvrDestinations();

      const msg = data?.message || {};

      const mapped = (msg.Extensions || []).map((item) => ({
        extension: String(item?.value ?? "").trim(),
        label: String(item?.label ?? "").trim(),
      }));

      setAvailableExtensions(mapped);
    } catch (err) {
      console.error(err);
    }
  };
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const pagedRows = filteredRows.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  useEffect(() => {
    setPage((current) =>
      Math.min(
        Math.max(1, current),
        Math.max(1, Math.ceil(filteredRows.length / itemsPerPage)),
      ),
    );
  }, [filteredRows.length]);

  const fetchRestrictions = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listOutboundRestrictions();
      if (!res?.response) {
        showAlert(res?.message || "Failed to load outbound restrictions.");
        setRows([]);
        return;
      }
      const list = Array.isArray(res?.message)
        ? res.message
        : res?.message
          ? [res.message]
          : [];
      setRows(list.map(mapRestrictionFromApi));
    } catch (err) {
      showAlert(err?.message || "Failed to load outbound restrictions.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await listOutboundRouteExtensions();
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      const exts = list
        .map((item) => ({
          extension: String(item?.extension ?? item?.id ?? "").trim(),
          label: String(
            item?.label ?? item?.name ?? item?.extension ?? item?.id ?? "",
          ).trim(),
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
      setAvailableExtensions([]);
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  useEffect(() => {
    fetchRestrictions();
    loadDestinations();
  }, []);

  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((item) =>
      map.set(item.extension, item.label || item.extension),
    );
    return map;
  }, [availableExtensions]);

  const getExtensionLabel = (ext) => extensionLabelMap.get(ext) || ext;

  const resetForm = () => {
    setEditId(null);
    setName("");
    setTimeLimit("");
    setCallsLimit("");
    setAutoCancelRestriction("No");
    setEnabled("Yes");
    setMemberExtensions([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    // if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setTimeLimit(row.timeLimit || "");
    setCallsLimit(row.callsLimit || "");
    setAutoCancelRestriction(row.autoCancelRestriction || "No");
    setEnabled(row.enabled || "Yes");
    setMemberExtensions(
      Array.isArray(row.memberExtensions) ? row.memberExtensions : [],
    );
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    // if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const availableList = useMemo(
    () =>
      availableExtensions.filter(
        (item) => !memberExtensions.includes(item.extension),
      ),
    [availableExtensions, memberExtensions],
  );

  const addSelectedExtensions = () => {
    if (availableSelected.length === 0) return;
    setMemberExtensions((prev) => [
      ...prev,
      ...availableSelected.filter((ext) => !prev.includes(ext)),
    ]);
    setAvailableSelected([]);
  };

  const addAllExtensions = () => {
    setMemberExtensions(availableExtensions.map((item) => item.extension));
    setAvailableSelected([]);
  };

  const removeSelectedExtensions = () => {
    if (chosenSelected.length === 0) return;
    setMemberExtensions((prev) =>
      prev.filter((ext) => !chosenSelected.includes(ext)),
    );
    setChosenSelected([]);
  };

  const removeAllExtensions = () => {
    setMemberExtensions([]);
    setChosenSelected([]);
  };

  const moveExtToBottom = () => {
    if (!chosenSelected.length) return;
    setMemberExtensions((prev) => {
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      return [...rest, ...chosen];
    });
  };

  const moveExtUp = () => {
    if (!chosenSelected.length) return;
    setMemberExtensions((prev) => {
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

  const moveExtDown = () => {
    if (!chosenSelected.length) return;
    setMemberExtensions((prev) => {
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

  const moveExtToTop = () => {
    if (!chosenSelected.length) return;
    setMemberExtensions((prev) => {
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      return [...chosen, ...rest];
    });
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
    ) {
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const idsToDelete = selected
        .map((idx) => filteredRows[idx]?.id)
        .filter((id) => id != null);
      const results = await Promise.all(
        idsToDelete.map((id) => deleteOutboundRestriction(id)),
      );
      const failed = results.find((res) => !res?.response);
      if (failed) {
        showAlert(failed?.message || "Failed to delete one or more records.");
      } else {
        showMessage("success", "Outbound restriction(s) deleted successfully.");
      }
      await fetchRestrictions();
      setSelected([]);
      setPage(1);
    } catch (err) {
      showAlert(err?.message || "Failed to delete record(s).");
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
    if (memberExtensions.length === 0) {
      showAlert("Please select at least one member extension.");
      return;
    }

    const apiPayload = {
      name: trimmedName,
      time_limit: timeLimit.trim(),
      calls_limit: callsLimit.trim(),
      auto_cancel_restriction: toApiYesNo(autoCancelRestriction),
      member_extensions: [...memberExtensions],
      enabled: toApiYesNo(enabled, "yes"),
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const response =
        editId != null
          ? await updateOutboundRestriction(editId, apiPayload)
          : await createOutboundRestriction(apiPayload);
      if (!response?.response) {
        showAlert(response?.message || "Failed to save outbound restriction.");
        return;
      }
      showMessage(
        "success",
        editId != null
          ? "Outbound restriction updated successfully."
          : "Outbound restriction created successfully.",
      );
      await fetchRestrictions();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || "Failed to save outbound restriction.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const dataEmpty = !isInitialLoad && rows.length === 0;
  const searchEmpty =
    !isInitialLoad && rows.length > 0 && filteredRows.length === 0;

  return (
    <div
      style={{
        ...outboundRestrictionPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={outboundRestrictionPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={outboundRestrictionFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <OutboundRestrictionBreadcrumb
          section="Call Control"
          current="Outbound Restrictions"
        />

        <div style={outboundRestrictionCardStyle}>
          <div
            style={{
              ...outboundRestrictionToolbarStyle,
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
                marginLeft: "auto",
                minWidth: 0,
              }}
            >
              {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#ffffff",
                  border: `0.5px solid ${searchFocused ? C.accent : C.cardBorder}`,
                  borderRadius: 6,
                  padding: "5px 10px",
                  transition: "border-color 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: searchFocused ? C.accent : C.mutedText,
                  }}
                >
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search restrictions..."
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 11,
                    color: C.valueText,
                    outline: "none",
                    width: isCompact ? 120 : 160,
                  }}
                />
                {searchQuery && (
                  <span
                    onClick={() => {
                      setSearchQuery("");
                      setPage(1);
                    }}
                    style={{
                      fontSize: 11
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </span>
                )}
              </div> */}
              {selected.length > 0 && (
                <span style={outboundRestrictionSelectedBadgeStyle}>
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
                style={outboundRestrictionCancelBtnStyle}
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
                style={outboundRestrictionPrimaryBtnStyle}
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
              ...(isCompact
                ? { overflowX: "auto", WebkitOverflowScrolling: "touch" }
                : {}),
            }}
          >
            {isInitialLoad ? (
              <TableListLoading />
            ) : dataEmpty ? (
              <TableListEmptyState
                message="No outbound restrictions found."
                onAddNew={handleOpenAddModal}
              />
            ) : searchEmpty ? (
              <TableListEmptyState
                message={`No results for "${searchQuery}"`}
                showButton={false}
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
                        sx={checkboxSx}
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
                      Time Limit
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Number of Calls Limit
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Auto Cancel Restriction
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Member Extensions
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
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
                        key={row.id ?? realIdx}
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
                            sx={checkboxSx}
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
                          {row.timeLimit || (
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
                          {row.callsLimit || (
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
                            style={yesNoCellStyle(row.autoCancelRestriction)}
                          >
                            {row.autoCancelRestriction}
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
                          {row.memberExtensions?.length > 0 ? (
                            <span
                              title={
                                row.memberExtensions.length >
                                OUTBOUND_RESTRICTION_LIST_TRUNCATE_THRESHOLD
                                  ? row.memberExtensions
                                      .map(getExtensionLabel)
                                      .join(", ")
                                  : undefined
                              }
                            >
                              {formatOutboundRestrictionItemListDisplay(
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
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span style={yesNoCellStyle(row.enabled)}>
                            {row.enabled}
                          </span>
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

          {!isInitialLoad && filteredRows.length > 0 && (
            <OutboundRestrictionPagination
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
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{ sx: outboundRestrictionModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={outboundRestrictionModalTitleStyle}>
          {editId != null
            ? "Edit Outbound Restriction"
            : "Add Outbound Restriction"}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div style={outboundRestrictionModalFormStyle}>
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
                <FieldRow
                  label="Name *"
                  tooltipKey="name"
                  labelWidth={OUTBOUND_RESTRICTION_LEFT_FIELD_LABEL_WIDTH}
                >
                  <OutboundLeftField>
                    <TextField
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      size="small"
                      fullWidth
                      sx={outboundRestrictionModalTextFieldFullSx}
                    />
                  </OutboundLeftField>
                </FieldRow>
                <FieldRow
                  label="Time Limit *"
                  tooltipKey="time_limit"
                  labelWidth={OUTBOUND_RESTRICTION_LEFT_FIELD_LABEL_WIDTH}
                >
                  <OutboundLeftField>
                    <TextField
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value)}
                      size="small"
                      fullWidth
                      placeholder="e.g. 30 min"
                      sx={outboundRestrictionModalTextFieldFullSx}
                    />
                  </OutboundLeftField>
                </FieldRow>
                <FieldRow
                  label="Number of Calls Limit *"
                  tooltipKey="calls_limit"
                  labelWidth={OUTBOUND_RESTRICTION_LEFT_FIELD_LABEL_WIDTH}
                >
                  <OutboundLeftField>
                    <TextField
                      value={callsLimit}
                      onChange={(e) => setCallsLimit(e.target.value)}
                      size="small"
                      fullWidth
                      sx={outboundRestrictionModalTextFieldFullSx}
                    />
                  </OutboundLeftField>
                </FieldRow>
              </div>

              <div style={outboundRightColStyle}>
                <OutboundRightRow
                  label="Auto Cancel Restriction *"
                  tooltipKey="auto_cancel_restriction"
                >
                  <FormControl size="small" fullWidth>
                    <Select
                      value={autoCancelRestriction}
                      onChange={(e) =>
                        setAutoCancelRestriction(e.target.value)
                      }
                      sx={outboundRestrictionModalSelectSx}
                    >
                      {OUTBOUND_RESTRICTION_ENABLE_OPTIONS.map((o) => (
                        <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </OutboundRightRow>
                <OutboundRightRow label="Enabled *" tooltipKey="enabled">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={outboundRestrictionModalSelectSx}
                    >
                      {OUTBOUND_RESTRICTION_ENABLE_OPTIONS.map((o) => (
                        <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </OutboundRightRow>
              </div>
            </div>

            <SectionCard
              title="Member Extensions"
              tooltipKey="member_extensions"
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `1fr ${OUTBOUND_RESTRICTION_CODEC_BTN_COL_WIDTH}px 1fr ${OUTBOUND_RESTRICTION_CODEC_BTN_COL_WIDTH}px`,
                  gap: 10,
                  width: "100%",
                  alignItems: "start",
                }}
              >
                <div>
                  <div style={outboundRestrictionDualListLabelStyle}>
                    Available
                  </div>
                  <OutboundRestrictionCodecListBox
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
                    style={{
                      height: OUTBOUND_RESTRICTION_CODEC_LIST_LABEL_OFFSET,
                    }}
                    aria-hidden="true"
                  />
                  <div style={outboundRestrictionCodecBtnColumnStyle}>
                    <OutboundRestrictionCodecDualListBtn
                      onClick={addSelectedExtensions}
                      title="Move selected to Selected"
                    >
                      &gt;
                    </OutboundRestrictionCodecDualListBtn>
                    <OutboundRestrictionCodecDualListBtn
                      onClick={addAllExtensions}
                      title="Move all to Selected"
                    >
                      &gt;&gt;
                    </OutboundRestrictionCodecDualListBtn>
                    <OutboundRestrictionCodecDualListBtn
                      onClick={removeSelectedExtensions}
                      title="Move selected to Available"
                    >
                      &lt;
                    </OutboundRestrictionCodecDualListBtn>
                    <OutboundRestrictionCodecDualListBtn
                      onClick={removeAllExtensions}
                      title="Move all to Available"
                    >
                      &lt;&lt;
                    </OutboundRestrictionCodecDualListBtn>
                  </div>
                </div>
                <div>
                  <div style={outboundRestrictionDualListLabelStyle}>
                    Selected
                  </div>
                  <OutboundRestrictionCodecListBox
                    items={memberExtensions}
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
                    style={{
                      height: OUTBOUND_RESTRICTION_CODEC_LIST_LABEL_OFFSET,
                    }}
                    aria-hidden="true"
                  />
                  <div style={outboundRestrictionCodecBtnColumnStyle}>
                    <OutboundRestrictionCodecDualListBtn
                      reorder
                      title="Move to bottom"
                      down
                      onClick={moveExtToBottom}
                    >
                      vv
                    </OutboundRestrictionCodecDualListBtn>
                    <OutboundRestrictionCodecDualListBtn
                      reorder
                      title="Move up"
                      onClick={moveExtUp}
                    >
                      ^
                    </OutboundRestrictionCodecDualListBtn>
                    <OutboundRestrictionCodecDualListBtn
                      reorder
                      title="Move down"
                      down
                      onClick={moveExtDown}
                    >
                      v
                    </OutboundRestrictionCodecDualListBtn>
                    <OutboundRestrictionCodecDualListBtn
                      reorder
                      title="Move to top"
                      onClick={moveExtToTop}
                    >
                      ^^
                    </OutboundRestrictionCodecDualListBtn>
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
            style={outboundRestrictionModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OutboundRestrictions;
