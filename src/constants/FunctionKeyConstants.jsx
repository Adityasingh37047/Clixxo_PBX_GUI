// Function Key Constants
export const FUNCTION_KEY_PAGE_BREADCRUMB_ROOT = "FXS";
export const FUNCTION_KEY_PAGE_BREADCRUMB_SECTION = "Advanced";
export const FUNCTION_KEY_PAGE_TITLE = "Function Key";
export const FUNCTION_KEY_CARD_TITLE = "Function Key";
export const FUNCTION_KEY_SECTIONS_ORDER = [
  "Device Function",
  "Service Available",
];
export const FUNCTION_KEY_SAVE_LABEL = "Save";
export const FUNCTION_KEY_RESET_LABEL = "Reset";

export const FUNCTION_KEY_FIELDS = [
  // Device Function Section
  {
    id: 'queryLan1',
    name: 'Query LAN1',
    enableKey: 'queryLan1Enable',
    functionKeyKey: 'queryLan1',
    modeKey: 'queryLan1Mode',
    defaultValue: '*11*',
    section: 'Device Function',
  },
  {
    id: 'queryLan2',
    name: 'Query LAN2',
    enableKey: 'queryLan2Enable',
    functionKeyKey: 'queryLan2',
    modeKey: 'queryLan2Mode',
    defaultValue: '*12*',
    section: 'Device Function',
  },
  {
    id: 'queryAccount',
    name: 'Query Phone Number',
    enableKey: 'queryAccountEnable',
    functionKeyKey: 'queryAccount',
    modeKey: 'queryAccountMode',
    defaultValue: '*20*',
    section: 'Device Function',
  },
  {
    id: 'callTest',
    name: 'Phone Test',
    enableKey: 'callTestEnable',
    functionKeyKey: 'callTest',
    modeKey: 'callTestMode',
    defaultValue: '*30*',
    section: 'Device Function',
  },
  {
    id: 'setLan1',
    name: 'Set LAN1',
    enableKey: 'setLan1Enable',
    functionKeyKey: 'setLan1',
    modeKey: 'setLan1Mode',
    defaultValue: '*61*',
    section: 'Device Function',
  },
  {
    id: 'setLan2',
    name: 'Set LAN2',
    enableKey: 'setLan2Enable',
    functionKeyKey: 'setLan2',
    modeKey: 'setLan2Mode',
    defaultValue: '*62*',
    section: 'Device Function',
  },
  {
    id: 'queryWebPort',
    name: 'Query WEB Port',
    enableKey: 'queryWebPortEnable',
    functionKeyKey: 'queryWebPort',
    modeKey: 'queryWebPortMode',
    defaultValue: '*70*',
    section: 'Device Function',
  },
  {
    id: 'reboot',
    name: 'Reboot',
    enableKey: 'rebootEnable',
    functionKeyKey: 'reboot',
    modeKey: 'rebootMode',
    defaultValue: '*#88921532*#',
    section: 'Device Function',
    isReboot: true, // Special pattern for reboot
  },
  {
    id: 'noAnswerNum',
    name: 'Query Missed Call Number',
    enableKey: 'noAnswerNumEnable',
    functionKeyKey: 'noAnswerNum',
    modeKey: 'noAnswerNumMode',
    defaultValue: '*71*',
    section: 'Device Function',
  },
  // Service Available Section
  {
    id: 'blindTransfer',
    name: 'Blind Transfer',
    enableKey: 'blindTransferEnable',
    functionKeyKey: 'blindTransfer',
    modeKey: 'blindTransferMode',
    defaultValue: '*010*',
    section: 'Service Available',
  },
  {
    id: 'forwardUnconditionalEnable',
    name: 'Call Forward Unconditional Activate',
    enableKey: 'forwardUnconditionalEnableEnable',
    functionKeyKey: 'forwardUnconditionalEnable',
    modeKey: 'forwardUnconditionalEnableMode',
    defaultValue: '*030*',
    section: 'Service Available',
  },
  {
    id: 'forwardUnconditionalDisable',
    name: 'Call Forward Unconditional Deactivate',
    enableKey: 'forwardUnconditionalDisableEnable',
    functionKeyKey: 'forwardUnconditionalDisable',
    modeKey: 'forwardUnconditionalDisableMode',
    defaultValue: '*031*',
    section: 'Service Available',
  },
  {
    id: 'forwardBusyEnable',
    name: 'Call Forward Busy Activate',
    enableKey: 'forwardBusyEnableEnable',
    functionKeyKey: 'forwardBusyEnable',
    modeKey: 'forwardBusyEnableMode',
    defaultValue: '*040*',
    section: 'Service Available',
  },
  {
    id: 'forwardBusyDisable',
    name: 'Call Forward Busy Deactivate',
    enableKey: 'forwardBusyDisableEnable',
    functionKeyKey: 'forwardBusyDisable',
    modeKey: 'forwardBusyDisableMode',
    defaultValue: '*041*',
    section: 'Service Available',
  },
  {
    id: 'forwardNoReplyEnable',
    name: 'Call Forward No Reply Activate',
    enableKey: 'forwardNoReplyEnableEnable',
    functionKeyKey: 'forwardNoReplyEnable',
    modeKey: 'forwardNoReplyEnableMode',
    defaultValue: '*050*',
    section: 'Service Available',
  },
  {
    id: 'forwardNoReplyDisable',
    name: 'Call Forward No Reply Deactivate',
    enableKey: 'forwardNoReplyDisableEnable',
    functionKeyKey: 'forwardNoReplyDisable',
    modeKey: 'forwardNoReplyDisableMode',
    defaultValue: '*051*',
    section: 'Service Available',
  },
  {
    id: 'doNotDisturbEnable',
    name: 'Do Not Disturb Activate',
    enableKey: 'doNotDisturbEnableEnable',
    functionKeyKey: 'doNotDisturbEnable',
    modeKey: 'doNotDisturbEnableMode',
    defaultValue: '*060*',
    section: 'Service Available',
  },
  {
    id: 'doNotDisturbDisable',
    name: 'Do Not Disturb Deactivate',
    enableKey: 'doNotDisturbDisableEnable',
    functionKeyKey: 'doNotDisturbDisable',
    modeKey: 'doNotDisturbDisableMode',
    defaultValue: '*061*',
    section: 'Service Available',
  },
  {
    id: 'conference',
    name: 'Conference',
    enableKey: 'conferenceEnable',
    functionKeyKey: 'conference',
    modeKey: 'conferenceMode',
    defaultValue: '*070*',
    section: 'Service Available',
  },
  {
    id: 'fxsRegIn',
    name: 'Register',
    enableKey: 'fxsRegInEnable',
    functionKeyKey: 'fxsRegIn',
    modeKey: 'fxsRegInMode',
    defaultValue: '*020*',
    section: 'Service Available',
  },
  {
    id: 'fxsRegOut',
    name: 'Unregister',
    enableKey: 'fxsRegOutEnable',
    functionKeyKey: 'fxsRegOut',
    modeKey: 'fxsRegOutMode',
    defaultValue: '*021*',
    section: 'Service Available',
  },
  {
    id: 'fxsRegQuery',
    name: 'Query Register Status',
    enableKey: 'fxsRegQueryEnable',
    functionKeyKey: 'fxsRegQuery',
    modeKey: 'fxsRegQueryMode',
    defaultValue: '*022*',
    section: 'Service Available',
  },
];

// Initial form state
export const getInitialFormState = () => {
  const state = {};
  FUNCTION_KEY_FIELDS.forEach(field => {
    state[field.enableKey] = true;
    state[field.functionKeyKey] = field.defaultValue;
    state[field.modeKey] = '0'; // 0 = Default, 1 = User-defined
  });
  return state;
};

const buildFunctionKeyFieldTooltips = () => {
  const tooltips = {};
  FUNCTION_KEY_FIELDS.forEach((field) => {
    const patternHint = field.isReboot
      ? "User-defined format: *#digits*# (e.g. *#88921532*#)."
      : `User-defined format: *digits* (e.g. ${field.defaultValue}). Max ${field.isReboot ? 12 : 7} characters.`;
    tooltips[field.enableKey] =
      `Enable or disable the ${field.name} function key.\nWhen unchecked, the key and mode fields are inactive.`;
    tooltips[field.functionKeyKey] =
      `Dial string for ${field.name}.\nDefault code: ${field.defaultValue}.\n${patternHint}\nDuplicate codes across enabled keys are rejected on save.`;
    tooltips[field.modeKey] =
      `Key assignment mode for ${field.name}.\nDefault — use factory code (${field.defaultValue}).\nUser-defined — edit the Function Key field; validated on save.`;
  });
  return tooltips;
};

/** Function key table (FunctionKeyPage) — local form state */
export const FUNCTION_KEY_FIELD_TOOLTIPS = buildFunctionKeyFieldTooltips();

