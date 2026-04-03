import React, { useState, useRef, useEffect } from 'react';
import { TONE_DETECTER_FIELDS, TONE_DETECTER_TABLE_COLUMNS, TONE_DETECTER_INITIAL_FORM } from './constants/ToneDetecterConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select as MuiSelect, MenuItem, FormControl, CircularProgress } from '@mui/material';

const LOCAL_STORAGE_KEY = 'toneDetectorRules';

const ToneDetecterPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(TONE_DETECTER_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false
  });
  const [editIndex, setEditIndex] = useState(null);

  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, width: 0, scrollWidth: 0 });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRules(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Error loading tone detector data:', error);
      setRules([]);
    }
  }, []);

  // Save to localStorage whenever rules change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rules));
    } catch (error) {
      console.error('Error saving tone detector data:', error);
    }
  }, [rules]);

  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      // Editing existing item
      setFormData({
        ...item,
        index: item.index !== undefined ? String(item.index) : '0',
        first_mid_frequency: item.first_mid_frequency !== undefined ? String(item.first_mid_frequency) : '450',
        second_mid_frequency: item.second_mid_frequency !== undefined ? String(item.second_mid_frequency) : '0',
        duration_on_state: item.duration_on_state !== undefined ? String(item.duration_on_state) : '1500',
        duration_off_state: item.duration_off_state !== undefined ? String(item.duration_off_state) : '0',
        period_count: item.period_count !== undefined ? String(item.period_count) : '0',
        duration_error: item.duration_error !== undefined ? String(item.duration_error) : '20',
      });
      setEditIndex(index);
    } else {
      // Adding new item - set next index
      const nextIndex = rules.length > 0 ? Math.max(...rules.map(r => Number(r.index) || 0)) + 1 : 0;
      setFormData({
        ...TONE_DETECTER_INITIAL_FORM,
        index: String(nextIndex),
      });
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = () => {
    // Validation
    if (!formData.tone) {
      alert('Tone is required.');
      return;
    }
    if (formData.first_mid_frequency === '' || formData.first_mid_frequency == null) {
      alert('The 1st Mid-frequency is required.');
      return;
    }
    if (formData.duration_error === '' || formData.duration_error == null) {
      alert('Duration Error at ON/OFF State is required.');
      return;
    }

    // Normalize numeric fields
    const normalized = {
      ...formData,
      index: String(formData.index || '0'),
      first_mid_frequency: String(formData.first_mid_frequency || '0'),
      second_mid_frequency: String(formData.second_mid_frequency || '0'),
      duration_on_state: String(formData.duration_on_state || '0'),
      duration_off_state: String(formData.duration_off_state || '0'),
      period_count: String(formData.period_count || '0'),
      duration_error: String(formData.duration_error || '20'),
      id: editIndex !== null ? rules[editIndex].id : Date.now(), // Use existing id or create new
    };

    setLoading(prev => ({ ...prev, save: true }));
    try {
      if (editIndex !== null) {
        // Update existing
        setRules(prev => prev.map((rule, idx) => 
          idx === editIndex ? normalized : rule
        ));
        alert('Tone parameter updated successfully!');
      } else {
        // Create new
        setRules(prev => [...prev, normalized]);
        alert('Tone parameter created successfully!');
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving tone parameter:', error);
      alert(error.message || 'Failed to save tone parameter');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tone') {
      // When tone changes, update other fields based on tone type
      const toneDefaults = {
        'Dial Tone': {
          first_mid_frequency: '450',
          second_mid_frequency: '0',
          duration_on_state: '600',
          duration_off_state: '0',
          period_count: '0',
          duration_error: '20',
        },
        'Busy Tone': {
          first_mid_frequency: '450',
          second_mid_frequency: '0',
          duration_on_state: '350',
          duration_off_state: '350',
          period_count: '2',
          duration_error: '20',
        },
        'Ringback Tone': {
          first_mid_frequency: '450',
          second_mid_frequency: '0',
          duration_on_state: '1000',
          duration_off_state: '4000',
          period_count: '1',
          duration_error: '20',
        },
        'Fax F1': {
          first_mid_frequency: '1100',
          second_mid_frequency: '0',
          duration_on_state: '250',
          duration_off_state: '0',
          period_count: '0',
          duration_error: '20',
        },
        'Fax F2': {
          first_mid_frequency: '2100',
          second_mid_frequency: '0',
          duration_on_state: '250',
          duration_off_state: '0',
          period_count: '0',
          duration_error: '20',
        },
      };
      
      const defaults = toneDefaults[value] || {};
      setFormData((prev) => ({ ...prev, [name]: value, ...defaults }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePageChange = (newPage) => setPage(Math.max(1, Math.min(totalPages, newPage)));

  const handleSelectRow = idx => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected(sel => sel.includes(realIdx) ? sel.filter(i => i !== realIdx) : [...sel, realIdx]);
  };

  const handleCheckAll = () => setSelected(rules.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () => setSelected(rules.map((_, idx) => !selected.includes(idx) ? idx : null).filter(i => i !== null));

  const handleDelete = () => {
    if (selected.length === 0) {
      alert('Please select items to delete');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete ${selected.length} selected item(s)?`);
    if (!confirmed) return;

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      setRules(prev => prev.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
      alert(`${selected.length} item(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting selected items:', error);
      alert(error.message || 'Failed to delete selected items');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = () => {
    if (rules.length === 0) {
      alert('No data to clear');
      return;
    }

    if (!window.confirm('Are you sure you want to delete ALL tone parameters? This action cannot be undone.')) {
      return;
    }

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      alert(`All ${rules.length} item(s) deleted successfully`);
    } catch (error) {
      console.error('Error clearing all items:', error);
      alert(error.message || 'Failed to clear all items');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
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

  const handleRefresh = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRules(Array.isArray(parsed) ? parsed : []);
      } else {
        setRules([]);
      }
    } catch (error) {
      console.error('Error refreshing tone detector data:', error);
    }
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
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{backgroundColor: "#dde0e4"}}>
      {loading.fetch ? (
        <div className="flex items-center justify-center h-64">
          <CircularProgress />
          <span className="ml-2">Loading tone detector...</span>
        </div>
      ) : rules.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center" style={{ minHeight: '15vh' }}>
          <div className="text-gray-600 text-xl md:text-[16px] font-semibold mb-4 text-center">No available tone detector parameter!</div>
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
          <div className="w-full max-w-full mx-auto">
            {/* Blue header bar */}
            <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[16px] text-[#444] shadow-sm mt-0"
              style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
              Tone Detector
            </div>
            
            <div style={{ border: '2px solid #bbb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="bg-white rounded-lg shadow-sm w-full flex flex-col overflow-hidden">
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
                    <table className="w-full min-w-[1400px] border border-gray-300 border-collapse whitespace-nowrap" style={{ tableLayout: 'auto', border: '1px solid #bbb' }}>
                      <thead>
                        <tr style={{ minHeight: 32 }}>
                          {TONE_DETECTER_TABLE_COLUMNS.map(c => (
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
                              <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.tone}</td>
                              <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.first_mid_frequency}</td>
                              <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.second_mid_frequency}</td>
                              <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.duration_on_state}</td>
                              <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.duration_off_state}</td>
                              <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.period_count}</td>
                              <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.duration_error}</td>
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
                disabled={loading.delete}
              >
                Check All
              </button>
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleUncheckAll}
                disabled={loading.delete}
              >
                Uncheck All
              </button>
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleInverse}
                disabled={loading.delete}
              >
                Inverse
              </button>
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
              >
                {loading.delete ? 'Deleting...' : 'Delete'}
              </button>
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleClearAll}
                disabled={loading.delete || rules.length === 0}
              >
                {loading.delete ? 'Clearing...' : 'Clear All'}
              </button>
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleRefresh}
                disabled={loading.fetch}
              >
                {loading.fetch ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <button 
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
              onClick={() => handleOpenModal()}
              disabled={loading.save}
            >
              {loading.save ? 'Saving...' : 'Add New'}
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
          {editIndex !== null ? 'Edit Tone Parameters' : 'Add Tone Parameters'}
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
            {TONE_DETECTER_FIELDS.map((field) => (
              <div
                key={field.name}
                className="flex items-center bg-white border border-gray-300 rounded px-2 py-0.5 gap-2"
                style={{ minHeight: 28 }}
              >
                <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width: field.name === 'duration_error' ? 220 : 180, marginRight:10, flexShrink: 0}}>
                  {field.label}
                </label>
                <div className="flex-1">
                  {field.type === 'select' ? (
                    <FormControl size="small" fullWidth>
                      <MuiSelect 
                        value={formData[field.name] || ''} 
                        onChange={e => handleInputChange({ target: { name: field.name, value: e.target.value } })} 
                        variant="outlined" 
                        sx={{ 
                          fontSize: 14,
                          '& .MuiOutlinedInput-input': {
                            padding: '4px 8px',
                            height: '1.4375em'
                          }
                        }}
                      >
                        {field.options.map(opt => (
                          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 14 }}>{opt.label}</MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  ) : (
                    <TextField 
                      type={field.type || 'text'} 
                      name={field.name} 
                      value={formData[field.name] || ''} 
                      onChange={handleInputChange} 
                      size="small" 
                      fullWidth 
                      variant="outlined" 
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          height: '32px'
                        },
                        '& .MuiOutlinedInput-input': {
                          padding: '4px 8px',
                          fontSize: 14
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
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
            disabled={loading.save}
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

export default ToneDetecterPage;

