import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as sipToSipPageWrapStyle,
  extensionPageInnerStyle as sipToSipInnerStyle,
  extensionCardStyle as sipToSipCardStyle,
  extensionToolbarStyle as sipToSipToolbarStyle,
  extensionFixedAlertSx as sipToSipFixedAlertSx,
  extensionCancelBtnStyle as sipToSipCancelBtnStyle,
  extensionPrimaryBtnStyle as sipToSipPrimaryBtnStyle,
  extensionSelectedBadgeStyle as sipToSipSelectedBadgeStyle,
  extensionModalCancelBtnStyle as sipToSipModalCancelBtnStyle,
  extensionPaginationStyle as sipToSipPaginationStyle,
  extensionPageBadgeStyle as sipToSipPageBadgeStyle,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  tdStyle,
  getExtensionTdStyle as getSipToSipTdStyle,
  getExtensionRowBg as getSipToSipRowBg,
  extensionTableCheckboxSx as sipToSipTableCheckboxSx,
  TH,
} from "../../../../components/common";
import { C, EXTENSION_COMPACT_MQ } from "../../../../theme/pbxTokens";

export const FIELD_RADIUS = 6;
export const SIP_TO_SIP_TABLE_CARD_RADIUS = CARD_RADIUS;
export const SIP_TO_SIP_ACCOUNT_COMPACT_MQ = EXTENSION_COMPACT_MQ;

export const sipToSipTableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "auto",
  minWidth: 900,
};

export const sipToSipEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export {
  CARD_RADIUS,
  C,
  TH,
  tdStyle,
  sipToSipPageWrapStyle,
  sipToSipInnerStyle,
  sipToSipFixedAlertSx,
  sipToSipCardStyle,
  sipToSipToolbarStyle,
  sipToSipPaginationStyle,
  sipToSipSelectedBadgeStyle,
  sipToSipCancelBtnStyle,
  sipToSipPrimaryBtnStyle,
  sipToSipPageBadgeStyle,
  sipToSipTableCheckboxSx,
  sipToSipModalCancelBtnStyle,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  getSipToSipTdStyle,
  getSipToSipRowBg,
};
