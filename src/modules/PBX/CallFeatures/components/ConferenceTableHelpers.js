import { C } from "../../../../theme/pbxTokens";
import {
  EXTENSION_TABLE_CARD_RADIUS as CONFERENCE_TABLE_CARD_RADIUS,
  extensionPaginationStyle as conferencePaginationStyle,
  extensionPageBadgeStyle as conferencePageBadgeStyle,
} from "../../../../components/common";

export { C, CONFERENCE_TABLE_CARD_RADIUS, conferencePaginationStyle, conferencePageBadgeStyle };

export const conferenceEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleConferenceEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

/** Selected row bg differs from getExtensionRowBg (#eff6ff) — keep page-local. */
export const getConferenceRowBg = (isSelected, idx) =>
  isSelected ? "#e0f2fe" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";
