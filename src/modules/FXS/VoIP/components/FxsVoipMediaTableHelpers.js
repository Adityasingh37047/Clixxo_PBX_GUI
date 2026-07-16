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



export const FXS_VOIP_MEDIA_CARD_RADIUS = FXS_CARD_RADIUS;
export const FXS_VOIP_MEDIA_FIELD_RADIUS = 6;
export const FXS_VOIP_MEDIA_LAPTOP_NARROW_MQ = "(max-width: 1366px)";

export const fxsVoipMediaFixedAlertSx = fxsFixedAlertSx;
export const fxsVoipMediaPageWrapStyle = fxsPageWrapStyle;
export const fxsVoipMediaPageInnerStyle = fxsPageInnerStyle;
export const fxsVoipMediaTableContainerStyle = fxsCardStyle;
export const fxsVoipMediaFormInlineFooterStyle = fxsFormInlineFooterStyle;
export const fxsVoipMediaFormBtnStyle = {
  ...fxsFormFooterBtnStyle,
  minWidth: 100,
};

export const fxsVoipMediaCardTitleBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: FXS_VOIP_MEDIA_CARD_RADIUS,
  borderTopRightRadius: FXS_VOIP_MEDIA_CARD_RADIUS,
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

export const fxsVoipMediaDashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
};

export const fxsVoipMediaDashboardColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: "16px 36px 20px",
  boxSizing: "border-box",
  background: C.cardBg,
};

export const fxsVoipMediaDashboardDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

export const fxsVoipMediaDashboardDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

export const fxsVoipMediaFieldsColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  width: "100%",
};

export const fxsVoipMediaNoteTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.strongText,
  marginBottom: 8,
};

export const fxsVoipMediaNoteLineStyle = {
  color: C.mutedText,
  fontSize: 11,
  lineHeight: 1.5,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  textAlign: "left",
};

export const fxsToolbarBtnStyle = fxsToolbarCancelBtnStyle;
