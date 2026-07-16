export function validateFxsForm(formData) {
  if (formData.ringingSchemeEnabled && !formData.ringMode) {
    return "Please input a ringing mode for Scheme!";
  }

  if (formData.ringingSchemeEnabled && formData.ringMode) {
    const strArr = formData.ringMode.split(",");
    if (strArr[0] === "1") {
      if (strArr.length !== 3) {
        return "Please input a ringing mode in the right format for Scheme!";
      }
      const sum = parseInt(strArr[1]) + parseInt(strArr[2]);
      if (sum > 16000) {
        return "The sum duration at ON/OFF state for ringing scheme cannot be more than 16000ms！";
      }
      if (parseInt(strArr[1]) > 12000 || parseInt(strArr[2]) > 12000) {
        return "The duration at ON/OFF state for ringing scheme cannot be more than 12000ms！";
      }
      const minKeepTime = 50;
      if (
        parseInt(strArr[1]) < minKeepTime ||
        parseInt(strArr[2]) < minKeepTime
      ) {
        return "The duration at ON/OFF state for ringing scheme cannot be less than 50ms!";
      }
    } else if (strArr[0] === "2") {
      if (strArr.length !== 5) {
        return "Please input a ringing mode in the right format for Scheme!";
      }
      const sum =
        parseInt(strArr[1]) +
        parseInt(strArr[2]) +
        parseInt(strArr[3]) +
        parseInt(strArr[4]);
      if (sum > 16000) {
        return "The sum duration at ON/OFF state for ringing scheme cannot be more than 16000ms！";
      }
      if (
        parseInt(strArr[1]) > 12000 ||
        parseInt(strArr[2]) > 12000 ||
        parseInt(strArr[3]) > 12000 ||
        parseInt(strArr[4]) > 12000
      ) {
        return "The duration at ON/OFF state for ringing scheme cannot be more than 12000ms！";
      }
      const minKeepTime = 50;
      if (
        parseInt(strArr[1]) < minKeepTime ||
        parseInt(strArr[2]) < minKeepTime ||
        parseInt(strArr[3]) < minKeepTime ||
        parseInt(strArr[4]) < minKeepTime
      ) {
        return "The duration at ON/OFF state for ringing scheme cannot be less than 50ms!";
      }
    } else {
      return "Please input a ringing mode in the right format for Scheme!";
    }
  }

  const toneEnergy = parseInt(formData.toneEnergy);
  if (isNaN(toneEnergy) || toneEnergy < -35 || toneEnergy > 15) {
    return "The value range of 'Tone Energy' is -35~15dB!";
  }

  if (formData.hookFlashDetection) {
    const hookFlashMinTime = parseInt(formData.hookFlashMinTime);
    const hookFlashMaxTime = parseInt(formData.hookFlashMaxTime);

    if (hookFlashMinTime < 80) {
      return "The minimum time for Hook-flash detection must be longer than 80ms!";
    }
    if (hookFlashMinTime > hookFlashMaxTime) {
      return "The minimum time for Hook-flash detection can not exceed the maximum time!";
    }
    if (hookFlashMaxTime < 80 || hookFlashMaxTime > 2000) {
      return "The value range of 'Flash Signal Detection' is 80~2000ms";
    }
  } else {
    const minHangupTime = parseInt(formData.minHangupTime);
    if (minHangupTime < 64 || minHangupTime > 2000) {
      return "The minimum time length of on-hook detection must be in the range of 64ms~2000ms!";
    }
  }

  const offHookDither = parseInt(formData.offHookDitherSignalDuration);
  if (offHookDither <= 0 || offHookDither % 16 !== 0) {
    return "Off-hook Dither Signal Duration must be longer than 0 and the integral times of 16!";
  }

  return null;
}
