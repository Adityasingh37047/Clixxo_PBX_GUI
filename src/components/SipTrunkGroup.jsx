import React, { useState, useRef, useEffect } from 'react';
import { SIP_TRUNK_GROUP_FIELDS, SIP_TRUNK_GROUP_INITIAL_FORM, SIP_TRUNK_GROUP_TABLE_COLUMNS } from '../constants/SipTrunkGroupConstants';
import { addGroup, listGroups, deleteGroup, listSipRegistrations, fetchSipIpTrunkAccounts, listIpPstnRoutes, listNumberManipulations } from '../api/apiService';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Button, Checkbox, Select, MenuItem, TextField, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditDocumentIcon from '@mui/icons-material/EditDocument';

const panelStyle = {
  background: '#fff',
  width: 950,
  maxWidth: '98vw',
  margin: '0 auto',
  marginTop: 0,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
};
const blueBarStyle = {
  width: '100%',
  height: 36,
  background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  marginBottom: 0,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: 18,
  color: '#505559',
  paddingLeft: 0,
  justifyContent: 'center',
  boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
};
const formBodyStyle = {
  width: '100%',
  padding: '36px 40px 36px 40px',
  display: 'flex',
  flexDirection: 'column',
  gap: 28,
  background: '#fff',
};
const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  minHeight: 38,
  margin: '0 0 0 0',
  gap: 0,
};
const labelStyle = {
  width: 320,
  fontSize: 16,
  color: '#505559',
  textAlign: 'right',
  marginRight: 32,
  whiteSpace: 'nowrap',
  fontWeight: 400,
};
const inputStyle = {
  flex: 1,
  fontSize: 16,
  padding: '10px 16px',
  borderRadius: 4,
  border: '1px solid #bbb',
  background: '#fff',
  boxSizing: 'border-box',
  
};
const checkboxRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};
const checkboxStyle = {
  width: 18,
  height: 18,
  accentColor: '#3bb6f5',
  border: '1.5px solid #3bb6f5',
  background: '#fff',
};
const footerStyle = {
  display: 'flex',  
  justifyContent: 'center',
  gap: 48,
  padding: '36px 0 24px 0',
};
const buttonStyle = {
  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
  color: '#fff',
  fontSize: 18,
  padding: '7px 38px',
  border: 'none',
  borderRadius: 6,
  boxShadow: '0 2px 4px rgba(0,0,0,0.10)',
  cursor: 'pointer',
  minWidth: 120,
  transition: 'background 0.2s, box-shadow 0.2s',
};
const buttonGrayStyle = {
  ...buttonStyle,
  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
  color: '#505559',
};
const infoTextStyle = {
  color: 'red',
  fontSize: 15,
  margin: '18px 0 0 0',
  textAlign: 'left',
  lineHeight: 1.5,
  padding: '0 0 24px 0',
  maxWidth: 950,
  marginLeft: 'auto',
  marginRight: 'auto',
};

const tableContainerStyle = {
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
  background: '#f8fafd',
  border: '2px solid #888',
  borderRadius: 8,
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  
};
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};
const thStyle = {
  background: '#fff',
  color: '#505559',
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

// --- Add classic SIP Register table styles ---
const tableButtonStyle = {
  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
    color: '#505559',
  fontSize: 16,
  padding: '6px 28px',
  border: '1px solid #bbb',
  borderRadius: 6,
  boxShadow: '0 1px 2px rgba(0,0,0,0.07)',
  cursor: 'pointer',
  minWidth: 90,
  marginRight: 4,
  marginLeft: 0,
  transition: 'background 0.2s, box-shadow 0.2s',
};
const addNewButtonStyle = {
  ...tableButtonStyle, background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)', color: '#fff', minWidth: 120, marginLeft: 12
};
const paginationBarStyle = {
  display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#505559', background: '#e3e7ef', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderTop: '1px solid #bbb', padding: '2px 8px', marginTop: 0, minHeight: 32,
};
const paginationButtonStyle = {
  ...tableButtonStyle, fontSize: 13, padding: '2px 10px', minWidth: 0, borderRadius: 4,
};
const pageSelectStyle = {
  fontSize: 13, padding: '2px 6px', borderRadius: 3, border: '1px solid #bbb', background: '#fff',
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

const SipTrunkGroup = () => {
  const [formData, setFormData] = useState(SIP_TRUNK_GROUP_INITIAL_FORM);
  const [groups, setGroups] = useState([]);
  const [trunkIds, setTrunkIds] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState({ fetch: false, save: false, delete: false });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(groups.length / itemsPerPage));
  const pagedGroups = groups.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: 0, width: 0, scrollWidth: 0 });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validation for group_id: only alphanumeric characters, no spaces
    if (name === 'group_id') {
      const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, '');
      setFormData((prev) => ({ ...prev, [name]: alphanumericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Fetch SIP Trunk IDs from SIP Registration and extension numbers from SIP-to-SIP account, then build combined options
  const fetchTrunkIds = async () => {
    try {
      const [regRes, ipTrunkRes] = await Promise.all([
        listSipRegistrations(),
        fetchSipIpTrunkAccounts()
      ]);

      // Collect trunk IDs
      const trunkIdList = Array.isArray(regRes?.message || regRes?.data)
        ? (regRes.message || regRes.data)
            .map((it) => it?.trunkId || it?.trunk_id || it?.id)
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v))
        : [];

      // Unique trunk IDs
      const uniqueTrunkIds = Array.from(new Set(trunkIdList));

      // Collect SIP-to-SIP extensions
      const extList = Array.isArray(ipTrunkRes?.message || ipTrunkRes?.data)
        ? (ipTrunkRes.message || ipTrunkRes.data)
            .map((it) => it?.extension || it?.id)
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v))
        : [];

      const uniqueExts = Array.from(new Set(extList));

      // Build combined options: trunkId/extension. Avoid duplicates.
      const combinedOptions = [];
      uniqueTrunkIds.forEach((tid) => {
        if (uniqueExts.length > 0) {
          uniqueExts.forEach((ext) => {
            combinedOptions.push({ value: `${tid}/${ext}`, label: `${tid}/${ext}` });
          });
        } else {
          // If no extensions exist yet, show plain trunkId option (only once)
          combinedOptions.push({ value: `${tid}`, label: `${tid}` });
        }
      });

      // Also include plain trunkId options for backward compatibility (so editing older rows works),
      // but ensure we don't add duplicates.
      uniqueTrunkIds.forEach((tid) => {
        combinedOptions.push({ value: `${tid}`, label: `${tid}` });
      });

      // Deduplicate by value (preserve first occurrence)
      const uniqueByValue = Array.from(new Map(combinedOptions.map(o => [o.value, o])).values());
      setTrunkIds(uniqueByValue);
    } catch (error) {
      console.error('Error fetching SIP trunk/extension IDs:', error);
      // Leave dropdown empty rather than failing the page
      setTrunkIds([]);
    }
  };

  // Fetch groups from API
  const fetchGroups = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    setError(null); // Clear any previous errors
    try {
      const response = await listGroups();
      if (response.response && response.message) {
        // Sort groups by ID to ensure proper order
        const sortedGroups = response.message.sort((a, b) => a.id - b.id);
        setGroups(sortedGroups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const handleSave = async () => {
    if (!formData.sip_trunk_id || !formData.group_id) {
      alert('Please fill in all required fields');
      return;
    }

    // Prevent multiple entries with the same Group ID (regardless of SIP trunk)
    const desiredGroupId = String(formData.group_id ?? '').trim();
    if (desiredGroupId === '') {
      alert('Group ID is required.');
      return;
    }

    const isDuplicate = groups.some((group, index) => {
      // Allow saving when editing the same item
      if (editIndex !== -1 && index === editIndex) return false;
      return String(group.group_id ?? '').trim() === desiredGroupId;
    });

    if (isDuplicate) {
      alert(`Group ID "${desiredGroupId}" already exists. Please choose a different Group ID.`);
      return;
    }

    setLoading(prev => ({ ...prev, save: true }));
    try {
      const response = await addGroup({
        sip_trunk_id: formData.sip_trunk_id,
        group_id: formData.group_id
      });
      
      if (response.response) {
        alert(response.message);
        setShowModal(false); // Close modal after confirmation
        setFormData(SIP_TRUNK_GROUP_INITIAL_FORM);
        setEditIndex(-1);
        await fetchGroups(); // Refresh the list
      }
    } catch (error) {
      console.error('Error saving group:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleAddNew = () => {
    setFormData(SIP_TRUNK_GROUP_INITIAL_FORM);
    setEditIndex(-1);
    setShowModal(true);
  };

  const handleEdit = (idx) => {
    const group = groups[idx];
    setFormData({
      sip_trunk_id: group.sip_trunk_id,
      group_id: group.group_id
    });
    setEditIndex(idx);
    setShowModal(true);
  };

  // Table selection logic
  const handleSelectRow = idx => {
    setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  };
  const handleCheckAll = () => setSelected(pagedGroups.map((_, idx) => (page - 1) * itemsPerPage + idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () => setSelected(pagedGroups.map((_, idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    return selected.includes(realIdx) ? null : realIdx;
  }).filter(i => i !== null));
  const handleDelete = async () => {
    if (selected.length === 0) {
      alert('Please select items to delete');
      return;
    }

    if (!confirm('Are you sure you want to delete the selected groups?')) {
      return;
    }

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      for (const idx of selected) {
        const group = groups[idx];
        const inUse = await isGroupReferenced(group.group_id);
        if (inUse) {
          alert('The SIP trunk group cannot be deleted because it is quoted by the routing rule!');
          continue;
        }
        await deleteGroup(group.id);
      }
      await fetchGroups(); // Refresh the list
      setSelected([]);
    } catch (error) {
      console.error('Error deleting groups:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all groups?')) {
      return;
    }

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      for (const group of groups) {
        const inUse = await isGroupReferenced(group.group_id);
        if (inUse) {
          alert(`Group ${group.group_id} cannot be deleted because it is quoted by the routing rule!`);
          continue;
        }
        await deleteGroup(group.id);
      }
      await fetchGroups(); // Refresh the list
      setSelected([]);
      setPage(1);
    } catch (error) {
      console.error('Error clearing all groups:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handlePageChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= totalPages) setPage(val);
  };

  const handleSingleDelete = async (idx) => {
    const group = groups[idx];
    if (!confirm(`Are you sure you want to delete group "${group.group_id}"?`)) {
      return;
    }

    try {
      const inUse = await isGroupReferenced(group.group_id);
      if (inUse) {
        alert('The SIP trunk group cannot be deleted because it is quoted by the routing rule!');
        return;
      }
      await deleteGroup(group.id);
      await fetchGroups(); // Refresh the list
      if (editIndex === idx) handleAddNew();
    } catch (error) {
      console.error('Error deleting group:', error);
      setError('Network error. Please check your connection.');
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

  useEffect(() => {
    // Fetch trunk IDs and groups on component mount
    fetchTrunkIds();
    fetchGroups();
  }, []);

  // Check if SIP trunk group is referenced by routing rules (exact field checks; avoid substring false positives)
  const isGroupReferenced = async (groupId) => {
    try {
      const gid = String(groupId);
      // Only IP->PSTN routes should reference SIP trunk groups as call_source
      const res = await listIpPstnRoutes('ip_to_pstn');
      const list = (res && (res.message || res.data)) || [];
      const foundInRoutes = list.some(item => {
        try {
          const candidates = [
            item?.call_source,
            item?.callSource,
            item?.source_group,
            item?.source_group_id,
            item?.sip_trunk_group,
            item?.sip_trunk_group_id,
          ]
            .filter(v => v !== undefined && v !== null)
            .map(v => String(v));
          return candidates.some(v => v === gid);
        } catch { return false; }
      });

      if (foundInRoutes) return true;

      // Also check number manipulation rules (they may reference SIP trunk groups via call_initiator)
      try {
        const manipRes = await listNumberManipulations();
        const manipList = (manipRes && (manipRes.message || manipRes.data)) || [];
        const foundInManip = manipList.some(item => {
          try {
            const candidates = [
              item?.call_initiator,
              item?.callInitiator,
              item?.callInitiatorId,
              item?.call_initiator_id,
              item?.call_source,
              item?.callSource,
              item?.sip_trunk_group,
              item?.sip_trunk_group_id,
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


  const thumbWidth = scrollState.width && scrollState.scrollWidth ? Math.max(40, (scrollState.width / scrollState.scrollWidth) * (scrollState.width - 8)) : 40;
  const thumbLeft = scrollState.width && scrollState.scrollWidth && scrollState.scrollWidth > scrollState.width ? ((scrollState.left / (scrollState.scrollWidth - scrollState.width)) * (scrollState.width - thumbWidth - 16)) : 0;

  return ( 
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{backgroundColor: "#dde0e4"}}>
      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50 flex items-center gap-2">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-white hover:text-gray-200 font-bold text-lg"
          >
            ×
          </button>
        </div>
      )}
      <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}>
          <>
            <div className="w-full max-w-full mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
              <div
                style={{
                  width: '100%',
                  height: 36,
                  background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 600,
                  fontSize: 18,
                  color: '#505559',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
                  maxWidth: '100%',
                }}
              >
                SIP Trunk Group
              </div>
              <div className="w-full max-w-full mx-auto" style={{ border: '2px solid #bbb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', borderTop: 'none' }}>
                <div className="bg-white rounded-lg shadow-sm w-full flex flex-col overflow-hidden">
                  <div className="overflow-x-auto w-full border-b border-gray-300" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
                    <table className="w-full min-w-[1200px] border border-gray-300 border-collapse whitespace-nowrap" style={{ tableLayout: 'auto', border: '1px solid #bbb' }}>
                      <thead>
                        <tr style={{ minHeight: 32 }}>
                          {SIP_TRUNK_GROUP_TABLE_COLUMNS.map(col => (
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
                        {loading.fetch ? (
                          <tr style={{ minHeight: 32 }}>
                            <td colSpan={SIP_TRUNK_GROUP_TABLE_COLUMNS.length} className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                              <div className="flex items-center justify-center gap-2">
                                <CircularProgress size={20} />
                                <span>Loading groups...</span>
                              </div>
                            </td>
                          </tr>
                        ) : pagedGroups.length === 0 ? (
                          <tr style={{ minHeight: 32 }}>
                            <td colSpan={SIP_TRUNK_GROUP_TABLE_COLUMNS.length} className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>No data</td>
                          </tr>
                        ) : (
                          pagedGroups.map((item, idx) => {
                            const realIdx = (page - 1) * itemsPerPage + idx;
                            return (
                              <tr key={realIdx} style={{ minHeight: 32 }}>
                                {SIP_TRUNK_GROUP_TABLE_COLUMNS.map(col => {
                                  if (col.key === 'check') {
                                    return (
                                      <td key={col.key} className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                                        <input
                                          type="checkbox"
                                          checked={selected.includes(realIdx)}
                                          onChange={() => handleSelectRow(realIdx)}
                                          disabled={loading.delete}
                                        />
                                      </td>
                                    );
                                  }
                                  if (col.key === 'modify') {
                                    return (
                                      <td key={col.key} className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                                        <EditDocumentIcon 
                                          className={`cursor-pointer text-blue-600 mx-auto ${loading.delete ? 'opacity-50' : ''}`}
                                          onClick={() => !loading.delete && handleEdit(realIdx)} 
                                        />
                                      </td>
                                    );
                                  }
                                  let value = item[col.key];
                                  // For index column, show auto-increment number
                                  if (col.key === 'index') {
                                    value = realIdx + 1;
                                  }
                                  return (
                                    <td
                                      key={col.key}
                                      className="border border-gray-300 text-center bg-white"
                                      style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}
                                    >
                                      {value !== undefined && value !== null && value !== '' ? value : '--'}
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
            </div>
            <div style={{ minHeight: 32, padding: '4px 6px' }} className="flex flex-wrap justify-between items-center bg-[#e3e7ef] rounded-b-lg border border-t-0 border-gray-300 gap-2 w-full mt-0">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:opacity-50" onClick={handleCheckAll} disabled={loading.delete}>Check All</button>
                <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:opacity-50" onClick={handleUncheckAll} disabled={loading.delete}>Uncheck All</button>
                <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:opacity-50" onClick={handleInverse} disabled={loading.delete}>Inverse</button>
                <button 
                  className={`font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow transition-all ${
                    selected.length > 0 && !loading.delete 
                      ? 'bg-gray-300 text-gray-700 hover:bg-gray-400 cursor-pointer' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={handleDelete} 
                  disabled={selected.length === 0 || loading.delete}
                >
                  {loading.delete ? <CircularProgress size={12} color="inherit" /> : 'Delete'}
                </button>
                <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 disabled:opacity-50" onClick={handleClearAll} disabled={loading.delete}>Clear All</button>
              </div>
              <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={handleAddNew}>Add New</button>
            </div>
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
          </>
        
        {/* Modal for Add/Edit */}
        <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth={false} className="z-50" PaperProps={{ sx: { width: 520, maxWidth: '90vw', mx: 'auto', p: 0, borderRadius: 1 } }}>
          <DialogTitle className="text-white text-center font-semibold p-2 text-base" style={{ background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)', borderBottom: '1px solid #444444' }}>
            {editIndex !== -1 ? 'Edit SIP Trunk Group' : 'Add SIP Trunk Group'}
          </DialogTitle>
          <DialogContent className="pt-3 pb-0 px-2" style={{ padding: '12px 12px 0 12px', backgroundColor: '#dde0e4', border: '1px solid #444444', borderTop: 'none' }}>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:160, marginRight:10}}>SIP Trunk ID:</label>
                <div className="flex-1">
                  <Select
                    name="sip_trunk_id"
                    value={formData.sip_trunk_id}
                    onChange={handleInputChange}
                    size="small"
                    displayEmpty
                    sx={{ width: 300, '& .MuiOutlinedInput-input': { padding: '6px 8px', fontSize: 14 } }}
                  >
                    <MenuItem value="" disabled>Select SIP Trunk ID</MenuItem>
                    {trunkIds.length === 0 ? (
                      <MenuItem value="" disabled>No options</MenuItem>
                    ) : (
                      trunkIds.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))
                    )}
                  </Select>
                </div>
              </div>
              <div className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 gap-2" style={{ minHeight: 32 }}>
                <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:160, marginRight:10}}>Group ID:</label>
                <div className="flex-1">
                  <TextField type="text" name="group_id" value={formData.group_id} onChange={handleInputChange} size="small" variant="outlined" placeholder="Enter Group ID" sx={{ width: 300 }} inputProps={{ style: { fontSize: 14, padding: '3px 6px' } }} />
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions className="p-4 justify-center gap-6">
            <Button variant="contained" onClick={handleSave} disabled={loading.save} sx={{ background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)', color: '#fff', fontWeight: 600, fontSize: '16px', borderRadius: 2, minWidth: 120, minHeight: 40, px: 2, py: 0.5, boxShadow: '0 2px 8px #b3e0ff', textTransform: 'none', '&:hover': { background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)', color: '#fff' }, '&:disabled': { background: '#ccc', color: '#666' } }}>{loading.save ? <CircularProgress size={20} color="inherit" /> : 'Save'}</Button>
            <Button variant="contained" onClick={() => setShowModal(false)} sx={{ background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)', color: '#374151', fontWeight: 600, fontSize: '16px', borderRadius: 2, minWidth: 120, minHeight: 40, px: 2, py: 0.5, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textTransform: 'none', '&:hover': { background: 'linear-gradient(to bottom, #d1d5db 0%, #e5e7eb 100%)', color: '#374151' }, '&:disabled': { background: '#f3f4f6', color: '#9ca3af' } }}>Close</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default SipTrunkGroup;
