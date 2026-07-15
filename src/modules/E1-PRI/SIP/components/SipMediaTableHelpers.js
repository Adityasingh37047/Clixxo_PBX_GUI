import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as sipMediaPageWrapStyle,
  extensionPageInnerStyle as sipMediaPageInnerStyle,
  extensionCardStyle as sipMediaCardStyle,
  extensionToolbarStyle as sipMediaToolbarStyle,
  extensionFixedAlertSx as sipMediaFixedAlertSx,
  addNewModalFooterBtnStyle as advancedFormBtnStyle,
} from "../../../../components/common";
import { C, EXTENSION_COMPACT_MQ } from "../../../../theme/pbxTokens";

export const FIELD_RADIUS = 6;
export const SIP_MEDIA_COMPACT_MQ = EXTENSION_COMPACT_MQ;
export const SIP_MEDIA_SCROLL_CLASS = "sip-media-scroll";
export const SIP_MEDIA_LABEL_COL_WIDTH = 200;
export const SIP_MEDIA_CONTROL_COL_WIDTH = 220;
export const SIP_MEDIA_FIELD_COL_GAP = 8;
export const SIP_MEDIA_FORM_PAD_X = 28;
export const SIP_MEDIA_LAPTOP_NARROW_MQ = "(max-width: 1366px)";

/** Keep prior export name used by AdvancedPageShell / page. */
export const advancedPageWrapStyle = sipMediaPageWrapStyle;
export const advancedPageInnerStyle = sipMediaPageInnerStyle;

export const sipFormTextStyle = {
  fontSize: 13,
  color: C.labelText,
};

export const advancedCardShellStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: 0,
  boxSizing: "border-box",
};

export const advancedTableContainerStyle = {
  ...sipMediaCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
};

export const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
};

export const sipMediaDashboardGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact
    ? "1fr"
    : "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
});

export const sipMediaColumnStyle = (isCompact) => ({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: isCompact
    ? `16px ${SIP_MEDIA_FORM_PAD_X}px 20px`
    : "16px 36px 20px",
  boxSizing: "border-box",
  background: C.cardBg,
});

export const sipMediaDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

export const sipMediaDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

export const sipHeaderStyle = {
  ...sipMediaToolbarStyle,
  width: "100%",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  boxSizing: "border-box",
};

export const dashboardFieldsStackStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: 12,
};

export const valueColStyle = {
  flex: "1 1 auto",
  minWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  paddingTop: 2,
};

export const controlSlotStyle = {
  width: SIP_MEDIA_CONTROL_COL_WIDTH,
  minWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  maxWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
};

export {
  CARD_RADIUS,
  C,
  sipMediaPageWrapStyle,
  sipMediaPageInnerStyle,
  sipMediaCardStyle,
  sipMediaToolbarStyle,
  sipMediaFixedAlertSx,
  advancedFormBtnStyle,
};
