export const SIP_SETTINGS_FIELDS = [
  { label: 'SIP Address of WAN', type: 'select', key: 'sipWan', options: [] },
  { label: 'SIP Signaling Port', type: 'text', key: 'sipPort', default: '5060', validation: 'integer' },
  { label: 'TLS', type: 'checkbox', key: 'tls',  },
  { label: 'SIP TLS Signaling Port', type: 'text', key: 'sipTlsPort', default: '5061', conditional: 'tls' },
  { label: 'SIP TLS Version', type: 'select', key: 'sipTlsVersion', options: ['SSLv23', 'TLS1.0', 'TLS1.1', 'TLS1.2'], default: 'SSLv23', conditional: 'tls' },
  { label: 'When the externally bound is enabled, only the externally bound address is matched to confirm the SIP trunk:', type: 'checkbox', key: 'externalBound' },
  { label: 'Send 180 before sending 183', type: 'radio', key: 'send180', options: ['Yes', 'No'], default: 'Yes'},
  { label: 'Send 183 Message', type: 'checkbox', key: 'send183'  },
  { label: 'Called Number Prefix for 180 Reply (Up to 5 are Allowed, Separated by ":")', type: 'text', key: 'calledPrefix', conditional: 'send183' },
  { label: 'Send 100rel', type: 'checkbox', key: 'send100rel' },
  { label: 'IP Call In First Route', type: 'select', key: 'ipCallRoute', options: ['IP to PSTN', 'IP to IP'] },
  { label: 'Soft-switch to be Connected', type: 'select', key: 'softSwitch', options: ['Others', 'VOS'] },
  { label: 'Send 183 Delay Time(ms)', type: 'text', key: 'send183DelayTime', conditional: 'softSwitch', conditionalValue: 'VOS' },
  { label: '183 Send Delay Mode', type: 'select', key: 'send183DelayMode', options: ['Mode 1', 'Mode 2'], default: 'Mode 1', conditional: 'softSwitch', conditionalValue: 'VOS' },
  { label: 'Hide CallerID', type: 'select', key: 'hideCallerId', options: ['Not Hidden', 'Hidden'] },
  { label: 'Obtain CallerID from', type: 'radio', key: 'obtainCallerId', options: ['Yes', 'No'], default: 'Yes' },
  { label: 'Obtain CalleeID from', type: 'select', key: 'obtainCalleeId', options: [" 'To' Field", "'Request' Field"] },
  { label: 'Send CalleeID from', type: 'select', key: 'sendCalleeId', options: ["'To' Field", "'Request' Field"] },
  { label: 'Asserted Identity Mode', type: 'select', key: 'assertedId', options: ['Disable', 'P-Asserted-Identity', 'P-Preferred-Identity'] },
  { label: 'Number in From Field not Manipulated', type: 'checkbox', key: 'numberInFromFieldNotManipulated', conditional: 'assertedId', conditionalValues: ['P-Asserted-Identity', 'P-Preferred-Identity'] },
  { label: 'Prack Send Mode', type: 'select', key: 'prackSend', options: ['Disable', 'Supported','Require'] },
  { label: 'DisplayName', type: 'select', key: 'displayName', options: ['Hide', 'Caller']},
  { label: 'UserName', type: 'select', key: 'userName', options: ['Change Caller', 'Caller'] },
  { label: 'Sip Address', type: 'select', key: 'sipAddress', options: ['IPv4', 'IPv6']},
  { label: 'Send/Obtain Redirecting Number/Original CalleeID from Diversion Field', type: 'radio', key: 'diversionField', options: ['Yes', 'No'], default: 'No'},
  { label: 'NAT Traversal', type: 'radio', key: 'natTraversal', options: ['Yes', 'No'], default: 'Yes' },
  { label: 'Traversal Type', type: 'select', key: 'traversalType', options: ['Port Mapping'], default: 'Port Mapping', conditional: 'natTraversal', conditionalValue: 'Yes' },
  { label: 'LAN1 Mapping Address', type: 'text', key: 'lan1MappingAddress', conditional: 'natTraversal', conditionalValue: 'Yes' },
  { label: 'LAN2 Mapping Address', type: 'text', key: 'lan2MappingAddress', conditional: 'natTraversal', conditionalValue: 'Yes' },
  { label: 'Set Redirection Parameter of REL Message When Receive Refer Message', type: 'checkbox', key: 'relMessage' },
  { label: 'RTP Self-adaption', type: 'radio', key: 'rtpSelf', options: ['Yes', 'No'], default: 'No' },
  { label: 'Rport', type: 'checkbox', key: 'rport' },
  { label: 'Filter Out Fake Calls (CallerID is the same as CalleeID)', type: 'checkbox', key: 'filterFake' },
  { label: 'Auto Reply of Source Address', type: 'checkbox', key: 'autoReply'},
  { label: 'Multiple Audio Selection', type: 'select', key: 'audioSelection', options: ['RTP/Audio', 'SRTP/Audio'] },
  { label: 'Send Response By Former Via', type: 'checkbox', key: 'responseVia'},
  { label: 'Registration related settings', type: 'checkbox', key: 'registrationSettings', default: false },
  { label: 'Time (min/month)', type: 'text', key: 'timeMinMonth', default: '5000', conditional: 'registrationSettings' },
  { label: 'SIP Registered Number Polling', type: 'select', key: 'sipRegisteredNumberPolling', options: ['Disable', 'Enable'], default: 'Disable', conditional: 'registrationSettings' },
  { label: 'Failed Count', type: 'text', key: 'failedCount', default: '0', conditional: 'sipRegisteredNumberPolling', conditionalValue: 'Enable' },
  { label: 'Recover Time Of Disable Account(m)', type: 'text', key: 'recoverTimeOfDisableAccount', default: '0', conditional: 'sipRegisteredNumberPolling', conditionalValue: 'Enable' },
  { label: 'Caller Prefix Grouping', type: 'select', key: 'callerPrefixGrouping', options: ['Disable', 'Enable'], default: 'Disable', conditional: 'sipRegisteredNumberPolling', conditionalValue: 'Enable' },
  { label: 'Caller Over Clocking(IP OUT)', type: 'checkbox', key: 'callerOverClock' },
  { label: 'Cycle(min)', type: 'text', key: 'cycleMin', default: '30', conditional: 'callerOverClock' },
  { label: 'Count Values', type: 'text', key: 'countValues', default: '30', conditional: 'callerOverClock' },
  { label: 'Interval(ms)', type: 'text', key: 'intervalMs', default: '0', conditional: 'callerOverClock' },
  { label: 'Eth Resource', type: 'checkbox', key: 'ethResource' },
  { label: 'SIP Account Numbers', type: 'text', key: 'sipAccountNumbers' },
  { label: 'SIP Account Registration Interval (MS)', type: 'text', key: 'sipAccountInterval' },
  { label: 'DSCP', type: 'text', key: 'dscp', default: '0', validation: 'integer' },
  { label: 'Calls from SIP Trunk Address only', type: 'checkbox', key: 'callsFromTrunkOnly' },
  { label: 'Match Call Count to SIP Trunk based on Source Address of INVITE', type: 'checkbox', key: 'matchCallCount' },
  { label: 'Switch Signal Port if SIP Registration Failed', type: 'checkbox', key: 'switchSignalPort' },
  { label: 'Hang up upon Call Time-out', type: 'checkbox', key: 'hangupTimeout'},
  { label: 'Maximum Call Overtime(min)', type: 'text', key: 'maximumCallOvertime', default: '1', conditional: 'hangupTimeout' },
  { label: 'Working Period', type: 'checkbox', key: 'workingPeriod', labelAfter: '24 Hours' },
  { label: 'Session Timer', type: 'checkbox', key: 'sessionTimer' },
  { label: 'Minimum Time (s)', type: 'text', key: 'minimumTime', default: '150', conditional: 'sessionTimer' },
  { label: 'Timeout (s)', type: 'text', key: 'timeout', default: '600', conditional: 'sessionTimer' },
  { label: 'Media Stream Processing', type: 'radio', key: 'mediaStream', options: ['Yes', 'No'], default: 'Yes'},
  { label: 'Sip Trunk Heart', type: 'checkbox', key: 'sipTrunkHeart'},
  { label: 'Trunk Heartbeat Cycle (s)', type: 'text', key: 'trunkHeartbeatCycle', default: '10', conditional: 'sipTrunkHeart' },
  { label: 'Allowed Times of NoResponse', type: 'text', key: 'allowedTimesOfNoResponse', default: '3', conditional: 'sipTrunkHeart' },
  { label: 'Early Media', type: 'checkbox', key: 'earlyMedia'},
  { label: 'Early Session', type: 'checkbox', key: 'earlySession' },
  { label: 'Support 100rel', type: 'radio', key: 'support100rel', options: ['Yes', 'No'], default: 'No' },
  { label: 'Not Wait ACK after Sending 200 OK', type: 'checkbox', key: 'notWaitAck'},
  { label: 'Match Sip Trunk Port', type: 'checkbox', key: 'matchTrunkPort' },
  { label: 'The Percentage of Registration Message Sending Cycle to Period of Validity(%)', type: 'text', key: 'regMsgPercent' },
  { label: 'Maximum Wait Answer Time(s)', type: 'text', key: 'maxWaitAnswer' },
  { label: 'Maximum Wait RTP Time(s)', type: 'text', key: 'maxWaitRtp' },
  { label: 'Maximum Wait PSTN Resource Time(ms)', type: 'text', key: 'maxWaitPstn' },
  { label: 'Switch Network Port by Packet Loss Rate', type: 'checkbox', key: 'switchNetPort' },
  { label: 'RTP Packet Loss Rate(%)', type: 'text', key: 'rtpPacketLossRate', default: '5', conditional: 'switchNetPort' },
  { label: 'Add Content to To Field in INVITE Message', type: 'radio', key: 'addContactTo', options: ['Yes', 'No'] },
  { label: 'Add Content(\'=\' replaced by \'+\')', type: 'text', key: 'addContent', conditional: 'addContactTo', conditionalValue: 'Yes' },
  { label: 'UserAgent Field', type: 'text', key: 'userAgent' },
];

export const SIP_SETTINGS_NOTE =
  'Note: Only one SIP Trunk can be configured and it is "Local Network Port" should be set to "Any Lan" once the feature "Switch Network Port by Packet Loss Rate" is enabled.';

const SIP_SETTINGS_UI_TO_API = {
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

const sipFieldOpts = (field) => {
  if (!field.options) return "";
  const opts = field.options.map((o) =>
    typeof o === "object" ? o.value ?? o.label : o
  );
  return `Options: ${opts.join(", ")}.`;
};

const buildSipSettingsTooltips = () => {
  const tooltips = {};
  SIP_SETTINGS_FIELDS.forEach((field) => {
    const apiKey = SIP_SETTINGS_UI_TO_API[field.key];
    const parts = [];
    if (apiKey) {
      parts.push(
        `Saved as ${apiKey} via updateSipSettings (id: 1).`,
        'Checkboxes saved as "1" or null.'
      );
    } else {
      parts.push(
        "Shown in SIP settings form. Not sent in updateSipSettings payload."
      );
    }
    const opts = sipFieldOpts(field);
    if (opts) parts.push(opts);
    if (field.default !== undefined) parts.push(`Default: ${field.default}.`);
    if (field.validation === "integer") parts.push("UI accepts digits only.");
    if (field.key === "calledPrefix") {
      parts.push("UI allows digits and : only, up to 6 colon-separated segments.");
    }
    if (field.key === "sipWan") {
      parts.push("Select options loaded for WAN address.");
    }
    if (field.conditional) {
      parts.push(`Conditionally shown based on ${field.conditional}.`);
    }
    tooltips[field.key] = parts.join("\n");
  });
  return tooltips;
};

/** SIP Settings (SipSipPage) — listSipSettings / updateSipSettings */
export const SIP_SETTINGS_FIELD_TOOLTIPS = buildSipSettingsTooltips();
