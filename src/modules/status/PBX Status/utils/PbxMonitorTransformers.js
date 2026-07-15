export const normalizeStatus = (v) =>
  (v == null ? "" : String(v)).toLowerCase().trim();

export const getStatus = (status) => {
  const s = normalizeStatus(status);

  if (s === "registered") return { text: "Registered", tone: "ok" };

  if (s === "unregistered") return { text: "Unregistered", tone: "bad" };

  return { text: "Unknown", tone: "neutral" };
};

export const countRegistered = (rows) =>
  rows.filter((r) => normalizeStatus(r.status) === "registered").length;

export const filterExtensions = (extensionRows, searchQuery) =>
  extensionRows.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const status = getStatus(r.status).text.toLowerCase();
    return (
      String(r.extension ?? "").toLowerCase().includes(q) ||
      (r.name || "").toLowerCase().includes(q) ||
      status.includes(q) ||
      (r.ip_port || "").toLowerCase().includes(q)
    );
  });

export const filterTrunks = (trunkRows, searchQuery) =>
  trunkRows.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const status = getStatus(r.status).text.toLowerCase();
    return (
      (r.trunk_name || "").toLowerCase().includes(q) ||
      (r.type || "sip").toLowerCase().includes(q) ||
      status.includes(q) ||
      (r.host_ip_port || "").toLowerCase().includes(q)
    );
  });
