import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as certificatePageWrapStyle,
  extensionPageInnerStyle as certificatePageInnerStyle,
  extensionCardStyle as certificateCardStyle,
  extensionToolbarStyle as certificateToolbarStyle,
  extensionFixedAlertSx as certificateFixedAlertSx,
  extensionCancelBtnStyle as certificateCancelBtnStyle,
  extensionPrimaryBtnStyle as certificatePrimaryBtnStyle,
  addNewModalFooterBtnStyle as certificateFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export const FIELD_RADIUS = 6;

export const certificateTableContainerStyle = {
  ...certificateCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const certificateHeaderStyle = {
  ...certificateToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export {
  CARD_RADIUS,
  certificatePageWrapStyle,
  certificatePageInnerStyle,
  certificateCardStyle,
  certificateToolbarStyle,
  certificateFixedAlertSx,
  certificateCancelBtnStyle,
  certificatePrimaryBtnStyle,
  certificateFooterBtnStyle,
};
