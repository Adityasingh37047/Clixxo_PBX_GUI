import React from "react";
import { ROUTE_PSTN_IP_PAGE_BREADCRUMB_SECTION, ROUTE_PSTN_IP_PAGE_TITLE, ROUTE_PSTN_IP_FIELD_TOOLTIPS } from "../../../../constants/RoutePstnToIPConstants";
import { ExtensionBreadcrumb as FxsBreadcrumb } from "../../../../components/common";

import {
  RouteIpToTelBtn as RouteTelToIpBtn,
  RouteIpToTelFieldLabel as RouteTelToIpFieldLabel,
  RouteIpToTelFieldRow as RouteTelToIpFieldRow,
  RouteIpToTelTH as RouteTelToIpTH,
  formatRouteIpToTelFieldTooltipTitle as formatRouteTelToIpFieldTooltipTitle,
  fxsRouteIpToTelAddNewDialogPaperSx as fxsRouteTelToIpAddNewDialogPaperSx,
  fxsRouteIpToTelAddNewDialogSx as fxsRouteTelToIpAddNewDialogSx,
  routeIpToTelAddNewModalBackdropSlotProps as routeTelToIpAddNewModalBackdropSlotProps,
  routeIpToTelAddNewModalDialogContentSx as routeTelToIpAddNewModalDialogContentSx,
  routeIpToTelAddNewModalFooterBtnStyle as routeTelToIpAddNewModalFooterBtnStyle,
  routeIpToTelAddNewModalFooterCancelBtnStyle as routeTelToIpAddNewModalFooterCancelBtnStyle,
  routeIpToTelAddNewModalFooterStyle as routeTelToIpAddNewModalFooterStyle,
  routeIpToTelCheckboxSx as routeTelToIpCheckboxSx,
  routeIpToTelFormPanelStyle as routeTelToIpFormPanelStyle,
  routeIpToTelInputStyle as routeTelToIpInputStyle,
  routeIpToTelModalTitleStyle as routeTelToIpModalTitleStyle,
  routeIpToTelNativeFieldInteraction as routeTelToIpNativeFieldInteraction,
  routeIpToTelSelectStyle as routeTelToIpSelectStyle,
} from "./RouteIpToTelFormFields";

export {
  RouteTelToIpBtn,
  RouteTelToIpFieldLabel,
  RouteTelToIpFieldRow,
  RouteTelToIpTH,
  formatRouteTelToIpFieldTooltipTitle,
  fxsRouteTelToIpAddNewDialogPaperSx,
  fxsRouteTelToIpAddNewDialogSx,
  routeTelToIpAddNewModalBackdropSlotProps,
  routeTelToIpAddNewModalDialogContentSx,
  routeTelToIpAddNewModalFooterBtnStyle,
  routeTelToIpAddNewModalFooterCancelBtnStyle,
  routeTelToIpAddNewModalFooterStyle,
  routeTelToIpCheckboxSx,
  routeTelToIpModalTitleStyle,
};

export const RouteTelToIpBreadcrumb = () => (
  <FxsBreadcrumb
    root="FXS"
    section={ROUTE_PSTN_IP_PAGE_BREADCRUMB_SECTION}
    current={ROUTE_PSTN_IP_PAGE_TITLE}
  />
);

export const RouteTelToIpModalForm = ({
  indexSelect,
  editIndex,
  formData,
  portGroups,
  getAvailableIndices,
  handleIndexSelectChange,
  handleInputChange,
  setFormData,
}) => (
  <div style={routeTelToIpFormPanelStyle}>
    <RouteTelToIpFieldRow
      label="Index:"
      tooltipKey="index"
      tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}
    >
      <select
        value={indexSelect || ""}
        onChange={(e) => handleIndexSelectChange(e.target.value)}
        style={routeTelToIpSelectStyle}
        {...routeTelToIpNativeFieldInteraction}
      >
        {getAvailableIndices(editIndex).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </RouteTelToIpFieldRow>

    <RouteTelToIpFieldRow
      label="Description:"
      tooltipKey="description"
      tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}
    >
      <input
        type="text"
        name="description"
        value={formData.description || ""}
        onChange={handleInputChange}
        style={routeTelToIpInputStyle}
        {...routeTelToIpNativeFieldInteraction}
      />
    </RouteTelToIpFieldRow>

    <RouteTelToIpFieldRow
      label="Source Port Group:"
      tooltipKey="sourcePortGroup"
      tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}
    >
      <select
        value={formData.sourcePortGroup || "*"}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            sourcePortGroup: e.target.value,
          }))
        }
        style={routeTelToIpSelectStyle}
        {...routeTelToIpNativeFieldInteraction}
      >
        {portGroups.map((group) => {
          const groupId = group.group_id ?? group.id ?? group;
          return (
            <option key={String(groupId)} value={String(groupId)}>
              {String(groupId)}
            </option>
          );
        })}
      </select>
    </RouteTelToIpFieldRow>

    <RouteTelToIpFieldRow
      label="CallerID Prefix:"
      tooltipKey="callerIdPrefix"
      tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}
    >
      <input
        type="text"
        name="callerIdPrefix"
        value={formData.callerIdPrefix || ""}
        onChange={handleInputChange}
        style={routeTelToIpInputStyle}
        {...routeTelToIpNativeFieldInteraction}
      />
    </RouteTelToIpFieldRow>

    <RouteTelToIpFieldRow
      label="CalleeID Prefix:"
      tooltipKey="calleeIdPrefix"
      tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}
    >
      <input
        type="text"
        name="calleeIdPrefix"
        value={formData.calleeIdPrefix || ""}
        onChange={handleInputChange}
        style={routeTelToIpInputStyle}
        {...routeTelToIpNativeFieldInteraction}
      />
    </RouteTelToIpFieldRow>

    <RouteTelToIpFieldRow
      label="Destination Address:"
      tooltipKey="destinationAddress"
      tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}
    >
      <input
        type="text"
        name="destinationAddress"
        value={formData.destinationAddress || ""}
        onChange={handleInputChange}
        style={routeTelToIpInputStyle}
        {...routeTelToIpNativeFieldInteraction}
      />
    </RouteTelToIpFieldRow>

    <RouteTelToIpFieldRow
      label="Destination Port:"
      tooltipKey="destinationPort"
      tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}
    >
      <input
        type="text"
        name="destinationPort"
        value={formData.destinationPort || ""}
        onChange={handleInputChange}
        style={routeTelToIpInputStyle}
        {...routeTelToIpNativeFieldInteraction}
      />
    </RouteTelToIpFieldRow>
  </div>
);
