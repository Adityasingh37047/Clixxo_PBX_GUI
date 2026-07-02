export const GLOBAL_SIP_PAGE_BREADCRUMB_ROOT = "System";
export const GLOBAL_SIP_PAGE_BREADCRUMB_SECTION = "System Settings";
export const GLOBAL_SIP_PAGE_TITLE = "Global SIP";

export const GLOBAL_SIP_BTN_DELETE = "Delete";
export const GLOBAL_SIP_BTN_CLEAR_ALL = "Clear All";
export const GLOBAL_SIP_BTN_ADD_NEW = "+ Add New";
export const GLOBAL_SIP_BTN_PREV = "← Prev";
export const GLOBAL_SIP_BTN_NEXT = "Next →";
export const GLOBAL_SIP_BTN_SAVE = "Save";
export const GLOBAL_SIP_BTN_SAVING = "Saving...";
export const GLOBAL_SIP_BTN_CLOSE = "Close";
export const GLOBAL_SIP_BTN_WORKING = "Working...";

export const GLOBAL_SIP_MODAL_ADD_TITLE = "Add Global SIP";
export const GLOBAL_SIP_MODAL_EDIT_TITLE = "Edit Global SIP";
export const GLOBAL_SIP_COL_MODIFY = "Modify";
export const GLOBAL_SIP_EMPTY_MESSAGE = "No Global SIP settings configured!";
export const GLOBAL_SIP_RECORD_LABEL = "record";
export const GLOBAL_SIP_SELECTED_SUFFIX = "selected";
export const GLOBAL_SIP_SHOWING_RECORDS = (count, recordLabel = "record") =>
  `Showing ${count} ${recordLabel}${count !== 1 ? "s" : ""}`;
export const GLOBAL_SIP_EDIT_TITLE_ACCESS = "Edit";
export const GLOBAL_SIP_SECTION_GENERAL = "General";

export const GLOBAL_SIP_TOOLTIP_DELETE =
  "Delete the selected Global SIP settings.";

export const GLOBAL_SIP_FIELD_TOOLTIPS = {
  description: "Enter a descriptive name for this Global SIP profile.",
  local_ip: "Select the local IP address or interface for SIP signaling.",
  local_port: "TCP/UDP port used for local SIP signaling.",
  transport_mode: "Transport protocol used for SIP messages (UDP or TCP).",
};

export const GLOBAL_SIP_FORM_LAYOUT = [
  ["description"],
  ["local_ip"],
  ["local_port"],
  ["transport_mode"],
];

export const GLOBAL_SIP_PLACEHOLDER_PASSWORD = "Enter password";
export const GLOBAL_SIP_PLACEHOLDER_ENTER = (label) =>
  `Enter ${String(label).toLowerCase()}`;

export const GLOBAL_SIP_MSG_SELECT_TO_DELETE =
  "Please select entries to delete";
export const GLOBAL_SIP_MSG_NO_TRUNKS_TO_CLEAR = "No entries to clear";
export const GLOBAL_SIP_CONFIRM_DELETE = (count) =>
  `Delete ${count} Global SIP setting(s)?`;
export const GLOBAL_SIP_CONFIRM_CLEAR_ALL =
  "Are you sure you want to delete ALL Global SIP settings? This action cannot be undone.";
export const GLOBAL_SIP_MSG_DELETED = (count) =>
  `${count} setting(s) deleted. SIP service will restart briefly.`;
export const GLOBAL_SIP_MSG_DELETED_ALL = (count) =>
  `All ${count} setting(s) deleted. SIP service will restart briefly.`;
export const GLOBAL_SIP_MSG_SAVE_RESTART = "SIP service will restart briefly.";
export const GLOBAL_SIP_PAGINATION_SHOWING = (count, recordLabel, page) =>
  `Showing ${count} ${recordLabel}${count !== 1 ? "s" : ""} on page ${page}`;
export const GLOBAL_SIP_PAGINATION_PAGE_OF = (page, totalPages) =>
  `Page ${page} of ${totalPages}`;

export const SIP_TRUNK_FIELDS = [
  {
    name: "index",
    label: "Id",
    type: "select",
    options: Array.from({ length: 10 }, (_, i) => ({
      value: i.toString(),
      label: i.toString(),
    })),
    defaultValue: "1",
  },
  {
    name: "description",
    label: "Description",
    type: "text",
    defaultValue: "Global SIP Settings",
  },
  // Temporarily hidden per request (toggle back by uncommenting):
  // { name: 'sip_agent', label: 'SIP Agent', type: 'checkbox', defaultValue: false },
  // { name: 'username', label: 'UserName', type: 'text', defaultValue: '', conditionalField: { dependsOn: 'sip_agent', value: true } },
  // { name: 'password', label: 'Password', type: 'password', defaultValue: '', conditionalField: { dependsOn: 'sip_agent', value: true } },
  // { name: 'remote Address', label: 'Remote Address', type: 'text', defaultValue: '' },
  // { name: 'Remote Port', label: 'Remote Port', type: 'text', defaultValue: '5060' },
  {
    name: "local_ip",
    label: "Local IP",
    type: "select",
    options: [{ value: "0.0.0.0", label: "Any LAN (0.0.0.0)" }],
    defaultValue: "0.0.0.0",
  },
  {
    name: "local_port",
    label: "Local SIP Port",
    type: "text",
    defaultValue: "5060",
  },
  // { name: 'allow_codecs', label: 'Allow Codecs', type: 'checkbox', defaultValue: '' },
  {
    name: "transport_mode",
    label: "Transport Mode",
    type: "select",
    options: [
      { value: "UDP", label: "UDP" },
      { value: "TCP", label: "TCP" },
    ],
    defaultValue: "UDP",
  },
  // { name: 'Outgoing Voice Resource', label: 'Outgoing Voice Resource', type: 'text', defaultValue: '64' },
  // {name: 'Incoming Voice Resource', label: 'Incoming Voice Resource', type: 'text', defaultValue: '64' },
  // { name: 'Fax Mode', label: 'Fax Mode', type: 'select', options: [ {value: 'Global', label: 'Global'}, {value: 'T38', label: 'T38'}, {value: 'T30', label: 'T30'}   ], defaultValue: 'Global' },
  // { name: 'Working Period', label: 'Working Period', type: 'checkbox', defaultValue: true },
  // { name: 'Working Period Text', label: '', type: 'text', defaultValue: '24 Hour' },
  // { name: 'VOS1.1 SIP Encryption', label: 'VOS1.1 SIP Encryption', type: 'select', options: [ {value: 'No Encryption', label: 'No Encryption'}, {value: 'Gateway Encryption', label: 'Gateway Encryption'}  ], defaultValue: 'No Encryption' },
  // { name: 'Encrypt Key', label: 'Encrypt Key', type: 'text', defaultValue: '', conditionalField: { dependsOn: 'VOS1.1 SIP Encryption', value: 'Gateway Encryption' } },
  // { name: 'VOS1.1 RTP EncryptKey', label: 'VOS1.1 RTP EncryptKey', type: 'checkbox', defaultValue: false },
];

export const SIP_TRUNK_TABLE_COLUMNS = [
  { key: "index", label: "Id" },
  { key: "description", label: "Description" },
  { key: "local_ip", label: "Local IP" },
  { key: "local_port", label: "Local SIP Port" },
  { key: "transport_mode", label: "Transport Mode" },
];

export const TRUNK_CODEC_OPTIONS = [
  { value: "ulaw", label: "ulaw" },
  { value: "alaw", label: "alaw" },
  { value: "gsm", label: "gsm" },
  { value: "g726", label: "g726" },
  { value: "g722", label: "g722" },
  { value: "g729", label: "g729" },
];

export const SIP_TRUNK_INITIAL_FORM = SIP_TRUNK_FIELDS.reduce((acc, field) => {
  acc[field.name] = field.defaultValue;
  return acc;
}, {});
