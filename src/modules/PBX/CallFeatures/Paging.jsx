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
  Select as MuiSelect,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  createPagingGroup,
  deletePagingGroup,
  fetchSipAccounts,
  listPagingGroups,
  updatePagingGroup,
} from "../../../api/apiService";
import {
  PAGING_FIELD_TOOLTIPS,
  PAGING_ITEMS_PER_PAGE,
  PAGING_TITLE,
  PAGING_TYPE_OPTIONS,
} from "../../../constants/PagingConstants";

const PAGING_COMPACT_MQ = "(max-width: 768px)";

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

const pagingTdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const pagingTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const PAGING_TABLE_CARD_RADIUS = 10;

const pagingPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pagingPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const PagingBreadcrumb = ({ section, current, style }) => (
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

const pagingCardStyle = {
  background: "#ffffff",
  borderRadius: PAGING_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const pagingToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: PAGING_TABLE_CARD_RADIUS,
  borderTopRightRadius: PAGING_TABLE_CARD_RADIUS,
};

const pagingPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: PAGING_TABLE_CARD_RADIUS,
  borderBottomRightRadius: PAGING_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const pagingSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const pagingCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const pagingPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const pagingPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const pagingFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const pagingEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const handlePagingEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const pagingOutlinedInputRootSx = {
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

const pagingModalTextFieldFullSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...pagingOutlinedInputRootSx,
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

const pagingModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...pagingOutlinedInputRootSx,
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

const pagingModalPaperSx = {
  width: 900,
  maxWidth: "96vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const pagingModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const pagingModalSectionStyle = {
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
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

const pagingModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const PAGING_TOOLTIP_PROPS = {
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

const formatPagingTooltipTitle = (text) => {
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

const PAGING_MODAL_LABEL_WIDTH = 140;
const PAGING_MODAL_SECTION_BG = "#f8fafc";
const PAGING_MODAL_SECTION_HEADING_COLOR = "#30415A";

const PagingFieldLabel = ({
  tooltipKey,
  children,
  required,
  style = {},
}) => {
  const tooltip = PAGING_FIELD_TOOLTIPS[tooltipKey] || "";
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
      {required ? (
        <span style={{ color: C.errorRed, marginLeft: 2 }}>*</span>
      ) : null}
    </span>
  );
  if (!tooltip) return label;
  return (
    <Tooltip
      title={formatPagingTooltipTitle(tooltip)}
      {...PAGING_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const PagingFieldRow = ({ label, tooltipKey, required, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    {tooltipKey ? (
      <PagingFieldLabel
        tooltipKey={tooltipKey}
        required={required}
        style={{
          width: PAGING_MODAL_LABEL_WIDTH,
          flexShrink: 0,
        }}
      >
        {label}
      </PagingFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
          width: PAGING_MODAL_LABEL_WIDTH,
          flexShrink: 0,
        }}
      >
        {label}
        {required ? (
          <span style={{ color: C.errorRed, marginLeft: 2 }}>*</span>
        ) : null}
      </label>
    )}
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const PagingSectionHeading = ({
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
        left: -6,
        background: PAGING_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: PAGING_MODAL_SECTION_HEADING_COLOR,
        cursor: tooltipKey ? "help" : undefined,
      }}
    >
      {title}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </span>
  );
  const tooltip = tooltipKey ? PAGING_FIELD_TOOLTIPS[tooltipKey] : "";
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
          title={formatPagingTooltipTitle(tooltip)}
          {...PAGING_TOOLTIP_PROPS}
        >
          {heading}
        </Tooltip>
      ) : (
        heading
      )}
    </div>
  );
};

const PAGING_MEMBER_CODEC_LIST_BOX_HEIGHT = 188;
const PAGING_MEMBER_CODEC_BTN_COL_WIDTH = 40;
const PAGING_MEMBER_CODEC_BTN_GAP = 6;
const PAGING_MEMBER_CODEC_BTN_HEIGHT =
  (PAGING_MEMBER_CODEC_LIST_BOX_HEIGHT -
    PAGING_MEMBER_CODEC_BTN_GAP * 3) /
  4;
const PAGING_MEMBER_CODEC_LIST_LABEL_OFFSET = 28;

const pagingMemberCodecColumnLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "center",
  marginBottom: 8,
};

const getPagingMemberCodecListBoxStyle = (isEmpty) => ({
  width: "100%",
  minHeight: PAGING_MEMBER_CODEC_LIST_BOX_HEIGHT,
  height: PAGING_MEMBER_CODEC_LIST_BOX_HEIGHT,
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

const pagingMemberCodecListEmptyStyle = {
  color: C.placeholderText,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "center",
  userSelect: "none",
  padding: "0 16px",
};

const pagingMemberCodecStripStyle = (isSelected) => ({
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

const pagingMemberCodecDualListBtnStyle = {
  width: PAGING_MEMBER_CODEC_BTN_COL_WIDTH,
  height: PAGING_MEMBER_CODEC_BTN_HEIGHT,
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

const pagingMemberCodecDualListReorderBtnStyle = {
  ...pagingMemberCodecDualListBtnStyle,
  fontSize: 11,
  fontWeight: 500,
  color: C.mutedText,
};

const pagingMemberCodecBtnColumnStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: PAGING_MEMBER_CODEC_BTN_GAP,
  height: PAGING_MEMBER_CODEC_LIST_BOX_HEIGHT,
  width: PAGING_MEMBER_CODEC_BTN_COL_WIDTH,
};

const PagingMemberCodecDualListBtn = ({ onClick, title, children, reorder }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={
      reorder
        ? pagingMemberCodecDualListReorderBtnStyle
        : pagingMemberCodecDualListBtnStyle
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

const PagingMemberCodecListBox = ({
  items,
  selectedIds,
  onToggle,
  emptyText,
  getLabel,
}) => {
  const isEmpty = items.length === 0;
  return (
    <div style={getPagingMemberCodecListBoxStyle(isEmpty)}>
      {isEmpty ? (
        <div style={pagingMemberCodecListEmptyStyle}>{emptyText}</div>
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
              style={pagingMemberCodecStripStyle(isSelected)}
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

const Paging = () => {
  const isCompact = useMediaQuery(PAGING_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    save: false,
    delete: false,
    extensions: false,
    list: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedExtensionsRef = useRef(false);

  // Search & Pagination
  const itemsPerPage = PAGING_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);

  // Modal State
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [pagingType, setPagingType] = useState("one-way");
  const [callerIdNamePrefix, setCallerIdNamePrefix] = useState("");

  // Dual list state
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const normalizePagingList = (res) => {
    const list = Array.isArray(res?.message)
      ? res.message
      : Array.isArray(res?.data)
        ? res.data
        : [];
    return list.map((g) => ({
      id: g.id,
      name: g.name || "",
      number: String(g.page_number ?? g.number ?? ""),
      type: g.type || g.page_type || g.paging_type || "one-way",
      callerIdNamePrefix: g.cid_name_prefix || g.callerIdNamePrefix || "",
      members: Array.isArray(g.members) ? g.members.map(String) : [],
    }));
  };

  const refreshPagingGroups = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listPagingGroups();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load paging groups.");
        setRows([]);
        return;
      }
      setRows(normalizePagingList(res));
    } catch (err) {
      showMessage("error", err?.message || "Failed to load paging groups.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    refreshPagingGroups();
  }, []);

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await fetchSipAccounts();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load extensions.");
        setAvailableExtensions([]);
        return;
      }
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
      setAvailableExtensions(exts);
      hasLoadedExtensionsRef.current = true;
    } catch (err) {
      showMessage("error", err?.message || "Failed to load extensions.");
      setAvailableExtensions([]);
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  // ── Search & Pagination ──
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

  // ── Form Handlers ──
  const resetForm = () => {
    setEditId(null);
    setName("");
    setNumber("");
    setPagingType("one-way");
    setCallerIdNamePrefix("");
    setMemberExtensions([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setNumber(row.number || "");
    setPagingType(row.type || "one-way");
    setCallerIdNamePrefix(row.callerIdNamePrefix || "");
    setMemberExtensions(Array.isArray(row.members) ? [...row.members] : []);
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleDelete = () => {
    if (selected.length === 0)
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
        for (const row of toDelete) {
          if (row.id != null) {
            const res = await deletePagingGroup(row.id);
            if (res?.response === false) {
              showMessage(
                "error",
                res?.message || "Failed to delete paging group.",
              );
              break;
            }
          }
        }
        setSelected([]);
        await refreshPagingGroups();
        showMessage("success", "Paging Group(s) deleted successfully.");
      } catch (err) {
        showMessage(
          "error",
          err?.message || "Failed to delete paging group(s).",
        );
      } finally {
        setLoading((prev) => ({ ...prev, delete: false }));
      }
    })();
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedNumber = number.trim();
    if (!trimmedName) return showMessage("error", "Name is required.");
    if (!trimmedNumber) return showMessage("error", "Number is required.");
    if (!/^\d+$/.test(trimmedNumber))
      return showMessage("error", "Number must be numeric.");
    if (!memberExtensions.length)
      return showMessage("error", "Please select at least one Member.");

    setLoading((prev) => ({ ...prev, save: true }));
    (async () => {
      try {
        const payload = {
          name: trimmedName,
          page_number: Number(trimmedNumber),
          pagingMode: pagingType,
          page_type: pagingType,
          paging_type: pagingType,
          cid_name_prefix: callerIdNamePrefix.trim(),
          members: memberExtensions.map(String),
        };
        if (editId != null) {
          const res = await updatePagingGroup(editId, payload);
          if (res?.response === false)
            return showMessage(
              "error",
              res?.message || "Failed to update paging group.",
            );
          showMessage("success", "Paging group updated successfully.");
        } else {
          const res = await createPagingGroup(payload);
          if (res?.response === false)
            return showMessage(
              "error",
              res?.message || "Failed to create paging group.",
            );
          showMessage("success", "Paging group created successfully.");
        }
        await refreshPagingGroups();
        handleCloseModal();
      } catch (err) {
        showMessage("error", err?.message || "Failed to save paging group.");
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
    if (availableSelected.length === 0) return;
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
    if (chosenSelected.length === 0) return;
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

  const handleReorderSelected = (action) => {
    if (chosenSelected.length !== 1) {
      showMessage(
        "error",
        "Select exactly one member in 'Selected' list to reorder.",
      );
      return;
    }
    const id = chosenSelected[0];
    setMemberExtensions((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const next = [...prev];
      if (action === "top") {
        next.splice(idx, 1);
        next.unshift(id);
      } else if (action === "bottom") {
        next.splice(idx, 1);
        next.push(id);
      } else if (action === "up" && idx > 0) {
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      } else if (action === "down" && idx < next.length - 1) {
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      }
      return next;
    });
  };

  const availableMemberEmptyText = loading.extensions
    ? "Loading..."
    : "No extension";

  return (
    <div
      style={{
        ...pagingPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={pagingPageInnerStyle}>
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
            sx={pagingFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <PagingBreadcrumb
          section="Call Features"
          current={PAGING_TITLE}
        />

        <div style={pagingCardStyle}>
          <div
            style={{
              ...pagingToolbarStyle,
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
                <span style={pagingSelectedBadgeStyle}>
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
                style={pagingCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={pagingPrimaryBtnStyle}
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
                message="No paging groups found."
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
                        sx={pagingTableCheckboxSx}
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
                      Number
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Type
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      CallerID Name Prefix
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
                      borderBottom: isLastRow ? "none" : pagingTdStyle.borderBottom,
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
                            ...pagingTdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={pagingTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...pagingTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...pagingTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...pagingTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span
                            style={{
                              color: C.valueText,
                              padding: "4px 11px",
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {row.number}
                          </span>
                        </td>
                        <td
                          style={{
                            ...pagingTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.type}
                        </td>
                        <td
                          style={{
                            ...pagingTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.callerIdNamePrefix || "—"}
                        </td>
                        <td
                          style={{
                            ...pagingTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {(row.members || [])
                            .slice(0, 3)
                            .map(getExtLabel)
                            .join(", ")}
                          {(row.members || []).length > 3
                            ? ` +${(row.members || []).length - 3}`
                            : ""}
                        </td>
                        <td
                          style={{
                            ...pagingTdStyle,
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
                              style={pagingEditIconStyle}
                              onMouseEnter={(e) =>
                                handlePagingEditIconHover(e, true)
                              }
                              onMouseLeave={(e) =>
                                handlePagingEditIconHover(e, false)
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
            <div style={pagingPaginationStyle}>
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
                <span style={pagingPageBadgeStyle}>
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
        PaperProps={{ sx: pagingModalPaperSx }}
      >
        <DialogTitle style={pagingModalTitleStyle}>
          {editId != null ? `Edit ${PAGING_TITLE}` : `Add ${PAGING_TITLE}`}
        </DialogTitle>

        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div style={pagingModalSectionStyle}>
            <PagingSectionHeading title="General Settings" isFirst />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
                gap: "16px 32px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <PagingFieldRow label="Name" tooltipKey="name" required>
                  <TextField
                    size="small"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={pagingModalTextFieldFullSx}
                  />
                </PagingFieldRow>

                <PagingFieldRow label="Number" tooltipKey="number" required>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    sx={pagingModalTextFieldFullSx}
                  />
                </PagingFieldRow>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <PagingFieldRow label="Type" tooltipKey="type" required>
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={pagingType}
                      onChange={(e) => setPagingType(e.target.value)}
                      sx={pagingModalSelectSx}
                    >
                      {PAGING_TYPE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </PagingFieldRow>

                <PagingFieldRow
                  label="CallerID Name Prefix"
                  tooltipKey="caller_id_name_prefix"
                >
                  <TextField
                    size="small"
                    fullWidth
                    value={callerIdNamePrefix}
                    onChange={(e) => setCallerIdNamePrefix(e.target.value)}
                    sx={pagingModalTextFieldFullSx}
                  />
                </PagingFieldRow>
              </div>
            </div>

            <PagingSectionHeading
              title="Member Extensions"
              required
              tooltipKey="member"
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: `1fr ${PAGING_MEMBER_CODEC_BTN_COL_WIDTH}px 1fr ${PAGING_MEMBER_CODEC_BTN_COL_WIDTH}px`,
                gap: 10,
                width: "100%",
                alignItems: "start",
              }}
            >
              <div>
                <div style={pagingMemberCodecColumnLabelStyle}>
                  Available
                </div>
                <PagingMemberCodecListBox
                  items={loading.extensions ? [] : availableList}
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
                    height: PAGING_MEMBER_CODEC_LIST_LABEL_OFFSET,
                  }}
                  aria-hidden="true"
                />
                <div style={pagingMemberCodecBtnColumnStyle}>
                  <PagingMemberCodecDualListBtn
                    onClick={addSelectedMembers}
                  >
                    &gt;
                  </PagingMemberCodecDualListBtn>
                  <PagingMemberCodecDualListBtn onClick={addAllMembers}>
                    &gt;&gt;
                  </PagingMemberCodecDualListBtn>
                  <PagingMemberCodecDualListBtn
                    onClick={removeSelectedMembers}
                  >
                    &lt;
                  </PagingMemberCodecDualListBtn>
                  <PagingMemberCodecDualListBtn onClick={removeAllMembers}>
                    &lt;&lt;
                  </PagingMemberCodecDualListBtn>
                </div>
              </div>
              <div>
                <div style={pagingMemberCodecColumnLabelStyle}>
                  Selected
                </div>
                <PagingMemberCodecListBox
                  items={memberExtensions}
                  selectedIds={chosenSelected}
                  onToggle={toggleChosenMemberSelect}
                  emptyText="No selected member"
                  getLabel={getExtLabel}
                />
              </div>
              <div>
                <div
                  style={{
                    height: PAGING_MEMBER_CODEC_LIST_LABEL_OFFSET,
                  }}
                  aria-hidden="true"
                />
                <div style={pagingMemberCodecBtnColumnStyle}>
                  <PagingMemberCodecDualListBtn
                    reorder
                    title="Move to bottom"
                    onClick={() => handleReorderSelected("bottom")}
                  >
                    vv
                  </PagingMemberCodecDualListBtn>
                  <PagingMemberCodecDualListBtn
                    reorder
                    title="Move up"
                    onClick={() => handleReorderSelected("up")}
                  >
                    ^
                  </PagingMemberCodecDualListBtn>
                  <PagingMemberCodecDualListBtn
                    reorder
                    title="Move down"
                    onClick={() => handleReorderSelected("down")}
                  >
                    v
                  </PagingMemberCodecDualListBtn>
                  <PagingMemberCodecDualListBtn
                    reorder
                    title="Move to top"
                    onClick={() => handleReorderSelected("top")}
                  >
                    ^^
                  </PagingMemberCodecDualListBtn>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={{ minWidth: 100, height: 36, fontSize: 13 }}
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
            style={pagingModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Paging;
