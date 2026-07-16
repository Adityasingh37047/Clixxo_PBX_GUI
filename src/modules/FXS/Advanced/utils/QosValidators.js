export function validateQosForm(formData) {
  if (!formData.qosEnabled) return null;

  const mediaQos = parseInt(formData.mediaPremiumQos, 10);
  if (Number.isNaN(mediaQos) || mediaQos < 0 || mediaQos > 63) {
    return "The range of 'Media Premium QoS' is 0~63!";
  }

  const controlQos = parseInt(formData.controlPremiumQos, 10);
  if (Number.isNaN(controlQos) || controlQos < 0 || controlQos > 63) {
    return "The range of 'Control Premium QoS' is 0~63!";
  }

  return null;
}
