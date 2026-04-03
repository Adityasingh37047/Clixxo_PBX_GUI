import React, { useState } from 'react';
import { TONE_GENERATOR_INITIAL_FORM } from './constants/ToneGeneratorConstants';
import { Button, TextField } from '@mui/material';

const ToneGeneratorPage = () => {
  const [formData, setFormData] = useState(TONE_GENERATOR_INITIAL_FORM);

  // Validation function based on checkPara from HTML
  const checkPara = (value) => {
    const numTest = /^[1234567890]*$/;
    const linepara = value.split(",");
    const totallinenum = linepara.length;
    let parapart;
    let paraadd;
    let highvalue = 0;

    for (let i = 0; i < totallinenum; i++) {
      if (linepara[i] === "") {
        return false;
      }

      parapart = linepara[i].split("/");
      if (parapart.length !== 2 || parapart[0] === "" || parapart[1] === "" || !numTest.test(parapart[1])) {
        return false;
      }

      if (parapart[0] !== "0") {
        highvalue++;
      }

      if (highvalue > 4) {
        return false;
      }

      // 200-3500
      paraadd = parapart[0].split("+");
      if ((i === 0) && (paraadd.length === 1) && (paraadd[0] === "0")) {
        return false;
      }

      if (paraadd.length === 1) {
        if (!numTest.test(paraadd[0]) || ((!(parseInt(paraadd[0]) >= 200 && parseInt(paraadd[0]) <= 3500)) && (paraadd[0] !== "0"))) {
          return false;
        }
      }

      if (paraadd.length === 2) {
        for (let j = 0; j < paraadd.length; j++) {
          if (!numTest.test(paraadd[j]) || paraadd[j] === "0" || !(parseInt(paraadd[j]) >= 200 && parseInt(paraadd[j]) <= 3500)) {
            return false;
          }
        }
      }

      if (paraadd.length > 2) {
        return false;
      }
    }

    return true;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    // Allow: numbers (47-57 = 0-9), + (43), comma (44), backspace (8)
    if (!((key >= 47 && key <= 57) || key === 43 || key === 44 || key === 8)) {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    if (!checkPara(formData.dialTone)) {
      alert("Invalid Parameters of Dial Tone Transmitter!");
      document.getElementById("dialTone").focus();
      return;
    }

    if (!checkPara(formData.ringbackTone)) {
      alert("Invalid Parameters of Ringback Tone Transmitter!");
      document.getElementById("ringbackTone").focus();
      return;
    }

    if (!checkPara(formData.busyTone)) {
      alert("Invalid Parameters of Busy Tone Transmitter!");
      document.getElementById("busyTone").focus();
      return;
    }

    // Save logic here (you can add API call later)
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    setFormData(TONE_GENERATOR_INITIAL_FORM);
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{backgroundColor: "#dde0e4", padding: '4px'}}>
      {/* Header */}
      <div style={{ width: '750px', maxWidth: '95%' }}>
        <div className="h-8 flex items-center justify-center font-semibold text-[16px] text-[#444] shadow-sm"
          style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
          Tone Generator
        </div>

        {/* Main Content Container */}
        <div style={{ backgroundColor: '#f8fafd', border: '1px solid #444', borderTop: 'none', width: '750px', padding: '16px' }}>
          <div className="flex" style={{ minHeight: '400px' }}>
            {/* Left Column - Input Fields */}
            <div style={{ width: '45%' }}>
              <div style={{ marginTop: '16px' }}>
                <div style={{ height: '24px' }}></div>
                {/* Dial Tone */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '5%' }}></div>
                    <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap" style={{ marginRight: '12px', width: '110px' }}>
                      Dial Tone
                    </label>
                  <TextField
                    id="dialTone"
                    value={formData.dialTone}
                    onChange={(e) => handleInputChange('dialTone', e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e)}
                    inputProps={{ 
                      maxLength: 63,
                      style: { fontSize: 14, padding: '4px 8px' }
                    }}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        height: '28px',
                        backgroundColor: 'white',
                        '& fieldset': {
                          borderColor: '#bbb',
                        },
                        '&:hover fieldset': {
                          borderColor: '#999',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                        },
                      },
                    }}
                    variant="outlined"
                    size="small"
                  />
                  </div>
                </div>

                <div style={{ height: '24px' }}></div>

                {/* Ringback Tone */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '5%' }}></div>
                    <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap" style={{ marginRight: '12px', width: '110px' }}>
                      Ringback Tone
                    </label>
                  <TextField
                    id="ringbackTone"
                    value={formData.ringbackTone}
                    onChange={(e) => handleInputChange('ringbackTone', e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e)}
                    inputProps={{ 
                      maxLength: 63,
                      style: { fontSize: 14, padding: '4px 8px' }
                    }}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        height: '28px',
                        backgroundColor: 'white',
                        '& fieldset': {
                          borderColor: '#bbb',
                        },
                        '&:hover fieldset': {
                          borderColor: '#999',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                        },
                      },
                    }}
                    variant="outlined"
                    size="small"
                  />
                  </div>
                </div>

                <div style={{ height: '24px' }}></div>

                {/* Busy Tone */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '5%' }}></div>
                    <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap" style={{ marginRight: '12px', width: '110px' }}>
                      Busy Tone
                    </label>
                  <TextField
                    id="busyTone"
                    value={formData.busyTone}
                    onChange={(e) => handleInputChange('busyTone', e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e)}
                    inputProps={{ 
                      maxLength: 63,
                      style: { fontSize: 14, padding: '4px 8px' }
                    }}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        height: '28px',
                        backgroundColor: 'white',
                        '& fieldset': {
                          borderColor: '#bbb',
                        },
                        '&:hover fieldset': {
                          borderColor: '#999',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                        },
                      },
                    }}
                    variant="outlined"
                    size="small"
                  />
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div style={{ width: '1%', backgroundColor: '#d1d5db' }}></div>

            {/* Right Column - Descriptions */}
            <div style={{ width: '54%' }}>
              <div style={{ marginTop: '16px' }}>
                <div style={{ marginLeft: '2%', width: '96%' }}>
                  <p style={{ marginTop: '16px', marginBottom: '8px' }}></p>
                  <p className="text-[14px] font-medium text-gray-800" style={{ marginBottom: '8px' }}>350+440/0</p>
                  <p className="text-[13px] text-gray-600" style={{ lineHeight: '1.6', marginBottom: '16px' }}>
                    Continuously play a dual tone which is composed of 350HZ and 440HZ.Note: The value range of the frequency is 200~3500HZ.
                  </p>

                  <p style={{ marginBottom: '8px' }}></p>
                  <p className="text-[14px] font-medium text-gray-800" style={{ marginBottom: '8px' }}>480+620/500,0/500</p>
                  <p className="text-[13px] text-gray-600" style={{ lineHeight: '1.6', marginBottom: '16px' }}>
                    Repeatedly play a dual tone which is composed of 480HZ and 620HZ in the method of 500ms play with 500ms pause. Note: 0/500 denotes 500ms silence and the tone cannot start with the silence.
                  </p>

                  <p style={{ marginBottom: '8px' }}></p>
                  <p className="text-[14px] font-medium text-gray-800" style={{ marginBottom: '8px' }}>950/333,1400/333,1800/333,0/1000</p>
                  <p className="text-[13px] text-gray-600" style={{ lineHeight: '1.6', marginBottom: '16px' }}>
                    Repeatedly play tones in turn: first a 333ms 950HZ tone, followed by a 333ms 1400HZ tone, then a 333ms 1800HZ tone and at last a 1s silence.Note: The count of signals at ON state in a period cannot be greater than 4.
                  </p>
                  <p style={{ marginBottom: '8px' }}></p>
                </div>
              </div>
            </div>
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
    </div>
  );
};

export default ToneGeneratorPage;

