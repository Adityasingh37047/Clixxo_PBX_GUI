import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as networkPageWrapStyle,
  extensionPageInnerStyle as networkPageInnerStyle,
  extensionCardStyle as networkCardStyle,
  extensionToolbarStyle as networkToolbarStyle,
  extensionFixedAlertSx as networkFixedAlertSx,
  extensionCancelBtnStyle as networkCancelBtnStyle,
  extensionPrimaryBtnStyle as networkPrimaryBtnStyle,
  addNewModalFooterBtnStyle as networkFormBtnStyle,
} from "../../../../components/common";

export const FIELD_RADIUS = 6;

/** Same shadow as extensionCardStyle — kept for pages that still reference the name. */
export const NETWORK_CARD_SHADOW =
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)";

export {
  CARD_RADIUS,
  networkPageWrapStyle,
  networkPageInnerStyle,
  networkCardStyle,
  networkToolbarStyle,
  networkFixedAlertSx,
  networkCancelBtnStyle,
  networkPrimaryBtnStyle,
  networkFormBtnStyle,
};
