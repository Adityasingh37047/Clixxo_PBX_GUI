import React, { useState, useEffect } from 'react';
import { Button, Alert, CircularProgress } from '@mui/material';
import { WARNING_LOG_TITLE, WARNING_LOGS, WARNING_NOTE } from '../constants/WarningInfoConstants';
import { getWarningLogs, downloadWarningLogs } from '../api/apiService';
// import * as XLSX from 'xlsx'; // Uncomment if SheetJS is installed

const blueBarStyle = {
  width: '100%',
  height: 32,
  background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
  borderBottom: '1px solid #444444',
  marginBottom: 0,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: 18,
  color: '#444',
  justifyContent: 'center',
  boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
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

const WarningInfo = () => {
  const [warningLogs, setWarningLogs] = useState('');
  const [loading, setLoading] = useState(true); // Start with loading true for initial load
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const showMessage = (type, text) => {
    if (type === 'error') {
      setError(text);
      setTimeout(() => setError(''), 5000);
    } else if (type === 'success') {
      setSuccess(text);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Load warning logs when component mounts
  useEffect(() => {
    loadWarningLogs();
  }, []);

  const loadWarningLogs = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await getWarningLogs();
      
      if (response.response && response.data) {
        setWarningLogs(response.data);
        showMessage('success', response.message || 'Warning logs loaded successfully!');
      } else {
        throw new Error(response.message || 'Failed to load warning logs');
      }
    } catch (error) {
      console.error('Error loading warning logs:', error);
      
      let errorMessage = 'Failed to load warning logs.';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later or contact support.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showMessage('error', errorMessage);
      setWarningLogs('Failed to load warning logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setError('');
    setSuccess('');
    
    try {
      const response = await downloadWarningLogs();
      
      if (response.response && response.data) {
        // Create plain text .log download (preserve original log formatting)
        const logContent = response.data;
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'warning_log.log';
        a.click();
        URL.revokeObjectURL(url);

        showMessage('success', response.message || 'Warning logs downloaded successfully!');
      } else {
        throw new Error(response.message || 'Failed to download warning logs');
      }
    } catch (error) {
      console.error('Error downloading warning logs:', error);
      
      let errorMessage = 'Failed to download warning logs.';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Download timeout. Please check your connection and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error during download. Please try again later.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed during download. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showMessage('error', errorMessage);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] py-0.5 flex flex-col items-center" style={{backgroundColor: "#dde0e4"}}>
      {/* Message Display */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          onClose={() => setSuccess('')}
          sx={{
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3
          }}
        >
          {success}
        </Alert>
      )}

      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div style={blueBarStyle}>{WARNING_LOG_TITLE}</div>
        <div style={{ border: '1px solid #444444', borderTop: 'none', backgroundColor: '#dde0e4' }}>
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px] h-[400px] bg-white">
              <div className="text-center">
                <CircularProgress size={40} sx={{ color: '#0e8fd6' }} />
                <div className="mt-3 text-gray-600">Loading warning logs...</div>
              </div>
            </div>
          ) : (
            <textarea
              value={warningLogs}
              readOnly
              className="w-full min-h-[400px] h-[400px] resize-vertical text-xs bg-white p-3 box-border outline-none font-mono"
              style={{
                border: 'none',
                margin: '0',
                fontSize: '12px',
                lineHeight: '1.2'
              }}
              placeholder="No warning logs found"
            />
          )}
        </div>
        <div className="w-full flex justify-center mt-6 mb-0">
          <Button 
            sx={buttonSx} 
            onClick={handleDownload}
            disabled={loading}
          >
            Download
          </Button>
        </div>
        <div className="text-blue-600 text-center text-sm mt-4 mb-0">
          Note: Warning logs are loaded automatically from system logs. Click "Download" to get all warning logs as CSV file.
        </div>
      </div>
    </div>
  );
};

export default WarningInfo;