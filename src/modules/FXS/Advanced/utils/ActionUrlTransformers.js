import { ACTION_URL_FIELDS } from "../../../../constants/ActionUrlConstants";

export function getFieldByKey(key) {
  return ACTION_URL_FIELDS.find((field) => field.key === key);
}

export function resetActionUrlForm(initialForm) {
  return { ...initialForm };
}
