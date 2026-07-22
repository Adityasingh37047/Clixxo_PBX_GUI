import React from "react";
import {
  ROUTE_IP_PSTN_PAGE_BREADCRUMB_SECTION, ROUTE_IP_PSTN_PAGE_TITLE, ROUTE_IP_PSTN_FIELD_TOOLTIPS } from "../../../../constants/RouteIPtoPstnConstants";
import { Checkbox, Tooltip } from "@mui/material";

import { OUTLINED_BORDER, OUTLINED_FOCUS, OUTLINED_HOVER, FOCUS_RING_SHADOW, C } from "../../../../theme/pbxTokens";
import { Btn, TH, ExtensionBreadcrumb as FxsBreadcrumb, addNewModalFooterStyle as fxsAddNewModalFooterStyle, addNewModalFooterBtnStyle as fxsAddNewModalFooterBtnStyle, addNewModalFooterCancelBtnStyle as fxsAddNewModalFooterCancelBtnStyle,
  extensionTableCheckboxSx as routeIpToTelCheckboxSx,
} from "../../../../components/common";

export { routeIpToTelCheckboxSx };

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


export { Btn as RouteIpToTelBtn };
export { TH as RouteIpToTelTH };

export const fxsRouteIpToTelAddNewDialogSx = fxsDialogSx;
export const fxsRouteIpToTelAddNewDialogPaperSx = createFxsDialogPaperSx(600);

export const routeIpToTelAddNewModalFooterStyle = fxsAddNewModalFooterStyle;
export const routeIpToTelAddNewModalFooterBtnStyle = fxsAddNewModalFooterBtnStyle;
export const routeIpToTelAddNewModalFooterCancelBtnStyle =
  fxsAddNewModalFooterCancelBtnStyle;
export const routeIpToTelAddNewModalBackdropSlotProps = fxsModalBackdropSlotProps;
export const routeIpToTelAddNewModalDialogContentSx = fxsModalDialogContentSx;
export const routeIpToTelModalTitleStyle = fxsModalTitleStyle;

export const routeIpToTelFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
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

export const formatRouteIpToTelFieldTooltipTitle = (text) => {
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

export const RouteIpToTelFieldLabel = ({
  tooltipKey,
  tooltips,
  children,
  style = {},
}) => {
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
    <Tooltip
      title={formatRouteIpToTelFieldTooltipTitle(tooltip)}
      {...FIELD_TOOLTIP_PROPS}
    >
      {labelNode}
    </Tooltip>
  );
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

export const routeIpToTelNativeFieldInteraction = {
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

export const routeIpToTelNativeFieldInputStyle = {
  height: 32,
  width: 200,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: "#1f2937",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const routeIpToTelNativeFieldSelectStyle = {
  width: routeIpToTelNativeFieldInputStyle.width,
  height: 32,
  minHeight: 32,
  padding: "0 28px 0 10px",
  fontSize: routeIpToTelNativeFieldInputStyle.fontSize,
  lineHeight: 1.35,
  border: routeIpToTelNativeFieldInputStyle.border,
  borderRadius: routeIpToTelNativeFieldInputStyle.borderRadius,
  outline: routeIpToTelNativeFieldInputStyle.outline,
  backgroundColor: routeIpToTelNativeFieldInputStyle.backgroundColor,
  color: routeIpToTelNativeFieldInputStyle.color,
  boxSizing: routeIpToTelNativeFieldInputStyle.boxSizing,
  transition: routeIpToTelNativeFieldInputStyle.transition,
  appearance: "auto",
};

export const routeIpToTelInputStyle = {
  ...routeIpToTelNativeFieldInputStyle,
  width: "100%",
};

export const routeIpToTelSelectStyle = {
  ...routeIpToTelNativeFieldSelectStyle,
  width: "100%",
};



export const RouteIpToTelBreadcrumb = () => (
  <FxsBreadcrumb root="FXS"
    section={ROUTE_IP_PSTN_PAGE_BREADCRUMB_SECTION}
    current={ROUTE_IP_PSTN_PAGE_TITLE}
  />
);

export const RouteIpToTelFieldRow = ({
  label,
  tooltipKey,
  tooltips = ROUTE_IP_PSTN_FIELD_TOOLTIPS,
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
    <RouteIpToTelFieldLabel
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
    </RouteIpToTelFieldLabel>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

export const RouteIpToTelModalForm = ({
  indexSelect,
  editIndex,
  formData,
  pcmTrunkGroups,
  getAvailableIndices,
  handleIndexSelectChange,
  handleInputChange,
  setFormData,
}) => (
  <div style={routeIpToTelFormPanelStyle}>
    <RouteIpToTelFieldRow label="Index:" tooltipKey="index">
      <select
        value={indexSelect || ""}
        onChange={(e) => handleIndexSelectChange(e.target.value)}
        style={routeIpToTelSelectStyle}
        {...routeIpToTelNativeFieldInteraction}
      >
        {getAvailableIndices(editIndex).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </RouteIpToTelFieldRow>

    <RouteIpToTelFieldRow label="Description:" tooltipKey="description">
      <input
        type="text"
        name="description"
        value={formData.description || ""}
        onChange={handleInputChange}
        style={routeIpToTelInputStyle}
        {...routeIpToTelNativeFieldInteraction}
      />
    </RouteIpToTelFieldRow>

    <RouteIpToTelFieldRow label="Source IP:" tooltipKey="sourceIP">
      <div style={{ width: "100%" }}>
        <input
          type="text"
          name="sourceIP"
          value={formData.sourceIP || ""}
          onChange={handleInputChange}
          style={routeIpToTelInputStyle}
          {...routeIpToTelNativeFieldInteraction}
        />
        <div style={{ color: C.amber, fontSize: 11, marginTop: 4 }}>
          We suggest you input Source IP here.
        </div>
      </div>
    </RouteIpToTelFieldRow>

    <RouteIpToTelFieldRow label="CallerID Prefix:" tooltipKey="callerIdPrefix">
      <input
        type="text"
        name="callerIdPrefix"
        value={formData.callerIdPrefix || ""}
        onChange={handleInputChange}
        style={routeIpToTelInputStyle}
        {...routeIpToTelNativeFieldInteraction}
      />
    </RouteIpToTelFieldRow>

    <RouteIpToTelFieldRow label="CalleeID Prefix:" tooltipKey="calleeIdPrefix">
      <input
        type="text"
        name="calleeIdPrefix"
        value={formData.calleeIdPrefix || ""}
        onChange={handleInputChange}
        style={routeIpToTelInputStyle}
        {...routeIpToTelNativeFieldInteraction}
      />
    </RouteIpToTelFieldRow>

    <RouteIpToTelFieldRow label="Route by Number:" tooltipKey="routeByNumber">
      <label
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: 13,
          color: "#1f2937",
          cursor: "pointer",
        }}
      >
        <Checkbox
          size="small"
          name="routeByNumber"
          checked={formData.routeByNumber || false}
          onChange={handleInputChange}
          sx={routeIpToTelCheckboxSx}
        />
        Enable
      </label>
    </RouteIpToTelFieldRow>

    {formData.routeByNumber && (
      <RouteIpToTelFieldRow label="Call Destination:" tooltipKey="callDestination">
        <select
          value={formData.callDestination || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              callDestination: e.target.value,
            }))
          }
          style={routeIpToTelSelectStyle}
          {...routeIpToTelNativeFieldInteraction}
        >
          <option value="">Select</option>
          {(pcmTrunkGroups || []).map((group) => {
            const groupId = group.group_id ?? group.id ?? group;
            return (
              <option key={String(groupId)} value={String(groupId)}>
                PCM Trunk Group [{String(groupId)}]
              </option>
            );
          })}
        </select>
      </RouteIpToTelFieldRow>
    )}
  </div>
);
