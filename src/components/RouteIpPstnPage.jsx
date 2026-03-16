import React, { useState, useRef, useEffect } from 'react';
import {
  ROUTE_IP_PSTN_FIELDS,
  ROUTE_IP_PSTN_INITIAL_FORM,
  ROUTE_IP_PSTN_TABLE_COLUMNS
} from '../constants/RouteIPtoPstnConstants';
import { FaPencilAlt } from 'react-icons/fa';
import { Button, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select as MuiSelect, MenuItem, FormControl, Alert, CircularProgress } from '@mui/material';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import {listIpPstnRoutes, createIpPstnRoute, updateIpPstnRoute, deleteIpPstnRoute, listGroups, listPstnGroups } from '../api/apiService';

const LOCAL_STORAGE_KEY = 'routeIpPstnRules';

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

const RouteIpPstnPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ROUTE_IP_PSTN_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [sipTrunkGroups, setSipTrunkGroups] = useState([]);
  const [pcmTrunkGroups, setPcmTrunkGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  
  // Scroll state for custom horizontal scrollbar
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, width: 0, scrollWidth: 0 });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Fetch SIP Trunk Groups for Call Source dropdown
  const fetchSipTrunkGroups = async () => {
    try {
      const response = await listGroups();
      // console.log('SIP Trunk Groups API Response:', response);
      if (response.response && response.message) {
        const sipGroups = Array.isArray(response.message) ? response.message : [response.message];
        // console.log('SIP Groups data:', sipGroups);
        setSipTrunkGroups(sipGroups);
      } else {
        // console.log('No SIP groups data found');
        setSipTrunkGroups([]);
      }
    } catch (error) {
      console.error('Error fetching SIP trunk groups:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to load SIP trunk groups');
      }
      setSipTrunkGroups([]);
    }
  };

  // Fetch PCM Trunk Groups for Call Destination dropdown
  const fetchPcmTrunkGroups = async () => {
    try {
      const response = await listPstnGroups();
      // console.log('PCM Trunk Groups API Response:', response);
      if (response.response && response.message) {
        const pcmGroups = Array.isArray(response.message) ? response.message : [response.message];
        //    console.log('PCM Groups data:', pcmGroups);
        setPcmTrunkGroups(pcmGroups);
      } else {
        // console.log('No PCM groups data found');
        setPcmTrunkGroups([]);
      }
    } catch (error) {
      console.error('Error fetching PCM trunk groups:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to load PCM trunk groups');
      }
      setPcmTrunkGroups([]);
    }
  };
  

  // Fetch IP PSTN Routes
  const fetchIpPstnRoutes = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      // console.log('Fetching IP PSTN routes...');
      const response = await listIpPstnRoutes('ip_to_pstn');
      // console.log('Fetch response:', response);
      
      if (response.response && response.message) {
        // Map API snake_case fields to camelCase for table display
        const mappedRules = response.message.map(rule => ({
          ...rule,
          callSource: rule.call_source,
          callerIdPrefix: rule.caller_id_prefix,
          calleeIdPrefix: rule.callee_id_prefix,
          callDestination: rule.call_destination,
          numberFilter: rule.number_filter
        }));
        // console.log('Mapped rules:', mappedRules);
        setRules(mappedRules);
      } else {
        // console.log('No data in response, setting empty array');
        setRules([]);
      }
    } catch (error) {
      console.error('Error fetching IP PSTN routes:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else if (error.response?.status === 500) {
        showMessage('error', 'Server error. The IP PSTN routes endpoint may have issues.');
      } else {
        showMessage('error', error.message || 'Failed to load IP PSTN routes');
      }
      setRules([]);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      // Execute all API calls in parallel using Promise.allSettled
      const [routesResult, sipGroupsResult, pcmGroupsResult] = await Promise.allSettled([
        fetchIpPstnRoutes(),
        fetchSipTrunkGroups(),
        fetchPcmTrunkGroups()
      ]);

      // Handle results (individual error handling is already in each function)
      if (routesResult.status === 'rejected') {
        console.warn('IP PSTN routes API call failed:', routesResult.reason);
      }
      if (sipGroupsResult.status === 'rejected') {
        console.warn('SIP trunk groups API call failed:', sipGroupsResult.reason);
      }
      if (pcmGroupsResult.status === 'rejected') {
        console.warn('PCM trunk groups API call failed:', pcmGroupsResult.reason);
      }
    };

    loadAllData();
  }, []);

  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      // Map API field names back to form field names
      const formData = {
        callSource: item.call_source,
        callerIdPrefix: item.caller_id_prefix,
        calleeIdPrefix: item.callee_id_prefix,
        callDestination: String(item.call_destination),
        numberFilter: item.number_filter,
        description: item.description,
        originalIndex: index
      };
      setFormData(formData);
    } else {
      // Set default values with first available options
      const defaultFormData = { ...ROUTE_IP_PSTN_INITIAL_FORM };
      
      // Set first SIP Trunk Group as default
      if (sipTrunkGroups && sipTrunkGroups.length > 0) {
        const firstSipGroup = sipTrunkGroups[0];
        defaultFormData.callSource = String(firstSipGroup.group_id || firstSipGroup.id || '');
      }
      
      // Set first PCM Trunk Group as default
      if (pcmTrunkGroups && pcmTrunkGroups.length > 0) {
        const firstPcmGroup = pcmTrunkGroups[0];
        defaultFormData.callDestination = String(firstPcmGroup.group_id || firstPcmGroup.id || firstPcmGroup);
      }
      
      setFormData(defaultFormData);
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  // Validation function for CallerID and CalleeID prefixes
  const validatePrefix = (prefix) => {
    // Allow only asterisks (*) and numbers (0-9)
    const validPrefixPattern = /^[\d*]+$/;
    return validPrefixPattern.test(prefix);
  };

  const handleSave = async () => {
    // Validate CallerID Prefix
    if (!validatePrefix(formData.callerIdPrefix)) {
      alert('Invalid CallerID Prefix! Only numbers (0-9) and asterisks (*) are allowed.');
      return;
    }

    // Validate CalleeID Prefix
    if (!validatePrefix(formData.calleeIdPrefix)) {
      alert('Invalid CalleeID Prefix! Only numbers (0-9) and asterisks (*) are allowed.');
      return;
    }
    setLoading(prev => ({ ...prev, save: true }));
    try {
      const { originalIndex, ...formDataToSave } = formData;
      
      // Map form field names to API field names
      const apiData = {
        call_source: formDataToSave.callSource,
        caller_id_prefix: formDataToSave.callerIdPrefix,
        callee_id_prefix: formDataToSave.calleeIdPrefix,
        call_destination: formDataToSave.callDestination,
        number_filter: formDataToSave.numberFilter,
        description: formDataToSave.description
      };
      
      //  console.log('Saving data:', apiData);
      
      if (originalIndex !== undefined && originalIndex > -1) {
        // Update existing route
        const response = await updateIpPstnRoute(rules[originalIndex].id, apiData, 'ip_to_pstn');
        // console.log('Update response:', response);
        if (response.response) {
          alert('Route updated successfully!');
          handleCloseModal();
          // Force refresh by clearing rules first, then fetching
          setRules([]);
          await fetchIpPstnRoutes();
        } else {
          alert('Failed to update route');
        }
      } else {
        // Create new route
        const response = await createIpPstnRoute(apiData, 'ip_to_pstn');
        //    console.log('Create response:', response);
        if (response.response) {
          alert('Route created successfully!');
          handleCloseModal();
          // Force refresh by clearing rules first, then fetching
          setRules([]);
          await fetchIpPstnRoutes();
        } else {
          alert('Failed to create route');
        }
      }
    } catch (error) {
      console.error('Error saving route:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to save route');
      }
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handlePageChange = (newPage) => setPage(Math.max(1, Math.min(totalPages, newPage)));

  const handleSelectRow = idx => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected(sel => sel.includes(realIdx) ? sel.filter(i => i !== realIdx) : [...sel, realIdx]);
  };

  // Helper function to format display values for table
  const formatDisplayValue = (key, value, rowIndex = 0) => {
    if (key === 'index') {
      // Calculate index based on current page and row position
      return (page - 1) * itemsPerPage + rowIndex + 1;
    }
    
    if (value === undefined || value === null || value === '') return '--';
    
    switch (key) {
      case 'callSource':
        return `SIP Trunk Group [${String(value)}]`;
      case 'callDestination':
        const pcmGroup = pcmTrunkGroups.find(group => String(group.group_id || group.id || group) === String(value));
        if (pcmGroup) {
          const gid = pcmGroup.group_id ?? pcmGroup.id ?? value;
          return `PCM Trunk Group [${String(gid)}]`;
        }
        return `PCM Trunk Group [${String(value)}]`;
      default:
        return String(value);
    }
  };
  const handleCheckAll = () => setSelected(rules.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () => setSelected(rules.map((_, idx) => !selected.includes(idx) ? idx : null).filter(i => i !== null));
  const handleDelete = async () => {
    if (selected.length === 0) {
      alert('Please select at least one item to delete.');
      return;
    }
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selected.length} selected item(s)?`);
    if (!confirmed) return;
    
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const deletePromises = selected.map(async (idx) => {
        const rule = rules[idx];
        if (rule && rule.id) {
          return await deleteIpPstnRoute(rule.id, 'ip_to_pstn');
        }
      });
      
      const results = await Promise.all(deletePromises);
      const allSuccessful = results.every(result => result && result.response);
      
      if (allSuccessful) {
        await fetchIpPstnRoutes(); // Refresh data
        setSelected([]);
        alert('Selected routes deleted successfully!');
      } else {
        alert('Some routes could not be deleted. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting routes:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to delete routes');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };
  const handleClearAll = async () => {
    if (rules.length === 0) {
      alert('No routes to clear.');
      return;
    }
    
    const confirmed = window.confirm(`Are you sure you want to delete ALL ${rules.length} routes? This action cannot be undone.`);
    if (!confirmed) return;
    
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      // Delete all routes one by one
      const deletePromises = rules.map(async (rule) => {
        if (rule && rule.id) {
          return await deleteIpPstnRoute(rule.id, 'ip_to_pstn');
        }
      });
      
      const results = await Promise.all(deletePromises);
      const allSuccessful = results.every(result => result && result.response);
      
      if (allSuccessful) {
        await fetchIpPstnRoutes(); // Refresh data from server
        setSelected([]);
        setPage(1);
        alert('All routes deleted successfully!');
      } else {
        alert('Some routes could not be deleted. Please try again.');
      }
    } catch (error) {
      console.error('Error clearing all routes:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to clear all routes');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
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
              IP-&gt;PSTN Routing Rule
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
                      {ROUTE_IP_PSTN_TABLE_COLUMNS.map(c => (
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
                        <td colSpan={ROUTE_IP_PSTN_TABLE_COLUMNS.length + 2} className="border border-gray-300 px-2 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <CircularProgress size={20} />
                            <span>Loading IP PSTN routes...</span>
                          </div>
                        </td>
                      </tr>
                    ) : rules.length === 0 ? (
                      <tr>
                        <td colSpan={ROUTE_IP_PSTN_TABLE_COLUMNS.length + 2} className="border border-gray-300 px-2 py-1 text-center">No data</td>
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
                            {ROUTE_IP_PSTN_TABLE_COLUMNS.map(col => (
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
            <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={handleCheckAll}>Check All</button>
            <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={handleUncheckAll}>Uncheck All</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded cursor-pointer px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={handleInverse}>Inverse</button>
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
          <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={() => handleOpenModal()}>Add New</button>
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
          {formData.originalIndex !== undefined ? 'Edit IP-&gt;PSTN Routing Rule' : 'Add IP-&gt;PSTN Routing Rule'}
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
            {ROUTE_IP_PSTN_FIELDS.map(field => (
              <div
                key={field.key}
                className="flex items-center bg-gray-50 border border-gray-200 rounded px-2 py-1 gap-2"
                style={{ minHeight: 32 }}
              >
                <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:160, marginRight:10}}>
                  {field.label}
                </label>
                <div className="flex-1">
                  {field.type === 'select' ? (
                    <FormControl fullWidth size="small">
                      <MuiSelect
                        value={formData[field.key] || ''}
                        onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={{ fontSize: 14 }}
                      >
                        {field.key === 'callSource' ? (
                          // Dynamic options from SIP Trunk Groups - show Group ID
                          (() => {
                            // console.log('Rendering Call Source dropdown with sipTrunkGroups:', sipTrunkGroups);
                            const sipOptions = (sipTrunkGroups || []).map(group => {
                              // console.log('SIP Group item:', group);
                              const groupId = group.group_id || group.id || '0';
                              return (
                                <MenuItem key={groupId} value={groupId} sx={{ fontSize: 14 }}>
                                  SIP Trunk Group [{groupId}]
                                </MenuItem>
                              );
                            });
                            
                            // Add fallback options if no data
                            if (sipOptions.length === 0) {
                              sipOptions.push(
                                <MenuItem key="any" value="any" sx={{ fontSize: 14 }}>
                                  SIP Trunk Group [Any]
                                </MenuItem>
                              );
                            }
                            
                            return sipOptions;
                          })()
                        ) : field.key === 'callDestination' ? (
                          // Dynamic options from PCM Trunk Groups - show PSTN IDs
                          (() => {
                            // console.log('Rendering Call Destination dropdown with pcmTrunkGroups:', pcmTrunkGroups);
                            const pcmOptions = (pcmTrunkGroups || []).map(group => {
                              //  console.log('PCM Group item:', group);
                              const groupId = group.group_id ?? group.id ?? group;
                              return (
                                <MenuItem key={String(groupId)} value={String(groupId)} sx={{ fontSize: 14 }}>
                                  PCM Trunk Group [{String(groupId)}]
                                </MenuItem>
                              );
                            });
                            
                            // Add fallback options if no data
                            if (pcmOptions.length === 0) {
                              pcmOptions.push(
                                <MenuItem key="any" value="any" sx={{ fontSize: 14 }}>
                                  PCM Trunk Group [Any]
                                </MenuItem>
                              );
                            }
                            
                            return pcmOptions;
                          })()
                        ) : (
                          // Static options for other fields
                          field.options.map(opt => (
                            <MenuItem key={opt} value={opt} sx={{ fontSize: 14 }}>{opt}</MenuItem>
                          ))
                        )}
                      </MuiSelect>
                    </FormControl>
                  ) : (
                    <TextField
                      type={field.type}
                      value={formData[field.key] || ''}
                      onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
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
          className="p-4 justify-center gap-6"
          style={{
            backgroundColor: '#dde0e4',
            border: '1px solid #444444',
            borderTop: 'none'
          }}
        >
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
            onClick={handleCloseModal}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
  </div>
  );
};

export default RouteIpPstnPage;
