import { TIME_CONDITION_TYPES } from "../../../../constants/TimeConditionConstants";
import { pad } from "../utils/TimeConditionTransformers";

export const typeLabel = (v) =>
  TIME_CONDITION_TYPES.find((t) => t.value === v)?.label ?? v;

export const settingsSummary = (row) => {
  if (row.type === "worktime") {
    const ranges = (row.timeSlots || [])
      .map(
        (r) =>
          `${pad(r.start_hour)}:${pad(r.start_minute)}–${pad(r.end_hour)}:${pad(r.end_minute)}`,
      )
      .join(", ");
    const days =
      (row.daysOfWeek || [])
        .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
        .join(", ") || "—";
    return `${ranges || "—"}  |  ${days}`;
  }
  const months =
    (row.months || [])
      .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
      .join(", ") || "—";
  const days = (row.daysOfMonth || []).join(", ") || "—";
  return `${months}  |  Day: ${days}`;
};

export const timeConditionEditIconStyle = (disabled) => ({
  cursor: disabled ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: disabled ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handleTimeConditionEditIconHover = (e, entering, disabled) => {
  if (!disabled) e.currentTarget.style.opacity = entering ? "1" : "0.7";
};
