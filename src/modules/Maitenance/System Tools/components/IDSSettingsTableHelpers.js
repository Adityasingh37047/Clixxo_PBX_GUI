import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as idsPageWrapStyle,
  extensionPageInnerStyle as idsPageInnerStyle,
  extensionCardStyle as idsCardStyle,
  extensionToolbarStyle as idsToolbarStyle,
  extensionFixedAlertSx as idsFixedAlertSx,
  extensionCancelBtnStyle as idsCancelBtnStyle,
  extensionPrimaryBtnStyle as idsPrimaryBtnStyle,
  addNewModalFooterBtnStyle as idsFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export const FIELD_RADIUS = 6;

export const idsTableContainerStyle = {
  ...idsCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const idsHeaderStyle = {
  ...idsToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export {
  CARD_RADIUS,
  idsPageWrapStyle,
  idsPageInnerStyle,
  idsCardStyle,
  idsToolbarStyle,
  idsFixedAlertSx,
  idsCancelBtnStyle,
  idsPrimaryBtnStyle,
  idsFooterBtnStyle,
};
