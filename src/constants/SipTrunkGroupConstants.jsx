export const SIP_TRUNK_GROUP_FIELDS = [
  {
    name: "sip_trunk_id",
    label: "SIP Trunk ID",
    type: "select",
    options: ["bsnl", "airtel", "jio"],
    defaultValue: "",
  },
  { name: "group_id", label: "Group ID", type: "text", defaultValue: "" },
];

export const SIP_TRUNK_GROUP_INITIAL_FORM = SIP_TRUNK_GROUP_FIELDS.reduce(
  (acc, field) => {
    if (field.type === "checkbox") acc[field.name] = [];
    else acc[field.name] = field.defaultValue;
    return acc;
  },
  {},
);

export const SIP_TRUNK_GROUP_TABLE_COLUMNS = [
  { key: "check", label: "Check" },
  { key: "index", label: "Id" },
  { key: "sip_trunk_id", label: "SIP Trunk ID" },
  { key: "group_id", label: "Group ID" },
];

/** SIP Trunk Group (SipTrunkGroup.jsx) — addGroup / listGroups */
export const SIP_TRUNK_GROUP_FIELD_TOOLTIPS = {
  sip_trunk_id:
    "Saved as sip_trunk_id via addGroup.\n" +
    "Required. Options built from listSipRegistrations and SIP-to-SIP extensions.",
  group_id:
    "Saved as group_id via addGroup. Required.\n" +
    "Duplicate Group ID is blocked on create.",
};
