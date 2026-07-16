import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as modificationRecordPageWrapStyle,
  extensionPageInnerStyle as modificationRecordPageInnerStyle,
  extensionCardStyle as modificationRecordCardStyle,
  extensionToolbarStyle as modificationRecordToolbarStyle,
  extensionFixedAlertSx as modificationRecordFixedAlertSx,
  extensionCancelBtnStyle as modificationRecordCancelBtnStyle,
  extensionPrimaryBtnStyle as modificationRecordPrimaryBtnStyle,
  addNewModalFooterBtnStyle as modificationRecordFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export const modificationRecordTableContainerStyle = {
  ...modificationRecordCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const modificationRecordHeaderStyle = {
  ...modificationRecordToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export {
  CARD_RADIUS,
  modificationRecordPageWrapStyle,
  modificationRecordPageInnerStyle,
  modificationRecordCardStyle,
  modificationRecordToolbarStyle,
  modificationRecordFixedAlertSx,
  modificationRecordCancelBtnStyle,
  modificationRecordPrimaryBtnStyle,
  modificationRecordFooterBtnStyle,
};
