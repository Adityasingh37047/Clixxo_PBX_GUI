const GROUP_NO_0_199 =
  "Saved as group.\n" +
  "Dropdown options: 0 to 199. Default on add: 0.";

const WHITELIST_BLACKLIST_ID_EDIT =
  "Required text field. Read-only when editing an existing entry.";

/** Blacklist modal */
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
