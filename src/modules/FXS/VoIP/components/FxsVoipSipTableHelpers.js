import { EXTENSION_TABLE_CARD_RADIUS as FXS_CARD_RADIUS, extensionCardStyle as fxsCardStyle, extensionFixedAlertSx as fxsFixedAlertSx, extensionPageInnerStyle as fxsPageInnerStyle, extensionPageWrapStyle as fxsPageWrapStyle, addNewModalFooterBtnStyle as fxsFormFooterBtnStyle, extensionCancelBtnStyle as fxsToolbarCancelBtnStyle, extensionPrimaryBtnStyle as fxsToolbarPrimaryBtnStyle } from "../../../../components/common";

import { C } from "../../../../theme/pbxTokens";

export const fxsFormInlineFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
};



export const FXS_VOIP_SIP_CARD_RADIUS = FXS_CARD_RADIUS;
export const FXS_VOIP_SIP_FIELD_RADIUS = 4;
export const FXS_VOIP_SIP_LAPTOP_NARROW_MQ = "(max-width: 1366px)";

export const fxsVoipSipFixedAlertSx = fxsFixedAlertSx;
export const fxsVoipSipPageWrapStyle = fxsPageWrapStyle;
export const fxsVoipSipPageInnerStyle = fxsPageInnerStyle;
export const fxsVoipSipTableContainerStyle = fxsCardStyle;
export const fxsVoipSipFormInlineFooterStyle = fxsFormInlineFooterStyle;
export const fxsVoipSipFormBtnStyle = {
  ...fxsFormFooterBtnStyle,
  minWidth: 100,
};

export const fxsVoipSipCardTitleBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: FXS_VOIP_SIP_CARD_RADIUS,
  borderTopRightRadius: FXS_VOIP_SIP_CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

export const fxsVoipSipDashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
};

export const fxsVoipSipDashboardColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: "16px 36px 20px",
  boxSizing: "border-box",
  background: C.cardBg,
};

export const fxsVoipSipDashboardDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

export const fxsVoipSipDashboardDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

export const fxsVoipSipFieldsColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  width: "100%",
};

export const fxsVoipSipLocalModeBannerStyle = {
  background: "#fffbeb",
  border: "1px solid #fcd34d",
  borderRadius: 6,
  padding: "10px 16px",
  marginBottom: 16,
  fontSize: 12,
  color: C.amber,
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexShrink: 0,
};

export const fxsVoipSipLoadingWrapStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flex: 1,
  padding: 60,
};

export const fxsVoipSipNoteStyle = {
  fontSize: 11,
  color: C.amber,
  marginTop: 16,
  textAlign: "left",
  lineHeight: 1.45,
};

export const fxsToolbarBtnStyle = fxsToolbarCancelBtnStyle;
