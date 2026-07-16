import React from "react";
import {
  PCM_PSTN_PAGE_BREADCRUMB_ROOT,
  PCM_PSTN_PAGE_BREADCRUMB_SECTION,
  PCM_PSTN_PAGE_TITLE,
} from "../../../../constants/PcmPstnConstants";
import {
  PcmSharedBtn,
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

export { PcmSharedBtn as Btn, PcmSharedTH as TH, pcmSharedC as C };
export const tdStyle = pcmSharedTdStyle;
export const checkboxSx = pcmSharedCheckboxSx;
export const PCM_PSTN_COMPACT_MQ = PCM_SHARED_COMPACT_MQ;
export { ExtensionCodecDualList };
export { PcmSharedFieldLabel as PcmPstnFieldLabel };
export { PcmSharedFieldRow as PcmPstnFieldRow };
export {
  pcmSharedFormPanelStyle as pcmPstnFormPanelStyle,
  pcmSharedInputStyle as pcmPstnInputStyle,
  pcmSharedSelectStyle as pcmPstnSelectStyle,
  pcmSharedInputInteraction as pcmPstnInputInteraction,
  pcmSharedAddNewModalFooterStyle as pcmPstnAddNewModalFooterStyle,
  pcmSharedAddNewModalFooterBtnStyle as pcmPstnAddNewModalFooterBtnStyle,
  pcmSharedAddNewModalFooterCancelBtnStyle as pcmPstnAddNewModalFooterCancelBtnStyle,
  pcmSharedCardStyle as pcmPstnCardStyle,
  pcmSharedToolbarStyle as pcmPstnToolbarStyle,
  pcmSharedFixedAlertSx as pcmPstnFixedAlertSx,
  PcmSharedTableListLoading as PcmPstnTableListLoading,
  PcmSharedTableListEmptyState as PcmPstnTableListEmptyState,
  PcmSharedPagination as PcmPstnPagination,
};

export const PcmPstnBreadcrumb = createPcmSharedBreadcrumb(
  PCM_PSTN_PAGE_BREADCRUMB_ROOT,
  PCM_PSTN_PAGE_BREADCRUMB_SECTION,
  PCM_PSTN_PAGE_TITLE,
);

export const pcmPstnDialogConfig = createPcmSharedDialogConfig(720);
