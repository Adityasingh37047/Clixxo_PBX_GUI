import { C } from "../../../../theme/pbxTokens";

export const VOICEMAIL_COMPACT_MQ = "(max-width: 768px)";
export const VOICEMAIL_LAPTOP_NARROW_MQ = "(max-width: 1366px)";
export const VOICEMAIL_MAIN_SECTION_HEADING_LEFT = -20;
export const VOICEMAIL_SECTION_HEADING_COLOR = "#30415A";

export const VOICEMAIL_CARD_RADIUS = 4;
export const VOICEMAIL_FORM_HORIZONTAL_PADDING = 24;
export const VOICEMAIL_FIELD_LABEL_WIDTH = 260;
export const VOICEMAIL_INPUT_WIDTH = 150;
export const VOICEMAIL_FIELD_MIDDLE_GAP = 24;

export const voicemailFormBodyStyle = {
  width: "100%",
  maxWidth: 720,
  margin: "0 auto",
  padding: `0 ${VOICEMAIL_FORM_HORIZONTAL_PADDING}px`,
  boxSizing: "border-box",
};

export const voicemailHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: VOICEMAIL_CARD_RADIUS,
  borderTopRightRadius: VOICEMAIL_CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
};

export const pageFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

export const voicemailFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  boxSizing: "border-box",
  background: "#ffffff",
  borderBottomLeftRadius: VOICEMAIL_CARD_RADIUS,
  borderBottomRightRadius: VOICEMAIL_CARD_RADIUS,
};

export const voicemailFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};
