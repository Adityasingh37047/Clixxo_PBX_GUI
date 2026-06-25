export const SIP_COMPATIBILITY_FIELDS = [
  { label: 'Obtain CalleeID from', type: 'select', key: 'obtainCalleeId', options: ["'Username' Field", "'Request' Field", "'Display Name' Field"], default: "'Request' Field" },
  { label: 'Set CallerID position', type: 'select', key: 'callerIdPosition', options: ['Username of From Field', 'Display Name of From Field'], default: 'Username of From Field' },
  { label: 'Obtain CallerID from', type: 'select', key: 'obtainCallerId', options: ['Username of From Field', 'Display Name of From Field'], default: 'Username of From Field' },
  { label: 'Use Source Address', type: 'checkbox', key: 'useSourceAddress', default: false },
  { label: 'Use Contact Address', type: 'checkbox', key: 'useContactAddress', default: false },
  { label: 'Call Transfer Mode', type: 'select', key: 'callTransferMode', options: ['Internal Handling', 'Platform to Handle SIP Info'], default: 'Platform to Handle SIP Info' },
  { label: 'Internal Handle', type: 'select', key: 'internalHandle', options: ['Match Port Number', 'Search Idle FXO Channel'], default: 'Match Port Number', conditional: 'callTransferMode', conditionalValue: 'Internal Handling' },
  { label: 'Call Flash Mode', type: 'select', key: 'callFlashMode', options: ['Internal Handling', 'Platform to handle Sip Info'], default: 'Platform to handle Sip Info' },
  { label: 'Hold Music Source', type: 'select', key: 'holdMusicSource', options: ['Remote', 'Local'], default: 'Remote', conditional: 'callFlashMode', conditionalValue: 'Platform to handle Sip Info' },
  { label: 'Two Stage Dialing for SIP Incoming Call', type: 'checkbox', key: 'twoStageDialing', default: false },
  { label: 'Maximum Wait Answer Time (s)', type: 'text', key: 'maxWaitAnswer', default: '60', validation: 'integer' },
  { label: 'Set SIP Identifying', type: 'text', key: 'sipIdentifying', default: 'Gateway' },
  { label: 'Maximum Wait RTP Time (s)', type: 'text', key: 'maxWaitRtp', default: '0', validation: 'integer' },
  { label: 'Call Abnormal Hangup Detection', type: 'checkbox', key: 'abnormalHangup', default: false },
  { label: 'Cycle(s)', type: 'text', key: 'abnormalHangupCycle', default: '0', validation: 'integer', conditional: 'abnormalHangup' },
  { label: 'Server Status Detection', type: 'checkbox', key: 'serverStatusDetection', default: false },
  { label: 'Cycle(s)', type: 'text', key: 'cycle', default: '10', validation: 'integer', conditional: 'serverStatusDetection' },
  { label: 'Send Cue Tone', type: 'checkbox', key: 'sendCueTone', default: false, conditional: 'serverStatusDetection' },
  { label: 'SIP Encryption', type: 'checkbox', key: 'sipEncryption', default: false },
  { label: 'Encryption Criterion', type: 'select', key: 'encryptionCriterion', options: ['VOS1.1', 'VOS2.0'], default: 'VOS1.1', conditional: 'sipEncryption' },
  { label: 'Identifier', type: 'text', key: 'identifier', default: '', conditional: 'encryptionCriterion', conditionalValue: 'VOS1.1' },
  { label: 'Key', type: 'text', key: 'key', default: '', conditional: 'sipEncryption' },
  { label: 'RTP Encryption', type: 'checkbox', key: 'rtpEncryption', default: false },
  { label: 'INVITE 100rel', type: 'checkbox', key: 'invite100rel', default: false },
  { label: 'Ignore ACK', type: 'checkbox', key: 'ignoreAck', default: false },
  { label: 'User-defined SIP Code', type: 'checkbox', key: 'userDefinedSipCode', default: false },
  { label: 'No Idle Port in Port Group', type: 'text', key: 'noIdlePort', default: '503', validation: 'integer', conditional: 'userDefinedSipCode' },
  { label: 'Called Party Disconnected (Talking, Power off, Rejected, No Response, Not in Service)', type: 'text', key: 'calledPartyDisconnected', default: '486', validation: 'integer', conditional: 'userDefinedSipCode' },
  { label: 'Route Failed', type: 'text', key: 'routeFailed', default: '488', validation: 'integer', conditional: 'userDefinedSipCode' },
  { label: 'Use Iptables', type: 'checkbox', key: 'useIptables', default: true },
  { label: 'Manage Refer', type: 'select', key: 'manageRefer', options: ['Default', 'FXO Blind call transfer'], default: 'Default' },
  { label: 'FXO HangUp Time', type: 'text', key: 'fxoHangupTime', default: '7', validation: 'integer', conditional: 'manageRefer', conditionalValue: 'FXO Blind call transfer' },
];

const INTEGER_VALIDATION =
  "Integer digits only while typing (empty allowed).";

/** FXS VoIP SIP Compatibility — conditional visibility from SipCompatibilityPage.shouldShowField */
export const SIP_COMPATIBILITY_FIELD_TOOLTIPS = {
  obtainCalleeId:
    "Source field for callee ID on incoming SIP calls.\n" +
    "Options: 'Username' Field, 'Request' Field, 'Display Name' Field.\n" +
    "Default: 'Request' Field.",

  callerIdPosition:
    "Where to place caller ID in outbound SIP From header.\n" +
    "Options: Username of From Field, Display Name of From Field.\n" +
    "Default: Username of From Field.",

  obtainCallerId:
    "Source field for caller ID on incoming SIP calls.\n" +
    "Options: Username of From Field, Display Name of From Field.\n" +
    "Default: Username of From Field.",

  useSourceAddress:
    "Use the SIP source IP address for routing/identification.\n" +
    "Default: disabled (false).",

  useContactAddress:
    "Use the SIP Contact header address.\n" +
    "Default: disabled (false).",

  callTransferMode:
    "How call transfer (REFER) is handled.\n" +
    "Options: Internal Handling, Platform to Handle SIP Info.\n" +
    "Default: Platform to Handle SIP Info.\n" +
    "When Internal Handling is selected, Internal Handle field is shown.",

  internalHandle:
    "Internal call transfer handling method.\n" +
    "Shown only when Call Transfer Mode is Internal Handling.\n" +
    "Options: Match Port Number, Search Idle FXO Channel.\n" +
    "Default: Match Port Number.",

  callFlashMode:
    "How hook-flash events are handled.\n" +
    "Options: Internal Handling, Platform to handle Sip Info.\n" +
    "Default: Platform to handle Sip Info.\n" +
    "When Platform to handle Sip Info is selected, Hold Music Source is shown.",

  holdMusicSource:
    "Hold music source for flash/hold handling.\n" +
    "Shown only when Call Flash Mode is Platform to handle Sip Info.\n" +
    "Options: Remote, Local.\n" +
    "Default: Remote.",

  twoStageDialing:
    "Enable two-stage dialing for SIP incoming calls.\n" +
    "Default: disabled (false).",

  maxWaitAnswer:
    "Maximum wait time for answer in seconds.\n" +
    `Default: 60.\n${INTEGER_VALIDATION}`,

  sipIdentifying:
    "SIP User-Agent or identifying string sent in SIP messages.\n" +
    "Default: Gateway.",

  maxWaitRtp:
    "Maximum wait time for RTP in seconds (0 = no limit).\n" +
    `Default: 0.\n${INTEGER_VALIDATION}`,

  abnormalHangup:
    "Enable call abnormal hangup detection.\n" +
    "When enabled, Cycle(s) field is shown.\n" +
    "Default: disabled (false).",

  abnormalHangupCycle:
    "Detection cycle in seconds for abnormal hangup.\n" +
    "Shown only when Call Abnormal Hangup Detection is enabled.\n" +
    `Default: 0.\n${INTEGER_VALIDATION}`,

  serverStatusDetection:
    "Enable periodic SIP server status detection.\n" +
    "When enabled, shows Cycle(s) and Send Cue Tone fields.\n" +
    "Default: disabled (false).",

  cycle:
    "Server status detection interval in seconds.\n" +
    "Shown only when Server Status Detection is enabled.\n" +
    `Default: 10.\n${INTEGER_VALIDATION}`,

  sendCueTone:
    "Send cue tone when server status check fails.\n" +
    "Shown only when Server Status Detection is enabled.\n" +
    "Default: disabled (false).",

  sipEncryption:
    "Enable SIP signaling encryption.\n" +
    "When enabled, shows Encryption Criterion and Key fields.\n" +
    "Default: disabled (false).",

  encryptionCriterion:
    "SIP encryption standard.\n" +
    "Shown only when SIP Encryption is enabled.\n" +
    "Options: VOS1.1, VOS2.0.\n" +
    "Default: VOS1.1.\n" +
    "When VOS1.1 is selected, Identifier field is shown.",

  identifier:
    "Encryption identifier for VOS1.1.\n" +
    "Shown only when SIP Encryption is enabled and Encryption Criterion is VOS1.1.",

  key:
    "Encryption key.\n" +
    "Shown whenever SIP Encryption is enabled (regardless of Encryption Criterion).",

  rtpEncryption:
    "Enable RTP media encryption.\n" +
    "Default: disabled (false).",

  invite100rel:
    "Enable SIP INVITE 100rel (PRACK) support.\n" +
    "Default: disabled (false).",

  ignoreAck:
    "Ignore SIP ACK messages.\n" +
    "Default: disabled (false).",

  userDefinedSipCode:
    "Use custom SIP response codes for error conditions.\n" +
    "When enabled, shows No Idle Port, Called Party Disconnected, and Route Failed fields.\n" +
    "Default: disabled (false).",

  noIdlePort:
    "SIP response code when no idle port is available in a port group.\n" +
    "Shown only when User-defined SIP Code is enabled.\n" +
    `Default: 503.\n${INTEGER_VALIDATION}`,

  calledPartyDisconnected:
    "SIP response code when called party is disconnected (talking, power off, rejected, no response, not in service).\n" +
    "Shown only when User-defined SIP Code is enabled.\n" +
    `Default: 486.\n${INTEGER_VALIDATION}`,

  routeFailed:
    "SIP response code when routing fails.\n" +
    "Shown only when User-defined SIP Code is enabled.\n" +
    `Default: 488.\n${INTEGER_VALIDATION}`,

  useIptables:
    "Use iptables for SIP/RTP firewall rules.\n" +
    "Default: enabled (true).",

  manageRefer:
    "How SIP REFER (call transfer) requests are managed.\n" +
    "Options: Default, FXO Blind call transfer.\n" +
    "Default: Default.\n" +
    "When FXO Blind call transfer is selected, FXO HangUp Time is shown.",

  fxoHangupTime:
    "FXO hangup delay in seconds for blind transfer.\n" +
    "Shown only when Manage Refer is FXO Blind call transfer.\n" +
    `Default: 7.\n${INTEGER_VALIDATION}`,
};