import React, { useState, useRef, useEffect } from 'react';
import { NUM_RECEIVING_RULE_FIELDS, NUM_RECEIVING_RULE_INITIAL_FORM, NUM_RECEIVING_RULE_TABLE_COLUMNS } from '../constants/PcmNumReceivingRouleConstants';
import { listNumRecv, createNumRecv, deleteNumRecv } from '../api/apiService';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Alert, CircularProgress } from '@mui/material';

const PcmNumReceivingRulePage = () => {
  // State
  const [rules, setRules] = useState([]);
  const [allData, setAllData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(NUM_RECEIVING_RULE_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const hasInitialLoadRef = useRef(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Show message function
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Load data function
  const loadNumRecvData = async (isRefresh = false) => {
    if (loading.fetch) {
      return;
    }
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      // console.log('Attempting to load Number Receiving Rule data...');
      const response = await listNumRecv();
      // console.log('Number Receiving Rule response:', response);
      
      if (response && response.response && Array.isArray(response.message)) {
        setAllData(response.message);
        setRules(response.message);
        // console.log('Number Receiving Rule data loaded successfully:', response.message.length, 'items');
        // console.log('Sample data structure:', response.message[0]); // Debug: show first item structure
      } else {
        // console.log('Invalid response format:', response);
        if (!isRefresh) {
          showMessage('error', 'Failed to load Number Receiving Rule data');
        }
      }
    } catch (error) {
      console.error('Error loading Number Receiving Rule data:', error);
      if (!isRefresh) {
        if (error.message === 'Network Error') {
          showMessage('error', 'Network error. Please check your connection.');
        } else if (error.response?.status === 500) {
          showMessage('error', 'Server error. The Number Receiving Rule endpoint may have issues.');
        } else if (error.response?.status === 404) {
          showMessage('error', 'Number Receiving Rule API endpoint not found. The server does not have the /numrecv endpoint implemented yet.');
        } else {
          showMessage('error', error.message || 'Failed to load Number Receiving Rule data');
        }
        setAllData([]);
        setRules([]);
      } else {
        console.warn('Refresh failed, keeping existing data:', error.message);
        // For refresh failures, show a warning but don't clear data
        showMessage('warning', 'Failed to refresh data. Please refresh the page manually.');
      }
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  // Initial load
  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadNumRecvData();
    }
  }, []);

  // Modal handlers
  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      setForm({
        number_data: item.number_data || '',
        provider: item.provider || 'bsnl'
      });
      setEditIndex(item.id);
    } else {
      setForm(NUM_RECEIVING_RULE_INITIAL_FORM);
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(NUM_RECEIVING_RULE_INITIAL_FORM);
    setEditIndex(null);
  };

  const handleInputChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // Save function
  const handleSave = async () => {
    if (loading.save) return;

    // Validation
    if (!form.number_data.trim()) {
      showMessage('error', 'Number Data is required');
      return;
    }
    if (!form.provider) {
      showMessage('error', 'Provider is required');
      return;
    }

    setLoading(prev => ({ ...prev, save: true }));
    try {
      const apiData = {
        number_data: form.number_data.trim(),
        provider: form.provider
      };

      //    console.log('Saving Number Receiving Rule:', apiData);
      const response = await createNumRecv(apiData);
      // console.log('Save response:', response);

      if (response && response.response) {
        showMessage('success', 'Number Receiving Rule saved successfully!');
        handleCloseModal();
        
        // Small delay to ensure modal closes before refreshing
        setTimeout(async () => {
          try {
            await loadNumRecvData(true);
          } catch (reloadError) {
            console.warn('Failed to reload data after save:', reloadError);
            // If reload fails, add the new item to local state as fallback
            const newItem = {
              id: Date.now(), // Temporary ID for local state
              ...apiData
            };
            setRules(prev => [...prev, newItem]);
            setAllData(prev => [...prev, newItem]);
            showMessage('warning', 'Data saved but failed to refresh. New item added to table.');
          }
        }, 100);
      } else {
        showMessage('error', 'Failed to save Number Receiving Rule');
      }
    } catch (error) {
      console.error('Error saving Number Receiving Rule:', error);
      showMessage('error', error.message || 'Failed to save Number Receiving Rule');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  // Delete function
  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage('warning', 'Please select items to delete');
      return;
    }

    if (loading.delete) return;

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const deletePromises = selected.map(index => {
        const rule = rules[index];
        return deleteNumRecv(rule.id);
      });

      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        showMessage('success', `Successfully deleted ${successful} item(s)`);
      }
      if (failed > 0) {
        showMessage('error', `Failed to delete ${failed} item(s)`);
      }

      setSelected([]);
      
      // Reload data
      try {
        await loadNumRecvData(true);
      } catch (reloadError) {
        console.warn('Failed to reload data after delete:', reloadError);
        // Update local state as fallback
        setRules(prev => prev.filter((_, index) => !selected.includes(index)));
      }
    } catch (error) {
      console.error('Error deleting Number Receiving Rules:', error);
      showMessage('error', error.message || 'Failed to delete Number Receiving Rules');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Clear all function
  const handleClearAll = async () => {
    if (rules.length === 0) {
      showMessage('warning', 'No data to clear');
      return;
    }

    if (loading.delete) return;

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const deletePromises = rules.map(rule => deleteNumRecv(rule.id));
      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        showMessage('success', `Successfully cleared ${successful} item(s)`);
      }
      if (failed > 0) {
        showMessage('error', `Failed to clear ${failed} item(s)`);
      }

      setSelected([]);
      setPage(1);
      
      // Reload data
      try {
        await loadNumRecvData(true);
      } catch (reloadError) {
        console.warn('Failed to reload data after clear all:', reloadError);
        // Update local state as fallback
        setRules([]);
        setAllData([]);
      }
    } catch (error) {
      console.error('Error clearing all Number Receiving Rules:', error);
      showMessage('error', error.message || 'Failed to clear all Number Receiving Rules');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Selection handlers
  const handleSelectRow = (index) => {
    setSelected(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleCheckAllRows = () => {
    setSelected(pagedRules.map((_, idx) => (page - 1) * itemsPerPage + idx));
  };

  const handleUncheckAllRows = () => {
    setSelected([]);
  };

  const handleInverse = () => {
    const currentPageIndices = pagedRules.map((_, idx) => (page - 1) * itemsPerPage + idx);
    setSelected(currentPageIndices.filter(i => !selected.includes(i)));
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  // Render form field
  const renderFormField = (field) => (
    <div key={field.name} className="flex flex-row items-center border border-gray-300 rounded px-3 py-2 gap-3 w-full bg-white mb-2">
      <label className="text-[15px] text-gray-700 font-medium whitespace-nowrap text-left min-w-[120px] mr-2">
        {field.label}:
      </label>
      <div className="flex-1 min-w-0">
        {field.type === 'select' ? (
          <Select
            value={form[field.name]}
            onChange={e => handleInputChange(field.name, e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
            className="bg-white"
            sx={{ 
              maxWidth: '100%', 
              minWidth: 0, 
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' }
            }}
          >
            {field.options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <TextField
            type={field.type}
            value={form[field.name] || ''}
            onChange={e => handleInputChange(field.name, e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
            className="bg-white"
            sx={{ 
              maxWidth: '100%', 
              minWidth: 0, 
              backgroundColor: '#ffffff'
            }}
            placeholder={field.placeholder || ''}
          />
        )}
      </div>
    </div>
  );

  // Render table row
  const renderTableRow = (item, idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    const globalIndex = realIdx + 1; // Auto-incrementing index starting from 1
    return (
      <tr key={item.id || realIdx} style={{ minHeight: 32 }}>
        <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
          <input
            type="checkbox"
            checked={selected.includes(realIdx)}
            onChange={() => handleSelectRow(realIdx)}
          />
        </td>
        {NUM_RECEIVING_RULE_TABLE_COLUMNS.filter(col => col.key !== 'check').map(col => {
          if (col.key === 'index') {
            return (
              <td key={col.key} className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                {globalIndex}
              </td>
            );
          }
          if (col.key === 'modify') {
            return (
              <td key={col.key} className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                <EditDocumentIcon 
                  className="cursor-pointer text-blue-600 mx-auto" 
                  onClick={() => handleOpenModal(item, realIdx)}
                  style={{ fontSize: 22 }}
                />
              </td>
            );
          }
          return (
            <td key={col.key} className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
              {item[col.key] !== undefined && item[col.key] !== '' ? item[col.key] : '--'}
            </td>
          );
        })}
      </tr>
    );
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
        {/* Header */}
        <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
          Number-receiving Rule
        </div>

        <div className="w-full max-w-full mx-auto" style={{ border: '2px solid #bbb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="bg-white rounded-lg shadow-sm w-full flex flex-col overflow-hidden">
            <div className="overflow-x-auto w-full border-b border-gray-300" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
              <table className="w-full min-w-[1200px] border border-gray-300 border-collapse whitespace-nowrap" style={{ tableLayout: 'auto', border: '1px solid #bbb' }}>
            <thead>
              <tr style={{ minHeight: 32 }}>
                <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Check</th>
                {NUM_RECEIVING_RULE_TABLE_COLUMNS.filter(c => c.key !== 'check').map(c => (
                  <th
                    key={c.key}
                    className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center"
                    style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading.fetch ? (
                <tr>
                  <td colSpan={NUM_RECEIVING_RULE_TABLE_COLUMNS.length} className="border border-gray-300 px-2 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <CircularProgress size={20} />
                      <span>Loading Number Receiving Rule data...</span>
                    </div>
                  </td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={NUM_RECEIVING_RULE_TABLE_COLUMNS.length} className="border border-gray-300 px-2 py-1 text-center">No data</td>
                </tr>
              ) : (
                pagedRules.map((item, idx) => renderTableRow(item, idx))
              )}
            </tbody>
          </table>
            </div>
          </div>
        </div>

        {/* Action and pagination rows OUTSIDE the border, visually separated backgrounds and gap */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full px-2 py-2" style={{ background: '#e3e7ef', marginTop: 12 }}>
          <div className="flex flex-wrap gap-2">
            <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={handleCheckAllRows}>Check All</button>
            <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={handleUncheckAllRows}>Uncheck All</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded cursor-pointer px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={handleInverse}>Inverse</button>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                selected.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`} 
              onClick={handleDelete}
              disabled={selected.length === 0}
            >
              {loading.delete ? <CircularProgress size={12} /> : 'Delete'}
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                rules.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`} 
              onClick={handleClearAll}
              disabled={rules.length === 0}
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

        <div className="text-red-600 text-xs mt-8 text-center w-full">
          Rule: "x"(lowercase) indicates a random number, "*" indicates multiple random characters.
        </div>
      </div>

      {/* Modal */}
      <Dialog open={showModal} onClose={handleCloseModal} maxWidth={false} PaperProps={{ sx: { width: 600 } }}>
        <DialogTitle className="text-white text-center font-semibold text-lg" 
          style={{ background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)', borderBottom: '1px solid #444444' }}>
          Number-Receiving Rule
        </DialogTitle>
        <DialogContent className="flex flex-col gap-2 py-4" 
          style={{ backgroundColor: '#dde0e4', border: '1px solid #444444', borderTop: 'none' }}>
          {NUM_RECEIVING_RULE_FIELDS.map(renderFormField)}
        </DialogContent>
        <DialogActions className="flex justify-center gap-6 pb-4">
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
              borderRadius: 1,
              minWidth: 100,
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
            {loading.save ? <CircularProgress size={20} color="inherit" /> : 'Save'}
          </Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
              color: '#111827',
              fontWeight: 600,
              fontSize: '16px',
              borderRadius: 1,
              minWidth: 100,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #d1d5db 0%, #e5e7eb 100%)',
                color: '#111827',
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

export default PcmNumReceivingRulePage;