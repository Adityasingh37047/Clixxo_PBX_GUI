import React, { useState, useRef, useEffect } from 'react';
import { sipRegisterFields, SIP_REGISTER_INITIAL_FORM, CODEC_OPTIONS } from '../constants/SipRegisterConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select as MuiSelect, MenuItem, FormControl, Alert, CircularProgress, IconButton, InputAdornment, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { listSipTrunks, createSipTrunk, updateSipTrunk, deleteSipTrunk } from '../api/apiService';



const SipRegisterPage = () => {
  // State
  const [trunks, setTrunks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(SIP_REGISTER_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const hasInitialLoadRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Scroll state for custom horizontal scrollbar
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, width: 0, scrollWidth: 0 });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);
  
  // Fields to hide from the table
  const HIDDEN_TABLE_FIELDS = ['password', 'Domain name', 'Contact User', 'Outbound Proxy', 'from_user', 'expire_in_sec', 'context', 'allow_codecs'];
  const visibleFieldsCount = sipRegisterFields.filter(f => !HIDDEN_TABLE_FIELDS.includes(f.name)).length;

  // Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(trunks.length / itemsPerPage));
  const pagedTrunks = trunks.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Load trunks on component mount
  useEffect(() => {
    // Prevent duplicate calls during React StrictMode or development double-rendering
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadTrunks();
    }
  }, []);

  // Update scroll state when data changes
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
  }, [trunks, page]);
  
  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };
  
  // Helper to strip "sip:" prefix for display
  const stripSipPrefix = (value) => {
    if (!value) return '';
    return value.replace(/^sip:/i, '');
  };
  
  // Helper to add "sip:" prefix for API
  const addSipPrefix = (value) => {
    if (!value) return '';
    // Don't add if already has sip: prefix
    if (value.toLowerCase().startsWith('sip:')) return value;
    return `sip:${value}`;
  };
  
  // Fields that require "sip:" prefix
  const SIP_PREFIX_FIELDS = ['provider', 'sip_header', 'Outbound Proxy', 'server_domain', 'client_domain'];

  // Transform API data to UI format
  const transformApiToUi = (apiData) => {
    console.log('Raw API data for transformation:', apiData);
    return apiData.map((item, index) => {
      console.log('Processing item:', item);
      const trunkId = item.trunkId || '';
      const username = item.username || ''; // Use item.username directly from API
      const provider = item.provider || ''; // Use item.provider from API
      
      const result = {
        index: index.toString(), // Start from 0
        trunk_id: trunkId,
        username: username,
        context: item.context || '',
        allow_codecs: item.allow_codecs || '',
        expire_in_sec: item.expire_in_sec || '',
        provider: stripSipPrefix(provider), // Strip sip: for display
        password: item.password || '',
        sip_header: stripSipPrefix(item.sip_header || ''), // Strip sip: for display
        'Domain name': item['Domain name'] || item.from_domain || '',
        'Contact User': item['Contact User'] || item.contact_user || '',
        'Outbound Proxy': stripSipPrefix(item['Outbound Proxy'] || item.outbound_proxy || ''), // Strip sip: for display
        server_domain: stripSipPrefix(item.server_domain || ''), // Strip sip: for display
        client_domain: stripSipPrefix(item.client_domain || ''), // Strip sip: for display
        from_user: item.from_user || '',
        identity_ip: item.identity_ip || '',
        registerStatus: item.registration_status || '' // Use item.registration_status from API
      };
      console.log('Transformed result:', result);
      return result;
    });
  };
  
  // Transform UI data to API format
  const transformUiToApi = (uiData) => ({
    trunk_id:  uiData.trunk_id,
    username: uiData.username,
    password: uiData.password,
    context: uiData.context,
    allow_codecs: uiData.allow_codecs,
    expire_in_sec: uiData.expire_in_sec,
    provider: addSipPrefix(uiData.provider), // Add sip: prefix for API
    sip_header: addSipPrefix(uiData.sip_header), // Add sip: prefix for API
    from_domain: uiData['Domain name'],
    contact_user: uiData['Contact User'],
    outbound_proxy: addSipPrefix(uiData['Outbound Proxy']), // Add sip: prefix for API
    server_domain: addSipPrefix(uiData.server_domain || ''), // Add sip: prefix for API
    client_domain: addSipPrefix(uiData.client_domain || ''), // Add sip: prefix for API
    from_user: uiData.from_user || '',
    identity_ip: uiData.identity_ip || ''
  });
  
  // Load trunks from API
  const loadTrunks = async (isRefresh = false) => {
    // Prevent concurrent calls
    if (loading.fetch) {
      return;
    }
    
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      console.log('Attempting to load SIP trunks...');
      const response = await listSipTrunks();
      console.log('SIP trunks response:', response);
      if (response.response && response.message) {
        const transformedTrunks = transformApiToUi(response.message);
        console.log('Transformed trunks:', transformedTrunks);
        setTrunks(transformedTrunks);
      } else {
        console.log('Invalid response format:', response);
        showMessage('error', 'Failed to load SIP trunks');
      }
    } catch (error) {
      console.error('Error loading SIP trunks:', error);
      if (!isRefresh) {
        // Only show error on initial load, not on refresh after operations
        if (error.message === 'Network Error') {
          showMessage('error', 'Network error. Please check your connection.');
        } else if (error.response?.status === 500) {
          showMessage('error', 'Server error. The list endpoint may have issues.');
        } else {
          showMessage('error', error.message || 'Failed to load SIP trunks');
        }
      } else {
        // For refresh errors, just log them - don't disturb the user
        console.warn('Refresh failed, keeping existing data:', error.message);
      }
      // Only set empty array on initial load failure, not on refresh
      if (!isRefresh) {
        setTrunks([]);
      }
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };
  // Modal logic
  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      // When editing, use existing data as-is (no need to re-enter)
      setForm({ ...row });
      setEditIndex(idx);
    } else {
      // When adding new, auto-populate index with next available number
      const nextIndex = trunks.length.toString(); // Next index based on current count
      setForm({ 
        ...SIP_REGISTER_INITIAL_FORM,
        index: nextIndex // Auto-populate with next index
        // sip: prefix fields will be handled in the input onChange
      });
      setEditIndex(null);
    }
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setShowPassword(false); // Reset password visibility when closing modal
    setValidationErrors({}); // Clear validation errors when closing modal
  };
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
    
    // Real-time validation for specific fields
    let error = null;
    switch (key) {
      case 'trunk_id':
        error = validateTrunkId(value);
        break;
      case 'username':
        error = validateUsername(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'context':
        error = validateContext(value);
        break;
      case 'allow_codecs':
        error = validateAllowCodecs(value);
        break;
      case 'expire_in_sec':
        error = validateExpireInSec(value);
        break;
      case 'provider':
        error = validateProvider(value);
        break;
      case 'sip_header':
        error = validateSipHeader(value);
        break;
      case 'server_domain':
        error = validateServerDomain(value);
        break;
      case 'client_domain':
        error = validateClientDomain(value);
        break;
      case 'identity_ip':
        error = validateIdentityIp(value);
        break;
      default:
        break;
    }
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, [key]: error }));
    }
  };
  
  const handleCodecChange = (codec, checked) => {
    setForm(prev => {
      const currentCodecs = prev.allow_codecs ? prev.allow_codecs.split(',').map(c => c.trim()) : [];
      let newCodecs;
      
      if (checked) {
        // Add codec if not already present
        if (!currentCodecs.includes(codec)) {
          newCodecs = [...currentCodecs, codec];
        } else {
          newCodecs = currentCodecs;
        }
    } else {
        // Remove codec
        newCodecs = currentCodecs.filter(c => c !== codec);
      }
      
      const newCodecsString = newCodecs.join(',');
      
      // Clear validation error for allow_codecs when user changes codecs
      if (validationErrors.allow_codecs) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.allow_codecs;
          return newErrors;
        });
      }
      
      // Real-time validation
      const codecError = validateAllowCodecs(newCodecsString);
      if (codecError) {
        setValidationErrors(prev => ({ ...prev, allow_codecs: codecError }));
      }
      
      return { ...prev, allow_codecs: newCodecsString };
    });
  };
  
  const isCodecSelected = (codec) => {
    if (!form.allow_codecs) return false;
    const currentCodecs = form.allow_codecs.split(',').map(c => c.trim());
    return currentCodecs.includes(codec);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Validation functions
  const validateTrunkId = (trunkId) => {
    if (!trunkId || trunkId.trim() === '') {
      return 'Trunk ID is required';
    }
    return null;
  };
  
  const validateUsername = (username) => {
    if (!username || username.trim() === '') {
      return 'Username is required';
    }
    return null;
  };
  
  const validatePassword = (password) => {
    if (!password || password.trim() === '') {
      return 'Password is required';
    }
    return null;
  };
  
  const validateContext = (context) => {
    if (!context || context.trim() === '') {
      return 'Context is required';
    }
    return null;
  };
  
  const validateAllowCodecs = (allowCodecs) => {
    if (!allowCodecs || allowCodecs.trim() === '') {
      return 'Allow Codecs is required';
    }
    return null;
  };
  
  const validateExpireInSec = (expireInSec) => {
    const valueStr = expireInSec == null ? '' : String(expireInSec);
    if (valueStr.trim() === '') return 'Expire In Sec is required';
    // Optional: ensure it is a positive integer
    if (!/^\d+$/.test(valueStr)) return 'Expire In Sec must be a number';
    return null;
  };
  
  const validateProvider = (provider) => {
    if (!provider || provider.trim() === '') {
      return 'Provider is required (e.g., example.com:5060)';
    }
    return null;
  };
  
  const validateSipHeader = (sipHeader) => {
    if (!sipHeader || sipHeader.trim() === '') {
      return 'SIP Header is required (e.g., example.com)';
    }
    return null;
  };
  
  const validateServerDomain = (serverDomain) => {
    if (!serverDomain || serverDomain.trim() === '') {
      return 'Server Domain is required (e.g., sip.domain.in)';
    }
    return null;
  };
  
  const validateClientDomain = (clientDomain) => {
    if (!clientDomain || clientDomain.trim() === '') {
      return 'Client Domain is required (e.g., +91XXXXXXXXXX@sip.domain.in)';
    }
    return null;
  };
  
  const validateIdentityIp = (identityIp) => {
    if (!identityIp || identityIp.trim() === '') {
      return 'Identity IP is required (e.g., 15.158.34.15)';
    }
    return null;
  };
  
  const validateForm = () => {
    const errors = {};
    
    const trunkIdError = validateTrunkId(form.trunk_id);
    if (trunkIdError) errors.trunk_id = trunkIdError;
    
    const usernameError = validateUsername(form.username);
    if (usernameError) errors.username = usernameError;
    
    const passwordError = validatePassword(form.password);
    if (passwordError) errors.password = passwordError;
    
    const contextError = validateContext(form.context);
    if (contextError) errors.context = contextError;
    
    const allowCodecsError = validateAllowCodecs(form.allow_codecs);
    if (allowCodecsError) errors.allow_codecs = allowCodecsError;
    
    const expireInSecError = validateExpireInSec(form.expire_in_sec);
    if (expireInSecError) errors.expire_in_sec = expireInSecError;
    
    const providerError = validateProvider(form.provider);
    if (providerError) errors.provider = providerError;
    
    const sipHeaderError = validateSipHeader(form.sip_header);
    if (sipHeaderError) errors.sip_header = sipHeaderError;
    
    const serverDomainError = validateServerDomain(form.server_domain);
    if (serverDomainError) errors.server_domain = serverDomainError;
    
    const clientDomainError = validateClientDomain(form.client_domain);
    if (clientDomainError) errors.client_domain = clientDomainError;
    
    const identityIpError = validateIdentityIp(form.identity_ip);
    if (identityIpError) errors.identity_ip = identityIpError;
    
    return errors;
  };
  
  const handleSave = async () => {
    // Comprehensive validation
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      // Show the first validation error
      const firstError = Object.values(validationErrors)[0];
      showMessage('error', firstError);
      return;
    }
    
    setLoading(prev => ({ ...prev, save: true }));
    try {
      const apiData = transformUiToApi(form);
      
      if (editIndex !== null) {
        // Update existing trunk
        console.log('Updating SIP trunk with data:', apiData);
        const response = await updateSipTrunk(apiData);
        console.log('Update response:', response);
        if (response.response) {
          showMessage('success', response.message || 'Trunk updated successfully');
          
          // Try to reload data, but don't fail if it doesn't work
          try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Allow backend to process
            console.log('Attempting to reload after successful update...');
            await loadTrunks(true);
            console.log('Reload successful after update');
          } catch (reloadError) {
            console.warn('Failed to reload trunks after update:', reloadError);
            console.log('Updating item in local state as fallback');
            // Update the item in local state
            setTrunks(prev => prev.map((trunk, idx) => 
              idx === editIndex ? { ...trunk, ...form, registerStatus: 'registered' } : trunk
            ));
          }
        } else {
          showMessage('error', 'Failed to update trunk');
        }
      } else {
        // Create new trunk
        console.log('Creating SIP trunk with data:', apiData);
        const response = await createSipTrunk(apiData);
        console.log('Create response:', response);
        if (response.response) {
          showMessage('success', response.message || 'Trunk created successfully');
          
          // Try to reload data, but don't fail if it doesn't work
          try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Allow backend to process
            console.log('Attempting to reload after successful creation...');
            await loadTrunks(true);
            // console.log('Reload successful after creation');
          } catch (reloadError) {
            console.warn('Failed to reload trunks after creation:', reloadError);
            console.log('Adding item to local state as fallback');
            // Don't show error to user since the creation was successful
            // Just add the new item to the local state
            setTrunks(prev => {
              const newTrunk = {
                index: prev.length.toString(), // Use array length as index (0-based)
                trunk_id: form.trunk_id,
                username: form.username,
                context: form.context,
                allow_codecs: form.allow_codecs,
                expire_in_sec: form.expire_in_sec,
                provider: form.provider,
                sip_header: form.sip_header,
                registerStatus: 'registered'
              };
              console.log('Adding new trunk to local state:', newTrunk);
              console.log('Previous state length:', prev.length);
              return [...prev, newTrunk];
            });
          }
        } else {
          showMessage('error', 'Failed to create trunk');
        }
      }
      
    setShowModal(false);
    setEditIndex(null);
    } catch (error) {
      console.error('Error saving SIP trunk:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to save trunk');
      }
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };
  // Table selection logic
  const handleSelectRow = idx => {
    setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  };
  const handleCheckAll = () => setSelected(trunks.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () => setSelected(trunks.map((_, idx) => selected.includes(idx) ? null : idx).filter(i => i !== null));
  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage('error', 'Please select trunks to delete');
      return;
    }
    
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      console.log('Deleting selected trunks:', selected.map(idx => trunks[idx]?.trunk_id));
      const deletePromises = selected.map(async (idx) => {
        const trunk = trunks[idx];
        console.log('Deleting trunk:', trunk.trunk_id);
        return await deleteSipTrunk(trunk.trunk_id);
      });
      
      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value.response).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        showMessage('success', `${successCount} trunk(s) deleted successfully`);
        
        // Try to reload data, but don't fail if it doesn't work
        try {
          await loadTrunks(true); // Reload trunks to get fresh data
        } catch (reloadError) {
          console.warn('Failed to reload after delete, removing from local state:', reloadError);
          // Remove deleted items from local state as fallback
          setTrunks(prev => prev.filter((_, idx) => !selected.includes(idx)));
        }
        setSelected([]); // Clear selection
      }
      
      if (failCount > 0) {
        showMessage('error', `Failed to delete ${failCount} trunk(s)`);
      }
    } catch (error) {
      console.error('Error deleting SIP trunks:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to delete trunks');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };
  const handleClearAll = async () => {
    if (trunks.length === 0) {
      showMessage('info', 'No trunks to clear');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete ALL SIP trunks? This action cannot be undone.')) {
      return;
    }
    
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      console.log('Clearing all trunks:', trunks.map(t => t.trunk_id));
      const deletePromises = trunks.map(async (trunk) => {
        console.log('Deleting trunk:', trunk.trunk_id);
        return await deleteSipTrunk(trunk.trunk_id);
      });
      
      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value.response).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        showMessage('success', `All ${successCount} trunk(s) deleted successfully`);
        
        // Try to reload data, but don't fail if it doesn't work
        try {
          await loadTrunks(true); // Reload trunks to get fresh data
        } catch (reloadError) {
          console.warn('Failed to reload after clear all, clearing local state:', reloadError);
          // Clear all items from local state as fallback
          setTrunks([]);
        }
        setSelected([]);
        setPage(1);
      }
      
      if (failCount > 0) {
        showMessage('error', `Failed to delete ${failCount} trunk(s)`);
      }
    } catch (error) {
      console.error('Error clearing all SIP trunks:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to clear all trunks');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };
  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
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

  // Calculate scrollbar thumb dimensions
  const thumbWidth = scrollState.width && scrollState.scrollWidth ? Math.max(40, (scrollState.width / scrollState.scrollWidth) * (scrollState.width - 8)) : 40;
  const thumbLeft = scrollState.width && scrollState.scrollWidth && scrollState.scrollWidth > scrollState.width ? ((scrollState.left / (scrollState.scrollWidth - scrollState.width)) * (scrollState.width - thumbWidth - 16)) : 0;

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

      {/* Main Content */}
      <div className="w-full max-w-full mx-auto">
        {/* Blue header bar - always show */}
        <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
              SIP Register
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
                  maxHeight: 360,
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <table className="w-full min-w-[1400px] border border-gray-300 border-collapse whitespace-nowrap" style={{ tableLayout: 'auto', border: '1px solid #bbb' }}>
                  <thead>
                    <tr style={{ minHeight: 32 }}>
                      <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Check</th>
                      {sipRegisterFields.filter(f => !HIDDEN_TABLE_FIELDS.includes(f.name)).map(field => (
                        <th
                          key={field.name}
                          className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center"
                          style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}
                        >
                          {field.label}
                        </th>
                      ))}
                      <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Status</th>
                      <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Modify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading.fetch ? (
                      <tr>
                        <td colSpan={visibleFieldsCount + 3} className="border border-gray-300 px-2 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <CircularProgress size={20} />
                            <span>Loading trunks...</span>
                          </div>
                        </td>
                      </tr>
                    ) : trunks.length === 0 ? (
                      <tr>
                        <td colSpan={visibleFieldsCount + 3} className="border border-gray-300 px-2 py-1 text-center">No data</td>
                      </tr>
                    ) : (
                      pagedTrunks.map((trunk, idx) => {
                        const realIdx = (page - 1) * itemsPerPage + idx;
                        return (
                          <tr key={realIdx} style={{ minHeight: 32 }}>
                            <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                              <input
                                type="checkbox"
                                checked={selected.includes(realIdx)}
                                onChange={() => handleSelectRow(realIdx)}
                                disabled={loading.delete}
                              />
                            </td>
                            {sipRegisterFields.filter(f => !HIDDEN_TABLE_FIELDS.includes(f.name)).map(field => {
                              const value = trunk[field.name];
                              const hasValue = value !== undefined && value !== null && value !== '';
                              // Add sip: prefix for display in table for these fields
                              const displayValue = hasValue && SIP_PREFIX_FIELDS.includes(field.name) 
                                ? `sip:${value}` 
                                : (hasValue ? value : '--');
                              return (
                                <td
                                  key={field.name}
                                  className="border border-gray-300 text-center bg-white"
                                  style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}
                                >
                                  {displayValue}
                                </td>
                              );
                            })}
                            <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                trunk.registerStatus?.toLowerCase() === 'registered' ? 'bg-green-100 text-green-800' :
                                trunk.registerStatus?.toLowerCase() === 'unregistered' ? 'bg-red-100 text-red-800' :
                                trunk.registerStatus?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                                trunk.registerStatus?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {trunk.registerStatus || '--'}
                              </span>
                            </td>
                            <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                              <EditDocumentIcon 
                                className={`cursor-pointer text-blue-600 mx-auto ${loading.delete ? 'opacity-50' : ''}`} 
                                onClick={() => !loading.delete && handleOpenModal(trunk, realIdx)} 
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
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} 
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
            onClick={() => handleOpenModal()}
            disabled={loading.save}
          >
            Add New
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
          <span>{trunks.length} items Total</span>
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
        open={showModal} 
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
          {editIndex !== null ? 'Edit SIP Register' : 'Add SIP Register'}
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
            {sipRegisterFields.map(field => (
              <div
                key={field.name}
                className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 gap-2"
                style={{ minHeight: 32 }}
              >
                <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>
                  {field.label}:
                </label>
                <div className="flex-1">
                                {field.name === 'trunk_id' && field.type === 'select' ? (
                    <div className="w-full">
                      <FormControl fullWidth size="small" variant="outlined" error={!!validationErrors[field.name]}>
                      <MuiSelect
                          value={form[field.name] || ''}
                          onChange={e => handleChange(field.name, e.target.value)}
                          disabled={loading.fetch || editIndex !== null}
                          displayEmpty
                          sx={{ fontSize: 14 }}
                        >
                          <MenuItem value="" disabled>
                            {loading.fetch ? 'Loading trunks...' : 'Select Trunk ID'}
                          </MenuItem>
                          {trunkOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                      {validationErrors[field.name] && (
                        <div className="text-red-500 text-xs mt-1">{validationErrors[field.name]}</div>
                      )}
                    </div>
                  ) : field.name === 'password' ? (
                    <div className="w-full">
                      <TextField
                        type={showPassword ? 'text' : 'password'}
                        value={form[field.name] || ''}
                        onChange={e => handleChange(field.name, e.target.value)}
                        size="small"
                        fullWidth
                        variant="outlined"
                        placeholder="Enter password"
                        error={!!validationErrors[field.name]}
                        inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={togglePasswordVisibility}
                                edge="end"
                                size="small"
                                sx={{ padding: '2px' }}
                              >
                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {validationErrors[field.name] && (
                        <div className="text-red-500 text-xs mt-1">{validationErrors[field.name]}</div>
                      )}
                    </div>
                  ) : field.name === 'allow_codecs' ? (
                    <div className="w-full">
                      <FormGroup row sx={{ gap: 1 }}>
                        {CODEC_OPTIONS.map(codec => (
                          <FormControlLabel
                            key={codec.value}
                            control={
                              <Checkbox
                                checked={isCodecSelected(codec.value)}
                                onChange={(e) => handleCodecChange(codec.value, e.target.checked)}
                                size="small"
                                sx={{ 
                                  padding: '2px 4px',
                                  '& .MuiSvgIcon-root': { fontSize: 16 }
                                }}
                              />
                            }
                            label={codec.label}
                            sx={{
                              margin: 0,
                              '& .MuiFormControlLabel-label': {
                                fontSize: 13,
                                fontWeight: 500,
                                color: '#374151'
                              }
                            }}
                          />
                        ))}
                      </FormGroup>
                      {validationErrors.allow_codecs && (
                        <div className="text-red-500 text-xs mt-1">{validationErrors.allow_codecs}</div>
                      )}
                    </div>
                  ) : field.name === 'context' ? (
                    <div className="w-full">
                      <FormControl fullWidth size="small" error={!!validationErrors.context}>
                        <MuiSelect
                          value={form.context || ''}
                          displayEmpty
                          onChange={e => handleChange('context', e.target.value)}
                          inputProps={{ 'aria-label': 'Select Context' }}
                          sx={{ '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                        >
                          <MenuItem value="" disabled>
                            <em>Select Context</em>
                          </MenuItem>
                          {Array.from({ length: 10 }, (_, i) => `sip${i+1}`).map(ctx => (
                            <MenuItem key={ctx} value={ctx}>{ctx}</MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                      {validationErrors.context && (
                        <div className="text-red-500 text-xs mt-1">{validationErrors.context}</div>
                      )}
                    </div>
                  ) : field.name === 'provider' ? (
                    <div className="w-full">
                      <TextField
                        type="text"
                        value={form.provider || ''}
                        onChange={e => {
                          handleChange('provider', e.target.value);
                        }}
                        size="small"
                        fullWidth
                        variant="outlined"
                        error={!!validationErrors.provider}
                        placeholder="sip.domain.in"
                        inputProps={{ 
                          style: { fontSize: 14, padding: '3px 6px' },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>sip:</span>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {validationErrors.provider && (
                        <div className="text-red-500 text-xs mt-1">{validationErrors.provider}</div>
                      )}
                    </div>
                  ) : SIP_PREFIX_FIELDS.includes(field.name) ? (
                    <div className="w-full">
                      <TextField
                        type="text"
                        value={form[field.name] || ''}
                        onChange={e => handleChange(field.name, e.target.value)}
                        size="small"
                        fullWidth
                        variant="outlined"
                        error={!!validationErrors[field.name]}
                        placeholder={
                          field.name === 'sip_header' ? "+91XXXXXXXXXX@sip.domain.in" :
                          field.name === 'Outbound Proxy' ? "15.158.34.15" :
                          field.name === 'server_domain' ? "sip.domain.in" :
                          field.name === 'client_domain' ? "+91XXXXXXXXXX@sip.domain.in" :
                          `Enter ${field.label.toLowerCase()}`
                        }
                        inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>sip:</span>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {validationErrors[field.name] && (
                        <div className="text-red-500 text-xs mt-1">{validationErrors[field.name]}</div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full">
                    <TextField
                        type="text"
                      value={form[field.name] || ''}
                      onChange={e => handleChange(field.name, e.target.value)}
                      size="small"
                      fullWidth
                      variant="outlined"
                        error={!!validationErrors[field.name]}
                        disabled={field.name === 'index' || (field.name === 'trunk_id' && editIndex !== null)}
                        placeholder={
                          field.name === 'extension' ? "e.g., 1001" :
                          field.name === 'context' ? "e.g., testing" :
                          field.name === 'index' ? "Auto-generated" :
                          field.name === 'username' ? "+91XXXXXXXXXX" :
                          field.name === 'Domain name' ? "sip.domain.in" :
                          field.name === 'Contact User' ? "+91XXXXXXXXXX" :
                          field.name === 'identity_ip' ? "15.158.34.15" :
                          field.name === 'from_user' ? "+91XXXXXXXXXX" :
                          `Enter ${field.label.toLowerCase()}`
                        }
                      inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                    />
                      {validationErrors[field.name] && (
                        <div className="text-red-500 text-xs mt-1">{validationErrors[field.name]}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>  
        </DialogContent>
        <DialogActions className="p-4 justify-center gap-12">
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
  );to 
};

export default SipRegisterPage;
