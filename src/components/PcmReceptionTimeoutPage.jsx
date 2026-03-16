import React, { useState, useEffect } from 'react';
import { PCM_RECEPTION_TIMEOUT_FIELDS, PCM_RECEPTION_TIMEOUT_INITIAL_FORM, PCM_RECEPTION_TIMEOUT_TABLE_COLUMNS } from '../constants/PcmReceptionTimeoutConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

const PcmReceptionTimeoutPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...PCM_RECEPTION_TIMEOUT_INITIAL_FORM });
  const [timeoutData, setTimeoutData] = useState(PCM_RECEPTION_TIMEOUT_INITIAL_FORM);

  const handleOpenModal = () => {
    setFormData({ ...timeoutData });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setTimeoutData(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{backgroundColor: "#dde0e4"}}>
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
          Number-receiving Timeout Info
        </div>

        <div className="w-full max-w-full mx-auto" style={{ border: '2px solid #bbb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="bg-white rounded-lg shadow-sm w-full flex flex-col overflow-hidden">
            <div className="overflow-x-auto w-full border-b border-gray-300" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
              <table className="w-full min-w-[1200px] border border-gray-300 border-collapse whitespace-nowrap" style={{ tableLayout: 'auto', border: '1px solid #bbb' }}>
              <colgroup>
                <col className="w-1/3" />
                <col className="w-1/3" />
                <col className="w-1/3" />
              </colgroup>
            <thead>
              <tr style={{ minHeight: 32 }}>
                <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Inter Digit Timeout(s)</th>
                <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Description</th>
                <th className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>Modify</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ minHeight: 32 }}>
                <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{timeoutData.interDigitTimeout}</td>
                <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>{timeoutData.description}</td>
                <td className="border border-gray-300 text-center bg-white" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                  <EditDocumentIcon 
                    className="cursor-pointer text-blue-600 mx-auto" 
                    onClick={handleOpenModal}
                    style={{ fontSize: 22 }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth={false} PaperProps={{ sx: { width: 600 } }}>
        <DialogTitle className="text-white text-center font-semibold text-lg" style={{ background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)', borderBottom: '1px solid #444444' }}>Number-Receiving Timeout</DialogTitle>
        <DialogContent className="flex flex-col gap-2 py-4" style={{ backgroundColor: '#dde0e4', border: '1px solid #444444', borderTop: 'none' }}>
          {PCM_RECEPTION_TIMEOUT_FIELDS.map((field) => (
            <div key={field.name} className="flex flex-row items-center border border-gray-300 rounded px-3 py-2 gap-3 w-full bg-white mb-2">
              <label className="text-[15px] text-gray-700 font-medium whitespace-nowrap text-left min-w-[120px] mr-2">{field.label}:</label>
              <div className="flex-1 min-w-0">
                <TextField
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                  size="small"
                  fullWidth
                  variant="outlined"
                  className="bg-white"
                  sx={{ maxWidth: '100%', minWidth: 0, backgroundColor: '#ffffff' }}
                  placeholder={field.placeholder || ''}
                      />
              </div>
            </div>
          ))}
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
              color: '#111827',
              fontWeight: 600,
              fontSize: '16px',
              borderRadius: 1,
              minWidth: 100,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #d1d5db 0%, #e5e7eb 100%)',
                color: '#111827',
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

export default PcmReceptionTimeoutPage; 