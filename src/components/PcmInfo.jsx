import React, { useState } from 'react';
import {PCM_FIELDS} from "../constants/PcmInfoConstants"
import Button from '@mui/material/Button';

const getInitialFormData = () => {
  return PCM_FIELDS.reduce((acc, field) => {
    acc[field.key] = field.defaultValue;
    return acc;
  }, {});
};

const buttonSx = {
  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '16px',

  minWidth: 100,
  minHeight: 42,
  px: 2,
  py: 0.5,
  boxShadow: '0 2px 8px #b3e0ff',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
    color: '#fff',
  },
};

const grayButtonSx = {
  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
  color: '#888',
  fontWeight: 600,
  fontSize: '16px', 
 
  minWidth: 100,
  minHeight: 42,
  px: 2,
  py: 0.5,
  boxShadow: '0 2px 8px #b3e0ff',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(to bottom, #bfc6d1 0%, #e3e7ef 100%)',
    color: '#888',
  },
};

const PcmInfo = () => {
  const [formData, setFormData] = useState(getInitialFormData());
  const [currentField, setCurrentField] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetCurrent = () => {
    if (currentField) {
      setFormData(prev => ({
        ...prev,
        [currentField]: '0'
      }));
    }
  };

  const handleResetAll = () => {
    const resetData = PCM_FIELDS.reduce((acc, field) => {
      acc[field.key] = '0';
      return acc;
    }, {});
    setFormData(resetData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans text-sm p-0" style={{backgroundColor: "#dde0e4"}}>
      {/* PCM0 Dropdown above the blue bar */}
      <div className="flex justify-end mb-1">
        <select className="bg-white border border-gray-400 px-4 py-1 text-xs" style={{ backgroundColor: '#ffffff' }}>
          <option>PCM0</option>
        </select>
      </div>

      {/* Blue bar header OUTSIDE the border */}
      <div className="w-full h-8 bg-gradient-to-b from-[#d0ecff] via-[#7ecbfa] to-[#3b8fd6] flex items-center justify-center font-semibold text-base text-gray-700 shadow mb-0">
        <span>PCM Info</span>
      </div>

      {/* Main bordered box (no blue bar inside) */}
      <div className="bg-white border-2 border-gray-400">
        {/* Content Area */}
        <div className="bg-gray-50 p-0.5 md:p-6">
          <div className="space-y-3">
            {PCM_FIELDS.map((field) => (
              <div key={field.key} className="flex flex-col md:flex-row items-center justify-between gap-1 md:gap-0">
                <label className="text-gray-700 md:w-80 w-full mb-1 md:mb-0">{field.label}</label>
                <input
                  type="text"
                  value={formData[field.key]}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  onFocus={() => setCurrentField(field.key)}
                  className={`w-full md:w-60 px-2 py-1 border border-gray-400 bg-white text-center rounded ${
                    currentField === field.key ? 'ring-2 ring-blue-400' : ''
                  }`}
                  style={{ backgroundColor: '#ffffff' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buttons OUTSIDE the border */}
      <div className="flex flex-col sm:flex-row justify-center gap-25 mt-6">
        <Button
          sx={buttonSx}
          onClick={handleResetCurrent}
        >
          Reset Current
        </Button>
        <Button
          sx={buttonSx}
          onClick={handleResetAll}
        >
          Reset All
        </Button>
      </div>
    </div>
  );
};

export default PcmInfo;