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

export { EXTENSION_TABLE_CARD_RADIUS as DTMF_CARD_RADIUS, extensionPageWrapStyle as dtmfPageWrapStyle, extensionPageInnerStyle as dtmfPageInnerStyle, extensionCardStyle as dtmfCardStyle, extensionToolbarStyle as dtmfHeaderStyle, addNewModalFooterBtnStyle as dtmfFormBtnStyle, extensionFixedAlertSx as dtmfFixedAlertSx } from "../../../../components/common";

export { fxsFormInlineFooterStyle as dtmfFormFooterStyle };





export const dtmfFieldBg = "#ffffff";

export const dtmfHeaderLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  minWidth: 0,
};

export const dtmfFormBodyStyle = {
  padding: "20px 28px 8px",
  display: "flex",
  flexDirection: "column",
  gap: 0,
  maxWidth: 760,
  width: "100%",
  margin: "0 auto",
  boxSizing: "border-box",
};

export const dtmfTabBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
};

export const dtmfNoteStyle = {
  fontSize: 12,
  color: C.mutedText,
  margin: "12px 0 0",
  lineHeight: 1.45,
  whiteSpace: "nowrap",
  textAlign: "center",
  width: "100%",
};
