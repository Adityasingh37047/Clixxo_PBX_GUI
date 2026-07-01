export const PCM_PCM_TABLE_HEADERS = [
  "PCM No.",
  "Signaling Protocol",
  "Clock",
  "Control Mode",
  "Signaling Time Slot",
  "Signaling Link Type",
  "Connection Line",
  "CRC-4",
  "Sip Trunk No.",
  "Modify",
];

export const PCM_PCM_SIGNALING_PROTOCOL_OPTIONS = [
  "ISDN User Side",
  "ISDN Network Side",
  "SS1R2",
];

export const PCM_PCM_CLOCK_OPTIONS = [
  "Line-synchronization",
  "Free-run",
  "Slave",
];

export const PCM_PCM_CONNECTION_LINE_OPTIONS = [
  "Twisted Pair Cable",
  "Coaxial Cable",
];

export const PCM_PCM_PAGE_BREADCRUMB_ROOT = "E1-PRI";
export const PCM_PCM_PAGE_BREADCRUMB_SECTION = "PCM";
export const PCM_PCM_PAGE_TITLE = "PCM Settings";
export const PCM_PCM_MODAL_TITLE_EDIT = "Edit PCM Settings";
export const PCM_PCM_SAVE_LABEL = "Save";
export const PCM_PCM_CLOSE_LABEL = "Close";

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
