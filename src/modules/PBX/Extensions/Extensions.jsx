import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";
import {
  EXTENSION_INITIAL_FORM,
  EXTENSION_CODEC_OPTIONS,
  EXTENSION_FIELD_TOOLTIPS,
} from "../../../constants/ExtensionsConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Button,
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
  RadioGroup,
  Radio,
  Tabs,
  Tab,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  fetchSipAccounts,
  createSipAccount,
  updateSipAccount,
  deleteSipAccount,
  bulkCreateSipAccounts,
  exportSipAccountsCsv,
  importSipAccountsCsv,
} from "../../../api/apiService";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

const EXTENSION_COMPACT_MQ = "(max-width: 768px)";

const extensionFilterOptions = createFilterOptions({
  limit: 50,
});

// ── Local page UI (inlined from pbxSharedUi) ──
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
  placeholderText: "#9aa3b2",
  codecBoxBorder: "#c5ccd6",
  codecBoxAvailableBg: "#f8fafc",
  codecStripBg: "#ffffff",
  codecStripBorder: "#ced4de",
  codecStripSelectedBg: "#f1f5f9",
  codecStripSelectedBorder: "#8fa3b8",
  codecBtnBg: "#d9dde3",
  codecBtnBorder: "#c9d0d9",
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

const extensionModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
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

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const extensionFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const getExtensionTdStyle = (rowBg, lastRowCellStyle, extra = {}) => ({
  ...tdStyle,
  background: rowBg,
  ...lastRowCellStyle,
  ...extra,
});

const getExtensionRowBg = (isSelected, idx) =>
  isSelected ? "#eff6ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

const extensionCodecColumnLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "center",
  marginBottom: 8,
};

const extensionNoResultsRowStyle = {
  textAlign: "center",
  padding: "36px 0",
  color: C.mutedText,
  fontSize: 13,
};

const ExtensionEditIcon = ({ disabled, onClick }) => (
  <EditDocumentIcon
    titleAccess="Edit"
    onClick={() => {
      if (!disabled) onClick();
    }}
    style={{
      cursor: disabled ? "not-allowed" : "pointer",
      color: "#2563eb",
      fontSize: 22,
      opacity: disabled ? 0.4 : 0.7,
      transition: "opacity 0.15s ease",
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "1";
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "0.7";
    }}
  />
);

const extensionPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const extensionPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const ExtensionBreadcrumb = ({ section, current, style }) => (
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
const ExtensionTableListLoading = () => (
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

const ExtensionTableListEmptyState = ({
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

const EXTENSION_MODAL_TAB_BAR_STYLE = {
  borderBottom: "1px solid #e5e7eb",
  background: "#ffffff",
};

const EXTENSION_MODAL_TAB_ACTIVE_COLOR = "#3E5475";
const EXTENSION_MODAL_TAB_INACTIVE_COLOR = "#374151";

const extensionModalTabsSx = {
  minHeight: 45,
  "& .MuiTab-root": {
    color: EXTENSION_MODAL_TAB_INACTIVE_COLOR,
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 45,
  },
  "& .MuiTab-root.Mui-selected": {
    color: EXTENSION_MODAL_TAB_ACTIVE_COLOR,
    fontWeight: 700,
  },
};

const ExtensionModalTabs = ({ value, onChange, tabs, fullWidth = true }) => (
  <div style={EXTENSION_MODAL_TAB_BAR_STYLE}>
    <Tabs
      value={value}
      onChange={(_, next) => onChange(next)}
      variant={fullWidth ? "fullWidth" : "standard"}
      TabIndicatorProps={{
        style: { backgroundColor: EXTENSION_MODAL_TAB_ACTIVE_COLOR, height: 2 },
      }}
      sx={extensionModalTabsSx}
    >
      {tabs.map((t) => (
        <Tab key={t.id} label={t.label} value={t.id} />
      ))}
    </Tabs>
  </div>
);

const EXTENSION_MODAL_SECTION_BG = "#f8fafc";
const EXTENSION_MODAL_SECTION_HEADING_COLOR = "#30415A";

const ExtensionModalSectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
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
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : -6,
        background: EXTENSION_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: EXTENSION_MODAL_SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
  );
};

const AllowCodecsSectionHeading = ({ tooltipKey, required = false }) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  return (
  <div style={{ margin: "16px 0 24px 0", position: "relative", width: "100%" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : -6,
        background: EXTENSION_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: EXTENSION_MODAL_SECTION_HEADING_COLOR,
        display: "inline-flex",
        alignItems: "center",
        gap: 0,
      }}
    >
      <ExtensionTooltipLabel
        tooltipKey={tooltipKey}
        style={{ fontSize: 14, color: EXTENSION_MODAL_SECTION_HEADING_COLOR }}
      >
        Allow Codecs
      </ExtensionTooltipLabel>
      {required && <span style={{ color: C.errorRed }}> *</span>}
    </span>
  </div>
  );
};

const EXTENSION_TABLE_CARD_RADIUS = 10;

const extensionCardStyle = {
  background: "#ffffff",
  borderRadius: EXTENSION_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const extensionToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: EXTENSION_TABLE_CARD_RADIUS,
  borderTopRightRadius: EXTENSION_TABLE_CARD_RADIUS,
};

const extensionPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: EXTENSION_TABLE_CARD_RADIUS,
  borderBottomRightRadius: EXTENSION_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const extensionSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const extensionCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const extensionPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const extensionPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const ExtensionPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  style,
}) => (
  <div style={{ ...extensionPaginationStyle, ...style }}>
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
      <span style={extensionPageBadgeStyle}>
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

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";
const EXTENSION_TOOLBAR_SEARCH_HEIGHT = 30;
const EXTENSION_TOOLBAR_SEARCH_WIDTH = 168;
const EXTENSION_SEARCH_ICON_SLOT = 18;
const EXTENSION_SEARCH_BAR_PADDING_FIT = 16;
const EXTENSION_SEARCH_BAR_PADDING_DEFAULT = 20;
const EXTENSION_TOOLBAR_SEARCH_FOCUS_RING = FOCUS_RING_SHADOW;
const EXTENSION_TOOLBAR_SEARCH_INPUT_FONT = {
  fontSize: 12,
  fontFamily: "Inter, sans-serif",
  letterSpacing: "normal",
};

const ExtensionToolbarSearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  width = EXTENSION_TOOLBAR_SEARCH_WIDTH,
  fitPlaceholder = false,
}) => {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const measureRef = useRef(null);
  const [placeholderWidth, setPlaceholderWidth] = useState(null);

  useLayoutEffect(() => {
    if (!fitPlaceholder || !measureRef.current) return;
    measureRef.current.textContent = placeholder;
    setPlaceholderWidth(measureRef.current.offsetWidth);
  }, [fitPlaceholder, placeholder]);

  const resolvedWidth =
    fitPlaceholder && placeholderWidth != null
      ? placeholderWidth + EXTENSION_SEARCH_BAR_PADDING_FIT + EXTENSION_SEARCH_ICON_SLOT
      : width;

  const horizontalPadding = fitPlaceholder
    ? EXTENSION_SEARCH_BAR_PADDING_FIT / 2
    : EXTENSION_SEARCH_BAR_PADDING_DEFAULT / 2;

  const setDefault = () => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.borderColor = OUTLINED_BORDER;
    el.style.boxShadow = "none";
  };

  const setHover = () => {
    const el = wrapRef.current;
    if (!el || document.activeElement === inputRef.current) return;
    el.style.borderColor = OUTLINED_HOVER;
    el.style.boxShadow = "none";
  };

  const setFocus = () => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.borderColor = OUTLINED_FOCUS;
    el.style.boxShadow = EXTENSION_TOOLBAR_SEARCH_FOCUS_RING;
  };

  const handleMouseLeave = () => {
    if (document.activeElement === inputRef.current) setFocus();
    else setDefault();
  };

  return (
    <div
      ref={wrapRef}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        height: EXTENSION_TOOLBAR_SEARCH_HEIGHT,
        boxSizing: "border-box",
        background: "#f8fafc",
        border: `1px solid ${OUTLINED_BORDER}`,
        borderRadius: 10,
        padding: `0 ${horizontalPadding}px`,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        width: resolvedWidth,
        minWidth: resolvedWidth,
        maxWidth: resolvedWidth,
        flexShrink: 0,
        position: "relative",
      }}
      onMouseEnter={setHover}
      onMouseLeave={handleMouseLeave}
    >
      {fitPlaceholder ? (
        <span
          ref={measureRef}
          aria-hidden
          style={{
            position: "absolute",
            visibility: "hidden",
            whiteSpace: "pre",
            pointerEvents: "none",
            ...EXTENSION_TOOLBAR_SEARCH_INPUT_FONT,
          }}
        />
      ) : null}
      <span style={{ fontSize: 12, color: C.mutedText, flexShrink: 0 }}>
        🔍
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onFocus={setFocus}
        onBlur={setDefault}
        placeholder={placeholder}
        style={{
          border: "none",
          background: "transparent",
          outline: "none",
          flex: 1,
          minWidth: 0,
          width: 0,
          padding: 0,
          paddingRight: value ? 14 : 0,
          margin: 0,
          ...EXTENSION_TOOLBAR_SEARCH_INPUT_FONT,
          color: C.valueText,
        }}
      />
      <span
        role="button"
        tabIndex={value ? 0 : -1}
        aria-hidden={!value}
        onClick={() => {
          if (!value) return;
          onChange({ target: { value: "" } });
        }}
        onKeyDown={(e) => {
          if (!value) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange({ target: { value: "" } });
          }
        }}
        style={{
          position: "absolute",
          right: horizontalPadding,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 11,
          color: C.mutedText,
          cursor: value ? "pointer" : "default",
          visibility: value ? "visible" : "hidden",
          lineHeight: 1,
        }}
      >
        ✕
      </span>
    </div>
  );
};

const extensionOutlinedInputRootSx = {
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

const extensionModalTextFieldSx = {
  "& .MuiOutlinedInput-root": extensionOutlinedInputRootSx,
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

const extensionModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...extensionOutlinedInputRootSx,
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

const DestinationAutocomplete = React.memo(function DestinationAutocomplete({
  value,
  onCommit,
  options,
  disabled,
  placeholder,
  sx,
}) {
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  return (
    <Autocomplete
      freeSolo
      size="small"
      disabled={disabled}
      options={options}
      filterOptions={extensionFilterOptions}
      inputValue={inputValue}
      onInputChange={(e, newValue, reason) => {
        if (reason === "input" || reason === "clear") {
          setInputValue(newValue);
        }
      }}
      onBlur={() => onCommit(inputValue)}
      onChange={(e, newValue) => {
        const v = newValue || "";
        setInputValue(v);
        onCommit(v);
      }}
      sx={sx}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          sx={{
            ...extensionModalTextFieldSx,
            "& .MuiOutlinedInput-input": {
              ...(extensionModalTextFieldSx["& .MuiOutlinedInput-input"] || {}),
              fontSize: 13,
            },
            "& .MuiInputBase-input::placeholder": {
              fontSize: 13,
              fontWeight: 300,
              opacity: 1,
            },
          }}
        />
      )}
    />
  );
});

const extensionGatedModalFieldSx = (
  enabled,
  baseSx = extensionModalSelectSx,
  enabledCursor = "pointer",
) => {
  const disabledBg = "#f1f5f9";
  const isTextFieldBase = Boolean(baseSx["& .MuiOutlinedInput-root"]);
  const outlinedRootSx = baseSx["& .MuiOutlinedInput-root"] || {};
  const outlinedInputSx = baseSx["& .MuiOutlinedInput-input"] || {};
  const selectSx = baseSx["& .MuiSelect-select"] || {};

  const disabledOutlineSx = !enabled
    ? {
        "&:hover fieldset": { borderColor: OUTLINED_BORDER },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: OUTLINED_BORDER,
        },
        "&.Mui-focused": { boxShadow: "none" },
      }
    : {};

  if (isTextFieldBase) {
    return {
      ...baseSx,
      backgroundColor: enabled ? "#fff" : disabledBg,
      cursor: enabled ? enabledCursor : "not-allowed",
      ...(!enabled && {
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: OUTLINED_BORDER,
        },
      }),
      "& .MuiOutlinedInput-root": {
        ...outlinedRootSx,
        backgroundColor: enabled ? "#fff" : disabledBg,
        cursor: enabled ? enabledCursor : "not-allowed",
        ...disabledOutlineSx,
      },
      "& .MuiOutlinedInput-input, & .MuiInputBase-input": {
        ...outlinedInputSx,
        backgroundColor: enabled ? "#fff" : disabledBg,
        cursor: enabled ? enabledCursor : "not-allowed",
      },
      "&.Mui-disabled, & .MuiOutlinedInput-root.Mui-disabled": {
        cursor: "not-allowed",
        backgroundColor: disabledBg,
      },
    };
  }

  return {
    ...baseSx,
    backgroundColor: enabled ? "#fff" : disabledBg,
    cursor: enabled ? enabledCursor : "not-allowed",
    ...disabledOutlineSx,
    "& .MuiSelect-select": {
      ...selectSx,
      backgroundColor: enabled ? "#fff" : disabledBg,
      cursor: enabled ? enabledCursor : "not-allowed",
    },
    "&.Mui-disabled": {
      cursor: "not-allowed",
      backgroundColor: disabledBg,
    },
  };
};

const extensionDualListLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#3E5475",
  textAlign: "center",
  marginBottom: 8,
};

const extensionDualListSelectStyle = {
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

const extensionDualListBtnStyle = {
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

const ExtensionDualListBtn = ({ onClick, title, children, reorder = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={{
      ...extensionDualListBtnStyle,
      fontWeight: reorder ? 400 : extensionDualListBtnStyle.fontWeight,
      transition:
        "background-color 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
      userSelect: "none",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#c5cbd3";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "#d9dde3";
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "";
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.backgroundColor = "#b3bac4";
      e.currentTarget.style.transform = "translateY(1px) scale(0.97)";
      e.currentTarget.style.boxShadow = "inset 0 1px 3px rgba(15, 23, 42, 0.18)";
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.backgroundColor = "#c5cbd3";
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "";
    }}
  >
    {children}
  </button>
);

const EXTENSION_MONITOR_DUAL_LIST_LABEL_OFFSET = 28;

// ── CODEC Priority style dual-list (matches FXS Media page) ──
const EXTENSION_CODEC_LIST_BOX_HEIGHT = 188;
const EXTENSION_CODEC_BTN_COL_WIDTH = 40;
const EXTENSION_CODEC_BTN_GAP = 6;
const EXTENSION_CODEC_BTN_HEIGHT = (EXTENSION_CODEC_LIST_BOX_HEIGHT - EXTENSION_CODEC_BTN_GAP * 3) / 4;
const EXTENSION_CODEC_LIST_LABEL_OFFSET = 28;

const getExtensionCodecListBoxStyle = (variant, isEmpty) => ({
  width: "100%",
  minHeight: EXTENSION_CODEC_LIST_BOX_HEIGHT,
  height: EXTENSION_CODEC_LIST_BOX_HEIGHT,
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

const extensionCodecListEmptyStyle = {
  color: C.placeholderText,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "center",
  userSelect: "none",
  padding: "0 16px",
};

const extensionCodecStripStyle = (isSelected) => ({
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

const extensionCodecDualListBtnStyle = {
  width: EXTENSION_CODEC_BTN_COL_WIDTH,
  height: EXTENSION_CODEC_BTN_HEIGHT,
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

const extensionCodecDualListReorderBtnStyle = {
  ...extensionCodecDualListBtnStyle,
  fontSize: 11,
  fontWeight: 500,
};

const extensionCodecDualListReorderDownBtnStyle = {
  ...extensionCodecDualListReorderBtnStyle,
  fontWeight: 400,
};

const ExtensionCodecDualListBtn = ({ onClick, title, children, reorder, down }) => (
  <button
    type="button"
    data-codec-action-btn
    title={title}
    onClick={onClick}
    style={
      down
        ? extensionCodecDualListReorderDownBtnStyle
        : reorder
          ? extensionCodecDualListReorderBtnStyle
          : extensionCodecDualListBtnStyle
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

const extensionCodecBtnColumnStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: EXTENSION_CODEC_BTN_GAP,
  height: EXTENSION_CODEC_LIST_BOX_HEIGHT,
  width: EXTENSION_CODEC_BTN_COL_WIDTH,
};

const ExtensionCodecListBox = ({
  items,
  selectedIds,
  onToggle,
  onDragSelect,
  onClearHighlight,
  emptyText,
  getLabel,
  variant = "available",
}) => {
  const isEmpty = items.length === 0;
  const listRef = useRef(null);
  const isDragSelectingRef = useRef(false);
  const didDragRef = useRef(false);
  const dragAnchorIndexRef = useRef(null);
  const lastClickIndexRef = useRef(null);

  const getItemId = (item) => (typeof item === "string" ? item : item.value);
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
      data-codec-list-variant={variant}
      style={getExtensionCodecListBoxStyle(variant, isEmpty)}
      onMouseDown={handleMouseDown}
      onClick={handleContainerClick}
    >
      {isEmpty ? (
        <div style={extensionCodecListEmptyStyle}>{emptyText}</div>
      ) : (
        items.map((item) => {
          const id = typeof item === "string" ? item : item.value;
          const label = getLabel ? getLabel(id) : item.label || id;
          const isSelected = selectedIds.includes(id);
          return (
            <div
              key={id}
              data-codec-strip-id={id}
              role="option"
              aria-selected={isSelected}
              onClick={(e) => handleClick(id, e)}
              style={extensionCodecStripStyle(isSelected)}
            >
              {label}
            </div>
          );
        })
      )}
    </div>
  );
};

const parseExtensionCodecList = (value) =>
  (value || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = ({ text, bg, color }) => (
  <span
    style={{
      background: bg,
      color,
      padding: "1px 8px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.01em",
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 64,
    }}
  >
    {text}
  </span>
);

const extensionTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

// ── Status style helper ───────────────────────────────────────────────────────
const statusStyle = (s) => {
  const v = String(s || "").toLowerCase();

  if (v === "online") {
    return { color: "#16a34a" };
  }

  if (v === "offline") {
    return { color: "#dc2626" };
  }

  if (v === "expired") {
    return { color: "#f59e0b" };
  }

  if (v === "pending") {
    return { color: C.accent };
  }

  return { color: "#475569" };
};
// ── Constants ─────────────────────────────────────────────────────────────────
const EXTENSION_FOLLOW_ME_TIMEOUT_OPTIONS = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
  100,
];
const EXTENSION_FOLLOW_ME_DESTINATION_TYPES = [
  "Call Queue",
  "CallBacks",
  "Conference Rooms",
  "DISA",
  "Extensions",
  "Fax To Mail",
  "IVR Menus",
  "Ring Groups",
  "Voicemails",
  "Other",
];

const CF_OTHER_FORWARD_RULES = ["busy", "no_answer", "not_registered"];

const normalizeCallForwardMutex = (formState) => {
  if ((formState.cf_always_enabled || "disabled") !== "enabled") {
    return formState;
  }
  const next = { ...formState };
  CF_OTHER_FORWARD_RULES.forEach((rule) => {
    next[`cf_${rule}_enabled`] = "disabled";
  });
  return next;
};

// ─────────────────────────────────────────────────────────────────────────────

const ExtensionsPage = () => {
  const isCompact = useMediaQuery(EXTENSION_COMPACT_MQ);
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EXTENSION_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [activeTab, setActiveTab] = useState("basic");
  const [formMode, setFormMode] = useState("single");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = React.useRef(null);
  const modalScrollRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkForm, setBulkForm] = useState({
    startExtension: "",
    createNumber: "",
    passwordMode: "random",
    fixedPassword: "",
    passwordPrefix: "",
  });
  const [codecAvailableSelected, setCodecAvailableSelected] = useState([]);
  const [codecChosenSelected, setCodecChosenSelected] = useState([]);

  // Pagination
  const itemsPerPage = 50;
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadAccounts();
    }
  }, []);

  useLayoutEffect(() => {
    if (!showModal || !modalScrollRef.current) return;
    modalScrollRef.current.scrollTop = 0;
  }, [showModal, activeTab]);

  // ── Filter rows by search ──────────────────────────────────────────────────
  const filteredAccounts = searchQuery.trim()
    ? accounts.filter((a) =>
        [
          a.extension,
          a.context,
          a.allow_codecs,
          a.status,
          a.user_name,
          a.email,
        ].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        ),
      )
    : accounts;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAccounts.length / itemsPerPage),
  );
  const pagedAccounts = filteredAccounts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const extensionOptions = React.useMemo(
    () =>
      Array.from(new Set(accounts.map((a) => String(a.extension)))).sort(
        (a, b) => (parseInt(a) || 0) - (parseInt(b) || 0),
      ),
    [accounts],
  );

  // ── Select-all logic (mirrors CDR) ────────────────────────────────────────
  const allPageSelected =
    pagedAccounts.length > 0 &&
    pagedAccounts.every((item) => selected.includes(String(item.extension)));

  const somePageSelected =
    pagedAccounts.some((item) => selected.includes(String(item.extension))) &&
    !allPageSelected;

  const handleToggleAll = () => {
    const pageKeys = pagedAccounts.map((item) => String(item.extension));
    if (allPageSelected) {
      setSelected((prev) => prev.filter((key) => !pageKeys.includes(key)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...pageKeys])));
    }
  };

  const handleToggleRow = (extension) => {
    const key = String(extension);
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key],
    );
  };


  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  
  const transformApiToUi = (apiData) => {
    const isEnabled = (value) =>
      value === true ||
      value === 1 ||
      value === "1" ||
      value === "yes" ||
      value === "on";
    const yesNoToToggle = (value) =>
      isEnabled(value) ? "enabled" : "disabled";
    const boolToYesNo = (value) => (isEnabled(value) ? "yes" : "no");
    const normalizeTC = (value) => {
      const n = String(value || "")
        .toLowerCase()
        .trim();
      if (n === "office") return "work_time";
      if (n === "non_office") return "holiday";
      if (["all", "work_time", "holiday", "custom"].includes(n)) return n;
      return "all";
    };

    return [...apiData]
      .sort(
        (a, b) => (parseInt(a.extension) || 0) - (parseInt(b.extension) || 0),
      )
      .map((item, index) => ({
        index: (index + 1).toString(),
        extension: item.extension,
        context: item.context,
        allow_codecs: item.allow_codecs || item.codecs || "",
        password: item.password,
        max_registrations: item.max_registrations ?? "",
        user_name: item.name || item.display_name || "",
        user_password: item.user_password || "",
        email: item.email || "",
        mobile_number: item.mobile_number || item.mobile || "",
        voicemail_enabled: boolToYesNo(item.voicemail_enabled),
        voicemail_password: item.voicemail_password || "",
        voicemail_file: (() => {
          const v = item.voicemail_file;
          if (
            v === "audio" ||
            v === "Audio File Attachment" ||
            v === "audio_file_attachment"
          )
            return "audio_file_attachment";
          if (v === "link" || v === "Download Link" || v === "download_link")
            return "download_link";
          return "audio_file_attachment";
        })(),
        voicemail_keep_local: boolToYesNo(item.voicemail_keep_local ?? true),
        voicemail_voice: item.voicemail_voice || "system_default",
        cf_always_enabled: yesNoToToggle(
          item.cf_always_enabled ?? item.call_forward_always_enabled,
        ),
        cf_always_number:
          item.cf_always_dest || item.call_forward_always_dest || "",
        cf_always_time: normalizeTC(
          item.cf_always_time_condition ||
            item.call_forward_always_time_condition,
        ),
        cf_busy_enabled: yesNoToToggle(
          item.cf_busy_enabled ?? item.call_forward_busy_enabled,
        ),
        cf_busy_number: item.cf_busy_dest || item.call_forward_busy_dest || "",
        cf_busy_time: normalizeTC(
          item.cf_busy_time_condition || item.call_forward_busy_time_condition,
        ),
        cf_no_answer_enabled: yesNoToToggle(
          item.cf_noanswer_enabled ?? item.call_forward_noanswer_enabled,
        ),
        cf_no_answer_number:
          item.cf_noanswer_dest || item.call_forward_noanswer_dest || "",
        cf_no_answer_time: normalizeTC(
          item.cf_noanswer_time_condition ||
            item.call_forward_noanswer_time_condition,
        ),
        cf_not_registered_enabled: yesNoToToggle(
          item.cf_unreg_enabled ?? item.call_forward_unreg_enabled,
        ),
        cf_not_registered_number:
          item.cf_unreg_dest || item.call_forward_unreg_dest || "",
        cf_not_registered_time: normalizeTC(
          item.cf_unreg_time_condition ||
            item.call_forward_unreg_time_condition,
        ),
        dnd_enabled: yesNoToToggle(item.dnd_enabled),
        dnd_time: normalizeTC(item.dnd_time_condition),
        dnd_dest: item.dnd_dest || "",
        dnd_special_numbers: (() => {
          const fromApi =
            (Array.isArray(item.dnd_special_numbers) &&
              item.dnd_special_numbers) ||
            (Array.isArray(item.dnd_special_number) &&
              item.dnd_special_number) ||
            (Array.isArray(item.dnd_allow_numbers) &&
              item.dnd_allow_numbers) ||
            [];
          if (fromApi.length) return fromApi;
          return item.dnd_dest ? [String(item.dnd_dest)] : [];
        })(),
        enable_mobility_extension: boolToYesNo(
          item.mobility_enabled ??
            item.enable_mobility_extension ??
            item.enable_mobility_ext,
        ),
        ring_simultaneously: boolToYesNo(
          item.mobility_ring_simultaneously ?? item.ring_simultaneously,
        ),
        mobility_prefix: item.mobility_prefix || item.prefix || "",
        mobility_timeout:
          Number(item.mobility_timeout ?? item.timeout ?? 30) || 30,
        secretary_service: yesNoToToggle(
          item.secretary_enabled ??
            item.secretary_service_enabled ??
            item.secretary_service,
        ),
        secretary_extension:
          item.secretary_extension ||
          item.secretary_number ||
          item.ss1 ||
          item.ss2 ||
          "",
        follow_me_enabled: yesNoToToggle(item.follow_me_enabled),
        follow_me_time: normalizeTC(item.follow_me_time_condition),
        follow_me_entries: item.follow_me_dest
          ? [
              {
                destinationType: String(item.follow_me_dest),
                timeout: 30,
                confirm: "unconfirm",
              },
            ]
          : [],
        follow_me_timeout_destination: item.follow_me_timeout_destination || "",
        from_domain: item.from_domain || item["Domain name"] || "",
        contact_user: item.contact_user || item["Contact User"] || "",
        outbound_proxy: item.outbound_proxy || item["Outbound Proxy"] || "",
        transport: item.transport || "udp",
        status: item.status || "",
        enable_srtp: boolToYesNo(item.adv_enable_srtp ?? item.enable_srtp),
        sip_bypass_media: (() => {
          const v = item.adv_bypass_media || item.sip_bypass_media || "proxy";
          return v === "bypass" ? "bypass_media" : "proxy_media";
        })(),
        call_timeout: Number(
          item.adv_call_timeout_sec ?? item.call_timeout ?? 30,
        ),
        max_call_duration: Number(
          item.adv_max_call_duration_sec ?? item.max_call_duration ?? 6000,
        ),
        outbound_restriction:
          (item.adv_outbound_restriction ?? item.outbound_restriction)
            ? "enable"
            : "disable",
        admin_call_permission: (() => {
          const v = String(item.adv_call_permission_admin || "international")
            .toLowerCase()
            .replace(/[\s-]/g, "_");
          if (v === "no_call" || v === "none" || v === "no") return "no_call";
          if (v === "internal" || v === "internal_call") return "internal_call";
          if (v === "local" || v === "local_call") return "local_call";
          if (
            v === "long_distance" ||
            v === "long_distance_call" ||
            v === "longdistance"
          )
            return "long_distance_call";
          return "international_call";
        })(),
        call_permission: (() => {
          const v = String(
            item.adv_call_permission_dynamic ||
              item.adv_call_permission ||
              item.call_permission ||
              "international",
          )
            .toLowerCase()
            .replace(/[\s-]/g, "_");
          if (v === "no_call" || v === "none" || v === "no") return "no_call";
          if (v === "internal" || v === "internal_call") return "internal_call";
          if (v === "local" || v === "local_call") return "local_call";
          if (
            v === "long_distance" ||
            v === "long_distance_call" ||
            v === "longdistance"
          )
            return "long_distance_call";
          return "international_call";
        })(),
        extension_trunk:
          (item.adv_extension_trunk ?? item.extension_trunk)
            ? "enable"
            : "disable",
        dynamic_lock_pin:
          Number(
            item.adv_dynamic_lock_pin ?? item.adv_dynamic_lock_mode ?? 0,
          ) === 1
            ? "user_password"
            : "default",
        diversion: boolToYesNo(
          item.adv_send_diversion ??
            item.send_diversion ??
            item.diversion ??
            true,
        ),
        call_prohibition:
          (item.adv_call_prohibition ?? item.call_prohibition)
            ? "enable"
            : "disable",

        rx_volume: Number(item.adv_rx_volume ?? item.rx_volume ?? 0),
        tx_volume: Number(item.adv_tx_volume ?? item.tx_volume ?? 0),
        monitor_allow: item.monitor_allow || "disable",
        monitor_allowed_extensions: Array.isArray(
          item.monitor_allowed_extensions,
        )
          ? item.monitor_allowed_extensions
          : [],
        monitor_mode: item.monitor_mode || "none",
      }));
  };

  const transformUiToApi = (uiData) => {
    const toggleToBool = (value) =>
      value === "enabled" || value === "yes" || value === true;
    const voicemailFileForApi =
      uiData.voicemail_file === "download_link" ? "link" : "audio";

    return {
      extension: uiData.extension,
      context: uiData.context,
      allow_codecs: uiData.allow_codecs,
      password: uiData.password,
      max_registrations: uiData.max_registrations
        ? Number(uiData.max_registrations)
        : undefined,
      name: uiData.user_name || uiData.name || "",
      display_name: uiData.user_name || uiData.name || "",
      user_password: uiData.user_password || "",
      email: uiData.email || "",
      mobile_number: uiData.mobile_number || "",
      mobile: uiData.mobile_number || "",
      voicemail_enabled: uiData.voicemail_enabled || "no",
      voicemail_password: uiData.voicemail_password || "",
      voicemail_file: voicemailFileForApi,
      voicemail_keep_local: uiData.voicemail_keep_local || "no",
      voicemail_voice: uiData.voicemail_voice || "system_default",
      cf_always_enabled: toggleToBool(uiData.cf_always_enabled),
      cf_always_dest: uiData.cf_always_number || "",
      cf_always_time_condition: uiData.cf_always_time || "all",
      cf_busy_enabled: toggleToBool(uiData.cf_busy_enabled),
      cf_busy_dest: uiData.cf_busy_number || "",
      cf_busy_time_condition: uiData.cf_busy_time || "all",
      cf_noanswer_enabled: toggleToBool(uiData.cf_no_answer_enabled),
      cf_noanswer_dest: uiData.cf_no_answer_number || "",
      cf_noanswer_time_condition: uiData.cf_no_answer_time || "all",
      cf_unreg_enabled: toggleToBool(uiData.cf_not_registered_enabled),
      cf_unreg_dest: uiData.cf_not_registered_number || "",
      cf_unreg_time_condition: uiData.cf_not_registered_time || "all",
      follow_me_enabled: toggleToBool(uiData.follow_me_enabled),
      follow_me_dest:
        (Array.isArray(uiData.follow_me_entries) &&
          uiData.follow_me_entries.find((e) => e?.destinationType)
            ?.destinationType) ||
        "",
      follow_me_destination:
        (Array.isArray(uiData.follow_me_entries) &&
          uiData.follow_me_entries.find((e) => e?.destinationType)
            ?.destinationType) ||
        "",
      follow_me_time_condition: uiData.follow_me_time || "all",
      dnd_enabled: toggleToBool(uiData.dnd_enabled),
      dnd_time_condition: uiData.dnd_time || "all",
      dnd_dest:
        uiData.dnd_dest ||
        (Array.isArray(uiData.dnd_special_numbers)
          ? uiData.dnd_special_numbers.find(Boolean)
          : "") ||
        "",
      dnd_special_numbers: Array.isArray(uiData.dnd_special_numbers)
        ? uiData.dnd_special_numbers.filter(Boolean)
        : [],
      dnd_special_number: Array.isArray(uiData.dnd_special_numbers)
        ? uiData.dnd_special_numbers.filter(Boolean)
        : [],
      dnd_allow_numbers: Array.isArray(uiData.dnd_special_numbers)
        ? uiData.dnd_special_numbers.filter(Boolean)
        : [],
      mobility_enabled: toggleToBool(uiData.enable_mobility_extension),
      enable_mobility_extension: uiData.enable_mobility_extension || "no",
      enable_mobility_ext: uiData.enable_mobility_extension || "no",
      mobility_ring_simultaneously: toggleToBool(uiData.ring_simultaneously),
      ring_simultaneously: uiData.ring_simultaneously || "no",
      mobility_prefix: uiData.mobility_prefix || "",
      mobility_timeout: Number(uiData.mobility_timeout || 30),
      monitor_allow: uiData.monitor_allow || "disable",
      monitor_allowed_extensions: Array.isArray(
        uiData.monitor_allowed_extensions,
      )
        ? uiData.monitor_allowed_extensions
        : [],
      monitor_mode: uiData.monitor_mode || "none",
      secretary_enabled: toggleToBool(uiData.secretary_service),
      secretary_service_enabled: toggleToBool(uiData.secretary_service),
      secretary_service: toggleToBool(uiData.secretary_service),
      secretary_extension: uiData.secretary_extension || "",
      secretary_number: uiData.secretary_extension || "",
      transport: uiData.transport || "udp",
      from_domain: uiData.from_domain,
      contact_user: uiData.contact_user,
      outbound_proxy: uiData.outbound_proxy,
      adv_enable_srtp: uiData.enable_srtp === "yes",
      adv_bypass_media:
        uiData.sip_bypass_media === "bypass_media" ? "bypass" : "proxy",
      adv_call_timeout_sec: Number(uiData.call_timeout ?? 30),
      adv_max_call_duration_sec: Number(uiData.max_call_duration ?? 6000),
      adv_outbound_restriction: uiData.outbound_restriction === "enable",
      adv_call_permission_admin: (() => {
        const v = uiData.admin_call_permission || "international_call";
        if (v === "no_call") return "no_call";
        if (v === "internal_call") return "internal";
        if (v === "local_call") return "local";
        if (v === "long_distance_call") return "long_distance";
        return "international";
      })(),
      adv_extension_trunk: uiData.extension_trunk === "enable",
      adv_dynamic_lock_mode:
        uiData.dynamic_lock_pin === "user_password" ? 1 : 0,
      adv_send_diversion: uiData.diversion === "yes",
      adv_call_prohibition: uiData.call_prohibition === "enable",
      adv_rx_volume: Number(uiData.rx_volume ?? 0),
      adv_tx_volume: Number(uiData.tx_volume ?? 0),
    };
  };

  // ── Load accounts ─────────────────────────────────────────────────────────
  const loadAccounts = async () => {
    if (loading.fetch) return;
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await fetchSipAccounts();
      if (response.response && response.message) {
        setAccounts(transformApiToUi(response.message));
      } else {
        showMessage("error", "Failed to load SIP accounts");
      }
    } catch (error) {
      showMessage(
        "error",
        error.message === "Network Error"
          ? "Network error. Please check your connection."
          : error.message || "Failed to load SIP accounts",
      );
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validateExtension = (v) =>
    !v || !v.trim() ? "Extension is required" : null;
  const validateContext = (v) =>
    !v || !v.trim() ? "Context is required" : null;
  const validateAllowCodecs = (v) =>
    !v || !v.trim() ? "Allow Codecs is required" : null;
  const validatePassword = (v) => {
    if (!v || !v.trim()) return "Password is required";
    if (v.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(v))
      return "Password must include at least one uppercase letter";
    if (!/[0-9]/.test(v)) return "Password must include at least one number";
    if (!/[^a-zA-Z0-9]/.test(v))
      return "Password must include at least one special character";
    return null;
  };

  const validateForm = () => {
    const errors = {};
    const e = validateExtension(form.extension);
    if (e) errors.extension = e;
    const p = validatePassword(form.password);
    if (p) errors.password = p;
    const c = validateContext(form.context);
    if (c) errors.context = c;
    const a = validateAllowCodecs(form.allow_codecs);
    if (a) errors.allow_codecs = a;
    return errors;
  };

  const handleChange = (key, value) => {
    setForm((prev) => {
      if (
        CF_OTHER_FORWARD_RULES.some((rule) => key === `cf_${rule}_enabled`) &&
        value === "enabled" &&
        (prev.cf_always_enabled || "disabled") === "enabled"
      ) {
        return prev;
      }

      let next = { ...prev, [key]: value };
      if (key === "cf_always_enabled" && value === "enabled") {
        CF_OTHER_FORWARD_RULES.forEach((rule) => {
          next[`cf_${rule}_enabled`] = "disabled";
        });
      }
      return next;
    });
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    }
    let err = null;
    if (key === "extension") err = validateExtension(value);
    if (key === "password") err = validatePassword(value);
    if (key === "context") err = validateContext(value);
    if (err) setValidationErrors((prev) => ({ ...prev, [key]: err }));
  };

  const selectedCodecList = useMemo(
    () => parseExtensionCodecList(form.allow_codecs),
    [form.allow_codecs],
  );

  const availableCodecList = useMemo(
    () => EXTENSION_CODEC_OPTIONS.filter((c) => !selectedCodecList.includes(c.value)),
    [selectedCodecList],
  );

  const getCodecLabel = (value) =>
    EXTENSION_CODEC_OPTIONS.find((c) => c.value === value)?.label || value;

  const toggleCodecAvailableSelect = (id) =>
    setCodecAvailableSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleCodecChosenSelect = (id) =>
    setCodecChosenSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const selectCodecAvailable = (ids) => setCodecAvailableSelected(ids);

  const selectCodecChosen = (ids) => setCodecChosenSelected(ids);

  const clearCodecHighlightSelection = () => {
    setCodecAvailableSelected([]);
    setCodecChosenSelected([]);
  };

  useEffect(() => {
    if (!showModal) return undefined;

    const handleOutsideClear = (e) => {
      if (!codecAvailableSelected.length && !codecChosenSelected.length) return;
      if (e.target.closest("[data-codec-strip-id]")) return;
      if (e.target.closest("[data-codec-action-btn]")) return;
      if (e.target.closest("[data-codec-list-box]")) return;
      clearCodecHighlightSelection();
    };

    document.addEventListener("mousedown", handleOutsideClear);
    return () => document.removeEventListener("mousedown", handleOutsideClear);
  }, [showModal, codecAvailableSelected, codecChosenSelected]);

  const updateCodecList = (newList) => {
    const str = newList.join(",");
    if (validationErrors.allow_codecs) {
      setValidationErrors((p) => {
        const n = { ...p };
        delete n.allow_codecs;
        return n;
      });
    }
    const ae = validateAllowCodecs(str);
    if (ae) setValidationErrors((p) => ({ ...p, allow_codecs: ae }));
    setForm((prev) => ({ ...prev, allow_codecs: str }));
  };

  const addSelectedCodecs = () => {
    if (!codecAvailableSelected.length) return;
    updateCodecList([
      ...selectedCodecList,
      ...codecAvailableSelected.filter((id) => !selectedCodecList.includes(id)),
    ]);
    setCodecAvailableSelected([]);
  };

  const addAllCodecs = () => {
    updateCodecList(EXTENSION_CODEC_OPTIONS.map((c) => c.value));
    setCodecAvailableSelected([]);
  };

  const removeSelectedCodecs = () => {
    if (!codecChosenSelected.length) return;
    updateCodecList(
      selectedCodecList.filter((id) => !codecChosenSelected.includes(id)),
    );
    setCodecChosenSelected([]);
  };

  const removeAllCodecs = () => {
    updateCodecList([]);
    setCodecChosenSelected([]);
  };

  const moveCodecToBottom = () => {
    if (!codecChosenSelected.length) return;
    updateCodecList(
      (() => {
        const next = [...selectedCodecList];
        const moving = codecChosenSelected.filter((id) => next.includes(id));
        const rest = next.filter((id) => !moving.includes(id));
        return [...rest, ...moving];
      })(),
    );
  };

  const moveCodecUp = () => {
    if (!codecChosenSelected.length) return;
    updateCodecList(
      (() => {
        const next = [...selectedCodecList];
        codecChosenSelected.forEach((id) => {
          const idx = next.indexOf(id);
          if (idx > 0) {
            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
          }
        });
        return next;
      })(),
    );
  };

  const moveCodecDown = () => {
    if (!codecChosenSelected.length) return;
    updateCodecList(
      (() => {
        const next = [...selectedCodecList];
        [...codecChosenSelected].reverse().forEach((id) => {
          const idx = next.indexOf(id);
          if (idx >= 0 && idx < next.length - 1) {
            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
          }
        });
        return next;
      })(),
    );
  };

  const moveCodecToTop = () => {
    if (!codecChosenSelected.length) return;
    updateCodecList(
      (() => {
        const next = [...selectedCodecList];
        const moving = codecChosenSelected.filter((id) => next.includes(id));
        const rest = next.filter((id) => !moving.includes(id));
        return [...moving, ...rest];
      })(),
    );
  };

  // ── Follow Me helpers ─────────────────────────────────────────────────────
  const handleFollowMeEntryChange = (index, field, value) => {
    setForm((prev) => {
      const current = Array.isArray(prev.follow_me_entries)
        ? [...prev.follow_me_entries]
        : [];
      current[index] = {
        ...(current[index] || {
          destinationType: "",
          timeout: 30,
          confirm: "unconfirm",
        }),
        [field]: value,
      };
      return { ...prev, follow_me_entries: current };
    });
  };
  const handleAddFollowMeEntry = () => {
    setForm((prev) => ({
      ...prev,
      follow_me_entries: [
        ...(Array.isArray(prev.follow_me_entries)
          ? prev.follow_me_entries
          : []),
        { destinationType: "", timeout: 30, confirm: "unconfirm" },
      ],
    }));
  };

  // ── DND helpers ───────────────────────────────────────────────────────────
  const handleDndNumberChange = (index, value) => {
    setForm((prev) => {
      const cur = Array.isArray(prev.dnd_special_numbers)
        ? [...prev.dnd_special_numbers]
        : [];
      cur[index] = value;
      return {
        ...prev,
        dnd_special_numbers: cur,
        ...(index === 0 ? { dnd_dest: value } : {}),
      };
    });
  };
  const handleAddDndNumber = () => {
    setForm((prev) => ({
      ...prev,
      dnd_special_numbers: [
        ...(Array.isArray(prev.dnd_special_numbers)
          ? prev.dnd_special_numbers
          : []),
        "",
      ],
    }));
  };

  // ── Modal open/close ──────────────────────────────────────────────────────
  const handleOpenModal = (row = null, idx = null) => {
    setCodecAvailableSelected([]);
    setCodecChosenSelected([]);
    setForm(
      normalizeCallForwardMutex(
        row
          ? { ...row, allow_codecs: row.allow_codecs || "ulaw,alaw" }
          : { ...EXTENSION_INITIAL_FORM },
      ),
    );
    setEditIndex(row ? idx : null);
    setFormMode("single");
    setActiveTab("basic");
    setShowModal(true);
  };

  const openBulkModal = () => {
    setCodecAvailableSelected([]);
    setCodecChosenSelected([]);
    setForm({ ...EXTENSION_INITIAL_FORM });
    setEditIndex(null);
    setBulkForm({
      startExtension: "",
      createNumber: "",
      passwordMode: "random",
      fixedPassword: "",
      passwordPrefix: "",
    });
    setFormMode("bulk");
    setActiveTab("basic");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setShowPassword(false);
    setValidationErrors({});
    setCodecAvailableSelected([]);
    setCodecChosenSelected([]);
    setFormMode("single");
    setActiveTab("basic");
  };

  // ── Save (single) ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      showMessage("error", Object.values(errors)[0]);
      setValidationErrors(errors);
      return;
    }
    try {
      const { fetchSipIpTrunkAccounts } =
        await import("../../../api/apiService");
      const ipTrunkRes = await fetchSipIpTrunkAccounts();
      if (ipTrunkRes?.response && Array.isArray(ipTrunkRes.message)) {
        if (
          ipTrunkRes.message.some(
            (item) => String(item.extension) === String(form.extension),
          )
        ) {
          showMessage(
            "error",
            "This extension already exists in SIP To SIP Account. Choose a different extension.",
          );
          return;
        }
      }
    } catch (e) {
      console.warn(
        "Extension duplication check (SIP To SIP) failed:",
        e?.message,
      );
    }
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const apiData = transformUiToApi(form);
      if (!apiData.name || !String(apiData.name).trim()) {
        apiData.name = apiData.extension;
        apiData.display_name = apiData.extension;
      }
      if (
        editIndex === null &&
        (!apiData.user_password || !String(apiData.user_password).trim())
      ) {
        apiData.user_password = "pass" + apiData.extension;
      }
      const response =
        editIndex !== null
          ? await updateSipAccount(apiData)
          : await createSipAccount(apiData);
      if (response.response) {
        showMessage(
          "success",
          response.message ||
            (editIndex !== null
              ? "Account updated successfully"
              : "Account created successfully"),
        );
        await new Promise((r) => setTimeout(r, 300));
        await loadAccounts();
        setShowModal(false);
        setEditIndex(null);
      } else if (response.limit_exceeded) {
        showMessage(
          "error",
          `Maximum extension limit (${response.limit}) reached. Please upgrade your license.`,
        );
      } else {
        showMessage(
          "error",
          response.message ||
            (editIndex !== null
              ? "Failed to update account"
              : "Failed to create account"),
        );
      }
    } catch (error) {
      showMessage(
        "error",
        error.message === "Network Error"
          ? "Network error. Please check your connection."
          : error.message || "Failed to save account",
      );
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // ── Bulk save ─────────────────────────────────────────────────────────────
  const handleBulkSave = async () => {
    const start = parseInt(bulkForm.startExtension, 10);
    const count = parseInt(bulkForm.createNumber, 10);
    if (Number.isNaN(start) || start <= 0) {
      showMessage("error", "Start Extension must be a positive number");
      return;
    }
    if (Number.isNaN(count) || count <= 0) {
      showMessage("error", "Create Number must be a positive number");
      return;
    }
    if (bulkForm.passwordMode === "fixed") {
      if (!bulkForm.fixedPassword.trim()) {
        showMessage("error", "Please enter Fixed Registration Password");
        return;
      }
      const pe = validatePassword(bulkForm.fixedPassword);
      if (pe) {
        showMessage("error", pe);
        return;
      }
    }
    if (bulkForm.passwordMode === "prefix" && !bulkForm.passwordPrefix.trim()) {
      showMessage("error", "Please enter Prefix for Registration Password");
      return;
    }
    const defaultContext = form.context || accounts[0]?.context || "sip1";
    const defaultCodecs =
      form.allow_codecs || accounts[0]?.allow_codecs || "ulaw,alaw";
    const singleApiData = transformUiToApi({
      ...form,
      extension: String(start || 0),
      context: defaultContext,
      allow_codecs: defaultCodecs,
      password: "",
    });
    const {
      extension: _ext,
      password: _pwd,
      name: _name,
      ...commonSettings
    } = singleApiData;
    const existingExts = new Set(accounts.map((a) => String(a.extension)));
    const desiredExts = [];
    let candidate = start;
    while (desiredExts.length < count) {
      if (!existingExts.has(String(candidate)))
        desiredExts.push(String(candidate));
      candidate += 1;
      if (candidate - start > count + 200) break;
    }
    if (desiredExts.length === 0) {
      showMessage(
        "error",
        "No new extensions to create. All requested numbers already exist.",
      );
      return;
    }
    const nums = desiredExts.map(Number).sort((a, b) => a - b);
    const ranges = [];
    let rs = nums[0],
      prev = nums[0],
      rc = 1;
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] === prev + 1) {
        rc++;
      } else {
        ranges.push({ start: rs, count: rc });
        rs = nums[i];
        rc = 1;
      }
      prev = nums[i];
    }
    ranges.push({ start: rs, count: rc });
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      for (const r of ranges) {
        const payload = {
          start_extension: String(r.start),
          create_number: r.count,
          reg_password_mode: bulkForm.passwordMode,
          reg_password_value:
            bulkForm.passwordMode === "fixed"
              ? bulkForm.fixedPassword
              : bulkForm.passwordMode === "prefix"
                ? bulkForm.passwordPrefix
                : undefined,
          ...commonSettings,
        };
        const response = await bulkCreateSipAccounts(payload);
        if (!response || !response.response) {
          if (response?.limit_exceeded) {
            throw new Error(
              `Maximum extension limit (${response.limit}) reached. Please upgrade your license.`,
            );
          }
          throw new Error(response?.message || "Bulk add failed");
        }
      }
      showMessage(
        "success",
        `Created ${desiredExts.length} SIP account(s) starting from ${start}.`,
      );
      await loadAccounts();
      handleCloseModal();
    } catch (err) {
      showMessage("error", err.message || "Bulk add failed");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // ── Delete / ClearAll ─────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selected.length) {
      showMessage("error", "Please select accounts to delete");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} account(s)?`,
      )
    )
      return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const results = await Promise.allSettled(
        selected.map((extension) => {
          const account = accounts.find(
            (item) => String(item.extension) === String(extension),
          );
          if (!account) {
            return Promise.reject(new Error(`Extension ${extension} not found`));
          }
          return deleteSipAccount(account.extension, account.context);
        }),
      );
      const ok = results.filter(
        (r) => r.status === "fulfilled" && r.value.response,
      ).length;
      const bad = results.length - ok;
      if (ok) showMessage("success", `${ok} account(s) deleted successfully`);
      if (bad) showMessage("error", `Failed to delete ${bad} account(s)`);
      setSelected([]);
      await loadAccounts();
    } catch (error) {
      showMessage("error", error.message || "Failed to delete accounts");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      showMessage("error", "Please select a CSV file to import");
      return;
    }
    setImportLoading(true);
    try {
      const csv = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(importFile);
      });
      const res = await importSipAccountsCsv({
        csv,
        mode: "skip",
        dryRun: false,
      });
      if (res?.response) {
        showMessage(
          "success",
          `Import complete — Created: ${res.created_count ?? 0}, Skipped: ${(res.skipped_validation_rows ?? 0) + (res.skipped_existing ?? 0)}`,
        );
        await loadAccounts();
        setShowImportModal(false);
        setImportFile(null);
      } else {
        showMessage("error", res?.error || "Import failed");
      }
    } catch (e) {
      showMessage("error", e?.message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { blob, filename } = await exportSipAccountsCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      showMessage("error", e?.message || "Export failed");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  const codecTransferActions = [
    {
      onClick: addSelectedCodecs,
      title: "Move selected to Selected",
      label: ">",
    },
    { onClick: addAllCodecs, title: "Move all to Selected", label: ">>" },
    {
      onClick: removeSelectedCodecs,
      title: "Move selected to Available",
      label: "<",
    },
    {
      onClick: removeAllCodecs,
      title: "Move all to Available",
      label: "<<",
    },
  ];

  const codecReorderActions = [
    { onClick: moveCodecToTop, title: "Move to top", label: "^^" },
    { onClick: moveCodecUp, title: "Move up", label: "^" },
    { onClick: moveCodecDown, title: "Move down", label: "v", down: true },
    { onClick: moveCodecToBottom, title: "Move to bottom", label: "vv", down: true },
  ];

  return (
    <div style={{ ...extensionPageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
      <div style={extensionPageInnerStyle}>
        {/* ── Error / success banner ── */}
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={extensionFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <ExtensionBreadcrumb section="Extensions" current="Extensions" />

        <div style={extensionCardStyle}>
          <div
            style={{
              ...extensionToolbarStyle,
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
                <span style={extensionSelectedBadgeStyle}>
                  {selected.length} selected
                </span>
              )}
            </div>

            {/* Right: search + buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <ExtensionToolbarSearchBar
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                  setSelected([]);
                }}
                placeholder="Search extension, context, status..."
                fitPlaceholder
              />

              <Btn
                onClick={handleDelete}
                disabled={loading.delete || !selected.length}
                variant="cancel"
                style={extensionCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>

              <Btn
                onClick={() => {
                  setShowImportModal(true);
                  setImportFile(null);
                }}
                disabled={loading.fetch}
                variant="cancel"
                style={extensionCancelBtnStyle}
              >
                ⬇ Import
              </Btn>

              <Btn
                onClick={handleExport}
                disabled={loading.fetch}
                variant="cancel"
                style={extensionCancelBtnStyle}
              >
                ⬆ Export
              </Btn>
              <Btn
                onClick={openBulkModal}
                disabled={loading.fetch || loading.save}
                variant="cancel"
                style={extensionCancelBtnStyle}
              >
                + Bulk Add
              </Btn>

              <Btn
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
                variant="primary"
                style={extensionPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {isInitialLoad ? (
            <ExtensionTableListLoading />
          ) : accounts.length === 0 && !searchQuery.trim() ? (
            <ExtensionTableListEmptyState
              message="No extensions found."
              onAddNew={() => handleOpenModal()}
            />
          ) : (
            <>
              <div
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  flex: 1,
                }}
              >
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
                      {/* Select-all checkbox */}
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
                          sx={extensionTableCheckboxSx}
                        />
                      </TH>
                      <TH style={{ width: 36 }}>ID</TH>
                      <TH>Extension</TH>
                      <TH>Context</TH>
                      <TH>Codecs</TH>
                      <TH>Password</TH>
                      <TH>Status</TH>
                      <TH style={{ width: 70, borderRight: "none" }}>Modify</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={extensionNoResultsRowStyle}>
                          {`No results for "${searchQuery}"`}
                        </td>
                      </tr>
                    ) : (
                      pagedAccounts.map((item, idx) => {
                        const realIdx = (page - 1) * itemsPerPage + idx;
                        const isSelected = selected.includes(String(item.extension));
                        const rowBg = getExtensionRowBg(isSelected, idx);
                        const ss = statusStyle(item.status);
                        const isLastRow = idx === pagedAccounts.length - 1;
                        const lastRowCellStyle = isLastRow
                          ? { borderBottom: "none" }
                          : {};
                        const dataCellStyle = { fontWeight: 400 };

                        return (
                          <tr
                            key={realIdx}
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
                              style={getExtensionTdStyle(rowBg, lastRowCellStyle, {
                                width: 36,
                                borderLeft: "none",
                              })}
                            >
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={() => handleToggleRow(item.extension)}
                                disabled={loading.delete}
                                sx={extensionTableCheckboxSx}
                              />
                            </td>
                            <td
                              style={getExtensionTdStyle(
                                rowBg,
                                lastRowCellStyle,
                                dataCellStyle,
                              )}
                            >
                              {realIdx + 1}
                            </td>
                            <td
                              style={getExtensionTdStyle(
                                rowBg,
                                lastRowCellStyle,
                                dataCellStyle,
                              )}
                            >
                              {item.extension || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>
                            <td
                              style={getExtensionTdStyle(
                                rowBg,
                                lastRowCellStyle,
                                dataCellStyle,
                              )}
                            >
                              {item.context || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>
                            <td
                              style={getExtensionTdStyle(
                                rowBg,
                                lastRowCellStyle,
                                dataCellStyle,
                              )}
                            >
                              {item.allow_codecs || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>
                            <td
                              style={getExtensionTdStyle(
                                rowBg,
                                lastRowCellStyle,
                                dataCellStyle,
                              )}
                            >
                              {"•".repeat(
                                Math.min(item.password?.length || 0, 10),
                              )}
                            </td>
                            <td style={getExtensionTdStyle(rowBg, lastRowCellStyle)}>
                              {item.status ? (
                                <Pill
                                  text={item.status}
                                  bg={ss.bg}
                                  color={ss.color}
                                />
                              ) : (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>
                            <td
                              style={getExtensionTdStyle(rowBg, lastRowCellStyle, {
                                borderRight: "none",
                              })}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <ExtensionEditIcon
                                  disabled={loading.delete}
                                  onClick={() => handleOpenModal(item, realIdx)}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filteredAccounts.length > 0 && (
                <ExtensionPagination
                  page={page}
                  totalPages={totalPages}
                  recordCount={pagedAccounts.length}
                  recordLabel="extension"
                  onPageChange={(p) => setPage(p)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          IMPORT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={showImportModal}
        onClose={() => {
          if (!importLoading) {
            setShowImportModal(false);
            setImportFile(null);
          }
        }}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{
          sx: {
            width: 420,
            maxWidth: "96vw",
            margin: 24,
            maxHeight: "calc(100vh - 80px - 48px)",
            display: "flex",
            flexDirection: "column",
            p: 0,
            borderRadius: "8px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            py: 1.5,
          }}
        >
          Import Extensions
        </DialogTitle>
        <DialogContent
          style={{ backgroundColor: C.pageBg, padding: "20px 24px 12px" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              paddingTop: 4,
            }}
          >
            <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
              Select a CSV or JSON file containing extension data to import.
            </p>
            <div
              onClick={() => importFileRef.current?.click()}
              style={{
                border: "2px dashed #9ca3af",
                borderRadius: 8,
                padding: "24px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.15s",
                background: "#fff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.accent;
                e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#9ca3af";
                e.currentTarget.style.background = "#fff";
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: importFile ? "#16a34a" : "#64748b",
                  fontWeight: importFile ? 600 : 400,
                }}
              >
                {importFile
                  ? importFile.name
                  : "Click to choose file (CSV / JSON)"}
              </span>
              <input
                ref={importFileRef}
                type="file"
                accept=".csv,.json"
                style={{ display: "none" }}
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleImportSubmit}
            disabled={importLoading || !importFile}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {importLoading && (
              <CircularProgress size={11} style={{ color: "#fff" }} />
            )}
            Import
          </Btn>
          <Btn
            onClick={() => {
              setShowImportModal(false);
              setImportFile(null);
            }}
            disabled={importLoading}
            variant="cancel"
            style={extensionModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════
          ADD / EDIT / BULK MODAL  (same tab structure, CDR-styled shell)
        ══════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={showModal}
        onClose={() => {
          if (loading.save) return;
          handleCloseModal();
        }}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{
          sx: {
            width: 760,
            maxWidth: "96vw",
            margin: 24,
            maxHeight: "calc(100vh - 80px - 48px)",
            display: "flex",
            flexDirection: "column",
            p: 0,
            borderRadius: "8px",
            overflow: "hidden",
          },
        }}
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
          {formMode === "bulk"
            ? "Bulk Add Extensions"
            : editIndex !== null
              ? "Edit Extension"
              : "Add Extension"}
        </DialogTitle>
        <ExtensionModalTabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "basic", label: "BASIC" },
            { id: "features", label: "FEATURES" },
            { id: "advanced", label: "ADVANCED" },
          ]}
        />

        <DialogContent
          ref={modalScrollRef}
          style={{ padding: "24px", backgroundColor: "#ffffff" }}
          sx={{
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Tab content container matching PcmPstnPage styling */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
            }}
          >
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
                <SectionCard title="General" isFirst>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                    }}
                  >
                    {formMode === "single" ? (
                      <FieldRow
                        label="Extension:"
                        tooltipKey="extension"
                        error={validationErrors.extension}
                      >
                        <TextField
                          type="text"
                          value={form.extension || ""}
                          onChange={(e) =>
                            handleChange("extension", e.target.value)
                          }
                          size="small"
                          fullWidth
                          variant="outlined"
                          error={!!validationErrors.extension}
                          placeholder="e.g. 1001"
                          disabled={editIndex !== null}
                          sx={extensionModalTextFieldSx}
                        />
                        {validationErrors.extension && (
                          <ErrMsg>{validationErrors.extension}</ErrMsg>
                        )}
                      </FieldRow>
                    ) : (
                      <>
                        <FieldRow label="Start Extension:">
                          <TextField
                            type="number"
                            value={bulkForm.startExtension}
                            onChange={(e) =>
                              setBulkForm((p) => ({
                                ...p,
                                startExtension: e.target.value,
                              }))
                            }
                            size="small"
                            fullWidth
                            variant="outlined"
                            sx={extensionModalTextFieldSx}
                          />
                        </FieldRow>
                        <FieldRow label="Create Number:">
                          <TextField
                            type="number"
                            value={bulkForm.createNumber}
                            onChange={(e) =>
                              setBulkForm((p) => ({
                                ...p,
                                createNumber: e.target.value,
                              }))
                            }
                            size="small"
                            fullWidth
                            variant="outlined"
                            sx={extensionModalTextFieldSx}
                          />
                        </FieldRow>
                        <FieldRow label="Reg Password:" tooltipKey="password">
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}
                          >
                            <FormControl size="small" fullWidth>
                              <MuiSelect
                                value={bulkForm.passwordMode}
                                onChange={(e) =>
                                  setBulkForm((p) => ({
                                    ...p,
                                    passwordMode: e.target.value,
                                  }))
                                }
                                sx={extensionModalSelectSx}
                              >
                                <MenuItem value="random">Random</MenuItem>
                                <MenuItem value="fixed">Fixed</MenuItem>
                                <MenuItem value="prefix">
                                  Prefix + Extension
                                </MenuItem>
                              </MuiSelect>
                            </FormControl>
                            {bulkForm.passwordMode === "fixed" && (
                              <TextField
                                type="text"
                                value={bulkForm.fixedPassword}
                                onChange={(e) =>
                                  setBulkForm((p) => ({
                                    ...p,
                                    fixedPassword: e.target.value,
                                  }))
                                }
                                size="small"
                                fullWidth
                                variant="outlined"
                                placeholder="Fixed password"
                                sx={extensionModalTextFieldSx}
                              />
                            )}
                            {bulkForm.passwordMode === "prefix" && (
                              <TextField
                                type="text"
                                value={bulkForm.passwordPrefix}
                                onChange={(e) =>
                                  setBulkForm((p) => ({
                                    ...p,
                                    passwordPrefix: e.target.value,
                                  }))
                                }
                                size="small"
                                fullWidth
                                variant="outlined"
                                placeholder="e.g. pw_"
                                sx={extensionModalTextFieldSx}
                              />
                            )}
                          </div>
                        </FieldRow>
                      </>
                    )}

                    <FieldRow label="Context:" tooltipKey="context">
                      <FormControl
                        fullWidth
                        size="small"
                        error={!!validationErrors.context}
                      >
                        <MuiSelect
                          value={form.context || ""}
                          displayEmpty
                          onChange={(e) =>
                            handleChange("context", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="" disabled>
                            <em>Select Context</em>
                          </MenuItem>
                          {Array.from(
                            { length: 10 },
                            (_, i) => `sip${i + 1}`,
                          ).map((ctx, i) => (
                            <MenuItem key={ctx} value={ctx}>
                              Sip {i + 1}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                      {validationErrors.context && (
                        <ErrMsg>{validationErrors.context}</ErrMsg>
                      )}
                    </FieldRow>

                    {formMode === "single" && (
                      <FieldRow label="Password:" tooltipKey="password">
                        <TextField
                          type={showPassword ? "text" : "password"}
                          value={form.password || ""}
                          onChange={(e) =>
                            handleChange("password", e.target.value)
                          }
                          size="small"
                          fullWidth
                          variant="outlined"
                          error={!!validationErrors.password}
                          placeholder="Enter password"
                          sx={extensionModalTextFieldSx}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
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
                        {validationErrors.password && (
                          <ErrMsg>{validationErrors.password}</ErrMsg>
                        )}
                      </FieldRow>
                    )}

                    <FieldRow
                      label="Max Registrations:"
                      tooltipKey="max_registrations"
                    >
                      <TextField
                        type="number"
                        value={form.max_registrations || ""}
                        onChange={(e) =>
                          handleChange("max_registrations", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>

                    <FieldRow label="Transport:" tooltipKey="transport">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.transport || "udp"}
                          onChange={(e) =>
                            handleChange("transport", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="udp">udp</MenuItem>
                          <MenuItem value="tcp">tcp</MenuItem>
                          <MenuItem value="udp-ipv6">udp-ipv6</MenuItem>
                          <MenuItem value="tcp-ipv6">tcp-ipv6</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>

                  <div style={{ width: "100%" }}>
                    <AllowCodecsSectionHeading
                      tooltipKey="allow_codecs"
                      required
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `1fr ${EXTENSION_CODEC_BTN_COL_WIDTH}px 1fr ${EXTENSION_CODEC_BTN_COL_WIDTH}px`,
                        gap: 10,
                        width: "100%",
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <div style={extensionCodecColumnLabelStyle}>Available</div>
                        <ExtensionCodecListBox
                          variant="available"
                          items={availableCodecList}
                          selectedIds={codecAvailableSelected}
                          onToggle={toggleCodecAvailableSelect}
                          onDragSelect={selectCodecAvailable}
                          onClearHighlight={clearCodecHighlightSelection}
                          emptyText="Available codecs"
                          getLabel={(id) => getCodecLabel(id)}
                        />
                      </div>
                      <div>
                        <div
                          style={{ height: EXTENSION_CODEC_LIST_LABEL_OFFSET }}
                          aria-hidden="true"
                        />
                        <div style={extensionCodecBtnColumnStyle}>
                          {codecTransferActions.map(
                            ({ onClick, title, label }) => (
                              <ExtensionCodecDualListBtn
                                key={title}
                                onClick={onClick}
                                title={title}
                              >
                                {label}
                              </ExtensionCodecDualListBtn>
                            ),
                          )}
                        </div>
                      </div>
                      <div>
                        <div style={extensionCodecColumnLabelStyle}>Selected</div>
                        <ExtensionCodecListBox
                          variant="selected"
                          items={selectedCodecList}
                          selectedIds={codecChosenSelected}
                          onToggle={toggleCodecChosenSelect}
                          onDragSelect={selectCodecChosen}
                          onClearHighlight={clearCodecHighlightSelection}
                          emptyText="No selected codecs"
                          getLabel={(id) => getCodecLabel(id)}
                        />
                      </div>
                      <div>
                        <div
                          style={{ height: EXTENSION_CODEC_LIST_LABEL_OFFSET }}
                          aria-hidden="true"
                        />
                        <div style={extensionCodecBtnColumnStyle}>
                          {codecReorderActions.map(
                            ({ onClick, title, label, down }) => (
                              <ExtensionCodecDualListBtn
                                key={title}
                                reorder
                                down={down}
                                title={title}
                                onClick={onClick}
                              >
                                {label}
                              </ExtensionCodecDualListBtn>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                    {validationErrors.allow_codecs && (
                      <ErrMsg>{validationErrors.allow_codecs}</ErrMsg>
                    )}
                  </div>
                </SectionCard>

                <SectionCard title="User Info">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow label="Name:" tooltipKey="name">
                      <TextField
                        type="text"
                        value={form.user_name || ""}
                        onChange={(e) =>
                          handleChange("user_name", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="User Password:" tooltipKey="user_password">
                      <TextField
                        type="password"
                        value={form.user_password || ""}
                        onChange={(e) =>
                          handleChange("user_password", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="Email:" tooltipKey="email">
                      <TextField
                        type="email"
                        value={form.email || ""}
                        onChange={(e) => handleChange("email", e.target.value)}
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="Mobile Number:" tooltipKey="mobile_number">
                      <TextField
                        type="text"
                        value={form.mobile_number || ""}
                        onChange={(e) =>
                          handleChange("mobile_number", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        placeholder="+91XXXXXXXXXX"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* ── FEATURES TAB ── */}
            {activeTab === "features" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 8,
                }}
              >
                {/* Voicemail */}
                <SectionCard title="Voicemail" isFirst>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow
                      label="Voicemail Enabled:"
                      tooltipKey="voicemail_enabled"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.voicemail_enabled || "no"}
                          onChange={(e) =>
                            handleChange("voicemail_enabled", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="Voicemail Keep Local:"
                      tooltipKey="voicemail_keep_local"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.voicemail_keep_local || "yes"}
                          onChange={(e) =>
                            handleChange("voicemail_keep_local", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="Voicemail File:"
                      tooltipKey="voicemail_file"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.voicemail_file || "audio_file_attachment"}
                          onChange={(e) =>
                            handleChange("voicemail_file", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="audio_file_attachment">
                            Audio File Attachment
                          </MenuItem>
                          <MenuItem value="download_link">
                            Download Link
                          </MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="Voicemail Password:"
                      tooltipKey="voicemail_password"
                    >
                      <TextField
                        type="text"
                        value={form.voicemail_password || ""}
                        onChange={(e) =>
                          handleChange("voicemail_password", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="Select Voice:" tooltipKey="select_voice">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.voicemail_voice || "system_default"}
                          onChange={(e) =>
                            handleChange("voicemail_voice", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="system_default">
                            System Default
                          </MenuItem>
                          <MenuItem value="blank">Blank</MenuItem>
                          <MenuItem value="busy">Busy</MenuItem>
                          <MenuItem value="welcome">Welcome</MenuItem>
                          <MenuItem value="none">None</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                {/* Call Forwarding */}
                <SectionCard title="Call Forwarding">
                  {(() => {
                    const cfAlwaysEnabled =
                      (form.cf_always_enabled || "disabled") === "enabled";

                    return [
                      { key: "always", label: "Always", tooltipKey: "cf_always" },
                      { key: "busy", label: "On Busy", tooltipKey: "cf_busy" },
                      {
                        key: "no_answer",
                        label: "No Answer",
                        tooltipKey: "cf_no_answer",
                      },
                      {
                        key: "not_registered",
                        label: "Not Registered",
                        tooltipKey: "cf_not_registered",
                      },
                    ].map((rule) => {
                      const cfOtherLocked =
                        cfAlwaysEnabled && rule.key !== "always";
                      const cfRuleEnabled =
                        !cfOtherLocked &&
                        (form[`cf_${rule.key}_enabled`] || "disabled") ===
                          "enabled";
                      const cfFieldSx = extensionGatedModalFieldSx(cfRuleEnabled);

                      return (
                      <div
                        key={rule.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                          paddingBottom: 6,
                        }}
                      >
                        <ExtensionTooltipLabel
                          tooltipKey={rule.tooltipKey}
                          style={{ minWidth: 100 }}
                        >
                          {rule.label}
                        </ExtensionTooltipLabel>
                        <RadioGroup
                          row
                          value={
                            cfOtherLocked
                              ? "disabled"
                              : form[`cf_${rule.key}_enabled`] || "disabled"
                          }
                          onChange={(e) =>
                            handleChange(
                              `cf_${rule.key}_enabled`,
                              e.target.value,
                            )
                          }
                          sx={{ flexWrap: "nowrap" }}
                        >
                          <FormControlLabel
                            value="disabled"
                            control={<Radio size="small" />}
                            label="Disabled"
                            disabled={cfOtherLocked}
                            sx={{
                              mr: 1.5,
                              whiteSpace: "nowrap",
                              "& .MuiFormControlLabel-label": { fontSize: 12 },
                            }}
                          />
                          <FormControlLabel
                            value="enabled"
                            control={<Radio size="small" />}
                            label="Enabled"
                            disabled={cfOtherLocked}
                            sx={{
                              mr: 0,
                              whiteSpace: "nowrap",
                              "& .MuiFormControlLabel-label": { fontSize: 12 },
                            }}
                          />
                        </RadioGroup>
                        <DestinationAutocomplete
                          disabled={!cfRuleEnabled}
                          options={extensionOptions}
                          value={form[`cf_${rule.key}_number`] || ""}
                          onCommit={(val) =>
                            handleChange(`cf_${rule.key}_number`, val)
                          }
                          placeholder="Destination Number"
                          sx={{
                            minWidth: 180,
                            width: 150,
                            maxWidth: 150,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: "#374151",
                          }}
                        >
                          Time Condition
                        </span>
                        <FormControl
                          size="small"
                          disabled={!cfRuleEnabled}
                          sx={{ minWidth: 90 }}
                        >
                          <MuiSelect
                            value={form[`cf_${rule.key}_time`] || "all"}
                            disabled={!cfRuleEnabled}
                            onChange={(e) =>
                              handleChange(
                                `cf_${rule.key}_time`,
                                e.target.value,
                              )
                            }
                            sx={cfFieldSx}
                          >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="work_time">Work Time</MenuItem>
                            <MenuItem value="holiday">Holiday</MenuItem>
                            <MenuItem value="custom">Custom</MenuItem>
                          </MuiSelect>
                        </FormControl>
                      </div>
                      );
                    });
                  })()}
                </SectionCard>

                {/* Follow Me */}
                <SectionCard title="Follow Me">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      paddingBottom: 6,
                    }}
                  >
                    <ExtensionTooltipLabel
                      tooltipKey="follow_me"
                      style={{ minWidth: 140 }}
                    >
                      Follow Me
                    </ExtensionTooltipLabel>
                    <RadioGroup
                      row
                      value={form.follow_me_enabled || "disabled"}
                      onChange={(e) =>
                        handleChange("follow_me_enabled", e.target.value)
                      }
                      sx={{ flexWrap: "nowrap" }}
                    >
                      <FormControlLabel
                        value="disabled"
                        control={<Radio size="small" />}
                        label="Disabled"
                        sx={{
                          mr: 1.5,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                      <FormControlLabel
                        value="enabled"
                        control={<Radio size="small" />}
                        label="Enabled"
                        sx={{
                          mr: 0,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                    </RadioGroup>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#374151",
                      }}
                    >
                      Time Condition
                    </span>
                    <FormControl
                      size="small"
                      disabled={form.follow_me_enabled !== "enabled"}
                      sx={{ minWidth: 90 }}
                    >
                      <MuiSelect
                        value={form.follow_me_time || "all"}
                        disabled={form.follow_me_enabled !== "enabled"}
                        onChange={(e) =>
                          handleChange("follow_me_time", e.target.value)
                        }
                        sx={extensionGatedModalFieldSx(
                          form.follow_me_enabled === "enabled",
                        )}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="work_time">Work Time</MenuItem>
                        <MenuItem value="holiday">Holiday</MenuItem>
                        <MenuItem value="custom">Custom</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </div>
                  {form.follow_me_enabled === "enabled" && (
                    <div
                      style={{
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 6,
                        padding: 8,
                        background: "#fafbfc",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.labelText,
                          }}
                        >
                          Destinations
                        </span>
                        <button
                          onClick={handleAddFollowMeEntry}
                          style={{
                            width: 22,
                            height: 22,
                            border: `1px solid ${C.cardBorder}`,
                            borderRadius: 4,
                            background: "#f1f5f9",
                            cursor: "pointer",
                            fontSize: 14,
                            lineHeight: 1,
                            color: C.labelText,
                          }}
                        >
                          +
                        </button>
                      </div>
                      {(form.follow_me_entries?.length
                        ? form.follow_me_entries
                        : [
                            {
                              destinationType: "",
                              timeout: 30,
                              confirm: "unconfirm",
                            },
                          ]
                      ).map((entry, idx) => (
                        <div
                          key={idx}
                          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                        >
                          <DestinationAutocomplete
                            options={extensionOptions}
                            value={entry?.destinationType || ""}
                            onCommit={(val) =>
                              handleFollowMeEntryChange(
                                idx,
                                "destinationType",
                                val,
                              )
                            }
                            placeholder="Destination Number"
                            sx={{ minWidth: 180 }}
                          />
                          <FormControl size="small" sx={{ minWidth: 80 }}>
                            <MuiSelect
                              value={entry?.timeout ?? 30}
                              onChange={(e) =>
                                handleFollowMeEntryChange(
                                  idx,
                                  "timeout",
                                  Number(e.target.value),
                                )
                              }
                              sx={extensionModalSelectSx}
                            >
                              {EXTENSION_FOLLOW_ME_TIMEOUT_OPTIONS.map((v) => (
                                <MenuItem key={v} value={v}>
                                  {v}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                          <FormControl size="small" sx={{ minWidth: 110 }}>
                            <MuiSelect
                              value={entry?.confirm || "unconfirm"}
                              onChange={(e) =>
                                handleFollowMeEntryChange(
                                  idx,
                                  "confirm",
                                  e.target.value,
                                )
                              }
                              sx={extensionModalSelectSx}
                            >
                              <MenuItem value="confirm">Confirm</MenuItem>
                              <MenuItem value="unconfirm">UnConfirm</MenuItem>
                            </MuiSelect>
                          </FormControl>
                        </div>
                      ))}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: C.labelText,
                            minWidth: 140,
                          }}
                        >
                          Timeout Destination
                        </span>
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                          <MuiSelect
                            value={form.follow_me_timeout_destination || ""}
                            displayEmpty
                            onChange={(e) =>
                              handleChange(
                                "follow_me_timeout_destination",
                                e.target.value,
                              )
                            }
                            sx={extensionModalSelectSx}
                          >
                            <MenuItem value="">
                              <em>Select destination</em>
                            </MenuItem>
                            {EXTENSION_FOLLOW_ME_DESTINATION_TYPES.map((l) => (
                              <MenuItem key={l} value={l}>
                                {l}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* Do Not Disturb */}
                <SectionCard title="Do Not Disturb">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      paddingBottom: 6,
                    }}
                  >
                    <ExtensionTooltipLabel
                      tooltipKey="dnd"
                      style={{ minWidth: 140 }}
                    >
                      Do Not Disturb
                    </ExtensionTooltipLabel>
                    <RadioGroup
                      row
                      value={form.dnd_enabled || "disabled"}
                      onChange={(e) =>
                        handleChange("dnd_enabled", e.target.value)
                      }
                      sx={{ flexWrap: "nowrap" }}
                    >
                      <FormControlLabel
                        value="disabled"
                        control={<Radio size="small" />}
                        label="Disabled"
                        sx={{
                          mr: 1.5,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                      <FormControlLabel
                        value="enabled"
                        control={<Radio size="small" />}
                        label="Enabled"
                        sx={{
                          mr: 0,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                    </RadioGroup>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#374151",
                      }}
                    >
                      Time Condition
                    </span>
                    <FormControl
                      size="small"
                      disabled={form.dnd_enabled !== "enabled"}
                      sx={{ minWidth: 90 }}
                    >
                      <MuiSelect
                        value={form.dnd_time || "all"}
                        disabled={form.dnd_enabled !== "enabled"}
                        onChange={(e) =>
                          handleChange("dnd_time", e.target.value)
                        }
                        sx={extensionGatedModalFieldSx(form.dnd_enabled === "enabled")}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="work_time">Work Time</MenuItem>
                        <MenuItem value="holiday">Holiday</MenuItem>
                        <MenuItem value="custom">Custom</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </div>
                  {form.dnd_enabled === "enabled" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.labelText,
                          }}
                        >
                          Special Numbers
                        </span>
                        <button
                          onClick={handleAddDndNumber}
                          style={{
                            width: 22,
                            height: 22,
                            border: `1px solid ${C.cardBorder}`,
                            borderRadius: 4,
                            background: "#f1f5f9",
                            cursor: "pointer",
                            fontSize: 14,
                            lineHeight: 1,
                            color: C.labelText,
                          }}
                        >
                          +
                        </button>
                      </div>
                      {(form.dnd_special_numbers?.length
                        ? form.dnd_special_numbers
                        : [""]
                      ).map((val, idx) => (
                        <DestinationAutocomplete
                          key={idx}
                          options={extensionOptions}
                          value={val || ""}
                          onCommit={(v) => handleDndNumberChange(idx, v)}
                          placeholder="Destination Number"
                          sx={{ maxWidth: 180 }}
                        />
                      ))}
                    </div>
                  )}
                </SectionCard>

                {/* Mobility Extension */}
                <SectionCard title="Mobility Extension">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                      paddingTop: 4,
                    }}
                  >
                    <FieldRow
                      label="Enable Mobility Extension:"
                      labelWidth={200}
                      tooltipKey="enable_mobility_extension"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.enable_mobility_extension || "no"}
                          onChange={(e) =>
                            handleChange(
                              "enable_mobility_extension",
                              e.target.value,
                            )
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Prefix" tooltipKey="prefix">
                      <TextField
                        type="text"
                        value={form.mobility_prefix || ""}
                        disabled={form.enable_mobility_extension !== "yes"}
                        onChange={(e) =>
                          handleChange("mobility_prefix", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionGatedModalFieldSx(
                          form.enable_mobility_extension === "yes",
                          extensionModalTextFieldSx,
                          "text",
                        )}
                      />
                    </FieldRow>
                    <FieldRow
                      label="Ring Simultaneously:"
                      labelWidth={200}
                      tooltipKey="ring_simultaneously"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.ring_simultaneously || "no"}
                          onChange={(e) =>
                            handleChange("ring_simultaneously", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Timeout" tooltipKey="mobility_timeout">
                      <FormControl
                        fullWidth
                        size="small"
                        disabled={form.ring_simultaneously !== "yes"}
                      >
                        <MuiSelect
                          value={Number(form.mobility_timeout || 30)}
                          disabled={form.ring_simultaneously !== "yes"}
                          onChange={(e) =>
                            handleChange(
                              "mobility_timeout",
                              Number(e.target.value),
                            )
                          }
                          sx={extensionGatedModalFieldSx(
                            form.ring_simultaneously === "yes",
                          )}
                        >
                          {EXTENSION_FOLLOW_ME_TIMEOUT_OPTIONS.map((v) => (
                            <MenuItem key={v} value={v}>
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                {/* Secretary Service */}
                <SectionCard title="Secretary Service">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      paddingBottom: 6,
                    }}
                  >
                    <ExtensionTooltipLabel
                      tooltipKey="secretary_service"
                      style={{ minWidth: 140 }}
                    >
                      Secretary Service
                    </ExtensionTooltipLabel>
                    <RadioGroup
                      row
                      value={form.secretary_service || "disabled"}
                      onChange={(e) =>
                        handleChange("secretary_service", e.target.value)
                      }
                      sx={{ flexWrap: "nowrap" }}
                    >
                      <FormControlLabel
                        value="disabled"
                        control={<Radio size="small" />}
                        label="Disabled"
                        sx={{
                          mr: 1.5,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                      <FormControlLabel
                        value="enabled"
                        control={<Radio size="small" />}
                        label="Enabled"
                        sx={{
                          mr: 0,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                    </RadioGroup>
                  </div>
                  {form.secretary_service === "enabled" && (
                    <FieldRow label="Secretary Number:">
                      <FormControl sx={{ maxWidth: 260 }} size="small">
                        <MuiSelect
                          value={form.secretary_extension || ""}
                          displayEmpty
                          onChange={(e) =>
                            handleChange("secretary_extension", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="">
                            <em>Select extension</em>
                          </MenuItem>
                          {["ss1", "ss2", ...extensionOptions].map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  )}
                </SectionCard>

                {/* Monitor */}
                <SectionCard title="Monitor">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow
                      label="Allow Being Monitored:"
                      tooltipKey="monitor_allow"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.monitor_allow || "disable"}
                          onChange={(e) =>
                            handleChange("monitor_allow", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="disable">Disable</MenuItem>
                          <MenuItem value="enable_all">Enable All</MenuItem>
                          <MenuItem value="extensions">Extensions</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Monitor Mode:" tooltipKey="monitor_mode">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.monitor_mode || "none"}
                          onChange={(e) =>
                            handleChange("monitor_mode", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="none">None</MenuItem>
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="listen">Listen</MenuItem>
                          <MenuItem value="whisper">Whisper</MenuItem>
                          <MenuItem value="barge_in">Barge-in</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                  {form.monitor_allow === "extensions" && (
                    <ExtensionMonitorDualListbox
                      available={extensionOptions.filter(
                        (e) =>
                          !(form.monitor_allowed_extensions || []).includes(e),
                      )}
                      selected={form.monitor_allowed_extensions || []}
                      onChange={(newSelected) =>
                        handleChange("monitor_allowed_extensions", newSelected)
                      }
                    />
                  )}
                </SectionCard>
              </div>
            )}

            {/* ── ADVANCED TAB ── */}
            {activeTab === "advanced" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 8,
                }}
              >
                {/* RTP Settings */}
                <SectionCard title="RTP Settings" isFirst>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow label="Enable SRTP:" tooltipKey="enable_srtp">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.enable_srtp || "no"}
                          onChange={(e) =>
                            handleChange("enable_srtp", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="no">No</MenuItem>
                          <MenuItem value="yes">Yes</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="SIP Bypass Media:"
                      tooltipKey="sip_bypass_media"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.sip_bypass_media || "proxy_media"}
                          onChange={(e) =>
                            handleChange("sip_bypass_media", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="proxy_media">Proxy Media</MenuItem>
                          <MenuItem value="bypass_media">Bypass Media</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                {/* Call Settings */}
                <SectionCard title="Call Settings">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow
                      label="Call Timeout (s):"
                      tooltipKey="call_timeout"
                    >
                      <TextField
                        type="number"
                        value={form.call_timeout ?? 30}
                        onChange={(e) =>
                          handleChange("call_timeout", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow
                      label="Max Call Duration (s):"
                      tooltipKey="max_call_duration"
                    >
                      <TextField
                        type="number"
                        value={form.max_call_duration ?? 6000}
                        onChange={(e) =>
                          handleChange("max_call_duration", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow
                      label="Outbound Restriction:"
                      tooltipKey="outbound_restriction"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.outbound_restriction || "disable"}
                          onChange={(e) =>
                            handleChange("outbound_restriction", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="disable">Disable</MenuItem>
                          <MenuItem value="enable">Enable</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="Max Call Permission:"
                      tooltipKey="max_call_permission"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={
                            form.admin_call_permission || "international_call"
                          }
                          onChange={(e) =>
                            handleChange(
                              "admin_call_permission",
                              e.target.value,
                            )
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="no_call">No Call</MenuItem>
                          <MenuItem value="internal_call">
                            Internal Call
                          </MenuItem>
                          <MenuItem value="local_call">Local Call</MenuItem>
                          <MenuItem value="long_distance_call">
                            Long-Distance Call
                          </MenuItem>
                          <MenuItem value="international_call">
                            International Call
                          </MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="Extension Trunk:"
                      tooltipKey="extension_trunk"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.extension_trunk || "disable"}
                          onChange={(e) =>
                            handleChange("extension_trunk", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="disable">Disable</MenuItem>
                          <MenuItem value="enable">Enable</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="Used Call Permission:"
                      tooltipKey="used_call_permission"
                    >
                      <div
                        style={{
                          fontSize: 13,
                          color: "#475569",
                          padding: "6px 8px",
                          background: "#f1f5f9",
                          borderRadius: 4,
                          border: `1px solid ${C.cardBorder}`,
                        }}
                      >
                        {{
                          no_call: "No Call",
                          internal_call: "Internal Call",
                          local_call: "Local Call",
                          long_distance_call: "Long-Distance Call",
                        }[form.call_permission] || "International Call"}
                      </div>
                    </FieldRow>
                    <FieldRow
                      label="Dynamic Lock Pin:"
                      tooltipKey="dynamic_lock_pin"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.dynamic_lock_pin || "default"}
                          onChange={(e) =>
                            handleChange("dynamic_lock_pin", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="default">Default</MenuItem>
                          {form.dynamic_lock_pin === "user_password" && (
                            <MenuItem value="user_password">
                              User Password
                            </MenuItem>
                          )}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Diversion:" tooltipKey="diversion">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.diversion || "yes"}
                          onChange={(e) =>
                            handleChange("diversion", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="Call Prohibition:"
                      tooltipKey="call_prohibition"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.call_prohibition || "disable"}
                          onChange={(e) =>
                            handleChange("call_prohibition", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="disable">Disable</MenuItem>
                          <MenuItem value="enable">Enable</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                {/* Other Settings */}
                <SectionCard title="Other Settings">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow label="RX Volume:" tooltipKey="rx_volume">
                      <TextField
                        type="number"
                        value={form.rx_volume ?? 0}
                        onChange={(e) =>
                          handleChange("rx_volume", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="TX Volume:" tooltipKey="tx_volume">
                      <TextField
                        type="number"
                        value={form.tx_volume ?? 0}
                        onChange={(e) =>
                          handleChange("tx_volume", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={formMode === "single" ? handleSave : handleBulkSave}
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
            style={extensionModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// ── Small helper components (inline, no extra file needed) ────────────────────
const ExtensionMonitorDualListbox = ({ available, selected, onChange }) => {
  const isCompact = useMediaQuery(EXTENSION_COMPACT_MQ);
  const [leftSel, setLeftSel] = React.useState([]);
  const [rightSel, setRightSel] = React.useState([]);

  const addSelected = () => {
    if (!leftSel.length) return;
    onChange([...selected, ...leftSel.filter((e) => !selected.includes(e))]);
    setLeftSel([]);
  };
  const addAll = () => {
    onChange([...selected, ...available]);
    setLeftSel([]);
  };
  const removeSelected = () => {
    if (!rightSel.length) return;
    onChange(selected.filter((e) => !rightSel.includes(e)));
    setRightSel([]);
  };
  const removeAll = () => {
    onChange([]);
    setRightSel([]);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 48px 1fr",
        ...(isCompact ? { gridTemplateColumns: "1fr", gap: 12 } : {}),
        gap: 12,
        alignItems: "start",
        marginTop: 12,
      }}
    >
      <div>
        <div style={extensionDualListLabelStyle}>Available</div>
        <select
          multiple
          value={leftSel}
          onChange={(e) =>
            setLeftSel(Array.from(e.target.selectedOptions, (o) => o.value))
          }
          style={extensionDualListSelectStyle}
        >
          {available.length === 0 ? (
            <option disabled>No extensions available</option>
          ) : (
            available.map((ext) => (
              <option key={ext} value={ext}>
                {ext}
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
          height: extensionDualListSelectStyle.height,
          paddingTop: EXTENSION_MONITOR_DUAL_LIST_LABEL_OFFSET,
          boxSizing: "content-box",
        }}
      >
        <ExtensionDualListBtn onClick={addSelected}>&gt;</ExtensionDualListBtn>
        <ExtensionDualListBtn onClick={addAll}>&gt;&gt;</ExtensionDualListBtn>
        <ExtensionDualListBtn onClick={removeSelected}>&lt;</ExtensionDualListBtn>
        <ExtensionDualListBtn onClick={removeAll}>&lt;&lt;</ExtensionDualListBtn>
      </div>

      <div>
        <div style={extensionDualListLabelStyle}>Selected</div>
        <select
          multiple
          value={rightSel}
          onChange={(e) =>
            setRightSel(Array.from(e.target.selectedOptions, (o) => o.value))
          }
          style={extensionDualListSelectStyle}
        >
          {selected.length === 0 ? (
            <option disabled>No selected extensions</option>
          ) : (
            selected.map((ext) => (
              <option key={ext} value={ext}>
                {ext}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};

const EXTENSION_FIELD_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

const formatExtensionTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const ExtensionTooltipLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = tooltipKey ? EXTENSION_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
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

  if (!tooltip) return labelNode;

  return (
    <Tooltip
      title={formatExtensionTooltipTitle(tooltip)}
      {...EXTENSION_FIELD_TOOLTIP_PROPS}
    >
      {labelNode}
    </Tooltip>
  );
};

const FieldRow = ({
  label,
  children,
  wide = false,
  labelWidth = 130,
  tooltipKey,
}) => {
  const tooltip = tooltipKey ? EXTENSION_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelStyle = {
    fontSize: 13,
    color: C.labelText,
    fontWeight: 600,
    whiteSpace: "nowrap",
    textAlign: "left",
    width: labelWidth,
    flexShrink: 0,
    paddingTop: wide ? 4 : 0,
    cursor: tooltip ? "help" : undefined,
  };

  const labelNode = <label style={labelStyle}>{label}</label>;

  return (
    <div
      style={{
        display: "flex",
        alignItems: wide ? "flex-start" : "center",
        gap: 12,
        width: "100%",
      }}
    >
      {tooltip ? (
        <Tooltip
          title={formatExtensionTooltipTitle(tooltip)}
          {...EXTENSION_FIELD_TOOLTIP_PROPS}
        >
          {labelNode}
        </Tooltip>
      ) : (
        labelNode
      )}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const ErrMsg = ({ children }) => (
  <div style={{ color: "#dc2626", fontSize: 11, marginTop: 2 }}>{children}</div>
);

const SectionCard = ({ title, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <ExtensionModalSectionHeading title={title} isFirst={isFirst} />
    <div>{children}</div>
  </div>
);

export default ExtensionsPage;
