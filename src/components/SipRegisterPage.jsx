import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  sipRegisterFields,
  SIP_REGISTER_INITIAL_FORM,
  CODEC_OPTIONS,
  SIP_REGISTER_COUNTRY_OPTIONS,
  SIP_REGISTER_TRANSPORT_OPTIONS,
  SIP_REGISTER_YES_NO,
  SIP_REGISTER_ETH_PORT_OPTIONS,
  SIP_REGISTER_OUTBOUND_CID_SOURCE_OPTIONS,
  SIP_REGISTER_HEADER_ID_OPTIONS,
  SIP_REGISTER_CONTACT_OPTIONS,
  SIP_REGISTER_DTMF_OPTIONS,
} from '../constants/SipRegisterConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import AddIcon from '@mui/icons-material/Add';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
} from '@mui/material';
import { fetchSipAccounts, listSipTrunks, createSipTrunk, updateSipTrunk, deleteSipTrunk, fetchSystemInfo } from '../api/apiService';



const SipRegisterPage = () => {
  // State
  const [trunks, setTrunks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(SIP_REGISTER_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const hasInitialLoadRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = React.useRef(null);
  const [modalTab, setModalTab] = useState('basic');
  const [dodRows, setDodRows] = useState([]);
  const [dodSelected, setDodSelected] = useState([]);
  const [adaptRows, setAdaptRows] = useState([{ matchMode: '', strip: '', prepend: '' }]);
  const [dnisRows, setDnisRows] = useState([{ dnisNumber: '', dnisName: '', replaceCid: 'No' }]);
  const [ethPortOptions, setEthPortOptions] = useState(
    SIP_REGISTER_ETH_PORT_OPTIONS.map((v) => ({ value: v, label: v }))
  );
  const [ethPortLoading, setEthPortLoading] = useState(false);
  
  // Scroll state for custom horizontal scrollbar
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, width: 0, scrollWidth: 0 });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);
  
  // Fields to hide from the table
  const HIDDEN_TABLE_FIELDS = ['password', 'provider', 'Domain name', 'Contact User', 'Outbound Proxy', 'sip_header', 'from_user', 'expire_in_sec', 'context', 'allow_codecs'];
  const visibleFieldsCount = sipRegisterFields.filter(f => !HIDDEN_TABLE_FIELDS.includes(f.name)).length;
  const PREFERRED_ASSERTED_IDENTITY_OPTIONS = ['None', 'Extension Number', 'Trunk User Name', 'DOD Number'];
  const REMOTE_PARTY_ID_OPTIONS = ['None', 'Extension Number', 'Trunk User Name'];
  const CONTACT_MODE_OPTIONS = ['Extension Number', 'Trunk User Name'];

  // DOD Add modal (DNIS-like extension dual-list)
  const [showDodAddModal, setShowDodAddModal] = useState(false);
  const [dodAddName, setDodAddName] = useState('');
  const [dodAddNumber, setDodAddNumber] = useState('');
  const [dodMemberExtensions, setDodMemberExtensions] = useState([]);
  const [dodAvailableSelected, setDodAvailableSelected] = useState([]);
  const [dodChosenSelected, setDodChosenSelected] = useState([]);
  const [dodAvailableExtensions, setDodAvailableExtensions] = useState([]);
  const dodHasLoadedExtensionsRef = useRef(false);

  const dodExtensionLabelMap = useMemo(() => {
    const map = new Map();
    dodAvailableExtensions.forEach((e) => map.set(e.value, e.label));
    return map;
  }, [dodAvailableExtensions]);

  const getDodExtLabel = (ext) => dodExtensionLabelMap.get(ext) || ext;

  const dodAvailableList = useMemo(
    () => dodAvailableExtensions.filter((e) => !dodMemberExtensions.includes(e.value)),
    [dodAvailableExtensions, dodMemberExtensions]
  );

  const resetDodAddForm = () => {
    setDodAddName('');
    setDodAddNumber('');
    setDodMemberExtensions([]);
    setDodAvailableSelected([]);
    setDodChosenSelected([]);
  };

  const loadDodExtensions = async () => {
    try {
      const res = await fetchSipAccounts();
      const sipList = Array.isArray(res?.message) ? res.message : Array.isArray(res?.data) ? res.data : [];
      const exts = sipList
        .filter((e) => e && e.extension)
        .map((e) => ({
          value: String(e.extension),
          label: `${(e.display_name || e.name || String(e.extension)).trim()}-${String(e.extension)}`,
        }))
        .sort((a, b) => {
          const an = parseInt(a.value, 10);
          const bn = parseInt(b.value, 10);
          if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn) return an - bn;
          return a.label.localeCompare(b.label);
        });
      setDodAvailableExtensions(exts);
      dodHasLoadedExtensionsRef.current = true;
    } catch (e) {
      showMessage('error', e?.message || 'Failed to load extensions');
      setDodAvailableExtensions([]);
      dodHasLoadedExtensionsRef.current = true;
    }
  };

  const handleOpenDodAddModal = async () => {
    resetDodAddForm();
    setShowDodAddModal(true);
    if (!dodHasLoadedExtensionsRef.current) await loadDodExtensions();
  };

  const dodAddSelectedMembers = () => {
    if (!dodAvailableSelected.length) return;
    setDodMemberExtensions((prev) => [...prev, ...dodAvailableSelected.filter((id) => !prev.includes(id))]);
    setDodAvailableSelected([]);
  };

  const dodAddAllMembers = () => {
    setDodMemberExtensions(dodAvailableExtensions.map((e) => e.value));
    setDodAvailableSelected([]);
  };

  const dodRemoveSelectedMembers = () => {
    if (!dodChosenSelected.length) return;
    setDodMemberExtensions((prev) => prev.filter((id) => !dodChosenSelected.includes(id)));
    setDodChosenSelected([]);
  };

  const dodRemoveAllMembers = () => {
    setDodMemberExtensions([]);
    setDodChosenSelected([]);
  };

  const handleConfirmDodAdd = () => {
    const name = dodAddName.trim();
    const number = dodAddNumber.trim();
    if (!name) return showMessage('error', 'DOD Name is required');
    if (!number) return showMessage('error', 'DOD Number is required');
    if (!dodMemberExtensions.length) return showMessage('error', 'Please select at least one extension');

    setDodRows((prev) => [
      ...prev,
      {
        dodName: name,
        dodNumber: number,
        bindExtensions: [...dodMemberExtensions],
      },
    ]);
    setDodSelected([]);
    setShowDodAddModal(false);
    resetDodAddForm();
  };

  // Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(trunks.length / itemsPerPage));
  const pagedTrunks = trunks.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Load trunks on component mount
  useEffect(() => {
    // Prevent duplicate calls during React StrictMode or development double-rendering
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadTrunks();
    }
  }, []);

  // Update scroll state when data changes
  useEffect(() => {
    const update = () => {
      if (tableScrollRef.current) {
        const el = tableScrollRef.current;
        setScrollState({ left: el.scrollLeft, width: el.clientWidth, scrollWidth: el.scrollWidth });
        setShowCustomScrollbar(el.scrollWidth > el.clientWidth);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [trunks, page]);

  // Load ETH port dropdown options when SIP Register modal opens.
  // This keeps the menu consistent and shows VPN options only when VPN interfaces are detected.
  useEffect(() => {
    if (!showModal) return;

    const getIpFromInterfaceObject = (obj) => {
      if (!obj || typeof obj !== 'object') return null;
      if (Array.isArray(obj['IP Address']) && obj['IP Address'][0]) return obj['IP Address'][0];
      if (Array.isArray(obj['Ip Address']) && obj['Ip Address'][0]) return obj['Ip Address'][0];
      if (Array.isArray(obj['ip_address']) && obj['ip_address'][0]) return obj['ip_address'][0];
      if (typeof obj['IP Address'] === 'string') return obj['IP Address'];
      if (typeof obj['Ip Address'] === 'string') return obj['Ip Address'];
      if (typeof obj['ip_address'] === 'string') return obj['ip_address'];
      return null;
    };

    const loadEthPortOptions = async () => {
      setEthPortLoading(true);
      try {
        const sysInfo = await fetchSystemInfo();
        const details = sysInfo?.details || {};
        const lanInterfaces = details.LAN_INTERFACES || details.lan_interfaces || null;

        const interfacesArray = Array.isArray(lanInterfaces)
          ? lanInterfaces
          : (lanInterfaces && typeof lanInterfaces === 'object')
              ? Object.entries(lanInterfaces).map(([name, data]) => ({ name, data }))
              : [];

        let vpnOpenVpnIp = null;
        let vpnSoftEtherIp = null;

        interfacesArray.forEach((iface) => {
          const name = String(iface?.name || iface?.Name || '').toLowerCase();
          const ip = getIpFromInterfaceObject(iface?.data || iface);

          if (ip) {
            if (name.includes('tap0') || name === 'tap0' || name.includes('tun0') || name === 'tun0') {
              vpnOpenVpnIp = vpnOpenVpnIp || ip;
            }
            if (name.includes('vpn_vpn') || name === 'vpn_vpn') {
              vpnSoftEtherIp = vpnSoftEtherIp || ip;
            }
          }
        });

        // Fallback to direct network object access
        const network = sysInfo?.network || {};
        vpnOpenVpnIp =
          vpnOpenVpnIp ||
          getIpFromInterfaceObject(network?.tap0) ||
          getIpFromInterfaceObject(network?.tun0);
        vpnSoftEtherIp =
          vpnSoftEtherIp ||
          getIpFromInterfaceObject(network?.vpn_vpn);

        const nextOptions = [
          { value: 'ETH0', label: 'ETH0' },
          { value: 'ETH1', label: 'ETH1' },
        ];

        if (vpnOpenVpnIp) {
          nextOptions.push({
            value: 'OpenVPN',
            label: vpnOpenVpnIp ? `OpenVPN (${vpnOpenVpnIp})` : 'OpenVPN',
          });
        }

        if (vpnSoftEtherIp) {
          nextOptions.push({
            value: vpnSoftEtherIp,
            label: `SoftEther VPN IP (${vpnSoftEtherIp})`,
          });
        }

        setEthPortOptions(nextOptions);

        const validValues = new Set(nextOptions.map((o) => o.value));
        setForm((prev) => {
          if (validValues.has(prev.ui_eth_port)) return prev;
          return { ...prev, ui_eth_port: nextOptions[0]?.value || prev.ui_eth_port };
        });
      } catch (e) {
        // If system info is not available, keep ETH0/ETH1 only.
        setEthPortOptions(SIP_REGISTER_ETH_PORT_OPTIONS.map((v) => ({ value: v, label: v })));
      } finally {
        setEthPortLoading(false);
      }
    };

    loadEthPortOptions();
  }, [showModal]);
  
  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleImportSubmit = async () => {
    if (!importFile) { showMessage('error', 'Please select a file to import'); return; }
    showMessage('info', 'Import API not yet configured');
  };

  const handleExport = () => {
    showMessage('info', 'Export API not yet configured');
  };
  
  // Helper to strip "sip:" prefix for display
  const stripSipPrefix = (value) => {
    if (!value) return '';
    return value.replace(/^sip:/i, '');
  };
  
  // Helper to add "sip:" prefix for API
  const addSipPrefix = (value) => {
    if (!value) return '';
    // Don't add if already has sip: prefix
    if (value.toLowerCase().startsWith('sip:')) return value;
    return `sip:${value}`;
  };
  
  // Fields that require "sip:" prefix
  const SIP_PREFIX_FIELDS = ['provider', 'sip_header', 'Outbound Proxy', 'server_domain', 'client_domain'];

  // Transform API data to UI format
  const transformApiToUi = (apiData) => {
    const toBool = (v) => {
      if (typeof v === 'boolean') return v;
      const s = v == null ? '' : String(v).toLowerCase();
      return s === 'true' || s === 'yes' || s === '1' || s === 'running' || s === 'connected';
    };

    const toYesNo = (v) => (toBool(v) ? 'Yes' : 'No');
    const normalizeTransport = (v) => {
      const s = v == null ? '' : String(v).toLowerCase();
      if (s === 'udp' || s === 'tcp' || s === 'tls') return s;
      return s || 'udp';
    };
    const mapEthPort = (v) => {
      const s = v == null ? '' : String(v);
      if (s.toLowerCase() === 'lan') return 'ETH0';
      if (s.toLowerCase() === 'wan') return 'ETH1';
      return s;
    };

    const mapOutboundCallerIdSource = (v) => {
      const s = v == null ? '' : String(v);
      if (s === 'register_name') return 'Register Name';
      return 'Transparent caller';
    };

    const mapRecording = (v) => {
      const s = v == null ? '' : String(v).toLowerCase();
      if (s === 'yes' || s === 'true') return 'Yes';
      return 'No';
    };

    const mapContactMode = (v) => {
      const s = v == null ? '' : String(v);
      if (s === 'trunk_username' || s.toLowerCase() === 'trunk user name') return 'Trunk User Name';
      if (s === 'extension_number' || s.toLowerCase() === 'extension number') return 'Extension Number';
      return 'Trunk User Name';
    };

    const parseSelectedCodecs = (codecsObj) => {
      if (!codecsObj || typeof codecsObj !== 'object') return '';
      const selected = Object.entries(codecsObj)
        .filter(([, enabled]) => !!enabled)
        .map(([codec]) => codec);
      return selected.join(',');
    };

    const deriveUiRegister = (registerVal, expireSecondsVal) => {
      // Backend may send boolean `register: true/false` or string.
      // Prefer `register` when provided; otherwise infer from expire seconds.
      const regBool = toBool(registerVal);
      if (regBool) return 'Yes';

      const exp = expireSecondsVal == null ? '' : String(expireSecondsVal);
      // If expire is non-zero, treat as registered.
      return exp === '0' || exp === '' ? 'No' : 'Yes';
    };

    const items = Array.isArray(apiData) ? apiData : [];
    return items.map((item, index) => {
      const trunkId = item?.trunk_id ?? item?.trunkId ?? '';

      const codecsObj = item?.codecs || {};
      const allow_codecs = parseSelectedCodecs(codecsObj);

      const expireSeconds = item?.expire_seconds ?? item?.expire_in_sec ?? '';
      const ui_register = deriveUiRegister(item?.register, expireSeconds);
      const expire_in_sec = ui_register === 'No' ? '0' : String(expireSeconds ?? '');

      const eth_port = mapEthPort(item?.eth_port ?? '');

      const ui_country = item?.country ?? 'General';
      const ui_transport = normalizeTransport(item?.transport ?? 'udp');
      const ui_enable_srtp = toBool(item?.enable_srtp);
      const ui_match_username = toYesNo(item?.match_username);
      // Backend may send enable_proxy/proxy_ip either at root or inside `advance`
      // Backend responses sometimes use `outbound_proxy` instead of `proxy_ip`
      // and may omit `enable_proxy` even when a proxy exists.
      const outboundProxyVal =
        item?.proxy_ip ??
        item?.advance?.proxy_ip ??
        item?.advance?.proxyIp ??
        item?.outbound_proxy ??
        item?.advance?.outbound_proxy ??
        '';

      const ui_enable_proxy =
        toBool(item?.enable_proxy ?? item?.advance?.enable_proxy) ||
        (outboundProxyVal != null && String(outboundProxyVal).trim() !== '' && String(outboundProxyVal).trim().toLowerCase() !== 'none');

      const ui_outbound_cid_source = mapOutboundCallerIdSource(item?.outbound_callerid ?? '');
      const ui_show_outbound_cid_name = toBool(item?.show_outbound_cid_name);

      const ui_record = mapRecording(item?.recording);
      const ui_enabled = toYesNo(item?.enabled);

      const advance = item?.advance || {};
      const ui_contact_mode = mapContactMode(advance?.contact);

      const ui_send_privacy_id = (String(advance?.send_privacy_id ?? '')).toLowerCase() === 'yes' ? 'Yes' : 'No';
      const ui_enable_early_session = (String(advance?.enable_early_session ?? '')).toLowerCase() === 'yes' ? 'Yes' : 'No';
      const ui_enable_early_media = (String(advance?.enable_early_media ?? '')).toLowerCase() === 'yes' ? 'Yes' : 'No';

      const registerStatus = item?.registration_status ?? item?.register_status ?? '';

      const dodRows = Array.isArray(item?.dod)
        ? item.dod.map((d) => ({
            dodName: d?.dod_name ?? d?.dodName ?? '',
            dodNumber: d?.dod_number ?? d?.dodNumber ?? '',
            bindExtensions: Array.isArray(d?.extensions)
              ? d.extensions.map(String)
              : Array.isArray(d?.extension)
                ? d.extension.map(String)
                : [],
          }))
        : [];

      const adaptRows = Array.isArray(item?.adapt_callerid)
        ? item.adapt_callerid.map((a) => ({
            matchMode: a?.match_mode ?? a?.matchMode ?? '',
            strip: a?.strip ?? '',
            prepend: a?.prepend ?? '',
          }))
        : [{ matchMode: '', strip: '', prepend: '' }];

      const result = {
        index: index.toString(),

        // Table fields (legacy list rendering)
        trunk_id: trunkId,
        username: item?.username ?? '',
        context: item?.context ?? '',
        allow_codecs,
        expire_in_sec,
        provider: stripSipPrefix(item?.trunk_ip_domain ?? item?.provider ?? ''),
        password: item?.password ?? '',
        sip_header: stripSipPrefix(item?.sip_header ?? ''),
        'Domain name': item?.['Domain name'] ?? item?.from_domain ?? '',
        'Contact User': item?.['Contact User'] ?? item?.contact_user ?? '',
        'Outbound Proxy': stripSipPrefix(item?.['Outbound Proxy'] ?? item?.outbound_proxy ?? ''),
        server_domain: stripSipPrefix(item?.server_domain ?? ''),
        client_domain: stripSipPrefix(item?.client_domain ?? ''),
        auth_username: item?.auth_username ?? item?.auth_user ?? item?.authUser ?? '',
        // Keep From User bound to backend `from_user` only.
        // `auth_username` is a different server field and should not auto-fill this UI input.
        from_user: item?.from_user ?? '',
        identity_ip: item?.identity_ip ?? '',
        registerStatus: registerStatus || '',

        // Modal/UI fields
        ui_country,
        ui_transport,
        ui_enable_srtp,
        ui_register,
        ui_reg_fail_retry: String(item?.reg_fail_retry ?? ''),
        ui_match_username,
        ui_enable_proxy,
        ui_proxy_ip: stripSipPrefix(outboundProxyVal),
        ui_outbound_cid_source,
        ui_show_outbound_cid_name,
        ui_outbound_cid_name: item?.outbound_cid_name ?? '',
        ui_outbound_cid_number: item?.outbound_cid_number ?? '',
        ui_record,
        ui_enabled,
        ui_eth_port: eth_port,

        // Basic form fields
        ui_trunk_type: item?.trunk_type ?? 'sip',

        // Advance form fields
        ui_get_called_id_type: advance?.get_called_id_type ?? '',
        ui_options_interval: advance?.options_interval_s ?? '',
        ui_tx_volume: String(advance?.tx_volume ?? '0'),
        ui_rx_volume: String(advance?.rx_volume ?? '0'),
        ui_send_privacy_id,
        ui_sip_force_contact: advance?.sip_force_contact ?? '',
        ui_p_preferred_identity: advance?.p_preferred_identity ?? 'None',
        ui_p_asserted_identity: advance?.p_asserted_identity ?? 'None',
        ui_remote_party_id: advance?.remote_party_id ?? 'None',
        ui_contact_mode,
        ui_limit_max_calls: String(advance?.limit_max_calls ?? '0'),
        ui_enable_early_session,
        ui_enable_early_media,
        ui_user_phone: toBool(advance?.user_phone),
        ui_call_timeout: String(advance?.call_timeout_s ?? '30'),
        ui_max_call_duration: String(advance?.max_call_duration_s ?? '6000'),
        ui_dnis: toBool(advance?.dnis),
        ui_dtmf_transmit: advance?.dtmf_transmit_mode ?? 'RFC2833',

        // Complex sections
        dodRows,
        adaptRows,
      };

      return result;
    });
  };
  
  // Transform UI data to API format
  const transformUiToApi = (uiData) => {
    const toLowerYesNo = (v) => (v === 'Yes' ? 'yes' : 'no');
    const toYesNoBool = (v) => v === 'Yes';

    const selectedCodecsSet = new Set(
      (uiData.allow_codecs || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );

    const codecs = {};
    CODEC_OPTIONS.forEach((c) => {
      codecs[c.value] = selectedCodecsSet.has(c.value);
    });

    const outboundCallerId =
      uiData.ui_outbound_cid_source === 'Register Name' ? 'register_name' : 'transparent_caller';

    const contact =
      uiData.ui_contact_mode === 'Trunk User Name' ? 'trunk_username' : 'extension_number';

    const advance = {
      get_called_id_type: uiData.ui_get_called_id_type ?? '',
      options_interval_s: uiData.ui_options_interval ?? '',
      tx_volume: uiData.ui_tx_volume ?? '0',
      rx_volume: uiData.ui_rx_volume ?? '0',
      send_privacy_id: toLowerYesNo(uiData.ui_send_privacy_id),
      sip_force_contact: uiData.ui_sip_force_contact ?? '',
      p_preferred_identity: uiData.ui_p_preferred_identity ?? 'None',
      p_asserted_identity: uiData.ui_p_asserted_identity ?? 'None',
      remote_party_id: uiData.ui_remote_party_id ?? 'None',
      contact,
      limit_max_calls: uiData.ui_limit_max_calls ?? '0',
      enable_early_session: toLowerYesNo(uiData.ui_enable_early_session),
      enable_early_media: toLowerYesNo(uiData.ui_enable_early_media),
      user_phone: !!uiData.ui_user_phone,
      call_timeout_s: uiData.ui_call_timeout ?? '30',
      max_call_duration_s: uiData.ui_max_call_duration ?? '6000',
      dnis: !!uiData.ui_dnis,
      dtmf_transmit_mode: uiData.ui_dtmf_transmit ?? 'RFC2833',
    };

    const dod = (dodRows || []).map((row) => ({
      dod_name: row.dodName ?? '',
      dod_number: row.dodNumber ?? '',
      extensions: Array.isArray(row.bindExtensions)
        ? row.bindExtensions.map(String)
        : [],
    }));

    const adapt_callerid = (adaptRows || []).map((row) => ({
      match_mode: row.matchMode ?? '',
      strip: row.strip ?? '',
      prepend: row.prepend ?? '',
    }));

    return {
      trunk_id: uiData.trunk_id,
      trunk_name: uiData.trunk_id, // UI currently edits trunk_id only; reuse for trunk_name
      country: uiData.ui_country,
      transport: String(uiData.ui_transport || 'udp').toUpperCase(),
      enable_srtp: !!uiData.ui_enable_srtp,
      register: uiData.ui_register === 'Yes' ? 'yes' : 'no',
      username: uiData.username ?? '',
      auth_username: uiData.auth_username ?? '',
      password: uiData.password ?? '',
      reg_fail_retry: uiData.ui_reg_fail_retry ?? 30,
      expire_seconds: uiData.ui_register === 'No' ? 0 : uiData.expire_in_sec ?? 1800,
      match_username: toYesNoBool(uiData.ui_match_username),
      enable_proxy: !!uiData.ui_enable_proxy,
      proxy_ip: uiData.ui_proxy_ip ?? '',
      trunk_ip_domain: uiData.provider ?? '',
      outbound_callerid: outboundCallerId,
      show_outbound_cid_name: !!uiData.ui_show_outbound_cid_name,
      outbound_cid_name: uiData.ui_outbound_cid_name ?? '',
      outbound_cid_number: uiData.ui_outbound_cid_number ?? '',
      recording: toLowerYesNo(uiData.ui_record),
      enabled: uiData.ui_enabled === 'Yes',
      eth_port: uiData.ui_eth_port ?? 'ETH0',
      context: uiData.context ?? '',
      from_user: uiData.from_user ?? '',

      codecs,
      advance,
      dod,
      adapt_callerid,
    };
  };
  
  // Load trunks from API
  const loadTrunks = async (isRefresh = false) => {
    // Prevent concurrent calls
    if (loading.fetch) {
      return;
    }
    
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      console.log('Attempting to load SIP trunks...');
      const response = await listSipTrunks();
      console.log('SIP trunks response:', response);
      if (response.response && response.message) {
        const transformedTrunks = transformApiToUi(response.message);
        console.log('Transformed trunks:', transformedTrunks);
        setTrunks(transformedTrunks);
      } else {
        console.log('Invalid response format:', response);
        showMessage('error', 'Failed to load SIP trunks');
      }
    } catch (error) {
      console.error('Error loading SIP trunks:', error);
      if (!isRefresh) {
        // Only show error on initial load, not on refresh after operations
        if (error.message === 'Network Error') {
          showMessage('error', 'Network error. Please check your connection.');
        } else if (error.response?.status === 500) {
          showMessage('error', 'Server error. The list endpoint may have issues.');
        } else {
          showMessage('error', error.message || 'Failed to load SIP trunks');
        }
      } else {
        // For refresh errors, just log them - don't disturb the user
        console.warn('Refresh failed, keeping existing data:', error.message);
      }
      // Only set empty array on initial load failure, not on refresh
      if (!isRefresh) {
        setTrunks([]);
      }
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };
  // Modal logic
  const handleOpenModal = (row = null, idx = null) => {
    setModalTab('basic');
    setDodSelected([]);
    setAdaptRows([{ matchMode: '', strip: '', prepend: '' }]);
    setDnisRows([{ dnisNumber: '', dnisName: '', replaceCid: 'No' }]);
    setValidationErrors({});
    if (row && idx !== null) {
      const uiReg = row.ui_register ?? (String(row.expire_in_sec ?? '') === '0' ? 'No' : 'Yes');
      setForm({ ...SIP_REGISTER_INITIAL_FORM, ...row, ui_register: uiReg });
      setEditIndex(idx);
      setDodRows(Array.isArray(row.dodRows) ? row.dodRows : []);
      setAdaptRows(Array.isArray(row.adaptRows) && row.adaptRows.length ? row.adaptRows : [{ matchMode: '', strip: '', prepend: '' }]);
      setDnisRows(Array.isArray(row.dnisRows) && row.dnisRows.length ? row.dnisRows : [{ dnisNumber: '', dnisName: '', replaceCid: 'No' }]);
    } else {
      const nextIndex = trunks.length.toString();
      setForm({
        ...SIP_REGISTER_INITIAL_FORM,
        index: nextIndex,
      });
      setEditIndex(null);
      setDodRows([]);
    }
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setModalTab('basic');
    setDodRows([]);
    setDodSelected([]);
    setAdaptRows([{ matchMode: '', strip: '', prepend: '' }]);
    setDnisRows([{ dnisNumber: '', dnisName: '', replaceCid: 'No' }]);
    setShowPassword(false); // Reset password visibility when closing modal
    setValidationErrors({}); // Clear validation errors when closing modal
  };
  const handleChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'ui_register') {
        if (value === 'Yes') {
          // Default expire when switching Register=Yes (matches screenshot)
          if (!next.expire_in_sec || String(next.expire_in_sec).trim() === '') next.expire_in_sec = '1800';
        } else {
          // When Register=No, expire is forced to 0 for save payload.
          next.expire_in_sec = '0';
        }
      }
      return next;
    });
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
    
    // Real-time validation for specific fields
    let error = null;
    switch (key) {
      case 'trunk_id':
        error = validateTrunkId(value);
        break;
      case 'username':
        error = validateUsername(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'context':
        error = validateContext(value);
        break;
      case 'allow_codecs':
        error = validateAllowCodecs(value);
        break;
      case 'expire_in_sec':
        error = validateExpireInSec(value);
        break;
      case 'provider':
        error = validateProvider(value);
        break;
      case 'sip_header':
        error = validateSipHeader(value);
        break;
      case 'server_domain':
        error = validateServerDomain(value);
        break;
      case 'client_domain':
        error = validateClientDomain(value);
        break;
      case 'identity_ip':
        error = validateIdentityIp(value);
        break;
      case 'ui_reg_fail_retry':
        if (!value || String(value).trim() === '') error = 'RegFail Retry is required';
        else if (!/^\d+$/.test(String(value).trim())) error = 'RegFail Retry must be a number';
        break;
      case 'ui_proxy_ip':
        if (form.ui_enable_proxy && (!value || String(value).trim() === '')) error = 'Proxy IP is required';
        break;
      case 'ui_match_username':
        if (value !== 'Yes' && value !== 'No') error = 'Match Username must be Yes or No';
        break;
      case 'ui_country':
        if (!value || String(value).trim() === '') error = 'Country is required';
        break;
      default:
        break;
    }
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, [key]: error }));
    }
  };
  
  const handleCodecChange = (codec, checked) => {
    setForm(prev => {
      const currentCodecs = prev.allow_codecs ? prev.allow_codecs.split(',').map(c => c.trim()) : [];
      let newCodecs;
      
      if (checked) {
        // Add codec if not already present
        if (!currentCodecs.includes(codec)) {
          newCodecs = [...currentCodecs, codec];
        } else {
          newCodecs = currentCodecs;
        }
    } else {
        // Remove codec
        newCodecs = currentCodecs.filter(c => c !== codec);
      }
      
      const newCodecsString = newCodecs.join(',');
      
      // Clear validation error for allow_codecs when user changes codecs
      if (validationErrors.allow_codecs) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.allow_codecs;
          return newErrors;
        });
      }
      
      // Real-time validation
      const codecError = validateAllowCodecs(newCodecsString);
      if (codecError) {
        setValidationErrors(prev => ({ ...prev, allow_codecs: codecError }));
      }
      
      return { ...prev, allow_codecs: newCodecsString };
    });
  };
  
  const isCodecSelected = (codec) => {
    if (!form.allow_codecs) return false;
    const currentCodecs = form.allow_codecs.split(',').map(c => c.trim());
    return currentCodecs.includes(codec);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Validation functions
  const validateTrunkId = (trunkId) => {
    if (!trunkId || trunkId.trim() === '') {
      return 'Trunk ID is required';
    }
    return null;
  };
  
  const validateUsername = (username) => {
    if (!username || username.trim() === '') {
      return 'Username is required';
    }
    return null;
  };
  
  const validatePassword = (password) => {
    if (!password || password.trim() === '') {
      return 'Password is required';
    }
    return null;
  };
  
  const validateContext = (context) => {
    if (!context || context.trim() === '') {
      return 'Context is required';
    }
    return null;
  };
  
  const validateAllowCodecs = (allowCodecs) => {
    if (!allowCodecs || allowCodecs.trim() === '') {
      return 'Allow Codecs is required';
    }
    return null;
  };
  
  const validateExpireInSec = (expireInSec) => {
    const valueStr = expireInSec == null ? '' : String(expireInSec);
    if (valueStr.trim() === '') return 'Expire In Sec is required';
    // Optional: ensure it is a positive integer
    if (!/^\d+$/.test(valueStr)) return 'Expire In Sec must be a number';
    return null;
  };
  
  const validateProvider = (provider) => {
    if (!provider || provider.trim() === '') {
      return 'Provider is required (e.g., example.com:5060)';
    }
    return null;
  };
  
  const validateSipHeader = (sipHeader) => {
    if (!sipHeader || sipHeader.trim() === '') {
      return 'SIP Header is required (e.g., example.com)';
    }
    return null;
  };
  
  const validateServerDomain = (serverDomain) => {
    if (!serverDomain || serverDomain.trim() === '') {
      return 'Server Domain is required (e.g., sip.domain.in)';
    }
    return null;
  };
  
  const validateClientDomain = (clientDomain) => {
    if (!clientDomain || clientDomain.trim() === '') {
      return 'Client Domain is required (e.g., +91XXXXXXXXXX@sip.domain.in)';
    }
    return null;
  };
  
  const validateIdentityIp = (identityIp) => {
    if (!identityIp || identityIp.trim() === '') {
      return 'Identity IP is required (e.g., 15.158.34.15)';
    }
    return null;
  };
  
  const validateForm = (data = form) => {
    const errors = {};

    const merged = {
      ...data,
      expire_in_sec: data.ui_register === 'No' ? '0' : data.expire_in_sec || '3600',
    };

    const isNonEmpty = (v) => v !== undefined && v !== null && String(v).trim() !== '';

    const trunkIdError = validateTrunkId(merged.trunk_id);
    if (trunkIdError) errors.trunk_id = trunkIdError;

    if (!merged.ui_country || String(merged.ui_country).trim() === '') {
      errors.ui_country = 'Country is required';
    }

    const allowCodecsError = validateAllowCodecs(merged.allow_codecs);
    if (allowCodecsError) errors.allow_codecs = allowCodecsError;

    if (merged.ui_register === 'Yes') {
      const usernameError = validateUsername(merged.username);
      if (usernameError) errors.username = usernameError;

      const passwordError = validatePassword(merged.password);
      if (passwordError) errors.password = passwordError;

      const providerError = validateProvider(merged.provider);
      if (providerError) errors.provider = providerError;

      const expireInSecError = validateExpireInSec(merged.expire_in_sec);
      if (expireInSecError) errors.expire_in_sec = expireInSecError;

      const regFailRetry = merged.ui_reg_fail_retry;
      if (!regFailRetry || String(regFailRetry).trim() === '') {
        errors.ui_reg_fail_retry = 'RegFail Retry is required';
      } else if (!/^\d+$/.test(String(regFailRetry).trim())) {
        errors.ui_reg_fail_retry = 'RegFail Retry must be a number';
      }

      if (merged.ui_match_username !== 'Yes' && merged.ui_match_username !== 'No') {
        errors.ui_match_username = 'Match Username must be Yes or No';
      }

      if (merged.ui_enable_proxy) {
        const proxyIp = merged.ui_proxy_ip;
        if (!proxyIp || String(proxyIp).trim() === '') {
          errors.ui_proxy_ip = 'Proxy IP is required';
        }
      }
    }

    // These fields are part of the previous "SIP registration" UI.
    // Since the UI no longer shows them (to match your screenshot),
    // they should be optional for save.
    if (isNonEmpty(merged.sip_header)) {
      const sipHeaderError = validateSipHeader(merged.sip_header);
      if (sipHeaderError) errors.sip_header = sipHeaderError;
    }

    if (isNonEmpty(merged.server_domain)) {
      const serverDomainError = validateServerDomain(merged.server_domain);
      if (serverDomainError) errors.server_domain = serverDomainError;
    }

    if (isNonEmpty(merged.client_domain)) {
      const clientDomainError = validateClientDomain(merged.client_domain);
      if (clientDomainError) errors.client_domain = clientDomainError;
    }

    if (isNonEmpty(merged.identity_ip)) {
      const identityIpError = validateIdentityIp(merged.identity_ip);
      if (identityIpError) errors.identity_ip = identityIpError;
    }

    return errors;
  };

  const buildMergedFormForSave = () => ({
    ...form,
    context: form.context || 'sip1',
    expire_in_sec: form.ui_register === 'No' ? '0' : form.expire_in_sec || '3600',
  });
  
  const handleSave = async () => {
    const mergedForm = buildMergedFormForSave();
    const validationErrors = validateForm(mergedForm);

    if (Object.keys(validationErrors).length > 0) {
      const firstKey = Object.keys(validationErrors)[0];
      if (['sip_header', 'server_domain', 'client_domain', 'identity_ip', 'Outbound Proxy'].includes(firstKey)) {
        setModalTab('advance');
      } else if (firstKey === 'allow_codecs') {
        setModalTab('codec');
      } else {
        setModalTab('basic');
      }
      showMessage('error', validationErrors[firstKey]);
      return;
    }

    // Prevent duplicate registration: same Trunk ID (name) + Username
    // (case-insensitive, trimmed). Allow when editing the same row.
    if (mergedForm.ui_register === 'Yes') {
      const norm = (v) => String(v ?? '').trim().toLowerCase();
      const nextTrunkId = norm(mergedForm.trunk_id);
      const nextUsername = norm(mergedForm.username);
      const duplicateIndex = trunks.findIndex((t, idx) => {
        if (editIndex !== null && idx === editIndex) return false;
        return norm(t?.trunk_id) === nextTrunkId && norm(t?.username) === nextUsername;
      });

      if (nextTrunkId && nextUsername && duplicateIndex !== -1) {
        showMessage('error', 'Duplicate trunk not allowed: same Trunk ID and Username already exists.');
        setModalTab('basic');
        return;
      }
    }

    setLoading(prev => ({ ...prev, save: true }));
    const closeModalAfterSuccess = () => {
      setShowModal(false);
      setEditIndex(null);
      setModalTab('basic');
      setDodRows([]);
      setDodSelected([]);
      setAdaptRows([{ matchMode: '', strip: '', prepend: '' }]);
      setDnisRows([{ dnisNumber: '', dnisName: '', replaceCid: 'No' }]);
      setShowPassword(false);
      setValidationErrors({});
    };

    try {
      const apiData = transformUiToApi(mergedForm);

      if (editIndex !== null) {
        console.log('Updating SIP trunk with data:', apiData);
        const response = await updateSipTrunk(apiData);
        console.log('Update response:', response);
        if (response.response) {
          showMessage('success', response.message || 'Trunk updated successfully');
          setForm((prev) => ({ ...prev, ...mergedForm }));
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            await loadTrunks(true);
          } catch (reloadError) {
            console.warn('Failed to reload trunks after update:', reloadError);
            setTrunks((prev) => prev.map((trunk, idx) => (idx === editIndex ? { ...trunk, ...mergedForm, registerStatus: 'registered' } : trunk)));
          }
          closeModalAfterSuccess();
        } else {
          showMessage('error', 'Failed to update trunk');
        }
      } else {
        console.log('Creating SIP trunk with data:', apiData);
        const response = await createSipTrunk(apiData);
        console.log('Create response:', response);
        if (response.response) {
          showMessage('success', response.message || 'Trunk created successfully');
          setForm((prev) => ({ ...prev, ...mergedForm }));
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            await loadTrunks(true);
          } catch (reloadError) {
            console.warn('Failed to reload trunks after creation:', reloadError);
            setTrunks((prev) => {
              const newTrunk = {
                index: prev.length.toString(),
                trunk_id: mergedForm.trunk_id,
                username: mergedForm.username,
                context: mergedForm.context,
                allow_codecs: mergedForm.allow_codecs,
                expire_in_sec: mergedForm.expire_in_sec,
                provider: mergedForm.provider,
                sip_header: mergedForm.sip_header,
                registerStatus: 'registered',
              };
              return [...prev, newTrunk];
            });
          }
          closeModalAfterSuccess();
        } else {
          showMessage('error', 'Failed to create trunk');
        }
      }
    } catch (error) {
      console.error('Error saving SIP trunk:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to save trunk');
      }
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };
  // Table selection logic
  const handleSelectRow = idx => {
    setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  };
  const handleCheckAll = () => setSelected(trunks.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () => setSelected(trunks.map((_, idx) => selected.includes(idx) ? null : idx).filter(i => i !== null));
  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage('error', 'Please select trunks to delete');
      return;
    }
    
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      console.log('Deleting selected trunks:', selected.map(idx => trunks[idx]?.trunk_id));
      const deletePromises = selected.map(async (idx) => {
        const trunk = trunks[idx];
        console.log('Deleting trunk:', trunk.trunk_id);
        return await deleteSipTrunk(trunk.trunk_id);
      });
      
      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value.response).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        showMessage('success', `${successCount} trunk(s) deleted successfully`);
        
        // Try to reload data, but don't fail if it doesn't work
        try {
          await loadTrunks(true); // Reload trunks to get fresh data
        } catch (reloadError) {
          console.warn('Failed to reload after delete, removing from local state:', reloadError);
          // Remove deleted items from local state as fallback
          setTrunks(prev => prev.filter((_, idx) => !selected.includes(idx)));
        }
        setSelected([]); // Clear selection
      }
      
      if (failCount > 0) {
        showMessage('error', `Failed to delete ${failCount} trunk(s)`);
      }
    } catch (error) {
      console.error('Error deleting SIP trunks:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to delete trunks');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };
  const handleClearAll = async () => {
    if (trunks.length === 0) {
      showMessage('info', 'No trunks to clear');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete ALL SIP trunks? This action cannot be undone.')) {
      return;
    }
    
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      console.log('Clearing all trunks:', trunks.map(t => t.trunk_id));
      const deletePromises = trunks.map(async (trunk) => {
        console.log('Deleting trunk:', trunk.trunk_id);
        return await deleteSipTrunk(trunk.trunk_id);
      });
      
      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value.response).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        showMessage('success', `All ${successCount} trunk(s) deleted successfully`);
        
        // Try to reload data, but don't fail if it doesn't work
        try {
          await loadTrunks(true); // Reload trunks to get fresh data
        } catch (reloadError) {
          console.warn('Failed to reload after clear all, clearing local state:', reloadError);
          // Clear all items from local state as fallback
          setTrunks([]);
        }
        setSelected([]);
        setPage(1);
      }
      
      if (failCount > 0) {
        showMessage('error', `Failed to delete ${failCount} trunk(s)`);
      }
    } catch (error) {
      console.error('Error clearing all SIP trunks:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to clear all trunks');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };
  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  // Scroll handling functions
  const handleTableScroll = (e) => setScrollState({ left: e.target.scrollLeft, width: e.target.clientWidth, scrollWidth: e.target.scrollWidth });
  const handleScrollbarDrag = (e) => {
    const track = e.target.parentNode;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    if (tableScrollRef.current) tableScrollRef.current.scrollLeft = (scrollState.scrollWidth - scrollState.width) * percent;
  };
  const handleArrowClick = (dir) => {
    if (tableScrollRef.current) tableScrollRef.current.scrollLeft += (dir === 'left' ? -100 : 100);
  };

  // Calculate scrollbar thumb dimensions
  const thumbWidth = scrollState.width && scrollState.scrollWidth ? Math.max(40, (scrollState.width / scrollState.scrollWidth) * (scrollState.width - 8)) : 40;
  const thumbLeft = scrollState.width && scrollState.scrollWidth && scrollState.scrollWidth > scrollState.width ? ((scrollState.left / (scrollState.scrollWidth - scrollState.width)) * (scrollState.width - thumbWidth - 16)) : 0;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{backgroundColor: "#dde0e4"}}>

      {/* Import Modal */}
      <Dialog
        open={showImportModal}
        onClose={() => { if (!importLoading) { setShowImportModal(false); setImportFile(null); } }}
        maxWidth={false}
        PaperProps={{ sx: { width: 420, maxWidth: '96vw', mx: 'auto', p: 0 } }}
      >
        <DialogTitle
          className="text-white text-center font-semibold p-2 text-base"
          style={{ background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)', borderBottom: '1px solid #444' }}
        >
          Import SIP Trunks
        </DialogTitle>
        <DialogContent style={{ backgroundColor: '#dde0e4', padding: '20px 24px 12px' }}>
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-[13px] text-gray-600">Select a CSV or JSON file containing SIP trunk data to import.</p>
            <div
              className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              onClick={() => importFileRef.current?.click()}
            >
              <div className="text-gray-500 text-[13px] mb-1">
                {importFile ? (
                  <span className="text-green-700 font-semibold">{importFile.name}</span>
                ) : (
                  <span>Click to choose file <span className="text-gray-400">(CSV / JSON)</span></span>
                )}
              </div>
              <input
                ref={importFileRef}
                type="file"
                accept=".csv,.json"
                className="hidden"
                onChange={e => setImportFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions style={{ backgroundColor: '#dde0e4', justifyContent: 'center', gap: 16, padding: '12px 24px 16px' }}>
          <Button
            variant="contained"
            onClick={handleImportSubmit}
            disabled={importLoading || !importFile}
            startIcon={importLoading && <CircularProgress size={16} color="inherit" />}
            sx={{ background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)', color: '#fff', fontWeight: 600, textTransform: 'none', minWidth: 100, '&:hover': { background: 'linear-gradient(to bottom, #0e8fd6, #3bb6f5)' } }}
          >
            {importLoading ? 'Importing...' : 'Import'}
          </Button>
          <Button
            variant="contained"
            onClick={() => { setShowImportModal(false); setImportFile(null); }}
            disabled={importLoading}
            sx={{ background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)', color: '#374151', fontWeight: 600, textTransform: 'none', minWidth: 100 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Message Display */}
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: '', text: '' })}
            sx={{
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3
          }}
        >
          {message.text}
        </Alert>
      )}

      {/* Main Content */}
      <div className="w-full max-w-full mx-auto">
        {/* Blue header bar - always show */}
        <div className="rounded-t-lg h-9 flex items-center justify-between px-3 font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
          <div className="flex-1" />
          <span>SIP Register</span>
          <div className="flex-1 flex justify-end gap-2">
            <button
              className="cursor-pointer font-semibold text-xs rounded px-4 py-1 transition-all active:scale-95"
              style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #dbeafe 100%)', color: '#1565c0', border: '1px solid #93c5fd', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to bottom, #dbeafe 0%, #bfdbfe 100%)'}
              onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(to bottom, #ffffff 0%, #dbeafe 100%)'}
              onClick={() => { setImportFile(null); setShowImportModal(true); }}
            >Import</button>
            <button
              className="cursor-pointer font-semibold text-xs rounded px-4 py-1 transition-all active:scale-95"
              style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #dbeafe 100%)', color: '#1565c0', border: '1px solid #93c5fd', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to bottom, #dbeafe 0%, #bfdbfe 100%)'}
              onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(to bottom, #ffffff 0%, #dbeafe 100%)'}
              onClick={handleExport}
            >Export</button>
          </div>
        </div>
        
        <div className="w-full max-w-full mx-auto" style={{ border: '2px solid #bbb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="bg-white rounded-lg shadow-sm w-full flex flex-col overflow-hidden">
            <div className="w-full border-b border-gray-300" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
              <div
                ref={tableScrollRef}
                onScroll={handleTableScroll}
                className="scrollbar-hide"
                style={{
                  overflowX: 'auto',
                  overflowY: 'auto',
                  maxHeight: 360,
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <table className="w-full min-w-[1400px] border border-gray-300 border-collapse whitespace-nowrap" style={{ tableLayout: 'auto', border: '1px solid #bbb' }}>
                  <thead>
                    <tr style={{ minHeight: 32 }}>
                      <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Check</th>
                      {sipRegisterFields.filter(f => !HIDDEN_TABLE_FIELDS.includes(f.name)).map(field => (
                        <th
                          key={field.name}
                          className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center"
                          style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}
                        >
                          {field.label}
                        </th>
                      ))}
                      <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Status</th>
                      <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Modify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading.fetch ? (
                      <tr>
                        <td colSpan={visibleFieldsCount + 3} className="border border-gray-300 px-2 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <CircularProgress size={20} />
                            <span>Loading trunks...</span>
                          </div>
                        </td>
                      </tr>
                    ) : trunks.length === 0 ? (
                      <tr>
                        <td colSpan={visibleFieldsCount + 3} className="border border-gray-300 px-2 py-1 text-center">No data</td>
                      </tr>
                    ) : (
                      pagedTrunks.map((trunk, idx) => {
                        const realIdx = (page - 1) * itemsPerPage + idx;
                        return (
                          <tr key={realIdx} style={{ minHeight: 32 }}>
                            <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                              <input
                                type="checkbox"
                                checked={selected.includes(realIdx)}
                                onChange={() => handleSelectRow(realIdx)}
                                disabled={loading.delete}
                              />
                            </td>
                            {sipRegisterFields.filter(f => !HIDDEN_TABLE_FIELDS.includes(f.name)).map(field => {
                              const value = trunk[field.name];
                              const hasValue = value !== undefined && value !== null && value !== '';
                              // Add sip: prefix for display in table for these fields
                              const displayValue = hasValue && SIP_PREFIX_FIELDS.includes(field.name) 
                                ? `sip:${value}` 
                                : (hasValue ? value : '--');
                              return (
                                <td
                                  key={field.name}
                                  className="border border-gray-300 text-center bg-white"
                                  style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}
                                >
                                  {displayValue}
                                </td>
                              );
                            })}
                            <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                trunk.registerStatus?.toLowerCase() === 'registered' ? 'bg-green-100 text-green-800' :
                                trunk.registerStatus?.toLowerCase() === 'unregistered' ? 'bg-red-100 text-red-800' :
                                trunk.registerStatus?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                                trunk.registerStatus?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {trunk.registerStatus || '--'}
                              </span>
                            </td>
                            <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                              <EditDocumentIcon 
                                className={`cursor-pointer text-blue-600 mx-auto ${loading.delete ? 'opacity-50' : ''}`} 
                                onClick={() => !loading.delete && handleOpenModal(trunk, realIdx)} 
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Custom scrollbar row below the table */}
            {showCustomScrollbar && (
            <div style={{ width: '100%', margin: '0 auto', background: '#f4f6fa', display: 'flex', alignItems: 'center', height: 24, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, border: 'none', borderTop: 'none', padding: '0 4px', boxSizing: 'border-box' }}>
              <div style={{ width: 18, height: 18, background: '#e3e7ef', border: '1px solid #bbb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#888', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleArrowClick('left')}>&#9664;</div>
              <div
                style={{ flex: 1, height: 12, background: '#e3e7ef', borderRadius: 8, position: 'relative', margin: '0 4px', overflow: 'hidden' }}
                onClick={handleScrollbarDrag}
              >
                <div
                  style={{
                    position: 'absolute',
                    height: 12,
                    background: '#888',
                    borderRadius: 8,
                    cursor: 'pointer',
                    top: 0,
                    width: thumbWidth,
                    left: thumbLeft,
                  }}
                  draggable
                  onDrag={handleScrollbarDrag}
                />
              </div>
              <div style={{ width: 18, height: 18, background: '#e3e7ef', border: '1px solid #bbb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#888', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleArrowClick('right')}>&#9654;</div>
            </div>
            )}
          </div>
        </div> 
        
        {/* Action and pagination rows OUTSIDE the border, visually separated backgrounds and gap */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full px-2 py-2" style={{ background: '#e3e7ef', marginTop: 12 }}>
          <div className="flex flex-wrap gap-2">
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleCheckAll}
              disabled={loading.delete}
            >
              Check All
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleUncheckAll}
              disabled={loading.delete}
            >
              Uncheck All
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleInverse}
              disabled={loading.delete}
            >
              Inverse
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleDelete}
              disabled={loading.delete}
            >
              {loading.delete && <CircularProgress size={12} />}
              Delete
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleClearAll}
              disabled={loading.delete}
            >
              {loading.delete && <CircularProgress size={12} />}
              Clear All
            </button>
          </div>
          <button 
            className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.save ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={() => handleOpenModal()}
            disabled={loading.save}
          >
            Add New
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
          <span>{trunks.length} items Total</span>
          <span>{itemsPerPage} Items/Page</span>
          <span>{page}/{totalPages}</span>
          <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(1)} disabled={page === 1}>First</button>
          <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</button>
          <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Next</button>
          <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}>Last</button>
          <span>Go to Page</span>
          <select className="text-xs rounded border border-gray-300 px-1 py-0.5 min-w-[40px]" value={page} onChange={e => handlePageChange(Number(e.target.value))}>
            {Array.from({ length: totalPages }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <span>{totalPages} Pages Total</span>
        </div>
          </div>

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: {
            width: 960,
            maxWidth: '98vw',
            mx: 'auto',
            p: 0,
            // Allow height to shrink/expand per tab while keeping the modal anchored
            // so it doesn't look like it "jumps" position.
            alignSelf: 'flex-start',
            mt: '6vh',
            mb: '6vh',
            transition: 'height 180ms ease',
          },
        }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle className="p-0 bg-white" sx={{ borderBottom: '1px solid #e5e7eb' }}>
          <div className="text-center text-lg font-semibold text-red-600 py-3 px-2">
            {editIndex !== null ? 'Edit SIP Register' : 'Add Trunk'}
          </div>
          <div className="flex flex-wrap gap-0 px-1 sm:px-2 bg-white border-t border-gray-100">
            {[
              { id: 'basic', label: 'BASIC' },
              { id: 'codec', label: 'CODEC' },
              { id: 'advance', label: 'ADVANCE' },
              { id: 'dod', label: 'DOD' },
              { id: 'adapt', label: 'ADAPT CALLER ID' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setModalTab(t.id)}
                className={`px-2 sm:px-4 py-2.5 text-[11px] sm:text-sm font-semibold tracking-wide border-b-2 -mb-px transition-colors ${
                  modalTab === t.id ? 'text-teal-600 border-teal-500' : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </DialogTitle>
        <DialogContent
          className="p-0"
          sx={{
            backgroundColor: '#dde0e4',
            border: '1px solid #444444',
            borderTop: 'none',
            // Keep modal stable across tab switches without forcing a fixed height.
            // It can grow with content until maxHeight, and shrink when a tab has fewer fields.
            maxHeight: 'min(72vh,760px)',
            overflowY: 'auto',
            // Reserve scrollbar space to prevent horizontal shift when switching tabs (supported in modern browsers).
            scrollbarGutter: 'stable',
            overflowX: 'hidden',
          }}
        >
          <div className="bg-[#f0f2f5]">
            <div className="p-3 sm:p-4">
              {modalTab === 'basic' && (
                <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-5 shadow-sm">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-10 gap-y-0">
                    <div className="space-y-0.5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">
                          TrunkType <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 min-w-0">
                          <RadioGroup row value={form.ui_trunk_type} onChange={(e) => handleChange('ui_trunk_type', e.target.value)}>
                            <FormControlLabel value="sip" control={<Radio size="small" />} label="SIP" />
                          </RadioGroup>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">
                          Trunk Name <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 min-w-0">
                          <TextField
                            size="small"
                            fullWidth
                            value={form.trunk_id || ''}
                            onChange={(e) => handleChange('trunk_id', e.target.value)}
                            error={!!validationErrors.trunk_id}
                            placeholder="Trunk Name"
                            inputProps={{ style: { fontSize: 14 } }}
                          />
                          {validationErrors.trunk_id && <div className="text-red-500 text-xs mt-0.5">{validationErrors.trunk_id}</div>}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">
                          Select Country <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small" error={!!validationErrors.ui_country}>
                            <MuiSelect value={form.ui_country} onChange={(e) => handleChange('ui_country', e.target.value)} sx={{ fontSize: 14 }}>
                              {SIP_REGISTER_COUNTRY_OPTIONS.map((c) => (
                                <MenuItem key={c} value={c}>
                                  {c}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                          {validationErrors.ui_country && <div className="text-red-500 text-xs mt-0.5">{validationErrors.ui_country}</div>}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Transport</label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect value={form.ui_transport} onChange={(e) => handleChange('ui_transport', e.target.value)} sx={{ fontSize: 14 }}>
                              {SIP_REGISTER_TRANSPORT_OPTIONS.map((c) => (
                                <MenuItem key={c} value={c}>
                                  {c}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Enable SRTP</label>
                        <div className="flex-1 min-w-0">
                          <FormControlLabel control={<Checkbox checked={!!form.ui_enable_srtp} onChange={(e) => handleChange('ui_enable_srtp', e.target.checked)} size="small" />} label="" sx={{ margin: 0 }} />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">
                          Register <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect value={form.ui_register} onChange={(e) => handleChange('ui_register', e.target.value)} sx={{ fontSize: 14 }}>
                              {SIP_REGISTER_YES_NO.map((c) => (
                                <MenuItem key={c} value={c}>
                                  {c}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                      {form.ui_register === 'Yes' && (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                            <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">
                              Username <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-1 min-w-0">
                              <TextField
                                size="small"
                                fullWidth
                                value={form.username || ''}
                                onChange={(e) => handleChange('username', e.target.value)}
                                error={!!validationErrors.username}
                                placeholder="Username"
                                inputProps={{ style: { fontSize: 14 } }}
                              />
                              {validationErrors.username && <div className="text-red-500 text-xs mt-0.5">{validationErrors.username}</div>}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                            <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Auth Username</label>
                            <div className="flex-1 min-w-0">
                              <TextField
                                size="small"
                                fullWidth
                                value={form.auth_username || ''}
                                onChange={(e) => handleChange('auth_username', e.target.value)}
                                inputProps={{ style: { fontSize: 14 } }}
                                placeholder="Auth Username"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                            <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">
                              RegFail Retry <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-1 min-w-0">
                              <TextField
                                size="small"
                                fullWidth
                                value={form.ui_reg_fail_retry || ''}
                                onChange={(e) => handleChange('ui_reg_fail_retry', e.target.value)}
                                error={!!validationErrors.ui_reg_fail_retry}
                                placeholder="30"
                                inputProps={{ style: { fontSize: 14 } }}
                              />
                              {validationErrors.ui_reg_fail_retry && (
                                <div className="text-red-500 text-xs mt-0.5">{validationErrors.ui_reg_fail_retry}</div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Outbound CallerId Source</label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect value={form.ui_outbound_cid_source} onChange={(e) => handleChange('ui_outbound_cid_source', e.target.value)} displayEmpty sx={{ fontSize: 14 }}>
                              {SIP_REGISTER_OUTBOUND_CID_SOURCE_OPTIONS.map((c) => (
                                <MenuItem key={c || '_empty'} value={c}>
                                  {c || <em>—</em>}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Show Outbound CallerID Name</label>
                        <div className="flex-1 min-w-0">
                          <FormControlLabel control={<Checkbox checked={!!form.ui_show_outbound_cid_name} onChange={(e) => handleChange('ui_show_outbound_cid_name', e.target.checked)} size="small" />} label="" sx={{ margin: 0 }} />
                        </div>
                      </div>
                      {form.ui_show_outbound_cid_name && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                          <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Outbound CallerId Name</label>
                          <div className="flex-1 min-w-0">
                            <TextField
                              size="small"
                              fullWidth
                              value={form.ui_outbound_cid_name}
                              onChange={(e) => handleChange('ui_outbound_cid_name', e.target.value)}
                              inputProps={{ style: { fontSize: 14 } }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Outbound CallerId Number</label>
                        <div className="flex-1 min-w-0">
                          <TextField size="small" fullWidth value={form.ui_outbound_cid_number} onChange={(e) => handleChange('ui_outbound_cid_number', e.target.value)} inputProps={{ style: { fontSize: 14 } }} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Record</label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect value={form.ui_record} onChange={(e) => handleChange('ui_record', e.target.value)} sx={{ fontSize: 14 }}>
                              {SIP_REGISTER_YES_NO.map((c) => (
                                <MenuItem key={c} value={c}>
                                  {c}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">
                          Enabled <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect value={form.ui_enabled} onChange={(e) => handleChange('ui_enabled', e.target.value)} sx={{ fontSize: 14 }}>
                              {SIP_REGISTER_YES_NO.map((c) => (
                                <MenuItem key={c} value={c}>
                                  {c}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">
                          Eth Port <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect value={form.ui_eth_port} onChange={(e) => handleChange('ui_eth_port', e.target.value)} sx={{ fontSize: 14 }}>
                              {(ethPortOptions.length ? ethPortOptions : SIP_REGISTER_ETH_PORT_OPTIONS.map((v) => ({ value: v, label: v }))).map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                      {form.ui_register === 'Yes' && (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                            <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">
                              Trunk IP/Domain <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-1 min-w-0">
                              <TextField
                                size="small"
                                fullWidth
                                value={form.provider || ''}
                                onChange={(e) => handleChange('provider', e.target.value)}
                                error={!!validationErrors.provider}
                                placeholder="host:port or domain"
                                inputProps={{ style: { fontSize: 14 } }}
                              />
                              {validationErrors.provider && (
                                <div className="text-red-500 text-xs mt-0.5">{validationErrors.provider}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                            <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">
                              Password <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-1 min-w-0">
                              <TextField
                                type={showPassword ? 'text' : 'password'}
                                size="small"
                                fullWidth
                                value={form.password || ''}
                                onChange={(e) => handleChange('password', e.target.value)}
                                error={!!validationErrors.password}
                                inputProps={{ style: { fontSize: 14 } }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton size="small" onClick={togglePasswordVisibility} edge="end">
                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                              {validationErrors.password && (
                                <div className="text-red-500 text-xs mt-0.5">{validationErrors.password}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                            <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">
                              Expire Seconds <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-1 min-w-0">
                              <TextField
                                size="small"
                                fullWidth
                                value={form.expire_in_sec || ''}
                                onChange={(e) => handleChange('expire_in_sec', e.target.value)}
                                error={!!validationErrors.expire_in_sec}
                                inputProps={{ style: { fontSize: 14 } }}
                              />
                              {validationErrors.expire_in_sec && (
                                <div className="text-red-500 text-xs mt-0.5">{validationErrors.expire_in_sec}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                            <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">
                              Match Username <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-1 min-w-0">
                              <FormControl fullWidth size="small" error={!!validationErrors.ui_match_username}>
                                <MuiSelect
                                  value={form.ui_match_username || 'Yes'}
                                  onChange={(e) => handleChange('ui_match_username', e.target.value)}
                                  sx={{ fontSize: 14 }}
                                >
                                  {SIP_REGISTER_YES_NO.map((c) => (
                                    <MenuItem key={c} value={c}>
                                      {c}
                                    </MenuItem>
                                  ))}
                                </MuiSelect>
                              </FormControl>
                              {validationErrors.ui_match_username && (
                                <div className="text-red-500 text-xs mt-0.5">{validationErrors.ui_match_username}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                            <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">
                              Enable Proxy
                            </label>
                            <div className="flex-1 min-w-0 flex items-center">
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={!!form.ui_enable_proxy}
                                    onChange={(e) => handleChange('ui_enable_proxy', e.target.checked)}
                                    size="small"
                                  />
                                }
                                label=""
                                sx={{ margin: 0 }}
                              />
                            </div>
                          </div>

                          {form.ui_enable_proxy && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                              <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">
                                Proxy IP <span className="text-red-500">*</span>
                              </label>
                              <div className="flex-1 min-w-0">
                                <TextField
                                  size="small"
                                  fullWidth
                                  value={form.ui_proxy_ip || ''}
                                  onChange={(e) => handleChange('ui_proxy_ip', e.target.value)}
                                  error={!!validationErrors.ui_proxy_ip}
                                  inputProps={{ style: { fontSize: 14 } }}
                                />
                                {validationErrors.ui_proxy_ip && (
                                  <div className="text-red-500 text-xs mt-0.5">{validationErrors.ui_proxy_ip}</div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'codec' && (
                <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-5 shadow-sm">
                  <p className="text-sm text-gray-600 mb-3">Select codecs allowed on this trunk (required).</p>
                  <FormGroup row sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {CODEC_OPTIONS.map((codec) => (
                      <FormControlLabel
                        key={codec.value}
                        control={<Checkbox checked={isCodecSelected(codec.value)} onChange={(e) => handleCodecChange(codec.value, e.target.checked)} size="small" />}
                        label={codec.label}
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: 14 } }}
                      />
                    ))}
                  </FormGroup>
                  {validationErrors.allow_codecs && <div className="text-red-500 text-xs mt-2">{validationErrors.allow_codecs}</div>}
                </div>
              )}

              {modalTab === 'advance' && (
                <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-5 shadow-sm space-y-6">
                  <div className="hidden">
                    <h3 className="text-base font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-1">SIP registration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0 pt-1.5">SIP Header</label>
                        <div className="flex-1 min-w-0">
                          <TextField size="small" fullWidth value={form.sip_header || ''} onChange={(e) => handleChange('sip_header', e.target.value)} error={!!validationErrors.sip_header} placeholder="+91...@sip.domain" inputProps={{ style: { fontSize: 14 } }} InputProps={{ startAdornment: <InputAdornment position="start"><span className="text-sm text-gray-600">sip:</span></InputAdornment> }} />
                          {validationErrors.sip_header && <div className="text-red-500 text-xs mt-0.5">{validationErrors.sip_header}</div>}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0 pt-1.5">Server Domain</label>
                        <div className="flex-1 min-w-0">
                          <TextField size="small" fullWidth value={form.server_domain || ''} onChange={(e) => handleChange('server_domain', e.target.value)} error={!!validationErrors.server_domain} inputProps={{ style: { fontSize: 14 } }} InputProps={{ startAdornment: <InputAdornment position="start"><span className="text-sm text-gray-600">sip:</span></InputAdornment> }} />
                          {validationErrors.server_domain && <div className="text-red-500 text-xs mt-0.5">{validationErrors.server_domain}</div>}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0 pt-1.5">Client Domain</label>
                        <div className="flex-1 min-w-0">
                          <TextField size="small" fullWidth value={form.client_domain || ''} onChange={(e) => handleChange('client_domain', e.target.value)} error={!!validationErrors.client_domain} inputProps={{ style: { fontSize: 14 } }} InputProps={{ startAdornment: <InputAdornment position="start"><span className="text-sm text-gray-600">sip:</span></InputAdornment> }} />
                          {validationErrors.client_domain && <div className="text-red-500 text-xs mt-0.5">{validationErrors.client_domain}</div>}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0 pt-1.5">Outbound Proxy</label>
                        <div className="flex-1 min-w-0">
                          <TextField size="small" fullWidth value={form['Outbound Proxy'] || ''} onChange={(e) => handleChange('Outbound Proxy', e.target.value)} inputProps={{ style: { fontSize: 14 } }} InputProps={{ startAdornment: <InputAdornment position="start"><span className="text-sm text-gray-600">sip:</span></InputAdornment> }} />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0 pt-1.5">Identifier IP</label>
                        <div className="flex-1 min-w-0">
                          <TextField size="small" fullWidth value={form.identity_ip || ''} onChange={(e) => handleChange('identity_ip', e.target.value)} error={!!validationErrors.identity_ip} inputProps={{ style: { fontSize: 14 } }} />
                          {validationErrors.identity_ip && <div className="text-red-500 text-xs mt-0.5">{validationErrors.identity_ip}</div>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-1">VoIP Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                      {[
                        ['Get CalledID Type', 'ui_get_called_id_type'],
                        ['OPTIONS Interval (s)', 'ui_options_interval'],
                        ['TX Volume', 'ui_tx_volume'],
                        ['RX Volume', 'ui_rx_volume'],
                        ['From User', 'from_user'],
                        ['From Domain', 'Domain name'],
                      ].map(([lbl, key]) => (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                          <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">{lbl}</label>
                          <div className="flex-1 min-w-0">
                            <TextField size="small" fullWidth value={form[key] || ''} onChange={(e) => handleChange(key, e.target.value)} inputProps={{ style: { fontSize: 14 } }} />
                          </div>
                        </div>
                      ))}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Send Privacy ID</label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect value={form.ui_send_privacy_id} onChange={(e) => handleChange('ui_send_privacy_id', e.target.value)} sx={{ fontSize: 14 }}>
                              {SIP_REGISTER_YES_NO.map((c) => (
                                <MenuItem key={c} value={c}>
                                  {c}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Sip Force Contact</label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect value={form.ui_sip_force_contact || ''} displayEmpty onChange={(e) => handleChange('ui_sip_force_contact', e.target.value)} sx={{ fontSize: 14 }}>
                              <MenuItem value="">
                                <em>—</em>
                              </MenuItem>
                              {SIP_REGISTER_YES_NO.map((c) => (
                                <MenuItem key={c} value={c}>
                                  {c}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-1">Outbound parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">P-Preferred-Identity</label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form.ui_p_preferred_identity || 'None'}
                              onChange={(e) => handleChange('ui_p_preferred_identity', e.target.value)}
                              sx={{ fontSize: 14 }}
                            >
                              {PREFERRED_ASSERTED_IDENTITY_OPTIONS.map((c) => (
                                <MenuItem key={c} value={c}>{c}</MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Remote-Party-ID</label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form.ui_remote_party_id || 'None'}
                              onChange={(e) => handleChange('ui_remote_party_id', e.target.value)}
                              sx={{ fontSize: 14 }}
                            >
                              {REMOTE_PARTY_ID_OPTIONS.map((c) => (
                                <MenuItem key={c} value={c}>{c}</MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">P-Asserted-Identity</label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form.ui_p_asserted_identity || 'None'}
                              onChange={(e) => handleChange('ui_p_asserted_identity', e.target.value)}
                              sx={{ fontSize: 14 }}
                            >
                              {PREFERRED_ASSERTED_IDENTITY_OPTIONS.map((c) => (
                                <MenuItem key={c} value={c}>{c}</MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Contact</label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form.ui_contact_mode || 'Trunk User Name'}
                              onChange={(e) => handleChange('ui_contact_mode', e.target.value)}
                              sx={{ fontSize: 14 }}
                            >
                              {CONTACT_MODE_OPTIONS.map((c) => (
                                <MenuItem key={c} value={c}>{c}</MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-1">Other Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Limit Max Calls</label>
                        <div className="flex-1 min-w-0">
                          <TextField size="small" fullWidth value={form.ui_limit_max_calls} onChange={(e) => handleChange('ui_limit_max_calls', e.target.value)} inputProps={{ style: { fontSize: 14 } }} />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Enable Early Session</label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect value={form.ui_enable_early_session} onChange={(e) => handleChange('ui_enable_early_session', e.target.value)} sx={{ fontSize: 14 }}>
                              {SIP_REGISTER_YES_NO.map((c) => (
                                <MenuItem key={c} value={c}>
                                  {c}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Enable Early Media</label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect value={form.ui_enable_early_media} onChange={(e) => handleChange('ui_enable_early_media', e.target.value)} sx={{ fontSize: 14 }}>
                              {SIP_REGISTER_YES_NO.map((c) => (
                                <MenuItem key={c} value={c}>
                                  {c}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">User Phone</label>
                        <div className="flex-1 min-w-0 flex items-center">
                          <FormControlLabel control={<Checkbox checked={!!form.ui_user_phone} onChange={(e) => handleChange('ui_user_phone', e.target.checked)} size="small" />} label="" sx={{ margin: 0 }} />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Call Timeout(s)</label>
                        <div className="flex-1 min-w-0">
                          <TextField size="small" fullWidth value={form.ui_call_timeout} onChange={(e) => handleChange('ui_call_timeout', e.target.value)} inputProps={{ style: { fontSize: 14 } }} />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">DTMF Transmit Mode</label>
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect value={form.ui_dtmf_transmit} onChange={(e) => handleChange('ui_dtmf_transmit', e.target.value)} sx={{ fontSize: 14 }}>
                              {SIP_REGISTER_DTMF_OPTIONS.map((c) => (
                                <MenuItem key={c} value={c}>
                                  {c}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">Max Call Duration (s)</label>
                        <div className="flex-1 min-w-0">
                          <TextField size="small" fullWidth value={form.ui_max_call_duration} onChange={(e) => handleChange('ui_max_call_duration', e.target.value)} inputProps={{ style: { fontSize: 14 } }} />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                        <label className="text-sm text-gray-700 font-medium sm:w-[11rem] sm:text-right shrink-0">DNIS</label>
                        <div className="flex-1 min-w-0 flex items-center">
                          <FormControlLabel control={<Checkbox checked={!!form.ui_dnis} onChange={(e) => handleChange('ui_dnis', e.target.checked)} size="small" />} label="" sx={{ margin: 0 }} />
                        </div>
                      </div>
                    </div>
                    {form.ui_dnis && (
                      <div className="mt-3 bg-white border border-gray-200 rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold text-gray-800">DNIS Settings</div>
                          <IconButton
                            size="small"
                            onClick={() => setDnisRows((r) => [...r, { dnisNumber: '', dnisName: '', replaceCid: 'No' }])}
                            sx={{ border: '1px solid #ccc', borderRadius: 1 }}
                            aria-label="add dnis row"
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </div>

                        <div className="overflow-x-auto border border-gray-200 rounded">
                          <table className="w-full min-w-[520px] text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                <th className="p-2 text-left font-medium">DNIS Number</th>
                                <th className="p-2 text-left font-medium">DNIS Name</th>
                                <th className="p-2 text-left font-medium">Replace CID</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dnisRows.map((row, i) => (
                                <tr key={i} className="border-b border-gray-100">
                                  <td className="p-1">
                                    <TextField
                                      size="small"
                                      fullWidth
                                      value={row.dnisNumber}
                                      onChange={(e) =>
                                        setDnisRows((prev) => prev.map((x, j) => (j === i ? { ...x, dnisNumber: e.target.value } : x)))
                                      }
                                      inputProps={{ style: { fontSize: 13 } }}
                                    />
                                  </td>
                                  <td className="p-1">
                                    <TextField
                                      size="small"
                                      fullWidth
                                      value={row.dnisName}
                                      onChange={(e) =>
                                        setDnisRows((prev) => prev.map((x, j) => (j === i ? { ...x, dnisName: e.target.value } : x)))
                                      }
                                      inputProps={{ style: { fontSize: 13 } }}
                                    />
                                  </td>
                                  <td className="p-1 w-[180px]">
                                    <FormControl fullWidth size="small">
                                      <MuiSelect
                                        value={row.replaceCid || 'No'}
                                        onChange={(e) =>
                                          setDnisRows((prev) => prev.map((x, j) => (j === i ? { ...x, replaceCid: e.target.value } : x)))
                                        }
                                        sx={{ fontSize: 14 }}
                                      >
                                        {SIP_REGISTER_YES_NO.map((c) => (
                                          <MenuItem key={c} value={c}>
                                            {c}
                                          </MenuItem>
                                        ))}
                                      </MuiSelect>
                                    </FormControl>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {modalTab === 'dod' && (
                <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-5 shadow-sm">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['ADD', 'DELETE', 'IMPORT', 'EXPORT'].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded shadow hover:bg-gray-800"
                        onClick={() => {
                          if (lbl === 'ADD') handleOpenDodAddModal();
                          else if (lbl === 'DELETE') {
                            if (!dodSelected.length) {
                              showMessage('error', 'Select DOD rows to delete');
                              return;
                            }
                            setDodRows((rows) => rows.filter((_, i) => !dodSelected.includes(i)));
                            setDodSelected([]);
                          } else showMessage('info', `${lbl} is not connected to the API yet.`);
                        }}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                  {showDodAddModal ? (
                    <div className="mt-2 bg-white border border-gray-200 rounded-md p-3 sm:p-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <label className="text-sm text-gray-700 font-medium whitespace-nowrap" style={{ width: 140 }}>
                              DOD Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                              value={dodAddName}
                              onChange={(e) => setDodAddName(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <label className="text-sm text-gray-700 font-medium whitespace-nowrap" style={{ width: 140 }}>
                              DOD Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                              value={dodAddNumber}
                              onChange={(e) => setDodAddNumber(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-1">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-xs font-semibold text-[#325a84]">Available</div>
                          <div className="text-xs font-semibold text-[#325a84]">Selected</div>
                        </div>

                        <div className="grid grid-cols-[1fr_48px_1fr_48px] gap-3 items-start">
                          <div>
                            <select
                              multiple
                              value={dodAvailableSelected}
                              onChange={(e) => setDodAvailableSelected(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                              className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                            >
                              {dodAvailableExtensions.length === 0 && !dodHasLoadedExtensionsRef.current ? (
                                <option>Loading extensions...</option>
                              ) : dodAvailableList.length === 0 ? (
                                <option disabled>No extensions</option>
                              ) : (
                                dodAvailableList.map((t) => (
                                  <option key={t.value} value={t.value}>
                                    {getDodExtLabel(t.value)}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1 pt-7">
                            <button
                              type="button"
                              className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                              onClick={dodAddSelectedMembers}
                            >
                              &gt;
                            </button>
                            <button
                              type="button"
                              className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                              onClick={dodAddAllMembers}
                            >
                              &gt;&gt;
                            </button>
                          </div>

                          <div>
                            <select
                              multiple
                              value={dodChosenSelected}
                              onChange={(e) => setDodChosenSelected(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                              className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                            >
                              {dodMemberExtensions.length === 0 ? (
                                <option disabled>No selected extensions</option>
                              ) : (
                                dodMemberExtensions.map((id) => (
                                  <option key={id} value={id}>
                                    {getDodExtLabel(id)}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1 pt-7">
                            <button
                              type="button"
                              className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                              onClick={dodRemoveSelectedMembers}
                            >
                              &lt;
                            </button>
                            <button
                              type="button"
                              className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                              onClick={dodRemoveAllMembers}
                            >
                              &lt;&lt;
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center gap-4 mt-4">
                        <button
                          type="button"
                          className="bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded shadow hover:bg-gray-800"
                          onClick={handleConfirmDodAdd}
                        >
                          ENSURE
                        </button>
                        <button
                          type="button"
                          className="bg-gray-300 text-gray-700 text-xs font-semibold px-4 py-2 rounded shadow hover:bg-gray-400"
                          onClick={() => {
                            setShowDodAddModal(false);
                            resetDodAddForm();
                          }}
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-200 rounded">
                      <table className="w-full min-w-[480px] text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                          <th className="p-2 w-10 text-left">
                            <input type="checkbox" aria-label="select all dod" onChange={(e) => (e.target.checked ? setDodSelected(dodRows.map((_, i) => i)) : setDodSelected([]))} checked={dodRows.length > 0 && dodSelected.length === dodRows.length} />
                          </th>
                          <th className="p-2 text-left font-medium">DOD Number</th>
                          <th className="p-2 text-left font-medium">DOD Name</th>
                          <th className="p-2 text-left font-medium">Bind Extension</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dodRows.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-gray-400">
                              No DOD entries. Click ADD to add a row.
                            </td>
                          </tr>
                        ) : (
                          dodRows.map((row, i) => (
                            <tr key={i} className="border-b border-gray-100">
                              <td className="p-2">
                                <input type="checkbox" checked={dodSelected.includes(i)} onChange={() => setDodSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))} />
                              </td>
                              <td className="p-1">
                                <TextField size="small" fullWidth value={row.dodNumber} onChange={(e) => setDodRows((rows) => rows.map((x, j) => (j === i ? { ...x, dodNumber: e.target.value } : x)))} inputProps={{ style: { fontSize: 13 } }} />
                              </td>
                              <td className="p-1">
                                <TextField size="small" fullWidth value={row.dodName} onChange={(e) => setDodRows((rows) => rows.map((x, j) => (j === i ? { ...x, dodName: e.target.value } : x)))} inputProps={{ style: { fontSize: 13 } }} />
                              </td>
                              <td className="p-1">
                                <TextField
                                  size="small"
                                  fullWidth
                                  value={
                                    Array.isArray(row.bindExtensions)
                                      ? row.bindExtensions.join(', ')
                                      : row.bindExtension || ''
                                  }
                                  onChange={(e) => {
                                    const raw = e.target.value || '';
                                    const list = raw
                                      .split(',')
                                      .map((s) => s.trim())
                                      .filter(Boolean);
                                    setDodRows((rows) =>
                                      rows.map((x, j) =>
                                        j === i ? { ...x, bindExtensions: list, bindExtension: raw } : x
                                      )
                                    );
                                  }}
                                  inputProps={{ style: { fontSize: 13 } }}
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'adapt' && (
                <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">Adapt Caller ID</h3>
                    <IconButton size="small" onClick={() => setAdaptRows((r) => [...r, { matchMode: '', strip: '', prepend: '' }])} sx={{ border: '1px solid #ccc', borderRadius: 1 }} aria-label="add adapt row">
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </div>
                  <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr] gap-2 text-xs font-medium text-gray-600 border-b border-gray-200 pb-2 mb-2">
                    <span>Match Mode</span>
                    <span>Strip</span>
                    <span>Prepend</span>
                  </div>
                  <div className="space-y-2">
                    {adaptRows.map((row, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                        <TextField size="small" label="Match Mode" placeholder="Match" value={row.matchMode} onChange={(e) => setAdaptRows((r) => r.map((x, j) => (j === i ? { ...x, matchMode: e.target.value } : x)))} InputLabelProps={{ shrink: true }} />
                        <TextField size="small" label="Strip" placeholder="Strip" value={row.strip} onChange={(e) => setAdaptRows((r) => r.map((x, j) => (j === i ? { ...x, strip: e.target.value } : x)))} InputLabelProps={{ shrink: true }} />
                        <TextField size="small" label="Prepend" placeholder="Prepend" value={row.prepend} onChange={(e) => setAdaptRows((r) => r.map((x, j) => (j === i ? { ...x, prepend: e.target.value } : x)))} InputLabelProps={{ shrink: true }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>

        <DialogActions className="p-4 justify-center gap-12">
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
             
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                color: '#fff',
              },
              '&:disabled': {
                  background: '#f5f5f5',
                color: '#666',
              },
            }}
            onClick={handleSave}
            disabled={loading.save}
            startIcon={loading.save && <CircularProgress size={20} color="inherit" />}
          >
            {loading.save ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
              color: '#374151',
              fontWeight: 600,
              fontSize: '16px',
             
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
                color: '#374151',
              },
              '&:disabled': {
                background: '#f5f5f5',
                color: '#666',
              },
            }}
            onClick={handleCloseModal}
            disabled={loading.save}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SipRegisterPage;
