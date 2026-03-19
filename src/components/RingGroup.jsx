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
import { fetchSipAccounts, listConferences, listIvrs } from '../api/apiService';
import { RING_GROUP_ITEMS_PER_PAGE } from '../constants/RingGroupConstants';

const ENABLE_OPTIONS = ['Yes', 'No'];
const RING_STRATEGY_OPTIONS = ['simultaneous', 'sequence', 'random'];
const EXTENSION_ANSWER_CONFIRM_OPTIONS = ['Yes', 'No'];
const RING_TIMEOUT_OPTIONS = ['10', '15', '20', '25', '30', '45', '60', '90', '120'];
const TIMEOUT_DESTINATION_OPTIONS = [
  'Call Queue',
  'CallBacks',
  'Conference Rooms',
  'DISA',
  'Extensions',
  'Fax To Mail',
  'IVR Menus',
  'Ring Group',
  'Voicemails',
  'Other',
];
const RING_BACK_OPTIONS = ['default', 'us-ring', 'uk-ring', 'au-ring', 'in-ring'];

const RingGroup = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    save: false,
    delete: false,
    members: false,
    destinations: false,
  });
  const hasLoadedDataRef = useRef(false);

  // Form state
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [ringGroupNumber, setRingGroupNumber] = useState('');
  const [ringStrategy, setRingStrategy] = useState('simultaneous');
  const [timeoutDestinationType, setTimeoutDestinationType] = useState('');
  const [timeoutDestinationValue, setTimeoutDestinationValue] = useState('');
  const [ringTimeout, setRingTimeout] = useState('30');
  const [enabled, setEnabled] = useState('Yes');
  const [alertInfo, setAlertInfo] = useState('');
  const [ringBack, setRingBack] = useState('us-ring');
  const [cidNamePrefix, setCidNamePrefix] = useState('');
  const [extensionAnswerConfirm, setExtensionAnswerConfirm] = useState('No');

  // Member Extensions dual-list
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  // Destination value data
  const [destinationData, setDestinationData] = useState({
    extensions: [],
    conferenceRooms: [],
    ivrMenus: [],
  });

  const itemsPerPage = RING_GROUP_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage((current) => Math.min(Math.max(1, current), Math.max(1, Math.ceil(rows.length / itemsPerPage))));
  }, [rows]);

  const showAlert = (text) => window.alert(text);

  const loadFormData = async () => {
    setLoading((prev) => ({ ...prev, members: true, destinations: true }));
    try {
      const [sipRes, confRes, ivrRes] = await Promise.all([
        fetchSipAccounts(),
        listConferences(),
        listIvrs(),
      ]);

      const sipList = Array.isArray(sipRes?.message) ? sipRes.message : Array.isArray(sipRes?.data) ? sipRes.data : [];
      const extensions = sipList
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
      setAvailableExtensions(extensions);

      const confList = Array.isArray(confRes?.message) ? confRes.message : Array.isArray(confRes?.data) ? confRes.data : [];
      const conferenceRooms = confList.map((c) => ({
        value: String(c.conf_number ?? c.id ?? ''),
        label: String(c.conf_number ?? c.id ?? ''),
      }));

      const ivrList = Array.isArray(ivrRes?.message) ? ivrRes.message : Array.isArray(ivrRes?.data) ? ivrRes.data : [];
      const ivrMenus = ivrList.map((i) => ({
        value: String(i.ivr_number ?? i.id ?? ''),
        label: String(i.ivr_number ?? i.id ?? ''),
      }));

      setDestinationData({
        extensions,
        conferenceRooms,
        ivrMenus,
      });

      hasLoadedDataRef.current = true;
    } catch (err) {
      showAlert(err?.message || 'Failed to load ring group form data.');
      setAvailableExtensions([]);
      setDestinationData({ extensions: [], conferenceRooms: [], ivrMenus: [] });
    } finally {
      setLoading((prev) => ({ ...prev, members: false, destinations: false }));
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setRingGroupNumber('');
    setRingStrategy('simultaneous');
    setTimeoutDestinationType('');
    setTimeoutDestinationValue('');
    setRingTimeout('30');
    setEnabled('Yes');
    setAlertInfo('');
    setRingBack('us-ring');
    setCidNamePrefix('');
    setExtensionAnswerConfirm('No');
    setMemberExtensions([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    if (!hasLoadedDataRef.current) {
      await loadFormData();
    }
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || '');
    setRingGroupNumber(row.ringGroupNumber || '');
    setRingStrategy(row.ringStrategy || 'simultaneous');
    setTimeoutDestinationType(row.timeoutDestinationType || '');
    setTimeoutDestinationValue(row.timeoutDestinationValue || '');
    setRingTimeout(row.ringTimeout || '30');
    setEnabled(row.enabled || 'Yes');
    setAlertInfo(row.alertInfo || '');
    setRingBack(row.ringBack || 'us-ring');
    setCidNamePrefix(row.cidNamePrefix || '');
    setExtensionAnswerConfirm(row.extensionAnswerConfirm || 'No');
    setMemberExtensions(Array.isArray(row.members) ? row.members : []);
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    if (!hasLoadedDataRef.current) {
      await loadFormData();
    }
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((e) => map.set(e.value, e.label));
    return map;
  }, [availableExtensions]);
  const getExtLabel = (ext) => extensionLabelMap.get(ext) || ext;

  const availableMemberList = useMemo(
    () => availableExtensions.filter((e) => !memberExtensions.includes(e.value)),
    [availableExtensions, memberExtensions]
  );

  const addSelectedMembers = () => {
    if (!availableSelected.length) return;
    setMemberExtensions((prev) => [...prev, ...availableSelected.filter((id) => !prev.includes(id))]);
    setAvailableSelected([]);
  };
  const addAllMembers = () => {
    setMemberExtensions(availableExtensions.map((e) => e.value));
    setAvailableSelected([]);
  };
  const removeSelectedMembers = () => {
    if (!chosenSelected.length) return;
    setMemberExtensions((prev) => prev.filter((id) => !chosenSelected.includes(id)));
    setChosenSelected([]);
  };
  const removeAllMembers = () => {
    setMemberExtensions([]);
    setChosenSelected([]);
  };

  const getTimeoutValueOptions = () => {
    switch (timeoutDestinationType) {
      case 'Extensions':
      case 'Fax To Mail':
      case 'Voicemails':
        return destinationData.extensions;
      case 'Conference Rooms':
        return destinationData.conferenceRooms;
      case 'IVR Menus':
        return destinationData.ivrMenus;
      case 'Ring Group':
        return rows
          .filter((r) => String(r.id) !== String(editId))
          .map((r) => ({ value: String(r.ringGroupNumber), label: `${r.name}-${r.ringGroupNumber}` }));
      case 'Other':
        return [
          { value: 'Hangup', label: 'Hangup' },
          { value: 'Hold Music', label: 'Hold Music' },
        ];
      default:
        return [];
    }
  };

  const timeoutValueOptions = getTimeoutValueOptions();
  const shouldShowTimeoutValue = Boolean(timeoutDestinationType);

  const handleCheckAll = () => setSelected(rows.map((_, i) => i));
  const handleUncheckAll = () => setSelected([]);
  const handleSelectRow = (idx) => {
    setSelected((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  };

  const handleDelete = () => {
    if (!selected.length) {
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
    const trimmed = name.trim();
    if (!trimmed) {
      showAlert('Name is required.');
      return;
    }
    if (!ringGroupNumber.trim()) {
      showAlert('Ring Group Number is required.');
      return;
    }
    if (!timeoutDestinationType) {
      showAlert('Timeout Destination is required.');
      return;
    }
    if (shouldShowTimeoutValue && !timeoutDestinationValue) {
      showAlert('Please select Timeout Destination value.');
      return;
    }
    if (!memberExtensions.length) {
      showAlert('Please select at least one Member Extension.');
      return;
    }

    const payload = {
      id: editId ?? Date.now(),
      name: trimmed,
      ringGroupNumber: ringGroupNumber.trim(),
      ringStrategy,
      timeoutDestinationType,
      timeoutDestinationValue,
      ringTimeout,
      enabled,
      alertInfo,
      ringBack,
      cidNamePrefix,
      extensionAnswerConfirm,
      members: [...memberExtensions],
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      setRows((prev) => {
        if (editId != null) {
          return prev.map((r) => (r.id === editId ? payload : r));
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
          Ring Group
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
            <thead>
              <tr>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center" />
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center">#</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Name</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Ring Group Number</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Strategy</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Enabled</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Members</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                    No ring groups yet. Click &quot;Add New&quot; to create one.
                  </td>
                </tr>
              ) : (
                pagedRows.map((row, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  return (
                    <tr key={row.id}>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input type="checkbox" checked={selected.includes(realIdx)} onChange={() => handleSelectRow(realIdx)} disabled={loading.delete} />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{realIdx + 1}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center font-medium">{row.name}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.ringGroupNumber}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.ringStrategy}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.enabled}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{(row.members || []).slice(0, 3).map(getExtLabel).join(', ')}</td>
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
            <button className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleCheckAll} disabled={loading.delete}>Check All</button>
            <button className={`bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleUncheckAll} disabled={loading.delete}>Uncheck All</button>
            <button className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleDelete} disabled={loading.delete}>
              {loading.delete && <CircularProgress size={12} />}
              Delete
            </button>
          </div>
          <div className="flex gap-2">
            <button className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.save ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleOpenAddModal} disabled={loading.save}>Add New</button>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
            <span>{rows.length} items Total</span>
            <span>{itemsPerPage} Items/Page</span>
            <span>{page}/{totalPages}</span>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(1)} disabled={page === 1}>First</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
            <select className="text-xs rounded border border-gray-300 px-1 py-0.5 min-w-[40px]" value={page} onChange={(e) => setPage(Number(e.target.value))}>
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
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
        PaperProps={{ sx: { width: 980, maxWidth: '96vw', mx: 'auto', p: 0 } }}
      >
        <DialogTitle
          className="text-white text-center font-semibold p-2 text-base"
          style={{
            background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
            borderBottom: '1px solid #444444',
          }}
        >
          {editId != null ? 'Edit Ring Group' : 'Add Ring Group'}
        </DialogTitle>
        <DialogContent className="pt-0 pb-0 px-0" style={{ backgroundColor: '#dde0e4', border: '1px solid #444444', borderTop: 'none' }}>
          <div className="pt-4 pb-4 px-4 bg-white">
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <div className="px-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>Name <span className="text-red-500">*</span></label>
                      <input className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>Ring Group Number <span className="text-red-500">*</span></label>
                      <input className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none" value={ringGroupNumber} onChange={(e) => setRingGroupNumber(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>Ring Strategy <span className="text-red-500">*</span></label>
                      <div className="flex-1"><FormControl size="small" fullWidth><Select value={ringStrategy} onChange={(e) => setRingStrategy(e.target.value)}>{RING_STRATEGY_OPTIONS.map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}</Select></FormControl></div>
                    </div>
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>Timeout Destination <span className="text-red-500">*</span></label>
                      <div className="flex-1"><FormControl size="small" fullWidth><Select value={timeoutDestinationType} onChange={(e) => { setTimeoutDestinationType(e.target.value); setTimeoutDestinationValue(''); }}><MenuItem value=""><em>Select destination type</em></MenuItem>{TIMEOUT_DESTINATION_OPTIONS.map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}</Select></FormControl></div>
                    </div>
                    {shouldShowTimeoutValue && (
                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>Destination Value</label>
                        <div className="flex-1">
                          <FormControl size="small" fullWidth>
                            <Select value={timeoutDestinationValue} onChange={(e) => setTimeoutDestinationValue(e.target.value)}>
                              <MenuItem value=""><em>Select value</em></MenuItem>
                              {timeoutValueOptions.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>Ring Timeout (s)</label>
                      <div className="flex-1"><FormControl size="small" fullWidth><Select value={ringTimeout} onChange={(e) => setRingTimeout(e.target.value)}>{RING_TIMEOUT_OPTIONS.map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}</Select></FormControl></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>Enabled <span className="text-red-500">*</span></label>
                      <div className="flex-1"><FormControl size="small" fullWidth><Select value={enabled} onChange={(e) => setEnabled(e.target.value)}>{ENABLE_OPTIONS.map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}</Select></FormControl></div>
                    </div>
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>Alert Info</label>
                      <input className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none" value={alertInfo} onChange={(e) => setAlertInfo(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>Ring Back</label>
                      <div className="flex-1"><FormControl size="small" fullWidth><Select value={ringBack} onChange={(e) => setRingBack(e.target.value)}>{RING_BACK_OPTIONS.map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}</Select></FormControl></div>
                    </div>
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>CID Name Prefix</label>
                      <input className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none" value={cidNamePrefix} onChange={(e) => setCidNamePrefix(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>Extension Answer Confirm</label>
                      <div className="flex-1"><FormControl size="small" fullWidth><Select value={extensionAnswerConfirm} onChange={(e) => setExtensionAnswerConfirm(e.target.value)}>{EXTENSION_ANSWER_CONFIRM_OPTIONS.map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}</Select></FormControl></div>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-[14px] text-gray-700 font-medium mb-2">
                    Member Extensions <span className="text-red-500">*</span>
                  </div>
                  <div className="grid grid-cols-[1fr_48px_1fr_48px] gap-3 items-start">
                    <div>
                      <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Available</div>
                      <select
                        multiple
                        value={availableSelected}
                        onChange={(e) => setAvailableSelected(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                        className="w-full h-32 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                      >
                        {loading.members ? (
                          <option>Loading extensions...</option>
                        ) : availableMemberList.length === 0 ? (
                          <option disabled>No extensions</option>
                        ) : (
                          availableMemberList.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 pt-7">
                      <button type="button" className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={addSelectedMembers}>&gt;</button>
                      <button type="button" className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={addAllMembers}>&gt;&gt;</button>
                      <button type="button" className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={removeSelectedMembers}>&lt;</button>
                      <button type="button" className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={removeAllMembers}>&lt;&lt;</button>
                    </div>

                    <div>
                      <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Selected</div>
                      <select
                        multiple
                        value={chosenSelected}
                        onChange={(e) => setChosenSelected(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                        className="w-full h-32 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                      >
                        {memberExtensions.length === 0 ? (
                          <option disabled>No selected members</option>
                        ) : (
                          memberExtensions.map((id) => (
                            <option key={id} value={id}>{getExtLabel(id)}</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 pt-7">
                      <button type="button" className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={removeSelectedMembers}>&lt;</button>
                      <button type="button" className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={addSelectedMembers}>&gt;</button>
                      <button type="button" className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={removeAllMembers}>v</button>
                      <button type="button" className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={addAllMembers}>^</button>
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

export default RingGroup;