import { C } from "../../../../theme/pbxTokens";
import {
  EXTENSION_TABLE_CARD_RADIUS as CALL_QUEUE_TABLE_CARD_RADIUS,
  extensionPaginationStyle as callQueuePaginationStyle,
  extensionPageBadgeStyle as callQueuePageBadgeStyle,
} from "../../../../components/common";

// ── Local page UI ──

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

/** Selected row bg differs from getExtensionRowBg (#eff6ff) — keep page-local. */
export const getCallQueueRowBg = (isSelected, idx) =>
  isSelected ? "#e0f2fe" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export {
  CALL_QUEUE_TABLE_CARD_RADIUS,
  callQueuePaginationStyle,
  callQueuePageBadgeStyle,
  callQueueEditIconStyle,
  handleCallQueueEditIconHover,
};
