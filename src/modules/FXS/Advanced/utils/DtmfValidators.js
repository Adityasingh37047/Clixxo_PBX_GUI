export function checkDtmfEnergy(value) {
  const parts = value.toString().split(".");
  if ((parts[1] !== undefined && parts[1].length > 1) || parts.length > 2) {
    return true;
  }
  return false;
}

const getDtmfKeyLabel = (i) => (i === 10 ? "*" : i === 11 ? "#" : i);

export function validateDtmfForm(formData) {
  const positiveTwist = parseFloat(formData.positiveTwist);
  if (isNaN(positiveTwist) || positiveTwist < 0 || positiveTwist > 24) {
    return {
      message:
        "The range of 'Energy Difference for High-freq minus Low-freq' is 0~24!",
      fieldName: "positiveTwist",
    };
  }

  const negativeTwist = parseFloat(formData.negativeTwist);
  if (isNaN(negativeTwist) || negativeTwist < 0 || negativeTwist > 24) {
    return {
      message:
        "The range of 'Energy Difference for Low-freq minus High-freq' is 0~24!",
      fieldName: "negativeTwist",
    };
  }

  const minDuration = parseFloat(formData.minDuration);
  if (isNaN(minDuration) || minDuration < 10 || minDuration > 2000) {
    return {
      message: "The value range of the minimum duration at ON is 10~2000!",
      fieldName: "minDuration",
    };
  }

  const minNegativeDuration = parseFloat(formData.minNegativeDuration);
  if (
    isNaN(minNegativeDuration) ||
    minNegativeDuration < 10 ||
    minNegativeDuration > 2000
  ) {
    return {
      message: "The value range of the minimum duration at OFF is 10~2000!",
      fieldName: "minNegativeDuration",
    };
  }

  const energyRatio = parseFloat(formData.energyRatio);
  if (isNaN(energyRatio) || energyRatio < 1 || energyRatio > 100) {
    return {
      message: "The ratio range of the DT energy is 1~100!",
      fieldName: "energyRatio",
    };
  }

  const levelMinIn = parseFloat(formData.levelMinIn);
  if (isNaN(levelMinIn) || levelMinIn < -40 || levelMinIn > -9) {
    return {
      message: "The value range of the lowest energy threshold is -40~-9!",
      fieldName: "levelMinIn",
    };
  }

  if (formData.dtmfEnergyAdvance) {
    for (let i = 0; i <= 11; i++) {
      const dtmfPlayEnergy = parseFloat(formData[`dtmfPlayEnergy${i}`]);
      if (
        isNaN(dtmfPlayEnergy) ||
        dtmfPlayEnergy < -18 ||
        dtmfPlayEnergy > 11
      ) {
        const key = getDtmfKeyLabel(i);
        return {
          message: `The value range of DTMF${key} Low Energy is -18.0~11.0dB!`,
          fieldName: `dtmfPlayEnergy${i}`,
        };
      }
      if (checkDtmfEnergy(formData[`dtmfPlayEnergy${i}`])) {
        const key = getDtmfKeyLabel(i);
        return {
          message: `The value of DTMF${key} Low Energy only have one decimal!`,
          fieldName: `dtmfPlayEnergy${i}`,
        };
      }

      const dtmfHighPlayEnergy = parseFloat(
        formData[`dtmfHighPlayEnergy${i}`],
      );
      if (
        isNaN(dtmfHighPlayEnergy) ||
        dtmfHighPlayEnergy < -18 ||
        dtmfHighPlayEnergy > 11
      ) {
        const key = getDtmfKeyLabel(i);
        return {
          message: `The value range of DTMF${key} High Energy is -18.0~11.0dB!`,
          fieldName: `dtmfHighPlayEnergy${i}`,
        };
      }
      if (checkDtmfEnergy(formData[`dtmfHighPlayEnergy${i}`])) {
        const key = getDtmfKeyLabel(i);
        return {
          message: `The value of DTMF${key} High Energy only have one decimal!`,
          fieldName: `dtmfHighPlayEnergy${i}`,
        };
      }
    }
  } else {
    const dtmfPlayEnergy = parseFloat(formData.dtmfPlayEnergy);
    if (
      isNaN(dtmfPlayEnergy) ||
      dtmfPlayEnergy < -18 ||
      dtmfPlayEnergy > 11
    ) {
      return {
        message: "The value range of 'DTMF Energy' is -18~11dB!",
        fieldName: "dtmfPlayEnergy",
      };
    }
  }

  const dtmfTxHighDuration = parseFloat(formData.dtmfTxHighDuration);
  if (
    isNaN(dtmfTxHighDuration) ||
    dtmfTxHighDuration < 0 ||
    dtmfTxHighDuration > 16383
  ) {
    return {
      message: "The value range of 'Duration at ON' is 0~16383!",
      fieldName: "dtmfTxHighDuration",
    };
  }

  const dtmfTxLowDuration = parseFloat(formData.dtmfTxLowDuration);
  if (
    isNaN(dtmfTxLowDuration) ||
    dtmfTxLowDuration < 0 ||
    dtmfTxLowDuration > 16383
  ) {
    return {
      message: "The value range of 'Duration at OFF' is 0~16383!",
      fieldName: "dtmfTxLowDuration",
    };
  }

  return null;
}
