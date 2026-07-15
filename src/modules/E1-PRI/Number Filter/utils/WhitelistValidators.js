export const validateWhitelistIdValue = (idValue) => {
  if (!String(idValue || "").trim()) {
    return "Please enter a valid ID value.";
  }
  return null;
};

export const findWhitelistDuplicate = ({
  existingRows,
  modalType,
  trimmedId,
  groupNo,
  isEditMode,
  originalIdValue,
  originalGroupNo,
}) =>
  existingRows.some((row) => {
    const rowId = modalType === "caller" ? row.callerId : row.calleeId;
    const sameRecord =
      isEditMode &&
      rowId === originalIdValue &&
      String(row.groupNo) === String(originalGroupNo);
    if (sameRecord) return false;
    return rowId === trimmedId && String(row.groupNo) === String(groupNo);
  });

export const getWhitelistDuplicateMessage = (modalType, trimmedId) =>
  `${modalType === "caller" ? "Caller" : "Callee"} ID "${trimmedId}" already exists. Please use a different ID.`;

export const isWhitelistEditUnchanged = (groupNo, originalGroupNo) =>
  String(groupNo) === String(originalGroupNo);
