import { SIP_SIP_FIELDS } from "../../../../constants/SipSipConstants";

export const getSipSipInitialState = () => {
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

export const SIP_SIP_UI_TO_API_KEY_MAP = {
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
};

export const getSipSipApiToUiKeyMap = () => {
  const reversed = {};
  Object.entries(SIP_SIP_UI_TO_API_KEY_MAP).forEach(([ui, api]) => {
    reversed[api] = ui;
  });
  return reversed;
};

export const mergeSipSipApiSettings = (settings, apiToUiKeyMap) => {
  const next = { ...getSipSipInitialState() };
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
  return next;
};

export const buildSipSipSettingsPayload = (form) => {
  const settingsPayload = { id: 1 };
  Object.entries(SIP_SIP_UI_TO_API_KEY_MAP).forEach(([uiKey, apiKey]) => {
    const fieldDef = SIP_SIP_FIELDS.find((f) => f.key === uiKey);
    if (!fieldDef) return;
    const uiVal = form[uiKey];
    if (fieldDef.type === "checkbox") {
      settingsPayload[apiKey] = uiVal ? "1" : null;
    } else {
      settingsPayload[apiKey] = uiVal ?? null;
    }
  });
  return settingsPayload;
};

export const isSipSipFieldVisible = (field, form) => {
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

const SIP_SECTION_SPLIT_INDEX = Math.ceil(SIP_SIP_FIELDS.length / 2);
export const SIP_NETWORK_SECTION_FIELDS = SIP_SIP_FIELDS.slice(
  0,
  SIP_SECTION_SPLIT_INDEX,
);
export const SIP_REGISTRATION_SECTION_FIELDS = SIP_SIP_FIELDS.slice(
  SIP_SECTION_SPLIT_INDEX,
);
