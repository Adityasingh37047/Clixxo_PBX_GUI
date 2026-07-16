import { C } from "../../../../theme/pbxTokens";

import { extensionToolbarStyle as fxsToolbarStyle } from "../../../../components/common";

export const fxsFormInlineFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
};

export { EXTENSION_TABLE_CARD_RADIUS as CDR_QUERY_CARD_RADIUS, extensionPageWrapStyle as cdrQueryPageWrapStyle, extensionPageInnerStyle as cdrQueryPageInnerStyle, extensionCardStyle as cdrQueryTableContainerStyle, addNewModalFooterBtnStyle as cdrQueryFormBtnStyle, extensionFixedAlertSx as cdrQueryFixedAlertSx } from "../../../../components/common";

export { fxsFormInlineFooterStyle as cdrQueryFooterStyle };





export const cdrQueryFieldBg = "#ffffff";

export const cdrQueryCardTitleBarStyle = {
  ...fxsToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export const cdrQueryFormBodyStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px 36px 24px",
  width: "100%",
  boxSizing: "border-box",
};

export const cdrQueryFieldsColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  width: "fit-content",
  maxWidth: "100%",
};
