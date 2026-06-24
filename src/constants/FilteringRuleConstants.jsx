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

/** Filtering Rule modal */
export const FILTERING_RULE_FIELD_TOOLTIPS = {
  id:
    "Display-only row number in the form.\n" +
    "Not included in the create save payload.",

  callerIdWhitelist:
    "Saved as caller_id_white_list.\n" +
    "Options: none or whitelist caller group numbers. Default: none.",

  calleeIdWhitelist:
    "Saved as callee_id_white_list.\n" +
    "Options: none or whitelist callee group numbers. Default: none.",

  callerIdBlacklist:
    "Saved as caller_id_black_list.\n" +
    "Options: none or blacklist caller group numbers. Default: none.",

  calleeIdBlacklist:
    "Saved as callee_id_black_list.\n" +
    "Options: none or blacklist callee group numbers. Default: none.",

  callerIdPoolWhitelist:
    "Saved as caller_id_pool_in_white_list.\n" +
    "Options: none or Number Pool group numbers. Default: none.",

  callerIdPoolBlacklist:
    "Saved as caller_id_pool_in_black_list.\n" +
    "Options: none or Number Pool group numbers. Default: none.",

  calleeIdPoolWhitelist:
    "Saved as callee_id_pool_in_white_list.\n" +
    "Options: none or Number Pool group numbers. Default: none.",

  calleeIdPoolBlacklist:
    "Saved as callee_id_pool_in_black_list.\n" +
    "Options: none or Number Pool group numbers. Default: none.",

  originalCallerIdPoolWhitelist:
    "Saved as original_caller_id_pool_in_white_list.\n" +
    "Options: none or Number Pool group numbers. Default: none.",

  originalCallerIdPoolBlacklist:
    "Saved as original_caller_id_pool_in_black_list.\n" +
    "Options: none or Number Pool group numbers. Default: none.",
};
