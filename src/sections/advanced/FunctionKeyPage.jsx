import React, { useState } from 'react';
import { FUNCTION_KEY_FIELDS, getInitialFormState } from './constants/FunctionKeyConstants';
import { TextField, Button } from '@mui/material';

const FunctionKeyPage = () => {
  const [formData, setFormData] = useState(getInitialFormState());

  const handleEnableChange = (field) => {
    setFormData(prev => {
      const newData = { ...prev };
      const enabled = !prev[field.enableKey];
      newData[field.enableKey] = enabled;
      
      if (!enabled) {
        // When disabled, mode should also be disabled (but keep value)
        // Function key field will be disabled
      } else if (prev[field.modeKey] === '0') {
        // If enabled and mode is Default, set default value
        newData[field.functionKeyKey] = field.defaultValue;
      }
      return newData;
    });
  };

  const handleModeChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      newData[field.modeKey] = value;
      
      if (value === '0') {
        // Default mode: set to default value (input will be disabled)
        newData[field.functionKeyKey] = field.defaultValue;
      }
      // If User-defined, input will be enabled and user can edit
      return newData;
    });
  };

  const handleFunctionKeyChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field.functionKeyKey]: value }));
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    // Allow: backspace (8), delete (127), numbers (48-57), * (42), # (35)
    if (!(key === 8 || key === 127 || (key >= 48 && key <= 57) || key === 42 || key === 35)) {
      e.preventDefault();
    }
  };

  const validateForm = () => {
    const pattern1 = /^\*\d{0,9}\*{0,1}$/; // Standard pattern: *123* or *123
    const pattern2 = /^\*#\d{0,9}\*#$/; // Reboot pattern: *#123*#
    
    const funkeyArr = [];
    
    for (const field of FUNCTION_KEY_FIELDS) {
      const enabled = formData[field.enableKey];
      const functionKey = formData[field.functionKeyKey];
      const mode = formData[field.modeKey];
      
      if (!enabled) continue;
      
      // Check pattern
      const pattern = field.isReboot ? pattern2 : pattern1;
      if (mode === '1' && !pattern.test(functionKey)) {
        const errorMsg = field.isReboot 
          ? `Please input the function key for '${field.name}' in the right format, like *#88921532*#`
          : `Please input the function key for '${field.name}', in the right format, like ${field.defaultValue}`;
        alert(errorMsg);
        document.getElementById(field.functionKeyKey)?.focus();
        return false;
      }
      
      // Check for duplicates
      if (functionKey && funkeyArr.includes(functionKey)) {
        alert("Function key repeated!");
        document.getElementById(field.functionKeyKey)?.focus();
        return false;
      }
      if (functionKey) {
        funkeyArr.push(functionKey);
      }
    }
    
    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      alert('Settings saved successfully!');
    }
  };

  const handleReset = () => {
    setFormData(getInitialFormState());
  };

  const groupedFields = FUNCTION_KEY_FIELDS.reduce((acc, field) => {
    if (!acc[field.section]) {
      acc[field.section] = [];
    }
    acc[field.section].push(field);
    return acc;
  }, {});

  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-128px)] py-2"
      style={{ backgroundColor: '#dde0e4' }}
    >
      <div className="flex justify-center">
        <div className="w-full" style={{ maxWidth: '1024px' }}>
          {/* Page Title Bar */}
          <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-700 shadow mb-0">
            <span>Function Key</span>
          </div>
        
          {/* Main Card */}
          <div className="bg-[#dde0e4] border-2 border-gray-400 border-t-0 shadow-sm py-6 text-sm">
            <div className="flex justify-center pl-8">
              <table className="text-sm" style={{ tableLayout: 'fixed', width: '750px' }}>
                <colgroup>
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '35%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '25%' }} />
                </colgroup>
                <tbody>
                  {/* Table Headers */}
                  <tr>
                    <td></td>
                    <td className="text-gray-700 font-semibold text-left" style={{ paddingLeft: '0px' }}>Function</td>
                    <td className="text-gray-700 font-semibold text-left" style={{ paddingLeft: '0px' }}>Enable</td>
                    <td className="text-gray-700 font-semibold text-left" style={{ paddingLeft: '0px' }}>Function Key</td>
                    <td className="text-gray-700 font-semibold text-left" style={{ paddingLeft: '0px' }}>Mode</td>
                  </tr>
                  <tr><td colSpan={5} style={{ height: '8px' }}></td></tr>

                  {/* Sections */}
                  {Object.entries(groupedFields).map(([sectionName, fields]) => (
                    <React.Fragment key={sectionName}>
                      {/* Section Header */}
                      <tr>
                        <td colSpan={5} className="text-gray-700 font-semibold text-left" style={{ paddingLeft: '0px', paddingTop: '8px', paddingBottom: '4px' }}>
                          {sectionName}
                        </td>
                      </tr>

                      {/* Fields */}
                      {fields.map((field) => {
                        const enabled = formData[field.enableKey];
                        const mode = formData[field.modeKey];
                        const functionKey = formData[field.functionKeyKey];
                        const isDefaultMode = mode === '0';
                        const maxLength = field.isReboot ? 12 : 7;

                        return (
                          <tr key={field.id} style={{ height: '26px' }}>
                            <td></td>
                            <td className="text-gray-700 text-left" style={{ paddingLeft: '0px' }}>
                              {field.name}
                            </td>
                            <td className="text-left" style={{ paddingLeft: '0px' }}>
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={() => handleEnableChange(field)}
                                className="h-4 w-4 accent-blue-600"
                                style={{ backgroundColor: '#ffffff' }}
                              />
                            </td>
                            <td className="text-left" style={{ paddingLeft: '0px' }}>
                              <TextField
                                id={field.functionKeyKey}
                                value={functionKey}
                                onChange={(e) => handleFunctionKeyChange(field, e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={!enabled || isDefaultMode}
                                inputProps={{ maxLength, style: { fontSize: 14, padding: '4px 8px' } }}
                                sx={{
                                  width: '100%',
                                  maxWidth: '150px',
                                  '& .MuiOutlinedInput-root': {
                                    height: '28px',
                                    backgroundColor: enabled && !isDefaultMode ? 'white' : '#f5f5f5',
                                    '& fieldset': {
                                      borderColor: '#999',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: enabled && !isDefaultMode ? '#666' : '#999',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#3b82f6',
                                    },
                                    '&.Mui-disabled': {
                                      backgroundColor: '#f5f5f5',
                                    },
                                  },
                                }}
                                variant="outlined"
                                size="small"
                              />
                            </td>
                            <td className="text-left" style={{ paddingLeft: '0px' }}>
                              <select
                                value={mode}
                                onChange={(e) => handleModeChange(field, e.target.value)}
                                disabled={!enabled}
                                className="border rounded-sm px-1"
                                style={{ 
                                  height: '28px', 
                                  width: '120px',
                                  fontSize: '14px',
                                  backgroundColor: enabled ? 'white' : '#f5f5f5',
                                  borderColor: enabled ? '#999' : '#ccc',
                                  color: enabled ? '#333' : '#999',
                                  cursor: enabled ? 'pointer' : 'not-allowed',
                                  outline: 'none'
                                }}
                              >
                                <option value="0">Default</option>
                                <option value="1">User-defined</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                      <tr><td colSpan={5} style={{ height: '8px' }}></td></tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center gap-4 mt-6 mb-4">
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
      </div>
    </div>
  );
};

export default FunctionKeyPage;

