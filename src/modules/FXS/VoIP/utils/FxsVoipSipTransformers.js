import {
  SIP_SETTINGS_FIELDS,
  FXS_VOIP_SIP_LOCAL_REGISTER_STATUS,
  FXS_VOIP_SIP_LEFT_COLUMN_FIELD_KEYS,
  FXS_VOIP_SIP_RIGHT_COLUMN_FIELD_KEYS,
} from "../../../../constants/FxsVoipSipConstants";

export const getFxsVoipSipInitialState = () => {
  const state = {};
  SIP_SETTINGS_FIELDS.forEach((f) => {
    if (f.type === "select") {
      state[f.key] = f.options[0] || f.default || "";
    } else if (f.type === "checkbox") {
      state[f.key] = f.default || false;
    } else if (f.type === "readonly") {
      state[f.key] = f.default || "";
    } else {
      state[f.key] = f.default || "";
    }
  });
  return state;
};

export const mergeFxsVoipSipApiData = (prev, data) => {
  if (!data) return prev;
  const next = { ...prev };
  SIP_SETTINGS_FIELDS.forEach((f) => {
    if (data[f.key] !== undefined) next[f.key] = data[f.key];
  });
  if (data.registerStatus !== undefined) next.registerStatus = data.registerStatus;
  return next;
};

export const getFxsVoipSipRegisterStatusDisplay = (mode, status) => {
  if (mode === "local") {
    return FXS_VOIP_SIP_LOCAL_REGISTER_STATUS;
  }
  return status || "";
};

export const getFxsVoipSipLeftColumnFields = () =>
  SIP_SETTINGS_FIELDS.filter((f) =>
    FXS_VOIP_SIP_LEFT_COLUMN_FIELD_KEYS.includes(f.key),
  );

export const getFxsVoipSipRightColumnFields = () =>
  SIP_SETTINGS_FIELDS.filter((f) =>
    FXS_VOIP_SIP_RIGHT_COLUMN_FIELD_KEYS.includes(f.key),
  );
