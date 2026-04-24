import React, { useState, useEffect, useRef } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Select, MenuItem, FormControl } from '@mui/material';
import { fetchBlockedList, createBlockedEntry, updateBlockedEntry, deleteBlockedEntry, listConferenceExtensions } from '../api/apiService';

const BlockedListPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({ fetch: false, delete: false, save: false });
  const hasInitialLoadRef = useRef(false);

  // Add/Edit modal state
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [matchMode, setMatchMode] = useState('Exact Match');
  const [blockedNumber, setBlockedNumber] = useState('');
  const [selectedExtension, setSelectedExtension] = useState('');
  const [direction, setDirection] = useState('Inbound');
  const [enabled, setEnabled] = useState('Yes');
  const [availableExtensions, setAvailableExtensions] = useState([]);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const showAlert = (text) => { window.alert(text); };

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

  const loadRows = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const res = await fetchBlockedList();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      setRows(list.map(item => ({
        id: item.id,
        name: item.name || '',
        matchMode: item.match_mode === 'regex' ? 'Regex Match' : item.match_mode === 'extension' ? 'Extension' : 'Exact Match',
        blockedNumber: item.pattern || '',
        direction: (() => {
          const d = (item.direction || '').toLowerCase();
          if (d === 'outbound') return 'Outbound';
          if (d === 'internal') return 'Internal';
          return 'Inbound';
        })(),
        enabled: item.enabled === false || item.enabled === 'no' ? 'No' : 'Yes',
      })));
    } catch (err) {
      showAlert(err?.message || 'Failed to load blocked list.');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const loadAvailableExtensions = async () => {
    try {
      const extRes = await listConferenceExtensions();
      const extRaw = Array.isArray(extRes?.message) ? extRes.message : Array.isArray(extRes?.data) ? extRes.data : [];
      const extList = extRaw
        .filter((e) => e && e.extension)
        .map((e) => ({
          value: String(e.extension),
          label: e.display_name ? `${e.display_name} (${e.extension})` : String(e.extension),
        }));
      setAvailableExtensions(extList);
    } catch (err) {
      console.error('Failed to load extensions for blocked list:', err);
      setAvailableExtensions([]);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadRows();
      loadAvailableExtensions();
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
      await Promise.all(ids.map(id => deleteBlockedEntry(id)));
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
    setMatchMode('Exact Match');
    setBlockedNumber('');
    setSelectedExtension('');
    setDirection('Inbound');
    setEnabled('Yes');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (row) => {
    setEditId(row.id);
    setName(row.name || '');
    setMatchMode(row.matchMode || 'Exact Match');
    setBlockedNumber(row.blockedNumber || '');
    setSelectedExtension(row.matchMode === 'Extension' ? (row.blockedNumber || '') : '');
    setDirection(row.direction || 'Inbound');
    setEnabled(row.enabled || 'Yes');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedNumber = blockedNumber.trim();
    const valueToBlock = matchMode === 'Extension' ? String(selectedExtension || '').trim() : trimmedNumber;
    if (!trimmedName) {
      showAlert('Please enter a Name.');
      return;
    }
    if (!valueToBlock) {
      showAlert(matchMode === 'Extension' ? 'Please select an Extension.' : 'Please enter a Blocked List Number.');
      return;
    }
    const apiPayload = {
      name: trimmedName,
      match_mode: matchMode === 'Regex Match' ? 'regex' : matchMode === 'Extension' ? 'extension' : 'exact',
      pattern: valueToBlock,
      direction: (() => {
        const d = direction.toLowerCase();
        if (d === 'outbound') return 'outbound';
        if (d === 'internal') return 'internal';
        return 'inbound';
      })(),
      enabled: enabled === 'Yes' ? true : false,
    };

    setLoading(prev => ({ ...prev, save: true }));
    try {
      if (editId != null) {
        await updateBlockedEntry({ id: editId, ...apiPayload });
        showAlert('Blocked entry updated.');
      } else {
        await createBlockedEntry(apiPayload);
        showAlert('Blocked entry created.');
      }
      await loadRows();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || 'Failed to save.');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
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
          Import Blocked List
        </DialogTitle>
        <DialogContent style={{ backgroundColor: '#dde0e4', padding: '20px 24px 12px' }}>
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-[13px] text-gray-600">Select a CSV or JSON file containing blocked list data to import.</p>
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
          <span>Blocked List</span>
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
          <table className="w-full min-w-[800px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
            <thead>
              <tr>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center"></th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center">#</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Name</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Match Mode</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Blocked List Number</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Direction</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Enable</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading.fetch ? (
                <tr>
                  <td colSpan={8} className="border border-gray-300 px-2 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <CircularProgress size={20} />
                      <span>Loading blocked list...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                    No blocked numbers yet. Click &quot;Add New&quot; to create one.
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
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.matchMode}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.blockedNumber}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.direction}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.enabled}</td>
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

      {/* Add / Edit Blocked Entry Modal */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: { width: 620, maxWidth: '95vw', mx: 'auto', p: 0 }
        }}
      >
        <DialogTitle
          className="text-white text-center font-semibold p-2 text-base"
          style={{
            background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
            borderBottom: '1px solid #444444'
          }}
        >
          {editId != null ? 'Edit Blocked Entry' : 'Add Blocked Entry'}
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
                Block Settings
              </div>
              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                  <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 180, marginRight: 10 }}>
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
                  <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 180, marginRight: 10 }}>
                    Match Mode:
                  </label>
                  <div className="flex-1">
                    <FormControl size="small" fullWidth>
                      <Select
                        value={matchMode}
                        onChange={e => {
                          const nextMode = e.target.value;
                          setMatchMode(nextMode);
                          if (nextMode === 'Extension') {
                            setBlockedNumber('');
                          } else {
                            setSelectedExtension('');
                          }
                        }}
                      >
                        <MenuItem value="Exact Match">Exact Match</MenuItem>
                        <MenuItem value="Regex Match">Regex Match</MenuItem>
                        <MenuItem value="Extension">Extension</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
                {matchMode === 'Extension' ? (
                  <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                    <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 180, marginRight: 10 }}>
                      Extension:
                    </label>
                    <div className="flex-1">
                      <FormControl size="small" fullWidth>
                        <Select
                          value={selectedExtension}
                          onChange={e => setSelectedExtension(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">
                            <span className="text-gray-500">Select Extension</span>
                          </MenuItem>
                          {availableExtensions.map((ext) => (
                            <MenuItem key={ext.value} value={ext.value}>
                              {ext.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                    <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 180, marginRight: 10 }}>
                      Blocked List Number:
                    </label>
                    <div className="flex-1">
                      <TextField
                        fullWidth
                        value={blockedNumber}
                        onChange={e => setBlockedNumber(e.target.value)}
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
                )}
                <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                  <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 180, marginRight: 10 }}>
                    Blocked List Direction:
                  </label>
                  <div className="flex-1">
                    <FormControl size="small" fullWidth>
                      <Select
                        value={direction}
                        onChange={e => setDirection(e.target.value)}
                      >
                        <MenuItem value="Inbound">Inbound</MenuItem>
                        <MenuItem value="Outbound">Outbound</MenuItem>
                        <MenuItem value="Internal">Internal</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ minHeight: 32 }}>
                  <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 180, marginRight: 10 }}>
                    Enable:
                  </label>
                  <div className="flex-1">
                    <FormControl size="small" fullWidth>
                      <Select
                        value={enabled}
                        onChange={e => setEnabled(e.target.value)}
                      >
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
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

export default BlockedListPage;

