// Initial form data for Action URL page
export const ACTION_URL_INITIAL_FORM = {
  chPickUpActionUrl: '',
  chHangUpActionUrl: '',
};

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
