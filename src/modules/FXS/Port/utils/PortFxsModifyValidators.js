export function validatePortFxsModifyForm(form) {
  if (form.autoDialNumberEnable && !form.autoDialNumber) {
    return { valid: false, message: "Please enter 'Auto Dial Number'!" };
  }
  if (form.autoDialNumberEnable && !form.waitTimeBeforeAutoDial) {
    return {
      valid: false,
      message: "Please enter 'Wait Time before Auto Dial'!",
    };
  }
  if (form.callForward && !form.forwardNumber) {
    return { valid: false, message: "Please enter an forward number!" };
  }
  if (form.forwardType === "No Reply" && !form.noAnswerDelayTime) {
    return {
      valid: false,
      message: "Please enter a time threshold for 'No Reply'!",
    };
  }
  return { valid: true };
}
