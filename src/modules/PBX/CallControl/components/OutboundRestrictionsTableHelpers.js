export const OUTBOUND_RESTRICTION_LIST_TRUNCATE_THRESHOLD = 10;
const OUTBOUND_RESTRICTION_LIST_DISPLAY_LIMIT = 6;

export const formatOutboundRestrictionItemListDisplay = (
  items,
  {
    threshold = OUTBOUND_RESTRICTION_LIST_TRUNCATE_THRESHOLD,
    limit = OUTBOUND_RESTRICTION_LIST_DISPLAY_LIMIT,
    mapItem = (x) => String(x),
    separator = ", ",
    ellipsis = "....",
  } = {},
) => {
  if (!items?.length) return "";
  const labels = items.map(mapItem).filter((v) => v !== "" && v != null);
  if (!labels.length) return "";
  if (labels.length <= threshold) {
    return labels.join(separator);
  }
  return `${labels.slice(0, limit).join(separator)}${ellipsis}`;
};

export const yesNoCellStyle = (value) => ({
  color: value === "Yes" ? "#16a34a" : "#475569",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
});

export const outboundRestrictionEditIconStyle = (disabled) => ({
  cursor: disabled ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: disabled ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handleOutboundRestrictionEditIconHover = (e, entering, disabled) => {
  if (!disabled) e.currentTarget.style.opacity = entering ? "1" : "0.7";
};
