import React, { useState, useEffect } from 'react';
import {
  ACCOUNT_MANAGE_TABLE_COLUMNS,
  ACCOUNT_MANAGE_MODAL_FIELDS,
  ACCOUNT_MANAGE_INITIAL_FORM,
  ACCOUNT_MANAGE_BUTTONS,
} from '../constants/AccountManageConstants';
import {
  fetchAccountManageGetAll,
  fetchAccountManageRegister,
  fetchAccountManageUpdate,
  fetchAccountManageDelete,
} from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import Button from '@mui/material/Button';
import { Checkbox, FormControlLabel } from '@mui/material';

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const modalStyle = {
  background: '#f8fafd', border: '2px solid #222', borderRadius: 6, width: 340, maxWidth: '95vw', maxHeight: 'calc(100vh - 120px)', marginTop: 80, overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column',
};
const modalHeaderStyle = {
  background: 'linear-gradient(to bottom, #23272b 0%, #6e7a8a 100%)', color: '#fff', fontWeight: 600, fontSize: 18, padding: '10px 0', textAlign: 'center', borderTopLeftRadius: 4, borderTopRightRadius: 4,
};
const modalBodyStyle = {
  padding: '12px 8px 0 8px', display: 'flex', flexDirection: 'column', gap: 8,
};
const modalRowStyle = {
  display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #c0c6cc', borderRadius: 4, padding: '6px 8px', marginBottom: 2, minHeight: 32, gap: 16,
};
const modalLabelStyle = {
  width: 110, fontSize: 14, color: '#222', textAlign: 'left', marginRight: 10, whiteSpace: 'nowrap',
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
const tableContainerStyle = {
  width: '100%', maxWidth: '100%', margin: '0 auto', background: '#f8fafd', border: '1px solid #ccc', borderRadius: 8, boxShadow: 'none',
};
const blueBarStyle = {
  width: '100%', height: 36, background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', borderTopLeftRadius: 8, borderTopRightRadius: 8, marginBottom: 0, display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 18, color: '#000', justifyContent: 'center', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
};
const thStyle = {
  background: '#fff', color: '#222', fontWeight: 600, fontSize: 15, border: '1px solid #bbb', padding: '6px 8px', whiteSpace: 'nowrap',
};
const tdStyle = {
  border: '1px solid #bbb', padding: '6px 8px', fontSize: 14, background: '#fff', textAlign: 'center', whiteSpace: 'nowrap',
};
const tableButtonSx = {
  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
  color: '#222',
  fontSize: 15,
  padding: '4px 18px',
  border: '1px solid #bbb',
  borderRadius: 1.5,
  boxShadow: '0 1px 2px rgba(0,0,0,0.10)',
  fontWeight: 500,
  textTransform: 'none',
  minWidth: 90,
  '&:hover': {
    background: 'linear-gradient(to bottom, #bfc6d1 0%, #e3e7ef 100%)',
    color: '#222',
  },
};
const addNewButtonSx = {
  ...tableButtonSx,
  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
  color: '#fff',
  '&:hover': {
    background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
    color: '#fff',
  },
};
const ITEMS_PER_PAGE = 20;

const AccountManage = () => {
  const { user: currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ACCOUNT_MANAGE_INITIAL_FORM);
  const [editIdx, setEditIdx] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all users on component mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // API Functions
  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchAccountManageGetAll();
      
      if (response && response.response === true && response.data) {
        const usersWithAdminFlag = response.data.map(user => ({
          ...user,
          isAdmin:
          user.username?.toLowerCase() === 'admin'
        
        }));
        
        setAccounts(usersWithAdminFlag);
        
      } else {
        throw new Error(response?.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Handle different types of errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setError('Request timeout. Please check your connection and try again.');
      } else if (error.response?.status === 404) {
        setError('User data not found. Please contact administrator.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later or contact support.');
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        setError('Network connection failed. Please check your internet connection.');
      } else {
        setError(error.message || 'Failed to load users. Please refresh the page and try again.');
      }
      
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchAccountManageRegister(userData);
      
      if (response && response.response === true) {
        // Refresh the user list after successful save
        await fetchAllUsers();
        alert('User saved successfully!');
        return true;
      } else {
        throw new Error(response?.message || 'Failed to save user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      
      let errorMessage = 'Failed to save user.';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Save operation timed out. Please check your connection and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid user data. Please check your input and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error during save. Please try again later or contact support.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed during save. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchAccountManageUpdate(userData);
      
      if (response && response.response === true) {
        // Refresh the user list after successful update
        await fetchAllUsers();
        alert('User updated successfully!');
        return true;
      } else {
        throw new Error(response?.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      
      let errorMessage = 'Failed to update user.';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Update operation timed out. Please check your connection and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid user data. Please check your input and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error during update. Please try again later or contact support.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed during update. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchAccountManageDelete(userData);
      
      if (response && response.response === true) {
        // Refresh the user list after successful delete
        await fetchAllUsers();
        alert('User(s) deleted successfully!');
        return true;
      } else {
        throw new Error(response?.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      
      let errorMessage = 'Failed to delete user.';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Delete operation timed out. Please check your connection and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid delete request. Please check your selection and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error during delete. Please try again later or contact support.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed during delete. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Send all current users data for deletion (excluding current user)
      const allUsersData = accounts
      .filter(user => !user.isAdmin)
      .map(user => ({
        id: user.id,
        username: user.username,
        password: user.password,
        permission: user.permission,
      }));
    
      
      const response = await fetchAccountManageDelete({ users: allUsersData });
      
      if (response && response.response === true) {
        setAccounts([]);
        setSelected([]);
        alert('All users cleared successfully!');
        return true;
      } else {
        throw new Error(response?.message || 'Failed to clear all users');
      }
    } catch (error) {
      console.error('Error clearing all users:', error);
      
      let errorMessage = 'Failed to clear all users.';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Clear operation timed out. Please check your connection and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid clear request. Please try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error during clear operation. Please try again later or contact support.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed during clear operation. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create combined accounts list with current user at the top
  const combinedAccounts = accounts;


  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(combinedAccounts.length / ITEMS_PER_PAGE));
  const pagedAccounts = combinedAccounts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Table row selection logic
  const handleSelectRow = idx => {
    setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  };
  const handleCheckAllRows = () => {
    // Only select non-current users
    const selectableIndices = combinedAccounts
      .map((_, idx) => idx)
      .filter(idx => !combinedAccounts[idx].isCurrentUser);
    setSelected(selectableIndices);
  };
  const handleUncheckAllRows = () => setSelected([]);
  const handleInverse = () => {
    const selectableIndices = combinedAccounts
      .map((_, idx) => idx)
      .filter(idx => !combinedAccounts[idx].isCurrentUser);
    setSelected(selectableIndices.filter(i => !selected.includes(i)));
  };
  
  const handleDelete = async () => {
    if (selected.length === 0) {
      setError('Please select users to delete.');
      return;
    }

    // Filter out current user from deletion
    const selectedUsers = selected
  .map(idx => combinedAccounts[idx])
  .filter(user => !user.isAdmin)
  .map(user => ({
    id: user.id,
    username: user.username,
    password: user.password,
    permission: user.permission,
  }));

if (selectedUsers.length === 0) {
  alert('Admin user cannot be deleted.');
  return;
}


    // Show browser confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected user(s)?`);
    if (!confirmed) {
      return;
    }

    const success = await deleteUser({ users: selectedUsers });
    
    if (success) {
      setSelected([]);
    }
  };

  const handleClearAll = async () => {
    if (accounts.length === 0) {
      setError('No users to clear.');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete all users? This action cannot be undone. (Current user will not be deleted)');
    if (confirmed) {
      await deleteAllUsers();
    }
  };

  // Modal logic
  const handleOpenModal = (item = null, idx = null) => {
    if (item) {
      // Don't allow editing current user
      if (item.isCurrentUser) {
        setError('Cannot edit current user.');
        return;
      }
      
      setFormData({
        index: item.id,
        userName: item.username,
        password: item.password,
        authority: Array.isArray(item.permission) ? item.permission : [item.permission],
      });
      setEditIdx(idx);
    } else {
      // For new user, show next index number but don't set actual ID
      const nextIndex = combinedAccounts.length + 1;
      setFormData({ ...ACCOUNT_MANAGE_INITIAL_FORM, index: nextIndex });
      setEditIdx(null);
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthorityChange = (value) => {
    setFormData(prev => {
      const currentAuthority = prev.authority || [];
      const newAuthority = currentAuthority.includes(value)
        ? currentAuthority.filter(item => item !== value)
        : [...currentAuthority, value];
      
      return { ...prev, authority: newAuthority };
    });
  };
  
  const handleSave = async () => {
    // Validate form data
    if (!formData.userName.trim() || !formData.password.trim()) {
      setError('User name and password are required.');
      return;
    }

    const userData = {
      id: editIdx !== null ? combinedAccounts[editIdx].id : null, // Use actual ID for updates, null for new users
      username: formData.userName.trim(),
      password: formData.password,
      permission: Array.isArray(formData.authority) ? formData.authority.join(', ') : formData.authority,
    };

    let success = false;
    if (editIdx !== null) {
      // Update existing user
      success = await updateUser(userData);
    } else {
      // Create new user
      success = await saveUser(userData);
    }

    if (success) {
      setIsModalOpen(false);
      setError(null);
    }
  };

  // When accounts change, reset page if needed
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [accounts, totalPages]);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] py-0 flex flex-col items-center">
      <div style={{width:'100%', maxWidth:1200}}>
        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#dc2626',
            padding: '16px',
            marginBottom: '16px',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg style={{ width: '24px', height: '24px', marginRight: '12px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span style={{ fontWeight: '500' }}>{error}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#b91c1c'}
                onMouseOut={(e) => e.target.style.background = '#dc2626'}
              >
                Retry
              </button>
              <button 
                onClick={() => setError(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#fecaca'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div style={{
            background: '#eff6ff',
            color: '#1d4ed8',
            padding: '16px',
            marginBottom: '16px',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            <svg style={{ 
              animation: 'spin 1s linear infinite',
              width: '20px', 
              height: '20px', 
              marginRight: '12px', 
              color: '#1d4ed8' 
            }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: '0.25' }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path style={{ opacity: '0.75' }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span style={{ fontWeight: '500' }}>Loading account data...</span>
          </div>
        )}

        {/* Table */}
        <div style={{ ...tableContainerStyle, borderBottomLeftRadius:0, borderBottomRightRadius:0, borderBottom:'none', background: '#fff', border: '1px solid #ccc', borderRadius: 8, overflowX: 'auto' }}>
          <div style={{ ...blueBarStyle, borderBottom: '2px solid #888' }}>Info</div>
          <div style={{overflowX: 'auto', width: '100%'}}>
            <table style={{width:'100%', minWidth:600, borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  {ACCOUNT_MANAGE_TABLE_COLUMNS.map(col => (
                    <th key={col.key} style={thStyle}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedAccounts.length === 0 ? (
                  <tr><td colSpan={ACCOUNT_MANAGE_TABLE_COLUMNS.length} style={tdStyle}>
                    {loading ? 'Loading...' : 'No data'}
                  </td></tr>
                ) : pagedAccounts.map((item, idx) => {
                  const realIdx = (page - 1) * ITEMS_PER_PAGE + idx;
                  return (
                    <tr key={realIdx}>
                      {/* Choose */}
                      <td style={tdStyle}>
                      {!item.isAdmin && (
                       <input
                        type="checkbox"
                        checked={selected.includes(realIdx)}
                        onChange={() => handleSelectRow(realIdx)}
                       />
                      )}

                      </td>
                      {/* Id */}
                      <td style={tdStyle}>{realIdx + 1}</td>
                      {/* Username */}
                      <td style={tdStyle}>{item.username}</td>
                      {/* Permission */}
                      <td style={tdStyle}>{item.permission}</td>
                      {/* Modify */}
                      <td style={tdStyle}>
                      <button
  onClick={() => {
    if (item.isAdmin) {
      alert('Admin user cannot be modified.');
      return;
    }
    handleOpenModal(item, realIdx);
  }}
  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
>

                          <EditDocumentIcon style={{ fontSize: 20 }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* Table Buttons */}
        <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: '#e3e7ef', borderRadius: 8, border: '1px solid #ccc', borderTop: 'none', marginTop: 0, padding: '8px 8px 8px 8px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button sx={tableButtonSx} onClick={handleCheckAllRows} disabled={loading}>{ACCOUNT_MANAGE_BUTTONS.checkAll}</Button>
            <Button sx={tableButtonSx} onClick={handleUncheckAllRows} disabled={loading}>{ACCOUNT_MANAGE_BUTTONS.uncheckAll}</Button>
            <Button sx={tableButtonSx} onClick={handleInverse} disabled={loading}>{ACCOUNT_MANAGE_BUTTONS.inverse}</Button>
            <Button sx={tableButtonSx} onClick={handleDelete} disabled={loading || selected.length === 0}>{ACCOUNT_MANAGE_BUTTONS.delete}</Button>
           
          </div>
          <Button sx={addNewButtonSx} onClick={() => handleOpenModal()} disabled={loading}>{ACCOUNT_MANAGE_BUTTONS.addNew}</Button>
        </div>
        {/* Pagination (working, legacy style, left-aligned) */}
        <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto', background: '#e3e7ef', borderRadius: 8, border: '1px solid #ccc', borderTop: 'none', marginTop: 4, padding: '2px 8px 2px 8px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, minHeight: 32, fontSize: 17, justifyContent: 'flex-start', overflowX: 'auto' }}>
          <span>{combinedAccounts.length} Items Total</span>
          <span style={{marginLeft:'8px'}}>20 Items/Page</span>
          <span style={{marginLeft:'8px'}}>{page}/{totalPages}</span>
          {/* Pagination text controls */}
          <span
            style={{
              color: page === 1 ? '#aaa' : '#2266aa',
              cursor: page === 1 ? 'default' : 'pointer',
              margin: '0 4px',
              userSelect: 'none',
              fontWeight: 500,
            }}
            onClick={() => page !== 1 && setPage(1)}
          >First</span>
          <span
            style={{
              color: page === 1 ? '#aaa' : '#2266aa',
              cursor: page === 1 ? 'default' : 'pointer',
              margin: '0 4px',
              userSelect: 'none',
              fontWeight: 500,
            }}
            onClick={() => page !== 1 && setPage(page - 1)}
          >Previous</span>
          <span
            style={{
              color: page === totalPages ? '#aaa' : '#2266aa',
              cursor: page === totalPages ? 'default' : 'pointer',
              margin: '0 4px',
              userSelect: 'none',
              fontWeight: 500,
            }}
            onClick={() => page !== totalPages && setPage(page + 1)}
          >Next</span>
          <span
            style={{
              color: page === totalPages ? '#aaa' : '#2266aa',
              cursor: page === totalPages ? 'default' : 'pointer',
              margin: '0 4px',
              userSelect: 'none',
              fontWeight: 500,
            }}
            onClick={() => page !== totalPages && setPage(totalPages)}
          >Last</span>
          <span style={{marginLeft:'8px'}}>Go to Page</span>
          <select style={{ fontSize: 15, padding: '2px 6px', borderRadius: 3, border: '1px solid #bbb', background: '#fff' }} value={page} onChange={e => setPage(Number(e.target.value))}>
            {Array.from({ length: totalPages }, (_, i) => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>
          <span style={{marginLeft:'8px'}}>{totalPages} Pages Total</span>
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>User Information</div>
            <div style={modalBodyStyle}>
              {error && (
                <div style={{
                  background: '#ffebee',
                  color: '#c62828',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ffcdd2',
                  fontSize: '12px',
                  marginBottom: '8px'
                }}>
                  {error}
                </div>
              )}
              {ACCOUNT_MANAGE_MODAL_FIELDS.map(field => (
                <div key={field.name} style={modalRowStyle}>
                  <label style={modalLabelStyle}>{field.label}:</label>
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      style={modalInputStyle}
                    >
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'multiSelect' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {field.options.map(opt => (
                        <FormControlLabel
                          key={opt.value}
                          control={
                            <Checkbox
                              checked={formData[field.name]?.includes(opt.value) || false}
                              onChange={() => handleAuthorityChange(opt.value)}
                              size="small"
                              sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }}
                            />
                          }
                          label={opt.label}
                          style={{ margin: 0, fontSize: '14px' }}
                        />
                      ))}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      style={modalInputStyle}
                      disabled={field.disabled}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={modalFooterStyle}>
              <button style={modalButtonStyle} onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : ACCOUNT_MANAGE_BUTTONS.save}
              </button>
              <button style={modalButtonGrayStyle} onClick={handleCloseModal} disabled={loading}>
                {ACCOUNT_MANAGE_BUTTONS.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add this style for plain gray buttons
const plainBtnStyle = {
  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
  color: '#222',
  fontSize: 15,
  padding: '4px 18px',
  border: '1px solid #bbb',
  borderRadius: 6,
  boxShadow: '0 1px 2px rgba(0,0,0,0.10)',
  fontWeight: 500,
  textTransform: 'none',
  minWidth: 60,
  cursor: 'pointer',
  opacity: 1,
  marginLeft: 2,
  marginRight: 2,
  transition: 'background 0.2s',
  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
};

export default AccountManage; 