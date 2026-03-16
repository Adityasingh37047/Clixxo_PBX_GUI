import React, { useState, useRef, useEffect } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress } from '@mui/material';
import { postLinuxCmd } from '../api/apiService';
import { IPTABLES_INFO } from '../constants/AccessControlConstants';

const AccessControl = () => {
  // State
  const [commands, setCommands] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ index: '', command: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    save: false,
    delete: false,
    apply: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [executionLogs, setExecutionLogs] = useState(IPTABLES_INFO);
  const [iptablesInfo, setIptablesInfo] = useState(IPTABLES_INFO);
  
  // Scroll state for custom horizontal scrollbar
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, width: 0, scrollWidth: 0 });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);

  // Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(commands.length / itemsPerPage));
  const pagedCommands = commands.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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
  }, [commands, page]);

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Load iptables info on mount
  useEffect(() => {
    loadIptablesInfo();
  }, []);

  const loadIptablesInfo = async () => {
    try {
      const response = await postLinuxCmd({ cmd: 'iptables -L -n -v' });
      if (response.response && response.responseData) {
        setIptablesInfo(response.responseData);
        setExecutionLogs(response.responseData);
        return response.responseData;
      }
    } catch (error) {
      console.error('Error loading iptables info:', error);
      // Keep default IPTABLES_INFO if API fails
    }
    return iptablesInfo;
  };

  // Modal logic
  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      setForm({ index: row.index, command: row.command });
      setEditIndex(idx);
    } else {
      const nextIndex = commands.length.toString();
      setForm({ index: nextIndex, command: '' });
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setForm({ index: '', command: '' });
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // Validate iptables command
  const validateCommand = (command) => {
    const trimmedCmd = command.trim();
    
    if (!trimmedCmd) {
      return { valid: false, error: 'Please enter a command' };
    }
    
    // Check if command starts with iptables or sudo iptables
    const iptablesPattern = /^(sudo\s+)?iptables\s+/i;
    if (!iptablesPattern.test(trimmedCmd)) {
      return { valid: false, error: 'Invalid command. Command must start with "iptables" or "sudo iptables"' };
    }
    
    // Check for basic iptables structure (should have at least one option after iptables)
    const parts = trimmedCmd.split(/\s+/);
    const iptablesIndex = parts.findIndex(p => p.toLowerCase() === 'iptables');
    
    if (iptablesIndex === -1) {
      return { valid: false, error: 'Invalid command format. Command must contain "iptables"' };
    }
    
    // Check if there are arguments after iptables
    if (parts.length <= iptablesIndex + 1) {
      return { valid: false, error: 'Invalid command. Command must include options after "iptables"' };
    }
    
    // Check for common iptables operations
    const validOperations = ['-A', '-I', '-D', '-R', '-P', '-F', '-X', '-N', '-E', '-L', '-S', '-C', '-Z'];
    const hasValidOperation = parts.some(part => validOperations.includes(part));
    
    if (!hasValidOperation) {
      return { valid: false, error: 'Invalid command. Command must include a valid iptables operation (e.g., -A, -I, -D, -P, etc.)' };
    }
    
    return { valid: true, error: null };
  };

  const handleSave = () => {
    const validation = validateCommand(form.command);
    
    if (!validation.valid) {
      window.alert(validation.error);
      return;
    }

    setLoading(prev => ({ ...prev, save: true }));
    try {
      if (editIndex !== null) {
        // Update existing command
        setCommands(prev => prev.map((cmd, idx) => 
          idx === editIndex ? { index: form.index, command: form.command.trim() } : cmd
        ));
        showMessage('success', 'Command updated successfully');
      } else {
        // Add new command
        setCommands(prev => [...prev, { index: form.index, command: form.command.trim() }]);
        showMessage('success', 'Command added successfully');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving command:', error);
      showMessage('error', 'Failed to save command');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  // Table selection logic
  const handleSelectRow = idx => {
    setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  };
  const handleCheckAll = () => setSelected(commands.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () => setSelected(commands.map((_, idx) => selected.includes(idx) ? null : idx).filter(i => i !== null));
  
  const handleDelete = () => {
    if (selected.length === 0) {
      showMessage('error', 'Please select commands to delete');
      return;
    }
    
    setLoading(prev => ({ ...prev, delete: true }));
    setTimeout(() => {
      setCommands(prev => prev.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
      showMessage('success', `${selected.length} command(s) deleted successfully`);
      setLoading(prev => ({ ...prev, delete: false }));
    }, 500);
  };

  const handleClearAll = () => {
    if (commands.length === 0) {
      showMessage('info', 'No commands to clear');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete ALL commands? This action cannot be undone.')) {
      return;
    }
    
    setLoading(prev => ({ ...prev, delete: true }));
    setTimeout(() => {
      setCommands([]);
      setSelected([]);
      setPage(1);
      showMessage('success', `All ${commands.length} command(s) deleted successfully`);
      setLoading(prev => ({ ...prev, delete: false }));
    }, 500);
  };

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  // Apply all commands
  const handleApply = async () => {
    if (commands.length === 0) {
      window.alert('No commands to apply. Please add commands to the table first.');
      return;
    }

    setLoading(prev => ({ ...prev, apply: true }));
    const failedCommands = [];
    
    try {
      for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        try {
          const response = await postLinuxCmd({ cmd: cmd.command.trim() });
          // Check if command failed
          if (!response.response || (response.responseData === undefined && response.message)) {
            failedCommands.push({ index: cmd.index, command: cmd.command });
          }
        } catch (error) {
          // Command execution failed
          failedCommands.push({ index: cmd.index, command: cmd.command });
        }
      }
      
      const latestInfo = await loadIptablesInfo();
      setExecutionLogs(latestInfo || iptablesInfo);
      
      // Show alert if any commands failed
      if (failedCommands.length > 0) {
        const failedIndices = failedCommands.map(fc => fc.index).join(', ');
        const failedCount = failedCommands.length;
        const successCount = commands.length - failedCount;
        
        let alertMessage = '';
        if (successCount > 0) {
          alertMessage = `${successCount} command(s) executed successfully.\n\n`;
        }
        alertMessage += `Failed command(s) at index: ${failedIndices}`;
        
        window.alert(alertMessage);
        
        if (successCount > 0) {
          showMessage('warning', `${successCount} succeeded, ${failedCount} failed`);
        } else {
          showMessage('error', `All ${failedCount} command(s) failed`);
        }
      } else {
        showMessage('success', `All ${commands.length} command(s) executed successfully`);
      }
    } catch (error) {
      console.error('Error applying commands:', error);
      showMessage('error', 'Failed to apply commands.');
      window.alert('An error occurred while applying commands.');
    } finally {
      setLoading(prev => ({ ...prev, apply: false }));
    }
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
        {/* Blue header bar */}
        <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
          Access Control List
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
                      <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap', width: '60px' }}>Check</th>
                      <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap', width: '80px' }}>Index</th>
                      <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Command</th>
                      <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap', width: '80px' }}>Modify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commands.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="border border-gray-300 px-2 py-1 text-center">No data</td>
                      </tr>
                    ) : (
                      pagedCommands.map((cmd, idx) => {
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
                            <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                              {cmd.index}
                            </td>
                            <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                              {cmd.command}
                            </td>
                            <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                              <EditDocumentIcon 
                                className={`cursor-pointer text-blue-600 mx-auto ${loading.delete ? 'opacity-50' : ''}`} 
                                onClick={() => !loading.delete && handleOpenModal(cmd, realIdx)} 
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
          <div className="flex flex-wrap gap-2">
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${loading.apply ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleApply}
              disabled={loading.apply}
            >
              {loading.apply && <CircularProgress size={12} />}
              Apply
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.apply ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={async () => {
                const latestInfo = await loadIptablesInfo();
                setExecutionLogs(latestInfo || iptablesInfo);
                showMessage('info', 'Log view reset to current iptables configuration');
              }}
              disabled={loading.apply}
            >
              Cancel
            </button>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.save ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={() => handleOpenModal()}
              disabled={loading.save}
            >
              Add New
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
          <span>{commands.length} items Total</span>
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

        {/* Iptables Info Log Field */}
        <div className="w-full max-w-[900px] mx-auto mt-4 flex flex-col items-center">
          <div className="text-gray-600 text-sm font-semibold mb-2 text-center">Iptables Info</div>
          <div className="w-full bg-white border-2 border-gray-400 rounded-md shadow-sm overflow-y-auto p-3 resize-y" style={{ minHeight: 140, maxHeight: 320 }}>
            <pre className="w-full h-full bg-white text-gray-800 text-xs font-mono whitespace-pre-wrap m-0 p-0" style={{ minHeight: 120, maxHeight: 260, fontSize: '11px' }}>{executionLogs}</pre>
          </div>
          <div className="mt-2 text-[11px] text-red-600 text-center">
            <div>Note: Please don't enable "SIP" =&gt; "Calls from SIP Trunk Address only".</div>
            <div>Note: Application and cancel application buttons are for all current set rules, not direct at a certain rule.</div>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Command */}
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
          Access Control Command
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
            <div className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>
                Index:
              </label>
              <div className="flex-1">
                <TextField
                  type="text"
                  value={form.index || ''}
                  onChange={e => handleChange('index', e.target.value)}
                  size="small"
                  fullWidth
                  variant="outlined"
                  disabled={editIndex !== null}
                  placeholder="Auto-generated"
                  inputProps={{ style: { fontSize: 14, padding: '3px 6px', textAlign: 'center' } }}
                  sx={{
                    '& .MuiOutlinedInput-input': {
                      textAlign: 'center'
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>
                Command:
              </label>
              <div className="flex-1">
                <TextField
                  type="text"
                  value={form.command || ''}
                  onChange={e => handleChange('command', e.target.value)}
                  size="small"
                  fullWidth
                  variant="outlined"
                  placeholder="e.g., iptables -P OUTPUT ACCEPT"
                  inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }}
                />
              </div>
            </div>
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
  );
};

export default AccessControl;
