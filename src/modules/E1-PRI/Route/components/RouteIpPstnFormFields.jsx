import React from "react";
import { groupOptionId } from "../utils/RouteIpPstnTransformers";
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
  ROUTE_IP_PSTN_FIELDS,
  ROUTE_IP_PSTN_FIELD_TOOLTIPS,
  ROUTE_IP_PSTN_PAGE_BREADCRUMB_SECTION,
  ROUTE_IP_PSTN_PAGE_TITLE,
} from "../../../../constants/RouteIPtoPstnConstants";

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


export const ROUTEIPPSTN_CARD_RADIUS = E1_PRI_CARD_RADIUS;
export const routeIpPstnCardStyle = e1PriCardStyle;
export const routeIpPstnToolbarStyle = e1PriToolbarStyle;
export const routeIpPstnPaginationStyle = e1PriPaginationStyle;
export const routeIpPstnPageBadgeStyle = e1PriPageBadgeStyle;
export const routeIpPstnCancelBtnStyle = e1PriCancelBtnStyle;
export const routeIpPstnToolbarBtnStyle = e1PriToolbarBtnStyle;
export const routeIpPstnPrimaryBtnStyle = e1PriToolbarBtnStyle;

export {
  ExtensionTableListLoading as RouteIpPstnTableListLoading,
  ExtensionTableListEmptyState as RouteIpPstnTableListEmptyState,
  ExtensionPagination as RouteIpPstnPagination,
};

export const routeIpPstnAddNewModalFooterStyle = e1PriAddNewModalFooterStyle;
export const routeIpPstnAddNewModalFooterBtnStyle = e1PriToolbarBtnStyle;
export const routeIpPstnAddNewModalFooterCancelBtnStyle =
  e1PriAddNewModalFooterCancelBtnStyle;
export const routeIpPstnAddNewModalBackdropSlotProps =
  e1PriModalBackdropSlotProps;
export const routeIpPstnAddNewModalDialogContentSx =
  e1PriModalDialogContentSx;

export { Btn as RouteIpPstnBtn };
export { TH as RouteIpPstnTH };
export { tdStyle as routeIpPstnTdStyle };
export { C as routeIpPstnC };
export { extensionTableCheckboxSx as routeIpPstnCheckboxSx };

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

export const routeIpPstnInputInteraction = {
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

export const routeIpPstnInputStyle = {
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

export const routeIpPstnSelectStyle = {
  ...routeIpPstnInputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
};

export const routeIpPstnFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

export const formatRouteIpPstnTooltipTitle = (text) => {
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

export const RouteIpPstnFieldLabel = ({
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
      title={formatRouteIpPstnTooltipTitle(tooltip)}
      {...FIELD_TOOLTIP_PROPS}
    >
      {labelNode}
    </Tooltip>
  );
};

export const RouteIpPstnFieldRow = ({
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
    <RouteIpPstnFieldLabel
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
    </RouteIpPstnFieldLabel>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);


export const RouteIpPstnBreadcrumb = () => (
  <E1PriBreadcrumb
    root="E1-PRI"
    section={ROUTE_IP_PSTN_PAGE_BREADCRUMB_SECTION}
    current={ROUTE_IP_PSTN_PAGE_TITLE}
  />
);

export const routeIpPstnDialogConfig = {
  dialogSx: e1PriDialogSx,
  paperSx: createE1PriDialogPaperSx(600),
  modalTitleStyle: e1PriModalTitleStyle,
};

export const RouteIpPstnModalForm = ({
  formData,
  setFormData,
  sipTrunkGroups,
  pcmTrunkGroups,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={routeIpPstnFormPanelStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {ROUTE_IP_PSTN_FIELDS.map((field) => (
          <RouteIpPstnFieldRow
            key={field.key}
            label={`${field.label}:`}
            tooltipKey={field.key}
            tooltips={ROUTE_IP_PSTN_FIELD_TOOLTIPS}
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
                style={routeIpPstnSelectStyle}
                {...routeIpPstnInputInteraction}
              >
                {field.key === "callSource" ? (
                  sipTrunkGroups.length > 0 ? (
                    sipTrunkGroups.map((g) => {
                      const id = groupOptionId(g);
                      return (
                        <option
                          key={String(id) || "any"}
                          value={String(id)}
                        >
                          SIP Trunk Group [{String(id) || "Any"}]
                        </option>
                      );
                    })
                  ) : (
                    <option value="any">SIP Trunk Group [Any]</option>
                  )
                ) : field.key === "callDestination" ? (
                  pcmTrunkGroups.length > 0 ? (
                    pcmTrunkGroups.map((g) => {
                      const id = groupOptionId(g);
                      return (
                        <option
                          key={String(id) || "any"}
                          value={String(id)}
                        >
                          PCM Trunk Group [{String(id) || "Any"}]
                        </option>
                      );
                    })
                  ) : (
                    <option value="any">PCM Trunk Group [Any]</option>
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
                style={routeIpPstnInputStyle}
                {...routeIpPstnInputInteraction}
              />
            )}
          </RouteIpPstnFieldRow>
        ))}
      </div>
    </div>
  </div>
);
