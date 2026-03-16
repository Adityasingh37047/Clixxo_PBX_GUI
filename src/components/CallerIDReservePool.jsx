import React, { useState } from 'react';
import { CALLERID_RESERVE_POOL_FIELDS, CALLERID_RESERVE_POOL_TABLE_COLUMNS, CALLERID_RESERVE_POOL_INITIAL_FORM } from '../constants/CallerIDReservePoolConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

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

const CallerIDReservePool = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(CALLERID_RESERVE_POOL_INITIAL_FORM);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [errors, setErrors] = useState({});

  const handleOpenModal = (item = null, index = -1) => {
    setFormData(item ? { ...item, originalIndex: index } : CALLERID_RESERVE_POOL_INITIAL_FORM);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = () => {
    const newErrors = {};
    CALLERID_RESERVE_POOL_FIELDS.forEach(field => {
      if (!formData[field.name] || formData[field.name].toString().trim() === '') {
        newErrors[field.name] = `${field.label} is required.`;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    const { originalIndex, ...dataToSave } = formData;
    setRows(prev => {
      if (originalIndex !== undefined && originalIndex > -1) {
        const updated = [...prev];
        updated[originalIndex] = dataToSave;
        return updated;
      }
      return [...prev, dataToSave];
    });
    setIsModalOpen(false);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectRow = idx => {
    setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  };
  const handleCheckAll = () => setSelected(rows.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () => setSelected(rows.map((_, idx) => !selected.includes(idx) ? idx : null).filter(i => i !== null));
  const handleDelete = () => {
    setRows(rows.filter((_, idx) => !selected.includes(idx)));
    setSelected([]);
  };
  const handleClearAll = () => {
    setRows([]);
    setSelected([]);
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{backgroundColor: "#dde0e4"}}>
      {rows.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center" style={{ minHeight: '15vh' }}>
          <div className="text-gray-600 text-xl md:text-[16px] font-semibold mb-4 text-center">No available CallerID Reserve!</div>
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
          <div className="text-red-600 text-sm md:text-[14px] font-semibold mt-4 text-center">Note: Don't change the number when using the number kept in pool!</div>
        </div>
      ) : (
        <div className="w-full max-w-full mx-auto">
          {/* Blue header bar - always show */}
          <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[16px] text-[#444] shadow-sm mt-0"
            style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
                CallerID Reserve Pool
              </div>
          
          <div style={{ border: '2px solid #bbb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="bg-white w-full flex flex-col overflow-hidden" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <div className="overflow-x-auto w-full border-b border-gray-300" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
            <table className="w-full min-w-[500px] border border-gray-300 border-collapse whitespace-nowrap" style={{ tableLayout: 'auto', border: '1px solid #bbb' }}>
              <thead>
                <tr>{CALLERID_RESERVE_POOL_TABLE_COLUMNS.map(col => <th key={col.key} className="bg-white text-[#222] font-semibold text-[12px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{col.label}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} style={{ minHeight: 32 }}>
                    <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}><input type="checkbox" checked={selected.includes(idx)} onChange={() => handleSelectRow(idx)} /></td>
                    <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{row.no}</td>
                    <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{row.callerId}</td>
                    <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}><EditDocumentIcon style={{ cursor: 'pointer', color: '#0e8fd6', display: 'block', margin: '0 auto' }} onClick={() => handleOpenModal(row, idx)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full px-2 py-2" style={{ background: '#e3e7ef', marginTop: 12 }}>
            <div className="flex flex-wrap gap-2">
              <button 
                className="bg-gray-300 text-gray-600 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" 
                onClick={handleCheckAll}
              >
                Check All
              </button>
              <button 
                className="bg-gray-300 text-gray-600 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" 
                onClick={handleUncheckAll}
              >
                Uncheck All
              </button>
              <button 
                className="bg-gray-300 text-gray-600 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" 
                onClick={handleInverse}
              >
                Inverse
              </button>
              <button 
                className="bg-gray-300 text-gray-600 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" 
                onClick={handleDelete}
              >
                Delete
              </button>
              <button 
                className="bg-gray-300 text-gray-600 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" 
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
            <button 
              className="bg-gray-300 text-gray-600 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" 
              onClick={() => handleOpenModal()}
            >
              Add New
            </button>
          </div>
          </div>
          <div className="text-red-600 text-sm md:text-[14px] font-semibold mt-4 text-center">Note: Don't change the number when using the number kept in pool!</div>
        </div>
      )}
      <Dialog 
        open={isModalOpen} 
        onClose={handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: { width: 350, maxWidth: '95vw', mx: 'auto', p: 0 }
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
          {formData.originalIndex !== undefined ? 'Edit CallerID Reserve Pool' : 'Add CallerID Reserve Pool'}
        </DialogTitle>
        <DialogContent 
          className="pt-2 pb-0 px-2" 
          style={{
            padding: '8px 12px 0 12px',
            backgroundColor: '#dde0e4',
            border: '1px solid #444444',
            borderTop: 'none'
          }}
        >
          <div className="flex flex-col gap-1 w-full">
            {CALLERID_RESERVE_POOL_FIELDS.map((field) => (
              <div
                key={field.name}
                className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 gap-2"
                style={{ minHeight: 28 }}
              >
                <label className="text-[12px] text-gray-600 font-medium whitespace-nowrap text-left" style={{width:80, marginRight:8}}>
                  {field.label}:
                </label>
                <div className="flex-1">
                  <TextField
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    size="small"
                    fullWidth
                    variant="outlined"
                    inputProps={{ style: { fontSize: 12, padding: '2px 4px', height: '20px' }, min: field.min }}
                    error={!!errors[field.name]}
                    helperText={errors[field.name] || ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '28px',
                        '& fieldset': {
                          border: '1px solid #ccc',
                        },
                        '&:hover fieldset': {
                          border: '1px solid #999',
                        },
                        '&.Mui-focused fieldset': {
                          border: '1px solid #0e8fd6',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions className="p-3 justify-center gap-4">
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '16px',
              minWidth: 80,
              minHeight: 32,
              px: 4,
              py: 1,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                color: '#fff',
              },
            }}
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
              color: '#374151',
              fontWeight: 800,
              fontSize: '16px',
              minWidth: 80,
              minHeight: 32,
              px: 4,
              py: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #d1d5db 0%, #e5e7eb 100%)',
                color: '#374151',
              },
            }}
            onClick={handleCloseModal}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CallerIDReservePool; 