import React, { useState, useRef, useEffect } from 'react';
import { PSTN_CALL_IN_CALLERID_FIELDS, PSTN_CALL_IN_CALLERID_TABLE_COLUMNS, PSTN_CALL_IN_CALLERID_INITIAL_FORM } from '../constants/PSTNCallInCallerIDConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select as MuiSelect, MenuItem, FormControl, CircularProgress } from '@mui/material';
import { listNumberManipulations, createNumberManipulation, updateNumberManipulation, deleteNumberManipulation, listPstnGroups } from '../api/apiService';

const LOCAL_STORAGE_KEY = 'pstnCallInCallerIdRules';

const grayButtonSx = {
  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
  color: '#222',
  fontWeight: 600,
  fontSize: 15,
  borderRadius: 1.5,
  minWidth: 110,
  boxShadow: '0 1px 2px rgba(0,0,0,0.10)',
  textTransform: 'none',
  px: 2.25,
  py: 1,
  padding: '4px 18px',
  border: '1px solid #bbb',
  '&:hover': {
    background: 'linear-gradient(to bottom, #bfc6d1 0%, #e3e7ef 100%)',
    color: '#222',
  },
};
const blueButtonSx = {
  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 16,
  borderRadius: 1.5,
  minWidth: 120,
  boxShadow: '0 2px 6px #0002',
  textTransform: 'none',
  px: 3,
  py: 1.5,
  padding: '6px 28px',
  border: '1px solid #0e8fd6',
  '&:hover': {
    background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
    color: '#fff',
  },
};
const paginationButtonSx = {
  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
  color: '#222',
  fontWeight: 600,
  fontSize: 13,
  borderRadius: 1.5,
  minWidth: 60,
  boxShadow: '0 1px 2px rgba(0,0,0,0.10)',
  textTransform: 'none',
  px: 1.25,
  py: 0.5,
  padding: '2px 10px',
  border: '1px solid #bbb',
  '&:hover': {
    background: 'linear-gradient(to bottom, #bfc6d1 0%, #e3e7ef 100%)',
    color: '#222',
  },
};

const PSTNCallInCallerID = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(PSTN_CALL_IN_CALLERID_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const [pcmTrunkGroups, setPcmTrunkGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false
  });
  const [editIndex, setEditIndex] = useState(null);

  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, width: 0, scrollWidth: 0 });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);

  // Fetch PCM Trunk Groups for Call Initiator dropdown
  const fetchPcmTrunkGroups = async () => {
    try {
      const response = await listPstnGroups();
      console.log('PCM Trunk Groups API Response:', response);
      if (response.response && response.message) {
        const pcmGroups = Array.isArray(response.message) ? response.message : [response.message];
        console.log('PCM Groups data:', pcmGroups);
        setPcmTrunkGroups(pcmGroups);
        
        // Set default value for new forms if no groups are loaded yet
        if (pcmGroups.length > 0 && formData.call_initiator === '') {
          const firstGroupId = pcmGroups[0].group_id || pcmGroups[0].id || pcmGroups[0];
          setFormData(prev => ({ ...prev, call_initiator: String(firstGroupId) }));
        }
      } else {
        console.log('No PCM groups data found');
        setPcmTrunkGroups([]);
      }
    } catch (error) {
      console.error('Error fetching PCM trunk groups:', error);
      if (error.message === 'Network Error') {
        alert('Network error. Please check your connection.');
      } else {
        alert(error.message || 'Failed to load PCM trunk groups');
      }
      setPcmTrunkGroups([]);
    }
  };

  // Fetch Number Manipulations
  const fetchNumberManipulations = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      console.log('Fetching number manipulations...');
      const response = await listNumberManipulations('pstn_in_callerid');
      console.log('Fetch response:', response);
      
      if (response.response && response.message) {
        console.log('Number manipulations data:', response.message);
        setRules(response.message);
      } else {
        console.log('No data in response, setting empty array');
        setRules([]);
      }
    } catch (error) {
      console.error('Error fetching number manipulations:', error);
      if (error.message === 'Network Error') {
        alert('Network error. Please check your connection.');
      } else if (error.response?.status === 500) {
        alert('Server error. The number manipulations endpoint may have issues.');
      } else {
        alert(error.message || 'Failed to load number manipulations');
      }
      setRules([]);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      // Editing existing item
      setFormData({
        ...item,
        stripped_digits_from_left: item.stripped_digits_from_left === '' || item.stripped_digits_from_left == null ? '0' : String(item.stripped_digits_from_left),
        stripped_digits_from_right: item.stripped_digits_from_right === '' || item.stripped_digits_from_right == null ? '0' : String(item.stripped_digits_from_right),
        reserved_digits_from_right: item.reserved_digits_from_right === '' || item.reserved_digits_from_right == null ? '0' : String(item.reserved_digits_from_right),
      });
      setEditIndex(item.id);
    } else {
      // Adding new item - set default call_initiator if available
      const defaultForm = { ...PSTN_CALL_IN_CALLERID_INITIAL_FORM };
      if (pcmTrunkGroups.length > 0) {
        const firstGroupId = pcmTrunkGroups[0].group_id || pcmTrunkGroups[0].id || pcmTrunkGroups[0];
        defaultForm.call_initiator = String(firstGroupId);
      }
      setFormData(defaultForm);
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async () => {
    // Validation: required fields including With Original CalleeID
    if (!formData.call_initiator) { alert('Call Initiator is required.'); return; }
    if (!formData.callerid_prefix) { alert('CallerID Prefix is required.'); return; }
    if (!formData.calleeid_prefix) { alert('CalleeID Prefix is required.'); return; }
    if (!formData.with_original_calleeid) { alert('With Original CalleeID is required.'); return; }

    // Normalize optional numeric fields to '0' when empty
    const normalized = {
      ...formData,
      stripped_digits_from_left: formData.stripped_digits_from_left === '' || formData.stripped_digits_from_left == null ? '0' : String(formData.stripped_digits_from_left),
      stripped_digits_from_right: formData.stripped_digits_from_right === '' || formData.stripped_digits_from_right == null ? '0' : String(formData.stripped_digits_from_right),
      reserved_digits_from_right: formData.reserved_digits_from_right === '' || formData.reserved_digits_from_right == null ? '0' : String(formData.reserved_digits_from_right),
    };

    setLoading(prev => ({ ...prev, save: true }));
    try {
      let response;
      if (editIndex !== null) {
        // Update existing - ensure we have the ID
        const updateData = {
          id: editIndex,
          call_initiator: normalized.call_initiator,
          callerid_prefix: normalized.callerid_prefix,
          calleeid_prefix: normalized.calleeid_prefix,
          with_original_calleeid: normalized.with_original_calleeid,
          stripped_digits_from_left: normalized.stripped_digits_from_left,
          stripped_digits_from_right: normalized.stripped_digits_from_right,
          reserved_digits_from_right: normalized.reserved_digits_from_right,
          prefix_to_add: normalized.prefix_to_add,
          suffix_to_add: normalized.suffix_to_add,
          description: normalized.description
        };
        console.log('Update request data:', updateData);
        response = await updateNumberManipulation(updateData, 'pstn_in_callerid');
        console.log('Update response:', response);
        if (response.response) {
          alert(response.message || 'Number manipulation updated successfully!');
          
          // Try to reload data, but don't fail if it doesn't work
          try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Allow backend to process
            console.log('Attempting to reload after successful update...');
            await fetchNumberManipulations();
            console.log('Reload successful after update');
          } catch (reloadError) {
            console.log('Updating item in local state as fallback');
            // Update the item in local state
            setRules(prev => prev.map((rule, idx) => 
              rule.id === editIndex ? { ...rule, ...normalized } : rule
            ));
          }
        } else {
          alert('Failed to update number manipulation');
        }
      } else {
        // Create new
        console.log('Create request data:', normalized);
        response = await createNumberManipulation(normalized, 'pstn_in_callerid');
        console.log('Create response:', response);
        if (response.response) {
          alert(response.message || 'Number manipulation created successfully!');
          
          // Try to reload data, but don't fail if it doesn't work
          try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Allow backend to process
            console.log('Attempting to reload after successful creation...');
            await fetchNumberManipulations();
            console.log('Reload successful after creation');
          } catch (reloadError) {
            console.log('Adding item to local state as fallback');
            // Add the new item to local state
            const newItem = {
              ...normalized,
              id: Date.now(), // Temporary ID for local state
              manipulation_type: 'pstn_in_callerid'
            };
            setRules(prev => [...prev, newItem]);
          }
        } else {
          alert('Failed to create number manipulation');
        }
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving number manipulation:', error);
      if (error.message === 'Network Error') {
        alert('Network error. Please check your connection.');
      } else {
        alert(error.message || 'Failed to save number manipulation');
      }
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (newPage) => setPage(Math.max(1, Math.min(totalPages, newPage)));

  const handleSelectRow = idx => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected(sel => sel.includes(realIdx) ? sel.filter(i => i !== realIdx) : [...sel, realIdx]);
  };
  const handleCheckAll = () => setSelected(rules.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () => setSelected(rules.map((_, idx) => !selected.includes(idx) ? idx : null).filter(i => i !== null));
  const handleDelete = async () => {
    if (selected.length === 0) {
      alert('Please select items to delete');
      return;
    }

    // Show browser confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete ${selected.length} selected item(s)?`);
    if (!confirmed) return;

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      console.log('Deleting selected items:', selected);
      const deletePromises = selected.map(async (idx) => {
        const item = rules[idx];
        if (item && item.id) {
          console.log('Deleting item with ID:', item.id);
          return await deleteNumberManipulation(item.id);
        }
        return null;
      });

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value && result.value.response).length;
      const failCount = results.length - successCount;
      
      console.log('Delete results:', results);
      
      if (successCount > 0) {
        alert(`${successCount} item(s) deleted successfully`);
        
        // Try to reload data, but don't fail if it doesn't work
        try {
          await fetchNumberManipulations();
        } catch (reloadError) {
          console.warn('Failed to reload after delete, removing from local state:', reloadError);
          // Remove deleted items from local state as fallback
          const selectedItems = selected.map(idx => rules[idx]);
          const selectedIds = selectedItems.map(item => item.id);
          setRules(prev => prev.filter(item => !selectedIds.includes(item.id)));
        }
        setSelected([]); // Clear selection
      }
      
      if (failCount > 0) {
        alert(`Failed to delete ${failCount} item(s)`);
      }
    } catch (error) {
      console.error('Error deleting selected items:', error);
      if (error.message === 'Network Error') {
        alert('Network error. Please check your connection.');
      } else {
        alert(error.message || 'Failed to delete selected items');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (rules.length === 0) {
      alert('No data to clear');
      return;
    }

    if (!window.confirm('Are you sure you want to delete ALL number manipulations? This action cannot be undone.')) {
      return;
    }

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      console.log('Clearing all number manipulations:', rules.map(item => item.id));
      const deletePromises = rules.map(async (item) => {
        if (item && item.id) {
          console.log('Deleting item:', item.id);
          return await deleteNumberManipulation(item.id);
        }
        return null;
      });

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value && result.value.response).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        alert(`All ${successCount} item(s) deleted successfully`);
        
        // Try to reload data, but don't fail if it doesn't work
        try {
          await fetchNumberManipulations();
        } catch (reloadError) {
          console.warn('Failed to reload after clear all, clearing local state:', reloadError);
          // Clear all items from local state as fallback
          setRules([]);
        }
        setSelected([]);
        setPage(1);
      }
      
      if (failCount > 0) {
        alert(`Failed to delete ${failCount} item(s)`);
      }
    } catch (error) {
      console.error('Error clearing all items:', error);
      if (error.message === 'Network Error') {
        alert('Network error. Please check your connection.');
      } else {
        alert(error.message || 'Failed to clear all items');
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

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

  // Load data on component mount
  useEffect(() => {
    fetchNumberManipulations();
    fetchPcmTrunkGroups();
  }, []);

  // Refresh function
  const handleRefresh = async () => {
    await fetchNumberManipulations();
  };

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

  const rootStyle = {
    background: '#fff',
    minHeight: 'calc(100vh - 128px)',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: rules.length === 0 ? 'center' : 'flex-start',
    position: 'relative',
    boxSizing: 'border-box',
  };

  const thumbWidth = scrollState.width && scrollState.scrollWidth ? Math.max(40, (scrollState.width / scrollState.scrollWidth) * (scrollState.width - 8)) : 40;
  const thumbLeft = scrollState.width && scrollState.scrollWidth && scrollState.scrollWidth > scrollState.width ? ((scrollState.left / (scrollState.scrollWidth - scrollState.width)) * (scrollState.width - thumbWidth - 16)) : 0;

  // Helper: get label as PCM Trunk Group [group_id]
  const getPcmGroupIdLabel = (groupId) => {
    const group = pcmTrunkGroups.find(g => String(g.group_id || g.id || g) === String(groupId));
    const gid = group ? (group.group_id ?? group.id ?? groupId) : groupId;
    return String(gid);
  };

  // Get updated fields with PCM trunk groups
  const getUpdatedFields = () => {
    return PSTN_CALL_IN_CALLERID_FIELDS.map(field => {
      if (field.name === 'call_initiator') {
        return {
          ...field,
          options: pcmTrunkGroups.map(group => ({
            value: String(group.group_id ?? group.id ?? group),
            label: `PCM Trunk Group [${String(group.group_id ?? group.id ?? group)}]`
          }))
        };
      }
      return field;
    });
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{backgroundColor: "#dde0e4"}}>
      {loading.fetch ? (
        <div className="flex items-center justify-center h-64">
          <CircularProgress />
          <span className="ml-2">Loading number manipulations...</span>
        </div>
      ) : rules.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center" style={{ minHeight: '15vh' }}>
          <div className="text-gray-600 text-xl md:text-[16px] font-semibold mb-4 text-center">No available number manipulation rule (PSTN Call In CallerID)!</div>
          <Button
            variant="contained"
            sx={{
              ...blueButtonSx,
              minWidth: 80,
              minHeight: 28,
              fontSize: '14px',
              fontWeight: 350,
              px: 0.5,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
            }}
            onClick={() => handleOpenModal()}
          >Add New</Button>
        </div>
      ) : (
        <>
          <div className="w-full max-w-full mx-auto">
            {/* Blue header bar - always show */}
            <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[16px] text-[#444] shadow-sm mt-0"
              style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
                  PSTN Call In CallerID
                </div>
            
            <div style={{ border: '2px solid #bbb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="bg-white w-full flex flex-col overflow-hidden" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
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
                    <tr style={{ minHeight: 32 }}>{PSTN_CALL_IN_CALLERID_TABLE_COLUMNS.map(c => <th key={c.key} className="bg-white text-[#222] font-semibold text-[12px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{c.label}</th>)}</tr>
                  </thead>
                  <tbody>
                    {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      return (
                        <tr key={realIdx} style={{ minHeight: 32 }}>
                          <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}><input type="checkbox" checked={selected.includes(realIdx)} onChange={() => handleSelectRow(idx)} /></td>
                          <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{realIdx + 1}</td>
                           {/* <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>PCM Trunk Group [{getPstnIdsForGroup(item.call_initiator)}]</td> */}
                           <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>PCM Trunk Group [{getPcmGroupIdLabel(item.call_initiator)}]</td>
                          <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.callerid_prefix}</td>
                          <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.calleeid_prefix}</td>
                          <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.with_original_calleeid}</td>
                          <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.stripped_digits_from_left}</td>
                          <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.stripped_digits_from_right}</td>
                          <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.reserved_digits_from_right}</td>
                          <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.prefix_to_add}</td>
                          <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.suffix_to_add}</td>
                          <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{item.description}</td>
                          <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}><EditDocumentIcon style={{ cursor: 'pointer', color: '#0e8fd6', display: 'block', margin: '0 auto' }} onClick={() => handleOpenModal(item, realIdx)} /></td>
                        </tr>
                      );
                    })}
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
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleCheckAll}
                disabled={loading.delete}
              >
                Check All
              </button>
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleUncheckAll}
                disabled={loading.delete}
              >
                Uncheck All
              </button>
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleInverse}
                disabled={loading.delete}
              >
                Inverse
              </button>
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
              >
                {loading.delete ? 'Deleting...' : 'Delete'}
              </button>
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleClearAll}
                disabled={loading.delete || rules.length === 0}
              >
                {loading.delete ? 'Clearing...' : 'Clear All'}
              </button>
              <button 
                className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
                onClick={handleRefresh}
                disabled={loading.fetch}
              >
                {loading.fetch ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <button 
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" 
              onClick={() => handleOpenModal()}
              disabled={loading.save}
            >
              {loading.save ? 'Saving...' : 'Add New'}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full px-2 py-2 text-[15px]" style={{ background: '#e3e7ef', marginTop: 8 }}>
            <span>{rules.length} Items Total</span>
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
        </>
      )}
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
          {editIndex !== null ? 'Edit PSTN Call In CallerID' : 'Add PSTN Call In CallerID'}
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
            {getUpdatedFields().map((field) => (
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
                    <FormControl size="small" fullWidth>
                      <MuiSelect value={formData[field.name] || ''} onChange={e => handleInputChange({ target: { name: field.name, value: e.target.value } })} variant="outlined" sx={{ fontSize: 14 }}>
                        {field.options.map(opt => (
                          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 14 }}>{opt.label}</MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  ) : (
                    <TextField type={field.type || 'text'} name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} size="small" fullWidth variant="outlined" inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }} />
                  )}
                </div>
              </div>
            ))}
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
            }}
            onClick={handleSave}
            disabled={loading.save}
          >
            Save
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
            }}
            onClick={handleCloseModal}
            disabled={loading.save}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PSTNCallInCallerID; 