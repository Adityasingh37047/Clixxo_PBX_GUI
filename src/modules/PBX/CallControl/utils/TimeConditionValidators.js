export const validateTimeConditionForm = (form) => {
  if (!form.name.trim()) {
    return "Name is required";
  }
  if (form.type === "worktime" && !form.daysOfWeek.length) {
    return "Select at least one Day of Week";
  }
  if (form.type === "worktime" && !form.timeRanges.length) {
    return "Add at least one time range";
  }
  if (form.type === "holiday" && !form.months.length) {
    return "Select at least one Month";
  }
  if (form.type === "holiday" && !form.daysOfMonth.length) {
    return "Select at least one Day of Month";
  }
  return null;
};
