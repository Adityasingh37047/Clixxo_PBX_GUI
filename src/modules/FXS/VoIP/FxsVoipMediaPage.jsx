import React, { useState } from "react";
import {
  Alert,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Checkbox,
  TextField,
  Button,
} from "@mui/material";

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#2563eb",
  successGreen: "#22c55e",
  errorRed: "#ef4444",
  purple: "#8b5cf6",
};
// ── Shared UI Components ──────────────────────────────────────────────────────
const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f3f4f6",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 8px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `0.5px solid #9ca3af`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const FieldRow = ({ label, children, required, align = "center" }) => (
  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 220,
        flexShrink: 0,
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label} {required && <span style={{ color: C.errorRed }}>*</span>}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const SectionHeading = ({ title }) => (
  <div style={{ margin: "24px 0 16px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: "#fff",
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: C.mutedText,
      }}
    >
      {title}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

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

  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
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
      newCodecData[index].packingTime = "20";
      newCodecData[index].bitRate = "0";
    } else if (codec === 131) {
      newCodecData[index].packingTime = "20";
      newCodecData[index].bitRate = "0";
    } else if (codec === 98) {
      newCodecData[index].packingTime = "30";
      newCodecData[index].bitRate = "0";
    } else if (codec === 96) {
      newCodecData[index].packingTime = "20";
      newCodecData[index].bitRate = "0";
    } else if (codec === 4) {
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
      showMessage(
        "error",
        "Please don't set coder=GSM and PktTime=30 at the same time!",
      );
      return;
    }
    if (codec === 4 && value === "20") {
      showMessage(
        "error",
        "Please don't set coder=G723 and PktTime=20 at the same time!",
      );
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
      return ["10", "20", "30", "40", "50", "60"];
    } else if (codec === 131) {
      return ["10", "20", "30", "40", "50", "60"];
    } else if (codec === 98) {
      return ["20", "30"];
    } else if (codec === 96) {
      return ["20"];
    } else if (codec === 4) {
      return ["30"];
    }
    return [];
  };

  const getBitRateOptions = (codecValue, packingTime) => {
    const codec = parseInt(codecValue);
    if (codec === 7 || codec === 6) {
      return [{ value: "0", label: "64" }];
    } else if (codec === 131) {
      return [{ value: "0", label: "8" }];
    } else if (codec === 98) {
      if (packingTime === "30") {
        return [{ value: "0", label: "13.3" }];
      } else {
        return [{ value: "1", label: "15.2" }];
      }
    } else if (codec === 96) {
      return [{ value: "0", label: "12.20" }];
    } else if (codec === 4) {
      return [{ value: "1", label: "6.3" }];
    }
    return [];
  };

  const validateForm = () => {
    if (!formData.rfc2833Payload) {
      showMessage("error", "Please enter a RFC2833 load!");
      return false;
    }
    const rfc2833 = parseInt(formData.rfc2833Payload);
    if (rfc2833 < 90 || rfc2833 >= 128) {
      showMessage("error", "The value range of 'RFC2833 Load' is 90~127!");
      return false;
    }

    if (!formData.rtpPortRange) {
      showMessage("error", "Please enter a RTP port range!");
      return false;
    }
    const portParts = formData.rtpPortRange.split(",");
    if (portParts.length !== 2) {
      showMessage("error", "Invalid RTP port range!");
      return false;
    }
    const startPort = parseInt(portParts[0]);
    const endPort = parseInt(portParts[1]);
    if (isNaN(startPort) || isNaN(endPort)) {
      showMessage("error", "'RTP Port' must be numbers!");
      return false;
    }
    if (startPort < 2000 || endPort > 60000) {
      showMessage("error", "The value range of 'RTP Port' is 2000~60000!");
      return false;
    }
    if (5060 >= startPort && 5060 <= endPort) {
      showMessage(
        "error",
        "The SIP port value 5060 cannot be within the port range!",
      );
      return false;
    }
    if (startPort % 2 !== 0) {
      showMessage("error", "The starting port number must be an even!");
      return false;
    }
    if (endPort - startPort < 480) {
      showMessage(
        "error",
        "The difference between the latter 'RTP Port' and the former should be no less than 480!",
      );
      return false;
    }

    if (formData.jitterMode === "0") {
      if (!formData.jitterBuffer) {
        showMessage("error", "Please enter a JitterBuffer value!");
        return false;
      }
      const jitterBuffer = parseInt(formData.jitterBuffer);
      if (jitterBuffer < 20 || jitterBuffer > 200) {
        showMessage("error", "The value range of 'JitterBuffer' is 20~200!");
        return false;
      }
    }

    const voiceGain = parseInt(formData.voiceGainOutput);
    if (isNaN(voiceGain) || voiceGain < -24 || voiceGain > 24) {
      showMessage(
        "error",
        "The value range of 'Voice Gain Output from IP' is -24~24!",
      );
      return false;
    }
    if (voiceGain % 3 !== 0) {
      showMessage(
        "error",
        "The value of 'Voice Gain Output from IP' must be a multiple of 3!",
      );
      return false;
    }

    const enabledCodecs = codecData.filter((item) => item.enabled);
    if (enabledCodecs.length === 0) {
      showMessage("error", "Please select a CODEC!");
      return false;
    }

    const codecValues = enabledCodecs.map((item) => item.codec);
    const uniqueCodecs = new Set(codecValues);
    if (uniqueCodecs.size !== codecValues.length) {
      showMessage("error", "Please choose a different CODEC!");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      showMessage("success", "Settings saved successfully!");
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

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Error / Success Banner */}
        {message.text && (
          <Alert
            severity={message.type === "error" ? "error" : message.type === "success" ? "success" : "info"}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
        )}

        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            FXS &rsaquo; VoIP &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              Media Parameters
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ padding: "16px 28px 24px" }}>
            {/* ── Media Settings Section ── */}
            <SectionHeading title="Media Settings" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 40px",
              }}
            >
              {/* Left Column */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <FieldRow label="DTMF Transmit Mode">
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      name="dtmfTransmitMode"
                      value={formData.dtmfTransmitMode}
                      onChange={handleInputChange}
                      sx={{ fontSize: 13 }}
                    >
                      <MenuItem value="0" sx={{ fontSize: 13 }}>
                        RFC2833
                      </MenuItem>
                      <MenuItem value="1" sx={{ fontSize: 13 }}>
                        SIP INFO
                      </MenuItem>
                      <MenuItem value="2" sx={{ fontSize: 13 }}>
                        In-band
                      </MenuItem>
                    </MuiSelect>
                  </FormControl>
                </FieldRow>

                <FieldRow label="RFC2833 Payload">
                  <TextField
                    size="small"
                    fullWidth
                    name="rfc2833Payload"
                    value={formData.rfc2833Payload}
                    onChange={handleInputChange}
                    onKeyPress={(e) => handleKeyPress(e, "number")}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 31,
                    }}
                  />
                </FieldRow>

                <FieldRow label="RTP Port Range">
                  <TextField
                    size="small"
                    fullWidth
                    name="rtpPortRange"
                    value={formData.rtpPortRange}
                    onChange={handleInputChange}
                    onKeyPress={(e) => handleKeyPress(e, "number-comma")}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 31,
                    }}
                  />
                </FieldRow>

                <FieldRow label="Silence Suppression">
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      name="silenceSuppression"
                      value={formData.silenceSuppression}
                      onChange={handleInputChange}
                      sx={{ fontSize: 13 }}
                    >
                      <MenuItem value="0" sx={{ fontSize: 13 }}>
                        Disable
                      </MenuItem>
                      <MenuItem value="1" sx={{ fontSize: 13 }}>
                        Enable
                      </MenuItem>
                    </MuiSelect>
                  </FormControl>
                </FieldRow>
              </div>

              {/* Right Column */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <FieldRow label="JitterMode">
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      name="jitterMode"
                      value={formData.jitterMode}
                      onChange={handleInputChange}
                      sx={{ fontSize: 13 }}
                    >
                      <MenuItem value="0" sx={{ fontSize: 13 }}>
                        Static Mode
                      </MenuItem>
                    </MuiSelect>
                  </FormControl>
                </FieldRow>

                <FieldRow label="JitterBuffer (ms)">
                  <TextField
                    size="small"
                    fullWidth
                    name="jitterBuffer"
                    value={formData.jitterBuffer}
                    onChange={handleInputChange}
                    onKeyPress={(e) => handleKeyPress(e, "number")}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 31,
                    }}
                  />
                </FieldRow>

                <FieldRow label="Voice Gain Output from IP (dB)">
                  <TextField
                    size="small"
                    fullWidth
                    name="voiceGainOutput"
                    value={formData.voiceGainOutput}
                    onChange={handleInputChange}
                    onKeyPress={(e) => handleKeyPress(e, "number-minus")}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 31,
                    }}
                  />
                </FieldRow>
              </div>
            </div>

            {/* ── CODEC Priority Section ── */}
            <div style={{ marginTop: 24 }}>
              <SectionHeading title="CODEC Priority" />

              <div
                style={{
                  overflowX: "auto",
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 6,
                }}
              >
    <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 700,
  }}
>
  <thead>
    <tr>
      <TH
        style={{
          width: 60,
          background: "#ffffff",
          borderRight: "1px solid #cbd5e1",
        }}
      >
        Check
      </TH>

      <TH
        style={{
          width: 70,
          background: "#ffffff",
          borderRight: "1px solid #cbd5e1",
        }}
      >
        Priority
      </TH>

      <TH
        style={{
          background: "#ffffff",
          borderRight: "1px solid #cbd5e1",
        }}
      >
        CODEC
      </TH>

      <TH
        style={{
          background: "#ffffff",
          borderRight: "1px solid #cbd5e1",
        }}
      >
        Packing Time
      </TH>

      <TH
        style={{
          background: "#ffffff",
        }}
      >
        Bit Rate (kbs)
      </TH>
    </tr>
  </thead>

  <tbody>
    {codecData.map((item, index) => {
      const rowBg =
        index % 2 === 0 ? "#f8fafc" : "#ffffff";

      return (
        <tr
          key={index}
          style={{
            background: rowBg,
            borderBottom: "1px solid #dbe4ee",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#eef4fb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = rowBg;
          }}
        >
          {/* Checkbox */}
          <td
            style={{
              textAlign: "center",
              padding: "8px 0",
              borderRight: "1px solid #dbe4ee",
            }}
          >
            <Checkbox
              size="small"
              checked={item.enabled}
              onChange={() => handleCodecCheckbox(index)}
              sx={{
                padding: "1px",
                color: "#64748b",
                "&.Mui-checked": { color: "#0284c7" },
                "&.MuiCheckbox-indeterminate": {
                  color: "#0284c7",
                },
              }}
            />
          </td>

          {/* Priority */}
          <td
            style={{
              textAlign: "center",
              padding: "8px 6px",
              fontSize: 12,
              color: C.mutedText,
              borderRight: "1px solid #dbe4ee",
            }}
          >
            {index + 1}
          </td>

          {/* Codec */}
          <td
            style={{
              padding: "8px 10px",
              borderRight: "1px solid #dbe4ee",
              textAlign: "center",
            }}
          >
            <FormControl size="small" sx={{ width: 110 }}>
              <MuiSelect
                value={item.codec}
                onChange={(e) =>
                  handleCodecChange(index, e.target.value)
                }
                disabled={!item.enabled}
                sx={{
                  fontSize: 12,
                  height: 30,
                  borderRadius: "6px",
                  background: item.enabled
                    ? "#fff"
                    : "#f1f5f9",

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cbd5e1",
                  },
                }}
              >
                <MenuItem value="6" sx={{ fontSize: 12 }}>
                  G711A
                </MenuItem>

                <MenuItem value="7" sx={{ fontSize: 12 }}>
                  G711U
                </MenuItem>

                <MenuItem value="131" sx={{ fontSize: 12 }}>
                  G729
                </MenuItem>

                <MenuItem value="98" sx={{ fontSize: 12 }}>
                  iLBC
                </MenuItem>

                <MenuItem value="96" sx={{ fontSize: 12 }}>
                  AMR
                </MenuItem>

                <MenuItem value="4" sx={{ fontSize: 12 }}>
                  G723
                </MenuItem>
              </MuiSelect>
            </FormControl>
          </td>

          {/* Packing Time */}
          <td
            style={{
              padding: "8px 10px",
              borderRight: "1px solid #dbe4ee",
              textAlign: "center",
            }}
          >
            <FormControl size="small" sx={{ width: 95 }}>
              <MuiSelect
                value={item.packingTime}
                onChange={(e) =>
                  handlePackingTimeChange(index, e.target.value)
                }
                disabled={!item.enabled}
                sx={{
                  fontSize: 12,
                  height: 30,
                  borderRadius: "6px",
                  background: item.enabled
                    ? "#fff"
                    : "#f1f5f9",

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cbd5e1",
                  },
                }}
              >
                {getPackingTimeOptions(item.codec).map((opt) => (
                  <MenuItem
                    key={opt}
                    value={opt}
                    sx={{ fontSize: 12 }}
                  >
                    {opt}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </td>

          {/* Bit Rate */}
          <td
            style={{
              padding: "8px 10px",
              textAlign: "center",
            }}
          >
            <FormControl size="small" sx={{ width: 95 }}>
              <MuiSelect
                value={item.bitRate}
                onChange={(e) =>
                  handleBitRateChange(index, e.target.value)
                }
                disabled={!item.enabled}
                sx={{
                  fontSize: 12,
                  height: 30,
                  borderRadius: "6px",
                  background: item.enabled
                    ? "#fff"
                    : "#f1f5f9",

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cbd5e1",
                  },
                }}
              >
                {getBitRateOptions(
                  item.codec,
                  item.packingTime,
                ).map((opt) => (
                  <MenuItem
                    key={opt.value}
                    value={opt.value}
                    sx={{ fontSize: 12 }}
                  >
                    {opt.label}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
              </div>

              {/* Notes */}
              <div
                style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: C.mutedText,
                  lineHeight: 1.6,
                }}
              >
                <div>
                  <strong>Note:</strong> At present, the maximum number of
                  concurrent sessions supported by G723 encoding is 9. When the
                  concurrent sessions are more than 9, the encoding of the next
                  priority will be automatically used (it is recommended to
                  configure G711A/U as the encoding of the next priority).
                </div>
                <div style={{ paddingLeft: 34 }}>
                  The maximum number of concurrent sessions supported by
                  AMR/iLBC encoding is 15. When the concurrent sessions are more
                  than 15, the encoding of the next priority will be
                  automatically used (it is recommended to configure G711A/U as
                  the encoding of the next priority).
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "16px 24px",
              borderTop: `1px solid ${C.cardBorder}`,
              background: "#f8fafc",
            }}
          >
            <Button
  variant="contained"
  onClick={handleSave}
  sx={{
    background:
      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
    color: "#fff",
    border: "1px solid #5A6F8F",
    boxShadow: "0 2px 8px #3E5475",
    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",
    padding: "8px 28px",
    minWidth: 120,
    borderRadius: "6px",
    "&:hover": {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      opacity: 0.85,
    },
  }}
>
  Save Parameters
</Button>
         <Button
  variant="outlined"
  onClick={handleReset}
  sx={{
    background: "#cbd5e1",
    color: "#374151",
    border: "1px solid #cbd5e1",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",
    padding: "8px 28px",
    minWidth: 110,
    borderRadius: "6px",
    "&:hover": {
      background: "#cbd5e1",
      border: "1px solid #cbd5e1",
      opacity: 0.85,
    },
  }}
>
  Reset
</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FxsVoipMediaPage;
