import { C } from "../../../../theme/pbxTokens";
import {
  EXTENSION_TABLE_CARD_RADIUS as PCM_NUM_RECEIVING_RULE_CARD_RADIUS,
  extensionCancelBtnStyle as pcmNumReceivingRuleCancelBtnStyle,
  extensionFixedAlertSx as pcmNumReceivingRuleFixedAlertSx,
  extensionPageInnerStyle as pcmNumReceivingRulePageInnerStyle,
  extensionPageWrapStyle as pcmNumReceivingRulePageWrapStyle,
  addNewModalFooterBtnStyle as pcmNumReceivingRuleToolbarBtnStyle,
  extensionSelectedBadgeStyle as pcmNumReceivingRuleSelectedBadgeStyle,
  getExtensionRowBg as getPcmNumReceivingRuleRowBg,
} from "../../../../components/common";

export {
  PCM_NUM_RECEIVING_RULE_CARD_RADIUS,
  pcmNumReceivingRuleCancelBtnStyle,
  pcmNumReceivingRuleFixedAlertSx,
  pcmNumReceivingRulePageInnerStyle,
  pcmNumReceivingRulePageWrapStyle,
  pcmNumReceivingRuleToolbarBtnStyle,
  pcmNumReceivingRuleSelectedBadgeStyle,
  getPcmNumReceivingRuleRowBg,
};

export const pcmNumReceivingRuleEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const getPcmNumReceivingRuleEditIconStyle = (loadingDelete = false) => ({
  cursor: loadingDelete ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: loadingDelete ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handlePcmNumReceivingRuleEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const pcmNumReceivingRuleTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
};

export const pcmNumReceivingRuleModalCancelBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

export { C as pcmNumReceivingRuleC };
export { PCM_NUM_RECEIVING_RULE_CARD_RADIUS as CARD_RADIUS };
