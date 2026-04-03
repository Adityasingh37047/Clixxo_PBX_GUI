import React, { useState } from 'react';
import { AREA_OPTIONS, AREA_SELECT_INITIAL_FORM } from './constants/AreaSelectConstants';
import { Button, Select as MuiSelect, MenuItem, FormControl } from '@mui/material';

const AreaSelectPage = () => {
  const [formData, setFormData] = useState(AREA_SELECT_INITIAL_FORM);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Form validation can be added here if needed
    alert('Settings saved successfully!');
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-128px)] py-2 px-2 sm:px-4" style={{backgroundColor: "#dde0e4"}}>
      <div style={{ width: '750px', maxWidth: '95%', margin: '0 auto' }}>
        {/* Blue header bar */}
        <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-600 shadow mb-0">
          Select Area for Parameters
        </div>

        <div className="bg-white border-2 border-gray-400 border-t-0 shadow-sm p-4">
          <table style={{ width: '100%', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '15%' }} />
              <col style={{ width: '50%' }} />
              <col style={{ width: '35%' }} />
            </colgroup>
            <tbody>
              {/* Area Parameters */}
              <tr style={{ height: '22px' }}>
                <td></td>
                <td style={{ fontSize: '14px', color: '#333' }}>Area Parameters</td>
                <td>
                  <FormControl size="small" sx={{ width: '155px' }}>
                    <MuiSelect
                      value={formData.areaSelect}
                      onChange={(e) => handleInputChange('areaSelect', e.target.value)}
                      variant="outlined"
                      sx={{
                        fontSize: 14,
                        height: 28,
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#bbb' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#999' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                        '& .MuiSelect-select': { padding: '4px 8px' }
                      }}
                    >
                      {AREA_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 14 }}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </td>
              </tr>
              <tr><td style={{ height: '8px' }}></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center" style={{ marginTop: '24px', marginBottom: '16px' }}>
        <Button
          variant="contained"
          sx={{
            background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            borderRadius: 1.5,
            minWidth: 100,
            px: 3,
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
      </div>
    </div>
  );
};

export default AreaSelectPage;

