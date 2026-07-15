export const normalizePickupGroupList = (res) => {
  const list = Array.isArray(res?.message)
    ? res.message
    : Array.isArray(res?.data)
      ? res.data
      : [];
  return list.map((g) => ({
    id: g.id,
    name: g.name,
    members: Array.isArray(g.members) ? g.members.map(String) : [],
  }));
};

export const mapPickupGroupExtensionsFromApi = (res) => {
  const list = Array.isArray(res?.message)
    ? res.message
    : Array.isArray(res?.data)
      ? res.data
      : [];
  return list
    .filter((e) => e && e.extension)
    .map((e) => {
      const ext = String(e.extension);
      const display = (e.display_name || "").trim();
      return {
        value: ext,
        label: display ? `${ext}-${display}` : ext,
      };
    })
    .sort((a, b) => {
      const an = parseInt(a.value, 10);
      const bn = parseInt(b.value, 10);
      if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn) return an - bn;
      return a.label.localeCompare(b.label);
    });
};

export const pickupGroupFormFromRow = (row) => ({
  editId: row.id,
  name: row.name || "",
  memberExtensions: Array.isArray(row.members) ? row.members : [],
});

export const buildPickupGroupUpdatePayload = ({ name, memberExtensions }) => ({
  name: name.trim(),
  members: memberExtensions.map(String),
});
