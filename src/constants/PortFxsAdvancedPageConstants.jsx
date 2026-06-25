// Port FXS Advanced Page Constants

// Table columns
export const PORT_FXS_ADVANCED_TABLE_COLUMNS = [
  { key: 'port', label: 'Port', width: '60px' },
  { key: 'type', label: 'Type', width: '80px' },
  { key: 'forbidOutgoingCall', label: 'Forbid Outgoing Call', width: '150px' },
  { key: 'blacklistOfOutCalls', label: 'Blacklist of Out Calls', width: '200px' },
  { key: 'modify', label: 'Modify', width: '60px' },
];

// Items per page
export const PORT_FXS_ADVANCED_ITEMS_PER_PAGE = 16;

// Total ports
export const PORT_FXS_ADVANCED_TOTAL_PORTS = 32;

// Initial port data structure
export const PORT_FXS_ADVANCED_INITIAL_DATA = {
  port: 1,
  type: 'FXS',
  forbidOutgoingCall: 'Disable',
  blacklistOfOutCalls: '---',
};

// Batch Modify Form Fields
export const PORT_FXS_ADVANCED_BATCH_MODIFY_FIELDS = [
  {
    key: 'port',
    label: 'Port',
    type: 'select',
    options: Array.from({ length: PORT_FXS_ADVANCED_TOTAL_PORTS }, (_, i) => String(i + 1)),
    default: '1',
  },
  {
    key: 'type',
    label: 'Type',
    type: 'text',
    default: 'FXS',
  },
  {
    key: 'forbidOutgoingCall',
    label: 'Forbid Outgoing Call',
    type: 'checkbox',
    default: false,
  },
  {
    key: 'wayOfForbidOutgoingCall',
    label: 'Way Of Forbid Outgoing Call',
    type: 'select',
    options: ['All time', 'Select time'],
    default: 'All time',
    conditional: 'forbidOutgoingCall',
  },
  // Period fields will be dynamically generated based on the count
  {
    key: 'blacklistOfFxsOutCalls',
    label: 'Blacklist of FXS Out Calls',
    type: 'textarea',
    default: '',
  },
];

// Batch Modify Notes
export const PORT_FXS_ADVANCED_BATCH_MODIFY_NOTES = [
  "Note:1.Blacklists support regular expressions and full numbers",
  "2.Multiple rules must be separated by ';'",
];

// Page Title
export const PORT_FXS_ADVANCED_PAGE_TITLE = 'FXS Settings';

// Batch Modify Modal Title
export const PORT_FXS_ADVANCED_BATCH_MODIFY_TITLE = 'FXS-Batch Modify';

// Week days
export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** FXS Port Advanced batch modify modal — PortFxsAdvancedPage */
export const PORT_FXS_ADVANCED_FIELD_TOOLTIPS = {
  port:
    "FXS port number to configure.\n" +
    "Options: 1 to " + PORT_FXS_ADVANCED_TOTAL_PORTS + ".",

  type:
    "Port hardware type. Read-only FXS.",

  forbidOutgoingCall:
    "Block outgoing calls from this FXS port.\n" +
    "When enabled, Way Of Forbid Outgoing Call is shown.",

  wayOfForbidOutgoingCall:
    "How outgoing calls are forbidden.\n" +
    "Shown when Forbid Outgoing Call is enabled.\n" +
    "Options: All time, Select time.\n" +
    "When Select time, time period schedules are shown (up to 5 periods).",

  periodStart:
    "Period start time (hh:mm:ss).\n" +
    "Required for each active time period when Way is Select time.\n" +
    "Format validated: HH:MM:SS (00:00:00–23:59:59).",

  periodEnd:
    "Period end time (hh:mm:ss).\n" +
    "Required for each active time period when Way is Select time.\n" +
    "Format validated: HH:MM:SS (00:00:00–23:59:59).",

  periodWeek:
    "Days of week when this time period applies.\n" +
    "Check Mon–Sun for each time period block.",

  blacklistOfFxsOutCalls:
    "Outbound call blacklist for this FXS port.\n" +
    "Supports regular expressions and full numbers.\n" +
    "Multiple rules separated by ';' (see page notes).",
};
