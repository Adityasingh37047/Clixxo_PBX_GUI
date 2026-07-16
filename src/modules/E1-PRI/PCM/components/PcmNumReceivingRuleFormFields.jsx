import React from "react";
import {
  PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_ROOT,
  PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_SECTION,
  PCM_NUM_RECEIVING_RULE_PAGE_TITLE,
} from "../../../../constants/PcmNumReceivingRuleConstants";
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
export const PCM_NUM_RECEIVING_RULE_COMPACT_MQ = PCM_SHARED_COMPACT_MQ;
export { ExtensionCodecDualList };
export { PcmSharedFieldLabel as PcmNumReceivingRuleFieldLabel };
export { PcmSharedFieldRow as PcmNumReceivingRuleFieldRow };
export {
  pcmSharedFormPanelStyle as pcmNumReceivingRuleFormPanelStyle,
  pcmSharedInputStyle as pcmNumReceivingRuleInputStyle,
  pcmSharedSelectStyle as pcmNumReceivingRuleSelectStyle,
  pcmSharedInputInteraction as pcmNumReceivingRuleInputInteraction,
  pcmSharedAddNewModalFooterStyle as pcmNumReceivingRuleAddNewModalFooterStyle,
  pcmSharedAddNewModalFooterBtnStyle as pcmNumReceivingRuleAddNewModalFooterBtnStyle,
  pcmSharedAddNewModalFooterCancelBtnStyle as pcmNumReceivingRuleAddNewModalFooterCancelBtnStyle,
  pcmSharedCardStyle as pcmNumReceivingRuleCardStyle,
  pcmSharedToolbarStyle as pcmNumReceivingRuleToolbarStyle,
  pcmSharedFixedAlertSx as pcmNumReceivingRuleFixedAlertSx,
  PcmSharedTableListLoading as PcmNumReceivingRuleTableListLoading,
  PcmSharedTableListEmptyState as PcmNumReceivingRuleTableListEmptyState,
  PcmSharedPagination as PcmNumReceivingRulePagination,
};

export const PcmNumReceivingRuleBreadcrumb = createPcmSharedBreadcrumb(
  PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_ROOT,
  PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_SECTION,
  PCM_NUM_RECEIVING_RULE_PAGE_TITLE,
);

export const pcmNumReceivingRuleDialogConfig = createPcmSharedDialogConfig(600);
