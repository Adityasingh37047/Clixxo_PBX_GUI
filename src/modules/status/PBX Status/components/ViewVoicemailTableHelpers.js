import {
  extensionPageWrapStyle as viewVoicemailPageWrapStyle,
  extensionPageInnerStyle as viewVoicemailPageInnerStyle,
  extensionSelectedBadgeStyle as viewVoicemailSelectedBadgeStyle,
  extensionTableCheckboxSx as viewVoicemailTableCheckboxSx,
  tdStyle as viewVoicemailTdStyle,
  getExtensionRowBg as getViewVoicemailRowBg,
  filterModalNativeFieldInteraction as viewVoicemailNativeFieldInteraction,
  extensionCancelBtnStyle,
} from "../../../../components/common";
import {
  C,
  OUTLINED_BORDER,
} from "../../../../theme/pbxTokens";

const VIEW_VOICEMAIL_TABLE_CARD_RADIUS = 4;
const VIEW_VOICEMAIL_CARD_SHADOW =
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)";

export const viewVoicemailFilterCardStyle = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  boxShadow: VIEW_VOICEMAIL_CARD_SHADOW,
  padding: "10px 14px",
  marginBottom: 16,
};

export const viewVoicemailCardStyle = {
  background: C.cardBg,
  borderRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: VIEW_VOICEMAIL_CARD_SHADOW,
};

export const viewVoicemailToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  flexWrap: "wrap",
  gap: 8,
  borderTopLeftRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  borderTopRightRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
};

export const viewVoicemailFilterFieldStyle = {
  height: 30,
  fontSize: 12,
  color: C.valueText,
  background: "#f8fafc",
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 10,
  outline: "none",
  fontFamily: "Inter, sans-serif",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
};

export const viewVoicemailFilterLabelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.labelText,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  marginBottom: 6,
  display: "block",
};

export const viewVoicemailToolbarBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
};

export const viewVoicemailRefreshBtnStyle = {
  ...extensionCancelBtnStyle,
  width: 70,
  boxSizing: "border-box",
  borderRadius: 4,
};

export const viewVoicemailFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: C.cardBg,
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  borderBottomRightRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  overflow: "hidden",
  flexWrap: "wrap",
  gap: 10,
};

export const viewVoicemailPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#eff6ff",
  padding: "5px 14px",
  borderRadius: 6,
  border: `0.5px solid ${C.cardBorder}`,
};

export {
  viewVoicemailPageWrapStyle,
  viewVoicemailPageInnerStyle,
  viewVoicemailSelectedBadgeStyle,
  viewVoicemailTableCheckboxSx,
  viewVoicemailTdStyle,
  getViewVoicemailRowBg,
  viewVoicemailNativeFieldInteraction,
};
