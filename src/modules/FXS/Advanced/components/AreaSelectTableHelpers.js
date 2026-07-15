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

export { EXTENSION_TABLE_CARD_RADIUS as AREA_SELECT_CARD_RADIUS, extensionPageWrapStyle as areaSelectPageWrapStyle, extensionPageInnerStyle as areaSelectPageInnerStyle, extensionCardStyle as areaSelectTableContainerStyle, addNewModalFooterBtnStyle as areaSelectFormBtnStyle, extensionFixedAlertSx as areaSelectFixedAlertSx } from "../../../../components/common";

export { fxsFormInlineFooterStyle as areaSelectFooterStyle };





export const areaSelectFieldBg = "#ffffff";

export const areaSelectCardTitleBarStyle = {
  ...fxsToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export const areaSelectFormBodyStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px 36px 24px",
  width: "100%",
  boxSizing: "border-box",
};
