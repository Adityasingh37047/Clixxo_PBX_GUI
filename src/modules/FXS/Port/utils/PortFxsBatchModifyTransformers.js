import {
  PORT_FXS_BATCH_MODIFY_FIELDS,
  PORT_FXS_TOTAL_PORTS,
} from "../../../../constants/PortFxsPageConstants";

export const FWD_TYPE_TO_API = {
  "No Reply": "no_reply",
  Unconditional: "unconditional",
  Busy: "busy",
};

export const getInitialPortFxsBatchForm = (initialPorts = null) => {
  const form = {};
  PORT_FXS_BATCH_MODIFY_FIELDS.forEach((field) => {
    if (field.type === "select") {
      form[field.key] = field.options[0] || field.default || "";
    } else if (field.type === "checkbox") {
      form[field.key] = field.default || false;
    } else {
      form[field.key] = field.default || "";
    }
  });

  if (initialPorts) {
    if (initialPorts.startingPort) {
      form.startingPort = initialPorts.startingPort;
    }
    if (initialPorts.endingPort) {
      form.endingPort = initialPorts.endingPort;
    }
  }

  return form;
};

export const buildPortFxsBatchSavePayload = (form) => ({
  startingPort: parseInt(form.startingPort, 10),
  endingPort: parseInt(form.endingPort, 10),
  batchRegisterEnabled: !!form.batchRegister,
  registerPort: form.registerPort === "Yes" ? "yes" : "no",
  batchAccountEnabled: !!form.batchAccount,
  startingSipAccount: form.startingSipAccount,
  startingDisplayName: form.startingDisplayName,
  startingAuthenticationPassword: form.startingAuthPassword,
  displayNamePreferred: !!form.displayNamePreferred,
  sipAccountBatchRule: form.sipAccountBatchRule
    ? String(form.sipAccountBatchRule).toLowerCase()
    : "increase",
  sipAccountBatchStepSize: Number(form.sipAccountBatchStepSize) || 1,
  displayNameBatchRule: form.displayNameBatchRule
    ? String(form.displayNameBatchRule).toLowerCase()
    : "increase",
  displayNameBatchStepSize: Number(form.displayNameBatchStepSize) || 1,
  authPasswordBatchRule: form.authPasswordBatchRule
    ? String(form.authPasswordBatchRule).toLowerCase()
    : "increase",
  authPasswordBatchStepSize: Number(form.authPasswordBatchStepSize) || 1,
  batchConfigureEnabled: !!form.batchConfigure,
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

export const shouldShowPortFxsBatchField = (field, form) => {
  if (!field.conditional) return true;

  const conditionalValue = form[field.conditional];
  if (!conditionalValue) return false;

  if (field.conditionalParent) {
    const parentValue = form[field.conditionalParent];

    if (field.conditionalParentValue !== undefined) {
      if (Array.isArray(field.conditionalParentValue)) {
        return field.conditionalParentValue.includes(parentValue);
      }
      return parentValue === field.conditionalParentValue;
    }

    return !!parentValue;
  }

  if (
    field.conditionalParentValue !== undefined &&
    field.key.includes("StepSize")
  ) {
    const ruleKey = field.key
      .replace("StepSize", "Rule")
      .replace("Length", "Rule");
    const ruleValue = form[ruleKey];

    if (Array.isArray(field.conditionalParentValue)) {
      return field.conditionalParentValue.includes(ruleValue);
    }
    return ruleValue !== field.conditionalParentValue;
  }

  return true;
};

export const getPortFxsBatchSpacerBeforeField = (prevField, shouldShowField) =>
  prevField &&
  shouldShowField(prevField) &&
  (prevField.key === "endingPort" ||
    prevField.key === "registerPort" ||
    prevField.key === "displayNamePreferred" ||
    prevField.key === "waitTimeBeforeAutoDial" ||
    prevField.key === "echoCanceller" ||
    prevField.key === "impedanceParameter");

export const getPortFxsBatchPortOptions = (maxPorts) =>
  Array.from(
    { length: maxPorts || PORT_FXS_TOTAL_PORTS },
    (_, i) => String(i + 1),
  );
