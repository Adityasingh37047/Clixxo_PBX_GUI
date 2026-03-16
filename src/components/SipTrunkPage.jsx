import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SIP_TRUNK_FIELDS, SIP_TRUNK_INITIAL_FORM, TRUNK_CODEC_OPTIONS } from '../constants/SipTrunkConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select as MuiSelect, MenuItem, FormControl, Alert, CircularProgress, IconButton, InputAdornment, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { listGlobalSipSettings, updateGlobalSipSettings, fetchSystemInfo } from '../api/apiService';

const SipTrunkPage = () => {
  // State
  const [registers, setRegisters] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(SIP_TRUNK_INITIAL_FORM);
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
  const [localIpOptions, setLocalIpOptions] = useState([
    { value: 'lan1-unavailable', label: 'LAN 1 (Unavailable)', disabled: true },
    { value: 'lan2-unavailable', label: 'LAN 2 (Unavailable)', disabled: true },
    { value: '0.0.0.0', label: 'Any LAN (0.0.0.0)' },
  ]);
  
  // Scroll state for custom horizontal scrollbar
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, width: 0, scrollWidth: 0 });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);
  
  // Fields to hide from the table
  const HIDDEN_TABLE_FIELDS = ['working_period_text', 'sip_agent', 'username', 'password', 'allow_codecs', 'working_period', 'vos11_rtp_encryptkey', 'encrypt_key', 'external_bound_address', 'external_bound_port'];
  const visibleTableFields = useMemo(
    () => SIP_TRUNK_FIELDS.filter(field => !HIDDEN_TABLE_FIELDS.includes(field.name)),
    []
  );
  const visibleFieldsCount = visibleTableFields.length;
  const buildFormStateFromSettings = (settings = {}) => {
    const base = { ...SIP_TRUNK_INITIAL_FORM };
    if (settings.id !== undefined && settings.id !== null) {
      base.index = String(settings.id);
    }
    if (settings.description) {
      base.description = String(settings.description).trim() || base.description;
    }
    if (settings.local_ip !== undefined) {
      base.local_ip = String(settings.local_ip).trim();
    }
    if (settings.local_port !== undefined) {
      base.local_port = String(settings.local_port);
    }
    if (settings.transport_mode) {
      base.transport_mode = String(settings.transport_mode).toUpperCase();
    }
    if (settings.srtp_mode) {
      base.srtp_mode = String(settings.srtp_mode).toLowerCase();
    }
    if (settings.dtmf_mode) {
      base.dtmf_mode = String(settings.dtmf_mode).toLowerCase();
    }
    if (settings.external_bound_flag) {
      const flag = String(settings.external_bound_flag).toUpperCase();
      base.external_bound_flag = flag === 'Y' ? 'Y' : 'N';
    }
    if (settings.external_bound_address !== undefined) {
      base.external_bound_address = String(settings.external_bound_address).trim();
    }
    if (settings.external_bound_port !== undefined) {
      base.external_bound_port = String(settings.external_bound_port);
    }

    if (base.external_bound_flag !== 'Y') {
      base.external_bound_flag = 'N';
      base.external_bound_address = '';
      base.external_bound_port = '';
    }

    base.local_ip = base.local_ip || SIP_TRUNK_INITIAL_FORM.local_ip;
    base.local_port = base.local_port || SIP_TRUNK_INITIAL_FORM.local_port;
    base.transport_mode = base.transport_mode || SIP_TRUNK_INITIAL_FORM.transport_mode;
    base.srtp_mode = base.srtp_mode || SIP_TRUNK_INITIAL_FORM.srtp_mode;
    base.dtmf_mode = base.dtmf_mode || SIP_TRUNK_INITIAL_FORM.dtmf_mode;

    return base;
  };

  const renderCellValue = (field, row) => {
    const raw = row[field.name];
    if (raw === undefined || raw === null || raw === '') return '--';
    if (field.name === 'local_ip') {
      const match = localIpOptions.find(option => option.value === raw);
      if (match) return match.label;
    }
    if (field.type === 'select' && Array.isArray(field.options)) {
      const match = field.options.find(option => option.value === raw);
      return match ? match.label : raw;
    }
    return raw;
  };
  
  // Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(registers.length / itemsPerPage));
  const pagedRegisters = registers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const fetchGlobalSipSettings = async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const payload = await listGlobalSipSettings();
      const settings = payload?.message?.sip_settings?.[0];
      if (settings) {
        const formState = buildFormStateFromSettings(settings);
        const tableRow = {
          ...formState,
          status: 'active',
          id: settings.id ?? formState.index
        };
        setRegisters([tableRow]);
        setForm(formState);
      } else {
        setRegisters([]);
        setForm({ ...SIP_TRUNK_INITIAL_FORM });
      }
    } catch (error) {
      console.error('Failed to fetch global SIP settings', error);
      setRegisters([]);
      setForm({ ...SIP_TRUNK_INITIAL_FORM });
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      fetchGlobalSipSettings();
      const loadLocalIps = async () => {
        const ensureCurrentValue = (options) => {
          if (!form.local_ip) return options;
          if (options.some(opt => opt.value === form.local_ip)) return options;
          return [...options, { value: form.local_ip, label: form.local_ip }];
        };
        try {
          const si = await fetchSystemInfo();
          const details = si?.details || si?.responseData || {};
          let rawInterfaces = [];
          if (Array.isArray(details.LAN_INTERFACES)) {
            rawInterfaces = details.LAN_INTERFACES;
          } else if (details.LAN_INTERFACES && typeof details.LAN_INTERFACES === 'object') {
            rawInterfaces = Object.entries(details.LAN_INTERFACES).map(([name, data]) => ({ name, data }));
          } else if (Array.isArray(details.interfaces)) {
            rawInterfaces = details.interfaces;
          } else if (details.network && Array.isArray(details.network.interfaces)) {
            rawInterfaces = details.network.interfaces;
          }

          const toIp = (dataObj) => {
            if (!dataObj || typeof dataObj !== 'object') return '';
            for (const val of Object.values(dataObj)) {
              if (typeof val === 'string' && /^(\d{1,3}\.){3}\d{1,3}$/.test(val)) return val;
              if (Array.isArray(val)) {
                for (const inner of val) {
                  if (typeof inner === 'string' && /^(\d{1,3}\.){3}\d{1,3}$/.test(inner)) return inner;
                }
              }
            }
            return '';
          };

          let lan1 = '';
          let lan2 = '';
          (rawInterfaces || []).forEach((iface) => {
            const name = (iface && iface.name) ? String(iface.name) : '';
            const data = iface?.data || iface;
            if (name === 'eth0' || name === 'LAN 1') lan1 = toIp(data) || lan1;
            if (name === 'eth1' || name === 'LAN 2') lan2 = toIp(data) || lan2;
          });

          const orderedOptions = [];
          orderedOptions.push({
            value: lan1 || 'lan1-unavailable',
            label: lan1 ? `LAN 1 (${lan1})` : 'LAN 1 (Unavailable)',
            disabled: !lan1,
          });
          orderedOptions.push({
            value: lan2 || 'lan2-unavailable',
            label: lan2 ? `LAN 2 (${lan2})` : 'LAN 2 (Unavailable)',
            disabled: !lan2,
          });
          orderedOptions.push({ value: '0.0.0.0', label: 'Any LAN (0.0.0.0)' });

          setLocalIpOptions(ensureCurrentValue(orderedOptions));
        } catch (error) {
          console.warn('Failed to load system info for LAN IPs', error);
          setLocalIpOptions(ensureCurrentValue([
            { value: 'lan1-unavailable', label: 'LAN 1 (Unavailable)', disabled: true },
            { value: 'lan2-unavailable', label: 'LAN 2 (Unavailable)', disabled: true },
            { value: '0.0.0.0', label: 'Any LAN (0.0.0.0)' },
          ]));
        }
      };
      loadLocalIps();
    }
  }, []);

  useEffect(() => {
    if (!form.local_ip) return;
    setLocalIpOptions(prev => {
      if (prev.some(opt => opt.value === form.local_ip)) return prev;
      return [...prev, { value: form.local_ip, label: form.local_ip }];
    });
  }, [form.local_ip]);

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
  }, [registers, page]);
  
  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };
  
  // Modal logic
  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      setForm(buildFormStateFromSettings(row));
      setEditIndex(idx);
    } else {
      setForm(buildFormStateFromSettings(form));
      setEditIndex(null);
    }
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setShowPassword(false);
    setValidationErrors({});
  };

  // Form handling
  const handleChange = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'external_bound_flag') {
        if (value !== 'Y') {
          next.external_bound_flag = 'N';
          next.external_bound_address = '';
          next.external_bound_port = '';
        }
      }
      return next;
    });
    
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
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
      
      return { ...prev, allow_codecs: newCodecs.join(',') };
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
  
  const handleSave = async () => {
    setLoading(prev => ({ ...prev, save: true }));
    
    const safeTrim = (val, fallback = '') => {
      const value = val === undefined || val === null ? fallback : val;
      return String(value).trim();
    };

    // Validate duplicate group (index) locally and alert user
    const desiredIndex = String(form.index ?? '').trim();
    if (desiredIndex !== '') {
      const duplicate = registers.some((r, idx) => {
        // allow same index when editing the same row
        if (editIndex !== null && idx === editIndex) return false;
        return String(r.index ?? r.id ?? '').trim() === desiredIndex;
      });
      if (duplicate) {
        alert(`Group number ${desiredIndex} already exists. Please choose a different group number.`);
        setLoading(prev => ({ ...prev, save: false }));
        return;
      }
    }

    if (form.external_bound_flag === 'Y') {
      const address = safeTrim(form.external_bound_address);
      const port = safeTrim(form.external_bound_port);
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      const portNum = Number(port);

      if (!address || !ipRegex.test(address)) {
        alert('Please enter a valid Externally Bound Address (example: 192.168.1.10).');
        setLoading(prev => ({ ...prev, save: false }));
        return;
      }

      if (!port || isNaN(portNum) || portNum < 1 || portNum > 65535) {
        alert('Please enter a valid Externally Bound Port (1-65535).');
        setLoading(prev => ({ ...prev, save: false }));
        return;
      }
    }

    const resolveLocalIp = () => {
      const current = safeTrim(form.local_ip, '0.0.0.0');
      if (current === 'lan1-unavailable' || current === 'lan2-unavailable') {
        return current === 'lan1-unavailable'
          ? (localIpOptions.find(opt => opt.label?.includes('LAN 1') && !opt.disabled)?.value || '0.0.0.0')
          : (localIpOptions.find(opt => opt.label?.includes('LAN 2') && !opt.disabled)?.value || '0.0.0.0');
      }
      return current || '0.0.0.0';
    };

    const settingsPayload = {
      local_ip: resolveLocalIp(),
      local_port: safeTrim(form.local_port, '5060') || '5060',
      transport_mode: safeTrim(form.transport_mode, 'UDP').toUpperCase() || 'UDP',
      srtp_mode: safeTrim(form.srtp_mode, 'no').toLowerCase() || 'no',
      dtmf_mode: safeTrim(form.dtmf_mode, 'info').toLowerCase() || 'info',
      external_bound_flag: form.external_bound_flag === 'Y' ? 'Y' : 'N',
      external_bound_address: form.external_bound_flag === 'Y' ? safeTrim(form.external_bound_address) : '',
      external_bound_port: form.external_bound_flag === 'Y' ? safeTrim(form.external_bound_port) : ''
    };

    try {
      const response = await updateGlobalSipSettings(settingsPayload);
      if (response?.response) {
        showMessage('success', response?.message || 'Settings Updated!');
        await fetchGlobalSipSettings();
        setShowModal(false);
        setEditIndex(null);
      } else {
        throw new Error(response?.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error saving SIP trunk settings:', error);
      showMessage('error', error?.message || 'Failed to save settings');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };
  
  // Table selection logic
  const handleSelectRow = idx => {
    setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  };
  const handleCheckAll = () => setSelected(registers.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () => setSelected(registers.map((_, idx) => selected.includes(idx) ? null : idx).filter(i => i !== null));
  
  const handleDelete = () => {
    if (selected.length === 0) {
      showMessage('error', 'Please select trunks to delete');
      return;
    }
    
    setLoading(prev => ({ ...prev, delete: true }));
    
    setTimeout(() => {
      setRegisters(prev => prev.filter((_, idx) => !selected.includes(idx)));
      showMessage('success', `${selected.length} row(s) removed locally`);
      setSelected([]);
      setTimeout(() => setLoading(prev => ({ ...prev, delete: false })), 300);
    }, 500);
  };
  
  const handleClearAll = () => {
    if (registers.length === 0) {
      showMessage('info', 'No trunks to clear');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete ALL SIP trunks? This action cannot be undone.')) {
      return;
    }
    
    setLoading(prev => ({ ...prev, delete: true }));
    
    setTimeout(() => {
      try {
        const totalCount = registers.length;
        setRegisters([]);
        setSelected([]);
        setPage(1);
        setForm({ ...SIP_TRUNK_INITIAL_FORM });
        showMessage('success', `All ${totalCount} trunk(s) deleted successfully`);
      } catch (error) {
        console.error('Error clearing all SIP trunks:', error);
        showMessage('error', 'Failed to clear all trunks');
      } finally {
        setLoading(prev => ({ ...prev, delete: false }));
      }
    }, 500);
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
          SIP Trunk
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
                      {visibleTableFields.map(field => (
                        <th
                          key={field.name}
                          className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center"
                          style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}
                        >
                          {field.label}
                        </th>
                      ))}
                      <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Modify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading.fetch ? (
                      <tr>
                        <td colSpan={visibleFieldsCount + 2} className="border border-gray-300 px-2 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <CircularProgress size={20} />
                            <span>Loading trunks...</span>
                          </div>
                        </td>
                      </tr>
                    ) : registers.length === 0 ? (
                      <tr>
                        <td colSpan={visibleFieldsCount + 2} className="border border-gray-300 px-2 py-1 text-center">No data</td>
                      </tr>
                    ) : (
                      pagedRegisters.map((reg, idx) => {
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
                            {visibleTableFields.map(field => (
                              <td
                                key={field.name}
                                className="border border-gray-300 text-center bg-white"
                                style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}
                              >
                                {renderCellValue(field, reg)}
                              </td>
                            ))}
                            <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                              <EditDocumentIcon 
                                className={`cursor-pointer text-blue-600 mx-auto ${loading.delete ? 'opacity-50' : ''}`} 
                                onClick={() => !loading.delete && handleOpenModal(reg, realIdx)} 
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
          <span>{registers.length} items Total</span>
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
          sx: { 
            width: 600, 
            maxWidth: '95vw', 
            mx: 'auto', 
            p: 0,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle 
          className="text-white text-center font-semibold p-2 text-base"
          style={{
            background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
            borderBottom: '1px solid #444444',
            flexShrink: 0
          }}
        >
          {editIndex !== null ? 'Edit SIP Trunk' : 'Add SIP Trunk'}
        </DialogTitle>
        <DialogContent 
          className="pt-3 pb-0 px-2" 
          style={{
            padding: '12px 8px 0 8px',
            backgroundColor: '#dde0e4',
            border: '1px solid #444444',
            borderTop: 'none',
            overflowY: 'auto',
            flex: '1 1 auto'
          }}
        >
          <div className="flex flex-col gap-2 w-full">
            {SIP_TRUNK_FIELDS.map(field => {
              // Skip rendering "Working Period Text" as a separate field - it's handled within "Working Period"
              if (field.name === 'working_period_text') return null;
              
              // Handle conditional fields
              if (field.conditionalField) {
                const { dependsOn, value } = field.conditionalField;
                if (form[dependsOn] !== value) return null;
              }
              const selectOptions = field.name === 'local_ip'
                ? localIpOptions
                : (field.options || []);

              return (
                <div
                  key={field.name}
                  className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 gap-2"
                  style={{ minHeight: 32 }}
                >
                  <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>
                    {field.label}:
                  </label>
                  <div className="flex-1">
                    {field.type === 'select' ? (
                      <div className="w-full">
                        <FormControl fullWidth size="small" variant="outlined">
                          <MuiSelect
                            value={form[field.name] || ''}
                            onChange={e => handleChange(field.name, e.target.value)}
                            displayEmpty
                            sx={{ fontSize: 14 }}
                          >
                            {selectOptions.map(option => (
                              <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                        {validationErrors[field.name] && (
                          <div className="text-red-500 text-xs mt-1">{validationErrors[field.name]}</div>
                        )}
                      </div>
                    ) : field.type === 'checkbox' ? (
                      field.name === 'allow_codecs' ? (
                        <FormGroup row sx={{ gap: 1 }}>
                          {TRUNK_CODEC_OPTIONS.map(codec => (
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
                      ) : field.name === 'working_period' ? (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={form[field.name] || false}
                            onChange={(e) => {
                              handleChange(field.name, e.target.checked);
                              if (e.target.checked) {
                                handleChange('working_period_text', '24 Hour');
                              } else {
                                handleChange('working_period_text', '');
                              }
                            }}
                            size="small"
                            sx={{ 
                              padding: '2px 4px',
                              '& .MuiSvgIcon-root': { fontSize: 16 }
                            }}
                          />
                          <TextField
                            type="text"
                            value={form['working_period_text'] || ''}
                            onChange={e => handleChange('working_period_text', e.target.value)}
                            size="small"
                            fullWidth
                            variant="outlined"
                            placeholder="24 Hour"
                            inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                            disabled={!form[field.name]}
                          />
                        </div>
                      ) : field.name === 'sip_agent' ? (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={form[field.name] || false}
                            onChange={(e) => handleChange(field.name, e.target.checked)}
                            size="small"
                            sx={{ 
                              padding: '2px 4px',
                              '& .MuiSvgIcon-root': { fontSize: 16 }
                            }}
                          />
                          <span style={{ fontSize: 14, color: '#666' }}>Enable</span>
                        </div>
                      ) : (
                        <Checkbox
                          checked={form[field.name] || false}
                          onChange={(e) => handleChange(field.name, e.target.checked)}
                          size="small"
                          sx={{ 
                            padding: '2px 4px',
                            '& .MuiSvgIcon-root': { fontSize: 16 }
                          }}
                        />
                      )
                    ) : field.type === 'password' ? (
                      <div className="w-full">
                        <TextField
                          type={showPassword ? 'text' : 'password'}
                          value={form[field.name] || ''}
                          onChange={e => handleChange(field.name, e.target.value)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          error={!!validationErrors[field.name]}
                          placeholder="Enter password"
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
                          disabled={field.name === 'index'}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                        />
                        {validationErrors[field.name] && (
                          <div className="text-red-500 text-xs mt-1">{validationErrors[field.name]}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
        <DialogActions 
          className="p-4 justify-center gap-12"
          sx={{
            backgroundColor: '#dde0e4',
            borderTop: '1px solid #444444',
            flexShrink: 0
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

export default SipTrunkPage;
