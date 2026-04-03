import React, { useState, useRef, useEffect } from 'react';
import {
  ROUTE_PSTN_IP_INITIAL_FORM,
  ROUTE_PSTN_IP_TABLE_COLUMNS
} from './constants/RoutePstnToIPConstants';
import { FaPencilAlt } from 'react-icons/fa';
import { Button, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select as MuiSelect, MenuItem, FormControl } from '@mui/material';
import EditDocumentIcon from '@mui/icons-material/EditDocument';

const blueBarStyle = {
  width: '100%', height: 36, background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', borderTopLeftRadius: 8, borderTopRightRadius: 8, marginBottom: 0, display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 18, color: '#2266aa', justifyContent: 'center', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
};
const tableContainerStyle = {
  width: '100%', maxWidth: '100%', margin: '0 auto', background: '#f8fafd', border: '2px solid #888', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};
const tableStyle = {
  width: '100%', borderCollapse: 'collapse',
};
const thStyle = {
  background: '#fff', color: '#222', fontWeight: 600, fontSize: 15, border: '1px solid #bbb', padding: '6px 8px', whiteSpace: 'nowrap',
};
const tdStyle = {
  border: '1px solid #bbb', padding: '6px 8px', fontSize: 14, background: '#fff', textAlign: 'center', whiteSpace: 'nowrap',
};
const tableButtonStyle = {
  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)', color: '#222', fontSize: 15, padding: '4px 18px', border: '1px solid #bbb', borderRadius: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.10)', cursor: 'pointer', fontWeight: 500,
};
const addNewButtonStyle = {
  ...tableButtonStyle, background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)', color: '#fff',
};
const paginationBarStyle = {
  display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#222', background: '#e3e7ef', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderTop: '1px solid #bbb', padding: '2px 8px', marginTop: 0, minHeight: 32,
};
const paginationButtonStyle = {
  ...tableButtonStyle, fontSize: 13, padding: '2px 10px', minWidth: 0, borderRadius: 4,
};
const pageSelectStyle = {
  fontSize: 13, padding: '2px 6px', borderRadius: 3, border: '1px solid #bbb', background: '#fff',
};
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const modalStyle = {
  background: '#f8fafd', border: '2px solid #222', borderRadius: 6, width: 440, maxWidth: '95vw', marginTop: 80, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column',
};
const modalHeaderStyle = {
  background: 'linear-gradient(to bottom, #23272b 0%, #6e7a8a 100%)', color: '#fff', fontWeight: 600, fontSize: 18, padding: '10px 0', textAlign: 'center', borderTopLeftRadius: 4, borderTopRightRadius: 4,
};
const modalBodyStyle = {
  padding: '12px 8px 0 8px', display: 'flex', flexDirection: 'column', gap: 8,
};
const modalRowStyle = {
  display: 'flex', alignItems: 'center', background: '#f4f6fa', border: '1px solid #c0c6cc', borderRadius: 4, padding: '6px 8px', marginBottom: 2, minHeight: 32, gap: 10,
};
const modalLabelStyle = {
  width: 160, fontSize: 14, color: '#222', textAlign: 'left', marginRight: 10, whiteSpace: 'nowrap',
};
const modalInputStyle = {
  width: '100%', fontSize: 14, padding: '3px 6px', borderRadius: 3, border: '1px solid #bbb', background: '#fff',
};
const modalFooterStyle = {
  display: 'flex', justifyContent: 'center', gap: 24, padding: '18px 0',
};
const modalButtonStyle = {
  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)', color: '#fff', fontSize: 16, padding: '6px 32px', border: 'none', borderRadius: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.10)', cursor: 'pointer', minWidth: 90,
};
const modalButtonGrayStyle = {
  ...modalButtonStyle, background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)', color: '#222',
};

const RoutePstnToIPPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ROUTE_PSTN_IP_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [portGroups] = useState([
    { group_id: '*', id: '*' },
    { group_id: 1, id: 1 },
    { group_id: 2, id: 2 },
    { group_id: 3, id: 3 },
    { group_id: 4, id: 4 },
    { group_id: 5, id: 5 },
  ]);
  const [indexSelect, setIndexSelect] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Get available indices for dropdown (0-63 excluding used ones, but include current edit index)
  const getAvailableIndices = (currentEditIndex = null) => {
    const currentIndex = currentEditIndex !== null && rules[currentEditIndex] ? rules[currentEditIndex].index : null;
    const usedIndices = rules
      .map((rule, idx) => currentEditIndex !== null && idx === currentEditIndex ? null : rule.index)
      .filter(idx => idx !== null && idx !== undefined);
    return Array.from({ length: 64 }, (_, i) => i)
      .filter(idx => !usedIndices.includes(idx) || idx === currentIndex)
      .map(idx => ({ value: String(idx), label: String(idx) }));
  };
  
  // Scroll state for custom horizontal scrollbar
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, width: 0, scrollWidth: 0 });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);



  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      setFormData({
        index: String(item.index || ''),
        description: item.description || 'default',
        sourcePortGroup: item.sourcePortGroup || '*',
        callerIdPrefix: item.callerIdPrefix || '*',
        calleeIdPrefix: item.calleeIdPrefix || '*',
        routeSelf: item.routeSelf || false,
        destinationAddress: item.destinationAddress || '',
        destinationPort: item.destinationPort || '5060',
      });
      setIndexSelect(String(item.index || ''));
      setEditIndex(index);
    } else {
      // Set default values with first available index
      const defaultFormData = { ...ROUTE_PSTN_IP_INITIAL_FORM };
      const available = getAvailableIndices();
      const firstAvailable = available.length > 0 ? available[0].value : '0';
      defaultFormData.index = firstAvailable;
      setFormData(defaultFormData);
      setIndexSelect(firstAvailable);
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(ROUTE_PSTN_IP_INITIAL_FORM);
    setIndexSelect('');
    setEditIndex(null);
  };

  const handleIndexSelectChange = (value) => {
    setIndexSelect(value);
    setFormData(prev => ({ ...prev, index: value }));
  };

  // Validation function for IP address
  const validateIPAddress = (ip) => {
    if (!ip || ip === '' || ip === '*') return true; // Allow empty or *
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    const parts = ip.split('.');
    if (parseInt(parts[0]) === 0 || parseInt(parts[3]) === 0) return false;
    for (let i = 0; i < parts.length; i++) {
      if (parseInt(parts[i]) > 254) return false;
    }
    return true;
  };

  // Validation function for prefixes
  const validatePrefix = (prefix) => {
    if (!prefix || prefix === '') return false;
    const regTest = /^[^\%\&\~\!\|\(\)\;\"\'\=\\]*$/;
    return regTest.test(prefix);
  };

  const handleSave = () => {
    // Validate Index
    if (!formData.index || formData.index === '') {
      alert('Index is required.');
      return;
    }
    const indexNum = parseInt(formData.index);
    if (isNaN(indexNum) || indexNum < 0 || indexNum > 63) {
      alert('Index must be between 0 and 63.');
      return;
    }

    // Check for duplicate index
    if (editIndex === null) {
      if (rules.some(r => r.index === indexNum)) {
        alert('Index already exists. Please choose a different index.');
        return;
      }
    } else {
      if (rules.some((r, idx) => idx !== editIndex && r.index === indexNum)) {
        alert('Index already exists. Please choose a different index.');
        return;
      }
    }

    // Validate Description
    if (!formData.description || formData.description === '') {
      alert('Description is required.');
      return;
    }
    if (!validatePrefix(formData.description)) {
      alert('Description cannot contain special characters like ~, !, &, | and =');
      return;
    }

    // Validate CallerID Prefix
    if (!formData.callerIdPrefix || formData.callerIdPrefix === '') {
      alert('Please enter a CallerID Prefix!');
      return;
    }
    if (!validatePrefix(formData.callerIdPrefix)) {
      alert('CallerID Prefix cannot contain special characters like ~, !, &, | and =');
      return;
    }

    // Validate CalleeID Prefix
    if (!formData.calleeIdPrefix || formData.calleeIdPrefix === '') {
      alert('Please enter a CalleeID Prefix!');
      return;
    }
    if (!validatePrefix(formData.calleeIdPrefix)) {
      alert('CalleeID Prefix cannot contain special characters like ~, !, &, | and =');
      return;
    }
    
    // Validate Destination Address if RouteSelf is not checked
    if (!formData.routeSelf) {
      if (!formData.destinationAddress || formData.destinationAddress === '') {
        alert('Please enter a Destination Address!');
        return;
      }
      if (!validateIPAddress(formData.destinationAddress)) {
        alert('Please enter a valid Destination Address!');
        return;
      }
      if (!formData.destinationPort || formData.destinationPort === '') {
        alert('Please enter a Destination Port!');
        return;
      }
    }

    const normalized = {
      index: indexNum,
      description: formData.description,
      sourcePortGroup: formData.sourcePortGroup || '*',
      callerIdPrefix: formData.callerIdPrefix,
      calleeIdPrefix: formData.calleeIdPrefix,
      routeSelf: formData.routeSelf,
      destinationAddress: formData.routeSelf ? '' : formData.destinationAddress,
      destinationPort: formData.routeSelf ? '5060' : formData.destinationPort,
      id: editIndex !== null ? rules[editIndex].id : Date.now(),
    };

    try {
      if (editIndex !== null && editIndex > -1) {
        // Update existing route
        setRules(prev => prev.map((rule, idx) => 
          idx === editIndex ? normalized : rule
        ));
          alert('Route updated successfully!');
      } else {
        // Create new route
        setRules(prev => [...prev, normalized]);
          alert('Route created successfully!');
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving route:', error);
      alert(error.message || 'Failed to save route');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

  const handleSelectRow = idx => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected(sel => sel.includes(realIdx) ? sel.filter(i => i !== realIdx) : [...sel, realIdx]);
  };

  // Helper function to format display values for table
  const formatDisplayValue = (key, value, rowIndex = 0) => {
    if (value === undefined || value === null || value === '') return '--';
    
    switch (key) {
      case 'sourcePortGroup':
        const portGroup = portGroups.find(group => String(group.group_id || group.id || group) === String(value));
        if (portGroup) {
          const gid = portGroup.group_id ?? portGroup.id ?? value;
          return String(gid);
        }
        return String(value);
      default:
        return String(value);
    }
  };
  const handleCheckAll = () => setSelected(rules.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () => setSelected(rules.map((_, idx) => !selected.includes(idx) ? idx : null).filter(i => i !== null));
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
        alert('Selected routes deleted successfully!');
    } catch (error) {
      console.error('Error deleting routes:', error);
      alert(error.message || 'Failed to delete routes');
    }
  };
  const handleClearAll = () => {
    if (rules.length === 0) {
      alert('No routes to clear.');
      return;
    }
    
    const confirmed = window.confirm(`Are you sure you want to delete ALL ${rules.length} routes? This action cannot be undone.`);
    if (!confirmed) return;
    
    try {
      setRules([]);
        setSelected([]);
        setPage(1);
        alert('All routes deleted successfully!');
    } catch (error) {
      console.error('Error clearing all routes:', error);
      alert(error.message || 'Failed to clear all routes');
    }
  };

  const rootStyle = { 
    background: '#fff', 
    minHeight: 'calc(100vh - 128px)',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: rules.length === 0 ? 'center' : 'flex-start',
    position: 'relative',
    boxSizing: 'border-box'
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{backgroundColor: "#dde0e4"}}>
      <div className="w-full max-w-full mx-auto">
        {/* Blue header bar - always show */}
        <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
              Tel-&gt;IP Routing Rule
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
                <table className="w-full min-w-[1200px] border border-gray-300 border-collapse whitespace-nowrap" style={{ tableLayout: 'auto', border: '1px solid #bbb' }}>
                  <thead>
                    <tr style={{ minHeight: 32 }}>
                      <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Check</th>
                      {ROUTE_PSTN_IP_TABLE_COLUMNS.map(c => (
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
                    {rules.length === 0 ? (
                      <tr>
                        <td colSpan={ROUTE_PSTN_IP_TABLE_COLUMNS.length + 2} className="border border-gray-300 px-2 py-1 text-center">No data</td>
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
                            {ROUTE_PSTN_IP_TABLE_COLUMNS.map(col => (
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
                selected.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`} 
              onClick={handleDelete}
              disabled={selected.length === 0}
            >
              Delete
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                rules.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`} 
              onClick={handleClearAll}
              disabled={rules.length === 0}
            >
              Clear All
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
          </div>

      {/* Modal */}
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
          Tel-&gt;IP Routing Rule
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
            {/* Index field with dropdown only */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, marginRight: 10 }}>
                Index:
              </label>
              <div className="flex-1">
                <FormControl fullWidth size="small">
                  <MuiSelect
                    value={indexSelect || ''}
                    onChange={(e) => handleIndexSelectChange(e.target.value)}
                    size="small"
                    fullWidth
                    variant="outlined"
                    sx={{ fontSize: 14 }}
                  >
                    {getAvailableIndices(editIndex).map(opt => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 14 }}>{opt.label}</MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
              </div>
            </div>

            {/* Description field */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, marginRight: 10 }}>
                Description:
              </label>
              <div className="flex-1">
                <TextField
                  type="text"
                  value={formData.description || ''}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  size="small"
                  fullWidth
                  variant="outlined"
                  inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                />
              </div>
            </div>

            {/* Source Port Group field */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, marginRight: 10 }}>
                Source Port Group:
                </label>
                <div className="flex-1">
                    <FormControl fullWidth size="small">
                      <MuiSelect
                    value={formData.sourcePortGroup || '*'}
                    onChange={e => setFormData(prev => ({ ...prev, sourcePortGroup: e.target.value }))}
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={{ fontSize: 14 }}
                      >
                    {portGroups.map(group => {
                              const groupId = group.group_id ?? group.id ?? group;
                              return (
                                <MenuItem key={String(groupId)} value={String(groupId)} sx={{ fontSize: 14 }}>
                          {String(groupId)}
                                </MenuItem>
                              );
                    })}
                      </MuiSelect>
                    </FormControl>
              </div>
            </div>

            {/* CallerID Prefix field */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, marginRight: 10 }}>
                CallerID Prefix:
              </label>
              <div className="flex-1">
                <TextField
                  type="text"
                  value={formData.callerIdPrefix || ''}
                  onChange={e => setFormData(prev => ({ ...prev, callerIdPrefix: e.target.value }))}
                  size="small"
                  fullWidth
                  variant="outlined"
                  inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                />
              </div>
            </div>

            {/* CalleeID Prefix field */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, marginRight: 10 }}>
                CalleeID Prefix:
              </label>
              <div className="flex-1">
                <TextField
                  type="text"
                  value={formData.calleeIdPrefix || ''}
                  onChange={e => setFormData(prev => ({ ...prev, calleeIdPrefix: e.target.value }))}
                  size="small"
                  fullWidth
                  variant="outlined"
                  inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                />
              </div>
            </div>

            {/* Destination Address field */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, marginRight: 10 }}>
                Destination Address:
              </label>
              <div className="flex-1">
                    <TextField
                  type="text"
                  value={formData.destinationAddress || ''}
                  onChange={e => setFormData(prev => ({ ...prev, destinationAddress: e.target.value }))}
                      size="small"
                      fullWidth
                      variant="outlined"
                      inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                    />
              </div>
                </div>

            {/* Destination Port field */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 160, marginRight: 10 }}>
                Destination Port:
              </label>
              <div className="flex-1">
                <TextField
                  type="text"
                  value={formData.destinationPort || ''}
                  onChange={e => setFormData(prev => ({ ...prev, destinationPort: e.target.value }))}
                  size="small"
                  fullWidth
                  variant="outlined"
                  inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                />
              </div>
            </div>
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
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
  </div>
  );
};

export default RoutePstnToIPPage;
