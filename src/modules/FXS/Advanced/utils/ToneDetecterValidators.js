export function validateToneDetecterForm(formData) {
  if (!formData.tone) {
    return "Tone is required.";
  }
  if (
    formData.first_mid_frequency === "" ||
    formData.first_mid_frequency == null
  ) {
    return "The 1st Mid-frequency is required.";
  }
  if (formData.duration_error === "" || formData.duration_error == null) {
    return "Duration Error at ON/OFF State is required.";
  }
  return null;
}
