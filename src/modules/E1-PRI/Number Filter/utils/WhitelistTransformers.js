export const mapWhitelistApiDataToRows = (data) => {
  const callerData = data
    .filter((item) => item.type === "callerid")
    .map((item) => ({
      groupNo: item.group,
      noInGroup: item.no_of_groups,
      callerId: item.number,
    }))
    .sort((a, b) => {
      const groupDiff = parseInt(a.groupNo) - parseInt(b.groupNo);
      if (groupDiff !== 0) return groupDiff;
      return parseInt(a.noInGroup) - parseInt(b.noInGroup);
    });
  const calleeData = data
    .filter((item) => item.type === "calleeid")
    .map((item) => ({
      groupNo: item.group,
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

export const getWhitelistNextAvailableNoInGroup = (existingRows, groupNo) => {
  const entriesInGroup = existingRows.filter((row) => row.groupNo === groupNo);
  if (entriesInGroup.length === 0) return "0";
  const existingNos = entriesInGroup
    .map((row) => parseInt(row.noInGroup))
    .sort((a, b) => a - b);
  for (let i = 0; i <= Math.max(...existingNos) + 1; i++) {
    if (!existingNos.includes(i)) return i.toString();
  }
  return (Math.max(...existingNos) + 1).toString();
};

export const buildCallerWhitelistPayload = (modalData) => ({
  groupNo: modalData.groupNo,
  noInGroup: modalData.noInGroup,
  callerId: modalData.idValue,
});

export const buildCalleeWhitelistPayload = (modalData) => ({
  groupNo: modalData.groupNo,
  noInGroup: modalData.noInGroup,
  calleeId: modalData.idValue,
});
