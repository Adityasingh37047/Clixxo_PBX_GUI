export const EXT_GROUP_LIST_TRUNCATE_THRESHOLD = 10;
export const EXT_GROUP_LIST_DISPLAY_LIMIT = 6;

export const formatExtGroupTooltipTitle = (text) => {
  if (!text) return "";
  return text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
};

export const formatExtGroupItemListDisplay = (
  items,
  {
    threshold = EXT_GROUP_LIST_TRUNCATE_THRESHOLD,
    limit = EXT_GROUP_LIST_DISPLAY_LIMIT,
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

export const mapExtensionGroupsResponse = (res) => {
  const raw = res?.message ?? res?.data ?? res;
  const list = Array.isArray(raw) ? raw : [];
  return list.map((g) => ({
    id: g.id,
    name: g.name || "",
    extensions: Array.isArray(g.extensions) ? g.extensions.map(String) : [],
  }));
};

export const mapAvailableExtensionsResponse = (res) => {
  const list = res?.message ?? [];
  return (Array.isArray(list) ? list : [])
    .map((item) => ({
      extension: String(item.extension ?? ""),
      name: item.name || item.display_name || item.extension || "",
    }))
    .filter((e) => e.extension);
};

export const buildExtensionGroupPayload = (name, selectedExtensions) => ({
  name,
  extensions: [...selectedExtensions].sort(
    (a, b) => (parseInt(a) || 0) - (parseInt(b) || 0),
  ),
});
