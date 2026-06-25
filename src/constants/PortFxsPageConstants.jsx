// Port FXS Page Constants

// Table columns
export const PORT_FXS_TABLE_COLUMNS = [
  { key: "port", label: "Port", width: "60px" },
  { key: "type", label: "Type", width: "80px" },
  { key: "sipAccount", label: "SIP Account", width: "120px" },
  { key: "displayName", label: "Display Name", width: "120px" },
  { key: "dnd", label: "DND", width: "80px" },
  { key: "forward", label: "Forward", width: "80px" },
  { key: "callWaiting", label: "Call Waiting", width: "100px" },
  { key: "regStatus", label: "Reg Status", width: "120px" },
  { key: "echoCanceller", label: "Echo Canceller", width: "120px" },
  { key: "modify", label: "Modify", width: "60px" },
];

// Items per page
export const PORT_FXS_ITEMS_PER_PAGE = 16;

// Total ports
export const PORT_FXS_TOTAL_PORTS = 32;

// Initial port data structure
export const PORT_FXS_INITIAL_DATA = {
  port: 1,
  type: "FXS",
  sipAccount: "---",
  displayName: "---",
  autoDialNum: "---",
  dnd: "Disable",
  forward: "Disable",
  fwdType: "---",
  fwdNumber: "---",
  cid: "Enable",
  callWaiting: "Disable",
  regStatus: "Unregistered",
  echoCanceller: "Enable",
  colorRing: "Disable",
  colorRingIndex: "---",
  inputGain: 0,
  outputGain: 0,
};

// Batch Modify Form Fields
export const PORT_FXS_BATCH_MODIFY_FIELDS = [
  // Reordered and adjusted to match reference HTML layout and behavior
  {
    key: "startingPort",
    label: "Starting Port",
    type: "select",
    options: Array.from({ length: PORT_FXS_TOTAL_PORTS }, (_, i) =>
      String(i + 1),
    ),
    default: "1",
  },
  {
    key: "endingPort",
    label: "Ending Port",
    type: "select",
    options: Array.from({ length: PORT_FXS_TOTAL_PORTS }, (_, i) =>
      String(i + 1),
    ),
    default: "1",
  },
  {
    key: "batchRegister",
    label: "Batch Register",
    type: "checkbox",
    default: true,
  },
  {
    key: "registerPort",
    label: "Register Port",
    type: "select",
    options: ["No", "Yes"],
    default: "No",
    conditional: "batchRegister",
  },
  {
    key: "batchAccount",
    label: "Batch Account",
    type: "checkbox",
    default: true,
  },
  {
    key: "startingSipAccount",
    label: "Starting SIP Account",
    type: "text",
    default: "",
    conditional: "batchAccount",
  },
  {
    key: "startingDisplayName",
    label: "Starting Display Name",
    type: "text",
    default: "",
    conditional: "batchAccount",
  },
  {
    key: "startingAuthPassword",
    label: "Starting Authentication Password",
    type: "password",
    default: "",
    conditional: "batchAccount",
    conditionalParent: "registerPort",
    conditionalParentValue: "Yes",
  },
  {
    key: "displayNamePreferred",
    label: "Display Name Preferred",
    type: "checkbox",
    default: false,
    conditional: "batchAccount",
  },
  {
    key: "sipAccountBatchRule",
    label: "SIP Account Batch Rule",
    type: "select",
    options: ["Increase", "Decrease"],
    default: "Increase",
    conditional: "batchAccount",
  },
  {
    key: "sipAccountBatchStepSize",
    label: "SIP Account Batch Step Size",
    type: "text",
    default: "1",
    validation: "integer",
    conditional: "batchAccount",
  },
  {
    key: "displayNameBatchRule",
    label: "Display Name Batch Rule",
    type: "select",
    options: ["Increase", "Decrease", "All Same"],
    default: "All Same",
    conditional: "batchAccount",
  },
  {
    key: "displayNameBatchStepSize",
    label: "Display Name Batch Step Size",
    type: "text",
    default: "1",
    validation: "integer",
    conditional: "batchAccount",
    conditionalParent: "displayNameBatchRule",
    conditionalParentValue: ["Increase", "Decrease"],
  },
  {
    key: "authPasswordBatchRule",
    label: "Authentication Password Batch Rule",
    type: "select",
    options: ["Increase", "Decrease", "All Same"],
    default: "All Same",
    conditional: "batchAccount",
    conditionalParent: "registerPort",
    conditionalParentValue: "Yes",
  },
  {
    key: "authPasswordBatchStepSize",
    label: "Authentication Password Batch Step Size",
    type: "text",
    default: "1",
    validation: "integer",
    conditional: "batchAccount",
    conditionalParent: "registerPort",
    conditionalParentValue: "Yes",
  },
  // Removed authentication username & password step/username rules per request
  {
    key: "batchConfigure",
    label: "Batch Configure",
    type: "checkbox",
    default: true,
  },
  {
    key: "autoDialNumberEnable",
    label: "Auto Dial Number",
    type: "checkbox",
    default: false,
    conditional: "batchConfigure",
  },
  {
    key: "autoDialNumber",
    label: "Auto Dial Number",
    type: "text",
    default: "",
    conditional: "batchConfigure",
    conditionalParent: "autoDialNumberEnable",
  },
  {
    key: "waitTimeBeforeAutoDial",
    label: "Wait Time before Auto Dial (s)",
    type: "text",
    default: "0",
    validation: "integer",
    conditional: "batchConfigure",
    conditionalParent: "autoDialNumberEnable",
  },
  {
    key: "inputGain",
    label: "Input Gain (dB)",
    type: "text",
    default: "0",
    validation: "integer",
    conditional: "batchConfigure",
  },
  {
    key: "outputGain",
    label: "Output Gain (dB)",
    type: "text",
    default: "0",
    validation: "integer",
    conditional: "batchConfigure",
  },
  {
    key: "cid",
    label: "CID",
    type: "checkbox",
    default: true,
    conditional: "batchConfigure",
  },
  {
    key: "echoCanceller",
    label: "Echo Canceller",
    type: "checkbox",
    default: true,
    conditional: "batchConfigure",
  },
  {
    key: "callWaiting",
    label: "Call Waiting",
    type: "checkbox",
    default: false,
    conditional: "batchConfigure",
  },
  {
    key: "dnd",
    label: "DND (Do Not Disturb)",
    type: "checkbox",
    default: false,
    conditional: "batchConfigure",
  },
  {
    key: "callForward",
    label: "Call Forward",
    type: "checkbox",
    default: false,
    conditional: "batchConfigure",
  },
  {
    key: "forwardType",
    label: "Forward Type",
    type: "select",
    options: ["Unconditional", "Busy", "No Reply"],
    default: "Unconditional",
    conditional: "batchConfigure",
    conditionalParent: "callForward",
  },
  {
    key: "forwardNumber",
    label: "Forward Number",
    type: "text",
    default: "",
    conditional: "batchConfigure",
    conditionalParent: "callForward",
  },
  {
    key: "noAnswerDelayTime",
    label: "Time for No Reply Forward (s)",
    type: "text",
    default: "0",
    validation: "integer",
    conditional: "batchConfigure",
    conditionalParent: "forwardType",
    conditionalParentValue: "No Reply",
  },
  // Color ring removed per request
  {
    key: "advancedConfiguration",
    label: "Advanced Configuration",
    type: "checkbox",
    default: false,
    conditional: "batchConfigure",
  },
  {
    key: "ringingParameter",
    label: "Ringing Parameter",
    type: "select",
    options: [
      "RING_ABS120V_CA",
      "RING_20HZ_SINE_DEF",
      "RING_ABS120V_AT",
      "RING_ABS120V_DEF",
      "RING_ABS120V_FI",
      "RING_ABS120V_FR",
      "RING_ABS120V_HK",
      "RING_ABS120V_JP",
      "RING_ABS120V_KR",
      "RING_ABS120V_SG",
      "RING_ABS120V_TW",
      "RING_ABS120V_US",
    ],
    default: "RING_ABS120V_DEF",
    conditional: "batchConfigure",
    conditionalParent: "advancedConfiguration",
  },
  {
    key: "feedVoltageParameter",
    label: "Feed Voltage Parameter",
    type: "select",
    options: [
      "DCFEED_48V_21MA_DEF",
      "DCFEED_48V_20MA_CN",
      "DCFEED_51V_23MA_ETSI",
      "DCFEED_50V_25MA_USA",
    ],
    default: "DCFEED_48V_21MA_DEF",
    conditional: "batchConfigure",
    conditionalParent: "advancedConfiguration",
  },
  {
    key: "impedanceParameter",
    label: "Impedance Parameter",
    type: "select",
    options: [
      "ZSYN_600_0_0_30_0",
      "ZSYN_270_750_150_30_0",
      "ZSYN_370_620_310_30_0",
      "ZSYN_220_820_120_30_0",
      "ZSYN_600_0_1000_30_0",
      "ZSYN_200_680_100_30_0",
      "ZSYN_220_820_115_30_0",
      "ZSYN_150_510_47_30_0",
      "ZSYN_270_910_120_30_0",
      "ZSYN_370_620_310_30_0",
      "ZSYN_900_0_0_30_0",
      "ZSYN_900_0_2160_30_0",
    ],
    default: "ZSYN_200_680_100_30_0",
    conditional: "batchConfigure",
    conditionalParent: "advancedConfiguration",
  },
];

/** Single-port modify — same fields as batch (without batch-only controls). */
const PORT_FXS_MODIFY_EXCLUDE_KEYS = new Set([
  "endingPort",
  "batchRegister",
  "batchAccount",
  "batchConfigure",
  "sipAccountBatchRule",
  "sipAccountBatchStepSize",
  "displayNameBatchRule",
  "displayNameBatchStepSize",
  "authPasswordBatchRule",
  "authPasswordBatchStepSize",
]);

export const PORT_FXS_MODIFY_FIELDS = PORT_FXS_BATCH_MODIFY_FIELDS.filter(
  (f) => !PORT_FXS_MODIFY_EXCLUDE_KEYS.has(f.key),
).map((f) =>
  f.key === "startingPort" ? { ...f, label: "Port" } : f,
);

// Batch Modify Note
export const PORT_FXS_BATCH_MODIFY_NOTE =
  "Note: 'Auto Dial Number' goes into effect only if no dialing occurs during 'Wait Time before Auto Dial'.";

// Full dialog/page width for FXS-Modify and FXS-Batch Modify
export const PORT_FXS_MODIFY_DIALOG_WIDTH = 610;

// Form/card area (internal width only)
export const PORT_FXS_MODIFY_FORM_WIDTH = 600;

// Page Title
export const PORT_FXS_PAGE_TITLE = "FXS Settings";

// Batch Modify Modal Title
export const PORT_FXS_BATCH_MODIFY_TITLE = "FXS-Batch Modify";

const INTEGER_VALIDATION =
  "Integer digits only while typing (empty allowed).";

/** FXS Port single modify — PORT_FXS_MODIFY_FIELDS / saveFxsPort payload */
export const PORT_FXS_MODIFY_FIELD_TOOLTIPS = {
  startingPort:
    "FXS port number to modify (labeled Port on this page).\n" +
    "Saved as port (Number) in saveFxsPort payload.\n" +
    "Options: 1 to " + PORT_FXS_TOTAL_PORTS + ".",

  type:
    "Port hardware type. Read-only FXS on modify page.",

  registerPort:
    "Whether this port registers with the SIP server.\n" +
    "Options: No, Yes.\n" +
    "Saved as enabled (boolean) and registerPort ('yes'/'no') in saveFxsPort.\n" +
    "When Yes, Starting Authentication Password field is shown.",

  startingSipAccount:
    "SIP account username for this port.\n" +
    "Saved as sipAccount in saveFxsPort.",

  startingDisplayName:
    "SIP display name for this port.\n" +
    "Saved as displayName in saveFxsPort.",

  startingAuthPassword:
    "SIP authentication password.\n" +
    "Shown only when Register Port is Yes.\n" +
    "Saved as authPassword in saveFxsPort.",

  displayNamePreferred:
    "Prefer display name over SIP account for caller ID.\n" +
    "Saved as displayNamePreferred (boolean) in saveFxsPort.",

  autoDialNumberEnable:
    "Enable auto-dial after wait time with no manual dialing.\n" +
    "Saved as autoDialEnabled in saveFxsPort.\n" +
    "When enabled, Auto Dial Number and Wait Time fields are shown.",

  autoDialNumber:
    "Number dialed automatically when auto-dial triggers.\n" +
    "Shown when Auto Dial Number is enabled.\n" +
    "Allowed keys: 0-9, a, b, c, #, *.\n" +
    "Required when auto-dial is enabled (validate on save).\n" +
    "Saved as autoDialNumber in saveFxsPort.",

  waitTimeBeforeAutoDial:
    "Seconds to wait before auto-dial (s).\n" +
    "Shown when Auto Dial Number is enabled.\n" +
    "Required when auto-dial is enabled (validate on save).\n" +
    `Saved as autoDialWaitSec (Number) in saveFxsPort.\n${INTEGER_VALIDATION}`,

  inputGain:
    "Input gain in dB.\n" +
    "Saved as inputGain (Number) in saveFxsPort.\n" +
    "Allowed keys: digits and hyphen.",

  outputGain:
    "Output gain in dB.\n" +
    "Saved as outputGain (Number) in saveFxsPort.\n" +
    "Allowed keys: digits and hyphen.",

  cid:
    "Caller ID (CID) presentation enable.\n" +
    "Saved as cidEnabled (boolean) in saveFxsPort.",

  echoCanceller:
    "Echo canceller enable.\n" +
    "Saved as echoCanceller (boolean) in saveFxsPort.",

  callWaiting:
    "Call waiting enable.\n" +
    "Saved as callWaiting (boolean) in saveFxsPort.",

  dnd:
    "Do Not Disturb (DND) enable.\n" +
    "Mutually exclusive with Call Forward (enabling one disables the other).\n" +
    "Saved as dnd (boolean) in saveFxsPort.",

  callForward:
    "Call forward enable.\n" +
    "Mutually exclusive with DND.\n" +
    "When enabled, Forward Type and Forward Number are shown.\n" +
    "Saved as callForwardEnabled (boolean) in saveFxsPort.",

  forwardType:
    "Call forward condition.\n" +
    "Shown when Call Forward is enabled.\n" +
    "Options: Unconditional, Busy, No Reply.\n" +
    "Saved as forwardType (unconditional/busy/no_reply) in saveFxsPort.\n" +
    "When No Reply is selected, Time for No Reply Forward is shown.",

  forwardNumber:
    "Destination number for call forward.\n" +
    "Shown when Call Forward is enabled.\n" +
    "Required when call forward is enabled (validate on save).\n" +
    "Saved as forwardNumber in saveFxsPort.",

  noAnswerDelayTime:
    "No-answer forward delay in seconds.\n" +
    "Shown when Forward Type is No Reply.\n" +
    "Required when forward type is No Reply (validate on save).\n" +
    `Saved as noReplyDelaySec (Number) in saveFxsPort.\n${INTEGER_VALIDATION}`,

  advancedConfiguration:
    "Show advanced FXS line parameters (ringing, feed voltage, impedance).\n" +
    "When enabled, Ringing/Feed Voltage/Impedance Parameter fields are shown.",

  ringingParameter:
    "FXS ringing waveform/country profile.\n" +
    "Shown when Advanced Configuration is enabled.",

  feedVoltageParameter:
    "FXS DC feed voltage/current profile.\n" +
    "Shown when Advanced Configuration is enabled.",

  impedanceParameter:
    "FXS line impedance matching profile.\n" +
    "Shown when Advanced Configuration is enabled.",
};

/** FXS Port batch modify — PORT_FXS_BATCH_MODIFY_FIELDS / saveFxsBatch payload */
export const PORT_FXS_BATCH_MODIFY_FIELD_TOOLTIPS = {
  startingPort:
    "First port in batch range.\n" +
    "Saved as startingPort (Number) in saveFxsBatch (POST /fxs, type: save-batch).\n" +
    "Must not exceed Ending Port (validate on save).",

  endingPort:
    "Last port in batch range.\n" +
    "Saved as endingPort (Number) in saveFxsBatch.",

  batchRegister:
    "Enable batch registration settings section.\n" +
    "Saved as batchRegisterEnabled (boolean) in saveFxsBatch.\n" +
    "When enabled, Register Port field is shown.",

  registerPort:
    "Whether ports in range register with SIP server.\n" +
    "Shown when Batch Register is enabled.\n" +
    "Options: No, Yes.\n" +
    "Saved as registerPort ('yes'/'no') in saveFxsBatch.\n" +
    "When Yes with Batch Register, authentication password fields are required.",

  batchAccount:
    "Enable batch SIP account/display name/password settings.\n" +
    "Saved as batchAccountEnabled (boolean) in saveFxsBatch.",

  startingSipAccount:
    "Starting SIP account for the first port in range.\n" +
    "Shown when Batch Account is enabled.\n" +
    "May be left empty to clear accounts; step size validated only when non-empty.",

  startingDisplayName:
    "Starting display name for the first port in range.\n" +
    "Shown when Batch Account is enabled.",

  startingAuthPassword:
    "Starting authentication password.\n" +
    "Shown when Batch Account and Register Port Yes are enabled.\n" +
    "Required when batch register with Yes (validate on save).",

  displayNamePreferred:
    "Prefer display name over SIP account for caller ID.\n" +
    "Saved as displayNamePreferred (boolean) in saveFxsBatch.",

  sipAccountBatchRule:
    "How SIP accounts increment across the port range.\n" +
    "Options: Increase, Decrease.\n" +
    "Saved as sipAccountBatchRule (lowercase) in saveFxsBatch.",

  sipAccountBatchStepSize:
    "Step size for SIP account batch rule.\n" +
    "Required when Starting SIP Account is provided.\n" +
    `Saved as sipAccountBatchStepSize (Number) in saveFxsBatch.\n${INTEGER_VALIDATION}`,

  displayNameBatchRule:
    "How display names change across the port range.\n" +
    "Options: Increase, Decrease, All Same.\n" +
    "Saved as displayNameBatchRule (lowercase) in saveFxsBatch.",

  displayNameBatchStepSize:
    "Step size for display name batch rule.\n" +
    "Shown when Display Name Batch Rule is Increase or Decrease.\n" +
    "Required unless rule is All Same (validate on save).",

  authPasswordBatchRule:
    "How authentication passwords change across the port range.\n" +
    "Shown when Batch Account and Register Port Yes are enabled.\n" +
    "Options: Increase, Decrease, All Same.",

  authPasswordBatchStepSize:
    "Step size for authentication password batch rule.\n" +
    "Required unless rule is All Same when Register Port is Yes (validate on save).",

  batchConfigure:
    "Enable batch port configuration (gains, CID, forwarding, etc.).\n" +
    "Saved as batchConfigureEnabled (boolean) in saveFxsBatch.",

  autoDialNumberEnable:
    "Enable auto-dial for all ports in range.\n" +
    "Shown when Batch Configure is enabled.\n" +
    "Saved as autoDialEnabled in saveFxsBatch.",

  autoDialNumber:
    "Auto-dial destination number.\n" +
    "Shown when Auto Dial Number checkbox is enabled.\n" +
    "Required when auto-dial enabled (validate on save).",

  waitTimeBeforeAutoDial:
    "Wait time before auto-dial in seconds.\n" +
    "Shown when Auto Dial Number checkbox is enabled.\n" +
    "Required when auto-dial enabled (validate on save).",

  inputGain:
    "Input gain in dB for all ports.\n" +
    "Shown when Batch Configure is enabled.\n" +
    "Valid range: -6 to 6 when batch configure enabled (validate on save).",

  outputGain:
    "Output gain in dB for all ports.\n" +
    "Shown when Batch Configure is enabled.\n" +
    "Valid range: -6 to 6 when batch configure enabled (validate on save).",

  cid:
    "Caller ID enable for all ports.\n" +
    "Saved as cidEnabled in saveFxsBatch.",

  echoCanceller:
    "Echo canceller enable for all ports.",

  callWaiting:
    "Call waiting enable for all ports.",

  dnd:
    "DND enable. Mutually exclusive with Call Forward.",

  callForward:
    "Call forward enable. Mutually exclusive with DND.",

  forwardType:
    "Call forward condition when Call Forward is enabled.",

  forwardNumber:
    "Forward destination. Required when call forward enabled (validate on save).",

  noAnswerDelayTime:
    "No-reply forward delay. Required when Forward Type is No Reply.",

  advancedConfiguration:
    "Show advanced line parameters for batch configure.",

  ringingParameter:
    "Ringing profile. Shown when Advanced Configuration is enabled.",

  feedVoltageParameter:
    "Feed voltage profile. Shown when Advanced Configuration is enabled.",

  impedanceParameter:
    "Impedance profile. Shown when Advanced Configuration is enabled.",
};

/** FXS Port list table — configurable column headers (PortFxsPage) */
export const PORT_FXS_TABLE_COLUMN_TOOLTIPS = {
  port:
    "FXS port number (1–" + PORT_FXS_TOTAL_PORTS + "). Read-only identifier.",

  type:
    "Port type. Always FXS on this page.",

  sipAccount:
    "Configured SIP account username. Modify via FXS-Modify dialog.",

  displayName:
    "Configured SIP display name. Modify via FXS-Modify dialog.",

  dnd:
    "Do Not Disturb status: Enable or Disable.",

  forward:
    "Call forward status: Enable or Disable.",

  callWaiting:
    "Call waiting status: Enable or Disable.",

  regStatus:
    "SIP registration status for this port (e.g. Registered, Unregistered).",

  echoCanceller:
    "Echo canceller status: Enable or Disable.",
};
