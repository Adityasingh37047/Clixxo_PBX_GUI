export const FXS_VOIP_SIP_BREADCRUMB_ROOT = "FXS";
export const FXS_VOIP_SIP_BREADCRUMB_SECTION = "VoIP";
export const FXS_VOIP_SIP_PAGE_TITLE = "SIP Settings";

export const FXS_VOIP_SIP_LEFT_SECTION_TITLE = "Registration";
export const FXS_VOIP_SIP_RIGHT_SECTION_TITLE = "Protocol & Options";
export const FXS_VOIP_SIP_LOCAL_MODE_PREFIX = "ℹ Local PBX mode:";

export const FXS_VOIP_SIP_SAVE_LABEL = "Save";
export const FXS_VOIP_SIP_RESET_LABEL = "Reset";
export const FXS_VOIP_SIP_SAVING_LABEL = "Saving…";

export const FXS_VOIP_SIP_LOCAL_REGISTER_STATUS =
  "Local PBX (registration not required)";

export const FXS_VOIP_SIP_STATUS_POLL_MS = 30000;

/** Matches PBX main-page section headings (Voicemail, Record Settings) */
export const FXS_VOIP_SIP_SECTION_HEADING_LEFT = -20;
export const FXS_VOIP_SIP_SECTION_HEADING_COLOR = "#30415A";

export const FXS_VOIP_SIP_LEFT_COLUMN_FIELD_KEYS = [
  "registerStatus",
  "registrarIp",
  "registrarPort",
  "registerInterval",
  "registryValidity",
  "reregistrationInterval",
];

export const FXS_VOIP_SIP_RIGHT_COLUMN_FIELD_KEYS = [
  "sipTransportProtocol",
  "spareRegistrarServer",
  "spareRegistrarIp",
  "spareRegistrarPort",
  "multiRegistrarMode",
  "switchSignalPort",
];

export const SIP_SETTINGS_FIELDS = [
  {
    label: "Register Status",
    type: "readonly",
    key: "registerStatus",
    default: "Unregistered",
  },

  {
    label: "Registrar IP Address",
    type: "text",
    key: "registrarIp",
    default: "",
  },
  {
    label: "Registrar Port",
    type: "text",
    key: "registrarPort",
    default: "5060",
    validation: "integer",
  },

  {
    label: "Spare Registrar Server",
    type: "checkbox",
    key: "spareRegistrarServer",
    default: true,
  },
  {
    label: "Spare Registrar IP Address",
    type: "text",
    key: "spareRegistrarIp",
    default: "",
    conditional: "spareRegistrarServer",
  },
  {
    label: "Spare Registrar Port",
    type: "text",
    key: "spareRegistrarPort",
    default: "5060",
    conditional: "spareRegistrarServer",
  },

  {
    label: "Register Interval Time(ms)",
    type: "text",
    key: "registerInterval",
    default: "0",
    validation: "integer",
  },
  {
    label: "Registry Validity Period (s)",
    type: "text",
    key: "registryValidity",
    default: "3600",
    validation: "integer",
  },
  {
    label: "Re-registration Interval(s)",
    type: "text",
    key: "reregistrationInterval",
    default: "32",
    validation: "integer",
  },

  {
    label: "Multi-Registrar Server Mode",
    type: "checkbox",
    key: "multiRegistrarMode",
    default: false,
  },

  {
    label: "SIP Transport Protocol",
    type: "select",
    key: "sipTransportProtocol",
    options: ["UDP", "TCP"],
  },

  {
    label: "Switch Signal Port if SIP Registration Failed",
    type: "checkbox",
    key: "switchSignalPort",
    default: true,
  },
];

export const SIP_SETTINGS_NOTE = "";

const INTEGER_VALIDATION =
  "Integer digits only while typing (empty allowed).";

/** FXS VoIP SIP Settings — listFxsSipSettings / saveFxsSipSettings POST /fxs/sip */
export const FXS_SIP_FIELD_TOOLTIPS = {
  registerStatus:
    "Read-only. Loaded via listFxsSipSettings (type: list) and refreshed every 30s via statusFxsSipSettings (type: status) when registrationMode is remote.\n" +
    "In local PBX mode (registrationMode: local) displays: Local PBX (registration not required).",

  registrarIp:
    "Saved in saveFxsSipSettings payload (POST /fxs/sip, type: save).\n" +
    "Primary SIP registrar IP address.",

  registrarPort:
    "Saved in saveFxsSipSettings payload.\n" +
    "Primary SIP registrar port.\n" +
    `Default: 5060.\n${INTEGER_VALIDATION}`,

  spareRegistrarServer:
    "Saved in saveFxsSipSettings payload.\n" +
    "When enabled, shows Spare Registrar IP Address and Spare Registrar Port fields.\n" +
    "Default: enabled (true).",

  spareRegistrarIp:
    "Saved in saveFxsSipSettings payload.\n" +
    "Shown only when Spare Registrar Server is enabled.",

  spareRegistrarPort:
    "Saved in saveFxsSipSettings payload.\n" +
    "Shown only when Spare Registrar Server is enabled.\n" +
    `Default: 5060.\n${INTEGER_VALIDATION}`,

  registerInterval:
    "Saved in saveFxsSipSettings payload.\n" +
    "Register interval time in milliseconds.\n" +
    `Default: 0.\n${INTEGER_VALIDATION}`,

  registryValidity:
    "Saved in saveFxsSipSettings payload.\n" +
    "Registry validity period in seconds.\n" +
    `Default: 3600.\n${INTEGER_VALIDATION}`,

  reregistrationInterval:
    "Saved in saveFxsSipSettings payload.\n" +
    "Re-registration interval in seconds.\n" +
    `Default: 32.\n${INTEGER_VALIDATION}`,

  multiRegistrarMode:
    "Saved in saveFxsSipSettings payload.\n" +
    "Enables multi-registrar server mode.\n" +
    "Default: disabled (false).",

  sipTransportProtocol:
    "Saved in saveFxsSipSettings payload.\n" +
    "Options: UDP, TCP.",

  switchSignalPort:
    "Saved in saveFxsSipSettings payload.\n" +
    "Switch signal port if SIP registration failed.\n" +
    "Default: enabled (true).",
};
