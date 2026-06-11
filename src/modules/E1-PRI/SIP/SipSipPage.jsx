import React, { useEffect, useMemo, useState } from "react";
import {
  SIP_SETTINGS_FIELDS,
  SIP_SETTINGS_NOTE,
} from "../../../constants/SipSipConstants";
import { Select, MenuItem, FormControl, Checkbox } from "@mui/material";
import { listSipSettings, updateSipSettings } from "../../../api/apiService";
import { Alert, CircularProgress } from "@mui/material";


// ── Local page UI (inlined from e1PriSharedUi) ──
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


const SIP_PCM_FORM_BODY_CLASS = "w-full px-5 pt-3 pb-0";
const SIP_PCM_FORM_FIELDS_WRAPPER_CLASS = "flex-1 py-4 px-16";

const getSipPcmFormLabelStyle = (fieldKey) => ({
  ...sipPcmFormLabelStyle,
  width: fieldKey === "externalBound" ? 380 : 320,
  whiteSpace: fieldKey === "externalBound" ? "normal" : "nowrap",
});

const sipPcmCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const sipPcmNativeCheckboxStyle = {
  width: 16,
  height: 16,
  accentColor: "#0284c7",
  cursor: "pointer",
};

const sipPcmNoteStyle = {
  color: C.amber,
  textAlign: "center",
  marginTop: 24,
  fontSize: 13,
  lineHeight: 1.45,
};


const getInitialState = () => {
  const state = {};
  SIP_SETTINGS_FIELDS.forEach((f) => {
    if (f.type === "select") {
      if (f.key === "sipWan") {
        state[f.key] = "1";
      } else {
        state[f.key] = f.options[0];
      }
    } else if (f.type === "checkbox") {
      state[f.key] = f.default || false;
    } else if (f.type === "radio") {
      state[f.key] = f.options[0];
    } else {
      state[f.key] = f.default || "";
    }
  });
  return state;
};

const SipSipPage = () => {
  const [form, setForm] = useState(getInitialState());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Map UI keys to API keys
  const uiToApiKeyMap = useMemo(
    () => ({
      sipWan: "sip_address_of_wan",
      sipPort: "sip_signaling_port",
      tls: "tls_enable",
      externalBound: "match_external_address",
      send180: "send_180_before_sending_183",
      send183: "send_183_message",
      calledPrefix: "called_number_prefix_for_180_reply",
      send100rel: "send_100rel",
      ipCallRoute: "ip_call_in_first_route",
      softSwitch: "soft_switch_connected",
      hideCallerId: "hide_caller_id",
      obtainCallerId: "obtain_caller_id_from",
      obtainCalleeId: "obtain_callee_id_from",
      sendCalleeId: "send_callee_id_from",
      assertedId: "asserted_identity_mode",
      prackSend: "prack_send_mode",
      displayName: "display_name",
      userName: "user_name",
      sipAddress: "sip_address",
      diversionField: "send_obtain_redirect_ori_callee_id_from_diversion_field",
      natTraversal: "nat_traversal",
      relMessage: "set_redirection_param_of_rel_msg_when_recv_refer_msg",
      rtpSelf: "rtp_self_adaption",
      rport: "rport",
      filterFake: "filter_out_fake_calls",
      autoReply: "auto_reply_of_source_addr",
      audioSelection: "multiple_audio_selection",
      responseVia: "send_response_by_former_via",
      registrationSettings: "registration_related_settings",
      callerOverClock: "caller_over_clocking_ip_out",
      ethResource: "eth_resource",
      sipAccountNumbers: "sip_account_numbers",
      sipAccountInterval: "sip_account_registration_interval_ms",
      dscp: "dscp",
      callsFromTrunkOnly: "calls_from_sip_trunk_address_only",
      matchCallCount:
        "match_call_count_to_sip_trunk_based_on_source_address_of_invite",
      switchSignalPort: "switch_signal_port_if_sip_reg_failed",
      hangupTimeout: "hangup_upon_call_timeout",
      workingPeriod: "working_period_24_hour",
      sessionTimer: "session_timer",
      mediaStream: "media_stream_processing",
      sipTrunkHeart: "sip_trunk_heart",
      earlyMedia: "early_media",
      earlySession: "early_session",
      support100rel: "support_100rel",
      notWaitAck: "not_wait_ack_after_sending_200_ok",
      matchTrunkPort: "match_sip_trunk_port",
      regMsgPercent: "the_per_of_reg_msg_sending_cycle_to_period_of_validity",
      maxWaitAnswer: "max_wait_answer_time",
      maxWaitRtp: "max_wait_rtp_time",
      maxWaitPstn: "max_wait_pstn_res_time",
      switchNetPort: "switch_net_port_by_packet_loss_rate",
      addContactTo: "add_content_to_field_in_invite_msg",
      userAgent: "user_agent_field",
    }),
    [],
  );

  const apiToUiKeyMap = useMemo(() => {
    const reversed = {};
    Object.entries(uiToApiKeyMap).forEach(([ui, api]) => {
      reversed[api] = ui;
    });
    return reversed;
  }, [uiToApiKeyMap]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await listSipSettings();
        const settings = res?.message?.sip_settings?.[0] || {};
        const next = { ...getInitialState() };
        Object.entries(settings).forEach(([apiKey, value]) => {
          const uiKey = apiToUiKeyMap[apiKey];
          if (!uiKey) return;
          const fieldDef = SIP_SETTINGS_FIELDS.find((f) => f.key === uiKey);
          if (!fieldDef) return;
          if (fieldDef.type === "checkbox") {
            next[uiKey] = value === "1";
          } else if (
            fieldDef.type === "radio" ||
            fieldDef.type === "select" ||
            fieldDef.type === "text"
          ) {
            next[uiKey] = value ?? next[uiKey];
          }
        });
        setForm(next);
      } catch (e) {
        console.error("Failed to fetch SIP settings:", e);
        showMessage("error", "Failed to load SIP settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [apiToUiKeyMap]);

  const handleChange = (key, value) => {
    const fieldDef = SIP_SETTINGS_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (value === "" || /^\d+$/.test(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const settingsPayload = { id: 1 };
      Object.entries(uiToApiKeyMap).forEach(([uiKey, apiKey]) => {
        const fieldDef = SIP_SETTINGS_FIELDS.find((f) => f.key === uiKey);
        if (!fieldDef) return;
        const uiVal = form[uiKey];
        if (fieldDef.type === "checkbox") {
          settingsPayload[apiKey] = uiVal ? "1" : null;
        } else {
          settingsPayload[apiKey] = uiVal ?? null;
        }
      });
      const res = await updateSipSettings(settingsPayload);
      alert(res?.message || "Settings Updated");
    } catch (e) {
      console.error("Failed to save SIP settings:", e);
      alert(e?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(getInitialState());
  };

  return (
    <div style={sipPcmFormPageWrapStyle}>
      <div style={sipPcmFormPageInnerStyle}>
        {message.text && !saving && (
          <Alert
            severity={
              message.type === "error"
                ? "error"
                : message.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
        )}

        {saving && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div
              className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center gap-4 pointer-events-auto"
              style={{ minWidth: "300px" }}
            >
              <CircularProgress size={50} sx={{ color: C.accent }} />
              <div className="text-lg font-medium text-gray-700">
                Applying Settings...
              </div>
            </div>
          </div>
        )}

        <SipPcmBreadcrumb current="SIP Settings" />

        <div style={sipPcmFormCardStyle}>
          <div style={sipPcmFormHeaderStyle}>
            <span>SIP Settings</span>
          </div>

          <div className={SIP_PCM_FORM_BODY_CLASS}>
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px] w-full">
                <div className="text-center">
                  <CircularProgress size={40} sx={{ color: C.accent }} />
                  <div className="mt-3 text-gray-600">
                    Loading SIP settings...
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={SIP_PCM_FORM_FIELDS_WRAPPER_CLASS}
                style={{ marginBottom: 12 }}
              >
                <div className={SIP_PCM_FORM_STACK_CLASS}>
                  {SIP_SETTINGS_FIELDS.map((field) => {
                    if (field.conditional) {
                      if (field.conditionalValues) {
                        if (
                          !field.conditionalValues.includes(
                            form[field.conditional],
                          )
                        ) {
                          return null;
                        }
                      } else if (field.conditionalValue) {
                        if (
                          form[field.conditional] !== field.conditionalValue
                        ) {
                          return null;
                        }
                      } else {
                        if (field.conditionalInverted) {
                          if (form[field.conditional]) return null;
                        } else {
                          if (field.type === "radio") {
                            if (form[field.conditional] !== "Yes") return null;
                          } else {
                            if (!form[field.conditional]) return null;
                          }
                        }
                      }
                    }

                    return (
                      <div key={field.key} className={SIP_PCM_FORM_ROW_CLASS}>
                        <label style={getSipPcmFormLabelStyle(field.key)}>
                          {field.key === "externalBound"
                            ? "When the externally bound is enabled, only the externally bound address is matched to confirm the SIP trunk"
                            : field.label}
                        </label>

                        <div style={sipPcmFormControlWrapStyle}>
                          {field.type === "text" && (
                            <input
                              type={
                                field.key === "calledPrefix" ? "text" : "number"
                              }
                              value={form[field.key]}
                              style={sipPcmAuthInputStyle}
                              {...sipPcmAuthInputInteraction}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (field.key === "calledPrefix") {
                                  if (
                                    /^[0-9:]*$/.test(value) &&
                                    value.split(":").length <= 6
                                  ) {
                                    handleChange(field.key, value);
                                  }
                                } else if (
                                  /^\d*$/.test(value) ||
                                  value === ""
                                ) {
                                  handleChange(field.key, value);
                                }
                              }}
                              placeholder={
                                field.key === "calledPrefix"
                                  ? "e.g., 123:456:789"
                                  : ""
                              }
                            />
                          )}

                          {field.type === "select" && (
                            <FormControl size="small" fullWidth>
                              <Select
                                value={form[field.key]}
                                onChange={(e) =>
                                  handleChange(field.key, e.target.value)
                                }
                                variant="outlined"
                                fullWidth
                                sx={sipPcmAuthMuiSelectSx}
                              >
                                {field.options.map((opt) => (
                                  <MenuItem key={opt} value={opt}>
                                    {opt}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}

                          {field.type === "checkbox" && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                minHeight: 36,
                                gap: 8,
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={!!form[field.key]}
                                onChange={() => handleCheckbox(field.key)}
                                sx={sipPcmCheckboxSx}
                              />
                              {field.key === "workingPeriod" ? (
                                field.labelAfter && (
                                  <span
                                    style={{ fontSize: 13, color: C.labelText }}
                                  >
                                    {field.labelAfter}
                                  </span>
                                )
                              ) : (
                                <>
                                  <span
                                    style={{ fontSize: 13, color: C.labelText }}
                                  >
                                    Enable
                                  </span>
                                  {field.labelAfter && (
                                    <span
                                      style={{
                                        fontSize: 13,
                                        color: C.labelText,
                                      }}
                                    >
                                      {field.labelAfter}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          )}

                          {field.type === "radio" && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                minHeight: 36,
                                gap: 16,
                                fontSize: 13,
                                color: C.labelText,
                              }}
                            >
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  cursor: "pointer",
                                }}
                              >
                                <input
                                  type="radio"
                                  name={field.key}
                                  value="Yes"
                                  checked={form[field.key] === "Yes"}
                                  onChange={() =>
                                    handleChange(field.key, "Yes")
                                  }
                                  style={sipPcmNativeCheckboxStyle}
                                />
                                Yes
                              </label>
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  cursor: "pointer",
                                }}
                              >
                                <input
                                  type="radio"
                                  name={field.key}
                                  value="No"
                                  checked={form[field.key] === "No"}
                                  onChange={() => handleChange(field.key, "No")}
                                  style={sipPcmNativeCheckboxStyle}
                                />
                                No
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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

        <div style={sipPcmNoteStyle}>{SIP_SETTINGS_NOTE}</div>
      </div>
    </div>
  );
};
export default SipSipPage;
