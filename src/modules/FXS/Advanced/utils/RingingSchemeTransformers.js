export function applySchemeChange(formData, value, changeTime) {
  const newData = { ...formData, ringScheme: value };
  if (changeTime > 0) {
    for (let i = 1; i <= 4; i++) {
      const tempMode = newData[`ringMode${i}`];
      newData[`ringMode${i}`] = newData[`ringMode${i}bak`];
      newData[`ringMode${i}bak`] = tempMode;
    }
  } else {
    for (let i = 1; i <= 4; i++) {
      if (value === "0") {
        if (newData[`ringMode${i}`] === "") {
          newData[`ringAlertInfo${i}`] = "";
        } else if (newData[`ringAlertInfo${i}`] === "") {
          newData[`ringMode${i}bak`] = "";
        }
      } else {
        if (newData[`ringMode${i}`] === "") {
          newData[`ringCallerId${i}`] = "";
        } else if (newData[`ringCallerId${i}`] === "") {
          newData[`ringMode${i}bak`] = "";
        }
      }
    }
  }
  return newData;
}

export function resetRingingSchemeForm(initialForm) {
  return { ...initialForm };
}

export function getRingingSchemeMatchColumn(isCallerId) {
  return {
    label: isCallerId ? "CallerID" : "Alert-Info Value",
    headerTooltipKey: isCallerId ? "ringCallerId1" : "ringAlertInfo1",
  };
}
