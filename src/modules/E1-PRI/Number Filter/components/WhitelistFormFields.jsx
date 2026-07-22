import React from "react";
import { Tooltip } from "@mui/material";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb,
  addNewModalFooterBtnStyle as whitelistAddNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle as whitelistAddNewModalFooterCancelBtnStyle,
  addNewModalFooterStyle as whitelistAddNewModalFooterStyle,
  extensionFixedAlertSx as whitelistFixedAlertSx,
  extensionTableCheckboxSx as whitelistCheckboxSx,
} from "../../../../components/common";
import {
  NUMBER_FILTER_WHITELIST_PAGE_BREADCRUMB_SECTION,
  NUMBER_FILTER_WHITELIST_PAGE_TITLE,
} from "../../../../constants/NumberFilterWhitelistConstants";

export {
  Btn as WhitelistBtn,
  TH as WhitelistTH,
  tdStyle as whitelistTdStyle,
  C as whitelistC,
  whitelistCheckboxSx,
  whitelistFixedAlertSx,
  whitelistAddNewModalFooterStyle,
  whitelistAddNewModalFooterBtnStyle,
  whitelistAddNewModalFooterCancelBtnStyle,
};

const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
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
    arrow: { sx: { color: "#fff" } },
  },
};

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

export const whitelistInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

export const whitelistInputStyle = {
  width: "100%",
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const whitelistFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

export const whitelistModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 32,
    height: 32,
    padding: 0,
    borderRadius: 4,
    backgroundColor: "#fff",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "& .MuiOutlinedInput-input": {
    padding: "0 28px 0 10px",
    height: "30px",
    boxSizing: "border-box",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "0 28px 0 10px !important",
    minHeight: "30px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
    fontSize: 13,
    backgroundColor: "#fff",
    color: C.valueText,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    borderRadius: 4,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

export const whitelistGroupSelectMenuProps = {
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "left",
  },
  PaperProps: {
    sx: {
      backgroundColor: "#f8fafc",
      border: `1px solid ${C.cardBorder}`,
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    },
  },
  MenuListProps: {
    sx: { maxHeight: 224 },
  },
  PopperProps: {
    modifiers: [{ name: "flip", enabled: false }],
    placement: "bottom-start",
  },
};

const formatWhitelistTooltipTitle = (text) => {
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

export const WhitelistFieldLabel = ({
  tooltipKey,
  tooltips,
  children,
  style = {},
}) => {
  const tooltip = tooltipKey ? tooltips?.[tooltipKey] || "" : "";
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
    <Tooltip
      title={formatWhitelistTooltipTitle(tooltip)}
      {...FIELD_TOOLTIP_PROPS}
    >
      {labelNode}
    </Tooltip>
  );
};

export const WhitelistFieldRow = ({
  label,
  tooltipKey,
  tooltips,
  children,
  labelWidth = 140,
  fieldWidth = "min(100%, 320px)",
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    }}
  >
    <WhitelistFieldLabel
      tooltipKey={tooltipKey}
      tooltips={tooltips}
      style={{
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        display: "inline-block",
        whiteSpace: "normal",
        lineHeight: 1.2,
      }}
    >
      {label}
    </WhitelistFieldLabel>
    <div style={{ width: fieldWidth }}>{children}</div>
  </div>
);

const whitelistModalTitleStyle = {
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

const WHITELIST_DIALOG_MARGIN = 24;
const WHITELIST_DIALOG_LAYOUT_OFFSET = 80;

export const whitelistDialogConfig = {
  dialogSx: {
    "& .MuiDialog-container": {
      alignItems: "center",
      justifyContent: "center",
    },
  },
  paperSx: {
    margin: WHITELIST_DIALOG_MARGIN,
    maxHeight: `calc(100vh - ${WHITELIST_DIALOG_LAYOUT_OFFSET}px - ${WHITELIST_DIALOG_MARGIN * 2}px)`,
    display: "flex",
    flexDirection: "column",
    width: 500,
    maxWidth: "95vw",
    p: 0,
    borderRadius: "4px",
    overflow: "hidden",
    boxShadow:
      "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  },
  modalTitleStyle: whitelistModalTitleStyle,
};

export const WhitelistBreadcrumb = () => (
  <ExtensionBreadcrumb
    root="E1-PRI"
    section={NUMBER_FILTER_WHITELIST_PAGE_BREADCRUMB_SECTION}
    current={NUMBER_FILTER_WHITELIST_PAGE_TITLE}
  />
);
