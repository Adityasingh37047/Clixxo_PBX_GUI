export const ACTION_URL_PAGE_BREADCRUMB_ROOT = "FXS";
export const ACTION_URL_PAGE_BREADCRUMB_SECTION = "Advanced";
export const ACTION_URL_PAGE_TITLE = "Action URL";
export const ACTION_URL_CARD_TITLE = "Channel State Report Settings";

export const ACTION_URL_SAVE_LABEL = "Save";
export const ACTION_URL_RESET_LABEL = "Reset";

export const ACTION_URL_LEFT_COLUMN_FIELD_KEYS = ["chPickUpActionUrl"];
export const ACTION_URL_RIGHT_COLUMN_FIELD_KEYS = ["chHangUpActionUrl"];

export const ACTION_URL_FIELDS = [
  {
    label: "Channel Pick up",
    key: "chPickUpActionUrl",
    placeholder: "Enter URL to report pick up state",
    maxLength: 256,
    default: "",
  },
  {
    label: "Channel Hang up",
    key: "chHangUpActionUrl",
    placeholder: "Enter URL to report hang up state",
    maxLength: 256,
    default: "",
  },
];

export const ACTION_URL_INITIAL_FORM = ACTION_URL_FIELDS.reduce((acc, field) => {
  acc[field.key] = field.default;
  return acc;
}, {});

/** Action URL page */
export const ACTION_URL_FIELD_TOOLTIPS = {
  chPickUpActionUrl:
    "Optional HTTP URL notified when an FXS channel is picked up (off-hook).\n" +
    "State key: chPickUpActionUrl. Text field, max length 256 characters.\n" +
    "Empty by default. Save persists settings; Reset restores empty values.",

  chHangUpActionUrl:
    "Optional HTTP URL notified when an FXS channel hangs up (on-hook).\n" +
    "State key: chHangUpActionUrl. Text field, max length 256 characters.\n" +
    "Empty by default. Save persists settings; Reset restores empty values.",
};
