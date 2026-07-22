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
  ExtensionTableListEmptyState,
  ExtensionTableListLoading,
  addNewModalFooterBtnStyle as numberPoolAddNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle as numberPoolAddNewModalFooterCancelBtnStyle,
  addNewModalFooterStyle as numberPoolAddNewModalFooterStyle,
  extensionCancelBtnStyle as numberPoolCancelBtnStyle,
  extensionCardStyle as numberPoolCardStyle,
  extensionFixedAlertSx as numberPoolFixedAlertSx,
  extensionTableCheckboxSx as numberPoolCheckboxSx,
  extensionToolbarStyle as numberPoolToolbarStyle,
  addNewModalFooterBtnStyle as numberPoolToolbarBtnStyle,
} from "../../../../components/common";
import {
  NUMBER_FILTER_POOL_PAGE_BREADCRUMB_SECTION,
  NUMBER_FILTER_POOL_PAGE_TITLE,
} from "../../../../constants/NumberFilterPoolConstants";

export const NUMBER_POOL_COMPACT_MQ = "(max-width: 768px)";

export {
  Btn as NumberPoolBtn,
  TH as NumberPoolTH,
  tdStyle as numberPoolTdStyle,
  C as numberPoolC,
  ExtensionTableListLoading as NumberPoolTableListLoading,
  ExtensionTableListEmptyState as NumberPoolTableListEmptyState,
  numberPoolCheckboxSx,
  numberPoolFixedAlertSx,
  numberPoolCardStyle,
  numberPoolToolbarStyle,
  numberPoolCancelBtnStyle,
  numberPoolToolbarBtnStyle,
  numberPoolAddNewModalFooterStyle,
  numberPoolAddNewModalFooterBtnStyle,
  numberPoolAddNewModalFooterCancelBtnStyle,
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

export const numberPoolInputInteraction = {
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

export const numberPoolInputStyle = {
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

export const numberPoolSelectStyle = {
  ...numberPoolInputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
};

export const numberPoolFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

const formatNumberPoolTooltipTitle = (text) => {
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

export const NumberPoolFieldLabel = ({
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
      title={formatNumberPoolTooltipTitle(tooltip)}
      {...FIELD_TOOLTIP_PROPS}
    >
      {labelNode}
    </Tooltip>
  );
};

export const NumberPoolFieldRow = ({
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
    <NumberPoolFieldLabel
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
    </NumberPoolFieldLabel>
    <div style={{ width: fieldWidth }}>{children}</div>
  </div>
);

const numberPoolModalTitleStyle = {
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

const NUMBER_POOL_DIALOG_MARGIN = 24;
const NUMBER_POOL_DIALOG_LAYOUT_OFFSET = 80;

export const numberPoolDialogConfig = {
  dialogSx: {
    "& .MuiDialog-container": {
      alignItems: "center",
      justifyContent: "center",
    },
  },
  paperSx: {
    margin: NUMBER_POOL_DIALOG_MARGIN,
    maxHeight: `calc(100vh - ${NUMBER_POOL_DIALOG_LAYOUT_OFFSET}px - ${NUMBER_POOL_DIALOG_MARGIN * 2}px)`,
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
  modalTitleStyle: numberPoolModalTitleStyle,
};

export const NumberPoolBreadcrumb = () => (
  <ExtensionBreadcrumb
    root="E1-PRI"
    section={NUMBER_FILTER_POOL_PAGE_BREADCRUMB_SECTION}
    current={NUMBER_FILTER_POOL_PAGE_TITLE}
  />
);
