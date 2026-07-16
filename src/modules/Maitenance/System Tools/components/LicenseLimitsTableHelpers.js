import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as licenseLimitsPageWrapStyle,
  extensionPageInnerStyle as licenseLimitsPageInnerStyle,
  extensionCardStyle as licenseLimitsCardStyle,
  extensionToolbarStyle as licenseLimitsToolbarStyle,
  extensionFixedAlertSx as licenseLimitsFixedAlertSx,
  extensionCancelBtnStyle as licenseLimitsCancelBtnStyle,
  extensionPrimaryBtnStyle as licenseLimitsPrimaryBtnStyle,
  addNewModalFooterBtnStyle as licenseLimitsFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export const FIELD_RADIUS = 6;

export const licenseLimitsTableContainerStyle = {
  ...licenseLimitsCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const licenseLimitsHeaderStyle = {
  ...licenseLimitsToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export {
  CARD_RADIUS,
  licenseLimitsPageWrapStyle,
  licenseLimitsPageInnerStyle,
  licenseLimitsCardStyle,
  licenseLimitsToolbarStyle,
  licenseLimitsFixedAlertSx,
  licenseLimitsCancelBtnStyle,
  licenseLimitsPrimaryBtnStyle,
  licenseLimitsFooterBtnStyle,
};
