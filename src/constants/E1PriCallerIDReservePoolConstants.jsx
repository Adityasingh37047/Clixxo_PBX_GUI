export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_TABLE_COLUMNS = [
  { key: "check", label: "Check" },
  { key: "no", label: "No." },
  { key: "callerId", label: "CallerID" },
  { key: "modify", label: "Modify" },
];

export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_FIELDS = [
  { name: "no", label: "No.:", type: "number", min: 0 },
  { name: "callerId", label: "CallerID:", type: "text" },
];

export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_INITIAL_FORM = {
  no: 0,
  callerId: "",
};

export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_PAGE_BREADCRUMB_ROOT =
  "E1-PRI";
export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_PAGE_BREADCRUMB_SECTION =
  "Num Manipulate";
export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_PAGE_TITLE =
  "CallerID Reserve Pool";
export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_EMPTY_MESSAGE =
  "No available CallerID Reserve!";
export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_MODAL_TITLE_ADD =
  "Add CallerID Reserve Pool";
export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_MODAL_TITLE_EDIT =
  "Edit CallerID Reserve Pool";
export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_LABEL = "+ Add New";
export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_EMPTY_LABEL =
  "+ Add New";
export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_DELETE_LABEL = "Delete";
export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_CLEAR_ALL_LABEL = "Clear All";
export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_SAVE_LABEL = "Save";
export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_CLOSE_LABEL = "Close";
export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_NOTE =
  "Note: Don't change the number when using the number kept in pool!";

/** CallerID Reserve Pool modal — local component state only */
export const NUM_MANIPULATE_CALLERID_RESERVE_POOL_FIELD_TOOLTIPS = {
  no:
    "Sequence number for this reserved CallerID entry.\n" +
    "Required on save. Integer ≥ 0.\n" +
    "Note: save validation treats 0 as empty; use 1 or higher when saving.",
  callerId:
    "Reserved CallerID kept in this pool.\n" +
    "Required on save. Do not change a number while it is assigned (see page note).",
};
