import React, { useState, useEffect, useRef } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Select, MenuItem, FormControl } from '@mui/material';
import { fetchSipAccounts, listTrunkIds, fetchCallbackRules, createCallbackRule, updateCallbackRule, deleteCallbackRule } from '../api/apiService';

const CallBackPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({ fetch: false, delete: false, save: false, extensions: false });
  const hasInitialLoadRef = useRef(false);

  // Add/Edit modal state
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [delay, setDelay] = useState('10');
  const [strip, setStrip] = useState('');
  const [prepend, setPrepend] = useState('');
  const [destination, setDestination] = useState('');
  const [throughAuto, setThroughAuto] = useState(true);
  const [throughFromComeIn, setThroughFromComeIn] = useState(false);
  const [throughSelect, setThroughSelect] = useState(false);
  const [extensionOptions, setExtensionOptions] = useState([]);
  const [trunkOptions, setTrunkOptions] = useState([]);
  const orderOptions = Array.from({ length: 21 }, (_, i) => i * 5); // 0,5,...100

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const showAlert = (text) => { window.alert(text); };

  const loadRows = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const res = await fetchCallbackRules();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      setRows(list.map(item => ({
        id: item.id,
        name: item.name || '',
        delay: item.delay_sec != null ? String(item.delay_sec) : '10',
        strip: item.strip_digits != null ? String(item.strip_digits) : '',
        prepend: item.prepend || '',
        destination: item.destination || '',
        throughAuto: item.through_mode === 'auto',
        throughFromComeIn: item.through_mode === 'from_in',
        throughSelect: item.through_mode === 'select',
      })));
    } catch (err) {
      showAlert(err?.message || 'Failed to load callbacks.');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const loadExtensions = async () => {
    setLoading(prev => ({ ...prev, extensions: true }));
    try {
      const res = await fetchSipAccounts();
      const list = Array.isArray(res?.message) ? res.message : Array.isArray(res) ? res : [];
      const exts = list
        .map(item => String(item.extension ?? ''))
        .filter(x => x)
        .sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
      setExtensionOptions(exts);
    } catch (err) {
      showAlert(err?.message || 'Failed to load extensions.');
      setExtensionOptions([]);
    } finally {
      setLoading(prev => ({ ...prev, extensions: false }));
    }
  };

  const loadTrunks = async () => {
    try {
      const res = await listTrunkIds();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      const trunks = list
        .map(t => t?.trunk_id || t?.id || t)
        .filter(Boolean)
        .map(String);
      setTrunkOptions(trunks);
    } catch (err) {
      console.error('Failed to load trunk IDs for callback:', err);
      setTrunkOptions([]);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadRows();
    }
  }, []);

  const handleCheckAll = () => setSelected(rows.map((_, i) => i));
  const handleUncheckAll = () => setSelected([]);
  const handleSelectRow = (idx) => {
    setSelected(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert('Please select at least one row to delete.');
      return;
    }
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const ids = selected.map(i => rows[i]?.id).filter(Boolean);
      await Promise.all(ids.map(id => deleteCallbackRule(id)));
      setSelected([]);
      await loadRows();
      showAlert(`Deleted ${ids.length} item(s).`);
    } catch (err) {
      showAlert(err?.message || 'Failed to delete.');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setDelay('10');
    setStrip('');
    setPrepend('');
    setDestination('');
    setThroughAuto(true);
    setThroughFromComeIn(false);
    setThroughSelect(false);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    await Promise.all([loadExtensions(), loadTrunks()]);
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || '');
    setDelay(row.delay ?? '');
    setStrip(row.strip ?? '');
    setPrepend(row.prepend ?? '');
    setDestination(row.destination || '');
    setThroughAuto(!!row.throughAuto);
    setThroughFromComeIn(!!row.throughFromComeIn);
    setThroughSelect(!!row.throughSelect);
    setShowModal(true);
    await Promise.all([loadExtensions(), loadTrunks()]);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showAlert('Please enter a Name.');
      return;
    }
    if (!delay) {
      showAlert('Please enter Delay (s).');
      return;
    }
    if (!destination) {
      showAlert('Please select Destination.');
      return;
    }
    const delaySec = Number(delay) || 0;
    const stripDigits = strip === '' ? 0 : Number(strip) || 0;
    let through_mode = 'auto';
    if (throughSelect) {
      through_mode = 'select';
    } else if (throughFromComeIn) {
      through_mode = 'from_in';
    }
    const apiPayload = {
      name: trimmedName,
      delay_sec: delaySec,
      strip_digits: stripDigits,
      prepend,
      destination,
      through_mode,
      enabled: true,
      // Trunks will be filled when UI is added; for now send empty
      trunks: [],
    };

    setLoading(prev => ({ ...prev, save: true }));
    try {
      if (editId != null) {
        await updateCallbackRule({ id: editId, ...apiPayload });
        showAlert('Callback updated.');
      } else {
        await createCallbackRule(apiPayload);
        showAlert('Callback created.');
      }
      await loadRows();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || 'Failed to save.');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const renderThrough = (row) => {
    const labels = [];
    if (row.throughAuto) labels.push('Auto');
    if (row.throughFromComeIn) labels.push('From Come in');
    if (row.throughSelect) labels.push('Select');
    return labels.join(', ') || 'Auto';
  };

  return (
    <div className="w-full max-w-full mx-auto p-2">
      <div className="w-full max-w-full mx-auto">
        <div
          className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{ background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)' }}
        >
          CallBack
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
            <thead>
              <tr>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center"></th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center">#</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Name</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Delay (s)</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Strip</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Prepend</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Destination</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Through</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading.fetch ? (
                <tr>
                  <td colSpan={9} className="border border-gray-300 px-2 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <CircularProgress size={20} />
                      <span>Loading callbacks...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                    No callbacks yet. Click &quot;Add New&quot; to create one.
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
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.delay}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.strip}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.prepend}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.destination}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{renderThrough(row)}</td>
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
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
            <select className="text-xs rounded border border-gray-300 px-1 py-0.5 min-w-[40px]" value={page} onChange={e => setPage(Number(e.target.value))}>
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <span>{totalPages} Pages Total</span>
          </div>
        )}
      </div>

      {/* Add / Edit Callback Modal */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: { width: 650, maxWidth: '95vw', mx: 'auto', p: 0 }
        }}
      >
        <DialogTitle
          className="text-white text-center font-semibold p-2 text-base"
          style={{
            background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
            borderBottom: '1px solid #444444'
          }}
        >
          {editId != null ? 'Edit CallBack' : 'Add CallBack'}
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
                CallBack Settings
              </div>
              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                  <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 200, marginRight: 10 }}>
                    Name:
                  </label>
                  <div className="flex-1">
                    <TextField
                      fullWidth
                      value={name}
                      onChange={e => setName(e.target.value)}
                      size="small"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          padding: '8px 12px',
                          fontSize: 14,
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                  <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 200, marginRight: 10 }}>
                    Delay (s):
                  </label>
                  <div className="flex-1">
                    <TextField
                      fullWidth
                      type="number"
                      value={delay}
                      onChange={e => setDelay(e.target.value)}
                      size="small"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          padding: '8px 12px',
                          fontSize: 14,
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                  <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 200, marginRight: 10 }}>
                    Strip:
                  </label>
                  <div className="flex-1">
                    <TextField
                      fullWidth
                      value={strip}
                      onChange={e => setStrip(e.target.value)}
                      size="small"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          padding: '8px 12px',
                          fontSize: 14,
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                  <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 200, marginRight: 10 }}>
                    Prepend:
                  </label>
                  <div className="flex-1">
                    <TextField
                      fullWidth
                      value={prepend}
                      onChange={e => setPrepend(e.target.value)}
                      size="small"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          padding: '8px 12px',
                          fontSize: 14,
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                  <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 200, marginRight: 10 }}>
                    Destination:
                  </label>
                  <div className="flex-1">
                    <FormControl size="small" fullWidth>
                      <Select
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                        displayEmpty
                        renderValue={(value) => {
                          if (!value) {
                            return 'Select Destination';
                          }
                          return value;
                        }}
                      >
                        {extensionOptions.length === 0 ? (
                          <MenuItem value="">
                            {loading.extensions ? 'Loading extensions...' : 'No extensions'}
                          </MenuItem>
                        ) : (
                          <>
                            <MenuItem value="">
                              Select Destination
                            </MenuItem>
                            {extensionOptions.map(ext => (
                              <MenuItem key={ext} value={ext}>{ext}</MenuItem>
                            ))}
                          </>
                        )}
                      </Select>
                    </FormControl>
                  </div>
                </div>
                <div className="flex items-start gap-2" style={{ minHeight: 32 }}>
                  <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 200, marginRight: 10, marginTop: 4 }}>
                    Through:
                  </label>
                  <div className="flex-1 flex flex-col gap-2 text-[14px] text-gray-700">
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="throughMode"
                          checked={throughAuto && !throughFromComeIn && !throughSelect}
                          onChange={() => {
                            setThroughAuto(true);
                            setThroughFromComeIn(false);
                            setThroughSelect(false);
                          }}
                        />
                        <span>Auto</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="throughMode"
                          checked={throughFromComeIn}
                          onChange={() => {
                            setThroughAuto(false);
                            setThroughFromComeIn(true);
                            setThroughSelect(false);
                          }}
                        />
                        <span>From come in</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="throughMode"
                          checked={throughSelect}
                          onChange={() => {
                            setThroughAuto(false);
                            setThroughFromComeIn(false);
                            setThroughSelect(true);
                          }}
                        />
                        <span>Select</span>
                      </label>
                    </div>
                    {throughSelect && (
                      <div className="w-full mt-2">
                        <div className="flex items-center mb-1 text-[13px] text-gray-700 font-medium">
                          <span className="flex-1">Trunk</span>
                          <span style={{ width: 80, textAlign: 'center' }}>Order</span>
                        </div>
                        {[0, 1, 2, 3, 4].map((idx) => (
                          <div key={idx} className="flex items-center gap-2 mb-1">
                            <div className="flex-1">
                              <FormControl size="small" fullWidth>
                                <Select
                                  value={''}
                                  displayEmpty
                                >
                                  <MenuItem value="">
                                    {trunkOptions.length ? 'Select trunk' : 'No trunks'}
                                  </MenuItem>
                                  {trunkOptions.map(t => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </div>
                            <div style={{ width: 80 }}>
                              <FormControl size="small" fullWidth>
                                <Select
                                  value={0}
                                >
                                  {orderOptions.map(val => (
                                    <MenuItem key={val} value={val}>{val}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

export default CallBackPage;

