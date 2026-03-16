import React, { useState } from 'react';
import { IDS_TYPES, IDS_INITIAL_FORM, IDS_WARNING_LOG, IDS_LOG_NOTE } from '../constants/IDSSettingsConstants';
import { Button, Checkbox, TextField } from '@mui/material';

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

const IDSSettings = () => {
  const [form, setForm] = useState(IDS_INITIAL_FORM);
  const [log, setLog] = useState(IDS_WARNING_LOG);

  const handleCheckbox = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const handleEnable = () => {
    setForm((prev) => ({ ...prev, enable: !prev.enable }));
  };
  const handleWarningThreshold = (idx, value) => {
    const arr = [...form.warningThresholds];
    arr[idx] = value;
    setForm((prev) => ({ ...prev, warningThresholds: arr }));
  };
  const handleBlacklistThreshold = (idx, value) => {
    const arr = [...form.blacklistThresholds];
    arr[idx] = value;
    setForm((prev) => ({ ...prev, blacklistThresholds: arr }));
  };
  const handleValidity = (value) => {
    setForm((prev) => ({ ...prev, blacklistValidity: value }));
  };
  const handleSave = (e) => {
    e.preventDefault();
    alert('IDS Settings saved!');
  };
  const handleReset = () => {
    setForm(IDS_INITIAL_FORM);
  };
  const handleDownload = () => {
    // For now, just alert. In real app, trigger file download.
    alert('Download all warning log info!');
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto">
        {/* IDS Settings Section */}
        <div className="w-full bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] h-10 flex items-center justify-center font-semibold text-lg text-black shadow mb-0 border-t-2 border-x-2 border-gray-400 rounded-t-xl">
          IDS Settings
        </div>
        
        <form onSubmit={handleSave} className="w-full bg-white border-x-2 border-b-2 border-gray-400 rounded-b-xl flex flex-col gap-0 px-2 md:px-8 py-6">
          <div className="w-full max-w-3xl mx-auto">
            
            {/* Enable Checkbox */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 w-full gap-2 pl-2 md:pl-8">
              <span className="text-base font-medium text-gray-700 min-w-[140px]">IDS Settings:</span>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.enable} onChange={handleEnable} size="small" />
                <span className="text-base text-gray-800">Enable</span>
              </div>
            </div>

            {/* Table Header - Hidden on mobile, shown on larger screens */}
            <div className="hidden md:grid md:grid-cols-3 gap-x-4 gap-y-2 items-center w-full mb-4 pl-2 md:pl-8">
              <span className="text-sm font-medium text-gray-700 col-span-1">Type</span>
              <span className="text-sm font-medium text-gray-700 col-span-1">Warning Threshold (per 10 seconds)</span>
              <span className="text-sm font-medium text-gray-700 col-span-1">Blacklist Threshold (per 10 seconds)</span>
            </div>

            {/* Mobile Layout - Stacked cards */}
            <div className="md:hidden space-y-4 pl-2 md:pl-8">
              {IDS_TYPES.map((type, idx) => (
                <div key={type.key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox checked={form[type.key]} onChange={() => handleCheckbox(type.key)} size="small" />
                    <span className="text-sm font-medium text-gray-800">{type.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-600 mb-1">Warning Threshold</label>
                      <TextField
                        variant="outlined"
                        size="small"
                        type="number"
                        value={form.warningThresholds[idx]}
                        onChange={e => handleWarningThreshold(idx, Number(e.target.value))}
                        className="bg-white"
                        sx={{ width: '100%' }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-600 mb-1">Blacklist Threshold</label>
                      <TextField
                        variant="outlined"
                        size="small"
                        type="number"
                        value={form.blacklistThresholds[idx]}
                        onChange={e => handleBlacklistThreshold(idx, Number(e.target.value))}
                        className="bg-white"
                        sx={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Layout - Grid table */}
            <div className="hidden md:grid md:grid-cols-3 gap-x-4 gap-y-2 items-center w-full pl-2 md:pl-8">
              {IDS_TYPES.map((type, idx) => (
                <React.Fragment key={type.key}>
                  <div className="flex flex-row items-center gap-2 col-span-1">
                    <Checkbox checked={form[type.key]} onChange={() => handleCheckbox(type.key)} size="small" />
                    <span className="text-sm text-gray-800">{type.label}</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      value={form.warningThresholds[idx]}
                      onChange={e => handleWarningThreshold(idx, Number(e.target.value))}
                      className="bg-white"
                      sx={{ minWidth: 90, maxWidth: 120 }}
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      value={form.blacklistThresholds[idx]}
                      onChange={e => handleBlacklistThreshold(idx, Number(e.target.value))}
                      className="bg-white"
                      sx={{ minWidth: 90, maxWidth: 120 }}
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Blacklist Validity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center mt-6 gap-2 pl-2 md:pl-8">
              <span className="text-base font-medium text-gray-700 min-w-[140px]">Blacklist Validity(s)</span>
              <TextField
                variant="outlined"
                size="small"
                type="number"
                value={form.blacklistValidity}
                onChange={e => handleValidity(Number(e.target.value))}
                className="bg-white"
                sx={{ minWidth: 120, maxWidth: 180 }}
              />
            </div>
          </div>
        </form>

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

      {/* IDS Warning Log Section */}
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="w-full bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] h-10 flex items-center justify-center font-semibold text-lg text-black shadow mb-0 border-t-2 border-x-2 border-gray-400 rounded-t-xl">
          IDS Warning Log
        </div>
        
        {/* Log Display Area */}
        <div className="w-full bg-white border-x-2 border-b-2 border-gray-400 rounded-b-xl overflow-hidden resize-y" 
             style={{ minHeight: 180, maxHeight: 260 }}>
          <textarea
            className="w-full h-full bg-white border-none outline-none resize-none p-4"
            style={{ 
              minHeight: 140, 
              maxHeight: 220, 
              fontFamily: 'monospace', 
              fontSize: '14px',
              background: 'white', 
              color: '#222' 
            }}
            value={log}
            readOnly
          />
        </div>

        {/* Download Button */}
        <div className="flex flex-col sm:flex-row justify-center mt-6 w-full">
          <Button 
            variant="contained" 
            sx={blueButtonSx} 
            onClick={handleDownload}
            className="w-full sm:w-auto"
          >
            Download
          </Button>
        </div>

        {/* Note */}
        <div className="text-xs text-red-600 text-center mt-2 mb-4 px-4 max-w-3xl mx-auto">
          {IDS_LOG_NOTE}
        </div>
      </div>
    </div>
  );
};

export default IDSSettings; 