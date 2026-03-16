// export const PCM_PSTN_SEARCH_FIELDS = [
//   { key: 'span_id', label: 'Span ID', type: 'number' },
//   { key: 'framing', label: 'Framing', type: 'select', options: ['d4', 'esf', 'ccs', 'cas'], default: 'ccs' },
//   { key: 'coding', label: 'Coding', type: 'select', options: ['ami', 'b8zs', 'hdb3'], default: 'hdb3' },
//   { key: 'signalling', label: 'Signalling', type: 'select', options: ['pri_net', 'pri_cpe', 'ss7', 'mfcr2'], default: 'pri_net' },
// ];

// 📊 Table column definitions
export const PCM_PSTN_TABLE_COLUMNS = [
  { key: 'span_id', label: 'Span ID' },
  { key: 'framing', label: 'Framing' },
  { key: 'coding', label: 'Coding' },
  { key: 'timing', label: 'Timing' },
  { key: 'signalling', label: 'Signalling' },
  { key: 'group', label: 'Group' },
  { key: 'switchtype', label: 'Switch Type' },
  { key: 'span_status', label: 'Status'},
  { key: 'modify', label: 'Modify'}
];



// 🧪 Sample data


// 📝 Span section fields
export const SPAN_FIELDS = [
  { name: "id", label: "Span ID", type: "number" },
  { name: "timing", label: "Timing", type: "select", options: ['0', '1'], default: '0' },
  { name: "lbo", label: "LBO", type: "select", options: ['0', '1'], default: '0'  },
  { name: "framing", label: "Framing", type: "select", options: ['d4', 'esf', 'ccs', 'cas'] },
  { name: "coding", label: "Coding", type: "select", options: ['ami', 'b8zs', 'hdb3'] },
  { name: "flags", label: "Flags ", type: "select", options: ['crc4', 'Disabled'], default: 'crc4'},
  { name: "bchan", label: "Channel", type: "text", defaultValue: '1-16,17-31' },
  { name: "hardhdlc", label: "Hard HDLC", type: "text", defaultValue: '15' },
];

// 📝 Channels section fields
export const CHANNELS_FIELDS = [
  { name: "signalling", label: "Signalling", type: "select", options: ['pri_net', 'pri_cpe', 'ss7', 'mfcr2'] },
  { name: "context", label: "Context", type: "select", options: ['outbound1', 'outbound2',], default: 'outbound1'},
  { name: "switchtype", label: "Switch Type", type: "select", options: ["euroisdn", "national", "ni1", "dms100", "4ess", "5ess", "qsig"] },
  { name: "group", label: "Group", type: "number" },
  { name: "accountcode", label: "Account Code", type: "text", defaultValue: 'sales' },
  { name: "pickupgroup", label: "Pickup Group", type: "number" },
  { name: "callgroup", label: "Call Group", type: "number" },
  { name: "pridialplan", label: "PRI Dial Plan", type: "text", defaultValue: 'national' },
  { name: "prilocaldialplan", label: "PRI Local Dial Plan", type: "text", defaultValue: 'local' },
  { name: "facilityenable", label: "Facility Enable", type: "select", options: ["yes", "no"] },
  { name: "usecallerid", label: "Use Caller ID", type: "select", options: ["yes", "no"] },
  { name: "hidecallerid", label: "Hide Caller ID", type: "select", options: ["yes", "no"] },
  { name: "usecallingpres", label: "Use Calling Pres", type: "select", options: ["yes", "no"] },
  { name: "immediate", label: "Immediate", type: "select", options: ["yes", "no"] },
  { name: "overlapdial", label: "Overlap Dial", type: "select", options: ["yes", "no"] },
  { name: "faxdetect", label: "Fax Detect", type: "select", options: ["yes", "no"] },
];

// 📝 Voice section fields
export const VOICE_FIELDS = [
  { name: "rxgain", label: "Rx Gain", type: "number", defaultValue: '0.0' },
  { name: "txgain", label: "Tx Gain", type: "number", defaultValue: '0.0' },
  { name: "echocancel", label: "Echo Cancel", type: "select", options: ["yes", "no"] },
  { name: "echocancelwhenbridged", label: "Echo Cancel When Bridged", type: "select", options: ["yes", "no"] },
];

// 🎯 Initial form state (Span + Channels + Voice)
export const PCM_PSTN_INITIAL_FORM = {
  // Span fields
  id: '',
  timing: '0',
  lbo: '0',
  framing: 'ccs',
  coding: 'hdb3',
  flags: 'crc4',
  bchan: '1-15,17-31',
  hardhdlc: '16',
  
  // Channels fields
  signalling: 'pri_net',
  context: 'outbound1',
  switchtype: 'euroisdn',
  group: 1,
  accountcode: 'sales',
  pickupgroup: 1,
  callgroup: 1,
  pridialplan: 'national',
  prilocaldialplan: 'local',
  facilityenable: 'yes',
  usecallerid: 'yes',
  hidecallerid: 'no',
  usecallingpres: 'yes',
  immediate: 'no',
  overlapdial: 'yes',
  faxdetect: 'no',
  
  // Voice fields
  rxgain: 0.0,
  txgain: 0.0,
  echocancel: 'yes',
  echocancelwhenbridged: 'yes',
};