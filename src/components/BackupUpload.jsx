import React, { useState, useRef } from 'react';
import { BU_TITLES, BU_LABELS, BU_BUTTONS } from '../constants/BackupUploadConstants';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { downloadBackup, restoreBackup } from '../api/apiService';

const blueBar = (title) => (
  <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
    style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
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

const chooseFileButtonSx = {
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

const BackupUpload = () => {
  // No per-file selection – API backs up entire server
  const [fileName, setFileName] = useState(BU_LABELS.noFile);
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);

  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Message handling - auto dismiss after 5 seconds
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setSelectedFile(f || null);
    setFileName(f ? f.name : BU_LABELS.noFile);
  };

  const handleDownloadBackup = async () => {
    try {
      setLoadingBackup(true);
      setMessage({ type: '', text: '' });
      const { blob, fileName } = await downloadBackup();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'backup.tar');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showMessage('success', 'Backup downloaded successfully');
    } catch (e) {
      showMessage('error', e.message || 'Backup download failed');
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleRestoreUpload = async () => {
    try {
      setMessage({ type: '', text: '' });
      if (!selectedFile) throw new Error('Please select a .tar backup file');
      if (!/\.tar$/i.test(selectedFile.name)) throw new Error('Only .tar files are supported');
      setLoadingRestore(true);
      const res = await restoreBackup(selectedFile);
      if (res?.response) {
        showMessage('success', 'Restore completed. Please restart the system to apply changes.');
      } else {
        throw new Error(res?.message || 'Restore failed');
      }
    } catch (e) {
      showMessage('error', e.message || 'Restore failed');
    } finally {
      setLoadingRestore(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col items-center py-6 px-4 gap-6" style={{backgroundColor: '#dde0e4'}}>
      {/* Message Display - Fixed position like SipRegisterPage */}
      {message.text && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage({ type: '', text: '' })}
          sx={{
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3
          }}
        >
          {message.text}
        </Alert>
      )}

      {/* Data Backup Section */}
      <div className="w-full max-w-5xl mb-4">
        {blueBar(BU_TITLES.backup)}
        <div className="w-full border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{backgroundColor: "#dde0e4"}}>
          <div className="w-full flex flex-col overflow-hidden">
            <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1 text-[15px] text-gray-700">
            {BU_LABELS.backupInstruction}
          </div>
          <Button
            variant="contained"
            sx={buttonSx}
            onClick={handleDownloadBackup}
            disabled={loadingBackup || loadingRestore}
            startIcon={loadingBackup ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {loadingBackup ? 'Backing up...' : BU_BUTTONS.backup}
          </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Restore Backup Section */}
      <div className="w-full max-w-5xl">
        {blueBar(BU_TITLES.upload)}
        <div className="w-full border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{backgroundColor: "#dde0e4"}}>
          <div className="w-full flex flex-col overflow-hidden">
            <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1 text-[15px] text-gray-700">
            {BU_LABELS.uploadInstruction}
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".tar"
                onChange={handleFileChange}
                className="hidden"
                id="backup-file-input"
                disabled={loadingBackup || loadingRestore}
              />
              <Button
                variant="contained"
                sx={chooseFileButtonSx}
                onClick={() => fileInputRef.current?.click()}
                disabled={loadingBackup || loadingRestore}
              >
                {BU_LABELS.chooseFile}
              </Button>
              <span className="text-[15px] text-gray-700">{fileName}</span>
            </div>
            <Button
              variant="contained"
              sx={buttonSx}
              onClick={handleRestoreUpload}
              disabled={loadingBackup || loadingRestore}
              startIcon={loadingRestore ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {loadingRestore ? 'Restoring...' : BU_BUTTONS.upload}
            </Button>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupUpload; 
 