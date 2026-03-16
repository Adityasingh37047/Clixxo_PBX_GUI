import React, { useState } from 'react';
import { DEVICE_LOCK_OPTIONS, DEVICE_LOCK_LABELS } from '../constants/DeviceLockConstants';
import { Button, Paper, Typography } from '@mui/material';

const blueBarStyle = {
  width: '100%',
  height: 36,
  background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  marginBottom: 0,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: 22,
  color: '#444',
  justifyContent: 'center',
  boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
};

const buttonSx = {
  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '16px',
  borderRadius: 1.5,
  minWidth: 120,
  px: 2,
  py: 0.5,
  boxShadow: '0 2px 8px #b3e0ff',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
    color: '#fff',
  },
};

const DeviceLock = () => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleOptionChange = (option) => {
    setSelectedOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const handleReset = () => {
    setSelectedOptions({});
    setPassword('');
    setConfirmPassword('');
  };

  const handleLock = (e) => {
    e.preventDefault();
    // Add lock logic here
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div style={blueBarStyle}>
          {DEVICE_LOCK_LABELS.title}
        </div>

        {/* Content */}
        <Paper elevation={3} className="p-6 bg-white rounded-b-lg shadow-lg" style={{ borderTop: 'none' }}>
          <div className="space-y-6">
            <Typography 
              variant="body1" 
              className="text-gray-700 mb-8 leading-relaxed"
              sx={{ fontSize: '16px', lineHeight: 1.6 }}
            >
              {DEVICE_LOCK_LABELS.instruction}
            </Typography>

            <form onSubmit={handleLock}>
              {/* Checkbox Options */}
              <div className="flex justify-center gap-16 mb-10">
                {DEVICE_LOCK_OPTIONS.map((opt) => (
                  <label 
                    key={opt.value} 
                    className="flex items-center text-gray-700 font-medium cursor-pointer hover:text-gray-800 transition-colors"
                    style={{ fontSize: '16px' }}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedOptions[opt.value]}
                      onChange={() => handleOptionChange(opt.value)}
                      style={{
                        marginRight: '12px',
                        width: '18px',
                        height: '18px',
                        accentColor: '#444',
                        cursor: 'pointer'
                      }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              {/* Password Fields */}
              <div className="space-y-6 max-w-md mx-auto">
                <div className="flex items-center">
                  <label className="w-40 text-right pr-6 text-gray-700 font-medium">
                    {DEVICE_LOCK_LABELS.password}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#888'}
                    onBlur={(e) => e.target.style.borderColor = '#ccc'}
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-40 text-right pr-6 text-gray-700 font-medium">
                    {DEVICE_LOCK_LABELS.confirmPassword}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#888'}
                    onBlur={(e) => e.target.style.borderColor = '#ccc'}
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-6 justify-center mt-10">
                <Button 
                  variant="contained"
                  onClick={handleLock}
                  sx={buttonSx}
                  size="large"
                >
                  {DEVICE_LOCK_LABELS.lock}
                </Button>
                <Button 
                  variant="contained"
                  onClick={handleReset}
                  sx={buttonSx}
                  size="large"
                >
                  {DEVICE_LOCK_LABELS.reset}
                </Button>
              </div>
            </form>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default DeviceLock; 