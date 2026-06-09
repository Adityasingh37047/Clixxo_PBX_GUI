import React, { useEffect, useMemo, useState } from "react";
import {
  SIP_MEDIA_FIELDS,
  SIP_MEDIA_CODEC_FIELD,
  SIP_MEDIA_INITIAL_FORM,
} from "../../../constants/SipMediaconstants";
import { Select, MenuItem, CircularProgress, Alert } from "@mui/material";
import {
  C,
  Btn,
  SipPcmBreadcrumb,
  sipPcmFormPageWrapStyle,
  sipPcmFormPageInnerStyle,
  sipPcmFormCardStyle,
  sipPcmFormHeaderStyle,
  sipPcmAuthFormFooterStyle,
  sipPcmAuthFormBtnStyle,
  SipPcmSectionHeading,
  SIP_PCM_FORM_STACK_CLASS,
  SIP_PCM_FORM_ROW_CLASS,
  sipPcmFormLabelStyle,
  sipPcmFormControlWrapStyle,
  sipPcmAuthInputStyle,
  sipPcmAuthInputInteraction,
  sipPcmAuthMuiSelectSx,
} from "../../../sections/sip/sipPcmSharedUi";
import {
  listMediaSettings,
  updateMediaSettings,
} from "../../../api/apiService";

/** Media Parameters — responsive side inset (20px min → 150px max) */
const SIP_MEDIA_SIDE_MARGIN = "clamp(20px, 10vw, 150px)";

/** Matches Network page card body — LAN 1 heading left/right inset */
const SIP_MEDIA_FORM_BODY_STYLE = {
  padding: "12px 32px 0",
  boxSizing: "border-box",
};

const SIP_MEDIA_FORM_INSET_STYLE = {
  marginLeft: SIP_MEDIA_SIDE_MARGIN,
  marginRight: SIP_MEDIA_SIDE_MARGIN,
  boxSizing: "border-box",
};

const SIP_MEDIA_FORM_FIELDS_WRAPPER_STYLE = {
  flex: 1,
  paddingTop: 16,
  paddingBottom: 16,
  marginBottom: 12,
  boxSizing: "border-box",
};

const SipMediaPage = () => {
  const [formData, setFormData] = useState(SIP_MEDIA_INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Map UI names to API keys
  const uiToApi = useMemo(
    () => ({
      dtmfTransmitMode: "dtmf_transmit_mode",
      rfc2833Payload: "rfc2833_payload",
      rtpPortRange: "rtp_port_range",
      silenceSuppression: "slience_suppression",
      noiseReduction: "noise_reduction",
      comfortNoise: "comfort_noise_generation",
      jitterMode: "jitter_mode",
      jitterBuffer: "jitter_buffer_ms",
      jitterUnderrunLead: "jitter_under_run_lead_ms",
      jitterOverrunLead: "jitter_over_run_lead_ms",
      ipOutputLevelControl: "ip_side_output_level_control_mode",
      voiceGainOutput: "voice_gain_output_from_ip_db",
      packTimeDefault: "pack_time_when_nego_fail_default_value",
      codecSetting: "codec_seq_setting",
    }),
    [],
  );

  const apiToUi = useMemo(() => {
    const r = {};
    Object.entries(uiToApi).forEach(([u, a]) => {
      r[a] = u;
    });
    return r;
  }, [uiToApi]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await listMediaSettings();
        const settings = res?.message?.sip_settings?.[0] || {};
        const next = { ...SIP_MEDIA_INITIAL_FORM };
        Object.entries(settings).forEach(([k, v]) => {
          const uiKey = apiToUi[k];
          if (!uiKey) return;
          next[uiKey] = v ?? next[uiKey];
        });
        setFormData(next);
      } catch (e) {
        console.error("Failed to fetch media settings:", e);
        showMessage("error", "Failed to load media settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiToUi]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { id: 1 };
      Object.entries(uiToApi).forEach(([u, a]) => {
        payload[a] = formData[u] ?? null;
      });
      const res = await updateMediaSettings(payload);
      if (res?.response) {
        showMessage("success", res?.message || "Settings Updated!");
      } else {
        showMessage("error", res?.message || "Save failed");
      }
    } catch (e) {
      console.error("Failed to save media settings:", e);
      showMessage("error", e?.message || "Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(SIP_MEDIA_INITIAL_FORM);
    showMessage("info", "Form reset to defaults");
  };

  return (
    <div style={sipPcmFormPageWrapStyle}>
      <div style={sipPcmFormPageInnerStyle}>
        {/* Toast Alert */}
        {message.text && (
          <div
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              maxWidth: 420,
            }}
          >
            <Alert
              severity={message.type}
              onClose={() => setMessage({ type: "", text: "" })}
              sx={{ boxShadow: 3 }}
            >
              {message.text}
            </Alert>
          </div>
        )}

        <SipPcmBreadcrumb current="Media Parameters" />

        <div style={sipPcmFormCardStyle}>
          <div style={sipPcmFormHeaderStyle}>
            <span>Media Parameters</span>
          </div>

          <div style={SIP_MEDIA_FORM_BODY_STYLE}>
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px] w-full">
                <div className="text-center">
                  <CircularProgress size={40} sx={{ color: C.accent }} />
                  <div className="mt-3 text-gray-600">
                    Loading media parameters...
                  </div>
                </div>
              </div>
            ) : (
              <div style={SIP_MEDIA_FORM_FIELDS_WRAPPER_STYLE}>
                <div style={SIP_MEDIA_FORM_INSET_STYLE}>
                  <div className={SIP_PCM_FORM_STACK_CLASS}>
                    {SIP_MEDIA_FIELDS.map((field) => {
                      if (field.conditional) {
                        const condVal = formData[field.conditional];
                        if (field.conditionalValues) {
                          if (!field.conditionalValues.includes(condVal))
                            return null;
                        } else if (field.conditionalValue) {
                          if (condVal !== field.conditionalValue) return null;
                        }
                      }

                      return (
                        <div
                          key={field.name}
                          className={SIP_PCM_FORM_ROW_CLASS}
                        >
                          <label style={sipPcmFormLabelStyle}>
                            {field.label}
                          </label>
                          <div style={sipPcmFormControlWrapStyle}>
                            {field.type === "select" ? (
                              <Select
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleInputChange}
                                variant="outlined"
                                fullWidth
                                sx={sipPcmAuthMuiSelectSx}
                              >
                                {field.options.map((option) => (
                                  <MenuItem
                                    key={option.value}
                                    value={option.value}
                                    sx={{ fontSize: 12 }}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            ) : (
                              <input
                                type="text"
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleInputChange}
                                style={sipPcmAuthInputStyle}
                                {...sipPcmAuthInputInteraction}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <SipPcmSectionHeading title="CODEC Settings" />

                <div style={SIP_MEDIA_FORM_INSET_STYLE}>
                  <div className={SIP_PCM_FORM_ROW_CLASS}>
                    <label
                      style={{
                        ...sipPcmFormLabelStyle,
                        whiteSpace: "normal",
                        lineHeight: 1.4,
                      }}
                    >
                      Gateway Negotiation Coding Sequence:
                    </label>
                    <div style={sipPcmFormControlWrapStyle}>
                      <Select
                        name={SIP_MEDIA_CODEC_FIELD.name}
                        value={formData[SIP_MEDIA_CODEC_FIELD.name]}
                        onChange={handleInputChange}
                        variant="outlined"
                        fullWidth
                        sx={sipPcmAuthMuiSelectSx}
                      >
                        {SIP_MEDIA_CODEC_FIELD.options.map((option) => (
                          <MenuItem
                            key={option.value}
                            value={option.value}
                            sx={{ fontSize: 12 }}
                          >
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!loading && (
            <div style={sipPcmAuthFormFooterStyle}>
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={loading || saving}
                style={sipPcmAuthFormBtnStyle}
              >
                {saving ? (
                  <>
                    <CircularProgress size={14} color="inherit" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleReset}
                style={sipPcmAuthFormBtnStyle}
              >
                Reset
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SipMediaPage;
