import { RADIUS_INITIAL_FORM } from "../../../../constants/RadiusConstants";

export function createRadiusInitialForm() {
  return { ...RADIUS_INITIAL_FORM, callType: [...(RADIUS_INITIAL_FORM.callType || [])] };
}

export function applyRadiusFieldChange(prev, { name, value, type, checked }) {
  return {
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  };
}

export function applyRadiusCallTypeChange(prev, value, checked) {
  const arr = prev.callType || [];
  if (checked) return { ...prev, callType: [...arr, value] };
  return { ...prev, callType: arr.filter((v) => v !== value) };
}
