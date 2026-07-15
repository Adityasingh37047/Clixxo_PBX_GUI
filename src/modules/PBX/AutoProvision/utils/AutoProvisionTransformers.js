const PROVISION_LIST_KEYS = [
  "devices",
  "rows",
  "items",
  "list",
  "records",
  "data",
  "auto_provision",
  "auto_provisions",
  "autoProvision",
  "provision_list",
  "provisions",
  "results",
  "content",
];

const looksLikeProvisionRow = (item) =>
  item &&
  typeof item === "object" &&
  (item.mac_address != null ||
    item.macAddress != null ||
    item.mac != null ||
    item.MAC != null ||
    item.extension != null ||
    item.Extension != null ||
    item.ip != null ||
    item.ip_address != null);

export const extractAutoProvisionList = (res) => {
  const sources = [res?.message, res?.data, res?.result, res];

  for (const source of sources) {
    if (Array.isArray(source)) return source;
  }

  for (const source of sources) {
    if (!source || typeof source !== "object" || Array.isArray(source)) continue;
    for (const key of PROVISION_LIST_KEYS) {
      if (Array.isArray(source[key])) return source[key];
    }
    const matched = Object.values(source).find(
      (value) =>
        Array.isArray(value) &&
        value.length > 0 &&
        looksLikeProvisionRow(value[0]),
    );
    if (matched) return matched;
  }

  for (const source of sources) {
    if (!source || typeof source !== "object" || Array.isArray(source)) continue;
    for (const key of PROVISION_LIST_KEYS) {
      if (Array.isArray(source[key])) return source[key];
    }
  }

  return [];
};

export const normalizeAutoProvisionRow = (item, index) => {
  const manufacturer =
    item.manufacturer || item.Manufacturer || item.vendor || item.Vendor || "";
  const model = item.model || item.Model || "";
  const manufacturerModel =
    item.manufacturer_model ||
    item.manufacturerModel ||
    item["Manufacturer / Model"] ||
    [manufacturer, model].filter(Boolean).join(" / ") ||
    "";

  return {
    id:
      item.id ??
      item.mac_address ??
      item.macAddress ??
      item.mac ??
      item.MAC ??
      index,
    macAddress:
      item.mac_address ||
      item.macAddress ||
      item.mac ||
      item.MAC ||
      item["MAC Address"] ||
      "",
    extension:
      item.extension != null
        ? String(item.extension)
        : item.Extension != null
          ? String(item.Extension)
          : item.ext != null
            ? String(item.ext)
            : "",
    manufacturerModel,
    ip:
      item.ip ||
      item.IP ||
      item.ip_address ||
      item.ipAddress ||
      item["IP"] ||
      "",
  };
};

export const filterAutoProvisionRows = (rows, searchQuery) => {
  if (!searchQuery.trim()) return rows;
  const q = searchQuery.toLowerCase();
  return rows.filter((r) =>
    [r.macAddress, r.extension, r.manufacturerModel, r.ip].some((v) =>
      String(v || "")
        .toLowerCase()
        .includes(q),
    ),
  );
};
