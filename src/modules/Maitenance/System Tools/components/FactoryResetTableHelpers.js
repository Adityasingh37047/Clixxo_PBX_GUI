import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as factoryResetPageWrapStyle,
  extensionPageInnerStyle as factoryResetPageInnerStyle,
  extensionCardStyle as factoryResetCardStyle,
  extensionToolbarStyle as factoryResetToolbarStyle,
  extensionFixedAlertSx as factoryResetFixedAlertSx,
  extensionCancelBtnStyle as factoryResetCancelBtnStyle,
  extensionPrimaryBtnStyle as factoryResetPrimaryBtnStyle,
  addNewModalFooterBtnStyle as factoryResetFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export const factoryResetTableContainerStyle = {
  ...factoryResetCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const factoryResetHeaderStyle = {
  ...factoryResetToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export {
  CARD_RADIUS,
  factoryResetPageWrapStyle,
  factoryResetPageInnerStyle,
  factoryResetCardStyle,
  factoryResetToolbarStyle,
  factoryResetFixedAlertSx,
  factoryResetCancelBtnStyle,
  factoryResetPrimaryBtnStyle,
  factoryResetFooterBtnStyle,
};
