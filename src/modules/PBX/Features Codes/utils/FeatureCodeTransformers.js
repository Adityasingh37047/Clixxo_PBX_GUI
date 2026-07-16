import {
  API_TO_FORM,
  FEATURE_CODE_INITIAL_FORM,
  FORM_TO_API,
  NUMERIC_KEYS,
} from "../../../../constants/FeatureCodeConstants";

export const TIMEOUT_DESTINATION_STATIC_OPTIONS = [
  { value: "hangup", label: "Hangup" },
  { value: "original_extension", label: "Original extension" },
];

export const normalizeFeatureCodeExtensionOptions = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (item == null) return null;
      if (typeof item === "string" || typeof item === "number")
        return { value: String(item), label: String(item) };
      const value = String(
        item.value ?? item.id ?? item.extension ?? "",
      ).trim();
      const label = String(
        item.label ?? item.display_name ?? item.name ?? value,
      ).trim();
      if (!value) return null;
      return { value, label: label || value };
    })
    .filter(Boolean);
};

export const mapFeatureCodeDestinationsFromApi = (destRes) => {
  const destMessage = destRes?.message ?? destRes?.data ?? destRes;
  const extensionsRaw =
    destMessage?.Extensions ?? destMessage?.extensions ?? [];
  return normalizeFeatureCodeExtensionOptions(extensionsRaw);
};

export const featureCodeApiToForm = (apiData) => {
  const form = { ...FEATURE_CODE_INITIAL_FORM };
  Object.entries(apiData).forEach(([apiKey, val]) => {
    const formKey = API_TO_FORM[apiKey];
    if (formKey !== undefined && val !== null && val !== undefined) {
      form[formKey] = String(val);
    }
  });
  return form;
};

export const featureCodeFormToApi = (form) => {
  const data = {};
  Object.entries(FORM_TO_API).forEach(([formKey, apiKey]) => {
    const val = form[formKey];
    if (val === "" || val === null || val === undefined) {
      data[apiKey] = apiKey === "agent_free_busy_ivr" ? null : val;
    } else {
      data[apiKey] = NUMERIC_KEYS.has(formKey) ? Number(val) : val;
    }
  });
  return data;
};
