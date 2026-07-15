function validateRingMode(ringModeObj, ringNumInfo) {
  const minKeepTime = 50;
  const minSendCidLowTime = 1700;
  const CIDstyle = 1;
  const FskPos = 1;

  if (ringModeObj === "") {
    return {
      msg: `Please input a ringing mode for Scheme ${ringNumInfo}!`,
      fieldId: `ringMode${ringNumInfo}`,
    };
  }

  const strArr = ringModeObj.split(",");
  if (strArr[0] === "1") {
    if (strArr.length !== 3) {
      return {
        msg: `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
        fieldId: `ringMode${ringNumInfo}`,
      };
    }
    if (
      parseInt(strArr[1]) < minKeepTime ||
      parseInt(strArr[2]) < minKeepTime ||
      (CIDstyle === 1 &&
        FskPos === 1 &&
        parseInt(strArr[2]) < minSendCidLowTime)
    ) {
      if (parseInt(strArr[1]) < minKeepTime) {
        return {
          msg: `The duration at ON/OFF state for ringing scheme ${ringNumInfo} cannot be less than 50ms!`,
          fieldId: `ringMode${ringNumInfo}`,
        };
      }
      return {
        msg: `The duration at OFF state for the last ringing scheme ${ringNumInfo} cannot be less than 1700ms!`,
        fieldId: `ringMode${ringNumInfo}`,
      };
    }
  } else if (strArr[0] === "2") {
    if (strArr.length !== 5) {
      return {
        msg: `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
        fieldId: `ringMode${ringNumInfo}`,
      };
    }
    if (
      parseInt(strArr[1]) < minKeepTime ||
      parseInt(strArr[2]) < minKeepTime ||
      parseInt(strArr[3]) < minKeepTime ||
      parseInt(strArr[4]) < minKeepTime ||
      (CIDstyle === 1 &&
        FskPos === 1 &&
        parseInt(strArr[4]) < minSendCidLowTime)
    ) {
      if (
        parseInt(strArr[1]) < minKeepTime ||
        parseInt(strArr[2]) < minKeepTime ||
        parseInt(strArr[3]) < minKeepTime
      ) {
        return {
          msg: `The duration at ON/OFF state for ringing scheme ${ringNumInfo} cannot be less than 50ms!`,
          fieldId: `ringMode${ringNumInfo}`,
        };
      }
      return {
        msg: `The duration at OFF state for the last ringing scheme ${ringNumInfo} cannot be less than 1700ms!`,
        fieldId: `ringMode${ringNumInfo}`,
      };
    }
  } else {
    return {
      msg: `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
      fieldId: `ringMode${ringNumInfo}`,
    };
  }

  return null;
}

export function validateRingingSchemeForm(formData) {
  const reg = /^[0-9A-Za-z.*\[\]\-,]{1,128}$/;

  for (let i = 1; i <= 4; i++) {
    const ringCallerIdObj = formData[`ringCallerId${i}`];
    const ringModeObj = formData[`ringMode${i}`];
    const ringAlertInfoObj = formData[`ringAlertInfo${i}`];
    const ringNumInfo = String(i);

    if (formData.ringScheme === "0") {
      if (ringCallerIdObj !== "") {
        if (!reg.test(ringCallerIdObj)) {
          return {
            msg: "The CallerID can consist only of 0~9, A~Z, a~z, '.' '[' ']' '-' ',' and '*'!",
            fieldId: `ringCallerId${i}`,
          };
        }
        const ringModeError = validateRingMode(ringModeObj, ringNumInfo);
        if (ringModeError) return ringModeError;
      } else if (ringModeObj !== "") {
        return {
          msg: `Please input the CallerID for Scheme ${ringNumInfo}!`,
          fieldId: `ringCallerId${i}`,
        };
      }
    } else {
      if (ringAlertInfoObj !== "") {
        const ringModeError = validateRingMode(ringModeObj, ringNumInfo);
        if (ringModeError) return ringModeError;
      } else if (ringModeObj !== "") {
        return {
          msg: `Please input the Alert-Info Value for Scheme ${ringNumInfo}!`,
          fieldId: `ringAlertInfo${i}`,
        };
      }
    }
  }

  const ringCallerIdArr = [
    formData.ringCallerId1,
    formData.ringCallerId2,
    formData.ringCallerId3,
    formData.ringCallerId4,
  ];
  const ringAlertInfoArr = [
    formData.ringAlertInfo1,
    formData.ringAlertInfo2,
    formData.ringAlertInfo3,
    formData.ringAlertInfo4,
  ];

  for (let i = 0; i < 3; i++) {
    if (formData.ringScheme === "0") {
      if (ringCallerIdArr[i] === "") continue;
      for (let j = i + 1; j < 4; j++) {
        if (ringCallerIdArr[j] === "") continue;
        if (ringCallerIdArr[i] === ringCallerIdArr[j]) {
          return {
            msg: "The callerID has already existed!",
            fieldId: `ringCallerId${j + 1}`,
          };
        }
      }
    } else {
      if (ringAlertInfoArr[i] === "") continue;
      for (let j = i + 1; j < 4; j++) {
        if (ringAlertInfoArr[j] === "") continue;
        if (ringAlertInfoArr[i] === ringAlertInfoArr[j]) {
          return {
            msg: "The Alter-Info has already existed!",
            fieldId: `ringAlertInfo${j + 1}`,
          };
        }
      }
    }
  }

  return null;
}
