export const SIP_ACCESS_CONTROL_PAGE_BREADCRUMB_ROOT = "System";
export const SIP_ACCESS_CONTROL_PAGE_BREADCRUMB_SECTION = "Security Rules";
export const SIP_ACCESS_CONTROL_PAGE_TITLE = "SIP Access Control";

export const SIP_ACCESS_CONTROL_BTN_INVERSE = "Inverse";
export const SIP_ACCESS_CONTROL_BTN_DELETE = "Delete";
export const SIP_ACCESS_CONTROL_BTN_CLEAR_ALL = "Clear All";
export const SIP_ACCESS_CONTROL_BTN_ADD_NEW = "+ Add New";
export const SIP_ACCESS_CONTROL_BTN_SAVE = "Save";
export const SIP_ACCESS_CONTROL_BTN_CLOSE = "Close";

export const SIP_ACCESS_CONTROL_MODAL_ADD_TITLE = "Add SIP Access Control";
export const SIP_ACCESS_CONTROL_MODAL_EDIT_TITLE = "Edit SIP Access Control";
export const SIP_ACCESS_CONTROL_EMPTY_MESSAGE =
  "No SIP access control entries configured!";
export const SIP_ACCESS_CONTROL_RECORD_LABEL = "record";
export const SIP_ACCESS_CONTROL_SELECTED_SUFFIX = "selected";
export const SIP_ACCESS_CONTROL_EDIT_TITLE_ACCESS = "Edit";

export const SIP_ACCESS_CONTROL_PAGINATION_SHOWING = (count, recordLabel) =>
  `Showing ${count} ${recordLabel}${count !== 1 ? "s" : ""} on page 1`;

export const SIP_ACCESS_CONTROL_FIELD_TOOLTIPS = {
  name: "Enter a descriptive name for this SIP access control entry.",
  cidr: "Enter the CIDR address (e.g., 192.168.1.0/24).",
  domain: "Enter the SIP domain name (e.g., sip.example.com).",
  default: "Select Blacklist or Whitelist for this SIP access control entry.",
  description: "Enter a description for this SIP access control entry.",
};

export const SIP_ACCESS_CONTROL_FORM_LAYOUT = [
  ["name"],
  ["cidr"],
  ["domain"],
  ["default"],
  ["description"],
];

export const SIP_ACCESS_CONTROL_ERR_NAME_REQUIRED = "Please enter a Name!";
export const SIP_ACCESS_CONTROL_ERR_DUPLICATE_NAME =
  "An entry with this Name already exists!";
export const SIP_ACCESS_CONTROL_ERR_CIDR_OR_DOMAIN =
  "Please enter a CIDR or Domain!";
export const SIP_ACCESS_CONTROL_ERR_SELECT_DELETE =
  "Please select at least one item to delete.";
export const SIP_ACCESS_CONTROL_ERR_NOTHING_TO_CLEAR =
  "No SIP access control entries to clear.";

export const SIP_ACCESS_CONTROL_MSG_UPDATED =
  "SIP access control updated successfully!";
export const SIP_ACCESS_CONTROL_MSG_ADDED =
  "SIP access control added successfully!";
export const SIP_ACCESS_CONTROL_CONFIRM_DELETE = (count) =>
  `Are you sure you want to delete ${count} selected item(s)?`;
export const SIP_ACCESS_CONTROL_CONFIRM_CLEAR_ALL = (count) =>
  `Are you sure you want to delete ALL ${count} entr${count === 1 ? "y" : "ies"}? This action cannot be undone.`;
export const SIP_ACCESS_CONTROL_MSG_DELETED =
  "Selected SIP access control entry(ies) deleted successfully!";
export const SIP_ACCESS_CONTROL_MSG_CLEARED =
  "All SIP access control entries cleared successfully!";

export const SIP_ACCESS_CONTROL_COLUMNS = [
  { key: "check", label: "Check", width: 60 },
  { key: "no", label: "ID", width: 60 },
  { key: "name", label: "Name", width: 180 },
  { key: "cidr", label: "CIDR", width: 160 },
  { key: "domain", label: "Domain", width: 180 },
  { key: "default", label: "Type", width: 140 },
  { key: "description", label: "Description", width: 260 },
  { key: "modify", label: "Modify", width: 80 },
];

export const SIP_ACCESS_CONTROL_DEFAULT_OPTIONS = [
  { value: "blacklist", label: "Blacklist" },
  { value: "whitelist", label: "Whitelist" },
];

export const SIP_ACCESS_CONTROL_MODAL_FIELDS = [
  { key: "name", label: "Name", type: "text", initial: "" },
  {
    key: "cidr",
    label: "CIDR",
    type: "text",
    initial: "",
    placeholder: "e.g., 192.168.1.0/24",
  },
  {
    key: "domain",
    label: "Domain",
    type: "text",
    initial: "",
    placeholder: "e.g., sip.example.com",
  },
  {
    key: "default",
    label: "Type",
    type: "select",
    options: SIP_ACCESS_CONTROL_DEFAULT_OPTIONS,
    initial: "blacklist",
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    initial: "",
  },
];

export const SIP_ACCESS_CONTROL_INITIAL_ROW = {
  name: "",
  cidr: "",
  domain: "",
  default: "blacklist",
  description: "",
};
