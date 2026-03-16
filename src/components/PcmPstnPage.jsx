import React, { useState, useEffect, useRef } from 'react';
import {
  PCM_PSTN_TABLE_COLUMNS,
  SPAN_FIELDS,
  CHANNELS_FIELDS,
  VOICE_FIELDS,
  PCM_PSTN_INITIAL_FORM
} from '../constants/PcmPstnConstants';
import { listPstn, createPstn, deletePstn } from '../api/apiService';


import {
  TextField, Select, MenuItem, Button, FormControl,
  Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab,
  RadioGroup, FormControlLabel, Radio, IconButton, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';


// Reusable styles
const styles = {
  blueGradient: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
  blueGradientHover: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
  headerGradient: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
  grayGradient: 'linear-gradient(to bottom, #dfe3e8 0%, #c0c7d1 100%)',
  grayGradientHover: 'linear-gradient(to bottom, #c0c7d1 0%, #dfe3e8 100%)',
  
  button: {
    background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '14px',
    borderRadius: '6px',
    minWidth: '110px',
    height: '32px',
    textTransform: 'none',
    padding: '4px 12px',
    boxShadow: '0 2px 8px #b3e0ff',
    '&:hover': {
      background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
      boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
    }
  },
  
  grayButton: {
    background: 'linear-gradient(to bottom, #dfe3e8 0%, #c0c7d1 100%)',
    color: '#222',
    fontWeight: 600,
    fontSize: '14px',
    borderRadius: '6px',
    minWidth: '110px',
    height: '32px',
    textTransform: 'none',
    padding: '4px 12px',
    boxShadow: '0 2px 8px #ccc',
    '&:hover': {
      background: 'linear-gradient(to bottom, #c0c7d1 0%, #dfe3e8 100%)',
      boxShadow: '0 3px 10px rgba(0,0,0,0.15)'
    }
  },
  
  inputField: {
    '& .MuiOutlinedInput-root': {
      fontSize: '14px',
      '& fieldset': { borderColor: '#d1d5db' },
      '&:hover fieldset': { borderColor: '#3bb6f5' },
      '&.Mui-focused fieldset': { borderColor: '#3bb6f5' }
    }
  },
  
  selectField: {
    fontSize: '14px',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#d1d5db'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#3bb6f5'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#3bb6f5'
    }
  }
};


const PRIMARY_CHANNEL = '1-15,17-31';
const PRIMARY_HDLC = '16';
const SECONDARY_CHANNEL = '32-46,48-62';
const SECONDARY_HDLC = '47';

const normalizeChannelString = (value = '') => String(value || '').replace(/\s+/g, '');

const PcmPstnPage = () => {
  
  const [allData, setAllData] = useState([]); 
  const [data, setData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(PCM_PSTN_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(-1);
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const hasInitialLoadRef = useRef(false);
  const pollingRef = useRef(null);
  const lastVisibilityStateRef = useRef(document.visibilityState);
  
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const pagedData = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  
  // Load data on component mount
  useEffect(() => {
    // Prevent duplicate calls during React StrictMode or development double-rendering
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadPstnData();
    }
    
    // Start background polling to auto-refresh status
    // Poll faster when the tab is visible, slower when hidden
    const startPolling = () => {
      if (pollingRef.current) return; // already running
      const getIntervalMs = () => (document.visibilityState === 'visible' ? 5000 : 15000);
      let intervalMs = getIntervalMs();
      pollingRef.current = setInterval(() => {
        loadPstnData(true).catch(() => {});
        // If visibility changed since last tick, adjust interval
        const current = getIntervalMs();
        if (current !== intervalMs) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          intervalMs = current;
          startPolling();
        }
      }, intervalMs);
    };

    // Visibility/focus handlers: immediate refresh on return to tab or window focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && lastVisibilityStateRef.current !== 'visible') {
        loadPstnData(true).catch(() => {});
      }
      lastVisibilityStateRef.current = document.visibilityState;
      // Restart polling to update cadence
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      startPolling();
    };
    const handleWindowFocus = () => {
      loadPstnData(true).catch(() => {});
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    startPolling();

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };


  // Handlers
  const handleInputChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));
  const handlePageChange = (newPage) => setPage(Math.max(1, Math.min(totalPages, newPage)));
  
  
  // Load PSTN data from API
  const loadPstnData = async (isRefresh = false) => {
    // Prevent concurrent calls
    if (loading.fetch) {
      return;
    }
    
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      console.log('Attempting to load PSTN data...');
      const response = await listPstn();
      console.log('PSTN response:', response);
      
      if (response && response.success && Array.isArray(response.output)) {
        setAllData(response.output);
        setData(response.output);
        console.log('PSTN data loaded successfully:', response.output.length, 'items');
        console.log('Sample data structure:', response.output[0]); // Debug: show first item structure
      } else {
        console.log('Invalid response format:', response);
        showMessage('error', 'Failed to load PSTN data');
      }
    } catch (error) {
      console.error('Error loading PSTN data:', error);
      if (!isRefresh) {
        // Only show error on initial load, not on refresh after operations
        if (error.message === 'Network Error') {
          showMessage('error', 'Network error. Please check your connection.');
        } else if (error.response?.status === 500) {
          showMessage('error', 'Server error. The PSTN endpoint may have issues.');
        } else if (error.response?.status === 404) {
          showMessage('error', 'PSTN API endpoint not found. The server does not have the /pstn endpoint implemented yet.');
        } else {
          showMessage('error', error.message || 'Failed to load PSTN data');
        }
      } else {
        // For refresh errors, just log them - don't disturb the user
        console.warn('Refresh failed, keeping existing data:', error.message);
      }
      // Only set empty array on initial load failure, not on refresh
      if (!isRefresh) {
        setAllData([]);
        setData([]);
      }
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };
  
  const getNextAvailableSpanId = () => {
    if (allData.length === 0) {
      return 1;
    }
    
    // Get all existing span_id values as numbers
    const existingSpanIds = allData.map(item => Number(item.span_id || item.span?.id)).sort((a, b) => a - b);
    
    // Find the first gap in the sequence
    for (let i = 1; i <= Math.max(...existingSpanIds) + 1; i++) {
      if (!existingSpanIds.includes(i)) {
        return i;
      }
    }
    
    // If no gaps, return the next number after the highest
    return Math.max(...existingSpanIds) + 1;
  };


  const getAvailableSpanNos = () => {
    if (allData.length === 0) {
      return [1, 2, 3, 4, 5]; // Show first 5 available numbers
    }
    
    // Get all existing SpanNo values as numbers
    const existingSpanNos = allData.map(item => Number(item.spanNo));
    const maxSpanNo = Math.max(...existingSpanNos);
    
    // Find available numbers (gaps and next numbers)
    const availableSpanNos = [];
    for (let i = 1; i <= maxSpanNo + 5; i++) {
      if (!existingSpanNos.includes(i)) {
        availableSpanNos.push(i);
        if (availableSpanNos.length >= 5) break; // Show max 5 available numbers
      }
    }
    
    return availableSpanNos;
  };


  const validateFormData = (data) => {
    const errors = [];
    
    // Required field validation
    if (!data.id || data.id.toString().trim() === '') {
      errors.push('Span ID is required');
    }
    if (!data.context || data.context.trim() === '') {
      errors.push('Context is required');
    }
    if (!data.signalling || data.signalling.trim() === '') {
      errors.push('Signalling is required');
    }
    if (!data.bchan || data.bchan.trim() === '') {
      errors.push('Channel is required');
    }
    
    // Numeric validation
    if (data.id && isNaN(Number(data.id))) {
      errors.push('Span ID must be a valid number');
    }
    if (data.group && isNaN(Number(data.group))) {
      errors.push('Group must be a valid number');
    }
    if (data.pickupgroup && isNaN(Number(data.pickupgroup))) {
      errors.push('Pickup Group must be a valid number');
    }
    if (data.callgroup && isNaN(Number(data.callgroup))) {
      errors.push('Call Group must be a valid number');
    }
    if (data.rxgain && isNaN(Number(data.rxgain))) {
      errors.push('Rx Gain must be a valid number');
    }
    if (data.txgain && isNaN(Number(data.txgain))) {
      errors.push('Tx Gain must be a valid number');
    }
    
    // Duplicate Span ID validation (only for new items, not for editing)
    if (editIndex === -1 && data.id) {
      const spanIdExists = allData.some(item => 
        (item.span_id || item.span?.id)?.toString() === data.id.toString()
      );
      if (spanIdExists) {
        errors.push(`Span ID ${data.id} already exists. Please use a different number.`);
      }
    }
    
    return errors;
  };



  const handleRefresh = async () => {
    await loadPstnData(true);
  };


  const handleCheckAll = () => setSelectedItems(pagedData.map(item => item.spanNo));
  const handleUncheckAll = () => setSelectedItems([]);
  const handleInverse = () => {
    const ids = pagedData.map(i => i.spanNo);
    setSelectedItems(ids.filter(id => !selectedItems.includes(id)));
  };
  const handleDelete = async () => {
    if (selectedItems.length === 0) {
      showMessage('error', 'Please select items to delete');
      return;
    }

    // Show browser confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)?`);
    if (!confirmed) {
      return;
    }

    setLoading(prev => ({ ...prev, delete: true }));
    try {
       console.log('Deleting selected items:', selectedItems);
      const deletePromises = selectedItems.map(async (spanId) => {
         console.log('Deleting item:', spanId);
        return await deletePstn(spanId);
      });
      
      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        showMessage('success', `${successCount} item(s) deleted successfully`);
        
        // Try to reload data, but don't fail if it doesn't work
        try {
          await loadPstnData(true);
        } catch (reloadError) {
          console.warn('Failed to reload after delete, removing from local state:', reloadError);
          // Remove deleted items from local state as fallback
          setAllData(prev => prev.filter(item => !selectedItems.includes(item.span_id || item.span?.id)));
          setData(prev => prev.filter(item => !selectedItems.includes(item.span_id || item.span?.id)));
        }
        setSelectedItems([]); // Clear selection
      }
      
      if (failCount > 0) {
        showMessage('error', `Failed to delete ${failCount} item(s)`);
      }
    } catch (error) {
      console.error('Error deleting PSTN settings:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to delete PSTN settings');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };
  const handleClearAll = async () => {
    if (allData.length === 0) {
      showMessage('info', 'No data to clear');
      return;
    }

    if (!window.confirm('Are you sure you want to delete ALL PSTN settings? This action cannot be undone.')) {
      return;
    }

    setLoading(prev => ({ ...prev, delete: true }));
    try {
       console.log('Clearing all PSTN settings:', allData.map(item => item.span_id || item.span?.id));
      const deletePromises = allData.map(async (item) => {
        const spanId = item.span_id || item.span?.id;
         console.log('Deleting item:', spanId);
        return await deletePstn(spanId);
      });
      
      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        showMessage('success', `All ${successCount} item(s) deleted successfully`);
        
        // Try to reload data, but don't fail if it doesn't work
        try {
          await loadPstnData(true);
        } catch (reloadError) {
          console.warn('Failed to reload after clear all, clearing local state:', reloadError);
          // Clear all items from local state as fallback
          setAllData([]);
          setData([]);
        }
        setSelectedItems([]);
        setPage(1);
      }
      
      if (failCount > 0) {
        showMessage('error', `Failed to delete ${failCount} item(s)`);
      }
    } catch (error) {
      console.error('Error clearing all PSTN settings:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to clear all PSTN settings');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };


  const handleAddNew = () => {
    const nextSpanId = getNextAvailableSpanId();
    const normalizedPrimary = normalizeChannelString(PRIMARY_CHANNEL);
    const existingChannels = allData.map(item => normalizeChannelString(item.span?.bchan || item.bchan));
    const hasPrimary = existingChannels.includes(normalizedPrimary);

    const newFormData = {
      ...PCM_PSTN_INITIAL_FORM,
      id: nextSpanId,
      bchan: hasPrimary ? SECONDARY_CHANNEL : PRIMARY_CHANNEL,
      hardhdlc: hasPrimary ? SECONDARY_HDLC : PRIMARY_HDLC,
    };
    setFormData(newFormData);
    setEditIndex(-1);
    setTab(0);
    setIsModalOpen(true);
  };


  const handleEditItem = (item, index) => {
    // Map the new API response structure to form data
    const formData = {
      // Span fields
      id: item.span?.id || item.span_id || '',
      timing: String(item.span?.timing || 0),
      lbo: String(item.span?.lbo || 0),
      framing: item.span?.framing || '',
      coding: item.span?.coding || '',
      flags: (item.span?.flags === false || item.span?.flags === undefined || item.span?.flags === null) ? 'Disabled' : (item.span?.flags === true ? 'crc4' : String(item.span?.flags || 'crc4')),
      bchan: item.span?.bchan || '',
      hardhdlc: item.span?.hardhdlc || '',
      
      // Channels fields
      signalling: item.channels?.signalling || '',
      context: item.channels?.context || '',
      switchtype: item.channels?.switchtype || '',
      group: item.channels?.group || 1,
      accountcode: item.channels?.accountcode || '',
      pickupgroup: item.channels?.pickupgroup || 1,
      callgroup: item.channels?.callgroup || 1,
      pridialplan: item.channels?.pridialplan || '',
      prilocaldialplan: item.channels?.prilocaldialplan || '',
      facilityenable: item.channels?.facilityenable || 'yes',
      usecallerid: item.channels?.usecallerid || 'yes',
      hidecallerid: item.channels?.hidecallerid || 'no',
      usecallingpres: item.channels?.usecallingpres || 'yes',
      immediate: item.channels?.immediate || 'no',
      overlapdial: item.channels?.overlapdial || 'yes',
      faxdetect: item.channels?.faxdetect || 'no',
      
      // Voice fields
      rxgain: String(item.channels?.rxgain || 0.0),
      txgain: String(item.channels?.txgain || 0.0),
      echocancel: item.channels?.echocancel || 'yes',
      echocancelwhenbridged: item.channels?.echocancelwhenbridged || 'yes',
    };
    
    setFormData(formData);
    setEditIndex(index);
    setTab(0);
    setIsModalOpen(true);
  };


  const handleSave = async () => {
    // Validate form data
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join(', ');
      showMessage('error', errorMessage);
      return;
    }

    setLoading(prev => ({ ...prev, save: true }));
    try {
      // Prepare data for new API structure
      // Build span object with the exact tokens expected by DAHDI (no booleans)
      const spanPayload = {
        id: parseInt(formData.id),
        timing: parseInt(formData.timing) || 0,
        lbo: parseInt(formData.lbo) || 0,
        framing: formData.framing,
        coding: formData.coding,
        bchan: formData.bchan,
        hardhdlc: formData.hardhdlc,
        zones: {
          loadzone: "in",
          defaultzone: "in"
        }
      };
      // Only include flags when enabled; send string token like 'crc4', not boolean
      if (formData.flags && formData.flags !== 'Disabled') {
        spanPayload.flags = formData.flags; // e.g., 'crc4', 'yellow', 'nt', 'te', 'term'
      }

      const apiData = {
        span_id: parseInt(formData.id),
        span: spanPayload,
        channels: {
          channel: formData.bchan, // Use same value as bchan
          signalling: formData.signalling,
          context: formData.context,
          switchtype: formData.switchtype,
          group: parseInt(formData.group) || 1,
          language: "en", // Hardcoded
          accountcode: formData.accountcode,
          pickupgroup: parseInt(formData.pickupgroup) || 1,
          callgroup: parseInt(formData.callgroup) || 1,
          pridialplan: formData.pridialplan,
          prilocaldialplan: formData.prilocaldialplan,
          facilityenable: formData.facilityenable,
          usecallerid: formData.usecallerid,
          hidecallerid: formData.hidecallerid,
          usecallingpres: formData.usecallingpres,
          echocancel: formData.echocancel,
          echocancelwhenbridged: formData.echocancelwhenbridged,
          immediate: formData.immediate,
          overlapdial: formData.overlapdial,
          faxdetect: formData.faxdetect,
          rxgain: parseFloat(formData.rxgain) || 0.0,
          txgain: parseFloat(formData.txgain) || 0.0
        }
      };

      console.log('Creating PSTN with data:', apiData);
      const response = await createPstn(apiData);
      console.log('Create response:', response);
      
      if (response && response.success) {
        // Close modal to prevent further edits while processing
        setIsModalOpen(false);
        setEditIndex(-1);
        setLoading(prev => ({ ...prev, fetch: true }));

        // Reload data immediately and then show success message
        try {
          await loadPstnData(true);
          showMessage('success', response.message || 'PSTN settings saved successfully!');
        } catch (reloadError) {
          console.warn('Failed to reload PSTN data after creation:', reloadError);
          showMessage('success', response.message || 'PSTN settings saved successfully!');
        }
      } else {
        const apiMessage = response?.message || response?.error;
        showMessage('error', apiMessage || 'Failed to save PSTN settings. Please verify your inputs and try again.');
      }

    } catch (error) {
      console.error('Error saving PSTN settings:', error);
      let friendlyMessage = 'Failed to save PSTN settings. Please verify your inputs and try again.';
      if (error.response?.status === 400) {
        friendlyMessage = error.response?.data?.message || 'Invalid PSTN data. Please check the fields and try again.';
      } else if (error.response?.status === 409) {
        friendlyMessage = error.response?.data?.message || 'A PSTN span with this ID already exists.';
      } else if (error.response?.status === 500) {
        friendlyMessage = 'Server error while saving PSTN settings. The span configuration may be invalid or already in use.';
      } else if (error.message === 'Network Error') {
        friendlyMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        friendlyMessage = error.message;
      }
      showMessage('error', friendlyMessage);
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };


  // Render helpers


  const renderTableRow = (row, idx) => {
    const realIndex = (page - 1) * itemsPerPage + idx;
    const spanId = row.span_id || row.span?.id;
    return (
      <tr key={spanId} style={{ minHeight: 32 }}>
        <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
          <input
            type="checkbox"
            checked={selectedItems.includes(spanId)}
            onChange={() => {
              setSelectedItems(prev => 
                selectedItems.includes(spanId)
                  ? prev.filter(i => i !== spanId)
                  : [...prev, spanId]
              );
            }}
            disabled={loading.delete}
          />
        </td>
        {PCM_PSTN_TABLE_COLUMNS.map(col => {
          if (col.key === 'modify') {
            return (
              <td key={col.key} className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                <IconButton onClick={() => handleEditItem(row, realIndex)} sx={{ p: 0.5 }}>
                  <EditIcon sx={{ fontSize: 22, color: '#0e8fd6' }} />
                </IconButton>
              </td>
            );
          }
          if (col.key === 'span_status') {
            return (
              <td key={col.key} className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                <span className={`px-1 py-0.5 rounded text-xs font-semibold ${
                  row.span_status?.includes('Up') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {row.span_status || '--'}
                </span>
              </td>
            );
          }
          // Get value from appropriate section (span, channels, or root)
          const getValue = (key) => {
            if (row.span && row.span[key] !== undefined) return row.span[key];
            if (row.channels && row.channels[key] !== undefined) return row.channels[key];
            return row[key];
          };
          
          // Special handling for specific fields
          const displayValue = (key, value) => {
            if (value === undefined || value === null || value === '') return '--';
            
            // Handle timing field specifically
            if (key === 'timing') {
              return value === 0 ? '0' : value === 1 ? '1' : String(value);
            }
            
            // Handle lbo field specifically  
            if (key === 'lbo') {
              return value === 0 ? '0' : value === 1 ? '1' : String(value);
            }
            
            // Handle flags field specifically
            if (key === 'flags') {
              if (value === false || value === undefined || value === null) {
                return 'Disabled';
              }
              if (value === true) {
                return 'crc4';
              }
              return String(value);
            }
            
            return String(value);
          };
          
          return (
            <td key={col.key} className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
              {displayValue(col.key, getValue(col.key))}
            </td>
          );
        })}
      </tr>
    );
  };


  const renderFormField = (field) => (
    <div key={field.name} className="flex items-center bg-white border border-gray-300 rounded px-3 py-2 gap-3" style={{ minHeight: 36 }}>
      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:160, marginRight:15}}>
        {field.label}
        {['spanNo', 'context', 'signalling', 'status'].includes(field.name) && <span className="text-red-500 ml-1">*</span>}
        :
      </label>
      <div className="flex-1" style={{ maxWidth: 280 }}>
        {field.type === 'select' ? (
          <Select
          value={formData[field.name] || ""}
          onChange={e => handleInputChange(field.name, e.target.value)}
          size="small"
          fullWidth
          variant="outlined"
          displayEmpty
          renderValue={(selected) => {
            if (selected === "") {
              return <span style={{ color: "#9ca3af" }}>Please select</span>;
            }
            return selected;
          }}
          sx={{ fontSize: 14 }}
        >
          {/* hidden placeholder */}
          <MenuItem value="" disabled hidden />
        
          {field.options.map(opt => (
            <MenuItem key={opt} value={opt} sx={{ fontSize: 14 }}>
              {opt}
            </MenuItem>
          ))}
        </Select>
        
        ) : field.type === 'radio' ? (
          <RadioGroup row value={formData[field.name] || ''} onChange={e => handleInputChange(field.name, e.target.value)}>
            {field.options.map(opt => (
              <FormControlLabel 
                key={opt} 
                value={opt} 
                control={<Radio size="small" />} 
                label={opt}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: 14, color: '#374151' } }}
              />
            ))}
          </RadioGroup>
        ) : (
          <TextField
            type={field.type}
            value={formData[field.name] || ''}
            onChange={e => handleInputChange(field.name, e.target.value)}
            onKeyDown={e => {
              if (field.type === 'number' && e.key === 'e') {
                e.preventDefault();
              }
            }}
            size="small"
            fullWidth
            variant="outlined"
            inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
          />
        )}
      </div>
    </div>
  );


  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center" style={{backgroundColor: "#dde0e4"}}>
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
        



        {/* Header */}
        <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
          PSTN Settings
        </div>

        <div className="w-full max-w-full mx-auto" style={{ border: '2px solid #bbb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="bg-white rounded-lg shadow-sm w-full flex flex-col overflow-hidden">
            <div className="overflow-x-auto w-full border-b border-gray-300" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
              <table className="w-full min-w-[1200px] border border-gray-300 border-collapse whitespace-nowrap" style={{ tableLayout: 'auto', border: '1px solid #bbb' }}>
                <thead>
                  <tr style={{ minHeight: 32 }}>
                    <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Check</th>
                    {PCM_PSTN_TABLE_COLUMNS.map(col => (
                      <th
                        key={col.key}
                        className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center"
                        style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedData.length === 0 ? (
                    <tr>
                      <td colSpan={PCM_PSTN_TABLE_COLUMNS.length + 1} className="border border-gray-300 px-2 py-1 text-center">No data</td>
                    </tr>
                  ) : pagedData.map(renderTableRow)}
                </tbody>
              </table>
            </div>
          </div>
        </div>


        {/* Action and pagination rows OUTSIDE the border, visually separated backgrounds and gap */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full px-2 py-2" style={{ background: '#e3e7ef', marginTop: 12 }}>
          <div className="flex flex-wrap gap-2">
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleCheckAll}
              disabled={loading.delete}
            >
              Check All
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleUncheckAll}
              disabled={loading.delete}
            >
              Uncheck All
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleInverse}
              disabled={loading.delete}
            >
              Inverse
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleDelete}
              disabled={loading.delete}
            >
              {loading.delete && <CircularProgress size={12} />}
              Delete
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleClearAll}
              disabled={loading.delete}
            >
              {loading.delete && <CircularProgress size={12} />}
              Clear All
            </button>
          </div>
          <button 
            className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.save ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={handleAddNew}
            disabled={loading.save}
          >
            Add New
          </button>
        </div>


        <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
          <span>{data.length} items Total</span>
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


        {/* Modal */}
        <Dialog 
          open={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
          }} 
          maxWidth={false}
          className="z-50"
          PaperProps={{
            sx: { width: 600, maxWidth: '95vw', mx: 'auto', p: 0 }
          }}
        >
          <DialogTitle 
            className="text-white text-center font-semibold p-2 text-base"
            style={{
              background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
              borderBottom: '1px solid #444444'
            }}
          >
            {editIndex >= 0 ? 'Edit PCM PSTN Settings' : 'Add PCM PSTN Settings'}
          </DialogTitle>
          
          <div style={{ borderBottom: '1px solid #e5e7eb' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
              <Tab label="Span" sx={{ color: '#374151', fontWeight: 600, textTransform: 'none' }} />
              <Tab label="Channels" sx={{ color: '#374151', fontWeight: 600, textTransform: 'none' }} />
              <Tab label="Voice" sx={{ color: '#374151', fontWeight: 600, textTransform: 'none' }} />
            </Tabs>
          </div>
          
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
              {(tab === 0 ? SPAN_FIELDS : tab === 1 ? CHANNELS_FIELDS : VOICE_FIELDS).map(renderFormField)}
            </div>
          </DialogContent>
          
          <DialogActions className="p-4 justify-center gap-6">
            {[
              { 
                label: editIndex >= 0 ? 'Update' : 'Save', 
                handler: handleSave,
                disabled: loading.save,
                loading: loading.save
              },
              { 
                label: 'Close', 
                handler: () => setIsModalOpen(false),
                disabled: loading.save
              }
            ].map(({ label, handler, disabled, loading }) => (
              <Button 
                key={label} 
                variant="contained" 
                sx={label === 'Close' ? {
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
                } : {
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
                onClick={handler}
                disabled={disabled}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {loading ? 'Saving...' : label}
              </Button>
            ))}
          </DialogActions>
        </Dialog>
        


        
      </div>
    </div>
  );
};


export default PcmPstnPage