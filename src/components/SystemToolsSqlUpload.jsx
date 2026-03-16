import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadSqlPatch } from '../api/apiService';

const SystemToolsSqlUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [fileName, setFileName] = useState('No file chosen');

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
    setMessage(null);
    setFileName(f ? f.name : 'No file chosen');
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please choose a .sql file.' });
      return;
    }
    if (!file.name.toLowerCase().endsWith('.sql')) {
      setMessage({ type: 'error', text: 'Only .sql files are allowed.' });
      return;
    }
    setIsUploading(true);
    setMessage(null);
    try {
      const res = await uploadSqlPatch(file);
      if (res?.success) {
        setMessage({ type: 'success', text: res.message || 'Database restored successfully' });
        setFile(null);
      } else {
        setMessage({ type: 'error', text: res?.message || 'Upload failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{ backgroundColor: '#dde0e4' }}>
      <div className="w-full mx-auto" style={{ maxWidth: 900 }}>
        <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0" style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>SQL Upload</div>

        <div style={{ border: '2px solid #bbb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', background: '#f8fafd' }} className="w-full flex flex-col items-center py-10">
          <div className="flex flex-col items-center gap-4" style={{ width: '100%', maxWidth: 520 }}>
            <div className="flex items-center gap-4">
              <label
                htmlFor="sql-file-input"
                className="cursor-pointer select-none"
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  border: '1px solid #c7c9cf',
                  borderRadius: 6,
                  boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.06)',
                  color: '#111827',
                  fontWeight: 600,
                  transition: 'all .15s ease-in-out'
                }}
                onMouseOver={(e)=>{ e.currentTarget.style.background='#e5e7eb'; e.currentTarget.style.borderColor='#b6bac3'; }}
                onMouseOut={(e)=>{ e.currentTarget.style.background='#f3f4f6'; e.currentTarget.style.borderColor='#c7c9cf'; }}
              >
                Choose File
              </label>
              <input id="sql-file-input" type="file" accept=".sql" onChange={handleFileChange} style={{ display: 'none' }} />
              <span style={{ color: '#374151' }}>{fileName}</span>
              <Button
              variant="contained"
              startIcon={isUploading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
              onClick={handleUpload}
              disabled={isUploading}
              sx={{
                background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                color: '#fff',
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 160,
              }}
              >
                {isUploading ? 'Uploading...' : 'Upload SQL'}
              </Button>
            </div>
            {message && (
              <div className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{message.text}</div>
            )}
            <div className="text-xs text-gray-600 mt-2">Upload a verified .sql update file. Only use files from trusted sources.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemToolsSqlUpload;


