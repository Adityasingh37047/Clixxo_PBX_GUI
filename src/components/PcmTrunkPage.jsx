import React, { useState, useRef, useEffect } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import {
  PCM_TRUNK_INDEX_OPTIONS,
  PCM_TRUNK_PCM_NO_OPTIONS,
  PCM_TRUNK_TS_COUNT,
  PCM_TRUNK_INITIAL_FORM,
  PCM_TRUNK_ITEMS_PER_PAGE
} from '../constants/PcmTrunkConstants';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';

const LOCAL_STORAGE_KEY = 'pcm_trunks';
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const modalStyle = {
  background: '#f8fafd', border: '2px solid #222', borderRadius: 6, width: 400, maxWidth: '95vw', marginTop: 80, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column',
};
const modalHeaderStyle = {
  background: 'linear-gradient(to bottom, #23272b 0%, #6e7a8a 100%)', color: '#fff', fontWeight: 600, fontSize: 18, padding: '10px 0', textAlign: 'center', borderTopLeftRadius: 4, borderTopRightRadius: 4,
};
const modalBodyStyle = {
  padding: '12px 16px 0 16px', display: 'flex', flexDirection: 'column', gap: 8,
};
const modalRowStyle = {
  display: 'flex', alignItems: 'center', marginBottom: 8, gap: 10,
};
const modalLabelStyle = {
  width: 110, fontSize: 14, color: '#222', textAlign: 'left', marginRight: 10, whiteSpace: 'nowrap',
};
const modalInputStyle = {
  width: 120, fontSize: 14, padding: '3px 6px', borderRadius: 3, border: '1px solid #bbb', background: '#fff',
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
  ...modalButtonStyle, width: 120, marginRight: 12, fontSize: 16, padding: '7px 32px',
};
const batchAddButtonStyle = {
  ...modalButtonGrayStyle, width: 120, fontSize: 16, padding: '7px 32px',
};
const tableContainerStyle = {
  width: '100%', maxWidth: 1200, margin: '0 auto', background: '#fff', border: '2px solid #d3d3d3', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};
const blueBarStyle = {
  width: '100%', height: 36, background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', borderTopLeftRadius: 8, borderTopRightRadius: 8, marginBottom: 0, display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 18, color: '#2266aa', justifyContent: 'center', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
};
const thStyle = {
  background: '#fff',
  color: '#222',
  fontWeight: 600,
  fontSize: 15,
  border: '1px solid #d3d3d3',
  padding: '4px 24px',
  whiteSpace: 'nowrap',
  height: 32,
};
const tdStyle = {
  border: '1px solid #d3d3d3',
  padding: '4px 24px',
  fontSize: 14,
  background: '#fff',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  height: 32,
};
const tableButtonStyle = {
  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)', color: '#222', fontSize: 15, padding: '4px 18px', border: '1px solid #bbb', borderRadius: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.10)', cursor: 'pointer', fontWeight: 500,
};
const addNewTableButtonStyle = {
  ...tableButtonStyle, background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)', color: '#fff', marginLeft: 12, minWidth: 120
};
const paginationButtonStyle = {
  ...tableButtonStyle, fontSize: 13, padding: '2px 10px', minWidth: 0, borderRadius: 4,
};
const pageSelectStyle = {
  fontSize: 13, padding: '2px 6px', borderRadius: 3, border: '1px solid #bbb', background: '#fff',
};

const PcmTrunkPage = () => {
  const [trunks, setTrunks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(PCM_TRUNK_INITIAL_FORM);
  const [checkAll, setCheckAll] = useState(true);
  const [selected, setSelected] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(trunks.length / PCM_TRUNK_ITEMS_PER_PAGE));
  const pagedTrunks = trunks.slice((page - 1) * PCM_TRUNK_ITEMS_PER_PAGE, page * PCM_TRUNK_ITEMS_PER_PAGE);

  const handleOpenModal = (item = null, idx = -1) => {
    setForm(item ? { ...item } : PCM_TRUNK_INITIAL_FORM);
    setEditIndex(idx);
    setCheckAll(item ? item.ts.every(Boolean) : true);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleTSChange = idx => {
    const newTs = [...form.ts];
    newTs[idx] = !newTs[idx];
    setForm(prev => ({ ...prev, ts: newTs }));
    setCheckAll(newTs.every(Boolean));
  };

  const handleCheckAllTs = () => {
    const newVal = !checkAll;
    setCheckAll(newVal);
    setForm(prev => ({ ...prev, ts: Array(PCM_TRUNK_TS_COUNT).fill(newVal) }));
  };

  const handleSave = () => {
    setTrunks(prev => {
      let updated;
      if (editIndex > -1) {
        updated = [...prev];
        updated[(page - 1) * PCM_TRUNK_ITEMS_PER_PAGE + editIndex] = form;
      } else {
        updated = [...prev, form];
      }
      return updated;
    });
    setIsModalOpen(false);
    setEditIndex(-1);
  };

  // Table actions
  const handleSelectRow = idx => {
    const realIdx = (page - 1) * PCM_TRUNK_ITEMS_PER_PAGE + idx;
    setSelected(sel => sel.includes(realIdx) ? sel.filter(i => i !== realIdx) : [...sel, realIdx]);
  };
  const handleCheckAllRows = () => setSelected(trunks.map((_, idx) => idx));
  const handleUncheckAllRows = () => setSelected([]);
  const handleInverse = () => setSelected(trunks.map((_, idx) => !selected.includes(idx) ? idx : null).filter(i => i !== null));
  const handleDelete = () => {
    const newTrunks = trunks.filter((_, idx) => !selected.includes(idx));
    setTrunks(newTrunks);
    setSelected([]);
  };
  const handleClearAll = () => {
    setTrunks([]);
    setSelected([]);
    setPage(1);
  };
  const handlePageChange = (newPage) => setPage(Math.max(1, Math.min(totalPages, newPage)));

  // UI
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] flex flex-col items-center box-border" style={{ backgroundColor: '#dde0e4' }}>
      {trunks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center w-full h-full min-h-[calc(100vh-128px)]">
          <div className="text-gray-800 text-2xl mb-6">No available PCM trunk!</div>
          <div className="flex flex-row gap-4">
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '18px',
                borderRadius: 2,
                minWidth: 140,
                minHeight: 48,
                px: 2,
                py: 0.5,
                boxShadow: '0 2px 8px #b3e0ff',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                  color: '#fff',
                },
              }}
              onClick={() => handleOpenModal()}
            >
              Add New
            </Button>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '18px',
                borderRadius: 2,
                minWidth: 140,
                minHeight: 48,
                px: 2,
                py: 0.5,
                boxShadow: '0 2px 8px #b3e0ff',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                  color: '#fff',
                },
              }}
              // TODO: Implement batch add logic if needed
            >
              Batch Add
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-full mx-auto">
          <div className="rounded-t-lg border-b-2 border-[#888] h-9 flex items-center justify-center font-semibold text-[18px] text-[#222] shadow-sm mt-8"
            style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
            PCM Trunks
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[1200px] bg-[#f8fafd] border-2 border-gray-400 rounded-b-lg shadow-sm">
              <thead>
                <tr>
                  <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 whitespace-nowrap">Check</th>
                  <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 whitespace-nowrap">Index</th>
                  <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 whitespace-nowrap">PCM NO.</th>
                  <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 whitespace-nowrap">Including Ts</th>
                  <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 whitespace-nowrap">Modify</th>
                </tr>
              </thead>
              <tbody>
                {pagedTrunks.map((trunk, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 px-2 py-1 text-center"><Checkbox checked={selected.includes((page - 1) * PCM_TRUNK_ITEMS_PER_PAGE + idx)} onChange={() => handleSelectRow(idx)} sx={{ '& .MuiSvgIcon-root': { fontSize: 22 } }} /></td>
                    <td className="border border-gray-300 px-2 py-1 text-center">{trunk.index}</td>
                    <td className="border border-gray-300 px-2 py-1 text-center">{trunk.pcmNo}</td>
                    <td className="border border-gray-300 px-2 py-1 text-center">{trunk.ts.map((checked, i) => checked ? i : null).filter(i => i !== null).join(',')}</td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <Button
                          onClick={() => handleOpenModal(trunk, idx)}
                        sx={{ minWidth: 0, p: 0, borderRadius: 1 }}
                        >
                          <EditDocumentIcon style={{ fontSize: 22, color: '#0e8fd6', transition: 'color 0.2s, transform 0.2s' }} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Table controls */}
          <div className="flex flex-wrap justify-between items-center bg-[#e3e7ef] rounded-b-lg border border-t-0 border-gray-300 px-2 py-2 gap-2">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={handleCheckAllRows}>Check All</button>
              <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={handleUncheckAllRows}>Uncheck All</button>
              <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={handleInverse}>Inverse</button>
              <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={handleDelete}>Delete</button>
              <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={handleClearAll}>Clear All</button>
            </div>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400" onClick={() => handleOpenModal()}>Add New</button>
          </div>
          {/* Pagination */}
          <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
            <span>{trunks.length} items Total</span>
            <span>{PCM_TRUNK_ITEMS_PER_PAGE} Items/Page</span>
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
      )}
      {/* Modal Dialog */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth PaperProps={{ sx: { width: 600, maxWidth: '95vw', p: 0 } }}>
        <DialogTitle className="text-white text-center font-semibold text-lg" style={{ background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)', borderBottom: '1px solid #444444' }}>PCM Trunk</DialogTitle>
        <DialogContent className="flex flex-col gap-2 py-4" style={{ backgroundColor: '#dde0e4', border: '1px solid #444444', borderTop: 'none' }}>
              {/* Index Block */}
          <div className="flex flex-col sm:flex-row items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white mb-2">
            <label className="text-[15px] text-gray-700 font-medium whitespace-nowrap text-left min-w-[80px] mr-2">Index:</label>
            <Select
              value={form.index}
              onChange={e => handleFormChange('index', Number(e.target.value))}
              size="small"
              fullWidth
              variant="outlined"
              className="bg-white"
              sx={{ maxWidth: 120, minWidth: 0 }}
            >
              {PCM_TRUNK_INDEX_OPTIONS.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
            </Select>
              </div>
              {/* PCM NO. Block */}
          <div className="flex flex-col sm:flex-row items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white mb-2">
            <label className="text-[15px] text-gray-700 font-medium whitespace-nowrap text-left min-w-[80px] mr-2">PCM NO.:</label>
            <Select
              value={form.pcmNo}
              onChange={e => handleFormChange('pcmNo', Number(e.target.value))}
              size="small"
              fullWidth
              variant="outlined"
              className="bg-white"
              sx={{ maxWidth: 120, minWidth: 0 }}
            >
              {PCM_TRUNK_PCM_NO_OPTIONS.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
            </Select>
              </div>
              {/* Including Ts Block */}
          <div className="flex flex-col sm:flex-row items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white mb-2">
            <label className="text-[15px] text-gray-700 font-medium whitespace-nowrap text-left min-w-[80px] mr-2">Including Ts:</label>
            <Checkbox checked={checkAll} onChange={handleCheckAllTs} sx={{ mr: 1 }} />
            <span className="font-medium">Check All</span>
              </div>
              {/* TS Checkboxes Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-gray-200 rounded bg-white p-2 mb-2 w-full">
                {form.ts.map((checked, idx) => (
              <label key={idx} className="flex items-center text-[14px] font-medium mb-0 py-1 min-h-[28px] border-b border-r border-gray-100 last:border-b-0 last:border-r-0 pl-1">
                <Checkbox checked={checked} onChange={() => handleTSChange(idx)} sx={{ p: 0.5, mr: 1 }} />
                    TS[{idx}]
                  </label>
                ))}
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
              borderRadius: 1,
              minWidth: 100,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textTransform: 'none',
              '&:hover': { background: 'linear-gradient(to bottom, #d1d5db 0%, #e5e7eb 100%)', color: '#374151' },
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

export default PcmTrunkPage;

<style>{`
  .edit-icon-btn:hover svg {
    color: #1976d2 !important;
    transform: scale(1.18);
  }
`}</style> 