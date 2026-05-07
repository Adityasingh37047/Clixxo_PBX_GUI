import React, { useState, useEffect, useCallback } from 'react';
import { Checkbox } from '@mui/material';
import {
  PAGE_PERMISSION_GROUPS,
  INITIAL_PERMISSIONS,
} from '../constants/UserManageConstants';
import {
  fetchUserList,
  createUser,
  updateUserAccess,
  deleteUser,
} from '../api/apiService';

// ── helpers ─────────────────────────────────────────────────────────────────
const cbSx = { p: 0, '& .MuiSvgIcon-root': { fontSize: 16 } };

const blueBar = {
  height: 32,
  background: 'linear-gradient(to bottom, #b3e0ff, #6ec1f7, #3b8fd6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 600, fontSize: 14, color: '#374151',
};

const actionBtnStyle = (color = '#3E5475') => ({
  background: `linear-gradient(to bottom, #5A6F8F, ${color})`,
  color: '#fff', border: '1px solid #4a6080',
  borderRadius: 4, padding: '3px 14px',
  fontSize: 12, fontWeight: 600, cursor: 'pointer',
  letterSpacing: '0.03em',
});

const inputStyle = {
  height: 30, padding: '0 10px',
  border: '1px solid #bbb', borderRadius: 4,
  fontSize: 13, outline: 'none', width: '100%',
  boxSizing: 'border-box',
};

function allChecked(pages, perms) {
  return pages.length > 0 && pages.every(p => perms[p.id]);
}
function someChecked(pages, perms) {
  const n = pages.filter(p => perms[p.id]).length;
  return n > 0 && n < pages.length;
}
function sectionPages(section) {
  return section.subGroups.flatMap(sg => sg.pages);
}

// Build permissions map from saved pages array
function buildPermsFromPages(pages = []) {
  const perms = { ...INITIAL_PERMISSIONS };
  pages.forEach(id => { if (id in perms) perms[id] = true; });
  return perms;
}

// Collect checked sections and pages from permissions map
function collectSectionsAndPages(perms) {
  const sections = [];
  const pages = [];
  PAGE_PERMISSION_GROUPS.forEach(section => {
    const secPages = sectionPages(section);
    const checkedPages = secPages.filter(p => perms[p.id]).map(p => p.id);
    if (checkedPages.length > 0) {
      sections.push(section.id);
      pages.push(...checkedPages);
    }
  });
  return { sections, pages };
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const bg = type === 'success' ? '#f0fdf4' : '#fef2f2';
  const border = type === 'success' ? '#86efac' : '#fca5a5';
  const color = type === 'success' ? '#15803d' : '#b91c1c';
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 6, padding: '8px 14px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color, fontSize: 13, fontWeight: 600 }}>{msg}</span>
      <span style={{ color, cursor: 'pointer', fontSize: 17, opacity: 0.7 }} onClick={onClose}>&times;</span>
    </div>
  );
}

// ── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ msg, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: '24px 28px', width: 340, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#374151' }}>{msg}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button style={actionBtnStyle('#b91c1c')} onClick={onConfirm}>Confirm</button>
          <button style={{ ...actionBtnStyle(), background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db' }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Reset Password Dialog ────────────────────────────────────────────────────
function ResetPasswordDialog({ user, onSave, onCancel, loading }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const handle = () => {
    if (pw.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    onSave(pw);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: '24px 28px', width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        <p style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#374151' }}>Reset Password — {user.username}</p>
        <input style={{ ...inputStyle, marginBottom: 6 }} type="password" placeholder="New password (min 8 chars)" value={pw} onChange={e => { setPw(e.target.value); setErr(''); }} />
        {err && <p style={{ color: '#b91c1c', fontSize: 12, margin: '0 0 8px' }}>{err}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
          <button style={actionBtnStyle()} onClick={handle} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          <button style={{ ...actionBtnStyle(), background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db' }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Permission Checkboxes ────────────────────────────────────────────────────
function PermissionTree({ permissions, setPermissions }) {
  const L1 = 12, L2 = 36, L3 = 60;

  const toggleSection = (section) => {
    const pages = sectionPages(section);
    const next = !allChecked(pages, permissions);
    setPermissions(prev => { const u = { ...prev }; pages.forEach(p => { u[p.id] = next; }); return u; });
  };
  const toggleSub = (sub) => {
    const next = !allChecked(sub.pages, permissions);
    setPermissions(prev => { const u = { ...prev }; sub.pages.forEach(p => { u[p.id] = next; }); return u; });
  };
  const togglePage = (id) => setPermissions(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="border-2 border-gray-400 border-t-0 bg-white mb-4">
      {PAGE_PERMISSION_GROUPS.map((section, si) => {
        const secPages = sectionPages(section);
        return (
          <div key={section.id} className={si > 0 ? 'border-t-2 border-gray-300' : ''}>
            <div className="flex items-center py-1.5 pr-3" style={{ backgroundColor: '#dce8f4', paddingLeft: L1 }}>
              <Checkbox size="small" checked={allChecked(secPages, permissions)} indeterminate={someChecked(secPages, permissions)} onChange={() => toggleSection(section)} sx={cbSx} />
              <span className="ml-2 text-[12.5px] font-bold" style={{ color: '#1a3a5c' }}>{section.label}</span>
            </div>
            {section.subGroups.map(sub => (
              <div key={sub.id} className="border-t border-gray-200">
                <div className="flex items-center py-1 pr-3" style={{ backgroundColor: '#eef2f6', paddingLeft: L2 }}>
                  <Checkbox size="small" checked={allChecked(sub.pages, permissions)} indeterminate={someChecked(sub.pages, permissions)} onChange={() => toggleSub(sub)} sx={cbSx} />
                  <span className="ml-2 text-[12px] font-semibold" style={{ color: '#334155' }}>{sub.label}</span>
                </div>
                <div className="pr-4 py-1 border-t border-gray-100" style={{ paddingLeft: L3, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', rowGap: 1 }}>
                  {sub.pages.map(page => (
                    <label key={page.id} className="flex items-center gap-1 cursor-pointer select-none">
                      <Checkbox size="small" checked={!!permissions[page.id]} onChange={() => togglePage(page.id)} sx={cbSx} />
                      <span className="text-[11.5px]" style={{ color: '#475569' }}>{page.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function UserManage() {
  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  // Form state
  const [mode, setMode] = useState(null); // null | 'add' | 'edit'
  const [editUser, setEditUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState({ ...INITIAL_PERMISSIONS });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Dialogs
  const [confirmDelete, setConfirmDelete] = useState(null); // user object

  // Toast
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '', type: 'success' }), 3500); };

  const loadUsers = useCallback(async () => {
    setLoadingList(true);
    setListError('');
    try {
      const data = await fetchUserList();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setListError('Failed to load users.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const openAdd = () => {
    setMode('add'); setEditUser(null);
    setUsername(''); setPassword('');
    setPermissions({ ...INITIAL_PERMISSIONS });
    setFormError('');
  };

  const openEdit = (user) => {
    setMode('edit'); setEditUser(user);
    setUsername(user.username || '');
    setPassword('');
    // pages may be at user.access.pages, user.pages, or user.access_pages
    const pages = user.access?.pages ?? user.pages ?? user.access_pages ?? [];
    setPermissions(buildPermsFromPages(pages));
    setFormError('');
  };

  const closeForm = () => { setMode(null); setEditUser(null); setFormError(''); };

  const handleSave = async () => {
    setFormError('');
    const { sections, pages } = collectSectionsAndPages(permissions);

    if (mode === 'add') {
      if (username.trim().length < 5) { setFormError('Username must be at least 5 characters.'); return; }
      if (password.length < 8) { setFormError('Password must be at least 8 characters.'); return; }
      setSaving(true);
      try {
        const res = await createUser({ username: username.trim(), password, sections, pages });
        // Check if backend returned response:false
        if (res?.response === false) {
          setFormError(res?.message || 'Failed to create user.');
          return;
        }
        showToast('User created successfully.');
        closeForm();
        loadUsers();
      } catch (err) {
        const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to create user.';
        setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        console.error('Create user error:', err?.response?.data || err);
      } finally { setSaving(false); }

    } else if (mode === 'edit') {
      if (!password) { setFormError('Please enter your password to confirm changes.'); return; }
      setSaving(true);
      try {
        const res = await updateUserAccess({ id: editUser.id, password, sections, pages });
        if (res?.response === false) {
          setFormError(res?.message || 'Failed to update user access.');
          return;
        }
        showToast('User access updated successfully.');
        closeForm();
        loadUsers();
      } catch (err) {
        const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to update user access.';
        setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        console.error('Update user error:', err?.response?.data || err);
      } finally { setSaving(false); }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(confirmDelete.id);
      showToast('User deleted successfully.');
      loadUsers();
    } catch {
      showToast('Failed to delete user.', 'error');
    } finally { setConfirmDelete(null); }
  };


  return (
    <div className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center" style={{ backgroundColor: '#dde0e4' }}>
      <div className="w-full" style={{ maxWidth: 960 }}>

        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: 'success' })} />

        {/* ── User List ── */}
        <div style={{ ...blueBar, justifyContent: 'space-between', paddingLeft: 14, paddingRight: 12 }}>
          <span>User List</span>
          <button
            style={actionBtnStyle()}
            onClick={openAdd}
            onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to bottom, #3E5475, #2f405c)'}
            onMouseLeave={e => e.currentTarget.style.background = actionBtnStyle().background}
          >+ Add User</button>
        </div>
        <div className="border-2 border-gray-400 border-t-0 bg-white mb-4 overflow-x-auto">
          {loadingList ? (
            <p style={{ textAlign: 'center', padding: 20, color: '#9ca3af', fontSize: 13 }}>Loading users...</p>
          ) : listError ? (
            <p style={{ textAlign: 'center', padding: 20, color: '#b91c1c', fontSize: 13 }}>{listError}</p>
          ) : users.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 20, color: '#9ca3af', fontSize: 13 }}>No users found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  {['#', 'Username', 'Access Type', 'Role Permission', 'Sections', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  // access may be nested under user.access or directly on user
                  const access = user.access || user || {};
                  const accessType = access.access_type ?? user.access_type ?? user.role ?? '';
                  const isSuperAdmin = accessType === 'superadmin' || user.username === 'admin';
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '7px 12px', color: '#6b7280' }}>{i + 1}</td>
                      <td style={{ padding: '7px 12px', fontWeight: 600, color: '#1e293b' }}>{user.username}</td>
                      <td style={{ padding: '7px 12px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: isSuperAdmin ? '#dbeafe' : '#dcfce7', color: isSuperAdmin ? '#1d4ed8' : '#15803d' }}>
                          {isSuperAdmin ? 'Super Admin' : 'Custom'}
                        </span>
                      </td>
                      <td style={{ padding: '7px 12px', color: '#374151' }}>{access.role_permission ?? user.role_permission ?? '-'}</td>
                      <td style={{ padding: '7px 12px', color: '#374151', maxWidth: 220 }}>
                        {isSuperAdmin ? (
                          <span style={{ color: '#6b7280', fontStyle: 'italic', fontSize: 12 }}>All</span>
                        ) : (
                          <span style={{ fontSize: 12 }}>{(access.sections ?? user.sections ?? []).join(', ') || '-'}</span>
                        )}
                      </td>
                      <td style={{ padding: '7px 12px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {!isSuperAdmin && (
                            <button
                              style={{ ...actionBtnStyle(), padding: '2px 10px', fontSize: 11 }}
                              onClick={() => openEdit(user)}
                              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to bottom, #3E5475, #2f405c)'}
                              onMouseLeave={e => e.currentTarget.style.background = actionBtnStyle().background}
                            >Edit</button>
                          )}
                          {!isSuperAdmin && (
                            <button
                              style={{ ...actionBtnStyle('#b91c1c'), padding: '2px 10px', fontSize: 11, background: 'linear-gradient(to bottom, #ef4444, #b91c1c)' }}
                              onClick={() => setConfirmDelete(user)}
                              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to bottom, #b91c1c, #7f1d1d)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(to bottom, #ef4444, #b91c1c)'}
                            >Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Add / Edit Form ── */}
        {mode && (
          <>
            {/* User Info */}
            <div style={blueBar}>{mode === 'add' ? 'Add User' : `Edit User — ${editUser?.username}`}</div>
            <div className="border-2 border-gray-400 border-t-0 bg-white mb-4 py-4 flex flex-col items-center">
              <div style={{ width: 480 }} className="flex flex-col gap-3">
                {mode === 'add' && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#333] w-32 shrink-0">Username</span>
                    <input
                      style={inputStyle}
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Min 5 characters"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#333] w-32 shrink-0">
                    {mode === 'edit' ? 'Verify Password' : 'Password'}
                  </span>
                  <input
                    style={inputStyle}
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'edit' ? 'Enter password to confirm changes' : 'Min 8 characters'}
                  />
                </div>
              </div>
            </div>

            {/* Page Permissions */}
            <div style={blueBar}>Page Permissions</div>
            <PermissionTree permissions={permissions} setPermissions={setPermissions} />

            {/* Form error */}
            {formError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, padding: '8px 14px', marginBottom: 10 }}>
                <span style={{ color: '#b91c1c', fontSize: 13, fontWeight: 600 }}>{formError}</span>
              </div>
            )}

            {/* Form buttons */}
            <div className="flex gap-3 justify-center py-2">
              <button
                style={{ ...actionBtnStyle(), padding: '6px 28px', fontSize: 13 }}
                onClick={handleSave}
                disabled={saving}
                onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to bottom, #3E5475, #2f405c)'}
                onMouseLeave={e => e.currentTarget.style.background = actionBtnStyle().background}
              >{saving ? 'Saving...' : 'Save'}</button>
              <button
                style={{ ...actionBtnStyle(), padding: '6px 28px', fontSize: 13, background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db' }}
                onClick={closeForm}
                onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
              >Cancel</button>
            </div>
          </>
        )}

      </div>

      {/* Dialogs */}
      {confirmDelete && (
        <ConfirmDialog
          msg={`Are you sure you want to delete user "${confirmDelete.username}"?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
