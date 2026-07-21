export const OPERATIONS_LOG_TITLE = "Operation Log";

export const OPERATIONS_LOG_BREADCRUMB_ROOT = "Maintenance";
export const OPERATIONS_LOG_BREADCRUMB_SECTION = "System Tools";
export const OPERATIONS_LOG_BREADCRUMB_CURRENT = OPERATIONS_LOG_TITLE;

export const OPERATIONS_LOG_ITEMS_PER_PAGE = 50;

export const OPERATIONS_LOG_TABLE_MIN_WIDTH = 1100;

export const OPERATIONS_LOG_COMPACT_MQ = "(max-width: 768px)";

export const OPERATIONS_LOG_EMPTY_MESSAGE = "No operation log entries found.";

export const OPERATIONS_LOG_FILTERED_EMPTY_MESSAGE =
  "No operation log entries match the selected filters.";

export const OPERATIONS_LOG_FOOTER_LIMIT_NOTE = "Showing 50 records per page";

export const OPERATIONS_LOG_FILTER_ALL = "All";

export const OPERATIONS_LOG_FILTER_MODAL_TITLE = "Filter Operation Log";

export const OPERATIONS_LOG_FILTER_TOOLTIPS = {
  module:
    "Filter by the system area where the action was performed (e.g. Extensions, Trunks, Users).",

  operation:
    "Filter by the type of action recorded (e.g. create, update, delete, login).",

  username: "Filter by the user account that performed the operation.",

  status: "Filter by outcome: success or failure.",

  ip: "Search by the client IP address from which the operation was performed.",

  time_range:
    "Limit results to log entries between the selected start and end dates.",
};

export const DEFAULT_OPERATIONS_LOG_FILTERS = {
  module: OPERATIONS_LOG_FILTER_ALL,
  operation: OPERATIONS_LOG_FILTER_ALL,
  username: OPERATIONS_LOG_FILTER_ALL,
  status: OPERATIONS_LOG_FILTER_ALL,
  ip: "",
  startDate: "",
  endDate: "",
};

export const OPERATIONS_LOG_MESSAGES = {
  FETCH_FAILED: "Failed to load operation log. Please try again.",
  FILTERS_FAILED: "Failed to load filter options. Please try again.",
  DOWNLOAD_FAILED: "Failed to download operation log. Please try again.",
  DELETE_FAILED: "Failed to delete selected log entries. Please try again.",
  DELETE_NONE: "Select one or more entries to delete.",
  DELETE_CONFIRM:
    "Delete the selected operation log entries? This cannot be undone.",
  DELETE_ALL_CONFIRM:
    "Delete ALL operation log entries? This cannot be undone.",
  DELETE_ALL_NONE: "No operation log entries to clear.",
  DELETE_ALL_FAILED: "Failed to clear operation log. Please try again.",
  DELETE_ALL_SUCCESS: "All operation log entries cleared.",
  DOWNLOAD_EMPTY: "No operation log data to download.",
  INVALID_DATE_RANGE: "Start date cannot be after end date.",
};

export const OPERATIONS_LOG_COLUMNS = [
  { key: "createdAt", label: "Time", width: "16%" },
  { key: "username", label: "User", width: "10%" },
  { key: "ip", label: "IP Address", width: "12%" },
  { key: "module", label: "Module", width: "14%" },
  { key: "operation", label: "Operation", width: "12%" },
  { key: "status", label: "Status", width: "8%" },
  { key: "detail", label: "Detail", width: "28%" },
];

export const OPERATIONS_LOG_DOWNLOAD_FILENAME = "operation_log.xlsx";
