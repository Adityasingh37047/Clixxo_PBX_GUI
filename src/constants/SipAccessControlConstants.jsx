export const SIP_ACCESS_CONTROL_PAGE_BREADCRUMB_ROOT = "Security";
export const SIP_ACCESS_CONTROL_PAGE_BREADCRUMB_SECTION = "Security Rules";
export const SIP_ACCESS_CONTROL_PAGE_TITLE = "SIP Access Control";

export const SIP_ACCESS_CONTROL_BTN_INVERSE = "Inverse";
export const SIP_ACCESS_CONTROL_BTN_DELETE = "Delete";
export const SIP_ACCESS_CONTROL_BTN_CLEAR_ALL = "Clear All";
export const SIP_ACCESS_CONTROL_BTN_ADD_NEW = "+ Add New";
export const SIP_ACCESS_CONTROL_BTN_SAVE = "Save";
export const SIP_ACCESS_CONTROL_BTN_CLOSE = "Close";
export const SIP_ACCESS_CONTROL_BTN_ADD_RULE = "+ Add Rule";

export const SIP_ACCESS_CONTROL_MODAL_ADD_TITLE = "Add SIP Access Control (ACL)";
export const SIP_ACCESS_CONTROL_MODAL_EDIT_TITLE = "Edit SIP Access Control (ACL)";
export const SIP_ACCESS_CONTROL_EMPTY_MESSAGE =
  "No SIP access control entries configured!";
export const SIP_ACCESS_CONTROL_RECORD_LABEL = "record";
export const SIP_ACCESS_CONTROL_SELECTED_SUFFIX = "selected";
export const SIP_ACCESS_CONTROL_EDIT_TITLE_ACCESS = "Edit";

export const SIP_ACCESS_CONTROL_PAGINATION_SHOWING = (count, recordLabel) =>
  `Showing ${count} ${recordLabel}${count !== 1 ? "s" : ""} on page 1`;

// ACL mode — drives whether a deny-all catch-all rule is auto-inserted.
export const SIP_ACCESS_CONTROL_MODE_WHITELIST = "whitelist";
export const SIP_ACCESS_CONTROL_MODE_BLACKLIST = "blacklist";

export const SIP_ACCESS_CONTROL_MODE_OPTIONS = [
  { value: SIP_ACCESS_CONTROL_MODE_WHITELIST, label: "Whitelist" },
  { value: SIP_ACCESS_CONTROL_MODE_BLACKLIST, label: "Blacklist" },
];

export const SIP_ACCESS_CONTROL_MODE_LABELS = {
  [SIP_ACCESS_CONTROL_MODE_WHITELIST]: "Whitelist",
  [SIP_ACCESS_CONTROL_MODE_BLACKLIST]: "Blacklist",
};

// Rule actions — must match backend exactly ("permit" | "deny").
export const SIP_ACCESS_CONTROL_ACTION_PERMIT = "permit";
export const SIP_ACCESS_CONTROL_ACTION_DENY = "deny";

export const SIP_ACCESS_CONTROL_ACTION_OPTIONS = [
  { value: SIP_ACCESS_CONTROL_ACTION_PERMIT, label: "Permit" },
  { value: SIP_ACCESS_CONTROL_ACTION_DENY, label: "Deny" },
];

export const SIP_ACCESS_CONTROL_ACTION_LABELS = {
  [SIP_ACCESS_CONTROL_ACTION_PERMIT]: "Permit",
  [SIP_ACCESS_CONTROL_ACTION_DENY]: "Deny",
};

// Catch-all addresses used to lock down the default policy for whitelist mode.
export const SIP_ACCESS_CONTROL_IPV4_CATCHALL = "0.0.0.0/0";
export const SIP_ACCESS_CONTROL_IPV6_CATCHALL = "::/0";

export const SIP_ACCESS_CONTROL_NAME_MAX_LENGTH = 64;
export const SIP_ACCESS_CONTROL_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export const SIP_ACCESS_CONTROL_FIELD_TOOLTIPS = {
  name: "Letters, digits, underscore (_) and hyphen (-) only — e.g. office_whitelist. No spaces or special characters. Cannot be changed after the ACL is created.",
  mode: "Whitelist: only the IPs you permit below may reach SIP — a deny-all catch-all rule is added automatically. Blacklist: block the IPs you list, everyone else is allowed.",
  blockIpv6:
    "The IPv4 catch-all (deny 0.0.0.0/0) does not block IPv6. Enable this to also add a deny ::/0 catch-all.",
  ruleAction: "Permit allows matching traffic through; Deny blocks it.",
  ruleIp: "Bare IP (192.168.1.10), CIDR (192.168.1.0/24), or IPv4 dotted netmask (255.255.255.0).",
};

export const SIP_ACCESS_CONTROL_RULE_ORDER_NOTE =
  "Rules are evaluated top to bottom — the last matching rule wins.";

export const SIP_ACCESS_CONTROL_ERR_NAME_REQUIRED = "Please enter a Name!";
export const SIP_ACCESS_CONTROL_ERR_NAME_INVALID =
  "Name may only contain letters, digits, underscore (_) and hyphen (-).";
export const SIP_ACCESS_CONTROL_ERR_NAME_TOO_LONG = `Name must be ${SIP_ACCESS_CONTROL_NAME_MAX_LENGTH} characters or fewer.`;
export const SIP_ACCESS_CONTROL_ERR_DUPLICATE_NAME =
  "An ACL with this name already exists!";
export const SIP_ACCESS_CONTROL_ERR_NO_RULES =
  "At least one ACL rule is required.";
export const SIP_ACCESS_CONTROL_ERR_RULE_ACTION =
  "Rule action must be Permit or Deny.";
export const SIP_ACCESS_CONTROL_ERR_RULE_IP = (value) =>
  `Invalid IP or CIDR: ${value}`;
export const SIP_ACCESS_CONTROL_ERR_SELECT_DELETE =
  "Please select at least one item to delete.";
export const SIP_ACCESS_CONTROL_ERR_NOTHING_TO_CLEAR =
  "No SIP access control entries to clear.";

export const SIP_ACCESS_CONTROL_MSG_UPDATED = "ACL updated successfully!";
export const SIP_ACCESS_CONTROL_MSG_ADDED = "ACL added successfully!";
export const SIP_ACCESS_CONTROL_CONFIRM_DELETE = (count) =>
  `Are you sure you want to delete ${count} selected item(s)?`;
export const SIP_ACCESS_CONTROL_CONFIRM_CLEAR_ALL = (count) =>
  `Are you sure you want to delete ALL ${count} entr${count === 1 ? "y" : "ies"}? This action cannot be undone.`;
export const SIP_ACCESS_CONTROL_MSG_DELETED =
  "Selected ACL entry(ies) deleted successfully!";
export const SIP_ACCESS_CONTROL_MSG_CLEARED =
  "All ACL entries cleared successfully!";
export const SIP_ACCESS_CONTROL_ERR_FETCH_LIST = "Failed to fetch ACL list";
export const SIP_ACCESS_CONTROL_ERR_ADD = "Failed to add ACL";
export const SIP_ACCESS_CONTROL_ERR_UPDATE = "Failed to update ACL";
export const SIP_ACCESS_CONTROL_ERR_DELETE = "Failed to delete ACL";
export const SIP_ACCESS_CONTROL_ERR_CLEAR = "Failed to clear ACL list";

export const SIP_ACCESS_CONTROL_COLUMNS = [
  { key: "check", label: "Check", width: 60 },
  { key: "no", label: "ID", width: 60 },
  { key: "name", label: "Name", width: 200 },
  { key: "mode", label: "Mode", width: 110 },
  { key: "rules", label: "Rules", width: 420 },
  { key: "modify", label: "Modify", width: 80 },
];