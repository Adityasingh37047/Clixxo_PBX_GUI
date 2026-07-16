import { C } from "../../../../theme/pbxTokens";

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


export { CALL_QUEUE_TABLE_CARD_RADIUS, callQueuePaginationStyle, callQueuePageBadgeStyle, callQueueEditIconStyle, handleCallQueueEditIconHover };
