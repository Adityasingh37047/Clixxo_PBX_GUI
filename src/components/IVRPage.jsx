import React, { useEffect, useMemo, useRef, useState } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
} from '@mui/material';
import {
  listIvrDestinations,
  listIvrs,
  listIvrDirectOutboundOptions,
  createIvr,
  updateIvr,
  deleteIvr,
  fetchSipAccounts,
  getIvr,
  setIvrKeys,
} from '../api/apiService';

const ENABLE_OPTIONS = ['Yes', 'No'];
const CHECK_VOICEMAIL_OPTIONS = ['Disable', 'Enable'];
const DIRECT_EXTENSION_OPTIONS = ['Disable', 'Enable'];
const FXO_FLASH_TRANSFER_OPTIONS = ['Disable', 'Enable'];
const GREET_LONG_OPTIONS = ['Default', 'Blank', 'Busy', 'Welcome'];
const GREET_SHORT_OPTIONS = ['Null', 'Blank', 'Busy', 'Welcome'];
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

const normalizeGreetShortUi = (v) => {
  if (v == null) return 'Null';
  if (v === '') return 'Blank';
  const s = String(v).trim().toLowerCase();
  if (s === 'null') return 'Null';
  const map = { blank: 'Blank', busy: 'Busy', welcome: 'Welcome' };
  if (map[s]) return map[s];
  const cap = s.charAt(0).toUpperCase() + s.slice(1);
  return GREET_SHORT_OPTIONS.includes(cap) ? cap : 'Blank';
};

/** Compact modal fields — slightly smaller than 14px to match reference layout */
const COMPACT_FIELD_CLASS =
  'border border-gray-300 rounded px-1.5 py-0.5 text-[13px] leading-snug outline-none w-full max-w-[220px]';
const COMPACT_SELECT_SX = {
  maxWidth: 220,
  width: '100%',
  '& .MuiOutlinedInput-root': { fontSize: '0.8125rem', minHeight: 30 },
  '& .MuiSelect-select': { py: '0.2rem !important', lineHeight: 1.25 },
};
const SELECT_MENU_PROPS = { PaperProps: { sx: { maxHeight: 240, fontSize: '0.8125rem' } } };
const IVR_LABEL_CLASS = 'text-[13px] text-gray-700 font-medium whitespace-nowrap text-left';

const normalizeArrayFromApi = (res) => {
  // Accept many backend shapes: [] | {message: []} | {data: []} | {message: {routes: []}} etc.
  const root = res?.data ?? res;
  const candidates = [
    root,
    root?.message,
    root?.data,
    root?.message?.message,
    root?.message?.data,
    root?.data?.message,
    root?.data?.data,
  ];

  // Special-case your current backend response:
  // { response: true, message: { trunks: {id, display_name}, ... } }
  // where `trunks` may be an object or an array.
  if (root?.message?.trunks) {
    const t = root.message.trunks;
    if (Array.isArray(t)) return t;
    if (t && typeof t === 'object') return [t];
  }

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
    if (c && typeof c === 'object') {
      for (const key of ['routes', 'route_list', 'outbound_routes', 'outboundRoutes', 'options', 'list', 'items', 'result']) {
        if (Array.isArray(c[key])) return c[key];
      }
    }
  }
  return [];
};

const IVRPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'keypress'
  const [loading, setLoading] = useState({ save: false, delete: false, outboundRoutes: false, list: false });
  const hasLoadedOutboundRoutesRef = useRef(false);

  // Basic tab state
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [ivrNumber, setIvrNumber] = useState('');
  const [greetLong, setGreetLong] = useState('Default');
  const [greetShort, setGreetShort] = useState('Blank');
  const [responseTimeout, setResponseTimeout] = useState('10000');
  const [password, setPassword] = useState('0000');
  const [showPassword, setShowPassword] = useState(false);
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

  // Outbound routes (when Direct Outbound is checked) — IDs from Outbound page API, same pattern as DISA
  const [allOutboundRoutes, setAllOutboundRoutes] = useState([]);
  const [selectedOutboundRouteIds, setSelectedOutboundRouteIds] = useState([]);
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
          greetShort: normalizeGreetShortUi(item.greet_short),
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
          memberOutboundIds: Array.isArray(item.direct_outbound_routes)
            ? item.direct_outbound_routes.map((x) => Number(x)).filter((n) => Number.isFinite(n))
            : Array.isArray(item.outbound_routes)
            ? item.outbound_routes.map((x) => Number(x)).filter((n) => Number.isFinite(n))
            : [],
        }));
        setRows(normalized);

        // Direct Outbound route list (for table + shuttle)
        try {
          const obRes = await listIvrDirectOutboundOptions();
          const obList = normalizeArrayFromApi(obRes);
          const routes = obList
            .map((r) => {
              const id = Number(
                r?.id ??
                  r?.route_id ??
                  r?.routeId ??
                  r?.route_id_int ??
                  r?.routeIdInt ??
                  r?.value ??
                  r?.trunk_id ??
                  r?.trunkId
              );
              const nameRaw = String(
                r?.name ??
                  r?.route_name ??
                  r?.routeName ??
                  r?.label ??
                  r?.display_name ??
                  r?.displayName ??
                  r?.text ??
                  r?.value ??
                  ''
              );
              return { id, name: nameRaw };
            })
            .filter((r) => Number.isFinite(r.id))
            .map((r) => ({ ...r, name: r.name || String(r.id) }));

          setAllOutboundRoutes(routes);
          hasLoadedOutboundRoutesRef.current = routes.length > 0;
        } catch {
          setAllOutboundRoutes([]);
        }

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

  const loadOutboundRoutes = async () => {
    setLoading((prev) => ({ ...prev, outboundRoutes: true }));
    try {
      const res = await listIvrDirectOutboundOptions();
      const list = normalizeArrayFromApi(res);
      const routes = list
        .map((r) => {
          const id = Number(
            r?.id ??
              r?.route_id ??
              r?.routeId ??
              r?.value ??
              r?.trunk_id ??
              r?.trunkId
          );
          const nameRaw = String(
            r?.name ??
              r?.route_name ??
              r?.routeName ??
              r?.label ??
              r?.display_name ??
              r?.displayName ??
              r?.value ??
              ''
          );
          return { id, name: nameRaw };
        })
        .filter((r) => Number.isFinite(r.id))
        .map((r) => ({ ...r, name: r.name || String(r.id) }));

      setAllOutboundRoutes(routes);
      hasLoadedOutboundRoutesRef.current = routes.length > 0;
    } catch (err) {
      showAlert(err?.message || 'Failed to load outbound routes.');
      setAllOutboundRoutes([]);
    } finally {
      setLoading((prev) => ({ ...prev, outboundRoutes: false }));
    }
  };

  // If user checks Direct Outbound and list is empty, refetch options.
  useEffect(() => {
    if (!showModal) return;
    if (!directOutbound) return;
    if (loading.outboundRoutes) return;
    if (allOutboundRoutes.length > 0) return;
    loadOutboundRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, directOutbound]);

  const resetForm = () => {
    setEditId(null);
    setName('');
    setIvrNumber('');
    setGreetLong('Default');
    setGreetShort('Blank');
    setResponseTimeout('10000');
    setPassword('0000');
    setShowPassword(false);
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
    setSelectedOutboundRouteIds([]);
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
    if (!hasLoadedOutboundRoutesRef.current) {
      await loadOutboundRoutes();
    }
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setShowModal(true);
    setShowPassword(false);
    setActiveTab('basic');
    setAvailableSelected([]);
    setChosenSelected([]);

    if (!hasLoadedOutboundRoutesRef.current) {
      await loadOutboundRoutes();
    }

    try {
      const res = await getIvr(row.id);
      const raw = res?.message ?? res?.data ?? res;
      const item = Array.isArray(raw) ? raw[0] : raw;

      setName(item?.name || '');
      setIvrNumber(item?.ivr_number != null ? String(item.ivr_number) : '');
      setGreetLong(item?.greet_long || 'Default');
      setGreetShort(normalizeGreetShortUi(item?.greet_short));
      setResponseTimeout(item?.response_timeout_ms != null ? String(item.response_timeout_ms) : '10000');

      setPassword(item?.password != null ? String(item.password) : '0000');
      setCheckVoicemail(item?.check_voicemail ? 'Enable' : 'Disable');
      setDirectOutbound(!!item?.direct_outbound);

      setInterDigitTimeout(item?.inter_digit_timeout_ms != null ? String(item.inter_digit_timeout_ms) : '3000');
      setMaxFailures(item?.max_failures != null ? String(item.max_failures) : '3');
      setMaxTimeouts(item?.max_timeouts != null ? String(item.max_timeouts) : '3');
      setDigitLength(item?.digit_length != null ? String(item.digit_length) : '4');
      setEnabled(item?.enabled ? 'Yes' : 'No');

      setDirectExtension(item?.direct_extension ? 'Enable' : 'Disable');
      setFxoFlashTransfer(item?.fxo_flash_transfer ? 'Enable' : 'Disable');
      setInvalidSound(item?.invalid_sound || 'Default');
      setExitSound(item?.exit_sound || 'Default');
      setExitActionType(item?.exit_action_type || '');
      setExitActionValue(item?.exit_action_value || '');
      setRingBack(item?.ring_back || 'default');
      setCallerIdNamePrefix(item?.callerid_prefix || '');

      setSelectedOutboundRouteIds(
        Array.isArray(item?.direct_outbound_routes)
          ? item.direct_outbound_routes.map((x) => Number(x)).filter((n) => Number.isFinite(n))
          : []
      );

      // Key press actions
      const keyActions = Array.isArray(item?.key_actions)
        ? item.key_actions
        : Array.isArray(item?.keyActions)
          ? item.keyActions
          : [];

      const destObj = {};
      const valObj = {};
      KEYS.forEach((k) => {
        destObj[k] = '';
        valObj[k] = '';
      });

      keyActions.forEach((a) => {
        const digit = String(a?.digit ?? '');
        if (destObj[digit] == null) return;
        destObj[digit] = a?.dest_type || '';
        valObj[digit] = a?.dest_value != null ? String(a.dest_value) : '';
      });

      setKeyDestinations(destObj);
      setKeyDestinationValues(valObj);
    } catch {
      // Fallback to row-based data (keys may be missing)
      setName(row.name || '');
      setIvrNumber(row.ivrNumber || '');
      setGreetLong(row.greetLong || 'Default');
      setGreetShort(normalizeGreetShortUi(row.greetShort));
      setResponseTimeout(row.responseTimeout || '10000');
      setPassword(row.password || '0000');
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
      setSelectedOutboundRouteIds(Array.isArray(row.memberOutboundIds) ? [...row.memberOutboundIds] : []);
    }
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const routeNameById = useMemo(() => {
    const map = new Map();
    allOutboundRoutes.forEach((r) => map.set(r.id, r.name));
    return map;
  }, [allOutboundRoutes]);

  const getOutboundRouteLabel = (id) => routeNameById.get(id) || `ID:${id}`;

  const availableOutboundList = useMemo(
    () => allOutboundRoutes.filter((r) => !selectedOutboundRouteIds.includes(r.id)),
    [allOutboundRoutes, selectedOutboundRouteIds]
  );

  const chosenOutboundIds = selectedOutboundRouteIds;

  const addSelectedOutboundRoutes = () => {
    if (availableSelected.length === 0) return;
    setSelectedOutboundRouteIds((prev) => [...prev, ...availableSelected.filter((id) => !prev.includes(id))]);
    setAvailableSelected([]);
  };

  const addAllOutboundRoutes = () => {
    setSelectedOutboundRouteIds(allOutboundRoutes.map((r) => r.id));
    setAvailableSelected([]);
  };

  const removeSelectedOutboundRoutes = () => {
    if (chosenSelected.length === 0) return;
    setSelectedOutboundRouteIds((prev) => prev.filter((id) => !chosenSelected.includes(id)));
    setChosenSelected([]);
  };

  const removeAllOutboundRoutes = () => {
    setSelectedOutboundRouteIds([]);
    setChosenSelected([]);
  };

  const moveOutboundUp = () => {
    if (!chosenSelected.length) return;
    const ids = [...chosenOutboundIds];
    chosenSelected.forEach((routeId) => {
      const idx = ids.indexOf(routeId);
      if (idx > 0) [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    });
    setSelectedOutboundRouteIds(ids);
  };

  const moveOutboundDown = () => {
    if (!chosenSelected.length) return;
    const ids = [...chosenOutboundIds];
    [...chosenSelected].reverse().forEach((routeId) => {
      const idx = ids.indexOf(routeId);
      if (idx < ids.length - 1) [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    });
    setSelectedOutboundRouteIds(ids);
  };

  const moveOutboundTop = () => {
    if (!chosenSelected.length) return;
    const sel = chosenOutboundIds.filter((id) => chosenSelected.includes(id));
    const rest = chosenOutboundIds.filter((id) => !chosenSelected.includes(id));
    setSelectedOutboundRouteIds([...sel, ...rest]);
  };

  const moveOutboundBottom = () => {
    if (!chosenSelected.length) return;
    const sel = chosenOutboundIds.filter((id) => chosenSelected.includes(id));
    const rest = chosenOutboundIds.filter((id) => !chosenSelected.includes(id));
    setSelectedOutboundRouteIds([...rest, ...sel]);
  };

  const shuttleArrowClass =
    'h-8 w-full border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

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
          greetShort: normalizeGreetShortUi(item.greet_short),
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
          memberOutboundIds: Array.isArray(item.direct_outbound_routes)
            ? item.direct_outbound_routes.map((x) => Number(x)).filter((n) => Number.isFinite(n))
            : Array.isArray(item.outbound_routes)
            ? item.outbound_routes.map((x) => Number(x)).filter((n) => Number.isFinite(n))
            : [],
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

    if (!password.trim()) {
      showAlert('Password is required.');
      return;
    }

    if (directOutbound && selectedOutboundRouteIds.length === 0) {
      showAlert('Please select at least one outbound route when Direct Outbound is enabled.');
      return;
    }

    // Build key press actions payload (digit -> dest_type/dest_value)
    const keyActions = [];
    let keyActionError = '';
    KEYS.forEach((digit) => {
      const destType = keyDestinations[digit] || '';
      if (!destType) return;

      const destValueRaw = keyDestinationValues[digit] || '';
      const destValue = String(destValueRaw).trim();

      const valueOptional = destType === 'DialByName' || destType === 'Other';
      if (!valueOptional && !destValue) {
        keyActionError = `Select destination for key digit "${digit}".`;
        return;
      }

      const action = { digit, dest_type: destType };
      if (destValue) action.dest_value = destValue;
      keyActions.push(action);
    });

    if (keyActionError) {
      showAlert(keyActionError);
      return;
    }

    const payloadForApi = {
      name: trimmedName,
      ivr_number: ivrNumInt,
      greet_long: greetLong.toLowerCase(),
      greet_short: greetShort === 'Null' ? null : greetShort.toLowerCase(),
      response_timeout_ms: respTimeoutInt,
      password: password.trim(),
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
      callerid_prefix: callerIdNamePrefix ? callerIdNamePrefix : null,
      exit_action_type: exitActionType || null,
      exit_action_value: exitActionType ? exitActionValue || null : null,
      direct_outbound_trunk: null,
      direct_outbound_routes: directOutbound ? selectedOutboundRouteIds : [],
    };

    setLoading((prev) => ({ ...prev, save: true }));
    (async () => {
      try {
        if (editId != null) {
          await updateIvr(editId, payloadForApi);
          // Replace ALL key actions after IVR update
          await setIvrKeys(editId, keyActions);
        } else {
          // Backend supports optional key_actions on create
          await createIvr({ ...payloadForApi, key_actions: keyActions });
        }

        const ivrRes = await listIvrs();
        const ivrList = Array.isArray(ivrRes?.message) ? ivrRes.message : Array.isArray(ivrRes?.data) ? ivrRes.data : [];
        const normalized = ivrList.map((item) => ({
          id: item.id,
          name: item.name,
          ivrNumber: item.ivr_number,
          greetLong: item.greet_long,
          greetShort: normalizeGreetShortUi(item.greet_short),
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
          memberOutboundIds: Array.isArray(item.direct_outbound_routes)
            ? item.direct_outbound_routes.map((x) => Number(x)).filter((n) => Number.isFinite(n))
            : Array.isArray(item.outbound_routes)
            ? item.outbound_routes.map((x) => Number(x)).filter((n) => Number.isFinite(n))
            : [],
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

  // KEY PRESS EVENT uses backend dest_type "DialByName" instead of "FlashCustom"
  const keyActionTypeOptions = [
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
    'DialByName',
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
      case 'DialByName':
        return 'Dial By Name';
      default:
        return type;
    }
  };

  const getDestinationListForType = (type) => {
    if (!type) return [];

    if (!destinationMap) return [];
    const list = destinationMap[type];
    if (Array.isArray(list)) return list;

    // Fallback: if backend doesn't return this list, use SIP extensions list
    if (type === 'Extensions' || type === 'Voicemails' || type === 'FaxToMail') return extensionOptions || [];
    return [];
  };

  const renderDestinationSelect = (type, value, onChange) => {
    if (!type) {
      return <input className={`${COMPACT_FIELD_CLASS} bg-gray-50`} value="" disabled readOnly />;
    }

    if (type === 'Custom' || type === 'FlashCustom' || type === 'DialByName') {
      return <input className={COMPACT_FIELD_CLASS} value={value} onChange={(e) => onChange(e.target.value)} />;
    }

    if (type === 'Other') {
      const options = ['Hangup', 'Hold Music'];
      return (
        <FormControl size="small" sx={COMPACT_SELECT_SX}>
          <Select
            value={value || ''}
            displayEmpty
            onChange={(e) => onChange(e.target.value)}
            renderValue={(v) => (v ? v : 'Select option')}
            MenuProps={SELECT_MENU_PROPS}
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
      <FormControl size="small" sx={COMPACT_SELECT_SX}>
        <Select
          value={value || ''}
          displayEmpty
          onChange={(e) => onChange(e.target.value)}
          renderValue={(v) => (v ? v : 'Select destination')}
          MenuProps={SELECT_MENU_PROPS}
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
                optionValue = String(item.extension ?? item.id ?? '');
                const extLabel = item.display_name || item.name || optionValue;
                label = `${optionValue}${extLabel ? ` - ${extLabel}` : ''}`;
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
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Outbound Routes</th>
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
                        {(row.memberOutboundIds || []).map(getOutboundRouteLabel).join(', ')}
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
          sx: { width: 1040, maxWidth: '98vw', mx: 'auto', p: 0 },
        }}
      >
        <DialogTitle
          className="text-white text-center font-semibold py-2 px-3 text-sm"
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
          <div className="flex border-b border-gray-300 bg-white px-3 pt-2">
            <button
              className={`px-3 pb-1.5 text-xs font-semibold border-b-2 ${
                activeTab === 'basic' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-600'
              }`}
              onClick={() => setActiveTab('basic')}
            >
              BASIC
            </button>
            <button
              className={`px-3 pb-1.5 text-xs font-semibold border-b-2 ${
                activeTab === 'keypress' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-600'
              }`}
              onClick={() => setActiveTab('keypress')}
            >
              KEY PRESS EVENT
            </button>
          </div>

          {activeTab === 'basic' ? (
            <div className="pt-0 pb-0 px-0" style={{ backgroundColor: '#dde0e4', borderTop: 'none' }}>
              <div className="pt-2 pb-3 px-3 bg-white">
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="px-3 py-1 border-b border-gray-300 text-[12px] font-semibold text-gray-700 bg-[#f5f7fa]">
                    Basic
                  </div>
                  <div className="px-3 py-2.5 flex flex-col gap-2.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1.5">
                      {/* Left column */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input className={COMPACT_FIELD_CLASS} value={name} onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            IVR Number <span className="text-red-500">*</span>
                          </label>
                          <input className={COMPACT_FIELD_CLASS} value={ivrNumber} onChange={(e) => setIvrNumber(e.target.value)} />
                        </div>

                        <div className="flex items-center gap-2 flex-nowrap" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Greet Long
                          </label>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="min-w-0 w-full max-w-[220px]">
                              <FormControl size="small" fullWidth sx={COMPACT_SELECT_SX}>
                                <Select value={greetLong} onChange={(e) => setGreetLong(e.target.value)} MenuProps={SELECT_MENU_PROPS}>
                                  {GREET_LONG_OPTIONS.map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                      {opt}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </div>
                            <button type="button" className="text-[11px] text-blue-600 underline cursor-pointer shrink-0 leading-none">
                              Prompt
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-nowrap" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Greet Short
                          </label>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="min-w-0 w-full max-w-[220px]">
                              <FormControl size="small" fullWidth sx={COMPACT_SELECT_SX}>
                                <Select value={greetShort} onChange={(e) => setGreetShort(e.target.value)} MenuProps={SELECT_MENU_PROPS}>
                                  {GREET_SHORT_OPTIONS.map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                      {opt}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </div>
                            <button type="button" className="text-[11px] text-blue-600 underline cursor-pointer shrink-0 leading-none">
                              Prompt
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Response Timeout (ms) <span className="text-red-500">*</span>
                          </label>
                          <input className={COMPACT_FIELD_CLASS} value={responseTimeout} onChange={(e) => setResponseTimeout(e.target.value)} />
                        </div>

                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center max-w-[220px] w-full border border-gray-300 rounded overflow-hidden bg-white">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className="flex-1 min-w-0 border-0 px-1.5 py-0.5 text-[13px] leading-snug outline-none"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              autoComplete="new-password"
                            />
                            <IconButton
                              type="button"
                              size="small"
                              tabIndex={-1}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              onClick={() => setShowPassword((v) => !v)}
                              edge="end"
                              sx={{ p: 0.35, borderRadius: 0, color: 'text.secondary' }}
                            >
                              {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                            </IconButton>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Check Voicemail <span className="text-red-500">*</span>
                          </label>
                          <div className="w-full max-w-[220px]">
                            <FormControl size="small" fullWidth sx={COMPACT_SELECT_SX}>
                              <Select value={checkVoicemail} onChange={(e) => setCheckVoicemail(e.target.value)} MenuProps={SELECT_MENU_PROPS}>
                                {CHECK_VOICEMAIL_OPTIONS.map((opt) => (
                                  <MenuItem key={opt} value={opt}>
                                    {opt}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Direct Outbound
                          </label>
                          <input type="checkbox" className="h-4 w-4" checked={directOutbound} onChange={(e) => setDirectOutbound(e.target.checked)} />
                        </div>
                      </div>

                      {/* Right column */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Inter-Digit Timeout (ms) <span className="text-red-500">*</span>
                          </label>
                          <input className={COMPACT_FIELD_CLASS} value={interDigitTimeout} onChange={(e) => setInterDigitTimeout(e.target.value)} />
                        </div>

                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Max Failures <span className="text-red-500">*</span>
                          </label>
                          <input className={COMPACT_FIELD_CLASS} value={maxFailures} onChange={(e) => setMaxFailures(e.target.value)} />
                        </div>

                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Max Timeouts <span className="text-red-500">*</span>
                          </label>
                          <input className={COMPACT_FIELD_CLASS} value={maxTimeouts} onChange={(e) => setMaxTimeouts(e.target.value)} />
                        </div>

                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Digit Length <span className="text-red-500">*</span>
                          </label>
                          <input className={COMPACT_FIELD_CLASS} value={digitLength} onChange={(e) => setDigitLength(e.target.value)} />
                        </div>

                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Enabled <span className="text-red-500">*</span>
                          </label>
                          <div className="w-full max-w-[220px]">
                            <FormControl size="small" fullWidth sx={COMPACT_SELECT_SX}>
                              <Select value={enabled} onChange={(e) => setEnabled(e.target.value)} MenuProps={SELECT_MENU_PROPS}>
                                {ENABLE_OPTIONS.map((opt) => (
                                  <MenuItem key={opt} value={opt}>
                                    {opt}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Direct Extension <span className="text-red-500">*</span>
                          </label>
                          <div className="w-full max-w-[220px]">
                            <FormControl size="small" fullWidth sx={COMPACT_SELECT_SX}>
                              <Select value={directExtension} onChange={(e) => setDirectExtension(e.target.value)} MenuProps={SELECT_MENU_PROPS}>
                                {DIRECT_EXTENSION_OPTIONS.map((opt) => (
                                  <MenuItem key={opt} value={opt}>
                                    {opt}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            FXO Flash Transfer <span className="text-red-500">*</span>
                          </label>
                          <div className="w-full max-w-[220px]">
                            <FormControl size="small" fullWidth sx={COMPACT_SELECT_SX}>
                              <Select value={fxoFlashTransfer} onChange={(e) => setFxoFlashTransfer(e.target.value)} MenuProps={SELECT_MENU_PROPS}>
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

                    {directOutbound && (
                      <div className="mt-2 border-t border-gray-200 pt-2">
                        <div className="text-[13px] text-gray-700 font-medium mb-1.5">
                          Outbound Routes <span className="text-red-500">*</span>
                        </div>
                        <div className="grid grid-cols-[1fr_44px_1fr_44px] gap-2 items-start w-full">
                          <div>
                            <div className="text-[12px] font-semibold text-[#325a84] text-center mb-1">Available</div>
                            <select
                              multiple
                              value={availableSelected.map(String)}
                              onChange={(e) =>
                                setAvailableSelected(
                                  Array.from(e.target.selectedOptions, (opt) => Number(opt.value)).filter((n) => Number.isFinite(n))
                                )
                              }
                              className="w-full h-24 border border-gray-300 bg-white rounded px-1.5 py-0.5 text-[13px] outline-none"
                            >
                              {loading.outboundRoutes ? (
                                <option disabled>Loading routes...</option>
                              ) : availableOutboundList.length === 0 ? (
                                <option disabled>No routes available</option>
                              ) : (
                                availableOutboundList.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          <div className="flex flex-col gap-0.5 pt-6">
                            <button type="button" className={shuttleArrowClass} onClick={addSelectedOutboundRoutes}>
                              &gt;
                            </button>
                            <button type="button" className={shuttleArrowClass} onClick={addAllOutboundRoutes}>
                              &gt;&gt;
                            </button>
                            <button type="button" className={shuttleArrowClass} onClick={removeSelectedOutboundRoutes}>
                              &lt;
                            </button>
                            <button type="button" className={shuttleArrowClass} onClick={removeAllOutboundRoutes}>
                              &lt;&lt;
                            </button>
                          </div>

                          <div>
                            <div className="text-[12px] font-semibold text-[#325a84] text-center mb-1">Selected</div>
                            <select
                              multiple
                              value={chosenSelected.map(String)}
                              onChange={(e) =>
                                setChosenSelected(
                                  Array.from(e.target.selectedOptions, (opt) => Number(opt.value)).filter((n) => Number.isFinite(n))
                                )
                              }
                              className="w-full h-24 border border-gray-300 bg-white rounded px-1.5 py-0.5 text-[13px] outline-none"
                            >
                              {chosenOutboundIds.length === 0 ? (
                                <option disabled>No selected routes</option>
                              ) : (
                                chosenOutboundIds.map((routeId) => (
                                  <option key={routeId} value={routeId}>
                                    {getOutboundRouteLabel(routeId)}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          <div className="flex flex-col gap-0.5 pt-6">
                            <button type="button" className={shuttleArrowClass} onClick={moveOutboundTop}>
                              &#8679;
                            </button>
                            <button type="button" className={shuttleArrowClass} onClick={moveOutboundUp}>
                              &#8593;
                            </button>
                            <button type="button" className={shuttleArrowClass} onClick={moveOutboundDown}>
                              &#8595;
                            </button>
                            <button type="button" className={shuttleArrowClass} onClick={moveOutboundBottom}>
                              &#8681;
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Advanced section */}
                    <div className="mt-2 border-t border-gray-200 pt-2">
                      <div className="text-[12px] font-semibold text-gray-700 mb-2">Advanced</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1.5">
                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Invalid Sound
                          </label>
                          <div className="w-full max-w-[220px]">
                            <FormControl size="small" fullWidth sx={COMPACT_SELECT_SX}>
                              <Select value={invalidSound} onChange={(e) => setInvalidSound(e.target.value)} MenuProps={SELECT_MENU_PROPS}>
                                {SOUND_OPTIONS.map((opt) => (
                                  <MenuItem key={opt} value={opt}>
                                    {opt}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Ring Back
                          </label>
                          <div className="w-full max-w-[220px]">
                            <FormControl size="small" fullWidth sx={COMPACT_SELECT_SX}>
                              <Select value={ringBack} onChange={(e) => setRingBack(e.target.value)} MenuProps={SELECT_MENU_PROPS}>
                                {RINGBACK_OPTIONS.map((opt) => (
                                  <MenuItem key={opt} value={opt}>
                                    {opt}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Exit Sound
                          </label>
                          <div className="w-full max-w-[220px]">
                            <FormControl size="small" fullWidth sx={COMPACT_SELECT_SX}>
                              <Select value={exitSound} onChange={(e) => setExitSound(e.target.value)} MenuProps={SELECT_MENU_PROPS}>
                                {SOUND_OPTIONS.map((opt) => (
                                  <MenuItem key={opt} value={opt}>
                                    {opt}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[170px_1fr] gap-2 items-start md:items-center md:col-span-2">
                          <label className={`${IVR_LABEL_CLASS} pt-1 md:pt-0`}>Exit Action</label>
                          <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center min-w-0">
                            <FormControl size="small" sx={{ ...COMPACT_SELECT_SX, maxWidth: 220, minWidth: 160 }}>
                              <Select
                                value={exitActionType || ''}
                                displayEmpty
                                onChange={(e) => {
                                  setExitActionType(e.target.value);
                                  setExitActionValue('');
                                }}
                                renderValue={(value) => (value ? formatActionLabel(value) : 'Select action')}
                                MenuProps={SELECT_MENU_PROPS}
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
                            <div className="min-w-0 shrink-0">{renderDestinationSelect(exitActionType, exitActionValue, setExitActionValue)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" style={{ minHeight: 26 }}>
                          <label className={IVR_LABEL_CLASS} style={{ width: 170, marginRight: 8 }}>
                            Caller ID Name Prefix
                          </label>
                          <input className={COMPACT_FIELD_CLASS} value={callerIdNamePrefix} onChange={(e) => setCallerIdNamePrefix(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-2 pb-3 px-3 bg-white">
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <div className="px-3 py-1 border-b border-gray-300 text-[12px] font-semibold text-gray-700 bg-[#f5f7fa]">
                  Key Press Event
                </div>
                <div className="p-3">
                  <div className="hidden md:flex text-[12px] font-semibold text-gray-700 mb-2 gap-2 border-b border-gray-200 pb-2">
                    <span className="w-[140px] shrink-0">Option</span>
                    <span className="w-[220px] shrink-0">Destination</span>
                    <span className="w-[220px] shrink-0">Target</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {KEYS.map((key) => (
                      <div key={key} className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1.5 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-[13px] text-gray-700 w-[140px] shrink-0">Option Digit {key}:</span>
                        <FormControl size="small" sx={{ ...COMPACT_SELECT_SX, maxWidth: 220, minWidth: 160 }}>
                          <Select
                            value={keyDestinations[key] || ''}
                            displayEmpty
                            onChange={(e) => {
                              const value = e.target.value;
                              handleKeyDestinationChange(key, value);
                              handleKeyDestinationValueChange(key, '');
                            }}
                            renderValue={(value) => (value ? formatActionLabel(value) : 'Select destination')}
                            MenuProps={SELECT_MENU_PROPS}
                          >
                            <MenuItem value="">
                              <em>Select destination</em>
                            </MenuItem>
                            {keyActionTypeOptions.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {formatActionLabel(opt)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <div className="min-w-0">{renderDestinationSelect(keyDestinations[key], keyDestinationValues[key], (val) => handleKeyDestinationValueChange(key, val))}</div>
                      </div>
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

