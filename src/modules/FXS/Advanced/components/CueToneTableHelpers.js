import { C } from "../../../../theme/pbxTokens";

import { extensionToolbarStyle as fxsToolbarStyle } from "../../../../components/common";

export { EXTENSION_TABLE_CARD_RADIUS as CUE_TONE_CARD_RADIUS, extensionPageWrapStyle as cueTonePageWrapStyle, extensionPageInnerStyle as cueTonePageInnerStyle, extensionCardStyle as cueToneCardStyle, extensionFixedAlertSx as cueToneFixedAlertSx } from "../../../../components/common";





export const cueToneFieldBg = "#ffffff";

export const advancedCardTitleBarStyle = {
  ...fxsToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export const cueToneFormBodyStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "24px 36px 28px",
  width: "100%",
  boxSizing: "border-box",
};

export const cueToneFieldsColStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 20,
  width: "fit-content",
  maxWidth: "100%",
};

export const cueToneNoteStyle = {
  fontSize: 12,
  color: C.accent,
  margin: 0,
  lineHeight: 1.45,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  textAlign: "center",
  width: "100%",
};

export const cueToneFileBtnStyle = {
  height: 30,
  fontSize: 12,
  minWidth: 100,
  borderRadius: 4,
};
