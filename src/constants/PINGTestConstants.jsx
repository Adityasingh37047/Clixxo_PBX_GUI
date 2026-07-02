export const PING_TEST_PAGE_BREADCRUMB_ROOT = "System";
export const PING_TEST_PAGE_BREADCRUMB_SECTION = "System Settings";
export const PING_TEST_PAGE_TITLE = "Ping Test";
export const PING_TEST_SECTION_CONFIG = "Test Configuration";
export const PING_TEST_SECTION_OUTPUT = "Ping Output";
export const PING_TEST_OUTPUT_HINT = "Live ICMP response output";
export const PING_TEST_OUTPUT_PLACEHOLDER =
  "Ping results will appear here after you start a test.";

export const PING_TEST_BTN_CLEAR = "Clear";

export const PING_TEST_CARD_TITLE = "Ping Test";

export const PING_TEST_SECTION_HEADING_LEFT = -20;
export const PING_TEST_SECTION_HEADING_COLOR = "#30415A";

export const PING_TEST_BTN_START = "Start";
export const PING_TEST_BTN_END = "End";
export const PING_TEST_BTN_LOADING = "Loading...";

export const PING_TEST_SECTION_INFO = "Info";
export const PING_TEST_SOURCE_LOADING = "Loading...";

export const PING_TEST_DEFAULT_COUNT = 5;
export const PING_TEST_DEFAULT_LENGTH = 56;

export const PING_LABELS = {
  sourceIp: "Source IP Address:",
  destIp: "Destination Address:",
  count: "Ping Count (1-100):",
  length: "Package Length (56-1024 bytes):",
  info: "Info",
};

export const PING_TEST_FIELD_TOOLTIPS = {
  sourceIp: "Select the source IP address used to send ping requests.",
  destIp: "Enter the destination IP address to test connectivity.",
  count: "Specify how many ping packets should be sent.",
  length: "Specify the size of each ping packet in bytes.",
  info: "Displays the ping test results and response details.",
};

export const PING_SOURCE_OPTIONS = [
  { value: "lan1", label: "LAN 1:192.168.1.101" },
];

export const PING_BUTTONS = {
  start: PING_TEST_BTN_START,
  end: PING_TEST_BTN_END,
  loading: PING_TEST_BTN_LOADING,
};

export const PING_TITLE = PING_TEST_PAGE_TITLE;

export const PING_TEST_ERR_INVALID_DEST_IP = "Please enter a valid IP address.";
export const PING_TEST_ERR_INVALID_COUNT =
  "Ping Count must be between 1 and 100.";
export const PING_TEST_ERR_INVALID_LENGTH =
  "Package Length must be between 56 and 1024.";
export const PING_TEST_ERR_FIX_BEFORE_START =
  "Please correct the errors before starting.";
export const PING_TEST_TOAST_STARTED = "Ping test started.";
export const PING_TEST_TOAST_COMPLETED = "Ping test completed.";
export const PING_TEST_TOAST_CONTINUOUS_STARTED = "Continuous ping started.";
export const PING_TEST_TOAST_ALREADY_RUNNING = "Ping test is already running.";
export const PING_TEST_TOAST_STOPPED = "Ping stopped.";
export const PING_TEST_TOAST_NOT_RUNNING = "No ping test is running.";
export const PING_TEST_TOAST_SERVER_ERROR = "Server error occurred";
export const PING_TEST_TOAST_CONNECTION_ERROR =
  "Server is not connected. Please check your connection.";
