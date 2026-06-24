export const TC_TITLE = 'Time Condition';

export const TC_TYPES = [
  { value: 'worktime', label: 'WorkTime' },
  { value: 'holiday',  label: 'Holiday'  },
];

export const TC_DAYS_OF_WEEK = [
  { value: 'sunday',    label: 'Sunday'    },
  { value: 'monday',    label: 'Monday'    },
  { value: 'tuesday',   label: 'Tuesday'   },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday',  label: 'Thursday'  },
  { value: 'friday',    label: 'Friday'    },
  { value: 'saturday',  label: 'Saturday'  },
];

export const TC_MONTHS = [
  { value: 'january',   label: 'January'   },
  { value: 'february',  label: 'February'  },
  { value: 'march',     label: 'March'     },
  { value: 'april',     label: 'April'     },
  { value: 'may',       label: 'May'       },
  { value: 'june',      label: 'June'      },
  { value: 'july',      label: 'July'      },
  { value: 'august',    label: 'August'    },
  { value: 'september', label: 'September' },
  { value: 'october',   label: 'October'   },
  { value: 'november',  label: 'November'  },
  { value: 'december',  label: 'December'  },
];

export const TC_HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0'),
);

export const TC_MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, '0'),
);

export const TC_DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

export const TC_TABLE_COLUMNS = [
  { key: 'name',     label: 'Name'     },
  { key: 'type',     label: 'Type'     },
  { key: 'settings', label: 'Settings' },
];

export const TC_INITIAL_FORM = {
  name: '',
  type: 'worktime',
  timeRanges: [{ startHour: '09', startMinute: '00', endHour: '18', endMinute: '00' }],
  daysOfWeek: [],
  months: [],
  daysOfMonth: [],
};

export const TIME_CONDITION_FIELD_TOOLTIPS = {
  name:
    "User-defined time condition name. Required — the rule cannot be saved without it.",

  type:
    "WorkTime — recurring weekly schedule (default).\nHoliday — specific calendar dates.",

  settings:
    "Start and end time ranges when this WorkTime condition is active. Add multiple slots with +.",

  day_of_week:
    "Weekdays when this WorkTime condition applies. Select at least one day.",

  month:
    "Months when this Holiday condition applies. Select at least one month.",

  day_of_month:
    "Days of the month when this Holiday condition applies. Select at least one day.",
};
