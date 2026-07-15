import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as sqlUploadPageWrapStyle,
  extensionPageInnerStyle as sqlUploadPageInnerStyle,
  extensionCardStyle as sqlUploadCardStyle,
  extensionToolbarStyle as sqlUploadToolbarStyle,
  extensionFixedAlertSx as sqlUploadFixedAlertSx,
  extensionCancelBtnStyle as sqlUploadCancelBtnStyle,
  extensionPrimaryBtnStyle as sqlUploadPrimaryBtnStyle,
  addNewModalFooterBtnStyle as sqlUploadFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export const sqlUploadTableContainerStyle = {
  ...sqlUploadCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const sqlUploadHeaderStyle = {
  ...sqlUploadToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export {
  CARD_RADIUS,
  sqlUploadPageWrapStyle,
  sqlUploadPageInnerStyle,
  sqlUploadCardStyle,
  sqlUploadToolbarStyle,
  sqlUploadFixedAlertSx,
  sqlUploadCancelBtnStyle,
  sqlUploadPrimaryBtnStyle,
  sqlUploadFooterBtnStyle,
};
