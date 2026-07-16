import { AREA_SELECT_FIELDS } from "../../../../constants/AreaSelectConstants";

export function getAreaSelectField() {
  return AREA_SELECT_FIELDS[0];
}

export function resetAreaSelectForm(initialForm) {
  return { ...initialForm };
}
