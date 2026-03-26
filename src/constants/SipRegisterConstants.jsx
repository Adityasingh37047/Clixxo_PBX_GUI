export const sipRegisterFields = [
  { name: 'index', label: 'Index', type: 'text', defaultValue: '0' },
  { name: 'trunk_id', label: 'Trunk ID', type: 'text', defaultValue: '' },
  { name: 'username', label: 'Username', type: 'text', defaultValue: '' },
  { name: 'password', label: 'Password', type: 'password', defaultValue: '' },
  { name: 'context', label: 'Context', type: 'text', defaultValue: '' },
  { name: 'allow_codecs', label: 'Allow Codecs', type: 'checkbox', defaultValue: '' },
  { name: 'expire_in_sec', label: 'Expire In Sec', type: 'text', defaultValue: '' },
  { name: 'provider', label: 'Provider', type: 'text', defaultValue: '' },
  { name: 'sip_header', label: 'SIP Header', type: 'text', defaultValue: '' },
  { name: 'Domain name', label: 'Domain name', type: 'text', defaultValue: '' },
  { name: 'Contact User', label: 'Contact User', type: 'text', defaultValue: '' },
  { name: 'Outbound Proxy', label: 'Outbound Proxy', type: 'text', defaultValue: '' },
  { name: 'server_domain', label: 'Server Domain', type: 'text', defaultValue: '' },
  { name: 'client_domain', label: 'Client Domain', type: 'text', defaultValue: '' },
  { name: 'from_user', label: 'From User', type: 'text', defaultValue: '' },
  { name: 'identity_ip', label: 'Identifier IP', type: 'text', defaultValue: '' },

];

export const SIP_REGISTER_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'index', label: 'Index' },
  { key: 'trunk_id', label: 'Trunk ID' },
  { key: 'username', label: 'Username' },
  { key: 'context', label: 'Context' },
  { key: 'allow_codecs', label: 'Allow Codecs' },
  { key: 'expire_in_sec', label: 'Expire In Sec' },
  { key: 'provider', label: 'Provider' },
  { key: 'sip_header', label: 'SIP Header' },
  { key: 'registerStatus', label: 'Status' },
  { key: 'modify', label: 'Modify' },
];

export const CODEC_OPTIONS = [
  { value: 'ulaw', label: 'ulaw' },
  { value: 'alaw', label: 'alaw' },
  { value: 'gsm', label: 'gsm' },
  { value: 'g726', label: 'g726' },
  { value: 'g722', label: 'g722' },
  { value: 'g729', label: 'g729' },
];

/** Extra UI fields for IPPBX-style trunk modal (tabs); not all are sent to API. */
export const SIP_REGISTER_UI_DEFAULTS = {
  ui_trunk_type: 'sip',
  ui_country: 'General',
  ui_transport: 'udp',
  ui_enable_srtp: false,
  ui_register: 'No',
  ui_outbound_cid_source: 'Transparent caller',
  ui_show_outbound_cid_name: true,
  ui_outbound_cid_name: '',
  ui_outbound_cid_number: '',
  ui_reg_fail_retry: '30',
  ui_match_username: 'Yes',
  ui_enable_proxy: false,
  ui_proxy_ip: '',
  ui_record: 'No',
  ui_enabled: 'Yes',
  ui_eth_port: 'ETH0',
  ui_get_called_id_type: '',
  ui_options_interval: '',
  ui_tx_volume: '0',
  ui_rx_volume: '0',
  ui_send_privacy_id: 'No',
  ui_sip_force_contact: '',
  ui_p_preferred_identity: 'None',
  ui_remote_party_id: 'None',
  ui_p_asserted_identity: 'None',
  ui_contact_mode: 'Trunk User Name',
  ui_limit_max_calls: '0',
  ui_enable_early_media: 'No',
  ui_call_timeout: '30',
  ui_max_call_duration: '6000',
  ui_dnis: false,
  ui_enable_early_session: 'No',
  ui_user_phone: false,
  ui_dtmf_transmit: 'RFC2833',
};

export const SIP_REGISTER_INITIAL_FORM = {
  ...sipRegisterFields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue;
    return acc;
  }, {}),
  ...SIP_REGISTER_UI_DEFAULTS,
};

export const SIP_REGISTER_COUNTRY_OPTIONS = ['General', 'India', 'United States', 'United Kingdom', 'Australia', 'Canada'];
export const SIP_REGISTER_TRANSPORT_OPTIONS = ['udp', 'tcp', 'tls'];
export const SIP_REGISTER_YES_NO = ['Yes', 'No'];
export const SIP_REGISTER_ETH_PORT_OPTIONS = ['ETH0', 'ETH1'];
export const SIP_REGISTER_OUTBOUND_CID_SOURCE_OPTIONS = ['Transparent caller', 'Register Name'];
export const SIP_REGISTER_HEADER_ID_OPTIONS = ['None', 'Disabled', 'Enabled'];
export const SIP_REGISTER_CONTACT_OPTIONS = ['Extension Number', 'Trunk User Name'];
export const SIP_REGISTER_DTMF_OPTIONS = ['RFC2833', 'Inbound DTMF', 'Sip-Info'];
