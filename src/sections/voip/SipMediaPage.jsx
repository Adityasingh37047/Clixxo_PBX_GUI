import React, { useState } from 'react';

const SipMediaPage = () => {
  // Media Parameters state
  const [formData, setFormData] = useState({
    dtmfTransmitMode: '0', // 0=RFC2833, 1=SIP INFO, 2=In-band
    rfc2833Payload: '101',
    rtpPortRange: '10000,20000',
    silenceSuppression: '0', // 0=Disable, 1=Enable
    jitterMode: '0', // 0=Static Mode, 1=Adaptive Mode
    jitterBuffer: '100',
    voiceGainOutput: '0',
  });

  // CODEC Priority state - 6 priorities
  const [codecData, setCodecData] = useState([
    { enabled: true, codec: '6', packingTime: '20', bitRate: '0' }, // Priority 1: G711A
    { enabled: true, codec: '7', packingTime: '20', bitRate: '0' }, // Priority 2: G711U
    { enabled: true, codec: '131', packingTime: '20', bitRate: '0' }, // Priority 3: G729
    { enabled: true, codec: '98', packingTime: '30', bitRate: '0' }, // Priority 4: iLBC
    { enabled: true, codec: '96', packingTime: '20', bitRate: '0' }, // Priority 5: AMR
    { enabled: true, codec: '4', packingTime: '30', bitRate: '1' }, // Priority 6: G723
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCodecCheckbox = (index) => {
    const newCodecData = [...codecData];
    newCodecData[index].enabled = !newCodecData[index].enabled;
    setCodecData(newCodecData);
  };

  const handleCodecChange = (index, value) => {
    const newCodecData = [...codecData];
    newCodecData[index].codec = value;
    
    // Reset packing time and bit rate based on new CODEC
    const codec = parseInt(value);
    if (codec === 7 || codec === 6) {
      // G711A/U
      newCodecData[index].packingTime = '20';
      newCodecData[index].bitRate = '0';
    } else if (codec === 131) {
      // G729
      newCodecData[index].packingTime = '20';
      newCodecData[index].bitRate = '0';
    } else if (codec === 98) {
      // iLBC
      newCodecData[index].packingTime = '30';
      newCodecData[index].bitRate = '0';
    } else if (codec === 96) {
      // AMR
      newCodecData[index].packingTime = '20';
      newCodecData[index].bitRate = '0';
    } else if (codec === 4) {
      // G723
      newCodecData[index].packingTime = '30';
      newCodecData[index].bitRate = '1';
    }
    
    setCodecData(newCodecData);
  };

  const handlePackingTimeChange = (index, value) => {
    const newCodecData = [...codecData];
    const codec = parseInt(newCodecData[index].codec);
    
    // Validation for GSM and G723
    if (codec === 49 && value === '30') {
      alert("Please don't set coder=GSM and PktTime=30 at the same time!");
      return;
    }
    if (codec === 4 && value === '20') {
      alert("Please don't set coder=G723 and PktTime=20 at the same time!");
      return;
    }

    newCodecData[index].packingTime = value;

    // Update bit rate for iLBC based on packing time
    if (codec === 98) {
      if (value === '20' || value === '40') {
        newCodecData[index].bitRate = '1'; // 15.2
      } else if (value === '30') {
        newCodecData[index].bitRate = '0'; // 13.3
      }
    }

    setCodecData(newCodecData);
  };

  const handleBitRateChange = (index, value) => {
    const newCodecData = [...codecData];
    newCodecData[index].bitRate = value;
    setCodecData(newCodecData);
  };

  const getPackingTimeOptions = (codecValue) => {
    const codec = parseInt(codecValue);
    if (codec === 7 || codec === 6) {
      // G711A/U: 10, 20, 30, 40, 50, 60
      return ['10', '20', '30', '40', '50', '60'];
    } else if (codec === 131) {
      // G729: 10, 20, 30, 40, 50, 60
      return ['10', '20', '30', '40', '50', '60'];
    } else if (codec === 98) {
      // iLBC: 20, 30
      return ['20', '30'];
    } else if (codec === 96) {
      // AMR: 20
      return ['20'];
    } else if (codec === 4) {
      // G723: 30
      return ['30'];
    }
    return [];
  };

  const getBitRateOptions = (codecValue, packingTime) => {
    const codec = parseInt(codecValue);
    if (codec === 7 || codec === 6) {
      // G711A/U: 64
      return [{ value: '0', label: '64' }];
    } else if (codec === 131) {
      // G729: 8
      return [{ value: '0', label: '8' }];
    } else if (codec === 98) {
      // iLBC: 13.3 or 15.2 based on packing time
      if (packingTime === '30') {
        return [{ value: '0', label: '13.3' }];
      } else {
        return [{ value: '1', label: '15.2' }];
      }
    } else if (codec === 96) {
      // AMR: 12.20
      return [{ value: '0', label: '12.20' }];
    } else if (codec === 4) {
      // G723: 6.3
      return [{ value: '1', label: '6.3' }];
    }
    return [];
  };

  const validateForm = () => {
    // Validate RFC2833 Payload
    if (!formData.rfc2833Payload) {
      alert("Please enter a RFC2833 load!");
      return false;
    }
    const rfc2833 = parseInt(formData.rfc2833Payload);
    if (rfc2833 < 90 || rfc2833 >= 128) {
      alert("The value range of 'RFC2833 Load' is 90~127!");
      return false;
    }

    // Validate RTP Port Range
    if (!formData.rtpPortRange) {
      alert("Please enter a RTP port range!");
      return false;
    }
    const portParts = formData.rtpPortRange.split(',');
    if (portParts.length !== 2) {
      alert("Invalid RTP port range!");
      return false;
    }
    const startPort = parseInt(portParts[0]);
    const endPort = parseInt(portParts[1]);
    if (isNaN(startPort) || isNaN(endPort)) {
      alert("'RTP Port' must be numbers!");
      return false;
    }
    if (startPort < 2000 || endPort > 60000) {
      alert("The value range of 'RTP Port' is 2000~60000!");
      return false;
    }
    if (5060 >= startPort && 5060 <= endPort) {
      alert("The SIP port value 5060 cannot be within the port range!");
      return false;
    }
    if (startPort % 2 !== 0) {
      alert("The starting port number must be an even!");
      return false;
    }
    if (endPort - startPort < 480) {
      alert("The difference between the latter 'RTP Port' and the former should be no less than 480!");
      return false;
    }

    // Validate JitterBuffer
    if (formData.jitterMode === '0') {
      if (!formData.jitterBuffer) {
        alert("Please enter a JitterBuffer value!");
        return false;
      }
      const jitterBuffer = parseInt(formData.jitterBuffer);
      if (jitterBuffer < 20 || jitterBuffer > 200) {
        alert("The value range of 'JitterBuffer' is 20~200!");
        return false;
      }
    }

    // Validate Voice Gain Output
    const voiceGain = parseInt(formData.voiceGainOutput);
    if (isNaN(voiceGain) || voiceGain < -24 || voiceGain > 24) {
      alert("The value range of 'Voice Gain Output from IP' is -24~24!");
      return false;
    }
    if (voiceGain % 3 !== 0) {
      alert("The value of 'Voice Gain Output from IP' must be a multiple of 3!");
      return false;
    }

    // Validate at least one CODEC is selected
    const enabledCodecs = codecData.filter(item => item.enabled);
    if (enabledCodecs.length === 0) {
      alert("Please select a CODEC!");
      return false;
    }

    // Validate no duplicate CODECs
    const codecValues = enabledCodecs.map(item => item.codec);
    const uniqueCodecs = new Set(codecValues);
    if (uniqueCodecs.size !== codecValues.length) {
      alert("Please choose a different CODEC!");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      alert('Settings saved successfully!');
    }
  };

  const handleReset = () => {
    setFormData({
      dtmfTransmitMode: '0',
      rfc2833Payload: '101',
      rtpPortRange: '10000,20000',
      silenceSuppression: '0',
      jitterMode: '0',
      jitterBuffer: '100',
      voiceGainOutput: '0',
    });
    setCodecData([
      { enabled: true, codec: '6', packingTime: '20', bitRate: '0' },
      { enabled: true, codec: '7', packingTime: '20', bitRate: '0' },
      { enabled: true, codec: '131', packingTime: '20', bitRate: '0' },
      { enabled: true, codec: '98', packingTime: '30', bitRate: '0' },
      { enabled: true, codec: '96', packingTime: '20', bitRate: '0' },
      { enabled: true, codec: '4', packingTime: '30', bitRate: '1' },
    ]);
  };

  const handleKeyPress = (e, type) => {
    const key = e.keyCode || e.which;
    // Allow digits (48-57), comma (44), minus (45), backspace (8)
    if (type === 'number') {
      if (!((key > 47 && key < 58) || key === 8)) {
        e.preventDefault();
      }
    } else if (type === 'number-comma') {
      if (!((key > 47 && key < 58) || key === 44 || key === 8)) {
        e.preventDefault();
      }
    } else if (type === 'number-minus') {
      if (!((key > 47 && key < 58) || key === 45 || key === 8)) {
        e.preventDefault();
      }
    }
  };

  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-128px)] py-2"
      style={{ backgroundColor: '#dde0e4' }}
    >
      <div className="flex justify-center">
        <div className="w-full" style={{ maxWidth: '1024px' }}>
          {/* Page Title Bar */}
          <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-700 shadow mb-0">
            <span>Media Parameters</span>
        </div>

          {/* Main Card */}
          <div className="bg-[#dde0e4] border-2 border-gray-400 border-t-0 shadow-sm py-6 text-sm">
            <div className="flex justify-center pl-8">
              <table className="text-sm" style={{ tableLayout: 'fixed', width: '750px' }}>
                <colgroup>
                  <col style={{ width: '48%' }} />
                  <col style={{ width: '52%' }} />
                </colgroup>
                <tbody>
                  {/* DTMF Transmit Mode */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      DTMF Transmit Mode
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="dtmfTransmitMode"
                        value={formData.dtmfTransmitMode}
                        onChange={handleInputChange}
                        className="border border-gray-400 rounded-sm px-1 bg-white"
                        style={{ height: '28px', width: '200px' }}
                      >
                        <option value="0">RFC2833</option>
                        <option value="1">SIP INFO</option>
                        <option value="2">In-band</option>
                      </select>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* RFC2833 Payload */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      RFC2833 Payload
                    </td>
                    <td className="align-middle text-left">
                      <input
                        type="text"
                        name="rfc2833Payload"
                        value={formData.rfc2833Payload}
                        onChange={handleInputChange}
                        onKeyPress={(e) => handleKeyPress(e, 'number')}
                        className="border border-gray-400 rounded-sm px-2 bg-white"
                        style={{ height: '28px', width: '200px' }}
                        maxLength="31"
                      />
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* RTP Port Range */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      RTP Port Range
                    </td>
                    <td className="align-middle text-left">
                      <input
                        type="text"
                        name="rtpPortRange"
                        value={formData.rtpPortRange}
                        onChange={handleInputChange}
                        onKeyPress={(e) => handleKeyPress(e, 'number-comma')}
                        className="border border-gray-400 rounded-sm px-2 bg-white"
                        style={{ height: '28px', width: '200px' }}
                        maxLength="31"
                      />
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Silence Suppression */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      Silence Suppression
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="silenceSuppression"
                        value={formData.silenceSuppression}
                        onChange={handleInputChange}
                        className="border border-gray-400 rounded-sm px-1 bg-white"
                        style={{ height: '28px', width: '200px' }}
                      >
                        <option value="0">Disable</option>
                        <option value="1">Enable</option>
                      </select>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* JitterMode */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      JitterMode
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="jitterMode"
                        value={formData.jitterMode}
                      onChange={handleInputChange}
                        className="border border-gray-400 rounded-sm px-1 bg-white"
                        style={{ height: '28px', width: '200px' }}
                      >
                        <option value="0">Static Mode</option>
                      </select>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* JitterBuffer */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      JitterBuffer(ms)
                    </td>
                    <td className="align-middle text-left">
                      <input
                        type="text"
                        name="jitterBuffer"
                        value={formData.jitterBuffer}
                        onChange={handleInputChange}
                        onKeyPress={(e) => handleKeyPress(e, 'number')}
                        className="border border-gray-400 rounded-sm px-2 bg-white"
                        style={{ height: '28px', width: '200px' }}
                        maxLength="31"
                      />
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Voice Gain Output from IP */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      Voice Gain Output from IP (dB)
                    </td>
                    <td className="align-middle text-left">
                    <input
                      type="text"
                        name="voiceGainOutput"
                        value={formData.voiceGainOutput}
                      onChange={handleInputChange}
                        onKeyPress={(e) => handleKeyPress(e, 'number-minus')}
                        className="border border-gray-400 rounded-sm px-2 bg-white"
                        style={{ height: '28px', width: '200px' }}
                        maxLength="31"
                      />
                    </td>
                  </tr>
                  <tr className="h-4" />
                </tbody>
              </table>
                </div>

            {/* CODEC Priority Table */}
            <div className="flex justify-center pl-8 mt-4">
              <table className="text-sm" style={{ tableLayout: 'fixed', width: '750px' }}>
                <colgroup>
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '17%' }} />
                  <col style={{ width: '17%' }} />
                  <col style={{ width: '24%' }} />
                  <col style={{ width: '24%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td colSpan="5" className="text-gray-700 font-semibold pb-2">
                      CODEC Priority
                    </td>
                  </tr>
                  <tr className="h-3" />
                  <tr className="text-center text-gray-700 font-medium">
                    <td>Check</td>
                    <td>Priority</td>
                    <td>CODEC</td>
                    <td>Packing Time</td>
                    <td>Bit Rate (kbs)</td>
                  </tr>
                  {codecData.map((item, index) => (
                    <tr key={index} className="text-center">
                      <td>
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => handleCodecCheckbox(index)}
                          className="h-4 w-4 accent-blue-600"
                        />
                      </td>
                      <td>{index + 1}</td>
                      <td>
                        <select
                          value={item.codec}
                          onChange={(e) => handleCodecChange(index, e.target.value)}
                          disabled={!item.enabled}
                          className="border border-gray-400 rounded-sm px-1"
                          style={{
                            height: '28px',
                            width: '120px',
                            backgroundColor: item.enabled ? '#ffffff' : '#e5e7eb',
                            cursor: item.enabled ? 'pointer' : 'not-allowed',
                            color: item.enabled ? '#000000' : '#6b7280',
                          }}
                        >
                          <option value="6">G711A</option>
                          <option value="7">G711U</option>
                          <option value="131">G729</option>
                          <option value="98">iLBC</option>
                          <option value="96">AMR</option>
                          <option value="4">G723</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={item.packingTime}
                          onChange={(e) => handlePackingTimeChange(index, e.target.value)}
                          disabled={!item.enabled}
                          className="border border-gray-400 rounded-sm px-1"
                          style={{
                            height: '28px',
                            width: '80px',
                            backgroundColor: item.enabled ? '#ffffff' : '#e5e7eb',
                            cursor: item.enabled ? 'pointer' : 'not-allowed',
                            color: item.enabled ? '#000000' : '#6b7280',
                          }}
                        >
                          {getPackingTimeOptions(item.codec).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={item.bitRate}
                          onChange={(e) => handleBitRateChange(index, e.target.value)}
                          disabled={!item.enabled}
                          className="border border-gray-400 rounded-sm px-1"
                          style={{
                            height: '28px',
                            width: '80px',
                            backgroundColor: item.enabled ? '#ffffff' : '#e5e7eb',
                            cursor: item.enabled ? 'pointer' : 'not-allowed',
                            color: item.enabled ? '#000000' : '#6b7280',
                          }}
                        >
                          {getBitRateOptions(item.codec, item.packingTime).map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  <tr className="h-3" />
                  <tr>
                    <td colSpan="5" className="text-gray-700 text-xs">
                      Note: At present, the maximum number of concurrent sessions supported by G723 encoding is 9. When the concurrent sessions are more than 9, the encoding of the next priority will be automatically used (it is recommended to configure G711A/U as the encoding of the next priority).
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="5" className="text-gray-700 text-xs pt-1">
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The maximum number of concurrent sessions supported by AMR/iLBC encoding is 15. When the concurrent sessions are more than 15, the encoding of the next priority will be automatically used (it is recommended to configure G711A/U as the encoding of the next priority).
                    </td>
                  </tr>
                  <tr className="h-4" />
                </tbody>
              </table>
            </div>
        </div>

        {/* Buttons */}
          <div className="flex justify-center gap-6 py-6">
            <button
              type="button"
            onClick={handleSave}
              style={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
                fontSize: '16px',
                borderRadius: '6px',
                minWidth: '100px',
                height: '42px',
                textTransform: 'none',
                padding: '6px 24px',
              boxShadow: '0 2px 8px #b3e0ff',
                border: '1px solid #0e8fd6',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)';
              }}
            >
              Save
            </button>
            <button
              type="button"
            onClick={handleReset}
              style={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
                fontSize: '16px',
                borderRadius: '6px',
                minWidth: '100px',
                height: '42px',
                textTransform: 'none',
                padding: '6px 24px',
              boxShadow: '0 2px 8px #b3e0ff',
                border: '1px solid #0e8fd6',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)';
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SipMediaPage;

