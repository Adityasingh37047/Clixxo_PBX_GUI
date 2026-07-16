import React from "react";
import {
  ROUTE_IP_PSTN_FIELDS,
  ROUTE_IP_PSTN_FIELD_TOOLTIPS,
  ROUTE_IP_PSTN_PAGE_BREADCRUMB_SECTION,
  ROUTE_IP_PSTN_PAGE_TITLE,
} from "../../../../constants/RouteIPtoPstnConstants";
import { groupOptionId } from "../utils/RouteIpPstnTransformers";
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
  RouteSharedBtn as RouteIpPstnBtn,
  RouteSharedTH as RouteIpPstnTH,
  RouteSharedTableListLoading as RouteIpPstnTableListLoading,
  RouteSharedTableListEmptyState as RouteIpPstnTableListEmptyState,
  RouteSharedPagination as RouteIpPstnPagination,
  routeSharedCardStyle as routeIpPstnCardStyle,
  routeSharedToolbarStyle as routeIpPstnToolbarStyle,
  routeSharedPaginationStyle as routeIpPstnPaginationStyle,
  routeSharedAddNewModalFooterStyle as routeIpPstnAddNewModalFooterStyle,
  routeSharedAddNewModalFooterBtnStyle as routeIpPstnAddNewModalFooterBtnStyle,
  routeSharedAddNewModalFooterCancelBtnStyle as routeIpPstnAddNewModalFooterCancelBtnStyle,
  routeSharedAddNewModalBackdropSlotProps as routeIpPstnAddNewModalBackdropSlotProps,
  routeSharedAddNewModalDialogContentSx as routeIpPstnAddNewModalDialogContentSx,
  routeSharedCheckboxSx as routeIpPstnCheckboxSx,
  routeSharedTdStyle as routeIpPstnTdStyle,
  routeSharedPageBadgeStyle as routeIpPstnPageBadgeStyle,
  routeSharedCancelBtnStyle as routeIpPstnCancelBtnStyle,
  routeSharedToolbarBtnStyle as routeIpPstnToolbarBtnStyle,
  routeSharedPrimaryBtnStyle as routeIpPstnPrimaryBtnStyle,
};

export const RouteIpPstnBreadcrumb = createRouteSharedBreadcrumb(
  ROUTE_IP_PSTN_PAGE_BREADCRUMB_SECTION,
  ROUTE_IP_PSTN_PAGE_TITLE,
);

export const routeIpPstnDialogConfig = createRouteSharedDialogConfig(600);

export const RouteIpPstnModalForm = ({
  formData,
  setFormData,
  sipTrunkGroups,
  pcmTrunkGroups,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={routeSharedFormPanelStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {ROUTE_IP_PSTN_FIELDS.map((field) => (
          <RouteSharedFieldRow
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
                style={routeSharedSelectStyle}
                {...routeSharedInputInteraction}
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
