import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
  CircularProgress,
  Checkbox,
  InputAdornment,
  IconButton,
  FormControl,
  Select as MuiSelect,
  MenuItem,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  SIP_TO_SIP_ACCOUNT_CODEC_OPTIONS,
  SIP_TO_SIP_ACCOUNT_FIELDS,
  SIP_TO_SIP_ACCOUNT_TABLE_COLUMNS,
  SIP_TO_SIP_ACCOUNT_INITIAL_FORM,
  SIP_TO_SIP_ACCOUNT_FORM_LAYOUT,
  SIP_TO_SIP_ACCOUNT_FIELD_TOOLTIPS,
  SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_ROOT,
  SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_SECTION,
  SIP_TO_SIP_ACCOUNT_PAGE_TITLE,
  SIP_TO_SIP_ACCOUNT_BTN_INVERSE,
  SIP_TO_SIP_ACCOUNT_BTN_DELETE,
  SIP_TO_SIP_ACCOUNT_BTN_CLEAR_ALL,
  SIP_TO_SIP_ACCOUNT_BTN_ADD_NEW,
  SIP_TO_SIP_ACCOUNT_BTN_PREV,
  SIP_TO_SIP_ACCOUNT_BTN_NEXT,
  SIP_TO_SIP_ACCOUNT_BTN_SAVE,
  SIP_TO_SIP_ACCOUNT_BTN_SAVING,
  SIP_TO_SIP_ACCOUNT_BTN_CLOSE,
  SIP_TO_SIP_ACCOUNT_MODAL_ADD_TITLE,
  SIP_TO_SIP_ACCOUNT_MODAL_EDIT_TITLE,
  SIP_TO_SIP_ACCOUNT_SECTION_GENERAL,
  SIP_TO_SIP_ACCOUNT_LABEL_ALLOW_CODECS,
  SIP_TO_SIP_ACCOUNT_COL_MODIFY,
  SIP_TO_SIP_ACCOUNT_EMPTY_MESSAGE,
  SIP_TO_SIP_ACCOUNT_RECORD_LABEL,
  SIP_TO_SIP_ACCOUNT_SELECTED_SUFFIX,
  SIP_TO_SIP_ACCOUNT_EDIT_TITLE_ACCESS,
  SIP_TO_SIP_ACCOUNT_CODEC_EMPTY_AVAILABLE,
  SIP_TO_SIP_ACCOUNT_CODEC_EMPTY_SELECTED,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_PASSWORD,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTEXT,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTACT,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_EXTENSION,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_DOMAIN,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTACT_USER,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_OUTBOUND_PROXY,
  SIP_TO_SIP_ACCOUNT_CONTACT_PREFIX,
  SIP_TO_SIP_ACCOUNT_ERR_EXTENSION_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_PASSWORD_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_CONTEXT_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_ALLOW_CODECS_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_CONTACT_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_CONTACT_FORMAT,
  SIP_TO_SIP_ACCOUNT_ERR_DOMAIN_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_CONTACT_USER_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_OUTBOUND_PROXY_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_DUPLICATE_EXTENSION,
  SIP_TO_SIP_ACCOUNT_ERR_LOAD_FAILED,
  SIP_TO_SIP_ACCOUNT_ERR_SAVE_FAILED,
  SIP_TO_SIP_ACCOUNT_ERR_DELETE_FAILED,
  SIP_TO_SIP_ACCOUNT_ERR_CLEAR_ALL_FAILED,
  SIP_TO_SIP_ACCOUNT_MSG_NO_ACCOUNTS_TO_CLEAR,
  SIP_TO_SIP_ACCOUNT_CONFIRM_DELETE,
  SIP_TO_SIP_ACCOUNT_CONFIRM_CLEAR_ALL,
  SIP_TO_SIP_ACCOUNT_ALERT_DELETE_BLOCKED,
  SIP_TO_SIP_ACCOUNT_ALERT_CLEAR_BLOCKED,
} from "../../../constants/SipToSipAccountConstants";
import {
  fetchSipAccounts,
  fetchSipIpTrunkAccounts,
  createSipIpTrunkAccount,
  updateSipIpTrunkAccount,
  deleteSipIpTrunkAccount,
  listGroups,
} from "../../../api/apiService";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { ExtensionCodecDualList as SipToSipCodecDualList } from "../../../components/common";
// ── Local page UI (inlined from e1PriSharedUi)
// ── Page-local field label tooltip UI (not shared) ──
const FIELD_LABEL_COLOR = "#3E5475";

const SIP_TO_SIP_ACCOUNT_COMPACT_MQ = "(max-width: 768px)";

const SIP_TO_SIP_ACCOUNT_TOOLTIP_PROPS = {
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
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
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

const SipToSipAccountFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...SIP_TO_SIP_ACCOUNT_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
  placeholderText: "#9aa3b2",
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
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
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
      variant === "primary"
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


const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const sipToSipOutlinedInputRootSx = {
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

const sipToSipModalTextFieldSx = {
  "& .MuiOutlinedInput-root": sipToSipOutlinedInputRootSx,
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

const sipToSipModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...sipToSipOutlinedInputRootSx,
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

const sipToSipPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const sipToSipInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const sipToSipFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const sipToSipTableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "auto",
  minWidth: 900,
};

const sipToSipEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const getSipToSipRowBg = (isSelected, idx) =>
  isSelected ? "#eff6ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

const getSipToSipTdStyle = (rowBg, lastRowCellStyle, extra = {}) => ({
  ...tdStyle,
  background: rowBg,
  ...lastRowCellStyle,
  ...extra,
});

const sipToSipModalTitleStyle = {
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

const sipToSipModalActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const SIP_TO_SIP_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const sipToSipDialogPaperSx = {
  mx: "auto",
  my: 0,
  maxHeight: `calc(100vh - ${SIP_TO_SIP_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - 48px)`,
  display: "flex",
  flexDirection: "column",
  width: 760,
  maxWidth: "96vw",
  p: 0,
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const SipToSipBreadcrumb = ({ style }) => (
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
    <span>{SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {SIP_TO_SIP_ACCOUNT_PAGE_TITLE}
    </span>
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

const SIP_TO_SIP_TABLE_CARD_RADIUS = 10;

const sipToSipCardStyle = {
  background: "#ffffff",
  borderRadius: SIP_TO_SIP_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const sipToSipToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: SIP_TO_SIP_TABLE_CARD_RADIUS,
  borderTopRightRadius: SIP_TO_SIP_TABLE_CARD_RADIUS,
};

const sipToSipPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: SIP_TO_SIP_TABLE_CARD_RADIUS,
  borderBottomRightRadius: SIP_TO_SIP_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const sipToSipSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const sipToSipCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const sipToSipPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const sipToSipPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const SipToSipPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = SIP_TO_SIP_ACCOUNT_RECORD_LABEL,
  style,
}) => (
  <div style={{ ...sipToSipPaginationStyle, ...style }}>
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
        {SIP_TO_SIP_ACCOUNT_BTN_PREV}
      </Btn>
      <span style={sipToSipPageBadgeStyle}>
        Page {page} of {totalPages}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
      >
        {SIP_TO_SIP_ACCOUNT_BTN_NEXT}
      </Btn>
    </div>
  </div>
);

const sipToSipTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const SIP_TO_SIP_MODAL_SECTION_BG = "#f8fafc";
const SIP_TO_SIP_MODAL_SECTION_HEADING_COLOR = "#30415A";

const SipToSipModalSectionHeading = ({ title, isFirst = false }) => {
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
        left: 0,
        background: SIP_TO_SIP_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: SIP_TO_SIP_MODAL_SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
  );
};

const SipToSipAllowCodecsSectionHeading = ({ tooltipKey, required = false }) => (
  <div
    style={{ margin: "16px 0 24px 0", position: "relative", width: "100%" }}
  >
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: SIP_TO_SIP_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: SIP_TO_SIP_MODAL_SECTION_HEADING_COLOR,
        display: "inline-flex",
        alignItems: "center",
        gap: 0,
      }}
    >
      <SipToSipAccountFieldLabel
        tooltipKey={tooltipKey}
        tooltips={SIP_TO_SIP_ACCOUNT_FIELD_TOOLTIPS}
        style={{
          fontSize: 14,
          color: SIP_TO_SIP_MODAL_SECTION_HEADING_COLOR,
        }}
      >
        {SIP_TO_SIP_ACCOUNT_LABEL_ALLOW_CODECS}
      </SipToSipAccountFieldLabel>
      {required && <span style={{ color: C.errorRed }}> *</span>}
    </span>
  </div>
);

const SipToSipSectionCard = ({ title, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <SipToSipModalSectionHeading title={title} isFirst={isFirst} />
    <div>{children}</div>
  </div>
);

const SipToSipErrMsg = ({ children }) => (
  <div style={{ color: "#dc2626", fontSize: 11, marginTop: 2 }}>{children}</div>
);

const SipToSipFieldRow = ({
  label,
  children,
  wide = false,
  labelWidth = 130,
  tooltipKey,
}) => {
  const tooltip = tooltipKey ? SIP_TO_SIP_ACCOUNT_FIELD_TOOLTIPS[tooltipKey] || "" : "";
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
          title={formatFieldTooltipTitle(tooltip)}
          {...SIP_TO_SIP_ACCOUNT_TOOLTIP_PROPS}
        >
          {labelNode}
        </Tooltip>
      ) : (
        labelNode
      )}
      <div style={{ flex: 1, minWidth: 0, width: "100%" }}>{children}</div>
    </div>
  );
};

const sipToSipModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const parseCodecList = (value) => {
  if (!value) return [];
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value)
      .filter(([, enabled]) => !!enabled)
      .map(([codec]) => codec);
  }
  return String(value)
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
};

const normalizeAllowCodecs = (value) => parseCodecList(value).join(",");

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

const sipToSipModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const SipToSipAccountPage = () => {
  const isCompact = useMediaQuery(SIP_TO_SIP_ACCOUNT_COMPACT_MQ);
  const [accounts, setAccounts] = useState([]);
  const [pjsipExtensions, setPjsipExtensions] = useState(new Set());
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const modalScrollRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [form, setForm] = useState(SIP_TO_SIP_ACCOUNT_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasInitialLoadRef = useRef(false);

  const showMessageFn = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadData();
    }
  }, []);

  const selectedCodecList = useMemo(
    () => parseCodecList(form.allow_codecs),
    [form.allow_codecs],
  );

  const allCodecOptions = useMemo(
    () => SIP_TO_SIP_ACCOUNT_CODEC_OPTIONS,
    [],
  );

  const getCodecLabel = (value) =>
    SIP_TO_SIP_ACCOUNT_CODEC_OPTIONS.find((c) => c.value === value)?.label ||
    value;

  useEffect(() => {
    if (!showModal || !modalScrollRef.current) return;
    modalScrollRef.current.scrollTop = 0;
  }, [showModal]);

  const updateCodecList = (newList) => {
    const newCodecsString = newList.join(",");

    if (validationErrors.allow_codecs) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.allow_codecs;
        return newErrors;
      });
    }

    const codecError = validateAllowCodecs(newCodecsString);
    if (codecError) {
      setValidationErrors((prev) => ({ ...prev, allow_codecs: codecError }));
    }

    setForm((prev) => ({ ...prev, allow_codecs: newCodecsString }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const transformList = (list) => {
    const sorted = [...list].sort(
      (a, b) => (parseInt(a.extension) || 0) - (parseInt(b.extension) || 0),
    );
    return sorted.map((it, i) => ({
      index: (i + 1).toString(),
      extension: it.extension,
      context: it.context,
      allow_codecs: normalizeAllowCodecs(it.codecs || it.allow_codecs),
      password: it.password,
      contact: it.contact,
      from_domain: it.from_domain || it["Domain name"] || "",
      contact_user: it.contact_user || it["Contact User"] || "",
      outbound_proxy: it.outbound_proxy || it["Outbound Proxy"] || "",
      status: it.status || "",
    }));
  };

  const transformUiToApi = (uiData) => ({
    extension: uiData.extension,
    context: uiData.context,
    allow_codecs: uiData.allow_codecs,
    password: uiData.password,
    contact:
      uiData.contact && String(uiData.contact).trim().startsWith("sip:")
        ? uiData.contact
        : `sip:${String(uiData.contact || "").trim()}`,
    from_domain: uiData.from_domain,
    contact_user: uiData.contact_user,
    outbound_proxy: uiData.outbound_proxy,
  });

  const loadData = async () => {
    if (loading.fetch) return;
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const [resIpTrunk, resPjsip] = await Promise.allSettled([
        fetchSipIpTrunkAccounts(),
        fetchSipAccounts(),
      ]);
      if (
        resIpTrunk.status === "fulfilled" &&
        resIpTrunk.value?.response &&
        Array.isArray(resIpTrunk.value.message)
      ) {
        setAccounts(transformList(resIpTrunk.value.message));
      } else {
        setAccounts([]);
      }
      if (
        resPjsip.status === "fulfilled" &&
        resPjsip.value?.response &&
        Array.isArray(resPjsip.value.message)
      ) {
        const extSet = new Set(
          resPjsip.value.message.map((r) => String(r.extension)),
        );
        setPjsipExtensions(extSet);
      } else {
        setPjsipExtensions(new Set());
      }
    } catch (e) {
      showMessageFn("error", e.message || SIP_TO_SIP_ACCOUNT_ERR_LOAD_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      setForm({
        ...SIP_TO_SIP_ACCOUNT_INITIAL_FORM,
        ...row,
        allow_codecs: normalizeAllowCodecs(row.allow_codecs) || "ulaw,alaw",
      });
      setEditIndex(idx);
    } else {
      setForm(SIP_TO_SIP_ACCOUNT_INITIAL_FORM);
      setEditIndex(null);
    }
    setValidationErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowPassword(false);
    setValidationErrors({});
  };

  // Validation functions
  const validateExtension = (extension) => {
    if (!extension || extension.trim() === "") {
      return SIP_TO_SIP_ACCOUNT_ERR_EXTENSION_REQUIRED;
    }
    return null;
  };

  const validatePassword = (password) => {
    if (!password || password.trim() === "") {
      return SIP_TO_SIP_ACCOUNT_ERR_PASSWORD_REQUIRED;
    }
    return null;
  };

  const validateContext = (context) => {
    if (!context || context.trim() === "") {
      return SIP_TO_SIP_ACCOUNT_ERR_CONTEXT_REQUIRED;
    }
    return null;
  };

  const validateAllowCodecs = (allowCodecs) => {
    if (!allowCodecs || allowCodecs.trim() === "") {
      return SIP_TO_SIP_ACCOUNT_ERR_ALLOW_CODECS_REQUIRED;
    }
    return null;
  };

  const validateContact = (contact) => {
    if (!contact || String(contact).trim() === "") {
      return SIP_TO_SIP_ACCOUNT_ERR_CONTACT_REQUIRED;
    }
    const contactRegex = /^(?:sip:)?(?:\d{1,3}\.){3}\d{1,3}$/;
    if (!contactRegex.test(String(contact).trim())) {
      return SIP_TO_SIP_ACCOUNT_ERR_CONTACT_FORMAT;
    }
    return null;
  };

  const validateDomainName = (domainName) => {
    if (!domainName || domainName.trim() === "") {
      return SIP_TO_SIP_ACCOUNT_ERR_DOMAIN_REQUIRED;
    }
    return null;
  };

  const validateContactUser = (contactUser) => {
    if (!contactUser || contactUser.trim() === "") {
      return SIP_TO_SIP_ACCOUNT_ERR_CONTACT_USER_REQUIRED;
    }
    return null;
  };

  const validateOutboundProxy = (outboundProxy) => {
    if (!outboundProxy || outboundProxy.trim() === "") {
      return SIP_TO_SIP_ACCOUNT_ERR_OUTBOUND_PROXY_REQUIRED;
    }
    return null;
  };

  const validateForm = () => {
    const errors = {};

    const extensionError = validateExtension(form.extension);
    if (extensionError) errors.extension = extensionError;

    const passwordError = validatePassword(form.password);
    if (passwordError) errors.password = passwordError;

    const contextError = validateContext(form.context);
    if (contextError) errors.context = contextError;

    const allowCodecsError = validateAllowCodecs(form.allow_codecs);
    if (allowCodecsError) errors.allow_codecs = allowCodecsError;

    const contactError = validateContact(form.contact);
    if (contactError) errors.contact = contactError;

    const domainNameError = validateDomainName(form.from_domain);
    if (domainNameError) errors.from_domain = domainNameError;

    const contactUserError = validateContactUser(form.contact_user);
    if (contactUserError) errors.contact_user = contactUserError;

    const outboundProxyError = validateOutboundProxy(form.outbound_proxy);
    if (outboundProxyError) errors.outbound_proxy = outboundProxyError;

    return errors;
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

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
      case "extension":
        error = validateExtension(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "context":
        error = validateContext(value);
        break;
      case "contact":
        error = validateContact(value);
        break;
      default:
        break;
    }

    if (error) {
      setValidationErrors((prev) => ({ ...prev, [key]: error }));
    }
  };

  const handleSave = async () => {
    // Comprehensive validation
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      // Show the first validation error
      const firstError = Object.values(validationErrors)[0];
      showMessageFn("error", firstError);
      setValidationErrors(validationErrors);
      return;
    }

    // Duplicate extension across classic PJSIP
    if (pjsipExtensions.has(String(form.extension))) {
      showMessageFn(
        "error",
        SIP_TO_SIP_ACCOUNT_ERR_DUPLICATE_EXTENSION,
      );
      return;
    }
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const payload = transformUiToApi(form);
      const resp =
        editIndex !== null
          ? await updateSipIpTrunkAccount(payload)
          : await createSipIpTrunkAccount(payload);
      if (resp?.response) {
        showMessageFn("success", resp.message || "Saved");
        await new Promise((r) => setTimeout(r, 600));
        await loadData();
        setShowModal(false);
        setEditIndex(null);
      } else {
        showMessageFn("error", resp?.message || "Failed to save");
      }
    } catch (e) {
      showMessageFn("error", e.message || SIP_TO_SIP_ACCOUNT_ERR_SAVE_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleDelete = async (indices) => {
    if (!indices || indices.length === 0) return;
    if (!window.confirm(SIP_TO_SIP_ACCOUNT_CONFIRM_DELETE)) {
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      // Fetch SIP trunk groups to block deletion when referenced as trunkId/extension
      let groupRefList = [];
      try {
        const grpRes = await listGroups();
        groupRefList = (grpRes && (grpRes.message || grpRes.data)) || [];
      } catch {}

      const referencedExtensions = new Set(
        groupRefList
          .map((g) => g?.sip_trunk_id)
          .filter(Boolean)
          .map((v) => String(v))
          .map((v) => (v.includes("/") ? v.split("/")[1] : null))
          .filter(Boolean),
      );

      const ops = indices.map((i) => {
        const ext = accounts[i].extension;
        if (referencedExtensions.has(String(ext))) {
          alert(SIP_TO_SIP_ACCOUNT_ALERT_DELETE_BLOCKED(ext));
          return { skipped: true };
        }
        return deleteSipIpTrunkAccount(ext);
      });

      const results = await Promise.allSettled(ops);
      const success = results.filter(
        (r) => r.status === "fulfilled" && r.value?.response,
      ).length;
      if (success > 0)
        showMessageFn("success", `${success} account(s) deleted`);
      await loadData();
    } catch (e) {
      showMessageFn("error", e.message || SIP_TO_SIP_ACCOUNT_ERR_DELETE_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (accounts.length === 0) {
      showMessageFn("info", SIP_TO_SIP_ACCOUNT_MSG_NO_ACCOUNTS_TO_CLEAR);
      return;
    }
    if (!window.confirm(SIP_TO_SIP_ACCOUNT_CONFIRM_CLEAR_ALL)) {
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      // Block deletion for any extension referenced by SIP Trunk Group
      let groupRefList = [];
      try {
        const grpRes = await listGroups();
        groupRefList = (grpRes && (grpRes.message || grpRes.data)) || [];
      } catch {}
      const referencedExtensions = new Set(
        groupRefList
          .map((g) => g?.sip_trunk_id)
          .filter(Boolean)
          .map((v) => String(v))
          .map((v) => (v.includes("/") ? v.split("/")[1] : null))
          .filter(Boolean),
      );

      const deletables = accounts.filter(
        (acc) => !referencedExtensions.has(String(acc.extension)),
      );
      const blocked = accounts.length - deletables.length;
      if (blocked > 0) {
        alert(SIP_TO_SIP_ACCOUNT_ALERT_CLEAR_BLOCKED(blocked));
      }

      const results = await Promise.allSettled(
        deletables.map((acc) => deleteSipIpTrunkAccount(acc.extension)),
      );
      const success = results.filter(
        (r) => r.status === "fulfilled" && r.value?.response,
      ).length;
      if (success > 0)
        showMessageFn("success", `All ${success} account(s) deleted`);
      setSelected([]);
      await loadData();
    } catch (e) {
      showMessageFn("error", e.message || SIP_TO_SIP_ACCOUNT_ERR_CLEAR_ALL_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(accounts.length / itemsPerPage));
  const pagedAccounts = accounts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const formFieldLabel = (field) => `${field.label}:`;

  const renderAllowCodecsSection = () => (
    <div style={{ width: "100%" }}>
      <SipToSipAllowCodecsSectionHeading
        tooltipKey="allow_codecs"
        required
      />
      <SipToSipCodecDualList
        allOptions={allCodecOptions}
        selected={selectedCodecList}
        onChange={updateCodecList}
        getLabel={getCodecLabel}
        emptyTextAvailable={SIP_TO_SIP_ACCOUNT_CODEC_EMPTY_AVAILABLE}
        emptyTextSelected={SIP_TO_SIP_ACCOUNT_CODEC_EMPTY_SELECTED}
      />
      {validationErrors.allow_codecs && (
        <SipToSipErrMsg>{validationErrors.allow_codecs}</SipToSipErrMsg>
      )}
    </div>
  );

  const renderFormFieldControl = (field) => {
    if (field.type === "password") {
      return (
        <>
          <TextField
            type={showPassword ? "text" : "password"}
            value={form[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
            placeholder={SIP_TO_SIP_ACCOUNT_PLACEHOLDER_PASSWORD}
            error={!!validationErrors[field.name]}
            sx={sipToSipModalTextFieldSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
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
          {validationErrors[field.name] && (
            <SipToSipErrMsg>{validationErrors[field.name]}</SipToSipErrMsg>
          )}
        </>
      );
    }

    if (field.name === "context") {
      return (
        <>
          <FormControl
            fullWidth
            size="small"
            error={!!validationErrors.context}
          >
            <MuiSelect
              value={form.context || ""}
              displayEmpty
              onChange={(e) => handleChange("context", e.target.value)}
              sx={sipToSipModalSelectSx}
            >
              <MenuItem value="" disabled>
                <em>{SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTEXT}</em>
              </MenuItem>
              {Array.from({ length: 10 }, (_, i) => `sip${i + 1}`).map(
                (ctx) => (
                  <MenuItem key={ctx} value={ctx}>
                    {ctx}
                  </MenuItem>
                ),
              )}
            </MuiSelect>
          </FormControl>
          {validationErrors.context && (
            <SipToSipErrMsg>{validationErrors.context}</SipToSipErrMsg>
          )}
        </>
      );
    }

    if (field.name === "contact") {
      return (
        <>
          <TextField
            type="text"
            value={
              form.contact ? String(form.contact).replace(/^sip:/, "") : ""
            }
            onChange={(e) => handleChange("contact", e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
            error={!!validationErrors.contact}
            placeholder={SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTACT}
            sx={sipToSipModalTextFieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {SIP_TO_SIP_ACCOUNT_CONTACT_PREFIX}
                </InputAdornment>
              ),
            }}
          />
          {validationErrors.contact && (
            <SipToSipErrMsg>{validationErrors.contact}</SipToSipErrMsg>
          )}
        </>
      );
    }

    return (
      <>
        <TextField
          type="text"
          value={form[field.name] || ""}
          onChange={(e) => handleChange(field.name, e.target.value)}
          size="small"
          fullWidth
          variant="outlined"
          error={!!validationErrors[field.name]}
          placeholder={
            field.name === "extension"
              ? SIP_TO_SIP_ACCOUNT_PLACEHOLDER_EXTENSION
              : field.name === "from_domain"
                ? SIP_TO_SIP_ACCOUNT_PLACEHOLDER_DOMAIN
                : field.name === "contact_user"
                  ? SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTACT_USER
                  : field.name === "outbound_proxy"
                    ? SIP_TO_SIP_ACCOUNT_PLACEHOLDER_OUTBOUND_PROXY
                    : `Enter ${field.label.toLowerCase()}`
          }
          disabled={field.name === "extension" && editIndex !== null}
          sx={sipToSipModalTextFieldSx}
        />
        {validationErrors[field.name] && (
          <SipToSipErrMsg>{validationErrors[field.name]}</SipToSipErrMsg>
        )}
      </>
    );
  };

  const renderFormField = (field) => (
    <SipToSipFieldRow
      key={field.name}
      label={formFieldLabel(field)}
      tooltipKey={field.name}
    >
      {renderFormFieldControl(field)}
    </SipToSipFieldRow>
  );

  return (
    <>
      <div
        style={{
          ...sipToSipPageWrapStyle,
          ...(isCompact ? { padding: 8 } : {}),
        }}
      >
        <div style={sipToSipInnerStyle}>
          {message.text && (
            <Alert
              severity={message.type}
              onClose={() => setMessage({ type: "", text: "" })}
              sx={sipToSipFixedAlertSx}
            >
              {message.text}
            </Alert>
          )}

          <SipToSipBreadcrumb />

          <div style={sipToSipCardStyle}>
            <div
              style={{
                ...sipToSipToolbarStyle,
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
                <span style={sipToSipSelectedBadgeStyle}>
                  {selected.length} {SIP_TO_SIP_ACCOUNT_SELECTED_SUFFIX}
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
                onClick={() =>
                  setSelected((sel) =>
                    accounts
                      .map((_, i) => (sel.includes(i) ? null : i))
                      .filter((i) => i !== null),
                  )
                }
                disabled={loading.delete || accounts.length === 0}
                variant="cancel"
                style={sipToSipCancelBtnStyle}
              >
                {SIP_TO_SIP_ACCOUNT_BTN_INVERSE}
              </Btn>
              <Btn
                onClick={() => handleDelete(selected)}
                disabled={loading.delete || selected.length === 0}
                variant="cancel"
                style={sipToSipCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {SIP_TO_SIP_ACCOUNT_BTN_DELETE}
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete || accounts.length === 0}
                variant="cancel"
                style={sipToSipCancelBtnStyle}
              >
                {SIP_TO_SIP_ACCOUNT_BTN_CLEAR_ALL}
              </Btn>
              <Btn
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
                variant="primary"
                style={sipToSipPrimaryBtnStyle}
              >
                {SIP_TO_SIP_ACCOUNT_BTN_ADD_NEW}
              </Btn>
            </div>
          </div>

          {isInitialLoad ? (
            <TableListLoading />
          ) : accounts.length === 0 ? (
            <TableListEmptyState
              message={SIP_TO_SIP_ACCOUNT_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
              buttonLabel={SIP_TO_SIP_ACCOUNT_BTN_ADD_NEW}
            />
          ) : (
            <>
              <div
                style={{
                  overflowX: isCompact ? "auto" : "hidden",
                  overflowY: "auto",
                  flex: 1,
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <table style={sipToSipTableStyle}>
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
                          checked={
                            selected.length > 0 &&
                            selected.length === accounts.length
                          }
                          indeterminate={
                            selected.length > 0 &&
                            selected.length < accounts.length
                          }
                          onChange={
                            selected.length === accounts.length
                              ? () => setSelected([])
                              : () => setSelected(accounts.map((_, i) => i))
                          }
                          disabled={loading.delete}
                          sx={sipToSipTableCheckboxSx}
                        />
                      </TH>
                      {SIP_TO_SIP_ACCOUNT_TABLE_COLUMNS.map((col) => (
                        <TH key={col.key}>{col.label}</TH>
                      ))}
                      <TH
                        style={{
                          width: 70,
                          borderRight: "none",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        {SIP_TO_SIP_ACCOUNT_COL_MODIFY}
                      </TH>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAccounts.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedAccounts.length - 1;
                      const rowBg = getSipToSipRowBg(isSelected, idx);
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};
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
                            style={getSipToSipTdStyle(rowBg, lastRowCellStyle, {
                              borderLeft: "none",
                              width: 36,
                            })}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() =>
                                setSelected((sel) =>
                                  sel.includes(realIdx)
                                    ? sel.filter((i) => i !== realIdx)
                                    : [...sel, realIdx],
                                )
                              }
                              disabled={loading.delete}
                              sx={sipToSipTableCheckboxSx}
                            />
                          </td>
                          {SIP_TO_SIP_ACCOUNT_TABLE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={getSipToSipTdStyle(rowBg, lastRowCellStyle, {
                                fontWeight: 400,
                              })}
                            >
                              {col.key === "password"
                                ? "*".repeat(item.password?.length || 0)
                                : col.key === "index"
                                  ? realIdx + 1
                                  : item[col.key] || "--"}
                            </td>
                          ))}
                          <td
                            style={getSipToSipTdStyle(rowBg, lastRowCellStyle, {
                              borderRight: "none",
                            })}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <EditDocumentIcon
                                titleAccess={SIP_TO_SIP_ACCOUNT_EDIT_TITLE_ACCESS}
                                onClick={() => {
                                  if (!loading.delete)
                                    handleOpenModal(item, realIdx);
                                }}
                                style={{
                                  ...sipToSipEditIconStyle,
                                  cursor: loading.delete
                                    ? "not-allowed"
                                    : "pointer",
                                  opacity: loading.delete ? 0.4 : 0.7,
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
              </div>

              <SipToSipPagination
                page={page}
                totalPages={totalPages}
                recordCount={pagedAccounts.length}
                onPageChange={(nextPage) =>
                  setPage(Math.min(totalPages, Math.max(1, nextPage)))
                }
              />
            </>
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-start",
            justifyContent: "center",
            pt: 8,
          },
        }}
        PaperProps={{ sx: sipToSipDialogPaperSx }}
      >
        <DialogTitle style={sipToSipModalTitleStyle}>
          {editIndex !== null
            ? SIP_TO_SIP_ACCOUNT_MODAL_EDIT_TITLE
            : SIP_TO_SIP_ACCOUNT_MODAL_ADD_TITLE}
        </DialogTitle>
        <DialogContent
          ref={modalScrollRef}
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
          sx={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div style={sipToSipModalFormPanelStyle}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                paddingBottom: 8,
              }}
            >
              <SipToSipSectionCard title={SIP_TO_SIP_ACCOUNT_SECTION_GENERAL} isFirst>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px 32px",
                  }}
                >
                  {SIP_TO_SIP_ACCOUNT_FORM_LAYOUT.flat()
                    .map((name) =>
                      SIP_TO_SIP_ACCOUNT_FIELDS.find((f) => f.name === name),
                    )
                    .filter(Boolean)
                    .map((field) => renderFormField(field))}
                </div>
                {renderAllowCodecsSection()}
              </SipToSipSectionCard>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            variant="primary"
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? SIP_TO_SIP_ACCOUNT_BTN_SAVING : SIP_TO_SIP_ACCOUNT_BTN_SAVE}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            variant="cancel"
            disabled={loading.save}
            style={sipToSipModalCancelBtnStyle}
          >
            {SIP_TO_SIP_ACCOUNT_BTN_CLOSE}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
    </>
  );
};

export default SipToSipAccountPage;
