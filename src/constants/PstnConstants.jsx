// Table headers for the PSTN Status page
export const PSTN_SYNC_HEADERS = [
  'Sync & Signaling Status', 'Frame Sync', 'Signaling', 'Faulty', 'Unused'
];

export const PSTN_SYNC_COLORS = [
  { label: 'Frame Sync', color: '#222' },
  { label: 'Signaling', color: '#0070a8' },
  { label: 'Faulty', color: '#e53935' },
  { label: 'Unused', color: '#bdbdbd' },
];

export const PSTN_VOICE_PATH_HEADERS = [
  'Voice Path Status', 'Idle', 'Ringing', 'Wait Answer', 'Dialing', 'Talking', 'Pending', 'Wait Message', 'Local Block', 'Remote Block', 'Both Block', 'Circuit Reset', 'Unusable'
];

export const PSTN_VOICE_PATH_STATS = [
  { label: 'Statistics', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30] },
];

export const PSTN_TIMESLOT_HEADERS = [
  'Time Slot No.', ...Array.from({ length: 32 }, (_, i) => i)
];

export const PSTN_TIMESLOT_DATA = [
  {
    label: 'PCM 0',
    values: [
      'red', ...Array(15).fill('grey'), 'red', ...Array(15).fill('grey')
    ]
  }
];

export const PSTN_GATEWAY_LABEL = 'Gateway1';
export const PSTN_GATEWAY_IP = '192.168.1.101:80';
