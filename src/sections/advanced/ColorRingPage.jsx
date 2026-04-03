import React, { useState, useRef, useEffect } from 'react';
import { COLOR_RING_TABLE_COLUMNS, COLOR_RING_INDEX_OPTIONS, COLOR_RING_INITIAL_FORM } from './constants/ColorRingConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select as MuiSelect, MenuItem, FormControl } from '@mui/material';

const ColorRingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(COLOR_RING_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [fileName, setFileName] = useState('No file chosen');
  const [editIndex, setEditIndex] = useState(null);
  const fileInputRef = useRef(null);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, width: 0, scrollWidth: 0 });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);

  const handleOpenModal = (item = null, idx = -1) => {
    if (item) {
      // Editing existing item
      setFormData({
        index: String(item.index),
        description: item.description || 'default',
        file: null,
      });
      setFileName(item.fileName || 'No file chosen');
      setEditIndex(idx);
    } else {
      // Adding new item
      setFormData(COLOR_RING_INITIAL_FORM);
      setFileName('No file chosen');
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(COLOR_RING_INITIAL_FORM);
    setFileName('No file chosen');
  };

  const handleReturn = () => {
    handleCloseModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFormData(prev => ({ ...prev, file }));
    } else {
      setFileName('No file chosen');
      setFormData(prev => ({ ...prev, file: null }));
    }
  };

  const checkFileExt = (ext) => {
    if (!ext.match(/.wav/i)) {
      return false;
    }
    return true;
  };

  const handleUpload = () => {
    // Validation
    if (!formData.description || formData.description.trim() === '') {
      alert('Please enter a description!');
      return;
    }

    // Validate description: cannot contain special characters like '~', '!', '&', '|', '='
    const descriptionRegex = /^[^\%\&\~\!\|\(\)\;\"\'\=\\]*$/;
    if (!descriptionRegex.test(formData.description)) {
      alert("The description cannot contain special characters like '~', '!', '&', '|' and '='!");
      return;
    }

    if (!formData.file) {
      alert('Please select a file to upload!');
      return;
    }

    const fileExt = formData.file.name.substring(formData.file.name.lastIndexOf('.')).toLowerCase();
    if (!checkFileExt(fileExt)) {
      alert('Only wav files can be uploaded!');
      return;
    }

    // Validate file size (less than 200KB)
    if (formData.file.size > 200 * 1024) {
      alert('The size of the file must be less than 200KB!');
      return;
    }

    const newItem = {
      id: editIndex !== null ? rules[editIndex].id : Date.now(),
      index: parseInt(formData.index),
      description: formData.description.trim(),
      fileName: formData.file.name,
      file: formData.file, // Store file reference if needed
    };

    try {
      if (editIndex !== null) {
        // Update existing
        setRules(prev => prev.map((rule, idx) => 
          idx === editIndex ? newItem : rule
        ));
        alert('Color ring updated successfully!');
      } else {
        // Create new
        setRules(prev => [...prev, newItem]);
        alert('Color ring uploaded successfully!');
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving color ring:', error);
      alert(error.message || 'Failed to save color ring');
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

    if (!window.confirm('Are you sure to clear all color rings?')) {
      return;
    }

    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      alert(`All color rings cleared successfully`);
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
      {rules.length === 0 && !isModalOpen ? (
        <div className="w-full h-full flex flex-col items-center justify-center" style={{ minHeight: '15vh' }}>
          <div className="text-gray-600 text-xl md:text-[16px] font-semibold mb-4 text-center">No available color ring!</div>
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
          >Upload</Button>
        </div>
      ) : (
        <>
          {rules.length > 0 && (
            <>
              <div className="w-full max-w-full">
                {/* Blue header bar */}
                <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-600 shadow mb-0">
                  Color Ring
                </div>
                
                <div className="bg-white border-2 border-gray-400 border-t-0 shadow-sm">
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
                        <table className="w-full min-w-[800px] border border-gray-300 border-collapse whitespace-nowrap" style={{ tableLayout: 'auto', border: '1px solid #bbb' }}>
                          <thead>
                            <tr style={{ minHeight: 32 }}>
                              {COLOR_RING_TABLE_COLUMNS.map(c => (
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
                                  <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.description}</td>
                                  <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.fileName}</td>
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
                  Upload
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
        </>
      )}

      {/* Upload Modal */}
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
          Color Ring-Upload
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
          <div className="flex flex-col gap-4 w-full">
            {/* Index field */}
            <div className="flex items-center bg-white border border-gray-300 rounded px-2 py-0.5 gap-2" style={{ minHeight: 28 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 120, marginRight: 10, flexShrink: 0 }}>
                Index
              </label>
              <div className="flex-1">
                <FormControl size="small" fullWidth>
                  <MuiSelect
                    value={formData.index}
                    onChange={(e) => handleInputChange({ target: { name: 'index', value: e.target.value } })}
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
                    {COLOR_RING_INDEX_OPTIONS.map(opt => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 14 }}>{opt.label}</MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
              </div>
            </div>
            {/* Description field */}
            <div className="flex items-center bg-white border border-gray-300 rounded px-2 py-0.5 gap-2" style={{ minHeight: 28 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 120, marginRight: 10, flexShrink: 0 }}>
                Description
              </label>
              <div className="flex-1">
                <TextField
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                  variant="outlined"
                  inputProps={{ maxLength: 23, style: { fontSize: 14, padding: '4px 8px' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '28px',
                      backgroundColor: 'white',
                      '& fieldset': { borderColor: '#bbb' },
                      '&:hover fieldset': { borderColor: '#999' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                    },
                  }}
                />
              </div>
            </div>
            {/* Color Ring file field */}
            <div className="flex items-center bg-white border border-gray-300 rounded px-2 py-0.5 gap-2" style={{ minHeight: 28 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 120, marginRight: 10, flexShrink: 0 }}>
                Color Ring
              </label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".wav"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  component="span"
                  sx={{
                    background: '#f5f5f5',
                    border: '1px solid #b0b0b0',
                    color: '#333',
                    fontWeight: 500,
                    fontSize: '14px',
                    textTransform: 'none',
                    minWidth: '100px',
                    height: '28px',
                    '&:hover': {
                      background: '#e5e5e5',
                      borderColor: '#999',
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose file
                </Button>
                <span className="text-[14px] text-gray-600">{fileName}</span>
              </div>
            </div>
            {/* Note */}
            <div className="text-[14px] text-gray-700 mt-2">
              Note: The file should be a wav file with 8000Hz sampling rate, 16-bit mono, A-law formatted, and less than 200KB in size.
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
            onClick={handleUpload}
          >
            Upload
          </Button>
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
            onClick={handleReturn}
          >
            Return
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ColorRingPage;

