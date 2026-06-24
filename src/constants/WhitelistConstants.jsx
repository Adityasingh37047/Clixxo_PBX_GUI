const GROUP_NO_0_199 =
  "Saved as group.\n" +
  "Dropdown options: 0 to 199. Default on add: 0.";

const WHITELIST_BLACKLIST_ID_EDIT =
  "Required text field. Read-only when editing an existing entry.";

/** Whitelist modal */
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
