import React, { useEffect, useMemo, useRef, useState } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
} from '@mui/material';
import {
  listIvrDirectOutboundOptions,
  listIvrDestinations,
  listIvrs,
  createIvr,
  updateIvr,
  deleteIvr,
  fetchSipAccounts,
} from '../api/apiService';

const ENABLE_OPTIONS = ['Yes', 'No'];
const CHECK_VOICEMAIL_OPTIONS = ['Disable', 'Enable'];
const DIRECT_EXTENSION_OPTIONS = ['Disable', 'Enable'];
const FXO_FLASH_TRANSFER_OPTIONS = ['Disable', 'Enable'];
const GREET_LONG_OPTIONS = ['Default', 'Blank', 'Busy', 'Welcome'];
const GREET_SHORT_OPTIONS = ['Blank', 'Busy', 'Welcome'];
const SOUND_OPTIONS = ['Default', 'Blank', 'Busy', 'Welcome'];
const RINGBACK_OPTIONS = [
  'default',
  'blank',
  'busy.mp3',
  'WELCOME.wav',
  'au-ring',
  'be-ring',
  'bong-ring',
  'ca-ring',
  'cn-ring',
  'cy-ring',
  'cz-ring',
  'de-ring',
  'dk-ring',
  'dz-ring',
  'eg-ring',
  'fi-ring',
  'fr-ring',
  'hk-ring',
  'hu-ring',
  'il-ring',
  'in-ring',
  'it-ring',
  'jp-ring',
  'ko-ring',
  'pk-ring',
  'pl-ring',
  'pt-ring',
  'ro-ring',
  'rs-ring',
  'ru-ring',
  'sa-ring',
  'tr-ring',
  'uk-ring',
  'us-ring',
];

const KEYS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#'];

const IVRPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'keypress'
  const [loading, setLoading] = useState({ save: false, delete: false, trunks: false, list: false });
  const hasLoadedTrunksRef = useRef(false);

  // Basic tab state
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [ivrNumber, setIvrNumber] = useState('');
  const [greetLong, setGreetLong] = useState('Default');
  const [greetShort, setGreetShort] = useState('Blank');
  const [responseTimeout, setResponseTimeout] = useState('10000');
  const [password, setPassword] = useState('');
  const [checkVoicemail, setCheckVoicemail] = useState('Disable');
  const [directOutbound, setDirectOutbound] = useState(false);
  const [interDigitTimeout, setInterDigitTimeout] = useState('3000');
  const [maxFailures, setMaxFailures] = useState('3');
  const [maxTimeouts, setMaxTimeouts] = useState('3');
  const [digitLength, setDigitLength] = useState('4');
  const [enabled, setEnabled] = useState('Yes');
  const [directExtension, setDirectExtension] = useState('Disable');
  const [fxoFlashTransfer, setFxoFlashTransfer] = useState('Disable');
  const [invalidSound, setInvalidSound] = useState('Default');
  const [exitSound, setExitSound] = useState('Default');
  const [ringBack, setRingBack] = useState('default');
  const [callerIdNamePrefix, setCallerIdNamePrefix] = useState('');

  // Member trunks (when Direct Outbound is checked)
  const [availableTrunks, setAvailableTrunks] = useState([]);
  const [selectedTrunks, setSelectedTrunks] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  // Key press events
  const [keyDestinations, setKeyDestinations] = useState(() => {
    const obj = {};
    KEYS.forEach((k) => {
      obj[k] = '';
    });
    return obj;
  });

  const [keyDestinationValues, setKeyDestinationValues] = useState(() => {
    const obj = {};
    KEYS.forEach((k) => {
      obj[k] = '';
    });
    return obj;
  });

  // Exit action
  const [exitActionType, setExitActionType] = useState('');
  const [exitActionValue, setExitActionValue] = useState('');

  const [destinationOptions, setDestinationOptions] = useState([]);
  const [destinationMap, setDestinationMap] = useState({});
  const [extensionOptions, setExtensionOptions] = useState([]);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage((current) => Math.min(Math.max(1, current), Math.max(1, Math.ceil(rows.length / itemsPerPage))));
  }, [rows]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading((prev) => ({ ...prev, list: true }));
      try {
        // IVR list
        const ivrRes = await listIvrs();
        const ivrList = Array.isArray(ivrRes?.message) ? ivrRes.message : Array.isArray(ivrRes?.data) ? ivrRes.data : [];
        const normalized = ivrList.map((item) => ({
          id: item.id,
          name: item.name,
          ivrNumber: item.ivr_number,
          greetLong: item.greet_long,
          greetShort: item.greet_short,
          responseTimeout: String(item.response_timeout_ms),
          password: item.password || '',
          checkVoicemail: item.check_voicemail ? 'Enable' : 'Disable',
          directOutbound: !!item.direct_outbound,
          interDigitTimeout: String(item.inter_digit_timeout_ms),
          maxFailures: String(item.max_failures),
          maxTimeouts: String(item.max_timeouts),
          digitLength: String(item.digit_length),
          enabled: item.enabled ? 'Yes' : 'No',
          directExtension: item.direct_extension ? 'Enable' : 'Disable',
          fxoFlashTransfer: item.fxo_flash_transfer ? 'Enable' : 'Disable',
          invalidSound: item.invalid_sound || 'Default',
          exitSound: item.exit_sound || 'Default',
          exitActionType: item.exit_action_type || '',
          exitActionValue: item.exit_action_value || '',
          ringBack: item.ring_back || 'default',
          callerIdNamePrefix: item.callerid_prefix || '',
          memberTrunks: Array.isArray(item.direct_outbound_trunks) ? item.direct_outbound_trunks.map(String) : [],
        }));
        setRows(normalized);

        // Destination options (queues, IVRs, etc.)
        const destRes = await listIvrDestinations();
        const destMessage = destRes?.message || destRes?.data || destRes;
        if (destMessage && typeof destMessage === 'object') {
          setDestinationMap(destMessage);
          setDestinationOptions(Object.keys(destMessage));
        }

        // Extensions from PJSIP (for Extensions/Voicemails/FaxToMail)
        try {
          const sipRes = await fetchSipAccounts();
          const sipList = Array.isArray(sipRes?.message) ? sipRes.message : Array.isArray(sipRes?.data) ? sipRes.data : [];
          const extList = sipList
            .filter((e) => e && e.extension)
            .map((e) => ({
              extension: String(e.extension),
              display_name: e.display_name || e.name || '',
            }));
          setExtensionOptions(extList);
        } catch (innerErr) {
          // If this fails, just leave extensionOptions empty; core IVR still works
          console.error('Failed to load SIP extensions for IVR destinations:', innerErr);
          setExtensionOptions([]);
        }
      } catch (err) {
        showAlert(err?.message || 'Failed to load IVR data.');
      } finally {
        setLoading((prev) => ({ ...prev, list: false }));
      }
    };
    fetchInitialData();
  }, []);

  const showAlert = (text) => window.alert(text);

  const loadTrunks = async () => {
    setLoading((prev) => ({ ...prev, trunks: true }));
    try {
      const res = await listIvrDirectOutboundOptions();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      const trunks = list
        .map((t) => {
          const id = t?.id || t?.trunk_id || t?.trunkId || t;
          const label = t?.label || t?.name || t?.trunk_name || String(id || '');
          return { id: String(id), label: label || String(id || '') };
        })
        .filter((t) => t.id);
      setAvailableTrunks(trunks);
      hasLoadedTrunksRef.current = true;
    } catch (err) {
      showAlert(err?.message || 'Failed to load trunks.');
      setAvailableTrunks([]);
    } finally {
      setLoading((prev) => ({ ...prev, trunks: false }));
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setIvrNumber('');
    setGreetLong('Default');
    setGreetShort('Blank');
    setResponseTimeout('10000');
    setPassword('');
    setCheckVoicemail('Disable');
    setDirectOutbound(false);
    setInterDigitTimeout('3000');
    setMaxFailures('3');
    setMaxTimeouts('3');
    setDigitLength('4');
    setEnabled('Yes');
    setDirectExtension('Disable');
    setFxoFlashTransfer('Disable');
    setInvalidSound('Default');
    setExitSound('Default');
    setExitActionType('');
    setExitActionValue('');
    setRingBack('default');
    setCallerIdNamePrefix('');
    setSelectedTrunks([]);
    setAvailableSelected([]);
    setChosenSelected([]);
    const obj = {};
    KEYS.forEach((k) => {
      obj[k] = '';
    });
    setKeyDestinations(obj);
    const objVals = {};
    KEYS.forEach((k) => {
      objVals[k] = '';
    });
    setKeyDestinationValues(objVals);
    setActiveTab('basic');
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    if (!hasLoadedTrunksRef.current) {
      await loadTrunks();
    }
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || '');
    setIvrNumber(row.ivrNumber || '');
    setGreetLong(row.greetLong || 'Default');
    setGreetShort(row.greetShort || 'Blank');
    setResponseTimeout(row.responseTimeout || '10000');
    setPassword(row.password || '');
    setCheckVoicemail(row.checkVoicemail || 'Disable');
    setDirectOutbound(!!row.directOutbound);
    setInterDigitTimeout(row.interDigitTimeout || '3000');
    setMaxFailures(row.maxFailures || '3');
    setMaxTimeouts(row.maxTimeouts || '3');
    setDigitLength(row.digitLength || '4');
    setEnabled(row.enabled || 'Yes');
    setDirectExtension(row.directExtension || 'Disable');
    setFxoFlashTransfer(row.fxoFlashTransfer || 'Disable');
    setInvalidSound(row.invalidSound || 'Default');
    setExitSound(row.exitSound || 'Default');
    setExitActionType(row.exitActionType || '');
    setExitActionValue(row.exitActionValue || '');
    setRingBack(row.ringBack || 'default');
    setCallerIdNamePrefix(row.callerIdNamePrefix || '');
    setSelectedTrunks(Array.isArray(row.memberTrunks) ? row.memberTrunks : []);
    setAvailableSelected([]);
    setChosenSelected([]);
    setKeyDestinations((prev) => {
      const next = { ...prev };
      KEYS.forEach((k) => {
        next[k] = row.keyDestinations?.[k] || '';
      });
      return next;
    });
    setActiveTab('basic');
    setShowModal(true);
    if (!hasLoadedTrunksRef.current) {
      await loadTrunks();
    }
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const trunkLabelMap = useMemo(() => {
    const map = new Map();
    availableTrunks.forEach((t) => {
      map.set(t.id, t.label);
    });
    return map;
  }, [availableTrunks]);

  const getTrunkLabel = (id) => trunkLabelMap.get(id) || id;

  const availableList = useMemo(
    () => availableTrunks.filter((t) => !selectedTrunks.includes(t.id)),
    [availableTrunks, selectedTrunks]
  );

  const addSelectedTrunks = () => {
    if (availableSelected.length === 0) return;
    setSelectedTrunks((prev) => [...prev, ...availableSelected.filter((id) => !prev.includes(id))]);
    setAvailableSelected([]);
  };

  const addAllTrunks = () => {
    setSelectedTrunks(availableTrunks.map((t) => t.id));
    setAvailableSelected([]);
  };

  const removeSelectedTrunks = () => {
    if (chosenSelected.length === 0) return;
    setSelectedTrunks((prev) => prev.filter((id) => !chosenSelected.includes(id)));
    setChosenSelected([]);
  };

  const removeAllTrunks = () => {
    setSelectedTrunks([]);
    setChosenSelected([]);
  };

  const handleCheckAll = () => setSelected(rows.map((_, i) => i));
  const handleUncheckAll = () => setSelected([]);
  const handleSelectRow = (idx) => {
    setSelected((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  };

  const handleDelete = () => {
    if (selected.length === 0) {
      showAlert('Please select at least one row to delete.');
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    (async () => {
      try {
        const rowsToDelete = rows.filter((_, idx) => selected.includes(idx));
        for (const row of rowsToDelete) {
          if (row.id != null) {
            await deleteIvr(row.id);
          }
        }
        const ivrRes = await listIvrs();
        const ivrList = Array.isArray(ivrRes?.message) ? ivrRes.message : Array.isArray(ivrRes?.data) ? ivrRes.data : [];
        const normalized = ivrList.map((item) => ({
          id: item.id,
          name: item.name,
          ivrNumber: item.ivr_number,
          greetLong: item.greet_long,
          greetShort: item.greet_short,
          responseTimeout: String(item.response_timeout_ms),
          password: item.password || '',
          checkVoicemail: item.check_voicemail ? 'Enable' : 'Disable',
          directOutbound: !!item.direct_outbound,
          interDigitTimeout: String(item.inter_digit_timeout_ms),
          maxFailures: String(item.max_failures),
          maxTimeouts: String(item.max_timeouts),
          digitLength: String(item.digit_length),
          enabled: item.enabled ? 'Yes' : 'No',
          directExtension: item.direct_extension ? 'Enable' : 'Disable',
          fxoFlashTransfer: item.fxo_flash_transfer ? 'Enable' : 'Disable',
          invalidSound: item.invalid_sound || 'Default',
          exitSound: item.exit_sound || 'Default',
          ringBack: item.ring_back || 'default',
          callerIdNamePrefix: item.callerid_prefix || '',
          memberTrunks: Array.isArray(item.direct_outbound_trunks) ? item.direct_outbound_trunks.map(String) : [],
        }));
        setRows(normalized);
        setSelected([]);
      } catch (err) {
        showAlert(err?.message || 'Failed to delete IVR(s).');
      } finally {
        setLoading((prev) => ({ ...prev, delete: false }));
      }
    })();
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showAlert('Name is required.');
      return;
    }
    if (!ivrNumber.trim()) {
      showAlert('IVR Number is required.');
      return;
    }

    // Validation based on backend rules
    if (!/^[A-Za-z0-9_]+$/.test(trimmedName)) {
      showAlert('Name may contain only letters, numbers, and underscore.');
      return;
    }

    const ivrNumInt = parseInt(ivrNumber.trim(), 10);
    if (Number.isNaN(ivrNumInt) || ivrNumInt < 6500 || ivrNumInt > 6599) {
      showAlert('IVR Number must be an integer between 6500 and 6599.');
      return;
    }

    const respTimeoutInt = parseInt(responseTimeout, 10);
    if (Number.isNaN(respTimeoutInt) || respTimeoutInt < 1000 || respTimeoutInt > 60000) {
      showAlert('Response Timeout must be between 1000 and 60000 ms.');
      return;
    }

    const interDigitInt = parseInt(interDigitTimeout, 10);
    if (Number.isNaN(interDigitInt) || interDigitInt < 500 || interDigitInt > 10000) {
      showAlert('Inter-Digit Timeout must be between 500 and 10000 ms.');
      return;
    }

    const digitLengthInt = parseInt(digitLength, 10);
    if (Number.isNaN(digitLengthInt) || digitLengthInt < 1 || digitLengthInt > 20) {
      showAlert('Digit Length must be between 1 and 20.');
      return;
    }

    const payloadForApi = {
      name: trimmedName,
      ivr_number: ivrNumInt,
      greet_long: greetLong.toLowerCase(),
      greet_short: greetShort.toLowerCase(),
      response_timeout_ms: respTimeoutInt,
      password: password || undefined,
      check_voicemail: checkVoicemail === 'Enable',
      direct_outbound: !!directOutbound,
      inter_digit_timeout_ms: interDigitInt,
      max_failures: parseInt(maxFailures, 10) || 3,
      max_timeouts: parseInt(maxTimeouts, 10) || 3,
      digit_length: digitLengthInt,
      enabled: enabled === 'Yes',
      direct_extension: directExtension === 'Enable',
      fxo_flash_transfer: fxoFlashTransfer === 'Enable',
      invalid_sound: invalidSound.toLowerCase(),
      exit_sound: exitSound.toLowerCase(),
      ring_back: ringBack,
      callerid_prefix: callerIdNamePrefix || undefined,
      exit_action_type: exitActionType || null,
      exit_action_value: exitActionType ? exitActionValue || null : null,
      direct_outbound_trunks: directOutbound ? selectedTrunks.map((t) => String(t)) : [],
    };

    setLoading((prev) => ({ ...prev, save: true }));
    (async () => {
      try {
        if (editId != null) {
          await updateIvr(editId, payloadForApi);
        } else {
          await createIvr(payloadForApi);
        }

        const ivrRes = await listIvrs();
        const ivrList = Array.isArray(ivrRes?.message) ? ivrRes.message : Array.isArray(ivrRes?.data) ? ivrRes.data : [];
        const normalized = ivrList.map((item) => ({
          id: item.id,
          name: item.name,
          ivrNumber: item.ivr_number,
          greetLong: item.greet_long,
          greetShort: item.greet_short,
          responseTimeout: String(item.response_timeout_ms),
          password: item.password || '',
          checkVoicemail: item.check_voicemail ? 'Enable' : 'Disable',
          directOutbound: !!item.direct_outbound,
          interDigitTimeout: String(item.inter_digit_timeout_ms),
          maxFailures: String(item.max_failures),
          maxTimeouts: String(item.max_timeouts),
          digitLength: String(item.digit_length),
          enabled: item.enabled ? 'Yes' : 'No',
          directExtension: item.direct_extension ? 'Enable' : 'Disable',
          fxoFlashTransfer: item.fxo_flash_transfer ? 'Enable' : 'Disable',
          invalidSound: item.invalid_sound || 'Default',
          exitSound: item.exit_sound || 'Default',
          ringBack: item.ring_back || 'default',
          callerIdNamePrefix: item.callerid_prefix || '',
          memberTrunks: Array.isArray(item.direct_outbound_trunks) ? item.direct_outbound_trunks.map(String) : [],
        }));
        setRows(normalized);
        handleCloseModal();
      } catch (err) {
        showAlert(err?.message || 'Failed to save IVR.');
      } finally {
        setLoading((prev) => ({ ...prev, save: false }));
      }
    })();
  };

  const handleKeyDestinationChange = (key, value) => {
    setKeyDestinations((prev) => ({ ...prev, [key]: value }));
  };

  const handleKeyDestinationValueChange = (key, value) => {
    setKeyDestinationValues((prev) => ({ ...prev, [key]: value }));
  };

  const actionTypeOptions = [
    'CallQueue',
    'Callbacks',
    'ConferenceRooms',
    'DISA',
    'Extensions',
    'FaxToMail',
    'IVR',
    'RingGroups',
    'Voicemails',
    'Custom',
    'FlashCustom',
    'Other',
  ];

  const formatActionLabel = (type) => {
    if (!type) return '';
    switch (type) {
      case 'CallQueue':
        return 'Call Queue';
      case 'Callbacks':
        return 'CallBacks';
      case 'ConferenceRooms':
        return 'Conference Rooms';
      case 'FaxToMail':
        return 'Fax To Mail';
      case 'RingGroups':
        return 'Ring Groups';
      case 'FlashCustom':
        return 'Flash Custom';
      default:
        return type;
    }
  };

  const getDestinationListForType = (type) => {
    if (!type) return [];

    // For Extensions/Voicemails/FaxToMail use PJSIP list directly
    if (type === 'Extensions' || type === 'Voicemails' || type === 'FaxToMail') {
      return extensionOptions || [];
    }

    if (!destinationMap) return [];
    const list = destinationMap[type];
    return Array.isArray(list) ? list : [];
  };

  const renderDestinationSelect = (type, value, onChange) => {
    if (!type) {
      return (
        <input
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
          value=""
          disabled
          readOnly
        />
      );
    }

    if (type === 'Custom' || type === 'FlashCustom') {
      return (
        <input
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }

    if (type === 'Other') {
      const options = ['Hangup', 'Hold Music'];
      return (
        <FormControl size="small" fullWidth>
          <Select
            value={value || ''}
            displayEmpty
            onChange={(e) => onChange(e.target.value)}
            renderValue={(v) => (v ? v : 'Select option')}
          >
            <MenuItem value="">
              <em>Select option</em>
            </MenuItem>
            {options.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    const list = getDestinationListForType(type);

    return (
      <FormControl size="small" fullWidth>
        <Select
          value={value || ''}
          displayEmpty
          onChange={(e) => onChange(e.target.value)}
          renderValue={(v) => (v ? v : 'Select destination')}
        >
          <MenuItem value="">
            <em>Select destination</em>
          </MenuItem>
          {(!list || list.length === 0) && (
            <MenuItem value="" disabled>
              No options available
            </MenuItem>
          )}
          {list &&
            list.map((item, idx) => {
              let optionValue = '';
              let label = '';

              if (type === 'Extensions' || type === 'Voicemails' || type === 'FaxToMail') {
                optionValue = String(item.extension ?? '');
                label = `${item.extension ?? ''}${item.display_name ? ` - ${item.display_name}` : ''}`;
              } else if (type === 'IVR') {
                optionValue = String(item.id ?? '');
                label = `${item.ivr_number ?? ''}${item.name ? ` - ${item.name}` : ''}`;
              } else {
                optionValue = String(item.id ?? item.extension ?? '');
                label = item.display_name || item.name || optionValue;
              }

              if (!optionValue) {
                optionValue = `idx-${idx}`;
              }

              return (
                <MenuItem key={optionValue} value={optionValue}>
                  {label}
                </MenuItem>
              );
            })}
        </Select>
      </FormControl>
    );
  };

  return (
    <div className="w-full max-w-full mx-auto p-2">
      <div className="w-full max-w-full mx-auto">
        <div
          className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{ background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)' }}
        >
          IVR
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
            <thead>
              <tr>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center"></th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center">#</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Name</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">IVR Number</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Enabled</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Direct Outbound</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Member Trunks</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                    No IVR routes yet. Click &quot;Add New&quot; to create one.
                  </td>
                </tr>
              ) : (
                pagedRows.map((row, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  return (
                    <tr key={row.id}>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(realIdx)}
                          onChange={() => handleSelectRow(realIdx)}
                          disabled={loading.delete}
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{realIdx + 1}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center font-medium">{row.name}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.ivrNumber}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.enabled}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.directOutbound ? 'Yes' : 'No'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {row.memberTrunks?.map(getTrunkLabel).join(', ')}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <EditDocumentIcon
                          className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100"
                          titleAccess="Edit"
                          onClick={() => handleOpenEditModal(row)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap justify-between items-center bg-[#e3e7ef] rounded-b-lg border border-t-0 border-gray-300 px-2 py-2 gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                loading.delete ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleCheckAll}
              disabled={loading.delete}
            >
              Check All
            </button>
            <button
              className={`bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                loading.delete ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleUncheckAll}
              disabled={loading.delete}
            >
              Uncheck All
            </button>
            <button
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${
                loading.delete ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleDelete}
              disabled={loading.delete}
            >
              {loading.delete && <CircularProgress size={12} />}
              Delete
            </button>
          </div>
          <div className="flex gap-2">
            <button
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                loading.save ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleOpenAddModal}
              disabled={loading.save}
            >
              Add New
            </button>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
            <span>{rows.length} items Total</span>
            <span>{itemsPerPage} Items/Page</span>
            <span>
              {page}/{totalPages}
            </span>
            <button
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              First
            </button>
            <button
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
            <button
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              Last
            </button>
            <select
              className="text-xs rounded border border-gray-300 px-1 py-0.5 min-w-[40px]"
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span>{totalPages} Pages Total</span>
          </div>
        )}
      </div>

      {/* Add / Edit IVR Modal */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: { width: 880, maxWidth: '96vw', mx: 'auto', p: 0 },
        }}
      >
        <DialogTitle
          className="text-white text-center font-semibold p-2 text-base"
          style={{
            background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
            borderBottom: '1px solid #444444',
          }}
        >
          {editId != null ? 'Edit IVR' : 'Add IVR'}
        </DialogTitle>
        <DialogContent
          className="pt-0 pb-0 px-0"
          style={{
            backgroundColor: '#dde0e4',
            border: '1px solid #444444',
            borderTop: 'none',
          }}
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-300 bg-white px-4 pt-3">
            <button
              className={`px-4 pb-2 text-sm font-semibold border-b-2 ${
                activeTab === 'basic' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-600'
              }`}
              onClick={() => setActiveTab('basic')}
            >
              BASIC
            </button>
            <button
              className={`px-4 pb-2 text-sm font-semibold border-b-2 ${
                activeTab === 'keypress' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-600'
              }`}
              onClick={() => setActiveTab('keypress')}
            >
              KEY PRESS EVENT
            </button>
          </div>

          {activeTab === 'basic' ? (
            <div className="pt-3 pb-2 px-3">
              <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                  Basic
                </div>
                <div className="px-3 py-3 flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {/* Left column */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 150, marginRight: 8 }}>
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 150, marginRight: 8 }}>
                          IVR Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={ivrNumber}
                          onChange={(e) => setIvrNumber(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 150, marginRight: 8 }}>
                          Greet Long
                        </label>
                        <div className="flex-1 flex items-center gap-2">
                          <FormControl size="small" fullWidth>
                            <Select value={greetLong} onChange={(e) => setGreetLong(e.target.value)}>
                              {GREET_LONG_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <button type="button" className="text-xs text-blue-600 underline cursor-pointer">
                            Prompt
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 150, marginRight: 8 }}>
                          Greet Short
                        </label>
                        <div className="flex-1 flex items-center gap-2">
                          <FormControl size="small" fullWidth>
                            <Select value={greetShort} onChange={(e) => setGreetShort(e.target.value)}>
                              {GREET_SHORT_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <button type="button" className="text-xs text-blue-600 underline cursor-pointer">
                            Prompt
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 150, marginRight: 8 }}>
                          Response Timeout (ms) <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={responseTimeout}
                          onChange={(e) => setResponseTimeout(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 150, marginRight: 8 }}>
                          Password
                        </label>
                        <input
                          type="password"
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 150, marginRight: 8 }}>
                          Check Voicemail <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <FormControl size="small" fullWidth>
                            <Select value={checkVoicemail} onChange={(e) => setCheckVoicemail(e.target.value)}>
                              {CHECK_VOICEMAIL_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 150, marginRight: 8 }}>
                          Direct Outbound
                        </label>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={directOutbound}
                          onChange={(e) => setDirectOutbound(e.target.checked)}
                        />
                      </div>

                      {/* Member Trunks directly under Direct Outbound when enabled */}
                      {directOutbound && (
                        <div className="flex flex-col gap-2 mt-1">
                          <label className="text-[14px] text-gray-700 font-medium">Member Trunks</label>
                          <div className="grid grid-cols-[1fr_48px_1fr_48px] gap-3 items-start">
                            <div>
                              <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Available</div>
                              <select
                                multiple
                                value={availableSelected}
                                onChange={(e) => setAvailableSelected(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                                className="w-full h-32 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                              >
                                {loading.trunks ? (
                                  <option>Loading trunks...</option>
                                ) : availableList.length === 0 ? (
                                  <option disabled>No trunks</option>
                                ) : (
                                  availableList.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.label}
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>

                            <div className="flex flex-col gap-1 pt-7">
                              <button
                                type="button"
                                className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                                onClick={addSelectedTrunks}
                              >
                                &gt;
                              </button>
                              <button
                                type="button"
                                className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                                onClick={addAllTrunks}
                              >
                                &gt;&gt;
                              </button>
                              <button
                                type="button"
                                className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                                onClick={removeSelectedTrunks}
                              >
                                &lt;
                              </button>
                              <button
                                type="button"
                                className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                                onClick={removeAllTrunks}
                              >
                                &lt;&lt;
                              </button>
                            </div>

                            <div>
                              <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Selected</div>
                              <select
                                multiple
                                value={chosenSelected}
                                onChange={(e) => setChosenSelected(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                                className="w-full h-32 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                              >
                                {selectedTrunks.length === 0 ? (
                                  <option disabled>No selected trunks</option>
                                ) : (
                                  selectedTrunks.map((id) => (
                                    <option key={id} value={id}>
                                      {getTrunkLabel(id)}
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>

                            <div className="flex flex-col gap-1 pt-7">
                              <button
                                type="button"
                                className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                                onClick={removeSelectedTrunks}
                              >
                                &lt;
                              </button>
                              <button
                                type="button"
                                className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                                onClick={addSelectedTrunks}
                              >
                                &gt;
                              </button>
                              <button
                                type="button"
                                className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                                onClick={removeAllTrunks}
                              >
                                v
                              </button>
                              <button
                                type="button"
                                className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                                onClick={addAllTrunks}
                              >
                                ^
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>
                          Inter-Digit Timeout (ms) <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={interDigitTimeout}
                          onChange={(e) => setInterDigitTimeout(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>
                          Max Failures <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={maxFailures}
                          onChange={(e) => setMaxFailures(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>
                          Max Timeouts <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={maxTimeouts}
                          onChange={(e) => setMaxTimeouts(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>
                          Digit Length <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={digitLength}
                          onChange={(e) => setDigitLength(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>
                          Enabled <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <FormControl size="small" fullWidth>
                            <Select value={enabled} onChange={(e) => setEnabled(e.target.value)}>
                              {ENABLE_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>
                          Direct Extension <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <FormControl size="small" fullWidth>
                            <Select value={directExtension} onChange={(e) => setDirectExtension(e.target.value)}>
                              {DIRECT_EXTENSION_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>
                          FXO Flash Transfer <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <FormControl size="small" fullWidth>
                            <Select value={fxoFlashTransfer} onChange={(e) => setFxoFlashTransfer(e.target.value)}>
                              {FXO_FLASH_TRANSFER_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced section */}
                  <div className="mt-2 border-t pt-2">
                    <div className="text-[13px] font-semibold text-gray-700 mb-3">Advanced</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 150, marginRight: 8 }}>
                          Invalid Sound
                        </label>
                        <div className="flex-1">
                          <FormControl size="small" fullWidth>
                            <Select value={invalidSound} onChange={(e) => setInvalidSound(e.target.value)}>
                              {SOUND_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>
                          Ring Back
                        </label>
                        <div className="flex-1">
                          <FormControl size="small" fullWidth>
                            <Select value={ringBack} onChange={(e) => setRingBack(e.target.value)}>
                              {RINGBACK_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 150, marginRight: 8 }}>
                          Exit Sound
                        </label>
                        <div className="flex-1">
                          <FormControl size="small" fullWidth>
                            <Select value={exitSound} onChange={(e) => setExitSound(e.target.value)}>
                              {SOUND_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:col-span-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 150, marginRight: 8 }}>
                          Exit Action
                        </label>
                        <div className="flex-1 flex flex-col md:flex-row gap-2">
                          <FormControl size="small" sx={{ minWidth: 140, width: '100%', maxWidth: 220 }}>
                            <Select
                              value={exitActionType || ''}
                              displayEmpty
                              onChange={(e) => {
                                setExitActionType(e.target.value);
                                setExitActionValue('');
                              }}
                              renderValue={(value) => (value ? formatActionLabel(value) : 'Select action')}
                            >
                              <MenuItem value="">
                                <em>Select action</em>
                              </MenuItem>
                              {actionTypeOptions.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {formatActionLabel(opt)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <div className="w-full md:flex-1">
                            {renderDestinationSelect(exitActionType, exitActionValue, setExitActionValue)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>
                          Caller ID Name Prefix
                        </label>
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={callerIdNamePrefix}
                          onChange={(e) => setCallerIdNamePrefix(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div className="pt-3 pb-4 px-4 bg-white">
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                  Key Press Event
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
                    <div className="text-[13px] font-semibold text-gray-700 mb-1 md:col-span-2 flex">
                      <span className="w-40">Option</span>
                      <span className="flex-1">Destination</span>
                      <span className="flex-1">Target</span>
                    </div>
                    {KEYS.map((key) => (
                      <React.Fragment key={key}>
                        <div className="flex items-center text-[14px] text-gray-700">
                          <span className="w-40">Option Digit {key}:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FormControl size="small" className="flex-1">
                            <Select
                              value={keyDestinations[key] || ''}
                              displayEmpty
                              onChange={(e) => {
                                const value = e.target.value;
                                handleKeyDestinationChange(key, value);
                                handleKeyDestinationValueChange(key, '');
                              }}
                              renderValue={(value) => (value ? formatActionLabel(value) : 'Select destination')}
                            >
                              <MenuItem value="">
                                <em>Select destination</em>
                              </MenuItem>
                              {actionTypeOptions.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {formatActionLabel(opt)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <div className="flex-1">
                            {renderDestinationSelect(keyDestinations[key], keyDestinationValues[key], (val) =>
                              handleKeyDestinationValueChange(key, val)
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
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
    </div>
  );
};

export default IVRPage;

