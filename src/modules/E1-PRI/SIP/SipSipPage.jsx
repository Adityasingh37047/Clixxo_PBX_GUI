import React, { useEffect, useMemo, useState } from "react";
import {
  SIP_SIP_FIELDS,
  SIP_SIP_NOTE,
  SIP_SIP_FIELD_TOOLTIPS,
  SIP_SIP_BREADCRUMB_ROOT,
  SIP_SIP_BREADCRUMB_SECTION,
  SIP_SIP_PAGE_TITLE,
  SIP_SIP_CARD_TITLE,
  SIP_SIP_SECTION_NETWORK,
  SIP_SIP_SECTION_REGISTRATION,
  SIP_SIP_NOTE_LABEL,
  SIP_SIP_BTN_SAVE,
  SIP_SIP_BTN_SAVING,
  SIP_SIP_BTN_RESET,
  SIP_SIP_LOADING_TEXT,
  SIP_SIP_APPLYING_TEXT,
  SIP_SIP_CHECKBOX_ENABLE,
  SIP_SIP_RADIO_YES,
  SIP_SIP_RADIO_NO,
  SIP_SIP_PLACEHOLDER_CALLED_PREFIX,
  SIP_SIP_ERR_LOAD_FAILED,
  SIP_SIP_MSG_SETTINGS_UPDATED,
  SIP_SIP_ERR_SAVE_FAILED,
  SIP_SIP_LABEL_EXTERNAL_BOUND,
} from "../../../constants/SipSipConstants";
import { Checkbox, Tooltip } from "@mui/material";
import { listSipSettings, updateSipSettings } from "../../../api/apiService";
import { Alert, CircularProgress, useMediaQuery } from "@mui/material";

const SIP_SIP_SECTION_HEADING_LEFT = -20;
const SIP_SIP_COMPACT_MQ = "(max-width: 768px)";
const SIP_SIP_SCROLL_CLASS = "sip-sip-scroll";

const SIP_SIP_TOOLTIP_PROPS = {
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

// ── Local page UI (matches FxsVoipMediaPage design language) ──
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  amber: "#dc2626",
  sectionHeading: "#30415A",
};

const CARD_RADIUS = 4;
const FIELD_RADIUS = 6;

const sipFormTextStyle = {
  fontSize: 13,
  color: C.labelText,
};

const SIP_COMPACT_MQ = SIP_SIP_COMPACT_MQ;

const SipFieldRow = ({
  label,
  tooltipKey,
  children,
  labelStyle = {},
  labelColWidth = SIP_SIP_LABEL_COL_WIDTH,
}) => {
  const tooltip = tooltipKey ? SIP_SIP_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        ...sipFormTextStyle,
        fontWeight: 600,
        flex: "0 0 auto",
        width: "100%",
        maxWidth: "100%",
        paddingRight: 0,
        textAlign: "left",
        lineHeight: 1.4,
        whiteSpace: "normal",
        overflowWrap: "break-word",
        wordBreak: "break-word",
        cursor: tooltip ? "help" : undefined,
        ...labelStyle,
      }}
    >
      {label}
    </label>
  );

  const labelWrapStyle = {
    flex: `0 0 ${labelColWidth}px`,
    width: labelColWidth,
    maxWidth: labelColWidth,
    minWidth: labelColWidth,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        minHeight: 36,
        gap: SIP_SIP_FIELD_COL_GAP,
      }}
    >
      <div style={labelWrapStyle}>
        {tooltip ? (
          <Tooltip
            title={formatFieldTooltipTitle(tooltip)}
            {...SIP_SIP_TOOLTIP_PROPS}
          >
            {labelNode}
          </Tooltip>
        ) : (
          labelNode
        )}
      </div>
      {children}
    </div>
  );
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
  color: C.labelText,
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
  color: C.labelText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  appearance: "auto",
  cursor: "pointer",
};

const SIP_SECTION_SPLIT_INDEX = Math.ceil(SIP_SIP_FIELDS.length / 2);
const SIP_NETWORK_SECTION_FIELDS = SIP_SIP_FIELDS.slice(
  0,
  SIP_SECTION_SPLIT_INDEX,
);
const SIP_REGISTRATION_SECTION_FIELDS = SIP_SIP_FIELDS.slice(
  SIP_SECTION_SPLIT_INDEX,
);

const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

const advancedCardShellStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: 0,
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
  justifyContent: "center",
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
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const SIP_FORM_PAD_X = 28;
const SIP_SIP_LABEL_COL_WIDTH = 200;
const SIP_SIP_CONTROL_COL_WIDTH = 220;
const SIP_SIP_FIELD_COL_GAP = 8;

const SIP_SIP_LAPTOP_NARROW_MQ = "(max-width: 1366px)";

const sipSipDashboardGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact
    ? "1fr"
    : "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
});

const sipSipColumnStyle = (isCompact) => ({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: isCompact
    ? `16px ${SIP_FORM_PAD_X}px 20px`
    : "16px 36px 20px",
  boxSizing: "border-box",
  background: C.cardBg,
});

const sipSipDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

const sipSipDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

const sipHeaderStyle = {
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
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const formBodyStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  background: C.cardBg,
  boxSizing: "border-box",
};

const SipSipSectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery(SIP_SIP_LAPTOP_NARROW_MQ);
  return (
  <div
    style={{
      margin: isFirst
        ? isLaptopNarrow
          ? "20px 0 24px 0"
          : "12px 0 24px 0"
        : "28px 0 24px 0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.divider}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : SIP_SIP_SECTION_HEADING_LEFT,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: C.sectionHeading,
      }}
    >
      {title}
    </span>
  </div>
  );
};

const dashboardFieldsStackStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: 12,
};

const sipSipFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const SipSipScrollbarStyles = () => (
  <style>{`
    .${SIP_SIP_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

const SipSipBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      flexShrink: 0,
      width: "100%",
    }}
  >
    <span>{SIP_SIP_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{SIP_SIP_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{SIP_SIP_PAGE_TITLE}</span>
  </div>
);

const AdvancedPageShell = ({ children, isCompact }) => (
  <div
    className={SIP_SIP_SCROLL_CLASS}
    style={{
      ...advancedPageWrapStyle,
      ...(isCompact ? { padding: 8 } : {}),
    }}
    data-native-scroll
  >
    <div style={advancedPageInnerStyle}>{children}</div>
  </div>
);

const valueColStyle = {
  flex: "1 1 auto",
  minWidth: SIP_SIP_CONTROL_COL_WIDTH,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  paddingTop: 2,
};

const controlSlotStyle = {
  width: SIP_SIP_CONTROL_COL_WIDTH,
  minWidth: SIP_SIP_CONTROL_COL_WIDTH,
  maxWidth: SIP_SIP_CONTROL_COL_WIDTH,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
};

const fieldInputStyle = {
  ...nativeFieldInputStyle,
  width: SIP_SIP_CONTROL_COL_WIDTH,
  minWidth: SIP_SIP_CONTROL_COL_WIDTH,
  maxWidth: SIP_SIP_CONTROL_COL_WIDTH,
};

const fieldSelectStyle = {
  ...nativeFieldSelectStyle,
  width: SIP_SIP_CONTROL_COL_WIDTH,
  minWidth: SIP_SIP_CONTROL_COL_WIDTH,
  maxWidth: SIP_SIP_CONTROL_COL_WIDTH,
};

const checkboxSx = {
  padding: "2px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const nativeRadioStyle = {
  width: 16,
  height: 16,
  accentColor: OUTLINED_FOCUS,
  cursor: "pointer",
};

const getInitialState = () => {
  const state = {};
  SIP_SIP_FIELDS.forEach((f) => {
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
  const isCompact = useMediaQuery(SIP_COMPACT_MQ);
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
          const fieldDef = SIP_SIP_FIELDS.find((f) => f.key === uiKey);
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
        showMessage("error", SIP_SIP_ERR_LOAD_FAILED);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [apiToUiKeyMap]);

  const handleChange = (key, value) => {
    const fieldDef = SIP_SIP_FIELDS.find((f) => f.key === key);
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
        const fieldDef = SIP_SIP_FIELDS.find((f) => f.key === uiKey);
        if (!fieldDef) return;
        const uiVal = form[uiKey];
        if (fieldDef.type === "checkbox") {
          settingsPayload[apiKey] = uiVal ? "1" : null;
        } else {
          settingsPayload[apiKey] = uiVal ?? null;
        }
      });
      const res = await updateSipSettings(settingsPayload);
      showMessage("success", res?.message || SIP_SIP_MSG_SETTINGS_UPDATED);
    } catch (e) {
      console.error("Failed to save SIP settings:", e);
      showMessage("error", e?.message || SIP_SIP_ERR_SAVE_FAILED);
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
        ? SIP_SIP_LABEL_EXTERNAL_BOUND
        : field.label;

    const labelColWidth = isCompact ? 160 : SIP_SIP_LABEL_COL_WIDTH;

    return (
      <SipFieldRow
        key={field.key}
        label={fieldLabel}
        tooltipKey={field.key}
        labelColWidth={labelColWidth}
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
                  field.key === "calledPrefix"
                    ? SIP_SIP_PLACEHOLDER_CALLED_PREFIX
                    : ""
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
                  width: SIP_SIP_CONTROL_COL_WIDTH,
                  justifyContent: "flex-start",
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
                    <span style={sipFormTextStyle}>{field.labelAfter}</span>
                  )
                ) : (
                  <>
                    <span style={sipFormTextStyle}>{SIP_SIP_CHECKBOX_ENABLE}</span>
                    {field.labelAfter && (
                      <span style={sipFormTextStyle}>{field.labelAfter}</span>
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
                  width: SIP_SIP_CONTROL_COL_WIDTH,
                  justifyContent: "flex-start",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                    ...sipFormTextStyle,
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
                  {SIP_SIP_RADIO_YES}
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                    ...sipFormTextStyle,
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
                  {SIP_SIP_RADIO_NO}
                </label>
              </div>
            )}
          </div>
        </div>
      </SipFieldRow>
    );
  };

  return (
    <>
      <SipSipScrollbarStyles />
      <AdvancedPageShell isCompact={isCompact}>
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
          sx={sipSipFixedAlertSx}
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
              {SIP_SIP_APPLYING_TEXT}
            </div>
          </div>
        </div>
      )}

      <SipSipBreadcrumb />

      <div style={advancedCardShellStyle}>
        <div style={advancedTableContainerStyle}>
          <div style={sipHeaderStyle}>
            <span>{SIP_SIP_CARD_TITLE}</span>
          </div>

          <div
            className={SIP_SIP_SCROLL_CLASS}
            style={{ boxSizing: "border-box" }}
          >
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
                    {SIP_SIP_LOADING_TEXT}
                  </div>
                </div>
              </div>
            ) : (
              <div style={formBodyStyle}>
                <div className="settings-dashboard-grid" style={sipSipDashboardGridStyle(isCompact)}>
                  <div style={sipSipColumnStyle(isCompact)}>
                    <SipSipSectionHeading
                      title={SIP_SIP_SECTION_NETWORK}
                      isFirst
                    />
                    <div style={dashboardFieldsStackStyle}>
                      {SIP_NETWORK_SECTION_FIELDS.map((field) =>
                        renderFormField(field),
                      )}
                    </div>
                  </div>

                  {!isCompact && (
                    <div className="settings-dashboard-divider" style={sipSipDividerCellStyle} aria-hidden="true">
                      <div style={sipSipDividerLineStyle} />
                    </div>
                  )}

                  <div style={sipSipColumnStyle(isCompact)}>
                    <SipSipSectionHeading
                      title={SIP_SIP_SECTION_REGISTRATION}
                      isFirst
                    />
                    <div style={dashboardFieldsStackStyle}>
                      {SIP_REGISTRATION_SECTION_FIELDS.map((field) =>
                        renderFormField(field),
                      )}
                    </div>

                    {SIP_SIP_NOTE && (
                      <div style={{ marginTop: 12 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: C.strongText,
                            marginBottom: 8,
                          }}
                        >
                          {SIP_SIP_NOTE_LABEL}
                        </div>
                        <div style={{ width: "100%", boxSizing: "border-box" }}>
                          <p
                            style={{
                              margin: 0,
                              color: C.mutedText,
                              fontSize: 11,
                              lineHeight: 1.5,
                              whiteSpace: "normal",
                              overflowWrap: "break-word",
                              wordBreak: "break-word",
                              textAlign: "left",
                            }}
                          >
                            {SIP_SIP_NOTE.replace(/^Note:\s*/i, "")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {!loading && (
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
                    {SIP_SIP_BTN_SAVING}
                  </>
                ) : (
                  SIP_SIP_BTN_SAVE
                )}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleReset}
                style={advancedFormBtnStyle}
              >
                {SIP_SIP_BTN_RESET}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </AdvancedPageShell>
    </>
  );
};
export default SipSipPage;
