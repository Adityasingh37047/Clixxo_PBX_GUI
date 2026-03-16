import React, { useState, useRef, useEffect } from 'react';
import { FILTERING_RULE_COLUMNS, FILTERING_RULE_DROPDOWN_OPTIONS } from '../constants/FilteringRuleConstants';
import { listFinalNumberFilter, createFinalNumberFilter, deleteFinalNumberFilter, fetchAllNumberFilters, listNumberPool } from '../api/apiService';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select as MuiSelect, MenuItem, Alert } from '@mui/material';
import EditDocumentIcon from '@mui/icons-material/EditDocument';

const MIN_ROWS = 14;
const initialForm = {
  id: 0,
  callerIdWhitelist: 'none',
  calleeIdWhitelist: 'none',
  callerIdBlacklist: 'none',
  calleeIdBlacklist: 'none',
  callerIdPoolWhitelist: 'none',
  callerIdPoolBlacklist: 'none',
  calleeIdPoolWhitelist: 'none',
  calleeIdPoolBlacklist: 'none',
  originalCallerIdPoolWhitelist: 'none',
  originalCallerIdPoolBlacklist: 'none',
};

// Custom scrollbar styles
const customScrollbarRowStyle = {
  width: '100%', 
  margin: '0 auto', 
  background: '#f4f6fa', 
  display: 'flex', 
  alignItems: 'center', 
  height: 24, 
  borderBottomLeftRadius: 8, 
  borderBottomRightRadius: 8, 
  borderTop: '1px solid #bbb', 
  borderLeft: '2px solid #888',
  borderRight: '2px solid #888',
  borderBottom: '2px solid #888',
  padding: '0 4px', 
  boxSizing: 'border-box'
};

const customScrollbarTrackStyle = {
  flex: 1, 
  height: 12, 
  background: '#e3e7ef', 
  borderRadius: 8, 
  position: 'relative', 
  margin: '0 4px', 
  overflow: 'hidden'
};

const customScrollbarThumbStyle = {
  position: 'absolute', 
  height: 12, 
  background: '#888', 
  borderRadius: 8, 
  cursor: 'pointer', 
  top: 0
};

const customScrollbarArrowStyle = {
  width: 18, 
  height: 18, 
  background: '#e3e7ef', 
  border: '1px solid #bbb', 
  borderRadius: 8, 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  fontSize: 16, 
  color: '#888', 
  cursor: 'pointer', 
  userSelect: 'none'
};

const FilteringRule = () => {
  const [rows, setRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [groupOptions, setGroupOptions] = useState({
    wlCaller: ['none'],
    wlCallee: ['none'],
    blCaller: ['none'],
    blCallee: ['none'],
    poolGroups: ['none']
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const displayToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Custom scrollbar state
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, width: 0, scrollWidth: 0 });

  useEffect(() => {
    const el = tableScrollRef.current;
    if (el) {
      setScrollState({ left: el.scrollLeft, width: el.clientWidth, scrollWidth: el.scrollWidth });
    }
  }, [rows.length]);

  const handleTableScroll = (e) => {
    setScrollState({
      left: e.target.scrollLeft,
      width: e.target.clientWidth,
      scrollWidth: e.target.scrollWidth,
    });
  };

  const handleScrollbarDrag = (e) => {
    const track = e.target.parentNode;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newScrollLeft = (scrollState.scrollWidth - scrollState.width) * percent;
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = newScrollLeft;
    }
  };

  const handleArrowClick = (dir) => {
    if (tableScrollRef.current) {
      const delta = dir === 'left' ? -100 : 100;
      tableScrollRef.current.scrollLeft += delta;
    }
  };

  // Custom scrollbar thumb calculations
  const thumbWidth = scrollState.width && scrollState.scrollWidth
    ? Math.max(40, (scrollState.width / scrollState.scrollWidth) * (scrollState.width - 8))
    : 40;
  const thumbLeft = scrollState.width && scrollState.scrollWidth && scrollState.scrollWidth > scrollState.width
    ? ((scrollState.left / (scrollState.scrollWidth - scrollState.width)) * (scrollState.width - thumbWidth - 16))
    : 0;

  const openModal = (rowIdx = null) => {
    setEditIndex(rowIdx);
    if (rowIdx !== null) {
      setForm(rows[rowIdx]);
    } else {
      setForm(initialForm);
    }
    setModalOpen(true);
  };
  // Load dropdown group options from whitelist/blacklist/number pool
  const loadGroupOptions = async () => {
    try {
      const [filtersRes, poolRes] = await Promise.all([
        fetchAllNumberFilters().catch(() => ({ success: false, data: [] })),
        listNumberPool().catch(() => ({}))
      ]);

      const data = (filtersRes && filtersRes.data) ? filtersRes.data : [];
      const unique = (arr) => Array.from(new Set(arr)).sort((a,b)=>Number(a)-Number(b));
      const wlCaller = unique(
        data.filter(i => i.type === 'whitelist' && i.caller_id !== null && i.group !== undefined)
            .map(i => String(i.group))
      );
      const wlCallee = unique(
        data.filter(i => i.type === 'whitelist' && i.callee_id !== null && i.group !== undefined)
            .map(i => String(i.group))
      );
      const blCaller = unique(
        data.filter(i => i.type === 'blacklist' && i.caller_id !== null && i.group !== undefined)
            .map(i => String(i.group))
      );
      const blCallee = unique(
        data.filter(i => i.type === 'blacklist' && i.callee_id !== null && i.group !== undefined)
            .map(i => String(i.group))
      );

      const poolArray = poolRes?.data || poolRes?.message || [];
      const poolGroups = unique(
        Array.isArray(poolArray) ? poolArray.map(e => e?.group ?? e?.group_no ?? e?.groupNo).filter(v => v !== undefined).map(String) : []
      );

      setGroupOptions({
        wlCaller: wlCaller.length ? wlCaller : ['none'],
        wlCallee: wlCallee.length ? wlCallee : ['none'],
        blCaller: blCaller.length ? blCaller : ['none'],
        blCallee: blCallee.length ? blCallee : ['none'],
        poolGroups: poolGroups.length ? poolGroups : ['none']
      });
    } catch (e) {
      setGroupOptions({ wlCaller: ['none'], wlCallee: ['none'], blCaller: ['none'], blCallee: ['none'], poolGroups: ['none'] });
    }
  };

  useEffect(() => { loadGroupOptions(); }, []);


  const closeModal = () => {
    setModalOpen(false);
    setEditIndex(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      caller_id_white_list: String(form.callerIdWhitelist),
      callee_id_white_list: String(form.calleeIdWhitelist),
      caller_id_black_list: String(form.callerIdBlacklist),
      callee_id_black_list: String(form.calleeIdBlacklist),
      caller_id_pool_in_white_list: String(form.callerIdPoolWhitelist),
      callee_id_pool_in_white_list: String(form.calleeIdPoolWhitelist),
      caller_id_pool_in_black_list: String(form.callerIdPoolBlacklist),
      callee_id_pool_in_black_list: String(form.calleeIdPoolBlacklist),
      original_caller_id_pool_in_white_list: String(form.originalCallerIdPoolWhitelist),
      original_caller_id_pool_in_black_list: String(form.originalCallerIdPoolBlacklist)
    };
    try {
      await createFinalNumberFilter(payload);
      await loadRows();
      closeModal();
    } catch (e) {
      console.error('Failed to save filtering rule', e);
    }
  };

  const handleCheck = (idx) => {
    setRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, checked: !row.checked } : row))
    );
  };

  const handleDelete = async () => {
    const toDelete = rows.filter(r => r.checked).map(r => r.id);
    if (toDelete.length === 0) return;
    const confirmed = window.confirm(`Are you sure you want to delete ${toDelete.length} selected item(s)?`);
    if (!confirmed) return;
    for (const id of toDelete) {
      await deleteFinalNumberFilter(id);
    }
    await loadRows();
    displayToast(`Deleted ${toDelete.length} item(s) successfully.`, 'success');
  };

  const handleClearAll = async () => {
    if (rows.length === 0) return;
    const confirmed = window.confirm(`Are you sure you want to delete ALL ${rows.length} item(s)?`);
    if (!confirmed) return;
    const ids = rows.map(r => r.id).filter(Boolean);
    for (const id of ids) {
      await deleteFinalNumberFilter(id);
    }
    await loadRows();
    displayToast(`Cleared all ${ids.length} item(s) successfully.`, 'success');
  };

  const loadRows = async () => {
    try {
      const res = await listFinalNumberFilter();
      if (res?.response && Array.isArray(res.message)) {
        const mapped = res.message.map(item => ({
          id: item.id,
          callerIdWhitelist: item.caller_id_white_list,
          calleeIdWhitelist: item.callee_id_white_list,
          callerIdBlacklist: item.caller_id_black_list,
          calleeIdBlacklist: item.callee_id_black_list,
          callerIdPoolWhitelist: item.caller_id_pool_in_white_list,
          callerIdPoolBlacklist: item.caller_id_pool_in_black_list,
          calleeIdPoolWhitelist: item.callee_id_pool_in_white_list,
          calleeIdPoolBlacklist: item.callee_id_pool_in_black_list,
          originalCallerIdPoolWhitelist: item.original_caller_id_pool_in_white_list,
          originalCallerIdPoolBlacklist: item.original_caller_id_pool_in_black_list,
        }));
        setRows(mapped);
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error('Failed to load filtering rules', e);
      setRows([]);
    }
  };

  useEffect(() => { loadRows(); }, []);

  // Fill up to MIN_ROWS for grid look
  const displayRows = [
    ...rows,
    ...Array.from({ length: Math.max(0, MIN_ROWS - rows.length) }).map(() => null),
  ];

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] p-2 md:p-0">
      <div className="w-full mx-auto">
          <div className="bg-gray-200 w-full flex flex-col">
            <div className="w-full bg-gradient-to-b from-[#b3e0ff] to-[#3d92d0] text-[#222] font-semibold text-lg text-center py-1">Filtering Rule</div>
            <div 
              ref={tableScrollRef}
              onScroll={handleTableScroll}
              className="overflow-x-auto w-full border-l-2 border-r-2 border-b-2 border-gray-400 custom-horizontal-scroll" 
              style={{ height: 400, maxHeight: 400, scrollbarWidth: 'none', msOverflowStyle: 'none', overflowY: 'auto' }}
            >
              <table className="w-full border-collapse table-auto whitespace-nowrap" style={{ minWidth: '1800px' }}>
                <thead>
                  <tr>
                    {FILTERING_RULE_COLUMNS.map((col) => (
                      <th key={col.key} className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 text-center" style={{ padding: '6px 8px', height: 32, 
                        minWidth: col.key === 'description' ? '180px' :
                                  (col.key === 'callerIdPoolWhitelist' || col.key === 'callerIdPoolBlacklist' ||
                                   col.key === 'calleeIdPoolWhitelist' || col.key === 'calleeIdPoolBlacklist' ||
                                   col.key === 'originalCallerIdPoolWhitelist' || col.key === 'originalCallerIdPoolBlacklist') ? '160px' :
                                  (col.key === 'callerIdWhitelist' || col.key === 'calleeIdWhitelist' ||
                                   col.key === 'callerIdBlacklist' || col.key === 'calleeIdBlacklist') ? '140px' :
                                  col.key === 'modify' ? '100px' : '100px'
                      }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row, idx) =>
                    row ? (
                      <tr key={idx} style={{ borderBottom: '1px solid #bbb', height: 32 }}>
                        {FILTERING_RULE_COLUMNS.map((col) => (
                          <td key={col.key} className="border border-gray-400 text-center bg-white" style={{ padding: '6px 8px', height: 32 }}>
                            {col.key === 'check' ? (
                              <input type="checkbox" checked={!!row.checked} onChange={() => handleCheck(idx)} className="w-4 h-4" />
                            ) : col.key === 'modify' ? (
                              <EditDocumentIcon style={{ color: '#0e8fd6', cursor: 'pointer', margin: '0 auto' }} onClick={() => openModal(idx)} />
                            ) : (
                              <span className="text-xs">{row[col.key]}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ) : (
                      <tr key={idx} style={{ borderBottom: '1px solid #bbb', background: '#fff', height: 32 }}>
                        {FILTERING_RULE_COLUMNS.map((col) => (
                          <td key={col.key} className="border border-gray-400 text-center bg-white" style={{ color: '#aaa', padding: '6px 8px', height: 32 }}>
                            {'\u00A0'}
                          </td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
            {/* Custom scrollbar row */}
            <div style={customScrollbarRowStyle}>
              <div style={customScrollbarArrowStyle} onClick={() => handleArrowClick('left')}>&#9664;</div>
              <div
                style={customScrollbarTrackStyle}
                onClick={handleScrollbarDrag}
              >
                <div
                  style={{
                    ...customScrollbarThumbStyle,
                    width: thumbWidth,
                    left: thumbLeft,
                  }}
                  draggable
                  onDrag={handleScrollbarDrag}
                />
              </div>
              <div style={customScrollbarArrowStyle} onClick={() => handleArrowClick('right')}>&#9654;</div>
            </div>
          </div>
          {/* hide native scrollbar for webkit */}
          <style>{`.custom-horizontal-scroll::-webkit-scrollbar{display:none;}`}</style>
          <div className="flex justify-between items-center bg-gray-300 rounded-b-lg px-1 py-0.5 mt-1 border-l-2 border-r-2 border-b-2 border-gray-400">
            <div className="flex gap-1">
              <button className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400" onClick={handleDelete} disabled={!rows.some(r => r.checked)}>Delete</button>
              <button className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500" onClick={handleClearAll}>Clear All</button>
            </div>
            <button className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500" onClick={() => openModal()}>Add New</button>
          </div>
        {/* Modal */}
        <Dialog open={modalOpen} onClose={closeModal} maxWidth={false} PaperProps={{ sx: { maxWidth: '95vw', width: 420, background: '#f4f6fa', borderRadius: 2, border: '1.5px solid #888' } }}>
          <DialogTitle className="bg-gray-600 text-white text-center font-semibold text-lg">Filtering Rule</DialogTitle>
          <DialogContent className="bg-gray-200 flex flex-col gap-3 py-4">
            <div className="flex flex-row items-center border border-gray-400 rounded px-2 py-1 gap-2 w-full bg-white">
              <label className="text-xs text-gray-700 font-medium whitespace-nowrap text-left min-w-[160px] mr-2">No.:</label>
              <div className="flex-1 min-w-0">
                <TextField name="id" value={form.id} onChange={handleFormChange} size="small" fullWidth sx={{ '& .MuiInputBase-input': { fontSize: '12px' } }} />
              </div>
            </div>
            {[
              { key: 'callerIdWhitelist', label: 'CallerID Whitelist:', options: groupOptions.wlCaller },
              { key: 'calleeIdWhitelist', label: 'CalleeID Whitelist:', options: groupOptions.wlCallee },
              { key: 'callerIdBlacklist', label: 'CallerID Blacklist:', options: groupOptions.blCaller },
              { key: 'calleeIdBlacklist', label: 'CalleeID Blacklist:', options: groupOptions.blCallee },
              { key: 'callerIdPoolWhitelist', label: 'CallerID Pool in Whitelist:', options: groupOptions.poolGroups },
              { key: 'callerIdPoolBlacklist', label: 'CallerID Pool in Blacklist:', options: groupOptions.poolGroups },
              { key: 'calleeIdPoolWhitelist', label: 'CalleeID Pool in Whitelist:', options: groupOptions.poolGroups },
              { key: 'calleeIdPoolBlacklist', label: 'CalleeID Pool in Blacklist:', options: groupOptions.poolGroups },
              { key: 'originalCallerIdPoolWhitelist', label: 'Original CallerID Pool in Whitelist:', options: groupOptions.poolGroups },
              { key: 'originalCallerIdPoolBlacklist', label: 'Original CallerID Pool in Blacklist:', options: groupOptions.poolGroups },
            ].map(field => (
              <div key={field.key} className="flex flex-row items-center border border-gray-400 rounded px-2 py-1 gap-2 w-full bg-white">
                <label className="text-xs text-gray-700 font-medium whitespace-nowrap text-left min-w-[160px] mr-2">{field.label}</label>
                <div className="flex-1 min-w-0">
                  <MuiSelect name={field.key} value={form[field.key] || 'none'} onChange={handleFormChange} size="small" fullWidth sx={{ fontSize: '12px' }}>
                    {[ 'none', ...Array.from(new Set((field.options || []).filter(o => o !== 'none'))) ].map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '12px' }}>{opt}</MenuItem>
                    ))}
                  </MuiSelect>
                </div>
              </div>
            ))}
            {/* Description removed as per requirement */}
          </DialogContent>
          <DialogActions className="flex justify-center gap-6 pb-4">
            <button className="bg-gradient-to-b from-[#9ca3af] to-[#6b7280] text-white font-semibold text-xs rounded px-3 py-1 min-w-[100px] shadow hover:from-[#6b7280] hover:to-[#9ca3af]" onClick={handleSave}>Save</button>
            <button className="bg-gradient-to-b from-[#d1d5db] to-[#9ca3af] text-[#111827] font-semibold text-xs rounded px-3 py-1 min-w-[100px] shadow hover:from-[#9ca3af] hover:to-[#d1d5db]" onClick={closeModal}>Close</button>
          </DialogActions>
        </Dialog>
      </div>
      {showToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-[90vw] sm:w-auto">
          <Alert 
            severity={toastType} 
            onClose={() => setShowToast(false)}
            sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px' }}
          >
            {toastMessage}
          </Alert>
        </div>
      )}
    </div>
  );
};

export default FilteringRule; 
