import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as configFilePageWrapStyle,
  extensionPageInnerStyle as configFilePageInnerStyle,
  extensionCardStyle as configFileCardStyle,
  extensionToolbarStyle as configFileToolbarStyle,
  extensionFixedAlertSx as configFileFixedAlertSx,
  extensionCancelBtnStyle as configFileCancelBtnStyle,
  extensionPrimaryBtnStyle as configFilePrimaryBtnStyle,
  addNewModalFooterBtnStyle as configFileFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export const FIELD_RADIUS = 6;

export const configFileTableContainerStyle = {
  ...configFileCardStyle,
  width: "100%",
  display: "flex",
  flexDirection: "column",
};

export const configFileHeaderStyle = {
  ...configFileToolbarStyle,
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export {
  CARD_RADIUS,
  configFilePageWrapStyle,
  configFilePageInnerStyle,
  configFileCardStyle,
  configFileToolbarStyle,
  configFileFixedAlertSx,
  configFileCancelBtnStyle,
  configFilePrimaryBtnStyle,
  configFileFooterBtnStyle,
};
