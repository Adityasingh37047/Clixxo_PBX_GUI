import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as licencePageWrapStyle,
  extensionPageInnerStyle as licencePageInnerStyle,
  extensionCardStyle as licenceCardStyle,
  extensionToolbarStyle as licenceToolbarStyle,
  extensionFixedAlertSx as licenceFixedAlertSx,
  extensionCancelBtnStyle as licenceCancelBtnStyle,
  extensionPrimaryBtnStyle as licencePrimaryBtnStyle,
  addNewModalFooterBtnStyle as licenceFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export const FIELD_RADIUS = 6;

export const licenceTableContainerStyle = {
  ...licenceCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const licenceHeaderStyle = {
  ...licenceToolbarStyle,
  justifyContent: "space-between",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export {
  CARD_RADIUS,
  licencePageWrapStyle,
  licencePageInnerStyle,
  licenceCardStyle,
  licenceToolbarStyle,
  licenceFixedAlertSx,
  licenceCancelBtnStyle,
  licencePrimaryBtnStyle,
  licenceFooterBtnStyle,
};
