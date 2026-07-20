export const TRACERT_TEST_PAGE_BREADCRUMB_ROOT = "System";
export const TRACERT_TEST_PAGE_BREADCRUMB_SECTION = "Network Settings";
export const TRACERT_TEST_PAGE_TITLE = "Tracert Test";
export const TRACERT_TEST_SECTION_CONFIG = "Test Configuration";
export const TRACERT_TEST_SECTION_OUTPUT = "Tracert Output";
export const TRACERT_TEST_OUTPUT_PLACEHOLDER =
  "Traceroute results will appear here after you start a test.";

export const TRACERT_TEST_BTN_CLEAR = "Clear";

export const TRACERT_TEST_CARD_TITLE = "Tracert Test";

export const TRACERT_TEST_SECTION_HEADING_COLOR = "#30415A";

export const TRACERT_TEST_BTN_START = "Start";
export const TRACERT_TEST_BTN_END = "End";
export const TRACERT_TEST_BTN_LOADING = "Loading...";

export const TRACERT_TEST_SOURCE_LOADING = "Loading...";

export const TRACERT_LABELS = {
  sourceIp: "Source IP Address:",
  destIp: "Destination Address:",
  maxJumps: "Maximum Jumps (1-255):",
  info: "Info",
};

export const TRACERT_TEST_FIELD_TOOLTIPS = {
  sourceIp:
    "Select the source IP address from which the traceroute request will be sent.",
  destIp:
    "Enter the destination IP address or hostname to trace the network path.",
  maxJumps:
    "Specify the maximum number of hops the traceroute can traverse before stopping.",
  info: "Displays traceroute results, including intermediate hops and response details.",
};

export const TRACERT_SOURCE_OPTIONS = [{ value: "lan1", label: "LAN 1:192.168.1.101" }];

export const TRACERT_BUTTONS = {
  start: TRACERT_TEST_BTN_START,
  end: TRACERT_TEST_BTN_END,
  loading: TRACERT_TEST_BTN_LOADING,
};

export const TRACERT_TITLE = TRACERT_TEST_PAGE_TITLE;

export const TRACERT_TEST_ERR_INVALID_SOURCE_IP =
  "Please enter a valid IP address.";
export const TRACERT_TEST_ERR_INVALID_DEST_IP =
  "Please enter a valid IP address.";
export const TRACERT_TEST_ERR_INVALID_JUMPS =
  "Maximum Jumps must be between 1 and 255.";
export const TRACERT_TEST_ERR_FIX_BEFORE_START =
  "Please correct the errors before starting.";
export const TRACERT_TEST_TOAST_STARTED = "Tracert test started.";
export const TRACERT_TEST_TOAST_COMPLETED = "Tracert test completed.";
export const TRACERT_TEST_TOAST_CONTINUOUS_STARTED = "Continuous tracert started.";
export const TRACERT_TEST_TOAST_ALREADY_RUNNING = "Tracert test is already running.";
export const TRACERT_TEST_TOAST_STOPPED = "Tracert stopped.";
export const TRACERT_TEST_TOAST_NOT_RUNNING = "No tracert test is running.";
export const TRACERT_TEST_TOAST_SERVER_ERROR = "Server error occurred";
export const TRACERT_TEST_TOAST_CONNECTION_ERROR =
  "Server is not connected. Please check your connection.";
