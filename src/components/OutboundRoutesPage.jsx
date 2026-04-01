import React, { useEffect, useMemo, useRef, useState } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Select } from '@mui/material';
import {
  createOutboundRoute,
  deleteOutboundRoute,
  fetchSipAccounts,
  listOutboundRoutes,
  listSipRegistrations,
  updateOutboundRoute,
} from '../api/apiService';

const ENABLE_OPTIONS = ['Yes', 'No'];
const PASSWORD_OPTIONS = ['None', 'Single Pin'];
const REMEMORY_HUNT_OPTIONS = ['No', 'Yes'];
const TIME_CONDITION_OPTIONS = ['WorkTime', 'Holiday', 'All'];

const DEFAULT_DIAL_PATTERN = { pattern: '', strip: '', front: '', suffix: '', delay: '' };
const DEFAULT_CALLER_CONVERSION = { strip: '', front: '', suffix: '' };

const OutboundRoutesPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({ list: false, save: false, delete: false, members: false, trunks: false });
  const hasLoadedMembersRef = useRef(false);
  const hasLoadedTrunksRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('');
  const [description, setDescription] = useState('');
  const [nextRoute, setNextRoute] = useState(false);
  const [enabled, setEnabled] = useState('Yes');
  const [passwordType, setPasswordType] = useState('None');
  const [singlePin, setSinglePin] = useState('');
  const [rememoryHunt, setRememoryHunt] = useState('No');
  const [timeConditions, setTimeConditions] = useState([]);
  const [dialPatterns, setDialPatterns] = useState([{ ...DEFAULT_DIAL_PATTERN }]);
  const [callerConversion, setCallerConversion] = useState({ ...DEFAULT_CALLER_CONVERSION });

  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);
  const [availableExtensionSelected, setAvailableExtensionSelected] = useState([]);
  const [chosenExtensionSelected, setChosenExtensionSelected] = useState([]);

  const [availableTrunks, setAvailableTrunks] = useState([]);
  const [memberTrunks, setMemberTrunks] = useState([]);
  const [availableTrunkSelected, setAvailableTrunkSelected] = useState([]);
  const [chosenTrunkSelected, setChosenTrunkSelected] = useState([]);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage((current) => Math.min(Math.max(1, current), Math.max(1, Math.ceil(rows.length / itemsPerPage))));
  }, [rows]);

  const showAlert = (text) => window.alert(text);

  const normalizeList = (raw) => {
    const list = raw?.message ?? raw?.data ?? raw;
    return Array.isArray(list) ? list : [];
  };

  const toUiYesNo = (value, defaultValue = 'No') => {
    if (typeof value === 'string') {
      const normalized = value.toLowerCase();
      if (normalized === 'yes') return 'Yes';
      if (normalized === 'no') return 'No';
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return defaultValue;
  };

  const toApiYesNo = (value, defaultValue = 'no') => {
    const normalized = String(value || '').toLowerCase();
    if (normalized === 'yes') return 'yes';
    if (normalized === 'no') return 'no';
    return defaultValue;
  };

  const mapPasswordTypeToUi = (apiValue) => (String(apiValue || '').toLowerCase() === 'single_pin' ? 'Single Pin' : 'None');
  const mapPasswordTypeToApi = (uiValue) => (uiValue === 'Single Pin' ? 'single_pin' : 'none');

  const mapRouteFromApi = (item) => {
    const timeCond = item?.time_condition || {};
    const callerConv = item?.caller_number_conversion || {};
    const dial = Array.isArray(item?.dial_patterns) ? item.dial_patterns : [];

    const uiTime = [];
    const all = !!timeCond?.all;
    if (timeCond?.work_time) uiTime.push('WorkTime');
    if (all) uiTime.push('All');
    if (all && timeCond?.holiday) uiTime.push('Holiday');

    const parsedNextRoute =
      typeof item?.next_route === 'string' ? item.next_route.toLowerCase() === 'yes' : !!item?.next_route;

    const parsedRmemory =
      typeof item?.rrmemory_hunt === 'string'
        ? item.rrmemory_hunt.toLowerCase() === 'yes'
        : !!(item?.rrmemory_hunt ?? item?.rrmemory_hunt);

    return {
      id: item?.id,
      name: String(item?.name || ''),
      priority: String(item?.priority ?? ''),
      description: String(item?.description || ''),
      nextRoute: parsedNextRoute,
      enabled: toUiYesNo(item?.enabled, 'Yes'),
      passwordType: mapPasswordTypeToUi(item?.password_type),
      singlePin: item?.password_pin != null ? String(item.password_pin) : '',
      rememoryHunt: parsedRmemory ? 'Yes' : 'No',
      timeConditions: uiTime,
      callerConversion: {
        strip: String(callerConv?.strip ?? 0),
        front: String(callerConv?.front ?? ''),
        suffix: String(callerConv?.suffix ?? ''),
      },
      memberExtensions: Array.isArray(item?.member_extensions) ? item.member_extensions.map(String) : [],
      memberTrunks: Array.isArray(item?.member_trunks) ? item.member_trunks.map(String) : [],
      dialPatterns:
        dial.length > 0
          ? dial.map((d) => ({
              pattern: String(d?.pattern ?? ''),
              strip: String(d?.strip ?? 0),
              front: String(d?.front ?? ''),
              suffix: String(d?.suffix ?? ''),
              delay: String(d?.delay_ms ?? 0),
            }))
          : [{ ...DEFAULT_DIAL_PATTERN, pattern: '^\\d*$' }],
    };
  };

  const fetchOutboundRoutes = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listOutboundRoutes();
      if (!res?.response) {
        showAlert(res?.message || 'Failed to load outbound routes.');
        setRows([]);
        return;
      }
      setRows(normalizeList(res).map(mapRouteFromApi));
    } catch (err) {
      showAlert(err?.message || 'Failed to load outbound routes.');
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
    }
  };

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, members: true }));
    try {
      const res = await fetchSipAccounts();
      const list = normalizeList(res)
        .map((item) => {
          const ext = item?.extension ?? item?.ext ?? item?.id ?? item;
          const display = item?.display_name ?? item?.name ?? '';
          return { id: String(ext ?? ''), label: display ? `${display}-${String(ext ?? '')}` : String(ext ?? '') };
        })
        .filter((item) => item.id);
      setAvailableExtensions(list);
      hasLoadedMembersRef.current = true;
    } catch (err) {
      showAlert(err?.message || 'Failed to load extension list.');
      setAvailableExtensions([]);
    } finally {
      setLoading((prev) => ({ ...prev, members: false }));
    }
  };

  const loadTrunks = async () => {
    setLoading((prev) => ({ ...prev, trunks: true }));
    try {
      const res = await listSipRegistrations();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      const trunks = list
        .map((t) => {
          const id = t?.trunkId || t?.trunk_id || t?.id || t;
          const name = t?.name || t?.trunk_name || '';
          const domain = t?.domain_id || t?.domain || t?.sip_server || t?.host || '';
          const label = name && domain ? `${name} : ${domain}` : name ? name : domain ? domain : String(id || '');
          return { id: String(id), label };
        })
        .filter((t) => t.id);
      setAvailableTrunks(trunks);
      hasLoadedTrunksRef.current = true;
    } catch (err) {
      showAlert(err?.message || 'Failed to load trunk list.');
      setAvailableTrunks([]);
    } finally {
      setLoading((prev) => ({ ...prev, trunks: false }));
    }
  };

  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((item) => map.set(item.id, item.label));
    return map;
  }, [availableExtensions]);

  const trunkLabelMap = useMemo(() => {
    const map = new Map();
    availableTrunks.forEach((item) => map.set(item.id, item.label));
    return map;
  }, [availableTrunks]);

  const getExtensionLabel = (id) => extensionLabelMap.get(id) || id;
  const getTrunkLabel = (id) => trunkLabelMap.get(id) || id;

  const extensionAvailableList = useMemo(
    () => availableExtensions.filter((item) => !memberExtensions.includes(item.id)),
    [availableExtensions, memberExtensions]
  );

  const trunkAvailableList = useMemo(
    () => availableTrunks.filter((item) => !memberTrunks.includes(item.id)),
    [availableTrunks, memberTrunks]
  );

  const resetForm = () => {
    setEditId(null);
    setName('');
    setPriority('');
    setDescription('');
    setNextRoute(false);
    setEnabled('Yes');
    setPasswordType('None');
    setSinglePin('');
    setRememoryHunt('No');
    setTimeConditions([]);
    setDialPatterns([{ ...DEFAULT_DIAL_PATTERN, pattern: '^\\d*$' }]);
    setCallerConversion({ ...DEFAULT_CALLER_CONVERSION });
    setMemberExtensions([]);
    setMemberTrunks([]);
    setAvailableExtensionSelected([]);
    setChosenExtensionSelected([]);
    setAvailableTrunkSelected([]);
    setChosenTrunkSelected([]);
  };

  const ensureFormListsLoaded = async () => {
    const promises = [];
    if (!hasLoadedMembersRef.current) promises.push(loadExtensions());
    if (!hasLoadedTrunksRef.current) promises.push(loadTrunks());
    if (promises.length > 0) await Promise.allSettled(promises);
  };

  useEffect(() => {
    const load = async () => {
      await Promise.allSettled([loadExtensions(), loadTrunks()]);
      await fetchOutboundRoutes();
    };
    load();
  }, []);

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    await ensureFormListsLoaded();
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || '');
    setPriority(row.priority || '');
    setDescription(row.description || '');
    setNextRoute(!!row.nextRoute);
    setEnabled(row.enabled || 'Yes');
    setPasswordType(row.passwordType || 'None');
    setSinglePin(row.singlePin || '');
    setRememoryHunt(row.rememoryHunt || 'No');
    setTimeConditions(Array.isArray(row.timeConditions) ? row.timeConditions : []);
    setDialPatterns(Array.isArray(row.dialPatterns) && row.dialPatterns.length > 0 ? row.dialPatterns : [{ ...DEFAULT_DIAL_PATTERN }]);
    setCallerConversion(row.callerConversion || { ...DEFAULT_CALLER_CONVERSION });
    setMemberExtensions(Array.isArray(row.memberExtensions) ? row.memberExtensions : []);
    setMemberTrunks(Array.isArray(row.memberTrunks) ? row.memberTrunks : []);
    setAvailableExtensionSelected([]);
    setChosenExtensionSelected([]);
    setAvailableTrunkSelected([]);
    setChosenTrunkSelected([]);
    setShowModal(true);
    await ensureFormListsLoaded();
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleCheckAll = () => setSelected(rows.map((_, i) => i));
  const handleUncheckAll = () => setSelected([]);
  const handleSelectRow = (idx) => setSelected((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert('Please select at least one row to delete.');
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const idsToDelete = selected.map((idx) => rows[idx]?.id).filter((id) => id != null);
      const results = await Promise.all(idsToDelete.map((id) => deleteOutboundRoute(id)));
      const failed = results.find((r) => !r?.response);
      if (failed) showAlert(failed?.message || 'Failed to delete one or more routes.');
      else showAlert('Outbound route(s) deleted successfully.');
      await fetchOutboundRoutes();
      setSelected([]);
      setPage(1);
    } catch (err) {
      showAlert(err?.message || 'Failed to delete route(s).');
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showAlert('Name is required.');
      return;
    }
    const parsedPriority = Number(priority);
    if (!Number.isInteger(parsedPriority) || parsedPriority < 1 || parsedPriority > 99999) {
      showAlert('Priority must be a number between 1 and 99999.');
      return;
    }
    if (passwordType === 'Single Pin' && !singlePin.trim()) {
      showAlert('Please enter password for Single Pin.');
      return;
    }
    if (passwordType === 'Single Pin' && !/^\d{1,16}$/.test(singlePin.trim())) {
      showAlert('Password PIN must be digits only (1–16 digits).');
      return;
    }
    if (memberExtensions.length === 0) {
      showAlert('Please select at least one member extension.');
      return;
    }
    if (memberTrunks.length === 0) {
      showAlert('Please select at least one member trunk.');
      return;
    }
    if (timeConditions.includes('Holiday') && !timeConditions.includes('All')) {
      showAlert('Holiday is only valid when All is checked.');
      return;
    }

    const time_condition = {
      work_time: timeConditions.includes('WorkTime'),
      holiday: timeConditions.includes('Holiday'),
      all: timeConditions.includes('All'),
    };

    const dial_patterns = dialPatterns
      .filter((d) => String(d.pattern || '').trim())
      .map((d) => ({
        pattern: String(d.pattern || '').trim(),
        strip: Number(d.strip || 0),
        front: String(d.front || ''),
        suffix: String(d.suffix || ''),
        delay_ms: Number(d.delay || 0),
      }));

    const apiPayload = {
      name: trimmedName,
      priority: parsedPriority,
      description: description || null,
      next_route: toApiYesNo(nextRoute ? 'yes' : 'no', 'yes'),
      enabled: toApiYesNo(enabled, 'yes'),
      password_type: mapPasswordTypeToApi(passwordType),
      password_pin: passwordType === 'Single Pin' ? singlePin.trim() : null,
      rrmemory_hunt: toApiYesNo(rememoryHunt, 'no'),
      time_condition,
      dial_patterns: dial_patterns.length > 0 ? dial_patterns : [{ pattern: '^\\d*$' }],
      caller_number_conversion: {
        strip: Number(callerConversion.strip || 0),
        front: String(callerConversion.front || ''),
        suffix: String(callerConversion.suffix || ''),
      },
      member_extensions: [...memberExtensions],
      member_trunks: [...memberTrunks],
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const res = editId != null ? await updateOutboundRoute(editId, apiPayload) : await createOutboundRoute(apiPayload);
      if (!res?.response) {
        showAlert(res?.message || 'Failed to save outbound route.');
        return;
      }
      showAlert(editId != null ? 'Outbound route updated successfully.' : 'Outbound route created successfully.');
      await fetchOutboundRoutes();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || 'Failed to save outbound route.');
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const toggleTimeCondition = (value) => {
    setTimeConditions((prev) => {
      if (value === 'Holiday' && !prev.includes('All')) return prev;
      const exists = prev.includes(value);
      const next = exists ? prev.filter((item) => item !== value) : [...prev, value];
      if (value === 'All' && exists) {
        return next.filter((item) => item !== 'Holiday');
      }
      return next;
    });
  };

  const updateDialPattern = (index, key, value) => {
    setDialPatterns((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const addDialPattern = () =>
    setDialPatterns((prev) => [...prev, { ...DEFAULT_DIAL_PATTERN, pattern: '^\\d*$' }]);
  const removeDialPatternAt = (index) =>
    setDialPatterns((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));

  const addSelectedExtensions = () => {
    if (availableExtensionSelected.length === 0) return;
    setMemberExtensions((prev) => [...prev, ...availableExtensionSelected.filter((id) => !prev.includes(id))]);
    setAvailableExtensionSelected([]);
  };
  const addAllExtensions = () => {
    setMemberExtensions(availableExtensions.map((item) => item.id));
    setAvailableExtensionSelected([]);
  };
  const removeSelectedExtensions = () => {
    if (chosenExtensionSelected.length === 0) return;
    setMemberExtensions((prev) => prev.filter((id) => !chosenExtensionSelected.includes(id)));
    setChosenExtensionSelected([]);
  };
  const removeAllExtensions = () => {
    setMemberExtensions([]);
    setChosenExtensionSelected([]);
  };

  const addSelectedTrunks = () => {
    if (availableTrunkSelected.length === 0) return;
    setMemberTrunks((prev) => [...prev, ...availableTrunkSelected.filter((id) => !prev.includes(id))]);
    setAvailableTrunkSelected([]);
  };
  const addAllTrunks = () => {
    setMemberTrunks(availableTrunks.map((item) => item.id));
    setAvailableTrunkSelected([]);
  };
  const removeSelectedTrunks = () => {
    if (chosenTrunkSelected.length === 0) return;
    setMemberTrunks((prev) => prev.filter((id) => !chosenTrunkSelected.includes(id)));
    setChosenTrunkSelected([]);
  };
  const removeAllTrunks = () => {
    setMemberTrunks([]);
    setChosenTrunkSelected([]);
  };

  return (
    <div className="w-full max-w-full mx-auto p-2">
      <div className="w-full max-w-full mx-auto">
        <div
          className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{ background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)' }}
        >
          Outbound Routes
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
            <thead>
              <tr>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center"></th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center">#</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Name</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Priority</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Enabled</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Password</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Member Extensions</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Member Trunks</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                    No outbound routes yet. Click &quot;Add New&quot; to create one.
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
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.priority}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.enabled}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {row.passwordType === 'Single Pin' ? `Single Pin (${row.singlePin || ''})` : row.passwordType}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {row.memberExtensions?.map(getExtensionLabel).join(', ')}
                      </td>
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
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: { width: 1000, maxWidth: '98vw', mx: 'auto', p: 0 },
        }}
      >
        <DialogTitle
          className="text-white text-center font-semibold p-2 text-base"
          style={{
            background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
            borderBottom: '1px solid #444444',
          }}
        >
          {editId != null ? 'Edit Outbound Route' : 'Add Outbound Route'}
        </DialogTitle>
        <DialogContent
          className="pt-3 pb-0 px-2"
          style={{
            padding: '12px 8px 0 8px',
            backgroundColor: '#dde0e4',
            border: '1px solid #444444',
            borderTop: 'none',
          }}
        >
          <div className="flex flex-col gap-3 w-full pb-2">
            <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
              <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                Outbound Call Routing
              </div>
              <div className="p-4 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 10 }}>
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 10 }}>
                        Priority <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 10 }}>
                        Description
                      </label>
                      <input
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 190, marginRight: 10 }}>
                        Next Route
                      </label>
                      <input type="checkbox" checked={nextRoute} onChange={(e) => setNextRoute(e.target.checked)} />
                    </div>

                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 190, marginRight: 10 }}>
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

                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 190, marginRight: 10 }}>
                        Password
                      </label>
                      <div className="flex-1">
                        <FormControl size="small" fullWidth>
                          <Select
                            value={passwordType}
                            onChange={(e) => {
                              setPasswordType(e.target.value);
                              if (e.target.value !== 'Single Pin') setSinglePin('');
                            }}
                          >
                            {PASSWORD_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>

                    {passwordType === 'Single Pin' && (
                      <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 190, marginRight: 10 }}>
                          Enter Password
                        </label>
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={singlePin}
                          onChange={(e) => setSinglePin(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 190, marginRight: 10 }}>
                        Rmemory Hunt
                      </label>
                      <div className="flex-1">
                        <FormControl size="small" fullWidth>
                          <Select value={rememoryHunt} onChange={(e) => setRememoryHunt(e.target.value)}>
                            {REMEMORY_HUNT_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap" style={{ minHeight: 32 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 190, marginRight: 10 }}>
                        Time Condition
                      </label>
                      <div className="flex items-center gap-3">
                        {TIME_CONDITION_OPTIONS.map((opt) => (
                          <label key={opt} className="text-[13px] text-gray-700 flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={timeConditions.includes(opt)}
                              onChange={() => toggleTimeCondition(opt)}
                              disabled={opt === 'Holiday' && !timeConditions.includes('All')}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] text-gray-700 font-medium">Dial Patterns</label>
                  <div className="flex flex-col gap-2">
                    <div className="hidden md:grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                      <div className="text-[12px] text-gray-600 font-medium">Patterns</div>
                      <div className="text-[12px] text-gray-600 font-medium">Strip</div>
                      <div className="text-[12px] text-gray-600 font-medium">Front</div>
                      <div className="text-[12px] text-gray-600 font-medium">Suffix</div>
                      <div className="text-[12px] text-gray-600 font-medium">Delay</div>
                      <div />
                    </div>
                    {dialPatterns.map((item, index) => (
                      <div key={`pattern-${index}`} className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                        <input
                          className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                          placeholder={index === 0 ? '' : undefined}
                          value={item.pattern}
                          onChange={(e) => updateDialPattern(index, 'pattern', e.target.value)}
                        />
                        <input
                          className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                          placeholder={index === 0 ? '' : undefined}
                          value={item.strip}
                          onChange={(e) => updateDialPattern(index, 'strip', e.target.value)}
                        />
                        <input
                          className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                          placeholder={index === 0 ? '' : undefined}
                          value={item.front}
                          onChange={(e) => updateDialPattern(index, 'front', e.target.value)}
                        />
                        <input
                          className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                          placeholder={index === 0 ? '' : undefined}
                          value={item.suffix}
                          onChange={(e) => updateDialPattern(index, 'suffix', e.target.value)}
                        />
                        <input
                          className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                          placeholder={index === 0 ? 'Unit is ms' : undefined}
                          value={item.delay}
                          onChange={(e) => updateDialPattern(index, 'delay', e.target.value)}
                        />
                        <div className="flex gap-1">
                          <button type="button" className="h-7 w-7 border border-gray-400 bg-[#d9dde3] text-sm font-semibold" onClick={addDialPattern}>
                            +
                          </button>
                          <button
                            type="button"
                            className="h-7 w-7 border border-gray-400 bg-[#d9dde3] text-sm font-semibold"
                            onClick={() => removeDialPatternAt(index)}
                            disabled={dialPatterns.length <= 1}
                          >
                            x
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] text-gray-700 font-medium">Caller Number Conversion</label>
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="text-[12px] text-gray-600 font-medium">Strip</div>
                    <div className="text-[12px] text-gray-600 font-medium">Front</div>
                    <div className="text-[12px] text-gray-600 font-medium">Suffix</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                      value={callerConversion.strip}
                      onChange={(e) => setCallerConversion((prev) => ({ ...prev, strip: e.target.value }))}
                    />
                    <input
                      className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                      value={callerConversion.front}
                      onChange={(e) => setCallerConversion((prev) => ({ ...prev, front: e.target.value }))}
                    />
                    <input
                      className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                      value={callerConversion.suffix}
                      onChange={(e) => setCallerConversion((prev) => ({ ...prev, suffix: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  <label className="text-[14px] text-gray-700 font-medium">
                    Member Extensions <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-[1fr_48px_1fr_48px] gap-3 items-start">
                    <div>
                      <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Available</div>
                      <select
                        multiple
                        value={availableExtensionSelected}
                        onChange={(e) => setAvailableExtensionSelected(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                        className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                      >
                        {loading.members ? (
                          <option>Loading extensions...</option>
                        ) : extensionAvailableList.length === 0 ? (
                          <option disabled>No extensions</option>
                        ) : (
                          extensionAvailableList.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 pt-7">
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={addSelectedExtensions}>
                        &gt;
                      </button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={addAllExtensions}>
                        &gt;&gt;
                      </button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={removeSelectedExtensions}>
                        &lt;
                      </button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={removeAllExtensions}>
                        &lt;&lt;
                      </button>
                    </div>

                    <div>
                      <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Selected</div>
                      <select
                        multiple
                        value={chosenExtensionSelected}
                        onChange={(e) => setChosenExtensionSelected(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                        className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                      >
                        {memberExtensions.length === 0 ? (
                          <option disabled>No selected extensions</option>
                        ) : (
                          memberExtensions.map((id) => (
                            <option key={id} value={id}>
                              {getExtensionLabel(id)}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 pt-7">
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={removeSelectedExtensions}>
                        &lt;
                      </button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={addSelectedExtensions}>
                        &gt;
                      </button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={removeAllExtensions}>
                        v
                      </button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={addAllExtensions}>
                        ^
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  <label className="text-[14px] text-gray-700 font-medium">
                    Member Trunks <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-[1fr_48px_1fr_48px] gap-3 items-start">
                    <div>
                      <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Available</div>
                      <select
                        multiple
                        value={availableTrunkSelected}
                        onChange={(e) => setAvailableTrunkSelected(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                        className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                      >
                        {loading.trunks ? (
                          <option>Loading trunks...</option>
                        ) : trunkAvailableList.length === 0 ? (
                          <option disabled>No trunks</option>
                        ) : (
                          trunkAvailableList.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 pt-7">
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={addSelectedTrunks}>
                        &gt;
                      </button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={addAllTrunks}>
                        &gt;&gt;
                      </button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={removeSelectedTrunks}>
                        &lt;
                      </button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={removeAllTrunks}>
                        &lt;&lt;
                      </button>
                    </div>

                    <div>
                      <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Selected</div>
                      <select
                        multiple
                        value={chosenTrunkSelected}
                        onChange={(e) => setChosenTrunkSelected(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                        className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                      >
                        {memberTrunks.length === 0 ? (
                          <option disabled>No selected trunks</option>
                        ) : (
                          memberTrunks.map((id) => (
                            <option key={id} value={id}>
                              {getTrunkLabel(id)}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 pt-7">
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={removeSelectedTrunks}>
                        &lt;
                      </button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={addSelectedTrunks}>
                        &gt;
                      </button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={removeAllTrunks}>
                        v
                      </button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold" onClick={addAllTrunks}>
                        ^
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

export default OutboundRoutesPage;