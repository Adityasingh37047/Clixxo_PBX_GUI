import React, { useState, useEffect } from 'react';
import { DHCP_SERVER_SETTINGS_FIELDS, DHCP_SERVER_SETTINGS_INITIAL_FORM } from '../constants/DhcpServerSettingsConstants';
import { fetchDhcpSettings, fetchSaveDhcpSettings, fetchResetDhcpSettings } from '../api/apiService';
import { Checkbox, TextField, Button, Alert, CircularProgress } from '@mui/material';

const grayButtonSx = {
  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
  color: '#444',
  fontWeight: 600,
  fontSize: 15,
  borderRadius: 1.5,
  minWidth: 110,
  boxShadow: '0 1px 2px rgba(0,0,0,0.10)',
  textTransform: 'none',
  px: 2.25,
  py: 1,
  padding: '4px 18px',
  border: '1px solid #bbb',
  '&:hover': {
    background: 'linear-gradient(to bottom, #bfc6d1 0%, #e3e7ef 100%)',
    color: '#444',
  },
};
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

const DhcpServerSettings = () => {
  const [form, setForm] = useState(DHCP_SERVER_SETTINGS_INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch DHCP settings on component mount
  useEffect(() => {
    fetchDhcpData();
  }, []);

  const fetchDhcpData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchDhcpSettings();
      
      // Map the server data to our form structure
      if (response && response.success && response.data && Array.isArray(response.data)) {
        const mappedData = {};
        
        response.data.forEach((lanData, index) => {
          const lanNumber = index + 1;
          mappedData[`enabled${lanNumber}`] = lanData.enabled || false;
          mappedData[`ipRange${lanNumber}`] = lanData.ipRange || '';
          mappedData[`subnetMask${lanNumber}`] = lanData.subnetMask || '';
          mappedData[`defaultGateway${lanNumber}`] = lanData.defaultGateway || '';
          mappedData[`dnsServer${lanNumber}`] = lanData.dnsServer || '';
        });
        
        setForm(prevForm => ({
          ...prevForm,
          ...mappedData
        }));
      } else {
        throw new Error(response?.message || 'Failed to load DHCP settings');
      }
    } catch (error) {
      console.error('Error fetching DHCP settings:', error);
      
      // Handle different types of errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setError('Request timeout. Please check your connection and try again.');
      } else if (error.response?.status === 404) {
        setError('DHCP configuration not found. Please contact administrator.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later or contact support.');
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        setError('Network connection failed. Please check your internet connection.');
      } else {
        setError(error.message || 'Failed to load DHCP settings. Please refresh the page and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleReset = async () => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      
      const response = await fetchResetDhcpSettings();
      
      if (response && response.success) {
        setSuccess('DHCP settings reset successfully!');
        // Optionally refresh the data after successful reset
        await fetchDhcpData();
      } else {
        throw new Error(response?.message || 'Failed to reset DHCP settings');
      }
    } catch (error) {
      console.error('Error resetting DHCP settings:', error);
      
      let errorMessage = 'Failed to reset DHCP settings.';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Reset operation timed out. Please check your connection and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error during reset. Please try again later or contact support.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed during reset. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      
      // Send the form data to the server
      const response = await fetchSaveDhcpSettings(form);
      
      if (response && response.success) {
        setSuccess('DHCP settings saved successfully!');
        // Optionally refresh the data after successful save
        // await fetchDhcpData();
      } else {
        throw new Error(response?.message || 'Failed to save DHCP settings');
      }
    } catch (error) {
      console.error('Error saving DHCP settings:', error);
      
      let errorMessage = 'Failed to save DHCP settings.';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Save operation timed out. Please check your connection and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid DHCP configuration. Please check your settings and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error during save. Please try again later or contact support.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed during save. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{backgroundColor: "#dde0e4"}}>
      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
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

      {/* Success Display */}
      {success && (
        <Alert 
          severity="success" 
          onClose={() => setSuccess(null)}
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

      <div className="w-full max-w-6xl mx-auto">
        {/* Blue header bar */}
        <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
          DHCP Server
        </div>
        
        <div className="w-full max-w-6xl mx-auto border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{backgroundColor: "#dde0e4"}}>
          <div className="w-full flex flex-col overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleSave} className="space-y-10">
                {DHCP_SERVER_SETTINGS_FIELDS.map((lanGroup, lanIndex) => (
                  <div key={lanGroup.lan} className="space-y-4">
                    <h3 className="text-lg text-gray-600 font-medium mb-4">
                      {lanGroup.lan}
                    </h3>
                    
                    {/* DHCP Server Enable Row */}
                    <div className="flex items-center justify-center" style={{ minHeight: 32 }}>
                      <div className="flex items-center" style={{width: '460px'}}>
                        <label className="text-[14px] text-gray-600 font-medium whitespace-nowrap text-left" style={{width:160, marginRight:40}}>
                          DHCP Server:
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name={lanGroup.fields[0].name}
                            checked={form[lanGroup.fields[0].name] || false}
                            onChange={handleChange}
                            className="w-4 h-4 mr-2 accent-blue-600"
                          />
                          <span className="text-[14px] text-gray-600 ml-1">Enable</span>
                        </div>
                      </div>
                    </div>

                    {/* Other fields */}
                    {lanGroup.fields.slice(1).map((field) => (
                      <div key={field.name} className="flex items-center justify-center" style={{ minHeight: 32 }}>
                        <div className="flex items-center" style={{width: '460px'}}>
                          <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:160, marginRight:40}}>
                            {field.label}:
                          </label>
                          <div style={{width: 300}}>
                            <TextField
                              name={field.name}
                              value={form[field.name] || ''}
                              onChange={handleChange}
                              variant="outlined"
                              size="small"
                              fullWidth
                              disabled={!form[lanGroup.fields[0].name]} // Disable if DHCP not enabled
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: '#fff',
                                  height: '32px',
                                  '& fieldset': {
                                    borderColor: '#bbb',
                                    borderWidth: '1px',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: '#999',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#666',
                                  },
                                  '&.Mui-disabled': {
                                    backgroundColor: '#f9fafb',
                                    '& fieldset': {
                                      borderColor: '#e5e7eb',
                                    },
                                  },
                                },
                                '& .MuiInputBase-input': {
                                  fontSize: '14px',
                                  padding: '6px 8px',
                                  height: '20px',
                                },
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </form>
            </div>
          </div>
        </div>
        
        {/* Action Buttons - Outside the border */}
        <div className="flex justify-center gap-4 pt-6">
          <Button
            type="submit"
            variant="contained"
            onClick={handleSave}
            sx={{
              background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                color: '#fff',
              },
              '&:disabled': {
                background: '#f5f5f5',
                color: '#666',
              },
            }}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleReset}
            sx={{
              background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
              color: '#374151',
              fontWeight: 600,
              fontSize: '16px',
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
                color: '#374151',
              },
              '&:disabled': {
                background: '#f5f5f5',
                color: '#666',
              },
            }}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DhcpServerSettings; 