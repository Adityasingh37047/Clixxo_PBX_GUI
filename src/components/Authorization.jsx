import React, { useState, useRef, useEffect } from 'react';
import { Button, TextField, CircularProgress, Alert } from '@mui/material';
import { DEFAULT_SERIAL, DEFAULT_STATUS } from '../constants/AuthorizationConstants';
import { postLinuxCmd } from '../api/apiService';

const blueBarStyle = {
  width: '100%',
  height: 32,
  background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
  marginBottom: 0,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: 18,
  color: '#444',
  justifyContent: 'center',
  boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
};

const blueButtonSx = {
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

const grayButtonSx = {
  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
  color: '#444',
  fontWeight: 600,
  fontSize: 15,
  borderRadius: 1.5,
  minWidth: 120,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  textTransform: 'none',
  px: 3,
  py: 1.5,
  padding: '6px 28px',
  '&:hover': {
    background: 'linear-gradient(to bottom, #bfc6d1 0%, #e3e7ef 100%)',
    color: '#444',
  },
};

const Authorization = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('No file chosen');
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [serial, setSerial] = useState(DEFAULT_SERIAL);
  const [loadingSerial, setLoadingSerial] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    } else {
      setFile(null);
      setFileName('No file chosen');
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    // Simulate upload
    setStatus('Authorized');
  };

  const handleReset = () => {
    setFile(null);
    setFileName('No file chosen');
    setStatus(DEFAULT_STATUS);
    setSerial(DEFAULT_SERIAL);
    setError('');
  };

  useEffect(() => {
    const fetchSerial = async () => {
      try {
        setLoadingSerial(true);
        setError('');
        const response = await postLinuxCmd({ cmd: 'astlicense' });
        if (!response?.response || typeof response?.responseData !== 'string') {
          throw new Error(response?.message || 'Unexpected response');
        }
        const lines = response.responseData.split(/\r?\n/);
        const astLine = lines.find(line => line.trim().toLowerCase().startsWith('astlic:')) || '';
        if (astLine) {
          const fields = astLine.split(':').slice(1).join(':').split(',').map(s => s.trim());
          if (fields.length >= 2 && fields[1]) {
            setSerial(fields[1]);
            setLoadingSerial(false);
            return;
          }
        }
        throw new Error('Serial number not found in astlicense output');
      } catch (err) {
        console.error('Failed to load serial number:', err);
        setError(err?.message || 'Failed to load serial number.');
        setLoadingSerial(false);
      }
    };

    fetchSerial();
  }, []);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] py-0.5 flex flex-col items-center" style={{backgroundColor: "#dde0e4"}}>
        <div className="w-full max-w-xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 relative">
        {error && (
          <Alert
            severity="error"
            onClose={() => setError('')}
            sx={{ position: 'absolute', top: -60, left: 0, right: 0 }}
          >
            {error}
          </Alert>
        )}
        {/* Blue bar header OUTSIDE the border */}
        <div style={blueBarStyle}>Authorization</div>
        
        {/* Main bordered box (no blue bar inside) */}
        <div className="bg-white border-2 border-gray-400">
          <form className="w-full bg-white flex flex-col gap-0 px-4 py-6" onSubmit={handleUpdate}>
            {/* Single unified table */}
            <div className="w-full">
              <table className="w-full border border-gray-400 bg-white" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th colSpan={2} className="border border-gray-400 py-3 text-center font-normal" style={{ background: 'inherit', fontWeight: 400, fontSize: '12px' }}>Authorization Information</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 py-3 px-4 text-left align-middle" style={{ width: '40%', fontSize: '12px', fontWeight: 400 }}>Serial Number:</td>
                    <td className="border border-gray-400 py-3 px-4 text-left align-middle" style={{ width: '60%' }}>
                      <div className="flex items-center gap-3">
                        <TextField
                          type="text"
                          value={serial}
                          size="small"
                          fullWidth
                          variant="outlined"
                          sx={{ maxWidth: 280, fontSize: '12px', fontWeight: 400 }}
                          disabled={loadingSerial}
                          InputProps={{ readOnly: true }}
                        />
                        {loadingSerial && <CircularProgress size={20} />}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 py-3 px-4 text-left align-middle" style={{ fontSize: '12px', fontWeight: 400 }}>Authorization Status</td>
                    <td className="border border-gray-400 py-3 px-4 text-left align-middle">
                      <a href="#" className="text-blue-700 underline cursor-pointer" style={{ fontSize: '12px', fontWeight: 400 }}>{status}</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 py-3 px-4 text-left align-middle" style={{ fontSize: '12px', fontWeight: 400 }}>
                      <label htmlFor="authFile">Please select an authorization file:</label>
                    </td>
                    <td className="border border-gray-400 py-3 px-4 text-left align-middle">
                      <div className="flex items-center">
                        <input
                          id="authFile"
                          type="file"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                          ref={ref => (window._authFileInput = ref)}
                        />
                        <div
                          className="border border-gray-400 rounded px-3 py-1 font-semibold text-gray-800 cursor-pointer select-none hover:bg-gray-100"
                          style={{ display: 'inline-block', fontSize: '12px' }}
                          onClick={() => window._authFileInput && window._authFileInput.click()}
                        >
                          Choose File
                        </div>
                        <span className="ml-3 text-gray-700 align-middle" style={{ fontSize: '12px', fontWeight: 400 }}>
                          {fileName === 'No file chosen' ? 'No file chosen!' : fileName}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </form>
        </div>
        
        {/* Buttons OUTSIDE the border */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 w-full">
          <Button
            type="submit"
            variant="contained"
            sx={blueButtonSx}
            onClick={handleUpdate}
            className="sm:w-auto"
          >
            Update
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleReset}
            sx={grayButtonSx}
            className="sm:w-auto"
          >
            Reset
          </Button>
        </div>
        
        {/* Warning Note */}
        <div className="text-red-600 text-center text-sm mt-4 mb-0">
          Note: All the configurations related to the PCM Trunk will be deleted after you update the authorization file!
        </div>
      </div>
    </div>
  );
};

export default Authorization; 