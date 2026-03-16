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
import { listSipRegistrations } from '../api/apiService';

const INBOUND_ROUTES_STORAGE_KEY = 'inboundRoutesRows';

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

function loadStoredRows() {
  try {
    const raw = localStorage.getItem(INBOUND_ROUTES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredRows(rows) {
  try {
    localStorage.setItem(INBOUND_ROUTES_STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // ignore
  }
}

const InboundRoutesPage = () => {
  const [rows, setRows] = useState(() => loadStoredRows());
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({ save: false, delete: false, trunks: false });
  const hasLoadedTrunksRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [didPattern, setDidPattern] = useState('');
  const [callerIdPattern, setCallerIdPattern] = useState('');
  const [distinctiveRingTone, setDistinctiveRingTone] = useState('');
  const [enableT38, setEnableT38] = useState('No');
  const [enableTimeCondition, setEnableTimeCondition] = useState('No');
  const [destination, setDestination] = useState('Call Queue');
  const [enabled, setEnabled] = useState('Yes');
  const [priority, setPriority] = useState('102');
  const [enableMobilityExtension, setEnableMobilityExtension] = useState('No');
  const [sendRingTone, setSendRingTone] = useState('Remote');

  const [availableTrunks, setAvailableTrunks] = useState([]);
  const [selectedTrunks, setSelectedTrunks] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    saveStoredRows(rows);
    setPage((current) => Math.min(Math.max(1, current), Math.max(1, Math.ceil(rows.length / itemsPerPage))));
  }, [rows]);

  const showAlert = (text) => window.alert(text);

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

  const resetForm = () => {
    setEditId(null);
    setName('');
    setDidPattern('');
    setCallerIdPattern('');
    setDistinctiveRingTone('');
    setEnableT38('No');
    setEnableTimeCondition('No');
    setDestination('Call Queue');
    setEnabled('Yes');
    setPriority('102');
    setEnableMobilityExtension('No');
    setSendRingTone('Remote');
    setSelectedTrunks([]);
    setAvailableSelected([]);
    setChosenSelected([]);
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
    setSelectedTrunks(Array.isArray(row.memberTrunks) ? row.memberTrunks : []);
    setAvailableSelected([]);
    setChosenSelected([]);
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
    try {
      setRows((prev) => prev.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showAlert('Name is required.');
      return;
    }
    if (!destination) {
      showAlert('Destination is required.');
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
      enabled,
      priority,
      enableMobilityExtension,
      sendRingTone,
      memberTrunks: [...selectedTrunks],
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      setRows((prev) => {
        if (editId != null) {
          return prev.map((row) => (row.id === editId ? payload : row));
        }
        return [...prev, payload];
      });
      handleCloseModal();
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-2">
      <div className="w-full max-w-full mx-auto">
        <div
          className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{ background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)' }}
        >
          Inbound Routes
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
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.destination}</td>
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
                          <Select value={destination} onChange={(e) => setDestination(e.target.value)}>
                            {DESTINATION_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>
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

