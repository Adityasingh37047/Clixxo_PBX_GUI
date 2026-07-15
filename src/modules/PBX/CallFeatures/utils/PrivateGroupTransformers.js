export const mapPrivateGroupFromApi = (g) => ({
  id: g.id,
  name: g.name || "",
  enabled: g.enabled ? "Yes" : "No",
  members: Array.isArray(g.members) ? g.members.map(String) : [],
});

export const normalizePrivateGroupList = (res) => {
  const list = Array.isArray(res?.message)
    ? res.message
    : Array.isArray(res?.data)
      ? res.data
      : [];
  return list.map(mapPrivateGroupFromApi);
};

export const mapSipAccountsToExtensionOptions = (res) => {
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
      if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn) return an - bn;
      return a.label.localeCompare(b.label);
    });
};

export const privateGroupFormFromRow = (row) => ({
  editId: row.id,
  name: row.name || "",
  enabled: row.enabled === "No" ? "No" : "Yes",
  memberExtensions: Array.isArray(row.members) ? [...row.members] : [],
});

export const buildPrivateGroupApiPayload = ({
  name,
  enabled,
  memberExtensions,
}) => ({
  name: name.trim(),
  enabled: enabled === "Yes",
  members: memberExtensions.map(String),
});

export const formatPrivateGroupMembersCell = (members, getExtLabel) => {
  const list = members || [];
  const text = list.slice(0, 4).map(getExtLabel).join(", ");
  const extra = list.length > 4 ? ` +${list.length - 4}` : "";
  return `${text}${extra}`;
};
