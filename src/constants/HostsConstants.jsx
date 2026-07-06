export const HOSTS_PAGE_TITLE = "Hosts";
export const HOSTS_CARD_TITLE = HOSTS_PAGE_TITLE;

export const HOSTS_BREADCRUMB = [
  "Maintenance",
  "System Tools",
  HOSTS_PAGE_TITLE,
];

export const HOSTS_BUTTON_LABELS = {
  INVERSE: "Inverse",
  CLEAR_ALL: "Clear All",
  DELETE: "Delete",
  ADD_NEW: "+ Add New",
  SAVE: "Save",
  SAVING: "Saving...",
  CLOSE: "Close",
};

export const HOSTS_BUTTON_VARIANTS = {
  PRIMARY: "primary",
  CANCEL: "cancel",
};

export const HOSTS_CANCEL_BTN_STYLE = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

export const HOSTS_PRIMARY_BTN_STYLE = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

export const HOSTS_MODAL_BTN_STYLE = {
  height: 30,
  minWidth: 100,
};

export const HOSTS_TABLE_HEADERS = {
  ID: "ID",
  PROXY_IP: "Proxy IP",
  DOMAIN: "Domain",
  MODIFY: "Modify",
};

export const HOSTS_TABLE_STATUS = {
  LOADING: "Loading hosts...",
  NO_DATA: "No data available",
  SHOWING: (count) =>
    `Showing ${count} record${count !== 1 ? "s" : ""}`,
};

export const HOSTS_MODAL_TITLES = {
  ADD: "Add Host",
  EDIT: "Edit Host",
};

export const HOSTS_MODAL_LABELS = {
  INDEX: "Index:",
  PROXY_IP: "Proxy IP:",
  DOMAIN: "Domain:",
};

export const HOSTS_MODAL_PLACEHOLDERS = {
  PROXY_IP: "e.g., 192.168.1.1",
  DOMAIN: "e.g., example.com (Optional)",
};

export const HOSTS_MESSAGE_DEFAULT = { type: "", text: "" };
export const HOSTS_MESSAGE_TIMEOUT_MS = 5000;
export const HOSTS_NETWORK_ERROR = "Network Error";

export const HOSTS_MESSAGES = {
  LOAD_FAILED: "Failed to load hosts file",
  NETWORK_ERROR: "Network error. Please check your connection.",
  SAVE_FAILED: "Failed to save host",
  UPDATE_SUCCESS: "Host updated successfully",
  ADD_SUCCESS: "Host added successfully",
  DELETE_NONE_SELECTED: "Please select hosts to delete",
  DELETE_CONFIRM: "Are you sure you want to delete the selected host(s)?",
  DELETE_SUCCESS: (count) => `${count} host(s) deleted successfully`,
  DELETE_FAILED: "Failed to delete hosts",
  CLEAR_NONE: "No hosts to clear",
  CLEAR_CONFIRM:
    "Are you sure you want to delete ALL hosts? This action cannot be undone.",
  CLEAR_SUCCESS: "All hosts deleted successfully",
  CLEAR_FAILED: "Failed to clear all hosts",
  PROXY_IP_REQUIRED: "Proxy IP is required",
  PROXY_IP_INVALID: "Please enter a valid IP address",
};

export const HOSTS_FILE_HEADER = `# Hosts file - Managed by Clixxo UI
# Format: <Proxy IP>  <Domain>

`;
