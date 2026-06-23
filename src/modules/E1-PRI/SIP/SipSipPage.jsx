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


const SIP_PCM_FORM_BODY_CLASS = "w-full px-5 pt-3 pb-0";
const SIP_PCM_FORM_FIELDS_WRAPPER_CLASS = "flex-1 py-4 px-16";

const getSipPcmFormLabelStyle = (fieldKey) => ({
  ...sipPcmFormLabelStyle,
  width: fieldKey === "externalBound" ? 380 : 320,
  whiteSpace: fieldKey === "externalBound" ? "normal" : "nowrap",
});

const sipPcmCheckboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
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
            sx={E1_TOAST_SX}
          >
            {message.text}
          </Alert>
        )}

        {saving && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div
              className="bg-[var(--bg-surface)] rounded-lg shadow-xl p-6 flex flex-col items-center gap-4 pointer-events-auto"
              style={{ minWidth: "300px" }}
            >
              <CircularProgress size={50} sx={{ color: C.accent }} />
              <div className="text-lg font-medium text-[var(--text-secondary)]">
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
                  <div className="mt-3 text-[var(--text-secondary)]">
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
