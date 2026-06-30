const GROUP_NO_0_199 =
  "Saved as group.\n" +
  "Dropdown options: 0 to 199. Default on add: 0.";

const WHITELIST_BLACKLIST_ID_EDIT =
  "Required text field. Read-only when editing an existing entry.";

export const NUMBER_FILTER_BLACKLIST_PAGE_BREADCRUMB_ROOT = "E1-PRI";
export const NUMBER_FILTER_BLACKLIST_PAGE_BREADCRUMB_SECTION = "Number Filter";
export const NUMBER_FILTER_BLACKLIST_PAGE_TITLE = "Blacklist";
export const NUMBER_FILTER_BLACKLIST_CALLER_PANEL_TITLE = "CallerID Blacklist";
export const NUMBER_FILTER_BLACKLIST_CALLEE_PANEL_TITLE = "CalleeID Blacklist";
export const NUMBER_FILTER_BLACKLIST_MODAL_TITLE_CALLER = "CallerIDs in Blacklist";
export const NUMBER_FILTER_BLACKLIST_MODAL_TITLE_CALLEE = "CalleeIDs in Blacklist";
export const NUMBER_FILTER_BLACKLIST_ADD_NEW_LABEL = "+ Add New";
export const NUMBER_FILTER_BLACKLIST_DELETE_LABEL = "Delete";
export const NUMBER_FILTER_BLACKLIST_CLEAR_ALL_LABEL = "Clear All";
export const NUMBER_FILTER_BLACKLIST_SAVE_LABEL = "Save";
export const NUMBER_FILTER_BLACKLIST_CLOSE_LABEL = "Close";
export const NUMBER_FILTER_BLACKLIST_LOADING_MESSAGE = "Loading blacklist data...";
export const NUMBER_FILTER_BLACKLIST_NOTE =
  "Note: The one list, only the latest 200 pieces will be displayed. To check all the records, please backup the file.";

/** Blacklist modal */
export const NUMBER_FILTER_BLACKLIST_FIELD_TOOLTIPS = {
  groupNo:
    GROUP_NO_0_199 +
    "\nChanging group recalculates no_in_groups internally.\n" +
    "In edit mode, only this field can be changed.",

  callerId:
    "Saved as number with type blacklist and subtype callerid.\n" +
    WHITELIST_BLACKLIST_ID_EDIT +
    "\nDuplicate caller ID in the same group is blocked on add.",

  calleeId:
    "Saved as number with type blacklist and subtype calleeid.\n" +
    WHITELIST_BLACKLIST_ID_EDIT +
    "\nDuplicate callee ID in the same group is blocked on add.",
};
