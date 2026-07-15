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

export { EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS, extensionPageWrapStyle as advancedPageWrapStyle, extensionPageInnerStyle as advancedPageInnerStyle, extensionCardStyle as advancedTableContainerStyle, addNewModalFooterBtnStyle as advancedFormBtnStyle, extensionFixedAlertSx as fxsFixedAlertSx } from "../../../../components/common";

export { fxsFormInlineFooterStyle as advancedFormInlineFooterStyle };





export const fxsFieldBg = "#ffffff";

export const advancedCardTitleBarStyle = {
  ...fxsToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export const dashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
};

const dashboardColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: "20px 36px 20px",
  boxSizing: "border-box",
};

export const dashboardColumnLeftStyle = {
  ...dashboardColumnStyle,
  background: C.cardBg,
};

export const dashboardColumnRightStyle = {
  ...dashboardColumnStyle,
  background: C.cardBg,
};

export const dashboardDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

export const dashboardDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

export const fxsPageFieldsColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  width: "100%",
};
