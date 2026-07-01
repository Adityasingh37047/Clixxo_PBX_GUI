export const SIP_ACCESS_CONTROL_PAGE_BREADCRUMB_ROOT = "System";
export const SIP_ACCESS_CONTROL_PAGE_BREADCRUMB_SECTION = "System Settings";
export const SIP_ACCESS_CONTROL_PAGE_TITLE = "SIP Access Control";

export const SIP_ACCESS_CONTROL_BTN_DELETE = "Delete";
export const SIP_ACCESS_CONTROL_BTN_CLEAR_ALL = "Clear All";
export const SIP_ACCESS_CONTROL_BTN_ADD_NEW = "+ Add New";
export const SIP_ACCESS_CONTROL_BTN_SAVE = "Save";
export const SIP_ACCESS_CONTROL_BTN_SAVING = "Saving...";
export const SIP_ACCESS_CONTROL_BTN_CLOSE = "Close";

export const SIP_ACCESS_CONTROL_MODAL_ADD_TITLE = "Add SIP Access Control";
export const SIP_ACCESS_CONTROL_MODAL_EDIT_TITLE = "Edit SIP Access Control";
export const SIP_ACCESS_CONTROL_EMPTY_MESSAGE =
  "No SIP access control lists configured!";
export const SIP_ACCESS_CONTROL_RECORD_LABEL = "record";
export const SIP_ACCESS_CONTROL_SELECTED_SUFFIX = "selected";
export const SIP_ACCESS_CONTROL_EDIT_TITLE_ACCESS = "Edit";

export const SIP_ACCESS_CONTROL_PAGINATION_SHOWING = (count, recordLabel) =>
  `Showing ${count} ${recordLabel}${count !== 1 ? "s" : ""}`;

export const SIP_ACCESS_CONTROL_FIELD_TOOLTIPS = {
  name: "Enter a descriptive name for this SIP access control list.",
  default: "Default action when no explicit rule matches (allow or deny).",
  description: "Optional notes describing this access control list.",
};

export const SIP_ACCESS_CONTROL_FORM_LAYOUT = [
  ["name"],
  ["default"],
  ["description"],
];

export const SIP_ACCESS_CONTROL_ERR_NAME_REQUIRED = "Please enter a Name";
export const SIP_ACCESS_CONTROL_ERR_DUPLICATE_NAME =
  "An entry with this Name already exists";
export const SIP_ACCESS_CONTROL_MSG_UPDATED = "SIP access control updated.";
export const SIP_ACCESS_CONTROL_MSG_ADDED = "SIP access control added.";
export const SIP_ACCESS_CONTROL_CONFIRM_DELETE = (count) =>
  `Are you sure you want to delete ${count} selected entr${count === 1 ? "y" : "ies"}?`;
export const SIP_ACCESS_CONTROL_CONFIRM_CLEAR_ALL =
  "Are you sure you want to delete all entries? This action cannot be undone.";
export const SIP_ACCESS_CONTROL_MSG_DELETED = (count) =>
  `${count} entr${count === 1 ? "y" : "ies"} deleted.`;
export const SIP_ACCESS_CONTROL_MSG_CLEARED = "All entries cleared.";

export const SIP_ACCESS_CONTROL_COLUMNS = [
  { key: "checked", label: "Check", width: 60 },
  { key: "no", label: "ID", width: 60 },
  { key: "name", label: "Name", width: 180 },
  { key: "default", label: "Default", width: 140 },
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
    key: "default",
    label: "Default",
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
  checked: false,
  no: 1,
  name: "",
  default: "blacklist",
  description: "",
};
