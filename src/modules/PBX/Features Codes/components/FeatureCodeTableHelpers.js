import { C } from "../../../../theme/pbxTokens";

export const FEATURE_CODE_COMPACT_MQ = "(max-width: 768px)";
export const FEATURE_CODE_PAIR_STACK_MQ = "(max-width: 1280px)";
export const FEATURE_CODE_LAPTOP_NARROW_MQ = "(max-width: 1366px)";

export const FEATURE_CODE_CARD_RADIUS = 4;

export const FEATURE_CODE_MAIN_SECTION_HEADING_LEFT = -20;

export const featureCodeFormBodyStyle = {
  width: "100%",
  maxWidth: 920,
  margin: "0 auto",
  boxSizing: "border-box",
};

export const featureCodeHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: FEATURE_CODE_CARD_RADIUS,
  borderTopRightRadius: FEATURE_CODE_CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
};

export const featureCodeFooterStyle = {
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
  borderBottomLeftRadius: FEATURE_CODE_CARD_RADIUS,
  borderBottomRightRadius: FEATURE_CODE_CARD_RADIUS,
};

export const featureCodeFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};
