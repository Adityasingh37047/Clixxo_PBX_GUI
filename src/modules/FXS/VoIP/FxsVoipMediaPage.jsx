import React, { useState } from "react";
import { Alert, Checkbox } from "@mui/material";
import {
  C,
  Btn,
  checkboxSx,
  AdvancedPageShell,
  AdvancedBreadcrumb,
  advancedTableContainerStyle,
  advancedBlueBarStyle,
  nativeFieldInteraction,
  nativeFieldInputStyle,
  advancedFormBtnStyle,
  advancedFormInlineFooterStyle,
} from "../../../sections/advanced/advancedSharedUi";

const CODEC_PRIORITY_HEADING_COLOR = "#30415A";

const CodecPrioritySectionHeading = ({ title }) => (
  <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: CODEC_PRIORITY_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
);

const FxsVoipMediaPage = () => {
  // Media Parameters state
  const [formData, setFormData] = useState({
    dtmfTransmitMode: "0", // 0=RFC2833, 1=SIP INFO, 2=In-band
    rfc2833Payload: "101",
    rtpPortRange: "10000,20000",
    silenceSuppression: "0", // 0=Disable, 1=Enable
    jitterMode: "0", // 0=Static Mode, 1=Adaptive Mode
    jitterBuffer: "100",
    voiceGainOutput: "0",
  });

  // CODEC Priority state - 6 priorities
  const [codecData, setCodecData] = useState([
    { enabled: true, codec: "6", packingTime: "20", bitRate: "0" }, // Priority 1: G711A
    { enabled: true, codec: "7", packingTime: "20", bitRate: "0" }, // Priority 2: G711U
    { enabled: true, codec: "131", packingTime: "20", bitRate: "0" }, // Priority 3: G729
    { enabled: true, codec: "98", packingTime: "30", bitRate: "0" }, // Priority 4: iLBC
    { enabled: true, codec: "96", packingTime: "20", bitRate: "0" }, // Priority 5: AMR
    { enabled: true, codec: "4", packingTime: "30", bitRate: "1" }, // Priority 6: G723
  ]);

  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

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
      newCodecData[index].packingTime = "20";
      newCodecData[index].bitRate = "0";
    } else if (codec === 131) {
      // G729
      newCodecData[index].packingTime = "20";
      newCodecData[index].bitRate = "0";
    } else if (codec === 98) {
      // iLBC
      newCodecData[index].packingTime = "30";
      newCodecData[index].bitRate = "0";
    } else if (codec === 96) {
      // AMR
      newCodecData[index].packingTime = "20";
      newCodecData[index].bitRate = "0";
    } else if (codec === 4) {
      // G723
      newCodecData[index].packingTime = "30";
      newCodecData[index].bitRate = "1";
    }

    setCodecData(newCodecData);
  };

  const handlePackingTimeChange = (index, value) => {
    const newCodecData = [...codecData];
    const codec = parseInt(newCodecData[index].codec);

    // Validation for GSM and G723
    if (codec === 49 && value === "30") {
      alert("Please don't set coder=GSM and PktTime=30 at the same time!");
      return;
    }
    if (codec === 4 && value === "20") {
      alert("Please don't set coder=G723 and PktTime=20 at the same time!");
      return;
    }

    newCodecData[index].packingTime = value;

    // Update bit rate for iLBC based on packing time
    if (codec === 98) {
      if (value === "20" || value === "40") {
        newCodecData[index].bitRate = "1"; // 15.2
      } else if (value === "30") {
        newCodecData[index].bitRate = "0"; // 13.3
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
      return ["10", "20", "30", "40", "50", "60"];
    } else if (codec === 131) {
      // G729: 10, 20, 30, 40, 50, 60
      return ["10", "20", "30", "40", "50", "60"];
    } else if (codec === 98) {
      // iLBC: 20, 30
      return ["20", "30"];
    } else if (codec === 96) {
      // AMR: 20
      return ["20"];
    } else if (codec === 4) {
      // G723: 30
      return ["30"];
    }
    return [];
  };

  const getBitRateOptions = (codecValue, packingTime) => {
    const codec = parseInt(codecValue);
    if (codec === 7 || codec === 6) {
      // G711A/U: 64
      return [{ value: "0", label: "64" }];
    } else if (codec === 131) {
      // G729: 8
      return [{ value: "0", label: "8" }];
    } else if (codec === 98) {
      // iLBC: 13.3 or 15.2 based on packing time
      if (packingTime === "30") {
        return [{ value: "0", label: "13.3" }];
      } else {
        return [{ value: "1", label: "15.2" }];
      }
    } else if (codec === 96) {
      // AMR: 12.20
      return [{ value: "0", label: "12.20" }];
    } else if (codec === 4) {
      // G723: 6.3
      return [{ value: "1", label: "6.3" }];
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
    const portParts = formData.rtpPortRange.split(",");
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
      alert(
        "The difference between the latter 'RTP Port' and the former should be no less than 480!",
      );
      return false;
    }

    // Validate JitterBuffer
    if (formData.jitterMode === "0") {
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
      alert(
        "The value of 'Voice Gain Output from IP' must be a multiple of 3!",
      );
      return false;
    }

    // Validate at least one CODEC is selected
    const enabledCodecs = codecData.filter((item) => item.enabled);
    if (enabledCodecs.length === 0) {
      alert("Please select a CODEC!");
      return false;
    }

    // Validate no duplicate CODECs
    const codecValues = enabledCodecs.map((item) => item.codec);
    const uniqueCodecs = new Set(codecValues);
    if (uniqueCodecs.size !== codecValues.length) {
      alert("Please choose a different CODEC!");
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
    setFormData({
      dtmfTransmitMode: "0",
      rfc2833Payload: "101",
      rtpPortRange: "10000,20000",
      silenceSuppression: "0",
      jitterMode: "0",
      jitterBuffer: "100",
      voiceGainOutput: "0",
    });
    setCodecData([
      { enabled: true, codec: "6", packingTime: "20", bitRate: "0" },
      { enabled: true, codec: "7", packingTime: "20", bitRate: "0" },
      { enabled: true, codec: "131", packingTime: "20", bitRate: "0" },
      { enabled: true, codec: "98", packingTime: "30", bitRate: "0" },
      { enabled: true, codec: "96", packingTime: "20", bitRate: "0" },
      { enabled: true, codec: "4", packingTime: "30", bitRate: "1" },
    ]);
  };

  const handleKeyPress = (e, type) => {
    const key = e.keyCode || e.which;
    // Allow digits (48-57), comma (44), minus (45), backspace (8)
    if (type === "number") {
      if (!((key > 47 && key < 58) || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-comma") {
      if (!((key > 47 && key < 58) || key === 44 || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-minus") {
      if (!((key > 47 && key < 58) || key === 45 || key === 8)) {
        e.preventDefault();
      }
    }
  };

  const fieldStyle = {
    ...nativeFieldInputStyle,
    width: 220,
  };

  const getFieldInteraction = (disabled = false) =>
    disabled ? {} : nativeFieldInteraction;

  const codecSelectStyle = (enabled, width) => ({
    ...nativeFieldInputStyle,
    width,
    backgroundColor: enabled ? "#ffffff" : "#e5e7eb",
    cursor: enabled ? "pointer" : "not-allowed",
    color: enabled ? C.valueText : "#6b7280",
  });

  const labelColStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: C.labelText,
    flex: "0 0 48%",
    maxWidth: "48%",
    paddingRight: 24,
    textAlign: "left",
    lineHeight: 1.35,
  };

  const valueColStyle = {
    flex: "1 1 52%",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  };

  const controlSlotStyle = {
    width: 220,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  const mediaParameterRows = [
    {
      label: "DTMF Transmit Mode",
      type: "select",
      name: "dtmfTransmitMode",
      options: [
        { value: "0", label: "RFC2833" },
        { value: "1", label: "SIP INFO" },
        { value: "2", label: "In-band" },
      ],
    },
    {
      label: "RFC2833 Payload",
      type: "text",
      name: "rfc2833Payload",
      keyPress: "number",
    },
    {
      label: "RTP Port Range",
      type: "text",
      name: "rtpPortRange",
      keyPress: "number-comma",
    },
    {
      label: "Silence Suppression",
      type: "select",
      name: "silenceSuppression",
      options: [
        { value: "0", label: "Disable" },
        { value: "1", label: "Enable" },
      ],
    },
    {
      label: "JitterMode",
      type: "select",
      name: "jitterMode",
      options: [{ value: "0", label: "Static Mode" }],
    },
    {
      label: "JitterBuffer(ms)",
      type: "text",
      name: "jitterBuffer",
      keyPress: "number",
    },
    {
      label: "Voice Gain Output from IP (dB)",
      type: "text",
      name: "voiceGainOutput",
      keyPress: "number-minus",
    },
  ];

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
      <AdvancedBreadcrumb current="Media Parameters" />
      <div style={{ ...advancedTableContainerStyle, marginBottom: 0 }}>
        <div style={advancedBlueBarStyle}>
          <span>Media Parameters</span>
        </div>
        <div style={{ padding: "24px 32px 0" }}>
          <div
            className="flex flex-col gap-3"
            style={{
              width: "100%",
              maxWidth: 640,
              margin: "0 auto",
            }}
          >
            {mediaParameterRows.map((row) => (
              <div key={row.name} className="flex flex-row items-start w-full">
                <label style={labelColStyle}>{row.label}</label>
                <div style={valueColStyle}>
                  <div style={controlSlotStyle}>
                    {row.type === "select" ? (
                      <select
                        name={row.name}
                        value={formData[row.name]}
                        onChange={handleInputChange}
                        style={fieldStyle}
                        {...nativeFieldInteraction}
                      >
                        {row.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={row.name}
                        value={formData[row.name]}
                        onChange={handleInputChange}
                        onKeyPress={(e) =>
                          handleKeyPress(e, row.keyPress || "number")
                        }
                        style={fieldStyle}
                        {...nativeFieldInteraction}
                        maxLength="31"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CODEC Priority Table */}
          <div style={{ width: "100%", marginTop: 16 }}>
            <CodecPrioritySectionHeading title="CODEC Priority" />
            <div style={{ display: "flex", justifyContent: "center" }}>
              <table
                style={{
                  tableLayout: "fixed",
                  width: "100%",
                  maxWidth: 860,
                  fontSize: 13,
                }}
              >
                <colgroup>
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "24%" }} />
                </colgroup>
                <tbody>
                  <tr
                    style={{
                      textAlign: "center",
                      color: C.labelText,
                      fontWeight: 600,
                    }}
                  >
                    <td>Check</td>
                    <td>Priority</td>
                    <td>CODEC</td>
                    <td>Packing Time</td>
                    <td>Bit Rate (kbs)</td>
                  </tr>
                  {codecData.map((item, index) => (
                    <tr
                      key={index}
                      style={{ textAlign: "center", color: C.valueText }}
                    >
                      <td>
                        <Checkbox
                          size="small"
                          checked={item.enabled}
                          onChange={() => handleCodecCheckbox(index)}
                          sx={checkboxSx}
                        />
                      </td>
                      <td>{index + 1}</td>
                      <td>
                        <select
                          value={item.codec}
                          onChange={(e) =>
                            handleCodecChange(index, e.target.value)
                          }
                          disabled={!item.enabled}
                          style={codecSelectStyle(item.enabled, 120)}
                          {...getFieldInteraction(!item.enabled)}
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
                          onChange={(e) =>
                            handlePackingTimeChange(index, e.target.value)
                          }
                          disabled={!item.enabled}
                          style={codecSelectStyle(item.enabled, 80)}
                          {...getFieldInteraction(!item.enabled)}
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
                          onChange={(e) =>
                            handleBitRateChange(index, e.target.value)
                          }
                          disabled={!item.enabled}
                          style={codecSelectStyle(item.enabled, 80)}
                          {...getFieldInteraction(!item.enabled)}
                        >
                          {getBitRateOptions(item.codec, item.packingTime).map(
                            (opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ),
                          )}
                        </select>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ height: 10 }} />
                  <tr>
                    <td
                      colSpan="5"
                      style={{ color: C.mutedText, fontSize: 11 }}
                    >
                      Note: At present, the maximum number of concurrent
                      sessions supported by G723 encoding is 9. When the
                      concurrent sessions are more than 9, the encoding of the
                      next priority will be automatically used (it is
                      recommended to configure G711A/U as the encoding of the
                      next priority).
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        color: C.mutedText,
                        fontSize: 11,
                        paddingTop: 4,
                      }}
                    >
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The
                      maximum number of concurrent sessions supported by
                      AMR/iLBC encoding is 15. When the concurrent sessions are
                      more than 15, the encoding of the next priority will be
                      automatically used (it is recommended to configure G711A/U
                      as the encoding of the next priority).
                    </td>
                  </tr>
                  <tr style={{ height: 12 }} />
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div style={advancedFormInlineFooterStyle}>
          <Btn type="button" onClick={handleSave} variant="primary" style={advancedFormBtnStyle}>
            Save
          </Btn>
          <Btn type="button" onClick={handleReset} variant="cancel" style={advancedFormBtnStyle}>
            Reset
          </Btn>
        </div>
      </div>
    </AdvancedPageShell>
  );
};

export default FxsVoipMediaPage;
