import React, { useState, useRef, useEffect } from 'react';
import {
  ROUTE_IP_IP_FIELDS,
  ROUTE_IP_IP_INITIAL_FORM,
  ROUTE_IP_IP_TABLE_COLUMNS
} from '../constants/RouteIPIPConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select as MuiSelect, MenuItem, Alert, CircularProgress } from '@mui/material';
import { listIpPstnRoutes, createIpPstnRoute, updateIpPstnRoute, deleteIpPstnRoute, listGroups } from '../api/apiService';

const RouteIPIPPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ROUTE_IP_IP_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, width: 0, scrollWidth: 0 });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);
  const [sipTrunkGroups, setSipTrunkGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validationMessage, setValidationMessage] = useState('');

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Modal logic
  const handleOpenModal = (item = null, index = -1) => {
    setValidationMessage(''); // Clear any existing validation message
    if (item) {
      setFormData({ ...item, originalIndex: index });
    } else {
      // Set empty values for call source and destination to show "Please select" placeholder
      setFormData({
        ...ROUTE_IP_IP_INITIAL_FORM,
        callSource: '',
        callDestination: '',
        originalIndex: -1,
      });
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setValidationMessage(''); // Clear validation message when closing modal
    setIsModalOpen(false);
  };
  const validatePrefix = (prefix) => /^[\d*]+$/.test(prefix || '');

  const handleSave = async () => {
    const { originalIndex, ...dataToSave } = formData;
    if (!validatePrefix(dataToSave.callerIdPrefix)) {
      alert('Invalid CallerID Prefix! Only numbers (0-9) and asterisks (*) are allowed.');
      return;
    }
    if (!validatePrefix(dataToSave.calleeIdPrefix)) {
      alert('Invalid CalleeID Prefix! Only numbers (0-9) and asterisks (*) are allowed.');
      return;
    }

    const apiData = {
      call_source: dataToSave.callSource,
      caller_id_prefix: dataToSave.callerIdPrefix,
      callee_id_prefix: dataToSave.calleeIdPrefix,
      call_destination: dataToSave.callDestination,
      number_filter: dataToSave.numberFilter,
      description: dataToSave.description
    };

    try {
      setLoading(prev => ({ ...prev, save: true }));
      if (originalIndex !== undefined && originalIndex > -1) {
        const response = await updateIpPstnRoute(rules[originalIndex].id, apiData, 'ip_to_ip');
        if (response?.response) {
          alert('Route updated successfully!');
        } else {
          alert(response?.message || 'Failed to update route');
        }
      } else {
        const response = await createIpPstnRoute(apiData, 'ip_to_ip');
        if (response?.response) {
          alert('Route created successfully!');
        } else {
          alert(response?.message || 'Failed to create route');
        }
      }
      // Force a fresh reload of the table like IP->PSTN page
      setRules([]);
      await fetchRules();
      handleCloseModal();
    } catch (e) {
      console.error('Error saving IP-&gt;IP rule:', e);
      if (e.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', e.message || 'Failed to save IP-&gt;IP rule');
      }
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };
  const handleInputChange = (key, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [key]: value };
      
      // Validation: Prevent same SIP trunk group ID in call source and call destination
      if (key === 'callSource' && value === prev.callDestination) {
        // If call source is set to same as call destination, clear call destination
        newData.callDestination = '';
        setValidationMessage('Call source and call destination cannot be the same. Call destination has been cleared.');
        setTimeout(() => setValidationMessage(''), 3000);
      } else if (key === 'callDestination' && value === prev.callSource) {
        // If call destination is set to same as call source, clear call source
        newData.callSource = '';
        setValidationMessage('Call source and call destination cannot be the same. Call source has been cleared.');
        setTimeout(() => setValidationMessage(''), 3000);
      } else {
        // Clear validation message if no conflict
        setValidationMessage('');
      }
      
      return newData;
    });
  };
  // Table selection logic
  const handleSelectRow = idx => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected(sel => sel.includes(realIdx) ? sel.filter(i => i !== realIdx) : [...sel, realIdx]);
  };
  const handleCheckAll = () => setSelected(rules.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () => setSelected(rules.map((_, idx) => !selected.includes(idx) ? idx : null).filter(i => i !== null));
  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage('warning', 'Please select items to delete');
      return;
    }
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selected.length} selected item(s)?`);
    if (!confirmed) return;
    
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      const idsToDelete = rules.filter((_, idx) => selected.includes(idx)).map(r => r.id);
      for (const id of idsToDelete) {
        await deleteIpPstnRoute(id, 'ip_to_ip');
      }
      await fetchRules();
      setSelected([]);
      alert('Selected routes deleted successfully!');
    } catch (e) {
      console.error('Delete failed:', e);
      if (e.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', e.message || 'Failed to delete routes');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };
  const handleClearAll = async () => {
    if (rules.length === 0) {
      showMessage('warning', 'No routes to clear');
      return;
    }
    
    const confirmed = window.confirm(`Are you sure you want to delete ALL ${rules.length} routes? This action cannot be undone.`);
    if (!confirmed) return;
    
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      for (const r of rules) {
        await deleteIpPstnRoute(r.id, 'ip_to_ip');
      }
      await fetchRules();
      setSelected([]);
      setPage(1);
      alert('All routes deleted successfully!');
    } catch (e) {
      console.error('Clear all failed:', e);
      if (e.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', e.message || 'Failed to clear all routes');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };
  const handlePageChange = (newPage) => setPage(Math.max(1, Math.min(totalPages, newPage)));

  // Scroll handling functions
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

  // Update scroll state when data or page changes
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

  // Helper function to format display values for table
  const formatDisplayValue = (key, value, rowIndex = 0) => {
    if (key === 'index') {
      // Calculate index based on current page and row position
      return (page - 1) * itemsPerPage + rowIndex + 1;
    }
    
    if (value === undefined || value === null || value === '') return '--';
    
    switch (key) {
      case 'callSource':
        return `SIP Trunk Group [${value}]`;
      case 'callDestination':
        return `SIP Trunk Group [${value}]`;
      default:
        return value;
    }
  };

  // Load SIP groups and rules
  const fetchSipGroups = async () => {
    try {
      const response = await listGroups();
      if (response.response && response.message) {
        const sipGroups = Array.isArray(response.message) ? response.message : [response.message];
        setSipTrunkGroups(sipGroups);
      } else {
        setSipTrunkGroups([]);
      }
    } catch (e) {
      console.error('Failed to load SIP groups', e);
      if (e.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', e.message || 'Failed to load SIP trunk groups');
      }
      setSipTrunkGroups([]);
    }
  };

  const fetchRules = async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const response = await listIpPstnRoutes('ip_to_ip');
      if (response.response && Array.isArray(response.message)) {
        const mapped = response.message.map(rule => ({
          id: rule.id,
          callSource: rule.call_source,
          callerIdPrefix: rule.caller_id_prefix,
          calleeIdPrefix: rule.callee_id_prefix,
          callDestination: rule.call_destination,
          numberFilter: rule.number_filter,
          description: rule.description
        }));
        setRules(mapped);
      } else {
        setRules([]);
      }
    } catch (e) {
      console.error('Failed to load IP-&gt;IP routes', e);
      if (e.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else if (e.response?.status === 500) {
        showMessage('error', 'Server error. The IP-&gt;IP routes endpoint may have issues.');
      } else {
        showMessage('error', e.message || 'Failed to load IP-&gt;IP routes');
      }
      setRules([]);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    fetchSipGroups();
    fetchRules();
  }, []);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{backgroundColor: "#dde0e4"}}>
      {/* Message Display */}
      {message.text && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage({ type: '', text: '' })}
          sx={{
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3
          }}
        >
          {message.text}
        </Alert>
      )}

      <div className="w-full max-w-full mx-auto">
        {/* Blue header bar - always show */}
        <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
              IP-&gt;IP Routing Rule
            </div>
        
        <div className="w-full max-w-full mx-auto" style={{ border: '2px solid #bbb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
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
                      <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Check</th>
                      {ROUTE_IP_IP_TABLE_COLUMNS.map(c => (
                        <th
                          key={c.key}
                          className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center"
                          style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}
                        >
                          {c.label}
                        </th>
                      ))}
                      <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Modify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading.fetch ? (
                      <tr>
                        <td colSpan={ROUTE_IP_IP_TABLE_COLUMNS.length + 2} className="border border-gray-300 px-2 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <CircularProgress size={20} />
                            <span>Loading IP-&gt;IP routes...</span>
                          </div>
                        </td>
                      </tr>
                    ) : rules.length === 0 ? (
                      <tr>
                        <td colSpan={ROUTE_IP_IP_TABLE_COLUMNS.length + 2} className="border border-gray-300 px-2 py-1 text-center">No data</td>
                      </tr>
                    ) : (
                      pagedRules.map((item, idx) => {
                        const realIdx = (page - 1) * itemsPerPage + idx;
                        return (
                          <tr key={realIdx} style={{ minHeight: 32 }}>
                            <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                              <input
                                type="checkbox"
                                checked={selected.includes(realIdx)}
                                onChange={() => handleSelectRow(idx)}
                              />
                            </td>
                            {ROUTE_IP_IP_TABLE_COLUMNS.map(col => (
                              <td
                                key={col.key}
                                className="border border-gray-300 text-center bg-white"
                                style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}
                              >
                                {formatDisplayValue(col.key, item[col.key], idx)}
                              </td>
                            ))}
                            <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                              <EditDocumentIcon 
                                className="cursor-pointer text-blue-600 mx-auto" 
                                onClick={() => handleOpenModal(item, realIdx)} 
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Custom scrollbar row below the table */}
            {(() => {
              const thumbWidth = scrollState.width && scrollState.scrollWidth ? Math.max(40, (scrollState.width / scrollState.scrollWidth) * (scrollState.width - 8)) : 40;
              const thumbLeft = scrollState.width && scrollState.scrollWidth && scrollState.scrollWidth > scrollState.width ? ((scrollState.left / (scrollState.scrollWidth - scrollState.width)) * (scrollState.width - thumbWidth - 16)) : 0;
              return showCustomScrollbar && (
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
              );
            })()}
          </div>
        </div>
        
        {/* Action and pagination rows OUTSIDE the border, visually separated backgrounds and gap */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full px-2 py-2" style={{ background: '#e3e7ef', marginTop: 12 }}>
          <div className="flex flex-wrap gap-2">
            <button 
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" 
              onClick={handleCheckAll}
            >
              Check All
            </button>
            <button 
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" 
              onClick={handleUncheckAll}
            >
              Uncheck All
            </button>
            <button 
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" 
              onClick={handleInverse}
            >
              Inverse
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                selected.length === 0 || loading.delete ? 'opacity-50 cursor-not-allowed' : ''
              }`} 
              onClick={handleDelete}
              disabled={selected.length === 0 || loading.delete}
            >
              {loading.delete ? <CircularProgress size={12} /> : 'Delete'}
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                rules.length === 0 || loading.delete ? 'opacity-50 cursor-not-allowed' : ''
              }`} 
              onClick={handleClearAll}
              disabled={rules.length === 0 || loading.delete}
            >
              {loading.delete ? <CircularProgress size={12} /> : 'Clear All'}
            </button>
          </div>
          <button 
            className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" 
            onClick={() => handleOpenModal()}
          >
            Add New
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
          <span>{rules.length} items Total</span>
          <span>{itemsPerPage} Items/Page</span>
          <span>{page}/{totalPages}</span>
          <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(1)} disabled={page === 1}>First</button>
          <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</button>
          <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Next</button>
          <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}>Last</button>
          <span>Go to Page</span>
          <select className="text-xs rounded border border-gray-300 px-1 py-0.5 min-w-[40px]" value={page} onChange={e => handlePageChange(Number(e.target.value))}>
            {Array.from({ length: totalPages }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <span>{totalPages} Pages Total</span>
        </div>
        
        {/* Note Message */}
        <div className="text-red-600 text-base mt-4 text-center">
          Note: The IP-&gt;IP route takes effect after authorization!
        </div>
          </div>
      {/* Modal */}
      <Dialog 
        open={isModalOpen} 
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: { width: 600, maxWidth: '95vw', mx: 'auto', p: 0 }
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
          {formData.originalIndex !== undefined ? 'Edit IP-&gt;IP Routing Rule' : 'Add IP-&gt;IP Routing Rule'}
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
          <div className="flex flex-col gap-2 w-full">
            {/* Validation Message */}
            {validationMessage && (
              <Alert severity="warning" sx={{ fontSize: 14, mb: 1 }}>
                {validationMessage}
              </Alert>
            )}
            {ROUTE_IP_IP_FIELDS.filter(f => f.key !== 'index').map(field => (
              <div
                key={field.key}
                className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 gap-2"
                style={{ minHeight: 32 }}
              >
                <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>
                  {field.label}
                </label>
                <div className="flex-1">
                  {field.type === 'select' ? (
                    <MuiSelect
                      value={formData[field.key] || ''}
                      onChange={e => handleInputChange(field.key, e.target.value)}
                      size="small"
                      fullWidth
                      variant="outlined"
                      sx={{ fontSize: 14 }}
                      displayEmpty
                    >
                      {(field.key === 'callSource' || field.key === 'callDestination'
                        ? [
                            // Add "Please select" placeholder option
                            <MenuItem key="placeholder" value="" sx={{ fontSize: 14, color: '#999' }}>
                              Please select
                            </MenuItem>,
                            // Add SIP trunk group options
                            ...(sipTrunkGroups || []).map(group => {
                              const id = group.group_id || group.id || '';
                              const label = id !== '' ? `SIP Trunk Group [${id}]` : 'SIP Trunk Group [Any]';
                              
                              // Filter out the value that's already selected in the other field
                              const isDisabled = (field.key === 'callSource' && id === formData.callDestination) ||
                                               (field.key === 'callDestination' && id === formData.callSource);
                              
                              return (
                                <MenuItem 
                                  key={id || 'any'} 
                                  value={id} 
                                  sx={{ 
                                    fontSize: 14,
                                    color: isDisabled ? '#ccc' : 'inherit',
                                    backgroundColor: isDisabled ? '#f5f5f5' : 'inherit'
                                  }}
                                  disabled={isDisabled}
                                >
                                  {label}
                                </MenuItem>
                              );
                            })
                          ]
                        : field.options.map(opt => (
                            <MenuItem key={opt} value={opt} sx={{ fontSize: 14 }}>{opt}</MenuItem>
                          ))
                      )}
                    </MuiSelect>
                  ) : (
                    <TextField
                      type={field.type}
                      value={formData[field.key] || ''}
                      onChange={e => handleInputChange(field.key, e.target.value)}
                      size="small"
                      fullWidth
                      variant="outlined"
                      inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions 
          className="p-4 justify-center gap-12"
          style={{
            backgroundColor: '#dde0e4',
            border: '1px solid #444444',
            borderTop: 'none'
          }}
        >
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                color: '#fff',
              },
              '&:disabled': {
                background: '#f5f5f5',
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
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
                color: '#374151',
              },
              '&:disabled': {
                background: '#f5f5f5',
                color: '#666',
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

export default RouteIPIPPage;
