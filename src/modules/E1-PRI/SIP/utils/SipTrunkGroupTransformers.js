export const getGroupIdValue = (group) =>
  String(group?.group_id ?? group?.groupId ?? "").trim();

export const resolveGroupIdValue = (group) => {
  const explicit = getGroupIdValue(group);
  if (explicit) return explicit;
  const recordId = group?.id;
  return recordId !== undefined && recordId !== null
    ? String(recordId).trim()
    : "";
};

export const IGNORED_GROUP_REF_VALUES = new Set([
  "",
  "any",
  "Any",
  "undefined",
  "null",
]);

export const SIP_ROUTE_REF_FIELDS = [
  "call_source",
  "callSource",
  "source_group",
  "source_group_id",
  "sip_trunk_group",
  "sip_trunk_group_id",
];

export const SIP_MANIP_REF_FIELDS = [
  "call_initiator",
  "callInitiator",
  "callInitiatorId",
  "call_initiator_id",
  "sip_trunk_group",
  "sip_trunk_group_id",
];

export const SIP_MANIPULATION_TYPES = [
  "ip_in_callerid",
  "ip_in_calleeid",
  "ip_in_oricalleeid",
];

export const normalizeGroupRefValue = (value) => String(value ?? "").trim();

export const matchesGroupReference = (value, groupKey) => {
  const normalized = normalizeGroupRefValue(value);
  if (IGNORED_GROUP_REF_VALUES.has(normalized)) return false;
  return normalized === groupKey;
};

export const itemReferencesGroup = (item, fields, groupKey) =>
  fields.some((field) => matchesGroupReference(item?.[field], groupKey));

export const getRouteList = (response) =>
  Array.isArray(response?.message)
    ? response.message
    : Array.isArray(response?.data)
      ? response.data
      : [];

export const countGroupsWithSameKey = (allGroups, groupKey) =>
  allGroups.filter((g) => resolveGroupIdValue(g) === groupKey).length;

export const normalizeGroupIdForApi = (value) => {
  const trimmed = String(value ?? "").trim();
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  return trimmed;
};

