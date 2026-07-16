import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as deviceLockPageWrapStyle,
  extensionPageInnerStyle as deviceLockPageInnerStyle,
  extensionCardStyle as deviceLockCardStyle,
  extensionToolbarStyle as deviceLockToolbarStyle,
  extensionFixedAlertSx as deviceLockFixedAlertSx,
  extensionCancelBtnStyle as deviceLockCancelBtnStyle,
  extensionPrimaryBtnStyle as deviceLockPrimaryBtnStyle,
  addNewModalFooterBtnStyle as deviceLockFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export const FIELD_RADIUS = 6;

export const deviceLockTableContainerStyle = {
  ...deviceLockCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const deviceLockHeaderStyle = {
  ...deviceLockToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export {
  CARD_RADIUS,
  deviceLockPageWrapStyle,
  deviceLockPageInnerStyle,
  deviceLockCardStyle,
  deviceLockToolbarStyle,
  deviceLockFixedAlertSx,
  deviceLockCancelBtnStyle,
  deviceLockPrimaryBtnStyle,
  deviceLockFooterBtnStyle,
};
