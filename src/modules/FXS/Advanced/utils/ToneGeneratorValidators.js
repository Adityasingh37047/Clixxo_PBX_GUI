export function checkPara(value) {
  const numTest = /^[1234567890]*$/;
  const linepara = value.split(",");
  let highvalue = 0;

  for (let i = 0; i < linepara.length; i++) {
    if (linepara[i] === "") return false;
    const parapart = linepara[i].split("/");
    if (
      parapart.length !== 2 ||
      parapart[0] === "" ||
      parapart[1] === "" ||
      !numTest.test(parapart[1])
    ) {
      return false;
    }
    if (parapart[0] !== "0") highvalue++;
    if (highvalue > 4) return false;

    const paraadd = parapart[0].split("+");
    if (i === 0 && paraadd.length === 1 && paraadd[0] === "0") return false;

    if (paraadd.length === 1) {
      if (
        !numTest.test(paraadd[0]) ||
        (!(parseInt(paraadd[0], 10) >= 200 && parseInt(paraadd[0], 10) <= 3500) &&
          paraadd[0] !== "0")
      ) {
        return false;
      }
    }

    if (paraadd.length === 2) {
      for (let j = 0; j < paraadd.length; j++) {
        if (
          !numTest.test(paraadd[j]) ||
          paraadd[j] === "0" ||
          !(parseInt(paraadd[j], 10) >= 200 && parseInt(paraadd[j], 10) <= 3500)
        ) {
          return false;
        }
      }
    }
    if (paraadd.length > 2) return false;
  }
  return true;
}

export function validateToneGeneratorForm(formData) {
  if (!checkPara(formData.dialTone)) {
    return {
      msg: "Invalid Parameters of Dial Tone Transmitter!",
      fieldId: "dialTone",
    };
  }
  if (!checkPara(formData.ringbackTone)) {
    return {
      msg: "Invalid Parameters of Ringback Tone Transmitter!",
      fieldId: "ringbackTone",
    };
  }
  if (!checkPara(formData.busyTone)) {
    return {
      msg: "Invalid Parameters of Busy Tone Transmitter!",
      fieldId: "busyTone",
    };
  }
  return null;
}
