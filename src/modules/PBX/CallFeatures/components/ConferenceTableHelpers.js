import { C } from "../../../../theme/pbxTokens";

const CONFERENCE_TABLE_CARD_RADIUS = 4;

export { C };

export const conferencePaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: CONFERENCE_TABLE_CARD_RADIUS,
  borderBottomRightRadius: CONFERENCE_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

export const conferencePageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 4,
  border: `1px solid ${C.cardBorder}`,
};

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
