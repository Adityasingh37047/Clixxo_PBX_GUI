import { C } from "../../../../theme/pbxTokens";

export const CC_ROUTE_LIST_TRUNCATE_THRESHOLD = 10;
const CC_ROUTE_LIST_DISPLAY_LIMIT = 6;

export const formatCcRouteItemListDisplay = (
  items,
  {
    threshold = CC_ROUTE_LIST_TRUNCATE_THRESHOLD,
    limit = CC_ROUTE_LIST_DISPLAY_LIMIT,
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

export const ccRouteEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleCcRouteEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};
