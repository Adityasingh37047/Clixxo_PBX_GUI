import React, { useState } from 'react';
import { FXS_INITIAL_FORM } from './constants/FxsConstants';

const FxsPage = () => {
  // Form state
  const [formData, setFormData] = useState(FXS_INITIAL_FORM);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleKeyPress = (e, type) => {
    const key = e.keyCode || e.which;
    // Allow digits (48-57), comma (44), minus (45), backspace (8)
    if (type === 'number') {
      if (!((key > 47 && key < 58) || key === 8)) {
        e.preventDefault();
      }
    } else if (type === 'number-comma-minus') {
      // For ringMode field
      if (!((key > 47 && key < 58) || key === 44 || key === 45 || key === 8)) {
        e.preventDefault();
      }
    } else if (type === 'number-minus') {
      // For fields that allow negative numbers
      if (!((key > 47 && key < 58) || key === 45 || key === 8)) {
        e.preventDefault();
      }
    }
  };

  const validateForm = () => {
    // Validate Ringing Mode if enabled
    if (formData.ringingSchemeEnabled && !formData.ringMode) {
      alert("Please input a ringing mode for Scheme!");
      return false;
    }

    if (formData.ringingSchemeEnabled && formData.ringMode) {
      const strArr = formData.ringMode.split(',');
      if (strArr[0] === '1') {
        if (strArr.length !== 3) {
          alert("Please input a ringing mode in the right format for Scheme!");
          return false;
        }
        const sum = parseInt(strArr[1]) + parseInt(strArr[2]);
        if (sum > 16000) {
          alert("The sum duration at ON/OFF state for ringing scheme cannot be more than 16000ms！");
          return false;
        }
        if (parseInt(strArr[1]) > 12000 || parseInt(strArr[2]) > 12000) {
          alert("The duration at ON/OFF state for ringing scheme cannot be more than 12000ms！");
          return false;
        }
        const minKeepTime = 50;
        if (parseInt(strArr[1]) < minKeepTime || parseInt(strArr[2]) < minKeepTime) {
          alert("The duration at ON/OFF state for ringing scheme cannot be less than 50ms!");
          return false;
        }
      } else if (strArr[0] === '2') {
        if (strArr.length !== 5) {
          alert("Please input a ringing mode in the right format for Scheme!");
          return false;
        }
        const sum = parseInt(strArr[1]) + parseInt(strArr[2]) + parseInt(strArr[3]) + parseInt(strArr[4]);
        if (sum > 16000) {
          alert("The sum duration at ON/OFF state for ringing scheme cannot be more than 16000ms！");
          return false;
        }
        if (parseInt(strArr[1]) > 12000 || parseInt(strArr[2]) > 12000 || parseInt(strArr[3]) > 12000 || parseInt(strArr[4]) > 12000) {
          alert("The duration at ON/OFF state for ringing scheme cannot be more than 12000ms！");
          return false;
        }
        const minKeepTime = 50;
        if (parseInt(strArr[1]) < minKeepTime || parseInt(strArr[2]) < minKeepTime || parseInt(strArr[3]) < minKeepTime || parseInt(strArr[4]) < minKeepTime) {
          alert("The duration at ON/OFF state for ringing scheme cannot be less than 50ms!");
          return false;
        }
      } else {
        alert("Please input a ringing mode in the right format for Scheme!");
        return false;
      }
    }

    // Validate Tone Energy
    const toneEnergy = parseInt(formData.toneEnergy);
    if (isNaN(toneEnergy) || toneEnergy < -35 || toneEnergy > 15) {
      alert("The value range of 'Tone Energy' is -35~15dB!");
      return false;
    }

    // Validate Hook-flash times if enabled
    if (formData.hookFlashDetection) {
      const hookFlashMinTime = parseInt(formData.hookFlashMinTime);
      const hookFlashMaxTime = parseInt(formData.hookFlashMaxTime);

      if (hookFlashMinTime < 80) {
        alert("The minimum time for Hook-flash detection must be longer than 80ms!");
        return false;
      }
      if (hookFlashMinTime > hookFlashMaxTime) {
        alert("The minimum time for Hook-flash detection can not exceed the maximum time!");
        return false;
      }
      if (hookFlashMaxTime < 80 || hookFlashMaxTime > 2000) {
        alert("The value range of 'Flash Signal Detection' is 80~2000ms");
        return false;
      }
    } else {
      // Validate Minimum Time Length of On-hook Detection
      const minHangupTime = parseInt(formData.minHangupTime);
      if (minHangupTime < 64 || minHangupTime > 2000) {
        alert("The minimum time length of on-hook detection must be in the range of 64ms~2000ms!");
        return false;
      }
    }

    // Validate Off-hook Dither Signal Duration
    const offHookDither = parseInt(formData.offHookDitherSignalDuration);
    if (offHookDither <= 0 || offHookDither % 16 !== 0) {
      alert("Off-hook Dither Signal Duration must be longer than 0 and the integral times of 16!");
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
    setFormData({ ...FXS_INITIAL_FORM });
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
            <span>FXS</span>
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
                  {/* Tone Energy (dB) */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      Tone Energy (dB)
                    </td>
                    <td className="align-middle text-left">
                      <input
                        type="text"
                        name="toneEnergy"
                        value={formData.toneEnergy}
                        onChange={handleInputChange}
                        onKeyPress={(e) => handleKeyPress(e, 'number-minus')}
                        className="border border-gray-400 rounded-sm px-2 bg-white"
                        style={{ height: '28px', width: '200px' }}
                        maxLength="20"
                      />
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Ringing Scheme Setting */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      Ringing Scheme Setting
                    </td>
                    <td className="align-middle text-left">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="ringingSchemeEnabled"
                          checked={formData.ringingSchemeEnabled}
                          onChange={handleInputChange}
                          className="h-4 w-4 accent-blue-600"
                        />
                        <span className="text-gray-700">Enable</span>
                      </label>
                    </td>
                  </tr>

                  {/* Ringing Mode - conditional */}
                  {formData.ringingSchemeEnabled && (
                    <>
                      <tr className="h-3" />
                      <tr>
                        <td className="align-middle text-gray-700 pr-12 text-left">
                          Ringing Mode
                        </td>
                        <td className="align-middle text-left">
                          <input
                            type="text"
                            name="ringMode"
                            value={formData.ringMode}
                            onChange={handleInputChange}
                            onKeyPress={(e) => handleKeyPress(e, 'number-comma-minus')}
                            className="border border-gray-400 rounded-sm px-2 bg-white"
                            style={{ height: '28px', width: '250px' }}
                            maxLength="128"
                          />
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="h-3" />

                  {/* Hook-flash Detection */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      Hook-flash Detection
                    </td>
                    <td className="align-middle text-left">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="hookFlashDetection"
                          checked={formData.hookFlashDetection}
                          onChange={handleInputChange}
                          className="h-4 w-4 accent-blue-600"
                        />
                        <span className="text-gray-700">Enable</span>
                      </label>
                    </td>
                  </tr>

                  {/* Minimum Time Length of On-hook Detection - shown when Hook-flash Detection is unchecked */}
                  {!formData.hookFlashDetection && (
                    <>
                      <tr className="h-3" />
                      <tr>
                        <td className="align-middle text-gray-700 pr-12 text-left">
                          Minimum Time Length of On-hook Detection (ms)
                        </td>
                        <td className="align-middle text-left">
                          <input
                            type="text"
                            name="minHangupTime"
                            value={formData.minHangupTime}
                            onChange={handleInputChange}
                            onKeyPress={(e) => handleKeyPress(e, 'number')}
                            className="border border-gray-400 rounded-sm px-2 bg-white"
                            style={{ height: '28px', width: '200px' }}
                            maxLength="5"
                          />
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Minimum Time and Maximum Time - shown when Hook-flash Detection is checked */}
                  {formData.hookFlashDetection && (
                    <>
                      <tr className="h-3" />
                      <tr>
                        <td className="align-middle text-gray-700 pr-12 text-left">
                          Minimum Time (ms)
                        </td>
                        <td className="align-middle text-left">
                          <input
                            type="text"
                            name="hookFlashMinTime"
                            value={formData.hookFlashMinTime}
                            onChange={handleInputChange}
                            onKeyPress={(e) => handleKeyPress(e, 'number')}
                            className="border border-gray-400 rounded-sm px-2 bg-white"
                            style={{ height: '28px', width: '200px' }}
                            maxLength="5"
                          />
                        </td>
                      </tr>
                      <tr className="h-3" />
                      <tr>
                        <td className="align-middle text-gray-700 pr-12 text-left">
                          Maximum Time (ms)
                        </td>
                        <td className="align-middle text-left">
                          <input
                            type="text"
                            name="hookFlashMaxTime"
                            value={formData.hookFlashMaxTime}
                            onChange={handleInputChange}
                            onKeyPress={(e) => handleKeyPress(e, 'number')}
                            className="border border-gray-400 rounded-sm px-2 bg-white"
                            style={{ height: '28px', width: '200px' }}
                            maxLength="5"
                          />
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="h-3" />

                  {/* Preferred 18x Response */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      Preferred 18x Response (NO valid P_Early_Media)
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="preferred18xResponse"
                        value={formData.preferred18xResponse}
                        onChange={handleInputChange}
                        className="border border-gray-400 rounded-sm px-1 bg-white"
                        style={{ height: '28px', width: '200px' }}
                      >
                        <option value="0">IMS Ringback</option>
                        <option value="1">Local Ringback</option>
                      </select>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Enable Press-Key Call-Forward */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      Enable Press-Key Call-Forward
                    </td>
                    <td className="align-middle text-left">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="pressKeyCallForward"
                          checked={formData.pressKeyCallForward}
                          onChange={handleInputChange}
                          className="h-4 w-4 accent-blue-600"
                        />
                        <span className="text-gray-700">Enable</span>
                      </label>
                    </td>
                  </tr>

                  {/* Call-Forward Key - conditional */}
                  {formData.pressKeyCallForward && (
                    <>
                      <tr className="h-3" />
                      <tr>
                        <td className="align-middle text-gray-700 pr-12 text-left">
                          Call-Forward Key
                        </td>
                        <td className="align-middle text-left">
                          <select
                            name="callForwardKey"
                            value={formData.callForwardKey}
                            onChange={handleInputChange}
                            className="border border-gray-400 rounded-sm px-1 bg-white"
                            style={{ height: '28px', width: '200px' }}
                          >
                            <option value="35">#</option>
                            <option value="42">*</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="h-3" />
                      <tr>
                        <td className="align-middle text-gray-700 pr-12 text-left">
                          Call-Forward Method
                        </td>
                        <td className="align-middle text-left">
                          <select
                            name="callForwardMethod"
                            value={formData.callForwardMethod}
                            onChange={handleInputChange}
                            className="border border-gray-400 rounded-sm px-1 bg-white"
                            style={{ height: '28px', width: '200px' }}
                          >
                            <option value="0">Call Forward with Negotiation</option>
                            <option value="1">Blind Transfer</option>
                          </select>
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="h-3" />

                  {/* CID Transmit Mode */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      CID Transmit Mode
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="cidTransmitMode"
                        value={formData.cidTransmitMode}
                        onChange={handleInputChange}
                        className="border border-gray-400 rounded-sm px-1 bg-white"
                        style={{ height: '28px', width: '200px' }}
                      >
                        <option value="0">DTMF</option>
                        <option value="1">FSK</option>
                      </select>
                    </td>
                  </tr>

                  {/* Occasion to Send FSK CallerID - shown when CID Transmit Mode is FSK */}
                  {formData.cidTransmitMode === '1' && (
                    <>
                      <tr className="h-3" />
                      <tr>
                        <td className="align-middle text-gray-700 pr-12 text-left">
                          Occasion to Send FSK CallerID
                        </td>
                        <td className="align-middle text-left">
                          <select
                            name="occasionToSendFSKCallerID"
                            value={formData.occasionToSendFSKCallerID}
                            onChange={handleInputChange}
                            className="border border-gray-400 rounded-sm px-1 bg-white"
                            style={{ height: '28px', width: '200px' }}
                          >
                            <option value="0">Before ring</option>
                            <option value="1">After the first ring</option>
                          </select>
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="h-3" />

                  {/* Send Polarity Reversal Signal */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      Send Polarity Reversal Signal
                    </td>
                    <td className="align-middle text-left">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="sendPolarityReversal"
                          checked={formData.sendPolarityReversal}
                          onChange={handleInputChange}
                          className="h-4 w-4 accent-blue-600"
                        />
                        <span className="text-gray-700">Enable</span>
                      </label>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Off-hook Dither Signal Duration */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      Off-hook Dither Signal Duration (ms)
                    </td>
                    <td className="align-middle text-left">
                      <input
                        type="text"
                        name="offHookDitherSignalDuration"
                        value={formData.offHookDitherSignalDuration}
                        onChange={handleInputChange}
                        onKeyPress={(e) => handleKeyPress(e, 'number')}
                        className="border border-gray-400 rounded-sm px-2 bg-white"
                        style={{ height: '28px', width: '200px' }}
                        maxLength="5"
                      />
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Handling of Call from Internal Station */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      Handling of Call from Internal Station
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="handlingOfCallFromInternalStation"
                        value={formData.handlingOfCallFromInternalStation}
                        onChange={handleInputChange}
                        className="border border-gray-400 rounded-sm px-1 bg-white"
                        style={{ height: '28px', width: '200px' }}
                      >
                        <option value="0">Internal Handling</option>
                        <option value="1">Platform Handling</option>
                      </select>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Light Up Mode for Voice Message */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      Light Up Mode for Voice Message
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="lightUpModeForVoiceMessage"
                        value={formData.lightUpModeForVoiceMessage}
                        onChange={handleInputChange}
                        className="border border-gray-400 rounded-sm px-1 bg-white"
                        style={{ height: '28px', width: '200px' }}
                      >
                        <option value="0">Not Light Up</option>
                        <option value="1">FSK Light Up</option>
                      </select>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Open Session In Advance */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      Open Session In Advance
                    </td>
                    <td className="align-middle text-left">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="openSessionInAdvance"
                          checked={formData.openSessionInAdvance}
                          onChange={handleInputChange}
                          className="h-4 w-4 accent-blue-600"
                        />
                        <span className="text-gray-700">Enable</span>
                      </label>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Report FXS Status */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      Report FXS Status
                    </td>
                    <td className="align-middle text-left">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="reportFXSStatus"
                          checked={formData.reportFXSStatus}
                          onChange={handleInputChange}
                          className="h-4 w-4 accent-blue-600"
                        />
                        <span className="text-gray-700">Enable</span>
                      </label>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Enable Send DTMF while receiving 183 */}
                  <tr>
                    <td className="align-middle text-gray-700 pr-12 text-left">
                      Enable Send DTMF while receiving 183
                    </td>
                    <td className="align-middle text-left">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="enableSendDTMFWhileReceiving183"
                          checked={formData.enableSendDTMFWhileReceiving183}
                          onChange={handleInputChange}
                          className="h-4 w-4 accent-blue-600"
                        />
                        <span className="text-gray-700">Enable</span>
                      </label>
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

export default FxsPage;

