export const RADIUS_FIELDS = [
  { name: "radius", label: "Radius:", type: "checkbox", enableLabel: "Enable" },
  {
    name: "certification",
    label: "Certification:",
    type: "checkbox",
    enableLabel: "Enable",
  },
  {
    name: "allowCalls",
    label: "Allow Calls even if Server doesn't Respond:",
    type: "checkbox",
    enableLabel: "Enable",
  },
  { name: "localIp", label: "Local IP:", type: "select" },
  { name: "masterServer", label: "Master Server:", type: "text" },
  { name: "sharedKey", label: "Shared Key:", type: "password" },
  { name: "spareServer", label: "Spare Server:", type: "text" },
  { name: "spareSharedKey", label: "Shared Key:", type: "password" },
  { name: "timeout", label: "Timeout (s):", type: "text" },
  { name: "retransmission", label: "Retransmission Times:", type: "text" },
  {
    name: "transmitInterval",
    label: "Transmit Interval of Charge Alive Package(s):",
    type: "text",
  },
  {
    name: "callType",
    label: "Call Type (Records Output Required):",
    type: "checkboxGroup",
  },
];

export const LOCAL_IP_OPTIONS = [
  { value: "LAN1", label: "LAN 1:192.168.1.101" },
  { value: "LAN2", label: "LAN 2:192.168.1.102" },
];

export const CALL_TYPE_OPTIONS = [
  { value: "pstn2ip", label: "PSTN->IP" },
  { value: "ip2pstn", label: "IP->PSTN" },
  { value: "conversationStart", label: "Conversation Start" },
  { value: "accessFailure", label: "Access Failure" },
];

export const RADIUS_INITIAL_FORM = {
  radius: false,
  certification: false,
  allowCalls: false,
  localIp: "",
  masterServer: "",
  sharedKey: "",
  spareServer: "",
  spareSharedKey: "",
  timeout: "",
  retransmission: "",
  transmitInterval: "",
  callType: [],
};

export const RADIUS_PAGE_TITLE = "Radius";
export const RADIUS_CARD_TITLE = "Radius Configuration";

export const RADIUS_BREADCRUMB = [
  "Maintenance",
  "System Tools",
  RADIUS_PAGE_TITLE,
];

export const RADIUS_TOAST_DEFAULT = { msg: "", type: "success" };
export const RADIUS_TOAST_DURATION = 3500;

export const RADIUS_MESSAGES = {
  resetSuccess: "Form reset to default.",
  saveSuccess: "Radius settings saved successfully!",
};

export const RADIUS_SELECT_LOCAL_IP_PLACEHOLDER = "Select Local IP";

export const RADIUS_BUTTON_LABELS = {
  RESET: "Reset",
  SAVE: "Save",
};

export const RADIUS_BUTTON_VARIANTS = {
  SAVE: "primary",
  RESET: "cancel",
};

export const RADIUS_TOOLTIPS = {
  radius: "Specifies whether the Radius is enabled or disabled.",
  certification:
    "Specifies whether the Certification is enabled or disabled.",
  allowCalls:
    "Specifies whether the Allow Calls is enabled or disabled.",
  localIp: "Specifies the local IP address.",
  masterServer: "Specifies the master server address.",
  sharedKey: "Specifies the shared key.",
  spareServer: "Specifies the spare server address.",
  spareSharedKey: "Specifies the spare shared key.",
  timeout: "Specifies the timeout in seconds.",
  retransmission: "Specifies the retransmission times.",
  transmitInterval:
    "Specifies the transmit interval of charge alive package(s).",
  callType: "Specifies the call type.",
};