export const IDS_TYPES = [
  { key: 'tlsFailed', label: 'TLS Connection Failed' },
  { key: 'malformedSIP', label: 'Malformed SIP Datagram' },
  { key: 'registrationFailed', label: 'Registration Failed' },
  { key: 'callFailed', label: 'Call Failed' },
  { key: 'sipException', label: 'SIP Exception Flow' },
];

export const IDS_INITIAL_FORM = {
  enable: false,
  tlsFailed: false,
  malformedSIP: false,
  registrationFailed: false,
  callFailed: false,
  sipException: false,
  warningThresholds: [0, 0, 0, 0, 0],
  blacklistThresholds: [0, 0, 0, 0, 0],
  blacklistValidity: 60,
};




export const IDS_BREADCRUMB_ROOT = "Maintenance";
export const IDS_BREADCRUMB_SECTION = "System Tools";
export const IDS_PAGE_TITLE = "IDS Settings";
export const IDS_BREADCRUMB_SEPARATOR = ">";
export const IDS_CARD_TITLE = IDS_PAGE_TITLE;

export const IDS_TOAST_DEFAULT = { msg: "", type: "success" };
export const IDS_TOAST_DURATION = 3500;

export const IDS_WARNING_LOG = '';
export const IDS_LOG_NOTE =
  'Note: Only the latest 100 pieces of warning information will be displayed. To check all the information, please click the Download button.';
export const IDS_BTN_RESET = "Reset";
export const IDS_BTN_SAVE = "Save";
export const IDS_BTN_DOWNLOAD = "Download";

export const IDS_LABEL_SETTINGS = "IDS Settings:";
export const IDS_LABEL_ENABLE = "Enable";

export const IDS_TABLE_HEADER_TYPE = "Type";
export const IDS_TABLE_HEADER_WARNING =
  "Warning Threshold (per 10 seconds)";
export const IDS_TABLE_HEADER_BLACKLIST =
  "Blacklist Threshold (per 10 seconds)";


export const IDS_TOOLTIPS = {
  idsSettings:
    "Enable or configure Intrusion Detection System (IDS) settings for monitoring and detecting suspicious network activity.",
  enable: "Shows the current enable status of the IDS settings.",
  type: "Select the type of IDS to use.",
  warningThreshold: "Shows the current warning threshold for the IDS.",
  blacklistThreshold: "Shows the current blacklist threshold for the IDS.",
  blacklistValidity: "Shows the current blacklist validity for the IDS.",
  "TLS Connection Failed":
    "Triggered when TLS handshake or secure SIP connection establishment fails.",
  "Malformed SIP Datagram":
    "Triggered when invalid or malformed SIP packets are received.",
  "Registration Failed":
    "Triggered when SIP registration attempts repeatedly fail.",
  "Call Failed":
    "Triggered when call setup attempts fail unexpectedly.",
  "SIP Exception Flow":
    "Triggered when abnormal or excessive SIP traffic patterns are detected.",
};


export const IDS_LABEL_BLACKLIST_VALIDITY = "Blacklist Validity(s)";
export const IDS_CARD_TITLE_WARNING_LOG = "IDS Warning Log";
export const IDS_LABEL_WARNING_SHORT = "Warning Threshold";
export const IDS_LABEL_BLACKLIST_SHORT = "Blacklist Threshold";

export const IDS_MSG_SAVE_SUCCESS = "IDS Settings saved successfully!";
export const IDS_MSG_RESET_SUCCESS = "Form reset to default values";
export const IDS_MSG_DOWNLOAD_STARTED = "Download started";