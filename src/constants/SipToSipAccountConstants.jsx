export const SIP_TO_SIP_FIELDS = [
  { name: "extension", label: "Extension", type: "text", defaultValue: "" },
  { name: "context", label: "Context", type: "text", defaultValue: "" },
  {
    name: "allow_codecs",
    label: "Allow Codecs",
    type: "checkbox",
    defaultValue: "ulaw,alaw",
  },
  { name: "contact", label: "Contact", type: "text", defaultValue: "" },
  { name: "password", label: "Password", type: "password", defaultValue: "" },
  { name: "from_domain", label: "Domain Name", type: "text", defaultValue: "" },
  {
    name: "contact_user",
    label: "Contact User",
    type: "text",
    defaultValue: "",
  },
  {
    name: "outbound_proxy",
    label: "Outbound Proxy",
    type: "text",
    defaultValue: "",
  },
];

export const SIP_TO_SIP_TABLE_COLUMNS = [
  { key: "index", label: "ID" },
  { key: "extension", label: "Extension" },
  { key: "context", label: "Context" },
  { key: "allow_codecs", label: "Allow Codecs" },
  { key: "contact", label: "Contact" },
  { key: "password", label: "Password" },
  { key: "status", label: "Status" },
];

export const SIP_TO_SIP_INITIAL_FORM = SIP_TO_SIP_FIELDS.reduce(
  (acc, field) => {
    acc[field.name] = field.defaultValue;
    return acc;
  },
  {},
);

/** Add/Edit modal — one field per row (allow_codecs rendered separately at end) */
export const SIP_TO_SIP_FORM_LAYOUT = [
  ["extension"],
  ["context"],
  ["contact"],
  ["password"],
  ["from_domain"],
  ["contact_user"],
  ["outbound_proxy"],
];
