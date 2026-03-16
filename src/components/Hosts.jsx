import React, { useState, useEffect, useRef } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress } from '@mui/material';
import { fetchHostsFile, updateHostsFile } from '../api/apiService';
import EditDocumentIcon from '@mui/icons-material/EditDocument';

const Hosts = () => {
  const [hosts, setHosts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false
  });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const hasInitialLoadRef = useRef(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [form, setForm] = useState({
    index: '',
    proxyIp: '',
    domain: ''
  });

  // Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(hosts.length / itemsPerPage));
  const pagedHosts = hosts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Parse hosts file content into table rows
  const parseHostsFile = (content) => {
    const lines = content.split('\n');
    const parsedHosts = [];
    let index = 0;

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return;
      }

      // Split by whitespace (can be spaces or tabs)
      const parts = trimmedLine.split(/\s+/);
      // Allow entries with just IP (parts.length >= 1) or IP with domain (parts.length >= 2)
      if (parts.length >= 1 && parts[0]) {
        parsedHosts.push({
          index: index.toString(),
          proxyIp: parts[0],
          domain: parts.length >= 2 ? parts.slice(1).join(' ') : '' // Domain is optional
        });
        index++;
      }
    });

    return parsedHosts;
  };

  // Convert table rows back to hosts file format
  const generateHostsFileContent = (hostsList) => {
    let content = '# Hosts file - Managed by Clixxo UI\n';
    content += '# Format: <Proxy IP>  <Domain>\n\n';
    
    hostsList.forEach((host) => {
      if (host.proxyIp) {
        // Domain is optional, add entry even if domain is empty
        const domainPart = host.domain ? `  ${host.domain}` : '';
        content += `${host.proxyIp}${domainPart}\n`;
      }
    });

    return content;
  };

  // Load hosts file from API
  const loadHosts = async () => {
    if (loading.fetch) {
      return;
    }
    
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const response = await fetchHostsFile();
      
      if (response.response && response.responseData) {
        const parsedHosts = parseHostsFile(response.responseData);
        setHosts(parsedHosts);
      } else {
        showMessage('error', 'Failed to load hosts file');
      }
    } catch (error) {
      console.error('Error loading hosts:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to load hosts file');
      }
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  // Load hosts on component mount
  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadHosts();
    }
  }, []);

  // Validation functions
  const validateProxyIp = (ip) => {
    if (!ip || ip.trim() === '') {
      return 'Proxy IP is required';
    }
    const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) {
      return 'Please enter a valid IP address';
    }
    return null;
  };

  const validateDomain = (domain) => {
    // Domain is optional, no validation needed
    return null;
  };

  const validateForm = () => {
    const errors = {};
    
    const ipError = validateProxyIp(form.proxyIp);
    if (ipError) errors.proxyIp = ipError;
    
    const domainError = validateDomain(form.domain);
    if (domainError) errors.domain = domainError;
    
    return errors;
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    
    // Clear validation error for this field
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
    
    // Real-time validation
    let error = null;
    switch (key) {
      case 'proxyIp':
        error = validateProxyIp(value);
        break;
      case 'domain':
        error = validateDomain(value);
        break;
      default:
        break;
    }
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, [key]: error }));
    }
  };

  // Modal logic
  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      setForm({ ...row });
      setEditIndex(idx);
    } else {
      setForm({
        index: hosts.length.toString(),
        proxyIp: '',
        domain: ''
      });
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setValidationErrors({});
  };

  // Save or update host entry
  const handleSave = async () => {
    // Validation
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      showMessage('error', firstError);
      setValidationErrors(errors);
      return;
    }

    setLoading(prev => ({ ...prev, save: true }));
    try {
      let updatedHosts;

      if (editIndex !== null) {
        // Update existing host
        updatedHosts = [...hosts];
        updatedHosts[editIndex] = {
          index: form.index,
          proxyIp: form.proxyIp,
          domain: form.domain
        };
      } else {
        // Add new host
        updatedHosts = [
          ...hosts,
          {
            index: hosts.length.toString(),
            proxyIp: form.proxyIp,
            domain: form.domain
          }
        ];
      }

      const fileContent = generateHostsFileContent(updatedHosts);
      const response = await updateHostsFile(fileContent);

      if (response.message) {
        setHosts(updatedHosts);
        showMessage('success', editIndex !== null ? 'Host updated successfully' : 'Host added successfully');
        setShowModal(false);
        setEditIndex(null);
        // Reload to sync with server
        await new Promise(resolve => setTimeout(resolve, 300));
        await loadHosts();
      } else {
        showMessage('error', 'Failed to save host');
      }
    } catch (error) {
      console.error('Error saving host:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to save host');
      }
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  // Table selection logic
  const handleSelectRow = idx => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected(sel => sel.includes(realIdx) ? sel.filter(i => i !== realIdx) : [...sel, realIdx]);
  };
  
  const handleCheckAll = () => setSelected(hosts.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () => setSelected(hosts.map((_, idx) => selected.includes(idx) ? null : idx).filter(i => i !== null));

  // Delete selected hosts
  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage('error', 'Please select hosts to delete');
      return;
    }
    if (!window.confirm('Are you sure you want to delete the selected host(s)?')) {
      return;
    }

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const updatedHosts = hosts.filter((_, idx) => !selected.includes(idx));
      
      // Reindex the hosts
      const reindexedHosts = updatedHosts.map((host, i) => ({
        ...host,
        index: i.toString()
      }));

      const fileContent = generateHostsFileContent(reindexedHosts);
      const response = await updateHostsFile(fileContent);

      if (response.message) {
        setHosts(reindexedHosts);
        setSelected([]);
        showMessage('success', `${selected.length} host(s) deleted successfully`);
        // Reset to page 1 if current page is empty
        if (reindexedHosts.length > 0 && Math.ceil(reindexedHosts.length / itemsPerPage) < page) {
          setPage(1);
        }
      } else {
        showMessage('error', 'Failed to delete hosts');
      }
    } catch (error) {
      console.error('Error deleting hosts:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to delete hosts');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Clear all hosts
  const handleClearAll = async () => {
    if (hosts.length === 0) {
      showMessage('info', 'No hosts to clear');
      return;
    }
    if (!window.confirm('Are you sure you want to delete ALL hosts? This action cannot be undone.')) {
      return;
    }

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const fileContent = '# Hosts file - Managed by Clixxo UI\n# Format: <Proxy IP>  <Domain>\n\n';
      const response = await updateHostsFile(fileContent);

      if (response.message) {
        setHosts([]);
        setSelected([]);
        setPage(1);
        showMessage('success', 'All hosts deleted successfully');
      } else {
        showMessage('error', 'Failed to clear all hosts');
      }
    } catch (error) {
      console.error('Error clearing all hosts:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to clear all hosts');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  return (
    <div className="bg-gray-50 flex flex-col items-center box-border w-full" style={{backgroundColor: "#dde0e4", minHeight: "calc(100vh - 200px)"}}>
      {/* Modal */}
      <Dialog 
        open={showModal} 
        onClose={loading.save ? null : handleCloseModal}
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
          {editIndex !== null ? 'Edit Host' : 'Add Host'}
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
            {/* Index Field */}
            <div
              className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 gap-2"
              style={{ minHeight: 32 }}
            >
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>
                Index:
              </label>
              <div className="flex-1">
                <TextField
                  type="text"
                  value={form.index || ''}
                  size="small"
                  fullWidth
                  variant="outlined"
                  disabled
                  inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f3f4f6',
                    }
                  }}
                />
              </div>
            </div>

            {/* Proxy IP Field */}
            <div
              className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 gap-2"
              style={{ minHeight: 32 }}
            >
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>
                Proxy IP:
              </label>
              <div className="flex-1">
                <TextField
                  type="text"
                  value={form.proxyIp || ''}
                  onChange={e => handleChange('proxyIp', e.target.value)}
                  size="small"
                  fullWidth
                  variant="outlined"
                  error={!!validationErrors.proxyIp}
                  placeholder="e.g., 192.168.1.1"
                  inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                />
                {validationErrors.proxyIp && (
                  <div className="text-red-500 text-xs mt-1">{validationErrors.proxyIp}</div>
                )}
              </div>
            </div>

            {/* Domain Field */}
            <div
              className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 gap-2"
              style={{ minHeight: 32 }}
            >
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>
                Domain:
              </label>
              <div className="flex-1">
                <TextField
                  type="text"
                  value={form.domain || ''}
                  onChange={e => handleChange('domain', e.target.value)}
                  size="small"
                  fullWidth
                  variant="outlined"
                  error={!!validationErrors.domain}
                  placeholder="e.g., example.com"
                  inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                />
                {validationErrors.domain && (
                  <div className="text-red-500 text-xs mt-1">{validationErrors.domain}</div>
                )}
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
              '&:disabled': {
                background: '#ccc',
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
            }}
            onClick={handleCloseModal}
            disabled={loading.save}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
      <div className="w-full mx-auto" style={{ maxWidth: '100%' }}>
        {/* Blue header bar */}
        <div className="h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm"
          style={{
            background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', 
            boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
            borderRadius: '8px 8px 0 0'
          }}>
          Hosts
        </div>
        
        <div className="overflow-x-auto w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full bg-[#f8fafd] border-2 border-t-0 border-gray-400 shadow-sm" style={{ minWidth: '600px' }}>
            <thead>
              <tr>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 whitespace-nowrap">Select</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 whitespace-nowrap">Index</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 whitespace-nowrap">Proxy IP</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 whitespace-nowrap">Domain</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 whitespace-nowrap">Edit</th>
              </tr>
            </thead>
            <tbody>
              {loading.fetch ? (
                <tr>
                  <td colSpan="5" className="border border-gray-300 px-2 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <CircularProgress size={20} />
                      <span>Loading hosts...</span>
                    </div>
                  </td>
                </tr>
              ) : hosts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="border border-gray-300 px-2 py-1 text-center">No data</td>
                </tr>
              ) : (
                pagedHosts.map((item, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  return (
                    <tr key={realIdx}>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input 
                          type="checkbox" 
                          checked={selected.includes(realIdx)} 
                          onChange={() => handleSelectRow(idx)} 
                          disabled={loading.delete} 
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{realIdx}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{item.proxyIp || '--'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{item.domain || '--'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <EditDocumentIcon 
                          className={`cursor-pointer text-blue-600 mx-auto ${loading.delete ? 'opacity-50' : ''}`} 
                          onClick={() => !loading.delete && handleOpenModal(item, realIdx)} 
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table controls */}
        <div className="flex flex-wrap justify-between items-center bg-[#e3e7ef] border border-t-0 border-gray-300 px-2 py-2 gap-2" style={{ borderRadius: '0 0 8px 8px' }}>
          <div className="flex flex-wrap gap-2" style={{ flex: '1 1 auto' }}>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleCheckAll}
              disabled={loading.delete || loading.fetch}
            >
              Check All
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleUncheckAll}
              disabled={loading.delete || loading.fetch}
            >
              Uncheck All
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleInverse}
              disabled={loading.delete || loading.fetch}
            >
              Inverse
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleDelete}
              disabled={loading.delete || loading.fetch}
            >
              {loading.delete && <CircularProgress size={12} />}
              Delete
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleClearAll}
              disabled={loading.delete || loading.fetch}
            >
              {loading.delete && <CircularProgress size={12} />}
              Clear All
            </button>
          </div>
          <button 
            className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.fetch || loading.save) ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={() => handleOpenModal()}
            disabled={loading.fetch || loading.save}
          >
            Add New
          </button>
        </div>
        
        {/* Pagination */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full bg-gray-200 border border-gray-300 mt-1 p-1 text-xs text-gray-700" style={{ borderRadius: '0 0 8px 8px', borderTop: 'none' }}>
          <span>{hosts.length} items Total</span>
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
      </div>
    </div>
  );
};

export default Hosts;
