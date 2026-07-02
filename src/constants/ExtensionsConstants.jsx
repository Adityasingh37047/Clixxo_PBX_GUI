export const EXTENSION_FIELD_TOOLTIPS = {
  extension:
    "The extension number that will be associated with this particular user or phone.",

  password:
    "The password can be generated randomly while registering a SIP account. It also can be modified by users.The Password length must longer than 8,and must contain  Uppercase Letters,Lowercase Letters,Digit and Special characters three of them. Special characters only accepts ~!@#$%^&*()_+ only,and the username can not be contain to password.",

  transport:
    "Select the SIP signaling transport protocol used by this extension for registration and call setup. Options are UDP, TCP, UDP over IPv6 (udp-ipv6), and TCP over IPv6 (tcp-ipv6). (Global SIP must be created for this)",

  context:
    "Select the SIP dial-plan context (SIP1 through SIP10) that this extension belongs to. Contexts group extensions for routing and isolation within the PBX.",

  allow_codecs:
    "Select the audio and video codecs this extension may use during calls. Choose one or more from ulaw, alaw, gsm, g726, g722, g729, h264, vp8, and vp9.",

  max_registrations:
    "Maximum amount of registrations of this SIP extension, with the default value of 3.",

  name: "The callerID number for this extension to call outbound, i.e. the DisplayName field.",

  email: "Enter the email address to send voicemail to.",

  user_password:
    "The password for this extension user to log into the system. Username is Name, while the default password is 'pass' plus the extension number.",

  mobile_number: "Fill in the mobile phone number of this extension user.",

  voicemail_enabled:
    "When Enabled, calls will be routed to voicemail after the Call Timeout(see Advanced TAB) regardless of Call Forward setting",

  voicemail_file:
    "Set the way to send the voicemail. Two options are available:<br>\nDownload Link: Send the voice message via link;<br>\nAudio File Attachment: Send the voice message via email attachment (default).",

  select_voice:
    "Once this feature is disabled, the call to this extension will play selected voice  if failed. By default.",

  voicemail_keep_local:
    "Set whether to save the voicemail at IPPBX after it is sent with a specified email. By default, the setting is Yes.",

  voicemail_password:
    "The password to enter the extension voicemail which is a randomly generated value by default and can be modified by users.",

  cf_always:
    "Always redirect calls to the designated destination within the period set by the following time condition select box. The default setting is Disabled.",

  cf_busy:
    "Redirect calls to the designated destination if the extension is busy within the period set by the following time condition select box. The default setting is Disabled.",

  cf_no_answer:
    "Redirect calls to the designated destination if not answered within the period set by the following time condition select box. The default setting is Disabled.",

  cf_not_registered:
    "Redirect calls to the designated destination if the extension is not registered within the period set by the following time condition select box. The default setting is Disabled.",

  follow_me:
    "Set a destination number for this extension so that all incoming calls within the period set in the following time condition selectbox will be routed to the destination number and the user won't miss a call. The default setting is Disabled.",

  dnd: "When DND is enabled for an extension, it will reject all incoming calls. The default setting is Disable.",

  enable_mobility_extension:
    "If you enable this setting, then when the User's Mobile Number dials into the system, the phone will have the same user permission as the desktop extension. So the mobile number will be able to connect with the other extension, dial out with the trunk, and play voicemail.",

  ring_simultaneously:
    "When the extension has an incoming call, it ring on the mobile number simultaneously and 'Follow Me' function will be invalid.",

  prefix:
    "It is the same with the User's Mobile Number. A prefix matching the outbound route also needs to be filled in.",

  mobility_timeout:
    "Set how long in seconds the mobile number rings when Ring Simultaneously is enabled. The call stops ringing the mobile after this timeout. Default is 30 seconds.",

  secretary_service:
    "After enabling this feature, the user can designate a number (secretary number) to help handle all incoming calls. When a user other than the secretary calls an extension, the call will be first transferred to the secretary number. The secretary confirms and then transfers the call to the extension. This function is disabled by default and cannot be used together with the Call Forwarding function.",

  monitor_allow:
    "Control whether this extension can be monitored by others. Disable prevents all monitoring; Enable All allows any authorized monitor; Extensions restricts monitoring to selected extensions only.",

  monitor_mode:
    "When Allow Being Monitored is enabled, set which monitor actions are permitted on this extension's calls. None disables monitoring modes; All allows all modes; Listen monitors silently; Whisper allows speaking to the extension only; Barge-in allows joining the call.",

  enable_srtp:
    "When this feature is enabled, the RTP stream is encrypted, having the same certification with TLS. The default setting is No.",

  sip_bypass_media:
    "Set whether to send the media stream point to point or in transparent proxy mode.<br>\nProxy Media: The media stream will pass IPPBX;<br>\nBypass Media: The media stream will be transport point to point.<br>\nDo not enable recording when set &quot;Bypass Media&quot; to avoid problems.",

  call_timeout:
    "Sets the maximum ringing duration in seconds for every call of this extension. The default value is 30s. If you wish to customize, enter the value in the text box directly. Phone will stop ringing after the time defined. The default value is 30s.",

  outbound_restriction:
    "When this feature is set to Enable, this extension cannot call out except for emergency numbers. The default settings is Disable.",

  extension_trunk:
    "When this feature is enabled, the remote SIP trunk devices can use this extension and its password to register to this IPPBX and call in without any configuration. You can find this extension in the outbound trunk list and select it as a trunk to call out. The default setting is Disable.",

  dynamic_lock_pin:
    "Select the PIN source for the dynamic lock feature. Default uses the system PIN; User Password uses this extension's user login password as the lock PIN.",

  call_prohibition:
    "Once this function is enabled, extensions except emergency numbers cannot call extensions.",

  max_call_duration:
    "Select the maximum call duration in seconds for every call of this extension. If you wish to customize, enter the value in the text box directly. This option is valid only for outbound calls. The default value is 6000(s).0 means no limit.",

  max_call_permission:
    "Set the call permission of an extension: No Call, Internal Call, Local Call, Long-Distance Call, International Call.<br>\nNo Call: Block any calls from the extension;<br>\nInternal Call: Only internal calls are allowed;<br>\nLocal Call: Allow the calls without 0 as the start number;<br>\nLong-Distance Call: Allow the calls with only one 0 at the beginning;<br>\nInternational Call (default): Allow the calls with two 0 at the beginning.",

  used_call_permission:
    "Shows the call permission level currently in effect for this extension. This read-only value reflects the dynamically applied permission and cannot exceed the configured Max Call Permission.",

  diversion:
    "Set yes，it will be taken diversion field in the invite message. default is yes.",

  rx_volume:
    "Set the volume in the direction from the SIP phone to the SIP port. The value range is -4~4 and the default value is 0.",

  tx_volume:
    "Set the volume in the direction from the SIP port to the SIP phone. The value range is -4~4 and the default value is 0.",
};

export const EXTENSION_FORM_FIELDS = [
  // BASIC -> General
  { name: "extension", label: "Extension", type: "text", defaultValue: "" },
  { name: "context", label: "Context", type: "text", defaultValue: "sip1" },
  {
    name: "allow_codecs",
    label: "Allow Codecs",
    type: "checkbox",
    defaultValue: "ulaw,alaw",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    defaultValue: "",
  },
  {
    name: "max_registrations",
    label: "Max Registrations",
    type: "text",
    defaultValue: "3",
  },
  {
    name: "transport",
    label: "Transport",
    type: "select",
    defaultValue: "udp",
  },

  // BASIC -> User Info
  { name: "user_name", label: "Name", type: "text", defaultValue: "" },
  {
    name: "user_password",
    label: "User Password",
    type: "password",
    defaultValue: "",
  },
  { name: "email", label: "Email", type: "text", defaultValue: "" },
  {
    name: "mobile_number",
    label: "Mobile Number",
    type: "text",
    defaultValue: "",
  },

  // ADVANCED (existing networking fields)
  { name: "from_domain", label: "Domain name", type: "text", defaultValue: "" },
  {
    name: "contact_user",
    label: "Contact User",
    type: "text",
    defaultValue: "",
  },
  {
    name: "outbound_proxy",
    label: "Outbound Proxy",
    type: "text",
    defaultValue: "",
  },

  // ADVANCED -> RTP Settings
  {
    name: "enable_srtp",
    label: "Enable SRTP",
    type: "select",
    defaultValue: "no",
  },
  {
    name: "sip_bypass_media",
    label: "SIP Bypass Media",
    type: "select",
    defaultValue: "proxy_media",
  },

  // ADVANCED -> Register Settings
  { name: "auth_acl", label: "Auth ACL", type: "text", defaultValue: "" },
  {
    name: "force_ping",
    label: "Force ping",
    type: "select",
    defaultValue: "no",
  },
  {
    name: "user_agent_filter",
    label: "User Agent Filter",
    type: "text",
    defaultValue: "",
  },
  {
    name: "sip_force_contact",
    label: "SIP Force Contact",
    type: "select",
    defaultValue: "",
  },
  {
    name: "sip_expires_max_deviation",
    label: "Sip Expires Max Deviation (s)",
    type: "number",
    defaultValue: 0,
  },
  {
    name: "online_verification_nat",
    label: "Online Verification after NAT",
    type: "select",
    defaultValue: "no",
  },
  {
    name: "options_interval",
    label: "OPTIONS Interval (s)",
    type: "text",
    defaultValue: "",
  },
  {
    name: "sip_force_expires",
    label: "SIP Force Expires (s)",
    type: "number",
    defaultValue: 0,
  },

  // ADVANCED -> Call Settings
  {
    name: "call_timeout",
    label: "Call Timeout (s)",
    type: "number",
    defaultValue: 30,
  },
  {
    name: "max_call_duration",
    label: "Max Call Duration (s)",
    type: "number",
    defaultValue: 6000,
  },
  {
    name: "outbound_restriction",
    label: "Outbound Restriction",
    type: "select",
    defaultValue: "disable",
  },
  {
    name: "admin_call_permission",
    label: "Max Call Permission",
    type: "select",
    defaultValue: "international_call",
  },
  {
    name: "call_permission",
    label: "Used Call Permission",
    type: "select",
    defaultValue: "international_call",
  },
  {
    name: "extension_trunk",
    label: "Extension Trunk",
    type: "select",
    defaultValue: "disable",
  },
  {
    name: "dynamic_lock_pin",
    label: "Dynamic Lock Pin",
    type: "select",
    defaultValue: "default",
  },
  {
    name: "diversion",
    label: "diversion",
    type: "select",
    defaultValue: "yes",
  },
  {
    name: "call_prohibition",
    label: "Call Prohibition",
    type: "select",
    defaultValue: "disable",
  },

  // ADVANCED -> Other Settings
  { name: "rx_volume", label: "RX Volume", type: "number", defaultValue: 0 },
  { name: "tx_volume", label: "TX Volume", type: "number", defaultValue: 0 },

  // FEATURES -> Voicemail
  {
    name: "voicemail_enabled",
    label: "Voicemail Enabled",
    type: "select",
    defaultValue: "no",
  },
  {
    name: "voicemail_keep_local",
    label: "Voicemail Keep Local",
    type: "select",
    defaultValue: "yes",
  },
  {
    name: "voicemail_file",
    label: "Voicemail File",
    type: "select",
    defaultValue: "audio_file_attachment",
  },
  {
    name: "voicemail_password",
    label: "Voicemail Password",
    type: "password",
    defaultValue: "",
  },
  {
    name: "voicemail_voice",
    label: "Select Voice",
    type: "select",
    defaultValue: "system_default",
  },

  // FEATURES -> Monitor
  {
    name: "monitor_allow",
    label: "Allow Being Monitored",
    type: "select",
    defaultValue: "disable",
  },
  {
    name: "monitor_allowed_extensions",
    label: "Monitor Allowed Extensions",
    type: "text",
    defaultValue: [],
  },
  {
    name: "monitor_mode",
    label: "Monitor Mode",
    type: "select",
    defaultValue: "none",
  },

  // FEATURES -> Call Forwarding
  {
    name: "cf_always_enabled",
    label: "CF Always Enabled",
    type: "select",
    defaultValue: "disabled",
  },
  {
    name: "cf_always_number",
    label: "CF Always Number",
    type: "text",
    defaultValue: "",
  },
  {
    name: "cf_always_time",
    label: "CF Always Time Condition",
    type: "select",
    defaultValue: "all",
  },

  {
    name: "cf_busy_enabled",
    label: "CF On Busy Enabled",
    type: "select",
    defaultValue: "disabled",
  },
  {
    name: "cf_busy_number",
    label: "CF On Busy Number",
    type: "text",
    defaultValue: "",
  },
  {
    name: "cf_busy_time",
    label: "CF On Busy Time Condition",
    type: "select",
    defaultValue: "all",
  },

  {
    name: "cf_no_answer_enabled",
    label: "CF No Answer Enabled",
    type: "select",
    defaultValue: "disabled",
  },
  {
    name: "cf_no_answer_number",
    label: "CF No Answer Number",
    type: "text",
    defaultValue: "",
  },
  {
    name: "cf_no_answer_time",
    label: "CF No Answer Time Condition",
    type: "select",
    defaultValue: "all",
  },

  {
    name: "cf_not_registered_enabled",
    label: "CF Not Registered Enabled",
    type: "select",
    defaultValue: "disabled",
  },
  {
    name: "cf_not_registered_number",
    label: "CF Not Registered Number",
    type: "text",
    defaultValue: "",
  },
  {
    name: "cf_not_registered_time",
    label: "CF Not Registered Time Condition",
    type: "select",
    defaultValue: "all",
  },

  // FEATURES -> Follow Me & DND
  {
    name: "follow_me_enabled",
    label: "Follow Me Enabled",
    type: "select",
    defaultValue: "disabled",
  },
  {
    name: "follow_me_time",
    label: "Follow Me Time Condition",
    type: "select",
    defaultValue: "all",
  },
  {
    name: "follow_me_entries",
    label: "Follow Me Destinations",
    type: "input_list",
    defaultValue: [],
  },
  {
    name: "follow_me_timeout_destination",
    label: "Follow Me Timeout Destination",
    type: "text",
    defaultValue: "",
  },
  {
    name: "dnd_enabled",
    label: "Do Not Disturb",
    type: "select",
    defaultValue: "disabled",
  },
  {
    name: "dnd_time",
    label: "Do Not Disturb Time Condition",
    type: "select",
    defaultValue: "all",
  },
  {
    name: "dnd_dest",
    label: "DND Destination",
    type: "text",
    defaultValue: "",
  },
  {
    name: "dnd_special_numbers",
    label: "Special Number for DND",
    type: "text",
    defaultValue: [],
  },

  // FEATURES -> Mobility Extension
  {
    name: "enable_mobility_extension",
    label: "Enable Mobility Extension",
    type: "select",
    defaultValue: "no",
  },
  {
    name: "ring_simultaneously",
    label: "Ring Simultaneously",
    type: "select",
    defaultValue: "no",
  },
  {
    name: "mobility_prefix",
    label: "Mobility Prefix",
    type: "text",
    defaultValue: "",
  },
  {
    name: "mobility_timeout",
    label: "Mobility Timeout",
    type: "select",
    defaultValue: 30,
  },

  // FEATURES -> Secretary Service
  {
    name: "secretary_service",
    label: "Secretary Service",
    type: "select",
    defaultValue: "disabled",
  },
  {
    name: "secretary_extension",
    label: "Secretary Extension",
    type: "text",
    defaultValue: "",
  },
];

export const EXTENSION_CODEC_OPTIONS = [
  { value: "ulaw", label: "ulaw" },
  { value: "alaw", label: "alaw" },
  { value: "gsm", label: "gsm" },
  { value: "g726", label: "g726" },
  { value: "g722", label: "g722" },
  { value: "g729", label: "g729" },
  { value: "h264", label: "h264" },
  { value: "vp8", label: "vp8" },
  { value: "vp9", label: "vp9" },
];

export const EXTENSION_TABLE_COLUMNS = [
  { key: "check", label: "Check" },
  { key: "index", label: "Index" },
  { key: "extension", label: "Extension" },
  { key: "context", label: "Context" },
  { key: "allow_codecs", label: "Allow Codecs" },
  { key: "password", label: "Password" },
  { key: "status", label: "Status" },
  { key: "modify", label: "Modify" },
];

export const EXTENSION_INITIAL_FORM = EXTENSION_FORM_FIELDS.reduce(
  (acc, field) => {
    acc[field.name] = field.defaultValue;
    return acc;
  },
  {},
);
