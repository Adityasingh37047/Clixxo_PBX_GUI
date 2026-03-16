import React, { useState, useRef } from 'react';
import {
  SIP_ACCOUNT_FIELDS,
  SIP_ACCOUNT_NOTE,
  SIP_ACCOUNT_UPLOAD,
  SIP_ACCOUNT_DOWNLOAD,
  SIP_ACCOUNT_SAVE_BUTTON
} from '../constants/SIPAccountGeneratorConstants';
import Button from '@mui/material/Button';

const SIPAccountGenerator = () => {
  const [form, setForm] = useState({
    sipTrunkNo: '0',
    registrationPeriod: '1800',
    registrationAddress: '',
    description: 'default',
  });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(SIP_ACCOUNT_UPLOAD.noFile);
  const fileInputRef = useRef();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setFileName(f ? f.name : SIP_ACCOUNT_UPLOAD.noFile);
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Save logic here
  };

  const handleUpload = () => {
    // Upload logic here
  };

  const handleDownload = () => {
    // Download logic here
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col items-center py-6 px-2">
      <form
        onSubmit={handleSave}
        className="w-full max-w-5xl bg-transparent flex flex-col items-center"
        autoComplete="off"
      >
        <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-between gap-x-8 gap-y-3 mb-0 px-2 md:px-0">
          {/* SIP Trunk No. */}
          <div className="flex flex-col md:flex-row md:items-center min-w-[220px] md:gap-2">
            <label htmlFor="sipTrunkNo" className="text-[18px] text-gray-700 whitespace-nowrap mb-1 md:mb-0">SIP Trunk No.</label>
            <input
              id="sipTrunkNo"
              name="sipTrunkNo"
              type="text"
              value={form.sipTrunkNo}
              onChange={handleInputChange}
              placeholder="0"
              className="border border-gray-400 rounded-sm px-2 py-1 w-full max-w-[130px] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          {/* Registration Validity Period(s): on two lines, left-aligned, small font */}
          <div className="flex flex-col md:flex-row md:items-end min-w-[180px] md:gap-2">
            <label htmlFor="registrationPeriod" className="text-[15px] text-gray-700 leading-tight mb-1 md:mb-0">
              <span className="block">Registration Validity</span>
              <span className="block">Period(s):</span>
            </label>
            <input
              id="registrationPeriod"
              name="registrationPeriod"
              type="text"
              value={form.registrationPeriod}
              onChange={handleInputChange}
              placeholder="1800"
              className="border border-gray-400 rounded-sm px-2 py-1 w-full max-w-[130px] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 md:ml-2"
            />
          </div>
          {/* Registration Address: on two lines, wider input */}
          <div className="flex flex-col md:flex-row md:items-end min-w-[240px] md:gap-2">
            <label htmlFor="registrationAddress" className="text-[15px] text-gray-700 leading-tight mb-1 md:mb-0">
              <span className="block">Registration</span>
              <span className="block">Address:</span>
            </label>
            <input
              id="registrationAddress"
              name="registrationAddress"
              type="text"
              value={form.registrationAddress}
              onChange={handleInputChange}
              className="border border-gray-400 rounded-sm px-2 py-1 w-full max-w-[260px] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 md:ml-2"
            />
          </div>
          {/* Description: */}
          <div className="flex flex-col md:flex-row md:items-center min-w-[220px] md:gap-2">
            <label htmlFor="description" className="text-[18px] text-gray-700 whitespace-nowrap mb-1 md:mb-0">Description:</label>
            <input
              id="description"
              name="description"
              type="text"
              value={form.description}
              onChange={handleInputChange}
              placeholder="default"
              className="border border-gray-400 rounded-sm px-2 py-1 w-full max-w-[130px] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          {/* Save Button */}
          <div className="flex items-center justify-end min-w-[110px] mt-2 md:mt-0">
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: 'linear-gradient(180deg, #5db6e8 0%, #298fcf 100%)',
                color: '#fff',
                boxShadow: '0 2px 4px 0 rgba(0,0,0,0.10)',
                borderRadius: '4px',
                minWidth: '90px',
                fontWeight: 500,
                fontSize: '16px',
                textTransform: 'none',
                '&:hover': { background: 'linear-gradient(180deg, #298fcf 0%, #5db6e8 100%)' },
              }}
            >
              {SIP_ACCOUNT_SAVE_BUTTON}
            </Button>
          </div>
        </div>
        <div className="w-full text-center mt-[-8px] mb-2">
          <span className="text-[15px] text-red-600 font-medium">{SIP_ACCOUNT_NOTE}</span>
        </div>
        {/* Upload Section */}
        <div className="w-full max-w-5xl border border-gray-400 rounded-md bg-white mb-6">
          <div className="w-full h-9 bg-gradient-to-b from-[#d0ecff] via-[#7ecbfa] to-[#3b8fd6] rounded-t-lg flex items-center justify-center font-semibold text-lg text-gray-800 shadow mb-0">
            {SIP_ACCOUNT_UPLOAD.title}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between px-4 py-6 gap-4">
            <div className="flex-1 text-gray-700 text-[16px] text-left mb-2 md:mb-0">
              <div>{SIP_ACCOUNT_UPLOAD.instruction}</div>
              <div>{SIP_ACCOUNT_UPLOAD.prompt}</div>
            </div>
            <div className="flex items-center gap-2 flex-1 md:justify-center">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
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
                onClick={() => fileInputRef.current.click()}
              >
                {SIP_ACCOUNT_UPLOAD.chooseFile}
              </Button>
              <span className="text-gray-600 text-[15px] whitespace-nowrap">{fileName}</span>
            </div>
            <div className="flex-1 flex md:justify-end w-full md:w-auto mt-4 md:mt-0">
              <Button
                variant="contained"
                sx={{
                  background: 'linear-gradient(180deg, #5db6e8 0%, #298fcf 100%)',
                  color: '#fff',
                  borderRadius: '4px',
                  minWidth: '90px',
                  fontWeight: 500,
                  fontSize: '16px',
                  textTransform: 'none',
                  '&:hover': { background: 'linear-gradient(180deg, #298fcf 0%, #5db6e8 100%)' },
                }}
                onClick={handleUpload}
              >
                {SIP_ACCOUNT_UPLOAD.button}
              </Button>
            </div>
          </div>
        </div>
        {/* Download Section */}
        <div className="w-full max-w-5xl border border-gray-400 rounded-md bg-white mb-6">
          <div className="w-full h-9 bg-gradient-to-b from-[#d0ecff] via-[#7ecbfa] to-[#3b8fd6] rounded-t-lg flex items-center justify-center font-semibold text-lg text-gray-800 shadow mb-0">
            {SIP_ACCOUNT_DOWNLOAD.title}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between px-4 py-6 gap-4">
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
              <span className="text-gray-700 text-[16px]">{SIP_ACCOUNT_DOWNLOAD.fileLabel}</span>
              <span className="text-red-600 text-[16px] font-medium">{SIP_ACCOUNT_DOWNLOAD.fileName}</span>
            </div>
            <div className="flex-1 text-gray-700 text-[16px] text-left md:text-center">
              {SIP_ACCOUNT_DOWNLOAD.instruction}
            </div>
            <div className="flex-1 flex md:justify-end w-full md:w-auto mt-4 md:mt-0">
              <Button
                variant="contained"
                sx={{
                  background: 'linear-gradient(180deg, #5db6e8 0%, #298fcf 100%)',
                  color: '#fff',
                  borderRadius: '4px',
                  minWidth: '110px',
                  fontWeight: 500,
                  fontSize: '16px',
                  textTransform: 'none',
                  '&:hover': { background: 'linear-gradient(180deg, #298fcf 0%, #5db6e8 100%)' },
                }}
                onClick={handleDownload}
              >
                {SIP_ACCOUNT_DOWNLOAD.button}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SIPAccountGenerator; 