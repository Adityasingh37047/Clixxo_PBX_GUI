import React from "react";
import { groupOptionId } from "../utils/RoutePstnToIpTransformers";
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
  extensionPageBadgeStyle as e1PriPageBadgeStyle,
  extensionPaginationStyle as e1PriPaginationStyle,
  extensionToolbarStyle as e1PriToolbarStyle,
  extensionTableCheckboxSx,
  ExtensionPagination,
  ExtensionTableListEmptyState,
  ExtensionTableListLoading,
} from "../../../../components/common";
import {
  ROUTE_PSTN_IP_FIELDS,
  ROUTE_PSTN_IP_FIELD_TOOLTIPS,
  ROUTE_PSTN_IP_PAGE_BREADCRUMB_SECTION,
  ROUTE_PSTN_IP_PAGE_TITLE,
} from "../../../../constants/RoutePstnToIPConstants";

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


export const ROUTEPSTNTOIP_CARD_RADIUS = E1_PRI_CARD_RADIUS;
export const routePstnToIpCardStyle = e1PriCardStyle;
export const routePstnToIpToolbarStyle = e1PriToolbarStyle;
export const routePstnToIpPaginationStyle = e1PriPaginationStyle;
export const routePstnToIpPageBadgeStyle = e1PriPageBadgeStyle;
export const routePstnToIpCancelBtnStyle = e1PriCancelBtnStyle;
export const routePstnToIpToolbarBtnStyle = e1PriToolbarBtnStyle;
export const routePstnToIpPrimaryBtnStyle = e1PriToolbarBtnStyle;

export {
  ExtensionTableListLoading as RoutePstnToIpTableListLoading,
  ExtensionTableListEmptyState as RoutePstnToIpTableListEmptyState,
  ExtensionPagination as RoutePstnToIpPagination,
};

export const routePstnToIpAddNewModalFooterStyle = e1PriAddNewModalFooterStyle;
export const routePstnToIpAddNewModalFooterBtnStyle = e1PriToolbarBtnStyle;
export const routePstnToIpAddNewModalFooterCancelBtnStyle =
  e1PriAddNewModalFooterCancelBtnStyle;
export const routePstnToIpAddNewModalBackdropSlotProps =
  e1PriModalBackdropSlotProps;
export const routePstnToIpAddNewModalDialogContentSx =
  e1PriModalDialogContentSx;

export { Btn as RoutePstnToIpBtn };
export { TH as RoutePstnToIpTH };
export { tdStyle as routePstnToIpTdStyle };
export { C as routePstnToIpC };
export { extensionTableCheckboxSx as routePstnToIpCheckboxSx };

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

export const routePstnToIpInputInteraction = {
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

export const routePstnToIpInputStyle = {
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

export const routePstnToIpSelectStyle = {
  ...routePstnToIpInputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
};

export const routePstnToIpFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

export const formatRoutePstnToIpTooltipTitle = (text) => {
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

export const RoutePstnToIpFieldLabel = ({
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
      title={formatRoutePstnToIpTooltipTitle(tooltip)}
      {...FIELD_TOOLTIP_PROPS}
    >
      {labelNode}
    </Tooltip>
  );
};

export const RoutePstnToIpFieldRow = ({
  label,
  tooltipKey,
  tooltips,
  children,
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    }}
  >
    <RoutePstnToIpFieldLabel
      tooltipKey={tooltipKey}
      tooltips={tooltips}
      style={{
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        display: "inline-block",
      }}
    >
      {label}
    </RoutePstnToIpFieldLabel>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);


export const RoutePstnToIpBreadcrumb = () => (
  <E1PriBreadcrumb
    root="E1-PRI"
    section={ROUTE_PSTN_IP_PAGE_BREADCRUMB_SECTION}
    current={ROUTE_PSTN_IP_PAGE_TITLE}
  />
);

export const routePstnToIpDialogConfig = {
  dialogSx: e1PriDialogSx,
  paperSx: createE1PriDialogPaperSx(600),
  modalTitleStyle: e1PriModalTitleStyle,
};

export const RoutePstnToIpModalForm = ({
  formData,
  setFormData,
  sipTrunkGroups,
  pcmTrunkGroups,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={routePstnToIpFormPanelStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {ROUTE_PSTN_IP_FIELDS.map((field) => (
          <RoutePstnToIpFieldRow
            key={field.key}
            label={`${field.label}:`}
            tooltipKey={field.key}
            tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}
          >
            {field.type === "select" ? (
              <select
                value={formData[field.key] || ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    [field.key]: e.target.value,
                  }))
                }
                style={routePstnToIpSelectStyle}
                {...routePstnToIpInputInteraction}
              >
                <option value="" disabled>
                  Please select
                </option>
                {field.key === "callInitiator" ? (
                  pcmTrunkGroups.length > 0 ? (
                    pcmTrunkGroups.map((g) => {
                      const id = groupOptionId(g);
                      return (
                        <option key={String(id)} value={String(id)}>
                          PCM Trunk Group [{String(id)}]
                        </option>
                      );
                    })
                  ) : (
                    <option value="any">PCM Trunk Group [Any]</option>
                  )
                ) : field.key === "callDestination" ? (
                  sipTrunkGroups.length > 0 ? (
                    sipTrunkGroups.map((g) => {
                      const id = groupOptionId(g);
                      return (
                        <option key={String(id)} value={String(id)}>
                          SIP Trunk Group [{String(id)}]
                        </option>
                      );
                    })
                  ) : (
                    <option value="any">SIP Trunk Group [Any]</option>
                  )
                ) : (
                  field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))
                )}
              </select>
            ) : (
              <input
                type="text"
                value={formData[field.key] || ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    [field.key]: e.target.value,
                  }))
                }
                style={routePstnToIpInputStyle}
                {...routePstnToIpInputInteraction}
              />
            )}
          </RoutePstnToIpFieldRow>
        ))}
      </div>
    </div>
  </div>
);
