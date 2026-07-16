import { CDR_QUERY_FIELDS } from "../../../../constants/CdrQueryConstants";

export function getCdrQueryFields() {
  return CDR_QUERY_FIELDS;
}

export function resetCdrQueryForm(initialForm) {
  return { ...initialForm };
}
