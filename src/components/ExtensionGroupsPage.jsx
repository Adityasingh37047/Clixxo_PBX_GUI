import React, { useState, useEffect, useRef } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import { fetchSipAccounts, fetchExtensionGroups, createExtensionGroup, updateExtensionGroup, deleteExtensionGroup } from '../api/apiService';

const ExtensionGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({ fetch: false, delete: false, save: false });
  const hasInitialLoadRef = useRef(false);

  // Add/Edit modal state
  const [editGroupId, setEditGroupId] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [selectedExtensions, setSelectedExtensions] = useState([]);
  const [loadingExtensions, setLoadingExtensions] = useState(false);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(groups.length / itemsPerPage));
  const pagedGroups = groups.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const showAlert = (text) => { window.alert(text); };

  const loadGroups = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const res = await fetchExtensionGroups();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      setGroups(list.map(g => ({
        id: g.id,
        name: g.name || '',
        extensions: Array.isArray(g.extensions) ? g.extensions.map(String) : []
      })));
    } catch (err) {
      showAlert(err?.message || 'Failed to load extension groups.');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadGroups();
    }
  }, []);

  const handleCheckAll = () => setSelected(groups.map((_, i) => i));
  const handleUncheckAll = () => setSelected([]);
  const handleSelectRow = (idx) => {
    setSelected(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert('Please select at least one group to delete.');
      return;
    }
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const ids = selected.map(i => groups[i]?.id).filter(Boolean);
      await Promise.all(ids.map(id => deleteExtensionGroup(id)));
      setSelected([]);
      await loadGroups();
      showAlert(`Deleted ${ids.length} group(s).`);
    } catch (err) {
      showAlert(err?.message || 'Failed to delete groups.');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const openExtensionList = () => {
    setLoadingExtensions(true);
    fetchSipAccounts()
      .then(res => {
        const list = res?.message ?? [];
        const exts = (Array.isArray(list) ? list : []).map(item => ({
          extension: String(item.extension ?? ''),
          name: item.name || item.display_name || item.extension || '',
        })).filter(e => e.extension);
        setAvailableExtensions(exts);
      })
      .catch(() => {
        setAvailableExtensions([]);
        showAlert('Failed to load extensions.');
      })
      .finally(() => setLoadingExtensions(false));
  };

  const handleOpenAddModal = () => {
    setEditGroupId(null);
    setGroupName('');
    setSelectedExtensions([]);
    setShowModal(true);
    openExtensionList();
  };

  const handleOpenEditModal = (group) => {
    setEditGroupId(group.id);
    setGroupName(group.name || '');
    setSelectedExtensions(Array.isArray(group.extensions) ? [...group.extensions] : []);
    setShowModal(true);
    openExtensionList();
  };

  const handleCloseAddModal = () => {
    setShowModal(false);
    setEditGroupId(null);
    setGroupName('');
    setSelectedExtensions([]);
  };

  const handleExtensionCheckAll = () => setSelectedExtensions(availableExtensions.map(e => e.extension));
  const handleExtensionUncheckAll = () => setSelectedExtensions([]);
  const toggleExtension = (ext) => {
    setSelectedExtensions(prev =>
      prev.includes(ext) ? prev.filter(e => e !== ext) : [...prev, ext]
    );
  };

  const handleSaveGroup = async () => {
    const name = groupName?.trim();
    if (!name) {
      showAlert('Please enter a group name.');
      return;
    }
    if (selectedExtensions.length === 0) {
      showAlert('Please select at least one extension.');
      return;
    }
    const extensions = [...selectedExtensions].sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
    setLoading(prev => ({ ...prev, save: true }));
    try {
      if (editGroupId != null) {
        await updateExtensionGroup({ id: editGroupId, name, extensions });
        showAlert('Group updated.');
      } else {
        await createExtensionGroup({ name, extensions });
        showAlert('Group created.');
      }
      await loadGroups();
      handleCloseAddModal();
    } catch (err) {
      showAlert(err?.message || 'Failed to save group.');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-2">
      <div className="w-full max-w-full mx-auto">
        <div
          className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{ background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)' }}
        >
          Extension Groups
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[600px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
            <thead>
              <tr>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center"></th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center">#</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Group Name</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Extensions</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading.fetch ? (
                <tr>
                  <td colSpan={5} className="border border-gray-300 px-2 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <CircularProgress size={20} />
                      <span>Loading groups...</span>
                    </div>
                  </td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                    No extension groups yet. Click &quot;Add New&quot; to create one.
                  </td>
                </tr>
              ) : (
                pagedGroups.map((group, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  return (
                    <tr key={group.id}>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(realIdx)}
                          onChange={() => handleSelectRow(realIdx)}
                          disabled={loading.delete}
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{realIdx + 1}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center font-medium">{group.name}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center text-gray-700">
                        {group.extensions?.length ? group.extensions.join(', ') : '—'}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <EditDocumentIcon
                          className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100"
                          titleAccess="Edit"
                          onClick={() => handleOpenEditModal(group)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap justify-between items-center bg-[#e3e7ef] rounded-b-lg border border-t-0 border-gray-300 px-2 py-2 gap-2">
          <div className="flex flex-wrap gap-2">
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
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleDelete}
              disabled={loading.delete || loading.fetch}
            >
              {loading.delete && <CircularProgress size={12} />}
              Delete
            </button>
          </div>
          <div className="flex gap-2">
            <button
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.save || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleOpenAddModal}
              disabled={loading.save || loading.fetch}
            >
              Add New
            </button>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
            <span>{groups.length} items Total</span>
            <span>{itemsPerPage} Items/Page</span>
            <span>{page}/{totalPages}</span>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(1)} disabled={page === 1}>First</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
            <select className="text-xs rounded border border-gray-300 px-1 py-0.5 min-w-[40px]" value={page} onChange={e => setPage(Number(e.target.value))}>
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <span>{totalPages} Pages Total</span>
          </div>
        )}
      </div>

      {/* Add New Group Modal */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseAddModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: { width: 520, maxWidth: '95vw', mx: 'auto', p: 0 }
        }}
      >
        <DialogTitle
          className="text-white text-center font-semibold p-2 text-base"
          style={{
            background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
            borderBottom: '1px solid #444444'
          }}
        >
          {editGroupId != null ? 'Edit Extension Group' : 'Add New Extension Group'}
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
          <div className="flex flex-col gap-3 w-full pb-2">
            <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
              <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                Group Details
              </div>
              <div className="p-2">
                <TextField
                  fullWidth
                  label="Group Name"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="e.g. Sales, Support"
                  size="small"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-input': {
                      padding: '10px 14px',
                      fontSize: 14,
                      lineHeight: 1.4,
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
              <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa] flex items-center justify-between">
                <span>Select extensions</span>
                <div className="flex gap-1">
                  <Button size="small" onClick={handleExtensionCheckAll} sx={{ fontSize: 12, textTransform: 'none', minWidth: 0, px: 1 }}>Check All</Button>
                  <Button size="small" onClick={handleExtensionUncheckAll} sx={{ fontSize: 12, textTransform: 'none', minWidth: 0, px: 1 }}>Uncheck All</Button>
                </div>
              </div>
              <div className="p-2 border-t-0 max-h-[280px] overflow-y-auto" style={{ borderTop: 'none' }}>
                {loadingExtensions ? (
                  <div className="flex items-center justify-center py-8">
                    <CircularProgress size={24} />
                    <span className="ml-2 text-sm">Loading extensions...</span>
                  </div>
                ) : availableExtensions.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4 text-center">No extensions found. Create SIP accounts first.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {availableExtensions.map(({ extension, name }) => (
                      <FormControlLabel
                        key={extension}
                        control={
                          <Checkbox
                            checked={selectedExtensions.includes(extension)}
                            onChange={() => toggleExtension(extension)}
                            size="small"
                            sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }}
                          />
                        }
                        label={<span style={{ fontSize: 14 }}>{extension}{name ? ` — ${name}` : ''}</span>}
                      />
                    ))}
                  </div>
                )}
                {selectedExtensions.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">{selectedExtensions.length} extension(s) selected</p>
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
            onClick={handleSaveGroup}
            disabled={loading.save}
            startIcon={loading.save && <CircularProgress size={20} color="inherit" />}
          >
            {loading.save ? 'Saving...' : editGroupId != null ? 'Update Group' : 'Create Group'}
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
            onClick={handleCloseAddModal}
            disabled={loading.save}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExtensionGroupsPage;
