export const validateFxsVoipMediaForm = (formData, selectedCodecs) => {
  if (!formData.rfc2833Payload) {
    return "Please enter a RFC2833 load!";
  }
  const rfc2833 = parseInt(formData.rfc2833Payload);
  if (rfc2833 < 90 || rfc2833 >= 128) {
    return "The value range of 'RFC2833 Load' is 90~127!";
  }

  if (!formData.rtpPortRange) {
    return "Please enter a RTP port range!";
  }
  const portParts = formData.rtpPortRange.split(",");
  if (portParts.length !== 2) {
    return "Invalid RTP port range!";
  }
  const startPort = parseInt(portParts[0]);
  const endPort = parseInt(portParts[1]);
  if (isNaN(startPort) || isNaN(endPort)) {
    return "'RTP Port' must be numbers!";
  }
  if (startPort < 2000 || endPort > 60000) {
    return "The value range of 'RTP Port' is 2000~60000!";
  }
  if (5060 >= startPort && 5060 <= endPort) {
    return "The SIP port value 5060 cannot be within the port range!";
  }
  if (startPort % 2 !== 0) {
    return "The starting port number must be an even!";
  }
  if (endPort - startPort < 480) {
    return "The difference between the latter 'RTP Port' and the former should be no less than 480!";
  }

  if (formData.jitterMode === "0") {
    if (!formData.jitterBuffer) {
      return "Please enter a JitterBuffer value!";
    }
    const jitterBuffer = parseInt(formData.jitterBuffer);
    if (jitterBuffer < 20 || jitterBuffer > 200) {
      return "The value range of 'JitterBuffer' is 20~200!";
    }
  }

  const voiceGain = parseInt(formData.voiceGainOutput);
  if (isNaN(voiceGain) || voiceGain < -24 || voiceGain > 24) {
    return "The value range of 'Voice Gain Output from IP' is -24~24!";
  }
  if (voiceGain % 3 !== 0) {
    return "The value of 'Voice Gain Output from IP' must be a multiple of 3!";
  }

  if (selectedCodecs.length === 0) {
    return "Please select a CODEC!";
  }

  return null;
};

export const handleFxsVoipMediaKeyPress = (e, type) => {
  const key = e.keyCode || e.which;
  if (type === "number") {
    if (!((key > 47 && key < 58) || key === 8)) {
      e.preventDefault();
    }
  } else if (type === "number-comma") {
    if (!((key > 47 && key < 58) || key === 44 || key === 8)) {
      e.preventDefault();
    }
  } else if (type === "number-minus") {
    if (!((key > 47 && key < 58) || key === 45 || key === 8)) {
      e.preventDefault();
    }
  }
};
