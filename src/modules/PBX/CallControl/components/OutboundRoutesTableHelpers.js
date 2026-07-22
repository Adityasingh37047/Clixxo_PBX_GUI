import {
  EXTENSION_TABLE_CARD_RADIUS as OUTBOUND_ROUTE_TABLE_CARD_RADIUS,
  getExtensionRowBg as getOutboundRouteRowBg,
  extensionPaginationStyle as outboundRoutePaginationStyle,
  extensionPageBadgeStyle as outboundRoutePageBadgeStyle,
} from "../../../../components/common";

export { getOutboundRouteRowBg, OUTBOUND_ROUTE_TABLE_CARD_RADIUS, outboundRoutePaginationStyle, outboundRoutePageBadgeStyle };

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

export const outboundRouteEditIconStyle = (disabled) => ({
  cursor: disabled ? "not-allowed" : "pointer", color: "#2563eb", fontSize: 22,
  opacity: disabled ? 0.4 : 0.7, transition: "opacity 0.15s ease",
});
export const handleOutboundRouteEditIconHover = (event, entering, disabled) => {
  if (!disabled) event.currentTarget.style.opacity = entering ? "1" : "0.7";
};
