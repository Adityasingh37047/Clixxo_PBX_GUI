import React, { useState } from 'react';
import {
  TABLE_HEADERS,
  SIGNALING_PROTOCOL_OPTIONS,
  CLOCK_OPTIONS,
  CONNECTION_LINE_OPTIONS
} from '../constants/PcmPcmConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, TextField, Checkbox, FormControlLabel } from '@mui/material';

const initialPcmData = [{
  pcmNo: 0,
  signalingProtocol: 'ISDN User Side',
  clock: 'Line-synchronization',
  controlMode: '--',
  signalingTimeSlot: 16,
  signalingLinkType: '--',
  connectionLine: 'Twisted Pair Cable',
  crc4: true,
  sipTrunkNo: -1
}];

const PcmPcmPage = () => {
  const [pcmData, setPcmData] = useState(initialPcmData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [modalForm, setModalForm] = useState({});

  const openModal = (idx) => {
    setEditIndex(idx);
    setModalForm({ ...pcmData[idx] });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditIndex(null);
  };
  const handleModalChange = (field, value) => {
    setModalForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleModalCheckbox = (field) => {
    setModalForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };
  const handleSave = () => {
    setPcmData((prev) => prev.map((row, i) => (i === editIndex ? { ...modalForm } : row)));
    closeModal();
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] w-full p-0 m-0" style={{ backgroundColor: '#dde0e4' }}>
      <div className="max-w-full mx-auto py-6 px-2 sm:px-4">
        <div className="w-full bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] rounded-t-lg font-semibold text-lg sm:text-xl text-center py-2 mb-0 shadow" style={{ color: '#111' }}>
          PCM Settings
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[1200px] bg-white border-collapse border-2 border-[#888]">
            <thead>
              <tr>
                {TABLE_HEADERS.map((h, i) => (
                  <th key={i} className="border border-[#888] bg-[#f8fafd] font-semibold text-xs sm:text-sm md:text-base py-3 px-2 text-center whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pcmData.map((row, idx) => (
                <tr key={idx}>
                  <td className="border border-[#888] text-center text-xs sm:text-sm md:text-base py-3">{row.pcmNo}</td>
                  <td className="border border-[#888] text-center text-xs sm:text-sm md:text-base py-3">{row.signalingProtocol}</td>
                  <td className="border border-[#888] text-center text-xs sm:text-sm md:text-base py-3">{row.clock}</td>
                  <td className="border border-[#888] text-center text-xs sm:text-sm md:text-base py-3">{row.controlMode}</td>
                  <td className="border border-[#888] text-center text-xs sm:text-sm md:text-base py-3">{row.signalingTimeSlot}</td>
                  <td className="border border-[#888] text-center text-xs sm:text-sm md:text-base py-3">{row.signalingLinkType}</td>
                  <td className="border border-[#888] text-center text-xs sm:text-sm md:text-base py-3">{row.connectionLine}</td>
                  <td className="border border-[#888] text-center text-xs sm:text-sm md:text-base py-3">{row.crc4 ? 'Enable' : 'Disable'}</td>
                  <td className="border border-[#888] text-center text-xs sm:text-sm md:text-base py-3">{row.sipTrunkNo}</td>
                  <td className="border border-[#888] text-center py-3">
                    <button
                      onClick={() => openModal(idx)}
                      className="bg-transparent border-none cursor-pointer p-0 rounded transition hover:bg-[#e3e7ef]"
                    >
                      <EditDocumentIcon style={{ fontSize: 24, color: '#2266aa' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="xs" fullWidth PaperProps={{ sx: { width: 600, maxWidth: '95vw', p: 0 } }}>
        <DialogTitle
          className="text-white text-center font-semibold text-lg"
          style={{ background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)', borderBottom: '1px solid #444444' }}
        >
          Modify PCM Info
        </DialogTitle>
        <DialogContent className="flex flex-col gap-2 py-4" style={{ backgroundColor: '#dde0e4', border: '1px solid #444444', borderTop: 'none' }}>
          <div className="flex flex-col gap-2 w-full">
            {/* PCM No. */}
            <div className="flex items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white" style={{ minHeight: 40 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>PCM No.:</label>
              <div className="flex-1 min-w-0">
                <TextField
                  type="text"
                  value={modalForm.pcmNo}
                  onChange={e => handleModalChange('pcmNo', e.target.value)}
                  size="small"
                  fullWidth
                  variant="outlined"
                  inputProps={{ style: { fontSize: 14, padding: '3px 6px', background: '#fff' } }}
                />
              </div>
            </div>
            {/* Signaling Protocol */}
            <div className="flex items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white" style={{ minHeight: 40 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>Signaling Protocol:</label>
              <div className="flex-1 min-w-0">
                <Select
                  value={modalForm.signalingProtocol}
                  onChange={e => handleModalChange('signalingProtocol', e.target.value)}
                  size="small"
                  fullWidth
                  variant="outlined"
                  className="bg-white"
                  sx={{ width: '100%' }}
                >
                  {SIGNALING_PROTOCOL_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </div>
            </div>
            {/* Signaling Time Slot */}
            <div className="flex items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white" style={{ minHeight: 40 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>Signaling Time Slot:</label>
              <div className="flex-1 min-w-0">
                <TextField
                  type="text"
                  value={modalForm.signalingTimeSlot}
                  onChange={e => handleModalChange('signalingTimeSlot', e.target.value)}
                  size="small"
                  fullWidth
                  variant="outlined"
                  inputProps={{ style: { fontSize: 14, padding: '3px 6px', background: '#fff' } }}
                />
              </div>
            </div>
            {/* Clock */}
            <div className="flex items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white" style={{ minHeight: 40 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>Clock:</label>
              <div className="flex-1 min-w-0">
                <Select
                  value={modalForm.clock}
                  onChange={e => handleModalChange('clock', e.target.value)}
                  size="small"
                  fullWidth
                  variant="outlined"
                  className="bg-white"
                  sx={{ width: '100%' }}
                >
                  {CLOCK_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </div>
            </div>
            {/* Connection Line */}
            <div className="flex items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white" style={{ minHeight: 40 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>Connection Line:</label>
              <div className="flex-1 min-w-0">
                <Select
                  value={modalForm.connectionLine}
                  onChange={e => handleModalChange('connectionLine', e.target.value)}
                  size="small"
                  fullWidth
                  variant="outlined"
                  className="bg-white"
                  sx={{ width: '100%' }}
                >
                  {CONNECTION_LINE_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </div>
            </div>
            {/* Option Sip Trunk ID */}
            <div className="flex items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white" style={{ minHeight: 40 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:180, marginRight:10}}>Option Sip Trunk ID:</label>
              <div className="flex-1 min-w-0">
                <TextField
                  type="text"
                  value={modalForm.sipTrunkNo}
                  onChange={e => handleModalChange('sipTrunkNo', e.target.value)}
                  size="small"
                  fullWidth
                  variant="outlined"
                  inputProps={{ style: { fontSize: 14, padding: '3px 6px', background: '#fff' } }}
                />
              </div>
            </div>
            {/* Enable CRC-4 */}
            <div className="flex items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white" style={{ minHeight: 40 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left flex items-center" style={{width:180, marginRight:10}}>
                <Checkbox
                  checked={modalForm.crc4 || false}
                  onChange={() => handleModalCheckbox('crc4')}
                  sx={{ color: '#6b7280', '&.Mui-checked': { color: '#6b7280' }, padding: 0, marginRight: 1 }}
                />
                Enable CRC-4
              </label>
              <div className="flex-1"></div>
            </div>
            {/* Apply to All PCMs */}
            <div className="flex items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white" style={{ minHeight: 40 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left flex items-center" style={{width:180, marginRight:10}}>
                <Checkbox
                  checked={modalForm.applyToAllPcMs || false}
                  onChange={() => handleModalCheckbox('applyToAllPcMs')}
                  sx={{ color: '#6b7280', '&.Mui-checked': { color: '#6b7280' }, padding: 0, marginRight: 1 }}
                />
                Apply to All PCMs
              </label>
              <div className="flex-1"></div>
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
            onClick={closeModal}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmPcmPage; 