import React, { useState } from 'react';
import { CERTIFICATE_FIELDS, CERTIFICATE_BUTTONS, CERTIFICATE_NOTE } from '../constants/CertificateManageConstants';
import { Button, TextField } from '@mui/material';

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

const CertificateManage = () => {
  const [form, setForm] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto">
        {/* Certificate Management Section */}
        <div className="w-full bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] h-10 flex items-center justify-center font-semibold text-lg text-black shadow mb-0 border-t-2 border-x-2 border-gray-400 rounded-t-xl">
          Certificate Management
        </div>
        
        <div className="w-full bg-white border-x-2 border-b-2 border-gray-400 rounded-b-xl flex flex-col gap-0 px-2 md:px-8 py-6">
          <div className="w-full max-w-3xl mx-auto">
            
            {/* Form Fields Grid */}
            <form className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-4 mt-4">
              {CERTIFICATE_FIELDS.map((field) => (
                <React.Fragment key={field.name}>
                  <div className="flex items-center text-base text-gray-800 text-left pl-4 whitespace-nowrap min-h-[36px]">
                    {field.label}:
                  </div>
                  <div className="flex items-center min-h-[36px]">
                    <TextField
                      variant="outlined"
                      size="small"
                      name={field.name}
                      value={form[field.name] || ''}
                      onChange={handleChange}
                      className="bg-white w-full"
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          fontSize: '14px',
                          height: '40px'
                        }
                      }}
                    />
                  </div>
                </React.Fragment>
              ))}
            </form>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-8 mt-8 w-full max-w-3xl mx-auto">
          {CERTIFICATE_BUTTONS.map((btn) => (
            <Button 
              key={btn.name} 
              variant="contained" 
              sx={blueButtonSx}
              className="w-full sm:w-auto"
            >
              {btn.label}
            </Button>
          ))}
        </div>

        {/* Note */}
        <div className="w-full flex flex-row justify-center mt-2 mb-4">
          <span className="text-red-600 text-base font-medium text-center px-4">{CERTIFICATE_NOTE}</span>
        </div>
      </div>
    </div>
  );
};

export default CertificateManage; 