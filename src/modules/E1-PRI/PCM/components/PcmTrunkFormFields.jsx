import React from "react";
import { Tooltip } from "@mui/material";
import {
  PCM_TRUNK_PAGE_BREADCRUMB_ROOT,
  PCM_TRUNK_PAGE_BREADCRUMB_SECTION,
  PCM_TRUNK_PAGE_TITLE,
  PCM_TRUNK_FIELD_TOOLTIPS,
} from "../../../../constants/PcmTrunkConstants";
import {
  PcmSharedBtn,
  PcmSharedTH,
  PcmSharedFieldLabel,
  pcmSharedTdStyle,
  pcmSharedC,
  pcmSharedCardStyle,
  pcmSharedToolbarStyle,
  pcmSharedAddNewModalFooterStyle,
  pcmSharedAddNewModalFooterBtnStyle,
  pcmSharedAddNewModalFooterCancelBtnStyle,
  pcmSharedFormPanelStyle,
  pcmSharedSelectStyle,
  pcmSharedInputInteraction,
  createPcmSharedDialogConfig,
  createPcmSharedBreadcrumb,
  PCM_SHARED_COMPACT_MQ,
} from "./PcmSharedFormFields";

export { PcmSharedBtn as Btn, PcmSharedTH as TH, pcmSharedC as C };
export const tdStyle = pcmSharedTdStyle;
export const PCM_TRUNK_COMPACT_MQ = PCM_SHARED_COMPACT_MQ;

export const PcmTrunkBreadcrumb = createPcmSharedBreadcrumb(
  PCM_TRUNK_PAGE_BREADCRUMB_ROOT,
  PCM_TRUNK_PAGE_BREADCRUMB_SECTION,
  PCM_TRUNK_PAGE_TITLE,
);

export const pcmTrunkDialogConfig = createPcmSharedDialogConfig(600);

export const PCM_TRUNK_ADD_NEW_DIALOG_SX = pcmTrunkDialogConfig.dialogSx;
export const PCM_TRUNK_ADD_NEW_DIALOG_PAPER_SX = pcmTrunkDialogConfig.paperSx;

export const CARD_RADIUS = 4;
export const tableContainerStyle = {
  ...pcmSharedCardStyle,
};

export const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
};

export const cellStyle = {
  ...pcmSharedTdStyle,
  background: "#ffffff",
  borderBottom: `1px solid ${pcmSharedC.cardBorder}`,
  borderRight: `1px solid ${pcmSharedC.cardBorder}`,
};

export const pcmTrunkModalFormPanelStyle = pcmSharedFormPanelStyle;
export const addNewModalFooterStyle = pcmSharedAddNewModalFooterStyle;
export const addNewModalFooterBtnStyle = pcmSharedAddNewModalFooterBtnStyle;
export const pcmTrunkModalCancelBtnStyle = {
  ...pcmSharedAddNewModalFooterCancelBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};
export const pcmTrunkSelectStyle = pcmSharedSelectStyle;
export const pcmTrunkInputInteraction = pcmSharedInputInteraction;

export const PcmTrunkFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => (
  <PcmSharedFieldLabel
    tooltipKey={tooltipKey}
    tooltips={tooltips || PCM_TRUNK_FIELD_TOOLTIPS}
    style={style}
  >
    {children}
  </PcmSharedFieldLabel>
);

export {
  pcmSharedCardStyle as pcmTrunkCardStyle,
  pcmSharedToolbarStyle as pcmTrunkToolbarStyle,
};
