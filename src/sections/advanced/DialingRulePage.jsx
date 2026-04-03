import React, { useState, useRef, useEffect } from 'react';
import { DIALING_RULE_TABLE_COLUMNS, DIALING_RULE_MODAL_FIELDS, DIALING_RULE_INITIAL_FORM, DIALING_RULE_INITIAL_DATA } from './constants/DialingRuleConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select as MuiSelect, MenuItem, FormControl } from '@mui/material';

const DialingRulePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(DIALING_RULE_INITIAL_FORM);
  const [rules, setRules] = useState(DIALING_RULE_INITIAL_DATA);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const [editIndex, setEditIndex] = useState(null);
  const [indexSelect, setIndexSelect] = useState('');

  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, width: 0, scrollWidth: 0 });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);

  // Get available indices for dropdown (0-99 excluding used ones, but include current edit index)
  const getAvailableIndices = (currentEditIndex = null) => {
    const currentIndex = currentEditIndex !== null && rules[currentEditIndex] ? rules[currentEditIndex].index : null;
    const usedIndices = rules
      .map((rule, idx) => currentEditIndex !== null && idx === currentEditIndex ? null : rule.index)
      .filter(idx => idx !== null && idx !== undefined);
    return Array.from({ length: 100 }, (_, i) => i)
      .filter(idx => !usedIndices.includes(idx) || idx === currentIndex)
      .map(idx => ({ value: String(idx), label: String(idx) }));
  };

  const handleOpenModal = (item = null, idx = -1) => {
    if (item) {
      // Editing existing item
      setFormData({
        index: String(item.index),
        description: item.description || 'default',
        dialingRule: item.dialingRule || '',
      });
      setIndexSelect(String(item.index));
      setEditIndex(idx);
    } else {
      // Adding new item - set first available index
      const available = getAvailableIndices();
      const firstAvailable = available.length > 0 ? available[0].value : '0';
      setFormData({
        ...DIALING_RULE_INITIAL_FORM,
        index: firstAvailable,
      });
      setIndexSelect(firstAvailable);
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(DIALING_RULE_INITIAL_FORM);
    setIndexSelect('');
  };

  const handleIndexSelectChange = (value) => {
    setIndexSelect(value);
    setFormData(prev => ({ ...prev, index: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Validation
    if (!formData.index || formData.index === '') {
      alert('Index is required.');
      return;
    }
    
    const indexNum = parseInt(formData.index);
    if (isNaN(indexNum) || indexNum < 0 || indexNum > 99) {
      alert('Index must be between 0 and 99.');
      return;
    }

    // Check for duplicate index (if adding new or if index changed during edit)
    if (editIndex === null) {
      // Adding new - check if index already exists
      if (rules.some(r => r.index === indexNum)) {
        alert('Index already exists. Please choose a different index.');
        return;
      }
    } else {
      // Editing - check if index exists in other rows
      if (rules.some((r, idx) => idx !== editIndex && r.index === indexNum)) {
        alert('Index already exists. Please choose a different index.');
        return;
      }
    }

    if (!formData.dialingRule || formData.dialingRule.trim() === '') {
      alert('Dialing Rule is required.');
      return;
    }

    // Validate dialing rule format: only 0-9, A-Z, a-z, '.', '#', '*', '[', ']', ',', '-'
    const dialingRuleRegex = /^[0-9A-Za-z.*#\[\]\-,]{1,128}$/;
    if (!dialingRuleRegex.test(formData.dialingRule)) {
      alert("The Dialing Rule can consist only of 0~9, A~Z, a-z, '.', '#', '*' and special characters like '[', ']', ',', '-'!");
      return;
    }

    if (!formData.description || formData.description.trim() === '') {
      alert('Description is required.');
      return;
    }

    // Validate description: cannot contain special characters like '~', '!', '&', '|', '='
    const descriptionRegex = /^[^\%\&\~\!\|\(\)\;\"\'\=\\]*$/;
    if (!descriptionRegex.test(formData.description)) {
      alert("The Description cannot contain special characters like '~', '!', '&', '|' and '='!");
      return;
    }

    const normalized = {
      ...formData,
      index: indexNum,
      id: editIndex !== null ? rules[editIndex].id : Date.now(),
    };

    try {
      if (editIndex !== null) {
        // Update existing
        setRules(prev => prev.map((rule, idx) => 
          idx === editIndex ? normalized : rule
        ));
        alert('Dialing rule updated successfully!');
      } else {
        // Create new
        setRules(prev => [...prev, normalized]);
        alert('Dialing rule created successfully!');
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving dialing rule:', error);
      alert(error.message || 'Failed to save dialing rule');
    }
  };

  const handleSelectRow = (idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected(prev => prev.includes(realIdx) ? prev.filter(i => i !== realIdx) : [...prev, realIdx]);
  };

  const handleCheckAll = () => {
    const allIndices = pagedRules.map((_, idx) => (page - 1) * itemsPerPage + idx);
    setSelected(allIndices);
  };

  const handleUncheckAll = () => {
    setSelected([]);
  };

  const handleInverse = () => {
    const allIndices = pagedRules.map((_, idx) => (page - 1) * itemsPerPage + idx);
    setSelected(prev => allIndices.filter(idx => !prev.includes(idx)));
  };

  const handleDelete = () => {
    if (selected.length === 0) {
      alert('Please select at least one item to delete.');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete ${selected.length} selected item(s)?`);
    if (!confirmed) return;

    try {
      setRules(prev => prev.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
      if (page > Math.ceil((rules.length - selected.length) / itemsPerPage)) {
        setPage(Math.max(1, Math.ceil((rules.length - selected.length) / itemsPerPage)));
      }
      alert(`${selected.length} item(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting selected items:', error);
      alert(error.message || 'Failed to delete selected items');
    }
  };

  const handleClearAll = () => {
    if (rules.length === 0) {
      alert('No data to clear');
      return;
    }

    if (!window.confirm('Are you sure to clear all dialing rules?')) {
      return;
    }

    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      alert(`All dialing rules cleared successfully`);
    } catch (error) {
      console.error('Error clearing all items:', error);
      alert(error.message || 'Failed to clear all items');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      setSelected([]);
    }
  };

  const handleTableScroll = (e) => setScrollState({ left: e.target.scrollLeft, width: e.target.clientWidth, scrollWidth: e.target.scrollWidth });
  
  const handleScrollbarDrag = (e) => {
    const track = e.target.parentNode;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    if (tableScrollRef.current) tableScrollRef.current.scrollLeft = (scrollState.scrollWidth - scrollState.width) * percent;
  };

  const handleArrowClick = (dir) => {
    if (tableScrollRef.current) tableScrollRef.current.scrollLeft += (dir === 'left' ? -100 : 100);
  };

  useEffect(() => {
    const update = () => {
      if (tableScrollRef.current) {
        const el = tableScrollRef.current;
        setScrollState({ left: el.scrollLeft, width: el.clientWidth, scrollWidth: el.scrollWidth });
        setShowCustomScrollbar(el.scrollWidth > el.clientWidth);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [rules, page]);

  const thumbWidth = scrollState.width && scrollState.scrollWidth ? Math.max(40, (scrollState.width / scrollState.scrollWidth) * (scrollState.width - 8)) : 40;
  const thumbLeft = scrollState.width && scrollState.scrollWidth && scrollState.scrollWidth > scrollState.width ? ((scrollState.left / (scrollState.scrollWidth - scrollState.width)) * (scrollState.width - thumbWidth - 16)) : 0;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-128px)] py-2 px-2 sm:px-4" style={{backgroundColor: "#dde0e4"}}>
      {rules.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center" style={{ minHeight: '15vh' }}>
          <div className="text-gray-600 text-xl md:text-[16px] font-semibold mb-4 text-center">No available dialing rule!</div>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 350,
              fontSize: '14px',
              borderRadius: 1.5,
              minWidth: 80,
              minHeight: 28,
              px: 0.5,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                color: '#fff',
              },
            }}
            onClick={() => handleOpenModal()}
          >Add New</Button>
        </div>
      ) : (
        <>
          <div className="w-full max-w-full">
            {/* Blue header bar */}
            <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-600 shadow mb-0">
              Dialing Rule
            </div>
            
            <div className="bg-white border-2 border-gray-400 border-t-0 shadow-sm">
              <div className="w-full flex flex-col overflow-hidden">
                <div className="w-full border-b border-gray-300" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
                  <div
                    ref={tableScrollRef}
                    onScroll={handleTableScroll}
                    className="scrollbar-hide"
                    style={{
                      overflowX: 'auto',
                      overflowY: 'auto',
                      maxHeight: 240,
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                  >
                    <table className="w-full min-w-[800px] border border-gray-300 border-collapse whitespace-nowrap" style={{ tableLayout: 'auto', border: '1px solid #bbb' }}>
                      <thead>
                        <tr style={{ minHeight: 32 }}>
                          {DIALING_RULE_TABLE_COLUMNS.map(c => (
                            <th key={c.key} className="bg-white text-[#222] font-semibold text-[12px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                              {c.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pagedRules.map((item, idx) => {
                          const realIdx = (page - 1) * itemsPerPage + idx;
                          return (
                            <tr key={realIdx} style={{ minHeight: 32 }}>
                              <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                                <EditDocumentIcon style={{ cursor: 'pointer', color: '#0e8fd6', display: 'block', margin: '0 auto' }} onClick={() => handleOpenModal(item, realIdx)} />
                              </td>
                              <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                                <input type="checkbox" checked={selected.includes(realIdx)} onChange={() => handleSelectRow(idx)} />
                              </td>
                              <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.index}</td>
                              <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.dialingRule}</td>
                              <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.description}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Custom scrollbar row below the table */}
                {showCustomScrollbar && (
                  <div style={{ width: '100%', margin: '0 auto', background: '#f4f6fa', display: 'flex', alignItems: 'center', height: 24, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, border: 'none', borderTop: 'none', padding: '0 4px', boxSizing: 'border-box' }}>
                    <div style={{ width: 18, height: 18, background: '#e3e7ef', border: '1px solid #bbb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#888', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleArrowClick('left')}>&#9664;</div>
                    <div
                      style={{ flex: 1, height: 12, background: '#e3e7ef', borderRadius: 8, position: 'relative', margin: '0 4px', overflow: 'hidden' }}
                      onClick={handleScrollbarDrag}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          height: 12,
                          background: '#888',
                          borderRadius: 8,
                          cursor: 'pointer',
                          top: 0,
                          width: thumbWidth,
                          left: thumbLeft,
                        }}
                        draggable
                        onDrag={handleScrollbarDrag}
                      />
                    </div>
                    <div style={{ width: 18, height: 18, background: '#e3e7ef', border: '1px solid #bbb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#888', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleArrowClick('right')}>&#9654;</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Action and pagination rows OUTSIDE the border */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full px-2 py-2" style={{ background: '#e3e7ef', marginTop: 12 }}>
            <div className="flex flex-wrap gap-2">
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleCheckAll}
              >
                Check All
              </button>
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleUncheckAll}
              >
                Uncheck All
              </button>
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleInverse}
              >
                Inverse
              </button>
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleDelete}
                disabled={selected.length === 0}
              >
                Delete
              </button>
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleClearAll}
                disabled={rules.length === 0}
              >
                Clear All
              </button>
            </div>
            <button 
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
              onClick={() => handleOpenModal()}
            >
              Add New
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full px-2 py-2 text-[15px]" style={{ background: '#e3e7ef', marginTop: 8 }}>
            <span>{rules.length} Items Total</span>
            <span>{itemsPerPage} Items/Page</span>
            <span>{page}/{totalPages}</span>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(1)} disabled={page === 1}>First</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Next</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}>Last</button>
            <span>Go to Page</span>
            <select className="text-xs rounded border border-gray-300 px-1 py-0.5 min-w-[40px]" value={page} onChange={e => handlePageChange(Number(e.target.value))}>
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <span>{totalPages} Pages Total</span>
          </div>
        </>
      )}
      <Dialog 
        open={isModalOpen} 
        onClose={handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: { width: 500, maxWidth: '95vw', mx: 'auto', p: 0 }
        }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle 
          className="text-white text-center font-semibold p-2 text-base"
          style={{
            background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
            borderBottom: '1px solid #444444'
          }}
        >
          Dialing Rule
        </DialogTitle>
        <DialogContent 
          className="pt-3 pb-0 px-2" 
          style={{
            padding: '12px 8px 0 8px',
            backgroundColor: '#dde0e4',
            border: '1px solid #444444',
            borderTop: 'none',
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto'
          }}
        >
          <div className="flex flex-col gap-2 w-full">
            {/* Index field with dropdown only */}
            <div className="flex items-center bg-white border border-gray-300 rounded px-2 py-0.5 gap-2" style={{ minHeight: 28 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 180, marginRight: 10, flexShrink: 0 }}>
                Index:
              </label>
              <div className="flex-1">
                <FormControl size="small" fullWidth>
                  <MuiSelect
                    value={indexSelect || ''}
                    onChange={(e) => handleIndexSelectChange(e.target.value)}
                    variant="outlined"
                    sx={{
                      fontSize: 14,
                      height: 28,
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#bbb' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#999' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                      '& .MuiSelect-select': { padding: '4px 8px' }
                    }}
                  >
                    {getAvailableIndices(editIndex).map(opt => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 14 }}>{opt.label}</MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
              </div>
            </div>
            {/* Description field */}
            <div className="flex items-center bg-white border border-gray-300 rounded px-2 py-0.5 gap-2" style={{ minHeight: 28 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 180, marginRight: 10, flexShrink: 0 }}>
                Description:
              </label>
              <div className="flex-1">
                <TextField
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '28px',
                      backgroundColor: 'white',
                      '& fieldset': { borderColor: '#bbb' },
                      '&:hover fieldset': { borderColor: '#999' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '4px 8px',
                      fontSize: 14
                    }
                  }}
                />
              </div>
            </div>
            {/* Dialing Rule field */}
            <div className="flex items-center bg-white border border-gray-300 rounded px-2 py-0.5 gap-2" style={{ minHeight: 28 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 180, marginRight: 10, flexShrink: 0 }}>
                Dialing Rule:
              </label>
              <div className="flex-1">
                <TextField
                  name="dialingRule"
                  value={formData.dialingRule || ''}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '28px',
                      backgroundColor: 'white',
                      '& fieldset': { borderColor: '#bbb' },
                      '&:hover fieldset': { borderColor: '#999' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '4px 8px',
                      fontSize: 14
                    }
                  }}
                />
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
            }}
            onClick={handleSave}
          >
            Save
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
            }}
            onClick={handleCloseModal}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DialingRulePage;

