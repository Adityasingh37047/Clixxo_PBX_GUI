import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as radiusPageWrapStyle,
  extensionPageInnerStyle as radiusPageInnerStyle,
  extensionCardStyle as radiusCardStyle,
  extensionToolbarStyle as radiusToolbarStyle,
  extensionFixedAlertSx as radiusFixedAlertSx,
  extensionCancelBtnStyle as radiusCancelBtnStyle,
  extensionPrimaryBtnStyle as radiusPrimaryBtnStyle,
  addNewModalFooterBtnStyle as radiusFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export const FIELD_RADIUS = 6;

export const radiusTableContainerStyle = {
  ...radiusCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const radiusHeaderStyle = {
  ...radiusToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export {
  CARD_RADIUS,
  radiusPageWrapStyle,
  radiusPageInnerStyle,
  radiusCardStyle,
  radiusToolbarStyle,
  radiusFixedAlertSx,
  radiusCancelBtnStyle,
  radiusPrimaryBtnStyle,
  radiusFooterBtnStyle,
};
