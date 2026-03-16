import React, { useEffect, useMemo, useState } from 'react';
import { SIP_MEDIA_FIELDS, SIP_MEDIA_CODEC_FIELD, SIP_MEDIA_INITIAL_FORM } from '../constants/SipMediaconstants';
import { Select, MenuItem, Button, CircularProgress } from '@mui/material';
import { listMediaSettings, updateMediaSettings } from '../api/apiService';

const SipMediaPage = () => {
  const [formData, setFormData] = useState(SIP_MEDIA_INITIAL_FORM);
  const [loading, setLoading] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Map UI names to API keys
  const uiToApi = useMemo(() => ({
    dtmfTransmitMode: 'dtmf_transmit_mode',
    rfc2833Payload: 'rfc2833_payload',
    rtpPortRange: 'rtp_port_range',
    silenceSuppression: 'slience_suppression',
    noiseReduction: 'noise_reduction',
    comfortNoise: 'comfort_noise_generation',
    jitterMode: 'jitter_mode',
    jitterBuffer: 'jitter_buffer_ms',
    jitterUnderrunLead: 'jitter_under_run_lead_ms',
    jitterOverrunLead: 'jitter_over_run_lead_ms',
    ipOutputLevelControl: 'ip_side_output_level_control_mode',
    voiceGainOutput: 'voice_gain_output_from_ip_db',
    packTimeDefault: 'pack_time_when_nego_fail_default_value',
    codecSetting: 'codec_seq_setting',
  }), []);

  const apiToUi = useMemo(() => {
    const r = {};
    Object.entries(uiToApi).forEach(([u,a]) => { r[a] = u; });
    return r;
  }, [uiToApi]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await listMediaSettings();
        const settings = res?.message?.sip_settings?.[0] || {};
        const next = { ...SIP_MEDIA_INITIAL_FORM };
        Object.entries(settings).forEach(([k,v]) => {
          const uiKey = apiToUi[k];
          if (!uiKey) return;
          next[uiKey] = v ?? next[uiKey];
        });
        setFormData(next);
      } catch (e) {
        console.error('Failed to fetch media settings:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiToUi]);

  const handleSave = async () => {
    try {
      const payload = { id: 1 };
      Object.entries(uiToApi).forEach(([u,a]) => { payload[a] = formData[u] ?? null; });
      const res = await updateMediaSettings(payload);
      alert(res?.message || 'Settings Updated!');
    } catch (e) {
      console.error('Failed to save media settings:', e);
      alert(e?.message || 'Save failed');
    }
  };

  const handleReset = () => {
    setFormData(SIP_MEDIA_INITIAL_FORM);
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-150px)] py-0 flex flex-col items-center" style={{ backgroundColor: "#dde0e4" }}>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-xl text-gray-700 shadow mb-0">
          Media Parameters
        </div>

        {/* Content */}
        <div className="border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{ backgroundColor: "#dde0e4" }}>
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px] bg-white">
              <div className="text-center">
                <CircularProgress size={40} sx={{ color: '#0e8fd6' }} />
                <div className="mt-3 text-gray-600">Loading media parameters...</div>
              </div>
            </div>
          ) : (
            <div className="flex-1 py-4 px-16">
            <div className="space-y-3">
              {/* Regular Media Fields */}
              {SIP_MEDIA_FIELDS.map((field) => {
                // Skip conditional fields if their condition is not met
                if (field.conditional) {
                  if (field.conditionalValues) {
                    // Check for multiple possible values (e.g., dtmfTransmitMode === 'RFC2833' || 'RFC2833+SingAling')
                    if (!field.conditionalValues.includes(formData[field.conditional])) {
                      return null;
                    }
                  } else if (field.conditionalValue) {
                    // Check for specific value condition
                    if (formData[field.conditional] !== field.conditionalValue) {
                      return null;
                    }
                  }
                }
                
                return (
                <div key={field.name} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 font-medium whitespace-nowrap" style={{ width: '320px', marginRight: '20px' }}>
                    {field.label}:
                  </label>

                  {field.type === 'select' ? (
                    <Select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                      style={{ width: '200px', height: '28px' }}
                      sx={{
                        fontSize: 13,
                        height: 28,
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#999999',
                        },
                        '& .MuiSelect-select': {
                          padding: '4px 10px',
                          lineHeight: '18px',
                          backgroundColor: 'transparent',
                          fontSize: '13px'
                        },
                      }}
                    >
                      {field.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <input
                      type="text"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      style={{
                        width: '200px',
                        height: '28px',
                        padding: '4px 10px',
                        border: '1px solid #999999',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  )}
                </div>
                );
              })}

              {/* CODEC Setting Section */}
              <div className="pt-2">
                <div className="text-sm text-gray-700 font-medium mb-3">CODEC Setting</div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 font-medium whitespace-nowrap" style={{ width: '320px', marginRight: '20px' }}>
                    Gateway Negotiation Coding Sequence:
                  </label>
                  <Select
                    name={SIP_MEDIA_CODEC_FIELD.name}
                    value={formData[SIP_MEDIA_CODEC_FIELD.name]}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    style={{ width: '200px', height: '28px' }}
                    sx={{
                      fontSize: 13,
                      height: 28,
                      backgroundColor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#999999',
                      },
                      '& .MuiSelect-select': {
                        padding: '4px 10px',
                        lineHeight: '18px',
                        backgroundColor: 'transparent',
                        fontSize: '13px'
                      },
                    }}
                  >
                    {SIP_MEDIA_CODEC_FIELD.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-8 mt-6">
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '18px',
              borderRadius: 2,
              minWidth: 140,
              minHeight: 48,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                color: '#fff',
              },
            }}
          >Save</Button>
          <Button
            variant="contained"
            onClick={handleReset}
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '18px',
              borderRadius: 2,
              minWidth: 140,
              minHeight: 48,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                color: '#fff',
              },
            }}
          >Reset</Button>
        </div>
      </div>
    </div>
  );
};

export default SipMediaPage;
