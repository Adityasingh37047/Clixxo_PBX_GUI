import React, { useState, useRef } from 'react';
import { CUE_TONE_FILE_TYPES, CUE_TONE_INITIAL_FORM } from './constants/CueToneConstants';
import { Button, Select, MenuItem, FormControl } from '@mui/material';

const CueTonePage = () => {
  const [formData, setFormData] = useState(CUE_TONE_INITIAL_FORM);
  const [fileName, setFileName] = useState('No file chosen');
  const fileInputRef = useRef(null);

  const handleFileTypeChange = (e) => {
    setFormData(prev => ({ ...prev, fileType: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFormData(prev => ({ ...prev, file }));
    } else {
      setFileName('No file chosen');
      setFormData(prev => ({ ...prev, file: null }));
    }
  };

  const checkFileExt = (ext) => {
    if (!ext.match(/.wav/i)) {
      return false;
    }
    return true;
  };

  const handleUpload = () => {
    // Validate file extension
    if (!formData.file) {
      alert('Please select a file to upload!');
      return;
    }

    const fileExt = formData.file.name.substring(formData.file.name.lastIndexOf('.')).toLowerCase();
    if (!checkFileExt(fileExt)) {
      alert('Only wav files can be uploaded!');
      return;
    }

    // Validate file size (less than 200KB)
    if (formData.file.size > 200 * 1024) {
      alert('File size must be less than 200KB!');
      return;
    }

    // Here you would typically send the file to the server
    alert('File uploaded successfully!');
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-128px)] py-2 px-2 sm:px-4" style={{backgroundColor: "#dde0e4"}}>
      <div className="w-full" style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Blue header bar */}
        <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-600 shadow mb-0">
          Upload
        </div>
        
        <div className="bg-white border-2 border-gray-400 border-t-0 shadow-sm p-4">
          <div className="w-full">
            {/* Upload row */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div className="text-[14px] text-gray-700 font-medium whitespace-nowrap" style={{ minWidth: '180px' }}>
                Upload a file of cue tone
              </div>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={formData.fileType}
                  onChange={handleFileTypeChange}
                  variant="outlined"
                  sx={{
                    fontSize: 14,
                    height: 28,
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#999' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                    '& .MuiSelect-select': { padding: '4px 8px' }
                  }}
                >
                  {CUE_TONE_FILE_TYPES.map(opt => (
                    <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 14 }}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div className="flex items-center gap-2 flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".wav"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="cue-tone-file-input"
                />
                <Button
                  variant="outlined"
                  component="span"
                  sx={{
                    background: '#f5f5f5',
                    border: '1px solid #b0b0b0',
                    color: '#333',
                    fontWeight: 500,
                    fontSize: '14px',
                    textTransform: 'none',
                    minWidth: '100px',
                    height: '28px',
                    '&:hover': {
                      background: '#e5e5e5',
                      borderColor: '#999',
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose file
                </Button>
                <span className="text-[14px] text-gray-600">{fileName}</span>
              </div>
              <Button
                variant="contained"
                sx={{
                  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px',
                  borderRadius: 1.5,
                  minWidth: 100,
                  height: 28,
                  px: 3,
                  py: 0.5,
                  boxShadow: '0 2px 8px #b3e0ff',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                    color: '#fff',
                  },
                }}
                onClick={handleUpload}
              >
                Upload
              </Button>
            </div>
            {/* Note text */}
            <div className="text-[14px] text-gray-700 mt-2">
              Note: The file should be a wav file with 8000Hz sampling rate, 16-bit mono, A-law formatted, and less than 200KB in size.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CueTonePage;

