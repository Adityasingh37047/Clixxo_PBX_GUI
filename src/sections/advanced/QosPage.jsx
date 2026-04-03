import React, { useState } from 'react';
import { QOS_INITIAL_FORM } from './constants/QosConstants';
import { TextField, Button } from '@mui/material';

const QosPage = () => {
  const [formData, setFormData] = useState(QOS_INITIAL_FORM);

  const handleCheckboxChange = () => {
    setFormData(prev => ({ ...prev, qosEnabled: !prev.qosEnabled }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyPressInteger = (e) => {
    const key = e.keyCode || e.which;
    // Allow: numbers (48-57), backspace (8)
    if (!((key >= 48 && key <= 57) || key === 8)) {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    if (formData.qosEnabled) {
      // Validate Media Premium QoS
      const mediaQos = parseInt(formData.mediaPremiumQos);
      if (isNaN(mediaQos) || mediaQos < 0 || mediaQos > 63) {
        alert("The range of 'Media Premium QoS' is 0~63!");
        document.getElementById("mediaPremiumQos")?.focus();
        return;
      }

      // Validate Control Premium QoS
      const controlQos = parseInt(formData.controlPremiumQos);
      if (isNaN(controlQos) || controlQos < 0 || controlQos > 63) {
        alert("The range of 'Control Premium QoS' is 0~63!");
        document.getElementById("controlPremiumQos")?.focus();
        return;
      }
    }

    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    setFormData(QOS_INITIAL_FORM);
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-128px)] py-2 px-2 sm:px-4" style={{backgroundColor: "#dde0e4"}}>
      <div style={{ width: '750px', maxWidth: '95%', margin: '0 auto' }}>
        {/* Blue header bar */}
        <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-600 shadow mb-0">
          QoS
        </div>

        <div className="bg-white border-2 border-gray-400 border-t-0 shadow-sm p-4">
          <table style={{ width: '100%', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '35%' }} />
              <col style={{ width: '60%' }} />
            </colgroup>
            <tbody>
              {/* QoS Enable checkbox */}
              <tr style={{ height: '22px' }}>
                <td style={{ width: '5%' }}></td>
                <td colSpan={1} style={{ paddingLeft: '2%', fontSize: '14px', color: '#333' }}>
                  QoS
                </td>
                <td style={{ width: '60%' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!formData.qosEnabled}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 accent-blue-600"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                    <span style={{ fontSize: '14px', color: '#333' }}>Enable</span>
                  </label>
                </td>
              </tr>
              <tr><td style={{ height: '8px' }}></td></tr>

              {/* Media Premium QoS - shown when QoS is enabled */}
              {formData.qosEnabled && (
                <>
                  <tr style={{ height: '22px' }}>
                    <td style={{ width: '5%' }}></td>
                    <td colSpan={1} style={{ paddingLeft: '2%', fontSize: '14px', color: '#333' }}>
                      Media Premium QoS
                    </td>
                    <td style={{ width: '60%' }}>
                      <TextField
                        id="mediaPremiumQos"
                        value={formData.mediaPremiumQos || ''}
                        onChange={(e) => handleInputChange('mediaPremiumQos', e.target.value)}
                        onKeyPress={handleKeyPressInteger}
                        size="small"
                        variant="outlined"
                        inputProps={{ style: { fontSize: 14, padding: '4px 8px' } }}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            height: '28px',
                            backgroundColor: 'white',
                            '& fieldset': { borderColor: '#bbb' },
                            '&:hover fieldset': { borderColor: '#999' },
                            '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                          },
                        }}
                      />
                    </td>
                  </tr>
                  <tr><td style={{ height: '8px' }}></td></tr>
                </>
              )}

              {/* Control Premium QoS - shown when QoS is enabled */}
              {formData.qosEnabled && (
                <>
                  <tr style={{ height: '22px' }}>
                    <td style={{ width: '5%' }}></td>
                    <td colSpan={1} style={{ paddingLeft: '2%', fontSize: '14px', color: '#333' }}>
                      Control Premium QoS
                    </td>
                    <td style={{ width: '60%' }}>
                      <TextField
                        id="controlPremiumQos"
                        value={formData.controlPremiumQos || ''}
                        onChange={(e) => handleInputChange('controlPremiumQos', e.target.value)}
                        onKeyPress={handleKeyPressInteger}
                        size="small"
                        variant="outlined"
                        inputProps={{ style: { fontSize: 14, padding: '4px 8px' } }}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            height: '28px',
                            backgroundColor: 'white',
                            '& fieldset': { borderColor: '#bbb' },
                            '&:hover fieldset': { borderColor: '#999' },
                            '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                          },
                        }}
                      />
                    </td>
                  </tr>
                  <tr><td style={{ height: '8px' }}></td></tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save and Reset Buttons */}
      <div className="flex justify-center gap-4" style={{ marginTop: '24px', marginBottom: '16px' }}>
        <Button
          variant="contained"
          sx={{
            background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            borderRadius: 1.5,
            minWidth: 100,
            px: 3,
            py: 1,
            boxShadow: '0 2px 8px #b3e0ff',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
              color: '#fff',
            },
          }}
          onClick={handleSave}
        >
          Save
        </Button>
        <Button
          variant="contained"
          sx={{
            background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            borderRadius: 1.5,
            minWidth: 100,
            px: 3,
            py: 1,
            boxShadow: '0 2px 8px #b3e0ff',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
              color: '#fff',
            },
          }}
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default QosPage;

