import React, { useState, useEffect } from 'react';
import {
  VPN_ACCOUNT_TABLE_COLUMNS,
  VPN_ACCOUNT_FIELDS,
  VPN_ACCOUNT_INITIAL_FORM
} from '../constants/VpnAccountConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const localStorageKey = 'vpnAccounts';

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

const VpnAccount = () => {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(VPN_ACCOUNT_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [checked, setChecked] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) setAccounts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    setChecked([]);
  }, [accounts.length]);

  const handleAddNew = () => {
    setForm(VPN_ACCOUNT_INITIAL_FORM);
    setEditIndex(null);
    setShowModal(true);
  };

  const handleEdit = (idx) => {
    setForm(accounts[idx]);
    setEditIndex(idx);
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleModalSave = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.username) newErrors.username = 'Username is required.';
    if (!form.password) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    let newAccounts;
    if (editIndex !== null) {
      newAccounts = accounts.map((acc, idx) => idx === editIndex ? form : acc);
    } else {
      newAccounts = [...accounts, form];
    }
    setAccounts(newAccounts);
    localStorage.setItem(localStorageKey, JSON.stringify(newAccounts));
    setShowModal(false);
    setEditIndex(null);
    setErrors({});
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const isAllChecked = accounts.length > 0 && checked.length === accounts.length;
  const isIndeterminate = checked.length > 0 && checked.length < accounts.length;

  const handleCheck = (idx) => {
    setChecked((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleCheckAll = () => {
    setChecked(accounts.map((_, idx) => idx));
  };

  const handleUncheckAll = () => {
    setChecked([]);
  };

  const handleInverse = () => {
    setChecked(accounts.map((_, idx) => (checked.includes(idx) ? null : idx)).filter((i) => i !== null));
  };

  const handleDelete = () => {
    const newAccounts = accounts.filter((_, idx) => !checked.includes(idx));
    setAccounts(newAccounts);
    localStorage.setItem(localStorageKey, JSON.stringify(newAccounts));
    setChecked([]);
  };

  const handleClearAll = () => {
    setAccounts([]);
    localStorage.removeItem(localStorageKey);
    setChecked([]);
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] py-10 flex flex-col items-center">
      {accounts.length === 0 ? (
        <>
          <div className="text-gray-800 font-semibold text-2xl mt-8 mb-4">No Available Information!</div>
          <Button
            variant="contained"
            sx={blueButtonSx}
            onClick={handleAddNew}
          >
            Add New
          </Button>
        </>
      ) : (
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white border-2 border-gray-400 rounded-t-xl shadow">
            <div className="w-full bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] h-10 flex items-center justify-center font-semibold text-lg text-black shadow mb-0 border-b-2 border-[#b3e0ff] rounded-t-xl">
              VPN Account
            </div>
            <div className="w-full overflow-x-auto">
              <table className="min-w-full border-collapse table-auto">
                <thead>
                  <tr>
                    <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-2 py-1 whitespace-nowrap text-center">Check</th>
                    {VPN_ACCOUNT_TABLE_COLUMNS.map((col) => (
                      <th key={col.key} className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-2 py-1 whitespace-nowrap text-center">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((row, idx) => (
                    <tr key={idx}>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          className="w-5 h-5"
                          checked={checked.includes(idx)}
                          onChange={() => handleCheck(idx)}
                        />
                      </td>
                      {VPN_ACCOUNT_TABLE_COLUMNS.map((col) => (
                        col.key === 'modify' ? (
                          <td key={col.key} className="border border-gray-300 px-2 py-1 text-center"><EditDocumentIcon style={{ cursor: 'pointer', color: '#0e8fd6', display: 'block', margin: '0 auto' }} onClick={() => handleEdit(idx)} /></td>
                        ) : (
                          <td key={col.key} className="border border-gray-300 px-2 py-1 text-center">{row[col.key]}</td>
                        )
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-[#e3e7ef] rounded-b-xl flex flex-col sm:flex-row justify-between items-center gap-2 mt-0 px-2 py-4" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
              <Button variant="contained" sx={grayButtonSx} onClick={handleCheckAll}>Check All</Button>
              <Button variant="contained" sx={grayButtonSx} onClick={handleUncheckAll}>Uncheck All</Button>
              <Button variant="contained" sx={grayButtonSx} onClick={handleInverse}>Inverse</Button>
              <Button variant="contained" sx={grayButtonSx} onClick={handleDelete}>Delete</Button>
              <Button variant="contained" sx={grayButtonSx} onClick={handleClearAll}>Clear All</Button>
            </div>
            <Button
              variant="contained"
              sx={blueButtonSx}
              onClick={handleAddNew}
            >
              Add New
            </Button>
          </div>
        </div>
      )}
      <Dialog open={showModal} onClose={handleModalClose} maxWidth="xs" fullWidth>
        <DialogTitle className="bg-gradient-to-b from-gray-800 to-gray-600 text-white text-center font-semibold p-3 text-base">VPN Account</DialogTitle>
        <DialogContent className="bg-[#e6eaf0] flex flex-col gap-2 py-4">
          {VPN_ACCOUNT_FIELDS.map((field, i) => (
            <div key={field.name} className={`flex flex-col sm:flex-row items-center gap-2 mb-2 w-full max-w-xs mx-auto${i === 0 ? ' mt-4' : ''}`}>
              <div className="font-medium text-base text-gray-800 w-full sm:w-1/2 text-right sm:pr-4">{field.label}</div>
              <div className="w-full">
                <TextField
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  min={field.min}
                  onChange={handleModalChange}
                  size="small"
                  fullWidth
                  variant="outlined"
                  required
                  error={!!errors[field.name]}
                  helperText={errors[field.name] || ''}
                />
              </div>
            </div>
          ))}
        </DialogContent>
        <DialogActions className="flex justify-center gap-6 pb-4">
          <Button variant="contained" sx={blueButtonSx} onClick={handleModalSave}>Save</Button>
          <Button variant="contained" sx={blueButtonSx} onClick={handleModalClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VpnAccount; 