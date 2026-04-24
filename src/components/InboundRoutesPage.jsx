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
  createInboundRoute,
  deleteInboundRoute,
  fetchSipAccounts,
  listInboundRoutes,
  listConferences,
  listIvrs,
  listRingGroups,
  listSipRegistrations,
  updateInboundRoute,
} from '../api/apiService';

const ENABLE_OPTIONS = ['Yes', 'No'];
const T38_OPTIONS = ['Yes', 'No'];
const TIME_CONDITION_OPTIONS = ['Yes', 'No'];
const MOBILITY_OPTIONS = ['Yes', 'No'];
const SEND_RINGTONE_OPTIONS = ['Remote', 'Local'];

const DESTINATION_OPTIONS = [
  'Call Queue',
  'CallBacks',
  'Conference Rooms',
  'DISA',
  'Extensions',
  'Fax To Mail',
  'IVR Menus',
  'Ring Groups',
  'Voicemails',
  'Extension_Range',
  'Other',
];

const DEST_TYPE_TO_UI = {
  extensions: 'Extensions',
  voicemail: 'Voicemails',
  fax_to_email: 'Fax To Mail',
  ring_group: 'Ring Groups',
  conference: 'Conference Rooms',
  ivr_menu: 'IVR Menus',
  extension_range: 'Extension_Range',
  other: 'Other',
  call_queue: 'Call Queue',
  callbacks: 'CallBacks',
  disa: 'DISA',
};

const UI_TO_DEST_TYPE = {
  Extensions: 'extensions',
  Voicemails: 'voicemail',
  'Fax To Mail': 'fax_to_email',
  'Ring Groups': 'ring_group',
  'Conference Rooms': 'conference',
  'IVR Menus': 'ivr_menu',
  Extension_Range: 'extension_range',
  Other: 'other',
  'Call Queue': 'call_queue',
  CallBacks: 'callbacks',
  DISA: 'disa',
};

const OTHER_DESTINATION_OPTIONS = ['Hangup', 'Hold Music'];
const DESTINATION_NEEDS_EXTENSION = new Set(['Extensions', 'Fax To Mail', 'Voicemails']);
const DESTINATION_NEEDS_TARGET = new Set([
  'Extensions',
  'Fax To Mail',
  'Voicemails',
  'Conference Rooms',
  'Ring Groups',
  'IVR Menus',
  'Other',
]);
const SELECT_MENU_PROPS = {
  PaperProps: {
    sx: {
      maxHeight: 260,
      maxWidth: '90vw',
    },
  },
};

/** Dial / route number for a ring group (matches RingGroup.jsx: rg_number). */
const getRingGroupDialNumber = (item) => {
  if (!item || typeof item !== 'object') return '';
  const n =
    item.rg_number ??
    item.ring_group_no ??
    item.group_no ??
    item.group ??
    item.page_number;
  if (n !== undefined && n !== null && String(n).trim() !== '') return String(n).trim();
  return '';
};

/** If dest_value was saved as DB id, map to rg_number for display and API. */
const resolveRingGroupDestValue = (rawDestValue, ringGroupRows) => {
  if (rawDestValue == null || rawDestValue === '') return '';
  const s = String(rawDestValue).trim();
  if (!Array.isArray(ringGroupRows) || ringGroupRows.length === 0) return s;
  if (ringGroupRows.some((g) => getRingGroupDialNumber(g) === s)) return s;
  const byId = ringGroupRows.find((g) => String(g?.id) === s);
  if (byId) {
    const num = getRingGroupDialNumber(byId);
    return num || s;
  }
  return s;
};

const InboundRoutesPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({ list: false, save: false, delete: false, trunks: false });
  const hasLoadedTrunksRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [didPattern, setDidPattern] = useState('');
  const [callerIdPattern, setCallerIdPattern] = useState('');
  const [distinctiveRingTone, setDistinctiveRingTone] = useState('');
  const [enableT38, setEnableT38] = useState('No');
  const [enableTimeCondition, setEnableTimeCondition] = useState('No');
  const [destination, setDestination] = useState('');
  const [enabled, setEnabled] = useState('Yes');
  const [priority, setPriority] = useState('102');
  const [enableMobilityExtension, setEnableMobilityExtension] = useState('No');
  const [sendRingTone, setSendRingTone] = useState('Remote');
  const [destinationTarget, setDestinationTarget] = useState('');
  const [extensionRange, setExtensionRange] = useState('');

  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [availableConferences, setAvailableConferences] = useState([]);
  const [availableRingGroups, setAvailableRingGroups] = useState([]);
  const [availableIvrs, setAvailableIvrs] = useState([]);
  const hasLoadedDestinationDataRef = useRef(false);

  const [availableTrunks, setAvailableTrunks] = useState([]);
  const [selectedTrunks, setSelectedTrunks] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage((current) => Math.min(Math.max(1, current), Math.max(1, Math.ceil(rows.length / itemsPerPage))));
  }, [rows]);

  const showAlert = (text) => window.alert(text);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = React.useRef(null);

  const handleImportSubmit = async () => {
    if (!importFile) { showAlert('Please select a file to import'); return; }
    showAlert('Import API not yet configured');
  };

  const handleExport = () => {
    showAlert('Export API not yet configured');
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

  const mapDestTypeToUi = (destType) => DEST_TYPE_TO_UI[String(destType || '').toLowerCase()] || '';
  const mapUiToDestType = (uiDest) => UI_TO_DEST_TYPE[uiDest] || 'call_queue';

  /** Ring-group list API uses `rg_number` (same as Ring Group page); do not use DB id as dial target. */
  const getRingGroupDialNumber = (g) => {
    if (!g || typeof g !== 'object') return '';
    const n =
      g.rg_number ??
      g.ring_group_no ??
      g.group_no ??
      g.group ??
      g.page_number;
    if (n != null && String(n).trim() !== '') return String(n).trim();
    return '';
  };

  /** If dest_value was saved as ring-group row id, map it to the real group number (e.g. 6200). */
  const resolveRingGroupDestValue = (storedValue, ringGroupsList) => {
    if (storedValue == null || storedValue === '') return '';
    const s = String(storedValue).trim();
    if (!Array.isArray(ringGroupsList) || ringGroupsList.length === 0) return s;

    if (ringGroupsList.some((g) => getRingGroupDialNumber(g) === s)) return s;

    const byId = ringGroupsList.find((g) => String(g?.id) === s);
    if (byId) {
      const dial = getRingGroupDialNumber(byId);
      return dial || s;
    }
    return s;
  };

  const mapRouteFromApi = (item, ringGroupsList = []) => {
    const uiDestination = mapDestTypeToUi(item?.dest_type);
    const rawDestValue = item?.dest_value != null ? String(item.dest_value) : '';
    const destinationTargetRaw =
      uiDestination === 'Extension_Range'
        ? ''
        : uiDestination === 'Ring Groups'
          ? resolveRingGroupDestValue(rawDestValue, ringGroupsList)
          : rawDestValue;
    return {
      id: item?.id,
      name: String(item?.name || ''),
      didPattern: String(item?.did_pattern || ''),
      callerIdPattern: String(item?.callerid_pattern || ''),
      distinctiveRingTone: String(item?.distinctive_ringtone || ''),
      enableT38: toUiYesNo(item?.enable_t38, 'No'),
      enableTimeCondition: toUiYesNo(item?.enable_time_condition, 'No'),
      destination: uiDestination,
      destinationTarget: destinationTargetRaw,
      extensionRange: uiDestination === 'Extension_Range' ? rawDestValue : '',
      memberTrunks: Array.isArray(item?.member_trunks) ? item.member_trunks.map(String) : [],
      enabled: toUiYesNo(item?.enabled, 'Yes'),
      priority: String(item?.priority ?? '100'),
      enableMobilityExtension: toUiYesNo(item?.enable_mobility_ext, 'No'),
      sendRingTone: String(item?.send_ringtone || 'Remote'),
    };
  };

  const normalizeList = (raw) => {
    const list = raw?.message ?? raw?.data ?? raw;
    return Array.isArray(list) ? list : [];
  };

  const fetchInboundRoutes = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const [res, ringRes] = await Promise.all([
        listInboundRoutes(),
        listRingGroups().catch(() => ({ message: [] })),
      ]);
      const ringList = normalizeList(ringRes);
      if (!res?.response) {
        showAlert(res?.message || 'Failed to load inbound routes.');
        setRows([]);
        return;
      }
      const list = Array.isArray(res?.message) ? res.message : res?.message ? [res.message] : [];
      setRows(list.map((row) => mapRouteFromApi(row, ringList)));
    } catch (err) {
      showAlert(err?.message || 'Failed to load inbound routes.');
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
    }
  };

  useEffect(() => {
    fetchInboundRoutes();
  }, []);

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
          const host = t?.host || t?.sip_server || '';
          let label = '';
          if (name && host) label = `${name}@${host}`;
          else if (name) label = name;
          else if (host) label = host;
          else label = String(id || '');
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

  const loadDestinationData = async () => {
    try {
      const [extensionsRes, conferencesRes, ringGroupsRes, ivrsRes] = await Promise.allSettled([
        fetchSipAccounts(),
        listConferences(),
        listRingGroups(),
        listIvrs(),
      ]);

      const toOption = (id, label) => ({ id: String(id ?? ''), label: String(label ?? id ?? '') });

      if (extensionsRes.status === 'fulfilled') {
        const list = normalizeList(extensionsRes.value)
          .map((item) => {
            const ext = item?.extension ?? item?.ext ?? item?.id ?? item;
            const name = item?.name ?? item?.display_name ?? '';
            return toOption(ext, name ? `${ext} - ${name}` : ext);
          })
          .filter((item) => item.id);
        setAvailableExtensions(list);
      } else {
        setAvailableExtensions([]);
      }

      if (conferencesRes.status === 'fulfilled') {
        const list = normalizeList(conferencesRes.value)
          .map((item) => {
            const id = item?.conf_number ?? item?.id ?? item?.conference_id ?? item?.conference_number ?? item;
            const name = item?.name ?? item?.room_name ?? item?.conference_name ?? '';
            return toOption(id, name ? `${id} - ${name}` : id);
          })
          .filter((item) => item.id);
        setAvailableConferences(list);
      } else {
        setAvailableConferences([]);
      }

      if (ringGroupsRes.status === 'fulfilled') {
        const list = normalizeList(ringGroupsRes.value)
          .map((item) => {
            const dial =
              item?.rg_number ??
              item?.ring_group_no ??
              item?.group_no ??
              item?.group ??
              item?.page_number ??
              '';
            const id =
              dial !== '' && dial != null
                ? String(dial)
                : String(item?.id ?? item ?? '');
            const name = item?.name ?? item?.group_name ?? item?.ring_group_name ?? '';
            return toOption(id, name ? `${id} - ${name}` : id);
          })
          .filter((item) => item.id);
        setAvailableRingGroups(list);
      } else {
        setAvailableRingGroups([]);
      }

      if (ivrsRes.status === 'fulfilled') {
        const list = normalizeList(ivrsRes.value)
          .map((item) => {
            const id = item?.ivr_number ?? item?.id ?? item?.ivr_no ?? item;
            const name = item?.name ?? item?.ivr_name ?? '';
            return toOption(id, name ? `${id} - ${name}` : id);
          })
          .filter((item) => item.id);
        setAvailableIvrs(list);
      } else {
        setAvailableIvrs([]);
      }

      hasLoadedDestinationDataRef.current = true;
    } catch {
      setAvailableExtensions([]);
      setAvailableConferences([]);
      setAvailableRingGroups([]);
      setAvailableIvrs([]);
    }
  };

  const getDestinationChoices = () => {
    if (DESTINATION_NEEDS_EXTENSION.has(destination)) return availableExtensions;
    if (destination === 'Conference Rooms') return availableConferences;
    if (destination === 'Ring Groups') return availableRingGroups;
    if (destination === 'IVR Menus') return availableIvrs;
    if (destination === 'Other') return OTHER_DESTINATION_OPTIONS.map((opt) => ({ id: opt, label: opt }));
    return [];
  };

  const destinationChoices = getDestinationChoices();
  const needsDestinationTarget = DESTINATION_NEEDS_TARGET.has(destination);

  const resetForm = () => {
    setEditId(null);
    setName('');
    setDidPattern('');
    setCallerIdPattern('');
    setDistinctiveRingTone('');
    setEnableT38('No');
    setEnableTimeCondition('No');
    setDestination('');
    setEnabled('Yes');
    setPriority('102');
    setEnableMobilityExtension('No');
    setSendRingTone('Remote');
    setDestinationTarget('');
    setExtensionRange('');
    setSelectedTrunks([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    const loaders = [];
    if (!hasLoadedTrunksRef.current) loaders.push(loadTrunks());
    if (!hasLoadedDestinationDataRef.current) loaders.push(loadDestinationData());
    if (loaders.length > 0) await Promise.allSettled(loaders);
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || '');
    setDidPattern(row.didPattern || '');
    setCallerIdPattern(row.callerIdPattern || '');
    setDistinctiveRingTone(row.distinctiveRingTone || '');
    setEnableT38(row.enableT38 || 'No');
    setEnableTimeCondition(row.enableTimeCondition || 'No');
    setDestination(row.destination || 'Call Queue');
    setEnabled(row.enabled || 'Yes');
    setPriority(row.priority || '102');
    setEnableMobilityExtension(row.enableMobilityExtension || 'No');
    setSendRingTone(row.sendRingTone || 'Remote');
    setDestinationTarget(row.destinationTarget || '');
    setExtensionRange(row.extensionRange || '');
    setSelectedTrunks(Array.isArray(row.memberTrunks) ? row.memberTrunks : []);
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    const loaders = [];
    if (!hasLoadedTrunksRef.current) loaders.push(loadTrunks());
    if (!hasLoadedDestinationDataRef.current) loaders.push(loadDestinationData());
    if (loaders.length > 0) await Promise.allSettled(loaders);
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

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert('Please select at least one row to delete.');
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const idsToDelete = selected.map((idx) => rows[idx]?.id).filter((id) => id != null);
      const results = await Promise.all(idsToDelete.map((id) => deleteInboundRoute(id)));
      const failed = results.find((res) => !res?.response);
      if (failed) {
        showAlert(failed?.message || 'Failed to delete one or more routes.');
      } else {
        showAlert('Inbound route(s) deleted successfully.');
      }
      await fetchInboundRoutes();
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
    if (!destination) {
      showAlert('Destination is required.');
      return;
    }
    const parsedPriority = Number(priority);
    if (!Number.isInteger(parsedPriority) || parsedPriority < 1 || parsedPriority > 9999) {
      showAlert('Priority must be a number between 1 and 9999.');
      return;
    }
    if (destination === 'Extension_Range') {
      if (!extensionRange.trim()) {
        showAlert('Extension range is required (example: 100-136).');
        return;
      }
      const rangePattern = /^\d+\s*-\s*\d+$/;
      if (!rangePattern.test(extensionRange.trim())) {
        showAlert('Invalid extension range format. Use format like 100-136.');
        return;
      }
    } else if (destinationChoices.length > 0 && !destinationTarget) {
      showAlert('Please select a destination target.');
      return;
    }

    const payload = {
      id: editId ?? Date.now(),
      name: trimmedName,
      didPattern,
      callerIdPattern,
      distinctiveRingTone,
      enableT38,
      enableTimeCondition,
      destination,
      destinationTarget: destination === 'Extension_Range' ? '' : destinationTarget,
      extensionRange: destination === 'Extension_Range' ? extensionRange.trim() : '',
      enabled,
      priority,
      enableMobilityExtension,
      sendRingTone,
      memberTrunks: [...selectedTrunks],
    };

    const destType = mapUiToDestType(destination);
    const destValue = destination === 'Extension_Range' ? extensionRange.trim() : destinationTarget;

    const apiPayload = {
      name: payload.name,
      did_pattern: payload.didPattern || '',
      callerid_pattern: payload.callerIdPattern || '',
      distinctive_ringtone: payload.distinctiveRingTone || '',
      enable_t38: toApiYesNo(payload.enableT38, 'no'),
      enable_time_condition: toApiYesNo(payload.enableTimeCondition, 'no'),
      dest_type: destType,
      dest_value: destValue || '',
      member_trunks: Array.isArray(payload.memberTrunks) ? payload.memberTrunks : [],
      enabled: toApiYesNo(payload.enabled, 'yes'),
      priority: parsedPriority,
      enable_mobility_ext: toApiYesNo(payload.enableMobilityExtension, 'no'),
      send_ringtone: payload.sendRingTone || 'Remote',
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const response =
        editId != null ? await updateInboundRoute(editId, apiPayload) : await createInboundRoute(apiPayload);
      if (!response?.response) {
        showAlert(response?.message || 'Failed to save inbound route.');
        return;
      }
      showAlert(editId != null ? 'Inbound route updated successfully.' : 'Inbound route created successfully.');
      await fetchInboundRoutes();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || 'Failed to save inbound route.');
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-2">

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
          Import Inbound Routes
        </DialogTitle>
        <DialogContent style={{ backgroundColor: '#dde0e4', padding: '20px 24px 12px' }}>
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-[13px] text-gray-600">Select a CSV or JSON file containing inbound route data to import.</p>
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

      <div className="w-full max-w-full mx-auto">
        <div
          className="rounded-t-lg h-9 flex items-center justify-between px-3 font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{ background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)' }}
        >
          <div className="flex-1" />
          <span>Inbound Routes</span>
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

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
            <thead>
              <tr>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center"></th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center">#</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Name</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">DID Pattern</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Caller ID Pattern</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Destination</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Enabled</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Member Trunks</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                    No inbound routes yet. Click &quot;Add New&quot; to create one.
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
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.didPattern}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.callerIdPattern}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {row.destination === 'Extension_Range'
                          ? `${row.destination}: ${row.extensionRange || ''}`
                          : row.destinationTarget
                          ? `${row.destination}: ${row.destinationTarget}`
                          : row.destination}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.enabled}</td>
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
          {editId != null ? 'Edit Inbound Route' : 'Add Inbound Route'}
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
                Inbound Call Routing
              </div>
              <div className="p-4 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                  {/* Left column fields */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 170, marginRight: 10 }}
                      >
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 170, marginRight: 10 }}
                      >
                        DID Pattern
                      </label>
                      <input
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                        value={didPattern}
                        onChange={(e) => setDidPattern(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 170, marginRight: 10 }}
                      >
                        Caller ID Pattern
                      </label>
                      <input
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                        value={callerIdPattern}
                        onChange={(e) => setCallerIdPattern(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 170, marginRight: 10 }}
                      >
                        Distinctive RingTone
                      </label>
                      <input
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                        value={distinctiveRingTone}
                        onChange={(e) => setDistinctiveRingTone(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 170, marginRight: 10 }}
                      >
                        Enable T.38
                      </label>
                      <div className="flex-1">
                        <FormControl size="small" fullWidth>
                          <Select value={enableT38} onChange={(e) => setEnableT38(e.target.value)}>
                            {T38_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 170, marginRight: 10 }}
                      >
                        Enable Time Condition
                      </label>
                      <div className="flex-1">
                        <FormControl size="small" fullWidth>
                          <Select value={enableTimeCondition} onChange={(e) => setEnableTimeCondition(e.target.value)}>
                            {TIME_CONDITION_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 170, marginRight: 10 }}
                      >
                        Destination <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1">
                        <FormControl size="small" fullWidth>
                          <Select
                            value={destination}
                            onChange={(e) => {
                              setDestination(e.target.value);
                              setDestinationTarget('');
                              setExtensionRange('');
                            }}
                            MenuProps={SELECT_MENU_PROPS}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>Select</em>
                            </MenuItem>
                            {DESTINATION_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>

                    {destination === 'Extension_Range' ? (
                      <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                        <label
                          className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                          style={{ width: 170, marginRight: 10 }}
                        >
                          Extension Range <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={extensionRange}
                          onChange={(e) => setExtensionRange(e.target.value)}
                          placeholder="100-136"
                        />
                      </div>
                    ) : needsDestinationTarget ? (
                      <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                        <label
                          className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                          style={{ width: 170, marginRight: 10 }}
                        >
                          Destination Value <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <FormControl size="small" fullWidth>
                            <Select
                              value={destinationTarget}
                              onChange={(e) => setDestinationTarget(e.target.value)}
                              displayEmpty
                              MenuProps={SELECT_MENU_PROPS}
                            >
                              <MenuItem value="" disabled={destinationChoices.length === 0}>
                                <em>Select</em>
                              </MenuItem>
                              {destinationChoices.length === 0 ? (
                                <MenuItem value="" disabled>
                                  No options available
                                </MenuItem>
                              ) : (
                                destinationChoices.map((opt) => (
                                  <MenuItem key={opt.id} value={opt.id}>
                                    {opt.label}
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                          </FormControl>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Right column fields */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 190, marginRight: 10 }}
                      >
                        Enabled
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
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 190, marginRight: 10 }}
                      >
                        Priority
                      </label>
                      <input
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 190, marginRight: 10 }}
                      >
                        Enable Mobility Extension
                      </label>
                      <div className="flex-1">
                        <FormControl size="small" fullWidth>
                          <Select
                            value={enableMobilityExtension}
                            onChange={(e) => setEnableMobilityExtension(e.target.value)}
                          >
                            {MOBILITY_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 190, marginRight: 10 }}
                      >
                        Send RingTone
                      </label>
                      <div className="flex-1">
                        <FormControl size="small" fullWidth>
                          <Select value={sendRingTone} onChange={(e) => setSendRingTone(e.target.value)}>
                            {SEND_RINGTONE_OPTIONS.map((opt) => (
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

                {/* Member Trunks dual list */}
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-[14px] text-gray-700 font-medium">
                    Member Trunks <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-[1fr_48px_1fr_48px] gap-3 items-start">
                    <div>
                      <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Available</div>
                      <select
                        multiple
                        value={availableSelected}
                        onChange={(e) =>
                          setAvailableSelected(Array.from(e.target.selectedOptions, (opt) => opt.value))
                        }
                        className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
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
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                        onClick={addSelectedTrunks}
                      >
                        &gt;
                      </button>
                      <button
                        type="button"
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                        onClick={addAllTrunks}
                      >
                        &gt;&gt;
                      </button>
                      <button
                        type="button"
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                        onClick={removeSelectedTrunks}
                      >
                        &lt;
                      </button>
                      <button
                        type="button"
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
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
                        onChange={(e) =>
                          setChosenSelected(Array.from(e.target.selectedOptions, (opt) => opt.value))
                        }
                        className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
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
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                        onClick={removeSelectedTrunks}
                      >
                        &lt;
                      </button>
                      <button
                        type="button"
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                        onClick={addSelectedTrunks}
                      >
                        &gt;
                      </button>
                      <button
                        type="button"
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                        onClick={removeAllTrunks}
                      >
                        v
                      </button>
                      <button
                        type="button"
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                        onClick={addAllTrunks}
                      >
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

export default InboundRoutesPage;

