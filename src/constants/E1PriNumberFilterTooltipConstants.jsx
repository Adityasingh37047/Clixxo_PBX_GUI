/**
 * E1-PRI Number Filter tooltips — derived from frontend code only.
 */

const GROUP_NO_0_199 =
  "Saved as group.\n" +
  "Dropdown options: 0 to 199. Default on add: 0.";

const WHITELIST_BLACKLIST_ID_EDIT =
  "Required text field. Read-only when editing an existing entry.";

/** Whitelist modal (CallerIDs / CalleeIDs in Whitelist) */
export const WHITELIST_FIELD_TOOLTIPS = {
  groupNo:
    GROUP_NO_0_199 +
    "\nChanging group recalculates no_in_groups internally.\n" +
    "In edit mode, only this field can be changed.",

  callerId:
    "Saved as number with type whitelist and subtype callerid.\n" +
    WHITELIST_BLACKLIST_ID_EDIT +
    "\nDuplicate caller ID in the same group is blocked on add.",

  calleeId:
    "Saved as number with type whitelist and subtype calleeid.\n" +
    WHITELIST_BLACKLIST_ID_EDIT +
    "\nDuplicate callee ID in the same group is blocked on add.",
};

/** Blacklist modal (CallerIDs / CalleeIDs in Blacklist) */
export const BLACKLIST_FIELD_TOOLTIPS = {
  groupNo:
    GROUP_NO_0_199 +
    "\nChanging group recalculates no_in_groups internally.",

  callerId:
    "Saved as number with type blacklist and subtype callerid.\n" +
    WHITELIST_BLACKLIST_ID_EDIT +
    "\nDuplicate caller ID in the same group is blocked on add.",

  calleeId:
    "Saved as number with type blacklist and subtype calleeid.\n" +
    WHITELIST_BLACKLIST_ID_EDIT +
    "\nDuplicate callee ID in the same group is blocked on add.",
};

/** Number Pool modal */
export const NUMBER_POOL_FIELD_TOOLTIPS = {
  groupNo:
    "Saved as group.\n" +
    "Dropdown options: 0 to 199. Default on add: 0.\n" +
    "no_in_groups is set to the current entry count in the selected group.",

  range:
    "Saved as number_range in start-end format.\n" +
    "Start and End are both required.\n" +
    "UI validates equal digit length and Start ≤ End.",
};

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
