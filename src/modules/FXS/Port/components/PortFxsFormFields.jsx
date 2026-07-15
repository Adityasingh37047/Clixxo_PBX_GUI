import React from "react";
import { PORT_FXS_TABLE_COLUMN_TOOLTIPS, PORT_FXS_MODIFY_DIALOG_WIDTH, PORT_FXS_PAGE_BREADCRUMB_SECTION, PORT_FXS_PAGE_TITLE } from "../../../../constants/PortFxsPageConstants";
import { Tooltip } from "@mui/material";

import { addNewModalFooterBtnStyle as fxsToolbarBtnStyle, addNewModalFooterCancelBtnStyle as fxsAddNewModalFooterCancelBtnStyle, addNewModalFooterStyle as fxsAddNewModalFooterStyle, extensionCardStyle as fxsCardStyle, extensionPageInnerStyle as fxsPageInnerStyle, extensionPageWrapStyle as fxsPageWrapStyle, extensionToolbarStyle as fxsToolbarStyle, ExtensionBreadcrumb as FxsBreadcrumb, addNewModalFooterBtnStyle as fxsAddNewModalFooterBtnStyle, extensionCancelBtnStyle as fxsToolbarCancelBtnStyle, extensionPrimaryBtnStyle as fxsToolbarPrimaryBtnStyle } from "../../../../components/common";

import { C } from "../../../../theme/pbxTokens";

export const fxsModalTitleStyle = {
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

export const fxsModalBackdropSlotProps = {
  backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
};

export const fxsModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

export const fxsDialogSx = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const FXS_DIALOG_MARGIN = 24;
const FXS_DIALOG_LAYOUT_OFFSET = 80;

export const createFxsDialogPaperSx = (width = 500) => ({
  margin: FXS_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${FXS_DIALOG_LAYOUT_OFFSET}px - ${FXS_DIALOG_MARGIN * 2}px)`,
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


const FIELD_LABEL_COLOR = "#3E5475";

export const FIELD_TOOLTIP_PROPS = {
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

export const PortFxsFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const tableHeaderLabelStyle = {
  fontSize: 10.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

export const renderPortFxsTableColumnHeader = (col) => {
  if (!PORT_FXS_TABLE_COLUMN_TOOLTIPS[col.key]) return col.label;
  return (
    <PortFxsFieldLabel
      tooltipKey={col.key}
      tooltips={PORT_FXS_TABLE_COLUMN_TOOLTIPS}
      style={tableHeaderLabelStyle}
    >
      {col.label}
    </PortFxsFieldLabel>
  );
};

export const portFxsPageWrapStyle = fxsPageWrapStyle;
export const portFxsPageInnerStyle = fxsPageInnerStyle;
export const portFxsCardStyle = fxsCardStyle;
export const portFxsHeaderStyle = {
  ...fxsToolbarStyle,
  justifyContent: "flex-end",
};
export { fxsToolbarBtnStyle, fxsToolbarCancelBtnStyle, fxsToolbarPrimaryBtnStyle };

export const portFxsTableBodyStyle = {
  overflowX: "auto",
  overflowY: "auto",
  width: "100%",
  boxSizing: "border-box",
};

export const addNewModalFooterStyle = fxsAddNewModalFooterStyle;
export const addNewModalFooterBtnStyle = fxsAddNewModalFooterBtnStyle;
export const addNewModalFooterCancelBtnStyle = fxsAddNewModalFooterCancelBtnStyle;
export const addNewModalBackdropSlotProps = fxsModalBackdropSlotProps;
export const addNewModalDialogContentSx = fxsModalDialogContentSx;

export const fxsDialogPaperSx = createFxsDialogPaperSx(PORT_FXS_MODIFY_DIALOG_WIDTH);
export const fxsDialogTitleStyle = fxsModalTitleStyle;

export const PortFxsBreadcrumb = () => (
  <FxsBreadcrumb
    root="FXS"
    section={PORT_FXS_PAGE_BREADCRUMB_SECTION}
    current={PORT_FXS_PAGE_TITLE}
  />
);

export const PortFxsRegStatusBadge = ({ regStatus }) => {
  const s = String(regStatus || "").toLowerCase();
  const registered = s === "registered";
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
        ...(registered
          ? { color: "#16a34a", background: "none", border: "none" }
          : {
              padding: "2px 10px",
              borderRadius: 999,
              background: "#f3f4f6",
              color: "#6b7280",
              border: "1px solid #d1d5db",
            }),
      }}
    >
      {regStatus || "—"}
    </span>
  );
};
