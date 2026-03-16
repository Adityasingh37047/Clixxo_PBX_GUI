import React, { useState, useEffect, useRef } from 'react';
import { PCM_TRUNK_GROUP_FIELDS, PCM_TRUNK_GROUP_INITIAL_FORM, PCM_TRUNK_GROUP_TABLE_COLUMNS } from '../constants/PcmTrunkGroupConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { listPstn, listPstnGroups, savePstnGroup, deletePstnGroup, listIpPstnRoutes, listNumberManipulations } from '../api/apiService';
import { CircularProgress, Alert } from '@mui/material';

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const modalStyle = {
  background: '#f8fafd',
  border: '2px solid #222',
  borderRadius: 6,
  width: 440,
  maxWidth: '95vw',
  maxHeight: 'calc(100vh - 120px)',
  marginTop: 80,
  overflowY: 'auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  display: 'flex',
  flexDirection: 'column',
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
  width: 180, fontSize: 14, color: '#222', textAlign: 'left', marginRight: 10, whiteSpace: 'nowrap',
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
const addNewButtonStyle = {
  ...modalButtonStyle, marginTop: 24, minWidth: 120
};

// const LOCAL_STORAGE_KEY = 'pcmTrunkGroups';

const PcmTrunkGroupPage = () => {
  const tableScrollRef = useRef(null);
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(PCM_TRUNK_GROUP_INITIAL_FORM);
  const [checkAll, setCheckAll] = useState(false);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [spansData, setSpansData] = useState([]);
  const [isLoadingSpans, setIsLoadingSpans] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(groups.length / itemsPerPage));
  const pagedGroups = groups.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // useEffect(() => {
  //   localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(groups));
  // }, [groups]);

  // Fetch PCM trunk group data on component mount
  
  useEffect(() => {
    fetchPcmTrunkGroupData();
  }, []);

  const fetchSpansData = async () => {
    setIsLoadingSpans(true);
    try {
      const res = await listPstn();
      
      // Support various shapes: res.message, res.data, top-level array, or nested
      let raw = [];
      if (Array.isArray(res)) raw = res;
      else if (Array.isArray(res?.message)) raw = res.message;
      else if (Array.isArray(res?.data)) raw = res.data;
      else if (Array.isArray(res?.data?.message)) raw = res.data.message;
      if (!raw.length && res && typeof res === 'object') {
        const v = Object.values(res).find(x => Array.isArray(x) && x.length && (x[0]?.span_id != null || x[0]?.span != null));
        if (v) raw = v;
      }
      
      
      const mapped = raw
        .map((it) => {
          const spanId = it?.span_id ?? it?.span ?? it?.spanNo ?? it?.id;
          return spanId != null ? { spanNo: String(spanId) } : null;
        })
        .filter(Boolean);
      
      setSpansData(mapped);
      if (!mapped.length) console.warn('PSTN list returned no spans. Raw:', res);
    } catch (error) {
      console.error('Error fetching spans data:', error);
    } finally {
      setIsLoadingSpans(false);
    }
  };

  const fetchPcmTrunkGroupData = async () => {
    setIsLoadingData(true);
    setError(null); // Clear any previous errors
    try {
      const response = await listPstnGroups();
      if (response?.response && Array.isArray(response.message)) {
        const mapped = response.message.map((g) => ({
          groupId: g.group_id,
          pstnIds: g.pstn_ids || [],
          description: g.description || '',
        }));
        setGroups(mapped);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error('Error fetching PSTN groups:', error);
      alert(error?.message || 'Failed to load PSTN groups');
      // On error, keep empty array
      setGroups([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleOpenModal = async (item = null, index = -1) => {
    // Always fetch fresh spans data when opening modal
    await fetchSpansData();
    
    if (item) {
      // Editing existing item
      setFormData({ ...item, groupId: String(item.groupId) !== undefined ? Number(item.groupId) : item.groupId, originalIndex: index });
    } else {
      setFormData({ ...PCM_TRUNK_GROUP_INITIAL_FORM });
    }
    setIsModalOpen(true);
  };

  // Helper function to get used PSTN spans from existing groups
  const getUsedPstnSpans = () => {
    const usedSpans = new Set();
    groups.forEach(group => {
      if (group.pstnIds && Array.isArray(group.pstnIds)) {
        group.pstnIds.forEach(span => usedSpans.add(String(span)));
      }
    });
    return usedSpans;
  };

  // Helper function to check if a span is available for selection
  const isSpanAvailable = (spanNo, isEditing = false, editingGroupIndex = null) => {
    const usedSpans = getUsedPstnSpans();
    const spanStr = String(spanNo);
    
    // If we're editing an existing group, the spans used by that group should still be available
    if (isEditing && editingGroupIndex !== null) {
      const editingGroup = groups[editingGroupIndex];
      if (editingGroup && editingGroup.pstnIds && editingGroup.pstnIds.includes(spanStr)) {
        return true; // This span is used by the group we're editing, so it's available
      }
    }
    
    return !usedSpans.has(spanStr);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special validation for index field
    if (name === 'index') {
      const newIndex = parseInt(value);
      
      // Check if this index is already used by another item (excluding current item being edited)
      const existingIndexes = groups.map(group => parseInt(group.index));
      const currentIndex = formData.originalIndex !== undefined ? parseInt(groups[formData.originalIndex]?.index) : null;
      
      // Remove current item's index from the check if we're editing
      const otherIndexes = existingIndexes.filter(idx => idx !== currentIndex);
      
      if (otherIndexes.includes(newIndex)) {
        alert(`Index ${newIndex} is already in use. Please select a different index.`);
        return; // Don't update the form data
      }
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // PSTN IDs (checkboxes), use span.spanNo as pstn id string
  const handleTrunkCheckbox = (spanNo) => {
    const isEditing = formData.originalIndex !== undefined;
    const isAvailable = isSpanAvailable(spanNo, isEditing, formData.originalIndex);
    
    // Don't allow selection of unavailable spans
    if (!isAvailable) {
      return;
    }
    
    setFormData((prev) => {
      const idStr = String(spanNo);
      const next = prev.pstnIds?.includes(idStr)
        ? prev.pstnIds.filter((t) => t !== idStr)
        : [...(prev.pstnIds || []), idStr];
      return { ...prev, pstnIds: next };
    });
  };
  const handleCheckAll = () => {
    setCheckAll(true);
    // Check all available spans only
    const isEditing = formData.originalIndex !== undefined;
    const available = spansData
      .filter(span => isSpanAvailable(span.spanNo, isEditing, formData.originalIndex))
      .map(span => String(span.spanNo));
    setFormData((prev) => ({ ...prev, pstnIds: available }));
  };
  const handleUncheckAll = () => {
    setCheckAll(false);
    setFormData((prev) => ({ ...prev, pstnIds: [] }));
  };

  const handleSave = async () => {
    // Validate form data with better checks
    // Check if groupId is null, undefined, or empty string (but allow 0 as valid)
    if (formData.groupId === null || formData.groupId === undefined || formData.groupId === '') {
      alert('Please select a Group ID.');
      return;
    }

    if (!formData.description || formData.description.trim() === '') {
      alert('Please fill in the Description field.');
      return;
    }

    if (!formData.pstnIds || formData.pstnIds.length === 0) {
      alert('Please select at least one PSTN ID.');
      return;
    }

    // Additional validation for duplicate index
    const newIndex = parseInt(formData.groupId);
    const existingIndexes = groups.map(group => parseInt(group.groupId));
    const currentIndex = formData.originalIndex !== undefined ? parseInt(groups[formData.originalIndex]?.groupId) : null;
    const otherIndexes = existingIndexes.filter(idx => idx !== currentIndex);
    
    if (otherIndexes.includes(newIndex)) {
      alert(`Index ${newIndex} is already in use. Please select a different index.`);
      return;
    }

    setIsSaving(true);

    try {
      // Auto-upgrade index if it's a new entry (not editing existing)
      let finalIndex = parseInt(formData.groupId);
      if (formData.originalIndex === undefined) {
        const existingIndexes = groups.map(group => parseInt(group.groupId));
        let nextIndex = 0;
        while (existingIndexes.includes(nextIndex)) {
          nextIndex++;
        }
        finalIndex = nextIndex;
      }

      // Check if we're trying to create multiple trunk groups at once
      // If so, we need to create separate entries for each trunk
      if (formData.pstnIds.length > 1 && formData.originalIndex === undefined) {
        // Create multiple trunk groups - one for each selected trunk
        const savePromises = formData.pstnIds.map(async (pstnId, trunkIndex) => {
          const trunkGroupIndex = finalIndex + trunkIndex;
          return await savePstnGroup(trunkGroupIndex, [pstnId], `${formData.description}`);
        });

        const results = await Promise.all(savePromises);
        const allSuccessful = results.every(result => result && result.response);
        if (allSuccessful) {
          const newGroups = formData.pstnIds.map((pstnId, trunkIndex) => ({
            groupId: String(finalIndex + trunkIndex),
            description: formData.description,
            pstnIds: [pstnId]
          }));
          
          setGroups(prev => [...prev, ...newGroups]);

          alert(`Successfully created ${formData.pstnIds.length} PSTN group(s)!`);
          setIsModalOpen(false);
          await fetchPcmTrunkGroupData();
        } else {
          alert('Failed to create some PSTN groups. Please try again.');
        }
      } else {
        const response = await savePstnGroup(finalIndex, formData.pstnIds, formData.description);
        if (response?.response) {
          alert('PSTN Group saved successfully!');
          setIsModalOpen(false);
          await fetchPcmTrunkGroupData();
        } else {
          alert('Failed to save PSTN Group. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error saving PSTN group:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to save PSTN group');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const rootStyle = {
    background: '#fff',
    minHeight: 'calc(100vh - 128px)',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: groups.length === 0 ? 'center' : 'flex-start',
    position: 'relative',
    boxSizing: 'border-box',
  };

  const addNewButtonStyleSip = {
    background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
    color: '#fff',
    fontSize: 16,
    padding: '7px 32px',
    border: 'none',
    borderRadius: 6,
    boxShadow: '0 2px 4px rgba(0,0,0,0.10)',
    cursor: 'pointer',
    minWidth: 120,
    marginTop: 0,
  };

  const handleSelectRow = idx => {
    setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };
  const thStyle = {
    background: '#fff',
    color: '#222',
    fontWeight: 600,
    fontSize: 15,
    border: '1px solid #bbb',
    padding: '6px 8px',
    whiteSpace: 'nowrap',
  };
  const tdStyle = {
    border: '1px solid #bbb',
    padding: '6px 8px',
    fontSize: 14,
    background: '#fff',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  };

  // Add table scroll handler (for future custom scroll logic, matches SIP pages)
  const handleTableScroll = (e) => {
    // You can add custom scroll logic here if needed
  };

  // Add styles for table container, blue bar, scrollbar, buttons, and pagination (copied from SIP Register page)
  const tableContainerStyle = {
    width: '100%', maxWidth: '100%', margin: '0 auto', background: '#f8fafd', border: '2px solid #888', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  };
  const blueBarStyle = {
    width: '100%', height: 36, background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', borderTopLeftRadius: 8, borderTopRightRadius: 8, marginBottom: 0, display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 18, color: '#2266aa', justifyContent: 'center', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
  };
  const customScrollbarRowStyle = {
    width: '100%', margin: '0 auto', background: '#f4f6fa', display: 'flex', alignItems: 'center', height: 24, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, border: '2px solid #888', borderTop: 'none', padding: '0 4px', boxSizing: 'border-box',
  };
  const customScrollbarTrackStyle = {
    flex: 1, height: 12, background: '#e3e7ef', borderRadius: 8, position: 'relative', margin: '0 4px', overflow: 'hidden',
  };
  const customScrollbarThumbStyle = {
    position: 'absolute', height: 12, background: '#888', borderRadius: 8, cursor: 'pointer', top: 0,
  };
  const customScrollbarArrowStyle = {
    width: 18, height: 18, background: '#e3e7ef', border: '1px solid #bbb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#888', cursor: 'pointer', userSelect: 'none',
  };
  const tableButtonStyle = {
    background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)', color: '#222', fontSize: 15, padding: '4px 18px', border: '1px solid #bbb', borderRadius: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.10)', cursor: 'pointer', fontWeight: 500,
  };
  const addNewButtonStyle = {
    ...tableButtonStyle, background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)', color: '#fff',
  };
  const paginationButtonStyle = {
    ...tableButtonStyle, fontSize: 13, padding: '2px 10px', minWidth: 0, borderRadius: 4,
  };
  const pageSelectStyle = {
    fontSize: 13, padding: '2px 6px', borderRadius: 3, border: '1px solid #bbb', background: '#fff',
  };

  // Fix Check All and Uncheck All to work on visible rows
  const handleCheckAllRows = () => {
    setSelected(pagedGroups.map((_, idx) => (page - 1) * itemsPerPage + idx));
  };
  const handleUncheckAllRows = () => {
    setSelected([]);
  };

  // Check if PCM trunk group is referenced by routing rules or number manipulations
  const isPcmGroupReferenced = async (groupId) => {
    try {
      const gid = String(groupId);
      
      // Check routes (PSTN to IP routes use call_source field for PCM trunk groups)
      try {
        const routeRes = await listIpPstnRoutes('pstn_to_ip');
        const routeList = (routeRes && (routeRes.message || routeRes.data)) || [];
        const foundInRoutes = routeList.some(item => {
          try {
            // In RoutePstnToIPpage, callInitiator is mapped to call_source in the API
            const candidates = [
              item?.call_source,
              item?.callSource,
              item?.call_source_id,
              item?.callInitiator,
              item?.call_initiator,
              item?.callInitiatorId,
              item?.call_initiator_id,
              item?.pcm_trunk_group,
              item?.pcm_trunk_group_id,
            ]
              .filter(v => v !== undefined && v !== null)
              .map(v => String(v));
            return candidates.some(v => v === gid);
          } catch { return false; }
        });
        if (foundInRoutes) return true;
      } catch (e) {
        console.warn('Route reference check failed:', e?.message);
      }
      
      // Check number manipulations (if they use PCM trunk groups)
      try {
        const manipRes = await listNumberManipulations();
        const manipList = (manipRes && (manipRes.message || manipRes.data)) || [];
        const foundInManip = manipList.some(item => {
          try {
            const candidates = [
              item?.call_source,
              item?.callSource,
              item?.callInitiator,
              item?.call_initiator,
              item?.callInitiatorId,
              item?.call_initiator_id,
              item?.pcm_trunk_group,
              item?.pcm_trunk_group_id,
            ]
              .filter(v => v !== undefined && v !== null)
              .map(v => String(v));
            return candidates.some(v => v === gid);
          } catch { return false; }
        });
        if (foundInManip) return true;
      } catch (e) {
        console.warn('Number manipulation reference check failed:', e?.message);
      }
      
      return false;
    } catch (e) {
      console.warn('Reference check failed:', e?.message);
      return false;
    }
  };

  // Delete individual PCM trunk group
  const handleDeleteSelected = async () => {
    if (selected.length === 0) {
      alert('Please select at least one item to delete.');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete ${selected.length} selected item(s)?`);
    if (!confirmed) return;

    setIsLoadingData(true);
    try {
      let deletedCount = 0;
      let skippedCount = 0;
      
      for (const idx of selected) {
        const item = groups[idx];
        if (!item || item.groupId == null) continue;
        
        // Check if group is referenced before deleting
        const inUse = await isPcmGroupReferenced(item.groupId);
        if (inUse) {
          alert('The PCM trunk group cannot be deleted because it is quoted by the routing rule!');
          skippedCount++;
          continue;
        }
        
        // Delete the group
        try {
          const response = await deletePstnGroup(String(item.groupId));
          if (response?.response) {
            deletedCount++;
          } else {
            console.warn(`Failed to delete group ${item.groupId}:`, response?.message);
          }
        } catch (deleteError) {
          console.error(`Error deleting group ${item.groupId}:`, deleteError);
        }
      }
      
      // Refresh data from server
      await fetchPcmTrunkGroupData();
      setSelected([]);
      
      if (deletedCount > 0) {
        showMessage('success', `Successfully deleted ${deletedCount} item(s)${skippedCount > 0 ? `, ${skippedCount} skipped (in use)` : ''}`);
      } else if (skippedCount > 0) {
        showMessage('warning', `No items deleted. ${skippedCount} item(s) are in use and cannot be deleted.`);
      } else {
        showMessage('info', 'No items were deleted.');
      }
    } catch (error) {
      console.error('Error deleting selected items:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to delete selected items');
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  // Delete all PCM trunk groups
  const handleClearAll = async () => {
    if (groups.length === 0) {
      showMessage('info', 'No PCM trunk groups to clear');
      return;
    }
    
    const confirmed = window.confirm('Are you sure you want to delete ALL PCM trunk groups? This action cannot be undone.');
    if (!confirmed) return;

    setIsLoadingData(true);
    try {
      let deletedCount = 0;
      let skippedCount = 0;
      
      for (const group of groups) {
        // Check if group is referenced before deleting
        const inUse = await isPcmGroupReferenced(group.groupId);
        if (inUse) {
          alert('The PCM trunk group cannot be deleted because it is quoted by the routing rule!');
          skippedCount++;
          continue;
        }
        
        // Delete the group
        try {
          const response = await deletePstnGroup(String(group.groupId));
          if (response?.response) {
            deletedCount++;
          } else {
            console.warn(`Failed to delete group ${group.groupId}:`, response?.message);
          }
        } catch (deleteError) {
          console.error(`Error deleting group ${group.groupId}:`, deleteError);
        }
      }
      
      // Refresh data from server
      await fetchPcmTrunkGroupData();
      setSelected([]);
      setPage(1);
      
      if (deletedCount > 0) {
        showMessage('success', `Successfully deleted ${deletedCount} PCM trunk group(s)${skippedCount > 0 ? `, ${skippedCount} skipped (in use)` : ''}`);
      } else if (skippedCount > 0) {
        showMessage('warning', `No groups deleted. ${skippedCount} group(s) are in use and cannot be deleted.`);
      } else {
        showMessage('info', 'No groups were deleted.');
      }
    } catch (error) {
      console.error('Error deleting all PCM trunk groups:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to delete all PCM trunk groups');
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{ backgroundColor: '#dde0e4' }}>
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
          PCM Trunk Group
        </div>

        <div className="w-full max-w-full mx-auto" style={{ border: '2px solid #bbb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="bg-white rounded-lg shadow-sm w-full flex flex-col overflow-hidden">
            <div className="overflow-x-auto w-full border-b border-gray-300" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
              <table className="w-full min-w-[1200px] border border-gray-300 border-collapse whitespace-nowrap" style={{ tableLayout: 'auto', border: '1px solid #bbb' }}>
                <thead>
                  <tr style={{ minHeight: 32 }}>
                    <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Check</th>
                    {PCM_TRUNK_GROUP_TABLE_COLUMNS.filter(c => c.key !== 'check').map(c => (
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
                  {isLoadingData ? (
                    <tr>
                      <td colSpan={PCM_TRUNK_GROUP_TABLE_COLUMNS.length} className="border border-gray-300 px-2 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <CircularProgress size={20} />
                          <span>Loading PCM Trunk Group data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : groups.length === 0 ? (
                    <tr>
                      <td colSpan={PCM_TRUNK_GROUP_TABLE_COLUMNS.length} className="border border-gray-300 px-2 py-1 text-center">No data</td>
                    </tr>
                  ) : (
                    pagedGroups.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      return (
                        <tr key={realIdx} style={{ minHeight: 32 }}>
                          <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                            <input
                              type="checkbox"
                              checked={selected.includes(realIdx)}
                              onChange={() => handleSelectRow(realIdx)}
                            />
                          </td>
                    {PCM_TRUNK_GROUP_TABLE_COLUMNS.filter(col => col.key !== 'check').map(col => {
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
                            if (col.key === 'pstnIds') {
                              return (
                                <td key={col.key} className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                                  {item.pstnIds && item.pstnIds.length > 0 ? item.pstnIds.join(', ') : '--'}
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
                    })
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
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded cursor-pointer px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={() => setSelected(pagedGroups.map((_, idx) => (page - 1) * itemsPerPage + idx).filter(i => !selected.includes(i)))}>Inverse</button>
            <button 
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                selected.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`} 
              onClick={handleDeleteSelected}
              disabled={selected.length === 0}
            >
              Delete
            </button>
            <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={handleClearAll}>Clear All</button>
          </div>
          <button className="bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={() => handleOpenModal()}>Add New</button>
        </div>
          {/* Pagination */}
          <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
            <span>{groups.length} items Total</span>
            <span>{itemsPerPage} Items/Page</span>
            <span>{page}/{totalPages}</span>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(1)} disabled={page === 1}>First</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
            <span>Go to Page</span>
            <select className="text-xs rounded border border-gray-300 px-1 py-0.5 min-w-[40px]" value={page} onChange={e => setPage(Number(e.target.value))}>
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <span>{totalPages} Pages Total</span>
          </div>
        </div>
      {/* Modal Dialog */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth PaperProps={{ sx: { width: 600, maxWidth: '95vw', p: 0 } }}>
        <DialogTitle className="text-white text-center font-semibold text-lg" style={{ background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)', borderBottom: '1px solid #444444' }}>PCM Trunk Group</DialogTitle>
        <DialogContent className="flex flex-col gap-2 py-4" style={{ backgroundColor: '#dde0e4', border: '1px solid #444444', borderTop: 'none' }}>
              {PCM_TRUNK_GROUP_FIELDS.map((field) => (
            <div key={field.name} className="flex flex-row items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white mb-2">
              <label className="text-[15px] text-gray-700 font-medium whitespace-nowrap text-left min-w-[160px] mr-2">{field.label}:</label>
              <div className="flex-1 min-w-0">
                    {field.type === 'select' ? (
                  <Select
                    value={formData[field.name]}
                    onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    size="small"
                    fullWidth
                    variant="outlined"
                    className="bg-white"
                    MenuProps={{
                      PaperProps: {
                        style: { maxHeight: 240, width: 'auto' }
                      }
                    }}
                    sx={{ maxWidth: '100%', minWidth: 0 }}
                  >
                    {field.options.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                  </Select>
                    ) : (
                  <TextField
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    size="small"
                    fullWidth
                    variant="outlined"
                    className="bg-white"
                    sx={{ maxWidth: '100%', minWidth: 0 }}
                    placeholder={field.placeholder || ''}
                  />
                    )}
                  </div>
                </div>
              ))}
          {/* PCM Trunks Block */}
          <div className="flex flex-col border border-gray-200 rounded bg-white p-2 mb-2 w-full">
            {/* Warning message for multiple trunk selection */}
            {formData.pstnIds && formData.pstnIds.length > 1 && (
              <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                <strong>Note:</strong> You have selected {formData.pstnIds.length} PSTN IDs.
                This will create {formData.pstnIds.length} separate groups, each with a unique Group ID.
              </div>
            )}
            <div className="flex flex-row items-center justify-between mb-2">
              <span className="font-medium text-[15px] text-gray-700 min-w-[160px]">PCM Trunks:</span>
              <div className="flex flex-col items-end">
                <label className="flex items-center text-[14px] font-medium">
                  <input 
                    type="checkbox" 
                    checked={(() => {
                      const isEditing = formData.originalIndex !== undefined;
                      const availableSpans = spansData.filter(span => isSpanAvailable(span.spanNo, isEditing, formData.originalIndex));
                      return availableSpans.length > 0 && formData.pstnIds && formData.pstnIds.length === availableSpans.length;
                    })()} 
                    onChange={e => {
                      if (e.target.checked) {
                        const isEditing = formData.originalIndex !== undefined;
                        const availableSpans = spansData
                          .filter(span => isSpanAvailable(span.spanNo, isEditing, formData.originalIndex))
                          .map(span => String(span.spanNo));
                        setFormData(prev => ({ ...prev, pstnIds: availableSpans }));
                      } else {
                        setFormData(prev => ({ ...prev, pstnIds: [] }));
                      }
                    }} 
                    className="mr-2" 
                  /> 
                  Check All
                </label>
                <span className="text-xs text-gray-500 mt-1">
                  Selects all available PSTN spans
                  {(() => {
                    const isEditing = formData.originalIndex !== undefined;
                    const availableCount = spansData.filter(span => isSpanAvailable(span.spanNo, isEditing, formData.originalIndex)).length;
                    const usedCount = spansData.length - availableCount;
                    return (
                      <span className="ml-2">
                        ({availableCount} available{usedCount > 0 ? `, ${usedCount} used` : ''})
                      </span>
                    );
                  })()}
                </span>
                {formData.pstnIds && formData.pstnIds.length > 1 && (
                  <span className="text-xs text-blue-600 mt-1">
                    Will create {formData.pstnIds.length} separate groups
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {isLoadingSpans ? (
                <div className="text-gray-500 text-sm">Loading spans...</div>
              ) : spansData.length > 0 ? (
                spansData.map((span) => {
                  const isEditing = formData.originalIndex !== undefined;
                  const isAvailable = isSpanAvailable(span.spanNo, isEditing, formData.originalIndex);
                  const isChecked = formData.pstnIds && formData.pstnIds.includes(String(span.spanNo));
                  const isUsed = !isAvailable && !isChecked;
                  
                  
                  return (
                    <label 
                      key={span.spanNo} 
                      className={`flex items-center text-[14px] font-medium mb-0 py-1 min-h-[28px] border-b border-r border-gray-100 last:border-b-0 last:border-r-0 pl-1 ${
                        !isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTrunkCheckbox(String(span.spanNo))}
                        disabled={!isAvailable}
                        className="mr-2"
                      />
                      <span className={isUsed ? 'text-red-600' : ''}>
                        {span.spanNo}
                        {isUsed && <span className="text-xs text-red-500 ml-1">(used)</span>}
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="text-gray-500 text-sm">No spans available</div>
              )}
            </div>
          </div>
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
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
              color: '#374151',
              fontWeight: 600,
              fontSize: '16px',
              borderRadius: 1,
              minWidth: 100,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textTransform: 'none',
              '&:hover': { background: 'linear-gradient(to bottom, #d1d5db 0%, #e5e7eb 100%)', color: '#374151' },
            }}
            onClick={handleCloseModal}
            disabled={isSaving}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmTrunkGroupPage; 