// Initial form data for QoS page
export const QOS_INITIAL_FORM = {
  qosEnabled: false,
  mediaPremiumQos: '46',
  controlPremiumQos: '26',
};

/** QoS page */
export const QOS_FIELD_TOOLTIPS = {
  qosEnabled:
    "Enables DiffServ QoS marking on FXS traffic.\n" +
    "State key: qosEnabled. Checkbox; default unchecked.\n" +
    "When enabled, Media and Control Premium QoS fields are shown and validated on Save.",

  mediaPremiumQos:
    "DSCP priority value for RTP/media packets.\n" +
    "State key: mediaPremiumQos. Shown only when QoS is enabled.\n" +
    "Digits only, max 2 characters. Valid range: 0–63. Default: 46.",

  controlPremiumQos:
    "DSCP priority value for SIP/control signaling packets.\n" +
    "State key: controlPremiumQos. Shown only when QoS is enabled.\n" +
    "Digits only, max 2 characters. Valid range: 0–63. Default: 26.",
};
