import React, { useEffect, useMemo, useState } from "react";
import {
  SIP_SETTINGS_FIELDS,
  SIP_SETTINGS_NOTE,
  SIP_SETTINGS_FIELD_TOOLTIPS,
} from "../../../constants/SipSipConstants";
import { Checkbox, Tooltip } from "@mui/material";
import { listSipSettings, updateSipSettings } from "../../../api/apiService";
import { Alert, CircularProgress } from "@mui/material";

// ── Page-local field label tooltip UI (matches FxsVoipMediaPage pattern) ──
const FIELD_LABEL_COLOR = "#374151";

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
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const SipFieldRow = ({ label, tooltipKey, children, labelStyle = {} }) => {
  const tooltip = tooltipKey ? SIP_SETTINGS_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        flex: "1 1 auto",
        minWidth: 0,
        paddingRight: 16,
        textAlign: "left",
        lineHeight: 1.4,
        cursor: tooltip ? "help" : undefined,
        ...labelStyle,
      }}
    >
      {label}
    </label>
  );

  return (
    <div
      className="flex flex-row items-center w-full"
      style={{ minHeight: 34 }}
    >
      {tooltip ? (
        <Tooltip
          title={formatFieldTooltipTitle(tooltip)}
          {...FIELD_TOOLTIP_PROPS}
        >
          {labelNode}
        </Tooltip>
      ) : (
        labelNode
      )}
      {children}
    </div>
  );
};

// ── Local page UI (matches FxsVoipMediaPage design language) ──
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 20px rgba(0, 0, 0, 0.25), 0 0 8px rgba(0, 0, 0, 0.15)",
  divider: "#e2e6ec",
  labelText: "#374151",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

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
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

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
        padding:
          variant === "primary" || variant === "cancel"
            ? "8px 32px"
            : "6px 14px",
        borderRadius: 8,
        fontSize: variant === "primary" || variant === "cancel" ? 14 : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: variant === "primary" || variant === "cancel" ? 38 : 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {children}
    </Component>
  );
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";

const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;

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
  el.style.boxShadow = FOCUS_RING_SHADOW();
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

const nativeFieldInputStyle = {
  height: 32,
  width: "100%",
  maxWidth: 220,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeFieldSelectStyle = {
  width: "100%",
  maxWidth: 220,
  minHeight: 32,
  height: 32,
  padding: "4px 28px 4px 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  appearance: "auto",
  cursor: "pointer",
};

const SIP_COLUMN_SPLIT_INDEX = Math.ceil(SIP_SETTINGS_FIELDS.length / 2);
const SIP_LEFT_COLUMN_FIELDS = SIP_SETTINGS_FIELDS.slice(0, SIP_COLUMN_SPLIT_INDEX);
const SIP_RIGHT_COLUMN_FIELDS = SIP_SETTINGS_FIELDS.slice(SIP_COLUMN_SPLIT_INDEX);

const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: "8px 28px 16px",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

const advancedCardShellStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: "6px",
  boxSizing: "border-box",
};

const advancedTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
};

const advancedFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const dashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
};

const dashboardColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: "16px 36px 24px",
  background: C.cardBg,
};

const dashboardDividerStyle = {
  background: C.divider,
  width: 1,
  alignSelf: "stretch",
  margin: "14px 0",
  flexShrink: 0,
};

const dashboardSectionTitleStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: C.strongText,
  marginBottom: 2,
  flexShrink: 0,
};

const dashboardFieldsStackStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: 10,
};

const pageTitleStyle = {
  fontSize: 22,
  fontWeight: 700,
  color: C.strongText,
  margin: "0 0 6px 0",
  letterSpacing: "-0.02em",
  flexShrink: 0,
};

const SipPcmBreadcrumb = ({ current }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 12,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      flexShrink: 0,
    }}
  >
    <span>E1-PRI</span>
    <span>&gt;</span>
    <span>SIP</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const AdvancedPageShell = ({ children }) => (
  <div style={advancedPageWrapStyle} data-native-scroll>
    <div style={advancedPageInnerStyle}>{children}</div>
  </div>
);

const valueColStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
};

const controlSlotStyle = {
  width: 220,
  maxWidth: "100%",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
};

const fieldInputStyle = {
  ...nativeFieldInputStyle,
  width: "100%",
};

const fieldSelectStyle = {
  ...nativeFieldSelectStyle,
  width: "100%",
};

const checkboxSx = {
  padding: "2px",
  color: OUTLINED_BORDER,
  "&.Mui-checked": { color: OUTLINED_FOCUS },
  "&.MuiCheckbox-indeterminate": { color: OUTLINED_FOCUS },
};

const nativeRadioStyle = {
  width: 16,
  height: 16,
  accentColor: OUTLINED_FOCUS,
  cursor: "pointer",
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

  const isFieldVisible = (field) => {
    if (!field.conditional) return true;
    if (field.conditionalValues) {
      return field.conditionalValues.includes(form[field.conditional]);
    }
    if (field.conditionalValue) {
      return form[field.conditional] === field.conditionalValue;
    }
    if (field.conditionalInverted) {
      return !form[field.conditional];
    }
    if (field.type === "radio") {
      return form[field.conditional] === "Yes";
    }
    return !!form[field.conditional];
  };

  const renderFormField = (field) => {
    if (!isFieldVisible(field)) return null;

    const fieldLabel =
      field.key === "externalBound"
        ? "When the externally bound is enabled, only the externally bound address is matched to confirm the SIP trunk"
        : field.label;

    return (
      <SipFieldRow
        key={field.key}
        label={fieldLabel}
        tooltipKey={field.key}
        labelStyle={
          field.key === "externalBound" ? { whiteSpace: "normal" } : {}
        }
      >
        <div style={valueColStyle}>
          <div style={controlSlotStyle}>
            {field.type === "text" && (
              <input
                type={field.key === "calledPrefix" ? "text" : "number"}
                value={form[field.key]}
                style={fieldInputStyle}
                {...nativeFieldInteraction}
                onChange={(e) => {
                  const value = e.target.value;
                  if (field.key === "calledPrefix") {
                    if (
                      /^[0-9:]*$/.test(value) &&
                      value.split(":").length <= 6
                    ) {
                      handleChange(field.key, value);
                    }
                  } else if (/^\d*$/.test(value) || value === "") {
                    handleChange(field.key, value);
                  }
                }}
                placeholder={
                  field.key === "calledPrefix" ? "e.g., 123:456:789" : ""
                }
              />
            )}

            {field.type === "select" && (
              <select
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                style={fieldSelectStyle}
                {...nativeFieldInteraction}
              >
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {field.type === "checkbox" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: 32,
                  gap: 8,
                  width: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <Checkbox
                  size="small"
                  checked={!!form[field.key]}
                  onChange={() => handleCheckbox(field.key)}
                  sx={checkboxSx}
                />
                {field.key === "workingPeriod" ? (
                  field.labelAfter && (
                    <span style={{ fontSize: 13, color: C.labelText }}>
                      {field.labelAfter}
                    </span>
                  )
                ) : (
                  <>
                    <span style={{ fontSize: 13, color: C.labelText }}>
                      Enable
                    </span>
                    {field.labelAfter && (
                      <span style={{ fontSize: 13, color: C.labelText }}>
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
                  minHeight: 32,
                  gap: 16,
                  fontSize: 13,
                  color: C.labelText,
                  width: "100%",
                  justifyContent: "flex-end",
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
                    onChange={() => handleChange(field.key, "Yes")}
                    style={nativeRadioStyle}
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
                    style={nativeRadioStyle}
                  />
                  No
                </label>
              </div>
            )}
          </div>
        </div>
      </SipFieldRow>
    );
  };

  return (
    <AdvancedPageShell>
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
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {message.text}
        </Alert>
      )}

      {saving && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className="bg-white rounded-lg flex flex-col items-center gap-4 pointer-events-auto"
            style={{
              minWidth: "300px",
              padding: "24px 32px",
              border: `1px solid ${C.cardBorder}`,
              boxShadow: C.cardShadow,
              borderRadius: CARD_RADIUS,
            }}
          >
            <CircularProgress size={50} sx={{ color: C.accent }} />
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: C.strongText,
              }}
            >
              Applying Settings...
            </div>
          </div>
        </div>
      )}

     
      <SipPcmBreadcrumb current="SIP Settings" />

      <div style={advancedCardShellStyle}>
        <div style={advancedTableContainerStyle}>
        {loading ? (
          <div
            className="flex items-center justify-center w-full"
            style={{ minHeight: 400, padding: "48px 32px" }}
          >
            <div className="text-center">
              <CircularProgress size={40} sx={{ color: C.accent }} />
              <div
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: C.mutedText,
                  fontWeight: 500,
                }}
              >
                Loading SIP settings...
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={dashboardGridStyle}>
              <div style={dashboardColumnStyle}>
                <div style={dashboardSectionTitleStyle}>
                  Network &amp; Signaling
                </div>
                <div style={dashboardFieldsStackStyle}>
                  {SIP_LEFT_COLUMN_FIELDS.map((field) => renderFormField(field))}
                </div>
              </div>

              <div style={dashboardDividerStyle} aria-hidden="true" />

              <div style={dashboardColumnStyle}>
                <div style={dashboardSectionTitleStyle}>
                  Registration &amp; Timers
                </div>
                <div style={dashboardFieldsStackStyle}>
                  {SIP_RIGHT_COLUMN_FIELDS.map((field) =>
                    renderFormField(field),
                  )}
                </div>

                {SIP_SETTINGS_NOTE && (
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.strongText,
                        marginBottom: 8,
                      }}
                    >
                      Note:
                    </div>
                    <p
                      style={{
                        margin: 0,
                       color: C.labelText,
                        fontSize: 12,
                        lineHeight: 1.5,
                        whiteSpace: "normal",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                        textAlign: "left",
                      }}
                    >
                      {SIP_SETTINGS_NOTE.replace(/^Note:\s*/i, "")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={advancedFormInlineFooterStyle}>
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={loading || saving}
                style={advancedFormBtnStyle}
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
                style={advancedFormBtnStyle}
              >
                Reset
              </Btn>
            </div>
          </>
        )}
        </div>
      </div>
    </AdvancedPageShell>
  );
};
export default SipSipPage;
