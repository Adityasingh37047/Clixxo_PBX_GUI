import React, { useState } from 'react';
import { FAX_MODE_OPTIONS, FAX_FORM_INITIAL, T38_FIELDS } from '../constants/FaxFaxConstants';
import { Select, MenuItem, Button, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';
import { postLinuxCmd } from '../api/apiService';

const FaxFaxPage = () => {
  const [form, setForm] = useState({ ...FAX_FORM_INITIAL });
  const [loading, setLoading] = useState({ save: false, stop: false, reset: false });

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => setForm({ ...FAX_FORM_INITIAL });

  const handleSave = async () => {
    console.log('Save button clicked', { form, faxMode: form.faxMode });
    
    if (form.faxMode !== 'T38') {
      window.alert('Please select T38 mode to save T.38 configurations');
      return;
    }

    console.log('Starting T.38 configuration save...');
    setLoading(prev => ({ ...prev, save: true }));
    try {
      // Modify /etc/asterisk/res_fax.conf - uncomment and set values
      // Handle maxrate: uncomment if commented, update if exists, add if missing
      console.log('Updating maxrate in res_fax.conf...');
      const maxrateResponse = await postLinuxCmd({ 
        cmd: `if grep -q "^[;#]*maxrate=" /etc/asterisk/res_fax.conf; then sed -i 's|^[;#]*maxrate=.*|maxrate=14400|' /etc/asterisk/res_fax.conf; else sed -i '/^\\[general\\]/a maxrate=14400' /etc/asterisk/res_fax.conf; fi` 
      });
      console.log('maxrate response:', maxrateResponse);

      // Handle minrate: add after maxrate if it exists, otherwise after [general]
      await postLinuxCmd({ 
        cmd: `if grep -q "^[;#]*minrate=" /etc/asterisk/res_fax.conf; then sed -i 's|^[;#]*minrate=.*|minrate=2400|' /etc/asterisk/res_fax.conf; elif grep -q "^maxrate=" /etc/asterisk/res_fax.conf; then sed -i '/^maxrate=/a minrate=2400' /etc/asterisk/res_fax.conf; else sed -i '/^\\[general\\]/a minrate=2400' /etc/asterisk/res_fax.conf; fi` 
      });

      // Handle modems: add after minrate if it exists, otherwise after [general]
      await postLinuxCmd({ 
        cmd: `if grep -q "^[;#]*modems=" /etc/asterisk/res_fax.conf; then sed -i 's|^[;#]*modems=.*|modems=v17,v27,v29|' /etc/asterisk/res_fax.conf; elif grep -q "^minrate=" /etc/asterisk/res_fax.conf; then sed -i '/^minrate=/a modems=v17,v27,v29' /etc/asterisk/res_fax.conf; else sed -i '/^\\[general\\]/a modems=v17,v27,v29' /etc/asterisk/res_fax.conf; fi` 
      });

      // Handle ecm: add after modems if it exists, otherwise after [general]
      await postLinuxCmd({ 
        cmd: `if grep -q "^[;#]*ecm=" /etc/asterisk/res_fax.conf; then sed -i 's|^[;#]*ecm=.*|ecm=no|' /etc/asterisk/res_fax.conf; elif grep -q "^modems=" /etc/asterisk/res_fax.conf; then sed -i '/^modems=/a ecm=no' /etc/asterisk/res_fax.conf; else sed -i '/^\\[general\\]/a ecm=no' /etc/asterisk/res_fax.conf; fi` 
      });

      // Modify /etc/asterisk/pjsip.conf - delete existing lines and write fresh ones
      // First, delete any existing t38pt_udptl and faxdetect lines (commented or not)
      console.log('Updating pjsip.conf - removing old T.38 settings...');
      await postLinuxCmd({ 
        cmd: `sed -i '/^[;#]*t38pt_udptl=/d' /etc/asterisk/pjsip.conf && sed -i '/^[;#]*faxdetect=/d' /etc/asterisk/pjsip.conf` 
      });

      // Now add fresh lines after [system] section
      console.log('Adding t38pt_udptl and faxdetect to pjsip.conf...');
      const t38ptResponse = await postLinuxCmd({ 
        cmd: `sed -i '/^\\[system\\]/a t38pt_udptl=yes' /etc/asterisk/pjsip.conf` 
      });
      console.log('t38pt_udptl response:', t38ptResponse);

      // Add faxdetect after t38pt_udptl
      await postLinuxCmd({ 
        cmd: `sed -i '/^t38pt_udptl=/a faxdetect=t38' /etc/asterisk/pjsip.conf` 
      });

      console.log('All T.38 configurations saved successfully!');
      window.alert('T.38 configurations saved successfully!');
    } catch (error) {
      console.error('Error saving T.38 configurations:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      window.alert('Error: ' + (error.message || 'Failed to save T.38 configurations'));
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleStopFax = async () => {
    setLoading(prev => ({ ...prev, stop: true }));
    try {
      // Comment out values in /etc/asterisk/res_fax.conf (keep this behavior)
      const resFaxStop = `sed -i 's/^maxrate=/#maxrate=/' /etc/asterisk/res_fax.conf && sed -i 's/^minrate=/#minrate=/' /etc/asterisk/res_fax.conf && sed -i 's/^modems=/#modems=/' /etc/asterisk/res_fax.conf && sed -i 's/^ecm=/#ecm=/' /etc/asterisk/res_fax.conf`;
      await postLinuxCmd({ cmd: resFaxStop });

      // Delete values from /etc/asterisk/pjsip.conf (remove lines completely)
      const pjsipStop = `sed -i '/^[;#]*t38pt_udptl=/d' /etc/asterisk/pjsip.conf && sed -i '/^[;#]*faxdetect=/d' /etc/asterisk/pjsip.conf`;
      await postLinuxCmd({ cmd: pjsipStop });

      window.alert('Fax stopped successfully! T.38 configurations have been disabled.');
    } catch (error) {
      console.error('Error stopping fax:', error);
      window.alert('Error: ' + (error.message || 'Failed to stop fax'));
    } finally {
      setLoading(prev => ({ ...prev, stop: false }));
    }
  };
  const renderField = (field) => {
    if (field.type === 'select') {
      return (
        <Select
          size="small"
          value={form[field.name]}
          onChange={(e) => handleChange(field.name, e.target.value)}
          className="w-full max-w-xs"
        >
          {field.options.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </Select>
      );
    }
    if (field.type === 'checkbox') {
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={form[field.name]}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              sx={{ p: 0.5 }}
            />
          }
          label={field.label}
        />
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-140px)] py-0 flex justify-center overflow-x-hidden" style={{ backgroundColor: "#dde0e4" }}>
      <div className="w-full max-w-[1000px] md:w-[1000px] px-2 md:px-0" style={{ margin: '0 auto' }}>
        {/* Header */}
        <div className="w-full h-9 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-base md:text-xl text-gray-700 shadow mb-0">
          Fax Parameters
        </div>

        {/* Content */}
        <div className="border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{ backgroundColor: "#dde0e4" }}>
          <div className="flex-1 py-6 px-4 md:px-[55px]">
            <div className="space-y-4 max-w-[640px] mx-auto">

              {/* Fax Mode */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-[60px]">
                <label className="text-base text-gray-700 font-medium text-left w-full md:w-[280px] flex-shrink-0">
                  Fax Mode:
                </label>
                <Select
                  value={form.faxMode}
                  onChange={(e) => handleChange('faxMode', e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{
                    width: { xs: '100%', md: '280px' },
                    fontSize: 16,
                    height: 32,
                    backgroundColor: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#999999',
                    },
                    '& .MuiSelect-select': {
                      padding: '4px 10px',
                      lineHeight: '24px',
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  {FAX_MODE_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </div>

              {/* T.38 Fields */}
              {form.faxMode === 'T38' && (
                <>
                  {T38_FIELDS.map((field) => (
                    <div key={field.name} className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-[60px]">
                      {field.type === 'checkbox' ? (
                        <>
                          <label className="text-base text-gray-700 font-medium text-left w-full md:w-[280px] flex-shrink-0">
                            {field.label}:
                          </label>
                          <div className="flex items-center">
                            <Checkbox
                              checked={form[field.name]}
                              onChange={(e) => handleChange(field.name, e.target.checked)}
                              sx={{ p: 0.5 }}
                            />
                            <span className="text-base text-gray-700 font-medium ml-2">Enable</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <label className="text-base text-gray-700 font-medium text-left w-full md:w-[280px] flex-shrink-0">
                            {field.label}:
                          </label>
                          <Select
                            value={form[field.name]}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{
                              width: { xs: '100%', md: '280px' },
                              fontSize: 16,
                              height: 32,
                              backgroundColor: '#ffffff',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#999999',
                              },
                              '& .MuiSelect-select': {
                                padding: '4px 10px',
                                lineHeight: '24px',
                                backgroundColor: 'transparent',
                              },
                            }}
                          >
                            {field.options.map(opt => (
                              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                          </Select>
                        </>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 mt-6">
          <Button
            variant="contained"
            onClick={(e) => {
              console.log('Save button onClick event fired', e);
              handleSave();
            }}
            disabled={loading.save || loading.stop}
            startIcon={loading.save ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: { xs: '16px', md: '18px' },
              borderRadius: 2,
              minWidth: { xs: '100%', md: 140 },
              maxWidth: { xs: '100%', md: 'none' },
              minHeight: 48,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                color: '#fff',
              },
              '&:disabled': {
                background: 'linear-gradient(to bottom, #9e9e9e 0%, #757575 100%)',
                color: '#fff',
              },
            }}
          >Save</Button>

          <Button
            variant="contained"
            onClick={handleStopFax}
            disabled={loading.save || loading.stop}
            startIcon={loading.stop ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: { xs: '16px', md: '18px' },
              borderRadius: 2,
              minWidth: { xs: '100%', md: 140 },
              maxWidth: { xs: '100%', md: 'none' },
              minHeight: 48,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                color: '#fff',
              },
              '&:disabled': {
                background: 'linear-gradient(to bottom, #9e9e9e 0%, #757575 100%)',
                color: '#fff',
              },
            }}
          >Stop Fax</Button>
          <Button
            variant="contained"
            onClick={handleReset}
            disabled={loading.save || loading.stop}
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: { xs: '16px', md: '18px' },
              borderRadius: 2,
              minWidth: { xs: '100%', md: 140 },
              maxWidth: { xs: '100%', md: 'none' },
              minHeight: 48,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                color: '#fff',
              },
              '&:disabled': {
                background: 'linear-gradient(to bottom, #9e9e9e 0%, #757575 100%)',
                color: '#fff',
              },
            }}
          >Reset</Button>
        </div>
      </div>
    </div>
  );
};

export default FaxFaxPage;


