import React, {  useState, useEffect, useLayoutEffect, useRef , useMemo } from "react";
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
  ListSubheader,
  MenuItem,
  Select as MuiSelect,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  fetchCallQueues,
  createCallQueue,
  updateCallQueue,
  deleteCallQueue,
  listIvrDestinations,
  listCustomPrompts,
  listRingBackOptions,
} from "../../../api/apiService";
import {
  CALL_QUEUE_FIELD_TOOLTIPS,
  CALL_QUEUE_INITIAL_FORM,
  CALL_QUEUE_MODAL_TABS,
  RING_STRATEGY_OPTIONS,
  ACTION_OPTIONS,
  ANNOUNCE_FREQ_OPTIONS,
} from "../../../constants/CallQueueConstants";

const CALL_QUEUE_COMPACT_MQ = "(max-width: 768px)";

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
  placeholderText: "#94a3b8",
  codecBoxBorder: "#c5ccd6",
  codecBoxAvailableBg: "#f8fafc",
  codecStripBg: "#ffffff",
  codecStripBorder: "#ced4de",
  codecStripSelectedBg: "#f1f5f9",
  codecStripSelectedBorder: "#8fa3b8",
  codecBtnBorder: "#c9d0d9",
  codecBtnBg: "#d9dde3",
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
      position: "sticky",
      top: 0,
      zIndex: 10,
      ...extra,
    }}
  >
    {children}
  </th>
);

const callQueueTdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const callQueueTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const CALL_QUEUE_TABLE_CARD_RADIUS = 10;

const callQueueCardStyle = {
  background: "#ffffff",
  borderRadius: CALL_QUEUE_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const callQueueToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: CALL_QUEUE_TABLE_CARD_RADIUS,
  borderTopRightRadius: CALL_QUEUE_TABLE_CARD_RADIUS,
};

const callQueuePaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: CALL_QUEUE_TABLE_CARD_RADIUS,
  borderBottomRightRadius: CALL_QUEUE_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const callQueuePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const callQueuePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const callQueueSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const callQueuePageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const callQueueFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const callQueueEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const handleCallQueueEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
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

const callQueueModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const CallQueueBreadcrumb = ({ section, current, style }) => (
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

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const callQueueOutlinedInputRootSx = {
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

const callQueueModalTextFieldFullSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...callQueueOutlinedInputRootSx,
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

const callQueueModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...callQueueOutlinedInputRootSx,
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

const callQueueModalPaperSx = {
  width: 900,
  maxWidth: "96vw",
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

const callQueueModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const callQueueModalFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const callQueueModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const CALL_QUEUE_TOOLTIP_PROPS = {
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

const formatCallQueueTooltipTitle = (text) => {
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

const callQueueModalTabBarStyle = {
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
};

const callQueueModalTabsSx = {
  minHeight: 45,
  "& .MuiTab-root": {
    color: "#374151",
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 45,
  },
  "& .MuiTab-root.Mui-selected": {
    color: C.accent,
    fontWeight: 700,
  },
};

const CallQueueModalTabs = ({ value, onChange, tabs, fullWidth = true }) => (
  <div style={callQueueModalTabBarStyle}>
    <Tabs
      value={value}
      onChange={(_, next) => onChange(next)}
      variant={fullWidth ? "fullWidth" : "standard"}
      TabIndicatorProps={{
        style: { backgroundColor: C.accent, height: 2 },
      }}
      sx={callQueueModalTabsSx}
    >
      {tabs.map((t) => (
        <Tab key={t.id} label={t.label} value={t.id} />
      ))}
    </Tabs>
  </div>
);

const CALL_QUEUE_MODAL_LABEL_WIDTH = 175;

const CallQueueFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = CALL_QUEUE_FIELD_TOOLTIPS[tooltipKey] || "";
  const label = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
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
      title={formatCallQueueTooltipTitle(tooltip)}
      {...CALL_QUEUE_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const CallQueueFieldRow = ({
  label,
  tooltipKey,
  children,
  required = false,
  alignTop = false,
  labelWidth = CALL_QUEUE_MODAL_LABEL_WIDTH,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: alignTop ? "flex-start" : "center",
      gap: 12,
      minHeight: alignTop ? undefined : 32,
    }}
  >
    <CallQueueFieldLabel
      tooltipKey={tooltipKey}
      style={{
        width: labelWidth,
        flexShrink: 0,
        marginTop: alignTop ? 4 : 0,
      }}
    >
      {label}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </CallQueueFieldLabel>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const CALL_QUEUE_MODAL_SECTION_BG = "#f8fafc";

const CallQueueSectionHeading = ({
  title,
  isFirst = false,
  required = false,
}) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  return (
  <div
    style={{
      margin: isFirst
        ? isLaptopNarrow
          ? "16px 0 24px 0"
          : "0 0 24px 0"
        : "28px 0 24px 0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.divider}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : -6,
        background: CALL_QUEUE_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: "#30415A",
      }}
    >
      {title}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </span>
  </div>
  );
};

const CALL_QUEUE_AGENT_CODEC_LIST_BOX_HEIGHT = 188;
const CALL_QUEUE_AGENT_CODEC_BTN_COL_WIDTH = 40;
const CALL_QUEUE_AGENT_CODEC_BTN_GAP = 6;
const CALL_QUEUE_AGENT_CODEC_BTN_HEIGHT =
  (CALL_QUEUE_AGENT_CODEC_LIST_BOX_HEIGHT - CALL_QUEUE_AGENT_CODEC_BTN_GAP * 3) /
  4;
const CALL_QUEUE_AGENT_CODEC_LIST_LABEL_OFFSET = 28;

const callQueueAgentDualListLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "center",
  marginBottom: 8,
};

const getCallQueueAgentCodecListBoxStyle = (isEmpty) => ({
  width: "100%",
  minHeight: CALL_QUEUE_AGENT_CODEC_LIST_BOX_HEIGHT,
  height: CALL_QUEUE_AGENT_CODEC_LIST_BOX_HEIGHT,
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

const callQueueAgentCodecListEmptyStyle = {
  color: C.placeholderText,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "center",
  userSelect: "none",
  padding: "0 16px",
};

const callQueueAgentCodecStripStyle = (isSelected) => ({
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

const callQueueAgentCodecDualListBtnStyle = {
  width: CALL_QUEUE_AGENT_CODEC_BTN_COL_WIDTH,
  height: CALL_QUEUE_AGENT_CODEC_BTN_HEIGHT,
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
  transition:
    "background 0.12s ease, transform 0.1s ease, box-shadow 0.1s ease",
  userSelect: "none",
};

const callQueueAgentCodecDualListReorderBtnStyle = {
  ...callQueueAgentCodecDualListBtnStyle,
  fontSize: 11,
  fontWeight: 500
};

const callQueueAgentCodecDualListReorderDownBtnStyle = {
  ...callQueueAgentCodecDualListReorderBtnStyle,
  fontWeight: 400,
};

const callQueueAgentCodecBtnColumnStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: CALL_QUEUE_AGENT_CODEC_BTN_GAP,
  height: CALL_QUEUE_AGENT_CODEC_LIST_BOX_HEIGHT,
  width: CALL_QUEUE_AGENT_CODEC_BTN_COL_WIDTH,
};

const CallQueueAgentCodecDualListBtn = ({ onClick, title, children, reorder, down }) => (
  <button
    type="button"
    data-codec-action-btn
    title={title}
    onClick={onClick}
        style={
      down
        ? callQueueAgentCodecDualListReorderDownBtnStyle
        : reorder
          ? callQueueAgentCodecDualListReorderBtnStyle
          : callQueueAgentCodecDualListBtnStyle
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

const CallQueueAgentCodecListBox = ({
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
      style={getCallQueueAgentCodecListBoxStyle(isEmpty)}
      onMouseDown={handleMouseDown}
      onClick={handleContainerClick}
    >
      {isEmpty ? (
        <div style={callQueueAgentCodecListEmptyStyle}>{emptyText}</div>
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
              style={callQueueAgentCodecStripStyle(isSelected)}
            >
              {label}
            </div>
          );
        })
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const CallQueue = () => {
  const isCompact = useMediaQuery(CALL_QUEUE_COMPACT_MQ);
  const [queues, setQueues] = useState([]);
  const [form, setForm] = useState({ ...CALL_QUEUE_INITIAL_FORM });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [destinations, setDestinations] = useState({});
  const [voicePrompts, setVoicePrompts] = useState([]);
  const [ringBackOptions, setRingBackOptions] = useState({
    moh_categories: [],
    custom_prompts: [],
    country_tones: [],
  });
  const [highlightAvail, setHighlightAvail] = useState([]);
  const [highlightSel, setHighlightSel] = useState([]);
  const hasInitialLoadRef = useRef(false);
  const modalScrollRef = useRef(null);

  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(queues.length / itemsPerPage));
  const pagedQueues = queues.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const loadQueues = async () => {
    if (loading.fetch) return;
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const res = await fetchCallQueues();
      if (res?.response && res?.message) {
        const list = Array.isArray(res.message) ? res.message : [];
        setQueues(list.map((q, i) => ({ ...q, _idx: i + 1 })));
      }
    } catch (e) {
      showMsg("error", e.message || "Failed to load queues");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  const ACTION_TO_DEST_KEY = {
    extensions: "Extensions",
    voicemail: "Voicemails",
    ivr_menus: "IVR",
    conference_rooms: "ConferenceRooms",
    ring_groups: "RingGroups",
    disa: "DISA",
    call_queue: "CallQueue",
    callbacks: "Callbacks",
    faxtoemail: "FaxToMail",
    other: "Other",
  };

  const getDestOptions = (action) => {
    if (!action) return [];
    const key = ACTION_TO_DEST_KEY[action];
    return key ? destinations[key] || [] : [];
  };

  const loadDestinations = async () => {
    try {
      const res = await listIvrDestinations();
      if (res?.response && res?.message) {
        setDestinations(res.message);
      }
    } catch (_) {}
  };

  const loadVoicePrompts = async () => {
    try {
      const res = await listCustomPrompts();
      if (res?.response) {
        const list = Array.isArray(res.message) ? res.message : [];
        setVoicePrompts(
          list
            .map((it) => ({
              value: String(
                it?.filename ||
                  it?.file_name ||
                  it?.file ||
                  it?.recording_name ||
                  "",
              ).replace(/\.[^/.]+$/, ""),
              label: String(
                it?.recording_name || it?.name || it?.filename || "",
              ).replace(/\.[^/.]+$/, ""),
            }))
            .filter((it) => it.value),
        );
      }
    } catch (_) {}
  };

  const loadRingBackOpts = async () => {
    try {
      const res = await listRingBackOptions();
      if (res?.response === false) return;
      const msg = res?.message;
      const normalized =
        msg && typeof msg === "object" && !Array.isArray(msg) ? msg : {};
      setRingBackOptions({
        moh_categories: Array.isArray(normalized.moh_categories)
          ? normalized.moh_categories
          : [],
        custom_prompts: Array.isArray(normalized.custom_prompts)
          ? normalized.custom_prompts
          : [],
        country_tones: Array.isArray(normalized.country_tones)
          ? normalized.country_tones
          : [],
      });
    } catch (_) {}
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadQueues();
      loadDestinations();
      loadVoicePrompts();
      loadRingBackOpts();
    }
  }, []);

  useLayoutEffect(() => {
    if (!showModal || !modalScrollRef.current) return;
    modalScrollRef.current.scrollTop = 0;
  }, [showModal, activeTab]);

  const apiToForm = (q) => ({
    ...CALL_QUEUE_INITIAL_FORM,
    _id: q.id,
    queue_name: q.name || "",
    queue_number: String(q.queue_number || ""),
    pin: q.pin_required ? "yes" : "no",
    agent_password: q.dynamic_pin || "",
    ring_strategy: q.ring_strategy || "ring_all",
    timeout_action: q.timeout_dest_type || "",
    timeout_action_dest: q.timeout_dest_value || "",
    caller_id_prefix: q.cid_name_prefix || "",
    overflow_action: q.overflow_dest_type || "",
    overflow_action_dest: q.overflow_dest_value || "",
    agents_initial_status: q.agents_initial_status || "logged_in",
    agent_call_timeout: q.agent_timeout ?? 15,
    agent_announcement: q.agent_announcement || "",
    agent_retry_time: q.agent_retry ?? 30,
    wrap_up_time: q.wrapup_time ?? 30,
    max_no_answer: q.max_no_answer ?? 0,
    discard_abandoned_after: q.discard_abandoned_after ?? 0,
    max_wait_time: q.max_wait_time ?? 0,
    max_queue_length: q.max_queue_length ?? 20,
    alert_info: q.alert_info || "",
    music_on_hold:
      q.moh_mode === "default" ? "default" : q.moh_value || "default",
    max_wait_no_agent: q.max_wait_no_agent_sec ?? 90,
    queue_busy_resume: q.queue_busy_resume ? "enable" : "disable",
    transfer_prompt: q.transfer_prompt || "",
    agent_busy_announce: q.agent_busy_announce || "",
    answer_announce: q.answer_announce_caller || "",
    join_when_no_agent: !!q.join_when_no_agent,
    join_announce:
      q.join_announce === "default"
        ? "default"
        : q.join_announce_custom || "default",
    join_announce_playtime: q.join_announce_playtime ?? 0,
    answer_type: q.answer_type || "answer",
    no_agent_announce: q.no_agent_announce || "",
    announce_position: q.announce_position !== false,
    announce_hold_time: q.announce_hold_time !== false,
    call_duration: q.call_duration_est_sec ?? 60,
    announce_frequency: q.announce_position_frequency ?? 30,
    periodic_sound: q.announce_sound || "default",
    periodic_frequency: q.announce_sound_frequency ?? 0,
    busy_callback: q.busy_callback_enabled ? "yes" : "no",
    busy_callback_key: String(q.busy_callback_key ?? "2"),
    busy_callback_announce: q.busy_callback_announce || "default",
    selected_agents: Array.isArray(q.members) ? q.members.map(String) : [],
  });

  const getMohFields = (val) => {
    if (!val || val === "default")
      return { moh_mode: "default", moh_value: null };
    if (ringBackOptions.moh_categories.includes(val))
      return { moh_mode: "moh", moh_value: val };
    if (ringBackOptions.custom_prompts.includes(val))
      return { moh_mode: "custom", moh_value: val };
    if (ringBackOptions.country_tones.includes(val))
      return { moh_mode: "tone", moh_value: val };
    return { moh_mode: "default", moh_value: null };
  };

  const nullIfEmpty = (v) => (v === "" || v == null ? null : v);

  const buildPayload = (f) => ({
    ...(f._id != null ? { id: f._id } : {}),
    name: f.queue_name,
    queue_number: Number(f.queue_number),
    enabled: true,
    pin_required: f.pin === "yes",
    dynamic_pin: f.pin === "yes" ? f.agent_password : null,
    ring_strategy: f.ring_strategy,
    timeout_dest_type: f.timeout_action || null,
    timeout_dest_value: nullIfEmpty(f.timeout_action_dest),
    overflow_dest_type: f.overflow_action || null,
    overflow_dest_value: nullIfEmpty(f.overflow_action_dest),
    cid_name_prefix: nullIfEmpty(f.caller_id_prefix),
    agents_initial_status: f.agents_initial_status,
    agent_timeout: Number(f.agent_call_timeout),
    agent_announcement: nullIfEmpty(f.agent_announcement),
    agent_retry: Number(f.agent_retry_time),
    wrapup_time: Number(f.wrap_up_time),
    max_no_answer: Number(f.max_no_answer),
    discard_abandoned_after: Number(f.discard_abandoned_after) || null,
    max_wait_time: Number(f.max_wait_time),
    max_queue_length: Number(f.max_queue_length),
    alert_info: nullIfEmpty(f.alert_info),
    ...getMohFields(f.music_on_hold),
    max_wait_no_agent_sec: Number(f.max_wait_no_agent),
    queue_busy_resume: f.queue_busy_resume === "enable",
    transfer_prompt: nullIfEmpty(f.transfer_prompt),
    agent_busy_announce: nullIfEmpty(f.agent_busy_announce),
    answer_announce_caller: nullIfEmpty(f.answer_announce),
    join_when_no_agent: !!f.join_when_no_agent,
    join_announce: f.join_announce === "default" ? "default" : "custom",
    join_announce_custom:
      f.join_announce === "default" ? null : f.join_announce,
    join_announce_playtime: Number(f.join_announce_playtime),
    answer_type: f.answer_type,
    no_agent_announce: nullIfEmpty(f.no_agent_announce),
    announce_position: !!f.announce_position,
    announce_hold_time: !!f.announce_hold_time,
    call_duration_est_sec: Number(f.call_duration),
    announce_position_frequency: Number(f.announce_frequency),
    announce_sound: f.periodic_sound || "default",
    announce_sound_frequency: Number(f.periodic_frequency),
    busy_callback_enabled: f.busy_callback === "yes",
    busy_callback_key: String(f.busy_callback_key),
    busy_callback_announce: nullIfEmpty(f.busy_callback_announce),
    members: f.selected_agents,
  });

  const handleOpenModal = (row = null, idx = null) => {
    setForm(row ? apiToForm(row) : { ...CALL_QUEUE_INITIAL_FORM });
    setEditIndex(idx);
    setActiveTab("basic");
    setHighlightAvail([]);
    setHighlightSel([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setActiveTab("basic");
  };

  const handleSave = async () => {
    if (!form.queue_name.trim()) {
      showMsg("error", "Queue Name is required");
      return;
    }
    if (!String(form.queue_number).trim()) {
      showMsg("error", "Queue Number is required");
      return;
    }
    if (form.pin === "yes" && form.agent_password.length < 2) {
      showMsg("error", "Agent Password must be 2 to 4 digits");
      return;
    }
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const fn = editIndex !== null ? updateCallQueue : createCallQueue;
      const res = await fn(buildPayload(form));
      if (res?.response) {
        showMsg(
          "success",
          editIndex !== null ? "Queue updated" : "Queue created",
        );
        handleCloseModal();
        await loadQueues();
      } else {
        showMsg("error", res?.message || "Save failed");
      }
    } catch (e) {
      showMsg("error", e.message || "Save failed");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showMsg("info", "No queues selected");
      return;
    }
    if (!window.confirm(`Delete ${selected.length} queue(s)?`)) return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      for (const idx of selected) {
        const q = queues.find((x) => x._idx === idx);
        if (q) await deleteCallQueue(q.id);
      }
      showMsg("success", `${selected.length} queue(s) deleted`);
      setSelected([]);
      await loadQueues();
    } catch (e) {
      showMsg("error", e.message || "Delete failed");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleInverse = () =>
    setSelected(
      pagedQueues.map((q) => q._idx).filter((i) => !selected.includes(i)),
    );
  const handleSelectRow = (idx) =>
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx],
    );

  const pageIndices = pagedQueues.map((q) => q._idx);
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleAll = () => {
    if (!pageIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((i) => !pageIndices.includes(i))
        : Array.from(new Set([...prev, ...pageIndices])),
    );
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const extensionsList = Array.isArray(destinations.Extensions)
    ? destinations.Extensions
    : [];
  const computedAvailable = extensionsList.filter(
    (e) => !(form.selected_agents || []).includes(e.value),
  );

  const moveToSelected = (all) => {
    const toMove = all ? computedAvailable.map((e) => e.value) : highlightAvail;
    handleChange("selected_agents", [
      ...(form.selected_agents || []),
      ...toMove.filter((v) => !(form.selected_agents || []).includes(v)),
    ]);
    setHighlightAvail([]);
  };
  const moveToAvailable = (all) => {
    const toRemove = all ? form.selected_agents || [] : highlightSel;
    handleChange(
      "selected_agents",
      (form.selected_agents || []).filter((v) => !toRemove.includes(v)),
    );
    setHighlightSel([]);
  };
  const moveUp = () => {
    if (!highlightSel.length) return;
    const arr = [...(form.selected_agents || [])];
    for (let i = 1; i < arr.length; i++) {
      if (highlightSel.includes(arr[i]) && !highlightSel.includes(arr[i - 1])) {
        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      }
    }
    handleChange("selected_agents", arr);
  };
  const moveDown = () => {
    if (!highlightSel.length) return;
    const arr = [...(form.selected_agents || [])];
    for (let i = arr.length - 2; i >= 0; i--) {
      if (highlightSel.includes(arr[i]) && !highlightSel.includes(arr[i + 1])) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      }
    }
    handleChange("selected_agents", arr);
  };
  const moveToTop = () => {
    if (!highlightSel.length) return;
    const arr = form.selected_agents || [];
    const chosen = arr.filter((v) => highlightSel.includes(v));
    const rest = arr.filter((v) => !highlightSel.includes(v));
    handleChange("selected_agents", [...chosen, ...rest]);
  };
  const moveToBottom = () => {
    if (!highlightSel.length) return;
    const arr = form.selected_agents || [];
    const rest = arr.filter((v) => !highlightSel.includes(v));
    const chosen = arr.filter((v) => highlightSel.includes(v));
    handleChange("selected_agents", [...rest, ...chosen]);
  };

  const toggleAvailableAgentSelect = (id) => {
    setHighlightAvail((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const toggleSelectedAgentSelect = (id) => {
    setHighlightSel((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAvailableAgents = (ids) => setHighlightAvail(ids);

  const selectChosenAgents = (ids) => setHighlightSel(ids);

  const clearAgentHighlight = () => {
    setHighlightAvail([]);
    setHighlightSel([]);
  };

  useEffect(() => {
    if (!showModal) return undefined;

    const handleOutsideClear = (e) => {
      if (!highlightAvail.length && !highlightSel.length) return;
      if (e.target.closest("[data-codec-strip-id]")) return;
      if (e.target.closest("[data-codec-action-btn]")) return;
      if (e.target.closest("[data-codec-list-box]")) return;
      clearAgentHighlight();
    };

    document.addEventListener("mousedown", handleOutsideClear);
    return () => document.removeEventListener("mousedown", handleOutsideClear);
  }, [showModal, highlightAvail, highlightSel]);

  const ringStrategyLabel = (v) =>
    RING_STRATEGY_OPTIONS.find((o) => o.value === v)?.label || v;

  return (
    <div style={{ ...callQueuePageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
        {/* Modal */}
      <Dialog
        open={showModal}
        onClose={() => {
          if (loading.save) return;
          handleCloseModal();
        }}
        maxWidth={false}
        className="z-50"
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{ sx: callQueueModalPaperSx }}
        disableRestoreFocus
      >
        <DialogTitle sx={callQueueModalTitleStyle}>
          {editIndex !== null ? "Edit Call Queue" : "Add Call Queue"}
        </DialogTitle>
        <CallQueueModalTabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={CALL_QUEUE_MODAL_TABS}
        />
        <DialogContent
          ref={modalScrollRef}
          className="app-main-scroll"
          sx={{
            p: "24px",
            backgroundColor: "#ffffff",
            ...callQueueModalDialogContentSx,
          }}
        >
          <div style={callQueueModalFormStyle}>
            {/* ── BASIC TAB ── */}
            {activeTab === "basic" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 8,
                }}
              >
                <SectionCard title="Queue Settings" isFirst>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <CallQueueFieldRow label="Queue Name" tooltipKey="queue_name" required>
                      <TextField
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.queue_name}
                        onChange={(e) =>
                          handleChange("queue_name", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                      />
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="Agent Call Timeout (s)" tooltipKey="agent_call_timeout">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.agent_call_timeout}
                        onChange={(e) =>
                          handleChange("agent_call_timeout", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx} inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    <CallQueueFieldRow label="Queue Number" tooltipKey="queue_number" required>
                      <TextField
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.queue_number}
                        onChange={(e) =>
                          handleChange("queue_number", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                      />
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="Agent Announcement" tooltipKey="agent_announcement">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.agent_announcement}
                          onChange={(e) =>
                            handleChange("agent_announcement", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          displayEmpty
                        >
                          <MenuItem value="">Null</MenuItem>
                          <MenuItem value="call_from_queue_number">
                            Call From Queue Number
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem key={vp.value} value={vp.value}>
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>

                    <CallQueueFieldRow label="Pin" tooltipKey="pin" required>
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.pin}
                          onChange={(e) => handleChange("pin", e.target.value)}
                          sx={callQueueModalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="Agent Retry Time (s)" tooltipKey="agent_retry_time">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.agent_retry_time}
                        onChange={(e) =>
                          handleChange("agent_retry_time", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx} inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    {form.pin === "yes" && (
                      <CallQueueFieldRow label="Agent Password" tooltipKey="agent_password" required>
                        <TextField
                          size="small"
                          fullWidth
                          variant="outlined"
                          value={form.agent_password}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);
                            handleChange("agent_password", val);
                          }}
                          sx={callQueueModalTextFieldFullSx} inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 4 }}
                        />
                      </CallQueueFieldRow>
                    )}
                    <CallQueueFieldRow label="Wrap Up Time (s)" tooltipKey="wrap_up_time">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.wrap_up_time}
                        onChange={(e) =>
                          handleChange("wrap_up_time", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx} inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    <CallQueueFieldRow label="Ring Strategy" tooltipKey="ring_strategy" required>
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.ring_strategy}
                          onChange={(e) =>
                            handleChange("ring_strategy", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                        >
                          {RING_STRATEGY_OPTIONS.map((o) => (
                            <MenuItem key={o.value} value={o.value}>
                              {o.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="Max No Answer" tooltipKey="max_no_answer">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.max_no_answer}
                        onChange={(e) =>
                          handleChange("max_no_answer", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx} inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    {/* Timeout Action + destination */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        minHeight: 32,
                      }}
                    >
                      <CallQueueFieldLabel
                        tooltipKey="timeout_action"
                        style={{
                          width: CALL_QUEUE_MODAL_LABEL_WIDTH,
                          flexShrink: 0,
                        }}
                      >
                        Timeout Action
                      </CallQueueFieldLabel>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.timeout_action}
                            onChange={(e) => {
                              handleChange("timeout_action", e.target.value);
                              handleChange("timeout_action_dest", "");
                            }}
                            sx={callQueueModalSelectSx}
                          >
                            {ACTION_OPTIONS.map((o) => (
                              <MenuItem key={o.value} value={o.value}>
                                {o.label}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                      {form.timeout_action && (
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form.timeout_action_dest || ""}
                              onChange={(e) =>
                                handleChange(
                                  "timeout_action_dest",
                                  e.target.value,
                                )
                              }
                              sx={callQueueModalSelectSx}
                              displayEmpty
                              renderValue={(v) =>
                                v || (
                                  <span style={{ color: "#999", fontSize: 12 }}>
                                    Select...
                                  </span>
                                )
                              }
                            >
                              <MenuItem value="">
                                <em style={{ fontSize: 12 }}>Select...</em>
                              </MenuItem>
                              {getDestOptions(form.timeout_action).map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                  {o.label}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      )}
                    </div>
                    <CallQueueFieldRow label="Discard Abandoned After(s)" tooltipKey="discard_abandoned_after">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.discard_abandoned_after}
                        onChange={(e) =>
                          handleChange(
                            "discard_abandoned_after",
                            e.target.value,
                          )
                        }
                        sx={callQueueModalTextFieldFullSx} inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    <CallQueueFieldRow label="Caller ID Name Prefix" tooltipKey="caller_id_prefix">
                      <TextField
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.caller_id_prefix}
                        onChange={(e) =>
                          handleChange("caller_id_prefix", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                      />
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="Max Wait Time (s)" tooltipKey="max_wait_time">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.max_wait_time}
                        onChange={(e) =>
                          handleChange("max_wait_time", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx} inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    {/* Overflow Action + destination */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        minHeight: 32,
                      }}
                    >
                      <CallQueueFieldLabel
                        tooltipKey="overflow_action"
                        style={{
                          width: CALL_QUEUE_MODAL_LABEL_WIDTH,
                          flexShrink: 0,
                        }}
                      >
                        Overflow Action
                      </CallQueueFieldLabel>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.overflow_action}
                            onChange={(e) => {
                              handleChange("overflow_action", e.target.value);
                              handleChange("overflow_action_dest", "");
                            }}
                            sx={callQueueModalSelectSx}
                          >
                            {ACTION_OPTIONS.map((o) => (
                              <MenuItem key={o.value} value={o.value}>
                                {o.label}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                      {form.overflow_action && (
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form.overflow_action_dest || ""}
                              onChange={(e) =>
                                handleChange(
                                  "overflow_action_dest",
                                  e.target.value,
                                )
                              }
                              sx={callQueueModalSelectSx}
                              displayEmpty
                              renderValue={(v) =>
                                v || (
                                  <span style={{ color: "#999", fontSize: 12 }}>
                                    Select...
                                  </span>
                                )
                              }
                            >
                              <MenuItem value="">
                                <em style={{ fontSize: 12 }}>Select...</em>
                              </MenuItem>
                              {getDestOptions(form.overflow_action).map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                  {o.label}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      )}
                    </div>
                    <CallQueueFieldRow label="Max Queue Length" tooltipKey="max_queue_length">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.max_queue_length}
                        onChange={(e) =>
                          handleChange("max_queue_length", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx} inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    <CallQueueFieldRow label="Agents Initial Status" tooltipKey="agents_initial_status">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.agents_initial_status}
                          onChange={(e) =>
                            handleChange(
                              "agents_initial_status",
                              e.target.value,
                            )
                          }
                          sx={callQueueModalSelectSx}
                        >
                          <MenuItem value="logged_in">Logged In</MenuItem>
                          <MenuItem value="logged_out">Logged Out</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="Alert info" tooltipKey="alert_info">
                      <TextField
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.alert_info}
                        onChange={(e) =>
                          handleChange("alert_info", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                      />
                    </CallQueueFieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="Agents">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `1fr ${CALL_QUEUE_AGENT_CODEC_BTN_COL_WIDTH}px 1fr ${CALL_QUEUE_AGENT_CODEC_BTN_COL_WIDTH}px`,
                      gap: 10,
                      width: "100%",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <div style={callQueueAgentDualListLabelStyle}>Available</div>
                      <CallQueueAgentCodecListBox
                        items={computedAvailable}
                        selectedIds={highlightAvail}
                        onToggle={toggleAvailableAgentSelect}
                        onDragSelect={selectAvailableAgents}
                        onClearHighlight={clearAgentHighlight}
                        emptyText="No extension"
                        getLabel={(id) => {
                          const ext = computedAvailable.find((e) => e.value === id);
                          return ext?.label || id;
                        }}
                      />
                    </div>
                    <div>
                      <div
                        style={{ height: CALL_QUEUE_AGENT_CODEC_LIST_LABEL_OFFSET }}
                        aria-hidden="true"
                      />
                      <div style={callQueueAgentCodecBtnColumnStyle}>
                        <CallQueueAgentCodecDualListBtn
                          onClick={() => moveToSelected(false)}
                          title="Move selected to Selected"
                        >
                          &gt;
                        </CallQueueAgentCodecDualListBtn>
                        <CallQueueAgentCodecDualListBtn
                          onClick={() => moveToSelected(true)}
                          title="Move all to Selected"
                        >
                          &gt;&gt;
                        </CallQueueAgentCodecDualListBtn>
                        <CallQueueAgentCodecDualListBtn
                          onClick={() => moveToAvailable(false)}
                          title="Move selected to Available"
                        >
                          &lt;
                        </CallQueueAgentCodecDualListBtn>
                        <CallQueueAgentCodecDualListBtn
                          onClick={() => moveToAvailable(true)}
                          title="Move all to Available"
                        >
                          &lt;&lt;
                        </CallQueueAgentCodecDualListBtn>
                      </div>
                    </div>
                    <div>
                      <div style={callQueueAgentDualListLabelStyle}>Selected</div>
                      <CallQueueAgentCodecListBox
                        items={form.selected_agents || []}
                        selectedIds={highlightSel}
                        onToggle={toggleSelectedAgentSelect}
                        onDragSelect={selectChosenAgents}
                        onClearHighlight={clearAgentHighlight}
                        emptyText="No agent selected"
                        getLabel={(id) => {
                          const ext = extensionsList.find((e) => e.value === id);
                          return ext?.label || id;
                        }}
                      />
                    </div>
                    <div>
                      <div
                        style={{ height: CALL_QUEUE_AGENT_CODEC_LIST_LABEL_OFFSET }}
                        aria-hidden="true"
                      />
                      <div style={callQueueAgentCodecBtnColumnStyle}>
                        <CallQueueAgentCodecDualListBtn
                          reorder
                          title="Move to bottom"
                      down
                          onClick={moveToBottom}
                        >
                          vv
                        </CallQueueAgentCodecDualListBtn>
                        <CallQueueAgentCodecDualListBtn
                          reorder
                          title="Move up"
                          onClick={moveUp}
                        >
                          ^
                        </CallQueueAgentCodecDualListBtn>
                        <CallQueueAgentCodecDualListBtn
                          reorder
                          title="Move down"
                      down
                          onClick={moveDown}
                        >
                          v
                        </CallQueueAgentCodecDualListBtn>
                        <CallQueueAgentCodecDualListBtn
                          reorder
                          title="Move to top"
                          onClick={moveToTop}
                        >
                          ^^
                        </CallQueueAgentCodecDualListBtn>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* ── CALLER EXPERIENCE SETTINGS TAB ── */}
            {activeTab === "caller" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 8,
                }}
              >
                <SectionCard title="Caller Settings" isFirst>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <CallQueueFieldRow label="Music on Hold" tooltipKey="music_on_hold" required>
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.music_on_hold}
                          onChange={(e) =>
                            handleChange("music_on_hold", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {ringBackOptions.moh_categories.length > 0 && (
                            <ListSubheader
                              disableSticky
                              sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                lineHeight: "36px",
                              }}
                            >
                              Music on Hold
                            </ListSubheader>
                          )}
                          {ringBackOptions.moh_categories.map((opt) => (
                            <MenuItem
                              key={`moh-${opt}`}
                              value={opt}
                              sx={{ fontSize: 14, pl: 3 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                          {ringBackOptions.custom_prompts.length > 0 && (
                            <ListSubheader
                              disableSticky
                              sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                lineHeight: "36px",
                              }}
                            >
                              Custom Prompt
                            </ListSubheader>
                          )}
                          {ringBackOptions.custom_prompts.map((opt) => (
                            <MenuItem
                              key={`prompt-${opt}`}
                              value={opt}
                              sx={{ fontSize: 14, pl: 3 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                          {ringBackOptions.country_tones.length > 0 && (
                            <ListSubheader
                              disableSticky
                              sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                lineHeight: "36px",
                              }}
                            >
                              Ring Back
                            </ListSubheader>
                          )}
                          {ringBackOptions.country_tones.map((opt) => (
                            <MenuItem
                              key={`tone-${opt}`}
                              value={opt}
                              sx={{ fontSize: 14, pl: 3 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="Join When No Agent" tooltipKey="join_when_no_agent">
                      <Checkbox
                        checked={!!form.join_when_no_agent}
                        onChange={(e) =>
                          handleChange("join_when_no_agent", e.target.checked)
                        }
                        size="small"
                        sx={callQueueTableCheckboxSx}
                      />
                    </CallQueueFieldRow>

                    <CallQueueFieldRow label="Max Wait Time No Agent (s)" tooltipKey="max_wait_no_agent">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.max_wait_no_agent}
                        onChange={(e) =>
                          handleChange("max_wait_no_agent", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx} inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="Join Announce" tooltipKey="join_announce">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.join_announce}
                          onChange={(e) =>
                            handleChange("join_announce", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>

                    <CallQueueFieldRow label="Queue Busy Resume Offer" tooltipKey="queue_busy_resume">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.queue_busy_resume}
                          onChange={(e) =>
                            handleChange("queue_busy_resume", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                        >
                          <MenuItem value="enable">Enable</MenuItem>
                          <MenuItem value="disable">Disable</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="Join Announce Playtime" tooltipKey="join_announce_playtime">
                        <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.join_announce_playtime}
                        onChange={(e) =>
                          handleChange("join_announce_playtime", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx} inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    <CallQueueFieldRow label="Transfer Prompt" tooltipKey="transfer_prompt">
                      <FormControl fullWidth size="small">  
                        <MuiSelect
                          value={form.transfer_prompt}
                          onChange={(e) =>
                            handleChange("transfer_prompt", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="">null</MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="Answer Type" tooltipKey="answer_type">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.answer_type}
                          onChange={(e) =>
                            handleChange("answer_type", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                        >
                          <MenuItem value="answer">Answer</MenuItem>
                          <MenuItem value="progress">Progress</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>

                      <CallQueueFieldRow label="Agent Busy Announce" tooltipKey="agent_busy_announce">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.agent_busy_announce}
                          onChange={(e) =>
                            handleChange("agent_busy_announce", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="">null</MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="No Agent Announce" tooltipKey="no_agent_announce">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.no_agent_announce}
                          onChange={(e) =>
                            handleChange("no_agent_announce", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="">null</MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>

                    <CallQueueFieldRow label="Answer Announce To Caller" tooltipKey="answer_announce">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.answer_announce}
                          onChange={(e) =>
                            handleChange("answer_announce", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => {
                            if (!v) return "";
                            if (v === "agent_id") return "Play AgentID Prompt";
                            const found = voicePrompts.find(
                              (vp) => vp.value === v,
                            );
                            return found ? found.label : v;
                          }}
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="agent_id" sx={{ fontSize: 14 }}>
                            Play AgentID Prompt
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="Caller Position Announcements">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <CallQueueFieldRow label="Announce Position" tooltipKey="announce_position">
                      <Checkbox
                        checked={!!form.announce_position}
                        onChange={(e) =>
                          handleChange("announce_position", e.target.checked)
                        }
                        size="small"
                        sx={callQueueTableCheckboxSx}
                      />
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="Call Duration(s)" tooltipKey="call_duration">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.call_duration}
                        onChange={(e) =>
                          handleChange("call_duration", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx} inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    <CallQueueFieldRow label="Announce Hold Time" tooltipKey="announce_hold_time">
                      <Checkbox
                        checked={!!form.announce_hold_time}
                        onChange={(e) =>
                          handleChange("announce_hold_time", e.target.checked)
                        }
                        size="small"
                        sx={callQueueTableCheckboxSx}
                      />
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="Announce Frequency(s)" tooltipKey="announce_frequency_caller">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.announce_frequency}
                          onChange={(e) =>
                            handleChange("announce_frequency", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                        >
                          {ANNOUNCE_FREQ_OPTIONS.map((v) => (
                            <MenuItem key={v} value={v}>
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="Periodic Announcements">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <CallQueueFieldRow label="Announce Sound" tooltipKey="periodic_sound">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.periodic_sound}
                          onChange={(e) =>
                            handleChange("periodic_sound", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="Announce Frequency(s)" tooltipKey="announce_frequency_periodic">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.periodic_frequency}
                          onChange={(e) =>
                            handleChange("periodic_frequency", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                        >
                          {ANNOUNCE_FREQ_OPTIONS.map((v) => (
                            <MenuItem key={v} value={v}>
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="Busy Callback">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <CallQueueFieldRow label="Enable Busy Callback" tooltipKey="busy_callback">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.busy_callback}
                          onChange={(e) =>
                            handleChange("busy_callback", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                        >
                          <MenuItem value="no">No</MenuItem>
                          <MenuItem value="yes">Yes</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow label="Busy Callback Announce" tooltipKey="busy_callback_announce">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.busy_callback_announce}
                          onChange={(e) =>
                            handleChange(
                              "busy_callback_announce",
                              e.target.value,
                            )
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>

                      <CallQueueFieldRow label="Agent Busy Callback Key" tooltipKey="busy_callback_key">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.busy_callback_key}
                          onChange={(e) =>
                            handleChange("busy_callback_key", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
                            <MenuItem key={v} value={v}>
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} sx={{ color: "#fff", mr: 1 }} />
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
            style={callQueueModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>

      <div style={callQueuePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={callQueueFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <CallQueueBreadcrumb section="Call Features" current="Call Queue" />

        <div style={callQueueCardStyle}>
          <div style={callQueueToolbarStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span style={callQueueSelectedBadgeStyle}>
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
                disabled={
                  loading.delete || loading.fetch || queues.length === 0
                }
                style={{ height: 30 }}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                style={{ height: 30 }}
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
                disabled={loading.fetch || loading.save}
                style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 10,
                }}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div style={{ overflowX: "hidden", overflowY: "auto", flex: 1 , ...(isCompact ? { overflowX: "auto", WebkitOverflowScrolling: "touch" } : {}) }}>
            {isInitialLoad ? (
              <TableListLoading />
            ) : queues.length === 0 ? (
              <TableListEmptyState
                message="No call queues found."
                onAddNew={() => handleOpenModal()}
              />
            ) : (
             <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",

                  minWidth: 700, ...(isCompact ? { minWidth: 720 } : {}),

                }}
              >
                <thead>
                  <tr>
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        disabled={loading.delete}
                        sx={callQueueTableCheckboxSx}
                      />
                    </TH>
                    <TH style={{ width: 36 }}>#</TH>
                    <TH>Queue Name</TH>
                    <TH>Queue Number</TH>
                    <TH>Ring Strategy</TH>
                    <TH>Agents</TH>
                    <TH style={{ width: 70, borderRight: "none" }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedQueues.map((q, i) => {
                    const isSelected = selected.includes(q._idx);
                    const isLastRow = i === pagedQueues.length - 1;
                    const rowBg = isSelected
                      ? "#e0f2fe"
                      : i % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";

                    return (
                      <tr
                        key={q._idx}
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
                            ...callQueueTdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            borderBottom: isLastRow
                              ? "none"
                              : callQueueTdStyle.borderBottom,
                          }}
                        >

                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(q._idx)}
                            disabled={loading.delete}
                            sx={callQueueTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...callQueueTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : callQueueTdStyle.borderBottom,
                          }}
                        >
                          {(page - 1) * itemsPerPage + i + 1}
                        </td>
                        <td
                          style={{
                            ...callQueueTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : callQueueTdStyle.borderBottom,
                            fontWeight: 600,
                          }}
                        >
                          {q.name || "--"}
                        </td>
                        <td
                          style={{
                            ...callQueueTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : callQueueTdStyle.borderBottom,
                          }}
                        >
                          {q.queue_number || "--"}
                        </td>
                        <td
                          style={{
                            ...callQueueTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : callQueueTdStyle.borderBottom,
                          }}
                        >
                          {ringStrategyLabel(q.ring_strategy)}
                        </td>
                        <td
                          style={{
                            ...callQueueTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : callQueueTdStyle.borderBottom,
                          }}
                        >
                          {Array.isArray(q.members) ? q.members.length : 0}
                        </td>
                        <td

                          style={{
                            ...callQueueTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : callQueueTdStyle.borderBottom,
                            borderRight: "none",
                            textAlign: "center",
                            padding: "7px 8px",
                          }}
                        >
                          <EditDocumentIcon
                            titleAccess="Edit"
                            onClick={() => handleOpenModal(q, q._idx)}
                            style={callQueueEditIconStyle}
                            onMouseEnter={(e) =>
                              handleCallQueueEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleCallQueueEditIconHover(e, false)
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

          {!isInitialLoad && queues.length > 0 && (
            <div style={callQueuePaginationStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedQueues.length} record
                {pagedQueues.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={handlePrev}
                  disabled={loading.fetch || page <= 1}
                  variant="outline"
                >
                  ← Prev
                </Btn>
                <span style={callQueuePageBadgeStyle}>
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={handleNext}
                  disabled={loading.fetch || page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <CallQueueSectionHeading title={title} isFirst={isFirst} />
    <div>{children}</div>
  </div>
);

export default CallQueue;
