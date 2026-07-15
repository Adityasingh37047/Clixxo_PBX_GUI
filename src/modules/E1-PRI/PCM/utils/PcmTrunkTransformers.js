export const formatPcmTrunkDisplayValue = (value) =>
  value === undefined || value === null || value === "" ? "--" : String(value);
