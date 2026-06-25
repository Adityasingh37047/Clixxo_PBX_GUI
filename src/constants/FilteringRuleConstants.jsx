export const FILTERING_RULE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'id', label: 'ID' },
  { key: 'callerIdWhitelist', label: 'CallerID Whitelist' },
  { key: 'calleeIdWhitelist', label: 'CalleeID Whitelist' },
  { key: 'callerIdBlacklist', label: 'CallerID Blacklist' },
  { key: 'calleeIdBlacklist', label: 'CalleeID Blacklist' },
  { key: 'callerIdPoolWhitelist', label: 'CallerID Pool in Whitelist' },
  { key: 'callerIdPoolBlacklist', label: 'CallerID Pool in Blacklist' },
  { key: 'calleeIdPoolWhitelist', label: 'CalleeID Pool in Whitelist' },
  { key: 'calleeIdPoolBlacklist', label: 'CalleeID Pool in Blacklist' },
  { key: 'originalCallerIdPoolWhitelist', label: 'Original CallerID Pool in Whitelist' },
  { key: 'originalCallerIdPoolBlacklist', label: 'Original CallerID Pool in Blacklist' },
  // Modify column disabled — uncomment next line to show edit icon column:
  // { key: 'modify', label: 'Modify' },
];

export const FILTERING_RULE_DROPDOWN_OPTIONS = [
  'none'
];

const GROUP_OPTIONS_NOTE =
  "Options loaded when the modal opens from number-filter and number-pool APIs.\n" +
  "Always includes none; group numbers appear when matching whitelist, blacklist, or pool records exist.";

/** Filtering Rule modal */
export const FILTERING_RULE_FIELD_TOOLTIPS = {
  id:
    "Display-only row number in the form.\n" +
    "Not included in the create save payload.",

  callerIdWhitelist:
    "CallerID whitelist group for this rule (saved as caller_id_white_list).\n" +
    GROUP_OPTIONS_NOTE + "\nDefault: none.",

  calleeIdWhitelist:
    "CalleeID whitelist group for this rule (saved as callee_id_white_list).\n" +
    GROUP_OPTIONS_NOTE + "\nDefault: none.",

  callerIdBlacklist:
    "CallerID blacklist group for this rule (saved as caller_id_black_list).\n" +
    GROUP_OPTIONS_NOTE + "\nDefault: none.",

  calleeIdBlacklist:
    "CalleeID blacklist group for this rule (saved as callee_id_black_list).\n" +
    GROUP_OPTIONS_NOTE + "\nDefault: none.",

  callerIdPoolWhitelist:
    "CallerID number-pool whitelist group (saved as caller_id_pool_in_white_list).\n" +
    GROUP_OPTIONS_NOTE + "\nDefault: none.",

  callerIdPoolBlacklist:
    "CallerID number-pool blacklist group (saved as caller_id_pool_in_black_list).\n" +
    GROUP_OPTIONS_NOTE + "\nDefault: none.",

  calleeIdPoolWhitelist:
    "CalleeID number-pool whitelist group (saved as callee_id_pool_in_white_list).\n" +
    GROUP_OPTIONS_NOTE + "\nDefault: none.",

  calleeIdPoolBlacklist:
    "CalleeID number-pool blacklist group (saved as callee_id_pool_in_black_list).\n" +
    GROUP_OPTIONS_NOTE + "\nDefault: none.",

  originalCallerIdPoolWhitelist:
    "Original CallerID number-pool whitelist group (saved as original_caller_id_pool_in_white_list).\n" +
    GROUP_OPTIONS_NOTE + "\nDefault: none.",

  originalCallerIdPoolBlacklist:
    "Original CallerID number-pool blacklist group (saved as original_caller_id_pool_in_black_list).\n" +
    GROUP_OPTIONS_NOTE + "\nDefault: none.",
};
