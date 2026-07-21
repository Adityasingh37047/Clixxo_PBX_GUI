export const OPERATIONS_LOG_TITLE = "Operation Log";

export const OPERATIONS_LOG_BREADCRUMB_ROOT = "Maintenance";
export const OPERATIONS_LOG_BREADCRUMB_SECTION = "System Tools";
export const OPERATIONS_LOG_BREADCRUMB_CURRENT = OPERATIONS_LOG_TITLE;

export const OPERATIONS_LOG_ITEMS_PER_PAGE = 50;

export const OPERATIONS_LOG_MAX_RECORDS = 500;

export const OPERATIONS_LOG_TABLE_MIN_WIDTH = 960;

export const OPERATIONS_LOG_COMPACT_MQ = "(max-width: 768px)";

export const OPERATIONS_LOG_EMPTY_MESSAGE = "No operation log entries found.";

export const OPERATIONS_LOG_FOOTER_LIMIT_NOTE =
  "Only latest 500 records shown (50 per page)";

export const OPERATIONS_LOG_FILE_PATH =
  "/home/clixxo/server/log/operations.log";

export const OPERATIONS_LOG_FILE_FALLBACK_PATH =
  "/var/log/clixxo/operations.log";

export const OPERATIONS_LOG_COLUMNS = [
  { key: "time", label: "Time", width: "18%" },
  { key: "user", label: "User", width: "12%" },
  { key: "ip", label: "IP Address", width: "14%" },
  { key: "operation", label: "Operation", width: "16%" },
  { key: "detail", label: "Detail", width: "40%" },
];

export const OPERATIONS_LOG_MESSAGES = {
  READ_ERROR: "OPERATIONS_LOG_READ_ERROR",
  FETCH_FAILED: "Failed to load operation log. Please try again.",
  DOWNLOAD_FAILED: "Failed to download operation log. Please try again.",
  DELETE_FAILED: "Failed to delete selected log entries. Please try again.",
  DELETE_NONE: "Select one or more entries to delete.",
  FILE_EMPTY: "Operation log file is empty.",
  FILE_UNREADABLE: "Could not read operation log file.",
  DELETE_CONFIRM:
    "Delete the selected operation log entries? This cannot be undone.",
  DOWNLOAD_EMPTY: "No operation log data to download.",
};

export const OPERATIONS_LOG_COMMANDS = {
  FETCH_LATEST: (maxRecords) =>
    `tail -n ${maxRecords} "${OPERATIONS_LOG_FILE_PATH}" 2>/dev/null || tail -n ${maxRecords} "${OPERATIONS_LOG_FILE_FALLBACK_PATH}" 2>/dev/null || echo "${OPERATIONS_LOG_MESSAGES.READ_ERROR}"`,
  FETCH_ALL: `cat "${OPERATIONS_LOG_FILE_PATH}" 2>/dev/null || cat "${OPERATIONS_LOG_FILE_FALLBACK_PATH}" 2>/dev/null || echo "${OPERATIONS_LOG_MESSAGES.READ_ERROR}"`,
};

export const OPERATIONS_LOG_DOWNLOAD_FILENAME = "operations_log.txt";
