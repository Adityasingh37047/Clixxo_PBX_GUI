export function validatePortFxsBatchForm(form) {
  if (parseInt(form.startingPort) > parseInt(form.endingPort)) {
    return {
      valid: false,
      message:
        "The starting port number cannot be larger than the ending port one!",
    };
  }

  if (form.batchAccount) {
    if (form.startingSipAccount && !form.sipAccountBatchStepSize) {
      return {
        valid: false,
        message: "Please enter the batch step size of SIP account!",
      };
    }
    if (
      form.displayNameBatchRule !== "All Same" &&
      !form.displayNameBatchStepSize
    ) {
      return {
        valid: false,
        message: "Please enter the batch step size of display name!",
      };
    }
    if (form.registerPort === "Yes" && form.batchRegister) {
      if (!form.startingAuthPassword) {
        return { valid: false, message: "Please enter your password!" };
      }
      if (
        form.authPasswordBatchRule !== "All Same" &&
        !form.authPasswordBatchStepSize
      ) {
        return {
          valid: false,
          message:
            "Please enter the batch step size of authentication password!",
        };
      }
    }
  }

  if (form.batchConfigure) {
    if (form.autoDialNumberEnable && !form.autoDialNumber) {
      return { valid: false, message: "Please enter 'Auto Dial Number'!" };
    }
    if (form.autoDialNumberEnable && !form.waitTimeBeforeAutoDial) {
      return {
        valid: false,
        message: "Please enter 'Wait Time before Auto Dial'!",
      };
    }
    if (!form.inputGain || form.inputGain < -6 || form.inputGain > 6) {
      return { valid: false, message: "The value range of Input Gain is -6~6!" };
    }
    if (!form.outputGain || form.outputGain < -6 || form.outputGain > 6) {
      return {
        valid: false,
        message: "The value range of Output Gain is -6~6!",
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
  }

  return { valid: true };
}
