export const TABLE_HEADERS = [
  'PCM No.',
  'Signaling Protocol',
  'Clock',
  'Control Mode',
  'Signaling Time Slot',
  'Signaling Link Type',
  'Connection Line',
  'CRC-4',
  'Sip Trunk No.',
  'Modify'
];

export const SIGNALING_PROTOCOL_OPTIONS = [
  'ISDN User Side',
  'ISDN Network Side',
  'SS1R2'
];

export const CLOCK_OPTIONS = [
  'Line-synchronization',
  'Free-run',
  'Slave'
];

export const CONNECTION_LINE_OPTIONS = [
  'Twisted Pair Cable',
  'Coaxial Cable'
];

/** PCM Settings (PcmPcmPage) — local React state only, no API */
export const PCM_PCM_FIELD_TOOLTIPS = {
  pcmNo: "PCM number text field. Stored in local table state. Default: 0.",
  signalingProtocol:
    "Stored in local table state.\n" +
    "Options: ISDN User Side, ISDN Network Side, SS1R2.",
  signalingTimeSlot:
    "Stored in local table state. Default: 16.",
  clock:
    "Stored in local table state.\n" +
    "Options: Line-synchronization, Free-run, Slave.",
  connectionLine:
    "Stored in local table state.\n" +
    "Options: Twisted Pair Cable, Coaxial Cable.",
  sipTrunkNo:
    "Option Sip Trunk ID text field. Stored in local table state. Default: -1.",
  crc4:
    "Enable CRC-4 checkbox. Stored in local table state. Default: checked.",
  applyToAllPcMs:
    "Apply to All PCMs checkbox. Stored in local table state. Default: unchecked.",
};
