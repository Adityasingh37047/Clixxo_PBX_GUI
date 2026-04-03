import React, { useState } from 'react';
import { DIALING_TIMEOUT_TABLE_COLUMNS, DIALING_TIMEOUT_INITIAL_FORM, DIALING_TIMEOUT_INITIAL_DATA } from './constants/DialingTimeoutConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

const DialingTimeoutPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(DIALING_TIMEOUT_INITIAL_FORM);
  const [timeoutData, setTimeoutData] = useState(DIALING_TIMEOUT_INITIAL_DATA);

  const handleOpenModal = () => {
    // Load current data into form
    setFormData({
      interDigitTimeout: String(timeoutData.interDigitTimeout),
      offHookTimeout: String(timeoutData.offHookTimeout),
      description: timeoutData.description || 'example',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(DIALING_TIMEOUT_INITIAL_FORM);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Validation
    if (!formData.description || formData.description.trim() === '') {
      alert('Description is required.');
      return;
    }

    if (!formData.interDigitTimeout || formData.interDigitTimeout.trim() === '') {
      alert('Inter Digit Timeout is required.');
      return;
    }

    const interDigit = parseInt(formData.interDigitTimeout);
    if (isNaN(interDigit) || interDigit < 0) {
      alert('Inter Digit Timeout must be a valid positive number.');
      return;
    }

    if (!formData.offHookTimeout || formData.offHookTimeout.trim() === '') {
      alert('Off-hook Waiting Keypress Timeout is required.');
      return;
    }

    const offHook = parseInt(formData.offHookTimeout);
    if (isNaN(offHook) || offHook < 0) {
      alert('Off-hook Waiting Keypress Timeout must be a valid positive number.');
      return;
    }

    // Update the data
    setTimeoutData({
      ...timeoutData,
      interDigitTimeout: interDigit,
      offHookTimeout: offHook,
      description: formData.description.trim(),
    });

    alert('Dialing timeout settings saved successfully!');
    handleCloseModal();
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    // Allow digits (48-57), backspace (8), delete (127)
    if (!((key >= 48 && key <= 57) || key === 8 || key === 127)) {
      e.preventDefault();
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-128px)] py-2 px-2 sm:px-4" style={{backgroundColor: "#dde0e4"}}>
      <div className="w-full max-w-full">
        {/* Blue header bar */}
        <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-600 shadow mb-0">
          Dialing Timeout Info
        </div>
        
        <div className="bg-white border-2 border-gray-400 border-t-0 shadow-sm">
          <div className="w-full flex flex-col overflow-hidden">
            <div className="w-full">
              <table className="w-full border border-gray-300 border-collapse" style={{ tableLayout: 'auto', border: '1px solid #bbb' }}>
                <thead>
                  <tr style={{ minHeight: 32 }}>
                    {DIALING_TIMEOUT_TABLE_COLUMNS.map(c => (
                      <th 
                        key={c.key} 
                        className="bg-white text-[#222] font-semibold text-[12px] border border-gray-300 text-center" 
                        style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ minHeight: 32 }}>
                    <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                      <EditDocumentIcon style={{ cursor: 'pointer', color: '#0e8fd6', display: 'block', margin: '0 auto' }} onClick={handleOpenModal} />
                    </td>
                    <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                      {timeoutData.interDigitTimeout}
                    </td>
                    <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                      {timeoutData.offHookTimeout}
                    </td>
                    <td className="border border-gray-300 text-center bg-white text-[12px]" style={{ border: '1px solid #bbb', padding: '6px 8px', minHeight: 32, whiteSpace: 'nowrap' }}>
                      {timeoutData.description}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog 
        open={isModalOpen} 
        onClose={handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: { width: 500, maxWidth: '95vw', mx: 'auto', p: 0 }
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
          Dialing Timeout
        </DialogTitle>
        <DialogContent 
          className="pt-3 pb-0 px-2" 
          style={{
            padding: '12px 8px 0 8px',
            backgroundColor: '#dde0e4',
            border: '1px solid #444444',
            borderTop: 'none',
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto'
          }}
        >
          <div className="flex flex-col gap-2 w-full">
            {/* Description field */}
            <div className="flex items-center bg-white border border-gray-300 rounded px-2 py-0.5 gap-2" style={{ minHeight: 28 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 180, marginRight: 10, flexShrink: 0 }}>
                Description:
              </label>
              <div className="flex-1">
                <TextField
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '28px',
                      backgroundColor: 'white',
                      '& fieldset': { borderColor: '#bbb' },
                      '&:hover fieldset': { borderColor: '#999' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '4px 8px',
                      fontSize: 14
                    }
                  }}
                />
              </div>
            </div>
            {/* Inter Digit Timeout field */}
            <div className="flex items-center bg-white border border-gray-300 rounded px-2 py-0.5 gap-2" style={{ minHeight: 28 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 180, marginRight: 10, flexShrink: 0 }}>
                Inter Digit Timeout (s):
              </label>
              <div className="flex-1">
                <TextField
                  name="interDigitTimeout"
                  value={formData.interDigitTimeout || ''}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  size="small"
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '28px',
                      backgroundColor: 'white',
                      '& fieldset': { borderColor: '#bbb' },
                      '&:hover fieldset': { borderColor: '#999' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '4px 8px',
                      fontSize: 14
                    }
                  }}
                />
              </div>
            </div>
            {/* Off-hook waiting digit timeout field */}
            <div className="flex items-center bg-white border border-gray-300 rounded px-2 py-0.5 gap-2" style={{ minHeight: 28 }}>
              <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 220, marginRight: 10, flexShrink: 0 }}>
                Off-hook waiting digit timeout(s):
              </label>
              <div className="flex-1">
                <TextField
                  name="offHookTimeout"
                  value={formData.offHookTimeout || ''}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  size="small"
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '28px',
                      backgroundColor: 'white',
                      '& fieldset': { borderColor: '#bbb' },
                      '&:hover fieldset': { borderColor: '#999' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '4px 8px',
                      fontSize: 14
                    }
                  }}
                />
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

export default DialingTimeoutPage;

