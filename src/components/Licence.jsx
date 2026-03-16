import React, { useState, useEffect } from 'react';
import { 
  Button, 
  TextField, 
  Paper, 
  Typography, 
  Box, 
  Alert, 
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Fingerprint as FingerprintIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { 
  getLicenseInfo, 
  checkLicenseValidity, 
  getSystemFingerprint, 
  uploadLicenseFile 
} from '../api/apiService';
import {
  LICENSE_STATUS,
  LICENSE_STATUS_DISPLAY,
  LICENSE_FORM_LABELS,
  LICENSE_BUTTON_LABELS,
  LICENSE_ERROR_MESSAGES,
  LICENSE_SUCCESS_MESSAGES
} from '../constants/LicenceConstants';

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

const Licence = () => {
  const [licenseData, setLicenseData] = useState({
    Serial_Number: '',
    activateDate: '',
    expireDate: '',
    status: LICENSE_STATUS.UNKNOWN
  });
  
  const [systemFingerprint, setSystemFingerprint] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState({
    info: false,
    validity: false,
    fingerprint: false,
    upload: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch license info and check validity on component mount
  useEffect(() => {
    const loadLicenseData = async () => {
      // Execute both API calls in parallel using Promise.allSettled
      const [infoResult, validityResult] = await Promise.allSettled([
        fetchLicenseInfo(),
        checkValidity()
      ]);

      // Handle results (individual error handling is already in each function)
      if (infoResult.status === 'rejected') {
        console.warn('License info API call failed:', infoResult.reason);
      }
      if (validityResult.status === 'rejected') {
        console.warn('License validity check API call failed:', validityResult.reason);
      }
    };

    loadLicenseData();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const fetchLicenseInfo = async () => {
    setLoading(prev => ({ ...prev, info: true }));
    try {
      const response = await getLicenseInfo();
      if (response.response && response.responseData) {
        try {
          const parsedData = JSON.parse(response.responseData);
          setLicenseData({
            Serial_Number: parsedData.license_key || parsedData.Serial_Number || '',
            activateDate: parsedData.activate_date || '',
            expireDate: parsedData.expire_date || '',
            status: LICENSE_STATUS.UNKNOWN
          });
          showMessage('success', LICENSE_SUCCESS_MESSAGES.INFO_FETCHED);
        } catch (parseError) {
          console.error('Error parsing license data:', parseError);
          showMessage('error', 'Invalid license data format');
        }
      }
    } catch (error) {
      console.error('Error fetching license info:', error);
      showMessage('error', LICENSE_ERROR_MESSAGES.FETCH_INFO_FAILED);
    } finally {
      setLoading(prev => ({ ...prev, info: false }));
    }
  };

  const checkValidity = async () => {
    setLoading(prev => ({ ...prev, validity: true }));
    try {
      const response = await checkLicenseValidity();
      if (response.response && response.responseData) {
        const status = response.responseData;
        setLicenseData(prev => ({ ...prev, status }));
        showMessage('success', LICENSE_SUCCESS_MESSAGES.VALIDITY_CHECKED);
      }
    } catch (error) {
      console.error('Error checking license validity:', error);
      showMessage('error', LICENSE_ERROR_MESSAGES.CHECK_VALIDITY_FAILED);
    } finally {
      setLoading(prev => ({ ...prev, validity: false }));
    }
  };

  const fetchSystemFingerprint = async () => {
    setLoading(prev => ({ ...prev, fingerprint: true }));
    try {
      const response = await getSystemFingerprint();
      if (response.response && response.responseData) {
        setSystemFingerprint(response.responseData);
        showMessage('success', LICENSE_SUCCESS_MESSAGES.FINGERPRINT_FETCHED);
      }
    } catch (error) {
      console.error('Error fetching system fingerprint:', error);
      showMessage('error', LICENSE_ERROR_MESSAGES.GET_FINGERPRINT_FAILED);
    } finally {
      setLoading(prev => ({ ...prev, fingerprint: false }));
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage({ type: '', text: '' });
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      showMessage('error', LICENSE_ERROR_MESSAGES.INVALID_FILE);
      return;
    }

    setLoading(prev => ({ ...prev, upload: true }));
    try {
      const response = await uploadLicenseFile(selectedFile);
      if (response.response) {
        showMessage('success', LICENSE_SUCCESS_MESSAGES.FILE_UPLOADED);
        setSelectedFile(null);
        // Refresh license info after upload
        setTimeout(() => fetchLicenseInfo(), 1000);
      }
    } catch (error) {
      console.error('Error uploading license file:', error);
      showMessage('error', LICENSE_ERROR_MESSAGES.UPLOAD_FAILED);
    } finally {
      setLoading(prev => ({ ...prev, upload: false }));
    }
  };

  const getStatusDisplay = (status) => {
    const statusInfo = LICENSE_STATUS_DISPLAY[status] || LICENSE_STATUS_DISPLAY[LICENSE_STATUS.UNKNOWN];
    return (
      <Chip
        label={statusInfo.label}
        color={statusInfo.color}
        size="small"
        className={`${statusInfo.bgColor} ${statusInfo.textColor}`}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Header */}
        <div style={{
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
        }}>
          License Management
        </div>

        {/* Content */}
        <Paper elevation={3} className="p-6 bg-white rounded-b-lg shadow-lg" style={{ borderTop: 'none' }}>
          
          {/* Alert Messages */}
          {message.text && (
            <Alert 
              severity={message.type} 
              className="mb-4"
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          <div className="space-y-6">
            
            {/* License Information Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h6" className="text-gray-800 font-semibold flex items-center">
                  <InfoIcon className="mr-2" />
                  License Information
                </Typography>
                <Button
                  variant="contained"
                  startIcon={loading.info ? <CircularProgress size={16} /> : <RefreshIcon />}
                  onClick={fetchLicenseInfo}
                  disabled={loading.info}
                  sx={blueButtonSx}
                >
                  {LICENSE_BUTTON_LABELS.REFRESH_INFO}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {LICENSE_FORM_LABELS.Serial_Number}
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={licenseData.Serial_Number}
                    InputProps={{ readOnly: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '14px',
                        backgroundColor: '#f9fafb',
                        '& fieldset': { borderColor: '#d1d5db' }
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {LICENSE_FORM_LABELS.STATUS}
                  </label>
                  <div className="flex items-center space-x-2">
                    {getStatusDisplay(licenseData.status)}
                    <Button
                      variant="contained"
                      startIcon={loading.validity ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                      onClick={checkValidity}
                      disabled={loading.validity}
                      sx={blueButtonSx}
                    >
                      {LICENSE_BUTTON_LABELS.CHECK_VALIDITY}
                    </Button>
                  </div>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {LICENSE_FORM_LABELS.ACTIVATE_DATE}
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={formatDate(licenseData.activateDate)}
                    InputProps={{ readOnly: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '14px',
                        backgroundColor: '#f9fafb',
                        '& fieldset': { borderColor: '#d1d5db' }
                      }
                    }}
                  />
                </div> */}

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {LICENSE_FORM_LABELS.EXPIRE_DATE}
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={formatDate(licenseData.expireDate)}
                    InputProps={{ readOnly: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '14px',
                        backgroundColor: '#f9fafb',
                        '& fieldset': { borderColor: '#d1d5db' }
                      }
                    }}
                  />
                </div> */}
              </div>
            </div>

            <Divider />

            {/* System ID Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h6" className="text-gray-800 font-semibold">
                  {LICENSE_FORM_LABELS.SYSTEM_FINGERPRINT}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={loading.fingerprint ? <CircularProgress size={16} /> : <InfoIcon />}
                  onClick={fetchSystemFingerprint}
                  disabled={loading.fingerprint}
                  sx={blueButtonSx}
                >
                  {LICENSE_BUTTON_LABELS.GET_FINGERPRINT}
                </Button>
              </div>
              
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={systemFingerprint}
                InputProps={{ readOnly: true }}
                multiline
                rows={2}
                placeholder="Click 'Get System ID' to retrieve system ID"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '14px',
                    backgroundColor: '#f9fafb',
                    fontFamily: 'monospace',
                    '& fieldset': { borderColor: '#d1d5db' }
                  }
                }}
              />
            </div>

            <Divider />

            {/* License File Upload Section */}
            <div>
              <Typography variant="h6" className="mb-4 text-gray-800 font-semibold flex items-center">
                <FileUploadIcon className="mr-2" />
                Upload License File
              </Typography>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    accept=".lic,.txt,.key"
                    style={{ display: 'none' }}
                    id="license-file-input"
                    type="file"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="license-file-input">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<UploadIcon />}
                      sx={blueButtonSx}
                    >
                      Select File
                    </Button>
                  </label>
                  
                  {selectedFile && (
                    <div className="flex items-center space-x-2">
                      <Typography variant="body2" className="text-gray-600">
                        Selected: {selectedFile.name}
                      </Typography>
                      <Chip 
                        label={`${(selectedFile.size / 1024).toFixed(1)} KB`} 
                        size="small" 
                        variant="outlined" 
                      />
                    </div>
                  )}
                </div>

                {selectedFile && (
                  <Button
                    variant="contained"
                    startIcon={loading.upload ? <CircularProgress size={16} /> : <UploadIcon />}
                    onClick={handleFileUpload}
                    disabled={loading.upload}
                    sx={blueButtonSx}
                  >
                    {loading.upload ? 'Uploading...' : LICENSE_BUTTON_LABELS.UPLOAD_LICENSE}
                  </Button>
                )}
              </div>
            </div>

            {/* Current License Status Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <Typography variant="h6" className="mb-3 text-gray-800 font-semibold">
                Current License Summary
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Status:</span>
                  {getStatusDisplay(licenseData.status)}
                </div>
                {/* <div>
                  <span className="text-gray-600">Activated:</span>
                  <span className="ml-2 font-medium">{formatDate(licenseData.activateDate)}</span>
                </div> */}
                {/* <div>
                  <span className="text-gray-600">Expires:</span>
                  <span className="ml-2 font-medium">{formatDate(licenseData.expireDate)}</span>
                </div> */}
              </div>
            </div>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default Licence;