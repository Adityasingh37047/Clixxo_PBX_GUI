import React, { useState } from 'react';
import { RADIUS_FIELDS, LOCAL_IP_OPTIONS, CALL_TYPE_OPTIONS, RADIUS_BUTTONS } from '../constants/RadiusConstants';
import { Button, Checkbox, Select, MenuItem, FormControlLabel, TextField } from '@mui/material';

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

const RADIUS_INITIAL_FORM = {
  radius: false,
  certification: false,
  allowCalls: false,
  localIp: '',
  masterServer: '',
  sharedKey: '',
  spareServer: '',
  spareSharedKey: '',
  timeout: '',
  retransmission: '',
  transmitInterval: '',
  callType: [],
};

const Radius = () => {
  const [form, setForm] = useState(RADIUS_INITIAL_FORM);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCallTypeChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const arr = prev.callType || [];
      if (checked) {
        return { ...prev, callType: [...arr, value] };
      } else {
        return { ...prev, callType: arr.filter((v) => v !== value) };
      }
    });
  };

  const handleReset = () => {
    setForm(RADIUS_INITIAL_FORM);
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings saved!');
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto">
        {/* Radius Configuration Section */}
        <div className="w-full bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] h-10 flex items-center justify-center font-semibold text-lg text-black shadow mb-0 border-t-2 border-x-2 border-gray-400 rounded-t-xl">
          Radius Configuration
        </div>
        
        <div className="w-full bg-white border-x-2 border-b-2 border-gray-400 rounded-b-xl flex flex-col gap-0 px-2 md:px-8 py-6">
          <div className="w-full max-w-3xl mx-auto">
            
            {/* Form Fields Grid */}
            <form onSubmit={handleSave} className="w-full grid grid-cols-1 lg:grid-cols-2 gap-x-4 lg:gap-x-8 gap-y-6 mt-4">
              {RADIUS_FIELDS.map((field) => (
                field.type === 'checkboxGroup' ? (
                  CALL_TYPE_OPTIONS.map((opt, idx) => (
                    <React.Fragment key={opt.value}>
                      <div className={idx === 0 ? 'flex items-start justify-start min-h-[36px] pt-2 text-sm sm:text-base text-gray-800 text-left pl-2 sm:pl-4 break-words' : 'flex min-h-[36px]'}>
                        {idx === 0 && (
                          <span className="leading-tight">{field.label}</span>
                        )}
                      </div>
                      <div className="flex items-center min-h-[36px] pl-2 sm:pl-0">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={form.callType.includes(opt.value)}
                              onChange={handleCallTypeChange}
                              name="callType"
                              value={opt.value}
                              sx={{ '& .MuiSvgIcon-root': { fontSize: 22 } }}
                            />
                          }
                          label={<span className="text-sm sm:text-base text-gray-700">{opt.label}</span>}
                          className="min-w-[140px] sm:min-w-[160px]"
                        />
                      </div>
                    </React.Fragment>
                  ))
                ) : (
                  <React.Fragment key={field.name}>
                    <div className="flex items-center text-sm sm:text-base text-gray-800 text-left pl-2 sm:pl-4 break-words min-h-[36px]">
                      <span className="leading-tight">{field.label}</span>
                    </div>
                    <div className="flex items-center min-h-[36px] pl-2 sm:pl-0">
                      {field.type === 'checkbox' ? (
                        <div className="flex items-center">
                          <Checkbox
                            checked={!!form[field.name]}
                            onChange={handleChange}
                            name={field.name}
                            sx={{ '& .MuiSvgIcon-root': { fontSize: 22 } }}
                          />
                          <span className="ml-1 text-sm sm:text-base text-gray-700">{field.enableLabel}</span>
                        </div>
                      ) : field.type === 'select' ? (
                        <Select
                          value={form[field.name] || ''}
                          onChange={handleChange}
                          name={field.name}
                          size="small"
                          variant="outlined"
                          className="w-full"
                          displayEmpty
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              fontSize: '14px',
                              height: '40px'
                            }
                          }}
                        >
                          <MenuItem value="">
                            <em>Select Local IP</em>
                          </MenuItem>
                          {LOCAL_IP_OPTIONS.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                          ))}
                        </Select>
                      ) : (
                        <TextField
                          variant="outlined"
                          size="small"
                          type={field.type === 'password' ? 'password' : 'text'}
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
                      )}
                    </div>
                  </React.Fragment>
                )
              ))}
            </form>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-8 mt-8 w-full max-w-3xl mx-auto">
          <Button 
            type="submit" 
            variant="contained" 
            sx={blueButtonSx}
            onClick={handleSave}
            className="w-full sm:w-auto"
          >
            Save
          </Button>
          <Button 
            type="button" 
            variant="contained" 
            sx={blueButtonSx}
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Radius; 