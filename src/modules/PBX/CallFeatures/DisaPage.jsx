import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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
  InputAdornment,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  createDisa,
  deleteDisa,
  getDisa,
  listDisa,
  listOutboundRoutes,
  updateDisa,
} from "../../../api/apiService";
import {
  DISA_ENABLE_OPTIONS,
  DISA_FIELD_TOOLTIPS,
  DISA_ITEMS_PER_PAGE,
  DISA_SECOND_DIAL_OPTIONS,
  DISA_TITLE,
  DISA_TRANSPARENT_OPTIONS,
} from "../../../constants/DisaConstants";

const INITIAL_FORM = {
  name: "",
  responseTimeout: "10",
  digitTimeout: "5",
  secondDial: "Enable",
  transparent: "Disable",
  pinType: "None",
  pin: "",
  outboundRoutes: [],
  enabled: true,
};

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

const disaTdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const disaTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const DISA_TABLE_CARD_RADIUS = 10;

const disaPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const disaPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const DisaBreadcrumb = ({ section, current, style }) => (
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

const disaCardStyle = {
  background: "#ffffff",
  borderRadius: DISA_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const disaToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: DISA_TABLE_CARD_RADIUS,
  borderTopRightRadius: DISA_TABLE_CARD_RADIUS,
};

const disaPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: DISA_TABLE_CARD_RADIUS,
  borderBottomRightRadius: DISA_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const disaSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const disaCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const disaPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const disaPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const disaFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const disaEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const handleDisaEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const disaOutlinedInputRootSx = {
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

const disaModalTextFieldFullSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...disaOutlinedInputRootSx,
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

const disaModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...disaOutlinedInputRootSx,
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

const disaModalPaperSx = {
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

const disaModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const disaModalSectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: "20px 24px 24px",
  marginTop: 24,
};

const disaModalContentWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  paddingBottom: 4,
};

const disaModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const disaModalDialogContainerSx = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
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

const disaModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const DISA_TOOLTIP_PROPS = {
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

const formatDisaTooltipTitle = (text) => {
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

const DISA_MODAL_LABEL_WIDTH = 150;

const DisaFieldLabel = ({
  tooltipKey,
  children,
  required,
  style = {},
}) => {
  const tooltip = DISA_FIELD_TOOLTIPS[tooltipKey] || "";
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
      title={formatDisaTooltipTitle(tooltip)}
      {...DISA_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const DisaFieldRow = ({ label, tooltipKey, required, children, alignTop }) => (
  <div
    style={{
      display: "flex",
      alignItems: alignTop ? "flex-start" : "center",
      gap: 12,
      minHeight: alignTop ? undefined : 32,
    }}
  >
    {tooltipKey ? (
      <DisaFieldLabel
        tooltipKey={tooltipKey}
        required={required}
        style={{
          width: DISA_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          marginTop: alignTop ? 4 : 0,
        }}
      >
        {label}
      </DisaFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
          width: DISA_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          marginTop: alignTop ? 4 : 0,
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

const DISA_MODAL_SECTION_BG = "#f8fafc";
const DISA_MODAL_SECTION_HEADING_COLOR = "#30415A";

const DisaSectionHeading = ({
  title,
  isFirst = false,
  required = false,
  tooltipKey,
}) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  const heading = (
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : -6,
        background: DISA_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: DISA_MODAL_SECTION_HEADING_COLOR,
        cursor: tooltipKey ? "help" : undefined,
      }}
    >
      {title}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </span>
  );
  const tooltip = tooltipKey ? DISA_FIELD_TOOLTIPS[tooltipKey] : "";
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
      {tooltip ? (
        <Tooltip
          title={formatDisaTooltipTitle(tooltip)}
          {...DISA_TOOLTIP_PROPS}
        >
          {heading}
        </Tooltip>
      ) : (
        heading
      )}
    </div>
  );
};

const DISA_ROUTE_CODEC_LIST_BOX_HEIGHT = 188;
const DISA_ROUTE_CODEC_BTN_COL_WIDTH = 40;
const DISA_ROUTE_CODEC_BTN_GAP = 6;
const DISA_ROUTE_CODEC_BTN_HEIGHT =
  (DISA_ROUTE_CODEC_LIST_BOX_HEIGHT - DISA_ROUTE_CODEC_BTN_GAP * 3) / 4;
const DISA_ROUTE_CODEC_LIST_LABEL_OFFSET = 28;

const disaRouteCodecColumnLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "center",
  marginBottom: 8,
};

const getDisaRouteCodecListBoxStyle = (isEmpty) => ({
  width: "100%",
  minHeight: DISA_ROUTE_CODEC_LIST_BOX_HEIGHT,
  height: DISA_ROUTE_CODEC_LIST_BOX_HEIGHT,
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

const disaRouteCodecListEmptyStyle = {
  color: C.placeholderText,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "center",
  userSelect: "none",
  padding: "0 16px",
};

const disaRouteCodecStripStyle = (isSelected) => ({
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

const disaRouteCodecDualListBtnStyle = {
  width: DISA_ROUTE_CODEC_BTN_COL_WIDTH,
  height: DISA_ROUTE_CODEC_BTN_HEIGHT,
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

const disaRouteCodecDualListReorderBtnStyle = {
  ...disaRouteCodecDualListBtnStyle,
  fontSize: 11,
  fontWeight: 500
};

const disaRouteCodecDualListReorderDownBtnStyle = {
  ...disaRouteCodecDualListReorderBtnStyle,
  fontWeight: 400,
};

const disaRouteCodecBtnColumnStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: DISA_ROUTE_CODEC_BTN_GAP,
  height: DISA_ROUTE_CODEC_LIST_BOX_HEIGHT,
  width: DISA_ROUTE_CODEC_BTN_COL_WIDTH,
};

const DisaRouteCodecDualListBtn = ({ onClick, title, children, reorder, down }) => (
  <button
    type="button"
    data-codec-action-btn
    title={title}
    onClick={onClick}
        style={
      down
        ? disaRouteCodecDualListReorderDownBtnStyle
        : reorder
          ? disaRouteCodecDualListReorderBtnStyle
          : disaRouteCodecDualListBtnStyle
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

const DisaRouteCodecListBox = ({
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

  const getItemId = (item) => typeof item === "string" || typeof item === "number" ? item : (item.value ?? item.extension ?? item.id);
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
      style={getDisaRouteCodecListBoxStyle(isEmpty)}
      onMouseDown={handleMouseDown}
      onClick={handleContainerClick}
    >
      {isEmpty ? (
        <div style={disaRouteCodecListEmptyStyle}>{emptyText}</div>
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
              style={disaRouteCodecStripStyle(isSelected)}
            >
              {label}
            </div>
          );
        })
      )}
    </div>
  );
};

const enableDisableCellStyle = (value) => ({
  color: value === "Enable" ? "#16a34a" : "#dc2626",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
});

const DISA_COMPACT_MQ = "(max-width: 768px)";

// ── API Helpers ───────────────────────────────────────────────────────────────
const normalizeList = (raw) => {
  const list = raw?.message ?? raw?.data ?? raw;
  return Array.isArray(list) ? list : [];
};

const asBool = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const v = value.toLowerCase().trim();
    if (["true", "1", "yes", "enable", "enabled"].includes(v)) return true;
    if (["false", "0", "no", "disable", "disabled"].includes(v)) return false;
  }
  return fallback;
};

const normalizePinType = (value) => {
  if (String(value || "").toLowerCase() === "single_pin") return "Single Pin";
  return "None";
};

const mapDisaFromApi = (item) => {
  const outboundIdsRaw = Array.isArray(item?.outbound_routes)
    ? item.outbound_routes
    : Array.isArray(item?.outboundRoutes)
      ? item.outboundRoutes
      : [];
  const outboundRoutes = outboundIdsRaw
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));

  return {
    id: item?.id,
    name: String(item?.name || ""),
    responseTimeout: String(
      item?.response_timeout ?? item?.responseTimeout ?? 10,
    ),
    digitTimeout: String(item?.digit_timeout ?? item?.digitTimeout ?? 5),
    secondDial: asBool(item?.second_dial ?? item?.secondDial, true)
      ? "Enable"
      : "Disable",
    transparent: asBool(item?.transparent, false) ? "Enable" : "Disable",
    pinType: normalizePinType(item?.pin_type ?? item?.pinType),
    pin: String(item?.pin_number ?? item?.pin ?? ""),
    outboundRoutes,
    enabled: asBool(item?.enabled, true),
  };
};

// ─────────────────────────────────────────────────────────────────────────────

const DisaPage = () => {
  const isCompact = useMediaQuery(DISA_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
    get: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);

  // Search & Pagination
  const itemsPerPage = DISA_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);
  // Outbound routes state
  const [allOutboundRoutes, setAllOutboundRoutes] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const routeNameById = useMemo(() => {
    const map = new Map();
    allOutboundRoutes.forEach((route) => map.set(route.id, route.name));
    return map;
  }, [allOutboundRoutes]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const fetchRows = async () => {
    setLoading((p) => ({ ...p, list: true }));
    try {
      const res = await listDisa();
      if (!res?.response) {
        setRows([]);
        return;
      }
      setRows(normalizeList(res).map(mapDisaFromApi));
    } catch {
      setRows([]);
    } finally {
      setLoading((p) => ({ ...p, list: false }));
      setIsInitialLoad(false);
    }
  };

  const fetchOutboundRoutes = async () => {
    try {
      const res = await listOutboundRoutes();
      const list = normalizeList(res);
      const routes = list
        .map((r) => ({
          id: Number(r?.id),
          name: String(r?.name || r?.route_name || ""),
        }))
        .filter((r) => Number.isFinite(r.id) && r.name);
      setAllOutboundRoutes(routes);
    } catch {
      setAllOutboundRoutes([]);
    }
  };

  useEffect(() => {
    fetchRows();
    fetchOutboundRoutes();
  }, []);

  // ── Search & Pagination ──
  const filteredRows = rows;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const pagedRows = filteredRows.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  useEffect(() => {
    setPage((p) =>
      Math.min(
        Math.max(1, p),
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

  const handleToggleRow = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

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
    setForm(INITIAL_FORM);
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowPassword(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setShowModal(true);
    setAvailableSelected([]);
    setChosenSelected([]);
    setLoading((p) => ({ ...p, get: true }));
    try {
      const res = await getDisa(row.id);
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load DISA details.");
        setForm({ ...row });
        return;
      }
      const detail = Array.isArray(res?.message)
        ? res.message[0]
        : res?.message || res?.data || row;
      setForm(mapDisaFromApi(detail));
    } catch {
      setForm({ ...row });
    } finally {
      setLoading((p) => ({ ...p, get: false }));
    }
  };

  const handleCloseModal = () => {
    if (loading.save || loading.get) return;
    setShowModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("error", "Please select at least one row to delete.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((p) => ({ ...p, delete: true }));
    try {
      const ids = selected
        .map((idx) => filteredRows[idx]?.id)
        .filter((id) => id != null);
      const results = await Promise.all(ids.map((id) => deleteDisa(id)));
      const failed = results.find((r) => !r?.response);
      if (failed) showMessage("error", failed?.message || "Failed to delete.");
      else showMessage("success", "DISA deleted successfully.");
      await fetchRows();
      setSelected([]);
      setPage(1);
    } catch (err) {
      showMessage("error", err?.message || "Failed to delete.");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return showMessage("error", "Name is required.");

    const respTimeout = Number(form.responseTimeout);
    if (!form.responseTimeout.trim() || isNaN(respTimeout) || respTimeout < 1) {
      return showMessage("error", "Response Timeout must be 1 or greater.");
    }

    const digTimeout = Number(form.digitTimeout);
    if (!form.digitTimeout.trim() || isNaN(digTimeout) || digTimeout < 1) {
      return showMessage("error", "Digit Timeout must be 1 or greater.");
    }

    if (form.pinType === "Single Pin" && !form.pin.trim())
      return showMessage("error", "Pin number is required.");

    const payload = {
      name: form.name.trim(),
      response_timeout: respTimeout,
      digit_timeout: digTimeout,
      second_dial: form.secondDial === "Enable",
      transparent: form.transparent === "Enable",
      pin_type: form.pinType === "Single Pin" ? "single_pin" : "none",
      pin_number: form.pinType === "Single Pin" ? form.pin.trim() : "",
      outbound_routes: form.outboundRoutes,
      enabled: !!form.enabled,
    };

    setLoading((p) => ({ ...p, save: true }));
    try {
      const res =
        editId != null
          ? await updateDisa(editId, payload)
          : await createDisa(payload);
      if (!res?.response) {
        showMessage("error", res?.message || "Failed to save DISA.");
        return;
      }
      showMessage(
        "success",
        editId != null
          ? "DISA updated successfully."
          : "DISA created successfully.",
      );
      await fetchRows();
      handleCloseModal();
    } catch (err) {
      showMessage("error", err?.message || "Failed to save DISA.");
    } finally {
      setLoading((p) => ({ ...p, save: false }));
    }
  };

  // ── Dual Listbox Computed (IDs) ──
  const availableRoutes = allOutboundRoutes.filter(
    (r) => !form.outboundRoutes.includes(r.id),
  );
  const chosenRoutes = form.outboundRoutes;

  const addSelectedToChosen = () => {
    if (!availableSelected.length) return;
    setForm((f) => ({
      ...f,
      outboundRoutes: [
        ...f.outboundRoutes,
        ...availableSelected.filter((id) => !f.outboundRoutes.includes(id)),
      ],
    }));
    setAvailableSelected([]);
  };

  const addAllToChosen = () => {
    setForm((f) => ({
      ...f,
      outboundRoutes: [
        ...f.outboundRoutes,
        ...availableRoutes.map((r) => r.id),
      ],
    }));
    setAvailableSelected([]);
  };

  const removeSelectedFromChosen = () => {
    if (!chosenSelected.length) return;
    setForm((f) => ({
      ...f,
      outboundRoutes: f.outboundRoutes.filter(
        (id) => !chosenSelected.includes(id),
      ),
    }));
    setChosenSelected([]);
  };

  const removeAllFromChosen = () => {
    setForm((f) => ({ ...f, outboundRoutes: [] }));
    setChosenSelected([]);
  };

  const moveChosenUp = () => {
    if (!chosenSelected.length) return;
    const routes = [...chosenRoutes];
    chosenSelected.forEach((id) => {
      const idx = routes.indexOf(id);
      if (idx > 0)
        [routes[idx - 1], routes[idx]] = [routes[idx], routes[idx - 1]];
    });
    setForm((f) => ({ ...f, outboundRoutes: routes }));
  };

  const moveChosenDown = () => {
    if (!chosenSelected.length) return;
    const routes = [...chosenRoutes];
    [...chosenSelected].reverse().forEach((id) => {
      const idx = routes.indexOf(id);
      if (idx < routes.length - 1)
        [routes[idx], routes[idx + 1]] = [routes[idx + 1], routes[idx]];
    });
    setForm((f) => ({ ...f, outboundRoutes: routes }));
  };

  const moveChosenTop = () => {
    if (!chosenSelected.length) return;
    const sel = chosenRoutes.filter((id) => chosenSelected.includes(id));
    const rest = chosenRoutes.filter((id) => !chosenSelected.includes(id));
    setForm((f) => ({ ...f, outboundRoutes: [...sel, ...rest] }));
  };

  const moveChosenBottom = () => {
    if (!chosenSelected.length) return;
    const sel = chosenRoutes.filter((id) => chosenSelected.includes(id));
    const rest = chosenRoutes.filter((id) => !chosenSelected.includes(id));
    setForm((f) => ({ ...f, outboundRoutes: [...rest, ...sel] }));
  };

  const toggleAvailableRouteSelect = (id) => {
    setAvailableSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleChosenRouteSelect = (id) => {
    setChosenSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAvailableRoutes = (ids) => setAvailableSelected(ids);

  const selectChosenRoutes = (ids) => setChosenSelected(ids);

  const clearOutboundRouteHighlight = () => {
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
      clearOutboundRouteHighlight();
    };

    document.addEventListener("mousedown", handleOutsideClear);
    return () => document.removeEventListener("mousedown", handleOutsideClear);
  }, [showModal, availableSelected, chosenSelected]);

  return (
    <div
      style={{
        ...disaPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={disaPageInnerStyle}>
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
            sx={disaFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <DisaBreadcrumb section="Call Features" current={DISA_TITLE} />

        <div style={disaCardStyle}>
          <div
            style={{
              ...disaToolbarStyle,
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
                <span style={disaSelectedBadgeStyle}>
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
                style={disaCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={disaPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
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
                message="No DISA entries found."
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
                        sx={disaTableCheckboxSx}
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
                      Response Timeout (s)
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Digit Timeout (s)
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Second Dial
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Transparent
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Pin Type
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Outbound Routes
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
                    const routeNames = row.outboundRoutes.map(
                      (id) => routeNameById.get(id) || `ID:${id}`,
                    );

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
                            ...disaTdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            borderBottom: isLastRow
                              ? "none"
                              : disaTdStyle.borderBottom,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={disaTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...disaTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : disaTdStyle.borderBottom,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...disaTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : disaTdStyle.borderBottom,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...disaTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : disaTdStyle.borderBottom,
                          }}
                        >
                          {row.responseTimeout}
                        </td>
                        <td
                          style={{
                            ...disaTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : disaTdStyle.borderBottom,
                          }}
                        >
                          {row.digitTimeout}
                        </td>
                        <td
                          style={{
                            ...disaTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : disaTdStyle.borderBottom,
                          }}
                        >
                          <span style={enableDisableCellStyle(row.secondDial)}>
                            {row.secondDial}
                          </span>
                        </td>
                        <td
                          style={{
                            ...disaTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : disaTdStyle.borderBottom,
                          }}
                        >
                          <span style={enableDisableCellStyle(row.transparent)}>
                            {row.transparent}
                          </span>
                        </td>
                        <td
                          style={{
                            ...disaTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : disaTdStyle.borderBottom,
                          }}
                        >
                          <span
                            style={{
                             
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {row.pinType}
                          </span>
                        </td>
                        <td
                          style={{
                            ...disaTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : disaTdStyle.borderBottom,
                          }}
                        >
                          {routeNames.slice(0, 3).join(", ")}
                          {routeNames.length > 3
                            ? ` +${routeNames.length - 3}`
                            : ""}
                        </td>
                        <td
                          style={{
                            ...disaTdStyle,
                            background: rowBg,
                            borderRight: "none",
                            borderBottom: isLastRow
                              ? "none"
                              : disaTdStyle.borderBottom,
                           
                          }}
                        >
                          <EditDocumentIcon
                            titleAccess="Edit"
                            onClick={() => handleOpenEditModal(row)}
                            style={disaEditIconStyle}
                            onMouseEnter={(e) =>
                              handleDisaEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleDisaEditIconHover(e, false)
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

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <div style={disaPaginationStyle}>
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
                <span style={disaPageBadgeStyle}>
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
        onClose={loading.save || loading.get ? null : handleCloseModal}
        maxWidth={false}
        sx={disaModalDialogContainerSx}
        PaperProps={{ sx: disaModalPaperSx }}
      >
        <DialogTitle style={disaModalTitleStyle}>
          {editId != null ? `Edit ${DISA_TITLE}` : `Add ${DISA_TITLE}`}
        </DialogTitle>

        <DialogContent
          className="app-main-scroll"
          sx={{
            ...disaModalDialogContentSx,
            padding: "0 24px 24px",
            backgroundColor: "#ffffff",
          }}
        >
          {loading.get ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 40,
              }}
            >
              <CircularProgress size={30} style={{ color: C.accent }} />
            </div>
          ) : (
            <div style={disaModalContentWrapStyle}>
              <div style={{ background: "#ffffff" }}>
                <div style={disaModalSectionStyle}>
                <DisaSectionHeading title="General Settings" isFirst />

                <div
                  style={{
                    marginTop: 8,
                    width: "100%",
                    maxWidth: 720,
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
                    gap: isCompact ? "16px" : "16px 20px",
                  }}
                >
                  {/* ── LEFT COLUMN ── */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <DisaFieldRow label="Name" tooltipKey="name" required>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        sx={disaModalTextFieldFullSx}
                      />
                    </DisaFieldRow>

                    <DisaFieldRow
                      label="Response Timeout (s)"
                      tooltipKey="response_timeout"
                      required
                    >
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={form.responseTimeout}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            responseTimeout: e.target.value,
                          }))
                        }
                        inputProps={{ min: 1 }}
                        sx={disaModalTextFieldFullSx}
                      />
                    </DisaFieldRow>

                    <DisaFieldRow label="Second Dial" tooltipKey="second_dial">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={form.secondDial}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              secondDial: e.target.value,
                            }))
                          }
                          sx={disaModalSelectSx}
                        >
                          {DISA_SECOND_DIAL_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </DisaFieldRow>

                    <DisaFieldRow
                      label="Pin Type"
                      tooltipKey="pin_type"
                      alignTop
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 24,
                            height: 32,
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 13,
                              cursor: "pointer",
                              color: C.labelText,
                            }}
                          >
                            <input
                              type="radio"
                              name="pinType"
                              value="None"
                              checked={form.pinType === "None"}
                              onChange={() =>
                                setForm((f) => ({
                                  ...f,
                                  pinType: "None",
                                  pin: "",
                                }))
                              }
                              style={{ cursor: "pointer" }}
                            />
                            None
                          </label>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 13,
                              cursor: "pointer",
                              color: C.labelText,
                            }}
                          >
                            <input
                              type="radio"
                              name="pinType"
                              value="Single Pin"
                              checked={form.pinType === "Single Pin"}
                              onChange={() =>
                                setForm((f) => ({
                                  ...f,
                                  pinType: "Single Pin",
                                }))
                              }
                              style={{ cursor: "pointer" }}
                            />
                            Single Pin
                          </label>
                        </div>
                        {form.pinType === "Single Pin" && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Enter pin number"
                              type={showPassword ? "text" : "password"}
                              value={form.pin}
                              onChange={(e) =>
                                setForm((f) => ({ ...f, pin: e.target.value }))
                              }
                              sx={disaModalTextFieldFullSx}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        setShowPassword(!showPassword)
                                      }
                                    >
                                      {showPassword ? (
                                        <VisibilityOff sx={{ fontSize: 16 }} />
                                      ) : (
                                        <Visibility sx={{ fontSize: 16 }} />
                                      )}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </DisaFieldRow>
                  </div>

                  {/* ── RIGHT COLUMN ── */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <DisaFieldRow
                      label="Digit Timeout (s)"
                      tooltipKey="digit_timeout"
                      required
                    >
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={form.digitTimeout}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            digitTimeout: e.target.value,
                          }))
                        }
                        inputProps={{ min: 1 }}
                        sx={disaModalTextFieldFullSx}
                      />
                    </DisaFieldRow>

                    <DisaFieldRow label="Transparent" tooltipKey="transparent">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={form.transparent}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              transparent: e.target.value,
                            }))
                          }
                          sx={disaModalSelectSx}
                        >
                          {DISA_TRANSPARENT_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </DisaFieldRow>

                    <DisaFieldRow label="Enabled" tooltipKey="enabled">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={form.enabled ? "Yes" : "No"}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              enabled: e.target.value === "Yes",
                            }))
                          }
                          sx={disaModalSelectSx}
                        >
                          {DISA_ENABLE_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </DisaFieldRow>
                  </div>
                </div>

                <DisaSectionHeading
                  title="Outbound Routes"
                  tooltipKey="outbound_routes"
                />

                <div
                  style={{
                    marginTop: 8,
                    display: "grid",
                    gridTemplateColumns: `1fr ${DISA_ROUTE_CODEC_BTN_COL_WIDTH}px 1fr ${DISA_ROUTE_CODEC_BTN_COL_WIDTH}px`,
                    gap: 10,
                    width: "100%",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <div style={disaRouteCodecColumnLabelStyle}>
                      Available Routes
                    </div>
                    <DisaRouteCodecListBox
                      items={availableRoutes}
                      selectedIds={availableSelected}
                      onToggle={toggleAvailableRouteSelect}
                      onDragSelect={selectAvailableRoutes}
                      onClearHighlight={clearOutboundRouteHighlight}
                      emptyText="No routes available"
                      getLabel={(id, item) => item?.name || `ID:${id}`}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        height: DISA_ROUTE_CODEC_LIST_LABEL_OFFSET,
                      }}
                      aria-hidden="true"
                    />
                    <div style={disaRouteCodecBtnColumnStyle}>
                      <DisaRouteCodecDualListBtn
                        onClick={addSelectedToChosen}
                        title="Move selected to Selected"
                      >
                        &gt;
                      </DisaRouteCodecDualListBtn>
                      <DisaRouteCodecDualListBtn
                        onClick={addAllToChosen}
                        title="Move all to Selected"
                      >
                        &gt;&gt;
                      </DisaRouteCodecDualListBtn>
                      <DisaRouteCodecDualListBtn
                        onClick={removeSelectedFromChosen}
                        title="Move selected to Available"
                      >
                        &lt;
                      </DisaRouteCodecDualListBtn>
                      <DisaRouteCodecDualListBtn
                        onClick={removeAllFromChosen}
                        title="Move all to Available"
                      >
                        &lt;&lt;
                      </DisaRouteCodecDualListBtn>
                    </div>
                  </div>
                  <div>
                    <div style={disaRouteCodecColumnLabelStyle}>
                      Selected Routes
                    </div>
                    <DisaRouteCodecListBox
                      items={chosenRoutes}
                      selectedIds={chosenSelected}
                      onToggle={toggleChosenRouteSelect}
                      onDragSelect={selectChosenRoutes}
                      onClearHighlight={clearOutboundRouteHighlight}
                      emptyText="No selected routes"
                      getLabel={(id) => routeNameById.get(id) || `ID:${id}`}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        height: DISA_ROUTE_CODEC_LIST_LABEL_OFFSET,
                      }}
                      aria-hidden="true"
                    />
                    <div style={disaRouteCodecBtnColumnStyle}>
                      <DisaRouteCodecDualListBtn
                        reorder
                        title="Move to bottom"
                      down
                        onClick={moveChosenBottom}
                      >
                        vv
                      </DisaRouteCodecDualListBtn>
                      <DisaRouteCodecDualListBtn
                        reorder
                        title="Move up"
                        onClick={moveChosenUp}
                      >
                        ^
                      </DisaRouteCodecDualListBtn>
                      <DisaRouteCodecDualListBtn
                        reorder
                        title="Move down"
                      down
                        onClick={moveChosenDown}
                      >
                        v
                      </DisaRouteCodecDualListBtn>
                      <DisaRouteCodecDualListBtn
                        reorder
                        title="Move to top"
                        onClick={moveChosenTop}
                      >
                        ^^
                      </DisaRouteCodecDualListBtn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save || loading.get}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save && <CircularProgress size={20} color="inherit" />}
            {loading.save
              ? "Saving..."
              : editId != null
                ? "Update DISA"
                : "Create DISA"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save || loading.get}
            style={disaModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DisaPage;
