export const FXS_VOIP_MEDIA_CODEC_OPTIONS = [
  { id: "6", label: "G711A" },
  { id: "7", label: "G711U" },
  { id: "131", label: "G729" },
  { id: "98", label: "iLBC" },
  { id: "96", label: "AMR" },
  { id: "4", label: "G723" },
];

export const FXS_VOIP_MEDIA_DEFAULT_SELECTED_CODECS = ["6", "7", "131", "98", "96", "4"];

export const FXS_VOIP_MEDIA_DEFAULT_FORM = {
  dtmfTransmitMode: "0",
  rfc2833Payload: "101",
  rtpPortRange: "10000,20000",
  silenceSuppression: "0",
  jitterMode: "0",
  jitterBuffer: "100",
  voiceGainOutput: "0",
};

export const FXS_VOIP_MEDIA_PARAMETER_ROWS = [
  {
    label: "DTMF Transmit Mode",
    type: "select",
    name: "dtmfTransmitMode",
    options: [
      { value: "0", label: "RFC2833" },
      { value: "1", label: "SIP INFO" },
      { value: "2", label: "In-band" },
    ],
  },
  {
    label: "RFC2833 Payload",
    type: "text",
    name: "rfc2833Payload",
    keyPress: "number",
  },
  {
    label: "RTP Port Range",
    type: "text",
    name: "rtpPortRange",
    keyPress: "number-comma",
  },
  {
    label: "Silence Suppression",
    type: "select",
    name: "silenceSuppression",
    options: [
      { value: "0", label: "Disable" },
      { value: "1", label: "Enable" },
    ],
  },
  {
    label: "JitterMode",
    type: "select",
    name: "jitterMode",
    options: [{ value: "0", label: "Static Mode" }],
  },
  {
    label: "JitterBuffer(ms)",
    type: "text",
    name: "jitterBuffer",
    keyPress: "number",
  },
  {
    label: "Voice Gain Output from IP",
    type: "text",
    name: "voiceGainOutput",
    keyPress: "number-minus",
  },
];

export const getFxsVoipMediaCodecLabel = (id) =>
  FXS_VOIP_MEDIA_CODEC_OPTIONS.find((c) => c.id === id)?.label || id;

export const mapFxsVoipMediaCodecOptions = () =>
  FXS_VOIP_MEDIA_CODEC_OPTIONS.map((c) => ({ value: c.id, label: c.label }));

export const getFxsVoipMediaInitialForm = () => ({ ...FXS_VOIP_MEDIA_DEFAULT_FORM });

export const getFxsVoipMediaInitialCodecs = () => [...FXS_VOIP_MEDIA_DEFAULT_SELECTED_CODECS];
