import { Alert, Tooltip } from "@mui/material";
import { groupOptionId } from "../utils/RouteIPToIPTransformers";
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
  ROUTE_IP_IP_FIELDS,
  ROUTE_IP_IP_FIELD_TOOLTIPS,
  ROUTE_IP_IP_PAGE_BREADCRUMB_SECTION,
  ROUTE_IP_IP_PAGE_TITLE,
} from "../../../../constants/RouteIPIPConstants";

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


export const ROUTEIPTOIP_CARD_RADIUS = E1_PRI_CARD_RADIUS;
export const routeIPToIPCardStyle = e1PriCardStyle;
export const routeIPToIPToolbarStyle = e1PriToolbarStyle;
export const routeIPToIPPaginationStyle = e1PriPaginationStyle;
export const routeIPToIPPageBadgeStyle = e1PriPageBadgeStyle;
export const routeIPToIPCancelBtnStyle = e1PriCancelBtnStyle;
export const routeIPToIPToolbarBtnStyle = e1PriToolbarBtnStyle;
export const routeIPToIPPrimaryBtnStyle = e1PriToolbarBtnStyle;

export {
  ExtensionTableListLoading as RouteIPToIPTableListLoading,
  ExtensionTableListEmptyState as RouteIPToIPTableListEmptyState,
  ExtensionPagination as RouteIPToIPPagination,
};

export const routeIPToIPAddNewModalFooterStyle = e1PriAddNewModalFooterStyle;
export const routeIPToIPAddNewModalFooterBtnStyle = e1PriToolbarBtnStyle;
export const routeIPToIPAddNewModalFooterCancelBtnStyle =
  e1PriAddNewModalFooterCancelBtnStyle;
export const routeIPToIPAddNewModalBackdropSlotProps =
  e1PriModalBackdropSlotProps;
export const routeIPToIPAddNewModalDialogContentSx =
  e1PriModalDialogContentSx;

export { Btn as RouteIPToIPBtn };
export { TH as RouteIPToIPTH };
export { tdStyle as routeIPToIPTdStyle };
export { C as routeIPToIPC };
export { extensionTableCheckboxSx as routeIPToIPCheckboxSx };

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

export const routeIPToIPInputInteraction = {
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

export const routeIPToIPInputStyle = {
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

export const routeIPToIPSelectStyle = {
  ...routeIPToIPInputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
};

export const routeIPToIPFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

export const formatRouteIPToIPTooltipTitle = (text) => {
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

export const RouteIPToIPFieldLabel = ({
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
      title={formatRouteIPToIPTooltipTitle(tooltip)}
      {...FIELD_TOOLTIP_PROPS}
    >
      {labelNode}
    </Tooltip>
  );
};

export const RouteIPToIPFieldRow = ({
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
    <RouteIPToIPFieldLabel
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
    </RouteIPToIPFieldLabel>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);


export const RouteIPToIPBreadcrumb = () => (
  <E1PriBreadcrumb
    root="E1-PRI"
    section={ROUTE_IP_IP_PAGE_BREADCRUMB_SECTION}
    current={ROUTE_IP_IP_PAGE_TITLE}
  />
);

export const routeIPToIPDialogConfig = {
  dialogSx: e1PriDialogSx,
  paperSx: createE1PriDialogPaperSx(600),
  modalTitleStyle: e1PriModalTitleStyle,
};

export const RouteIPToIPModalForm = ({
  formData,
  handleInputChange,
  sipTrunkGroups,
  validationMessage,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    {validationMessage && (
      <Alert severity="warning" sx={{ fontSize: 13, mb: 1 }}>
        {validationMessage}
      </Alert>
    )}
    <div style={routeIPToIPFormPanelStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {ROUTE_IP_IP_FIELDS.map((field) => (
          <RouteIPToIPFieldRow
            key={field.key}
            label={`${field.label}:`}
            tooltipKey={field.key}
            tooltips={ROUTE_IP_IP_FIELD_TOOLTIPS}
          >
            {field.type === "select" ? (
              <select
                value={formData[field.key] || ""}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                style={routeIPToIPSelectStyle}
                {...routeIPToIPInputInteraction}
              >
                <option value="" disabled>
                  Please select
                </option>
                {field.key === "callSource" ||
                field.key === "callDestination" ? (
                  sipTrunkGroups.length > 0 ? (
                    sipTrunkGroups.map((g) => {
                      const id = groupOptionId(g);
                      const isDisabled =
                        (field.key === "callSource" &&
                          id === formData.callDestination &&
                          id !== "") ||
                        (field.key === "callDestination" &&
                          id === formData.callSource &&
                          id !== "");
                      return (
                        <option
                          key={String(id) || "any"}
                          value={String(id)}
                          disabled={isDisabled}
                        >
                          SIP Trunk Group [{String(id) || "Any"}]
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
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                style={routeIPToIPInputStyle}
                {...routeIPToIPInputInteraction}
              />
            )}
          </RouteIPToIPFieldRow>
        ))}
      </div>
    </div>
  </div>
);
