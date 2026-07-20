export const IP_ROUTING_TABLE_PAGE_BREADCRUMB_ROOT = "System";
export const IP_ROUTING_TABLE_PAGE_BREADCRUMB_SECTION = "Network Settings";
export const IP_ROUTING_TABLE_PAGE_TITLE = "IP Route Table";

export const IP_ROUTING_TABLE_BTN_DELETE = "Delete";
export const IP_ROUTING_TABLE_BTN_CLEAR_ALL = "Clear All";
export const IP_ROUTING_TABLE_BTN_ADD_NEW = "+ Add New";
export const IP_ROUTING_TABLE_BTN_SAVE = "Save";
export const IP_ROUTING_TABLE_BTN_APPLYING = "Applying...";
export const IP_ROUTING_TABLE_BTN_CLOSE = "Close";
export const IP_ROUTING_TABLE_BTN_WORKING = "Working...";

export const IP_ROUTING_TABLE_MODAL_ADD_TITLE = "Add IP Route";
export const IP_ROUTING_TABLE_MODAL_EDIT_TITLE = "Edit IP Route";
export const IP_ROUTING_TABLE_EMPTY_MESSAGE = "No routes configured!";
export const IP_ROUTING_TABLE_RECORD_LABEL = "record";
export const IP_ROUTING_TABLE_SELECTED_SUFFIX = "selected";
export const IP_ROUTING_TABLE_EDIT_TITLE_ACCESS = "Edit";

export const IP_ROUTING_TABLE_LOADING_TITLE = "Applying routing changes...";
export const IP_ROUTING_TABLE_LOADING_SUBTITLE =
  "Updating kernel routes and persistent config";
export const IP_ROUTING_TABLE_NETWORK_LOADING = "Loading network interfaces...";

export const IP_ROUTING_TABLE_PAGINATION_SHOWING = (count, recordLabel) =>
  `Showing ${count} ${recordLabel}${count !== 1 ? "s" : ""}`;

export const IP_ROUTING_TABLE_FIELD_TOOLTIPS = {
  no: "Route entry number (auto-assigned).",
  destination: "Destination IP address or network for this route.",
  subnetMask: "Subnet mask in dotted decimal notation (e.g., 255.255.255.0).",
  networkPort: "Network interface used to reach the destination.",
  gateway:
    "Optional gateway IP for this route (required for some VPN interfaces).",
};

export const IP_ROUTING_TABLE_FORM_LAYOUT = [
  ["destination"],
  ["subnetMask"],
  ["networkPort"],
  ["gateway"],
];

export const IP_ROUTING_TABLE_ERR_REQUIRED_FIELDS =
  "Please fill Destination, Subnet Mask and Network Port";
export const IP_ROUTING_TABLE_ERR_INVALID_MASK = "Invalid subnet mask";
export const IP_ROUTING_TABLE_ERR_NETWORK_LOADING =
  "Network interfaces are still loading. Please wait a moment and try again.";
export const IP_ROUTING_TABLE_ERR_SEGMENT_CONFLICT =
  "Destination network segment and the unselected WAN cannot be in the same segment!";
export const IP_ROUTING_TABLE_ERR_INVALID_DESTINATION =
  "Invalid destination IP address";
export const IP_ROUTING_TABLE_ERR_INVALID_GATEWAY =
  "Invalid gateway IP address format. Please enter a valid IP address (e.g., 172.23.0.1)";
export const IP_ROUTING_TABLE_MSG_SAVED =
  "Route saved instantly. Applying in background...";
export const IP_ROUTING_TABLE_MSG_APPLY_FAILED =
  "Warning: Failed to apply route to Linux kernel";
export const IP_ROUTING_TABLE_CONFIRM_DELETE = (count) =>
  `Are you sure you want to delete ${count} selected route(s)?`;
export const IP_ROUTING_TABLE_CONFIRM_CLEAR_ALL =
  "Are you sure you want to delete all routes? This action cannot be undone.";
export const IP_ROUTING_TABLE_MSG_DELETED = (count) =>
  `${count} route(s) deleted and configuration updated.`;
export const IP_ROUTING_TABLE_MSG_CLEARED =
  "All routes deleted and configuration cleared.";

export const IP_ROUTING_TABLE_COLUMNS = [
  { key: "checked", label: "Check", width: 60 },
  { key: "no", label: "ID", width: 60 },
  { key: "destination", label: "Destination", width: 180 },
  { key: "subnetMask", label: "Subnet Mask", width: 180 },
  { key: "networkPort", label: "Network Port", width: 200 },
  { key: "modify", label: "Modify", width: 80 },
];

export const IP_ROUTING_TABLE_MODAL_FIELDS = [
  { key: "no", label: "No.", type: "number", initial: 1 },
  { key: "destination", label: "Destination", type: "text", initial: "" },
  { key: "subnetMask", label: "Subnet Mask", type: "text", initial: "" },
  {
    key: "networkPort",
    label: "Network Port",
    type: "select",
    options: [
      { value: "NET 1(192.168.1.101)", label: "NET 1(192.168.1.101)" },
      { value: "NET 2(192.168.2.101)", label: "NET 2(192.168.2.101)" },
    ],
    initial: "NET 1(192.168.1.101)",
  },
  {
    key: "gateway",
    label: "Gateway (Optional)",
    type: "text",
    initial: "",
    placeholder: "e.g., 172.23.0.1 (required for VPN)",
  },
];

export const IP_ROUTING_TABLE_INITIAL_ROW = {
  checked: false,
  no: 1,
  destination: "",
  subnetMask: "",
  networkPort: "NET 1(192.168.1.101)",
  gateway: "",
};
