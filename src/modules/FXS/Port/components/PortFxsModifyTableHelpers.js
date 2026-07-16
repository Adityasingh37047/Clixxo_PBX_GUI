export const handlePortFxsModifyRestrictedChars = (e) => {
  const forbidden = /[%&~\|\(\);\\"'=\\\u007C]/;
  if (forbidden.test(e.key)) e.preventDefault();
};

export const handlePortFxsModifyDigitsOnly = (e) => {
  if (
    !/^[0-9]$/.test(e.key) &&
    !["Backspace", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
  ) {
    e.preventDefault();
  }
};

export const handlePortFxsModifyDigitsHyphen = (e) => {
  if (
    !/^[0-9-]$/.test(e.key) &&
    !["Backspace", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
  ) {
    e.preventDefault();
  }
};

export const handlePortFxsModifyAutoDialKey = (e) => {
  if (
    !/^[0-9abc#*]$/.test(e.key) &&
    !["Backspace", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
  ) {
    e.preventDefault();
  }
};

export const getPortFxsModifyFieldKeyDown = (field) => {
  if (field.validation === "integer") return handlePortFxsModifyDigitsOnly;
  if (field.key === "inputGain" || field.key === "outputGain") {
    return handlePortFxsModifyDigitsHyphen;
  }
  if (field.key === "autoDialNumber") return handlePortFxsModifyAutoDialKey;
  return handlePortFxsModifyRestrictedChars;
};

export const FORM_LABEL_WIDTH = 200;
export const FORM_INPUT_COL_WIDTH = 200;
export const FORM_TABLE_WIDTH = FORM_LABEL_WIDTH + FORM_INPUT_COL_WIDTH;
