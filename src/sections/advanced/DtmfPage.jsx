import React, { useState } from 'react';
import { DTMF_INITIAL_FORM } from './constants/DtmfConstants';
import { TextField, Button } from '@mui/material';

const DtmfPage = () => {
  const [formData, setFormData] = useState(DTMF_INITIAL_FORM);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleKeyPress = (e, allowDecimal = false) => {
    const key = e.keyCode || e.which;
    // Allow: numbers (48-57), minus sign (45), decimal point (46) if allowed, backspace (8)
    if (!((key >= 48 && key <= 57) || key === 45 || (allowDecimal && key === 46) || key === 8)) {
      e.preventDefault();
    }
  };

  const handleKeyPressInteger = (e) => {
    const key = e.keyCode || e.which;
    // Allow: numbers (48-57), backspace (8)
    if (!((key >= 48 && key <= 57) || key === 8)) {
      e.preventDefault();
    }
  };

  const checkDtmfEnergy = (value) => {
    const parts = value.toString().split(".");
    if ((parts[1] !== undefined && parts[1].length > 1) || parts.length > 2) {
      return true;
    }
    return false;
  };

  const handleSave = () => {
    // Validate DTMF Detector fields
    const positiveTwist = parseFloat(formData.positiveTwist);
    if (isNaN(positiveTwist) || positiveTwist < 0 || positiveTwist > 24) {
      alert("The range of 'Energy Difference for High-freq minus Low-freq' is 0~24!");
      document.getElementById("positiveTwist")?.focus();
      return;
    }

    const negativeTwist = parseFloat(formData.negativeTwist);
    if (isNaN(negativeTwist) || negativeTwist < 0 || negativeTwist > 24) {
      alert("The range of 'Energy Difference for Low-freq minus High-freq' is 0~24!");
      document.getElementById("negativeTwist")?.focus();
      return;
    }

    const minDuration = parseFloat(formData.minDuration);
    if (isNaN(minDuration) || minDuration < 10 || minDuration > 2000) {
      alert("The value range of the minimum duration at ON is 10~2000!");
      document.getElementById("minDuration")?.focus();
      return;
    }

    const minNegativeDuration = parseFloat(formData.minNegativeDuration);
    if (isNaN(minNegativeDuration) || minNegativeDuration < 10 || minNegativeDuration > 2000) {
      alert("The value range of the minimum duration at OFF is 10~2000!");
      document.getElementById("minNegativeDuration")?.focus();
      return;
    }

    const energyRatio = parseFloat(formData.energyRatio);
    if (isNaN(energyRatio) || energyRatio < 1 || energyRatio > 100) {
      alert("The ratio range of the DT energy is 1~100!");
      document.getElementById("energyRatio")?.focus();
      return;
    }

    const levelMinIn = parseFloat(formData.levelMinIn);
    if (isNaN(levelMinIn) || levelMinIn < -40 || levelMinIn > -9) {
      alert("The value range of the lowest energy threshold is -40~-9!");
      document.getElementById("levelMinIn")?.focus();
      return;
    }

    // Validate DTMF Generator fields
    if (formData.dtmfEnergyAdvance) {
      for (let i = 0; i <= 11; i++) {
        const dtmfPlayEnergy = parseFloat(formData[`dtmfPlayEnergy${i}`]);
        if (isNaN(dtmfPlayEnergy) || dtmfPlayEnergy < -18 || dtmfPlayEnergy > 11) {
          const key = i === 10 ? '*' : i === 11 ? '#' : i;
          alert(`The value range of DTMF${key} Low Energy is -18.0~11.0dB!`);
          document.getElementById(`dtmfPlayEnergy${i}`)?.focus();
          return;
        }
        if (checkDtmfEnergy(formData[`dtmfPlayEnergy${i}`])) {
          const key = i === 10 ? '*' : i === 11 ? '#' : i;
          alert(`The value of DTMF${key} Low Energy only have one decimal!`);
          document.getElementById(`dtmfPlayEnergy${i}`)?.focus();
          return;
        }

        const dtmfHighPlayEnergy = parseFloat(formData[`dtmfHighPlayEnergy${i}`]);
        if (isNaN(dtmfHighPlayEnergy) || dtmfHighPlayEnergy < -18 || dtmfHighPlayEnergy > 11) {
          const key = i === 10 ? '*' : i === 11 ? '#' : i;
          alert(`The value range of DTMF${key} High Energy is -18.0~11.0dB!`);
          document.getElementById(`dtmfHighPlayEnergy${i}`)?.focus();
          return;
        }
        if (checkDtmfEnergy(formData[`dtmfHighPlayEnergy${i}`])) {
          const key = i === 10 ? '*' : i === 11 ? '#' : i;
          alert(`The value of DTMF${key} High Energy only have one decimal!`);
          document.getElementById(`dtmfHighPlayEnergy${i}`)?.focus();
          return;
        }
      }
    } else {
      const dtmfPlayEnergy = parseFloat(formData.dtmfPlayEnergy);
      if (isNaN(dtmfPlayEnergy) || dtmfPlayEnergy < -18 || dtmfPlayEnergy > 11) {
        alert("The value range of 'DTMF Energy' is -18~11dB!");
        document.getElementById("dtmfPlayEnergy")?.focus();
        return;
      }
    }

    const dtmfTxHighDuration = parseFloat(formData.dtmfTxHighDuration);
    if (isNaN(dtmfTxHighDuration) || dtmfTxHighDuration < 0 || dtmfTxHighDuration > 16383) {
      alert("The value range of 'Duration at ON' is 0~16383!");
      document.getElementById("dtmfTxHighDuration")?.focus();
      return;
    }

    const dtmfTxLowDuration = parseFloat(formData.dtmfTxLowDuration);
    if (isNaN(dtmfTxLowDuration) || dtmfTxLowDuration < 0 || dtmfTxLowDuration > 16383) {
      alert("The value range of 'Duration at OFF' is 0~16383!");
      document.getElementById("dtmfTxLowDuration")?.focus();
      return;
    }

    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    setFormData(DTMF_INITIAL_FORM);
  };

  const renderField = (label, fieldName, type = 'text', allowDecimal = false, width = '200px') => {
    return (
      <>
        <tr style={{ height: '22px' }}>
          <td style={{ width: '5%' }}></td>
          <td colSpan={1} style={{ paddingLeft: '2%', fontSize: '14px', color: '#333' }}>
            {label}
          </td>
          <td style={{ width: '35%' }}>
            {type === 'checkbox' ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!formData[fieldName]}
                  onChange={() => handleCheckboxChange(fieldName)}
                  className="h-4 w-4 accent-blue-600"
                  style={{ backgroundColor: '#ffffff' }}
                />
                <span style={{ fontSize: '14px', color: '#333' }}>Enable</span>
              </label>
            ) : (
              <TextField
                id={fieldName}
                value={formData[fieldName]}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                onKeyPress={(e) => allowDecimal ? handleKeyPress(e, true) : handleKeyPressInteger(e)}
                inputProps={{ 
                  maxLength: 20,
                  style: { fontSize: 14, padding: '4px 8px' }
                }}
                sx={{
                  width: width,
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
            )}
          </td>
        </tr>
        <tr><td style={{ height: '8px' }}></td></tr>
      </>
    );
  };

  const renderAdvancedEnergyField = (label, lowField, highField, index) => {
    const highLabel = label.replace('Low Hz', 'High Hz');
    return (
      <>
        {renderField(label, lowField, 'text', true)}
        {renderField(highLabel, highField, 'text', true)}
      </>
    );
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{backgroundColor: "#dde0e4", padding: '4px'}}>
      {/* DTMF Detector Section */}
      <div style={{ width: '750px', maxWidth: '95%', marginBottom: '20px' }}>
        <div className=" h-8 flex items-center justify-center font-semibold text-[16px] text-[#444] shadow-sm"
          style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
          DTMF Detector
        </div>

        <div style={{ backgroundColor: '#dde0e4', border: '1px solid #444', borderTop: 'none', width: '750px', padding: '16px' }}>
          <table style={{ width: '100%', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '60%' }} />
              <col style={{ width: '35%' }} />
            </colgroup>
            <tbody>
              {renderField('Energy Difference of High-freq minus Low-freq (dB)', 'positiveTwist', 'text', false)}
              {renderField('Energy Difference of Low-freq minus High-freq (dB)', 'negativeTwist', 'text', false)}
              {renderField('Minimum Duration at ON (ms)', 'minDuration', 'text', false)}
              {renderField('Minimum Duration at OFF (ms)', 'minNegativeDuration', 'text', false)}
              {renderField('Ratio of DT Energy(%)', 'energyRatio', 'text', true)}
              {renderField('Lowest Energy Threshold (dB)', 'levelMinIn', 'text', false)}
              {renderField('DTMF Display via Channel Status', 'enableDisplayDtmf', 'checkbox')}
              {renderField('ABCD Detection', 'enableOmitABCD', 'checkbox')}
            </tbody>
          </table>
        </div>
      </div>

      {/* DTMF Generator Section */}
      <div style={{ width: '750px', maxWidth: '95%', marginBottom: '20px' }}>
        <div className=" h-8 flex items-center justify-center font-semibold text-[16px] text-[#444] shadow-sm"
          style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
          DTMF Generator
        </div>

        <div style={{ backgroundColor: '#dde0e4', border: '1px solid #444', borderTop: 'none', width: '750px', padding: '16px' }}>
          <table style={{ width: '100%', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '60%' }} />
              <col style={{ width: '35%' }} />
            </colgroup>
            <tbody>
              <tr style={{ height: '22px' }}>
                <td style={{ width: '5%' }}></td>
                <td colSpan={1} style={{ paddingLeft: '2%', fontSize: '14px', color: '#333' }}>DTMF Energy Advance Set</td>
                <td style={{ width: '35%' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!formData.dtmfEnergyAdvance}
                      onChange={() => handleCheckboxChange('dtmfEnergyAdvance')}
                      className="h-4 w-4 accent-blue-600"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                    <span style={{ fontSize: '14px', color: '#333' }}>Enable</span>
                  </label>
                </td>
              </tr>
              <tr><td style={{ height: '8px' }}></td></tr>

              {/* Normal DTMF Energy (shown when advance is off) */}
              {!formData.dtmfEnergyAdvance && renderField('DTMF Energy (dB)', 'dtmfPlayEnergy', 'text', false)}

              {/* Advanced Energy Settings (shown when advance is on) */}
              {formData.dtmfEnergyAdvance && (
                <>
                  {renderAdvancedEnergyField('DTMF0 Low Hz Energy (dB)', 'dtmfPlayEnergy0', 'dtmfHighPlayEnergy0', 0)}
                  {renderAdvancedEnergyField('DTMF1 Low Hz Energy (dB)', 'dtmfPlayEnergy1', 'dtmfHighPlayEnergy1', 1)}
                  {renderAdvancedEnergyField('DTMF2 Low Hz Energy (dB)', 'dtmfPlayEnergy2', 'dtmfHighPlayEnergy2', 2)}
                  {renderAdvancedEnergyField('DTMF3 Low Hz Energy (dB)', 'dtmfPlayEnergy3', 'dtmfHighPlayEnergy3', 3)}
                  {renderAdvancedEnergyField('DTMF4 Low Hz Energy (dB)', 'dtmfPlayEnergy4', 'dtmfHighPlayEnergy4', 4)}
                  {renderAdvancedEnergyField('DTMF5 Low Hz Energy (dB)', 'dtmfPlayEnergy5', 'dtmfHighPlayEnergy5', 5)}
                  {renderAdvancedEnergyField('DTMF6 Low Hz Energy (dB)', 'dtmfPlayEnergy6', 'dtmfHighPlayEnergy6', 6)}
                  {renderAdvancedEnergyField('DTMF7 Low Hz Energy (dB)', 'dtmfPlayEnergy7', 'dtmfHighPlayEnergy7', 7)}
                  {renderAdvancedEnergyField('DTMF8 Low Hz Energy (dB)', 'dtmfPlayEnergy8', 'dtmfHighPlayEnergy8', 8)}
                  {renderAdvancedEnergyField('DTMF9 Low Hz Energy (dB)', 'dtmfPlayEnergy9', 'dtmfHighPlayEnergy9', 9)}
                  {renderAdvancedEnergyField('DTMF* Low Hz Energy (dB)', 'dtmfPlayEnergy10', 'dtmfHighPlayEnergy10', 10)}
                  {renderAdvancedEnergyField('DTMF# Low Hz Energy (dB)', 'dtmfPlayEnergy11', 'dtmfHighPlayEnergy11', 11)}
                </>
              )}

              {renderField('Duration at ON (ms)', 'dtmfTxHighDuration', 'text', false)}
              {renderField('Duration at OFF (ms)', 'dtmfTxLowDuration', 'text', false)}
            </tbody>
          </table>

          {/* Warning Note */}
          <div style={{ marginTop: '16px', paddingLeft: '10%', width: '90%' }}>
            <p style={{ color: 'red', fontSize: '13px', margin: 0 }}>
              Note:Setting the DTMF transmission energy too large may cause the distortion of the transmitted DTMF. Please configure it carefully.
            </p>
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
  );
};

export default DtmfPage;

