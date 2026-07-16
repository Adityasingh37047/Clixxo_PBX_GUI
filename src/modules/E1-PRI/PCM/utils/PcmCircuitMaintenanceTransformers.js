export const formatPcmCircuitMaintenanceDisplayValue = (value) =>
  value === undefined || value === null || value === "" ? "--" : String(value);
