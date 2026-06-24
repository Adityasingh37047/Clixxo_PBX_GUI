export const CODEC_OPTIONS = [
  { value: "ulaw", label: "ulaw" },
  { value: "alaw", label: "alaw" },
  { value: "gsm", label: "gsm" },
  { value: "g726", label: "g726" },
  { value: "g722", label: "g722" },
  { value: "g729", label: "g729" },
  { value: "h264", label: "h264" },
  { value: "vp8", label: "vp8" },
  { value: "vp9", label: "vp9" },
];

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

/** SIP To SIP Account (SipToSipAccountPage) — create/update SipIpTrunkAccount */
export const SIP_TO_SIP_FIELD_TOOLTIPS = {
  extension:
    "Saved as extension. Required. Duplicate extension in SIP Account is blocked.",
  context: "Saved as context. Required.",
  allow_codecs:
    "Saved as allow_codecs. Required comma-separated codec list (dual-list UI).",
  contact:
    "Saved as contact. Required.\n" +
    "UI validates IPv4 like 10.150.18.10 or sip:10.150.18.10.\n" +
    "Saved with sip: prefix if missing.",
  password: "Saved as password. Required.",
  from_domain: "Saved as from_domain. Required.",
  contact_user: "Saved as contact_user. Required.",
  outbound_proxy: "Saved as outbound_proxy. Required.",
};
