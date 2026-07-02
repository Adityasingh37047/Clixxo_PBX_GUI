export const LINUX_CLI_PAGE_BREADCRUMB_ROOT = "System";
export const LINUX_CLI_PAGE_BREADCRUMB_SECTION = "System Settings";
export const LINUX_CLI_PAGE_TITLE = "Linux CLI";
export const LINUX_CLI_CARD_TITLE = "Linux CLI";

export const LINUX_CLI_TITLE = LINUX_CLI_PAGE_TITLE;

export const LINUX_CLI_LABELS = {
  command: "Enter Command",
  logs: "Output",
};

export const LINUX_CLI_PLACEHOLDERS = {
  command: "e.g., ifconfig eth1",
  logs: "Command output will appear here…",
};

export const LINUX_CLI_FIELD_TOOLTIPS = {
  command: "Enter the Linux command to execute.",
  logs: "Displays the output of the Linux command.",
};

export const LINUX_CLI_BUTTONS = {
  submit: "Execute",
  loading: "Running…",
  clear: "Clear",
};

export const LINUX_CLI_ERR_EMPTY_COMMAND = "Please enter a command.";
export const LINUX_CLI_ERR_SHORT_COMMAND =
  "Command must be at least 2 characters long.";
export const LINUX_CLI_TOAST_SUCCESS = "Command executed successfully!";
export const LINUX_CLI_TOAST_INVALID_COMMAND = "Invalid or wrong command.";
export const LINUX_CLI_TOAST_CLEARED = "Logs cleared!";
export const LINUX_CLI_TOAST_NETWORK_ERROR =
  "Network error. Please check your connection.";
export const LINUX_CLI_TOAST_SERVER_ERROR =
  "Server error. The Linux command endpoint may have issues.";
export const LINUX_CLI_TOAST_EXECUTE_FAILED = "Failed to execute command";
