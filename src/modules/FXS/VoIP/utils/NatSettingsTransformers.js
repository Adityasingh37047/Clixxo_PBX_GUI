import {
  NAT_SETTINGS_FIELDS,
  FXS_NAT_SETTINGS_LEFT_COLUMN_FIELD_KEYS,
  FXS_NAT_SETTINGS_RIGHT_COLUMN_FIELD_KEYS,
} from "../../../../constants/NatSettingsConstants";

export const getNatSettingsInitialState = () => {
  const state = {};
  NAT_SETTINGS_FIELDS.forEach((f) => {
    if (f.type === "select") {
      state[f.key] = f.default || f.options[0] || "";
    } else if (f.type === "checkbox") {
      state[f.key] = f.default !== undefined ? f.default : false;
    } else if (f.type === "readonly") {
      state[f.key] = f.default || "";
    } else {
      state[f.key] = f.default || "";
    }
  });
  return state;
};

export const getNatSettingsLeftColumnFields = () =>
  NAT_SETTINGS_FIELDS.filter((f) =>
    FXS_NAT_SETTINGS_LEFT_COLUMN_FIELD_KEYS.includes(f.key),
  );

export const getNatSettingsRightColumnFields = () =>
  NAT_SETTINGS_FIELDS.filter((f) =>
    FXS_NAT_SETTINGS_RIGHT_COLUMN_FIELD_KEYS.includes(f.key),
  );
