import { C } from "../../../../theme/pbxTokens";
import {
  extensionPageWrapStyle,
  extensionPageInnerStyle,
  EXTENSION_TABLE_CARD_RADIUS,
} from "../../../../components/common";

export { C };

export const SIP_SIP_SECTION_HEADING_COLOR = "#30415A";

export const CARD_RADIUS = EXTENSION_TABLE_CARD_RADIUS;
export const FIELD_RADIUS = 6;

export const SIP_SIP_COMPACT_MQ = "(max-width: 768px)";
export const SIP_SIP_SCROLL_CLASS = "sip-sip-scroll";
export const SIP_SIP_SECTION_HEADING_LEFT = -20;
export const SIP_FORM_PAD_X = 28;
export const SIP_SIP_LABEL_COL_WIDTH = 200;
export const SIP_SIP_CONTROL_COL_WIDTH = 220;
export const SIP_SIP_FIELD_COL_GAP = 8;
export const SIP_SIP_LAPTOP_NARROW_MQ = "(max-width: 1366px)";

export const sipFormTextStyle = {
  fontSize: 13,
  color: C.labelText,
};

export const advancedPageWrapStyle = {
  ...extensionPageWrapStyle,
};

export const advancedPageInnerStyle = {
  ...extensionPageInnerStyle,

  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
};
export const advancedCardShellStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: 0,
  boxSizing: "border-box",
};

export const advancedTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
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

export const advancedFormBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

export const sipSipDashboardGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact
    ? "1fr"
    : "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
});

export const sipSipColumnStyle = (isCompact) => ({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: isCompact
    ? `16px ${SIP_FORM_PAD_X}px 20px`
    : "16px 36px 20px",
  boxSizing: "border-box",
  background: C.cardBg,
});

export const sipSipDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

export const sipSipDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

export const sipHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

export const formBodyStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  background: C.cardBg,
  boxSizing: "border-box",
};

export const dashboardFieldsStackStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: 12,
};

export const sipSipFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

export const valueColStyle = {
  flex: "1 1 auto",
  minWidth: SIP_SIP_CONTROL_COL_WIDTH,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  paddingTop: 2,
};

export const controlSlotStyle = {
  width: SIP_SIP_CONTROL_COL_WIDTH,
  minWidth: SIP_SIP_CONTROL_COL_WIDTH,
  maxWidth: SIP_SIP_CONTROL_COL_WIDTH,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
};

export const checkboxSx = {
  padding: "2px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

export const nativeRadioStyle = {
  width: 16,
  height: 16,
  accentColor: "#3E5475",
  cursor: "pointer",
};
