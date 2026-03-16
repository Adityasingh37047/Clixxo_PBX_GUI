import React, { useEffect, useRef, useState } from 'react';
import {
  UPGRADE_LABELS,
  UPGRADE_BUTTONS,
} from '../constants/UpgradeConstants';
import Button from '@mui/material/Button';
import { Alert, CircularProgress } from '@mui/material';
import { uploadSoftwareUpdate, postLinuxCmd, fetchSystemInfo } from '../api/apiService';
import axiosInstance from '../api/axiosInstance';

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

const VERSION_FIELDS = [
  { key: 'serial_no', label: 'Serial Number', formatter: val => val || 'Unavailable' },
  { key: 'web_version', label: 'WEB', formatter: val => val || 'Unavailable' },
  { key: 'service', label: 'Service', formatter: val => val || 'Unavailable' },
  { key: 'uboot', label: 'Uboot', formatter: val => val || 'Unavailable' },
  { key: 'kernel', label: 'Kernel', formatter: val => val || 'Unavailable' },
  { key: 'firmware', label: 'Firmware', formatter: val => val || 'Unavailable' },
];

const createInitialRows = (placeholder = 'Loading...') =>
  VERSION_FIELDS.map(field => ({ ...field, version: placeholder, timestamp: '' }));

const Upgrade = () => {
  const [fileName, setFileName] = useState(UPGRADE_LABELS.noFile);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [rebooting, setRebooting] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [versionRows, setVersionRows] = useState(createInitialRows());
  const [versionLoading, setVersionLoading] = useState(false);
  const fileInputRef = useRef();
  const pingIntervalRef = useRef(null);
  const rebootDelayRef = useRef(null);

  const clearPolling = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (rebootDelayRef.current) {
      clearTimeout(rebootDelayRef.current);
      rebootDelayRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, []);

  useEffect(() => {
    loadVersionInfo();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setSelectedFile(f || null);
    setFileName(f ? f.name : UPGRADE_LABELS.noFile);
    setError('');
    setSuccess('');
  };

  const handleReset = () => {
    clearPolling();
    setSelectedFile(null);
    setFileName(UPGRADE_LABELS.noFile);
    setError('');
    setSuccess('');
    setProgressMessage('');
    setUploading(false);
    setRebooting(false);
    loadVersionInfo();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadVersionInfo = async () => {
    setVersionLoading(true);
    setVersionRows(createInitialRows('Loading...'));
    try {
      const res = await postLinuxCmd({ cmd: 'cat /home/clixxo/server/config/web_version.json' });
      if (!res?.response || !res?.responseData) {
        throw new Error(res?.message || 'Invalid response');
      }

      let parsed = {};
      try {
        parsed = JSON.parse(res.responseData);
      } catch (_) {
        throw new Error('Failed to parse version data');
      }

      const updatedRows = VERSION_FIELDS.map(field => {
        const rawValue = parsed[field.key];
        const formatted = field.formatter ? field.formatter(rawValue) : (rawValue ?? 'Unavailable');
        return {
          ...field,
          version: String(formatted),
          timestamp: '',
        };
      });
      setVersionRows(updatedRows);
      setError('');
    } catch (err) {
      console.error('Failed to load version info:', err);
      setVersionRows(createInitialRows('Unavailable'));
      setError(prev => prev || 'Failed to load current version details.');
    } finally {
      setVersionLoading(false);
    }
  };

  const checkDeviceOnline = async () => {
    try {
      await axiosInstance.get('/service-ping', { timeout: 4000 });
      return true;
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        return true; // backend up but session expired
      }
      return false;
    }
  };

  const beginOnlinePolling = () => {
    clearPolling();
    setProgressMessage('Device is rebooting. Waiting for it to come back online...');
    let attempts = 0;
    pingIntervalRef.current = setInterval(async () => {
      attempts += 1;
      const online = await checkDeviceOnline();
      if (online) {
        clearPolling();
        setProgressMessage('Device is back online. Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else if (attempts >= 60) { // ~5 minutes
        clearPolling();
        setRebooting(false);
        setProgressMessage('');
        setError('Device did not come back online. Please verify manually.');
      }
    }, 5000);
  };

  const initiateReboot = async () => {
    setRebooting(true);
    setProgressMessage('Update uploaded. Initiating reboot...');
    try {
      await postLinuxCmd({ cmd: 'reboot' });
    } catch (err) {
      console.warn('Reboot command failed (continuing to poll):', err?.message || err);
    }
    rebootDelayRef.current = setTimeout(() => {
      beginOnlinePolling();
    }, 5000);
  };

  const handleUpdate = async () => {
    setError('');
    setSuccess('');

    if (!selectedFile) {
      setError('Please select a .tar update package to upload.');
      return;
    }
    if (!/\.tar$/i.test(selectedFile.name)) {
      setError('Only .tar update packages are supported.');
      return;
    }

    try {
      setUploading(true);
      setProgressMessage('Uploading update package...');
      const response = await uploadSoftwareUpdate(selectedFile);
      if (!response?.response) {
        throw new Error(response?.message || 'Failed to upload update package.');
      }
      setSuccess(response?.message || 'Update package uploaded successfully.');
      setUploading(false);
      
      // Wait 4-5 seconds before rebooting, show loading during wait
      setRebooting(true);
      setProgressMessage('Update uploaded successfully. Preparing to reboot in a few seconds...');
      
      await new Promise(resolve => setTimeout(resolve, 4500)); // 4.5 seconds wait
      
      await initiateReboot();
    } catch (err) {
      console.error('Update upload failed:', err);
      setUploading(false);
      setProgressMessage('');
      const message = typeof err === 'string'
        ? err
        : err?.message || err?.error || err?.response?.message || 'Failed to upload update package.';
      setError(message);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-200px)] bg-gray-50 flex flex-col items-center py-10 px-2 relative">
      {(uploading || rebooting) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-xl px-10 py-6 flex flex-col items-center gap-4 max-w-sm text-center">
            <CircularProgress />
            <div className="text-gray-700 text-sm whitespace-pre-line">
              {progressMessage || (rebooting ? 'Device is rebooting. Please wait...' : 'Uploading update package...')}
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-xl flex flex-col items-center gap-6">
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ width: '100%' }}>
            {success}
          </Alert>
        )}
        {/* Version Table */}
        <div className="w-full border border-gray-400 bg-white rounded-md overflow-x-auto">
          <div className="w-full text-[18px] font-semibold text-gray-700 py-2 border-b border-gray-300 bg-[#f6fafd] flex items-center justify-center relative">
            <span>{UPGRADE_LABELS.currentVersion}</span>
            {versionLoading && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2">
                <CircularProgress size={18} />
              </span>
            )}
          </div>
          <table className="w-full border-collapse text-center">
            <tbody>
              {versionRows.map(row => (
                <tr key={row.key} className="border-b border-gray-300">
                  <td className="px-3 py-1 text-[16px] text-gray-700 text-center border-r border-gray-300 min-w-[140px]">{row.label}</td>
                  <td className="px-3 py-1 text-[15px] text-left break-all text-gray-800">
                    <div className={row.key === 'SERIAL' ? 'text-gray-800' : 'text-blue-700'}>
                      {row.version || 'Unavailable'}
                    </div>
                    {row.timestamp && (
                      <div className="text-xs text-gray-500 mt-1">
                        Last updated: {row.timestamp}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* File Input Row */}
        <div className="w-full flex flex-col md:flex-row md:items-center gap-2 border border-gray-400 rounded bg-white px-2 py-3">
          <label className="text-[16px] text-gray-700 min-w-[160px]">{UPGRADE_LABELS.selectFile}</label>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading || rebooting}
          />
          <Button
            variant="outlined"
            component="span"
            sx={{
              background: '#f5f5f5',
              border: '1px solid #b0b0b0',
              color: '#333',
              fontWeight: 500,
              fontSize: '15px',
              textTransform: 'none',
              minWidth: '120px',
              mr: 1,
            }}
            onClick={() => !uploading && !rebooting && fileInputRef.current?.click()}
            disabled={uploading || rebooting}
          >
            {UPGRADE_LABELS.chooseFile}
          </Button>
          <span className="text-gray-600 text-[15px] whitespace-nowrap">{fileName}</span>
        </div>
        {/* Buttons Row */}
        <div className="w-full flex flex-row justify-center gap-12 mt-2">
          <Button
            variant="contained"
            sx={blueButtonSx}
            onClick={handleUpdate}
            disabled={uploading || rebooting}
          >
            {uploading ? 'Uploading...' : rebooting ? 'Rebooting...' : UPGRADE_BUTTONS.update}
          </Button>
          <Button
            variant="contained"
            sx={grayButtonSx}
            onClick={handleReset}
            disabled={uploading || rebooting}
          >
            {UPGRADE_BUTTONS.reset}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Upgrade; 