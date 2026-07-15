import {
  PORT_FXS_BATCH_MODIFY_FIELDS,
  PORT_FXS_MODIFY_FIELDS,
} from "../../../../constants/PortFxsPageConstants";

export const FWD_TYPE_TO_UI = {
  no_reply: "No Reply",
  unconditional: "Unconditional",
  busy: "Busy",
};

export const FWD_TYPE_TO_API = {
  "No Reply": "no_reply",
  Unconditional: "unconditional",
  Busy: "busy",
};

export const getInitialPortFxsModifyForm = (port = "1") => {
  const form = {};
  PORT_FXS_BATCH_MODIFY_FIELDS.forEach((field) => {
    if (field.type === "select") {
      form[field.key] = field.default ?? field.options?.[0] ?? "";
    } else if (field.type === "checkbox") {
      form[field.key] = field.default ?? false;
    } else {
      form[field.key] = field.default ?? "";
    }
  });
  form.batchRegister = true;
  form.batchAccount = true;
  form.batchConfigure = true;
  form.startingPort = port;
  form.endingPort = port;
  return form;
};

export const mapPortToModifyForm = (p, base) => ({
  ...base,
  startingPort: String(p.port ?? p.id),
  endingPort: String(p.port ?? p.id),
  registerPort: p.enabled ? "Yes" : "No",
  startingSipAccount: p.sipAccount ?? "",
  startingDisplayName: p.displayName ?? "",
  startingAuthPassword: p.authPassword ?? "",
  displayNamePreferred: !!p.displayNamePreferred,
  autoDialNumberEnable: !!(p.autoDialEnabled ?? p.autoDialNumber),
  autoDialNumber: p.autoDialNumber ?? "",
  waitTimeBeforeAutoDial: String(p.autoDialWaitSec ?? 0),
  inputGain: String(p.inputGain ?? 0),
  outputGain: String(p.outputGain ?? 0),
  echoCanceller: !!p.echoCanceller,
  cid: !!p.cidEnabled,
  callWaiting: !!p.callWaiting,
  dnd: !!p.dnd,
  callForward: !!p.callForwardEnabled,
  forwardType: FWD_TYPE_TO_UI[p.forwardType] ?? "Unconditional",
  forwardNumber: p.forwardNumber ?? "",
  noAnswerDelayTime: String(p.noReplyDelaySec ?? 0),
  advancedConfiguration: !!p.advancedConfiguration,
  ringingParameter: p.ringingParameter ?? "RING_ABS120V_DEF",
  feedVoltageParameter: p.feedVoltageParameter ?? "DCFEED_48V_21MA_DEF",
  impedanceParameter: p.impedanceParameter ?? "ZSYN_200_680_100_30_0",
  batchRegister: true,
  batchAccount: true,
  batchConfigure: true,
});

export const buildPortFxsModifySavePayload = (form) => ({
  port: Number(form.startingPort),
  enabled: form.registerPort === "Yes",
  registerPort: form.registerPort === "Yes" ? "yes" : "no",
  sipAccount: form.startingSipAccount,
  displayName: form.startingDisplayName,
  authPassword: form.startingAuthPassword,
  displayNamePreferred: !!form.displayNamePreferred,
  autoDialEnabled: !!form.autoDialNumberEnable,
  autoDialNumber: form.autoDialNumber || "",
  autoDialWaitSec: Number(form.waitTimeBeforeAutoDial) || 0,
  inputGain: Number(form.inputGain) || 0,
  outputGain: Number(form.outputGain) || 0,
  cidEnabled: !!form.cid,
  echoCanceller: !!form.echoCanceller,
  callWaiting: !!form.callWaiting,
  dnd: !!form.dnd,
  callForwardEnabled: !!form.callForward,
  forwardType: FWD_TYPE_TO_API[form.forwardType] ?? "unconditional",
  forwardNumber: form.forwardNumber || "",
  noReplyDelaySec: Number(form.noAnswerDelayTime) || 0,
});

export const shouldShowPortFxsModifyField = (field, form) => {
  const view = {
    ...form,
    batchRegister: true,
    batchAccount: true,
    batchConfigure: true,
  };
  if (!field.conditional) return true;
  const conditionalValue = view[field.conditional];
  if (!conditionalValue) return false;
  if (field.conditionalParent) {
    const parentValue = view[field.conditionalParent];
    if (field.conditionalParentValue !== undefined) {
      if (Array.isArray(field.conditionalParentValue)) {
        return field.conditionalParentValue.includes(parentValue);
      }
      return parentValue === field.conditionalParentValue;
    }
    return !!parentValue;
  }
  return true;
};

export const getPortFxsModifySpacerBeforeField = (prevField) =>
  prevField &&
  (prevField.key === "startingPort" ||
    prevField.key === "registerPort" ||
    prevField.key === "displayNamePreferred" ||
    prevField.key === "waitTimeBeforeAutoDial" ||
    prevField.key === "echoCanceller" ||
    prevField.key === "impedanceParameter");

export { PORT_FXS_MODIFY_FIELDS };
