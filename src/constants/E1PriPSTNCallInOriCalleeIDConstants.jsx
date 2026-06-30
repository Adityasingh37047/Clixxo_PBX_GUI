export const PSTN_CALL_IN_ORICALLEEID_TABLE_COLUMNS = [
  { key: "index", label: "ID" },
  { key: "call_initiator", label: "Call Initiator" },
  { key: "callerid_prefix", label: "CallerID Prefix" },
  { key: "calleeid_prefix", label: "CalleeID Prefix" },
  { key: "stripped_digits_from_right", label: "Stripped Digits from Right" },
  { key: "reserved_digits_from_right", label: "Reserved Digits from Right" },
];

export const PSTN_CALL_IN_ORICALLEEID_FIELDS = [
  {
    name: "call_initiator",
    label: "Call Initiator:",
    type: "select",
    options: [],
  },
  { name: "callerid_prefix", label: "CallerID Prefix:", type: "text" },
  { name: "calleeid_prefix", label: "CalleeID Prefix:", type: "text" },
  {
    name: "stripped_digits_from_left",
    label: "Stripped Digits from Left:",
    type: "number",
  },
  {
    name: "stripped_digits_from_right",
    label: "Stripped Digits from Right:",
    type: "number",
  },
  {
    name: "reserved_digits_from_right",
    label: "Reserved Digits from Right:",
    type: "number",
  },
  { name: "prefix_to_add", label: "Prefix to Add:", type: "text" },
  { name: "suffix_to_add", label: "Suffix to Add:", type: "text" },
  { name: "description", label: "Description:", type: "text" },
];

export const PSTN_CALL_IN_ORICALLEEID_INITIAL_FORM = {
  call_initiator: "",
  callerid_prefix: "*",
  calleeid_prefix: "*",
  with_original_calleeid: "No",
  stripped_digits_from_left: "0",
  stripped_digits_from_right: "0",
  reserved_digits_from_right: "20",
  prefix_to_add: "",
  suffix_to_add: "",
  description: "",
};

export const NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_PAGE_BREADCRUMB_ROOT =
  "E1-PRI";
export const NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_PAGE_BREADCRUMB_SECTION =
  "Num Manipulate";
export const NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_PAGE_TITLE =
  "PSTN Call In OriCalleeID";
export const NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_EMPTY_MESSAGE =
  "No PSTN call in ori callee ID rules found.";
export const NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_MODAL_TITLE_ADD =
  "Add PSTN Call In OriCalleeID";
export const NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_MODAL_TITLE_EDIT =
  "Edit PSTN Call In OriCalleeID";
export const NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_ADD_NEW_LABEL =
  "+ Add New";
export const NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_ADD_NEW_EMPTY_LABEL =
  "+ Add New Rule";
export const NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_SAVE_LABEL = "Save";
export const NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_CLOSE_LABEL = "Close";

/** PSTN Call In OriCalleeID (manipulation_type: pstn_in_oricalleeid) */
export const PSTN_CALL_IN_ORICALLEEID_FIELD_TOOLTIPS = {
  call_initiator:
    "PCM trunk group for this rule (saved as call_initiator).\n" +
    "Applies to inbound PSTN calls on the selected trunk when CallerID and CalleeID prefixes match.\n" +
    "Required. Options loaded from configured PCM trunk groups.",

  callerid_prefix:
    "Incoming CallerID match pattern (saved as callerid_prefix).\n" +
    "Only digits (0-9) and * are allowed. Default: *. Required.",

  calleeid_prefix:
    "Incoming CalleeID match pattern (saved as calleeid_prefix).\n" +
    "Only digits (0-9) and * are allowed. Default: *. Required.",

  stripped_digits_from_left:
    "Digits removed from the left before prefix/suffix are applied (saved as stripped_digits_from_left).\n" +
    "Empty value is saved as 0. Default: 0.",

  stripped_digits_from_right:
    "Digits removed from the right before prefix/suffix are applied (saved as stripped_digits_from_right).\n" +
    "Empty value is saved as 0. Default: 0.",

  reserved_digits_from_right:
    "Digits kept from the right after stripping (saved as reserved_digits_from_right).\n" +
    "Empty value is saved as 0. Default: 20.",

  prefix_to_add:
    "Text prepended to the number after stripping (saved as prefix_to_add). Default: empty.",

  suffix_to_add:
    "Text appended to the number after stripping (saved as suffix_to_add). Default: empty.",

  description:
    "Optional label for this rule (saved as description). Default: empty.\n" +
    "with_original_calleeid is not shown in this form; create/update always sends No.",
};
