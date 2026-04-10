import React, { useEffect, useMemo, useRef, useState } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Select } from '@mui/material';
import { createCCRoute, deleteCCRoute, fetchCCRouteExtensions, fetchCCRoutes, updateCCRoute } from '../api/apiService';

const CC_INTERVAL_OPTIONS = [
  { value: '10', label: '10s' },
  { value: '30', label: '30s' },
  { value: '60', label: '1 min' },
  { value: '120', label: '2 min' },
  { value: '300', label: '5 min' },
];
const CC_INTERVAL_VALUE_SET = new Set(CC_INTERVAL_OPTIONS.map((o) => o.value));
const getCcIntervalLabel = (value) => {
  const found = CC_INTERVAL_OPTIONS.find((o) => o.value === String(value));
  return found ? found.label : `${value}s`;
};
const THROUGH_OPTIONS = ['Auto', 'From Come In'];
const RECORD_KEEP_OPTIONS = [
  '8 hours',
  '16 hours',
  '1 day',
  '2 day',
  '3 day',
  '1 week',
  '2 week',
  '3 week',
  '4 week',
];
const ENABLE_OPTIONS = ['Yes', 'No'];
const KEEP_MINUTES_TO_LABEL = {
  480: '8 hours',
  960: '16 hours',
  1440: '1 day',
  2880: '2 day',
  4320: '3 day',
  10080: '1 week',
  20160: '2 week',
  30240: '3 week',
  40320: '4 week',
};

function normalizeThroughFromApi(value) {
  const mode = String(value || '').toLowerCase();
  return mode === 'from_come_in' || mode === 'from come in' ? 'From Come In' : 'Auto';
}

function normalizeEnabledFromApi(value) {
  return value === true || String(value || '').toLowerCase() === 'yes' ? 'Yes' : 'No';
}

function normalizeRecordKeepTime(route) {
  if (route?.record_keep_time) return String(route.record_keep_time);
  const minutes = Number(route?.keep_minutes);
  return KEEP_MINUTES_TO_LABEL[minutes] || '8 hours';
}

function normalizeRoute(item) {
  const rawInterval = Number(item.interval_minutes ?? item.cc_interval_time);
  const normalizedInterval = Number.isFinite(rawInterval) && rawInterval > 0
    ? (rawInterval <= 5 ? rawInterval * 60 : rawInterval)
    : 10;
  const ccIntervalTime = CC_INTERVAL_VALUE_SET.has(String(normalizedInterval))
    ? String(normalizedInterval)
    : '10';

  return {
    id: item.id,
    ccIntervalTime,
    through: normalizeThroughFromApi(item.through_mode ?? item.through),
    recordKeepTime: normalizeRecordKeepTime(item),
    enabled: normalizeEnabledFromApi(item.enabled ?? item.enable),
    memberExtensions: Array.isArray(item.extensions) ? item.extensions.map(String) : [],
  };
}

const CCRoutePage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({ fetch: false, save: false, delete: false, extensions: false });
  const hasLoadedExtensionsRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [ccIntervalTime, setCcIntervalTime] = useState('1');
  const [through, setThrough] = useState('Auto');
  const [recordKeepTime, setRecordKeepTime] = useState('8 hours');
  const [enabled, setEnabled] = useState('No');
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [selectedExtensions, setSelectedExtensions] = useState([]);
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

  const loadRows = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const res = await fetchCCRoutes();
      const list = Array.isArray(res?.message) ? res.message : Array.isArray(res?.data) ? res.data : [];
      setRows(list.map(normalizeRoute));
    } catch (err) {
      showAlert(err?.message || 'Failed to load CC routes.');
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await fetchCCRouteExtensions();
      const list = Array.isArray(res?.message) ? res.message : Array.isArray(res?.data) ? res.data : [];
      const exts = list
        .map((item) => ({
          extension: String(item?.extension ?? '').trim(),
          label: String(item?.label ?? item?.extension ?? '').trim(),
        }))
        .filter((item) => item.extension)
        .sort((a, b) => (parseInt(a.extension, 10) || 0) - (parseInt(b.extension, 10) || 0));
      setAvailableExtensions(exts);
      hasLoadedExtensionsRef.current = true;
    } catch (err) {
      showAlert(err?.message || 'Failed to load extensions.');
      setAvailableExtensions([]);
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((item) => {
      map.set(item.extension, item.label || item.extension);
    });
    return map;
  }, [availableExtensions]);

  const getExtensionLabel = (ext) => extensionLabelMap.get(ext) || ext;

  const resetForm = () => {
    setEditId(null);
    setCcIntervalTime('10');
    setThrough('Auto');
    setRecordKeepTime('8 hours');
    setEnabled('No');
    setSelectedExtensions([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) {
      await loadExtensions();
    }
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setCcIntervalTime(row.ccIntervalTime);
    setThrough(row.through);
    setRecordKeepTime(row.recordKeepTime);
    setEnabled(row.enabled);
    setSelectedExtensions(Array.isArray(row.memberExtensions) ? row.memberExtensions : []);
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) {
      await loadExtensions();
    }
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const availableList = useMemo(
    () => availableExtensions.filter((item) => !selectedExtensions.includes(item.extension)),
    [availableExtensions, selectedExtensions]
  );

  const addSelectedExtensions = () => {
    if (availableSelected.length === 0) return;
    setSelectedExtensions((prev) => [...prev, ...availableSelected.filter((ext) => !prev.includes(ext))]);
    setAvailableSelected([]);
  };

  const addAllExtensions = () => {
    setSelectedExtensions(availableExtensions.map((item) => item.extension));
    setAvailableSelected([]);
  };

  const removeSelectedExtensions = () => {
    if (chosenSelected.length === 0) return;
    setSelectedExtensions((prev) => prev.filter((ext) => !chosenSelected.includes(ext)));
    setChosenSelected([]);
  };

  const removeAllExtensions = () => {
    setSelectedExtensions([]);
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
      const ids = selected.map((i) => rows[i]?.id).filter(Boolean);
      await Promise.all(ids.map((id) => deleteCCRoute(id)));
      setSelected([]);
      await loadRows();
      showAlert(`Deleted ${ids.length} item(s).`);
    } catch (err) {
      showAlert(err?.message || 'Failed to delete CC route.');
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    if (selectedExtensions.length === 0) {
      showAlert('Please select at least one member extension.');
      return;
    }

    const apiPayload = {
      cc_interval_time: Number(ccIntervalTime),
      through,
      record_keep_time: recordKeepTime,
      enable: enabled,
      extensions: [...selectedExtensions].sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0)),
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editId != null) {
        await updateCCRoute({ id: editId, ...apiPayload });
        showAlert('CC route updated.');
      } else {
        await createCCRoute(apiPayload);
        showAlert('CC route created.');
      }
      await loadRows();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || 'Failed to save CC route.');
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
          CC Route
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
            <thead>
              <tr>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center"></th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center">#</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">CC Interval Time</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Through</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Record Keep Time</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Enable</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Member Extensions</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading.fetch ? (
                <tr>
                  <td colSpan={8} className="border border-gray-300 px-2 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <CircularProgress size={20} />
                      <span>Loading CC routes...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                    No CC routes yet. Click &quot;Add New&quot; to create one.
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
                          disabled={loading.delete || loading.fetch}
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{realIdx + 1}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{getCcIntervalLabel(row.ccIntervalTime)}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.through}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.recordKeepTime}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.enabled}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.memberExtensions.map(getExtensionLabel).join(', ')}</td>
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
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleDelete}
              disabled={loading.delete || loading.fetch}
            >
              {loading.delete && <CircularProgress size={12} />}
              Delete
            </button>
          </div>
          <div className="flex gap-2">
            <button
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.save || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleOpenAddModal}
              disabled={loading.save || loading.fetch}
            >
              Add New
            </button>
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
        PaperProps={{
          sx: { width: 980, maxWidth: '98vw', mx: 'auto', p: 0 }
        }}
      >
        <DialogTitle
          className="text-white text-center font-semibold p-2 text-base"
          style={{
            background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
            borderBottom: '1px solid #444444'
          }}
        >
          {editId != null ? 'Edit CC Route' : 'Add CC Route'}
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
          <div className="flex flex-col gap-3 w-full pb-2">
            <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
              <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                CC Route Settings
              </div>
              <div className="p-4 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                  <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                    <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 10 }}>
                      CC Interval Time <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1">
                      <FormControl size="small" fullWidth>
                        <Select value={ccIntervalTime} onChange={(e) => setCcIntervalTime(e.target.value)}>
                          {CC_INTERVAL_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                    <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 10 }}>
                      Record Keep Time <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1">
                      <FormControl size="small" fullWidth>
                        <Select value={recordKeepTime} onChange={(e) => setRecordKeepTime(e.target.value)}>
                          {RECORD_KEEP_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                    <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 10 }}>
                      Through <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1">
                      <FormControl size="small" fullWidth>
                        <Select value={through} onChange={(e) => setThrough(e.target.value)}>
                          {THROUGH_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                    <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 10 }}>
                      Enable <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1">
                      <FormControl size="small" fullWidth>
                        <Select value={enabled} onChange={(e) => setEnabled(e.target.value)}>
                          {ENABLE_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] text-gray-700 font-medium">
                    Member Extensions
                  </label>

                  <div className="grid grid-cols-[1fr_48px_1fr_48px] gap-3 items-start">
                    <div>
                      <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Available</div>
                      <select
                        multiple
                        value={availableSelected}
                        onChange={(e) => setAvailableSelected(Array.from(e.target.selectedOptions, (option) => option.value))}
                        className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                      >
                        {loading.extensions ? (
                          <option>Loading extensions...</option>
                        ) : availableList.length === 0 ? (
                          <option disabled>No extensions</option>
                        ) : (
                          availableList.map((item) => (
                            <option key={item.extension} value={item.extension}>{item.label}</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 pt-7">
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={addSelectedExtensions}>&gt;</button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={addAllExtensions}>&gt;&gt;</button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={removeSelectedExtensions}>&lt;</button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={removeAllExtensions}>&lt;&lt;</button>
                    </div>

                    <div>
                      <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Selected</div>
                      <select
                        multiple
                        value={chosenSelected}
                        onChange={(e) => setChosenSelected(Array.from(e.target.selectedOptions, (option) => option.value))}
                        className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                      >
                        {selectedExtensions.length === 0 ? (
                          <option disabled>No selected extensions</option>
                        ) : (
                          selectedExtensions.map((ext) => (
                            <option key={ext} value={ext}>{getExtensionLabel(ext)}</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 pt-7">
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={removeSelectedExtensions}>&lt;</button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={addSelectedExtensions}>&gt;</button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={removeAllExtensions}>v</button>
                      <button type="button" className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]" onClick={addAllExtensions}>^</button>
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

export default CCRoutePage;
