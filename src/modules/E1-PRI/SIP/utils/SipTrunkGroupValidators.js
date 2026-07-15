/** Group ID: alphanumeric only (spaces stripped). */
export const sanitizeSipTrunkGroupId = (value) =>
  String(value ?? "").replace(/[^a-zA-Z0-9]/g, "");
