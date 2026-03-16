import React, { useEffect, useRef, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Alert, CircularProgress, FormGroup, FormControlLabel, Checkbox, InputAdornment, IconButton, FormControl, Select as MuiSelect, MenuItem } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { CODEC_OPTIONS } from '../constants/SipAccountConstants';
import { SIP_TO_SIP_FIELDS, SIP_TO_SIP_TABLE_COLUMNS, SIP_TO_SIP_INITIAL_FORM } from '../constants/SipToSipAccountConstants';
import { fetchSipAccounts } from '../api/apiService';
import { fetchSipIpTrunkAccounts, createSipIpTrunkAccount, updateSipIpTrunkAccount, deleteSipIpTrunkAccount, listGroups } from '../api/apiService';

const SipToSipAccountPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [pjsipExtensions, setPjsipExtensions] = useState(new Set());
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState({ fetch: false, save: false, delete: false });
  const [form, setForm] = useState(SIP_TO_SIP_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const hasInitialLoadRef = useRef(false);

  const showMessageFn = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadData();
    }
  }, []);

  const isCodecSelected = (codec) => {
    if (!form.allow_codecs) return false;
    return form.allow_codecs.split(',').map(c => c.trim()).includes(codec);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const transformList = (list) => {
    const sorted = [...list].sort((a,b) => (parseInt(a.extension)||0) - (parseInt(b.extension)||0));
    return sorted.map((it, i) => ({
      index: i.toString(),
      extension: it.extension,
      context: it.context,
      allow_codecs: it.codecs,
      password: it.password,
      contact: it.contact,
      from_domain: it.from_domain || it['Domain name'] || '',
      contact_user: it.contact_user || it['Contact User'] || '',
      outbound_proxy: it.outbound_proxy || it['Outbound Proxy'] || '',
      status: it.status || ''
    }));
  };
  
  const transformUiToApi = (uiData) => ({
    extension: uiData.extension,
    context: uiData.context,
    allow_codecs: uiData.allow_codecs,
    password: uiData.password,
    contact: (uiData.contact && String(uiData.contact).trim().startsWith('sip:')) ? uiData.contact : `sip:${String(uiData.contact || '').trim()}`,
    from_domain: uiData.from_domain,
    contact_user: uiData.contact_user,
    outbound_proxy: uiData.outbound_proxy
  });

  const loadData = async () => {
    if (loading.fetch) return;
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const [resIpTrunk, resPjsip] = await Promise.allSettled([
        fetchSipIpTrunkAccounts(),
        fetchSipAccounts(),
      ]);
      if (resIpTrunk.status === 'fulfilled' && resIpTrunk.value?.response && Array.isArray(resIpTrunk.value.message)) {
        setAccounts(transformList(resIpTrunk.value.message));
      } else {
        setAccounts([]);
      }
      if (resPjsip.status === 'fulfilled' && resPjsip.value?.response && Array.isArray(resPjsip.value.message)) {
        const extSet = new Set(resPjsip.value.message.map(r => String(r.extension)));
        setPjsipExtensions(extSet);
      } else {
        setPjsipExtensions(new Set());
      }
    } catch (e) {
      showMessageFn('error', e.message || 'Failed to load accounts');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      setForm({ ...SIP_TO_SIP_INITIAL_FORM, ...row });
      setEditIndex(idx);
    } else {
      setForm(SIP_TO_SIP_INITIAL_FORM);
      setEditIndex(null);
    }
    setValidationErrors({}); // Clear validation errors when opening modal
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setShowPassword(false); // Reset password visibility when closing modal
    setValidationErrors({}); // Clear validation errors when closing modal
  };
  
  // Validation functions
  const validateExtension = (extension) => {
    if (!extension || extension.trim() === '') {
      return 'Extension is required';
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
  
  const validateContact = (contact) => {
    if (!contact || String(contact).trim() === '') {
      return 'Contact is required';
    }
    // Allow user to type IP like 10.191.15.1 or full sip:10.191.15.1
    const contactRegex = /^(?:sip:)?(?:\d{1,3}\.){3}\d{1,3}$/;
    if (!contactRegex.test(String(contact).trim())) {
      return "Contact must be like '10.150.18.10' or 'sip:10.150.18.10'";
    }
    return null;
  };
  
  const validateDomainName = (domainName) => {
    if (!domainName || domainName.trim() === '') {
      return 'Domain Name is required';
    }
    return null;
  };
  
  const validateContactUser = (contactUser) => {
    if (!contactUser || contactUser.trim() === '') {
      return 'Contact User is required';
    }
    return null;
  };
  
  const validateOutboundProxy = (outboundProxy) => {
    if (!outboundProxy || outboundProxy.trim() === '') {
      return 'Outbound Proxy is required';
    }
    return null;
  };
  
  const validateForm = () => {
    const errors = {};
    
    const extensionError = validateExtension(form.extension);
    if (extensionError) errors.extension = extensionError;
    
    const passwordError = validatePassword(form.password);
    if (passwordError) errors.password = passwordError;
    
    const contextError = validateContext(form.context);
    if (contextError) errors.context = contextError;
    
    const allowCodecsError = validateAllowCodecs(form.allow_codecs);
    if (allowCodecsError) errors.allow_codecs = allowCodecsError;
    
    const contactError = validateContact(form.contact);
    if (contactError) errors.contact = contactError;
    
    const domainNameError = validateDomainName(form.from_domain);
    if (domainNameError) errors.from_domain = domainNameError;

    const contactUserError = validateContactUser(form.contact_user);
    if (contactUserError) errors.contact_user = contactUserError;

    const outboundProxyError = validateOutboundProxy (form.outbound_proxy);
    if (outboundProxyError) errors.outbound_proxy = outboundProxyError;

    return errors;
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
      case 'extension':
        error = validateExtension(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'context':
        error = validateContext(value);
        break;
      case 'contact':
        error = validateContact(value);
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

  const handleSave = async () => {
    // Comprehensive validation
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      // Show the first validation error
      const firstError = Object.values(validationErrors)[0];
      showMessageFn('error', firstError);
      setValidationErrors(validationErrors);
      return;
    }
    
    // Duplicate extension across classic PJSIP
    if (pjsipExtensions.has(String(form.extension))) {
      showMessageFn('error', 'This extension already exists in SIP Account. Choose a different extension.');
      return;
    }
    setLoading(prev => ({ ...prev, save: true }));
    try {
      const payload = transformUiToApi(form);
      const resp = editIndex !== null ? await updateSipIpTrunkAccount(payload) : await createSipIpTrunkAccount(payload);
      if (resp?.response) {
        showMessageFn('success', resp.message || 'Saved');
        await new Promise(r => setTimeout(r, 600));
        await loadData();
        setShowModal(false);
        setEditIndex(null);
      } else {
        showMessageFn('error', resp?.message || 'Failed to save');
      }
    } catch (e) {
      showMessageFn('error', e.message || 'Failed to save');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleDelete = async (indices) => {
    if (!indices || indices.length === 0) return;
    if (!window.confirm('Are you sure you want to delete the selected account(s)?')) {
      return;
    }
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      // Fetch SIP trunk groups to block deletion when referenced as trunkId/extension
      let groupRefList = [];
      try {
        const grpRes = await listGroups();
        groupRefList = (grpRes && (grpRes.message || grpRes.data)) || [];
      } catch {}

      const referencedExtensions = new Set(
        groupRefList
          .map(g => g?.sip_trunk_id)
          .filter(Boolean)
          .map(v => String(v))
          .map(v => (v.includes('/') ? v.split('/')[1] : null))
          .filter(Boolean)
      );

      const ops = indices.map(i => {
        const ext = accounts[i].extension;
        if (referencedExtensions.has(String(ext))) {
          alert(`Cannot delete extension ${ext} because it is used in SIP Trunk Group (e.g., trunkId/${ext}). Delete or modify the SIP Trunk Group first.`);
          return { skipped: true };
        }
        return deleteSipIpTrunkAccount(ext);
      });

      const results = await Promise.allSettled(ops);
      const success = results.filter(r => r.status === 'fulfilled' && r.value?.response).length;
      if (success > 0) showMessageFn('success', `${success} account(s) deleted`);
      await loadData();
    } catch (e) {
      showMessageFn('error', e.message || 'Delete failed');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (accounts.length === 0) {
      showMessageFn('info', 'No accounts to clear');
      return;
    }
    if (!window.confirm('Are you sure you want to delete ALL SIP To SIP accounts? This action cannot be undone.')) {
      return;
    }
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      // Block deletion for any extension referenced by SIP Trunk Group
      let groupRefList = [];
      try {
        const grpRes = await listGroups();
        groupRefList = (grpRes && (grpRes.message || grpRes.data)) || [];
      } catch {}
      const referencedExtensions = new Set(
        groupRefList
          .map(g => g?.sip_trunk_id)
          .filter(Boolean)
          .map(v => String(v))
          .map(v => (v.includes('/') ? v.split('/')[1] : null))
          .filter(Boolean)
      );

      const deletables = accounts.filter(acc => !referencedExtensions.has(String(acc.extension)));
      const blocked = accounts.length - deletables.length;
      if (blocked > 0) {
        alert(`${blocked} account(s) are referenced in SIP Trunk Group and were not deleted. Please remove references first.`);
      }

      const results = await Promise.allSettled(deletables.map(acc => deleteSipIpTrunkAccount(acc.extension)));
      const success = results.filter(r => r.status === 'fulfilled' && r.value?.response).length;
      if (success > 0) showMessageFn('success', `All ${success} account(s) deleted`);
      setSelected([]);
      await loadData();
    } catch (e) {
      showMessageFn('error', e.message || 'Clear all failed');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(accounts.length / itemsPerPage));
  const pagedAccounts = accounts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{backgroundColor: "#dde0e4"}}>
      {message.text && (
        <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })} sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: 300, boxShadow: 3 }}>
          {message.text}
        </Alert>
      )}

      <div className="w-full max-w-full mx-auto">
        <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0" style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
          SIP To SIP Account
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[1200px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
            <thead>
              <tr>
                {SIP_TO_SIP_TABLE_COLUMNS.map(c => (
                  <th key={c.key} className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 whitespace-nowrap">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading.fetch ? (
                <tr><td colSpan={9} className="border border-gray-300 px-2 py-4 text-center"><CircularProgress size={20} /> Loading...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={9} className="border border-gray-300 px-2 py-2 text-center">No data</td></tr>
              ) : (
                pagedAccounts.map((item, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  return (
                    <tr key={realIdx}>
                      <td className="border border-gray-300 px-2 py-1 text-center"><input type="checkbox" checked={selected.includes(realIdx)} onChange={() => setSelected(sel => sel.includes(realIdx) ? sel.filter(i => i !== realIdx) : [...sel, realIdx])} /></td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{realIdx}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{item.extension || '--'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{item.context || '--'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{item.allow_codecs || '--'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{item.contact || '--'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{'*'.repeat(item.password?.length || 0)}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{item.status || '--'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center"><EditDocumentIcon className="cursor-pointer text-blue-600 mx-auto" onClick={() => handleOpenModal(item, realIdx)} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap justify-between items-center bg-[#e3e7ef] rounded-b-lg border border-t-0 border-gray-300 px-2 py-2 gap-2">
          <div className="flex flex-wrap gap-2">
            <button className="bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={() => setSelected(accounts.map((_, idx) => idx))}>Check All</button>
            <button className="bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={() => setSelected([])}>Uncheck All</button>
            <button className="bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={() => setSelected(sel => accounts.map((_, idx) => sel.includes(idx) ? null : idx).filter(i => i !== null))}>Inverse</button>
            <button className={`bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => handleDelete(selected)} disabled={loading.delete}>{loading.delete && <CircularProgress size={12} />}Delete</button>
            <button className={`bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleClearAll} disabled={loading.delete}>{loading.delete && <CircularProgress size={12} />}Clear All</button>
          </div>
          <button className={`bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.fetch || loading.save ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => handleOpenModal()} disabled={loading.fetch || loading.save}>Add New</button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
          <span>{accounts.length} items Total</span>
          <span>{itemsPerPage} Items/Page</span>
          <span>{page}/{totalPages}</span>
          <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400" onClick={() => setPage(1)}>First</button>
          <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400" onClick={() => setPage(p => Math.max(1, p-1))}>Previous</button>
          <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400" onClick={() => setPage(p => Math.min(totalPages, p+1))}>Next</button>
          <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400" onClick={() => setPage(totalPages)}>Last</button>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={showModal} onClose={loading.save ? null : handleCloseModal} maxWidth={false} className="z-50" PaperProps={{ sx: { width: 600, maxWidth: '95vw', mx: 'auto', p: 0 } }}>
        <DialogTitle className="text-white text-center font-semibold p-2 text-base" style={{ background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)', borderBottom: '1px solid #444444' }}>
          {editIndex !== null ? 'Edit SIP To SIP Account' : 'Add SIP To SIP Account'}
        </DialogTitle>
        <DialogContent className="pt-3 pb-0 px-2" style={{ padding: '12px 8px 0 8px', backgroundColor: '#dde0e4', border: '1px solid #444444', borderTop: 'none' }}>
          <div className="flex flex-col gap-2 w-full">
            {SIP_TO_SIP_FIELDS.map(field => (
              <div key={field.name} className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>{field.label}:</label>
                <div className="flex-1">
                  {field.type === 'password' ? (
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
                              <IconButton onClick={togglePasswordVisibility} edge="end" size="small" sx={{ padding: '2px' }}>
                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ) 
                        }} 
                      />
                      {validationErrors[field.name] && (
                        <div className="text-red-500 text-xs mt-1">{validationErrors[field.name]}</div>
                      )}
                    </div>
                  ) : field.type === 'checkbox' ? (
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
                                sx={{ padding: '2px 4px', '& .MuiSvgIcon-root': { fontSize: 16 } }} 
                              />
                            } 
                            label={codec.label} 
                            sx={{ margin: 0, '& .MuiFormControlLabel-label': { fontSize: 13, fontWeight: 500, color: '#374151' } }} 
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
                  ) : (
                    <div className="w-full">
                    {field.name === 'contact' ? (
                      <TextField
                        type="text"
                        value={form.contact ? String(form.contact).replace(/^sip:/, '') : ''}
                        onChange={e => handleChange('contact', e.target.value)}
                        size="small"
                        fullWidth
                        variant="outlined"
                        error={!!validationErrors.contact}
                        placeholder="e.g., 15.158.34.15"
                        disabled={field.name === 'extension' && editIndex !== null}
                        inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">sip:</InputAdornment>
                        }}
                      />
                    ) : (
                      <TextField 
                        type="text" 
                        value={form[field.name] || ''} 
                        onChange={e => handleChange(field.name, e.target.value)} 
                        size="small" 
                        fullWidth 
                        variant="outlined" 
                        error={!!validationErrors[field.name]}
                        placeholder={field.name === 'extension' ? 'e.g., 1001' : field.name === 'from_domain' ? 'e.g., sip.domain.in' : field.name === 'contact_user' ? 'e.g., +91XXXXXXXXXX' : field.name === 'outbound_proxy' ? 'e.g., 15.158.34.15' : `Enter ${field.label.toLowerCase()}` } 
                        disabled={field.name === 'extension' && editIndex !== null} 
                        inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }} 
                      />
                    )}
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
        <DialogActions className="p-4 justify-center gap-6">
          <Button variant="contained" sx={{ background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)', color: '#fff', fontWeight: 600, fontSize: '16px', borderRadius: 2, minWidth: 120, minHeight: 40, px: 2, py: 0.5, boxShadow: '0 2px 8px #b3e0ff', textTransform: 'none', '&:hover': { background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)', color: '#fff' }, '&:disabled': { background: '#ccc', color: '#666' } }} onClick={handleSave} disabled={loading.save} startIcon={loading.save && <CircularProgress size={20} color="inherit" />}>{loading.save ? 'Saving...' : 'Save'}</Button>
          <Button variant="contained" sx={{ background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)', color: '#374151', fontWeight: 600, fontSize: '16px', borderRadius: 2, minWidth: 120, minHeight: 40, px: 2, py: 0.5, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textTransform: 'none', '&:hover': { background: 'linear-gradient(to bottom, #d1d5db 0%, #e5e7eb 100%)', color: '#374151' }, '&:disabled': { background: '#f3f4f6', color: '#9ca3af' } }} onClick={handleCloseModal} disabled={loading.save}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SipToSipAccountPage;


