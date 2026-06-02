import React, { useState } from "react";
import { FXS_INITIAL_FORM } from "../../../sections/advanced/constants/FxsConstants";
import { Alert } from "@mui/material";
import {
  Btn,
  C,
  FormEnableCheckbox,
  AdvancedBreadcrumb,
  AdvancedPageShell,
  AdvancedFormCard,
  advancedFormBtnStyle,
  nativeFieldInputStyle,
  nativeFieldSelectStyle,
  nativeFieldInteraction,
} from "../../../sections/advanced/advancedSharedUi";

const inputStyle = nativeFieldInputStyle;
const selectStyle = nativeFieldSelectStyle;
const fieldInteraction = nativeFieldInteraction;

const labelCellStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  paddingRight: 24,
  textAlign: "left",
  verticalAlign: "middle",
};

const FxsPage = () => {
  // Form state
  const [formData, setFormData] = useState(FXS_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // Keep existing alert(...) calls, but render them as toast notifications.
  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleKeyPress = (e, type) => {
    const key = e.keyCode || e.which;
    // Allow digits (48-57), comma (44), minus (45), backspace (8)
    if (type === "number") {
      if (!((key > 47 && key < 58) || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-comma-minus") {
      // For ringMode field
      if (!((key > 47 && key < 58) || key === 44 || key === 45 || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-minus") {
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
      const strArr = formData.ringMode.split(",");
      if (strArr[0] === "1") {
        if (strArr.length !== 3) {
          alert("Please input a ringing mode in the right format for Scheme!");
          return false;
        }
        const sum = parseInt(strArr[1]) + parseInt(strArr[2]);
        if (sum > 16000) {
          alert(
            "The sum duration at ON/OFF state for ringing scheme cannot be more than 16000ms！",
          );
          return false;
        }
        if (parseInt(strArr[1]) > 12000 || parseInt(strArr[2]) > 12000) {
          alert(
            "The duration at ON/OFF state for ringing scheme cannot be more than 12000ms！",
          );
          return false;
        }
        const minKeepTime = 50;
        if (
          parseInt(strArr[1]) < minKeepTime ||
          parseInt(strArr[2]) < minKeepTime
        ) {
          alert(
            "The duration at ON/OFF state for ringing scheme cannot be less than 50ms!",
          );
          return false;
        }
      } else if (strArr[0] === "2") {
        if (strArr.length !== 5) {
          alert("Please input a ringing mode in the right format for Scheme!");
          return false;
        }
        const sum =
          parseInt(strArr[1]) +
          parseInt(strArr[2]) +
          parseInt(strArr[3]) +
          parseInt(strArr[4]);
        if (sum > 16000) {
          alert(
            "The sum duration at ON/OFF state for ringing scheme cannot be more than 16000ms！",
          );
          return false;
        }
        if (
          parseInt(strArr[1]) > 12000 ||
          parseInt(strArr[2]) > 12000 ||
          parseInt(strArr[3]) > 12000 ||
          parseInt(strArr[4]) > 12000
        ) {
          alert(
            "The duration at ON/OFF state for ringing scheme cannot be more than 12000ms！",
          );
          return false;
        }
        const minKeepTime = 50;
        if (
          parseInt(strArr[1]) < minKeepTime ||
          parseInt(strArr[2]) < minKeepTime ||
          parseInt(strArr[3]) < minKeepTime ||
          parseInt(strArr[4]) < minKeepTime
        ) {
          alert(
            "The duration at ON/OFF state for ringing scheme cannot be less than 50ms!",
          );
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
        alert(
          "The minimum time for Hook-flash detection must be longer than 80ms!",
        );
        return false;
      }
      if (hookFlashMinTime > hookFlashMaxTime) {
        alert(
          "The minimum time for Hook-flash detection can not exceed the maximum time!",
        );
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
        alert(
          "The minimum time length of on-hook detection must be in the range of 64ms~2000ms!",
        );
        return false;
      }
    }

    // Validate Off-hook Dither Signal Duration
    const offHookDither = parseInt(formData.offHookDitherSignalDuration);
    if (offHookDither <= 0 || offHookDither % 16 !== 0) {
      alert(
        "Off-hook Dither Signal Duration must be longer than 0 and the integral times of 16!",
      );
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      alert("Settings saved successfully!");
    }
  };

  const handleReset = () => {
    setFormData({ ...FXS_INITIAL_FORM });
  };

  const renderEnableCheckbox = (name, label = "Enable") => (
    <FormEnableCheckbox
      name={name}
      checked={!!formData[name]}
      onChange={handleInputChange}
      label={label}
    />
  );

  return (
    <AdvancedPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {toast.msg}
        </Alert>
      )}
      <AdvancedBreadcrumb current="FXS" />
      <AdvancedFormCard
        title="FXS"
        footer={
          <>
            <Btn
              variant="primary"
              onClick={handleSave}
              style={advancedFormBtnStyle}
            >
              Save
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleReset}
              style={advancedFormBtnStyle}
            >
              Reset
            </Btn>
          </>
        }
      >
            <div style={{ width: "100%", maxWidth: 750, margin: "0 auto" }}>
              <table
                className="text-sm"
                style={{ tableLayout: "fixed", width: "750px" }}
              >
                <colgroup>
                  <col style={{ width: "48%" }} />
                  <col style={{ width: "52%" }} />
                </colgroup>
                <tbody>
                  {/* Tone Energy (dB) */}
                  <tr>
                    <td style={labelCellStyle}>Tone Energy (dB)</td>
                    <td style={{ textAlign: "left" }}>
                      <input
                        type="text"
                        name="toneEnergy"
                        value={formData.toneEnergy}
                        onChange={handleInputChange}
                        onKeyPress={(e) => handleKeyPress(e, "number-minus")}
                        style={inputStyle}
                        {...fieldInteraction}
                        maxLength="20"
                      />
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Ringing Scheme Setting */}
                  <tr>
                    <td style={labelCellStyle}>
                      Ringing Scheme Setting
                    </td>
                    <td className="align-middle text-left">
                      {renderEnableCheckbox("ringingSchemeEnabled")}
                    </td>
                  </tr>

                  {/* Ringing Mode - conditional */}
                  {formData.ringingSchemeEnabled && (
                    <>
                      <tr className="h-3" />
                      <tr>
                        <td style={labelCellStyle}>
                          Ringing Mode
                        </td>
                        <td className="align-middle text-left">
                          <input
                            type="text"
                            name="ringMode"
                            value={formData.ringMode}
                            onChange={handleInputChange}
                            onKeyPress={(e) =>
                              handleKeyPress(e, "number-comma-minus")
                            }
                            style={inputStyle}
                        {...fieldInteraction}
                            maxLength="128"
                          />
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="h-3" />

                  {/* Hook-flash Detection */}
                  <tr>
                    <td style={labelCellStyle}>
                      Hook-flash Detection
                    </td>
                    <td className="align-middle text-left">
                      {renderEnableCheckbox("hookFlashDetection")}
                    </td>
                  </tr>

                  {/* Minimum Time Length of On-hook Detection - shown when Hook-flash Detection is unchecked */}
                  {!formData.hookFlashDetection && (
                    <>
                      <tr className="h-3" />
                      <tr>
                        <td style={labelCellStyle}>
                          Minimum Time Length of On-hook Detection (ms)
                        </td>
                        <td className="align-middle text-left">
                          <input
                            type="text"
                            name="minHangupTime"
                            value={formData.minHangupTime}
                            onChange={handleInputChange}
                            onKeyPress={(e) => handleKeyPress(e, "number")}
                            style={inputStyle}
                        {...fieldInteraction}
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
                        <td style={labelCellStyle}>
                          Minimum Time (ms)
                        </td>
                        <td className="align-middle text-left">
                          <input
                            type="text"
                            name="hookFlashMinTime"
                            value={formData.hookFlashMinTime}
                            onChange={handleInputChange}
                            onKeyPress={(e) => handleKeyPress(e, "number")}
                            style={inputStyle}
                        {...fieldInteraction}
                            maxLength="5"
                          />
                        </td>
                      </tr>
                      <tr className="h-3" />
                      <tr>
                        <td style={labelCellStyle}>
                          Maximum Time (ms)
                        </td>
                        <td className="align-middle text-left">
                          <input
                            type="text"
                            name="hookFlashMaxTime"
                            value={formData.hookFlashMaxTime}
                            onChange={handleInputChange}
                            onKeyPress={(e) => handleKeyPress(e, "number")}
                            style={inputStyle}
                        {...fieldInteraction}
                            maxLength="5"
                          />
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="h-3" />

                  {/* Preferred 18x Response */}
                  <tr>
                    <td style={labelCellStyle}>
                      Preferred 18x Response (NO valid P_Early_Media)
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="preferred18xResponse"
                        value={formData.preferred18xResponse}
                        onChange={handleInputChange}
                        style={selectStyle}
                        {...fieldInteraction}
                      >
                        <option value="0">IMS Ringback</option>
                        <option value="1">Local Ringback</option>
                      </select>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Enable Press-Key Call-Forward */}
                  <tr>
                    <td style={labelCellStyle}>
                      Enable Press-Key Call-Forward
                    </td>
                    <td className="align-middle text-left">
                      {renderEnableCheckbox("pressKeyCallForward")}
                    </td>
                  </tr>

                  {/* Call-Forward Key - conditional */}
                  {formData.pressKeyCallForward && (
                    <>
                      <tr className="h-3" />
                      <tr>
                        <td style={labelCellStyle}>
                          Call-Forward Key
                        </td>
                        <td className="align-middle text-left">
                          <select
                            name="callForwardKey"
                            value={formData.callForwardKey}
                            onChange={handleInputChange}
                            style={selectStyle}
                        {...fieldInteraction}
                          >
                            <option value="35">#</option>
                            <option value="42">*</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="h-3" />
                      <tr>
                        <td style={labelCellStyle}>
                          Call-Forward Method
                        </td>
                        <td className="align-middle text-left">
                          <select
                            name="callForwardMethod"
                            value={formData.callForwardMethod}
                            onChange={handleInputChange}
                            style={selectStyle}
                        {...fieldInteraction}
                          >
                            <option value="0">
                              Call Forward with Negotiation
                            </option>
                            <option value="1">Blind Transfer</option>
                          </select>
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="h-3" />

                  {/* CID Transmit Mode */}
                  <tr>
                    <td style={labelCellStyle}>
                      CID Transmit Mode
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="cidTransmitMode"
                        value={formData.cidTransmitMode}
                        onChange={handleInputChange}
                        style={selectStyle}
                        {...fieldInteraction}
                      >
                        <option value="0">DTMF</option>
                        <option value="1">FSK</option>
                      </select>
                    </td>
                  </tr>

                  {/* Occasion to Send FSK CallerID - shown when CID Transmit Mode is FSK */}
                  {formData.cidTransmitMode === "1" && (
                    <>
                      <tr className="h-3" />
                      <tr>
                        <td style={labelCellStyle}>
                          Occasion to Send FSK CallerID
                        </td>
                        <td className="align-middle text-left">
                          <select
                            name="occasionToSendFSKCallerID"
                            value={formData.occasionToSendFSKCallerID}
                            onChange={handleInputChange}
                            style={selectStyle}
                        {...fieldInteraction}
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
                    <td style={labelCellStyle}>
                      Send Polarity Reversal Signal
                    </td>
                    <td className="align-middle text-left">
                      {renderEnableCheckbox("sendPolarityReversal")}
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Off-hook Dither Signal Duration */}
                  <tr>
                    <td style={labelCellStyle}>
                      Off-hook Dither Signal Duration (ms)
                    </td>
                    <td className="align-middle text-left">
                      <input
                        type="text"
                        name="offHookDitherSignalDuration"
                        value={formData.offHookDitherSignalDuration}
                        onChange={handleInputChange}
                        onKeyPress={(e) => handleKeyPress(e, "number")}
                        style={inputStyle}
                        {...fieldInteraction}
                        maxLength="5"
                      />
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Handling of Call from Internal Station */}
                  <tr>
                    <td style={labelCellStyle}>
                      Handling of Call from Internal Station
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="handlingOfCallFromInternalStation"
                        value={formData.handlingOfCallFromInternalStation}
                        onChange={handleInputChange}
                        style={selectStyle}
                        {...fieldInteraction}
                      >
                        <option value="0">Internal Handling</option>
                        <option value="1">Platform Handling</option>
                      </select>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Light Up Mode for Voice Message */}
                  <tr>
                    <td style={labelCellStyle}>
                      Light Up Mode for Voice Message
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="lightUpModeForVoiceMessage"
                        value={formData.lightUpModeForVoiceMessage}
                        onChange={handleInputChange}
                        style={selectStyle}
                        {...fieldInteraction}
                      >
                        <option value="0">Not Light Up</option>
                        <option value="1">FSK Light Up</option>
                      </select>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Open Session In Advance */}
                  <tr>
                    <td style={labelCellStyle}>
                      Open Session In Advance
                    </td>
                    <td className="align-middle text-left">
                      {renderEnableCheckbox("openSessionInAdvance")}
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Report FXS Status */}
                  <tr>
                    <td style={labelCellStyle}>
                      Report FXS Status
                    </td>
                    <td className="align-middle text-left">
                      {renderEnableCheckbox("reportFXSStatus")}
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Enable Send DTMF while receiving 183 */}
                  <tr>
                    <td style={labelCellStyle}>
                      Enable Send DTMF while receiving 183
                    </td>
                    <td className="align-middle text-left">
                      {renderEnableCheckbox("enableSendDTMFWhileReceiving183")}
                    </td>
                  </tr>
                  <tr className="h-4" />
                </tbody>
              </table>
            </div>

      </AdvancedFormCard>
    </AdvancedPageShell>
  );
};

export default FxsPage;
