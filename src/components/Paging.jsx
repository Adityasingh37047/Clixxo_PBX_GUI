import React, { useEffect, useMemo, useRef, useState } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Select } from '@mui/material';
import { createPagingGroup, deletePagingGroup, fetchSipAccounts, listPagingGroups, updatePagingGroup } from '../api/apiService';

const PAGING_ITEMS_PER_PAGE = 20;
const PAGING_TYPE_OPTIONS = ['one-way', 'two-way'];

const Paging = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({ save: false, delete: false, extensions: false, list: false });
  const hasLoadedExtensionsRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [pagingType, setPagingType] = useState('one-way');
  const [callerIdNamePrefix, setCallerIdNamePrefix] = useState('');

  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGING_ITEMS_PER_PAGE));
  const pagedRows = rows.slice((page - 1) * PAGING_ITEMS_PER_PAGE, page * PAGING_ITEMS_PER_PAGE);

  useEffect(() => {
    setPage((current) => Math.min(Math.max(1, current), Math.max(1, Math.ceil(rows.length / PAGING_ITEMS_PER_PAGE))));
  }, [rows]);

  const showAlert = (text) => window.alert(text);

  const normalizePagingList = (res) => {
    const list = Array.isArray(res?.message) ? res.message : Array.isArray(res?.data) ? res.data : [];
    return list.map((g) => ({
      id: g.id,
      name: g.name || '',
      number: String(g.page_number ?? g.number ?? ''),
      type: g.type || g.page_type || g.paging_type || 'one-way',
      callerIdNamePrefix: g.cid_name_prefix || g.callerIdNamePrefix || '',
      members: Array.isArray(g.members) ? g.members.map(String) : [],
    }));
  };

  const refreshPagingGroups = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listPagingGroups();
      if (res?.response === false) {
        showAlert(res?.message || 'Failed to load paging groups.');
        setRows([]);
        return;
      }
      setRows(normalizePagingList(res));
    } catch (err) {
      showAlert(err?.message || 'Failed to load paging groups.');
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
    }
  };

  useEffect(() => {
    refreshPagingGroups();
  }, []);

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await fetchSipAccounts();
      if (res?.response === false) {
        showAlert(res?.message || 'Failed to load extensions.');
        setAvailableExtensions([]);
        return;
      }
      const sipList = Array.isArray(res?.message) ? res.message : Array.isArray(res?.data) ? res.data : [];
      const exts = sipList
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
      setAvailableExtensions(exts);
      hasLoadedExtensionsRef.current = true;
    } catch (err) {
      showAlert(err?.message || 'Failed to load extensions.');
      setAvailableExtensions([]);
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setNumber('');
    setPagingType('one-way');
    setCallerIdNamePrefix('');
    setMemberExtensions([]);
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
    setName(row.name || '');
    setNumber(row.number || '');
    setPagingType(row.type || 'one-way');
    setCallerIdNamePrefix(row.callerIdNamePrefix || '');
    setMemberExtensions(Array.isArray(row.members) ? [...row.members] : []);
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

  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((e) => map.set(e.value, e.label));
    return map;
  }, [availableExtensions]);

  const getExtLabel = (ext) => extensionLabelMap.get(ext) || ext;

  const availableList = useMemo(
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

  const handleReorderSelected = (action) => {
    if (chosenSelected.length !== 1) {
      showAlert('Select exactly one member in Selected to reorder.');
      return;
    }
    const id = chosenSelected[0];
    setMemberExtensions((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const next = [...prev];
      if (action === 'top') {
        next.splice(idx, 1);
        next.unshift(id);
      } else if (action === 'bottom') {
        next.splice(idx, 1);
        next.push(id);
      } else if (action === 'up' && idx > 0) {
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      } else if (action === 'down' && idx < next.length - 1) {
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      }
      return next;
    });
  };

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
    (async () => {
      try {
        const toDelete = rows.filter((_, idx) => selected.includes(idx));
        for (const row of toDelete) {
          if (row.id != null) {
            const res = await deletePagingGroup(row.id);
            if (res?.response === false) {
              showAlert(res?.message || 'Failed to delete paging group.');
              break;
            }
          }
        }
        setSelected([]);
        await refreshPagingGroups();
      } catch (err) {
        showAlert(err?.message || 'Failed to delete paging group(s).');
      } finally {
        setLoading((prev) => ({ ...prev, delete: false }));
      }
    })();
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedNumber = number.trim();
    if (!trimmedName) {
      showAlert('Name is required.');
      return;
    }
    if (!trimmedNumber) {
      showAlert('Number is required.');
      return;
    }
    if (!/^\d+$/.test(trimmedNumber)) {
      showAlert('Number must be numeric.');
      return;
    }
    if (!memberExtensions.length) {
      showAlert('Please select at least one Member.');
      return;
    }
    setLoading((prev) => ({ ...prev, save: true }));
    (async () => {
      try {
        if (editId != null) {
          const res = await updatePagingGroup(editId, {
            name: trimmedName,
            page_number: Number(trimmedNumber),
            pagingMode: pagingType,
            page_type: pagingType,
            paging_type: pagingType,
            cid_name_prefix: callerIdNamePrefix.trim(),
            members: memberExtensions.map(String),
          });
          if (res?.response === false) {
            showAlert(res?.message || 'Failed to update paging group.');
            return;
          }
        } else {
          const res = await createPagingGroup({
            name: trimmedName,
            page_number: Number(trimmedNumber),
            pagingMode: pagingType,
            page_type: pagingType,
            paging_type: pagingType,
            cid_name_prefix: callerIdNamePrefix.trim(),
            members: memberExtensions.map(String),
          });
          if (res?.response === false) {
            showAlert(res?.message || 'Failed to create paging group.');
            return;
          }
        }

        await refreshPagingGroups();
        setShowModal(false);
        resetForm();
      } catch (err) {
        showAlert(err?.message || 'Failed to save paging group.');
      } finally {
        setLoading((prev) => ({ ...prev, save: false }));
      }
    })();
  };

  return (
    <div className="w-full max-w-full mx-auto p-2">
      <div className="w-full max-w-full mx-auto">
        <div
          className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{ background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)' }}
        >
          Paging
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
            <thead>
              <tr>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center" />
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center">#</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Name</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Number</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Type</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">CallerID Name Prefix</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Members</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                    No paging entries yet. Click &quot;Add New&quot; to create one.
                  </td>
                </tr>
              ) : (
                pagedRows.map((row, idx) => {
                  const realIdx = (page - 1) * PAGING_ITEMS_PER_PAGE + idx;
                  return (
                    <tr key={row.id}>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input type="checkbox" checked={selected.includes(realIdx)} onChange={() => handleSelectRow(realIdx)} disabled={loading.delete} />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{realIdx + 1}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center font-medium">{row.name}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.number}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.type}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.callerIdNamePrefix || '-'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {(row.members || []).slice(0, 3).map(getExtLabel).join(', ')}
                        {(row.members || []).length > 3 ? ` +${(row.members || []).length - 3}` : ''}
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
            <span>{PAGING_ITEMS_PER_PAGE} Items/Page</span>
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
          {editId != null ? 'Edit Paging' : 'Add Paging'}
        </DialogTitle>
        <DialogContent className="pt-0 pb-0 px-0" style={{ backgroundColor: '#dde0e4', border: '1px solid #444444', borderTop: 'none' }}>
          <div className="pt-4 pb-4 px-4 bg-white">
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <div className="px-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>Name <span className="text-red-500">*</span></label>
                      <input className="border border-gray-300 rounded px-2 py-1 text-[14px] outline-none w-full max-w-[240px]" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>Number <span className="text-red-500">*</span></label>
                      <input className="border border-gray-300 rounded px-2 py-1 text-[14px] outline-none w-full max-w-[240px]" value={number} onChange={(e) => setNumber(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>Type</label>
                      <div className="w-full max-w-[240px]"><FormControl size="small" fullWidth><Select value={pagingType} onChange={(e) => setPagingType(e.target.value)}>{PAGING_TYPE_OPTIONS.map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}</Select></FormControl></div>
                    </div>
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 170, marginRight: 8 }}>CallerID Name Prefix</label>
                      <input className="border border-gray-300 rounded px-2 py-1 text-[14px] outline-none w-full max-w-[240px]" value={callerIdNamePrefix} onChange={(e) => setCallerIdNamePrefix(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-[14px] text-gray-700 font-medium mb-2">
                    Member <span className="text-red-500">*</span>
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
                        {loading.extensions ? (
                          <option>Loading extensions...</option>
                        ) : availableList.length === 0 ? (
                          <option disabled>No extensions</option>
                        ) : (
                          availableList.map((t) => (
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
                      <button type="button" className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3] flex items-center justify-center" onClick={() => handleReorderSelected('top')}><VerticalAlignTopIcon sx={{ fontSize: 18 }} /></button>
                      <button type="button" className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3] flex items-center justify-center" onClick={() => handleReorderSelected('up')}><KeyboardArrowUpIcon sx={{ fontSize: 18 }} /></button>
                      <button type="button" className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3] flex items-center justify-center" onClick={() => handleReorderSelected('down')}><KeyboardArrowDownIcon sx={{ fontSize: 18 }} /></button>
                      <button type="button" className="h-8 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3] flex items-center justify-center" onClick={() => handleReorderSelected('bottom')}><VerticalAlignBottomIcon sx={{ fontSize: 18 }} /></button>
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

export default Paging;