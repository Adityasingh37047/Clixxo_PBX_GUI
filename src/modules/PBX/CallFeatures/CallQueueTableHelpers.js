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
  placeholderText: "#94a3b8",
};

// ── Local page UI ──


const CALL_QUEUE_TABLE_CARD_RADIUS = 4;

const callQueuePaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: CALL_QUEUE_TABLE_CARD_RADIUS,
  borderBottomRightRadius: CALL_QUEUE_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const callQueuePageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 4,
  border: `1px solid ${C.cardBorder}`,
};

const callQueueEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const handleCallQueueEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};


export { C, CALL_QUEUE_TABLE_CARD_RADIUS, callQueuePaginationStyle, callQueuePageBadgeStyle, callQueueEditIconStyle, handleCallQueueEditIconHover };
