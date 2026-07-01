// Number Receiving Rule modal fields and initial state (PcmNumReceivingRulePage)

export const PCM_NUM_RECEIVING_RULE_FIELDS = [
  {
    name: "number_data",
    label: "Number Data",
    type: "text",
    placeholder: "ex: 982349823",
  },
  {
    name: "provider",
    label: "Provider",
    type: "select",
    options: [
      { value: "bsnl", label: "BSNL" },
      { value: "airtel", label: "Airtel" },
      { value: "jio", label: "Jio" },
      { value: "vi", label: "Vi" },
      { value: "other", label: "Other" },
    ],
  },
];

export const PCM_NUM_RECEIVING_RULE_INITIAL_FORM = {
  number_data: " ",
  provider: "bsnl",
};

export const PCM_NUM_RECEIVING_RULE_TABLE_COLUMNS = [
  { key: "check", label: "Check" },
  { key: "index", label: "ID" },
  { key: "number_data", label: "Number Data" },
  { key: "provider", label: "Provider" },
  { key: "modify", label: "Modify" },
];

export const PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_ROOT = "E1-PRI";
export const PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_SECTION = "PCM";
export const PCM_NUM_RECEIVING_RULE_PAGE_TITLE = "Number-Receiving Rule";
export const PCM_NUM_RECEIVING_RULE_EMPTY_MESSAGE =
  "No Number-Receiving Rules found.";
export const PCM_NUM_RECEIVING_RULE_MODAL_TITLE_ADD =
  "Add Number-Receiving Rule";
export const PCM_NUM_RECEIVING_RULE_MODAL_TITLE_EDIT =
  "Edit Number-Receiving Rule";
export const PCM_NUM_RECEIVING_RULE_ADD_NEW_LABEL = "+ Add New";
export const PCM_NUM_RECEIVING_RULE_DELETE_LABEL = "Delete";
export const PCM_NUM_RECEIVING_RULE_SAVE_LABEL = "Save";
export const PCM_NUM_RECEIVING_RULE_CLOSE_LABEL = "Close";

/** Number-Receiving Rule (PcmNumReceivingRulePage) — POST /numrecv */
export const PCM_NUM_RECEIVING_RULE_FIELD_TOOLTIPS = {
  number_data:
    "Saved as number_data. Required trimmed non-empty text.\n" +
    "UI note: x and * wildcards are supported in rules.",
  provider:
    "Saved as provider. Required.\n" +
    "Options: bsnl, airtel, jio, vi, other. Default: bsnl.",
};
