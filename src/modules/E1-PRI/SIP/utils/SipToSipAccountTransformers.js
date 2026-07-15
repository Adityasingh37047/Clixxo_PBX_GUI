export const parseCodecList = (value) => {
  if (!value) return [];
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value)
      .filter(([, enabled]) => !!enabled)
      .map(([codec]) => codec);
  }
  return String(value)
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
};

export const normalizeAllowCodecs = (value) => parseCodecList(value).join(",");

export const transformSipToSipAccountList = (list) => {
  const sorted = [...list].sort(
    (a, b) => (parseInt(a.extension) || 0) - (parseInt(b.extension) || 0),
  );
  return sorted.map((it, i) => ({
    index: (i + 1).toString(),
    extension: it.extension,
    context: it.context,
    allow_codecs: normalizeAllowCodecs(it.codecs || it.allow_codecs),
    password: it.password,
    contact: it.contact,
    from_domain: it.from_domain || it["Domain name"] || "",
    contact_user: it.contact_user || it["Contact User"] || "",
    outbound_proxy: it.outbound_proxy || it["Outbound Proxy"] || "",
    status: it.status || "",
  }));
};

export const transformSipToSipAccountUiToApi = (uiData) => ({
  extension: uiData.extension,
  context: uiData.context,
  allow_codecs: uiData.allow_codecs,
  password: uiData.password,
  contact:
    uiData.contact && String(uiData.contact).trim().startsWith("sip:")
      ? uiData.contact
      : `sip:${String(uiData.contact || "").trim()}`,
  from_domain: uiData.from_domain,
  contact_user: uiData.contact_user,
  outbound_proxy: uiData.outbound_proxy,
});
