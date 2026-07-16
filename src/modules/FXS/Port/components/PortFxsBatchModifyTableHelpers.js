export const handlePortFxsBatchRestrictedChars = (e) => {
  const forbidden = /[%&~\|\(\);\\"'=\\\u007C]/;
  if (forbidden.test(e.key)) e.preventDefault();
};

export const handlePortFxsBatchDigitsOnly = (e) => {
  if (
    !/^[0-9]$/.test(e.key) &&
    !["Backspace", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
  ) {
    e.preventDefault();
  }
};

export const handlePortFxsBatchDigitsHyphen = (e) => {
  if (
    !/^[0-9-]$/.test(e.key) &&
    !["Backspace", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
  ) {
    e.preventDefault();
  }
};

export const handlePortFxsBatchAutoDialKey = (e) => {
  if (
    !/^[0-9abc#*]$/.test(e.key) &&
    !["Backspace", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
  ) {
    e.preventDefault();
  }
};

export const getPortFxsBatchFieldKeyDown = (field) => {
  if (field.validation === "integer") return handlePortFxsBatchDigitsOnly;
  if (field.key === "inputGain" || field.key === "outputGain") {
    return handlePortFxsBatchDigitsHyphen;
  }
  if (field.key === "autoDialNumber") return handlePortFxsBatchAutoDialKey;
  return handlePortFxsBatchRestrictedChars;
};

export const BATCH_LABEL_WIDTH = 200;
export const BATCH_INPUT_COL_WIDTH = 200;
export const BATCH_FORM_TABLE_WIDTH = BATCH_LABEL_WIDTH + BATCH_INPUT_COL_WIDTH;
