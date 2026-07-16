import React from "react";
import {
  ROUTE_PSTN_IP_FIELDS,
  ROUTE_PSTN_IP_FIELD_TOOLTIPS,
  ROUTE_PSTN_IP_PAGE_BREADCRUMB_SECTION,
  ROUTE_PSTN_IP_PAGE_TITLE,
} from "../../../../constants/RoutePstnToIPConstants";
import { groupOptionId } from "../utils/RoutePstnToIpTransformers";
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
  RouteSharedBtn as RoutePstnToIpBtn,
  RouteSharedTH as RoutePstnToIpTH,
  RouteSharedTableListLoading as RoutePstnToIpTableListLoading,
  RouteSharedTableListEmptyState as RoutePstnToIpTableListEmptyState,
  RouteSharedPagination as RoutePstnToIpPagination,
  routeSharedCardStyle as routePstnToIpCardStyle,
  routeSharedToolbarStyle as routePstnToIpToolbarStyle,
  routeSharedPaginationStyle as routePstnToIpPaginationStyle,
  routeSharedAddNewModalFooterStyle as routePstnToIpAddNewModalFooterStyle,
  routeSharedAddNewModalFooterBtnStyle as routePstnToIpAddNewModalFooterBtnStyle,
  routeSharedAddNewModalFooterCancelBtnStyle as routePstnToIpAddNewModalFooterCancelBtnStyle,
  routeSharedAddNewModalBackdropSlotProps as routePstnToIpAddNewModalBackdropSlotProps,
  routeSharedAddNewModalDialogContentSx as routePstnToIpAddNewModalDialogContentSx,
  routeSharedCheckboxSx as routePstnToIpCheckboxSx,
  routeSharedTdStyle as routePstnToIpTdStyle,
  routeSharedPageBadgeStyle as routePstnToIpPageBadgeStyle,
  routeSharedCancelBtnStyle as routePstnToIpCancelBtnStyle,
  routeSharedToolbarBtnStyle as routePstnToIpToolbarBtnStyle,
  routeSharedPrimaryBtnStyle as routePstnToIpPrimaryBtnStyle,
};

export const RoutePstnToIpBreadcrumb = createRouteSharedBreadcrumb(
  ROUTE_PSTN_IP_PAGE_BREADCRUMB_SECTION,
  ROUTE_PSTN_IP_PAGE_TITLE,
);

export const routePstnToIpDialogConfig = createRouteSharedDialogConfig(600);

export const RoutePstnToIpModalForm = ({
  formData,
  setFormData,
  sipTrunkGroups,
  pcmTrunkGroups,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={routeSharedFormPanelStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {ROUTE_PSTN_IP_FIELDS.map((field) => (
          <RouteSharedFieldRow
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
                style={routeSharedSelectStyle}
                {...routeSharedInputInteraction}
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
