export const pad = (n) => String(n ?? 0).padStart(2, "0");

export const normalizeFromApi = (item) => ({
  id: item.id,
  name: item.name || "",
  type: item.type === "work_time" ? "worktime" : item.type || "worktime",
  timeSlots: Array.isArray(item.time_slots) ? item.time_slots : [],
  daysOfWeek: Array.isArray(item.days_of_week) ? item.days_of_week : [],
  months: Array.isArray(item.months) ? item.months : [],
  daysOfMonth: Array.isArray(item.days_of_month) ? item.days_of_month : [],
});

export const normalizeTimeConditionList = (res) => {
  if (Array.isArray(res?.message)) return res.message;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

export const formToTimeSlots = (timeRanges) =>
  timeRanges.map((r) => ({
    start_hour: parseInt(r.startHour, 10),
    start_minute: parseInt(r.startMinute, 10),
    end_hour: parseInt(r.endHour, 10),
    end_minute: parseInt(r.endMinute, 10),
  }));

export const apiSlotsToFormRanges = (slots) =>
  slots.map((s) => ({
    startHour: pad(s.start_hour),
    startMinute: pad(s.start_minute),
    endHour: pad(s.end_hour),
    endMinute: pad(s.end_minute),
  }));

export const buildTimeConditionApiPayload = ({ editId, form }) => {
  const common = {
    name: form.name.trim(),
    condition_type: form.type,
  };

  const typeFields =
    form.type === "worktime"
      ? {
          time_slots: formToTimeSlots(form.timeRanges),
          days_of_week: form.daysOfWeek,
        }
      : {
          months: form.months,
          days_of_month: form.daysOfMonth.map(Number),
        };

  return editId !== null
    ? { id: editId, ...common, ...typeFields }
    : { ...common, ...typeFields };
};

export const formFromRow = (row) => ({
  name: row.name,
  type: row.type,
  timeRanges: row.timeSlots.length
    ? apiSlotsToFormRanges(row.timeSlots)
    : [
        {
          startHour: "09",
          startMinute: "00",
          endHour: "18",
          endMinute: "00",
        },
      ],
  daysOfWeek: row.daysOfWeek,
  months: row.months,
  daysOfMonth: row.daysOfMonth,
});
