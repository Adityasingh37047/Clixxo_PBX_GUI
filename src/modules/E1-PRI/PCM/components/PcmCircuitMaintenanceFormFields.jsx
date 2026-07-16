import React from "react";
import {
  PCM_CIRCUIT_MAINTENANCE_PAGE_BREADCRUMB_ROOT,
  PCM_CIRCUIT_MAINTENANCE_PAGE_BREADCRUMB_SECTION,
  PCM_CIRCUIT_MAINTENANCE_PAGE_TITLE,
} from "../../../../constants/PcmCircuitMaintenanceConstants";
import {
  PcmSharedTH,
  PcmSharedFieldLabel,
  PcmSharedFieldRow,
  pcmSharedTdStyle,
  pcmSharedC,
  pcmSharedCardStyle,
  pcmSharedToolbarStyle,
  pcmSharedCheckboxSx,
  pcmSharedAddNewModalFooterStyle,
  pcmSharedAddNewModalFooterBtnStyle,
  pcmSharedAddNewModalFooterCancelBtnStyle,
  pcmSharedFormPanelStyle,
  pcmSharedInputStyle,
  pcmSharedSelectStyle,
  pcmSharedInputInteraction,
  pcmSharedFixedAlertSx,
  PcmSharedTableListLoading,
  PcmSharedTableListEmptyState,
  PcmSharedPagination,
  createPcmSharedDialogConfig,
  createPcmSharedBreadcrumb,
  PCM_SHARED_COMPACT_MQ,
  ExtensionCodecDualList,
} from "./PcmSharedFormFields";

export const TH = PcmSharedTH;
export const C = pcmSharedC;
export const tdStyle = pcmSharedTdStyle;
export const checkboxSx = pcmSharedCheckboxSx;
export const PCM_CIRCUIT_MAINTENANCE_COMPACT_MQ = PCM_SHARED_COMPACT_MQ;
export { ExtensionCodecDualList };
export { PcmSharedFieldLabel as PcmCircuitMaintenanceFieldLabel };
export { PcmSharedFieldRow as PcmCircuitMaintenanceFieldRow };
export {
  pcmSharedFormPanelStyle as pcmCircuitMaintenanceFormPanelStyle,
  pcmSharedInputStyle as pcmCircuitMaintenanceInputStyle,
  pcmSharedSelectStyle as pcmCircuitMaintenanceSelectStyle,
  pcmSharedInputInteraction as pcmCircuitMaintenanceInputInteraction,
  pcmSharedAddNewModalFooterStyle as pcmCircuitMaintenanceAddNewModalFooterStyle,
  pcmSharedAddNewModalFooterBtnStyle as pcmCircuitMaintenanceAddNewModalFooterBtnStyle,
  pcmSharedAddNewModalFooterCancelBtnStyle as pcmCircuitMaintenanceAddNewModalFooterCancelBtnStyle,
  pcmSharedCardStyle as pcmCircuitMaintenanceCardStyle,
  pcmSharedToolbarStyle as pcmCircuitMaintenanceToolbarStyle,
  pcmSharedFixedAlertSx as pcmCircuitMaintenanceFixedAlertSx,
  PcmSharedTableListLoading as PcmCircuitMaintenanceTableListLoading,
  PcmSharedTableListEmptyState as PcmCircuitMaintenanceTableListEmptyState,
  PcmSharedPagination as PcmCircuitMaintenancePagination,
};

export const PcmCircuitMaintenanceBreadcrumb = createPcmSharedBreadcrumb(
  PCM_CIRCUIT_MAINTENANCE_PAGE_BREADCRUMB_ROOT,
  PCM_CIRCUIT_MAINTENANCE_PAGE_BREADCRUMB_SECTION,
  PCM_CIRCUIT_MAINTENANCE_PAGE_TITLE,
);

export const pcmCircuitMaintenanceDialogConfig = createPcmSharedDialogConfig(600);
