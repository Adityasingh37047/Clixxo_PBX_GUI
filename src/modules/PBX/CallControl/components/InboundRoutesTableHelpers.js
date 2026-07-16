import { C } from "../../../../theme/pbxTokens";

export const INBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD = 10;
const INBOUND_ROUTE_LIST_DISPLAY_LIMIT = 6;

export const formatInboundRouteItemListDisplay = (
  items,
  {
    threshold = INBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD,
    limit = INBOUND_ROUTE_LIST_DISPLAY_LIMIT,
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

export const inboundRouteEditIconStyle = (disabled) => ({
  cursor: disabled ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: disabled ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handleInboundRouteEditIconHover = (e, entering, disabled) => {
  if (!disabled) e.currentTarget.style.opacity = entering ? "1" : "0.7";
};
