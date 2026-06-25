// Table columns for CallerID Pool
export const CALLERID_POOL_TABLE_COLUMNS = [
  { key: 'check', label: 'Check', width: 50 },
  { key: 'no', label: 'No.', width: 35},
  { key: 'callerIdRange', label: 'CallerID Range', width: 75},
  { key: 'outgoingCallResource', label: 'Outgoing Call Resource', width: 100 },
  { key: 'destinationPcm', label: 'Destination PCM', width: 90 },
  { key: 'modify', label: 'Modify', width: 50 },
];

// Modal fields for Add/Edit CallerID Pool
export const CALLERID_POOL_MODAL_FIELDS = [
  { key: 'no', label: 'No.', type: 'number', required: true },
  { key: 'outgoingCallResource', label: 'Outgoing Call Resource', type: 'text', required: true },
  { key: 'destinationPcm', label: 'Destination PCM', type: 'select', required: true, options: ['Any', 'PCM'] },
  { key: 'callerIdRange', label: 'CallerID Range', type: 'text', required: true },
];

// Initial form state for modal
export const CALLERID_POOL_INITIAL_FORM = {
  no: '',
  outgoingCallResource: '',
  destinationPcm: 'Any',
  callerIdRange: '',
};

/** CallerID Pool — top form controls (Set button; not persisted to device API) */
export const CALLERID_POOL_TOP_FIELD_TOOLTIPS = {
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
export const CALLERID_POOL_FIELD_TOOLTIPS = {
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
