// Port FXS Advanced Page Constants

// Table columns
export const PORT_FXS_ADVANCED_TABLE_COLUMNS = [
  { key: 'modify', label: 'Modify', width: '60px' },
  { key: 'port', label: 'Port', width: '60px' },
  { key: 'type', label: 'Type', width: '80px' },
  { key: 'forbidOutgoingCall', label: 'Forbid Outgoing Call', width: '150px' },
  { key: 'blacklistOfOutCalls', label: 'Blacklist of Out Calls', width: '200px' },
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

