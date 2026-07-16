export const mapBlacklistApiDataToRows = (data) => {
  const isCallerFilterItem = (item) =>
    item.type === "callerid" ||
    (item.type === "blacklist" && item.subtype === "callerid");

  const isCalleeFilterItem = (item) =>
    item.type === "calleeid" ||
    (item.type === "blacklist" && item.subtype === "calleeid");

  const callerData = data
    .filter(isCallerFilterItem)
    .map((item) => ({
      groupNo: String(item.group),
      noInGroup: item.no_of_groups,
      callerId: item.number,
    }))
    .sort((a, b) => {
      const groupDiff = parseInt(a.groupNo) - parseInt(b.groupNo);
      if (groupDiff !== 0) return groupDiff;
      return parseInt(a.noInGroup) - parseInt(b.noInGroup);
    });
  const calleeData = data
    .filter(isCalleeFilterItem)
    .map((item) => ({
      groupNo: String(item.group),
      noInGroup: item.no_of_groups,
      calleeId: item.number,
    }))
    .sort((a, b) => {
      const groupDiff = parseInt(a.groupNo) - parseInt(b.groupNo);
      if (groupDiff !== 0) return groupDiff;
      return parseInt(a.noInGroup) - parseInt(b.noInGroup);
    });
  return { callerData, calleeData };
};

export const getBlacklistNextAvailableNoInGroup = (existingRows, groupNo) => {
  const entriesInGroup = existingRows.filter(
    (row) => String(row.groupNo) === String(groupNo),
  );
  if (entriesInGroup.length === 0) return "0";
  const existingNos = entriesInGroup
    .map((row) => parseInt(row.noInGroup))
    .sort((a, b) => a - b);
  for (let i = 0; i <= Math.max(...existingNos) + 1; i++) {
    if (!existingNos.includes(i)) return i.toString();
  }
  return (Math.max(...existingNos) + 1).toString();
};

export const buildCallerBlacklistPayload = (modalData, trimmedId) => ({
  groupNo: modalData.groupNo,
  noInGroup: modalData.noInGroup,
  callerId: trimmedId,
});

export const buildCalleeBlacklistPayload = (modalData, trimmedId) => ({
  groupNo: modalData.groupNo,
  noInGroup: modalData.noInGroup,
  calleeId: trimmedId,
});
