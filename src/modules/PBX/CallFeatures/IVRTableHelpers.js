import { C } from "../../../theme/pbxTokens";

// ── Local page UI ──

// ── Local page shell UI (pilot: inlined from pbxSharedUi) ──
const IVR_TABLE_CARD_RADIUS = 4;

const ivrPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: IVR_TABLE_CARD_RADIUS,
  borderBottomRightRadius: IVR_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const ivrPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 4,
  border: `1px solid ${C.cardBorder}`,
};

const ivrEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const handleIvrEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

/** Selected row bg differs from getExtensionRowBg (#eff6ff) — keep page-local. */
export const getIvrRowBg = (isSelected, idx) =>
  isSelected ? "#e0f2fe" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export {
  C,
  IVR_TABLE_CARD_RADIUS,
  ivrPaginationStyle,
  ivrPageBadgeStyle,
  ivrEditIconStyle,
  handleIvrEditIconHover,
};
