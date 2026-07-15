import React from "react";
import { Alert } from "@mui/material";
import {
  ROUTE_IP_IP_FIELDS,
  ROUTE_IP_IP_FIELD_TOOLTIPS,
  ROUTE_IP_IP_PAGE_BREADCRUMB_SECTION,
  ROUTE_IP_IP_PAGE_TITLE,
} from "../../../../constants/RouteIPIPConstants";
import { groupOptionId } from "../utils/RouteIPToIPTransformers";
import {
  RouteSharedBtn,
  RouteSharedFieldRow,
  RouteSharedTH,
  RouteSharedTableListEmptyState,
  RouteSharedTableListLoading,
  RouteSharedPagination,
  createRouteSharedBreadcrumb,
  createRouteSharedDialogConfig,
  routeSharedAddNewModalBackdropSlotProps,
  routeSharedAddNewModalDialogContentSx,
  routeSharedAddNewModalFooterBtnStyle,
  routeSharedAddNewModalFooterCancelBtnStyle,
  routeSharedAddNewModalFooterStyle,
  routeSharedCardStyle,
  routeSharedCheckboxSx,
  routeSharedFormPanelStyle,
  routeSharedInputInteraction,
  routeSharedInputStyle,
  routeSharedPageBadgeStyle,
  routeSharedPaginationStyle,
  routeSharedPrimaryBtnStyle,
  routeSharedCancelBtnStyle,
  routeSharedSelectStyle,
  routeSharedTdStyle,
  routeSharedToolbarBtnStyle,
  routeSharedToolbarStyle,
} from "./RouteSharedFormFields";

export {
  RouteSharedBtn as RouteIPToIPBtn,
  RouteSharedTH as RouteIPToIPTH,
  RouteSharedTableListLoading as RouteIPToIPTableListLoading,
  RouteSharedTableListEmptyState as RouteIPToIPTableListEmptyState,
  RouteSharedPagination as RouteIPToIPPagination,
  routeSharedCardStyle as routeIPToIPCardStyle,
  routeSharedToolbarStyle as routeIPToIPToolbarStyle,
  routeSharedPaginationStyle as routeIPToIPPaginationStyle,
  routeSharedAddNewModalFooterStyle as routeIPToIPAddNewModalFooterStyle,
  routeSharedAddNewModalFooterBtnStyle as routeIPToIPAddNewModalFooterBtnStyle,
  routeSharedAddNewModalFooterCancelBtnStyle as routeIPToIPAddNewModalFooterCancelBtnStyle,
  routeSharedAddNewModalBackdropSlotProps as routeIPToIPAddNewModalBackdropSlotProps,
  routeSharedAddNewModalDialogContentSx as routeIPToIPAddNewModalDialogContentSx,
  routeSharedCheckboxSx as routeIPToIPCheckboxSx,
  routeSharedTdStyle as routeIPToIPTdStyle,
  routeSharedPageBadgeStyle as routeIPToIPPageBadgeStyle,
  routeSharedCancelBtnStyle as routeIPToIPCancelBtnStyle,
  routeSharedToolbarBtnStyle as routeIPToIPToolbarBtnStyle,
  routeSharedPrimaryBtnStyle as routeIPToIPPrimaryBtnStyle,
};

export const RouteIPToIPBreadcrumb = createRouteSharedBreadcrumb(
  ROUTE_IP_IP_PAGE_BREADCRUMB_SECTION,
  ROUTE_IP_IP_PAGE_TITLE,
);

export const routeIPToIPDialogConfig = createRouteSharedDialogConfig(600);

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
    <div style={routeSharedFormPanelStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {ROUTE_IP_IP_FIELDS.map((field) => (
          <RouteSharedFieldRow
            key={field.key}
            label={`${field.label}:`}
            tooltipKey={field.key}
            tooltips={ROUTE_IP_IP_FIELD_TOOLTIPS}
          >
            {field.type === "select" ? (
              <select
                value={formData[field.key] || ""}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                style={routeSharedSelectStyle}
                {...routeSharedInputInteraction}
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
                style={routeSharedInputStyle}
                {...routeSharedInputInteraction}
              />
            )}
          </RouteSharedFieldRow>
        ))}
      </div>
    </div>
  </div>
);
