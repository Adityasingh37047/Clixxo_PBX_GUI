export const C = {
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
  successGreen: "#16a34a",
  errorRed: "#dc2626",
};

export const OUTBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD = 10;
const OUTBOUND_ROUTE_LIST_DISPLAY_LIMIT = 6;

export const formatOutboundRouteItemListDisplay = (
  items,
  {
    threshold = OUTBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD,
    limit = OUTBOUND_ROUTE_LIST_DISPLAY_LIMIT,
    mapItem = (x) => String(x),
    separator = ", ",
    ellipsis = "....",
  } = {},
) => {
  if (!items?.length) return "";
  const labels = items.map(mapItem).filter((v) => v !== "" && v != null);
  if (!labels.length) return "";
  if (labels.length <= threshold) return labels.join(separator);
  return `${labels.slice(0, limit).join(separator)}${ellipsis}`;
};

const OUTBOUND_ROUTE_TABLE_CARD_RADIUS = 4;
export const outboundRoutePaginationStyle = {
  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 14px",
  background: "#ffffff", borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: OUTBOUND_ROUTE_TABLE_CARD_RADIUS,
  borderBottomRightRadius: OUTBOUND_ROUTE_TABLE_CARD_RADIUS, overflow: "hidden",
};
export const outboundRoutePageBadgeStyle = {
  fontSize: 11, fontWeight: 600, color: C.accent, background: "#e0f2fe", padding: "5px 14px",
  borderRadius: 4, border: `1px solid ${C.cardBorder}`,
};

export const outboundRouteEditIconStyle = (disabled) => ({
  cursor: disabled ? "not-allowed" : "pointer", color: "#2563eb", fontSize: 22,
  opacity: disabled ? 0.4 : 0.7, transition: "opacity 0.15s ease",
});
export const handleOutboundRouteEditIconHover = (event, entering, disabled) => {
  if (!disabled) event.currentTarget.style.opacity = entering ? "1" : "0.7";
};
