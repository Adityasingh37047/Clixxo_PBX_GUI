import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as backupUploadPageWrapStyle,
  extensionPageInnerStyle as backupUploadPageInnerStyle,
  extensionCardStyle as backupUploadCardStyle,
  extensionToolbarStyle as backupUploadToolbarStyle,
  extensionFixedAlertSx as backupUploadFixedAlertSx,
  extensionCancelBtnStyle as backupUploadCancelBtnStyle,
  extensionPrimaryBtnStyle as backupUploadPrimaryBtnStyle,
  addNewModalFooterBtnStyle as backupUploadFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export const backupUploadTableContainerStyle = {
  ...backupUploadCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const backupUploadHeaderStyle = {
  ...backupUploadToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export {
  CARD_RADIUS,
  backupUploadPageWrapStyle,
  backupUploadPageInnerStyle,
  backupUploadCardStyle,
  backupUploadToolbarStyle,
  backupUploadFixedAlertSx,
  backupUploadCancelBtnStyle,
  backupUploadPrimaryBtnStyle,
  backupUploadFooterBtnStyle,
};
