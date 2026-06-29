export const DIALING_TIMEOUT_PAGE_BREADCRUMB_ROOT = "FXS";
export const DIALING_TIMEOUT_PAGE_BREADCRUMB_SECTION = "Advanced";
export const DIALING_TIMEOUT_PAGE_TITLE = "Dialing Timeout";
export const DIALING_TIMEOUT_CARD_TITLE = "Dialing Timeout";
export const DIALING_TIMEOUT_MODAL_TITLE = "Dialing Timeout";

// Table columns for the main table view
export const DIALING_TIMEOUT_TABLE_COLUMNS = [
  { key: 'interDigitTimeout', label: 'Inter Digit Timeout (s)' },
  { key: 'offHookTimeout', label: 'Off-hook Waiting Keypress Timeout(s)' },
  { key: 'description', label: 'Description' },
  { key: 'modify', label: 'Modify' },
];

// Initial form state for the modal
export const DIALING_TIMEOUT_INITIAL_FORM = {
  interDigitTimeout: '6',
  offHookTimeout: '6',
  description: 'example',
};

// Initial data (single row)
export const DIALING_TIMEOUT_INITIAL_DATA = {
  id: 1,
  interDigitTimeout: 6,
  offHookTimeout: 6,
  description: 'example',
};

/** Dialing Timeout modal */
export const DIALING_TIMEOUT_FIELD_TOOLTIPS = {
  description:
    "Required label for this dialing-timeout profile.\n" +
    "State key: description. Text field; cannot be empty or whitespace only.\n" +
    "Default on open: current saved value or 'example'.",

  interDigitTimeout:
    "Seconds to wait between dialed digits before the dial string is sent.\n" +
    "State key: interDigitTimeout. Required; digits only (0–9).\n" +
    "Must parse to a non-negative integer. Default: 6 seconds.",

  offHookTimeout:
    "Seconds to wait for the first digit after off-hook before timing out.\n" +
    "State key: offHookTimeout. Required; digits only (0–9).\n" +
    "Must parse to a non-negative integer. Default: 6 seconds.",
};
