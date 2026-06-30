export const NUMBER_FILTER_RULE_COLUMNS = [
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
];

export const NUMBER_FILTER_RULE_DROPDOWN_OPTIONS = ['none'];

export const NUMBER_FILTER_RULE_PAGE_BREADCRUMB_ROOT = "E1-PRI";
export const NUMBER_FILTER_RULE_PAGE_BREADCRUMB_SECTION = "Number Filter";
export const NUMBER_FILTER_RULE_PAGE_TITLE = "Filtering Rule";
export const NUMBER_FILTER_RULE_EMPTY_MESSAGE = "No filtering rules found.";
export const NUMBER_FILTER_RULE_MODAL_TITLE_ADD = "Add Filtering Rule";
export const NUMBER_FILTER_RULE_MODAL_TITLE_EDIT = "Edit Filtering Rule";
export const NUMBER_FILTER_RULE_ADD_NEW_LABEL = "+ Add New";
export const NUMBER_FILTER_RULE_ADD_NEW_EMPTY_LABEL = "+ Add New";
export const NUMBER_FILTER_RULE_DELETE_LABEL = "Delete";
export const NUMBER_FILTER_RULE_CLEAR_ALL_LABEL = "Clear All";
export const NUMBER_FILTER_RULE_SAVE_LABEL = "Save";
export const NUMBER_FILTER_RULE_CLOSE_LABEL = "Close";

const GROUP_OPTIONS_NOTE =
  "Options loaded when the modal opens from number-filter and number-pool APIs.\n" +
  "Always includes none; group numbers appear when matching whitelist, blacklist, or pool records exist.";

/** Filtering Rule modal */
export const NUMBER_FILTER_RULE_FIELD_TOOLTIPS = {
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
