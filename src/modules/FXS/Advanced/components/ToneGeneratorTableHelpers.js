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

export { EXTENSION_TABLE_CARD_RADIUS as TONE_GENERATOR_CARD_RADIUS, extensionPageWrapStyle as toneGeneratorPageWrapStyle, extensionPageInnerStyle as toneGeneratorPageInnerStyle, extensionCardStyle as toneGeneratorCardStyle, addNewModalFooterBtnStyle as toneGeneratorFormBtnStyle, extensionFixedAlertSx as toneGeneratorFixedAlertSx } from "../../../../components/common";

export { fxsFormInlineFooterStyle as toneGeneratorFooterStyle };





export const toneGeneratorFieldBg = "#ffffff";

export const toneGeneratorCardTitleBarStyle = {
  ...fxsToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export const toneGeneratorCardBodyStyle = {
  display: "flex",
  alignItems: "stretch",
  width: "100%",
  minHeight: 360,
  padding: "20px 28px",
  gap: 0,
  boxSizing: "border-box",
  flexWrap: "nowrap",
  overflowX: "auto",
};

export const toneGeneratorColumnDividerStyle = {
  width: 1,
  flexShrink: 0,
  alignSelf: "stretch",
  backgroundColor: C.divider,
  margin: "4px 24px",
  minHeight: 280,
};

export const toneGeneratorFormColumnStyle = {
  flex: "1 1 320px",
  minWidth: 280,
  maxWidth: 480,
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

export const toneGeneratorHelpColumnStyle = {
  flex: "1 1 360px",
  minWidth: 300,
  background: C.pageBg,
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  padding: "16px 20px",
  boxSizing: "border-box",
};
