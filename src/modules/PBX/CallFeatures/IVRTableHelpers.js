import { C } from "../../../theme/pbxTokens";
import {
  EXTENSION_TABLE_CARD_RADIUS as IVR_TABLE_CARD_RADIUS,
  extensionPaginationStyle as ivrPaginationStyle,
  extensionPageBadgeStyle as ivrPageBadgeStyle,
} from "../../../components/common";

// ── Local page UI ──

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
