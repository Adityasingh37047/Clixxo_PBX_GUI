export const sipRegisterFields = [
  { name: "index", label: "Index", type: "text", defaultValue: "0" },
  { name: "trunk_id", label: "Trunk ID", type: "text", defaultValue: "" },
  { name: "username", label: "Username", type: "text", defaultValue: "" },
  {
    name: "auth_username",
    label: "Auth Username",
    type: "text",
    defaultValue: "",
  },
  { name: "password", label: "Password", type: "password", defaultValue: "" },
  { name: "context", label: "Context", type: "text", defaultValue: "" },
  {
    name: "allow_codecs",
    label: "Allow Codecs",
    type: "checkbox",
    defaultValue: "ulaw,alaw",
  },
  {
    name: "expire_in_sec",
    label: "Expire In Sec",
    type: "text",
    defaultValue: "",
  },
  { name: "provider", label: "Provider", type: "text", defaultValue: "" },
  { name: "sip_header", label: "SIP Header", type: "text", defaultValue: "" },
  { name: "Domain name", label: "Domain name", type: "text", defaultValue: "" },
  {
    name: "Contact User",
    label: "Contact User",
    type: "text",
    defaultValue: "",
  },
  {
    name: "Outbound Proxy",
    label: "Outbound Proxy",
    type: "text",
    defaultValue: "",
  },
  {
    name: "server_domain",
    label: "Server Domain",
    type: "text",
    defaultValue: "",
  },
  {
    name: "client_domain",
    label: "Client Domain",
    type: "text",
    defaultValue: "",
  },
  { name: "from_user", label: "From User", type: "text", defaultValue: "" },
  {
    name: "identity_ip",
    label: "Identifier IP",
    type: "text",
    defaultValue: "",
  },
];

export const SIP_REGISTER_TABLE_COLUMNS = [
  { key: "check", label: "Check" },
  { key: "trunk_id", label: "Trunk ID" },
  { key: "username", label: "Username" },
  { key: "context", label: "Context" },
  { key: "allow_codecs", label: "Allow Codecs" },
  { key: "expire_in_sec", label: "Expire In Sec" },
  { key: "provider", label: "Provider" },
  { key: "registerStatus", label: "Status" },
  { key: "modify", label: "Modify" },
];

export const SIP_REGISTER_DEFAULT_CODECS = "ulaw,alaw";

export const CODEC_OPTIONS = [
  { value: "ulaw", label: "ulaw" },
  { value: "alaw", label: "alaw" },
  { value: "gsm", label: "gsm" },
  { value: "g726", label: "g726" },
  { value: "g722", label: "g722" },
  { value: "g729", label: "g729" },
];

/** Extra UI fields for IPPBX-style trunk modal (tabs); not all are sent to API. */
export const SIP_REGISTER_UI_DEFAULTS = {
  ui_trunk_type: "sip",
  ui_country: "General",
  ui_transport: "udp",
  ui_enable_srtp: false,
  ui_register: "No",
  ui_outbound_cid_source: "Transparent caller",
  ui_show_outbound_cid_name: true,
  ui_outbound_cid_name: "",
  ui_outbound_cid_number: "",
  ui_reg_fail_retry: "30",
  ui_match_username: "Yes",
  ui_enable_proxy: false,
  ui_proxy_ip: "",
  ui_record: "No",
  ui_enabled: "Yes",
  ui_eth_port: "ETH0",
  ui_get_called_id_type: "",
  ui_options_interval: "",
  ui_tx_volume: "0",
  ui_rx_volume: "0",
  ui_send_privacy_id: "No",
  ui_sip_force_contact: "",
  ui_p_preferred_identity: "None",
  ui_remote_party_id: "None",
  ui_p_asserted_identity: "None",
  ui_contact_mode: "Trunk User Name",
  ui_limit_max_calls: "0",
  ui_enable_early_media: "No",
  ui_call_timeout: "30",
  ui_max_call_duration: "6000",
  ui_dnis: false,
  ui_enable_early_session: "No",
  ui_user_phone: false,
  ui_dtmf_transmit: "RFC2833",
};

export const SIP_REGISTER_INITIAL_FORM = {
  ...sipRegisterFields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue;
    return acc;
  }, {}),
  ...SIP_REGISTER_UI_DEFAULTS,
};

export const SIP_REGISTER_TOOLTIPS = {
  trunk_type: "SIP trunk or FXO trunk.",
  trunk_name:
    "User-defined, consisting of letters and digits. Maximum 32 characters.",
  select_country: "Please select the country of the ITSP.",
  transport:
    "Three options available: UDP, TCP, TLS. TLS goes valid only if it is enabled in SIP Settings. The default setting is UDP.",
  enable_srtp:
    "When it is ticked, the RTP stream is encrypted and the certificate is the same as TLS. By default it is unticked.",
  register:
    "Set whether to register the SIP trunk, which is determined by the trunk provider. The default setting is No.",
  outbound_cid_source:
    "In case of unregistration, use the transparent extension as the caller by default; in case of registration, use the registered account as the caller by default.",
  record: "Save the Recording. Default is No.",
  enabled: "Enable or Disable the Trunk. The default setting is Yes.",
  eth_port: "Two options available: LAN (default), WAN.",
  trunk_ip_domain:
    "Service providers hostname or IP address:[port]",
  show_outbound_cid_name:
    "When it is ticked, displayname in the SIP message will be the Outbound CallerID Name if set or else the extension name. When it is not ticked, it will show none. By default it is ticked.",
  outbound_cid_name:
    'CallerID name of this trunk displayed in an outbound call, the priority is higher than "Outbound CallerId Source".',
  outbound_cid_number:
    "CallerID number of this trunk displayed in an outbound call.",
  get_called_id_type:
    "Set to null to get called id from the request field, set to auto_to_user to get called id from the to field. By default it is null.",
  tx_volume:
    "Set the volume in the direction from the IP port of PBX to the SIP phone or choose Custom to define the TX Gain below. The value range is -4~4, with the default value of 0.",
  from_user:
    "Use the value of this item to override the UserName field in the From header field while sending the INVITE message. By default it is null.",
  send_privacy_id:
    "Choose Whether to Send the Privacy ID in SIP header or not. The default is No.<br>Yes: add Privacy:id to the INVITE message;<br>No: Don't add Privacy:id to the INVITE message.",
  options_interval:
    "The interval to send the OPTIONS message to check if this SIP trunk is available, calculated by second. The default setting null means no sending. By default it is null, which means not to send.",
  rx_volume:
    "Set the volume in the direction from the SIP phone to the IP port of PBX or choose Custom to define the RX Gain below. The value range is -4~4, with the default value of 0.",
  from_domain:
    "Use the value of this item to override the Domain field in the From header field while sending the INVITE message. By default it is null.",
  sip_force_contact:
    'When you select "rewrite-contact-IP", the host field representing contact is overwritten by the source address IP.',
  p_preferred_identity:
    "Set the value of P-Preferred-Identity carried in the SIP header field of the INVITE packet. It is None by default.<br><br>Setting Options:<br>· [Trunk Username]: the username you configured for the trunk or SYNSWITCH;<br>· [Extension Number]: the extension number (e.g. 1000);<br>· [DOD Number]: The DOD number corresponding to the extension in the DOD settings.<br>· [None]: do not send this parameter with the SIP INVITE packet.",
  p_asserted_identity:
    "Set the value of P-Asserted-Identity carried in the SIP header field of the INVITE packet. It is None by default.<br><br>Setting Options:<br>· [Trunk Username]: the username you configured for the trunk or SYNSWITCH;<br>· [Extension Number]: the extension number (e.g. 1000);<br>· [DOD Number]: The DOD number corresponding to the extension in the DOD settings.<br>· [None]: do not send this parameter with the SIP INVITE packet.",
  remote_party_id:
    "Set the value of Remote-Party-ID carried in the SIP header field of the INVITE packet. It is None by default.<br><br>Setting Options:<br>· [Trunk Username]: the username you configured for the trunk or SYNSWITCH;<br>· [Extension Number]: the extension number (e.g. 1000);<br>· [None]: do not send this parameter with the SIP INVITE packet.",
  contact:
    "Set the username in the Contact field in the SIP message sent by IPPBX to the SIP trunk. It is the trunk username by default.<br><br>Setting Options:<br>· [Trunk Username]: the username you configured for the trunk or SYNSWITCH;<br>· [Extension Number]: the extension number (e.g. 1000);",
  limit_max_calls:
    "Set the maximum number of concurrent calls for this SIP. The default value is 0 which means no limit.",
  enable_early_session:
    "Add the message header P-Early-Session: supported to the SIP message.",
  enable_early_media:
    "Add the message header P-Early-Media: supported to the SIP message.",
  user_phone:
    "You can add content to the To field of the INVITE message.",
  call_timeout:
    "Set the maximum response time of the trunk for a call out from it. The default value is 30s.",
  dtmf_transmit:
    "Choose DTMF Transmit Mode: inbound DTMF, RFC2833, SIP-INFO. Default is RFC2833.",
  max_call_duration:
    "Select the maximum call duration in seconds for every call of this trunk. If you wish to customize, enter the value in the text box directly. This option priority is higher than extensions. The default value is 6000(s). 0 means no limit.",
  dnis:
    "Dial Number Identification Service is used to identify which trunk a call comes in. It allows users to define the display name of an incoming call instead of the called number so that the phone will display the DNIS name when a call comes in on the corresponding trunk. It is unticked by default.",
  dod_name:
    'Configure DOD number and the associated DOD name. There are 2 ways to configure this:<br>· Bind one DOD number with one DOD name: enter one number in the "DOD Number" field and one name in the "DOD Name" field.<br>· Bind consecutive DOD numbers with one DOD name. To do this, enter the DOD number range and fill in a name in the "DOD Name" field.',
  dod_number:
    "Configure DOD number and the associated extensions. There are 2 ways to configure this:<br>· Bind one DOD number with one multiple extensions: enter one number select multiple extensions.<br>· Bind consecutive DOD numbers to multiple extensions with one-to-one correspondence. To do this, enter the DOD number range and select the extensions.",
  match_mode:
    '"^" Start Matching<br>"$" End Matching<br>E.g. ^123$ ...only the digits 1-2-3 dialed in that order match the rule<br>"|" means OR<br>E.g. ^123|456$ ... only the digits 1-2-3 or 4-5-6 match the rule<br>"[]" indicates a range for the single digit<br>E.g. [4-6] equals [456]<br>E.g. ^123[4-6]$ ... 1234, 1235, 1236 all match this rule<br>"\\d" means any digit 0-9, it is a single-digit wild card<br>E.g. ^123\\d$ the rule matches only 1-2-3 + any single digit 0-9<br>E.g. this might also be expressed as ^123[0-9]$<br>"+" matches one or multiple digits, it is a multi-digit wild card<br>E.g. ^123\\d+$ rule allows matching a series of digits (at least 4) which start with 123. E.g. 1234, 12300, ..., 123456789 all match<br>"*" matches none up to any number of digits<br>E.g. ^123\\d*$ means matching a series of digits (at least 3) which start with 123, e.g. 123, 1234, 12300, ..., 123400000 all match<br>"{}" wild card qualifiers<br>E.g. \\d{3} matches any 3-digits (each being 0-9)<br>E.g. ^602\\d{7}$ matches any 7-digit (0-9) number in Area Code 602<br>"()" used to group equations<br>E.g. ^(13[4-9]|147|15[0-2]) matches any strings that start with: 134,135,136,137,138,139,147,150,151,152<br>E.g. ^(13[4-9]|147|15)[0-2] matches any strings that start with: 1340,1341,1342,1350,1351,1352.....1390,1391,1392,1470,1471,1472,150,151,152<br>"." Matches any single digit, it is a single-digit wild card<br>E.g. any digit 0-9, *, #<br>Examples:<br>^123 matches any digit strings starting with 123, e.g. 123, 12345, 123abc<br>123$ matches any digit strings ending with 123, e.g. 123, 666123, abc123<br>.* matches any single digit as well as any string of digits.',
  strip: "Remove the prefix of an incoming call number.",
  prepend: "Add the prefix content after removing the prefix.",
};

export const SIP_REGISTER_COUNTRY_OPTIONS = [
  "General",
  "India",
  "United States",
  "United Kingdom",
  "Australia",
  "Canada",
];
export const SIP_REGISTER_TRANSPORT_OPTIONS = ["udp", "tcp", "tls"];
export const SIP_REGISTER_YES_NO = ["Yes", "No"];
export const SIP_REGISTER_ETH_PORT_OPTIONS = ["ETH0", "ETH1"];
export const SIP_REGISTER_OUTBOUND_CID_SOURCE_OPTIONS = [
  "Transparent caller",
  "Register Name",
];
export const SIP_REGISTER_HEADER_ID_OPTIONS = ["None", "Disabled", "Enabled"];
export const SIP_REGISTER_CONTACT_OPTIONS = [
  "Extension Number",
  "Trunk User Name",
];
export const SIP_REGISTER_DTMF_OPTIONS = [
  "RFC2833",
  "Inbound DTMF",
  "Sip-Info",
];
