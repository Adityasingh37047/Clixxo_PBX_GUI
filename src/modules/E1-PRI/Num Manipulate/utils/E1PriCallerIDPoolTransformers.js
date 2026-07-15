export const buildCallerIDPoolRowFromModal = (modalData) => ({
  ...modalData,
  callerIdRange: `${modalData.callerIdRangeStart || ""}${
    modalData.callerIdRangeEnd ? "--" + modalData.callerIdRangeEnd : ""
  }`,
});

export const parseCallerIDPoolRowForEdit = (row) => {
  let callerIdRangeStart = "";
  let callerIdRangeEnd = "";
  if (row.callerIdRange) {
    if (row.callerIdRange.includes("--")) {
      [callerIdRangeStart, callerIdRangeEnd] = row.callerIdRange.split("--");
    } else {
      callerIdRangeStart = row.callerIdRange;
    }
  }
  return { ...row, callerIdRangeStart, callerIdRangeEnd };
};
