import { IDS_INITIAL_FORM } from "../../../../constants/IDSSettingsConstants";

export function createIdsEmptyForm() {
  return {
    ...IDS_INITIAL_FORM,
    warningThresholds: [...IDS_INITIAL_FORM.warningThresholds],
    blacklistThresholds: [...IDS_INITIAL_FORM.blacklistThresholds],
  };
}

export function cloneIdsForm(form) {
  return {
    ...form,
    warningThresholds: [...(form.warningThresholds || [])],
    blacklistThresholds: [...(form.blacklistThresholds || [])],
  };
}

export function updateIdsThresholdArray(arr, idx, value) {
  const next = [...arr];
  next[idx] = value;
  return next;
}
