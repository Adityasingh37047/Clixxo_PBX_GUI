const TIME_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

export function validatePortFxsAdvancedBatchForm(batchForm, prohibitLimitCount) {
  if (
    batchForm.forbidOutgoingCall &&
    batchForm.wayOfForbidOutgoingCall === "Select time"
  ) {
    for (let i = 1; i <= prohibitLimitCount; i++) {
      const start1 = batchForm[`period${i}Start1`];
      const end1 = batchForm[`period${i}End1`];
      if (!start1 || !end1) {
        return {
          valid: false,
          message: `Please input the start and end time for period ${i}!`,
        };
      }
      if (!TIME_REGEX.test(start1) || !TIME_REGEX.test(end1)) {
        return {
          valid: false,
          message: `Please input the time in the right format (hh:mm:ss) for period ${i}!`,
        };
      }
    }
  }

  return { valid: true };
}
