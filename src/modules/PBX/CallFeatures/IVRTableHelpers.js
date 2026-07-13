const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#6b7280",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
};

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


export { C, IVR_TABLE_CARD_RADIUS, ivrPaginationStyle, ivrPageBadgeStyle, ivrEditIconStyle, handleIvrEditIconHover };
