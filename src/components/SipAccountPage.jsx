import React, { useState, useRef, useEffect } from 'react';
import { SIP_ACCOUNT_FIELDS, SIP_ACCOUNT_TABLE_COLUMNS, SIP_ACCOUNT_INITIAL_FORM, CODEC_OPTIONS } from '../constants/SipAccountConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select as MuiSelect, MenuItem, FormControl, Alert, CircularProgress, IconButton, InputAdornment, FormGroup, FormControlLabel, Checkbox, Tabs, Tab, RadioGroup, Radio } from '@mui/material';
import { fetchSipAccounts, createSipAccount, updateSipAccount, deleteSipAccount, bulkCreateSipAccounts } from '../api/apiService';

const FOLLOW_ME_TIMEOUT_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
const FOLLOW_ME_DESTINATION_TYPES = [
  'Call Queue',
  'CallBacks',
  'Conference Rooms',
  'DISA',
  'Extensions',
  'Fax To Mail',
  'IVR Menus',
  'Ring Groups',
  'Voicemails',
  'Other',
];

const SipAccountPage = () => {
  // State
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(SIP_ACCOUNT_INITIAL_FORM);
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
  const [activeTab, setActiveTab] = useState('basic');
  const [formMode, setFormMode] = useState('single'); // 'single' | 'bulk'
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = React.useRef(null);
  const [bulkForm, setBulkForm] = useState({
    startExtension: '',
    createNumber: '',
    passwordMode: 'random', // 'random' | 'fixed' | 'prefix'
    fixedPassword: '',
    passwordPrefix: '',
  });
  
  // Fields to hide from the table
  const HIDDEN_TABLE_FIELDS = ['password', 'from_domain', 'contact_user', 'outbound_proxy'];
  const visibleFieldsCount = SIP_ACCOUNT_TABLE_COLUMNS.filter(c => !HIDDEN_TABLE_FIELDS.includes(c.key)).length;
  
  // Load accounts on component mount
  useEffect(() => {
    // Prevent duplicate calls during React StrictMode or development double-rendering
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadAccounts();
    }
  }, []);
  
  // Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(accounts.length / itemsPerPage));
  const pagedAccounts = accounts.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const extensionOptions = React.useMemo(
    () => Array.from(new Set(accounts.map(a => String(a.extension)))).sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0)),
    [accounts]
  );
  
  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const openBulkModal = () => {
    // Start from a clean form (like Add New), but in bulk mode
    setForm({ ...SIP_ACCOUNT_INITIAL_FORM });
    setEditIndex(null);
    setBulkForm({
      startExtension: '',
      createNumber: '',
      passwordMode: 'random',
      fixedPassword: '',
      passwordPrefix: '',
    });
    setFormMode('bulk');
    setActiveTab('basic');
    setShowModal(true);
  };
  
  // Transform API data to UI format
  const transformApiToUi = (apiData) => {
    const isEnabled = (value) =>
      value === true ||
      value === 1 ||
      value === '1' ||
      value === 'yes' ||
      value === 'on';

    const yesNoToToggle = (value) => (isEnabled(value) ? 'enabled' : 'disabled');
    const boolToYesNo = (value) => (isEnabled(value) ? 'yes' : 'no');
    const normalizeTimeCondition = (value) => {
      const normalized = String(value || '').toLowerCase().trim();
      if (normalized === 'office') return 'work_time';
      if (normalized === 'non_office') return 'holiday';
      if (['all', 'work_time', 'holiday', 'custom'].includes(normalized)) return normalized;
      return 'all';
    };

    // Sort by extension number (convert to number for proper sorting)
    const sortedData = [...apiData].sort((a, b) => {
      const extensionA = parseInt(a.extension) || 0;
      const extensionB = parseInt(b.extension) || 0;
      return extensionA - extensionB;
    });
    
    return sortedData.map((item, index) => ({
      index: index.toString(),
      extension: item.extension,
      context: item.context,
      allow_codecs: item.allow_codecs || item.codecs || '',
      password: item.password,
      max_registrations: item.max_registrations ?? '',
      user_name: item.name || item.display_name || '',
      user_password: item.user_password || '',
      email: item.email || '',
      mobile_number: item.mobile_number || item.mobile || '',

      voicemail_enabled: boolToYesNo(item.voicemail_enabled),
      voicemail_password: item.voicemail_password || '',
      voicemail_file:
        item.voicemail_file === 'Audio File Attachment'
          ? 'audio_file_attachment'
          : item.voicemail_file === 'Download Link'
          ? 'download_link'
          : item.voicemail_file || 'audio_file_attachment',
      voicemail_keep_local: item.voicemail_keep_local || 'no',

      cf_always_enabled: yesNoToToggle(item.cf_always_enabled ?? item.call_forward_always_enabled),
      cf_always_number: item.cf_always_dest || item.call_forward_always_dest || '',
      cf_always_time: normalizeTimeCondition(item.cf_always_time_condition || item.call_forward_always_time_condition),
      cf_busy_enabled: yesNoToToggle(item.cf_busy_enabled ?? item.call_forward_busy_enabled),
      cf_busy_number: item.cf_busy_dest || item.call_forward_busy_dest || '',
      cf_busy_time: normalizeTimeCondition(item.cf_busy_time_condition || item.call_forward_busy_time_condition),
      cf_no_answer_enabled: yesNoToToggle(item.cf_noanswer_enabled ?? item.call_forward_noanswer_enabled),
      cf_no_answer_number: item.cf_noanswer_dest || item.call_forward_noanswer_dest || '',
      cf_no_answer_time: normalizeTimeCondition(item.cf_noanswer_time_condition || item.call_forward_noanswer_time_condition),
      cf_not_registered_enabled: yesNoToToggle(item.cf_unreg_enabled ?? item.call_forward_unreg_enabled),
      cf_not_registered_number: item.cf_unreg_dest || item.call_forward_unreg_dest || '',
      cf_not_registered_time: normalizeTimeCondition(item.cf_unreg_time_condition || item.call_forward_unreg_time_condition),

      dnd_enabled: yesNoToToggle(item.dnd_enabled),
      dnd_time: normalizeTimeCondition(item.dnd_time_condition),
      dnd_special_numbers:
        (Array.isArray(item.dnd_special_numbers) && item.dnd_special_numbers) ||
        (Array.isArray(item.dnd_special_number) && item.dnd_special_number) ||
        (Array.isArray(item.dnd_allow_numbers) && item.dnd_allow_numbers) ||
        [],
      enable_mobility_extension: boolToYesNo(item.mobility_enabled ?? item.enable_mobility_extension ?? item.enable_mobility_ext),
      ring_simultaneously: boolToYesNo(item.mobility_ring_simultaneously ?? item.ring_simultaneously),
      mobility_prefix: item.mobility_prefix || item.prefix || '',
      mobility_timeout: Number(item.mobility_timeout ?? item.timeout ?? 30) || 30,
      secretary_service: yesNoToToggle(item.secretary_enabled ?? item.secretary_service_enabled ?? item.secretary_service),
      secretary_extension: item.secretary_extension || item.secretary_number || item.ss1 || item.ss2 || '',
      follow_me_enabled: yesNoToToggle(item.follow_me_enabled),
      follow_me_time: normalizeTimeCondition(item.follow_me_time_condition),
      follow_me_entries: item.follow_me_dest ? [{ destinationType: String(item.follow_me_dest), timeout: 30, confirm: 'unconfirm' }] : [],
      follow_me_timeout_destination: item.follow_me_timeout_destination || '',

      from_domain: item.from_domain || item['Domain name'] || '',
      contact_user: item.contact_user || item['Contact User'] || '',
      outbound_proxy: item.outbound_proxy || item['Outbound Proxy'] || '',
      status: item.status || '',

      // Advanced fields
      enable_srtp: boolToYesNo(item.adv_enable_srtp ?? item.enable_srtp),
      sip_bypass_media: (() => {
        const v = item.adv_bypass_media || item.sip_bypass_media || 'proxy';
        return v === 'bypass' ? 'bypass_media' : 'proxy_media';
      })(),
      call_timeout: Number(item.adv_call_timeout_sec ?? item.call_timeout ?? 30),
      max_call_duration: Number(item.adv_max_call_duration_sec ?? item.max_call_duration ?? 6000),
      outbound_restriction: (item.adv_outbound_restriction ?? item.outbound_restriction) ? 'enable' : 'disable',
      admin_call_permission: (() => {
        const v = String(item.adv_call_permission_admin || 'international').toLowerCase().replace(/[\s-]/g, '_');
        if (v === 'no_call' || v === 'none' || v === 'no') return 'no_call';
        if (v === 'internal' || v === 'internal_call') return 'internal_call';
        if (v === 'local' || v === 'local_call') return 'local_call';
        if (v === 'long_distance' || v === 'long_distance_call' || v === 'longdistance') return 'long_distance_call';
        return 'international_call';
      })(),
      call_permission: (() => {
        const v = String(item.adv_call_permission_dynamic || item.adv_call_permission || item.call_permission || 'international').toLowerCase().replace(/[\s-]/g, '_');
        if (v === 'no_call' || v === 'none' || v === 'no') return 'no_call';
        if (v === 'internal' || v === 'internal_call') return 'internal_call';
        if (v === 'local' || v === 'local_call') return 'local_call';
        if (v === 'long_distance' || v === 'long_distance_call' || v === 'longdistance') return 'long_distance_call';
        return 'international_call';
      })(),
      extension_trunk: (item.adv_extension_trunk ?? item.extension_trunk) ? 'enable' : 'disable',
      dynamic_lock_pin: (Number(item.adv_dynamic_lock_pin ?? item.adv_dynamic_lock_mode ?? 0) === 1) ? 'user_password' : 'default',
      diversion: boolToYesNo(item.adv_send_diversion ?? item.send_diversion ?? item.diversion ?? true),
      call_prohibition: (item.adv_call_prohibition ?? item.call_prohibition) ? 'enable' : 'disable',
      rx_volume: Number(item.adv_rx_volume ?? item.rx_volume ?? 0),
      tx_volume: Number(item.adv_tx_volume ?? item.tx_volume ?? 0),
    }));
  };
  
  // Transform UI data to API format
  const transformUiToApi = (uiData) => {
    const toggleToBool = (value) => value === 'enabled' || value === 'yes' || value === true;

    const voicemailFileForApi =
      uiData.voicemail_file === 'audio_file_attachment'
        ? 'Audio File Attachment'
        : uiData.voicemail_file === 'download_link'
        ? 'Download Link'
        : uiData.voicemail_file || 'Audio File Attachment';

    return {
      extension: uiData.extension,
      context: uiData.context,
      allow_codecs: uiData.allow_codecs,
      password: uiData.password,
      max_registrations: uiData.max_registrations
        ? Number(uiData.max_registrations)
        : undefined,
      name: uiData.user_name || uiData.name || '',
      display_name: uiData.user_name || uiData.name || '',
      user_password: uiData.user_password || '',
      email: uiData.email || '',
      mobile_number: uiData.mobile_number || '',
      mobile: uiData.mobile_number || '',

      voicemail_enabled: uiData.voicemail_enabled || 'no',
      voicemail_password: uiData.voicemail_password || '',
      voicemail_file: voicemailFileForApi,
      voicemail_keep_local: uiData.voicemail_keep_local || 'no',

      cf_always_enabled: toggleToBool(uiData.cf_always_enabled),
      cf_always_dest: uiData.cf_always_number || '',
      cf_always_time_condition: uiData.cf_always_time || 'all',
      cf_busy_enabled: toggleToBool(uiData.cf_busy_enabled),
      cf_busy_dest: uiData.cf_busy_number || '',
      cf_busy_time_condition: uiData.cf_busy_time || 'all',
      cf_noanswer_enabled: toggleToBool(uiData.cf_no_answer_enabled),
      cf_noanswer_dest: uiData.cf_no_answer_number || '',
      cf_noanswer_time_condition: uiData.cf_no_answer_time || 'all',
      cf_unreg_enabled: toggleToBool(uiData.cf_not_registered_enabled),
      cf_unreg_dest: uiData.cf_not_registered_number || '',
      cf_unreg_time_condition: uiData.cf_not_registered_time || 'all',

      follow_me_enabled: toggleToBool(uiData.follow_me_enabled),
      follow_me_dest:
        (Array.isArray(uiData.follow_me_entries) && uiData.follow_me_entries.find(e => e?.destinationType)?.destinationType) ||
        '',
      follow_me_destination:
        (Array.isArray(uiData.follow_me_entries) && uiData.follow_me_entries.find(e => e?.destinationType)?.destinationType) ||
        '',
      follow_me_time_condition: uiData.follow_me_time || 'all',
      dnd_enabled: toggleToBool(uiData.dnd_enabled),
      dnd_time_condition: uiData.dnd_time || 'all',
      dnd_special_numbers: Array.isArray(uiData.dnd_special_numbers)
        ? uiData.dnd_special_numbers.filter(Boolean)
        : [],
      dnd_special_number: Array.isArray(uiData.dnd_special_numbers)
        ? uiData.dnd_special_numbers.filter(Boolean)
        : [],
      dnd_allow_numbers: Array.isArray(uiData.dnd_special_numbers)
        ? uiData.dnd_special_numbers.filter(Boolean)
        : [],
      mobility_enabled: toggleToBool(uiData.enable_mobility_extension),
      enable_mobility_extension: uiData.enable_mobility_extension || 'no',
      enable_mobility_ext: uiData.enable_mobility_extension || 'no',
      mobility_ring_simultaneously: toggleToBool(uiData.ring_simultaneously),
      ring_simultaneously: uiData.ring_simultaneously || 'no',
      mobility_prefix: uiData.mobility_prefix || '',
      mobility_timeout: Number(uiData.mobility_timeout || 30),
      secretary_enabled: toggleToBool(uiData.secretary_service),
      secretary_service_enabled: toggleToBool(uiData.secretary_service),
      secretary_service: toggleToBool(uiData.secretary_service),
      secretary_extension: uiData.secretary_extension || '',
      secretary_number: uiData.secretary_extension || '',

      from_domain: uiData.from_domain,
      contact_user: uiData.contact_user,
      outbound_proxy: uiData.outbound_proxy,

      // Advanced fields
      adv_enable_srtp: uiData.enable_srtp === 'yes',
      adv_bypass_media: uiData.sip_bypass_media === 'bypass_media' ? 'bypass' : 'proxy',
      adv_call_timeout_sec: Number(uiData.call_timeout ?? 30),
      adv_max_call_duration_sec: Number(uiData.max_call_duration ?? 6000),
      adv_outbound_restriction: uiData.outbound_restriction === 'enable',
      adv_call_permission_admin: (() => {
        const v = uiData.admin_call_permission || 'international_call';
        if (v === 'no_call') return 'no_call';
        if (v === 'internal_call') return 'internal';
        if (v === 'local_call') return 'local';
        if (v === 'long_distance_call') return 'long_distance';
        return 'international';
      })(),
      adv_extension_trunk: uiData.extension_trunk === 'enable',
      adv_dynamic_lock_mode: uiData.dynamic_lock_pin === 'user_password' ? 1 : 0,
      adv_send_diversion: uiData.diversion === 'yes',
      adv_call_prohibition: uiData.call_prohibition === 'enable',
      adv_rx_volume: Number(uiData.rx_volume ?? 0),
      adv_tx_volume: Number(uiData.tx_volume ?? 0),
    };
  };
  
  // Load accounts from API
  const loadAccounts = async (isRefresh = false) => {
    // Prevent concurrent calls
    if (loading.fetch) {
      return;
    }
    
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const response = await fetchSipAccounts();
      if (response.response && response.message) {
        const transformedAccounts = transformApiToUi(response.message);
        setAccounts(transformedAccounts);
      } else {
        showMessage('error', 'Failed to load SIP accounts');
      }
    } catch (error) {
      console.error('Error loading SIP accounts:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to load SIP accounts');
      }
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };
  // Custom scrollbar
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, width: 0, scrollWidth: 0 });
  useEffect(() => {
    const el = tableScrollRef.current;
    if (el) {
      setScrollState({ left: el.scrollLeft, width: el.clientWidth, scrollWidth: el.scrollWidth });
    }
  }, [accounts, page]);
  const handleTableScroll = (e) => {
    setScrollState({
      left: e.target.scrollLeft,
      width: e.target.clientWidth,
      scrollWidth: e.target.scrollWidth,
    });
  };

  const handleScrollbarDrag = (e) => {
    const track = e.target.parentNode;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newScrollLeft = (scrollState.scrollWidth - scrollState.width) * percent;
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = newScrollLeft;
    }
  };
  
  const handleArrowClick = (dir) => {
    if (tableScrollRef.current) {
      const delta = dir === 'left' ? -100 : 100;
      tableScrollRef.current.scrollLeft += delta;
    }
  };

  // Modal logic
  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      setForm({ ...row });
      setEditIndex(idx);
    } else {
      setForm({ ...SIP_ACCOUNT_INITIAL_FORM });
      setEditIndex(null);
    }
    setFormMode('single');
    setActiveTab('basic');
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setShowPassword(false); // Reset password visibility when closing modal
    setValidationErrors({}); // Clear validation errors when closing modal
    setFormMode('single');
    setActiveTab('basic');
  };
  
  // Validation functions
  const validateExtension = (extension) => {
    if (!extension || extension.trim() === '') {
      return 'Extension is required';
    }
    return null;
  };
  
  const validatePassword = (password) => {
    if (!password || password.trim() === '') {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must include at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must include at least one number';
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      return 'Password must include at least one special character';
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

  // Advanced networking fields are optional for now
  const validateDomainName = (domainName) => {
    if (!domainName || domainName.trim() === '') {
      return null;
    }
    return null;
  };
  
  const validateContactUser = (contactUser) => {
    if (!contactUser || contactUser.trim() === '') {
      return null;
    }
    return null;
  };
  
  const validateOutboundProxy = (outboundProxy) => {
    if (!outboundProxy || outboundProxy.trim() === '') {
      return null;
    }
    return null;
  };
  
  const validateForm = () => {
    const errors = {};
    
    const extensionError = validateExtension(form.extension);
    if (extensionError) errors.extension = extensionError;
    
    const passwordError = validatePassword(form.password);
    if (passwordError) errors.password = passwordError;
    
    const contextError = validateContext(form.context);
    if (contextError) errors.context = contextError;
    
    const allowCodecsError = validateAllowCodecs(form.allow_codecs);
    if (allowCodecsError) errors.allow_codecs = allowCodecsError;   

    // Advanced networking + feature fields are optional – no required validation here
    return errors;
  };
  
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    
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
      case 'extension':
        error = validateExtension(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'context':
        error = validateContext(value);
        break;
      case 'from_domain':
        error = validateDomainName(value);
        break;
      case 'contact_user':
        error = validateContactUser(value);
        break;
      case 'outbound_proxy':
        error = validateOutboundProxy(value);
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

  // Follow Me destination helpers
  const handleFollowMeEntryChange = (index, field, value) => {
    setForm(prev => {
      const current = Array.isArray(prev.follow_me_entries) ? [...prev.follow_me_entries] : [];
      const existing = current[index] || { destinationType: '', timeout: 30, confirm: 'unconfirm' };
      current[index] = { ...existing, [field]: value };
      return { ...prev, follow_me_entries: current };
    });
  };

  const handleAddFollowMeEntry = () => {
    setForm(prev => {
      const current = Array.isArray(prev.follow_me_entries) ? [...prev.follow_me_entries] : [];
      current.push({ destinationType: '', timeout: 30, confirm: 'unconfirm' });
      return { ...prev, follow_me_entries: current };
    });
  };

  // Do Not Disturb special numbers helpers
  const handleDndNumberChange = (index, value) => {
    setForm(prev => {
      const current = Array.isArray(prev.dnd_special_numbers) ? [...prev.dnd_special_numbers] : [];
      current[index] = value;
      return { ...prev, dnd_special_numbers: current };
    });
  };

  const handleAddDndNumber = () => {
    setForm(prev => {
      const current = Array.isArray(prev.dnd_special_numbers) ? [...prev.dnd_special_numbers] : [];
      current.push('');
      return { ...prev, dnd_special_numbers: current };
    });
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSave = async () => {
    // Comprehensive validation
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      // Show the first validation error
      const firstError = Object.values(validationErrors)[0];
      showMessage('error', firstError);
      setValidationErrors(validationErrors);
      return;
    }
    // Prevent extension duplication with SIP To SIP accounts
    try {
      const { fetchSipIpTrunkAccounts } = await import('../api/apiService');
      const ipTrunkRes = await fetchSipIpTrunkAccounts();
      if (ipTrunkRes?.response && Array.isArray(ipTrunkRes.message)) {
        const exists = ipTrunkRes.message.some(item => String(item.extension) === String(form.extension));
        if (exists) {
          showMessage('error', 'This extension already exists in SIP To SIP Account. Choose a different extension.');
          return;
        }
      }
    } catch (e) {
      // If check fails due to network, continue but warn in console
      console.warn('Extension duplication check (SIP To SIP) failed:', e?.message);
    }
    
    setLoading(prev => ({ ...prev, save: true }));
    try {
      const apiData = transformUiToApi(form);
      // On create, default User Password to pass+extension when left blank
      if (editIndex === null && (!apiData.user_password || !String(apiData.user_password).trim())) {
        apiData.user_password = 'pass' + apiData.extension;
      }
      
      if (editIndex !== null) {
        // Update existing account
        const response = await updateSipAccount(apiData);
        if (response.response) {
          showMessage('success', response.message || 'Account updated successfully');
          // Reload data to refresh the table
          await new Promise(resolve => setTimeout(resolve, 300)); // Allow backend to process
          await loadAccounts(true);
        } else {
          showMessage('error', 'Failed to update account');
        }
      } else {
        // Create new account
        const response = await createSipAccount(apiData);
        if (response.response) {
          showMessage('success', response.message || 'Account created successfully');
          // Reload data to refresh the table
          await new Promise(resolve => setTimeout(resolve, 300)); // Allow backend to process
          await loadAccounts(true);
        } else {
          showMessage('error', 'Failed to create account');
        }
      }
      
      setShowModal(false);
      setEditIndex(null);
    } catch (error) {
      console.error('Error saving SIP account:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to save account');
      }
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  // Bulk add SIP accounts (limit 10 at a time)
  const handleBulkSave = async () => {
    const start = parseInt(bulkForm.startExtension, 10);
    const count = parseInt(bulkForm.createNumber, 10);

    if (Number.isNaN(start) || start <= 0) {
      showMessage('error', 'Start Extension must be a positive number');
      return;
    }
    if (Number.isNaN(count) || count <= 0) {
      showMessage('error', 'Create Number must be a positive number');
      return;
    }
    if (count > 10) {
      showMessage('error', 'Maximum 10 extensions can be created at once.');
      return;
    }

    if (bulkForm.passwordMode === 'fixed') {
      if (!bulkForm.fixedPassword.trim()) {
        showMessage('error', 'Please enter Fixed Registration Password');
        return;
      }
      const fixedPwdError = validatePassword(bulkForm.fixedPassword);
      if (fixedPwdError) {
        showMessage('error', fixedPwdError);
        return;
      }
    }
    if (bulkForm.passwordMode === 'prefix' && !bulkForm.passwordPrefix.trim()) {
      showMessage('error', 'Please enter Prefix for Registration Password');
      return;
    }

    const defaultContext = form.context || accounts[0]?.context || 'sip1';
    const defaultCodecs = form.allow_codecs || accounts[0]?.allow_codecs || 'ulaw,alaw';

    // Build base settings from current form using existing transformer
    const singleApiData = transformUiToApi({
      ...form,
      extension: String(start || 0), // placeholder, not used directly by bulk API
      context: defaultContext,
      allow_codecs: defaultCodecs,
      password: '', // password will be generated by backend
    });

    const { extension: _ext, password: _pwd, ...commonSettings } = singleApiData;

    // For bulk create, let backend assign each account name from its extension number.
    // Sending a fixed name would apply the same name to all generated extensions.
    if ('name' in commonSettings) {
      delete commonSettings.name;
    }

    // Figure out which extensions we want to create, skipping ones that already exist.
    const existingExts = new Set(accounts.map(a => String(a.extension)));
    const desiredExts = [];
    let candidate = start;
    while (desiredExts.length < count) {
      const extStr = String(candidate);
      if (!existingExts.has(extStr)) {
        desiredExts.push(extStr);
      }
      candidate += 1;
      // Safety guard to avoid infinite loops in extreme cases
      if (candidate - start > count + 200) break;
    }

    if (desiredExts.length === 0) {
      showMessage('error', 'No new extensions to create. All requested numbers already exist.');
      return;
    }

    // Group desired extensions into contiguous ranges so we can call bulk_create
    const numericExts = desiredExts.map(e => Number(e)).sort((a, b) => a - b);
    const ranges = [];
    let rangeStart = numericExts[0];
    let prev = numericExts[0];
    let rangeCount = 1;
    for (let i = 1; i < numericExts.length; i += 1) {
      const cur = numericExts[i];
      if (cur === prev + 1) {
        rangeCount += 1;
      } else {
        ranges.push({ start: rangeStart, count: rangeCount });
        rangeStart = cur;
        rangeCount = 1;
      }
      prev = cur;
    }
    ranges.push({ start: rangeStart, count: rangeCount });

    setLoading(prev => ({ ...prev, save: true }));
    try {
      for (const r of ranges) {
        const payload = {
          start_extension: String(r.start),
          create_number: r.count,
          reg_password_mode: bulkForm.passwordMode,
          reg_password_value:
            bulkForm.passwordMode === 'fixed'
              ? bulkForm.fixedPassword
              : bulkForm.passwordMode === 'prefix'
              ? bulkForm.passwordPrefix
              : undefined,
          ...commonSettings,
        };
        const response = await bulkCreateSipAccounts(payload);
        if (!response || !response.response) {
          throw new Error(response?.message || 'Bulk add failed');
        }
      }

      showMessage(
        'success',
        `Created ${desiredExts.length} SIP account(s) starting from ${start} (skipping existing numbers).`
      );
      await loadAccounts(true);
      handleCloseModal();
    } catch (err) {
      console.error('Bulk add SIP accounts failed:', err);
      showMessage('error', err.message || 'Bulk add failed');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };
  // Table selection logic
  const handleSelectRow = idx => {
    setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  };
  const handleCheckAll = () => setSelected(accounts.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () => setSelected(accounts.map((_, idx) => selected.includes(idx) ? null : idx).filter(i => i !== null));
  
  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage('error', 'Please select accounts to delete');
      return;
    }
    if (!window.confirm('Are you sure you want to delete the selected account(s)?')) {
      return;
    }
    
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const deletePromises = selected.map(async (idx) => {
        const account = accounts[idx];
        return await deleteSipAccount(account.extension, account.context);
      });
      
      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value.response).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        showMessage('success', `${successCount} account(s) deleted successfully`);
        await loadAccounts(true); // Reload accounts to get fresh data
        setSelected([]); // Clear selection
      }
      
      if (failCount > 0) {
        showMessage('error', `Failed to delete ${failCount} account(s)`);
      }
    } catch (error) {
      console.error('Error deleting SIP accounts:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to delete accounts');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };
  const handleClearAll = async () => {
    if (accounts.length === 0) {
      showMessage('info', 'No accounts to clear');
      return;
    }
    if (!window.confirm('Are you sure you want to delete ALL SIP accounts? This action cannot be undone.')) {
      return;
    }
    
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const deletePromises = accounts.map(async (account) => {
        return await deleteSipAccount(account.extension, account.context);
      });
      
      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value.response).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        showMessage('success', `All ${successCount} account(s) deleted successfully`);
        await loadAccounts(true); // Reload accounts to get fresh data
        setSelected([]);
        setPage(1);
      }
      
      if (failCount > 0) {
        showMessage('error', `Failed to delete ${failCount} account(s)`);
      }
    } catch (error) {
      console.error('Error clearing all SIP accounts:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to clear all accounts');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      showMessage('error', 'Please select a file to import');
      return;
    }
    // API integration to be added
    showMessage('info', 'Import API not yet configured');
  };

  const handleExport = () => {
    // API integration to be added
    showMessage('info', 'Export API not yet configured');
  };
  // Custom scrollbar thumb
  const thumbWidth = scrollState.width && scrollState.scrollWidth
    ? Math.max(40, (scrollState.width / scrollState.scrollWidth) * (scrollState.width - 8))
    : 40;
  const thumbLeft = scrollState.width && scrollState.scrollWidth && scrollState.scrollWidth > scrollState.width
    ? ((scrollState.left / (scrollState.scrollWidth - scrollState.width)) * (scrollState.width - thumbWidth - 16))
    : 0;

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
          Import Extensions
        </DialogTitle>
        <DialogContent style={{ backgroundColor: '#dde0e4', padding: '20px 24px 12px' }}>
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-[13px] text-gray-600">Select a CSV or JSON file containing extension data to import.</p>
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

      {/* Main Extension Modal */}
      <Dialog
        open={showModal} 
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: { width: 760, maxWidth: '96vw', mx: 'auto', p: 0 }
        }}
      >
        <DialogTitle 
          className="text-white text-center font-semibold p-2 text-base"
          style={{
            background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
            borderBottom: '1px solid #444444'
          }}
        >
          {editIndex !== null ? 'Edit Extension' : 'Add Extension'}
        </DialogTitle>
        <DialogContent 
          className="pt-3 pb-0 px-2" 
          style={{
            padding: '12px 8px 0 8px',
            backgroundColor: '#dde0e4',
            border: '1px solid #444444',
            borderTop: 'none'
          }}
        >
          <div className="flex flex-col w-full">
            {/* Tabs header */}
            <div className="border-b border-gray-400 mb-2 bg-[#f1f3f6] rounded-t-md">
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="fullWidth"
                textColor="inherit"
                TabIndicatorProps={{ style: { backgroundColor: '#0e8fd6', height: 3 } }}
              >
                <Tab label="BASIC" value="basic" sx={{ fontSize: 13, fontWeight: 600, minHeight: 36 }} />
                <Tab label="FEATURES" value="features" sx={{ fontSize: 13, fontWeight: 600, minHeight: 36 }} />
                <Tab label="ADVANCED" value="advanced" sx={{ fontSize: 13, fontWeight: 600, minHeight: 36 }} />
              </Tabs>
            </div>

            {/* BASIC TAB */}
            {activeTab === 'basic' && (
              <div className="flex flex-col gap-3 w-full pb-2">
                {/* General */}
                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                    General
                  </div>
                  <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {formMode === 'single' ? (
                      <>
                        {/* Extension (single) */}
                        <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                          <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:130, marginRight:6}}>
                            Extension:
                          </label>
                          <div className="flex-1 max-w-[340px] w-full">
                            <TextField
                              type="text"
                              value={form.extension || ''}
                              onChange={e => handleChange('extension', e.target.value)}
                              size="small"
                              fullWidth
                              variant="outlined"
                              error={!!validationErrors.extension}
                              placeholder="e.g., 1001"
                              disabled={editIndex !== null}
                              inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                            />
                            {validationErrors.extension && (
                              <div className="text-red-500 text-xs mt-1">{validationErrors.extension}</div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Start Extension (bulk) */}
                        <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                          <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:130, marginRight:6}}>
                            Start Extension:
                          </label>
                          <div className="flex-1 max-w-[340px] w-full">
                            <TextField
                              type="number"
                              value={bulkForm.startExtension}
                              onChange={e => setBulkForm(prev => ({ ...prev, startExtension: e.target.value }))}
                              size="small"
                              fullWidth
                              variant="outlined"
                              inputProps={{ style: { fontSize: 14, padding: '3px 6px' }, min: 0 }}
                            />
                          </div>
                        </div>

                        {/* Create Number (bulk) */}
                        <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                          <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:130, marginRight:6}}>
                            Create Number:
                          </label>
                          <div className="flex-1 max-w-[340px] w-full">
                            <TextField
                              type="number"
                              value={bulkForm.createNumber}
                              onChange={e => setBulkForm(prev => ({ ...prev, createNumber: e.target.value }))}
                              size="small"
                              fullWidth
                              variant="outlined"
                              inputProps={{ style: { fontSize: 14, padding: '3px 6px' }, min: 1, max: 10 }}
                            />
                          </div>
                        </div>

                        {/* Registration Password (bulk) */}
                        <div className="flex items-start bg-white rounded px-2 py-1 gap-2 md:col-span-2">
                          <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:130, marginRight:6}}>
                            Registration Password:
                          </label>
                          <div className="flex-1 flex flex-col gap-2">
                            <FormControl size="small" sx={{ maxWidth: 260 }}>
                              <MuiSelect
                                value={bulkForm.passwordMode}
                                onChange={e => setBulkForm(prev => ({ ...prev, passwordMode: e.target.value }))}
                                sx={{ '& .MuiOutlinedInput-input': { padding: '4px 6px', fontSize: 13 } }}
                              >
                                <MenuItem value="random">Random</MenuItem>
                                <MenuItem value="fixed">Fixed</MenuItem>
                                <MenuItem value="prefix">Prefix + Extension</MenuItem>
                              </MuiSelect>
                            </FormControl>

                            {bulkForm.passwordMode === 'fixed' && (
                              <TextField
                                type="text"
                                value={bulkForm.fixedPassword}
                                onChange={e => setBulkForm(prev => ({ ...prev, fixedPassword: e.target.value }))}
                                size="small"
                                fullWidth
                                variant="outlined"
                                placeholder="Enter fixed password"
                                inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                              />
                            )}

                            {bulkForm.passwordMode === 'prefix' && (
                              <TextField
                                type="text"
                                value={bulkForm.passwordPrefix}
                                onChange={e => setBulkForm(prev => ({ ...prev, passwordPrefix: e.target.value }))}
                                size="small"
                                fullWidth
                                variant="outlined"
                                placeholder="Enter prefix (e.g. pw_)"
                                inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                              />
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Context */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:130, marginRight:6}}>
                        Context:
                      </label>
                      <div className="flex-1 max-w-[340px] w-full">
                        <FormControl fullWidth size="small" error={!!validationErrors.context}>
                          <MuiSelect
                            value={form.context || ''}
                            displayEmpty
                            onChange={e => handleChange('context', e.target.value)}
                            inputProps={{ 'aria-label': 'Select Context' }}
                            sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                          >
                            <MenuItem value="" disabled>
                              <em>Select Context</em>
                            </MenuItem>
                            {Array.from({ length: 10 }, (_, i) => `sip${i+1}`).map(ctx => (
                              <MenuItem key={ctx} value={ctx}>{ctx}</MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                        {validationErrors.context && (
                          <div className="text-red-500 text-xs mt-1">{validationErrors.context}</div>
                        )}
                      </div>
                    </div>

                    {/* Allow Codecs */}
                    <div className="flex items-start bg-white rounded px-2 py-1 gap-2 md:col-span-2">
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left pt-1" style={{width:130, marginRight:6}}>
                        Allow Codecs:
                      </label>
                      <div className="flex-1">
                        <FormGroup row sx={{ gap: 1 }}>
                          {CODEC_OPTIONS.map(codec => (
                            <FormControlLabel
                              key={codec.value}
                              control={
                                <Checkbox
                                  checked={isCodecSelected(codec.value)}
                                  onChange={(e) => handleCodecChange(codec.value, e.target.checked)}
                                  size="small"
                                  sx={{ 
                                    padding: '2px 4px',
                                    '& .MuiSvgIcon-root': { fontSize: 16 }
                                  }}
                                />
                              }
                              label={codec.label}
                              sx={{
                                margin: 0,
                                '& .MuiFormControlLabel-label': {
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: '#374151'
                                }
                              }}
                            />
                          ))}
                        </FormGroup>
                        {validationErrors.allow_codecs && (
                          <div className="text-red-500 text-xs mt-1">{validationErrors.allow_codecs}</div>
                        )}
                      </div>
                    </div>

                    {/* Password (single mode only) */}
                    {formMode === 'single' && (
                      <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:130, marginRight:6}}>
                          Password:
                        </label>
                        <div className="flex-1 max-w-[340px] w-full">
                          <TextField
                            type={showPassword ? 'text' : 'password'}
                            value={form.password || ''}
                            onChange={e => handleChange('password', e.target.value)}
                            size="small"
                            fullWidth
                            variant="outlined"
                            placeholder="Enter password"
                            error={!!validationErrors.password}
                            inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={togglePasswordVisibility}
                                    edge="end"
                                    size="small"
                                    sx={{ padding: '2px' }}
                                  >
                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {validationErrors.password && (
                            <div className="text-red-500 text-xs mt-1">{validationErrors.password}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Max Registrations */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:130, marginRight:6}}>
                        Max Registrations:
                      </label>
                      <div className="flex-1 max-w-[340px] w-full">
                        <TextField
                          type="number"
                          value={form.max_registrations || ''}
                          onChange={e => handleChange('max_registrations', e.target.value)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          inputProps={{ style: { fontSize: 14, padding: '3px 6px' }, min: 0 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                    User Info
                  </div>
                  <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {/* Name */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:130, marginRight:6}}>
                        Name:
                      </label>
                      <div className="flex-1 max-w-[340px] w-full">
                        <TextField
                          type="text"
                          value={form.user_name || ''}
                          onChange={e => handleChange('user_name', e.target.value)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                        />
                      </div>
                    </div>

                    {/* User Password */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:130, marginRight:6}}>
                        User Password:
                      </label>
                      <div className="flex-1 max-w-[340px] w-full">
                        <TextField
                          type="password"
                          value={form.user_password || ''}
                          onChange={e => handleChange('user_password', e.target.value)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:130, marginRight:6}}>
                        Email:
                      </label>
                      <div className="flex-1 max-w-[340px] w-full">
                        <TextField
                          type="email"
                          value={form.email || ''}
                          onChange={e => handleChange('email', e.target.value)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:130, marginRight:6}}>
                        Mobile Number:
                      </label>
                      <div className="flex-1 max-w-[340px] w-full">
                        <TextField
                          type="text"
                          value={form.mobile_number || ''}
                          onChange={e => handleChange('mobile_number', e.target.value)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          placeholder="e.g., +91XXXXXXXXXX"
                          inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* FEATURES TAB */}
            {activeTab === 'features' && (
              <div className="flex flex-col gap-3 w-full pb-2">
                {/* Voicemail */}
                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                    Voicemail
                  </div>
                  <div className="p-2 flex flex-col gap-2">
                    {/* Voicemail Enabled / Keep Local */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center bg-white rounded px-2 py-1 gap-2">
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:160, marginRight:10}}>
                          Voicemail Enabled:
                        </label>
                        <div className="flex-1">
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form.voicemail_enabled || 'no'}
                              onChange={e => handleChange('voicemail_enabled', e.target.value)}
                              sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                            >
                              <MenuItem value="yes">Yes</MenuItem>
                              <MenuItem value="no">No</MenuItem>
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                      <div className="flex items-center bg-white rounded px-2 py-1 gap-2">
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:160, marginRight:10}}>
                          Voicemail Keep Local:
                        </label>
                        <div className="flex-1">
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form.voicemail_keep_local || 'yes'}
                              onChange={e => handleChange('voicemail_keep_local', e.target.value)}
                              sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                            >
                              <MenuItem value="yes">Yes</MenuItem>
                              <MenuItem value="no">No</MenuItem>
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                    </div>

                    {/* File / Password / Voice */}
                    <div className="flex flex-col gap-2">
                      {/* Row: Voicemail File + Voicemail Password */}
                      <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-2">
                        {/* Voicemail File */}
                        <div className="flex-1 flex items-center bg-white rounded px-2 py-1 gap-2">
                          <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:140, marginRight:10}}>
                            Voicemail File:
                          </label>
                          <div className="flex-1">
                            <FormControl fullWidth size="small">
                              <MuiSelect
                                value={form.voicemail_file || 'audio_file_attachment'}
                                onChange={e => handleChange('voicemail_file', e.target.value)}
                                sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                              >
                                <MenuItem value="audio_file_attachment">Audio File Attachment</MenuItem>
                                <MenuItem value="download_link">Download Link</MenuItem>
                              </MuiSelect>
                            </FormControl>
                          </div>
                        </div>
                        {/* Voicemail Password */}
                        <div className="flex-1 flex items-center bg-white rounded px-2 py-1 gap-2">
                          <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:140, marginRight:10}}>
                            Voicemail Password:
                          </label>
                          <div className="flex-1">
                            <TextField
                              type="password"
                              value={form.voicemail_password || ''}
                              onChange={e => handleChange('voicemail_password', e.target.value)}
                              size="small"
                              fullWidth
                              variant="outlined"
                              inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Row: Select Voice (below Voicemail File), same width as Voicemail File */}
                      <div className="flex items-center bg-white rounded px-2 py-1 gap-2 md:w-1/2">
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:140, marginRight:10}}>
                          Select Voice:
                        </label>
                        <div className="flex-1">
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form.voicemail_voice || 'system_default'}
                              onChange={e => handleChange('voicemail_voice', e.target.value)}
                              sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                            >
                              <MenuItem value="system_default">System Default</MenuItem>
                              <MenuItem value="blank">Blank</MenuItem>
                              <MenuItem value="busy">Busy</MenuItem>
                              <MenuItem value="welcome">Welcome</MenuItem>
                              <MenuItem value="none">None</MenuItem>
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call Forwarding */}
                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                    Call Forwarding
                  </div>
                  <div className="p-2 flex flex-col gap-2">
                    {[
                      { key: 'always', label: 'Always' },
                      { key: 'busy', label: 'On Busy' },
                      { key: 'no_answer', label: 'No Answer' },
                      { key: 'not_registered', label: 'Not Registered' },
                    ].map(rule => (
                      <div key={rule.key} className="flex flex-col md:flex-row md:items-center md:gap-2 gap-1">
                        {/* Rule label */}
                        <div style={{ minWidth: 100, maxWidth: 110 }} className="text-[14px] text-gray-700 font-medium">
                          {rule.label}
                        </div>

                        {/* Disabled / Enabled radio buttons */}
                        <div style={{ minWidth: 180, maxWidth: 190 }} className="flex items-center">
                          <RadioGroup
                            row
                            value={form[`cf_${rule.key}_enabled`] || 'disabled'}
                            onChange={(e) => handleChange(`cf_${rule.key}_enabled`, e.target.value)}
                            sx={{ flexWrap: 'nowrap' }}
                          >
                            <FormControlLabel
                              value="disabled"
                              control={<Radio size="small" />}
                              label="Disabled"
                              sx={{ mr: 1.5, whiteSpace: 'nowrap', '& .MuiFormControlLabel-label': { fontSize: 13 } }}
                            />
                            <FormControlLabel
                              value="enabled"
                              control={<Radio size="small" />}
                              label="Enabled"
                              sx={{ mr: 0, whiteSpace: 'nowrap', '& .MuiFormControlLabel-label': { fontSize: 13 } }}
                            />
                          </RadioGroup>
                        </div>

                        {/* Destination number dropdown (extensions) */}
                        <div style={{ minWidth: 160, maxWidth: 170 }} className="flex items-center">
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form[`cf_${rule.key}_number`] || ''}
                              displayEmpty
                              onChange={e => handleChange(`cf_${rule.key}_number`, e.target.value)}
                              sx={{ '& .MuiOutlinedInput-input': { padding: '4px 6px', fontSize: 13 } }}
                            >
                              <MenuItem value="">
                                <em>Destination number</em>
                              </MenuItem>
                              {extensionOptions.map(ext => (
                                <MenuItem key={ext} value={ext}>{ext}</MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>

                        {/* Time Condition label + dropdown */}
                        <div style={{ minWidth: 135, maxWidth: 140 }} className="flex items-center gap-1.5">
                          <span className="text-[12px] text-gray-700 whitespace-nowrap">Time Condition</span>
                          <FormControl size="small" sx={{ minWidth: 62, maxWidth: 70 }}>
                            <MuiSelect
                              value={form[`cf_${rule.key}_time`] || 'all'}
                              onChange={e => handleChange(`cf_${rule.key}_time`, e.target.value)}
                              sx={{ '& .MuiOutlinedInput-input': { padding: '4px 6px', fontSize: 13 } }}
                            >
                              <MenuItem value="all">All</MenuItem>
                              <MenuItem value="work_time">Work Time</MenuItem>
                              <MenuItem value="holiday">Holiday</MenuItem>
                              <MenuItem value="custom">Custom</MenuItem>
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Follow Me */}
                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                    Follow Me
                  </div>
                  <div className="p-2 flex flex-col gap-2">
                    {/* Top row: Follow Me + radios + Time Condition */}
                    <div className="flex flex-col md:flex-row md:items-center md:gap-2 gap-2">
                      {/* Follow Me label */}
                      <div style={{ minWidth: 110 }} className="text-[14px] text-gray-700 font-medium">
                        Follow Me
                      </div>

                      {/* Disabled / Enabled radios */}
                      <div className="flex items-center" style={{ minWidth: 180, maxWidth: 190 }}>
                        <RadioGroup
                          row
                          value={form.follow_me_enabled || 'disabled'}
                          onChange={(e) => handleChange('follow_me_enabled', e.target.value)}
                          sx={{ flexWrap: 'nowrap' }}
                        >
                          <FormControlLabel
                            value="disabled"
                            control={<Radio size="small" />}
                            label="Disabled"
                            sx={{ mr: 1.5, whiteSpace: 'nowrap', '& .MuiFormControlLabel-label': { fontSize: 13 } }}
                          />
                          <FormControlLabel
                            value="enabled"
                            control={<Radio size="small" />}
                            label="Enabled"
                            sx={{ mr: 0, whiteSpace: 'nowrap', '& .MuiFormControlLabel-label': { fontSize: 13 } }}
                          />
                        </RadioGroup>
                      </div>

                      {/* Time Condition label + dropdown */}
                      <div className="flex items-center gap-1.5" style={{ minWidth: 135, maxWidth: 145 }}>
                        <span className="text-[12px] text-gray-700 whitespace-nowrap">Time Condition</span>
                        <FormControl size="small" sx={{ minWidth: 62, maxWidth: 70 }}>
                          <MuiSelect
                            value={form.follow_me_time || 'all'}
                            onChange={e => handleChange('follow_me_time', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-input': { padding: '4px 6px', fontSize: 13 } }}
                          >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="work_time">Work Time</MenuItem>
                            <MenuItem value="holiday">Holiday</MenuItem>
                            <MenuItem value="custom">Custom</MenuItem>
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>

                    {/* Destination and Timeout Destination when Follow Me is enabled */}
                    {form.follow_me_enabled === 'enabled' && (
                      <div className="flex flex-col gap-3 mt-1 border border-gray-200 rounded-md p-2 bg-[#fafbfc]">
                        {/* Destination section */}
                        <div className="flex flex-col gap-1">
                          {/* Header row: label + + button */}
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] text-gray-700 font-medium">Destination</span>
                            <button
                              type="button"
                              onClick={handleAddFollowMeEntry}
                              className="w-6 h-6 flex items-center justify-center bg-gray-200 border border-gray-400 rounded text-gray-700 text-lg leading-none"
                              title="Add Destination"
                            >
                              +
                            </button>
                          </div>

                          {/* Column headers */}
                          <div className="hidden md:flex text-[11px] text-gray-500 mt-1">
                            <div style={{ minWidth: 160 }} className="pr-2">
                              Destination
                            </div>
                            <div style={{ minWidth: 70 }} className="pr-2">
                              Timeout
                            </div>
                            <div style={{ minWidth: 90 }}>
                              Confirm
                            </div>
                          </div>

                          {/* Rows */}
                          <div className="flex flex-col gap-2 mt-1">
                            {(Array.isArray(form.follow_me_entries) && form.follow_me_entries.length > 0
                              ? form.follow_me_entries
                              : [{ destinationType: '', timeout: 30, confirm: 'unconfirm' }]
                            ).map((entry, idx) => (
                              <div key={idx} className="grid grid-cols-1 md:grid-cols-[220px_90px_120px] gap-2 items-center">
                                {/* Destination (extension number) */}
                                <FormControl size="small" sx={{ minWidth: 160, maxWidth: 220 }}>
                                  <MuiSelect
                                    value={entry?.destinationType || ''}
                                    displayEmpty
                                    onChange={e => handleFollowMeEntryChange(idx, 'destinationType', e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-input': { padding: '4px 6px', fontSize: 13 } }}
                                  >
                                    <MenuItem value="">
                                      <em>Select extension</em>
                                    </MenuItem>
                                    {extensionOptions.map(ext => (
                                      <MenuItem key={ext} value={ext}>{ext}</MenuItem>
                                    ))}
                                  </MuiSelect>
                                </FormControl>

                                {/* Timeout */}
                                <FormControl size="small" sx={{ minWidth: 70, maxWidth: 90 }}>
                                  <MuiSelect
                                    value={entry?.timeout ?? 30}
                                    onChange={e => handleFollowMeEntryChange(idx, 'timeout', Number(e.target.value))}
                                    sx={{ '& .MuiOutlinedInput-input': { padding: '4px 6px', fontSize: 13 } }}
                                  >
                                    {FOLLOW_ME_TIMEOUT_OPTIONS.map(v => (
                                      <MenuItem key={v} value={v}>{v}</MenuItem>
                                    ))}
                                  </MuiSelect>
                                </FormControl>

                                {/* Confirm */}
                                <FormControl size="small" sx={{ minWidth: 90, maxWidth: 120 }}>
                                  <MuiSelect
                                    value={entry?.confirm || 'unconfirm'}
                                    onChange={e => handleFollowMeEntryChange(idx, 'confirm', e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-input': { padding: '4px 6px', fontSize: 13 } }}
                                  >
                                    <MenuItem value="confirm">Confirm</MenuItem>
                                    <MenuItem value="unconfirm">UnConfirm</MenuItem>
                                  </MuiSelect>
                                </FormControl>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Timeout Destination */}
                        <div className="flex flex-col md:flex-row md:items-center md:gap-3 gap-1">
                          <div className="text-[13px] text-gray-700 font-medium" style={{ minWidth: 140 }}>
                            Timeout Destination
                          </div>
                          <FormControl size="small" sx={{ minWidth: 160, maxWidth: 220 }}>
                            <MuiSelect
                              value={form.follow_me_timeout_destination || ''}
                              displayEmpty
                              onChange={e => handleChange('follow_me_timeout_destination', e.target.value)}
                              sx={{ '& .MuiOutlinedInput-input': { padding: '4px 6px', fontSize: 13 } }}
                            >
                              <MenuItem value="">
                                <em>Select destination</em>
                              </MenuItem>
                              {FOLLOW_ME_DESTINATION_TYPES.map(label => (
                                <MenuItem key={label} value={label}>{label}</MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Do Not Disturb */}
                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                    Do Not Disturb
                  </div>
                  <div className="p-2 flex flex-col gap-2">
                    {/* Top row: DND label + radios */}
                    <div className="flex flex-col md:flex-row md:items-center md:gap-2 gap-2">
                      <div style={{ minWidth: 140 }} className="text-[14px] text-gray-700 font-medium">
                        Do Not Disturb
                      </div>
                      <div className="flex items-center" style={{ minWidth: 180, maxWidth: 190 }}>
                        <RadioGroup
                          row
                          value={form.dnd_enabled || 'disabled'}
                          onChange={(e) => handleChange('dnd_enabled', e.target.value)}
                          sx={{ flexWrap: 'nowrap' }}
                        >
                          <FormControlLabel
                            value="disabled"
                            control={<Radio size="small" />}
                            label="Disabled"
                            sx={{ mr: 1.5, whiteSpace: 'nowrap', '& .MuiFormControlLabel-label': { fontSize: 13 } }}
                          />
                          <FormControlLabel
                            value="enabled"
                            control={<Radio size="small" />}
                            label="Enabled"
                            sx={{ mr: 0, whiteSpace: 'nowrap', '& .MuiFormControlLabel-label': { fontSize: 13 } }}
                          />
                        </RadioGroup>
                      </div>
                      <div className="flex items-center gap-1.5" style={{ minWidth: 135, maxWidth: 145 }}>
                        <span className="text-[12px] text-gray-700 whitespace-nowrap">Time Condition</span>
                        <FormControl size="small" sx={{ minWidth: 62, maxWidth: 70 }}>
                          <MuiSelect
                            value={form.dnd_time || 'all'}
                            onChange={e => handleChange('dnd_time', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-input': { padding: '4px 6px', fontSize: 13 } }}
                          >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="work_time">Work Time</MenuItem>
                            <MenuItem value="holiday">Holiday</MenuItem>
                            <MenuItem value="custom">Custom</MenuItem>
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>

                    {/* Special Number for Do Not Disturb (only when enabled) */}
                    {form.dnd_enabled === 'enabled' && (
                      <div className="flex flex-col gap-2 mt-1">
                        {/* Label row with + button on the right */}
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-gray-700 font-medium">
                            Special Number for Do Not Disturb
                          </span>
                          <button
                            type="button"
                            onClick={handleAddDndNumber}
                            className="w-6 h-6 flex items-center justify-center bg-gray-200 border border-gray-400 rounded text-gray-700 text-lg leading-none"
                            title="Add Special Number"
                          >
                            +
                          </button>
                        </div>

                        {/* Dropdown list of special numbers */}
                        <div className="flex flex-col gap-2">
                          {(Array.isArray(form.dnd_special_numbers) && form.dnd_special_numbers.length > 0
                            ? form.dnd_special_numbers
                            : ['']
                          ).map((val, idx) => (
                            <FormControl
                              key={idx}
                              size="small"
                              sx={{ maxWidth: 260 }}
                            >
                              <MuiSelect
                                value={val || ''}
                                displayEmpty
                                onChange={e => handleDndNumberChange(idx, e.target.value)}
                                sx={{ '& .MuiOutlinedInput-input': { padding: '4px 6px', fontSize: 13 } }}
                              >
                                <MenuItem value="">
                                  <em>Select extension</em>
                                </MenuItem>
                                {extensionOptions.map(ext => (
                                  <MenuItem key={ext} value={ext}>{ext}</MenuItem>
                                ))}
                              </MuiSelect>
                            </FormControl>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobility Extension */}
                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                    Mobility Extension
                  </div>
                  <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:170, marginRight:6}}>
                        Enable Mobility Extension
                      </label>
                      <div className="flex-1 max-w-[340px] w-full">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.enable_mobility_extension || 'no'}
                            onChange={e => handleChange('enable_mobility_extension', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                          >
                            <MenuItem value="yes">Yes</MenuItem>
                            <MenuItem value="no">No</MenuItem>
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:170, marginRight:6}}>
                        Prefix
                      </label>
                      <div className="flex-1 max-w-[340px] w-full">
                        <TextField
                          type="text"
                          value={form.mobility_prefix || ''}
                          onChange={e => handleChange('mobility_prefix', e.target.value)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:170, marginRight:6}}>
                        Ring Simultaneously
                      </label>
                      <div className="flex-1 max-w-[340px] w-full">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.ring_simultaneously || 'no'}
                            onChange={e => handleChange('ring_simultaneously', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                          >
                            <MenuItem value="yes">Yes</MenuItem>
                            <MenuItem value="no">No</MenuItem>
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:170, marginRight:6}}>
                        Timeout
                      </label>
                      <div className="flex-1 max-w-[340px] w-full">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={Number(form.mobility_timeout || 30)}
                            onChange={e => handleChange('mobility_timeout', Number(e.target.value))}
                            sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                          >
                            {FOLLOW_ME_TIMEOUT_OPTIONS.map(v => (
                              <MenuItem key={v} value={v}>{v}</MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secretary Service */}
                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                    Secretary Service
                  </div>
                  <div className="p-2 flex flex-col gap-2">
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2">
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:170, marginRight:6}}>
                        Secretary Service
                      </label>
                      <RadioGroup
                        row
                        value={form.secretary_service || 'disabled'}
                        onChange={(e) => handleChange('secretary_service', e.target.value)}
                        sx={{ flexWrap: 'nowrap' }}
                      >
                        <FormControlLabel
                          value="disabled"
                          control={<Radio size="small" />}
                          label="Disabled"
                          sx={{ mr: 1.5, whiteSpace: 'nowrap', '& .MuiFormControlLabel-label': { fontSize: 13 } }}
                        />
                        <FormControlLabel
                          value="enabled"
                          control={<Radio size="small" />}
                          label="Enabled"
                          sx={{ mr: 0, whiteSpace: 'nowrap', '& .MuiFormControlLabel-label': { fontSize: 13 } }}
                        />
                      </RadioGroup>
                    </div>

                    {form.secretary_service === 'enabled' && (
                      <div className="flex items-center bg-white rounded px-2 py-1 gap-2">
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:170, marginRight:6}}>
                          Secretary Number
                        </label>
                        <div className="flex-1 max-w-[340px] w-full">
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form.secretary_extension || ''}
                              displayEmpty
                              onChange={e => handleChange('secretary_extension', e.target.value)}
                              sx={{ '& .MuiOutlinedInput-input': { padding: '4px 6px', fontSize: 13 } }}
                            >
                              <MenuItem value="">
                                <em>Select extension</em>
                              </MenuItem>
                              {['ss1', 'ss2', ...extensionOptions].map(opt => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ADVANCED TAB */}
            {activeTab === 'advanced' && (
              <div className="flex flex-col gap-3 w-full pb-2">

                {/* RTP Settings */}
                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                    RTP Settings
                  </div>
                  <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {/* Enable SRTP */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, flexShrink: 0 }}>
                        Enable SRTP
                      </label>
                      <div className="flex-1 w-full">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.enable_srtp || 'no'}
                            onChange={e => handleChange('enable_srtp', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                          >
                            <MenuItem value="no">No</MenuItem>
                            <MenuItem value="yes">Yes</MenuItem>
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    {/* SIP Bypass Media */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, flexShrink: 0 }}>
                        SIP Bypass Media
                      </label>
                      <div className="flex-1 w-full">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.sip_bypass_media || 'proxy_media'}
                            onChange={e => handleChange('sip_bypass_media', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                          >
                            <MenuItem value="proxy_media">Proxy Media</MenuItem>
                            <MenuItem value="bypass_media">Bypass Media</MenuItem>
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call Settings */}
                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                    Call Settings
                  </div>
                  <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {/* Call Timeout */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, flexShrink: 0 }}>
                        Call Timeout (s)
                      </label>
                      <div className="flex-1 w-full">
                        <TextField
                          type="number"
                          value={form.call_timeout ?? 30}
                          onChange={e => handleChange('call_timeout', e.target.value)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          inputProps={{ style: { fontSize: 14, padding: '3px 6px' }, min: 0 }}
                        />
                      </div>
                    </div>
                    {/* Max Call Duration */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, flexShrink: 0 }}>
                        Max Call Duration (s)
                      </label>
                      <div className="flex-1 w-full">
                        <TextField
                          type="number"
                          value={form.max_call_duration ?? 6000}
                          onChange={e => handleChange('max_call_duration', e.target.value)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          inputProps={{ style: { fontSize: 14, padding: '3px 6px' }, min: 0 }}
                        />
                      </div>
                    </div>
                    {/* Outbound Restriction */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, flexShrink: 0 }}>
                        Outbound Restriction
                      </label>
                      <div className="flex-1 w-full">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.outbound_restriction || 'disable'}
                            onChange={e => handleChange('outbound_restriction', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                          >
                            <MenuItem value="disable">Disable</MenuItem>
                            <MenuItem value="enable">Enable</MenuItem>
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    {/* Admin Call Permission */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, flexShrink: 0 }}>
                        Max Call Permission
                      </label>
                      <div className="flex-1 w-full">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.admin_call_permission || 'international_call'}
                            onChange={e => handleChange('admin_call_permission', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                          >
                            <MenuItem value="no_call">No Call</MenuItem>
                            <MenuItem value="internal_call">Internal Call</MenuItem>
                            <MenuItem value="local_call">Local Call</MenuItem>
                            <MenuItem value="long_distance_call">Long-Distance Call</MenuItem>
                            <MenuItem value="international_call">International Call</MenuItem>
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    {/* Extension Trunk */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, flexShrink: 0 }}>
                        Extension Trunk
                      </label>
                      <div className="flex-1 w-full">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.extension_trunk || 'disable'}
                            onChange={e => handleChange('extension_trunk', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                          >
                            <MenuItem value="disable">Disable</MenuItem>
                            <MenuItem value="enable">Enable</MenuItem>
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    {/* Call Permission (read-only) */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, flexShrink: 0 }}>
                        Used Call Permission
                      </label>
                      <div className="flex-1 w-full">
                        <div className="text-[14px] text-gray-600 px-2 py-1 bg-gray-100 rounded border border-gray-200" style={{ minHeight: 32, display: 'flex', alignItems: 'center' }}>
                          {(() => {
                            const v = form.call_permission || 'international_call';
                            if (v === 'no_call') return 'No Call';
                            if (v === 'internal_call') return 'Internal Call';
                            if (v === 'local_call') return 'Local Call';
                            if (v === 'long_distance_call') return 'Long-Distance Call';
                            return 'International Call';
                          })()}
                        </div>
                      </div>
                    </div>
                    {/* Dynamic Lock Pin */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, flexShrink: 0 }}>
                        Dynamic Lock Pin
                      </label>
                      <div className="flex-1 w-full">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.dynamic_lock_pin || 'default'}
                            onChange={e => handleChange('dynamic_lock_pin', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                          >
                            <MenuItem value="default">Default</MenuItem>
                            {form.dynamic_lock_pin === 'user_password' && (
                              <MenuItem value="user_password">User Password</MenuItem>
                            )}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    {/* Diversion */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, flexShrink: 0 }}>
                        Diversion
                      </label>
                      <div className="flex-1 w-full">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.diversion || 'yes'}
                            onChange={e => handleChange('diversion', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                          >
                            <MenuItem value="yes">Yes</MenuItem>
                            <MenuItem value="no">No</MenuItem>
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                    {/* Call Prohibition */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, flexShrink: 0 }}>
                        Call Prohibition
                      </label>
                      <div className="flex-1 w-full">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.call_prohibition || 'disable'}
                            onChange={e => handleChange('call_prohibition', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                          >
                            <MenuItem value="disable">Disable</MenuItem>
                            <MenuItem value="enable">Enable</MenuItem>
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other Settings */}
                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                    Other Settings
                  </div>
                  <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {/* RX Volume */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, flexShrink: 0 }}>
                        RX Volume
                      </label>
                      <div className="flex-1 w-full">
                        <TextField
                          type="number"
                          value={form.rx_volume ?? 0}
                          onChange={e => handleChange('rx_volume', e.target.value)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                        />
                      </div>
                    </div>
                    {/* TX Volume */}
                    <div className="flex items-center bg-white rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, flexShrink: 0 }}>
                        TX Volume
                      </label>
                      <div className="flex-1 w-full">
                        <TextField
                          type="number"
                          value={form.tx_volume ?? 0}
                          onChange={e => handleChange('tx_volume', e.target.value)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </DialogContent>
        <DialogActions className="p-4 justify-center gap-6">
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
              borderRadius: 2,
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                color: '#fff',
              },
              '&:disabled': {
                background: '#ccc',
                color: '#666',
              },
            }}
            onClick={formMode === 'single' ? handleSave : handleBulkSave}
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
              borderRadius: 2,
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #d1d5db 0%, #e5e7eb 100%)',
                color: '#374151',
              },
              '&:disabled': {
                background: '#f3f4f6',
                color: '#9ca3af',
              },
            }}
            onClick={handleCloseModal}
            disabled={loading.save}
          >
            Close
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
          <span>Extensions</span>
          <div className="flex-1 flex justify-end gap-2">
            <button
              className="cursor-pointer font-semibold text-xs rounded px-4 py-1 transition-all active:scale-95"
              style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #dbeafe 100%)', color: '#1565c0', border: '1px solid #93c5fd', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to bottom, #dbeafe 0%, #bfdbfe 100%)'}
              onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(to bottom, #ffffff 0%, #dbeafe 100%)'}
              onClick={() => { setShowImportModal(true); setImportFile(null); }}
            >
              Import
            </button>
            <button
              className="cursor-pointer font-semibold text-xs rounded px-4 py-1 transition-all active:scale-95"
              style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #dbeafe 100%)', color: '#1565c0', border: '1px solid #93c5fd', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to bottom, #dbeafe 0%, #bfdbfe 100%)'}
              onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(to bottom, #ffffff 0%, #dbeafe 100%)'}
              onClick={handleExport}
            >
              Export
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[1200px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
            <thead>
              <tr>
                {SIP_ACCOUNT_TABLE_COLUMNS.map(c => (
                  <th key={c.key} className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 whitespace-nowrap">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading.fetch ? (
                <tr>
                  <td colSpan={SIP_ACCOUNT_TABLE_COLUMNS.length} className="border border-gray-300 px-2 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <CircularProgress size={20} />
                      <span>Loading accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={SIP_ACCOUNT_TABLE_COLUMNS.length} className="border border-gray-300 px-2 py-1 text-center">No data</td>
                </tr>
              ) : (
                pagedAccounts.map((item, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  return (
                    <tr key={realIdx}>
                      <td className="border border-gray-300 px-2 py-1 text-center"><input type="checkbox" checked={selected.includes(realIdx)} onChange={() => handleSelectRow(realIdx)} disabled={loading.delete} /></td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{realIdx}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{item.extension || '--'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{item.context || '--'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{item.allow_codecs || '--'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{'*'.repeat(item.password?.length || 0)}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'online' ? 'bg-green-100 text-green-800' :
                          item.status === 'offline' ? 'bg-red-100 text-red-800' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {item.status || '--'}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center"><EditDocumentIcon className={`cursor-pointer text-blue-600 mx-auto ${loading.delete ? 'opacity-50' : ''}`} onClick={() => !loading.delete && handleOpenModal(item, realIdx)} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table controls - always show */}
        <div className="flex flex-wrap justify-between items-center bg-[#e3e7ef] rounded-b-lg border border-t-0 border-gray-300 px-2 py-2 gap-2">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleCheckAll}
              disabled={loading.delete || loading.fetch}
            >
              Check All
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleUncheckAll}
              disabled={loading.delete || loading.fetch}
            >
              Uncheck All
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleInverse}
              disabled={loading.delete || loading.fetch}
            >
              Inverse
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleDelete}
              disabled={loading.delete || loading.fetch}
            >
              {loading.delete && <CircularProgress size={12} />}
              Delete
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleClearAll}
              disabled={loading.delete || loading.fetch}
            >
              {loading.delete && <CircularProgress size={12} />}
              Clear All
            </button>

            



          </div>
          <div className="flex gap-2">
            <button 
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.fetch || loading.save) ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={openBulkModal}
              disabled={loading.fetch || loading.save}
            >
              Bulk Add
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.fetch || loading.save) ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={() => handleOpenModal()}
              disabled={loading.fetch || loading.save}
            >
              Add New
            </button>
          </div>
        </div>
        
        {/* Pagination - always show */}
        <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
          <span>{accounts.length} items Total</span>
          <span>{itemsPerPage} Items/Page</span>
          <span>{page}/{totalPages}</span>
          <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(1)} disabled={page === 1}>First</button>
          <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</button>
          <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Next</button>
          <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}>Last</button>
          <span>Go to Page</span>
          <select className="text-xs rounded border border-gray-300 px-1 py-0.5 min-w-[40px]" value={page} onChange={e => handlePageChange(Number(e.target.value))}>
            {Array.from({ length: totalPages }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <span>{totalPages} Pages Total</span>
        </div>
      </div>
    </div>
  );
};

export default SipAccountPage;
