import React from "react";
import { SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_ROOT, SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_SECTION, SIP_TO_SIP_ACCOUNT_PAGE_TITLE, SIP_TO_SIP_ACCOUNT_RECORD_LABEL, SIP_TO_SIP_ACCOUNT_BTN_PREV, SIP_TO_SIP_ACCOUNT_BTN_NEXT, SIP_TO_SIP_ACCOUNT_FIELD_TOOLTIPS, SIP_TO_SIP_ACCOUNT_LABEL_ALLOW_CODECS } from "../../../../constants/SipToSipAccountConstants";
import { Tooltip, CircularProgress, useMediaQuery } from "@mui/material";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  Btn,
  ExtensionBreadcrumb as SipToSipPageBreadcrumb,
} from "../../../../components/common";
import {
  SIP_TO_SIP_ACCOUNT_COMPACT_MQ,
  sipToSipPaginationStyle,
  sipToSipPageBadgeStyle,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  sipToSipModalCancelBtnStyle,
} from "./SipToSipAccountTableHelpers";

export { ExtensionCodecDualList as SipToSipCodecDualList } from "../../../../components/common";
export { Btn, SIP_TO_SIP_ACCOUNT_COMPACT_MQ };
export { TH } from "./SipToSipAccountTableHelpers";

// ── Page-local field label tooltip UI (not shared) ──
export const FIELD_LABEL_COLOR = "#3E5475";

export const SIP_TO_SIP_ACCOUNT_TOOLTIP_PROPS = {
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

export const formatFieldTooltipTitle = (text) => {
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

export const SipToSipAccountFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

export const sipToSipOutlinedInputRootSx = {
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

export const sipToSipModalTextFieldSx = {
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

export const sipToSipModalSelectSx = {
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

export const sipToSipModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  flexShrink: 0,
};

export const sipToSipModalActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
};

export const SIP_TO_SIP_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

export const sipToSipDialogPaperSx = {
  mx: "auto",
  my: 0,
  maxHeight: `calc(100vh - ${SIP_TO_SIP_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - 48px)`,
  display: "flex",
  flexDirection: "column",
  width: 760,
  maxWidth: "96vw",
  p: 0,
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

export const SipToSipBreadcrumb = ({ style }) => (
  <SipToSipPageBreadcrumb
    root={SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_ROOT}
    section={SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_SECTION}
    current={SIP_TO_SIP_ACCOUNT_PAGE_TITLE}
    style={style}
  />
);
export const TableListLoading = () => (
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

export const TableListEmptyState = ({
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
        style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 4 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

export const SipToSipPagination = ({
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

export const SIP_TO_SIP_MODAL_SECTION_BG = "#f8fafc";
export const SIP_TO_SIP_MODAL_SECTION_HEADING_COLOR = "#30415A";

export const SipToSipModalSectionHeading = ({ title, isFirst = false }) => {
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

export const SipToSipAllowCodecsSectionHeading = ({ tooltipKey, required = false }) => (
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

export const SipToSipSectionCard = ({ title, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <SipToSipModalSectionHeading title={title} isFirst={isFirst} />
    <div>{children}</div>
  </div>
);

export const SipToSipErrMsg = ({ children }) => (
  <div style={{ color: "#dc2626", fontSize: 11, marginTop: 2 }}>{children}</div>
);

export const SipToSipFieldRow = ({
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

export const sipToSipModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

export { addNewModalFooterStyle, addNewModalFooterBtnStyle, sipToSipModalCancelBtnStyle };

