import { EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS } from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export { CARD_RADIUS };

export const HA_STATUS_CARD_SHADOW =
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)";

export const HA_STATUS_BLUE = "#2563eb";
export const HA_STATUS_GREY = "#64748b";
export const HA_STATUS_AMBER = "#fde68a";

export const haStatusBadgeStyle = (color, background) => ({
  display: "inline-block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.02em",
  padding: "3px 10px",
  borderRadius: 999,
  color,
  background,
});

export const haStatusNotEnabledBoxStyle = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: HA_STATUS_CARD_SHADOW,
  padding: "32px 24px 28px",
  maxWidth: 560,
  margin: "0 auto",
  boxSizing: "border-box",
};

export const haStatusTableStyle = {
  padding: "8px 16px 16px",
  width: "100%",
  boxSizing: "border-box",
};
