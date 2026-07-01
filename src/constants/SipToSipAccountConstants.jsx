export const SIP_TO_SIP_ACCOUNT_CODEC_OPTIONS = [
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

export const SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_ROOT = "E1-PRI";
export const SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_SECTION = "SIP";
export const SIP_TO_SIP_ACCOUNT_PAGE_TITLE = "SIP To SIP Account";

export const SIP_TO_SIP_ACCOUNT_FIELDS = [
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

export const SIP_TO_SIP_ACCOUNT_TABLE_COLUMNS = [
  { key: "index", label: "ID" },
  { key: "extension", label: "Extension" },
  { key: "context", label: "Context" },
  { key: "allow_codecs", label: "Allow Codecs" },
  { key: "contact", label: "Contact" },
  { key: "password", label: "Password" },
  { key: "status", label: "Status" },
];

export const SIP_TO_SIP_ACCOUNT_INITIAL_FORM = SIP_TO_SIP_ACCOUNT_FIELDS.reduce(
  (acc, field) => {
    acc[field.name] = field.defaultValue;
    return acc;
  },
  {},
);

/** Add/Edit modal — one field per row (allow_codecs rendered separately at end) */
export const SIP_TO_SIP_ACCOUNT_FORM_LAYOUT = [
  ["extension"],
  ["context"],
  ["contact"],
  ["password"],
  ["from_domain"],
  ["contact_user"],
  ["outbound_proxy"],
];

export const SIP_TO_SIP_ACCOUNT_FIELD_TOOLTIPS = {
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

export const SIP_TO_SIP_ACCOUNT_BTN_INVERSE = "Inverse";
export const SIP_TO_SIP_ACCOUNT_BTN_DELETE = "Delete";
export const SIP_TO_SIP_ACCOUNT_BTN_CLEAR_ALL = "Clear All";
export const SIP_TO_SIP_ACCOUNT_BTN_ADD_NEW = "+ Add New";
export const SIP_TO_SIP_ACCOUNT_BTN_PREV = "← Prev";
export const SIP_TO_SIP_ACCOUNT_BTN_NEXT = "Next →";
export const SIP_TO_SIP_ACCOUNT_BTN_SAVE = "Save";
export const SIP_TO_SIP_ACCOUNT_BTN_SAVING = "Saving...";
export const SIP_TO_SIP_ACCOUNT_BTN_CLOSE = "Close";

export const SIP_TO_SIP_ACCOUNT_MODAL_ADD_TITLE = "Add SIP To SIP Account";
export const SIP_TO_SIP_ACCOUNT_MODAL_EDIT_TITLE = "Edit SIP To SIP Account";
export const SIP_TO_SIP_ACCOUNT_SECTION_GENERAL = "General";
export const SIP_TO_SIP_ACCOUNT_LABEL_ALLOW_CODECS = "Allow Codecs";
export const SIP_TO_SIP_ACCOUNT_COL_MODIFY = "Modify";
export const SIP_TO_SIP_ACCOUNT_EMPTY_MESSAGE = "No SIP To SIP accounts found.";
export const SIP_TO_SIP_ACCOUNT_RECORD_LABEL = "record";
export const SIP_TO_SIP_ACCOUNT_SELECTED_SUFFIX = "selected";
export const SIP_TO_SIP_ACCOUNT_EDIT_TITLE_ACCESS = "Edit";

export const SIP_TO_SIP_ACCOUNT_CODEC_AVAILABLE = "Available";
export const SIP_TO_SIP_ACCOUNT_CODEC_SELECTED = "Selected";
export const SIP_TO_SIP_ACCOUNT_CODEC_EMPTY_AVAILABLE = "Available codecs";
export const SIP_TO_SIP_ACCOUNT_CODEC_EMPTY_SELECTED = "No selected codecs";
export const SIP_TO_SIP_ACCOUNT_CODEC_TIP_ADD_SELECTED = "Add selected";
export const SIP_TO_SIP_ACCOUNT_CODEC_TIP_ADD_ALL = "Add all";
export const SIP_TO_SIP_ACCOUNT_CODEC_TIP_REMOVE_SELECTED = "Remove selected";
export const SIP_TO_SIP_ACCOUNT_CODEC_TIP_REMOVE_ALL = "Remove all";
export const SIP_TO_SIP_ACCOUNT_CODEC_TIP_MOVE_TOP = "Move to top";
export const SIP_TO_SIP_ACCOUNT_CODEC_TIP_MOVE_UP = "Move up";
export const SIP_TO_SIP_ACCOUNT_CODEC_TIP_MOVE_DOWN = "Move down";
export const SIP_TO_SIP_ACCOUNT_CODEC_TIP_MOVE_BOTTOM = "Move to bottom";

export const SIP_TO_SIP_ACCOUNT_PLACEHOLDER_PASSWORD = "Enter password";
export const SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTEXT = "Select Context";
export const SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTACT = "e.g., 15.158.34.15";
export const SIP_TO_SIP_ACCOUNT_PLACEHOLDER_EXTENSION = "e.g., 1001";
export const SIP_TO_SIP_ACCOUNT_PLACEHOLDER_DOMAIN = "e.g., sip.domain.in";
export const SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTACT_USER = "+91XXXXXXXXXX";
export const SIP_TO_SIP_ACCOUNT_PLACEHOLDER_OUTBOUND_PROXY = "e.g., 15.158.34.15";
export const SIP_TO_SIP_ACCOUNT_CONTACT_PREFIX = "sip:";

export const SIP_TO_SIP_ACCOUNT_ERR_EXTENSION_REQUIRED = "Extension is required";
export const SIP_TO_SIP_ACCOUNT_ERR_PASSWORD_REQUIRED = "Password is required";
export const SIP_TO_SIP_ACCOUNT_ERR_CONTEXT_REQUIRED = "Context is required";
export const SIP_TO_SIP_ACCOUNT_ERR_ALLOW_CODECS_REQUIRED =
  "Allow Codecs is required";
export const SIP_TO_SIP_ACCOUNT_ERR_CONTACT_REQUIRED = "Contact is required";
export const SIP_TO_SIP_ACCOUNT_ERR_CONTACT_FORMAT =
  "Contact must be like '10.150.18.10' or 'sip:10.150.18.10'";
export const SIP_TO_SIP_ACCOUNT_ERR_DOMAIN_REQUIRED = "Domain Name is required";
export const SIP_TO_SIP_ACCOUNT_ERR_CONTACT_USER_REQUIRED =
  "Contact User is required";
export const SIP_TO_SIP_ACCOUNT_ERR_OUTBOUND_PROXY_REQUIRED =
  "Outbound Proxy is required";
export const SIP_TO_SIP_ACCOUNT_ERR_DUPLICATE_EXTENSION =
  "This extension already exists in SIP Account. Choose a different extension.";
export const SIP_TO_SIP_ACCOUNT_ERR_LOAD_FAILED = "Failed to load accounts";
export const SIP_TO_SIP_ACCOUNT_ERR_SAVE_FAILED = "Failed to save";
export const SIP_TO_SIP_ACCOUNT_ERR_DELETE_FAILED = "Delete failed";
export const SIP_TO_SIP_ACCOUNT_ERR_CLEAR_ALL_FAILED = "Clear all failed";
export const SIP_TO_SIP_ACCOUNT_MSG_NO_ACCOUNTS_TO_CLEAR = "No accounts to clear";

export const SIP_TO_SIP_ACCOUNT_CONFIRM_DELETE =
  "Are you sure you want to delete the selected account(s)?";
export const SIP_TO_SIP_ACCOUNT_CONFIRM_CLEAR_ALL =
  "Are you sure you want to delete ALL SIP To SIP accounts? This action cannot be undone.";

export const SIP_TO_SIP_ACCOUNT_ALERT_DELETE_BLOCKED = (ext) =>
  `Cannot delete extension ${ext} because it is used in SIP Trunk Group (e.g., trunkId/${ext}). Delete or modify the SIP Trunk Group first.`;
export const SIP_TO_SIP_ACCOUNT_ALERT_CLEAR_BLOCKED = (blocked) =>
  `${blocked} account(s) are referenced in SIP Trunk Group and were not deleted. Please remove references first.`;
