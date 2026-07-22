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
  EXTENSION_TABLE_CARD_RADIUS as E1_PRI_CARD_RADIUS,
  ExtensionBreadcrumb as E1PriBreadcrumb,
  addNewModalFooterBtnStyle as e1PriToolbarBtnStyle,
  addNewModalFooterCancelBtnStyle as e1PriAddNewModalFooterCancelBtnStyle,
  addNewModalFooterStyle as e1PriAddNewModalFooterStyle,
  extensionCancelBtnStyle as e1PriCancelBtnStyle,
  extensionCardStyle as e1PriCardStyle,
  extensionFixedAlertSx as e1PriFixedAlertSx,
  extensionPageBadgeStyle as e1PriPageBadgeStyle,
  extensionPaginationStyle as e1PriPaginationStyle,
  extensionToolbarStyle as e1PriToolbarStyle,
  extensionTableCheckboxSx,
  ExtensionCodecDualList,
  ExtensionPagination,
  ExtensionTableListEmptyState,
  ExtensionTableListLoading,
} from "../../../../components/common";
import {
  PCM_RECEPTION_TIMEOUT_PAGE_BREADCRUMB_ROOT,
  PCM_RECEPTION_TIMEOUT_PAGE_BREADCRUMB_SECTION,
  PCM_RECEPTION_TIMEOUT_PAGE_TITLE,
} from "../../../../constants/PcmReceptionTimeoutConstants";


export const e1PriModalTitleStyle = {
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

export const e1PriModalBackdropSlotProps = {
  backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
};

export const e1PriModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

export const e1PriDialogSx = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const E1_DIALOG_MARGIN = 24;
const E1_DIALOG_LAYOUT_OFFSET = 80;

export const createE1PriDialogPaperSx = (width = 600) => ({
  margin: E1_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${E1_DIALOG_LAYOUT_OFFSET}px - ${E1_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width,
  maxWidth: "95vw",
  p: 0,
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
});


export const P_C_M_RECEPTION_TIMEOUT_CARD_RADIUS = E1_PRI_CARD_RADIUS;
export const pcmReceptionTimeoutCompactMqFix = "(max-width: 768px)";

export {
  ExtensionTableListLoading as PcmReceptionTimeoutTableListLoading,
  ExtensionTableListEmptyState as PcmReceptionTimeoutTableListEmptyState,
  ExtensionPagination as PcmReceptionTimeoutPagination,
  ExtensionCodecDualList,
};

export const pcmReceptionTimeoutCardStyle = e1PriCardStyle;
export const pcmReceptionTimeoutToolbarStyle = e1PriToolbarStyle;
export const pcmReceptionTimeoutPaginationStyle = e1PriPaginationStyle;
export const pcmReceptionTimeoutPageBadgeStyle = e1PriPageBadgeStyle;
export const pcmReceptionTimeoutCancelBtnStyle = e1PriCancelBtnStyle;
export const pcmReceptionTimeoutToolbarBtnStyle = e1PriToolbarBtnStyle;
export const pcmReceptionTimeoutPrimaryBtnStyle = e1PriToolbarBtnStyle;
export const pcmReceptionTimeoutFixedAlertSx = e1PriFixedAlertSx;

export const pcmReceptionTimeoutAddNewModalFooterStyle = e1PriAddNewModalFooterStyle;
export const pcmReceptionTimeoutAddNewModalFooterBtnStyle = e1PriToolbarBtnStyle;
export const pcmReceptionTimeoutAddNewModalFooterCancelBtnStyle =
  e1PriAddNewModalFooterCancelBtnStyle;
export const pcmReceptionTimeoutAddNewModalBackdropSlotProps =
  e1PriModalBackdropSlotProps;
export const pcmReceptionTimeoutAddNewModalDialogContentSx = e1PriModalDialogContentSx;

export { Btn as PcmReceptionTimeoutBtn };
export { TH as PcmReceptionTimeoutTH };
export { tdStyle as pcmReceptionTimeoutTdStyle };
export { C as pcmReceptionTimeoutC };
export { extensionTableCheckboxSx as pcmReceptionTimeoutCheckboxSx };
export { extensionSelectedBadgeStyle as pcmReceptionTimeoutSelectedBadgeStyle } from "../../../../components/common";

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

export const pcmReceptionTimeoutInputInteraction = {
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

export const pcmReceptionTimeoutInputStyle = {
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

export const pcmReceptionTimeoutSelectStyle = {
  ...pcmReceptionTimeoutInputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
};

export const pcmReceptionTimeoutFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

export const formatPcmReceptionTimeoutTooltipTitle = (text) => {
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

export const PcmReceptionTimeoutFieldLabel = ({
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
      title={formatPcmReceptionTimeoutTooltipTitle(tooltip)}
      {...FIELD_TOOLTIP_PROPS}
    >
      {labelNode}
    </Tooltip>
  );
};

export const PcmReceptionTimeoutFieldRow = ({
  label,
  tooltipKey,
  tooltips,
  children,
  labelWidth = 170,
  fieldWidth = "100%",
  alignItems = "center",
}) => (
  <div
    style={{
      display: "flex",
      alignItems,
      gap: 12,
    }}
  >
    <PcmReceptionTimeoutFieldLabel
      tooltipKey={tooltipKey}
      tooltips={tooltips}
      style={{
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        whiteSpace: "nowrap",
        display: "inline-block",
      }}
    >
      {label}
    </PcmReceptionTimeoutFieldLabel>
    <div style={{ flex: 1, minWidth: 0, width: fieldWidth }}>{children}</div>
  </div>
);


export const PcmReceptionTimeoutBreadcrumb = () => (
  <E1PriBreadcrumb
    root="E1-PRI"
    section={PCM_RECEPTION_TIMEOUT_PAGE_BREADCRUMB_SECTION}
    current={PCM_RECEPTION_TIMEOUT_PAGE_TITLE}
  />
);

export const pcmReceptionTimeoutDialogConfig = {
  dialogSx: e1PriDialogSx,
  paperSx: createE1PriDialogPaperSx(500),
  modalTitleStyle: e1PriModalTitleStyle,
};

export const PCM_RECEPTION_TIMEOUT_COMPACT_MQ = pcmReceptionTimeoutCompactMqFix;
