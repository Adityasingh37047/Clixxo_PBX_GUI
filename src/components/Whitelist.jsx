import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select as MuiSelect, MenuItem, Alert, CircularProgress } from '@mui/material';
import { FaPencilAlt } from 'react-icons/fa';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { saveCallerWhitelist, saveCalleeWhitelist, fetchAllNumberFilters, fetchNumberFilters, deleteNumberFilter, deleteAllNumberFilters } from '../api/apiService';

// Reusable styles
const styles = {
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
  }
};

const Whitelist = () => {
  const [callerRows, setCallerRows] = useState([]);
  const [calleeRows, setCalleeRows] = useState([]);
  const [callerSearch, setCallerSearch] = useState('');
  const [calleeSearch, setCalleeSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('caller');
  const [modalData, setModalData] = useState({ groupNo: '0', noInGroup: '0', idValue: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalGroupNo, setOriginalGroupNo] = useState('0');
  const [originalIdValue, setOriginalIdValue] = useState('');
  const [callerChecked, setCallerChecked] = useState([]);
  const [calleeChecked, setCalleeChecked] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Fetch data on component mount
  useEffect(() => {
    fetchWhitelistData();
  }, []);

  const displayToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fetchWhitelistData = async () => {
    setIsInitialLoading(true);
    try {
      const response = await fetchAllNumberFilters('whitelist');
      
      if (response.success && response.data) {
        // Separate caller and callee data based on subtype
        const callerData = response.data
          .filter(item => item.type === 'callerid')
          .map(item => ({
            groupNo: item.group,
            noInGroup: item.no_of_groups,
            callerId: item.number
          }))
          .sort((a, b) => {
            // First sort by Group No. (ascending)
            const groupDiff = parseInt(a.groupNo) - parseInt(b.groupNo);
            if (groupDiff !== 0) return groupDiff;
            // Then sort by No. in Group (ascending)
            return parseInt(a.noInGroup) - parseInt(b.noInGroup);
          });
        
        const calleeData = response.data
          .filter(item => item.type === 'calleeid')
          .map(item => ({
            groupNo: item.group,
            noInGroup: item.no_of_groups,
            calleeId: item.number
          }))
          .sort((a, b) => {
            // First sort by Group No. (ascending)
            const groupDiff = parseInt(a.groupNo) - parseInt(b.groupNo);
            if (groupDiff !== 0) return groupDiff;
            // Then sort by No. in Group (ascending)
            return parseInt(a.noInGroup) - parseInt(b.noInGroup);
          });
        
        setCallerRows(callerData);
        setCalleeRows(calleeData);
      }
    } catch (error) {
      console.error('Error fetching whitelist data:', error);
      displayToast('Failed to load whitelist data. Please refresh the page.', 'error');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const getNextAvailableNoInGroup = (existingRows, groupNo) => {
    const entriesInGroup = existingRows.filter(row => row.groupNo === groupNo);
    
    if (entriesInGroup.length === 0) {
      return '0'; // First entry in group
    }
    
    // Get all existing "No. in Group" values for this group
    const existingNos = entriesInGroup.map(row => parseInt(row.noInGroup)).sort((a, b) => a - b);
    
    // Find the first gap in the sequence starting from 0
    for (let i = 0; i <= Math.max(...existingNos) + 1; i++) {
      if (!existingNos.includes(i)) {
        return i.toString();
      }
    }
    
    // If no gaps, return the next number after the highest
    return (Math.max(...existingNos) + 1).toString();
  };

  const handleAddNew = (type) => {
    setModalType(type);
    // Calculate the next "No. in Group" value based on existing entries in the selected group
    const existingRows = type === 'caller' ? callerRows : calleeRows;
    const selectedGroup = '0'; // Default group
    const nextNoInGroup = getNextAvailableNoInGroup(existingRows, selectedGroup);
    setModalData({ groupNo: selectedGroup, noInGroup: nextNoInGroup, idValue: '' });
    setIsEditMode(false);
    setOriginalGroupNo(selectedGroup);
    setShowModal(true);
  };

  const handleEdit = (type, row) => {
    setModalType(type);
    setModalData({
      groupNo: row.groupNo,
      noInGroup: row.noInGroup ?? '0',
      idValue: type === 'caller' ? row.callerId : row.calleeId
    });
    setOriginalGroupNo(row.groupNo);
    setOriginalIdValue(type === 'caller' ? row.callerId : row.calleeId);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleGroupNoChange = (newGroupNo) => {
    const existingRows = modalType === 'caller' ? callerRows : calleeRows;
    const nextNoInGroup = getNextAvailableNoInGroup(existingRows, newGroupNo);
    setModalData({ ...modalData, groupNo: newGroupNo, noInGroup: nextNoInGroup });
  };

  const handleSave = async () => {
    // Validate form data
    if (!modalData.idValue.trim()) {
      displayToast('Please enter a valid ID value.', 'error');
      return;
    }

    // Check for duplicate ID (skip the current record in edit mode)
    const existingRows = modalType === 'caller' ? callerRows : calleeRows;
    const trimmedId = modalData.idValue.trim();
    const isDuplicate = existingRows.some(row => {
      const rowId = modalType === 'caller' ? row.callerId : row.calleeId;
      const sameRecord = isEditMode && rowId === originalIdValue && String(row.groupNo) === String(originalGroupNo);
      if (sameRecord) return false; // ignore the one we're editing
      // Only consider duplicates within the target group
      return rowId === trimmedId && String(row.groupNo) === String(modalData.groupNo);
    });

    if (!isEditMode && isDuplicate) {
      displayToast(`${modalType === 'caller' ? 'Caller' : 'Callee'} ID "${trimmedId}" already exists. Please use a different ID.`, 'error');
      return;
    }

    // If editing and group not changed, no-op
    if (isEditMode && String(modalData.groupNo) === String(originalGroupNo)) {
      setShowModal(false);
      displayToast('No changes to save.', 'info');
      return;
    }

    setIsLoading(true);

    try {
      // In edit mode, create first in the new group. On success, delete the old record.
      if (modalType === 'caller') {
        const apiData = {
          groupNo: modalData.groupNo,
          noInGroup: modalData.noInGroup,
          callerId: modalData.idValue
        };
        
        await saveCallerWhitelist(apiData);
        
        displayToast(isEditMode ? 'Caller ID updated successfully!' : 'Caller ID saved successfully!', 'success');
      } else {
        const apiData = {
          groupNo: modalData.groupNo,
          noInGroup: modalData.noInGroup,
          calleeId: modalData.idValue
        };
        
        await saveCalleeWhitelist(apiData);
        
        displayToast(isEditMode ? 'Callee ID updated successfully!' : 'Callee ID saved successfully!', 'success');
      }

      // If editing, verify new record exists in the target group before deleting the old one
      if (isEditMode) {
        const subtype = modalType === 'caller' ? 'callerid' : 'calleeid';
        try {
          const verifyResp = await fetchNumberFilters('whitelist', modalData.idValue);
          const existsInTarget = Array.isArray(verifyResp?.data) && verifyResp.data.some(item => String(item.group) === String(modalData.groupNo) && item.type === subtype && item.number === modalData.idValue);
          if (existsInTarget) {
            await deleteNumberFilter('whitelist', originalIdValue, subtype, originalGroupNo);
          } else {
            console.warn('Skip delete: new record not confirmed in target group');
          }
        } catch (e) {
          console.warn('Verification or delete failed after update:', e);
        }
      }
      
      setShowModal(false);
      setIsEditMode(false);
      
      // Refresh data after successful save
      await fetchWhitelistData();
      
    } catch (error) {
      console.error('Error saving whitelist:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save whitelist. Please try again.';
      displayToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallerSearch = async () => {
    if (!callerSearch.trim()) {
      displayToast('Please enter a caller ID to search', 'error');
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await fetchNumberFilters('whitelist', callerSearch.trim());
      
      if (response && response.success && response.data) {
        // Get caller data
        const callerData = response.data
          .filter(item => item.type === 'callerid')
          .map(item => ({
            groupNo: item.group,
            noInGroup: item.no_of_groups,
            callerId: item.number
          }))
          .sort((a, b) => {
            // First sort by Group No. (ascending)
            const groupDiff = parseInt(a.groupNo) - parseInt(b.groupNo);
            if (groupDiff !== 0) return groupDiff;
            // Then sort by No. in Group (ascending)
            return parseInt(a.noInGroup) - parseInt(b.noInGroup);
          });
        
        setCallerRows(callerData);
        
        if (callerData.length === 0) {
          displayToast('No caller IDs found matching your search', 'info');
        }
      } else {
        setCallerRows([]);
        displayToast('No data found', 'info');
      }
    } catch (error) {
      console.error('Error searching caller data:', error);
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        displayToast('Search request timed out. Please try again.', 'error');
      } else if (error.response?.status === 404) {
        displayToast('Search endpoint not found. Please check the API.', 'error');
      } else if (error.response?.status >= 500) {
        displayToast('Server error. Please try again later.', 'error');
      } else {
        displayToast('Failed to search caller data. Please try again.', 'error');
      }
      
      setCallerRows([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCalleeSearch = async () => {
    if (!calleeSearch.trim()) {
      displayToast('Please enter a callee ID to search', 'error');
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await fetchNumberFilters('whitelist', calleeSearch.trim());
      
      if (response && response.success && response.data) {
        // Get callee data
        const calleeData = response.data
          .filter(item => item.type === 'calleeid')
          .map(item => ({
            groupNo: item.group,
            noInGroup: item.no_of_groups,
            calleeId: item.number
          }))
          .sort((a, b) => {
            // First sort by Group No. (ascending)
            const groupDiff = parseInt(a.groupNo) - parseInt(b.groupNo);
            if (groupDiff !== 0) return groupDiff;
            // Then sort by No. in Group (ascending)
            return parseInt(a.noInGroup) - parseInt(b.noInGroup);
          });
        
        setCalleeRows(calleeData);
        
        if (calleeData.length === 0) {
          displayToast('No callee IDs found matching your search', 'info');
        }
      } else {
        setCalleeRows([]);
        displayToast('No data found', 'info');
      }
    } catch (error) {
      console.error('Error searching callee data:', error);
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        displayToast('Search request timed out. Please try again.', 'error');
      } else if (error.response?.status === 404) {
        displayToast('Search endpoint not found. Please check the API.', 'error');
      } else if (error.response?.status >= 500) {
        displayToast('Server error. Please try again later.', 'error');
      } else {
        displayToast('Failed to search callee data. Please try again.', 'error');
      }
      
      setCalleeRows([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCallerCheck = idx => setCallerChecked(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  const handleCalleeCheck = idx => setCalleeChecked(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  
  const handleCallerDelete = async () => {
    if (callerChecked.length === 0) return;
    
    // Show browser confirmation dialog
    if (!window.confirm(`Are you sure you want to delete ${callerChecked.length} selected caller ID(s)?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Delete each selected item in a loop
      for (const idx of callerChecked) {
        const item = callerRows[idx];
        
        const response = await deleteNumberFilter('whitelist', item.callerId, 'callerid', item.groupNo);
        if (!response.success) {
          throw new Error(`Failed to delete caller ID: ${item.callerId}`);
        }
      }
      
      displayToast(`Successfully deleted ${callerChecked.length} caller ID(s)!`, 'success');
      setCallerChecked([]);
      
      // Refresh data after successful deletion
      await fetchWhitelistData();
      
    } catch (error) {
      console.error('Error deleting caller IDs:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete caller IDs. Please try again.';
      displayToast(errorMessage, 'error');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCallerClear = async () => {
    if (callerRows.length === 0) return;
    
    // Show browser confirmation dialog
    if (!window.confirm(`Are you sure you want to clear all ${callerRows.length} caller IDs?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await deleteAllNumberFilters('whitelist', 'callerid');
      
      if (response.success) {
        displayToast(`Successfully cleared all caller IDs!`, 'success');
        setCallerChecked([]);
        
        // Refresh data after successful deletion
        await fetchWhitelistData();
      } else {
        throw new Error('Failed to clear all caller IDs');
      }
      
    } catch (error) {
      console.error('Error clearing caller IDs:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clear caller IDs. Please try again.';
      displayToast(errorMessage, 'error');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCalleeDelete = async () => {
    if (calleeChecked.length === 0) return;
    
    // Show browser confirmation dialog
    if (!window.confirm(`Are you sure you want to delete ${calleeChecked.length} selected callee ID(s)?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Delete each selected item in a loop
      for (const idx of calleeChecked) {
        const item = calleeRows[idx];
        
        const response = await deleteNumberFilter('whitelist', item.calleeId, 'calleeid', item.groupNo);
        if (!response.success) {
          throw new Error(`Failed to delete callee ID: ${item.calleeId}`);
        }
      }
      
      displayToast(`Successfully deleted ${calleeChecked.length} callee ID(s)!`, 'success');
      setCalleeChecked([]);
      
      // Refresh data after successful deletion
      await fetchWhitelistData();
      
    } catch (error) {
      console.error('Error deleting callee IDs:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete callee IDs. Please try again.';
      displayToast(errorMessage, 'error');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCalleeClear = async () => {
    if (calleeRows.length === 0) return;
    
    // Show browser confirmation dialog
    if (!window.confirm(`Are you sure you want to clear all ${calleeRows.length} callee IDs?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await deleteAllNumberFilters('whitelist', 'calleeid');
      
      if (response.success) {
        displayToast(`Successfully cleared all callee IDs!`, 'success');
        setCalleeChecked([]);
        
        // Refresh data after successful deletion
        await fetchWhitelistData();
      } else {
        throw new Error('Failed to clear all callee IDs');
      }
      
    } catch (error) {
      console.error('Error clearing callee IDs:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clear callee IDs. Please try again.';
      displayToast(errorMessage, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCallerReset = () => {
    setCallerSearch('');
    fetchWhitelistData();
  };

  const handleCalleeReset = () => {
    setCalleeSearch('');
    fetchWhitelistData();
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] p-2 sm:p-4 md:p-6">
      {isInitialLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-4">
            <CircularProgress size={40} />
            <span className="text-gray-600 text-sm sm:text-base">Loading whitelist data...</span>
          </div>
        </div>
      )}
      
      {!isInitialLoading && (
        <>
          <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 w-full mx-auto">
            {/* CallerID Table */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-3 gap-2 sm:gap-3">
                <label className="font-semibold text-sm sm:text-base min-w-[60px] sm:min-w-[80px]">CallerID:</label>
                <TextField 
                  value={callerSearch} 
                  onChange={e => setCallerSearch(e.target.value)} 
                  size="small" 
                  variant="outlined" 
                  className="flex-1 w-full sm:w-auto"
                  onKeyPress={(e) => e.key === 'Enter' && handleCallerSearch()}
                  sx={{ '& .MuiInputBase-root': { backgroundColor: 'white' } }}
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="contained" 
                    startIcon={isSearching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                    sx={styles.button} 
                    onClick={handleCallerSearch}
                    disabled={isSearching}
                    className="flex-1 sm:flex-none"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<RestartAltIcon />} 
                    sx={styles.button} 
                    onClick={handleCallerReset}
                    disabled={isSearching}
                    className="flex-1 sm:flex-none"
                  >
                    Reset
                  </Button>
                </div>
              </div>
              <div className="bg-gray-200 w-full flex flex-col">
            <div className="w-full bg-gradient-to-b from-[#b3e0ff] to-[#3d92d0] text-[#222] font-semibold text-lg text-center py-1">CallerID Whitelist</div>
                <div className="overflow-x-auto w-full border-l-2 border-r-2 border-b-2 border-gray-400" style={{ height: '360px', maxHeight: '360px', overflowY: 'auto' }}>
                  <table className="w-full min-w-[460px] border-collapse table-auto">
                    <thead>
                      <tr>
                        <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 20, minWidth: '90px' }}>Check</th>
                        <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 32, minWidth: '120px' }}>Group No.</th>
                        {/* <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 32 }}>No. in Group</th> */}
                        <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 32, minWidth: '220px' }}>CallerID</th>
                        <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 32, minWidth: '110px' }}>Modify</th>
                      </tr>
                    </thead>
                    <tbody>
                      {callerRows.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #bbb', height: 32 }}>
                          <td className="border border-gray-400 text-center bg-white" style={{ padding: '6px 8px', height: 32, minWidth: '90px' }}><input type="checkbox" checked={callerChecked.includes(idx)} onChange={() => handleCallerCheck(idx)} className="w-4 h-4" /></td>
                          <td className="border border-gray-400 text-center bg-white text-xs" style={{ padding: '6px 8px', height: 32, minWidth: '120px' }}>{row.groupNo}</td>
                          {/* <td className="border border-gray-400 text-center bg-white text-xs" style={{ padding: '6px 8px', height: 32 }}>{row.noInGroup}</td> */}
                          <td className="border border-gray-400 text-center bg-white text-xs" style={{ padding: '6px 8px', height: 32, minWidth: '220px' }}>{row.callerId}</td>
                          <td className="border border-gray-400 text-center bg-white" style={{ padding: '6px 8px', height: 32, minWidth: '110px' }}>
                            <EditDocumentIcon onClick={() => handleEdit('caller', row)} style={{ color: '#0e8fd6', cursor: 'pointer', margin: '0 auto' }} className="w-5 h-5" />
                          </td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 12 - callerRows.length) }).map((_, idx) => (
                        <tr key={`empty-caller-${idx}`} style={{ borderBottom: '1px solid #bbb', background: '#fff', height: 32 }}> 
                          <td className="border border-gray-400 text-center bg-white" style={{ color: '#aaa', padding: '6px 8px', height: 32 }}>&nbsp;</td>
                          <td className="border border-gray-400 text-center bg-white" style={{ color: '#aaa', padding: '6px 8px', height: 32 }}>&nbsp;</td>
                          <td className="border border-gray-400 text-center bg-white" style={{ color: '#aaa', padding: '6px 8px', height: 32 }}>&nbsp;</td>
                          <td className="border border-gray-400 text-center bg-white" style={{ color: '#aaa', padding: '6px 8px', height: 32 }}>&nbsp;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-between items-center bg-gray-300 rounded-b-lg px-1 py-0.5 mt-1 border-l-2 border-r-2 border-b-2 border-gray-400">
                <div className="flex gap-1">
                  <button 
                    className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400" 
                    disabled={callerChecked.length === 0 || isDeleting} 
                    onClick={handleCallerDelete}
                  >
                    {isDeleting ? <CircularProgress size={16} color="inherit" /> : 'Delete'}
                  </button>
                  <button 
                    className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400" 
                    disabled={callerRows.length === 0 || isDeleting} 
                    onClick={handleCallerClear}
                  >
                    {isDeleting ? <CircularProgress size={16} color="inherit" /> : 'Clear All'}
                  </button>
                </div>
                <button 
                  className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400" 
                  onClick={() => handleAddNew('caller')}
                  disabled={isDeleting}
                >
                  Add New
                </button>
              </div>
            </div>
            
            {/* CalleeID Table */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-3 gap-2 sm:gap-3">
                <label className="font-semibold text-sm sm:text-base min-w-[60px] sm:min-w-[80px]">CalleeID:</label>
                <TextField 
                  value={calleeSearch} 
                  onChange={e => setCalleeSearch(e.target.value)} 
                  size="small" 
                  variant="outlined" 
                  className="flex-1 w-full sm:w-auto"
                  onKeyPress={(e) => e.key === 'Enter' && handleCalleeSearch()}
                  sx={{ '& .MuiInputBase-root': { backgroundColor: 'white' } }}
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="contained" 
                    startIcon={isSearching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                    sx={styles.button} 
                    onClick={handleCalleeSearch}
                    disabled={isSearching}
                    className="flex-1 sm:flex-none"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<RestartAltIcon />} 
                    sx={styles.button} 
                    onClick={handleCalleeReset}
                    disabled={isSearching}
                    className="flex-1 sm:flex-none"
                  >
                    Reset
                  </Button>
                </div>
              </div>
              <div className="bg-gray-200 w-full flex flex-col">
                <div className="w-full bg-gradient-to-b from-[#b3e0ff] to-[#3d92d0] text-[#222] font-semibold text-lg text-center py-1">CalleeID Whitelist</div>
                <div className="overflow-x-auto w-full border-l-2 border-r-2 border-b-2 border-gray-400" style={{ height: '360px', maxHeight: '360px', overflowY: 'auto' }}>
                  <table className="w-full min-w-[460px] border-collapse table-auto">
                    <thead>
                      <tr>
                            <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 20, minWidth: '90px' }}>Check</th>
                        <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 32, minWidth: '120px' }}>Group No.</th>
                        {/* <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 32 }}>No. in Group</th> */}
                        <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 32, minWidth: '220px' }}>CalleeID</th>
                        <th className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 32, minWidth: '110px' }}>Modify</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calleeRows.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #bbb', height: 32 }}>
                          <td className="border border-gray-400 text-center bg-white" style={{ padding: '6px 8px', height: 32, minWidth: '90px' }}><input type="checkbox" checked={calleeChecked.includes(idx)} onChange={() => handleCalleeCheck(idx)} className="w-4 h-4" /></td>
                          <td className="border border-gray-400 text-center bg-white text-xs" style={{ padding: '6px 8px', height: 32, minWidth: '120px' }}>{row.groupNo}</td>
                          {/* <td className="border border-gray-400 text-center bg-white text-xs" style={{ padding: '6px 8px', height: 32 }}>{row.noInGroup}</td> */}
                          <td className="border border-gray-400 text-center bg-white text-xs" style={{ padding: '6px 8px', height: 32, minWidth: '220px' }}>{row.calleeId}</td>
                          <td className="border border-gray-400 text-center bg-white" style={{ padding: '6px 8px', height: 32, minWidth: '110px' }}>
                            <EditDocumentIcon onClick={() => handleEdit('callee', row)} style={{ color: '#0e8fd6', cursor: 'pointer', margin: '0 auto' }} className="w-5 h-5" />
                          </td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 12 - calleeRows.length) }).map((_, idx) => (
                        <tr key={`empty-callee-${idx}`} style={{ borderBottom: '1px solid #bbb', background: '#fff', height: 32 }}> 
                          <td className="border border-gray-400 text-center bg-white" style={{ color: '#aaa', padding: '6px 8px', height: 32 }}>&nbsp;</td>
                          <td className="border border-gray-400 text-center bg-white" style={{ color: '#aaa', padding: '6px 8px', height: 32 }}>&nbsp;</td>
                          <td className="border border-gray-400 text-center bg-white" style={{ color: '#aaa', padding: '6px 8px', height: 32 }}>&nbsp;</td>
                          <td className="border border-gray-400 text-center bg-white" style={{ color: '#aaa', padding: '6px 8px', height: 32 }}>&nbsp;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-between items-center bg-gray-300 rounded-b-lg px-1 py-0.5 mt-1 border-l-2 border-r-2 border-b-2 border-gray-400">
                <div className="flex gap-1">
                  <button 
                    className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400" 
                    disabled={calleeChecked.length === 0 || isDeleting} 
                    onClick={handleCalleeDelete}
                  >
                    {isDeleting ? <CircularProgress size={16} color="inherit" /> : 'Delete'}
                  </button>
                  <button 
                    className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400" 
                    disabled={calleeRows.length === 0 || isDeleting} 
                    onClick={handleCalleeClear}
                  >
                    {isDeleting ? <CircularProgress size={16} color="inherit" /> : 'Clear All'}
                  </button>
                </div>
                <button 
                  className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400" 
                  onClick={() => handleAddNew('callee')}
                  disabled={isDeleting}
                >
                  Add New
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-center text-red-600 text-sm sm:text-base mt-6 sm:mt-8 px-2">
            Note: The one list, only the latest 200 pieces will be displayed. To check all the records, please backup the file.
          </div>
        </>
      )}
      
      {/* Modal */}
      <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        maxWidth={false} 
        PaperProps={{ 
          sx: { 
            maxWidth: '95vw', 
            width: { xs: '95vw', sm: 380 }, 
            background: '#f4f6fa', 
            borderRadius: 2, 
            border: '1.5px solid #888' 
          } 
        }}
      >
        <DialogTitle className="bg-gray-600 text-white text-center font-semibold text-lg">{modalType === 'caller' ? 'CallerIDs in Whitelist' : 'CalleeIDs in Whitelist'}</DialogTitle>
        <DialogContent className="bg-gray-200 flex flex-col gap-3 py-4">
          <div className="flex flex-row items-center border border-gray-400 rounded px-2 py-1 gap-2 w-full bg-white mb-1">
            <label className="text-xs text-gray-700 font-medium whitespace-nowrap text-left min-w-[120px] mr-2">Group No.:</label>
            <div className="flex-1 min-w-0">
              <MuiSelect 
                value={modalData.groupNo} 
                onChange={e => handleGroupNoChange(e.target.value)} 
                size="small" 
                fullWidth 
                sx={{ fontSize: '12px' }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      overflow: 'auto'
                    }
                  }
                }}      
              >
                {[...Array(200).keys()].map(i => (
                  <MenuItem key={i} value={i} sx={{ fontSize: '12px' }}>{i}</MenuItem>
                ))}
              </MuiSelect>
            </div>
          </div>
          {/* No. in Group removed from modal as requested */}
          <div className="flex flex-row items-center border border-gray-400 rounded px-2 py-1 gap-2 w-full bg-white mb-1">
            <label className="text-xs text-gray-700 font-medium whitespace-nowrap text-left min-w-[120px] mr-2">{modalType === 'caller' ? 'CallerID:' : 'CalleeID:'}</label>
            <div className="flex-1 min-w-0">
              <TextField 
                type="text" 
                value={modalData.idValue} 
                onChange={e => setModalData({ ...modalData, idValue: e.target.value })} 
                size="small" 
                fullWidth 
                disabled={isEditMode}
                sx={{ '& .MuiInputBase-input': { fontSize: '12px' } }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions className="flex justify-center gap-6 pb-4">
          <button 
            className="bg-gradient-to-b from-[#9ca3af] to-[#6b7280] text-white font-semibold text-xs rounded px-3 py-1 min-w-[100px] shadow hover:from-[#6b7280] hover:to-[#9ca3af] disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <CircularProgress size={16} color="inherit" />
                <span>Saving...</span>
              </div>
            ) : (
              'Save'
            )}
          </button>
          <button 
            className="bg-gradient-to-b from-[#d1d5db] to-[#9ca3af] text-[#111827] font-semibold text-xs rounded px-3 py-1 min-w-[100px] shadow hover:from-[#9ca3af] hover:to-[#d1d5db] disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={() => setShowModal(false)}
            disabled={isLoading}
          >
            Close
          </button>
        </DialogActions>
      </Dialog>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-[90vw] sm:w-auto">
          <Alert 
            severity={toastType} 
            onClose={() => setShowToast(false)}
            sx={{ 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: '8px'
            }}
          >
            {toastMessage}
          </Alert>
        </div>
      )}
    </div>
  );
};

export default Whitelist; 