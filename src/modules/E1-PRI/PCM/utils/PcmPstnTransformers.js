export const buildPcmPstnSpanPayload = (formData) => ({
  id: parseInt(formData.id),
  timing: parseInt(formData.timing) || 0,
  lbo: parseInt(formData.lbo) || 0,
  framing: formData.framing,
  coding: formData.coding,
  bchan: formData.bchan,
  hardhdlc: formData.hardhdlc,
  zones: {
    loadzone: "in",
    defaultzone: "in",
  },
});

export const buildPcmPstnApiPayload = (formData) => {
  const spanPayload = buildPcmPstnSpanPayload(formData);
  return {
    span_id: parseInt(formData.id),
    span: spanPayload,
    channels: {
      channel: formData.bchan,
      signalling: formData.signalling,
      context: formData.context,
      switchtype: formData.switchtype,
      group: parseInt(formData.group) || 1,
      language: "en",
      accountcode: formData.accountcode,
      pickupgroup: parseInt(formData.pickupgroup) || 1,
      callgroup: parseInt(formData.callgroup) || 1,
      pridialplan: formData.pridialplan,
      prilocaldialplan: formData.prilocaldialplan,
      facilityenable: formData.facilityenable,
      usecallerid: formData.usecallerid,
      hidecallerid: formData.hidecallerid,
      usecallingpres: formData.usecallingpres,
      echocancel: formData.echocancel,
      echocancelwhenbridged: formData.echocancelwhenbridged,
      immediate: formData.immediate,
      overlapdial: formData.overlapdial,
      faxdetect: formData.faxdetect,
      rxgain: parseFloat(formData.rxgain) || 0.0,
      txgain: parseFloat(formData.txgain) || 0.0,
    },
  };
};

export const formatPcmPstnDisplayValue = (value) =>
  value === undefined || value === null || value === "" ? "--" : String(value);
