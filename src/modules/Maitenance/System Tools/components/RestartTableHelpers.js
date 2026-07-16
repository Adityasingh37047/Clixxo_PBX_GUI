import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as restartPageWrapStyle,
  extensionPageInnerStyle as restartPageInnerStyle,
  extensionCardStyle as restartCardStyle,
  extensionToolbarStyle as restartToolbarStyle,
  extensionFixedAlertSx as restartFixedAlertSx,
  extensionCancelBtnStyle as restartCancelBtnStyle,
  extensionPrimaryBtnStyle as restartPrimaryBtnStyle,
  addNewModalFooterBtnStyle as restartFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export const restartTableContainerStyle = {
  ...restartCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const restartHeaderStyle = {
  ...restartToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export {
  CARD_RADIUS,
  restartPageWrapStyle,
  restartPageInnerStyle,
  restartCardStyle,
  restartToolbarStyle,
  restartFixedAlertSx,
  restartCancelBtnStyle,
  restartPrimaryBtnStyle,
  restartFooterBtnStyle,
};
