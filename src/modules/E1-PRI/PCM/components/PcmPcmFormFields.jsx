import React from "react";

export {
  PcmSharedBtn as PcmPcmBtn,
  PcmSharedTH as PcmPcmTH,
  PcmSharedFieldRow as PcmPcmFieldRow,
  pcmSharedFormPanelStyle as pcmPcmFormPanelStyle,
  pcmSharedInputStyle as pcmPcmInputStyle,
  pcmSharedSelectStyle as pcmPcmSelectStyle,
  pcmSharedInputInteraction as pcmPcmInputInteraction,
  pcmSharedAddNewModalFooterStyle as pcmPcmAddNewModalFooterStyle,
  pcmSharedAddNewModalFooterBtnStyle as pcmPcmAddNewModalFooterBtnStyle,
  pcmSharedTdStyle as pcmPcmTdStyle,
  pcmSharedC as pcmPcmC,
  pcmSharedCardStyle as pcmPcmCardStyle,
  pcmSharedToolbarStyle as pcmPcmToolbarStyle,
  PCM_SHARED_COMPACT_MQ as PCM_PCM_COMPACT_MQ,
  createPcmSharedDialogConfig,
  createPcmSharedBreadcrumb,
} from "./PcmSharedFormFields";

import {
  createPcmSharedBreadcrumb as createBreadcrumb,
  createPcmSharedDialogConfig,
  PcmSharedFieldRow,
} from "./PcmSharedFormFields";
import {
  PCM_PCM_FIELD_TOOLTIPS,
  PCM_PCM_PAGE_BREADCRUMB_ROOT,
  PCM_PCM_PAGE_BREADCRUMB_SECTION,
  PCM_PCM_PAGE_TITLE,
} from "../../../../constants/PcmPcmConstants";

export const PcmPcmBreadcrumb = createBreadcrumb(
  PCM_PCM_PAGE_BREADCRUMB_ROOT,
  PCM_PCM_PAGE_BREADCRUMB_SECTION,
  PCM_PCM_PAGE_TITLE,
);

export const pcmPcmDialogConfig = createPcmSharedDialogConfig(560);

export const pcmPcmCheckboxSx = {
  color: "#6b7280",
  "&.Mui-checked": { color: "#3E5475" },
  padding: 0,
};

export const PcmPcmLabeledRow = ({ label, tooltipKey, children }) => (
  <PcmSharedFieldRow
    label={label}
    tooltipKey={tooltipKey}
    tooltips={PCM_PCM_FIELD_TOOLTIPS}
  >
    {children}
  </PcmSharedFieldRow>
);
