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
  ListSubheader,
  MenuItem,
  Select as MuiSelect,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  createRingGroup,
  deleteRingGroup,
  fetchSipAccounts,
  listConferences,
  listIvrs,
  listRingBackOptions,
  listRingGroups,
  updateRingGroup,
} from "../../../api/apiService";
import {
  RING_GROUP_EMPTY_RING_BACK_OPTIONS,
  RING_GROUP_ENABLE_OPTIONS,
  RING_GROUP_EXTENSION_ANSWER_CONFIRM_OPTIONS,
  RING_GROUP_FIELD_TOOLTIPS,
  RING_GROUP_ITEMS_PER_PAGE,
  RING_GROUP_RING_BACK_MENU_PROPS,
  RING_GROUP_RING_STRATEGY_OPTIONS,
  RING_GROUP_RING_TIMEOUT_OPTIONS,
  RING_GROUP_TIMEOUT_DESTINATION_OPTIONS,
  RING_GROUP_TITLE,
} from "../../../constants/RingGroupConstants";

const RING_GROUP_COMPACT_MQ = "(max-width: 768px)";

// ── Color palette ─────────────────────────────────────────────────────────────
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
  codecBtnBorder: "#9ca3af",
  codecBtnBg: "#d9dde3",
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
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
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

const ringGroupTdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const ringGroupTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const RING_GROUP_TABLE_CARD_RADIUS = 10;

const ringGroupPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const ringGroupPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const RingGroupBreadcrumb = ({ section, current, style }) => (
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

const ringGroupCardStyle = {
  background: "#ffffff",
  borderRadius: RING_GROUP_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const ringGroupToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: RING_GROUP_TABLE_CARD_RADIUS,
  borderTopRightRadius: RING_GROUP_TABLE_CARD_RADIUS,
};

const ringGroupPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: RING_GROUP_TABLE_CARD_RADIUS,
  borderBottomRightRadius: RING_GROUP_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const ringGroupSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const ringGroupCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const ringGroupPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const ringGroupPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const ringGroupFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const ringGroupEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const handleRingGroupEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const ringGroupOutlinedInputRootSx = {
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

const ringGroupModalTextFieldFullSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...ringGroupOutlinedInputRootSx,
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

const ringGroupModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...ringGroupOutlinedInputRootSx,
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

const ringGroupModalPaperSx = {
  width: 880,
  maxWidth: "96vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const ringGroupModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const ringGroupModalSectionStyle = {
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
  marginTop: 24,
};

const ringGroupModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const ringGroupModalActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: "#f8fafc",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const ringGroupModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const RING_GROUP_TOOLTIP_PROPS = {
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

const formatRingGroupTooltipTitle = (text) => {
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

const RING_GROUP_MODAL_LABEL_WIDTH = 150;
const RING_GROUP_MODAL_SECTION_BG = "#f8fafc";
const RING_GROUP_MODAL_SECTION_HEADING_COLOR = "#30415A";

const RingGroupFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = RING_GROUP_FIELD_TOOLTIPS[tooltipKey] || "";
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
      title={formatRingGroupTooltipTitle(tooltip)}
      {...RING_GROUP_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const RingGroupFieldRow = ({
  label,
  tooltipKey,
  children,
  required = false,
  alignTop = false,
  labelWidth = RING_GROUP_MODAL_LABEL_WIDTH,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: alignTop ? "flex-start" : "center",
      gap: 12,
      minHeight: alignTop ? undefined : 32,
    }}
  >
    {tooltipKey ? (
      <RingGroupFieldLabel
        tooltipKey={tooltipKey}
        style={{
          width: labelWidth,
          flexShrink: 0,
          marginTop: alignTop ? 4 : 0,
        }}
      >
        {label}
        {required ? <span style={{ color: C.errorRed }}> *</span> : null}
      </RingGroupFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
          width: labelWidth,
          flexShrink: 0,
          marginTop: alignTop ? 4 : 0,
        }}
      >
        {label}
        {required ? <span style={{ color: C.errorRed }}> *</span> : null}
      </label>
    )}
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const RingGroupSectionHeading = ({
  title,
  isFirst = false,
  required = false,
  tooltipKey,
}) => {
  const heading = (
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: RING_GROUP_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: RING_GROUP_MODAL_SECTION_HEADING_COLOR,
        cursor: tooltipKey ? "help" : undefined,
      }}
    >
      {title}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </span>
  );
  const tooltip = tooltipKey ? RING_GROUP_FIELD_TOOLTIPS[tooltipKey] : "";
  return (
    <div
      style={{
        margin: isFirst ? "0 0 24px 0" : "28px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.divider}` }} />
      {tooltip ? (
        <Tooltip
          title={formatRingGroupTooltipTitle(tooltip)}
          {...RING_GROUP_TOOLTIP_PROPS}
        >
          {heading}
        </Tooltip>
      ) : (
        heading
      )}
    </div>
  );
};

const RING_GROUP_MEMBER_CODEC_LIST_BOX_HEIGHT = 188;
const RING_GROUP_MEMBER_CODEC_BTN_COL_WIDTH = 40;
const RING_GROUP_MEMBER_CODEC_BTN_GAP = 6;
const RING_GROUP_MEMBER_CODEC_BTN_HEIGHT =
  (RING_GROUP_MEMBER_CODEC_LIST_BOX_HEIGHT -
    RING_GROUP_MEMBER_CODEC_BTN_GAP * 3) /
  4;
const RING_GROUP_MEMBER_CODEC_LIST_LABEL_OFFSET = 28;

const ringGroupMemberCodecColumnLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "center",
  marginBottom: 8,
};

const getRingGroupMemberCodecListBoxStyle = (isEmpty) => ({
  width: "100%",
  minHeight: RING_GROUP_MEMBER_CODEC_LIST_BOX_HEIGHT,
  height: RING_GROUP_MEMBER_CODEC_LIST_BOX_HEIGHT,
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

const ringGroupMemberCodecListEmptyStyle = {
  color: C.placeholderText,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "center",
  userSelect: "none",
  padding: "0 16px",
};

const ringGroupMemberCodecStripStyle = (isSelected) => ({
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

const ringGroupMemberCodecDualListBtnStyle = {
  width: RING_GROUP_MEMBER_CODEC_BTN_COL_WIDTH,
  height: RING_GROUP_MEMBER_CODEC_BTN_HEIGHT,
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

const ringGroupMemberCodecBtnColumnStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: RING_GROUP_MEMBER_CODEC_BTN_GAP,
  height: RING_GROUP_MEMBER_CODEC_LIST_BOX_HEIGHT,
  width: RING_GROUP_MEMBER_CODEC_BTN_COL_WIDTH,
};

const RingGroupMemberCodecDualListBtn = ({ onClick, title, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={ringGroupMemberCodecDualListBtnStyle}
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
        "inset 0 1px 2px rgba(15, 23, 42, 0.15)";
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

const RingGroupMemberCodecListBox = ({
  items,
  selectedIds,
  onToggle,
  emptyText,
  getLabel,
}) => {
  const isEmpty = items.length === 0;
  return (
    <div style={getRingGroupMemberCodecListBoxStyle(isEmpty)}>
      {isEmpty ? (
        <div style={ringGroupMemberCodecListEmptyStyle}>{emptyText}</div>
      ) : (
        items.map((item) => {
          const id = typeof item === "string" ? item : item.value;
          const label = getLabel ? getLabel(id) : item.label || id;
          const isSelected = selectedIds.includes(id);
          return (
            <div
              key={id}
              role="option"
              aria-selected={isSelected}
              onClick={() => onToggle(id)}
              style={ringGroupMemberCodecStripStyle(isSelected)}
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

const RingGroup = () => {
  const isCompact = useMediaQuery(RING_GROUP_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    save: false,
    delete: false,
    members: false,
    destinations: false,
    list: false,
    ringBackOptions: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedDataRef = useRef(false);

  // Search & Pagination
  const itemsPerPage = RING_GROUP_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);
  // Form state
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [ringGroupNumber, setRingGroupNumber] = useState("");
  const [ringStrategy, setRingStrategy] = useState("simultaneous");
  const [timeoutDestinationType, setTimeoutDestinationType] = useState("");
  const [timeoutDestinationValue, setTimeoutDestinationValue] = useState("");
  const [ringTimeout, setRingTimeout] = useState("30");
  const [enabled, setEnabled] = useState("Yes");
  const [alertInfo, setAlertInfo] = useState("");
  const [ringBack, setRingBack] = useState("us-ring");
  const [ringBackOptions, setRingBackOptions] = useState(
    RING_GROUP_EMPTY_RING_BACK_OPTIONS,
  );
  const [cidNamePrefix, setCidNamePrefix] = useState("");
  const [extensionAnswerConfirm, setExtensionAnswerConfirm] = useState("No");

  // Member Extensions dual-list
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  // Destination value data
  const [destinationData, setDestinationData] = useState({
    extensions: [],
    conferenceRooms: [],
    ivrMenus: [],
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const mapApiToRow = (r) => ({
    id: r.id,
    name: r.name || "",
    ringGroupNumber: String(r.rg_number ?? ""),
    ringStrategy: r.ring_strategy || "simultaneous",
    timeoutDestinationType: r.timeout_dest_type || "",
    timeoutDestinationValue: r.timeout_dest_value || "",
    ringTimeout: String(r.ring_timeout ?? "30"),
    enabled: r.enabled ? "Yes" : "No",
    alertInfo: r.alert_info || "",
    ringBack: r.ring_back || "us-ring",
    cidNamePrefix: r.cid_name_prefix || "",
    extensionAnswerConfirm: r.answer_confirm ? "Yes" : "No",
    members: Array.isArray(r.members) ? r.members.map(String) : [],
  });

  const loadRingBackOptionsAPI = async () => {
    setLoading((prev) => ({ ...prev, ringBackOptions: true }));
    try {
      const res = await listRingBackOptions();
      if (res?.response === false) {
        showMessage(
          "error",
          typeof res?.message === "string"
            ? res.message
            : "Failed to load ring back options.",
        );
        setRingBackOptions(RING_GROUP_EMPTY_RING_BACK_OPTIONS);
        return;
      }
      const msg = res?.message;
      const normalized =
        msg && typeof msg === "object" && !Array.isArray(msg)
          ? msg
          : RING_GROUP_EMPTY_RING_BACK_OPTIONS;
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
    } catch (err) {
      setRingBackOptions(RING_GROUP_EMPTY_RING_BACK_OPTIONS);
    } finally {
      setLoading((prev) => ({ ...prev, ringBackOptions: false }));
    }
  };

  const refreshRingGroups = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listRingGroups();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load ring groups.");
        setRows([]);
        return;
      }
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setRows(list.map(mapApiToRow));
    } catch (err) {
      showMessage("error", err?.message || "Failed to load ring groups.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    refreshRingGroups();
  }, []);

  const loadFormData = async () => {
    setLoading((prev) => ({ ...prev, members: true, destinations: true }));
    try {
      const [sipRes, confRes, ivrRes] = await Promise.all([
        fetchSipAccounts(),
        listConferences(),
        listIvrs(),
      ]);

      const sipList = Array.isArray(sipRes?.message)
        ? sipRes.message
        : Array.isArray(sipRes?.data)
          ? sipRes.data
          : [];
      const extensions = sipList
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
      setAvailableExtensions(extensions);

      const confList = Array.isArray(confRes?.message)
        ? confRes.message
        : Array.isArray(confRes?.data)
          ? confRes.data
          : [];
      const conferenceRooms = confList.map((c) => ({
        value: String(c.conf_number ?? c.id ?? ""),
        label: String(c.conf_number ?? c.id ?? ""),
      }));

      const ivrList = Array.isArray(ivrRes?.message)
        ? ivrRes.message
        : Array.isArray(ivrRes?.data)
          ? ivrRes.data
          : [];
      const ivrMenus = ivrList.map((i) => ({
        value: String(i.ivr_number ?? i.id ?? ""),
        label: String(i.ivr_number ?? i.id ?? ""),
      }));

      setDestinationData({ extensions, conferenceRooms, ivrMenus });
      hasLoadedDataRef.current = true;
    } catch (err) {
      showMessage(
        "error",
        err?.message || "Failed to load ring group form data.",
      );
      setAvailableExtensions([]);
      setDestinationData({ extensions: [], conferenceRooms: [], ivrMenus: [] });
    } finally {
      setLoading((prev) => ({ ...prev, members: false, destinations: false }));
    }
  };

  // ── Search & Pagination Logic ──
  const filteredRows = rows;

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

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // ── Checkbox Logic ──
  const pageIndices = pagedRows.map(
    (_, idx) => (page - 1) * itemsPerPage + idx,
  );
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleRow = (idx) =>
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  const handleToggleAll = () => {
    if (!pageIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((i) => !pageIndices.includes(i))
        : Array.from(new Set([...prev, ...pageIndices])),
    );
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setRingGroupNumber("");
    setRingStrategy("simultaneous");
    setTimeoutDestinationType("");
    setTimeoutDestinationValue("");
    setRingTimeout("30");
    setEnabled("Yes");
    setAlertInfo("");
    setRingBack("us-ring");
    setCidNamePrefix("");
    setExtensionAnswerConfirm("No");
    setMemberExtensions([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    await Promise.all([
      loadRingBackOptionsAPI(),
      !hasLoadedDataRef.current ? loadFormData() : Promise.resolve(),
    ]);
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setRingGroupNumber(row.ringGroupNumber || "");
    setRingStrategy(row.ringStrategy || "simultaneous");
    setTimeoutDestinationType(row.timeoutDestinationType || "");
    setTimeoutDestinationValue(row.timeoutDestinationValue || "");
    setRingTimeout(row.ringTimeout || "30");
    setEnabled(row.enabled || "Yes");
    setAlertInfo(row.alertInfo || "");
    setRingBack(row.ringBack || "us-ring");
    setCidNamePrefix(row.cidNamePrefix || "");
    setExtensionAnswerConfirm(row.extensionAnswerConfirm || "No");
    setMemberExtensions(Array.isArray(row.members) ? row.members : []);
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    await Promise.all([
      loadRingBackOptionsAPI(),
      !hasLoadedDataRef.current ? loadFormData() : Promise.resolve(),
    ]);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!selected.length)
      return showMessage("error", "Please select at least one row to delete.");
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    (async () => {
      try {
        const toDelete = filteredRows.filter((_, idx) =>
          selected.includes(idx),
        );
        let deleteFailed = false;
        for (const row of toDelete) {
          if (row.id != null) {
            const res = await deleteRingGroup(row.id);
            if (res?.response === false) {
              deleteFailed = true;
              showMessage(
                "error",
                res?.message || "Failed to delete ring group.",
              );
              break;
            }
          }
        }
        setSelected([]);
        await refreshRingGroups();
        if (!deleteFailed) {
          showMessage(
            "success",
            toDelete.length === 1
              ? "Ring group deleted successfully."
              : `${toDelete.length} ring groups deleted successfully.`,
          );
        }
      } catch (err) {
        showMessage("error", err?.message || "Failed to delete ring group(s).");
      } finally {
        setLoading((prev) => ({ ...prev, delete: false }));
      }
    })();
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return showMessage("error", "Name is required.");
    if (!ringGroupNumber.trim())
      return showMessage("error", "Ring Group Number is required.");

    const rgNumber = parseInt(ringGroupNumber, 10);
    if (Number.isNaN(rgNumber))
      return showMessage("error", "Ring Group Number must be numeric.");

    const ringTimeoutInt = parseInt(ringTimeout, 10);
    if (Number.isNaN(ringTimeoutInt))
      return showMessage("error", "Ring Timeout must be numeric.");

    if (timeoutDestinationType && !timeoutDestinationValue)
      return showMessage("error", "Please select Timeout Destination value.");
    if (!memberExtensions.length)
      return showMessage(
        "error",
        "Please select at least one Member Extension.",
      );

    setLoading((prev) => ({ ...prev, save: true }));
    (async () => {
      try {
        const apiPayload = {
          name: trimmed,
          rg_number: rgNumber,
          ring_strategy: ringStrategy,
          ring_timeout: ringTimeoutInt,
          members: memberExtensions.map(String),
          enabled: enabled === "Yes",
          alert_info: alertInfo || "",
          ring_back: ringBack,
          cid_name_prefix: cidNamePrefix || "",
          answer_confirm: extensionAnswerConfirm === "Yes",
          timeout_dest_type: timeoutDestinationType || "",
          timeout_dest_value: timeoutDestinationValue || "",
        };

        let res;
        if (editId != null) {
          res = await updateRingGroup(editId, apiPayload);
        } else {
          res = await createRingGroup(apiPayload);
        }

        if (res?.response === false) {
          showMessage("error", res?.message || "Failed to save ring group.");
          return;
        }
        await refreshRingGroups();
        handleCloseModal();
        showMessage("success", "Ring group saved successfully.");
      } catch (err) {
        showMessage("error", err?.message || "Failed to save ring group.");
      } finally {
        setLoading((prev) => ({ ...prev, save: false }));
      }
    })();
  };

  // ── Dual Listbox Logic ──
  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((e) => map.set(e.value, e.label));
    return map;
  }, [availableExtensions]);

  const getExtLabel = (ext) => extensionLabelMap.get(ext) || ext;

  const availableList = useMemo(
    () =>
      availableExtensions.filter((e) => !memberExtensions.includes(e.value)),
    [availableExtensions, memberExtensions],
  );

  const addSelectedMembers = () => {
    if (!availableSelected.length) return;
    setMemberExtensions((prev) => [
      ...prev,
      ...availableSelected.filter((id) => !prev.includes(id)),
    ]);
    setAvailableSelected([]);
  };
  const addAllMembers = () => {
    setMemberExtensions(availableExtensions.map((e) => e.value));
    setAvailableSelected([]);
  };
  const removeSelectedMembers = () => {
    if (!chosenSelected.length) return;
    setMemberExtensions((prev) =>
      prev.filter((id) => !chosenSelected.includes(id)),
    );
    setChosenSelected([]);
  };
  const removeAllMembers = () => {
    setMemberExtensions([]);
    setChosenSelected([]);
  };

  const toggleAvailableMemberSelect = (id) => {
    setAvailableSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const toggleChosenMemberSelect = (id) => {
    setChosenSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ── Destination Options ──
  const getTimeoutValueOptions = () => {
    switch (timeoutDestinationType) {
      case "extensions":
      case "faxtoemail":
      case "voicemail":
        return destinationData.extensions;
      case "conference_rooms":
        return destinationData.conferenceRooms;
      case "ivr_menus":
        return destinationData.ivrMenus;
      case "ring_groups":
        return rows
          .filter((r) => String(r.id) !== String(editId))
          .map((r) => ({
            value: String(r.ringGroupNumber),
            label: `${r.name}-${r.ringGroupNumber}`,
          }));
      case "other":
        return [
          { value: "Hangup", label: "Hangup" },
          { value: "MusicOnHold", label: "MusicOnHold" },
        ];
      default:
        return [];
    }
  };

  const timeoutValueOptions = getTimeoutValueOptions();
  const shouldShowTimeoutValue = Boolean(timeoutDestinationType);

  const ringBackAllValues = useMemo(
    () => [
      ...ringBackOptions.moh_categories,
      ...ringBackOptions.custom_prompts,
      ...ringBackOptions.country_tones,
    ],
    [ringBackOptions],
  );

  const availableMemberEmptyText = loading.members
    ? "Loading..."
    : "No extension";

  return (
    <div
      style={{
        ...ringGroupPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={ringGroupPageInnerStyle}>
        {message.text && (
          <Alert
            severity={
              message.type === "error"
                ? "error"
                : message.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setMessage({ type: "", text: "" })}
            sx={ringGroupFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <RingGroupBreadcrumb
          section="Call Features"
          current={RING_GROUP_TITLE}
        />

        <div style={ringGroupCardStyle}>
          <div
            style={{
              ...ringGroupToolbarStyle,
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
                <span style={ringGroupSelectedBadgeStyle}>
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
                style={ringGroupCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={ringGroupPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div
            style={{
              overflowX: "hidden",
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
                message="No ring groups found."
                onAddNew={handleOpenAddModal}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
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
                        sx={ringGroupTableCheckboxSx}
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
                      Id
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Ring Group Number
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Ring Strategy
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Members
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
                    const rowBg = isSelected
                      ? "#e0f2fe"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    const lastRowCellStyle = {
                      borderBottom: isLastRow
                        ? "none"
                        : ringGroupTdStyle.borderBottom,
                    };

                    return (
                      <tr
                        key={row.id || realIdx}
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
                            ...ringGroupTdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={ringGroupTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...ringGroupTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...ringGroupTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...ringGroupTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.ringGroupNumber}
                        </td>
                        <td
                          style={{
                            ...ringGroupTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span
                            style={{
                              color: "#334155",
                              padding: "4px 11px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {row.ringStrategy}
                          </span>
                        </td>
                        <td
                          style={{
                            ...ringGroupTdStyle,
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
                            ...ringGroupTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.members.length}
                        </td>
                        <td
                          style={{
                            ...ringGroupTdStyle,
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
                              style={ringGroupEditIconStyle}
                              onMouseEnter={(e) =>
                                handleRingGroupEditIconHover(e, true)
                              }
                              onMouseLeave={(e) =>
                                handleRingGroupEditIconHover(e, false)
                              }
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

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <div style={ringGroupPaginationStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRows.length} record
                {pagedRows.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={handlePrev}
                  disabled={loading.list || page <= 1}
                  variant="outline"
                >
                  ← Prev
                </Btn>
                <span style={ringGroupPageBadgeStyle}>
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={handleNext}
                  disabled={loading.list || page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{ "& .MuiDialog-container": { alignItems: "flex-start", pt: 5 } }}
        PaperProps={{ sx: ringGroupModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={ringGroupModalTitleStyle}>
          {editId != null
            ? `Edit ${RING_GROUP_TITLE}`
            : `Add ${RING_GROUP_TITLE}`}
        </DialogTitle>

        <DialogContent
          className="app-main-scroll"
          sx={{
            ...ringGroupModalDialogContentSx,
            padding: "0 24px 20px",
            backgroundColor: "#ffffff",
          }}
        >
          <div style={{ background: "#ffffff" }}>
            <div style={ringGroupModalSectionStyle}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                gap: "16px 32px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <RingGroupFieldRow label="Name" tooltipKey="name" required>
                  <TextField
                    size="small"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={ringGroupModalTextFieldFullSx}
                  />
                </RingGroupFieldRow>

                <RingGroupFieldRow
                  label="Ring Strategy"
                  tooltipKey="ring_strategy"
                  required
                >
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={ringStrategy}
                      onChange={(e) => setRingStrategy(e.target.value)}
                      sx={ringGroupModalSelectSx}
                    >
                      {RING_GROUP_RING_STRATEGY_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </RingGroupFieldRow>

                <RingGroupFieldRow
                  label="Ring Timeout (s)"
                  tooltipKey="ring_timeout"
                >
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={ringTimeout}
                      onChange={(e) => setRingTimeout(e.target.value)}
                      sx={ringGroupModalSelectSx}
                    >
                      {RING_GROUP_RING_TIMEOUT_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </RingGroupFieldRow>

                <RingGroupFieldRow label="Alert Info" tooltipKey="alert_info">
                  <TextField
                    size="small"
                    fullWidth
                    value={alertInfo}
                    onChange={(e) => setAlertInfo(e.target.value)}
                    sx={ringGroupModalTextFieldFullSx}
                  />
                </RingGroupFieldRow>

                <RingGroupFieldRow
                  label="Extension Answer Confirm"
                  tooltipKey="extension_answer_confirm"
                  required
                >
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={extensionAnswerConfirm}
                      onChange={(e) =>
                        setExtensionAnswerConfirm(e.target.value)
                      }
                      sx={ringGroupModalSelectSx}
                    >
                      {RING_GROUP_EXTENSION_ANSWER_CONFIRM_OPTIONS.map(
                        (opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ),
                      )}
                    </MuiSelect>
                  </FormControl>
                </RingGroupFieldRow>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <RingGroupFieldRow
                  label="Ring Group Number"
                  tooltipKey="ring_group_number"
                  required
                >
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    value={ringGroupNumber}
                    onChange={(e) => setRingGroupNumber(e.target.value)}
                    sx={ringGroupModalTextFieldFullSx}
                  />
                </RingGroupFieldRow>

                <RingGroupFieldRow
                  label="Timeout Destination"
                  tooltipKey="timeout_destination"
                  required
                >
                  <div style={{ display: "flex", gap: 12 }}>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <MuiSelect
                        value={timeoutDestinationType}
                        displayEmpty
                        onChange={(e) => {
                          setTimeoutDestinationType(e.target.value);
                          setTimeoutDestinationValue("");
                        }}
                        sx={ringGroupModalSelectSx}
                      >
                        <MenuItem value="" sx={{ fontSize: 13 }}>
                          <em>Select type</em>
                        </MenuItem>
                        {RING_GROUP_TIMEOUT_DESTINATION_OPTIONS.map((opt) => (
                          <MenuItem
                            key={opt.value}
                            value={opt.value}
                            sx={{ fontSize: 13 }}
                          >
                            {opt.label}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>

                    {shouldShowTimeoutValue && (
                      <FormControl size="small" sx={{ flex: 1 }}>
                        <MuiSelect
                          value={timeoutDestinationValue}
                          displayEmpty
                          onChange={(e) =>
                            setTimeoutDestinationValue(e.target.value)
                          }
                          sx={ringGroupModalSelectSx}
                        >
                          <MenuItem value="" sx={{ fontSize: 13 }}>
                            <em>Select value</em>
                          </MenuItem>
                          {timeoutValueOptions.map((opt) => (
                            <MenuItem
                              key={opt.value}
                              value={opt.value}
                              sx={{ fontSize: 13 }}
                            >
                              {opt.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    )}
                  </div>
                </RingGroupFieldRow>

                <RingGroupFieldRow label="Enable" tooltipKey="enabled" required>
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={ringGroupModalSelectSx}
                    >
                      {RING_GROUP_ENABLE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </RingGroupFieldRow>

                <RingGroupFieldRow
                  label="Ring Back"
                  tooltipKey="ring_back"
                  alignTop
                >
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={ringBack}
                      onChange={(e) => setRingBack(e.target.value)}
                      MenuProps={RING_GROUP_RING_BACK_MENU_PROPS}
                      sx={ringGroupModalSelectSx}
                    >
                      {ringBack && !ringBackAllValues.includes(ringBack) && (
                        <MenuItem value={ringBack} sx={{ fontSize: 13 }}>
                          {ringBack}
                        </MenuItem>
                      )}
                      {ringBackOptions.moh_categories.length > 0 && (
                        <ListSubheader
                          disableSticky
                          sx={{
                            fontWeight: 700,
                            fontSize: 12,
                            lineHeight: "24px",
                          }}
                        >
                          Music on Hold
                        </ListSubheader>
                      )}
                      {ringBackOptions.moh_categories.map((opt) => (
                        <MenuItem
                          key={`moh-${opt}`}
                          value={opt}
                          sx={{ pl: 3, fontSize: 13 }}
                        >
                          {opt}
                        </MenuItem>
                      ))}
                      {ringBackOptions.custom_prompts.length > 0 && (
                        <ListSubheader
                          disableSticky
                          sx={{
                            fontWeight: 700,
                            fontSize: 12,
                            lineHeight: "24px",
                          }}
                        >
                          Custom Prompt
                        </ListSubheader>
                      )}
                      {ringBackOptions.custom_prompts.map((opt) => (
                        <MenuItem
                          key={`prompt-${opt}`}
                          value={opt}
                          sx={{ pl: 3, fontSize: 13 }}
                        >
                          {opt}
                        </MenuItem>
                      ))}
                      {ringBackOptions.country_tones.length > 0 && (
                        <ListSubheader
                          disableSticky
                          sx={{
                            fontWeight: 700,
                            fontSize: 12,
                            lineHeight: "24px",
                          }}
                        >
                          Ring Back
                        </ListSubheader>
                      )}
                      {ringBackOptions.country_tones.map((opt) => (
                        <MenuItem
                          key={`tone-${opt}`}
                          value={opt}
                          sx={{ pl: 3, fontSize: 13 }}
                        >
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </RingGroupFieldRow>

                <RingGroupFieldRow
                  label="Caller ID Name Prefix"
                  tooltipKey="caller_id_name_prefix"
                >
                  <TextField
                    size="small"
                    fullWidth
                    value={cidNamePrefix}
                    onChange={(e) => setCidNamePrefix(e.target.value)}
                    sx={ringGroupModalTextFieldFullSx}
                  />
                </RingGroupFieldRow>
              </div>
            </div>

            <RingGroupSectionHeading title="Member Extensions" required />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: `1fr ${RING_GROUP_MEMBER_CODEC_BTN_COL_WIDTH}px 1fr`,
                gap: 10,
                width: "100%",
                alignItems: "start",
              }}
            >
              <div>
                <div style={ringGroupMemberCodecColumnLabelStyle}>Available</div>
                <RingGroupMemberCodecListBox
                  items={loading.members ? [] : availableList}
                  selectedIds={availableSelected}
                  onToggle={toggleAvailableMemberSelect}
                  emptyText={availableMemberEmptyText}
                  getLabel={(id) => {
                    const item = availableList.find((x) => x.value === id);
                    return item?.label || getExtLabel(id);
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    height: RING_GROUP_MEMBER_CODEC_LIST_LABEL_OFFSET,
                  }}
                  aria-hidden="true"
                />
                <div style={ringGroupMemberCodecBtnColumnStyle}>
                  <RingGroupMemberCodecDualListBtn
                    onClick={addSelectedMembers}
                  >
                    &gt;
                  </RingGroupMemberCodecDualListBtn>
                  <RingGroupMemberCodecDualListBtn onClick={addAllMembers}>
                    &gt;&gt;
                  </RingGroupMemberCodecDualListBtn>
                  <RingGroupMemberCodecDualListBtn
                    onClick={removeSelectedMembers}
                  >
                    &lt;
                  </RingGroupMemberCodecDualListBtn>
                  <RingGroupMemberCodecDualListBtn onClick={removeAllMembers}>
                    &lt;&lt;
                  </RingGroupMemberCodecDualListBtn>
                </div>
              </div>
              <div>
                <div style={ringGroupMemberCodecColumnLabelStyle}>Selected</div>
                <RingGroupMemberCodecListBox
                  items={memberExtensions}
                  selectedIds={chosenSelected}
                  onToggle={toggleChosenMemberSelect}
                  emptyText="No selected member"
                  getLabel={getExtLabel}
                />
              </div>
            </div>
          </div>
          </div>
        </DialogContent>

        <DialogActions style={ringGroupModalActionsStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {loading.save ? (
              <>
                <CircularProgress size={13} sx={{ color: "#fff", mr: 1 }} />
                Saving...
              </>
            ) : editId != null ? (
              "Update Group"
            ) : (
              "Create Group"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={ringGroupModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RingGroup;
