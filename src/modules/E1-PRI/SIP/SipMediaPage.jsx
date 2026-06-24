import React, { useEffect, useMemo, useState } from "react";
import {
  SIP_MEDIA_FIELDS,
  SIP_MEDIA_CODEC_FIELD,
  SIP_MEDIA_INITIAL_FORM,
  SIP_MEDIA_FIELD_TOOLTIPS,
} from "../../../constants/SipMediaConstants";
import { Select, MenuItem, CircularProgress, Alert, Tooltip } from "@mui/material";
import {
  listMediaSettings,
  updateMediaSettings,
} from "../../../api/apiService";

// ── Local page UI (inlined from e1PriSharedUi)
// ── Page-local field label tooltip UI (not shared) ──
const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const E1PriFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const Component = component || "button";
  return (
    <Component
      type={type}
      form={form}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </Component>
  );
};

const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const nativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const CARD_RADIUS = 10;

const pbxPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pbxPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const PbxBreadcrumb = ({ section, current, style }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "nowrap",
      whiteSpace: "nowrap",
      lineHeight: 1.5,
      ...style,
    }}
  >
    <span>E1-PRI</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const SipPcmBreadcrumb = ({ current }) => (
  <PbxBreadcrumb section="SIP" current={current} />
);

const sipPcmFormPageWrapStyle = {
  ...pbxPageWrapStyle,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const sipPcmFormPageInnerStyle = {
  ...pbxPageInnerStyle,
  maxWidth: 1000,
};

const sipPcmFormCardStyle = {
  background: "#ffffff",
  borderRadius: 10,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const sipPcmFormHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

const SIP_PCM_AUTH_FIELD_WIDTH = 200;
const SIP_PCM_FORM_FIELD_HEIGHT = 32;
const SIP_PCM_FORM_STACK_CLASS = "space-y-4";
const SIP_PCM_FORM_ROW_CLASS = "flex items-center justify-between";

const sipPcmFormLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  width: 320,
  marginRight: 10,
  lineHeight: 1.4,
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const sipPcmFormControlWrapStyle = {
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
  minHeight: SIP_PCM_FORM_FIELD_HEIGHT,
  flexShrink: 0,
};

const sipPcmAuthInputStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 12,
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
  height: SIP_PCM_FORM_FIELD_HEIGHT,
  minHeight: SIP_PCM_FORM_FIELD_HEIGHT,
  paddingLeft: 12,
  paddingRight: 12,
  lineHeight: `${SIP_PCM_FORM_FIELD_HEIGHT - 2}px`,
  textAlign: "left",
  backgroundColor: "#ffffff",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const sipPcmAuthInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onFocus(e);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onBlur(e);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseEnter(e);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseLeave(e);
  },
};

const muiSelectInnerSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": { borderColor: OUTLINED_BORDER, transition: "border-color 0.2s ease" },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
    "&.Mui-focused:hover fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  ...muiSelectInnerSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: OUTLINED_HOVER },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

const sipPcmAuthMuiSelectSx = {
  ...muiSelectSx,
  fontSize: 12,
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  "& .MuiOutlinedInput-root": {
    height: SIP_PCM_FORM_FIELD_HEIGHT,
    minHeight: SIP_PCM_FORM_FIELD_HEIGHT,
    backgroundColor: "#ffffff",
    transition: "border-color 0.2s ease",
    "& fieldset": { borderColor: OUTLINED_BORDER, transition: "border-color 0.2s ease" },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
    "&.Mui-focused:hover fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: OUTLINED_HOVER },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
  "& .MuiSelect-select": {
    padding: "0 32px 0 12px !important",
    fontSize: 12,
    lineHeight: `${SIP_PCM_FORM_FIELD_HEIGHT - 2}px`,
    height: "100%",
    minHeight: "unset !important",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },
};

const sipPcmAuthFormFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  padding: "10px 20px",
  borderTop: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

const sipPcmAuthFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const SipPcmSectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: "#30415A",
      }}
    >
      {title}
    </span>
  </div>
);


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
                          <E1PriFieldLabel
                            tooltipKey={field.name}
                            tooltips={SIP_MEDIA_FIELD_TOOLTIPS}
                            style={sipPcmFormLabelStyle}
                          >
                            {field.label}
                          </E1PriFieldLabel>
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
                    <E1PriFieldLabel
                      tooltipKey={SIP_MEDIA_CODEC_FIELD.name}
                      tooltips={SIP_MEDIA_FIELD_TOOLTIPS}
                      style={{
                        ...sipPcmFormLabelStyle,
                        whiteSpace: "normal",
                        lineHeight: 1.4,
                      }}
                    >
                      Gateway Negotiation Coding Sequence:
                    </E1PriFieldLabel>
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
