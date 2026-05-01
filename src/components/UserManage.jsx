import React, { useState } from 'react';
import {
  Select as MuiSelect,
  MenuItem,
  TextField,
  Checkbox,
  Button,
  Alert,
} from '@mui/material';
import {
  AUTHORITY_OPTIONS,
  PAGE_PERMISSION_GROUPS,
  INITIAL_PERMISSIONS,
  INITIAL_USER_FORM,
} from '../constants/UserManageConstants';

const blueButtonSx = {
  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
  color: '#fff',
  fontWeight: 500,
  fontSize: 13,
  minWidth: 90,
  boxShadow: '0 2px 6px #0002',
  textTransform: 'none',
  padding: '5px 20px',
  border: '1px solid #0e8fd6',
  '&:hover': {
    background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
  },
};

const inputSx = {
  backgroundColor: '#fff',
  '& .MuiInputBase-root': { height: 30, fontSize: '0.82rem' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#bbb' },
};

const selectSx = {
  height: 30,
  fontSize: '0.82rem',
  backgroundColor: '#fff',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#bbb' },
};

const cbSx = { p: 0, '& .MuiSvgIcon-root': { fontSize: 16 } };

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

export default function UserManage() {
  const [form, setForm] = useState(INITIAL_USER_FORM);
  const [permissions, setPermissions] = useState({ ...INITIAL_PERMISSIONS });
  const [saveStatus, setSaveStatus] = useState(null);

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

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

  const handleSave = () => {
    console.log('Save:', { ...form, permissions });
    setSaveStatus('success');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleAdd = () => {
    setForm(INITIAL_USER_FORM);
    setPermissions({ ...INITIAL_PERMISSIONS });
    setSaveStatus(null);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center" style={{ backgroundColor: '#dde0e4' }}>
      <div className="w-full" style={{ maxWidth: 920 }}>

        {/* ── User Info ── */}
        <div className="h-8 bg-linear-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-gray-600 text-sm shadow">
          User Info
        </div>
        <div className="border-2 border-gray-400 border-t-0 bg-white mb-4 py-4 flex flex-col items-center">
          <div style={{ width: 480 }} className="flex flex-col gap-3">
            {[
              { label: 'Username', key: 'username', type: 'text' },
              { label: 'Password', key: 'password', type: 'password' },
            ].map(({ label, key, type }) => (
              <div key={key} className="flex items-center gap-4">
                <span className="text-sm text-[#333] w-32 shrink-0">{label}</span>
                <TextField fullWidth size="small" type={type} value={form[key]} onChange={e => setField(key, e.target.value)} sx={inputSx} />
              </div>
            ))}
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#333] w-32 shrink-0">User Authorities</span>
              <MuiSelect fullWidth size="small" value={form.authority} onChange={e => setField('authority', e.target.value)} sx={selectSx}>
                {AUTHORITY_OPTIONS.map(o => (
                  <MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.82rem' }}>{o.label}</MenuItem>
                ))}
              </MuiSelect>
            </div>
          </div>
        </div>

        {/* ── Page Permissions ── */}
        <div className="h-8 bg-linear-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-gray-600 text-sm shadow">
          Page
        </div>
        <div className="border-2 border-gray-400 border-t-0 bg-white mb-4">
          {PAGE_PERMISSION_GROUPS.map((section, si) => {
            const secPages = sectionPages(section);
            // Fixed left offsets so all checkboxes align in a clear column
            const L1 = 12;   // section checkbox left px
            const L2 = 36;   // subgroup checkbox left px (L1 + 24)
            const L3 = 60;   // pages checkbox left px   (L2 + 24)
            return (
              <div key={section.id} className={si > 0 ? 'border-t-2 border-gray-300' : ''}>

                {/* Level 1 — Section */}
                <div className="flex items-center py-1.5 pr-3" style={{ backgroundColor: '#dce8f4', paddingLeft: L1 }}>
                  <Checkbox size="small" checked={allChecked(secPages, permissions)} indeterminate={someChecked(secPages, permissions)} onChange={() => toggleSection(section)} sx={cbSx} />
                  <span className="ml-2 text-[12.5px] font-bold" style={{ color: '#1a3a5c' }}>{section.label}</span>
                </div>

                {/* Level 2 — SubGroups */}
                {section.subGroups.map(sub => (
                  <div key={sub.id} className="border-t border-gray-200">

                    {/* SubGroup row */}
                    <div className="flex items-center py-1 pr-3" style={{ backgroundColor: '#eef2f6', paddingLeft: L2 }}>
                      <Checkbox size="small" checked={allChecked(sub.pages, permissions)} indeterminate={someChecked(sub.pages, permissions)} onChange={() => toggleSub(sub)} sx={cbSx} />
                      <span className="ml-2 text-[12px] font-semibold" style={{ color: '#334155' }}>{sub.label}</span>
                    </div>

                    {/* Level 3 — Pages: grid so wrapped rows align with the first row */}
                    <div
                      className="pr-4 py-1 border-t border-gray-100"
                      style={{
                        paddingLeft: L3,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                        rowGap: 1,
                      }}
                    >
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

        {saveStatus === 'success' && (
          <Alert severity="success" className="mb-3" sx={{ py: 0.25, fontSize: '0.82rem' }}>
            User saved successfully.
          </Alert>
        )}

        <div className="flex gap-3 justify-center py-1">
          <Button variant="contained" sx={blueButtonSx} onClick={handleSave}>Save</Button>
          <Button variant="contained" sx={blueButtonSx} onClick={handleAdd}>Add</Button>
        </div>

      </div>
    </div>
  );
}
