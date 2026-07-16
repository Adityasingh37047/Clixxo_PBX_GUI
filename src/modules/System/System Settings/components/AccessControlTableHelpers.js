import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as accessControlPageWrapStyle,
  extensionPageInnerStyle as accessControlPageInnerStyle,
  extensionCardStyle as accessControlCardStyle,
  extensionToolbarStyle as accessControlToolbarStyle,
  extensionFixedAlertSx as accessControlFixedAlertSx,
  extensionCancelBtnStyle as accessControlCancelBtnStyle,
  extensionPrimaryBtnStyle as accessControlPrimaryBtnStyle,
  addNewModalFooterBtnStyle,
  extensionSelectedBadgeStyle as accessControlSelectedBadgeStyle,
  extensionModalCancelBtnStyle as accessControlModalCancelBtnStyle,
  tdStyle,
  getExtensionTdStyle as getAccessControlTdStyle,
  getExtensionRowBg as getAccessControlRowBg,
  extensionTableCheckboxSx,
  TH,
} from "../../../../components/common";

export const FIELD_RADIUS = 4;

/** Preserve original Access Control checkbox icon size on top of shared sx. */
export const accessControlCheckboxSx = {
  ...extensionTableCheckboxSx,
  "& .MuiSvgIcon-root": { fontSize: 18 },
};

export {
  CARD_RADIUS,
  accessControlPageWrapStyle,
  accessControlPageInnerStyle,
  accessControlCardStyle,
  accessControlToolbarStyle,
  accessControlFixedAlertSx,
  accessControlCancelBtnStyle,
  accessControlPrimaryBtnStyle,
  addNewModalFooterBtnStyle,
  accessControlSelectedBadgeStyle,
  accessControlModalCancelBtnStyle,
  tdStyle,
  getAccessControlTdStyle,
  getAccessControlRowBg,
  TH,
};
