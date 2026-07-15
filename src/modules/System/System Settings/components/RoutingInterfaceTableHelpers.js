import { C } from "../../../../theme/pbxTokens";
import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as routingPageWrapStyle,
  extensionPageInnerStyle as routingPageInnerStyle,
  extensionCardStyle as routingCardStyle,
  extensionToolbarStyle as routingToolbarStyle,
  extensionFixedAlertSx as routingFixedAlertSx,
  extensionCancelBtnStyle as routingCancelBtnStyle,
  extensionPrimaryBtnStyle as routingPrimaryBtnStyle,
  addNewModalFooterBtnStyle as routingFormBtnStyle,
  tdStyle as routingTdStyle,
  getExtensionRowBg,
} from "../../../../components/common";

export const FIELD_RADIUS = 6;

export const ROUTING_CARD_SHADOW =
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)";

export const tdStyle = {
  ...routingTdStyle,
  textAlign: "center",
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

export const getRoutesTdStyle = (rowBg, lastRowCellStyle, extra = {}) => ({
  ...tdStyle,
  background: rowBg,
  ...lastRowCellStyle,
  ...extra,
});

export const getRoutesRowBg = (_isActive, idx) => getExtensionRowBg(false, idx);

export {
  CARD_RADIUS,
  routingPageWrapStyle,
  routingPageInnerStyle,
  routingCardStyle,
  routingToolbarStyle,
  routingFixedAlertSx,
  routingCancelBtnStyle,
  routingPrimaryBtnStyle,
  routingFormBtnStyle,
};
