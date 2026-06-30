export const NUM_MANIPULATE_CALLERID_POOL_TABLE_COLUMNS = [
  { key: "check", label: "Check", width: 50 },
  { key: "no", label: "No.", width: 35 },
  { key: "callerIdRange", label: "CallerID Range", width: 75 },
  { key: "outgoingCallResource", label: "Outgoing Call Resource", width: 100 },
  { key: "destinationPcm", label: "Destination PCM", width: 90 },
  { key: "modify", label: "Modify", width: 50 },
];

export const NUM_MANIPULATE_CALLERID_POOL_MODAL_FIELDS = [
  { key: "no", label: "No.", type: "number", required: true },
  {
    key: "outgoingCallResource",
    label: "Outgoing Call Resource",
    type: "text",
    required: true,
  },
  {
    key: "destinationPcm",
    label: "Destination PCM",
    type: "select",
    required: true,
    options: ["Any", "PCM"],
  },
  { key: "callerIdRange", label: "CallerID Range", type: "text", required: true },
];

export const NUM_MANIPULATE_CALLERID_POOL_INITIAL_FORM = {
  no: "",
  outgoingCallResource: "",
  destinationPcm: "Any",
  callerIdRange: "",
};

export const NUM_MANIPULATE_CALLERID_POOL_PAGE_BREADCRUMB_ROOT = "E1-PRI";
export const NUM_MANIPULATE_CALLERID_POOL_PAGE_BREADCRUMB_SECTION =
  "Num Manipulate";
export const NUM_MANIPULATE_CALLERID_POOL_PAGE_TITLE = "CallerID Pool";
export const NUM_MANIPULATE_CALLERID_POOL_IP_PSTN_PANEL_TITLE =
  "IP->PSTN Manipulated CallerID Pool";
export const NUM_MANIPULATE_CALLERID_POOL_PSTN_IP_PANEL_TITLE =
  "PSTN->IP Manipulated CallerID Pool";
export const NUM_MANIPULATE_CALLERID_POOL_MODAL_TITLE = "CallerID";
export const NUM_MANIPULATE_CALLERID_POOL_ADD_NEW_LABEL = "+ Add New";
export const NUM_MANIPULATE_CALLERID_POOL_DELETE_LABEL = "Delete";
export const NUM_MANIPULATE_CALLERID_POOL_CLEAR_ALL_LABEL = "Clear All";
export const NUM_MANIPULATE_CALLERID_POOL_SAVE_LABEL = "Save";
export const NUM_MANIPULATE_CALLERID_POOL_CLOSE_LABEL = "Close";
export const NUM_MANIPULATE_CALLERID_POOL_SET_LABEL = "Set";
export const NUM_MANIPULATE_CALLERID_POOL_NOTE =
  "Note: IP->PSTN Outbound Calls with Designated CallerID set to 0 means the feature is disabled; Usage Cycle set to 0 means not to clear counts.";

/** CallerID Pool — top form controls (Set button; not persisted to device API) */
export const NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS = {
  prefix:
    "Designated prefix for IP-to-PSTN CallerID manipulation.\n" +
    "Stored in page state only. Set does not call the device API.",
  startDate:
    "Starting date for the usage cycle.\n" +
    "Stored in page state only. Set does not call the device API.",
  usageCycle:
    "Usage cycle length in days.\n" +
    "Default: 0. Stored in page state only. Set does not call the device API.",
  destinationPcm:
    "Destination PCM for the top IP-to-PSTN section.\n" +
    "Options: PCM, PCM Group (value Any). Default: PCM.\n" +
    "Stored in page state only. Set does not call the device API.",
  outboundCallerId:
    "Designated CallerID for IP-to-PSTN outbound calls.\n" +
    "Default: 0. Stored in page state only. Set does not call the device API.",
  designationMode:
    "How outbound IP-to-PSTN calls are handled when CallerID is designated.\n" +
    "Options: SIP Side Reject (default), Designated CallerID.\n" +
    "Stored in page state only. Set does not call the device API.",
};

/** CallerID Pool modal — local component state only */
export const NUM_MANIPULATE_CALLERID_POOL_FIELD_TOOLTIPS = {
  no:
    "Entry number for this pool row.\n" +
    "Required in the modal. Stored in local table state only.",
  outgoingCallResource:
    "Outgoing call resource identifier for this pool entry.\n" +
    "Required in the modal. Stored in local table state only.",
  destinationPcm:
    "PCM destination for this pool entry.\n" +
    "Options: Any, PCM. Default: Any.\n" +
    "In the PSTN-to-IP table, this column is labeled Source PCM.",
  callerIdRange:
    "CallerID range for this entry.\n" +
    "Built on save from Start and End fields as start or start--end.\n" +
    "Required in the modal.",
};
