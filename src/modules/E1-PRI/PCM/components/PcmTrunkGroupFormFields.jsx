import React from "react";
import {
  PCM_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT,
  PCM_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION,
  PCM_TRUNK_GROUP_PAGE_TITLE,
} from "../../../../constants/PcmTrunkGroupConstants";
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
export const PCM_TRUNK_GROUP_COMPACT_MQ = PCM_SHARED_COMPACT_MQ;
export { ExtensionCodecDualList };
export { PcmSharedFieldLabel as PcmTrunkGroupFieldLabel };
export { PcmSharedFieldRow as PcmTrunkGroupFieldRow };
export {
  pcmSharedFormPanelStyle as pcmTrunkGroupFormPanelStyle,
  pcmSharedInputStyle as pcmTrunkGroupInputStyle,
  pcmSharedSelectStyle as pcmTrunkGroupSelectStyle,
  pcmSharedInputInteraction as pcmTrunkGroupInputInteraction,
  pcmSharedAddNewModalFooterStyle as pcmTrunkGroupAddNewModalFooterStyle,
  pcmSharedAddNewModalFooterBtnStyle as pcmTrunkGroupAddNewModalFooterBtnStyle,
  pcmSharedAddNewModalFooterCancelBtnStyle as pcmTrunkGroupAddNewModalFooterCancelBtnStyle,
  pcmSharedCardStyle as pcmTrunkGroupCardStyle,
  pcmSharedToolbarStyle as pcmTrunkGroupToolbarStyle,
  pcmSharedFixedAlertSx as pcmTrunkGroupFixedAlertSx,
  PcmSharedTableListLoading as PcmTrunkGroupTableListLoading,
  PcmSharedTableListEmptyState as PcmTrunkGroupTableListEmptyState,
  PcmSharedPagination as PcmTrunkGroupPagination,
};

export const PcmTrunkGroupBreadcrumb = createPcmSharedBreadcrumb(
  PCM_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT,
  PCM_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION,
  PCM_TRUNK_GROUP_PAGE_TITLE,
);

export const pcmTrunkGroupDialogConfig = createPcmSharedDialogConfig(720);
