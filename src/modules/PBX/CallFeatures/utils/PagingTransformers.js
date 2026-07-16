export const normalizePagingList = (res) => {
  const list = Array.isArray(res?.message)
    ? res.message
    : Array.isArray(res?.data)
      ? res.data
      : [];
  return list.map((g) => ({
    id: g.id,
    name: g.name || "",
    number: String(g.page_number ?? g.number ?? ""),
    type: g.type || g.page_type || g.paging_type || "one-way",
    callerIdNamePrefix: g.cid_name_prefix || g.callerIdNamePrefix || "",
    members: Array.isArray(g.members) ? g.members.map(String) : [],
  }));
};

export const mapPagingExtensionsFromApi = (res) => {
  const sipList = Array.isArray(res?.message)
    ? res.message
    : Array.isArray(res?.data)
      ? res.data
      : [];
  return sipList
    .filter((e) => e && e.extension)
    .map((e) => {
      const ext = String(e.extension);
      const display = (e.display_name || e.name || "").trim();
      return {
        value: ext,
        label: display ? `${ext}-${display}` : ext,
      };
    })
    .sort((a, b) => {
      const an = parseInt(a.value, 10);
      const bn = parseInt(b.value, 10);
      if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn)
        return an - bn;
      return a.label.localeCompare(b.label);
    });
};

export const pagingFormFromRow = (row) => ({
  editId: row.id,
  name: row.name || "",
  number: row.number || "",
  pagingType: row.type || "one-way",
  callerIdNamePrefix: row.callerIdNamePrefix || "",
  memberExtensions: Array.isArray(row.members) ? [...row.members] : [],
});

export const buildPagingSavePayload = ({
  name,
  number,
  pagingType,
  callerIdNamePrefix,
  memberExtensions,
}) => ({
  name: name.trim(),
  page_number: Number(number.trim()),
  pagingMode: pagingType,
  page_type: pagingType,
  paging_type: pagingType,
  cid_name_prefix: callerIdNamePrefix.trim(),
  members: memberExtensions.map(String),
});
