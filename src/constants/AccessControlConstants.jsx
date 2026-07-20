export const ACCESS_CONTROL_PAGE_BREADCRUMB_ROOT = "Security";
export const ACCESS_CONTROL_PAGE_BREADCRUMB_SECTION = "Security Rules";
export const ACCESS_CONTROL_PAGE_TITLE = "Access Control";

export const ACCESS_CONTROL_BTN_INVERSE = "Inverse";
export const ACCESS_CONTROL_BTN_DELETE = "Delete";
export const ACCESS_CONTROL_BTN_CLEAR_ALL = "Clear All";
export const ACCESS_CONTROL_BTN_ADD_NEW = "+ Add New";
export const ACCESS_CONTROL_BTN_SAVE = "Save";
export const ACCESS_CONTROL_BTN_CLOSE = "Close";
export const ACCESS_CONTROL_BTN_APPLY = "Apply";
export const ACCESS_CONTROL_BTN_CANCEL = "Cancel";

export const ACCESS_CONTROL_MODAL_TITLE = "Access Control Command";
export const ACCESS_CONTROL_EMPTY_MESSAGE = "No command configured!";
export const ACCESS_CONTROL_EMPTY_BTN = "+ Add New Command";

export const ACCESS_CONTROL_RECORD_LABEL = "record";
export const ACCESS_CONTROL_SELECTED_SUFFIX = "selected";
export const ACCESS_CONTROL_SHOWING_RECORDS = (count, recordLabel = "record") =>
  `Showing ${count} ${recordLabel}${count !== 1 ? "s" : ""}`;
export const ACCESS_CONTROL_EDIT_TITLE_ACCESS = "Edit";

export const ACCESS_CONTROL_LOG_TITLE = "Iptables Info";
export const ACCESS_CONTROL_LOG_NOTES = [
  `Note: Please don't enable "SIP" => "Calls from SIP Trunk Address only".`,
  "Note: Application and cancel application buttons are for all current set rules, not direct at a certain rule.",
];

export const ACCESS_CONTROL_FIELD_TOOLTIPS = {
  index:
    "Rule index in the command list. Auto-generated for new commands; fixed when editing.",
  command:
    'iptables command executed on Apply. Must start with "iptables" or "sudo iptables" and include a valid operation (e.g. -A, -I, -D, -P).',
};

export const ACCESS_CONTROL_INDEX_PLACEHOLDER = "Auto-generated";
export const ACCESS_CONTROL_COMMAND_PLACEHOLDER =
  "e.g., iptables -P OUTPUT ACCEPT";

export const ACCESS_CONTROL_TABLE_COLUMNS = [
  { key: "check", label: "", width: 40 },
  { key: "id", label: "Id", width: 36 },
  { key: "command", label: "Command" },
  { key: "modify", label: "Modify", width: 70 },
];

export const IPTABLES_INFO = `Chain INPUT (policy ACCEPT)`;
