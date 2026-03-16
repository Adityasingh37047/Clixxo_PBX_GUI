import React, { useState } from 'react';
import { FR_TITLE, FR_INSTRUCTION, FR_BUTTON } from '../constants/FactoryResetConstants';
import Button from '@mui/material/Button';
import { postLinuxCmd } from '../api/apiService';

const blueBar = (title) => (
  <div className="w-full bg-gradient-to-b from-[#b3e0ff] via-[#7ecbfa] to-[#3b8fd6] h-10 rounded-t-lg flex items-center justify-center text-[20px] font-semibold text-gray-800 shadow mb-0 border-b border-[#b3e0ff]">
    {title}
  </div>
);

const buttonSx = {
  background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 16,
  borderRadius: 1.5,
  minWidth: 120,
  boxShadow: '0 2px 8px #b3e0ff',
  textTransform: 'none',
  px: 3,
  py: 1.5,
  padding: '6px 28px',
  '&:hover': {
    background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
    color: '#fff',
  },
};

const FactoryReset = () => {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const confirmed = window.confirm(
      "This will reset the 'astdb' MySQL database back to the factory state from /root/clixxo/DB/astdb.sql. Do you want to continue?"
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      // Restore astdb from the factory SQL file
      const cmd = 'mysql astdb < /root/clixxo/DB/astdb.sql 2>&1';
      const apiResponse = await postLinuxCmd({ cmd });

      if (apiResponse?.response) {
        window.alert('Factory reset completed. Database astdb has been restored from astdb.sql.');
      } else {
        const output = String(apiResponse?.responseData || '').trim();
        window.alert(output || 'Factory reset command did not complete successfully.');
      }
    } catch (error) {
      console.error('Factory reset error:', error);
      window.alert(error.message || 'Failed to run factory reset. Please check logs on the device.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col items-center py-6 px-2">
      <div className="w-full max-w-4xl">
        {blueBar(FR_TITLE)}
        <div className="border border-gray-400 bg-white p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[17px] text-gray-700">{FR_INSTRUCTION}</span>
        </div>
        <div className="w-full flex flex-row justify-center mt-8">
          <Button
            variant="contained"
            sx={buttonSx}
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? 'Resetting...' : FR_BUTTON}
          </Button>
        </div>
      </div>

      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(255,255,255,0.85)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#0e8fd6',
              marginBottom: 16,
              textAlign: 'center',
              maxWidth: 360,
            }}
          >
            Resetting database to factory settings...
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              border: '6px solid #b3e0ff',
              borderTop: '6px solid #0e8fd6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      )}
    </div>
  );
};

export default FactoryReset; 