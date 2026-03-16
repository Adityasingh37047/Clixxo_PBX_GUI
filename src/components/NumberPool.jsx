import React, { useState, useRef, useEffect } from 'react';
import { NUMBER_POOL_COLUMNS, NUMBER_POOL_GROUPS } from '../constants/NumberPoolConstants';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select as MuiSelect, MenuItem } from '@mui/material';
import { listNumberPool, createNumberPool, updateNumberPool, deleteNumberPool } from '../api/apiService';
import EditDocumentIcon from '@mui/icons-material/EditDocument';

const tableContainerStyle = {
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  width: '100%',
  minHeight: 400,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};
const contentAreaStyle = {
  border: '2px solid #444',
  borderTop: 'none',
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  background: '#fff',
  width: '100%',
  position: 'relative',
  marginTop: 0,
  paddingTop: 0,
};
const blueBarStyle = {
  width: '100%',
  height: 32,
  background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 400,
  fontSize: 17,
  color: '#111',
  justifyContent: 'center',
  boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
  borderBottom: 'none',
};
const thStyle = {
  background: '#fff', color: '#222', fontWeight: 600, fontSize: 15, border: '1px solid #bbb', padding: '6px 8px', whiteSpace: 'nowrap', textAlign: 'center',
};
const tdStyle = {
  border: '1px solid #bbb', padding: '6px 8px', fontSize: 14, background: '#fff', textAlign: 'center', whiteSpace: 'nowrap', height: 40,
};
const emptyRowStyle = {
  ...tdStyle,
  borderBottom: '1px solid #bbb',
  background: '#fff',
  height: 40,
};
const buttonStyle = {
  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', borderRadius: 6, padding: '7px 32px', minWidth: 100, boxShadow: '0 2px 6px #0002', cursor: 'pointer', margin: '0 8px',
};
const grayButtonStyle = {
  ...buttonStyle, background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)', color: '#222',
};

const legacyModalOverlay = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const legacyModalBox = {
  background: '#f4f6fa',
  borderRadius: 6,
  boxShadow: '0 4px 24px #0005',
  minWidth: 340,
  maxWidth: '90vw',
  padding: '0 24px 18px 24px',
  border: '2px solid #222',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
};
const legacyModalHeader = {
  background: 'linear-gradient(to bottom, #3b4a56 0%, #222 100%)',
  color: '#fff',
  fontWeight: 500,
  fontSize: 16,
  padding: '10px 0 8px 0',
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  textAlign: 'center',
  margin: '-2px -24px 18px -24px',
  letterSpacing: 0.2,
};
const legacyModalLabel = { fontWeight: 500, marginBottom: 2, fontSize: 14 };
const legacyModalInput = { width: '100%', fontSize: 14, padding: '4px 8px', borderRadius: 3, border: '1px solid #bbb', background: '#fafdff', marginBottom: 10, height: 28 };
const legacyModalButtonBar = { display: 'flex', justifyContent: 'center', gap: 18, marginTop: 8 };
const legacySaveButton = { background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)', color: '#fff', fontWeight: 600, fontSize: 15, border: '1px solid #1976d2', borderRadius: 4, padding: '6px 32px', minWidth: 90, boxShadow: '0 2px 6px #0002', cursor: 'pointer' };
const legacyCloseButton = { background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)', color: '#222', fontWeight: 600, fontSize: 15, border: '1px solid #bbb', borderRadius: 4, padding: '6px 32px', minWidth: 90, boxShadow: '0 2px 6px #0002', cursor: 'pointer' };

const MIN_ROWS = 12;

const NumberPool = () => {
  const [rows, setRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ groupNo: 0, noInGroup: 0, numberRangeStart: '', numberRangeEnd: '' });
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom scrollbar state
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ top: 0, height: 0, scrollHeight: 0 });

  const handleTableScroll = (e) => {
    setScrollState({
      top: e.target.scrollTop,
      height: e.target.clientHeight,
      scrollHeight: e.target.scrollHeight,
    });
  };

  useEffect(() => {
    if (tableScrollRef.current) {
      setScrollState({
        top: tableScrollRef.current.scrollTop,
        height: tableScrollRef.current.clientHeight,
        scrollHeight: tableScrollRef.current.scrollHeight,
      });
    }
  }, [rows.length]);

  const validateNumberRange = (start, end) => {
    if (!start || !end) return '';
    
    const startDigits = start.toString().length;
    const endDigits = end.toString().length;
    
    if (startDigits !== endDigits) {
      return `Error: Start and End numbers must have the same number of digits. Start has ${startDigits} digit(s), End has ${endDigits} digit(s).`;
    }
    
    if (parseInt(start) > parseInt(end)) {
      return 'Error: Start number cannot be greater than End number.';
    }
    
    return '';
  };

  const openModal = (rowIdx = null) => {
    setEditIndex(rowIdx);
    setValidationError('');
    if (rowIdx !== null) {
      const row = rows[rowIdx];
      // Split numberRange if possible
      let start = '', end = '';
      if (row.numberRange && row.numberRange.includes('--')) {
        [start, end] = row.numberRange.split('--');
      }
      setForm({ groupNo: row.groupNo, noInGroup: row.noInGroup, numberRangeStart: start, numberRangeEnd: end });
    } else {
      // Calculate the next "No. in Group" value based on existing entries in the selected group
      const selectedGroup = 0; // Default group
      const entriesInGroup = rows.filter(row => row.groupNo === selectedGroup);
      const nextNoInGroup = entriesInGroup.length;
      setForm({ groupNo: selectedGroup, noInGroup: nextNoInGroup, numberRangeStart: '', numberRangeEnd: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditIndex(null);
    setValidationError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'groupNo') {
      // When Group No. changes, recalculate No. in Group based on entries in the new group
      const newGroupNo = Number(value);
      const entriesInGroup = rows.filter(row => row.groupNo === newGroupNo);
      const nextNoInGroup = entriesInGroup.length;
      setForm((prev) => ({ ...prev, [name]: newGroupNo, noInGroup: nextNoInGroup }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      
      // Validate number range when either start or end changes
      if (name === 'numberRangeStart' || name === 'numberRangeEnd') {
        const newForm = { ...form, [name]: value };
        const error = validateNumberRange(newForm.numberRangeStart, newForm.numberRangeEnd);
        setValidationError(error);
      }
    }
  };

  const handleSave = async () => {
    // Final validation before saving
    const error = validateNumberRange(form.numberRangeStart, form.numberRangeEnd);
    if (error) {
      setValidationError(error);
      return;
    }

    const numberRange = form.numberRangeStart && form.numberRangeEnd ? `${form.numberRangeStart}--${form.numberRangeEnd}` : '';
    const apiData = {
      group: String(form.groupNo),
      no_in_groups: String(form.noInGroup),
      number_range: String(numberRange).replace('--', '-')
    };

    try {
      setLoading(true);
      if (editIndex !== null && rows[editIndex]?.id) {
        await updateNumberPool(rows[editIndex].id, apiData);
      } else {
        await createNumberPool(apiData);
      }
      await refreshNumberPoolWithRetry();
      closeModal();
    } catch (e) {
      console.error('Save Number Pool failed:', e);
      alert('Failed to save number pool.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (idx) => {
    setRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, checked: !row.checked } : row))
    );
  };

  const handleDelete = async () => {
    const idsToDelete = rows.filter(r => r.checked && r.id).map(r => r.id);
    if (idsToDelete.length === 0) {
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${idsToDelete.length} selected item(s)?`)) {
      return;
    }
    try {
      for (const id of idsToDelete) {
        await deleteNumberPool(id);
      }
      await refreshNumberPoolWithRetry();
      alert('Selected items deleted successfully!');
    } catch (e) {
      console.error('Delete Number Pool failed:', e);
      alert('Delete failed. Please try again.');
    }
  };

  const handleClearAll = async () => {
    const ids = rows.filter(r => r.id).map(r => r.id);
    if (ids.length === 0) {
      alert('There are no items to clear.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ALL ${ids.length} item(s)? This action cannot be undone.`)) {
      return;
    }
    try {
      for (const id of ids) {
        await deleteNumberPool(id);
      }
      await refreshNumberPoolWithRetry();
      alert('All items deleted successfully!');
    } catch (e) {
      console.error('Clear all Number Pool failed:', e);
      alert('Clear all failed. Please try again.');
    }
  };

  const fetchNumberPool = async () => {
    try {
      setLoading(true);
      const response = await listNumberPool();
      if (response.response && Array.isArray(response.message)) {
        const mapped = response.message.map(item => ({
          id: item.id,
          checked: false,
          groupNo: Number(item.group),
          noInGroup: Number(item.no_in_groups),
          numberRange: (item.number_range || '').replace('-', '--')
        }));
        setRows(mapped);
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error('List Number Pool failed:', e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Retry once after a short delay in case the backend write hasn't propagated
  const refreshNumberPoolWithRetry = async () => {
    await fetchNumberPool();
    // If still empty but we just performed a write, try one quick retry
    if (rows.length === 0) {
      await new Promise(r => setTimeout(r, 400));
      await fetchNumberPool();
    }
  };

  useEffect(() => {
    fetchNumberPool();
  }, []);

  // Fill up to MIN_ROWS for grid look
  const displayRows = [
    ...rows,
    ...Array.from({ length: Math.max(0, MIN_ROWS - rows.length) }).map(() => null),
  ];

  // Calculate thumb size and position
  // Thumb can only move between the arrows (20px top and bottom)
  const thumbArea = 400 - 40; // 400px height - 20px for each arrow
  const thumbHeight = scrollState.height && scrollState.scrollHeight ? Math.max(30, (scrollState.height / scrollState.scrollHeight) * thumbArea) : 30;
  const maxThumbTop = thumbArea - thumbHeight;
  const thumbTop = scrollState.height && scrollState.scrollHeight && scrollState.scrollHeight > scrollState.height ? ((scrollState.top / (scrollState.scrollHeight - scrollState.height)) * maxThumbTop) : 0;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] p-2 md:p-6">
      <div className="w-full max-w-7xl mx-auto">
          <div className="bg-gray-200 w-full min-h-[400px] flex flex-col">
            <div className="w-full bg-gradient-to-b from-[#b3e0ff] to-[#3d92d0] text-[#222] font-semibold text-lg text-center py-1">Number Pool</div>
            <div className="overflow-x-auto w-full border-l-2 border-r-2 border-b-2 border-gray-400" style={{ height: 400, maxHeight: 400, overflowY: 'auto', scrollbarWidth: 'auto' }} ref={tableScrollRef} onScroll={handleTableScroll}>
              <table className="w-full md:min-w-[660px] border-collapse table-auto">
                <thead>
                  <tr>
                    <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 32, minWidth: '90px' }}>Check</th>
                    <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 32, minWidth: '120px' }}>Group No.</th>
                    {/* <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 32 }}>No. in Group</th> */}
                    <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 32, minWidth: '260px' }}>Number Range</th>
                    <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 32, minWidth: '110px' }}>Modify</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row, idx) =>
                    row ? (
                      <tr key={idx} style={{ borderBottom: '1px solid #bbb', height: 32 }}>
                        <td className="border border-gray-400 text-center bg-white" style={{ padding: '6px 8px', height: 32, minWidth: '90px' }}><input type="checkbox" checked={row.checked || false} onChange={() => handleCheck(idx)} /></td>
                        <td className="border border-gray-400 text-center bg-white text-xs" style={{ padding: '6px 8px', height: 32, minWidth: '120px' }}>{row.groupNo}</td>
                        {/* <td className="border border-gray-400 text-center bg-white text-xs" style={{ padding: '6px 8px', height: 32 }}>{row.noInGroup}</td> */}
                        <td className="border border-gray-400 text-center bg-white text-xs" style={{ padding: '6px 8px', height: 32, minWidth: '260px' }}>{row.numberRange}</td>
                        <td className="border border-gray-400 text-center bg-white" style={{ padding: '6px 8px', height: 32, minWidth: '110px' }}>
                          <EditDocumentIcon style={{ color: '#0e8fd6', cursor: 'pointer', margin: '0 auto' }} onClick={() => openModal(idx)} />
                        </td>
                      </tr>
                    ) : (
                      <tr key={idx} style={{ borderBottom: '1px solid #bbb', background: '#fff', height: 32 }}>
                        <td className="border border-gray-400 text-center bg-white" style={{ color: '#aaa', padding: '6px 8px', height: 32 }}>&nbsp;</td>
                        <td className="border border-gray-400 text-center bg-white" style={{ color: '#aaa', padding: '6px 8px', height: 32 }}>&nbsp;</td>
                        <td className="border border-gray-400 text-center bg-white" style={{ color: '#aaa', padding: '6px 8px', height: 32 }}>&nbsp;</td>
                        <td className="border border-gray-400 text-center bg-white" style={{ color: '#aaa', padding: '6px 8px', height: 32 }}>&nbsp;</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-between items-center bg-gray-300 rounded-b-lg px-1 py-0.5 mt-1 border-l-2 border-r-2 border-b-2 border-gray-400">
            <div className="flex gap-1">
              {(() => { const hasSelection = rows.some(r => r.checked); return (
                <button className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed" onClick={handleDelete} disabled={!hasSelection}>Delete</button>
              ); })()}
              <button className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500" onClick={handleClearAll}>Clear All</button>
            </div>
            <button className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500" onClick={() => openModal()}>Add New</button>
          </div>
        </div>
        {/* Modal */}
        <Dialog open={modalOpen} onClose={closeModal} maxWidth={false} PaperProps={{ sx: { maxWidth: '95vw', width: 380, background: '#f4f6fa', borderRadius: 2, border: '1.5px solid #888' } }}>
          <DialogTitle className="bg-gray-600 text-white text-center font-semibold text-lg">Number Pool</DialogTitle>
          <DialogContent className="bg-gray-200 flex flex-col gap-3 py-4">
            <div className="flex flex-row items-center border border-gray-400 rounded px-2 py-1 gap-2 w-full bg-white mb-1">
              <label className="text-xs text-gray-700 font-medium whitespace-nowrap text-left min-w-[120px] mr-2">Group No.:</label>
              <div className="flex-1 min-w-0">
                <MuiSelect 
                  name="groupNo" 
                  value={form.groupNo} 
                  onChange={handleFormChange} 
                  size="small" 
                  fullWidth 
                  sx={{ fontSize: '12px' }}
                  MenuProps={{
                    PaperProps: {
                      style: { maxHeight: 200, overflow: 'auto' }
                    }
                  }}
                >
                  {NUMBER_POOL_GROUPS.map((g) => (
                    <MenuItem key={g.value} value={g.value} sx={{ fontSize: '12px' }}>{g.label}</MenuItem>
                  ))}
                </MuiSelect>
              </div>
            </div>
            {/* No. in Group removed from modal as requested */}
            <div className="flex flex-row items-center border border-gray-400 rounded px-2 py-1 gap-2 w-full bg-white mb-1">
              <label className="text-xs text-gray-700 font-medium whitespace-nowrap text-left min-w-[120px] mr-2">Number Range:</label>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <TextField name="numberRangeStart" type="text" value={form.numberRangeStart} onChange={handleFormChange} size="small" fullWidth sx={{ '& .MuiInputBase-input': { fontSize: '12px' } }} inputProps={{ placeholder: 'Start' }} />
                <span className="mx-1">--</span>
                <TextField name="numberRangeEnd" type="text" value={form.numberRangeEnd} onChange={handleFormChange} size="small" fullWidth sx={{ '& .MuiInputBase-input': { fontSize: '12px' } }} inputProps={{ placeholder: 'End' }} />
              </div>
            </div>
            {validationError && (
              <div className="text-red-500 text-sm mt-2 mb-1 text-center">{validationError}</div>
            )}
          </DialogContent>
          <DialogActions className="flex justify-center gap-6 pb-4">
            <button className="bg-gradient-to-b from-[#9ca3af] to-[#6b7280] text-white font-semibold text-xs rounded px-3 py-1 min-w-[100px] shadow hover:from-[#6b7280] hover:to-[#9ca3af]" onClick={handleSave}>Save</button>
            <button className="bg-gradient-to-b from-[#d1d5db] to-[#9ca3af] text-[#111827] font-semibold text-xs rounded px-3 py-1 min-w-[100px] shadow hover:from-[#9ca3af] hover:to-[#d1d5db]" onClick={closeModal}>Close</button>
          </DialogActions>
        </Dialog>
    </div>
  );
};

export default NumberPool; 