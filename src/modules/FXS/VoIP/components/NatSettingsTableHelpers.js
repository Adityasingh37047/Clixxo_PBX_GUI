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



export const FXS_NAT_SETTINGS_CARD_RADIUS = FXS_CARD_RADIUS;
export const FXS_NAT_SETTINGS_FIELD_RADIUS = 4;
export const FXS_NAT_SETTINGS_LAPTOP_NARROW_MQ = "(max-width: 1366px)";

export const fxsNatSettingsFixedAlertSx = fxsFixedAlertSx;
export const fxsNatSettingsPageWrapStyle = fxsPageWrapStyle;
export const fxsNatSettingsPageInnerStyle = fxsPageInnerStyle;
export const fxsNatSettingsTableContainerStyle = fxsCardStyle;
export const fxsNatSettingsFormInlineFooterStyle = fxsFormInlineFooterStyle;
export const fxsNatSettingsFormBtnStyle = {
  ...fxsFormFooterBtnStyle,
  minWidth: 100,
};

export const fxsNatSettingsCardTitleBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: FXS_NAT_SETTINGS_CARD_RADIUS,
  borderTopRightRadius: FXS_NAT_SETTINGS_CARD_RADIUS,
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

export const fxsNatSettingsDashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
};

export const fxsNatSettingsDashboardColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: "16px 36px 20px",
  boxSizing: "border-box",
  background: C.cardBg,
};

export const fxsNatSettingsNoteSectionStyle = {
  width: "100%",
  padding: "16px 36px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
};

export const fxsNatSettingsNoteTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.strongText,
  marginBottom: 8,
  textAlign: "left",
};

export const fxsNatSettingsNoteTextStyle = {
  margin: 0,
  color: C.mutedText,
  fontSize: 11,
  lineHeight: 1.5,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  textAlign: "left",
};

export const fxsNatSettingsDashboardDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

export const fxsNatSettingsDashboardDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

export const fxsNatSettingsFieldsColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  width: "100%",
};

export const fxsToolbarBtnStyle = fxsToolbarCancelBtnStyle;
