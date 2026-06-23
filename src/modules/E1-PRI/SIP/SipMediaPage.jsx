import React, { useEffect, useMemo, useState } from "react";
import {
  SIP_MEDIA_FIELDS,
  SIP_MEDIA_CODEC_FIELD,
  SIP_MEDIA_INITIAL_FORM,
} from "../../../constants/SipMediaconstants";
import { Select, MenuItem, CircularProgress, Alert } from "@mui/material";
import {
  listMediaSettings,
  updateMediaSettings,
} from "../../../api/apiService";

// ── Local page UI (inlined from e1PriSharedUi)
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  strongText: "var(--text-primary)",
  accent: "var(--accent-brand)",
  amber: "#dc2626",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  danger: `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`,
};

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {children}
  </button>
);

const E1_PAGE = "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px]";
const E1_INNER = "w-full max-w-full mx-auto";
const E1_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const E1_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-t-[20px]";
const E1_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const E1_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const E1_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#eff6ff] px-[12px] py-[5px] text-[11px] font-bold text-[var(--text-label)]";
const E1_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-b-[20px]";
const E1_PAGE_BADGE =
  "rounded-[6px] border border-[var(--border-strong)] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[var(--text-label)]";
const E1_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const modalInputProps = {
  style: { fontSize: 13, height: 32, padding: "0 8px", boxSizing: "border-box" },
};

const e1DialogTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const e1DialogContentStyle = { padding: "24px", backgroundColor: "var(--bg-surface)" };

const e1DialogFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "var(--row-alt)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: 20,
};

const e1DialogFieldRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
};

const e1DialogFieldLabelStyle = {
  fontSize: 13,
  color: "var(--text-primary)",
  fontWeight: 600,
  whiteSpace: "nowrap",
  width: 170,
  lineHeight: 1.2,
  textAlign: "left",
};

const e1DialogFieldControlStyle = { width: "min(100%, 320px)" };

const e1DialogActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: "var(--row-alt)",
  borderTop: "1px solid #9CA3AF",
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const e1DialogPaperSx = {
  width: 600,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const E1Breadcrumb = ({ section, current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>E1-PRI</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

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
      color: "var(--text-muted)",
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
    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{current}</span>
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
  background: "var(--bg-surface)",
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
  backgroundColor: "var(--bg-surface)",
  outline: "none",
  color: "var(--text-primary)",
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
    backgroundColor: "var(--bg-surface)",
    "& fieldset": { borderColor: OUTLINED_BORDER, transition: "border-color 0.2s ease" },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
    "&.Mui-focused:hover fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "var(--bg-surface)",
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
  backgroundColor: "var(--bg-surface)",
  borderRadius: "6px",
  "& .MuiOutlinedInput-root": {
    height: SIP_PCM_FORM_FIELD_HEIGHT,
    minHeight: SIP_PCM_FORM_FIELD_HEIGHT,
    backgroundColor: "var(--bg-surface)",
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
        color: "var(--text-primary)",
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
                  <div className="mt-3 text-[var(--text-secondary)]">
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
