export const ASTERISK_CLI_PAGE_BREADCRUMB_ROOT = "System";
export const ASTERISK_CLI_PAGE_BREADCRUMB_SECTION = "System Settings";
export const ASTERISK_CLI_PAGE_TITLE = "Asterisk CLI";
export const ASTERISK_CLI_CARD_TITLE = "Asterisk CLI";

export const ASTERISK_CLI_TITLE = ASTERISK_CLI_PAGE_TITLE;

export const ASTERISK_CLI_LABELS = {
  command: "Enter Command",
  logs: "Output",
};

export const ASTERISK_CLI_PLACEHOLDERS = {
  command: "Enter Asterisk CLI command (e.g., pjsip show aors)",
  logs: "Command output will appear here...",
};

export const ASTERISK_CLI_FIELD_TOOLTIPS = {
  command: "Enter the Asterisk CLI command to execute.",
  logs: "Displays the output of the Asterisk CLI command.",
};

export const ASTERISK_CLI_BTN_EXECUTE = "Execute";

export const ASTERISK_CLI_BUTTONS = {
  submit: ASTERISK_CLI_BTN_EXECUTE,
  clear: "Clear",
  loading: "Executing...",
};

export const ASTERISK_CLI_ERR_EMPTY_COMMAND = "Please enter a command.";
export const ASTERISK_CLI_ERR_SHORT_COMMAND =
  "Command must be at least 2 characters long.";
export const ASTERISK_CLI_TOAST_SUCCESS = "Command executed successfully!";
export const ASTERISK_CLI_TOAST_INVALID_COMMAND = "Invalid or wrong command.";
export const ASTERISK_CLI_TOAST_CLEARED = "Logs cleared!";
export const ASTERISK_CLI_TOAST_NETWORK_ERROR =
  "Network error. Please check your connection.";
export const ASTERISK_CLI_TOAST_SERVER_ERROR =
  "Server error. The Asterisk CLI endpoint may have issues.";
export const ASTERISK_CLI_TOAST_EXECUTE_FAILED = "Failed to execute command";
