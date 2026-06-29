export const TIME_CONDITION_TITLE = "Time Condition";

export const TIME_CONDITION_TYPES = [
  { value: "worktime", label: "WorkTime" },
  { value: "holiday", label: "Holiday" },
];

export const TIME_CONDITION_DAYS_OF_WEEK = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

export const TIME_CONDITION_MONTHS = [
  { value: "january", label: "January" },
  { value: "february", label: "February" },
  { value: "march", label: "March" },
  { value: "april", label: "April" },
  { value: "may", label: "May" },
  { value: "june", label: "June" },
  { value: "july", label: "July" },
  { value: "august", label: "August" },
  { value: "september", label: "September" },
  { value: "october", label: "October" },
  { value: "november", label: "November" },
  { value: "december", label: "December" },
];

export const TIME_CONDITION_HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);

export const TIME_CONDITION_MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

export const TIME_CONDITION_DAYS_OF_MONTH = Array.from(
  { length: 31 },
  (_, i) => i + 1,
);

export const TIME_CONDITION_TABLE_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
  { key: "settings", label: "Settings" },
];

export const TIME_CONDITION_INITIAL_FORM = {
  name: "",
  type: "worktime",
  timeRanges: [
    { startHour: "09", startMinute: "00", endHour: "18", endMinute: "00" },
  ],
  daysOfWeek: [],
  months: [],
  daysOfMonth: [],
};

/** Field tooltips for Time Condition — concise, 1–4 lines */
export const TIME_CONDITION_FIELD_TOOLTIPS = {
  name: "User-defined time condition name. Required — the rule cannot be saved without it.",

  type: "WorkTime — recurring weekly schedule (default).\nHoliday — specific calendar dates.",

  settings:
    "Start and end time ranges when this WorkTime condition is active. Add multiple slots with +.",

  day_of_week:
    "Weekdays when this WorkTime condition applies. Select at least one day.",

  month: "Months when this Holiday condition applies. Select at least one month.",

  day_of_month:
    "Days of the month when this Holiday condition applies. Select at least one day.",
};
