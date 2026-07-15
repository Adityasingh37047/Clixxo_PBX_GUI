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

export { EXTENSION_TABLE_CARD_RADIUS as ACTION_URL_CARD_RADIUS, extensionPageWrapStyle as actionUrlPageWrapStyle, extensionPageInnerStyle as actionUrlPageInnerStyle, extensionCardStyle as actionUrlTableContainerStyle, addNewModalFooterBtnStyle as actionUrlFormBtnStyle, extensionFixedAlertSx as actionUrlFixedAlertSx } from "../../../../components/common";

export { fxsFormInlineFooterStyle as actionUrlFooterStyle };





export const actionUrlFieldBg = "#ffffff";

export const actionUrlCardTitleBarStyle = {
  ...fxsToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export const actionUrlDashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
};

const actionUrlDashboardColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: "20px 36px 20px",
};

export const actionUrlDashboardColumnLeftStyle = {
  ...actionUrlDashboardColumnStyle,
  background: C.cardBg,
};

export const actionUrlDashboardColumnRightStyle = {
  ...actionUrlDashboardColumnStyle,
  background: C.cardBg,
};

export const actionUrlDashboardDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

export const actionUrlDashboardDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

export const actionUrlFieldsColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  width: "100%",
};
