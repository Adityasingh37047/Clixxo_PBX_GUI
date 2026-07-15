export const PCM_PCM_INITIAL_DATA = [
  {
    pcmNo: 0,
    signalingProtocol: "ISDN User Side",
    clock: "Line-synchronization",
    controlMode: "--",
    signalingTimeSlot: 16,
    signalingLinkType: "--",
    connectionLine: "Twisted Pair Cable",
    crc4: true,
    sipTrunkNo: -1,
    applyToAllPcMs: false,
  },
];

export const PCM_PCM_ROW_KEYS = [
  "pcmNo",
  "signalingProtocol",
  "clock",
  "controlMode",
  "signalingTimeSlot",
  "signalingLinkType",
  "connectionLine",
  "crc4",
  "sipTrunkNo",
];

export const pcmPcmFormFromRow = (row) => ({ ...row });

export const applyPcmPcmFormToRows = (rows, editIndex, modalForm) =>
  rows.map((row, i) => (i === editIndex ? { ...modalForm } : row));

export const renderPcmPcmCell = (row, colIndex) => {
  const key = PCM_PCM_ROW_KEYS[colIndex];
  if (key === "crc4") return row.crc4 ? "Enable" : "Disable";
  return row[key] ?? "—";
};
