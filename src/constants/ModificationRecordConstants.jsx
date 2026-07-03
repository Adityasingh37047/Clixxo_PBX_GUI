// Section title
export const MR_TITLE = 'Modification Record';

// Button labels
export const MR_BUTTONS = {
  check: 'Check',
  download: 'Download',
};

// Red note
export const MR_NOTE = 'Note: Only the latest 100 pieces of modification record will be displayed. To check all the records, please click the Download button.';

// Placeholder for textarea
export const MR_PLACEHOLDER = '';

export const MR_MESSAGES = {
  readError: "Error reading auth.log",

  fetchFailed:
    "Error: Failed to fetch auth.log. Please try again.",

  downloadFailed:
    "Error: Failed to download auth.log. Please try again.",

  fileEmpty:
    "auth.log file is empty.",

  fileUnreadable:
    "Error: Could not read /var/log/auth.log.",

  fileUnreadableOrEmpty:
    "Error: Could not read /var/log/auth.log or file is empty.",
};

export const MR_BREADCRUMB = [
  "Maintenance",
  "System Tool",
  MR_TITLE,
];

export const MR_COMMANDS = {
  fetchLatest:
    `tail -n 100 /var/log/auth.log 2>/dev/null || echo "${MR_MESSAGES.readError}"`,
  fetchAll:
    `cat /var/log/auth.log 2>/dev/null || echo "${MR_MESSAGES.readError}"`,
};

export const MR_DEFAULT_TOAST = {
  msg: "",
  type: "success",
};

export const MR_TOAST_DURATION = 5000;
