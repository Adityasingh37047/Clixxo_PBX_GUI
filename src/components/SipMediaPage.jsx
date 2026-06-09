import React, { useEffect, useMemo, useState } from "react";
import {
  SIP_MEDIA_FIELDS,
  SIP_MEDIA_CODEC_FIELD,
  SIP_MEDIA_INITIAL_FORM,
} from "../constants/SipMediaconstants";
import {
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { listMediaSettings, updateMediaSettings } from "../api/apiService";

// ── Design System ─────────────────────────────────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  errorRed: "#dc2626",
};

const SectionHeading = ({ title }) => (
  <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: "#fff",
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: C.mutedText,
      }}
    >
      {title}
    </span>
  </div>
);

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
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
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

        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: C.mutedText, marginBottom: 12 }}>
          PBX &rsaquo; SIP &rsaquo;{" "}
          <span style={{ color: C.valueText, fontWeight: 600 }}>
            Media Parameters
          </span>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ padding: "24px 28px" }}>
            <SectionHeading title="Media Parameters" />

            <div style={{ padding: "24px 32px" }}>
              {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <CircularProgress size={40} sx={{ color: "#0e8fd6" }} />
                    <div className="mt-3 text-gray-600">
                      Loading media parameters...
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 py-4 px-16">
                  <div className="space-y-4">
                    {/* Regular Media Fields */}
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
                          className="flex items-center justify-between"
                        >
                          <label
                            className="text-sm text-gray-600 font-medium text-left whitespace-nowrap"
                            style={{
                              width: "320px",
                              marginRight: "10px",
                              lineHeight: "1.4",
                            }}
                          >
                            {field.label}
                          </label>
                          <div style={{ width: "200px" }}>
                            {field.type === "select" ? (
                              <Select
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleInputChange}
                                variant="outlined"
                                style={{ width: "200px", height: "28px" }}
                                sx={{
                                  fontSize: 13,
                                  height: 28,
                                  backgroundColor: "#ffffff",
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#999999",
                                  },
                                  "& .MuiSelect-select": {
                                    padding: "4px 10px",
                                    lineHeight: "18px",
                                    backgroundColor: "transparent",
                                    fontSize: "13px",
                                  },
                                }}
                              >
                                {field.options.map((option) => (
                                  <MenuItem
                                    key={option.value}
                                    value={option.value}
                                    sx={{ fontSize: 13 }}
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
                                className="border border-gray-400 bg-white"
                                style={{
                                  width: "200px",
                                  height: "28px",
                                  padding: "4px 10px",
                                  fontSize: "13px",
                                  borderRadius: "4px",
                                  outline: "none",
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <SectionHeading title="CODEC Settings" />

                    <div className="flex items-center justify-between">
                      <label
                        className="text-sm text-gray-600 font-medium text-left whitespace-nowrap"
                        style={{
                          width: "320px",
                          marginRight: "10px",
                          lineHeight: "1.4",
                        }}
                      >
                        Gateway Negotiation Coding Sequence:
                      </label>
                      <div style={{ width: "200px" }}>
                        <Select
                          name={SIP_MEDIA_CODEC_FIELD.name}
                          value={formData[SIP_MEDIA_CODEC_FIELD.name]}
                          onChange={handleInputChange}
                          variant="outlined"
                          style={{ width: "200px", height: "28px" }}
                          sx={{
                            fontSize: 13,
                            height: 28,
                            backgroundColor: "#ffffff",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#999999",
                            },
                            "& .MuiSelect-select": {
                              padding: "4px 10px",
                              lineHeight: "18px",
                              backgroundColor: "transparent",
                              fontSize: "13px",
                            },
                          }}
                        >
                          {SIP_MEDIA_CODEC_FIELD.options.map((option) => (
                            <MenuItem
                              key={option.value}
                              value={option.value}
                              sx={{ fontSize: 13 }}
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
          </div>

          {/* Bottom Actions Footer */}
          {!loading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                padding: "16px 24px",
                borderTop: `1px solid ${C.cardBorder}`,
                background: "#f8fafc",
              }}
            >
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading || saving}
                startIcon={
                  saving && <CircularProgress size={16} color="inherit" />
                }
                sx={{
                  background: "#1e2d42",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 13,
                  textTransform: "none",
                  padding: "6px 32px",
                  minWidth: 120,
                  "&:hover": { background: "#0f172a" },
                }}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{
                  color: "#1e293b",
                  borderColor: "#9ca3af",
                  fontWeight: 600,
                  fontSize: 13,
                  textTransform: "none",
                  padding: "6px 32px",
                  minWidth: 100,
                  "&:hover": { borderColor: "#1e293b", background: "#f1f5f9" },
                }}
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SipMediaPage;
