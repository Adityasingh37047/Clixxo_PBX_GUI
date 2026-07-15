export function validateCdrQueryForm(formData) {
  if (
    formData.startdate &&
    formData.enddate &&
    formData.startdate > formData.enddate
  ) {
    return "The Ending Date should not be earlier than the Starting Date!";
  }

  const minTalkTime = Number(formData.mintalktime);
  const maxTalkTime = Number(formData.maxtalktime);
  if (
    formData.mintalktime &&
    formData.maxtalktime &&
    minTalkTime > maxTalkTime
  ) {
    return "The max talk duration should not be smaller than the min talk duration!";
  }

  return null;
}
