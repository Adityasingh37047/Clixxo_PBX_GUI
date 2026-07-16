export const mapNumberPoolApiToRows = (message) =>
  message.map((item) => ({
    id: item.id,
    checked: false,
    groupNo: Number(item.group),
    noInGroup: Number(item.no_in_groups),
    numberRange: (item.number_range || "").replace("-", "--"),
  }));

export const parseNumberPoolRowForEdit = (row) => {
  let start = "";
  let end = "";
  if (row.numberRange && row.numberRange.includes("--")) {
    [start, end] = row.numberRange.split("--");
  }
  return {
    groupNo: row.groupNo,
    noInGroup: row.noInGroup,
    numberRangeStart: start,
    numberRangeEnd: end,
  };
};

export const buildNumberPoolCreateForm = (rows, selectedGroup = 0) => {
  const entriesInGroup = rows.filter((row) => row.groupNo === selectedGroup);
  return {
    groupNo: selectedGroup,
    noInGroup: entriesInGroup.length,
    numberRangeStart: "",
    numberRangeEnd: "",
  };
};

export const buildNumberPoolApiPayload = (form) => {
  const numberRange =
    form.numberRangeStart && form.numberRangeEnd
      ? `${form.numberRangeStart}--${form.numberRangeEnd}`
      : "";
  return {
    group: String(form.groupNo),
    no_in_groups: String(form.noInGroup),
    number_range: String(numberRange).replace("--", "-"),
  };
};

export const getNumberPoolNextNoInGroup = (rows, newGroupNo) =>
  rows.filter((row) => row.groupNo === newGroupNo).length;
